
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAlvRBErv2pG8BObnX8Ew0CqOQKypTM39c",
  authDomain: "controle-612f2.firebaseapp.com",
  databaseURL: "https://controle-612f2-default-rtdb.firebaseio.com",
  projectId: "controle-612f2",
  storageBucket: "controle-612f2.firebasestorage.app",
  messagingSenderId: "39791655795",
  appId: "1:39791655795:web:1b6ad76afa568af3b86306",
  measurementId: "G-7X9S01NMWX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
