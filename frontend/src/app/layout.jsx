import { Inter, Poppins } from "next/font/google";
import "../index.css";
import { Providers } from "./providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-poppins",
});

export const metadata = {
  title: "Morla Coffee Shop",
  description: "Premium coffee shop experience with customer ordering and admin operations.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${poppins.variable} min-h-screen bg-background text-foreground antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
