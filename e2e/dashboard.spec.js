const { test, expect } = require("@playwright/test");

test.describe("QuantumForge browser regression tests", () => {
  test("dashboard loads with its essential workspace controls", async ({
    page,
  }) => {
    const pageErrors = [];
    page.on("pageerror", (error) => pageErrors.push(error.message));

    const response = await page.goto("/dashboard");

    expect(response.status()).toBe(200);
    await expect(page).toHaveTitle(/QuantumForge/i);

    await expect(page.locator("#apiStatus")).toBeVisible();
    await expect(page.locator("#preset")).toBeVisible();
    await expect(page.locator("#shots")).toBeVisible();
    await expect(page.locator("#seed")).toBeVisible();
    await expect(page.locator("#circuitJson")).toBeVisible();
    await expect(page.locator("#renderButton")).toBeVisible();
    await expect(page.locator("#runButton")).toBeVisible();
    await expect(page.locator("#circuitDiagram")).toBeAttached();
    await expect(page.locator("#histogram")).toBeAttached();
    await expect(page.locator("#rawResult")).toBeAttached();

    expect(pageErrors).toEqual([]);
  });

  test("health endpoint responds successfully", async ({ request }) => {
    const response = await request.get("/health");

    expect(response.status()).toBe(200);
    expect(await response.json()).toMatchObject({
      status: "ok",
      service: "QuantumForge",
    });
  });

  test("preset selection renders a circuit diagram", async ({ page }) => {
    await page.goto("/dashboard");

    await page.locator("#preset").selectOption("bell");
    await page.locator("#renderButton").click();

    const diagram = page.locator("#circuitDiagram");
    await expect(diagram).toBeVisible();
    await expect(diagram.locator("line, rect, circle, text")).not.toHaveCount(
      0,
    );
  });

  test("Bell circuit simulation returns valid measurement results", async ({
    page,
  }) => {
    await page.goto("/dashboard");

    await page.locator("#preset").selectOption("bell");
    await page.locator("#shots").fill("256");
    await page.locator("#seed").fill("42");

    const simulationResponse = page.waitForResponse(
      (response) =>
        response.url().endsWith("/simulate") &&
        response.request().method() === "POST",
    );

    await page.locator("#runButton").click();

    const response = await simulationResponse;
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data.shots).toBe(256);
    expect(data.counts).toBeTruthy();
    expect(
      Object.keys(data.counts).every((key) => ["00", "11"].includes(key)),
    ).toBe(true);

    const totalShots = Object.values(data.counts).reduce(
      (sum, count) => sum + count,
      0,
    );
    expect(totalShots).toBe(256);

    await expect(page.locator("#rawResult")).toContainText("counts");
    await expect(page.locator("#downloadReportButton")).toBeEnabled();
  });

  test("X preset produces only the one outcome", async ({ page }) => {
    await page.goto("/dashboard");

    await page.locator("#preset").selectOption("x");
    await page.locator("#shots").fill("128");

    const simulationResponse = page.waitForResponse(
      (response) =>
        response.url().endsWith("/simulate") &&
        response.request().method() === "POST",
    );

    await page.locator("#runButton").click();

    const response = await simulationResponse;
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data.shots).toBe(128);
    expect(Object.keys(data.counts)).toEqual(["1"]);
    expect(data.counts["1"]).toBe(128);
  });

  test("GHZ preset produces only correlated three-qubit outcomes", async ({
    page,
  }) => {
    await page.goto("/dashboard");

    await page.locator("#preset").selectOption("ghz");
    await page.locator("#shots").fill("256");

    const simulationResponse = page.waitForResponse(
      (response) =>
        response.url().endsWith("/simulate") &&
        response.request().method() === "POST",
    );

    await page.locator("#runButton").click();

    const response = await simulationResponse;
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data.shots).toBe(256);
    expect(
      Object.keys(data.counts).every((key) => ["000", "111"].includes(key)),
    ).toBe(true);
    expect(
      Object.values(data.counts).reduce((sum, count) => sum + count, 0),
    ).toBe(256);
  });

  test("dashboard remains usable at a mobile viewport", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/dashboard");

    await expect(page.locator("#preset")).toBeVisible();
    await expect(page.locator("#runButton")).toBeVisible();
    await expect(page.locator("#renderButton")).toBeVisible();

    await page.locator("#preset").selectOption("bell");
    await page.locator("#renderButton").click();
    await expect(page.locator("#circuitDiagram")).toBeVisible();
  });
});

