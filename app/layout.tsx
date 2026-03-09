import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Lavendrie Laundry",
  description: "Aplikasi laundry sederhana untuk memudahkan pelanggan dalam membuat order dan melihat riwayat order mereka.",
  viewport: "width=device-width, initial-scale=1",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
