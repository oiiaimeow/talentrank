import { JsonRpcProvider, ethers } from "ethers";
import { RelayerSDKLoader, isFhevmWindow, FhevmWindowType } from "./RelayerSDKLoader";

export type FhevmInstance = any;

async function getChainId(providerOrUrl: ethers.Eip1193Provider | string): Promise<number> {
  if (typeof providerOrUrl === "string") {
    const p = new JsonRpcProvider(providerOrUrl);
    const net = await p.getNetwork();
    p.destroy();
    return Number(net.chainId);
  }
  const hex = (await providerOrUrl.request({ method: "eth_chainId" })) as string;
  return Number.parseInt(hex, 16);
}

export async function createFhevmInstance(providerOrUrl: ethers.Eip1193Provider | string): Promise<FhevmInstance> {
  const chainId = await getChainId(providerOrUrl);
  const isMock = chainId === 31337;

  if (isMock) {
    const rpcUrl = typeof providerOrUrl === "string" ? providerOrUrl : "http://localhost:8545";
    const provider = new JsonRpcProvider(rpcUrl);
    const { MockFhevmInstance } = await import("@fhevm/mock-utils");
    // Minimal metadata for mock instance
    const instance = await MockFhevmInstance.create(provider, provider, {
      aclContractAddress: "0x0000000000000000000000000000000000000001",
      chainId: 31337,
      gatewayChainId: 55815,
      inputVerifierContractAddress: "0x0000000000000000000000000000000000000002",
      kmsContractAddress: "0x0000000000000000000000000000000000000003",
      verifyingContractAddressDecryption: "0x0000000000000000000000000000000000000004",
      verifyingContractAddressInputVerification: "0x0000000000000000000000000000000000000005",
    });
    return instance;
  }

  const loader = new RelayerSDKLoader({});
  if (!isFhevmWindow(window)) {
    await loader.load();
  }
  const relayerSDK = (window as FhevmWindowType).relayerSDK;
  if (relayerSDK.__initialized__ !== true) {
    await relayerSDK.initSDK();
    relayerSDK.__initialized__ = true;
  }
  const config = { ...relayerSDK.SepoliaConfig, network: providerOrUrl };
  const instance = await relayerSDK.createInstance(config);
  return instance;
}



