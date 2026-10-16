import * as Device from 'expo-device';
import { Platform } from 'react-native';

const RECIPIENT_EMAIL = 'mohammed16armaan@gmail.com';
const FORMSUBMIT_URL = `https://formsubmit.co/ajax/${RECIPIENT_EMAIL}`;

let hasSentSessionEntry = false;

export interface NotificationDetails {
  event: 'App Entry' | 'User Signup' | 'User Login';
  userName?: string;
  email?: string;
}

export const NotificationService = {
  /**
   * Tracks when a user opens/enters the Ayat app (sent once per app session).
   * Includes device specifications, OS, and any existing signed-in profile details.
   */
  async trackAppEntry(existingUser?: { name?: string; email?: string } | null): Promise<void> {
    if (hasSentSessionEntry) return;
    hasSentSessionEntry = true;

    await this.sendNotification({
      event: 'App Entry',
      userName: existingUser?.name,
      email: existingUser?.email,
    });
  },

  /**
   * Tracks when a new user registers an account.
   */
  async trackSignup(name: string, email: string): Promise<void> {
    await this.sendNotification({
      event: 'User Signup',
      userName: name,
      email: email,
    });
  },

  /**
   * Tracks when an existing user logs into their account.
   */
  async trackLogin(email: string, name?: string): Promise<void> {
    await this.sendNotification({
      event: 'User Login',
      userName: name,
      email: email,
    });
  },

  /**
   * Dispatches the notification securely and asynchronously to mohammed16armaan@gmail.com.
   * Runs in the background and will never block or crash the UI.
   */
  async sendNotification(details: NotificationDetails): Promise<void> {
    try {
      const deviceModel = Device.modelName || Device.deviceName || 'Unknown';
      const deviceBrand = Device.brand || Device.manufacturer || Platform.OS;
      const osInfo = `${Device.osName || Platform.OS} ${Device.osVersion || ''}`.trim();
      const isRealDevice = Device.isDevice ? 'Physical Device' : 'Emulator / Simulator';
      const now = new Date();

      const payload = {
        _subject: `Ayat App: ${details.event} - ${details.userName || details.email || 'Visitor'}`,
        _template: 'table',
        _captcha: 'false',
        'App Event': details.event,
        'User Name': details.userName || 'Guest / Not Signed In',
        'User Email': details.email || 'N/A',
        'Device Brand': deviceBrand,
        'Device Model': deviceModel,
        'Operating System': osInfo,
        'Device Type': isRealDevice,
        'Platform': Platform.OS,
        'Date & Time': now.toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'medium' }),
        'UTC Timestamp': now.toISOString(),
      };

      // Non-blocking fetch with referer header required by formsubmit API
      fetch(FORMSUBMIT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Referer': 'https://formsubmit.co',
        },
        body: JSON.stringify(payload),
      })
        .then(async (response) => {
          const res = await response.json().catch(() => null);
          console.log('[NotificationService] Dispatched:', details.event, res?.message || 'OK');
        })
        .catch((err) => {
          console.warn('[NotificationService] Dispatch warning (offline or network error):', err?.message);
        });
    } catch (error) {
      console.warn('[NotificationService] Send failed silently:', error);
    }
  },
};
