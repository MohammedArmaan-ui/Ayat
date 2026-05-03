
// Free API — no key required, 1,500 req/month on free tier
const EXCHANGE_API_BASE = 'https://open.er-api.com/v6/latest/USD';

interface ExchangeRateResponse {
  result: string;
  base_code: string;
  rates: Record<string, number>;
}

let cachedRates: Record<string, number> | null = null;
let cacheTimestamp: number = 0;
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

export const CurrencyService = {
  /**
   * Fetches USD-based exchange rates (cached for 1 hour).
   * Returns a map of { currencyCode → rate vs USD }.
   * e.g. { SAR: 3.75, EUR: 0.91, … }
   */
  getRates: async (): Promise<Record<string, number>> => {
    const now = Date.now();
    if (cachedRates && now - cacheTimestamp < CACHE_TTL_MS) {
      return cachedRates;
    }

    try {
      const response = await fetch(EXCHANGE_API_BASE);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data: ExchangeRateResponse = await response.json();
      if (data.result !== 'success') throw new Error('API error');

      cachedRates = data.rates;
      cacheTimestamp = now;
      return cachedRates;
    } catch (err) {
      console.warn('[CurrencyService] Failed to fetch rates, using fallback:', err);
      // Fallback approximate rates (May 2026)
      return {
        USD: 1, EUR: 0.92, GBP: 0.79, INR: 83.5, SAR: 3.75,
        AED: 3.67, PKR: 278.5, BDT: 110.0, TRY: 32.5, AUD: 1.55,
        CAD: 1.37, JPY: 154.0, CNY: 7.24, MYR: 4.72, IDR: 15800,
        QAR: 3.64, KWD: 0.31, BHD: 0.38, OMR: 0.38, EGP: 47.5,
        RUB: 90.0, BRL: 5.1, ZAR: 18.8, NGN: 1450, KES: 130,
        GHS: 14.5, SGD: 1.34, HKD: 7.82, NZD: 1.65, CHF: 0.91,
        SEK: 10.6, NOK: 10.7, DKK: 6.9, PLN: 3.97, CZK: 23.1,
        HUF: 360, ILS: 3.72, PHP: 56.5, THB: 36.0, VND: 24800,
        DZD: 134, MAD: 10.0, TND: 3.11, LYD: 4.85, SDG: 600,
        SOS: 570, ETB: 115, AFN: 71, IRR: 42000, IQD: 1310,
        JOD: 0.71, LBP: 89500, SYP: 13000, YER: 250,
        AZN: 1.7, KZT: 450, UZS: 12600, LKR: 298, NPR: 133,
        MVR: 15.4, MMK: 2100,
      };
    }
  },

  /**
   * Returns how many USD one unit of `currencyCode` is worth.
   * e.g. convertToUSD(3.75, 'SAR') → 1.0
   */
  convertToUSD: async (amount: number, currencyCode: string): Promise<number> => {
    if (currencyCode === 'USD') return amount;
    const rates = await CurrencyService.getRates();
    const rate = rates[currencyCode] ?? 1;
    return amount / rate;
  },

  /**
   * Returns how many units of `currencyCode` equal `usdAmount`.
   * e.g. convertFromUSD(1.0, 'SAR') → 3.75
   */
  convertFromUSD: async (usdAmount: number, currencyCode: string): Promise<number> => {
    if (currencyCode === 'USD') return usdAmount;
    const rates = await CurrencyService.getRates();
    const rate = rates[currencyCode] ?? 1;
    return usdAmount * rate;
  },

  /**
   * Gets the exchange rate for a currency relative to USD.
   */
  getRate: async (currencyCode: string): Promise<number> => {
    if (currencyCode === 'USD') return 1;
    const rates = await CurrencyService.getRates();
    return rates[currencyCode] ?? 1;
  },
};
