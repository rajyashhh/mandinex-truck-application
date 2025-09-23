# Mandinex Truck Driver App - Production Deployment Guide

## 🚀 Quick Start for Going Live

### 1. Deploy Backend Server (10 minutes)

#### Option A: Deploy to Render.com (FREE)
1. Create account at [render.com](https://render.com)
2. Push your server code to GitHub
3. In Render Dashboard:
   - New → Web Service
   - Connect GitHub repo
   - Select the `server` directory
   - Environment variables:
     ```
     DATABASE_URL=<your-neon-database-url>
     PORT=3001
     ```
4. Click "Create Web Service"
5. Copy the URL (e.g., `https://mandinex-api.onrender.com`)

#### Option B: Use Temporary Ngrok (For Testing)
```bash
cd server
npm start
# In another terminal:
npx ngrok http 3001
# Copy the HTTPS URL
```

### 2. Update App with Production URL

1. Update `src/services/api.js`:
```javascript
const API_BASE_URL = 'https://your-render-url.onrender.com/api';
```

### 3. Build Production APK

#### Using Expo (Recommended)
```bash
# Create production build
eas build --platform android --profile production --local
```

#### Using Local Build (If you have Android Studio)
```bash
cd android
./gradlew assembleRelease
# APK will be in android/app/build/outputs/apk/release/
```

### 4. Test Production APK
1. Transfer APK to phone
2. Enable "Install from Unknown Sources"
3. Install and test all features

### 5. Publish to Google Play Store

1. Create Developer Account ($25): https://play.google.com/console
2. Create new application
3. Upload APK
4. Fill required information:
   - App name: Mandinex Driver
   - Short description: Professional truck driver app for logistics
   - Full description: (provided below)
   - Category: Business
   - Content rating: Everyone

### 6. Required Assets

Create these before publishing:
- Icon: 512x512 PNG
- Feature Graphic: 1024x500 PNG
- Screenshots: At least 2 (phone)
- Privacy Policy: Host on GitHub Pages

## 📱 App Store Description

**Short Description (80 chars):**
"Mandinex Driver - Professional logistics app for truck drivers"

**Full Description:**
```
Mandinex Driver is the ultimate companion app for professional truck drivers. 
Streamline your deliveries with real-time tracking, digital documentation, 
and seamless communication with logistics coordinators.

Key Features:
✓ Real-time GPS tracking
✓ Digital trip management
✓ Secure PIN-based login
✓ Document upload for permits
✓ Delivery confirmations
✓ Route optimization
✓ Offline capability

Join thousands of drivers improving their efficiency with Mandinex.
```

## 🔒 Security Checklist

- [x] Database connection is secure (SSL)
- [ ] API endpoints use HTTPS
- [ ] User PINs are hashed
- [ ] Location data is encrypted
- [ ] Session tokens expire
- [ ] Add rate limiting to API

## 📊 Monitoring (After Launch)

1. Add Sentry for crash reporting
2. Google Analytics for usage tracking
3. Server monitoring with UptimeRobot

## 🆘 Common Issues

**"Unsupported file type" when installing APK:**
- Use a file manager app
- Enable Unknown Sources first
- Download with Chrome, not other browsers

**API connection issues:**
- Check if server is running
- Verify HTTPS certificate
- Test with Postman first

**Location not updating:**
- Check location permissions
- Ensure background location is enabled
- Test on real device, not emulator

## 📞 Support

For deployment help:
- Email: support@mandinex.com
- Documentation: github.com/mandinex/docs
