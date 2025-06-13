import type { Metadata } from "next";
import localFont from "next/font/local";
import 'katex/dist/katex.min.css';
import "./globals.css";
import Cursor, { Reticule } from "@/components/cursor";
import Providers from "./providers";

const futura = localFont({
  src: [
    {
      path: '../../public/fonts/FuturaCyrillicBold.ttf',
      weight: '700',
      style: 'bold'
    },
    {
      path: '../../public/fonts/FuturaCyrillicBook.ttf',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../../public/fonts/FuturaCyrillicDemi.ttf',
      weight: '600',
      style: 'normal',
    },
    {
      path: '../../public/fonts/FuturaCyrillicExtraBold.ttf',
      weight: '900',
      style: 'bold',
    },
    {
      path: '../../public/fonts/FuturaCyrillicHeavy.ttf',
      weight: '750',
      style: 'bold',
    },
    {
      path: '../../public/fonts/FuturaCyrillicLight.ttf',
      weight: '750',
      style: 'normal',
    },
    {
      path: '../../public/fonts/FuturaCyrillicMedium.ttf',
      weight: '500',
      style: 'normal',
    },
  ],
})

const metadata: Metadata = {
  title: "Kyle Smith Portfolio",
  description: "Kyle Smith Portfolio",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="en">
      <head>
        <title>Kyle Smith Portfolio</title>
        <meta name="description" content="Kyle Smith Portfolio" />
      </head>
      <body
        className={`${futura.className} antialiased min-h-screen m-0`}
      >
        <Providers>
          <Cursor />
          <Reticule />
          {children}
        </Providers>
      </body>
    </html>
  );
}
