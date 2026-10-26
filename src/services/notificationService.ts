import * as Device from 'expo-device';
import { Platform } from 'react-native';

const RECIPIENT_EMAIL = 'mohammed16armaan@gmail.com';
const FORMSUBMIT_URL = `https://formsubmit.co/ajax/${RECIPIENT_EMAIL}`;

let hasSentSessionEntry = false;

export interface NotificationDetails {
  event: 'App Entry' | 'User Signup' | 'User Login' | 'Customer Care Inquiry';
  userName?: string;
  email?: string;
  phoneNumber?: string;
  causeTitle?: string;
  amount?: number;
  currency?: string;
  transactionId?: string;
  note?: string;
  issueCategory?: string;
  issueDescription?: string;
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
   * Dispatches a Customer Care / Support inquiry directly to mohammed16armaan@gmail.com
   */
  async sendCustomerCareInquiry(data: {
    userName?: string;
    email?: string;
    phoneNumber: string;
    issueCategory?: string;
    issueDescription: string;
  }): Promise<{ success: boolean; message?: string }> {
    return this.sendNotification({
      event: 'Customer Care Inquiry',
      userName: data.userName,
      email: data.email,
      phoneNumber: data.phoneNumber,
      issueCategory: data.issueCategory,
      issueDescription: data.issueDescription,
    });
  },

  /**
   * Dispatches the notification securely and asynchronously to mohammed16armaan@gmail.com.
   * Runs in the background and will never block or crash the UI.
   */
  async sendNotification(details: NotificationDetails): Promise<{ success: boolean; message?: string }> {
    try {
      const deviceModel = Device.modelName || Device.deviceName || 'Unknown';
      const deviceBrand = Device.brand || Device.manufacturer || Platform.OS;
      const osInfo = `${Device.osName || Platform.OS} ${Device.osVersion || ''}`.trim();
      const isRealDevice = Device.isDevice ? 'Physical Device' : 'Emulator / Simulator';
      const now = new Date();

      let subject = `Ayat App: ${details.event} - ${details.userName || details.email || 'Visitor'}`;
      if (details.event === 'Customer Care Inquiry') {
        subject = `🆘 Ayat Customer Care: ${details.userName || 'User'} (${details.phoneNumber || 'No phone'}) - ${details.issueCategory || 'Support Request'}`;
      }

      const payload: Record<string, any> = {
        _subject: subject,
        _template: 'table',
        _captcha: 'false',
        'App Event': details.event,
        'User Name': details.userName || 'Guest / Anonymous',
        'User Email': details.email || 'N/A',
      };

      if (details.phoneNumber) {
        payload['Phone Number'] = details.phoneNumber;
      }

      if (details.event === 'Customer Care Inquiry') {
        payload['Inquiry Category'] = details.issueCategory || 'General Issue';
        payload['Customer Issue / Message'] = details.issueDescription || '';
      }

      payload['Device Brand'] = deviceBrand;
      payload['Device Model'] = deviceModel;
      payload['Operating System'] = osInfo;
      payload['Device Type'] = isRealDevice;
      payload['Platform'] = Platform.OS;
      payload['Date & Time'] = now.toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'medium' });
      payload['UTC Timestamp'] = now.toISOString();

      const response = await fetch(FORMSUBMIT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Referer': 'https://formsubmit.co',
        },
        body: JSON.stringify(payload),
      });

      const res = await response.json().catch(() => null);
      console.log('[NotificationService] Dispatched:', details.event, res?.message || 'OK');
      return { success: response.ok, message: res?.message || 'Inquiry submitted successfully' };
    } catch (error: any) {
      console.warn('[NotificationService] Send failed:', error);
      return { success: false, message: error?.message || 'Failed to submit' };
    }
  },
};
