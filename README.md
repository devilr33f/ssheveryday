# ssheveryday

a telegram bot that posts a freshly generated, real, completely useless ssh keypair to a channel every day — in a different key algorithm each time.

nobody should ever use these keys. that's the joke: a perfectly valid, perfectly pointless keypair, leaked on purpose, daily.

## what it does

once a day, on a cron schedule, it:

1. picks a random key algorithm (never the same as the previous run)
2. generates a real keypair with the system `ssh-keygen`
3. posts the private key, public key, fingerprint, and randomart to a telegram channel

algorithms in rotation: `ed25519`, `ecdsa` (256/384/521), `rsa` (2048/3072/4096).

## example post

```
ssh key of the day • jun 06 2026

private key:
-----BEGIN OPENSSH PRIVATE KEY-----
…
-----END OPENSSH PRIVATE KEY-----

public key:
ssh-ed25519 AAAAC3Nz…

fingerprint:
SHA256:…useless (ED25519)

+--[ED25519 256]--+
…randomart…
+----[SHA256]-----+
```

rsa-4096 private keys are too big for a single telegram message (the 4096-char limit), so on those days the private key is sent as an `id_rsa` file attachment with the public key + randomart in a follow-up message.

## configuration

env vars (copy `.env.example` to `.env`):

| var | required | default | description |
|-----|----------|---------|-------------|
| `BOT_TOKEN` | yes | — | telegram bot token (the bot must be an **admin** of the channel) |
| `CHANNEL_ID` | yes | — | channel handle (`@name`) or numeric id (`-100…`) |
| `CRON_SCHEDULE` | no | `0 9 * * *` | when to post (standard 5-field cron) |
| `TZ` | no | `UTC` | timezone for the schedule and the post's date line |
| `ADMIN_CHAT_ID` | no | — | optional chat to ping if a daily run fails |

## running

```bash
docker build -t ssheveryday .
docker run -d --restart unless-stopped --env-file .env --name ssheveryday ssheveryday
```

the container is **post-only** — it doesn't poll for updates or respond to commands. it runs the scheduler and stays alive.

a prebuilt image is published to `ghcr.io/<owner>/ssheveryday` by ci on pushes to `main`.

## development

requires **node 26** and **pnpm**. `ssh-keygen` must be on `PATH` (true on linux/macos, and via git bash / windows openssh).

```bash
pnpm install
pnpm test        # vitest — some tests shell out to real ssh-keygen
pnpm typecheck   # tsc --noEmit
pnpm start       # run locally against a filled .env
```

esm-only, typescript, run directly via `tsx` (no build step).

## how it's built

| file | responsibility |
|------|----------------|
| `src/config.ts` | load + validate env |
| `src/keygen.ts` | pick the algorithm, generate the keypair via `ssh-keygen` |
| `src/format.ts` | render the message (inline, or file-fallback for rsa-4096) |
| `src/sender.ts` | dispatch to telegram via puregram |
| `src/scheduler.ts` | the daily cron job + error handling |
| `src/index.ts` | entrypoint |

## license

it generates throwaway keys for laughs. do whatever you want with it.
