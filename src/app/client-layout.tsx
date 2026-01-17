"use client"

import Cursor, { Reticule } from "@/components/cursor";
import Providers from "./providers";

export default function ClientLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Providers>
      <Cursor />
      <Reticule />
      {children}
    </Providers>
  );
}
