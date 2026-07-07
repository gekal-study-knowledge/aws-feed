import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';

// Firebase Web SDK 設定。
// これらの値はクライアントバンドルに埋め込まれる公開情報であり、秘匿する必要はない。
// セキュリティは Firestore ルールと Firebase Auth の認可ドメインで担保される。
// 環境変数 (.env.local / GitHub Actions) があればそちらを優先し、無ければ公開値にフォールバックする。
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? 'AIzaSyA7A5ttp348LjdvH4HEUoz92b5b6O4OO28',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? 'aws-feed.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? 'aws-feed',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? 'aws-feed.firebasestorage.app',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? '371594875683',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? '1:371594875683:web:6659fc2138093ac2867296',
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID ?? 'G-YWNJ2HK1B7',
};

// Next.js の Fast Refresh / SSR で多重初期化されないようにする
const app: FirebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth: Auth = getAuth(app);
export const db: Firestore = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

export default app;