test.describe("QuantumForge advanced regression tests", () => {
  async function runCustomCircuit(page, circuit, shots = 256) {
    await page.goto("/dashboard");

    await page.locator("#shots").fill(String(shots));
    await page.locator("#seed").fill("42");
    await page.locator("#circuitJson").fill(JSON.stringify(circuit));

    const responsePromise = page.waitForResponse(
      (response) =>
        response.url().endsWith("/simulate") &&
        response.request().method() === "POST",
    );

    await page.locator("#runButton").click();

    const response = await responsePromise;
    expect(response.status()).toBe(200);

    return response.json();
  }

  test("RX(pi) rotates |0> to |1>", async ({ page }) => {
    const result = await runCustomCircuit(page, {
      n_qubits: 1,
      operations: [{ name: "rx", qubits: [0], params: [Math.PI] }],
    });

    expect(result.shots).toBe(256);
    expect(result.counts).toEqual({ 1: 256 });
    expect(result.resources.qubits).toBe(1);
  });

  test("RY(pi) rotates |0> to |1>", async ({ page }) => {
    const result = await runCustomCircuit(page, {
      n_qubits: 1,
      operations: [{ name: "ry", qubits: [0], params: [Math.PI] }],
    });

    expect(result.shots).toBe(256);
    expect(result.counts).toEqual({ 1: 256 });
    expect(result.resources.qubits).toBe(1);
  });

  test("RZ(pi) is accepted and preserves the computational-basis outcome", async ({
    page,
  }) => {
    const result = await runCustomCircuit(page, {
      n_qubits: 1,
      operations: [{ name: "rz", qubits: [0], params: [Math.PI] }],
    });

    expect(result.shots).toBe(256);
    expect(result.counts).toEqual({ 0: 256 });
    expect(result.resources.qubits).toBe(1);
  });

  test("rotation-gate experiment can be exported as valid JSON", async ({
    page,
  }) => {
    await runCustomCircuit(
      page,
      {
        n_qubits: 1,
        operations: [
          { name: "h", qubits: [0], params: [] },
          { name: "rz", qubits: [0], params: [Math.PI / 2] },
          { name: "h", qubits: [0], params: [] },
        ],
      },
      256,
    );

    const reportButton = page.locator("#downloadReportButton");
    await expect(reportButton).toBeEnabled();

    const downloadPromise = page.waitForEvent("download");
    await reportButton.click();
    const download = await downloadPromise;

    expect(download.suggestedFilename()).toMatch(
      /^quantumforge-report-.*\.json$/,
    );

    const fs = require("node:fs/promises");
    const filePath = await download.path();

    expect(filePath).toBeTruthy();

    const reportText = await fs.readFile(filePath, "utf8");
    const report = JSON.parse(reportText);

    // Validate the report structure without assuming a particular nesting.
    function collectKeys(value, keys = new Set()) {
      if (Array.isArray(value)) {
        for (const item of value) collectKeys(item, keys);
      } else if (value && typeof value === "object") {
        for (const [key, child] of Object.entries(value)) {
          keys.add(key);
          collectKeys(child, keys);
        }
      }
      return keys;
    }

    const keys = collectKeys(report);
    expect(keys.has("counts")).toBe(true);
    expect(keys.has("shots")).toBe(true);
    expect(keys.has("resources")).toBe(true);
  });

  test("invalid circuit JSON does not prevent a later valid simulation", async ({
    page,
  }) => {
    await page.goto("/dashboard");

    // Set the requested shot count explicitly; the dashboard defaults to 4096.
    await page.locator("#shots").fill("256");
    await page.locator("#seed").fill("42");

    await page.locator("#circuitJson").fill("{invalid json");

    // Invalid input must be rejected in the UI without sending an API request.
    const invalidRequest = page
      .waitForRequest(
        (request) =>
          request.url().endsWith("/simulate") && request.method() === "POST",
        { timeout: 1000 },
      )
      .catch(() => null);

    await page.locator("#runButton").click();
    await expect(page.locator("#notice")).not.toBeEmpty();

    expect(await invalidRequest).toBeNull();

    // Recover by providing a valid circuit.
    await page.locator("#circuitJson").fill(
      JSON.stringify({
        n_qubits: 1,
        operations: [{ name: "x", qubits: [0], params: [] }],
      }),
    );

    const responsePromise = page.waitForResponse(
      (response) =>
        response.url().endsWith("/simulate") &&
        response.request().method() === "POST",
    );

    await page.locator("#runButton").click();

    const response = await responsePromise;
    expect(response.status()).toBe(200);

    const result = await response.json();
    expect(result.shots).toBe(256);
    expect(result.counts).toEqual({ 1: 256 });

    await expect(page.locator("#notice")).toContainText(
      "Simulation completed successfully",
    );
  });
});

