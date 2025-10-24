"use client";
import { useState, useEffect } from "react";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import Image from "next/image";
import { useTalentRank } from "@/hooks/useTalentRank";
import { ErrorNotDeployed } from "@/components/ErrorNotDeployed";
import { TalentRankVotingAddresses } from "@/abi/TalentRankVotingAddresses";

type Candidate = {
  id: number;
  name: string;
  description: string;
  imageURI: string;
  voteCountHandle?: string;
  clearVotes?: number;
};

export default function CandidatesPage() {
  const { contract, refreshCandidates, vote, isDeployed, chainId, decryptHandles, decryptPublic, contractAddress } = useTalentRank() as any;
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState<number | null>(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [decrypting, setDecrypting] = useState<number | null>(null);

  useEffect(() => {
    loadCandidates();
    checkVotingStatus();
  }, [contract]);

  const loadCandidates = async () => {
    if (!contract) { setLoading(false); return; }
    try {
      const list = await refreshCandidates();
      const mapped = list.map((c: any) => ({
        id: Number(c.id),
        name: c.name as string,
        description: c.description as string,
        imageURI: c.imageURI as string,
        voteCountHandle: c.voteCount as string,
      }));
      setCandidates(mapped);
    } finally {
      setLoading(false);
    }
  };

  const checkVotingStatus = async () => {
    try {
      // best-effort: display state after voting
      setHasVoted(false);
    } catch {}
  };

  const handleVote = async (candidateId: number) => {
    if (hasVoted) {
      alert("You have already voted!");
      return;
    }

    setVoting(candidateId);
    try {
      await vote(candidateId);
      alert("Vote submitted successfully!");
      setHasVoted(true);
    } catch (error) {
      console.error("Error voting:", error);
      alert("Failed to vote. Please try again.");
    } finally {
      setVoting(null);
    }
  };

  const handleDecryptVotes = async (candidateId: number, handle?: string) => {
    if (!handle || !contractAddress) return;
    setDecrypting(candidateId);
    try {
      // 优先使用公共解密
      let n: number | undefined = undefined;
      const pub = await decryptPublic(handle);
      if (typeof pub !== "undefined") {
        n = typeof pub === "bigint" ? Number(pub) : Number(pub as any);
      } else {
        const res = await decryptHandles([{ handle, contractAddress }]);
        const v = res[handle];
        n = typeof v === "bigint" ? Number(v) : Number(v as any);
      }
      setCandidates(prev => prev.map(c => c.id === candidateId ? { ...c, clearVotes: Number.isFinite(n) ? n : undefined } : c));
    } catch {}
    setDecrypting(null);
  };

  if (loading) {
    return (
      <main className="container" style={{ paddingTop: "var(--spacing-2xl)", textAlign: "center" }}>
        <p>Loading candidates...</p>
      </main>
    );
  }

  if (!isDeployed) {
    const entry = (TalentRankVotingAddresses as any)[String(chainId ?? "")] as any;
    const chainName = entry?.chainName ?? `chain ${chainId ?? "unknown"}`;
    return (
      <main className="container" style={{ paddingTop: "var(--spacing-2xl)", paddingBottom: "var(--spacing-2xl)" }}>
        <ErrorNotDeployed chainName={chainName} />
      </main>
    );
  }

  return (
    <main className="container" style={{ paddingTop: "var(--spacing-2xl)", paddingBottom: "var(--spacing-2xl)" }}>
      <h1 style={{ textAlign: "center", marginBottom: "var(--spacing-md)" }}>
        <span style={{ color: "var(--color-primary)" }}>Meet</span> the Candidates
      </h1>
      <p style={{ textAlign: "center", color: "var(--color-text-muted)", marginBottom: "var(--spacing-2xl)", maxWidth: 600, margin: "0 auto var(--spacing-2xl)" }}>
        Vote for your favorite candidate. Each wallet can vote only once.
      </p>

      {hasVoted && (
        <div style={{
          background: "rgba(16, 185, 129, 0.1)",
          border: "1px solid var(--color-success)",
          borderRadius: "var(--radius)",
          padding: "var(--spacing-md)",
          marginBottom: "var(--spacing-xl)",
          textAlign: "center",
          color: "var(--color-success)",
        }}>
          ✓ You have already cast your vote
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "var(--spacing-xl)" }}>
        {candidates.map((candidate) => (
          <Card key={candidate.id} hover>
            <div style={{ 
              width: "100%", 
              height: "300px", 
              background: "var(--color-border)",
              borderRadius: "var(--radius)",
              marginBottom: "var(--spacing-md)",
              overflow: "hidden",
              position: "relative",
            }}>
              {candidate.imageURI && (
                <img 
                  src={candidate.imageURI} 
                  alt={candidate.name}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              )}
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
              <h3 style={{ color: "var(--color-primary)", marginBottom: "var(--spacing-sm)" }}>
                {candidate.name}
              </h3>
              <Button
                variant="secondary"
                onClick={() => handleDecryptVotes(candidate.id, candidate.voteCountHandle)}
                disabled={!candidate.voteCountHandle || decrypting === candidate.id}
              >
                {decrypting === candidate.id ? "Decrypting..." : (typeof candidate.clearVotes === "number" ? `${candidate.clearVotes}` : "Decrypt votes")}
              </Button>
            </div>
            <p style={{ color: "var(--color-text-muted)", marginBottom: "var(--spacing-md)", minHeight: "60px" }}>
              {candidate.description}
            </p>
            <Button 
              variant="primary" 
              fullWidth
              onClick={() => handleVote(candidate.id)}
              disabled={hasVoted || voting !== null}
            >
              {voting === candidate.id ? "Voting..." : hasVoted ? "Already Voted" : "Vote"}
            </Button>
          </Card>
        ))}
      </div>

      {candidates.length === 0 && (
        <div style={{ textAlign: "center", padding: "var(--spacing-2xl)", color: "var(--color-text-muted)" }}>
          <p>No candidates registered yet.</p>
        </div>
      )}
    </main>
  );
}
