import Decimal from 'decimal.js';

// Centralized configuration for exchange rates and fees
export const CRYPTO_CONFIG = {
  // Supported cryptocurrencies and their networks
  SUPPORTED_CRYPTOS: {
    USDT: {
      name: 'USDT',
      networks: ['TRC20', 'BEP20'],
      rate: '195', // 1 USDT = 195 ETB
    },
    LTC: {
      name: 'LTC',
      networks: ['Litecoin'],
      rate: '8863.6363', // 1 LTC = 8,863.6363 ETB (calculated from 0.022 LTC = 195 ETB)
    },
    TRX: {
      name: 'TRX',
      networks: ['TRC20'],
      rate: '65.4362', // 1 TRX = 65.4362 ETB (calculated from 2.98 TRX = 195 ETB)
    },
  },

  // Network restrictions - only these combinations are allowed
  ALLOWED_NETWORKS: {
    USDT: ['TRC20', 'BEP20'],
    LTC: ['Litecoin'],
    TRX: ['TRC20'],
  },

  // Minimum order amounts (in USDT equivalent)
  MINIMUMS: {
    BINANCE: '5', // 5 USDT equivalent
    WALLET: '10', // 10 USDT equivalent
  },

  // Fee structure (in ETB)
  FEES: {
    LOWER_FEE: '292', // 292 ETB ($1.50)
    HIGHER_FEE: '390', // 390 ETB ($2.00)
    FEE_THRESHOLD: '50', // Above 50 USDT equivalent uses higher fee
  },

  // Payment methods
  PAYMENT_METHODS: {
    CBE: {
      name: 'CBE',
      displayName: 'Commercial Bank of Ethiopia',
      accountName: 'FIKER MARIAM HAILU',
      accountNumber: '1000524101967',
    },
    TELEBIRR: {
      name: 'TELEBIRR',
      displayName: 'Telebirr',
      accountName: 'FIKER MARIAM HALIU',
      phoneNumber: '0910794006',
    },
  },

  // Receiving methods
  RECEIVING_METHODS: {
    BINANCE: 'Binance',
    WALLET: 'Wallet Address',
  },
};

// Helper functions for calculations using Decimal.js for precision
export function calculateUSDTEquivalent(crypto: string, amount: string): string {
  const config = CRYPTO_CONFIG.SUPPORTED_CRYPTOS[crypto as keyof typeof CRYPTO_CONFIG.SUPPORTED_CRYPTOS];
  if (!config) return '0';
  
  // Calculate USDT equivalent based on the rate
  // Since all rates are based on 195 ETB, we normalize to USDT
  const amountDecimal = new Decimal(amount);
  const rateDecimal = new Decimal(config.rate);
  const etbValue = amountDecimal.mul(rateDecimal);
  return etbValue.div(new Decimal('195')).toFixed(2); // Convert back to USDT equivalent
}

export function calculateFee(usdtEquivalent: string, receivingMethod: string): string {
  const { FEES } = CRYPTO_CONFIG;
  
  const usdtDecimal = new Decimal(usdtEquivalent);
  const thresholdDecimal = new Decimal(FEES.FEE_THRESHOLD);
  
  if (usdtDecimal.lte(thresholdDecimal)) {
    return FEES.LOWER_FEE;
  } else {
    return FEES.HIGHER_FEE;
  }
}

export function calculateOrderTotal(crypto: string, amount: string, receivingMethod: string): {
  cryptoAmount: string;
  usdtEquivalent: string;
  exchangeRate: string;
  baseEtbAmount: string;
  fee: string;
  totalEtbAmount: string;
} {
  const config = CRYPTO_CONFIG.SUPPORTED_CRYPTOS[crypto as keyof typeof CRYPTO_CONFIG.SUPPORTED_CRYPTOS];
  if (!config) {
    throw new Error(`Unsupported cryptocurrency: ${crypto}`);
  }

  const amountDecimal = new Decimal(amount);
  const rateDecimal = new Decimal(config.rate);
  const usdtEquivalent = calculateUSDTEquivalent(crypto, amount);
  const baseEtbAmount = amountDecimal.mul(rateDecimal).toFixed(2);
  const fee = calculateFee(usdtEquivalent, receivingMethod);
  const feeDecimal = new Decimal(fee);
  const totalEtbAmount = new Decimal(baseEtbAmount).add(feeDecimal).toFixed(2);

  return {
    cryptoAmount: amount, // Preserve original input exactly as entered
    usdtEquivalent,
    exchangeRate: config.rate,
    baseEtbAmount,
    fee,
    totalEtbAmount,
  };
}

export function validateMinimumOrder(crypto: string, amount: string, receivingMethod: string): boolean {
  const usdtEquivalent = calculateUSDTEquivalent(crypto, amount);
  const minimum = receivingMethod === CRYPTO_CONFIG.RECEIVING_METHODS.BINANCE 
    ? CRYPTO_CONFIG.MINIMUMS.BINANCE 
    : CRYPTO_CONFIG.MINIMUMS.WALLET;
  
  const usdtDecimal = new Decimal(usdtEquivalent);
  const minimumDecimal = new Decimal(minimum);
  
  return usdtDecimal.gte(minimumDecimal);
}

export function validateNetworkCombo(crypto: string, network: string): boolean {
  const allowedNetworks = CRYPTO_CONFIG.ALLOWED_NETWORKS[crypto as keyof typeof CRYPTO_CONFIG.ALLOWED_NETWORKS];
  return allowedNetworks?.includes(network) || false;
}

export function generateOrderNumber(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `ETH-${year}${month}${day}-${random}`;
}