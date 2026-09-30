import type { Metadata } from "next";
import "./globals.css";
import AuthProvider from "./components/auth-provider";
import { Provider } from "jotai";
import Navbar from "./components/navbar";

export const metadata: Metadata = {
  title: "GAMBLING!",
  description: "Made with NEXTjs",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Provider>
          <AuthProvider>
            <Navbar />
            <main className='flex flex-col p-4 items-center'>
              {children}
            </main>
          </AuthProvider>
        </Provider>
      </body>
    </html>
  );
}
