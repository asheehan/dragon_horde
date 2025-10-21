# Wallet Configuration Security Design

**Date:** 2025-10-21
**Status:** Approved
**Goal:** Remove hardcoded wallet addresses from source code before open-sourcing the repository

## Context

Dragon Horde is a Solana wallet monitoring application that tracks token balances for specific wallet addresses. Currently, wallet addresses are hardcoded in TypeScript files (`src/data/wallets.ts`, `src/data/v2_wallets.ts`, `src/wallets.ts`). Before open-sourcing on GitHub, these private wallet addresses need to be moved to external configuration.

## Requirements

1. **Make configurable:** Move wallet addresses to gitignored config files with template examples
2. **JSON format:** Use structured JSON files for wallet configuration
3. **Single consolidated file:** All wallet lists in one `wallets.json` file
4. **Real examples:** Template should include real Solana addresses for format clarity
5. **Clean GitHub migration:** Fresh git history with no wallet exposure
6. **Zero breaking changes:** Existing scanner code should work without modifications

## Design

### File Structure

**New files:**
- `wallets.json` - Private wallet configuration (gitignored, local only)
- `wallets.json.example` - Template with example addresses (committed to repo)
- `.env.example` - Environment variable template for new users
- `src/config/wallets.ts` - Configuration loader utility

**Modified files:**
- `src/data/wallets.ts` - Import from config instead of hardcoding
- `src/data/v2_wallets.ts` - Import from config instead of hardcoding
- `src/wallets.ts` - Import from config instead of hardcoding
- `.gitignore` - Add `wallets.json` entry
- `README.md` - Add configuration setup instructions

### JSON Structure

The consolidated `wallets.json` will use this structure:

```json
{
  "legendWallets": ["address1", "address2", ...],
  "v2Wallets": ["address1", "address2", ...]
}
```

This maintains logical separation while keeping all wallet lists in one file.

### Config Loader Implementation

**Location:** `src/config/wallets.ts`

**Responsibilities:**
1. Read `wallets.json` from project root
2. Parse and validate JSON structure
3. Provide clear error messages for missing/malformed config
4. Export typed wallet arrays

**TypeScript interface:**
```typescript
interface WalletConfig {
  legendWallets: string[];
  v2Wallets: string[];
}
```

**Error handling:**
- Missing file: "wallets.json not found. Copy wallets.json.example to wallets.json and configure your wallet addresses."
- Malformed JSON: "Invalid JSON in wallets.json: [parse error details]"
- Missing fields: "wallets.json must contain 'legendWallets' and 'v2Wallets' arrays"
- Invalid structure: Validate that both fields are arrays of strings

**Export approach:**
```typescript
export const { legendWallets, v2Wallets } = loadWalletConfig();
```

### Migration Strategy

**Existing file changes:**

Before:
```typescript
// src/data/wallets.ts
export const LEGEND_WALLETS = ['hardcoded', 'addresses', ...]
```

After:
```typescript
// src/data/wallets.ts
export { legendWallets as LEGEND_WALLETS } from '../config/wallets'
```

This maintains backward compatibility - no changes needed in scanner code that imports `LEGEND_WALLETS`.

### Template File

**File:** `wallets.json.example`

```json
{
  "_README": "Copy this file to wallets.json and replace with your wallet addresses",
  "legendWallets": [
    "CBBPAgBcfP4V8dXJyAeSm8exDDo896dk8yXL94RS2r2N",
    "EmqnKYHM9S82XJq53VSQa5WMXJer8AZkw2L5ofkvmb5Y"
  ],
  "v2Wallets": [
    "CBBPAgBcfP4V8dXJyAeSm8exDDo896dk8yXL94RS2r2N"
  ]
}
```

Includes 2-3 real example addresses to demonstrate valid Solana address format.

### User Setup Experience

**README.md additions:**

```markdown
## Configuration

1. Copy `wallets.json.example` to `wallets.json`:
   ```bash
   cp wallets.json.example wallets.json
   ```

2. Edit `wallets.json` and replace the example addresses with your wallet addresses to monitor

3. The `wallets.json` file is gitignored and won't be committed to the repository
```

