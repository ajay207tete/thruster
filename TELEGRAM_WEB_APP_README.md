# Telegram Web App Integration

This document provides comprehensive instructions for integrating the official Telegram Web App SDK into your React/Expo application to create a Telegram Mini App.

## 🚀 Quick Start

### 1. SDK Installation & Initialization

The Telegram Web App SDK is loaded dynamically and initialized automatically when the app detects it's running inside Telegram.

**Key Files:**

- `client/utils/telegramSdk.ts` - SDK loader and type definitions
- `client/hooks/useTelegram.ts` - Main hook for Telegram functionality
- `client/hooks/useTelegramTheme.ts` - Theme integration hook

### 2. App Layout Integration

Update your root layout to use the new Telegram hooks:

```tsx
// client/app/_layout.tsx
import { useTelegram } from '@/hooks/useTelegram';
import { useTelegramTheme } from '@/hooks/useTelegramTheme';

export default function RootLayout() {
  const telegram = useTelegram();
  const { theme } = useTelegramTheme();

  // SDK initializes automatically
  // Theme colors are applied via CSS custom properties

  return (
    <ThemeProvider value={/* your theme */}>
      {/* Your app content */}
    </ThemeProvider>
  );
}
```

### 3. Using Telegram Features

```tsx
import { useTelegram } from '@/hooks/useTelegram';

function MyComponent() {
  const telegram = useTelegram();

  const handleAction = async () => {
    if (telegram.isInTelegram) {
      // Show Telegram popup
      const result = await telegram.showPopup({
        title: 'Confirm Action',
        message: 'Are you sure?',
        buttons: [
          { id: 'yes', type: 'ok', text: 'Yes' },
          { id: 'no', type: 'cancel', text: 'No' }
        ]
      });

      if (result === 'yes') {
        // Use Main Button
        telegram.MainButton.setText('Processing...');
        telegram.MainButton.showProgress();

        // Do something...

        telegram.MainButton.hideProgress();
        telegram.MainButton.setText('Done!');
        telegram.HapticFeedback.notificationOccurred('success');
      }
    }
  };

  return (
    <TouchableOpacity onPress={handleAction}>
      <Text>Do Action</Text>
    </TouchableOpacity>
  );
}
```

## 🔧 Configuration

### Environment Variables

Add these to your environment:

```bash
# Server-side (for authentication validation)
TELEGRAM_BOT_TOKEN=your_bot_token_here

# Client-side (optional, for API calls)
EXPO_PUBLIC_API_URL=https://your-api-domain.com
```

### Bot Configuration

