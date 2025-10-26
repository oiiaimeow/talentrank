import * as fs from "fs";
import * as path from "path";

const CONTRACT_NAME = "TalentRankVoting";
const rel = "../contracts"; // contracts package root (sibling to frontend)
const outdir = path.resolve("./abi");

if (!fs.existsSync(outdir)) fs.mkdirSync(outdir, { recursive: true });

const deploymentsDir = path.resolve(path.join(rel, "deployments"));

function readDeployment(chainName, chainId, contractName, optional) {
  const chainDeploymentDir = path.join(deploymentsDir, chainName);

  if (!fs.existsSync(chainDeploymentDir)) {
    if (!optional) {
      console.error(`Cannot find deployments for ${chainName} at ${chainDeploymentDir}`);
      process.exit(1);
    }
    return undefined;
  }

  const jsonString = fs.readFileSync(
    path.join(chainDeploymentDir, `${contractName}.json`),
    "utf-8"
  );
  const obj = JSON.parse(jsonString);
  obj.chainId = chainId;
  return obj;
}

const deployLocalhost = readDeployment("localhost", 31337, CONTRACT_NAME, true);
const deploySepolia = readDeployment("sepolia", 11155111, CONTRACT_NAME, true);

// Prefer ABI from artifacts (always up-to-date after compile),
// fallback to deployments if artifacts are not available
let abi;
try {
  const artifactPath = path.resolve(path.join(rel, "artifacts/contracts/TalentRankVoting.sol/TalentRankVoting.json"));
  const artifactJson = fs.readFileSync(artifactPath, "utf-8");
  abi = JSON.parse(artifactJson).abi;
} catch (_) {
  // ignore and fallback below
}

if (!abi) {
  abi = (deploySepolia ?? deployLocalhost)?.abi;
}

if (!abi) {
  console.error("No ABI found in artifacts or deployments. Please build or deploy the contracts first.");
  process.exit(1);
}

const addresses = {
  "11155111": {
    address: deploySepolia?.address ?? "0x0000000000000000000000000000000000000000",
    chainId: 11155111,
    chainName: "sepolia",
  },
  "31337": {
    address: deployLocalhost?.address ?? "0x0000000000000000000000000000000000000000",
    chainId: 31337,
    chainName: "hardhat",
  },
};

const tsABI = `export const ${CONTRACT_NAME}ABI = ${JSON.stringify({ abi }, null, 2)} as const;\n`;
const tsAddr = `export const ${CONTRACT_NAME}Addresses = ${JSON.stringify(addresses, null, 2)} as const;\n`;

fs.writeFileSync(path.join(outdir, `${CONTRACT_NAME}ABI.ts`), tsABI, "utf-8");
fs.writeFileSync(path.join(outdir, `${CONTRACT_NAME}Addresses.ts`), tsAddr, "utf-8");

console.log("ABI and addresses generated in ./abi");


