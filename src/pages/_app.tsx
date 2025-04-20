import type { AppProps } from "next/app";
import "@/styles/globals.css";  // Make sure this matches your actual global.css path

export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}