
export interface ZakatCalculation {
  totalWealth: number;
  zakatDue: number;
  nisabMet: boolean;
}

export const ZakatService = {
  // Current Nisab values (approximate, should ideally be fetched from an API)
  // Gold Nisab: 87.48 grams
  // Silver Nisab: 612.36 grams
  // Prices as of May 2026 (Mock values)
  GOLD_PRICE_PER_GRAM: 75.20,
  SILVER_PRICE_PER_GRAM: 0.95,

  getNisabValue: (metal: 'gold' | 'silver' = 'gold'): number => {
    if (metal === 'gold') {
      return 87.48 * ZakatService.GOLD_PRICE_PER_GRAM;
    }
    return 612.36 * ZakatService.SILVER_PRICE_PER_GRAM;
  },

  calculateZakat: (assets: {
    cash: number;
    savings: number;
    gold: number;
    silver: number;
    investments: number;
    businessAssets: number;
    liabilities: number;
  }): ZakatCalculation => {
    const totalAssets = 
      assets.cash + 
      assets.savings + 
      assets.gold + 
      assets.silver + 
      assets.investments + 
      assets.businessAssets;
    
    const netWealth = totalAssets - assets.liabilities;
    const nisabValue = ZakatService.getNisabValue('gold');
    
    const nisabMet = netWealth >= nisabValue;
    const zakatDue = nisabMet ? netWealth * 0.025 : 0;

    return {
      totalWealth: netWealth,
      zakatDue,
      nisabMet
    };
  }
};
