import { Page, expect } from '@playwright/test'

export function createConfiguratorActions(page: Page) {
  const titleHeading = page.getByRole('heading', { name: 'Velô Sprint' })
  const opcionaisHeading = page.getByRole('heading', { name: 'Opcionais' })
  const totalPrice = page.getByTestId('total-price')
  const carImage = page.locator('img[alt^="Velô Sprint"]')

  const colorButton = (name: string) => page.getByRole('button', { name })
  const wheelButton = (name: string | RegExp) => page.getByRole('button', { name })
  const optionalCheckbox = (label: string | RegExp) =>
    page.getByRole('checkbox', { name: label })

  return {
    elements: {
      titleHeading,
      opcionaisHeading,
      totalPrice,
      carImage,
      colorButton,
      wheelButton,
      optionalCheckbox,
    },

    async open() {
      await page.goto('/configure')
    },

    async selectColor(name: string) {
      await colorButton(name).click()
    },

    async selectWheels(name: string | RegExp) {
      await wheelButton(name).click()
    },

    async expectPrice(price: string) {
      await expect(totalPrice).toBeVisible()
      await expect(totalPrice).toHaveText(price)
    },

    async expectCarImageSrc(src: string) {
      await expect(carImage).toHaveAttribute('src', src)
    },

    async checkOptional(label: string | RegExp) {
      await optionalCheckbox(label).check()
    },

    async uncheckOptional(label: string | RegExp) {
      await optionalCheckbox(label).uncheck()
    },
  }
}
