# Firebase Setup Guide for SmartSpendr

This guide will help you set up Firebase for your SmartSpendr application step by step.

## Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or "Add project"
3. Enter project name: `smartspendr` (or any name you prefer)
4. Choose whether to enable Google Analytics (recommended)
5. Click "Create project"

## Step 2: Enable Authentication

1. In your Firebase project console, click "Authentication" in the left sidebar
2. Click "Get started"
3. Go to the "Sign-in method" tab
4. Click on "Google" provider
5. Toggle "Enable"
6. Add your email as a test user
7. Add your domain to authorized domains (for production)
8. Click "Save"

## Step 3: Set up Firestore Database

1. Click "Firestore Database" in the left sidebar
2. Click "Create database"
3. Choose "Start in test mode" (we'll add security rules later)
4. Select a location closest to your users
5. Click "Done"

## Step 4: Get Firebase Configuration

1. Click the gear icon (⚙️) next to "Project Overview"
2. Select "Project settings"
3. Scroll down to "Your apps" section
4. Click the web icon (`</>`) to add a web app
5. Enter app nickname: "SmartSpendr Web"
6. Check "Also set up Firebase Hosting" (optional)
7. Click "Register app"
8. Copy the configuration object

## Step 5: Configure Your Application

1. Create a `.env` file in your project root (copy from `.env.example`)
2. Replace the values in `.env` with your Firebase configuration:

```env
VITE_FIREBASE_API_KEY=your-api-key-from-firebase
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

3. Update `src/firebase/config.js` with your configuration:

```javascript
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};
```

## Step 6: Set up Firestore Security Rules

1. Go to Firestore Database in Firebase Console
2. Click "Rules" tab
3. Replace the default rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      
      // Allow access to user's expenses
      match /expenses/{expenseId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
      
      // Allow access to user's budgets
      match /budgets/{budgetId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
      
      // Allow access to user's settings
      match /settings/{settingId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
  }
}
```

4. Click "Publish"

## Step 7: Optional - Set up Gemini AI (for Chatbot)

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create an API key
3. Add it to your `.env` file:
```env
VITE_GEMINI_API_KEY=your-gemini-api-key
```

## Step 8: Test Your Setup

1. Start your development server: `npm run dev`
2. Try to sign in with Google
3. Add a test expense
4. Check if data appears in Firestore Console

## Troubleshooting

### Common Issues:

1. **Authentication Error**: Make sure your domain is added to authorized domains in Firebase Auth settings
2. **Firestore Permission Denied**: Check your security rules and ensure the user is authenticated
3. **Configuration Error**: Double-check your `.env` file values match your Firebase project

### Firebase Console Locations:
- **Authentication**: https://console.firebase.google.com/project/YOUR_PROJECT_ID/authentication
- **Firestore**: https://console.firebase.google.com/project/YOUR_PROJECT_ID/firestore
- **Project Settings**: https://console.firebase.google.com/project/YOUR_PROJECT_ID/settings/general

## Production Deployment

For production deployment:

1. Update authorized domains in Firebase Auth
2. Set up proper Firestore security rules
3. Configure environment variables in your hosting platform
4. Enable Firebase Hosting (optional)

Your SmartSpendr app should now be fully integrated with Firebase!