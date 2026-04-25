/* ============================================
   MindBloom — Firebase Configuration
   ============================================
   SETUP INSTRUCTIONS:
   1. Go to https://console.firebase.google.com
   2. Create a new project named "MindBloom"
   3. Add a Web App ( </> icon )
   4. Copy your firebaseConfig object below
   5. Enable Authentication → Email/Password + Google
   6. Enable Firestore Database (Start in test mode)
   ============================================ */

const firebaseConfig = {
  apiKey: "AIzaSyATd6O-WuPXnJ-Z_f2bz-duFP8cCXV_GMo",
  authDomain: "mindbloom-94760.firebaseapp.com",
  projectId: "mindbloom-94760",
  storageBucket: "mindbloom-94760.firebasestorage.app",
  messagingSenderId: "678825511352",
  appId: "1:678825511352:web:e287c22330c6953dff274d"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

window.db   = firebase.firestore();
window.auth = firebase.auth();

// Enable offline persistence (works offline like localStorage)
firebase.firestore().enablePersistence({ synchronizeTabs: true })
  .catch(err => console.warn('Offline persistence error:', err.code));
