import React from "react";
import { Navbar } from "@/components/Navbar";
import "./globals.css";

export const metadata = {
  title: "TalentRank Voting",
  description: "Talent ranking and voting dApp with encrypted votes",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        {children}
      </body>
    </html>
  );
}


