import { Cairo } from "next/font/google";
import "./globals.css";

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic", "latin"],
  weight: ["400", "600", "700", "900"],
});

export const metadata = {
  title: "بصيرة - لعبة الأسئلة",
  description: "لعبة أسئلة وأجوبة ممتعة بطابع إسلامي على نمط من سيربح المليون",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl" className={`${cairo.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="min-h-full flex flex-col font-arabic" suppressHydrationWarning>{children}</body>
    </html>
  );
}
