import hre from "hardhat";

async function main() {
  const { ethers, network } = hre;
  const chainId = Number((await ethers.provider.getNetwork()).chainId);
  console.log(`Deploying TapeOrderBook on ${network.name} (chainId ${chainId})...\n`);

  const [deployer] = await ethers.getSigners();
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Deployer:", deployer.address);
  console.log("Balance:", ethers.formatEther(balance), "BOT\n");

  const TapeOrderBook = await ethers.getContractFactory("TapeOrderBook");
  const contract = await TapeOrderBook.deploy();
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log("TapeOrderBook deployed to:", address);
  console.log("\nUpdate lib/config.ts:");
  console.log(`  contractAddress: "${address}",`);
}

main().catch((error) => {
  console.error("Deployment failed:", error);
  process.exitCode = 1;
});
