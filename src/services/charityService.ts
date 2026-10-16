import { getDb } from '../database/db';
import { NotificationService } from './notificationService';

export interface DonationRecord {
  id: number;
  cause_id: string;
  cause_title: string;
  amount: number;
  currency: string;
  is_anonymous: number;
  donor_name: string;
  donor_email: string;
  note?: string;
  transaction_id: string;
  created_at: string;
}

export interface DonationInput {
  causeId: string;
  causeTitle: string;
  amount: number;
  currency: string;
  isAnonymous?: boolean;
  donorName?: string;
  donorEmail?: string;
  note?: string;
}

export const CharityService = {
  /**
   * Initializes the charity_donations table in SQLite if it does not exist.
   */
  async initTable(): Promise<void> {
    try {
      const db = getDb();
      if (!db) return;
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS charity_donations (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          cause_id TEXT NOT NULL,
          cause_title TEXT NOT NULL,
          amount REAL NOT NULL,
          currency TEXT NOT NULL,
          is_anonymous INTEGER DEFAULT 0,
          donor_name TEXT,
          donor_email TEXT,
          note TEXT,
          transaction_id TEXT UNIQUE NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
      `);
    } catch (e) {
      console.error('[CharityService] Failed to init charity table:', e);
    }
  },

  /**
   * Generates a unique transaction reference ID.
   */
  generateTransactionId(): string {
    const randomSuffix = Math.floor(100000 + Math.random() * 900000);
    return `AYAT-SAD-${Date.now().toString().slice(-4)}${randomSuffix}`;
  },

  /**
   * Records a new charity donation in SQLite and notifies the admin email.
   */
  async recordDonation(input: DonationInput): Promise<{ success: boolean; transactionId?: string; error?: string }> {
    try {
      await this.initTable();
      const db = getDb();
      if (!db) return { success: false, error: 'Database is not initialized.' };

      const txId = this.generateTransactionId();
      const isAnon = input.isAnonymous ? 1 : 0;
      const displayName = input.isAnonymous ? 'Anonymous Donor' : (input.donorName || 'A Servant of Allah');

      await db.runAsync(
        `INSERT INTO charity_donations (
          cause_id, cause_title, amount, currency, is_anonymous, donor_name, donor_email, note, transaction_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          input.causeId,
          input.causeTitle,
          input.amount,
          input.currency,
          isAnon,
          displayName,
          input.donorEmail || '',
          input.note || '',
          txId,
        ]
      );

      // Asynchronously dispatch notification to mohammed16armaan@gmail.com
      NotificationService.trackCharityDonation({
        userName: displayName,
        email: input.donorEmail,
        causeTitle: input.causeTitle,
        amount: input.amount,
        currency: input.currency,
        transactionId: txId,
        note: input.note,
      }).catch(() => {});

      return { success: true, transactionId: txId };
    } catch (error: any) {
      console.error('[CharityService] Error recording donation:', error);
      return { success: false, error: error?.message || 'Failed to record donation.' };
    }
  },

  /**
   * Retrieves all donations made on this device.
   */
  async getDonations(): Promise<DonationRecord[]> {
    try {
      await this.initTable();
      const db = getDb();
      if (!db) return [];
      const rows = await db.getAllAsync<DonationRecord>(
        'SELECT * FROM charity_donations ORDER BY id DESC'
      );
      return rows || [];
    } catch (e) {
      console.error('[CharityService] Error fetching donations:', e);
      return [];
    }
  },

  /**
   * Calculates total amount donated, total donation count, and distinct causes supported.
   */
  async getSummary(): Promise<{ totalAmount: number; totalCount: number; causesCount: number }> {
    try {
      await this.initTable();
      const db = getDb();
      if (!db) return { totalAmount: 0, totalCount: 0, causesCount: 0 };

      const totalResult = await db.getFirstAsync<{ total: number; count: number }>(
        'SELECT COALESCE(SUM(amount), 0) as total, COUNT(*) as count FROM charity_donations'
      );

      const causesResult = await db.getFirstAsync<{ count: number }>(
        'SELECT COUNT(DISTINCT cause_id) as count FROM charity_donations'
      );

      return {
        totalAmount: totalResult?.total || 0,
        totalCount: totalResult?.count || 0,
        causesCount: causesResult?.count || 0,
      };
    } catch (e) {
      console.error('[CharityService] Error fetching summary:', e);
      return { totalAmount: 0, totalCount: 0, causesCount: 0 };
    }
  },
};
