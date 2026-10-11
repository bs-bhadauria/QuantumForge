const { test, expect } = require('@playwright/test');

test.describe('QuantumForge browser regression tests', () => {
  test('dashboard loads with its essential workspace controls', async ({ page }) => {
    const pageErrors = [];
    page.on('pageerror', error => pageErrors.push(error.message));

    const response = await page.goto('/dashboard');

    expect(response.status()).toBe(200);
    await expect(page).toHaveTitle(/QuantumForge/i);

    await expect(page.locator('#apiStatus')).toBeVisible();
    await expect(page.locator('#preset')).toBeVisible();
    await expect(page.locator('#shots')).toBeVisible();
    await expect(page.locator('#seed')).toBeVisible();
    await expect(page.locator('#circuitJson')).toBeVisible();
    await expect(page.locator('#renderButton')).toBeVisible();
    await expect(page.locator('#runButton')).toBeVisible();
    await expect(page.locator('#circuitDiagram')).toBeAttached();
    await expect(page.locator('#histogram')).toBeAttached();
    await expect(page.locator('#rawResult')).toBeAttached();

    expect(pageErrors).toEqual([]);
  });

  test('health endpoint responds successfully', async ({ request }) => {
    const response = await request.get('/health');

    expect(response.status()).toBe(200);
    expect(await response.json()).toMatchObject({
      status: 'ok',
      service: 'QuantumForge',
    });
  });

  test('preset selection renders a circuit diagram', async ({ page }) => {
    await page.goto('/dashboard');

    await page.locator('#preset').selectOption('bell');
    await page.locator('#renderButton').click();

    const diagram = page.locator('#circuitDiagram');
    await expect(diagram).toBeVisible();
    await expect(diagram.locator('line, rect, circle, text')).not.toHaveCount(0);
  });

  test('Bell circuit simulation returns valid measurement results', async ({ page }) => {
    await page.goto('/dashboard');

    await page.locator('#preset').selectOption('bell');
    await page.locator('#shots').fill('256');
    await page.locator('#seed').fill('42');

    const simulationResponse = page.waitForResponse(response =>
      response.url().endsWith('/simulate') &&
      response.request().method() === 'POST'
    );

    await page.locator('#runButton').click();

    const response = await simulationResponse;
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data.shots).toBe(256);
    expect(data.counts).toBeTruthy();
    expect(Object.keys(data.counts).every(key => ['00', '11'].includes(key))).toBe(true);

    const totalShots = Object.values(data.counts)
      .reduce((sum, count) => sum + count, 0);
    expect(totalShots).toBe(256);

    await expect(page.locator('#rawResult')).toContainText('counts');
    await expect(page.locator('#downloadReportButton')).toBeEnabled();
  });

  test('X preset produces only the one outcome', async ({ page }) => {
    await page.goto('/dashboard');

    await page.locator('#preset').selectOption('x');
    await page.locator('#shots').fill('128');

    const simulationResponse = page.waitForResponse(response =>
      response.url().endsWith('/simulate') &&
      response.request().method() === 'POST'
    );

    await page.locator('#runButton').click();

    const response = await simulationResponse;
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data.shots).toBe(128);
    expect(Object.keys(data.counts)).toEqual(['1']);
    expect(data.counts['1']).toBe(128);
  });

  test('GHZ preset produces only correlated three-qubit outcomes', async ({ page }) => {
    await page.goto('/dashboard');

    await page.locator('#preset').selectOption('ghz');
    await page.locator('#shots').fill('256');

    const simulationResponse = page.waitForResponse(response =>
      response.url().endsWith('/simulate') &&
      response.request().method() === 'POST'
    );

    await page.locator('#runButton').click();

    const response = await simulationResponse;
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data.shots).toBe(256);
    expect(Object.keys(data.counts).every(key => ['000', '111'].includes(key))).toBe(true);
    expect(Object.values(data.counts).reduce((sum, count) => sum + count, 0)).toBe(256);
  });

  test('dashboard remains usable at a mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/dashboard');

    await expect(page.locator('#preset')).toBeVisible();
    await expect(page.locator('#runButton')).toBeVisible();
    await expect(page.locator('#renderButton')).toBeVisible();

    await page.locator('#preset').selectOption('bell');
    await page.locator('#renderButton').click();
    await expect(page.locator('#circuitDiagram')).toBeVisible();
  });
});

