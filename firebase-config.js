// 請到 Firebase Console -> 專案設定 -> 您的應用程式 (Web) 複製 firebaseConfig 貼到下方
// 貼上並 push 到 GitHub 後，Vercel 會自動重新部署並啟用 Google 登入與 Firestore 共編功能

export const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.firebasestorage.app",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
