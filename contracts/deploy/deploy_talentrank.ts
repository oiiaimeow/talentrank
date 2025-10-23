import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy, log } = hre.deployments;

  const d = await deploy("TalentRankVoting", {
    from: deployer,
    args: [deployer],
    log: true,
  });

  log(`TalentRankVoting deployed at ${d.address}`);
};

export default func;
func.id = "deploy_talentrank";
func.tags = ["TalentRankVoting"];



