import { test, expect } from '@playwright/test';

// Con el stack de producción (compose) Django exige HTTPS: este encabezado simula al terminador TLS.
// Solo se añade a peticiones hacia el propio origen de la tienda.
const FORWARD_HTTPS = process.env.E2E_FORWARD_HTTPS === '1';
const unique = Date.now().toString(36);
const USER = { username: `e2e_${unique}`, email: `e2e_${unique}@example.com`, password: 'Cronos#Prueba2026x' };
const HEADERS_API = FORWARD_HTTPS ? { 'x-forwarded-proto': 'https' } : {};
const LOGIN_BTN = /INICIAR|ACCEDER|ENTRAR/i;

test.beforeEach(async ({ context, baseURL }) => {
  // Omite la apertura de marca (una vez por sesión) para no tapar la interfaz.
  await context.addInitScript(() => sessionStorage.setItem('cronos_intro_seen', 'true'));
  if (FORWARD_HTTPS) {
    const origin = new URL(baseURL).origin;
    await context.route(`${origin}/**`, (route) =>
      route.continue({ headers: { ...route.request().headers(), 'x-forwarded-proto': 'https' } }),
    );
  }
});

test('catálogo: carga piezas y filtra por casa con el desplegable con buscador', async ({ page }) => {
  const errores = [];
  page.on('pageerror', (e) => errores.push(e.message));
  await page.goto('/');
  await expect(page.locator('#catalogo article').first()).toBeVisible({ timeout: 20_000 });
  expect(await page.locator('#catalogo article').count()).toBeGreaterThanOrEqual(4);
  await page.getByRole('button', { name: 'Filtrar por manufactura' }).click();
  await page.getByPlaceholder('Buscar...').fill('cart');
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/marca=\d+/);
  await expect(page.locator('#catalogo article').first()).toBeVisible();
  expect(errores).toEqual([]);
});

test('ficha de reloj: título, galería y compra', async ({ page }) => {
  await page.goto('/');
  await page.locator('#catalogo article a[aria-label^="Ver detalles"]').first().click();
  await expect(page).toHaveURL(/\/reloj\/\d+/);
  await expect(page.locator('h1')).toBeVisible();
  await expect(page).toHaveTitle(/Cronos Genève/);
  await expect(page.getByRole('button', { name: 'Ampliar imagen' }).first()).toBeVisible();
});

test('colecciones tiene ruta propia y enlaza al catálogo filtrado', async ({ page }) => {
  await page.goto('/colecciones');
  await expect(page.getByRole('heading', { name: 'Una colección por casa' })).toBeVisible();
  await page.locator('a[href*="marca="]').first().click();
  await expect(page).toHaveURL(/marca=\d+/);
});

test('registro, cierre de sesión e inicio de sesión', async ({ page }) => {
  await page.goto('/register');
  await page.locator('input[name="username"]').fill(USER.username);
  await page.locator('input[name="email"]').fill(USER.email);
  await page.locator('input[name="password"]').fill(USER.password);
  await page.locator('input[name="password_confirm"]').fill(USER.password);
  await page.getByRole('button', { name: /CREAR CUENTA/ }).click();
  await expect(page).not.toHaveURL(/\/register/, { timeout: 15_000 });
  await page.getByRole('button', { name: 'Cerrar sesión' }).first().click();
  await page.goto('/login');
  await page.locator('input[name="username"]').fill(USER.username);
  await page.locator('input[name="password"]').fill(USER.password);
  await page.getByRole('button', { name: LOGIN_BTN }).first().click();
  await expect(page).not.toHaveURL(/\/login/, { timeout: 15_000 });
  await page.goto('/perfil');
  await expect(page).toHaveURL(/\/perfil/);
});

