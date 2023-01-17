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
const sendTransaction = async ({ to, value, data }) => {
  // Get the user's account from MetaMask.
  const [from] = (await window.ethereum.request({
    method: 'eth_requestAccounts',
  })) as string[];
  console.log(from);

  // Send a transaction to MetaMask.
  return window.ethereum.request({
    method: 'eth_sendTransaction',
    params: [
      {
        from: from,
        to: to,
        value: value,
        data: data,
      },
    ],
  });
};

const Methods = {
  // USDC
  Approve:
    '0x095ea7b300000000000000000000000068b3465833fb72a70ecdf485e0e4c7bd8665fc4500000000000000000000000000000000000000000000000000000000000f4240',
  Transfer:
    '0xa9059cbb000000000000000000000000fc43f5f9dd45258b3aff31bdbe6561d97e8b71de00000000000000000000000000000000000000000000000000000000000f4240',

  // WETH or WMATIC
  Deposit: '0xd0e30db0',
  Withdraw:
    '0x2e1a7d4d0000000000000000000000000000000000000000000000000de0b6b3a7640000',

  // Uniswap V3
  SwapETHForUSDC: '',
  SwapUSDCForUNI: '',
};

const getNetwork = async () => {
  // https://developers.circle.com/developer/docs/usdc-on-testnet
  // https://docs.uniswap.org/contracts/v3/reference/deployments (SwapRouter02)
  const Networks = {
    // '0x1': {
    //   chainId: 1,
    //   name: 'Ethereum Mainnet',
    //   USDC: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    //   Wrapped: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    //   Uniswap: '',
    // },
    '0x5': {
      chainId: 5,
      name: 'Ethereum Goerli',
      USDC: '0x07865c6E87B9F70255377e024ace6630C1Eaa37F',
      Wrapped: '0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6',
      UniswapAddress: '0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45',
    },
    // '0x89': {
    //   chainId: 137,
    //   name: 'Polygon Mainnet',
    //   USDC: '',
    //   Wrapped: '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270',
    //   Uniswap: '',
    // },
    '0x13881': {
      chainId: 80001,
      name: 'Polygon Mumbai',
      USDC: '0x0fa8781a83e46826621b3bc094ea2a0212e71b23',
      Wrapped: '0x9c3C9283D3e44854697Cd22D3Faa240Cfb032889',
      UniswapAddress: '0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45',
    },
  };

  // Get current chain from MetaMask.
  const chainId = await window.ethereum.request({
    method: 'eth_chainId',
  });
  console.log(chainId);
  return Networks[chainId];
};

/**
 * Approve 1 USDC.
 */
export const approveUSDC = async () => {
  const network = await getNetwork();

  // Send a transaction to MetaMask.
  await sendTransaction({
    to: network.USDC,
    value: '0x0',
    data: Methods.Approve,
  });
};

/**
 * Transfer 1 USDC to random address (demo.eth - 0xfc43f5f9dd45258b3aff31bdbe6561d97e8b71de).
 */
export const transferUSDC = async () => {
  const network = await getNetwork();
  await sendTransaction({
    to: network.USDC,
    value: '0x0',
    data: Methods.Transfer,
  });
};

/**
 * Wrap 1 ETH or 1 MATIC.
 */
export const wrap = async () => {
  const network = await getNetwork();
  await sendTransaction({
    to: network.Wrapped,
    value: '0xDE0B6B3A7640000',
    data: Methods.Deposit,
  });
};

/**
 * Unwrap 1 WETH or 1WMATIC.
 */
export const unwrap = async () => {
  const network = await getNetwork();
  await sendTransaction({
    to: network.Wrapped,
    value: '0x0',
    data: Methods.Withdraw,
  });
};

/**
 * Swap 1 ETH or 1 MATIC for USDC on Uniswap V3.
 */
export const swapNative = async () => {
  const network = await getNetwork();
  await sendTransaction({
    to: network.UniswapAddress,
    value: '0xDE0B6B3A7640000',
    data: '0x5ae401dc0000000000000000000000000000000000000000000000000000000063c6071100000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000e404e45aaf0000000000000000000000009c3c9283d3e44854697cd22d3faa240cfb0328890000000000000000000000000fa8781a83e46826621b3bc094ea2a0212e71b23000000000000000000000000000000000000000000000000000000000000271000000000000000000000000027363d8e7046e70d6fb88f01898e3a6570b5cf3c0000000000000000000000000000000000000000000000000de0b6b3a764000000000000000000000000000000000000000000000000000000000000000e92a3000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
  });
};

/**
 * Swap 1 USDC for UNI on Uniswap V3.
 */
export const swapUSDC = async () => {
  const network = await getNetwork();
  await sendTransaction({
    to: network.Uniswap,
    value: '0x0',
    data: '0x5ae401dc0000000000000000000000000000000000000000000000000000000063c4d39400000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000e404e45aaf00000000000000000000000007865c6e87b9f70255377e024ace6630c1eaa37f0000000000000000000000001f9840a85d5af5bf1d1762f925bdaddc4201f9840000000000000000000000000000000000000000000000000000000000000bb800000000000000000000000027363d8e7046e70d6fb88f01898e3a6570b5cf3c00000000000000000000000000000000000000000000000000000000000f424000000000000000000000000000000000000000000000000000002553099c9509000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
  });
};

export const isLocalSnap = (snapId: string) => snapId.startsWith('local:');
