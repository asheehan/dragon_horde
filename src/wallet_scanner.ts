/* Wallet scanning functions */

import { Connection, GetProgramAccountsFilter, PublicKey } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { legendWallets } from "./config/wallets";

export function getLegendTokens() {
  const solanaConnection = new Connection(String(process.env.RPC_ENDPOINT))
  return getTokenAccounts(legendWallets, solanaConnection)
}

export async function getTokenAccounts(wallets: Array<string>, solanaConnection: Connection) {
  // const LEGEND_TOKEN = 'A9xPNYqmsipKKtiBdTsKGRiudfSuXWd82LmR9wYeiFfj'
  const LEGEND_TOKEN = 'G2jXu2puUqyQsXmcL7SammGfkHX734wLZPce7yDepump'

  let accountData = []
  for (let wallet of wallets) {
    const filters: GetProgramAccountsFilter[] = [
      {
        dataSize: 165,    //size of account (bytes)
      },
      {
        memcmp: {
          offset: 32,     //location of our query in the account (bytes)
          bytes: wallet,  //our search criteria, a base58 encoded string
        }
      },
      {
        memcmp: {
          offset: 0, // searching for the mint
          bytes: LEGEND_TOKEN
        }
      }
    ];

    // handle when no legend is found
    let tokenAccounts = await solanaConnection.getParsedProgramAccounts(
      TOKEN_PROGRAM_ID,
      { filters }
    )

    // tokenAccounts = tokenAccounts.filter(a => !a)
    if (tokenAccounts[0]) {
      accountData.push({
        wallet: wallet,
        //@ts-ignore
        balance: tokenAccounts[0].account.data["parsed"]["info"]["tokenAmount"]["uiAmount"],
      })
    }
  }
  return accountData
}