import { defaultSnapOrigin } from '../config';
import { GetSnapsResponse, Snap } from '../types';

/**
 * Get the installed snaps in MetaMask.
 *
 * @returns The snaps installed in MetaMask.
 */
export const getSnaps = async (): Promise<GetSnapsResponse> => {
  return (await window.ethereum.request({
    method: 'wallet_getSnaps',
  })) as unknown as GetSnapsResponse;
};

/**
 * Connect a snap to MetaMask.
 *
 * @param snapId - The ID of the snap.
 * @param params - The params to pass with the snap to connect.
 */
export const connectSnap = async (
  snapId: string = defaultSnapOrigin,
  params: Record<'version' | string, unknown> = {},
) => {
  await window.ethereum.request({
    method: 'wallet_enable',
    params: [
      {
        wallet_snap: {
          [snapId]: {
            ...params,
          },
        },
      },
    ],
  });
};

/**
 * Get the snap from MetaMask.
 *
 * @param version - The version of the snap to install (optional).
 * @returns The snap object returned by the extension.
 */
export const getSnap = async (version?: string): Promise<Snap | undefined> => {
  try {
    const snaps = await getSnaps();

    return Object.values(snaps).find(
      (snap) =>
        snap.id === defaultSnapOrigin && (!version || snap.version === version),
    );
  } catch (e) {
    console.log('Failed to obtain installed snap', e);
    return undefined;
  }
};

/**
 * Invoke the "hello" method from the example snap.
 */
export const sendHello = async () => {
  await window.ethereum.request({
    method: 'wallet_invokeSnap',
    params: [
      defaultSnapOrigin,
      {
        method: 'hello',
      },
    ],
  });
};

/**
 * Send transaction from the example snap.
 */
export const sendContractTransaction = async () => {
  // Get the user's account from MetaMask.
  const [from] = (await window.ethereum.request({
    method: 'eth_requestAccounts',
  })) as string[];

  enum TransactionConstants {
    // Arbitrary contract that will revert any transactions that accidentally go through
    Address = '0x08A8fDBddc160A7d5b957256b903dCAb1aE512C5',
    // Some raw contract transaction data we will decode
    UpdateWithdrawalAccount = '0x83ade3dc00000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000000200000000000000000000000047170ceae335a9db7e96b72de630389669b334710000000000000000000000006b175474e89094c44da98b954eedeac495271d0f',
    UpdateMigrationMode = '0x2e26065e0000000000000000000000000000000000000000000000000000000000000000',
    UpdateCap = '0x85b2c14a00000000000000000000000047170ceae335a9db7e96b72de630389669b334710000000000000000000000000000000000000000000000000de0b6b3a7640000',
  }

  // Send a transaction to MetaMask.
  await window.ethereum.request({
    method: 'eth_sendTransaction',
    params: [
      {
        from: from,
        to: TransactionConstants.Address,
        value: '0x0',
        data: TransactionConstants.UpdateWithdrawalAccount,
      },
    ],
  });
};

/**
 * Approve 1 USDC.
 */
export const approveUSDC = async () => {
  // Get the user's account from MetaMask.
  const [from] = (await window.ethereum.request({
    method: 'eth_requestAccounts',
  })) as string[];

  // UniSwap V3 - 0x68b3465833fb72a70ecdf485e0e4c7bd8665fc45

  enum TransactionConstants {
    // USDC contract address
    // Mainnet
    Address = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    // Goerli
    AddressGoerli = '0x07865c6E87B9F70255377e024ace6630C1Eaa37F',
    Approve = '0x095ea7b300000000000000000000000068b3465833fb72a70ecdf485e0e4c7bd8665fc4500000000000000000000000000000000000000000000000000000000000f4240',
  }

  // Send a transaction to MetaMask.
  await window.ethereum.request({
    method: 'eth_sendTransaction',
    params: [
      {
        from: from,
        to: TransactionConstants.AddressGoerli,
        value: '0x0',
        data: TransactionConstants.Approve,
      },
    ],
  });
};

/**
 * Transfer 1 USDC to random address.
 */
export const transferUSDC = async () => {
  // Get the user's account from MetaMask.
  const [from] = (await window.ethereum.request({
    method: 'eth_requestAccounts',
  })) as string[];

  enum TransactionConstants {
    // USDC contract address
    // Mainnet
    Address = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    // Goerli
    AddressGoerli = '0x07865c6E87B9F70255377e024ace6630C1Eaa37F',
    Transfer = '0xa9059cbb000000000000000000000000fc43f5f9dd45258b3aff31bdbe6561d97e8b71de00000000000000000000000000000000000000000000000000000000000f4240',
  }

  // Send a transaction to MetaMask.
  await window.ethereum.request({
    method: 'eth_sendTransaction',
    params: [
      {
        from: from,
        to: TransactionConstants.AddressGoerli,
        value: '0x0',
        data: TransactionConstants.Transfer,
      },
    ],
  });
};

/**
 * Wrap 1 Eth.
 */
export const wrapEth = async () => {
  // Get the user's account from MetaMask.
  const [from] = (await window.ethereum.request({
    method: 'eth_requestAccounts',
  })) as string[];

  // Send a transaction to MetaMask.
  await window.ethereum.request({
    method: 'eth_sendTransaction',
    params: [
      {
        from: from,
        to: '0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6',
        value: '0xDE0B6B3A7640000',
        data: '0xd0e30db0',
      },
    ],
  });
};

/**
 * Unwrap 1 WETH.
 */
export const unwrapWeth = async () => {
  // Get the user's account from MetaMask.
  const [from] = (await window.ethereum.request({
    method: 'eth_requestAccounts',
  })) as string[];

  // Send a transaction to MetaMask.
  await window.ethereum.request({
    method: 'eth_sendTransaction',
    params: [
      {
        from: from,
        to: '0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6',
        value: '0x0',
        data: '0x2e1a7d4d0000000000000000000000000000000000000000000000000de0b6b3a7640000',
      },
    ],
  });
};

export const isLocalSnap = (snapId: string) => snapId.startsWith('local:');
