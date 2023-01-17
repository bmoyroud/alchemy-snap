import {
  add0x,
  bytesToHex,
  hasProperty,
  isObject,
  remove0x,
} from '@metamask/utils';
import { decode } from '@metamask/abi-utils';

const Providers = {
  // chain id is hex with 0x
  // see https://github.com/ChainAgnostic/CAIPs/blob/master/CAIPs/caip-2.md
  // 'eip155:1': 'https://eth-mainnet.g.alchemy.com/v2/simulation-demo',
  'eip155:5': 'https://eth-goerli.g.alchemy.com/v2/simulation-demo',
  // 'eip155:89': 'https://polygon-mainnet.g.alchemy.com/v2/simulation-demo',
  'eip155:13881': 'https://polygon-mumbai.g.alchemy.com/v2/simulation-demo',
};

/**
 * As an example, get transaction insights by looking at the transaction data
 * and attempting to decode it.
 *
 * @param transaction - The transaction to get insights for.
 * @returns The transaction insights.
 */
export async function getInsights(
  transaction: Record<string, unknown>,
  chainId: string,
) {
  try {
    // Check if the transaction has data.
    if (
      !isObject(transaction) ||
      !hasProperty(transaction, 'data') ||
      typeof transaction.data !== 'string'
    ) {
      return {
        type: 'Unknown transaction',
      };
    }

    if (!Object.keys(Providers).includes(chainId)) {
      return {
        type: `Simulation not currently supported on this network (${chainId}).`,
      };
    }

    // Simulate the transaction
    const { changes, error } = await getSimulationResult(transaction, chainId);
    const _out =
      changes.length > 0
        ? changes
            .filter((change) => change.from === transaction.from.toLowerCase())
            .map((change) => `${change.amount} ${change.symbol}`)
        : [];

    const _in =
      changes.length > 0
        ? changes
            .filter((change) => change.to === transaction.from.toLowerCase())
            .map((change) => `${change.amount} ${change.symbol}`)
        : [];

    // Return the function name and decoded parameters.
    return {
      _out,
      _in,
      simulation: !error ? changes : error,
    };
  } catch (error) {
    console.error(error);
    return {
      type: 'Encountered error',
      error: JSON.stringify(error, null, 2),
    };
  }
}

enum AssetType {
  NATIVE = 'NATIVE',
  ERC20 = 'ERC20',
  ERC721 = 'ERC721',
  ERC1155 = 'ERC1155',
  SPECIAL_NFT = 'SPECIAL_NFT',
}

enum ChangeType {
  APPROVE = 'APPROVE',
  TRANSFER = 'TRANSFER',
}

interface AssetChange {
  asset_type: AssetType;
  change_type: ChangeType;
  from: string;
  to: string;

  /* All - NATIVE, ERC20, ERC721, ERC1555, SPECIAL_NFT */
  raw_amount: string;
  amount: string;
  name: string | null;
  symbol: string;
  decimals: number;

  /* ERC20, ERC721, ERC1555, SPECIAL_NFT */
  contract_address: string | null;

  /* ERC20  */
  logo: string | null;

  /* ERC721, ERC1555  */
  token_id: string | null;
}

/** Response object for the {@link TransactNamespace.simulateAssetChanges} method. */
interface SimulateAssetChangesResponse {
  changes: AssetChange[];
  error: string;
}

/**
 * Gets the function name(s) for the given 4 byte signature.
 *
 * @param signature - The 4 byte signature to get the function name(s) for. This
 * should be a hex string prefixed with '0x'.
 * @returns The function name(s) for the given 4 byte signature, or an empty
 * array if none are found.
 */
async function getSimulationResult(
  transaction: Record<string, unknown>,
  chainId: string,
): Promise<SimulateAssetChangesResponse | string> {
  const url = Providers[chainId];
  const response = await fetch(url, {
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      method: 'alchemy_simulateAssetChanges',
      id: 1,
      params: [
        {
          from: transaction.from,
          to: transaction.to,
          value: transaction.value,
          data: transaction.data,
        },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(
      `Unable to fetch simulation results": ${url} ${response.status} ${response.statusText}.`,
    );
  }

  const json = await response.json();
  console.log(json);
  return json.result;
}
