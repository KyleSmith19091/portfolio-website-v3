import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"
import localFont from "next/font/local";
import 'katex/dist/katex.min.css';
import "./globals.css";
import ClientLayout from "./client-layout";

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

export const metadata: Metadata = {
  title: "Kyle Smith - Software Engineer & AI Researcher",
  description: "Portfolio of Kyle Smith, exploring machine learning, transformers, and software engineering.",
  metadataBase: new URL("https://kylesmith.space"),
  openGraph: {
    title: "Kyle Smith - Software Engineer & Researcher",
    description: "Portfolio of Kyle Smith, exploring machine learning, transformers, and software engineering.",
    url: "https://kylesmith.space",
    siteName: "Kyle Smith Portfolio",
    images: [
      {
        url: "https://kylesmith.space/images/me2.png",
        width: 1200,
        height: 630,
        alt: "Kyle Smith",
      },
    ],
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Kyle Smith - Software Engineer & AI Researcher",
    description: "Portfolio of Kyle Smith, exploring machine learning, transformers, and software engineering.",
    images: ["https://kylesmith.space/images/me1.jpg"],
  },
  keywords: ["Kyle Smith", "software engineer", "AI researcher", "machine learning", "transformers", "portfolio"],
  authors: [{ name: "Kyle Smith" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="en">
      <body
        className={`${futura.className} antialiased min-h-screen m-0`}
      >
        <ClientLayout>
          {children}
        </ClientLayout>
        <Analytics/>
        <SpeedInsights/>
      </body>
    </html>
  );
}
