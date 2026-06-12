import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Smart Checkout Kasir Mandiri AI",
  description: "Sistem kasir ritel otomatis dengan deteksi produk real-time",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
