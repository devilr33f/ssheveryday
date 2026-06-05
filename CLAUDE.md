# ssheveryday — project notes for claude

a post-only telegram bot that posts a freshly generated ssh keypair (random algorithm) to a channel daily, via puregram. deployed as a docker container. the joke is leaking a real, valid, useless keypair every day.

## stack

- node 26, esm-only, typescript — run via `tsx`, **no build step**
- module resolution is nodenext: **imports use `.js` extensions in `.ts` source**
- puregram v3 (telegram bot api), node-cron v4, vitest
- package manager: **pnpm / pnpx** — never npm / npx

## commands

```bash
pnpm install
pnpm test        # vitest; keygen + rsa-4096 tests shell out to real ssh-keygen
pnpm typecheck   # tsc --noEmit
pnpm start       # tsx src/index.ts (needs a filled .env)
docker build -t ssheveryday .
```

## architecture

small single-responsibility modules; the only network/io boundary is `sender.ts`.

- `config.ts` — env load + fail-fast validation
- `keygen.ts` — `pickAlgo` (random, never repeats the previous run) + `generateKey` (ssh-keygen in a temp dir, removed in a `finally`)
- `format.ts` — pure `formatKey(key, date, tz)` → `RenderPlan` (`'inline' | 'file'`)
- `sender.ts` — dispatch a `RenderPlan` via `tg.api.sendMessage` / `sendDocument`
- `scheduler.ts` — node-cron job wrapped in try/catch (logs + optional admin ping, never crashes the process)
- `index.ts` — entrypoint, no polling, graceful shutdown

data flow: `keygen → format → sender`, driven by `scheduler`.

## conventions

- lowercase everywhere: commit messages (conventional commits), log/error messages, bot output
- tdd: write the failing test first (mirror the existing `tests/`)
- keep modules focused — don't collapse them into one file

## gotchas

- **no dsa.** openssh 9+ (shipped in node:26-alpine) rejects `ssh-keygen -t dsa`. the pool is `ed25519` / `ecdsa`×3 / `rsa`×3. do not re-add dsa.
- **telegram limits:** message ≤ 4096 chars, caption ≤ 1024. only rsa-4096 exceeds 4096, so `format.ts` switches to file-mode (private key as an `id_rsa` document + a follow-up message). covered by `tests/integration.test.ts`.
- **ssh-keygen must be on PATH** at runtime — the dockerfile installs `openssh-keygen`.
- **esbuild build approval:** the dockerfile and ci use `pnpm install --ignore-scripts`. esbuild's binary ships via its platform optional-dependency, so no postinstall is needed; pnpm 10+ would otherwise block the build pending approval.
- **node:26-alpine has no corepack** (node 25+ dropped it) — the dockerfile installs pnpm via `npm i -g pnpm`.
- **post-only:** no `startPolling`, no command handlers. the bot never reads updates.

## docs

the design spec and implementation plan live in `docs/superpowers/` (gitignored, local-only).
