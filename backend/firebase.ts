// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import * as firebase from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import 'firebase/firestore';
import "firebase/compat/storage";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA30uf_3kS67qpMFedLAD9kguvUhcHQ6UU",
  authDomain: "to-do-a93f5.firebaseapp.com",
  projectId: "to-do-a93f5",
  storageBucket: "to-do-a93f5.appspot.com",
  messagingSenderId: "878978812101",
  appId: "1:878978812101:web:d49bff361613b97cd788ac"
};
const app=initializeApp(firebaseConfig)

// Initialize Firebase

export const db = getFirestore(app);
