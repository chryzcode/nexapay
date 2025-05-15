// Stargate cross-chain payment utility
// This is a scaffold for LayerZero Stargate Router integration

import { ethers } from "ethers";

// Stargate Router contract addresses (for major chains)
export const STARGATE_ROUTER_ADDRESSES: Record<number, string> = {
  1: "0x8731d54E9D02c286767d56ac03e8037C07e01e98",      // Ethereum mainnet
  56: "0x817436a076060D158204d955E5403b6Ed0A5fac0",     // BSC
  137: "0x45A01E4e04F14f7A4a6702c74187c5F6222033cd",    // Polygon
  43114: "0x45A01E4e04F14f7A4a6702c74187c5F6222033cd",  // Avalanche
  // Add more as needed
};

// Stargate chain IDs (LayerZero IDs, not EVM chainId)
export const LZ_CHAIN_IDS: Record<number, number> = {
  1: 101,      // Ethereum
  56: 102,     // BSC
  137: 109,    // Polygon
  43114: 106,  // Avalanche
  // Add more as needed
};

// Example: send USDC cross-chain
export async function stargateSwap({
  provider,
  srcChainId,
  dstChainId,
  srcPoolId,
  dstPoolId,
  amount,
  recipient,
  minAmount = 0
}: {
  provider: ethers.providers.Web3Provider,
  srcChainId: number,
  dstChainId: number,
  srcPoolId: number,
  dstPoolId: number,
  amount: string,
  recipient: string,
  minAmount?: number
}) {
  const signer = provider.getSigner();
  const routerAddr = STARGATE_ROUTER_ADDRESSES[srcChainId];
  if (!routerAddr) throw new Error("Unsupported source chain");
  
  // Fetch full ABI from Etherscan
  const apiKey = process.env.NEXT_PUBLIC_ETHERSCAN_API_KEY;
  if (!apiKey) throw new Error('Define NEXT_PUBLIC_ETHERSCAN_API_KEY in .env');
  const abiUrl = `https://api.etherscan.io/api?module=contract&action=getabi&address=${routerAddr}&apikey=${apiKey}`;
  const abiResp = await fetch(abiUrl);
  const abiJson = await abiResp.json();
  const fullAbi = JSON.parse(abiJson.result);
  console.log('Fetched full Router ABI:', fullAbi.length, 'entries');
  const router = new ethers.Contract(routerAddr, fullAbi, signer);

  console.log('Router address:', routerAddr);
  console.log('Source poolId -> dest poolId:', srcPoolId, '->', dstPoolId);
  const dstLzChainId = LZ_CHAIN_IDS[dstChainId];
  if (!dstLzChainId) throw new Error("Unsupported destination chain");
  console.log('Dest LZ chain ID:', dstLzChainId);

  // Prepare recipient as bytes32
  const recipientBytes = ethers.utils.hexZeroPad(recipient, 32);
  console.log('Recipient bytes (hex32):', recipientBytes);

  try {
    const tx = await router.swap(
      dstLzChainId,
      srcPoolId,
      dstPoolId,
      await signer.getAddress(),
      amount,
      minAmount,
      { dstGasForCall: 0, dstNativeAmount: 0, dstNativeAddr: "0x" },
      recipientBytes,
      "0x",
      { value: ethers.utils.parseEther("0.05") }
    );
    const receipt = await tx.wait();
    console.log('Swap successful:', receipt);
    return receipt;
  } catch (err: any) {
    console.error('Swap failed:', err.reason || err.message);
    throw err;
  }
}
