<p align="center">
  <a href="https://hello.kennethsolomon.com/">
    <img alt="Tsundoku" src="https://github.com/kennethsolomon/Tsundoku/blob/main/assets/images/app-icon.png?raw=true" width="150">
  </a>
</p>

<h1 align="center">
  Tsundoku (積ん読)
</h1>
<p align="center">
   Tsundoku is a mobile application built with React Native and Expo that helps manga enthusiasts discover, track, and organize their manga reading lists. The app integrates with popular manga services to provide a seamless reading experience.</p>

<p align="center">
  <a href="https://hello.kennethsolomon.com/">
    <img alt="Tsundoku" src="https://github.com/kennethsolomon/Tsundoku/blob/main/assets/images/showcase.png?raw=true" width="1080">
  </a>
</p>

## Features

- Browse and search manga from multiple sources (MangaDex, Mangahere (Coming Soon), and more...)
- Track your reading progress
- Create custom reading lists
- Clean and intuitive user interface
- Cross-platform support (iOS and Android)

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (for Mac users) or Android Studio (for Android development)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/tsundoku.git
   cd tsundoku
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Start the development server:
   ```bash
   npx expo start
   ```

4. Run on your device or simulator:
   - For iOS (Mac only):
     ```bash
     npm run ios
     # or
     yarn ios
     ```
   - For Android:
     ```bash
     npm run android
     # or
     yarn android
     ```

### Development Setup

1. Install Xcode (for iOS development, Mac only):
   - Download from the Mac App Store
   - Install iOS Simulator through Xcode

2. Install Android Studio (for Android development):
   - Download from https://developer.android.com/studio
   - Set up an Android Virtual Device (AVD)

3. Configure environment variables:
   - Copy `.env.example` to `.env`
   - Fill in required API keys and configuration



### Build

### IOS
1.	Prebuild Native Files
   ```bash
      npx expo prebuild
   ```

2.	Open Xcode Project
   ```bash
      open ios/my-app.xcworkspace
   ```

3.	Build and Run in Xcode
- Connect an iPhone or use the simulator.
- Set up signing with an Apple Developer account.
- Click Run to build and test.


### Android
1.	Prebuild Native Files
   ```bash
      npx expo prebuild
   ```

2.	Open Android Project in Android Studio
   ```bash
      cd android
      ./gradlew assembleRelease
   ```

3.	Generate APK
- Open the project in Android Studio.
- Select Build → Build Bundle(s)/APK(s) → Build APK.
- The APK will be available in android/app/build/outputs/apk/release/.
