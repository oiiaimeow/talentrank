import type { ethers } from "ethers";
import type { FhevmInstance } from "./internal/fhevm";
import { FhevmDecryptionSignature } from "./FhevmDecryptionSignature";
import { GenericStringInMemoryStorage } from "./GenericStringStorage";

export async function userDecryptHandles(
  instance: FhevmInstance,
  signer: ethers.Signer,
  items: { handle: string; contractAddress: `0x${string}` }[]
): Promise<Record<string, number>> {
  const storage = new GenericStringInMemoryStorage();
  const contractAddresses = Array.from(new Set(items.map((i) => i.contractAddress)));
  const sig = await FhevmDecryptionSignature.loadOrSign(
    instance as any,
    contractAddresses,
    signer as any,
    storage
  );
  if (!sig) return {};

  const res = await (instance as any).userDecrypt(
    items,
    sig.privateKey,
    sig.publicKey,
    sig.signature,
    sig.contractAddresses,
    sig.userAddress,
    sig.startTimestamp,
    sig.durationDays
  );

  const out: Record<string, number> = {};
  for (const it of items) {
    const clear = res[it.handle];
    out[it.handle] = typeof clear === "bigint" ? Number(clear) : Number(clear ?? 0);
  }
  return out;
}


