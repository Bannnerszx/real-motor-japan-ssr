// pages/_app.js
import Head from 'next/head';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { AuthProvider } from '../apiContext/AuthProvider';
import { initializeAppCheckIfNeeded } from '../firebaseConfig/initAppCheck';
import '../assets/reactimage.css';
import '../headerComponents/homeHeaderStyle.css';
function MyApp({ Component, pageProps }) {
  const [isAppCheckReady, setIsAppCheckReady] = useState(false);

  useEffect(() => {
    async function initAppCheck() {
      await initializeAppCheckIfNeeded();
      setIsAppCheckReady(true);
    }
    initAppCheck();
  }, []);
  return (
    <>
      <AuthProvider>
        <Component {...pageProps} />
      </AuthProvider>
    </>
  );
}

export default MyApp;
