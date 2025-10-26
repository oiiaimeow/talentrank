"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ethers } from "ethers";
import { createFhevmInstance } from "@/fhevm/internal/fhevm";
import { TalentRankVotingABI } from "@/abi/TalentRankVotingABI";
import { TalentRankVotingAddresses } from "@/abi/TalentRankVotingAddresses";

export function useTalentRank() {
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [instance, setInstance] = useState<any>(null);
  const [contractAddress, setContractAddress] = useState<`0x${string}` | null>(null);
  const [isDeployed, setIsDeployed] = useState<boolean>(false);

  useEffect(() => {
    const p = new ethers.BrowserProvider((window as any).ethereum);
    setProvider(p);
    (async () => {
      const net = await p.getNetwork();
      const cid = Number(net.chainId);
      setChainId(cid);
      const entry = (TalentRankVotingAddresses as any)[String(cid)];
      if (entry && entry.address) {
        setContractAddress(entry.address);
        setIsDeployed(entry.address !== "0x0000000000000000000000000000000000000000");
      }
      const s = await p.getSigner().catch(() => null);
      if (s) {
        setSigner(s);
        setAddress(await s.getAddress());
      }
      const n = typeof (window as any).ethereum !== "undefined" ? (window as any).ethereum : p;
      const fhe = await createFhevmInstance(n);
      setInstance(fhe);
    })();
  }, []);

  const contract = useMemo(() => {
    if (!provider || !contractAddress) return null;
    return new ethers.Contract(contractAddress, TalentRankVotingABI.abi, signer ?? provider);
  }, [provider, signer, contractAddress]);

  // 主动连接钱包，确保 signer/address 就绪
  const connectWallet = useCallback(async () => {
    try {
      if (!provider) return null;
      const eth = (window as any).ethereum;
      if (eth && typeof eth.request === "function") {
        await eth.request({ method: "eth_requestAccounts" }).catch(() => undefined);
      }
      const s = await provider.getSigner().catch(() => null);
      if (s) {
        setSigner(s);
        setAddress(await s.getAddress());
      }
      return s;
    } catch {
      return null;
    }
  }, [provider]);

  const refreshCandidates = useCallback(async () => {
    if (!contract) return [] as any[];
    try {
      const list = await contract.getAllCandidates();
      return list;
    } catch {
      return [] as any[];
    }
  }, [contract]);

  const vote = useCallback(
    async (candidateId: number) => {
      if (!contract || !signer) throw new Error("No signer");
      const tx = await contract.vote(candidateId);
      await tx.wait();
    },
    [contract, signer]
  );

  // 用户解密工具：传入句柄列表（handle + contractAddress），返回句柄->明文映射
  const decryptHandles = useCallback(
    async (handles: { handle: string; contractAddress: string }[]) => {
      if (!instance || !signer || !address || !contractAddress) return {} as Record<string, unknown>;

      try {
        const { publicKey, privateKey } = instance.generateKeypair();
        const startTimestamp = Math.floor(Date.now() / 1000);
        const durationDays = 365;
        const eip712 = instance.createEIP712(publicKey, [contractAddress], startTimestamp, durationDays);

        const signature = await (signer as ethers.Signer).signTypedData(
          eip712.domain,
          { UserDecryptRequestVerification: eip712.types.UserDecryptRequestVerification },
          eip712.message
        );

        const res = await instance.userDecrypt(
          handles,
          privateKey,
          publicKey,
          signature,
          [contractAddress],
          address,
          startTimestamp,
          durationDays
        );
        return res as Record<string, unknown>;
      } catch {
        return {} as Record<string, unknown>;
      }
    },
    [instance, signer, address, contractAddress]
  );

  // 公共解密（无需签名/ACL），用于展示公开票数
  const decryptPublic = useCallback(
    async (handle: string) => {
      if (!instance || !contractAddress) return undefined as unknown;
      try {
        const value = await instance.decryptPublic(contractAddress, handle);
        return value as unknown;
      } catch {
        return undefined as unknown;
      }
    },
    [instance, contractAddress]
  );

  const registerCandidate = useCallback(
    async (name: string, imageURI: string, description: string) => {
      if (!contract || !signer) throw new Error("No signer");
      const tx = await contract.connect(signer).registerCandidate(name, imageURI, description);
      await tx.wait();
    },
    [contract, signer]
  );

  const setVotingWindow = useCallback(
    async (startTimestamp: bigint, endTimestamp: bigint) => {
      if (!contract || !signer) throw new Error("No signer");
      const tx = await contract.connect(signer).setVotingWindow(startTimestamp, endTimestamp);
      await tx.wait();
    },
    [contract, signer]
  );

  const endVoting = useCallback(async () => {
    if (!contract || !signer) throw new Error("No signer");
    const tx = await contract.connect(signer).endVoting();
    await tx.wait();
  }, [contract, signer]);

  const hasVoted = useCallback(
    async (addr: string) => {
      if (!contract) return false;
      return await contract.hasVoted(addr);
    },
    [contract]
  );

  // Admin helper: grant decryption to current address
  const grantDecryptionToMe = useCallback(async () => {
    if (!contract || !signer) throw new Error("No signer");
    const me = await (signer as ethers.Signer).getAddress();
    const tx = await (contract as any).connect(signer).grantDecryptionTo(me);
    await tx.wait();
  }, [contract, signer]);

  return {
    address,
    chainId,
    instance,
    contract,
    contractAddress,
    refreshCandidates,
    vote,
    registerCandidate,
    setVotingWindow,
    endVoting,
    hasVoted,
    isDeployed,
    decryptHandles,
    decryptPublic,
    connectWallet,
    grantDecryptionToMe,
  };
}


