import { expect, test } from '../support/fixtures'

test.describe('Configuração do Veículo', () => {
  test.beforeEach(async ({ app }) => {
    await app.configurator.open()
    await expect(app.configurator.elements.titleHeading).toBeVisible()
    await expect(app.configurator.elements.opcionaisHeading).toBeVisible()
  })

  test('deve atualizar a imagem e manter o preço base ao trocar a cor do veículo', async ({ app }) => {
    await app.configurator.expectPrice('R$ 40.000,00')

    await app.configurator.selectColor('Midnight Black')
    await app.configurator.expectPrice('R$ 40.000,00')
    await app.configurator.expectCarImageSrc('/src/assets/midnight-black-aero-wheels.png')
  })

  test('deve atualizar o preço e a imagem ao alterar as rodas, e restaurar os valores padrão', async ({ app }) => {
    await app.configurator.expectPrice('R$ 40.000,00')

    await app.configurator.selectWheels(/Sport Wheels/)
    await app.configurator.expectPrice('R$ 42.000,00')
    await app.configurator.expectCarImageSrc('/src/assets/glacier-blue-sport-wheels.png')

    await app.configurator.selectWheels(/Aero Wheels/)
    await app.configurator.expectPrice('R$ 40.000,00')
    await app.configurator.expectCarImageSrc('/src/assets/glacier-blue-aero-wheels.png')
  })

  test('CT03 - precificação com opcionais cumulativa e desconto ao desmarcar', async ({ app }) => {
    await app.configurator.expectPrice('R$ 40.000,00')

    await app.configurator.selectWheels(/Sport Wheels/)
    await app.configurator.expectPrice('R$ 42.000,00')

    await app.configurator.checkOptional(/Precision Park/)
    await app.configurator.expectPrice('R$ 47.500,00')

    await app.configurator.checkOptional(/Flux Capacitor/)
    await app.configurator.expectPrice('R$ 52.500,00')

    await app.configurator.uncheckOptional(/Precision Park/)
    await app.configurator.expectPrice('R$ 47.000,00')
  })
})