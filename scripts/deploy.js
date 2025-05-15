"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv = __importStar(require("dotenv"));
const hardhat_1 = require("hardhat");
dotenv.config();
async function main() {
    console.log("Deploying NexaPayPayment to Sepolia Testnet...");
    // Initial supported tokens (USDC and USDT Sepolia)
    const initialTokens = [
        hardhat_1.ethers.utils.getAddress("0x1c7d4b196cb0c7b01d3e18fbfd9a0fd5963e1f05"), // USDC Sepolia (checksummed)
        hardhat_1.ethers.utils.getAddress("0x7169d38820dfd117c3fa1f22a697dc8d4277c485") // USDT Sepolia (checksummed)
    ];
    // Get the deployer address from the private key
    const [deployer] = await hardhat_1.ethers.getSigners();
    console.log("Deploying with address:", deployer.address);
    // Get contract factory and deploy
    const Factory = await hardhat_1.ethers.getContractFactory("NexaPayPayment", deployer);
    const contract = await Factory.deploy(initialTokens);
    // Wait for deployment confirmation
    await contract.deployed();
    console.log("NexaPayPayment deployed at address:", contract.address);
    // Verify deployment
    console.log("\nDeployment Details:");
    console.log("-------------------");
    console.log(`Contract Address: ${contract.address}`);
    console.log(`Deployer Address: ${deployer.address}`);
    console.log(`Block Number: ${contract.deployTransaction.blockNumber}`);
    // Save deployment details to file
    const deploymentInfo = {
        contractAddress: contract.address,
        deployerAddress: deployer.address,
        blockNumber: contract.deployTransaction.blockNumber,
        chainId: await deployer.getChainId(),
        deploymentDate: new Date().toISOString()
    };
    console.log("\nSaving deployment details...");
    const fs = require("fs");
    fs.writeFileSync("./deployments/deployment-info.json", JSON.stringify(deploymentInfo, null, 2));
}
main()
    .then(() => process.exit(0))
    .catch((error) => {
    console.error("Deployment failed:", error);
    process.exit(1);
});
