/**
 * Firebase Configuration for Moksh
 * Syncs assignments and progress across devices
 */

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getFirestore, doc, getDoc, setDoc, onSnapshot } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

const firebaseConfig = {
  apiKey: "AIzaSyCywiqsRcjkJP0j-moVw7HLRYSHV_aq_mo",
  authDomain: "moksh-784.firebaseapp.com",
  projectId: "moksh-784",
  storageBucket: "moksh-784.firebasestorage.app",
  messagingSenderId: "870322846427",
  appId: "1:870322846427:web:d6554d525989ab52e7eafe"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Family ID - simple shared key for this family
const FAMILY_ID = 'chandan-family';

// Export for use in storage.js
window.MokshFirebase = {
  db,
  doc,
  getDoc,
  setDoc,
  onSnapshot,
  FAMILY_ID,

  // Save data to Firestore
  async saveToCloud(data) {
    try {
      await setDoc(doc(db, 'families', FAMILY_ID), {
        assignments: data.assignments || {},
        profiles: data.profiles || {},
        updatedAt: new Date().toISOString()
      });
      console.log('Synced to cloud');
      return true;
    } catch (error) {
      console.error('Cloud sync failed:', error);
      return false;
    }
  },

  // Load data from Firestore
  async loadFromCloud() {
    try {
      const docSnap = await getDoc(doc(db, 'families', FAMILY_ID));
      if (docSnap.exists()) {
        return docSnap.data();
      }
      return null;
    } catch (error) {
      console.error('Cloud load failed:', error);
      return null;
    }
  },

  // Listen for real-time updates
  listenForUpdates(callback) {
    return onSnapshot(doc(db, 'families', FAMILY_ID), (docSnap) => {
      if (docSnap.exists()) {
        callback(docSnap.data());
      }
    });
  }
};

console.log('Firebase initialized for Moksh');
