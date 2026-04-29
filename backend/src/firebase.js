import { initializeApp as initializeClientApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import admin from 'firebase-admin';
import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

// --- Client SDK (for Firebase Auth: signIn, createUser) ---
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID
};

const clientApp = initializeClientApp(firebaseConfig);
export const auth = getAuth(clientApp);

// --- Admin SDK (for Firestore: bypasses security rules) ---
const __dirname = dirname(fileURLToPath(import.meta.url));
const serviceAccountPath = resolve(__dirname, '../serviceAccountKey.json');

let adminApp;

if (process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) {
  const privateKey = process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n');
  adminApp = admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: privateKey,
    }),
    projectId: process.env.FIREBASE_PROJECT_ID,
  });
  console.log('✅ Firebase Admin SDK initialized with environment variables');
} else if (existsSync(serviceAccountPath)) {
  const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));
  adminApp = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: process.env.FIREBASE_PROJECT_ID,
  });
  console.log('✅ Firebase Admin SDK initialized with service account key');
} else {
  // Fallback: try without explicit credentials (works on Google Cloud, or with GOOGLE_APPLICATION_CREDENTIALS env var)
  try {
    adminApp = admin.initializeApp({
      credential: admin.credential.applicationDefault(),
      projectId: process.env.FIREBASE_PROJECT_ID,
    });
    console.log('✅ Firebase Admin SDK initialized with application default credentials');
  } catch (e) {
    console.error('❌ Could not initialize Firebase Admin SDK. Please add serviceAccountKey.json to the backend/ directory.');
    console.error('   Download it from: Firebase Console → Project Settings → Service Accounts → Generate New Private Key');
    process.exit(1);
  }
}

export const db = adminApp.firestore();