test.describe("QuantumForge SVG renderer robustness", () => {
  async function renderCustomCircuit(page, circuit) {
    await page.goto("/dashboard");
    await page.locator("#circuitJson").fill(JSON.stringify(circuit));
    await page.locator("#renderButton").click();

    const svg = page.locator("#circuitDiagram");
    await expect(svg).toBeVisible();
    return svg;
  }

  test("long circuits retain every gate and measurement within the SVG bounds", async ({
    page,
  }) => {
    const operations = Array.from({ length: 40 }, (_, index) => ({
      name: ["h", "x", "rx", "ry", "rz"][index % 5],
      qubits: [0],
      params: ["rx", "ry", "rz"].includes(
        ["h", "x", "rx", "ry", "rz"][index % 5],
      )
        ? [Math.PI / 2]
        : [],
    }));

    const svg = await renderCustomCircuit(page, {
      n_qubits: 1,
      operations,
    });

    const geometry = await svg.evaluate((element) => {
      const viewBox = element.viewBox.baseVal;
      const rects = [...element.querySelectorAll("rect")];
      const labels = [...element.querySelectorAll("text")];
      const measurements = labels.filter((label) => label.textContent === "M");

      return {
        viewBoxWidth: viewBox.width,
        viewBoxHeight: viewBox.height,
        widthAttribute: Number(element.getAttribute("width")),
        heightAttribute: Number(element.getAttribute("height")),
        gateRectCount: rects.filter((rect) => {
          const fill = rect.getAttribute("fill");
          return fill === "#13273a";
        }).length,
        measurementCount: measurements.length,
        labelsInsideBounds: labels.every((label) => {
          const box = label.getBBox();
          return (
            box.x >= 0 &&
            box.y >= 0 &&
            box.x + box.width <= viewBox.width + 1 &&
            box.y + box.height <= viewBox.height + 1
          );
        }),
      };
    });

    expect(geometry.gateRectCount).toBe(40);
    expect(geometry.measurementCount).toBe(1);
    expect(geometry.widthAttribute).toBe(geometry.viewBoxWidth);
    expect(geometry.heightAttribute).toBe(geometry.viewBoxHeight);
    expect(geometry.labelsInsideBounds).toBe(true);
  });

  test("16-qubit circuits display all wires and final measurements", async ({
    page,
  }) => {
    const operations = Array.from({ length: 16 }, (_, qubit) => ({
      name: "h",
      qubits: [qubit],
      params: [],
    }));

    const svg = await renderCustomCircuit(page, {
      n_qubits: 16,
      operations,
    });

    const geometry = await svg.evaluate((element) => {
      const labels = [...element.querySelectorAll("text")];
      const wireLabels = labels
        .map((label) => label.textContent)
        .filter((text) => /^q\d+$/.test(text));
      const measurements = labels.filter((label) => label.textContent === "M");
      const viewBox = element.viewBox.baseVal;

      return {
        wireLabels,
        measurementCount: measurements.length,
        viewBoxHeight: viewBox.height,
        labelsInsideBounds: labels.every((label) => {
          const box = label.getBBox();
          return (
            box.x >= 0 &&
            box.y >= 0 &&
            box.x + box.width <= viewBox.width + 1 &&
            box.y + box.height <= viewBox.height + 1
          );
        }),
      };
    });

    expect(geometry.wireLabels).toHaveLength(16);
    expect(geometry.wireLabels).toContain("q0");
    expect(geometry.wireLabels).toContain("q15");
    expect(geometry.measurementCount).toBe(16);
    expect(geometry.viewBoxHeight).toBeGreaterThan(700);
    expect(geometry.labelsInsideBounds).toBe(true);
  });

  test("long diagrams scroll inside their container instead of widening the page", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });

    const operations = Array.from({ length: 35 }, (_, index) => ({
      name: index % 3 === 0 ? "rz" : "h",
      qubits: [0],
      params: index % 3 === 0 ? [Math.PI / 2] : [],
    }));

    await renderCustomCircuit(page, {
      n_qubits: 1,
      operations,
    });

    const measurements = await page
      .locator(".diagram-wrap")
      .evaluate((container) => ({
        clientWidth: container.clientWidth,
        scrollWidth: container.scrollWidth,
        pageWidth: document.documentElement.scrollWidth,
        viewportWidth: window.innerWidth,
      }));

    expect(measurements.scrollWidth).toBeGreaterThan(measurements.clientWidth);
    expect(measurements.pageWidth).toBeLessThanOrEqual(
      measurements.viewportWidth + 2,
    );
  });
});

