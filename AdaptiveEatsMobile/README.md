# AdaptiveEats Mobile App

A React Native mobile app for AI-powered recipe adaptation, built with Expo.

## Features

- 📱 **Mobile-first design** with beautiful UI
- 📷 **Camera integration** - Take photos or choose from gallery
- 🍞 **AI recipe adaptation** for dietary restrictions
- 📱 **Cross-platform** (iOS & Android)
- 🎨 **Modern UI** with gradients and animations
- 🚫 **Clean code** - No console logging in production

## Getting Started

### Prerequisites

- Node.js (v16 or later)
- Expo CLI (`npm install -g @expo/cli`)
- Expo Go app on your phone (for testing)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Update the API URL in `src/utils/config.ts`:
```typescript
export const API_BASE_URL = 'https://your-domain.com';
```

3. Start the development server:
```bash
npm start
```

4. Scan the QR code with Expo Go app on your phone

### Development

- **iOS Simulator**: `npm run ios` (requires macOS)
- **Android Emulator**: `npm run android`
- **Web**: `npm run web`

## Project Structure

```
src/
├── screens/          # App screens
│   ├── HomeScreen.tsx
│   └── RecipeResultScreen.tsx
├── components/       # Reusable components
├── types/           # TypeScript type definitions
└── utils/           # Utility functions and config
```

## Building for Production

### iOS (App Store)
```bash
expo build:ios
```

### Android (Google Play)
```bash
expo build:android
```

## Features Implemented

- ✅ Recipe text input
- ✅ Camera integration (take photos + choose from gallery)
- ✅ Dietary restrictions selection
- ✅ AI recipe adaptation
- ✅ Recipe result display
- ✅ Share functionality
- ✅ Modern UI with gradients
- ✅ Clean production code (no console logging)

## Next Steps

- [ ] Add user authentication
- [ ] Save favorite recipes
- [ ] Recipe history
- [ ] Push notifications
- [ ] Offline support
