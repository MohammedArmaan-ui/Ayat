# Ayat - Premium Islamic Lifestyle App

![Ayat App Logo](./assets/images/icon.png)

**Ayat** is a modern, premium mobile Islamic lifestyle application built with Expo and React Native. Designed for spiritual reflection, deep study, and daily worship, it features a beautiful Emerald & Gold aesthetic inspired by classic Islamic design, combined with a seamless, high-performance user interface.

## ✨ Features

- **📖 Interactive Quran Reader**: High-quality Uthmani script with adjustable display, side-by-side translations, transliteration, and word-by-word reading modes.
- **🔊 Audio Recitation**: Stream beautiful recitations from world-renowned Qaris with per-verse highlighting and looping.
- **🕌 Prayer Times & Qibla**: Access accurate daily prayer times to help structure your day around worship.
- **📿 Tasbih Counter**: A beautifully designed interactive digital tasbih with haptic feedback, session history, and multiple built-in dhikr phrases.
- **📚 Islamic Stories**: A rich library of inspiring tales featuring the lives of Prophets (e.g., Yusuf, Musa, Muhammad PBUH) and key past events (e.g., The Battle of Badr, The Conquest of Mecca).
- **🔖 Bookmarks & Reflections**: Save your favorite ayahs and easily navigate back to them.
- **🔐 User Authentication**: Secure login and sign-up flow to keep your data, history, and preferences personalized.
- **🔍 Powerful Search**: Instantly find any verse across Arabic text, transliterations, and multiple translations.
- **🌙 Multiple Themes**: Choose between Light, Dark (Emerald), and Sepia modes for a comfortable reading experience at any time.
- **💾 Offline First**: Built-in SQLite database ensures your bookmarks, settings, and progress are saved locally even without internet.

## 🛠️ Tech Stack

- **Framework**: [Expo](https://expo.dev/) (SDK 54)
- **Routing**: [Expo Router](https://docs.expo.dev/router/introduction/)
- **Database**: [Expo SQLite](https://docs.expo.dev/versions/latest/sdk/sqlite/)
- **Audio**: [Expo AV](https://docs.expo.dev/versions/latest/sdk/av/)
- **Icons**: [Lucide React Native](https://lucide.dev/)
- **Animation & Feedback**: [React Native Reanimated](https://docs.swmansion.com/react-native-reanimated/) & Expo Haptics

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or later)
- Expo Go app on your mobile device (to preview)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/MohammedArmaan-ui/Ayat.git
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npx expo start
   ```

4. Scan the QR code with Expo Go (Android) or the Camera app (iOS) to run the app.

## 📁 Project Structure

- `app/`: Expo Router directory (Screens, Tabs, and Authentication Flow).
- `src/components/`: Reusable UI widgets (AyahCard, AudioController, etc.).
- `src/services/`: Business logic (Quran data, Audio, Storage, Settings, Auth).
- `src/constants/`: Mock data and static content (e.g., Islamic Stories).
- `src/database/`: SQLite initialization and migrations.
- `src/theme/`: Color palettes and styling constants.

## 📝 License

This project is for educational and spiritual benefit. Please respect the Quranic content and Islamic etiquettes when using or modifying this application.

---
Created with ❤️ by Mohammed Armaan