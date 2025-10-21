import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

interface WalletConfig {
  legendWallets: string[];
  v2Wallets: string[];
}

function loadWalletConfig(): WalletConfig {
  const configPath = join(process.cwd(), 'wallets.json');

  if (!existsSync(configPath)) {
    throw new Error(
      'wallets.json not found. Copy wallets.json.example to wallets.json and configure your wallet addresses.'
    );
  }

  try {
    const fileContent = readFileSync(configPath, 'utf-8');
    const config = JSON.parse(fileContent) as WalletConfig;

    // Validate structure
    if (!config.legendWallets || !Array.isArray(config.legendWallets)) {
      throw new Error("wallets.json must contain 'legendWallets' array");
    }

    if (!config.v2Wallets || !Array.isArray(config.v2Wallets)) {
      throw new Error("wallets.json must contain 'v2Wallets' array");
    }

    return config;
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error(`Invalid JSON in wallets.json: ${error.message}`);
    }
    throw error;
  }
}

const config = loadWalletConfig();

export const legendWallets = config.legendWallets;
export const v2Wallets = config.v2Wallets;
