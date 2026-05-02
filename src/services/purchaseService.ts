import Purchases, { LOG_LEVEL, CustomerInfo } from 'react-native-purchases';
import { Platform } from 'react-native';

// RevenueCat API Keys
const RC_API_KEY_ANDROID = 'test_iQYBQukwRJdPbmDZDVvTvdZXHDA';
const RC_API_KEY_IOS = 'test_iQYBQukwRJdPbmDZDVvTvdZXHDA'; // Replace with iOS key when ready

export const ENTITLEMENT_PREMIUM = 'premium';

export const PurchaseService = {
  initialize: async () => {
    try {
      Purchases.setLogLevel(LOG_LEVEL.DEBUG);

      if (Platform.OS === 'android') {
        await Purchases.configure({ apiKey: RC_API_KEY_ANDROID });
      } else {
        await Purchases.configure({ apiKey: RC_API_KEY_IOS });
      }

      console.log('[PurchaseService] RevenueCat initialized');
    } catch (e) {
      console.error('[PurchaseService] Init error:', e);
    }
  },

  isPremium: async (): Promise<boolean> => {
    try {
      const customerInfo: CustomerInfo = await Purchases.getCustomerInfo();
      return customerInfo.entitlements.active[ENTITLEMENT_PREMIUM] !== undefined;
    } catch (e) {
      console.error('[PurchaseService] isPremium error:', e);
      return false;
    }
  },

  getOfferings: async () => {
    try {
      const offerings = await Purchases.getOfferings();
      return offerings.current;
    } catch (e) {
      console.error('[PurchaseService] getOfferings error:', e);
      return null;
    }
  },

  purchasePackage: async (pkg: any) => {
    try {
      const { customerInfo } = await Purchases.purchasePackage(pkg);
      return customerInfo.entitlements.active[ENTITLEMENT_PREMIUM] !== undefined;
    } catch (e: any) {
      if (!e.userCancelled) {
        console.error('[PurchaseService] purchase error:', e);
      }
      return false;
    }
  },

  restorePurchases: async (): Promise<boolean> => {
    try {
      const customerInfo = await Purchases.restorePurchases();
      return customerInfo.entitlements.active[ENTITLEMENT_PREMIUM] !== undefined;
    } catch (e) {
      console.error('[PurchaseService] restore error:', e);
      return false;
    }
  },
};
