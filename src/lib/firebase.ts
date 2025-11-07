import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCmH5_zPWue9yTmqSaDPxI8jqlwtLsqOwQ",
  authDomain: "dashboard-d9644.firebaseapp.com",
  databaseURL: "https://dashboard-d9644-default-rtdb.firebaseio.com",
  projectId: "dashboard-d9644",
  storageBucket: "dashboard-d9644.firebasestorage.app",
  messagingSenderId: "85330718377",
  appId: "1:85330718377:web:5b2c53acc54bd9cc7443b8",
  measurementId: "G-BWSJMXZ3KY"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const database = getDatabase(app);

export default app;