1. Create a Telegram bot via [@BotFather](https://t.me/botfather)
2. Get your bot token
3. Configure Web App in BotFather:

   ```bash
   /setmenubutton
   Select your bot
   Web App
   Enter your Web App URL: https://your-domain.com
   ```

### Netlify Deployment

#### 1. Build Configuration

Add to `netlify.toml`:

```toml
[build]
  command = "npm run build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "18"

# Headers for Telegram Web App
[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "ALLOWALL"
    Content-Security-Policy = "frame-ancestors *;"

# Redirect rules for Telegram Web App
[[redirects]]
  from = "/telegram-web-app"
  to = "/index.html"
  status = 200
```

#### 2. Environment Variables

Set in Netlify dashboard:

- `TELEGRAM_BOT_TOKEN` - Your bot token
- `NODE_ENV` - production

#### 3. Domain Configuration

1. Set custom domain in Netlify
2. Configure domain in BotFather: `/setdomain`

## 🎨 Theme Integration

The app automatically adapts to Telegram's theme:

```tsx
import { useTelegramTheme } from '@/hooks/useTelegramTheme';

function ThemedComponent() {
  const { theme, isTelegramTheme, colorScheme } = useTelegramTheme();

  return (
    <View style={{ backgroundColor: theme.background }}>
      <Text style={{ color: theme.text }}>
        Themed content
      </Text>
    </View>
  );
}
```

CSS custom properties are automatically set:

:root {
  --telegram-bg_color: #ffffff;
  --telegram-text_color: #000000;
  --telegram-button_color: #007bff;
  /*...etc*/
}
```

## 🔐 Authentication

### Backend Validation

The server validates Telegram `initData`:

```javascript
// server/routes/auth.js
POST /api/auth/telegram
{
  "initData": "auth_date=123456&hash=abc123&user=..."
}
```

### Client Usage

```tsx
import { telegramAuthService } from '@/services/telegramAuthService';

const authenticate = async () => {
  if (telegram.initData) {
    const response = await telegramAuthService.authenticate(telegram.initData);
    if (response.success) {
      // User authenticated
      console.log('User:', response.user);
    }
  }
};
```

## 📱 UI Components

### Main Button

```tsx
const { MainButton } = useTelegram();

MainButton.setText('Pay Now');
MainButton.setParams({
  color: '#ff0000',
  text_color: '#ffffff'
});
MainButton.show();
MainButton.onClick(() => {
  // Handle click
});
```

### Back Button

```tsx
const { BackButton } = useTelegram();

BackButton.show();
BackButton.onClick(() => {
  navigation.goBack();
});
```

### Popups & Alerts

```tsx
const { showPopup, showAlert, showConfirm } = useTelegram();

// Native Telegram popup
const result = await showPopup({
  message: 'Choose option',
  buttons: [
    { id: 'a', type: 'default', text: 'Option A' },
    { id: 'b', type: 'default', text: 'Option B' }
  ]
});

// Alert
await showAlert('Operation completed!');

// Confirm
const confirmed = await showConfirm('Are you sure?');
```

## 🎮 Haptic Feedback

```tsx
const { HapticFeedback } = useTelegram();

HapticFeedback.impactOccurred('medium');
HapticFeedback.notificationOccurred('success');
HapticFeedback.selectionChanged();
```

## 🔗 External Links

```tsx
const { openLink, openTelegramLink, shareUrl } = useTelegram();

// Open external link
openLink('https://example.com', { try_instant_view: true });

// Open Telegram link
openTelegramLink('https://t.me/username');

// Share URL
shareUrl('https://example.com', 'Check this out!');
```

## 📷 QR Code Scanning

```tsx
const { showScanQrPopup } = useTelegram();

const scannedText = await showScanQrPopup({
  text: 'Scan QR code to continue'
});
```

## 📋 Clipboard Access

```tsx
const { readTextFromClipboard } = useTelegram();

const clipboardText = await readTextFromClipboard();
```

## 👥 Contact Requests

```tsx
const { requestContact } = useTelegram();

const contact = await requestContact();
// Returns Telegram user object
```

## 🧪 Testing

### Local Development

1. Start your development server
2. Use Telegram's test environment or create a test bot
3. Access via `https://your-domain.com` in Telegram WebView

### Test Commands

```bash
# Build for production
npm run build

# Test in browser (non-Telegram mode)
npm run web

# Deploy to Netlify
netlify deploy --prod
```

## 🐛 Troubleshooting

### Common Issues

1. **SDK not loading**
   - Check network connectivity
   - Verify domain is allowed in BotFather

2. **Authentication failing**
   - Verify `TELEGRAM_BOT_TOKEN` is set
   - Check `initData` is not expired (24h limit)

3. **Theme not applying**
   - Ensure CSS custom properties are used
   - Check if running in Telegram WebView

4. **Buttons not working**
   - Verify Telegram Web App version supports the feature
   - Check platform compatibility

### Debug Information

```tsx
const telegram = useTelegram();

console.log('Debug info:', {
  isInTelegram: telegram.isInTelegram,
  platform: telegram.platform,
  version: telegram.version,
  user: telegram.user,
  initData: telegram.initData
});
```

## 📚 API Reference

### useTelegram Hook

Returns all Telegram Web App functionality with TypeScript support.

### useTelegramTheme Hook

Provides theme colors and automatic theme switching.

### telegramAuthService

Handles authentication with your backend.

## 🔄 Updates

Keep the Telegram Web App SDK updated by monitoring the [official documentation](https://core.telegram.org/bots/webapps).

## 📞 Support

- [Telegram Web Apps Documentation](https://core.telegram.org/bots/webapps)
- [BotFather](https://t.me/botfather)
- [Telegram Developers Chat](https://t.me/telegramdev)
