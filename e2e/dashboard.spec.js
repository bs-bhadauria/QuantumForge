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