test.describe("QuantumForge workspace state consistency and reset behavior", () => {
  test("workspace reset before simulation restores default Bell state and configuration", async ({
    page,
  }) => {
    await page.goto("/dashboard");

    await page.locator("#preset").selectOption("ghz");
    await page.locator("#shots").fill("500");
    await page.locator("#seed").fill("99");

    await page.locator("#resetButton").click();

    await expect(page.locator("#preset")).toHaveValue("bell");
    await expect(page.locator("#shots")).toHaveValue("4096");
    await expect(page.locator("#seed")).toHaveValue("42");
    await expect(page.locator("#circuitJson")).toHaveValue(/"name":\s*"cx"/);
    await expect(page.locator("#notice")).toContainText(
      "Workspace reset to the Bell-state example",
    );
    await expect(page.locator("#downloadReportButton")).toBeDisabled();
    await expect(page.locator("#copyResultButton")).toBeDisabled();
    await expect(page.locator("#metricQubits")).toHaveText("—");
    await expect(page.locator("#rawResult")).toHaveText(
      "No simulation has been run yet.",
    );
  });

  test("workspace reset after successful simulation clears results and restores defaults", async ({
    page,
  }) => {
    await page.goto("/dashboard");

    await page.locator("#preset").selectOption("x");
    await page.locator("#shots").fill("128");

    const simulationResponse = page.waitForResponse(
      (response) =>
        response.url().endsWith("/simulate") &&
        response.request().method() === "POST",
    );
    await page.locator("#runButton").click();
    await simulationResponse;

    await expect(page.locator("#downloadReportButton")).toBeEnabled();
    await expect(page.locator("#copyResultButton")).toBeEnabled();
    await expect(page.locator("#metricQubits")).toHaveText("1");
    await expect(page.locator("#rawResult")).toContainText("counts");

    await page.locator("#resetButton").click();

    await expect(page.locator("#preset")).toHaveValue("bell");
    await expect(page.locator("#shots")).toHaveValue("4096");
    await expect(page.locator("#seed")).toHaveValue("42");
    await expect(page.locator("#downloadReportButton")).toBeDisabled();
    await expect(page.locator("#copyResultButton")).toBeDisabled();
    await expect(page.locator("#metricQubits")).toHaveText("—");
    await expect(page.locator("#metricGates")).toHaveText("—");
    await expect(page.locator("#rawResult")).toHaveText(
      "No simulation has been run yet.",
    );
    await expect(page.locator("#histogram")).toContainText(
      "Run a simulation to see measurement counts",
    );
    await expect(page.locator("#notice")).toContainText(
      "Workspace reset to the Bell-state example",
    );
  });
});

