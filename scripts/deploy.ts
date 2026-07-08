import { ethers } from "hardhat";
import { CHAIN_CONFIG } from "../lib/config";

async function main() {
  console.log(`🚀 Deploying TapeOrderBook to chainId ${CHAIN_CONFIG.chainId}...\n`);

  const TapeOrderBook = await ethers.getContractFactory("TapeOrderBook");
  const contract = await TapeOrderBook.deploy();
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log("✅ TapeOrderBook deployed to:", address);
  console.log("\nUpdate lib/config.ts:");
  console.log(`  contractAddress: "${address}",`);
}

main().catch((error) => {
  console.error("❌ Deployment failed:", error);
  process.exitCode = 1;
});
