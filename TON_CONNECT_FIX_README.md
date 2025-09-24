# TON Connect Manifest Fix

## Problem
The app was failing to connect to TON wallet with "app manifest error" because:
1. The manifest file had incorrect URLs pointing to external domains
2. The icon URL was pointing to an inaccessible IPFS link
3. Some layout files had hardcoded external manifest URLs

## Solution Applied

### 1. Fixed Manifest File
**File:** `public/tonconnect-manifest.json`

**Before:**
```json
{
  "url": "https://thruster.app",
  "name": "Cyberpunk App",
  "iconUrl": "https://chocolate-chemical-orangutan-457.mypinata.cloud/ipfs/bafybeig2ke6iowzphw7cxexu5o64k73tlaoph7vtpi2tsccbkexfryl37m",
  "termsOfUseUrl": "https://thruster.app/terms",
  "privacyPolicyUrl": "https://thruster.app/privacy"
}
```

**After:**
```json
{
  "url": "http://localhost:8081",
  "name": "Cyberpunk App",
  "iconUrl": "http://localhost:8081/assets/images/icon.png",
  "termsOfUseUrl": "http://localhost:8081/terms",
  "privacyPolicyUrl": "http://localhost:8081/privacy"
}
```

### 2. Fixed Layout Files
Updated all layout files to use the correct manifest URL:
- `client/app/_layout.tsx` ✅ (already correct)
- `client/app/_layout-fixed.tsx` ✅ (fixed)
- `client/app/_layout-updated.tsx` ✅ (fixed)

**Before:**
```tsx
<TonConnectUIProvider manifestUrl="https://external-url.com/manifest.json">
```

**After:**
```tsx
<TonConnectUIProvider manifestUrl="/tonconnect-manifest.json">
```

### 3. Added Environment Configuration
**File:** `client/.env`
```env
EXPO_PUBLIC_TON_MANIFEST_URL=/tonconnect-manifest.json
EXPO_PUBLIC_API_BASE_URL=http://localhost:3001
NODE_ENV=development
```

**File:** `client/.env.production`
```env
EXPO_PUBLIC_TON_MANIFEST_URL=https://your-domain.com/tonconnect-manifest.json
EXPO_PUBLIC_API_BASE_URL=https://your-api-domain.com
NODE_ENV=production
```

### 4. Production Templates
**File:** `public/tonconnect-manifest.production.json`
Template for production deployment - update with your actual domain.

## How to Use

### Development
1. The app will automatically use the local manifest file
2. Environment variables are loaded from `client/.env`
3. TON Connect will work with `http://localhost:8081`

### Production Deployment
1. Update `client/.env.production` with your actual domain
2. Update `public/tonconnect-manifest.production.json` with your actual domain
3. Copy the production manifest to replace the development one:
   ```bash
   cp public/tonconnect-manifest.production.json public/tonconnect-manifest.json
   ```

## Testing
To test the TON Connect functionality:
1. Start the development server: `npm start`
2. The app should load without manifest errors
3. The TON Connect button should appear and work properly
4. Wallet connection should be possible

## Files Modified
- ✅ `public/tonconnect-manifest.json` - Fixed URLs and icon
- ✅ `client/app/_layout-fixed.tsx` - Updated manifest URL
- ✅ `client/app/_layout-updated.tsx` - Updated manifest URL
- ✅ `client/.env` - Added environment configuration
- ✅ `client/.env.production` - Added production configuration
- ✅ `public/tonconnect-manifest.production.json` - Production template

## Next Steps
1. Test wallet connection functionality
2. Update production URLs when deploying
3. Verify all payment flows work correctly
