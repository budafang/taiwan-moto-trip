# 🛵 台灣環島 5天4夜｜機車旅遊共編網站

從台北世新大學出發的機車環台規劃網站，支援 **Google 帳號登入** 與 **Cloud Firestore 即時共編**，可分享連結給同學一起編輯行程、住宿與花費記錄。

- 線上網站：https://taiwan-moto-trip.vercel.app

---

## 🔧 啟用 Firebase 後端（Google 登入 + Firestore 共編）設定步驟

1. 前往 [Firebase Console](https://console.firebase.google.com/) 建立新專案。
2. **啟用 Google 登入**：
   - 左側選單 **Authentication** → **Sign-in method** → 啟用 **Google**。
   - 前往 **Authentication** → **Settings** → **Authorized domains**，新增你的 Vercel 網域：
     `taiwan-moto-trip.vercel.app`
3. **建立 Firestore 資料庫**：
   - 左側選單 **Firestore Database** → 建立資料庫。
   - 在 **規則 (Rules)** 分頁貼上本專案 [firestore.rules](firestore.rules) 的內容並發布（限制必須登入 Google 帳號才能寫入）。
4. **填入 Firebase 設定**：
   - 在專案設定中新增「網頁應用程式 (`</>`)」，複製 `firebaseConfig`。
   - 貼入 [firebase-config.js](firebase-config.js) 並 `git push` 到 GitHub，Vercel 就會自動部署完成！
