import { db } from '../database/db';
import { SettingsService } from './settingsService';

export const AuthService = {
  async signup(name: string, email: string, password: string): Promise<{ success: boolean; message?: string }> {
    try {
      if (!name || !email || !password) {
        return { success: false, message: 'All fields are required.' };
      }

      // Ensure the table exists just in case
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT,
          email TEXT UNIQUE,
          password TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
      `);

      const existingUser = await db.getFirstAsync<{ id: number }>('SELECT id FROM users WHERE email = ?', [email]);
      if (existingUser) {
        return { success: false, message: 'Email is already registered.' };
      }

      // In a real production app, password should be hashed. Here we use plain text for offline demo.
      await db.runAsync(
        'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
        [name, email, password]
      );

      await SettingsService.updateSetting('isAuthenticated', true);
      
      return { success: true };
    } catch (error) {
      console.error('Signup error:', error);
      return { success: false, message: 'An error occurred during signup.' };
    }
  },

  async login(email: string, password: string): Promise<{ success: boolean; message?: string }> {
    try {
      if (!email || !password) {
        return { success: false, message: 'Email and password are required.' };
      }

      const user = await db.getFirstAsync<{ id: number, password: string }>('SELECT id, password FROM users WHERE email = ?', [email]);
      
      if (!user) {
        return { success: false, message: 'No account found with this email.' };
      }

      if (user.password !== password) {
        return { success: false, message: 'Incorrect password.' };
      }

      await SettingsService.updateSetting('isAuthenticated', true);
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'An error occurred during login.' };
    }
  }
};
