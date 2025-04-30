import * as dotenv from "dotenv";
import { ethers } from "hardhat";

dotenv.config(); // Load .env

async function main() {
  console.log("Deploying PaymentGateway to Sepolia Testnet...");

  const Gateway = await ethers.getContractFactory("PaymentGateway");
  const gateway = await Gateway.deploy();
  await gateway.deployed();

  console.log("PaymentGateway deployed at address:", gateway.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
