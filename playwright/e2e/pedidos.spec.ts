import { test, expect } from '@playwright/test'

import { generateOrderCode } from '../support/helpers'

import { OrderLockupPage } from '../support/pages/OrderLockupPage'

/// AAA - Arrange, Act, Assert

test.describe('Consulta de Pedido', () => {

  test.beforeEach(async ({ page }) => {
    // Arrange
    await page.goto('http://localhost:5173/')
    await expect(page.getByTestId('hero-section').getByRole('heading')).toContainText('Velô Sprint')

    await page.getByRole('link', { name: 'Consultar Pedido' }).click()
    await expect(page.getByRole('heading')).toContainText('Consultar Pedido')
  })

  test('deve consultar um pedido aprovado', async ({ page }) => {
    // Test Data
    // const order = 'VLO-BPSSYI'

    const order = {
      number: 'VLO-BPSSYI',
      status: 'APROVADO',
      color: 'Lunar White',
      wheels: 'aero Wheels',
      customer: {
        name: 'Carlos Henrique',
        email: 'carlos.henrique@velo.dev',
      },
      payment: 'À Vista',
    }

    // Act    
    const orderLockupPage = new OrderLockupPage(page)
    await orderLockupPage.searchOrder(order.number)
    // Assert

    /* const orderCode = page.locator('//p[text()="Pedido"]/..//p[text()="VLO-BPSSYI"]')
    await expect(orderCode).toBeVisible({ timeout: 10_000 }) */

    /* const containerPedido = page.getByRole('paragraph')
      .filter({ hasText: /^Pedido$/ })
      .locator('..')

    await expect(containerPedido).toContainText(order, { timeout: 10_000 })
    
    await expect(page.getByText('APROVADO')).toBeVisible() */

    await expect(page.locator('#root')).toMatchAriaSnapshot(`
      - img
      - paragraph: Pedido
      - paragraph: ${order.number}
      - status:
        - img
        - text: ${order.status}
      - img "Velô Sprint"
      - paragraph: Modelo
      - paragraph: Velô Sprint
      - paragraph: Cor
      - paragraph: ${order.color}
      - paragraph: Interior
      - paragraph: cream
      - paragraph: Rodas
      - paragraph: ${order.wheels}
      - heading "Dados do Cliente" [level=4]
      - paragraph: Nome
      - paragraph: ${order.customer.name}
      - paragraph: Email
      - paragraph: ${order.customer.email}
      - paragraph: Loja de Retirada
      - paragraph 
      - paragraph: Data do Pedido
      - paragraph: /\\d+\\/\\d+\\/\\d+/
      - heading "Pagamento" [level=4]
      - paragraph: ${order.payment}
      - paragraph: /R\\$ \\d+\\.\\d+,\\d+/
      `);

    const statusBadge = page.getByRole('status').filter({ hasText: order.status })

    await expect(statusBadge).toHaveClass(/bg-green-100/)
    await expect(statusBadge).toHaveClass(/text-green-700/)

    const statusIcon = statusBadge.locator('svg')
    await expect(statusIcon).toHaveClass(/lucide-circle-check-big/)
  })

  test('deve consultar um pedido reprovado', async ({ page }) => {
    // Test Data
    // const order = 'VLO-2JHUF7'

    const order = {
      number: 'VLO-2JHUF7',
      status: 'REPROVADO',
      color: 'Midnight Black',
      wheels: 'sport Wheels',
      customer: {
        name: 'Steve Jobs',
        email: 'jobs@apple.com',
      },
      payment: 'À Vista',
    }

    // Act    
    const orderLockupPage = new OrderLockupPage(page)
    await orderLockupPage.searchOrder(order.number)

    // Assert

    /* const orderCode = page.locator('//p[text()="Pedido"]/..//p[text()="VLO-BPSSYI"]')
    await expect(orderCode).toBeVisible({ timeout: 10_000 }) */

    /* const containerPedido = page.getByRole('paragraph')
      .filter({ hasText: /^Pedido$/ })
      .locator('..')

    await expect(containerPedido).toContainText(order, { timeout: 10_000 })
    
    await expect(page.getByText('APROVADO')).toBeVisible() */

    await expect(page.locator('#root')).toMatchAriaSnapshot(`
      - img
      - paragraph: Pedido
      - paragraph: ${order.number}
      - status:
        - img
        - text: ${order.status}
      - img "Velô Sprint"
      - paragraph: Modelo
      - paragraph: Velô Sprint
      - paragraph: Cor
      - paragraph: ${order.color}
      - paragraph: Interior
      - paragraph: cream
      - paragraph: Rodas
      - paragraph: ${order.wheels}
      - heading "Dados do Cliente" [level=4]
      - paragraph: Nome
      - paragraph: ${order.customer.name}
      - paragraph: Email
      - paragraph: ${order.customer.email}
      - paragraph: Loja de Retirada
      - paragraph 
      - paragraph: Data do Pedido
      - paragraph: /\\d+\\/\\d+\\/\\d+/
      - heading "Pagamento" [level=4]
      - paragraph: ${order.payment}
      - paragraph: /R\\$ \\d+\\.\\d+,\\d+/
      `);

    const statusBadge = page.getByRole('status').filter({ hasText: order.status })

    await expect(statusBadge).toHaveClass(/bg-red-100/)
    await expect(statusBadge).toHaveClass(/text-red-700/)

    const statusIcon = statusBadge.locator('svg')
    await expect(statusIcon).toHaveClass(/lucide-circle-x/)
  })

  test('deve consultar um pedido em analise', async ({ page }) => {
    // Test Data
    // const order = 'VLO-2JHUF7'

    const order = {
      number: 'VLO-1O1KUR',
      status: 'EM_ANALISE',
      color: 'Lunar White',
      wheels: 'aero Wheels',
      customer: {
        name: 'João da Silva',
        email: 'joao@velo.dev',
      },
      payment: 'À Vista',
    }

    // Act    
    const orderLockupPage = new OrderLockupPage(page)
    await orderLockupPage.searchOrder(order.number)

    // Assert

    /* const orderCode = page.locator('//p[text()="Pedido"]/..//p[text()="VLO-BPSSYI"]')
    await expect(orderCode).toBeVisible({ timeout: 10_000 }) */

    /* const containerPedido = page.getByRole('paragraph')
      .filter({ hasText: /^Pedido$/ })
      .locator('..')

    await expect(containerPedido).toContainText(order, { timeout: 10_000 })
    
    await expect(page.getByText('APROVADO')).toBeVisible() */

    await expect(page.locator('#root')).toMatchAriaSnapshot(`
      - img
      - paragraph: Pedido
      - paragraph: ${order.number}
      - status:
        - img
        - text: ${order.status}
      - img "Velô Sprint"
      - paragraph: Modelo
      - paragraph: Velô Sprint
      - paragraph: Cor
      - paragraph: ${order.color}
      - paragraph: Interior
      - paragraph: cream
      - paragraph: Rodas
      - paragraph: ${order.wheels}
      - heading "Dados do Cliente" [level=4]
      - paragraph: Nome
      - paragraph: ${order.customer.name}
      - paragraph: Email
      - paragraph: ${order.customer.email}
      - paragraph: Loja de Retirada
      - paragraph 
      - paragraph: Data do Pedido
      - paragraph: /\\d+\\/\\d+\\/\\d+/
      - heading "Pagamento" [level=4]
      - paragraph: ${order.payment}
      - paragraph: /R\\$ \\d+\\.\\d+,\\d+/
      `);

    const statusBadge = page.getByRole('status').filter({ hasText: order.status })

    await expect(statusBadge).toHaveClass(/bg-amber-100/)
    await expect(statusBadge).toHaveClass(/text-amber-700/)

    const statusIcon = statusBadge.locator('svg')
    await expect(statusIcon).toHaveClass(/lucide-clock/)
  })

  test('deve exibir mensagem quando o pedido não é encontrado', async ({ page }) => {
    const order = generateOrderCode()

    const orderLockupPage = new OrderLockupPage(page)
    await orderLockupPage.searchOrder(order)

    /* const title = page.getByRole('heading', { name: 'Pedido não encontrado'})
    await expect(title).toBeVisible()
  
    // const message = page.locator('//p[text()="Verifique o número do pedido e tente novamente"]')
    const message = page.locator('p', { hasText: 'Verifique o número do pedido e tente novamente'})
    await expect(message).toBeVisible() */

    await expect(page.locator('#root')).toMatchAriaSnapshot(`
      - img
      - heading "Pedido não encontrado" [level=3]
      - paragraph: Verifique o número do pedido e tente novamente
      `)
  })
})