test.describe("QuantumForge result invalidation", () => {
  async function runBellSimulation(page) {
    await page.goto("/dashboard");
    await page.locator("#preset").selectOption("bell");
    await page.locator("#shots").fill("128");

    const responsePromise = page.waitForResponse(
      (response) =>
        response.url().endsWith("/simulate") &&
        response.request().method() === "POST",
    );
    await page.locator("#runButton").click();
    await responsePromise;
    await expect(page.locator("#downloadReportButton")).toBeEnabled();
  }

  test("modifying circuit JSON invalidates previous simulation results", async ({
    page,
  }) => {
    await runBellSimulation(page);

    await page.locator("#circuitJson").fill(
      JSON.stringify({
        n_qubits: 1,
        operations: [{ name: "h", qubits: [0], params: [] }],
      }),
    );

    await expect(page.locator("#downloadReportButton")).toBeDisabled();
    await expect(page.locator("#copyResultButton")).toBeDisabled();
    await expect(page.locator("#metricQubits")).toHaveText("—");
    await expect(page.locator("#rawResult")).toHaveText(
      "No simulation has been run yet.",
    );
  });

  test("changing shot count or seed invalidates previous simulation results", async ({
    page,
  }) => {
    await runBellSimulation(page);

    await page.locator("#shots").fill("256");
    await expect(page.locator("#downloadReportButton")).toBeDisabled();
    await expect(page.locator("#copyResultButton")).toBeDisabled();
    await expect(page.locator("#metricQubits")).toHaveText("—");

    const responsePromise = page.waitForResponse(
      (response) =>
        response.url().endsWith("/simulate") &&
        response.request().method() === "POST",
    );
    await page.locator("#runButton").click();
    await responsePromise;
    await expect(page.locator("#downloadReportButton")).toBeEnabled();

    await page.locator("#seed").fill("99");
    await expect(page.locator("#downloadReportButton")).toBeDisabled();
    await expect(page.locator("#copyResultButton")).toBeDisabled();
    await expect(page.locator("#metricQubits")).toHaveText("—");
  });

  test("changing preset dropdown invalidates previous simulation results", async ({
    page,
  }) => {
    await runBellSimulation(page);

    await page.locator("#preset").selectOption("ghz");
    await expect(page.locator("#downloadReportButton")).toBeDisabled();
    await expect(page.locator("#copyResultButton")).toBeDisabled();
    await expect(page.locator("#metricQubits")).toHaveText("—");
  });
});

