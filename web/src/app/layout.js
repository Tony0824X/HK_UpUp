import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata = {
  title: "HK UpUp – 香港學生比賽平台",
  description:
    "整合香港學生比賽資訊，用 AI 幫你配對最適合的比賽。把課堂 Project 變成獎項，讓努力被看見。",
  keywords: "香港, 比賽, 學生, 大學, STEAM, 創新, AI, hackathon, competition",
  openGraph: {
    title: "HK UpUp – 香港學生比賽平台",
    description: "整合香港學生比賽資訊，用 AI 幫你配對最適合的比賽。",
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="zh-Hant">
      <body className={inter.variable}>
        {/* Background effects */}
        <div className="bg-grid" aria-hidden="true" />
        <div className="bg-glow" aria-hidden="true" />
        {children}
      </body>
    </html>
  );
}
