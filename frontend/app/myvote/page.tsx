"use client";
import { useState, useEffect, useCallback } from "react";
import { Card } from "@/components/Card";
import Link from "next/link";
import { Button } from "@/components/Button";
import { useTalentRank } from "@/hooks/useTalentRank";

type VoteInfo = {
  hasVoted: boolean;
  candidateId?: number;
  candidateName?: string;
  candidateImage?: string;
  timestamp?: number;
};

export default function MyVotePage() {
  const { contract, address, contractAddress, decryptHandles, refreshCandidates } = useTalentRank() as any;
  const [voteInfo, setVoteInfo] = useState<VoteInfo>({ hasVoted: false });
  const [loading, setLoading] = useState(true);
  const [account, setAccount] = useState<string | null>(null);
  const [handle, setHandle] = useState<string | null>(null);
  const [decrypting, setDecrypting] = useState<boolean>(false);
  const [candidateVotes, setCandidateVotes] = useState<number | null>(null);
  const [authorizing, setAuthorizing] = useState<boolean>(false);

  useEffect(() => {
    checkWalletConnection();
  }, [address, contract]);

  const checkWalletConnection = async () => {
    try {
      if (address) {
        setAccount(address);
        await loadVoteInfo(address);
      } else {
        setLoading(false);
      }
    } catch {
      setLoading(false);
    }
  };

  const loadVoteInfo = async (addr: string) => {
    try {
      if (!contract) { setLoading(false); return; }
      const has = await contract.hasVoted(addr);
      if (!has) {
        setVoteInfo({ hasVoted: false });
        setLoading(false);
        return;
      }
      setVoteInfo({ hasVoted: true });
      // 获取加密句柄
      const h = await contract.getMyVoteEncrypted();
      setHandle(h as string);
      setLoading(false);
    } catch (error) {
      console.error("Error loading vote info:", error);
      setLoading(false);
    }
  };

  const authorizeAndDecrypt = useCallback(async () => {
    if (!contract || !address) return;
    setAuthorizing(true);
    try {
      // 先调用 authorizeViewer 授权当前用户查看所有候选人票数
      const tx = await contract.authorizeViewer();
      await tx.wait();
      console.log("Authorized viewer");
    } catch (e) {
      console.error("Authorization error:", e);
    } finally {
      setAuthorizing(false);
    }
  }, [contract, address]);

  const doDecrypt = useCallback(async () => {
    if (!handle || !contractAddress) return;
    setDecrypting(true);
    try {
      const res = await decryptHandles([{ handle, contractAddress }]);
      const v = res[handle];
      const candidateId = typeof v === "bigint" ? Number(v) : Number(v as any);
      if (Number.isFinite(candidateId)) {
        // 读取候选人信息
        const list = await refreshCandidates();
        const found = (list || []).find((c: any) => Number(c.id) === candidateId);
        setVoteInfo({
          hasVoted: true,
          candidateId,
          candidateName: found?.name,
          candidateImage: found?.imageURI,
          timestamp: Date.now(),
        });
        
        // 解密该候选人的票数
        if (found && found.voteCount) {
          try {
            const voteHandle = found.voteCount as string;
            const voteRes = await decryptHandles([{ handle: voteHandle, contractAddress }]);
            const voteValue = voteRes[voteHandle];
            const votes = typeof voteValue === "bigint" ? Number(voteValue) : Number(voteValue as any);
            if (Number.isFinite(votes)) {
              setCandidateVotes(votes);
            }
          } catch (e) {
            console.error("Error decrypting votes:", e);
          }
        }
      }
    } catch (e) {
      console.error("Decryption error:", e);
    } finally {
      setDecrypting(false);
    }
  }, [handle, contractAddress, decryptHandles, refreshCandidates]);

  const connectWallet = async () => {
    if (typeof window.ethereum === "undefined") {
      alert("Please install MetaMask!");
      return;
    }

    try {
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      setAccount(accounts[0]);
      await loadVoteInfo(accounts[0]);
    } catch (error) {
      console.error("Error connecting wallet:", error);
    }
  };

  if (loading) {
    return (
      <main className="container" style={{ paddingTop: "var(--spacing-2xl)", textAlign: "center" }}>
        <p>Loading...</p>
      </main>
    );
  }

  if (!account) {
    return (
      <main className="container" style={{ paddingTop: "var(--spacing-2xl)", paddingBottom: "var(--spacing-2xl)" }}>
        <div style={{ maxWidth: "500px", margin: "0 auto", textAlign: "center" }}>
          <Card>
            <div style={{ fontSize: "3rem", marginBottom: "var(--spacing-md)" }}>🔌</div>
            <h2 style={{ marginBottom: "var(--spacing-md)" }}>Connect Your Wallet</h2>
            <p style={{ color: "var(--color-text-muted)", marginBottom: "var(--spacing-lg)" }}>
              Connect your wallet to view your voting status and history.
            </p>
            <Button variant="primary" fullWidth onClick={connectWallet}>
              Connect Wallet
            </Button>
          </Card>
        </div>
      </main>
    );
  }

  return (
    <main className="container" style={{ paddingTop: "var(--spacing-2xl)", paddingBottom: "var(--spacing-2xl)" }}>
      <h1 style={{ textAlign: "center", marginBottom: "var(--spacing-md)" }}>
        🗳️ My <span style={{ color: "var(--color-primary)" }}>Vote</span>
      </h1>
      <p style={{ textAlign: "center", color: "var(--color-text-muted)", marginBottom: "var(--spacing-2xl)" }}>
        View your voting status and history
      </p>

      <div style={{ maxWidth: "600px", margin: "0 auto" }}>
        {/* Wallet Info */}
        <Card style={{ marginBottom: "var(--spacing-lg)" }}>
          <h3 style={{ marginBottom: "var(--spacing-md)" }}>Connected Wallet</h3>
          <div style={{
            background: "rgba(255, 255, 255, 0.05)",
            padding: "var(--spacing-md)",
            borderRadius: "var(--radius)",
            fontFamily: "monospace",
            fontSize: "0.9rem",
          }}>
            {account}
          </div>
        </Card>

        {/* Voting Status */}
        {voteInfo.hasVoted ? (
          <Card>
            <div style={{
              background: "rgba(16, 185, 129, 0.1)",
              border: "1px solid var(--color-success)",
              borderRadius: "var(--radius)",
              padding: "var(--spacing-md)",
              marginBottom: "var(--spacing-lg)",
              textAlign: "center",
              color: "var(--color-success)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "var(--spacing-sm)",
            }}>
              <span style={{ fontSize: "1.5rem" }}>✓</span>
              <span>You have cast your vote</span>
            </div>

            <h3 style={{ marginBottom: "var(--spacing-lg)" }}>Your Vote</h3>
            
            <div style={{ 
              display: "flex", 
              alignItems: "center", 
              gap: "var(--spacing-lg)",
              padding: "var(--spacing-lg)",
              background: "rgba(255, 255, 255, 0.02)",
              borderRadius: "var(--radius)",
              marginBottom: "var(--spacing-lg)"
            }}>
              <div style={{
                width: "100px",
                height: "100px",
                borderRadius: "50%",
                background: "var(--color-border)",
                overflow: "hidden",
                flexShrink: 0,
              }}>
                {voteInfo.candidateImage && (
                  <img 
                    src={voteInfo.candidateImage} 
                    alt={voteInfo.candidateName}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                )}
              </div>
              <div style={{ flex: 1 }}>
                <h4 style={{ color: "var(--color-primary)", marginBottom: "var(--spacing-xs)" }}>
                  {voteInfo.candidateName}
                </h4>
                <p style={{ color: "var(--color-text-muted)", fontSize: "0.9rem", marginBottom: "var(--spacing-xs)" }}>
                  Voted {voteInfo.timestamp && new Date(voteInfo.timestamp).toLocaleString()}
                </p>
                {candidateVotes !== null && (
                  <p style={{ color: "var(--color-success)", fontSize: "1rem", fontWeight: 600 }}>
                    🗳️ Total Votes: {candidateVotes}
                  </p>
                )}
              </div>
            </div>

            <div style={{
              background: "rgba(255, 255, 255, 0.05)",
              padding: "var(--spacing-md)",
              borderRadius: "var(--radius)",
              fontSize: "0.875rem",
              color: "var(--color-text-muted)",
            }}>
              <strong>Note:</strong> Your vote is encrypted on-chain and cannot be changed. Each wallet can only vote once.
            </div>
          </Card>
        ) : (
          <Card>
            <div style={{
              background: "rgba(255, 255, 255, 0.05)",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius)",
              padding: "var(--spacing-xl)",
              textAlign: "center",
            }}>
              <div style={{ fontSize: "3rem", marginBottom: "var(--spacing-md)" }}>📝</div>
              <h3 style={{ marginBottom: "var(--spacing-md)" }}>You Haven't Voted Yet</h3>
              <p style={{ color: "var(--color-text-muted)", marginBottom: "var(--spacing-lg)" }}>
                Browse the candidates and cast your vote to participate in the ranking.
              </p>
              <Link href="/candidates">
                <Button variant="primary" size="lg">
                  View Candidates
                </Button>
              </Link>
            </div>
          </Card>
        )}

        {/* Additional Info */}
        <Card style={{ marginTop: "var(--spacing-lg)" }}>
          <h3 style={{ marginBottom: "var(--spacing-md)" }}>Voting Information</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-md)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "var(--spacing-sm) 0", borderBottom: "1px solid var(--color-border)" }}>
              <span style={{ color: "var(--color-text-muted)" }}>Voting Status</span>
              <span style={{ fontWeight: 600, color: voteInfo.hasVoted ? "var(--color-success)" : "var(--color-text-muted)" }}>
                {voteInfo.hasVoted ? "Voted" : "Not Voted"}
              </span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "var(--spacing-sm) 0", borderBottom: "1px solid var(--color-border)" }}>
              <span style={{ color: "var(--color-text-muted)" }}>Votes Per Wallet</span>
              <span style={{ fontWeight: 600 }}>1</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "var(--spacing-sm) 0" }}>
              <span style={{ color: "var(--color-text-muted)" }}>Privacy 隐私</span>
              <div style={{ display: "flex", gap: "var(--spacing-sm)", alignItems: "center" }}>
                {voteInfo.hasVoted && !voteInfo.candidateId ? (
                  <>
                    <Button onClick={authorizeAndDecrypt} disabled={authorizing} variant="secondary" size="sm">
                      {authorizing ? "Authorizing..." : "1️⃣ Authorize"}
                    </Button>
                    <Button onClick={doDecrypt} disabled={decrypting || !handle}>
                      {decrypting ? "Decrypting..." : "2️⃣ Decrypt"}
                    </Button>
                  </>
                ) : voteInfo.candidateId ? (
                  <span style={{ fontWeight: 600, color: "var(--color-success)" }}>✓ Decrypted 已解密</span>
                ) : (
                  <span style={{ fontWeight: 600, color: "var(--color-primary)" }}>🔐 Encrypted 加密</span>
                )}
              </div>
            </div>
          </div>
        </Card>
      </div>
    </main>
  );
}

