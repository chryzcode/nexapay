import * as dotenv from "dotenv";
import { ethers } from "hardhat";

dotenv.config(); // Load .env

async function main() {
  console.log("Deploying NexaPayPayment to Sepolia Testnet...");

  // Initial supported tokens (USDC and USDT Sepolia)
  const initialTokens = [
    "0x1c7D4B196Cb0C7B01d3E18fbfD9A0fD5963E1f05", // USDC Sepolia
    "0x7169D38820dfd117C3FA1f22a697dC8d4277c485"  // USDT Sepolia
  ];

  const Factory = await ethers.getContractFactory("NexaPayPayment");
  const contract = await Factory.deploy(initialTokens);
  await contract.deployed();

  console.log("NexaPayPayment deployed at address:", contract.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
