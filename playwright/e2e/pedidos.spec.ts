import { test, expect } from '@playwright/test'

/// AAA - Arrange, Act, Assert

test('deve consultar um pedido aprovado', async ({ page }) => {
  // Arrange
  await page.goto('http://localhost:5173/')
  await expect(page.getByTestId('hero-section').getByRole('heading')).toContainText('Velô Sprint')
  await page.getByRole('link', { name: 'Consultar Pedido' }).click()
  await expect(page.getByRole('heading')).toContainText('Consultar Pedido')

  // Act    
  await page.getByPlaceholder('Ex: VLO-ABC123').fill('VLO-BPSSYI')
  await page.getByRole('button', { name: 'Buscar Pedido' }).click()

  // Assert
  await expect(page.getByText('VLO-BPSSYI')).toBeVisible()
  await expect(page.getByText('APROVADO')).toBeVisible();
})