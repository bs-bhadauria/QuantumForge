# ==============================================================================
# QuantumForge — Reproducible Container Build
# Multi-stage production container with unprivileged user & built-in healthcheck
# ==============================================================================

FROM python:3.12-slim-bookworm AS builder

ENV DEBIAN_FRONTEND=noninteractive \
    PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

WORKDIR /build

# Install build dependencies if needed for wheels compilation
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .

# Install dependencies into wheels / prefix
RUN pip install --no-cache-dir --prefix=/install -r requirements.txt


# ------------------------------------------------------------------------------
# Final Runtime Stage
# ------------------------------------------------------------------------------
FROM python:3.12-slim-bookworm AS runtime

ENV DEBIAN_FRONTEND=noninteractive \
    PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PORT=8000 \
    HOST=0.0.0.0 \
    QUANTUMFORGE_TIMEOUT_SECONDS=15.0 \
    QUANTUMFORGE_MAX_PAYLOAD_BYTES=1048576

# Install minimal runtime requirements (curl for container healthcheck)
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Create dedicated non-root application user
RUN groupadd -g 1001 quantum && \
    useradd -u 1001 -g quantum -m -s /bin/bash quantumuser

WORKDIR /app

# Copy installed Python packages from builder stage
COPY --from=builder /install /usr/local

# Copy application source code
COPY --chown=quantumuser:quantum app/ /app/app/

# Switch to unprivileged runtime user
USER quantumuser

EXPOSE 8000

# Container healthcheck using standard endpoint
HEALTHCHECK --interval=15s --timeout=5s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:${PORT}/health || exit 1

# Launch uvicorn server
CMD ["sh", "-c", "exec uvicorn app.main:app --host ${HOST} --port ${PORT}"]
