import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { IBM_Plex_Sans } from "next/font/google";
import Sidebar from "@/components/Sidebar";

const IBMPlex = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-ibm-plex",
});

export const metadata = {
  title: "PantryPal",
  description: "AI-powered pantry management and recipe generator",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider appearance={{ variables: { colorPrimary: "#624cf5" } }}>
      <html lang="en">
        <body className={`font-IBMPlex antialiased ${IBMPlex.variable}`}>
          <div className="flex">
            <Sidebar />
            <main className="flex-1 lg:ml-64 lg:p-5">{children}</main>
          </div>
        </body>
      </html>
    </ClerkProvider>
  );
}
