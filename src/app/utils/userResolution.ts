import { ethers } from 'ethers';

// Types for user resolution
export type RecipientType = 'wallet' | 'username' | 'ens' | 'email';
export type RecipientResolutionResult = {
  address: string;
  type: RecipientType;
  metadata?: {
    username?: string;
    email?: string;
    networkHint?: number | undefined;
  };
};

// Network detection utility
export const NETWORK_NAMES: {[key: number]: string} = {
  // Testnet Networks
  11155111: 'Sepolia Testnet',
  80001: 'Mumbai Testnet',
  97: 'BSC Testnet'
};

export function getNetworkName(networkHint?: number): string {
  if (typeof networkHint !== 'number' || isNaN(networkHint)) return 'Unknown';
  return NETWORK_NAMES[networkHint] || `Unknown Network (${networkHint})`;
};

export const detectRecipientNetwork = (address: string): number | undefined => {
  const networkHints: {[key: string]: number} = {
    // Testnet Networks
    '0x': 11155111,    // Sepolia (default Ethereum testnet)
    '0x1': 11155111,   // Sepolia
    '0x13881': 80001,  // Mumbai (Polygon testnet)
    '0x38': 97,        // BSC Testnet
    '0x61': 97,        // BSC Testnet
  };

  for (const [prefix, chainId] of Object.entries(networkHints)) {
    if (address.toLowerCase().startsWith(prefix)) return chainId;
  }

  return undefined;
};

// Comprehensive recipient resolution
export const resolveRecipient = async (
  input: string, 
  provider?: ethers.providers.Web3Provider
): Promise<RecipientResolutionResult> => {
  // Trim and normalize input
  input = input.trim().toLowerCase();

  // ENS Resolution (requires provider)
  if (provider && input.endsWith('.eth')) {
    try {
      const resolvedAddress = await provider.resolveName(input);
      if (resolvedAddress) {
        return {
          address: resolvedAddress,
          type: 'ens',
          metadata: {
            networkHint: detectRecipientNetwork(resolvedAddress)
          }
        };
      }
    } catch (err) {
      console.warn('ENS resolution failed:', err);
    }
  }

  // Wallet Address Validation
  if (validateRecipient(input)) {
    const checksumAddress = ethers.utils.getAddress(input);
    return {
      address: checksumAddress,
      type: 'wallet',
      metadata: {
        networkHint: detectRecipientNetwork(checksumAddress)
      }
    };
  }

  // Username Resolution (placeholder for backend call)
  const usernameMatch = input.match(/^@?([a-z0-9_]+)$/i);
  if (usernameMatch) {
    try {
      const username = usernameMatch[1];
      const response = await fetch(`/api/users/resolve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          identifier: username,
          resolveType: 'username' 
        })
      });

      if (!response.ok) throw new Error('User not found');

      const userData = await response.json();
      
      return {
        address: userData.walletAddress,
        type: 'username',
        metadata: {
          username,
          networkHint: detectRecipientNetwork(userData.walletAddress)
        }
      };
    } catch (err) {
      console.warn('Username resolution failed:', err);
    }
  }

  // Email Resolution
  const emailMatch = input.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
  if (emailMatch) {
    try {
      const response = await fetch(`/api/users/resolve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          identifier: input,
          resolveType: 'email' 
        })
      });

      if (!response.ok) throw new Error('User not found');

      const userData = await response.json();
      
      return {
        address: userData.walletAddress,
        type: 'email',
        metadata: {
          email: input,
          networkHint: detectRecipientNetwork(userData.walletAddress)
        }
      };
    } catch (err) {
      console.warn('Email resolution failed:', err);
    }
  }

  // If all resolution methods fail
  throw new Error('Unable to resolve recipient');
};

// Validation utility
export const validateRecipient = (address: string): boolean => {
  // Trim and remove any whitespace
  address = address.trim();
  
  // Check for valid 0x prefix and length
  if (!/^0x[0-9a-fA-F]{40}$/.test(address)) {
    return false;
  }

  try {
    // Additional ethers validation
    return ethers.utils.getAddress(address) !== ethers.constants.AddressZero;
  } catch {
    return false;
  }
};
