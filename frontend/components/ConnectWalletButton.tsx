"use client";
import React, { useState, useEffect } from "react";
import { Button } from "./Button";

export const ConnectWalletButton: React.FC = () => {
  const [account, setAccount] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    if (typeof window.ethereum !== "undefined") {
      try {
        const accounts = await window.ethereum.request({ method: "eth_accounts" });
        if (accounts.length > 0) {
          setAccount(accounts[0]);
        }
      } catch (error) {
        console.error("Error checking connection:", error);
      }
    }
  };

  const connectWallet = async () => {
    if (typeof window.ethereum === "undefined") {
      alert("Please install MetaMask!");
      return;
    }

    setIsConnecting(true);
    try {
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      setAccount(accounts[0]);
    } catch (error) {
      console.error("Error connecting wallet:", error);
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
  };

  if (account) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-sm)" }}>
        <div
          style={{
            padding: "0.5rem 1rem",
            background: "rgba(16, 185, 129, 0.1)",
            border: "1px solid var(--color-success)",
            borderRadius: "var(--radius)",
            fontSize: "0.875rem",
            color: "var(--color-success)",
          }}
        >
          {account.slice(0, 6)}...{account.slice(-4)}
        </div>
        <Button variant="ghost" size="sm" onClick={disconnectWallet}>
          Disconnect
        </Button>
      </div>
    );
  }

  return (
    <Button variant="primary" size="md" onClick={connectWallet} disabled={isConnecting}>
      {isConnecting ? "Connecting..." : "Connect Wallet"}
    </Button>
  );
};

