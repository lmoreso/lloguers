export const formatM2 = (value: number): string =>
  `${new Intl.NumberFormat('ca-ES', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2
  }).format(value)} m²`

export const formatCurrency = (value: number): string =>
  new Intl.NumberFormat('ca-ES', {
    style: 'currency',
    currency: 'EUR'
  }).format(value)
