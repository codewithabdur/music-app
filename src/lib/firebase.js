import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getMessaging } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyCOlQAG3xArfaRS8kRqzY-VNmXpd-Phpd0",
  authDomain: "music-app-c9bc5.firebaseapp.com",
  databaseURL: "https://music-app-c9bc5-default-rtdb.firebaseio.com",
  projectId: "music-app-c9bc5",
  storageBucket: "music-app-c9bc5.appspot.com",
  messagingSenderId: "856513041802",
  appId: "1:856513041802:web:2f4afdb8938693eebbe473",
  measurementId: "G-P4KQFQKM37",
};




export const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

export const messaging = getMessaging(app);

export { db, auth, storage  };
