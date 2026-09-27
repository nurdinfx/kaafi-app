# Fududeeye Mobile App (Flutter)

Fududeeye Flutter Mobile Application for **iOS & Android** (also supports Web & Desktop). Built with the exact same visual design system, colors, Somali/English UI strings, categories, and database backend as the Fududeeye web platform.

---

## 🚀 Features

- **Exact Website Design System**:
  - Primary Brand Azure Blue (`#0C8FE2`) & Dark Blue (`#005899`)
  - Warm Orange Accent (`#F97316`)
  - Deep Navy Dark Theme (`#050C15`, `#0A1628`, `#0F2040`)
  - Clean Light Theme (White screen mode toggleable from the header or settings)
  - Google Fonts (Outfit headings & Inter body)
- **Same Database & API Integration**:
  - Connects to the same backend Express/Prisma API (`/api/v1`) and Supabase PostgreSQL database
  - Real-time endpoints for Listings, Categories, Buyer Requests, Authentication, Chat, Orders, and Wallet
  - Fully offline/fallback resilient with Somali marketplace seed data (Garoowe, Boosaaso, Hargeisa, Muqdisho)
  - Configurable API URL from the app (Settings / Profile) for Android Emulator (`10.0.2.2`), iOS Simulator (`localhost`), or physical phone over Wi-Fi
- **iOS & Android Ready**:
  - **Android**: Configured in `android/app/src/main/AndroidManifest.xml` with Internet permissions and Cleartext traffic enabled for local development.
  - **iOS**: Configured in `ios/Runner/Info.plist` with `NSAppTransportSecurity` and camera/photo permissions.
- **5 Bottom Navigation Tabs**:
  1. **Suuqa (Home)**: Hero banner, Garoowe city selector, category carousel, Vehicles, Real Estate, Electronics, Services, Buyer Requests CTA.
  2. **Sahami (Explore)**: Live search, filter by vehicle/property/product/service, sort by price/newest.
  3. **Dalabaadka (Buyer Requests)**: View and submit buyer requests. Verified sellers can submit offers.
  4. **Wadahadal (Chat)**: Instant messaging between buyers and sellers.
  5. **Xisaabtayda (Profile & Wallet)**: User profile, balance in USD & SOS, quick actions, theme toggle, and database connection settings.
- **Post Listings & Requests**:
  - Create new listings directly from mobile to sync with the database.
  - Create buyer requests directly from mobile.

---

## 📱 How to Run

### Option 1: Quick Launch Batches (Root Directory)
Double-click any of the following script files in the project root:
- `launch-flutter-app.bat` - Runs on your default connected device (Android or iOS).
- `launch-flutter-chrome.bat` - Runs the mobile app in Chrome.
- `launch-flutter-edge.bat` - Runs the mobile app in Microsoft Edge.

### Option 2: Command Line
From the project root:
```bash
# Navigate to mobile app
cd apps/mobile

# Run on Android emulator or connected device
"C:\Users\nuurd\OneDrive\Documents\flutter\bin\flutter.bat" run -d android

# Run on iOS (macOS host / Xcode)
"C:\Users\nuurd\OneDrive\Documents\flutter\bin\flutter.bat" run -d ios

# Run in Chrome for mobile preview
"C:\Users\nuurd\OneDrive\Documents\flutter\bin\flutter.bat" run -d chrome
```

---

## 🗄️ Connecting to the Database

1. Start your backend API from the project root:
   ```bash
   npm run dev:api
   ```
2. In the Flutter mobile app, go to **Xisaabtayda (Profile)** -> tap the **Ethernet / Cloud icon** in the top right:
   - For **Android Emulator**: Select `http://10.0.2.2:5000/api/v1`
   - For **iOS Simulator / Chrome**: Select `http://localhost:5000/api/v1`
   - For **Physical Phone**: Enter your computer's local Wi-Fi IP (e.g. `http://192.168.1.15:5000/api/v1`)
