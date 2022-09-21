import "../styles/globals.css";
import { SWRConfig } from "swr";
import { fetcher } from "../internals/fetcher";

// initialize Firebase here for the rest of the app's components to use after they load in
import { initializeApp, getApps, getApp } from "firebase/app";
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// https://stackoverflow.com/questions/43331011/firebase-app-named-default-already-exists-app-duplicate-app
// https://stackoverflow.com/questions/37652328/how-to-check-if-a-firebase-app-is-already-initialized-on-android/41005100#41005100
getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

import { AuthUserProvider } from "../firebase/app/AuthUserContext";

function MyApp({ Component, pageProps }) {
  return (
    <SWRConfig value={{ fetcher }}>
      <AuthUserProvider>
        <Component {...pageProps} />
      </AuthUserProvider>
    </SWRConfig>
  );
}

export default MyApp;
