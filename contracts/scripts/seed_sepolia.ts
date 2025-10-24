import { ethers, deployments, getNamedAccounts, network } from "hardhat";

async function main() {
  const { deployer } = await getNamedAccounts();
  const deployment = await deployments.get("TalentRankVoting");
  const contract = await ethers.getContractAt("TalentRankVoting", deployment.address);
  console.log(`Using network=${network.name}, address=${deployment.address}`);
  const signerAddr = await (await ethers.getSigners())[0].getAddress();
  console.log(`Signer=${signerAddr}, Deployer(named)=${deployer}`);

  // Seed candidates
  const candidates = [
    {
      name: "Alice",
      img: "https://picsum.photos/seed/alice/600/400",
      desc: "Vocal and dance performer",
    },
    {
      name: "Bob",
      img: "https://picsum.photos/seed/bob/600/400",
      desc: "Magic and comedy show",
    },
    {
      name: "Carol",
      img: "https://picsum.photos/seed/carol/600/400",
      desc: "Instrumental performance",
    },
  ];

  for (const c of candidates) {
    const tx = await contract.registerCandidate(c.name, c.img, c.desc);
    await tx.wait();
    console.log(`Registered: ${c.name}`);
  }

  // Set voting window: now -> now + 7 days
  const nowSec = BigInt(Math.floor(Date.now() / 1000));
  const endSec = nowSec + BigInt(7 * 24 * 60 * 60);
  const wtx = await contract.setVotingWindow(nowSec, endSec);
  await wtx.wait();
  console.log(`Voting window set: start=${nowSec} end=${endSec}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});


