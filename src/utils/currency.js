export const formatCurrency = (amount, currency = 'AED') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

// Backward compatibility for AED
export const formatAED = (amount) => formatCurrency(amount, 'AED');

export const parseAmount = (amountString) => {
  const cleaned = amountString.replace(/[^\d.]/g, '');
  return parseFloat(cleaned) || 0;
}; 