test.describe("QuantumForge clipboard copy and report schema verification", () => {
  test("copy-result copies formatted simulation JSON to clipboard", async ({
    page,
    context,
  }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await page.goto("/dashboard");
    await page.locator("#preset").selectOption("bell");
    await page.locator("#shots").fill("256");
    await page.locator("#seed").fill("42");

    const responsePromise = page.waitForResponse(
      (response) =>
        response.url().endsWith("/simulate") &&
        response.request().method() === "POST",
    );
    await page.locator("#runButton").click();
    const response = await responsePromise;
    const responseData = await response.json();

    await page.locator("#copyResultButton").click();
    await expect(page.locator("#notice")).toContainText("copied to clipboard");

    const clipboardText = await page.evaluate(() =>
      navigator.clipboard.readText(),
    );
    const copiedData = JSON.parse(clipboardText);

    expect(copiedData).toEqual(responseData);
    expect(copiedData.shots).toBe(256);
    expect(copiedData.counts).toBeDefined();
    expect(copiedData.resources.qubits).toBe(2);
  });

  test("downloaded report strictly complies with the exact schema and values", async ({
    page,
  }) => {
    await page.goto("/dashboard");
    const customCircuit = {
      n_qubits: 2,
      operations: [
        { name: "h", qubits: [0], params: [] },
        { name: "cx", qubits: [0, 1], params: [] },
      ],
    };

    await page.locator("#shots").fill("512");
    await page.locator("#seed").fill("42");
    await page.locator("#circuitJson").fill(JSON.stringify(customCircuit));

    const responsePromise = page.waitForResponse(
      (response) =>
        response.url().endsWith("/simulate") &&
        response.request().method() === "POST",
    );
    await page.locator("#runButton").click();
    const response = await responsePromise;
    const simulationResult = await response.json();

    const downloadPromise = page.waitForEvent("download");
    await page.locator("#downloadReportButton").click();
    const download = await downloadPromise;

    const fs = require("node:fs/promises");
    const filePath = await download.path();
    const reportText = await fs.readFile(filePath, "utf8");
    const report = JSON.parse(reportText);

    expect(Object.keys(report).sort()).toEqual([
      "experiment",
      "generated_at",
      "platform",
      "report_version",
      "resources",
      "results",
    ]);
    expect(report.report_version).toBe("1.0");
    expect(report.platform).toBe("QuantumForge");
    expect(Number.isNaN(Date.parse(report.generated_at))).toBe(false);

    expect(report.experiment.circuit_name).toBe("Custom Quantum Circuit");
    expect(report.experiment.circuit_definition).toEqual(customCircuit);
    expect(report.experiment.shots).toBe(512);
    expect(report.experiment.seed).toBe(42);
    expect(report.experiment.simulator).toBe("Qiskit Aer");

    expect(report.results.counts).toEqual(simulationResult.counts);
    expect(report.results.probabilities).toEqual(
      simulationResult.probabilities,
    );
    expect(report.resources).toEqual(simulationResult.resources);
  });
});

test.describe("QuantumForge browser-side validation edge cases", () => {
  async function testClientRejection(page, circuit, expectedErrorSnippet) {
    await page.goto("/dashboard");
    await page.locator("#circuitJson").fill(JSON.stringify(circuit));

    let networkRequested = false;
    page.on("request", (request) => {
      if (request.url().endsWith("/simulate") && request.method() === "POST") {
        networkRequested = true;
      }
    });

    await page.locator("#runButton").click();
    await expect(page.locator("#notice")).toContainText(expectedErrorSnippet);
    expect(networkRequested).toBe(false);
    await expect(page.locator("#downloadReportButton")).toBeDisabled();
  }

  test("rejects unsupported gate in browser without sending API request", async ({
    page,
  }) => {
    await testClientRejection(
      page,
      {
        n_qubits: 1,
        operations: [{ name: "unknown_gate", qubits: [0], params: [] }],
      },
      "unsupported gate 'unknown_gate'",
    );
  });

  test("rejects rotation gate without params or with excess params in browser", async ({
    page,
  }) => {
    await testClientRejection(
      page,
      {
        n_qubits: 1,
        operations: [{ name: "rx", qubits: [0], params: [] }],
      },
      "gate 'rx' requires one angle in radians",
    );

    await testClientRejection(
      page,
      {
        n_qubits: 1,
        operations: [{ name: "rx", qubits: [0], params: [1.0, 2.0] }],
      },
      "gate 'rx' requires one angle in radians",
    );
  });

  test("rejects non-rotation gate with params in browser", async ({ page }) => {
    await testClientRejection(
      page,
      {
        n_qubits: 1,
        operations: [{ name: "h", qubits: [0], params: [1.57] }],
      },
      "gate 'h' does not accept parameters",
    );
  });

  test("rejects duplicate qubits in multi-qubit gate in browser", async ({
    page,
  }) => {
    await testClientRejection(
      page,
      {
        n_qubits: 2,
        operations: [{ name: "cx", qubits: [0, 0], params: [] }],
      },
      "a multi-qubit gate cannot use the same qubit twice",
    );
  });

  test("rejects out-of-bounds qubit index in browser", async ({ page }) => {
    await testClientRejection(
      page,
      {
        n_qubits: 2,
        operations: [{ name: "h", qubits: [2], params: [] }],
      },
      "qubit indices must be between 0 and 1",
    );
  });

  test("rejects shots out of range in browser", async ({ page }) => {
    await page.goto("/dashboard");
    await page.locator("#shots").fill("0");
    await page.locator("#runButton").click();
    await expect(page.locator("#notice")).toContainText(
      "shots must be an integer between 1 and 100000",
    );

    await page.locator("#shots").fill("100001");
    await page.locator("#runButton").click();
    await expect(page.locator("#notice")).toContainText(
      "shots must be an integer between 1 and 100000",
    );
  });

  test("rejects negative seed in browser", async ({ page }) => {
    await page.goto("/dashboard");
    await page.locator("#seed").fill("-1");
    await page.locator("#runButton").click();
    await expect(page.locator("#notice")).toContainText(
      "Random seed must be a non-negative integer",
    );
  });
});