test('login con credenciales falsas muestra error y no entra', async ({ page }) => {
  await page.goto('/login');
  await page.locator('input[name="username"]').fill('no_existe_e2e');
  await page.locator('input[name="password"]').fill('Incorrecta#123');
  await page.getByRole('button', { name: LOGIN_BTN }).first().click();
  await expect(page).toHaveURL(/\/login/);
  await expect(page.getByText(/credenciales|incorrect|inválid|no se pudo|autenticaci/i).first()).toBeVisible({ timeout: 10_000 });
});

test('ruta protegida sin sesión redirige al acceso', async ({ page }) => {
  await page.goto('/mis-ordenes');
  await expect(page).toHaveURL(/\/login/);
});

test('carrito: añadir y persistir tras recargar', async ({ page }) => {
  await page.goto('/');
  const card = page.locator('#catalogo article', { has: page.getByRole('button', { name: 'Añadir a la bolsa' }) }).first();
  await card.getByRole('button', { name: 'Añadir a la bolsa' }).click();
  const bolsa = page.getByRole('button', { name: 'Abrir selección de piezas en bolsa' });
  await expect(bolsa).toContainText('1');
  await page.reload();
  await expect(bolsa).toContainText('1');
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('cronos_cart')).length)).toBe(1);
});

test('comparador: dos piezas aparecen en la matriz', async ({ page }) => {
  await page.goto('/');
  const botones = page.locator('#catalogo article').getByRole('button', { name: 'Comparar' });
  await botones.nth(0).click();
  await botones.nth(1).click();
  await page.goto('/comparador');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expect(page.locator('table, [role="table"]').first()).toBeVisible({ timeout: 10_000 });
});

test('checkout: valida datos y, sin pasarela configurada, falla de forma controlada sin tocar el stock', async ({ page, request }) => {
  const stockAntes = await (await request.get('/api/relojes/?page=1', { headers: HEADERS_API })).json();
  await page.goto('/');
  const card = page.locator('#catalogo article', { has: page.getByRole('button', { name: 'Añadir a la bolsa' }) }).first();
  const nombre = (await card.locator('h3').innerText()).trim();
  await card.getByRole('button', { name: 'Añadir a la bolsa' }).click();
  await page.goto('/checkout');
  await expect(page.getByText(nombre).first()).toBeVisible();

  await page.locator('input[name="cliente_nombre"]').fill('Cliente E2E');
  await page.locator('input[name="cliente_email"]').fill('e2e@example.com');
  await page.locator('input[name="cliente_telefono"]').fill('+51987654321');
  await page.locator('textarea[name="direccion_envio"]').fill('Av. Prueba 123, Lima');
  // Sin aceptar la garantía el formulario no avanza.
  await page.getByRole('button', { name: /CONTINUAR A MERCADO PAGO/ }).click();
  await expect(page.getByText(/términos de garantía/i).first()).toBeVisible();

  // Con todo completo: sin credenciales de Mercado Pago el servidor rechaza y la interfaz lo muestra.
  await page.locator('input[name="garantia_aceptada"]').check({ force: true });
  await page.getByRole('button', { name: /CONTINUAR A MERCADO PAGO/ }).click();
  await expect(page).toHaveURL(/\/checkout/);
  await expect(page.getByText(/no está disponible|no fue posible|configur|pasarela|Mercado Pago no|error/i).first()).toBeVisible({ timeout: 20_000 });
  await expect(page).not.toHaveURL(/confirmacion/);

  const stockDespues = await (await request.get('/api/relojes/?page=1', { headers: HEADERS_API })).json();
  expect(stockDespues.results.map((r) => r.stock)).toEqual(stockAntes.results.map((r) => r.stock));
});

for (const ruta of ['/', '/colecciones', '/comparador', '/login', '/register']) {
  test(`@responsive sin desbordamiento horizontal en ${ruta}`, async ({ page }) => {
    await page.goto(ruta);
    await page.waitForLoadState('networkidle');
    const { scroll, ancho } = await page.evaluate(() => ({
      scroll: document.documentElement.scrollWidth,
      ancho: window.innerWidth,
    }));
    expect(scroll).toBeLessThanOrEqual(ancho);
  });
}
