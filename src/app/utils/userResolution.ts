import { ethers } from 'ethers';

// Types for user resolution
export type RecipientType = 'wallet' | 'username' | 'ens' | 'email' | 'userCode';
export type RecipientResolutionResult = {
  address: string;
  type: RecipientType;
  metadata?: {
    username?: string;
    email?: string;
    userCode?: string;
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

// Comprehensive recipient resolution
export const resolveRecipient = async (
  input: string, 
  provider?: ethers.providers.Web3Provider,
  identifierType?: 'wallet' | 'username' | 'userCode' | 'email'
): Promise<RecipientResolutionResult> => {
  // Trim and normalize input
  input = input.trim().toLowerCase();

  // If identifierType is provided, use it to determine resolution method
  if (identifierType) {
    switch (identifierType) {
      case 'wallet':
        // For wallet addresses, just validate the format
        if (validateRecipient(input)) {
          const checksumAddress = ethers.utils.getAddress(input);
          return {
            address: checksumAddress,
            type: 'wallet',
            metadata: {
              networkHint: 11155111 // Default to Sepolia testnet for direct address input
            }
          };
        }
        throw new Error('Invalid wallet address format');

      case 'username':
        // For usernames, check if user exists on platform
        try {
          const response = await fetch(`/api/resolve-identifier`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              type: 'username',
              value: input
            })
          });

          if (!response.ok) throw new Error('User not found');

          const userData = await response.json();
          
          return {
            address: userData.address,
            type: 'username',
            metadata: {
              username: input,
              networkHint: userData.metadata?.networkHint
            }
          };
        } catch (err) {
          console.warn('Username resolution failed:', err);
          throw new Error('Username not found on platform');
        }

      case 'userCode':
        // For userCode, check if user exists on platform
        try {
          const response = await fetch(`/api/resolve-identifier`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              type: 'userCode',
              value: input
            })
          });

          if (!response.ok) throw new Error('User not found');

          const userData = await response.json();
          
          return {
            address: userData.address,
            type: 'userCode',
            metadata: {
              userCode: input,
              networkHint: userData.metadata?.networkHint
            }
          };
        } catch (err) {
          console.warn('UserCode resolution failed:', err);
          throw new Error('UserCode not found on platform');
        }

      case 'email':
        // For email, check if user exists on platform
        try {
          const response = await fetch(`/api/resolve-identifier`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              type: 'email',
              value: input
            })
          });

          if (!response.ok) throw new Error('User not found');

          const userData = await response.json();
          
          return {
            address: userData.address,
            type: 'email',
            metadata: {
              email: input,
              networkHint: userData.metadata?.networkHint
            }
          };
        } catch (err) {
          console.warn('Email resolution failed:', err);
          throw new Error('Email not found on platform');
        }
    }
  }

  // Fallback: Auto-detect type if no identifierType provided
  // ENS Resolution (requires provider)
  if (provider && input.endsWith('.eth')) {
    try {
      const resolvedAddress = await provider.resolveName(input);
      if (resolvedAddress) {
        return {
          address: resolvedAddress,
          type: 'ens',
          metadata: {
            networkHint: 1 // ENS is typically mainnet
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
        networkHint: 11155111 // Default to Sepolia testnet for direct address input
      }
    };
  }

  // Username Resolution (placeholder for backend call)
  const usernameMatch = input.match(/^@?([a-z0-9_]+)$/i);
  if (usernameMatch) {
    try {
      const username = usernameMatch[1];
      const response = await fetch(`/api/resolve-identifier`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          type: 'username',
          value: username
        })
      });

      if (!response.ok) throw new Error('User not found');

      const userData = await response.json();
      
      return {
        address: userData.address,
        type: 'username',
        metadata: {
          username,
          networkHint: userData.metadata?.networkHint
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
      const response = await fetch(`/api/resolve-identifier`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          type: 'email',
          value: input
        })
      });

      if (!response.ok) throw new Error('User not found');

      const userData = await response.json();
      
      return {
        address: userData.address,
        type: 'email',
        metadata: {
          email: input,
          networkHint: userData.metadata?.networkHint
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
