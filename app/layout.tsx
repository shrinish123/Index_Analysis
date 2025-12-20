import type { Metadata } from "next";
import { Nunito_Sans } from "next/font/google";
import "./globals.css";
import 'bootstrap/dist/css/bootstrap.min.css';
import AppNavbar from "@/components/Navbar";

const nunito = Nunito_Sans({ 
  subsets: ["latin"],
  weight: ["200", "600"],
  variable: '--font-nunito'
});

export const metadata: Metadata = {
  title: "Sicomoro",
  description: "Index Analysis Dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={nunito.className}>
        <AppNavbar />
        <div className="container-fluid mt-3">
          {children}
        </div>
      </body>
    </html>
  );
}
