// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"
import { getDatabase } from "firebase/database"
import { CLIENT_ENV } from "./env"

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: CLIENT_ENV.FIREBASE_API_KEY,
  authDomain: CLIENT_ENV.FIREBASE_AUTH_DOMAIN,
  databaseURL: CLIENT_ENV.FIREBASE_DATABASE_URL,
  projectId: CLIENT_ENV.FIREBASE_PROJECT_ID,
  storageBucket: CLIENT_ENV.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: CLIENT_ENV.FIREBASE_MESSAGING_SENDER_ID,
  appId: CLIENT_ENV.FIREBASE_APP_ID,
  measurementId: CLIENT_ENV.FIREBASE_MEASUREMENT_ID,
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app)

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app)

// Initialize Realtime Database and get a reference to the service
export const rtdb = getDatabase(app)

export default app
