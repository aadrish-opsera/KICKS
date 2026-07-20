export function formatCurrency(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || amount <= 0 || Number.isNaN(amount)) {
    return 'N/A'
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount)
}
