import { Connection, PublicKey } from "@solana/web3.js";
import { getTokenAccounts } from "../wallet_scanner"
import { v2Wallets } from "../config/wallets";
import { PrismaClient } from "@prisma/client";

//Create instance of prisma
const prisma = new PrismaClient();

console.clear();
console.log("Starting...");

const solanaConnection = new Connection(String(process.env.RPC_ENDPOINT))
const LAMPORTS_PER_SOL = 1_000_000_000; // 1 billion lamports per SOL

const calculateSolana = (lamports: number) => {
  return lamports / LAMPORTS_PER_SOL
}

const interval = 400
// while (true) {
let promise = Promise.resolve();
v2Wallets.forEach(wallet => {
  promise = promise.then(async () => {
    // get solana balance in wallet
    let pubKey = new PublicKey(wallet)
    let solanaBalance = calculateSolana(await solanaConnection.getBalance(pubKey))

    // get legend balance in wallet
    let tokenStatus = await getTokenAccounts([wallet], solanaConnection)
    let legendBalance = tokenStatus.length > 0 ? tokenStatus[0].balance : 0
    // console.log(wallet)
    // console.log(legendBalance)
    // console.log(solanaBalance)

    await prisma.wallet.upsert({
      where: {
        address: wallet,
      },
      update: {
        solana: solanaBalance,
        legend: legendBalance,
      },
      create: {
        address: wallet,
        solana: solanaBalance,
        legend: legendBalance,
      },
    })

    return new Promise(resolve => {
      setTimeout(resolve, interval);
    });
  });
});

promise.then(() => {
  console.log('Loop finished.');
});
// }