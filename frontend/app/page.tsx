"use client";
import Link from "next/link";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";

export default function HomePage() {
  return (
    <main className="container" style={{ paddingTop: "var(--spacing-2xl)", paddingBottom: "var(--spacing-2xl)" }}>
      {/* Hero Section */}
      <section style={{ textAlign: "center", marginBottom: "var(--spacing-2xl)" }}>
        <h1 style={{ fontSize: "3.5rem", marginBottom: "var(--spacing-md)" }}>
          ⭐ <span style={{ color: "var(--color-primary)" }}>Talent</span>Rank <span style={{ color: "var(--color-secondary)" }}>Voting</span>
        </h1>
        <p style={{ fontSize: "1.25rem", color: "var(--color-text-muted)", maxWidth: 600, margin: "0 auto var(--spacing-xl)" }}>
          Discover talented individuals, vote with encrypted privacy, and watch the rankings unfold in real-time
        </p>
        <div style={{ display: "flex", gap: "var(--spacing-md)", justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/candidates">
            <Button variant="primary" size="lg">View Candidates</Button>
          </Link>
          <Link href="/leaderboard">
            <Button variant="secondary" size="lg">Leaderboard</Button>
          </Link>
        </div>
      </section>

      {/* Features */}
      <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "var(--spacing-lg)" }}>
        <Card>
          <div style={{ fontSize: "2.5rem", marginBottom: "var(--spacing-sm)" }}>🔐</div>
          <h3 style={{ color: "var(--color-primary)" }}>Encrypted Voting</h3>
          <p style={{ color: "var(--color-text-muted)" }}>
            Vote privately using FHEVM encryption. Your votes remain confidential while being verifiable on-chain.
          </p>
        </Card>
        <Card>
          <div style={{ fontSize: "2.5rem", marginBottom: "var(--spacing-sm)" }}>🏆</div>
          <h3 style={{ color: "var(--color-accent)" }}>Live Rankings</h3>
          <p style={{ color: "var(--color-text-muted)" }}>
            Watch the leaderboard update in real-time. Fair competition powered by blockchain technology.
          </p>
        </Card>
        <Card>
          <div style={{ fontSize: "2.5rem", marginBottom: "var(--spacing-sm)" }}>⚡</div>
          <h3 style={{ color: "var(--color-secondary)" }}>Decentralized</h3>
          <p style={{ color: "var(--color-text-muted)" }}>
            No central authority. All voting data is stored on-chain with IPFS metadata integration.
          </p>
        </Card>
      </section>

      {/* How It Works */}
      <section style={{ marginTop: "var(--spacing-2xl)" }}>
        <h2 style={{ textAlign: "center", marginBottom: "var(--spacing-xl)" }}>
          How It <span style={{ color: "var(--color-primary)" }}>Works</span>
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "var(--spacing-lg)" }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ 
              width: "60px", 
              height: "60px", 
              borderRadius: "50%", 
              background: "linear-gradient(135deg, var(--color-primary), #F472B6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.5rem",
              margin: "0 auto var(--spacing-md)"
            }}>
              1
            </div>
            <h4>Connect Wallet</h4>
            <p style={{ color: "var(--color-text-muted)", fontSize: "0.9rem" }}>
              Connect your MetaMask wallet to get started
            </p>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ 
              width: "60px", 
              height: "60px", 
              borderRadius: "50%", 
              background: "linear-gradient(135deg, var(--color-secondary), #A78BFA)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.5rem",
              margin: "0 auto var(--spacing-md)"
            }}>
              2
            </div>
            <h4>Browse Candidates</h4>
            <p style={{ color: "var(--color-text-muted)", fontSize: "0.9rem" }}>
              Explore talented individuals and their profiles
            </p>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ 
              width: "60px", 
              height: "60px", 
              borderRadius: "50%", 
              background: "linear-gradient(135deg, var(--color-accent), #FBBF24)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.5rem",
              margin: "0 auto var(--spacing-md)"
            }}>
              3
            </div>
            <h4>Cast Your Vote</h4>
            <p style={{ color: "var(--color-text-muted)", fontSize: "0.9rem" }}>
              Vote for your favorite with encrypted privacy
            </p>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ 
              width: "60px", 
              height: "60px", 
              borderRadius: "50%", 
              background: "linear-gradient(135deg, var(--color-success), #34D399)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.5rem",
              margin: "0 auto var(--spacing-md)"
            }}>
              4
            </div>
            <h4>Watch Rankings</h4>
            <p style={{ color: "var(--color-text-muted)", fontSize: "0.9rem" }}>
              See live updates on the leaderboard
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}


