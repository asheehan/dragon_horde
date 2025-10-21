# Wallet Configuration Security Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Move hardcoded wallet addresses to external JSON configuration before open-sourcing the repository

**Architecture:** Create a configuration loader that reads wallet addresses from a gitignored `wallets.json` file. Maintain backward compatibility by exporting the same named exports that existing code expects. Include template files and security checklist.

**Tech Stack:** TypeScript, Node.js fs module, JSON configuration

---

## Task 1: Setup Configuration Infrastructure

**Files:**
- Modify: `.gitignore`
- Create: `src/config/wallets.ts`
- Create: `wallets.json.example`
- Create: `.env.example`

### Step 1: Update .gitignore to exclude private configuration

Add to `.gitignore`:

```
# Private wallet configuration
wallets.json
```

### Step 2: Verify .gitignore change

Run: `git diff .gitignore`
Expected: Shows `wallets.json` added to gitignore

### Step 3: Create wallet configuration loader

Create file: `src/config/wallets.ts`

```typescript
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
```

### Step 4: Create template configuration file

Create file: `wallets.json.example`

```json
{
  "_README": "Copy this file to wallets.json and replace with your wallet addresses to monitor",
  "legendWallets": [
    "CBBPAgBcfP4V8dXJyAeSm8exDDo896dk8yXL94RS2r2N",
    "EmqnKYHM9S82XJq53VSQa5WMXJer8AZkw2L5ofkvmb5Y"
  ],
  "v2Wallets": [
    "CBBPAgBcfP4V8dXJyAeSm8exDDo896dk8yXL94RS2r2N"
  ]
}
```

### Step 5: Create environment variable template

Create file: `.env.example`

```bash
# Solana RPC Endpoint
RPC_ENDPOINT=https://api.mainnet-beta.solana.com

# PostgreSQL Database URL
DATABASE_URL=postgresql://user:password@localhost:5432/dbname
```

### Step 6: Commit configuration infrastructure

```bash
git add .gitignore src/config/wallets.ts wallets.json.example .env.example
git commit -m "feat: add wallet configuration infrastructure

- Add wallets.json to gitignore
- Create config loader with validation and error handling
- Add wallets.json.example template
- Add .env.example template for environment variables"
```

---

## Task 2: Create Private Wallet Configuration

**Files:**
- Create: `wallets.json` (local only, gitignored)

### Step 1: Copy current wallet addresses to wallets.json

Read the wallet addresses from:
- `src/data/wallets.ts` (LEGEND_WALLETS array)
- `src/data/v2_wallets.ts` (LEGEND_WALLETS array)

Create file: `wallets.json`

```json
{
  "legendWallets": [
    "CBBPAgBcfP4V8dXJyAeSm8exDDo896dk8yXL94RS2r2N",
    "EmqnKYHM9S82XJq53VSQa5WMXJer8AZkw2L5ofkvmb5Y",
    ... (copy all addresses from src/data/wallets.ts)
  ],
  "v2Wallets": [
    ... (copy all addresses from src/data/v2_wallets.ts)
  ]
}
```

### Step 2: Verify wallets.json is gitignored

