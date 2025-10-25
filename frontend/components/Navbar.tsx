"use client";
import Link from "next/link";
import { ConnectWalletButton } from "./ConnectWalletButton";

export const Navbar = () => {
  return (
    <nav
      style={{
        borderBottom: "1px solid var(--color-border)",
        background: "rgba(10, 10, 10, 0.8)",
        backdropFilter: "blur(10px)",
        position: "sticky",
        top: 0,
        zIndex: 50,
      }}
    >
      <div
        className="container"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "var(--spacing-lg)",
        }}
      >
        <Link href="/" style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--color-text)" }}>
          ⭐ <span style={{ color: "var(--color-primary)" }}>Talent</span>Rank
        </Link>
        <div style={{ display: "flex", gap: "var(--spacing-lg)", alignItems: "center" }}>
          <Link href="/candidates" style={{ fontWeight: 500, color: "var(--color-text)" }}>
            Candidates
          </Link>
          <Link href="/leaderboard" style={{ fontWeight: 500, color: "var(--color-text)" }}>
            Leaderboard
          </Link>
          <Link href="/myvote" style={{ fontWeight: 500, color: "var(--color-text)" }}>
            My Vote
          </Link>
          <Link href="/admin" style={{ fontWeight: 500, color: "var(--color-text)" }}>
            Admin
          </Link>
          <ConnectWalletButton />
        </div>
      </div>
    </nav>
  );
};

