import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyDaVS0MghioqcmFTBdwNrdV9P5Zpu2ilUs",
  authDomain: "gmash-496a9.firebaseapp.com",
  projectId: "gmash-496a9",
  storageBucket: "gmash-496a9.appspot.com",
  messagingSenderId: "131659335029",
  appId: "1:131659335029:web:d675ce7e9cbe1dba753f3c",
  measurementId: "G-X17ZEEE5DZ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
