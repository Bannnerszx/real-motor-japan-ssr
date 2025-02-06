// pages/_app.js
import Head from 'next/head';

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>Real Motor Japan</title>
        
      </Head>
      <Component {...pageProps} />
    </>
  );
}

export default MyApp;