test.describe('QuantumForge advanced regression tests', () => {
  async function runCustomCircuit(page, circuit, shots = 256) {
    await page.goto('/dashboard');

    await page.locator('#shots').fill(String(shots));
    await page.locator('#seed').fill('42');
    await page.locator('#circuitJson').fill(JSON.stringify(circuit));

    const responsePromise = page.waitForResponse(response =>
      response.url().endsWith('/simulate') &&
      response.request().method() === 'POST'
    );

    await page.locator('#runButton').click();

    const response = await responsePromise;
    expect(response.status()).toBe(200);

    return response.json();
  }

  test('RX(pi) rotates |0> to |1>', async ({ page }) => {
    const result = await runCustomCircuit(page, {
      n_qubits: 1,
      operations: [
        { name: 'rx', qubits: [0], params: [Math.PI] },
      ],
    });

    expect(result.shots).toBe(256);
    expect(result.counts).toEqual({ '1': 256 });
    expect(result.resources.qubits).toBe(1);
  });

  test('RY(pi) rotates |0> to |1>', async ({ page }) => {
    const result = await runCustomCircuit(page, {
      n_qubits: 1,
      operations: [
        { name: 'ry', qubits: [0], params: [Math.PI] },
      ],
    });

    expect(result.shots).toBe(256);
    expect(result.counts).toEqual({ '1': 256 });
    expect(result.resources.qubits).toBe(1);
  });

  test('RZ(pi) is accepted and preserves the computational-basis outcome', async ({ page }) => {
    const result = await runCustomCircuit(page, {
      n_qubits: 1,
      operations: [
        { name: 'rz', qubits: [0], params: [Math.PI] },
      ],
    });

    expect(result.shots).toBe(256);
    expect(result.counts).toEqual({ '0': 256 });
    expect(result.resources.qubits).toBe(1);
  });

  test('rotation-gate experiment can be exported as valid JSON', async ({ page }) => {
    await runCustomCircuit(page, {
      n_qubits: 1,
      operations: [
        { name: 'h', qubits: [0], params: [] },
        { name: 'rz', qubits: [0], params: [Math.PI / 2] },
        { name: 'h', qubits: [0], params: [] },
      ],
    }, 256);

    const reportButton = page.locator('#downloadReportButton');
    await expect(reportButton).toBeEnabled();

    const downloadPromise = page.waitForEvent('download');
    await reportButton.click();
    const download = await downloadPromise;

    expect(download.suggestedFilename()).toMatch(
      /^quantumforge-report-.*\.json$/
    );

    const fs = require('node:fs/promises');
    const filePath = await download.path();

    expect(filePath).toBeTruthy();

    const reportText = await fs.readFile(filePath, 'utf8');
    const report = JSON.parse(reportText);

    // Validate the report structure without assuming a particular nesting.
    function collectKeys(value, keys = new Set()) {
      if (Array.isArray(value)) {
        for (const item of value) collectKeys(item, keys);
      } else if (value && typeof value === 'object') {
        for (const [key, child] of Object.entries(value)) {
          keys.add(key);
          collectKeys(child, keys);
        }
      }
      return keys;
    }

    const keys = collectKeys(report);
    expect(keys.has('counts')).toBe(true);
    expect(keys.has('shots')).toBe(true);
    expect(keys.has('resources')).toBe(true);
  });

  test('invalid circuit JSON does not prevent a later valid simulation', async ({ page }) => {
    await page.goto('/dashboard');

    // Set the requested shot count explicitly; the dashboard defaults to 4096.
    await page.locator('#shots').fill('256');
    await page.locator('#seed').fill('42');

    await page.locator('#circuitJson').fill('{invalid json');

    // Invalid input must be rejected in the UI without sending an API request.
    const invalidRequest = page.waitForRequest(
      request => request.url().endsWith('/simulate') &&
        request.method() === 'POST',
      { timeout: 1000 }
    ).catch(() => null);

    await page.locator('#runButton').click();
    await expect(page.locator('#notice')).not.toBeEmpty();

    expect(await invalidRequest).toBeNull();

    // Recover by providing a valid circuit.
    await page.locator('#circuitJson').fill(JSON.stringify({
      n_qubits: 1,
      operations: [
        { name: 'x', qubits: [0], params: [] },
      ],
    }));

    const responsePromise = page.waitForResponse(response =>
      response.url().endsWith('/simulate') &&
      response.request().method() === 'POST'
    );

    await page.locator('#runButton').click();

    const response = await responsePromise;
    expect(response.status()).toBe(200);

    const result = await response.json();
    expect(result.shots).toBe(256);
    expect(result.counts).toEqual({ '1': 256 });

    await expect(page.locator('#notice')).toContainText(
      'Simulation completed successfully'
    );
  });
});
