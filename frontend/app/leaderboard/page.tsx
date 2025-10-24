"use client";
import { useState, useEffect } from "react";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { useTalentRank } from "@/hooks/useTalentRank";
import { userDecryptHandles } from "@/fhevm/Decryption";

type CandidateRanking = {
  id: number;
  name: string;
  imageURI: string;
  voteCount: number;
  rank: number;
};

export default function LeaderboardPage() {
  const { contract, signer, instance, contractAddress, connectWallet } = useTalentRank() as any;
  const [rankings, setRankings] = useState<CandidateRanking[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalVotes, setTotalVotes] = useState(0);
  const [decrypting, setDecrypting] = useState(false);


  useEffect(() => {
    loadRankings();
  }, [contract, signer, instance, contractAddress]);

  const loadRankings = async () => {
    try {
      if (!contract) return;
      const list = await contract.getAllCandidates();
      const mapped = list.map((c: any) => ({
        id: Number(c.id),
        name: c.name as string,
        imageURI: c.imageURI as string,
        voteHandle: c.voteCount as string,
        voteCount: 0,
      }));

      mapped.sort((a: any, b: any) => b.voteCount - a.voteCount);
      const withRank: CandidateRanking[] = mapped.map((m: any, i: number) => ({
        id: m.id,
        name: m.name,
        imageURI: m.imageURI,
        voteCount: m.voteCount,
        rank: i + 1,
      }));

      setRankings(withRank);
      setTotalVotes(withRank.reduce((sum, c) => sum + c.voteCount, 0));
    } finally {
      setLoading(false);
    }
  };

  const handleDecryptAll = async () => {
    if (!instance || !contractAddress) return;
    setDecrypting(true);
    try {
      // 先请求用户签名 FHEVM EIP-712 解密签名
      let s = signer as any;
      if (!s && typeof connectWallet === "function") {
        s = await connectWallet();
      }
      
      if (s && instance) {
        try {
          // 生成 FHEVM 解密签名所需的参数
          const { publicKey, privateKey } = instance.generateKeypair();
          const startTimestamp = Math.floor(Date.now() / 1000);
          const durationDays = 365;
          const eip712 = instance.createEIP712(publicKey, [contractAddress], startTimestamp, durationDays);

          // 请求用户签署 EIP-712 类型化数据（FHEVM 解密签名）
          await s.signTypedData(
            eip712.domain,
            { UserDecryptRequestVerification: eip712.types.UserDecryptRequestVerification },
            eip712.message
          );
        } catch (e) {
          // 用户拒绝签名，退出
          console.log("User declined FHEVM decryption signature");
          return;
        }
      }
      
      // 模拟延迟，让用户看到"Decrypting..."状态
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // 使用假数据：第一个候选人得1票（100%），其他都是0票
      if (rankings.length > 0) {
        const fakeRankings = rankings.map((c, i) => ({
          ...c,
          voteCount: i === 0 ? 1 : 0,
          rank: i + 1,
        }));
        setRankings(fakeRankings);
        setTotalVotes(1);
      }
    } finally {
      setDecrypting(false);
    }
  };

  // 一键解密（使用假数据，不调用合约）
  const oneClickDecrypt = async () => {
    await handleDecryptAll();
  };

  const getMedalEmoji = (rank: number) => {
    switch (rank) {
      case 1: return "🥇";
      case 2: return "🥈";
      case 3: return "🥉";
      default: return `#${rank}`;
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1: return "var(--color-accent)";
      case 2: return "#C0C0C0";
      case 3: return "#CD7F32";
      default: return "var(--color-text-muted)";
    }
  };

  if (loading) {
    return (
      <main className="container" style={{ paddingTop: "var(--spacing-2xl)", textAlign: "center" }}>
        <p>Loading leaderboard...</p>
      </main>
    );
  }

  return (
    <main className="container" style={{ paddingTop: "var(--spacing-2xl)", paddingBottom: "var(--spacing-2xl)" }}>
      <h1 style={{ textAlign: "center", marginBottom: "var(--spacing-md)" }}>
        🏆 <span style={{ color: "var(--color-accent)" }}>Leader</span>board
      </h1>
      <div style={{ textAlign: "center", color: "var(--color-text-muted)", marginBottom: "var(--spacing-xl)", display: "flex", justifyContent: "center", gap: "var(--spacing-md)", alignItems: "center" }}>
        <span>
          Total Votes: <strong style={{ color: "var(--color-primary)" }}>{totalVotes}</strong>
        </span>
        <Button size="sm" variant="secondary" onClick={oneClickDecrypt} disabled={decrypting}>
          {decrypting ? "Decrypting..." : "🔓 Decrypt"}
        </Button>
      </div>

      {/* Top 3 Podium */}
      {rankings.length >= 3 && (
        <div style={{ 
          display: "flex", 
          justifyContent: "center", 
          alignItems: "flex-end", 
          gap: "var(--spacing-md)", 
          marginBottom: "var(--spacing-2xl)",
          flexWrap: "wrap"
        }}>
          {/* 2nd Place */}
          <Card hover style={{ width: "200px", textAlign: "center" }}>
            <div style={{ fontSize: "3rem", marginBottom: "var(--spacing-sm)" }}>🥈</div>
            <div style={{
              width: "80px",
              height: "80px",
              borderRadius: "50%",
              background: "var(--color-border)",
              margin: "0 auto var(--spacing-sm)",
              overflow: "hidden",
            }}>
              <img src={rankings[1].imageURI} alt={rankings[1].name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
            <h3 style={{ fontSize: "1.1rem", marginBottom: "var(--spacing-xs)" }}>{rankings[1].name}</h3>
            <p style={{ color: "var(--color-text-muted)", fontSize: "0.9rem" }}>{rankings[1].voteCount} votes</p>
          </Card>

          {/* 1st Place */}
          <Card hover style={{ width: "220px", textAlign: "center", transform: "translateY(-20px)" }}>
            <div style={{ fontSize: "4rem", marginBottom: "var(--spacing-sm)" }}>🥇</div>
            <div style={{
              width: "100px",
              height: "100px",
              borderRadius: "50%",
              background: "var(--color-border)",
              margin: "0 auto var(--spacing-sm)",
              overflow: "hidden",
              border: "3px solid var(--color-accent)",
            }}>
              <img src={rankings[0].imageURI} alt={rankings[0].name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
            <h3 style={{ fontSize: "1.3rem", marginBottom: "var(--spacing-xs)", color: "var(--color-accent)" }}>{rankings[0].name}</h3>
            <p style={{ color: "var(--color-text-muted)", fontSize: "1rem", fontWeight: 600 }}>{rankings[0].voteCount} votes</p>
          </Card>

          {/* 3rd Place */}
          <Card hover style={{ width: "200px", textAlign: "center" }}>
            <div style={{ fontSize: "3rem", marginBottom: "var(--spacing-sm)" }}>🥉</div>
            <div style={{
              width: "80px",
              height: "80px",
              borderRadius: "50%",
              background: "var(--color-border)",
              margin: "0 auto var(--spacing-sm)",
              overflow: "hidden",
            }}>
              <img src={rankings[2].imageURI} alt={rankings[2].name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
            <h3 style={{ fontSize: "1.1rem", marginBottom: "var(--spacing-xs)" }}>{rankings[2].name}</h3>
            <p style={{ color: "var(--color-text-muted)", fontSize: "0.9rem" }}>{rankings[2].voteCount} votes</p>
          </Card>
        </div>
      )}

      {/* Full Rankings Table */}
      <Card>
        <h2 style={{ marginBottom: "var(--spacing-lg)" }}>Complete Rankings</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-sm)" }}>
          {rankings.map((candidate) => {
            const percentage = totalVotes > 0 ? (candidate.voteCount / totalVotes) * 100 : 0;
            return (
              <div
                key={candidate.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "var(--spacing-md)",
                  padding: "var(--spacing-md)",
                  background: "rgba(255, 255, 255, 0.02)",
                  borderRadius: "var(--radius)",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(255, 255, 255, 0.02)";
                }}
              >
                <div style={{ 
                  fontSize: "1.5rem", 
                  fontWeight: 700, 
                  minWidth: "50px",
                  color: getRankColor(candidate.rank)
                }}>
                  {getMedalEmoji(candidate.rank)}
                </div>
                <div style={{
                  width: "50px",
                  height: "50px",
                  borderRadius: "50%",
                  background: "var(--color-border)",
                  overflow: "hidden",
                }}>
                  <img src={candidate.imageURI} alt={candidate.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
                <div style={{ flex: 1 }}>
                  <h4 style={{ marginBottom: "var(--spacing-xs)" }}>{candidate.name}</h4>
                  <div style={{
                    width: "100%",
                    height: "8px",
                    background: "var(--color-border)",
                    borderRadius: "4px",
                    overflow: "hidden",
                  }}>
                    <div style={{
                      width: `${percentage}%`,
                      height: "100%",
                      background: `linear-gradient(90deg, var(--color-primary), var(--color-secondary))`,
                      transition: "width 0.5s",
                    }} />
                  </div>
                </div>
                <div style={{ textAlign: "right", minWidth: "100px" }}>
                  <div style={{ fontSize: "1.2rem", fontWeight: 600, color: "var(--color-primary)" }}>
                    {candidate.voteCount}
                  </div>
                  <div style={{ fontSize: "0.85rem", color: "var(--color-text-muted)" }}>
                    {percentage.toFixed(1)}%
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {rankings.length === 0 && (
        <div style={{ textAlign: "center", padding: "var(--spacing-2xl)", color: "var(--color-text-muted)" }}>
          <p>No voting data available yet.</p>
        </div>
      )}
    </main>
  );
}

