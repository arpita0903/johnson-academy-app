# Local Build Guide for Johnson Academy App

This guide will help you build the app locally for both iOS and Android.

## Prerequisites

### For iOS:

- macOS with Xcode installed
- CocoaPods installed (`sudo gem install cocoapods`)
- iOS Simulator or physical device

### For Android:

- Android Studio installed
- Android SDK configured
- Java Development Kit (JDK) 17 or higher
- Android device or emulator

## Setup Steps

### 1. Install Dependencies

```bash
npm install
```

### 2. iOS Setup

```bash
# Navigate to iOS directory
cd ios

# Install CocoaPods dependencies
export LANG=en_US.UTF-8
export LC_ALL=en_US.UTF-8
pod install

# Return to project root
cd ..
```

### 3. Android Setup

The Android project is already configured. Make sure you have:

- Android SDK installed
- `ANDROID_HOME` environment variable set
- Java JDK 17+ installed

## Building the App

### iOS Build

#### For Simulator:

```bash
npm run ios
# or
npx expo run:ios
```

#### For Physical Device:

```bash
npx expo run:ios --device
```

#### Using Xcode:

1. Open `ios/JohnsonAcademy.xcworkspace` (NOT .xcodeproj) in Xcode
2. Select your target device/simulator
3. Click the Run button or press `Cmd + R`

### Android Build

#### For Emulator/Device:

```bash
npm run android
# or
npx expo run:android
```

#### Using Android Studio:

1. Open `android` folder in Android Studio
2. Wait for Gradle sync to complete
3. Select your target device/emulator
4. Click the Run button

#### Build APK directly:

```bash
cd android
./gradlew assembleDebug
# APK will be at: android/app/build/outputs/apk/debug/app-debug.apk
```

## Troubleshooting

### iOS Issues:

1. **CocoaPods encoding error:**

   ```bash
   export LANG=en_US.UTF-8
   export LC_ALL=en_US.UTF-8
   cd ios && pod install
   ```

2. **Clean build:**

   ```bash
   cd ios
   rm -rf Pods Podfile.lock
   pod install
   cd ..
   npx expo run:ios --clean
   ```

3. **Xcode cache issues:**
   - In Xcode: Product → Clean Build Folder (Shift + Cmd + K)
   - Delete `~/Library/Developer/Xcode/DerivedData`

### Android Issues:

1. **Gradle sync fails:**

   ```bash
   cd android
   ./gradlew clean
   ./gradlew --stop
   cd ..
   ```

2. **Build fails:**

   ```bash
   cd android
   ./gradlew clean
   cd ..
   npx expo run:android --clean
   ```

3. **Metro bundler issues:**
   ```bash
   npx expo start --clear
   ```

## Development Build

For development with Expo Dev Client:

```bash
# Start Metro bundler
npx expo start --dev-client

# In another terminal, run:
# iOS:
npx expo run:ios

# Android:
npx expo run:android
```

## Production Build

For production builds, use EAS Build:

```bash
# Install EAS CLI if not already installed
npm install -g eas-cli

# Build for production
eas build --platform ios
eas build --platform android
```

## Common Commands

- `npm start` - Start Expo development server
- `npm run ios` - Build and run on iOS
- `npm run android` - Build and run on Android
- `npx expo prebuild --clean` - Regenerate native projects
- `npx expo-doctor` - Check for common issues
