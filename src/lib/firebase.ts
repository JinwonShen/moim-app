/**
 * Firebase 설정 및 초기화 파일
 * - Firebase 앱을 초기화하고, 인증(auth), Firestore, Storage 인스턴스를 export 합니다.
 * - 환경 변수는 Vite의 import.meta.env를 통해 불러옵니다.
 */

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Firebase 구성 객체를 정의합니다. 환경 변수에서 값을 불러옵니다.
const firebaseConfig = {
	apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
	authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
	projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
	storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
	messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
	appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Firebase 앱을 초기화합니다.
const app = initializeApp(firebaseConfig);

// Firebase 인증 모듈을 초기화합니다.
export const auth = getAuth(app);

// Firestore 데이터베이스 모듈을 초기화합니다.
export const db = getFirestore(app);

// Firebase Storage 모듈을 초기화합니다.
export const storage = getStorage(app);
