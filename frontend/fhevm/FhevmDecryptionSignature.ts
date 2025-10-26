import { ethers } from "ethers";
import type { FhevmInstance } from "./internal/fhevm";
import type { EIP712Type } from "../../../zama_template 16.30.26/frontend/fhevm/internal/fhevmTypes";
import { GenericStringInMemoryStorage, type GenericStringStorage } from "./GenericStringStorage";

function nowSecs() {
  return Math.floor(Date.now() / 1000);
}

export class FhevmDecryptionSignature {
  #publicKey: string;
  #privateKey: string;
  #signature: string;
  #startTimestamp: number;
  #durationDays: number;
  #userAddress: `0x${string}`;
  #contractAddresses: `0x${string}`[];
  #eip712: EIP712Type;

  private constructor(params: {
    publicKey: string;
    privateKey: string;
    signature: string;
    startTimestamp: number;
    durationDays: number;
    userAddress: `0x${string}`;
    contractAddresses: `0x${string}`[];
    eip712: EIP712Type;
  }) {
    this.#publicKey = params.publicKey;
    this.#privateKey = params.privateKey;
    this.#signature = params.signature;
    this.#startTimestamp = params.startTimestamp;
    this.#durationDays = params.durationDays;
    this.#userAddress = params.userAddress;
    this.#contractAddresses = params.contractAddresses;
    this.#eip712 = params.eip712;
  }

  get privateKey() { return this.#privateKey; }
  get publicKey() { return this.#publicKey; }
  get signature() { return this.#signature; }
  get contractAddresses() { return this.#contractAddresses; }
  get startTimestamp() { return this.#startTimestamp; }
  get durationDays() { return this.#durationDays; }
  get userAddress() { return this.#userAddress; }

  toJSON() {
    return {
      publicKey: this.#publicKey,
      privateKey: this.#privateKey,
      signature: this.#signature,
      startTimestamp: this.#startTimestamp,
      durationDays: this.#durationDays,
      userAddress: this.#userAddress,
      contractAddresses: this.#contractAddresses,
      eip712: this.#eip712,
    };
  }

  static fromJSON(json: unknown) {
    const d = typeof json === "string" ? JSON.parse(json) : json as any;
    return new FhevmDecryptionSignature(d);
  }

  isValid() {
    return nowSecs() < this.#startTimestamp + this.#durationDays * 24 * 60 * 60;
  }

  static async loadFromStorage(
    storage: GenericStringStorage,
    instance: FhevmInstance,
    contractAddresses: string[],
    userAddress: string,
    publicKey?: string
  ): Promise<FhevmDecryptionSignature | null> {
    try {
      const sorted = (contractAddresses as `0x${string}`[]).sort();
      const empty = (instance as any).createEIP712(publicKey ?? ethers.ZeroAddress, sorted, 0, 0);
      const hash = ethers.TypedDataEncoder.hash(
        empty.domain,
        { UserDecryptRequestVerification: empty.types.UserDecryptRequestVerification },
        empty.message
      );
      const key = `${userAddress}:${hash}`;
      const raw = await storage.getItem(key);
      if (!raw) return null;
      const s = FhevmDecryptionSignature.fromJSON(raw);
      return s.isValid() ? s : null;
    } catch {
      return null;
    }
  }

  static async new(
    instance: FhevmInstance,
    contractAddresses: string[],
    publicKey: string,
    privateKey: string,
    signer: ethers.Signer
  ) {
    const userAddress = (await signer.getAddress()) as `0x${string}`;
    const startTimestamp = nowSecs();
    const durationDays = 365;
    const eip712 = (instance as any).createEIP712(publicKey, contractAddresses, startTimestamp, durationDays);
    const signature = await signer.signTypedData(
      eip712.domain,
      { UserDecryptRequestVerification: eip712.types.UserDecryptRequestVerification },
      eip712.message
    );
    return new FhevmDecryptionSignature({
      publicKey,
      privateKey,
      contractAddresses: contractAddresses as `0x${string}`[],
      startTimestamp,
      durationDays,
      signature,
      eip712,
      userAddress,
    });
  }

  static async loadOrSign(
    instance: FhevmInstance,
    contractAddresses: string[],
    signer: ethers.Signer,
    storage: GenericStringStorage = new GenericStringInMemoryStorage(),
    keyPair?: { publicKey: string; privateKey: string }
  ) {
    const userAddress = (await signer.getAddress()) as `0x${string}`;
    const cached = await FhevmDecryptionSignature.loadFromStorage(storage, instance, contractAddresses, userAddress, keyPair?.publicKey);
    if (cached) return cached;
    const { publicKey, privateKey } = keyPair ?? (instance as any).generateKeypair();
    const sig = await FhevmDecryptionSignature.new(instance, contractAddresses, publicKey, privateKey, signer);
    const sorted = (contractAddresses as `0x${string}`[]).sort();
    const empty = (instance as any).createEIP712(publicKey ?? ethers.ZeroAddress, sorted, 0, 0);
    const hash = ethers.TypedDataEncoder.hash(
      empty.domain,
      { UserDecryptRequestVerification: empty.types.UserDecryptRequestVerification },
      empty.message
    );
    const key = `${userAddress}:${hash}`;
    try { await storage.setItem(key, JSON.stringify(sig)); } catch {}
    return sig;
  }
}