test.describe("QuantumForge Visual Gate Toolbox & Algorithm Marketplace", () => {
  test("clicking gate toolbar chips appends gates and updates diagram dynamically", async ({
    page,
  }) => {
    await page.goto("/dashboard");

    // Click Hadamard chip in toolbox
    const hChip = page.locator(".gate-chip[data-gate='h']");
    await expect(hChip).toBeVisible();
    await hChip.click();

    // Verify notice shows gate appended
    await expect(page.locator("#notice")).toContainText("Appended gate 'H'");

    // Check circuitJson textarea contains the new gate
    const jsonValue = await page.locator("#circuitJson").inputValue();
    expect(jsonValue).toContain('"name": "h"');

    // Click undo button
    const undoButton = page.locator("#undoGateButton");
    await expect(undoButton).toBeVisible();
    await undoButton.click();
    await expect(page.locator("#notice")).toContainText(
      "Removed last gate 'H'",
    );
  });

  test("selecting Grover algorithm preset updates metadata banner and simulates correctly", async ({
    page,
  }) => {
    await page.goto("/dashboard");

    // Select grover_2q from marketplace
    await page.locator("#preset").selectOption("grover_2q");

    // Meta banner should be visible and show category
    const banner = page.locator("#algoMetaBanner");
    await expect(banner).toBeVisible();
    await expect(page.locator("#algoCategoryBadge")).toContainText(
      "Search & Cryptography",
    );
    await expect(page.locator("#algoDescriptionText")).toContainText("Grover");

    // Simulate Grover circuit
    const simulationResponse = page.waitForResponse(
      (response) =>
        response.url().endsWith("/simulate") &&
        response.request().method() === "POST",
    );

    await page.locator("#runButton").click();
    const response = await simulationResponse;
    expect(response.status()).toBe(200);

    const data = await response.json();
    // In ideal Grover 2Q search for |11>, outcome 11 has near 100% frequency
    expect(data.counts["11"]).toBeGreaterThan(3500);
  });

  test("selecting VQE H2 molecular ansatz updates metadata banner and simulates correctly", async ({
    page,
  }) => {
    await page.goto("/dashboard");

    await page.locator("#preset").selectOption("vqe_h2");
    const banner = page.locator("#algoMetaBanner");
    await expect(banner).toBeVisible();
    await expect(page.locator("#algoCategoryBadge")).toContainText("Chemistry");

    const simulationResponse = page.waitForResponse(
      (response) =>
        response.url().endsWith("/simulate") &&
        response.request().method() === "POST",
    );

    await page.locator("#runButton").click();
    const response = await simulationResponse;
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data.shots).toBe(4096);
    expect(data.counts).toBeTruthy();
  });
});
