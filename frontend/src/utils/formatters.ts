/**
 * Format currency values with proper symbols and localization
 */
export const formatCurrency = (
  value: number,
  currency: string = 'USD',
  decimals: number = 2
): string => {
  const symbols: Record<string, string> = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    JPY: '¥',
  };

  const symbol = symbols[currency] || '$';
  const formatted = formatNumber(Math.abs(value), decimals);

  return value < 0 ? `-${symbol}${formatted}` : `${symbol}${formatted}`;
};

/**
 * Format numbers with thousands separators and decimal places
 */
export const formatNumber = (value: number, decimals?: number): string => {
  return value.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};

/**
 * Format percentage values with + or - prefix
 */
export const formatPercentage = (
  value: number,
  decimals: number = 2
): string => {
  const formatted = Math.abs(value).toFixed(decimals);

  if (value === 0) {
    return `${formatted}%`;
  }

  return value > 0 ? `+${formatted}%` : `-${formatted}%`;
};

/**
 * Truncate blockchain addresses for display
 */
export const truncateAddress = (
  address: string,
  startLength: number = 5,
  endLength: number = 4
): string => {
  if (address.length <= startLength + endLength) {
    return address;
  }

  return `${address.slice(0, startLength)}...${address.slice(-endLength)}`;
};

/**
 * Format time relative to now or as absolute date
 */
export const formatTime = (date: Date): string => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 30) {
    return 'Just now';
  } else if (seconds < 60) {
    return `${seconds} sec ago`;
  } else if (minutes < 60) {
    return `${minutes} min ago`;
  } else if (hours < 24) {
    return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  } else {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }
};

/**
 * Format token balances with proper decimal places
 */
export const formatBalance = (
  balance: number,
  decimals: number,
  minDisplayDecimals: number = 6
): string => {
  if (balance === 0) {
    return '0.' + '0'.repeat(decimals);
  }

  // For very small amounts, show "< 0.000001"
  const minValue = Math.pow(10, -minDisplayDecimals);
  if (balance < minValue && balance > 0) {
    return `< ${minValue.toFixed(minDisplayDecimals)}`;
  }

  return formatNumber(balance, decimals);
};

/**
 * Format large numbers with K, M, B suffixes
 */
export const formatCompactNumber = (value: number): string => {
  if (value >= 1e9) {
    return `${(value / 1e9).toFixed(1)}B`;
  } else if (value >= 1e6) {
    return `${(value / 1e6).toFixed(1)}M`;
  } else if (value >= 1e3) {
    return `${(value / 1e3).toFixed(1)}K`;
  }

  return formatNumber(value, 2);
};

/**
 * Format transaction hash for display
 */
export const formatTxHash = (hash: string): string => {
  return truncateAddress(hash, 8, 8);
};

/**
 * Format gas price in Gwei (for Ethereum)
 */
export const formatGasPrice = (gasPrice: number): string => {
  return `${gasPrice.toFixed(1)} Gwei`;
};

/**
 * Format token amount with symbol
 */
export const formatTokenAmount = (
  amount: number,
  symbol: string,
  decimals: number = 6
): string => {
  const formatted = formatBalance(amount, decimals);
  return `${formatted} ${symbol}`;
};

/**
 * Format USD value with compact notation for large amounts
 */
export const formatUsdValue = (value: number): string => {
  if (value >= 1e6) {
    return formatCurrency(value / 1e6, 'USD', 2) + 'M';
  } else if (value >= 1e3) {
    return formatCurrency(value / 1e3, 'USD', 1) + 'K';
  }

  return formatCurrency(value, 'USD');
};
