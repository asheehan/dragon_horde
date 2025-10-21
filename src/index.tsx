import { Elysia } from "elysia";
import { html, Html } from '@elysiajs/html'
import { PrismaClient } from "@prisma/client";

import { getLegendTokens } from './wallet_scanner';
import { index } from "./templates/index";

const prisma = new PrismaClient();

const app = new Elysia()
  .use(html())
  .get("/6db8f6b2-c4d4-4ea8-984d-45540ae23724", async () => {
    // .get("/", async () => {
    console.log("hit it!")

    console.log(`client: ${prisma}`)
    let tokens = await prisma.wallet.findMany({
      orderBy: [
        {
          legend: 'desc',
        },
      ]
    })

    // console.log(tokens)

    let metadata = {
      solana_balance: tokens.reduce((acc, v) => acc + v.solana, 0),
      legend_balance: tokens.reduce((acc, v) => acc + v.legend, 0)
    }

    console.log(tokens)
    return index(tokens, metadata)
  })
  .listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);

const scanner = async () => {
  console.log('running scanner')
  const proc = Bun.spawn(["bun", "scanner"]);
  console.log(await proc.exited); // 0
}

setInterval(scanner, 80_000)
// const proc = Bun.spawn(["bun", "run", "src/scripts/scanner.ts"])