### GitHub Migration Plan

Since the repository is migrating from GitLab to GitHub, we'll use this opportunity to create a clean history:

1. Complete wallet refactoring on GitLab
2. Remove git history:
   ```bash
   rm -rf .git
   git init
   git add .
   git commit -m "Initial commit"
   ```
3. Push to GitHub:
   ```bash
   git remote add origin git@github.com:asheehan/dragon_horde.git
   git push -u origin main
   ```

**Result:** GitHub repository has zero history of hardcoded wallet addresses.

## Implementation Steps

1. **Setup & configuration**
   - Add `wallets.json` to `.gitignore`
   - Create `src/config/wallets.ts` loader utility
   - Create `wallets.json.example` template

2. **Migrate existing code**
   - Update `src/data/wallets.ts` to import from config
   - Update `src/data/v2_wallets.ts` to import from config
   - Update `src/wallets.ts` to import from config
   - Create private `wallets.json` with actual addresses

3. **Testing**
   - Verify scanner scripts work with new config
   - Test error handling (missing file scenarios)
   - Confirm all wallet lists load correctly

4. **Documentation**
   - Update README.md with configuration instructions
   - Create `.env.example` template

5. **Pre-migration security audit**
   - Run security checklist (see below)
   - Verify no secrets in files being committed

6. **GitHub migration**
   - Wipe git history (fresh init)
   - Create initial commit with cleaned codebase
   - Push to `git@github.com:asheehan/dragon_horde.git`
   - Verify `wallets.json` is not in repo (gitignored)

## Success Criteria

- ✅ No wallet addresses hardcoded in source files
- ✅ `wallets.json` successfully gitignored
- ✅ Template file provides clear setup instructions
- ✅ All scanner functionality works unchanged
- ✅ Clear error messages guide users to fix configuration issues
- ✅ GitHub repository has clean history with no wallet exposure

## Trade-offs

**Chosen approach (Single JSON file):**
- ✅ Simple - one configuration file to manage
- ✅ Easy to understand and edit
- ❌ Less modular than separate files per list
- ❌ All-or-nothing updates (can't update individual lists in isolation)

**Rejected alternatives:**
- Multiple JSON files (wallets.json, v2_wallets.json): More files to track
- Environment variables: Poor fit for large address lists, harder to manage
- Combined JSON + env approach: Unnecessary complexity for current needs

## Pre-Migration Security Checklist

Run this checklist before pushing to GitHub to ensure no secrets are exposed:

### Environment Variables (Already Secured ✅)
- [x] `RPC_ENDPOINT` - Using `process.env.RPC_ENDPOINT` (not hardcoded)
- [x] `DATABASE_URL` - Using `env("DATABASE_URL")` in Prisma (not hardcoded)
- [x] `.env` file is in `.gitignore`
- [ ] Create `.env.example` template for users

### Wallet Addresses (Work in Progress)
- [ ] Wallet addresses moved to `wallets.json`
- [ ] `wallets.json` added to `.gitignore`
- [ ] `wallets.json.example` template created
- [ ] Old hardcoded wallet files removed or updated to import from config

### Fly.io Configuration (Already Safe ✅)
- [x] `fly.toml` contains only app config (no secrets)
  - App name: `walletz-app`
  - Region, ports, deployment settings (all safe to commit)
- [x] No fly.io API keys or tokens in code

### Files Safe to Commit
- ✅ `package.json` - No secrets, only dependencies
- ✅ `prisma/schema.prisma` - Uses env vars, no hardcoded credentials
- ✅ `fly.toml` - App configuration only
- ✅ TypeScript source files (after wallet refactoring)

### Final Verification Before Push
- [ ] Run: `grep -r "RPC_ENDPOINT\|DATABASE_URL" . --exclude-dir=.git --exclude-dir=node_modules --exclude="*.example"`
  - Should only find env var references, no hardcoded values
- [ ] Run: `git status` - Verify `wallets.json` not staged
- [ ] Review staged files for any unexpected sensitive data
- [ ] Verify `.gitignore` includes:
  - `.env`
  - `wallets.json`
