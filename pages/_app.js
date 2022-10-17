import "../styles/globals.css";
import { SWRConfig } from "swr";
import { fetcher } from "../internals/fetcher";
import { SessionProvider } from "next-auth/react";

function MyApp({ Component, pageProps: { session, ...pageProps } }) {
  return (
    <SWRConfig value={{ fetcher }}>
      <SessionProvider session={session}>
        <Component {...pageProps} />
      </SessionProvider>
    </SWRConfig>
  );
}

export default MyApp;
