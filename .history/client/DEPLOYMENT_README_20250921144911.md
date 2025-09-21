# Deployment Guide for Cyberpunk App

## Issue Fixed
Your app at https://thruster-ki15.vercel.app/ was showing a 404 error because:
1. Missing build configuration for Vercel
2. No proper build script for web deployment
3. Missing public directory for static assets
4. Incorrect output directory configuration

## Files Created/Updated

### 1. `vercel.json` - Vercel Configuration
```json
{
  "buildCommand": "npx expo export --platform web",
  "outputDirectory": "dist",
  "installCommand": "npm install",
  "framework": null
}
```

### 2. `package.json` - Added Build Script
```json
"build": "npx expo export --platform web"
```

### 3. `app.json` - Updated Web Configuration
Added `"public": "./public"` to serve static assets correctly.

### 4. `public/tonconnect-manifest.json` - Static Asset
Copied the TON Connect manifest file to the public directory.

## Next Steps

1. **Commit and Push Changes**:
   ```bash
   git add .
   git commit -m "Fix Vercel deployment configuration"
   git push
   ```

2. **Redeploy on Vercel**:
   - Go to your Vercel dashboard
   - Trigger a new deployment
   - The build should now work correctly

3. **Alternative: Test Build Locally**:
   ```bash
   cd client
   npm run build
   ```
   This will create a `dist` folder with your built web app.

## What Was Fixed

- ✅ Added proper build command for Expo web export
- ✅ Configured correct output directory (`dist`)
- ✅ Added public directory for static assets
- ✅ Updated app.json with public path configuration
- ✅ Created vercel.json with proper build settings

Your app should now deploy successfully on Vercel and be accessible at https://thruster-ki15.vercel.app/
