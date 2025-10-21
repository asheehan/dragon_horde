/*
  Warnings:

  - You are about to drop the column `balance` on the `Wallet` table. All the data in the column will be lost.
  - Added the required column `legend` to the `Wallet` table without a default value. This is not possible if the table is not empty.
  - Added the required column `solana` to the `Wallet` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Wallet" DROP COLUMN "balance",
ADD COLUMN     "legend" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "solana" DOUBLE PRECISION NOT NULL;
