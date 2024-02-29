//import { Inter } from "next/font/google";
import "./globals.css";

//const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Monaco Next.js app",
  description: "A simple cloud IDE that deploys and runs user written code.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
