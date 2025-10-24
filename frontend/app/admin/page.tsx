"use client";
import { useState } from "react";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { Input, TextArea } from "@/components/Input";
import { useTalentRank } from "@/hooks/useTalentRank";

export default function AdminPage() {
  const { registerCandidate, setVotingWindow } = useTalentRank() as any;
  
  // Register candidate form
  const [candidateName, setCandidateName] = useState("");
  const [candidateDescription, setCandidateDescription] = useState("");
  const [candidateImage, setCandidateImage] = useState("");
  const [registering, setRegistering] = useState(false);

  // Voting window form (only end time; start defaults to now)
  const [endTime, setEndTime] = useState("");
  

  const handleRegisterCandidate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!candidateName || !candidateDescription) {
      alert("Please fill in all required fields");
      return;
    }

    setRegistering(true);
    try {
      await registerCandidate(candidateName, candidateImage, candidateDescription);
      // If end time provided, set voting window with start=now
      if (endTime) {
        const nowSec = BigInt(Math.floor(Date.now() / 1000));
        const endSec = BigInt(Math.floor(new Date(endTime).getTime() / 1000));
        if (endSec <= nowSec) throw new Error("End time must be after now");
        await setVotingWindow(nowSec, endSec);
      }
      alert("Candidate registered successfully!");
      setCandidateName("");
      setCandidateDescription("");
      setCandidateImage("");
      setEndTime("");
    } catch (error) {
      console.error("Error registering candidate:", error);
      alert("Failed to register candidate");
    } finally {
      setRegistering(false);
    }
  };

  // removed manage voting actions per product decision

  return (
    <main className="container" style={{ paddingTop: "var(--spacing-2xl)", paddingBottom: "var(--spacing-2xl)" }}>
      <h1 style={{ textAlign: "center", marginBottom: "var(--spacing-md)" }}>
        ⚙️ <span style={{ color: "var(--color-primary)" }}>Admin</span> Panel
      </h1>
      <p style={{ textAlign: "center", color: "var(--color-text-muted)", marginBottom: "var(--spacing-2xl)" }}>
        Manage candidates and voting settings
      </p>

      {/* Navigation removed */}

      <div style={{ maxWidth: "600px", margin: "0 auto" }}>
        <Card>
            <h2 style={{ marginBottom: "var(--spacing-lg)" }}>Register New Candidate</h2>
            <form onSubmit={handleRegisterCandidate} style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-lg)" }}>
              <Input
                label="Candidate Name *"
                placeholder="Enter candidate name"
                value={candidateName}
                onChange={setCandidateName}
                fullWidth
              />
              <TextArea
                label="Description *"
                placeholder="Enter candidate description"
                value={candidateDescription}
                onChange={setCandidateDescription}
                rows={4}
                fullWidth
              />
              <Input
                label="Image URI"
                placeholder="IPFS URI or image URL"
                value={candidateImage}
                onChange={setCandidateImage}
                fullWidth
              />
              <Input
                label="Voting End Time (optional)"
                type="datetime-local"
                placeholder="Select end time"
                value={endTime}
                onChange={setEndTime}
                fullWidth
              />
              <Button
                type="submit"
                variant="primary"
                fullWidth
                disabled={registering}
              >
                {registering ? "Registering..." : "Register Candidate"}
              </Button>
            </form>
          </Card>
      </div>
    </main>
  );
}