Run: `git status`
Expected: `wallets.json` should NOT appear in untracked files (it's gitignored)

### Step 3: Verify wallets.json is valid JSON

Run: `node -e "console.log(JSON.parse(require('fs').readFileSync('wallets.json', 'utf-8')))"`
Expected: JSON parses successfully without errors

---

## Task 3: Migrate src/data/wallets.ts

**Files:**
- Modify: `src/data/wallets.ts`

### Step 1: Update src/data/wallets.ts to import from config

Replace entire file content:

```typescript
export { legendWallets as LEGEND_WALLETS } from '../config/wallets';
```

### Step 2: Verify the change

Run: `cat src/data/wallets.ts`
Expected: Single line importing and re-exporting from config

### Step 3: Test that imports still work

Run: `bun run -e "import { LEGEND_WALLETS } from './src/data/wallets'; console.log('Loaded', LEGEND_WALLETS.length, 'wallets')"`
Expected: Prints wallet count without errors

### Step 4: Commit the migration

```bash
git add src/data/wallets.ts
git commit -m "refactor: migrate wallets.ts to use config loader

Imports wallet addresses from config instead of hardcoding them"
```

---

## Task 4: Migrate src/data/v2_wallets.ts

**Files:**
- Modify: `src/data/v2_wallets.ts`

### Step 1: Update src/data/v2_wallets.ts to import from config

Replace entire file content:

```typescript
export { v2Wallets as LEGEND_WALLETS } from '../config/wallets';
```

### Step 2: Verify the change

Run: `cat src/data/v2_wallets.ts`
Expected: Single line importing and re-exporting from config

### Step 3: Test that imports still work

Run: `bun run -e "import { LEGEND_WALLETS } from './src/data/v2_wallets'; console.log('Loaded', LEGEND_WALLETS.length, 'v2 wallets')"`
Expected: Prints wallet count without errors

### Step 4: Commit the migration

```bash
git add src/data/v2_wallets.ts
git commit -m "refactor: migrate v2_wallets.ts to use config loader

Imports wallet addresses from config instead of hardcoding them"
```

---

## Task 5: Migrate src/wallets.ts

**Files:**
- Read: `src/wallets.ts` (to understand current structure)
- Modify: `src/wallets.ts`

### Step 1: Read current src/wallets.ts structure

Run: `cat src/wallets.ts`
Note: Determine what's exported and update accordingly

### Step 2: Update src/wallets.ts to import from config

If it exports `LEGEND_WALLETS`, replace with:

```typescript
export { legendWallets as LEGEND_WALLETS } from './config/wallets';
```

If it has a different structure, adapt the import while maintaining the same export name.

### Step 3: Test that imports still work

Run: `bun run -e "import { LEGEND_WALLETS } from './src/wallets'; console.log('Loaded', LEGEND_WALLETS.length, 'wallets')"`
Expected: Prints wallet count without errors

### Step 4: Commit the migration

```bash
git add src/wallets.ts
git commit -m "refactor: migrate wallets.ts to use config loader

Imports wallet addresses from config instead of hardcoding them"
```

---

## Task 6: Integration Testing

**Files:**
- Test: `src/scripts/scanner.ts`
- Test: `src/scripts/v2_scanner.ts`
- Test: `src/wallet_scanner.ts`

### Step 1: Test scanner script

Run: `bun run src/scripts/scanner.ts`
Expected: Scanner runs without errors, connects to RPC, processes wallets

Note: This requires RPC_ENDPOINT to be set. If it fails with connection errors, that's expected (just verify no import/config errors).

### Step 2: Test v2 scanner script

Run: `bun run src/scripts/v2_scanner.ts`
Expected: Scanner runs without errors, same as above

### Step 3: Test error handling - missing config file

```bash
mv wallets.json wallets.json.backup
bun run -e "import { LEGEND_WALLETS } from './src/data/wallets'; console.log(LEGEND_WALLETS)"
mv wallets.json.backup wallets.json
```

Expected: Clear error message: "wallets.json not found. Copy wallets.json.example to wallets.json and configure your wallet addresses."

### Step 4: Test error handling - malformed JSON

```bash
echo "{ invalid json" > wallets.json.test
mv wallets.json wallets.json.backup
mv wallets.json.test wallets.json
bun run -e "import { LEGEND_WALLETS } from './src/data/wallets'; console.log(LEGEND_WALLETS)" || true
mv wallets.json.backup wallets.json
```

Expected: Error message about invalid JSON

### Step 5: Test error handling - missing fields

```bash
echo '{"legendWallets": []}' > wallets.json.test
mv wallets.json wallets.json.backup
mv wallets.json.test wallets.json
bun run -e "import { LEGEND_WALLETS } from './src/data/wallets'; console.log(LEGEND_WALLETS)" || true
mv wallets.json.backup wallets.json
```

Expected: Error message: "wallets.json must contain 'v2Wallets' array"

### Step 6: Commit test verification notes

```bash
git commit --allow-empty -m "test: verify wallet config loader integration

All scanner scripts work with new configuration system.
Error handling tested for missing file, malformed JSON, and missing fields."
```

---

## Task 7: Update Documentation

**Files:**
- Modify: `README.md`

### Step 1: Add configuration section to README.md

Find the appropriate location in `README.md` (after "Getting Started" or "Development" section) and add:

```markdown
## Configuration

### Wallet Configuration

1. Copy the example configuration file:
   ```bash
   cp wallets.json.example wallets.json
   ```

2. Edit `wallets.json` and replace the example addresses with your wallet addresses to monitor:
   ```json
   {
     "legendWallets": ["your-wallet-address-1", "your-wallet-address-2"],
     "v2Wallets": ["your-v2-wallet-address"]
   }
   ```

3. The `wallets.json` file is gitignored and won't be committed to the repository

### Environment Variables

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and configure your environment variables:
   - `RPC_ENDPOINT`: Your Solana RPC endpoint URL
   - `DATABASE_URL`: Your PostgreSQL database connection string

3. The `.env` file is gitignored and won't be committed
```

### Step 2: Verify documentation is clear

Run: `cat README.md | grep -A 20 "## Configuration"`
Expected: Shows the new configuration section

### Step 3: Commit documentation

```bash
git add README.md
git commit -m "docs: add configuration setup instructions

Added instructions for:
- Setting up wallets.json
- Setting up environment variables
- Clear steps for new users"
```

---

## Task 8: Pre-Migration Security Audit

**Files:**
- Verify: All files about to be committed

### Step 1: Verify wallets.json is gitignored

Run: `git status`
Expected: `wallets.json` does NOT appear in output (it's gitignored)

### Step 2: Scan for hardcoded environment variables

Run: `grep -r "RPC_ENDPOINT\|DATABASE_URL" . --exclude-dir=.git --exclude-dir=node_modules --exclude="*.example" --exclude-dir=docs`
Expected: Only shows `process.env.RPC_ENDPOINT` and `env("DATABASE_URL")` references, no hardcoded values

### Step 3: Verify no wallet addresses in committed files

Run: `git grep -n "CBBPAgBcfP4V8dXJyAeSm8exDDo896dk8yXL94RS2r2N" -- ':!wallets.json.example'`
Expected: Only appears in wallets.json.example (which is safe to commit as an example)

### Step 4: Review staged files

Run: `git status`
Expected: Only these files modified/added:
- `.gitignore`
- `src/config/wallets.ts`
- `wallets.json.example`
- `.env.example`
- `src/data/wallets.ts`
- `src/data/v2_wallets.ts`
- `src/wallets.ts`
- `README.md`

### Step 5: Final security checklist

Verify:
- [x] `wallets.json` in `.gitignore`
- [x] `.env` in `.gitignore`
- [x] No hardcoded RPC endpoints
- [x] No hardcoded database URLs
- [x] No hardcoded wallet addresses (except in .example files)
- [x] fly.toml contains only app config (no secrets)

### Step 6: Document security audit completion

```bash
git commit --allow-empty -m "security: pre-migration audit complete

Verified:
- All secrets in gitignored files
- No hardcoded credentials
- Only safe examples in .example files
- Ready for public GitHub repository"
```

---

## Task 9: GitHub Migration

**Files:**
- All repository files

### Step 1: Ensure all work is committed

Run: `git status`
Expected: "nothing to commit, working tree clean"

If there are uncommitted changes, commit them first.

### Step 2: Remove git history

```bash
rm -rf .git
```

Warning: This permanently removes all git history. Make sure this is what you want.

### Step 3: Initialize fresh git repository

```bash
git init
```

Expected: Initialized empty Git repository

### Step 4: Stage all files for initial commit

```bash
git add .
```

### Step 5: Verify wallets.json is NOT staged

Run: `git status`
Expected: `wallets.json` should NOT appear in staged files (it's gitignored)

If it appears, something is wrong with `.gitignore`.

### Step 6: Create initial commit

```bash
git commit -m "Initial commit

Dragon Horde - Solana wallet monitoring application

Features:
- Token balance tracking for multiple wallets
- Configurable wallet lists via JSON
- PostgreSQL storage with Prisma
- Fly.io deployment ready
- Environment-based configuration"
```

### Step 7: Add GitHub remote

```bash
git remote add origin git@github.com:asheehan/dragon_horde.git
```

### Step 8: Push to GitHub

```bash
git branch -M main
git push -u origin main
```

Expected: Successfully pushes to GitHub

### Step 9: Verify on GitHub

Visit: https://github.com/asheehan/dragon_horde

Verify:
- [ ] Repository contains expected files
- [ ] `wallets.json` is NOT in the repository
- [ ] `.env` is NOT in the repository
- [ ] `wallets.json.example` IS in the repository
- [ ] `.env.example` IS in the repository
- [ ] README.md shows configuration instructions
- [ ] Only one commit in history (Initial commit)

---

## Success Criteria

After completing all tasks:

- ✅ No wallet addresses hardcoded in source files
- ✅ `wallets.json` successfully gitignored
- ✅ Template files provide clear setup instructions
- ✅ All scanner functionality works unchanged
- ✅ Clear error messages guide users to fix configuration issues
- ✅ GitHub repository has clean history with no wallet exposure
- ✅ Environment variables properly documented
- ✅ Security audit passed

## Rollback Plan

If something goes wrong during GitHub migration:

1. The GitLab repository still has full history
2. Can re-clone from GitLab and try again
3. No data loss since local `wallets.json` is preserved

## Notes

- **YAGNI**: Only implementing what's needed - single JSON config, basic validation
- **DRY**: Config loader used by all wallet files, no duplication
- **Security**: Multiple layers of verification before public push
- **Backward Compatibility**: Existing code works without changes
