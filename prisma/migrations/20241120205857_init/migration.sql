/*
  Warnings:

  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/

-- CreateTable
CREATE TABLE "Wallet" (
    "address" TEXT NOT NULL,
    "balance" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "Wallet_pkey" PRIMARY KEY ("address")
);
