# Your Money Talks: Zcash Privacy Demo

An interactive demo that shows what AI can infer from transparent financial records, then shows how that same analysis breaks down once the activity moves into Zcash's shielded pool.

Pick a persona, inspect a transparent ledger, and let the app build a surveillance profile from it. Then run the same exercise against shielded Zcash activity and watch the profile collapse.

## Run it

```bash
pnpm install
pnpm dev
```

Open http://localhost:5173

### Live AI mode (optional)

The demo ships with pre-written surveillance profiles, so it works without any API setup. If you want live Claude API calls instead:

```bash
cp .env.example .env
# Add your Anthropic API key to .env
```

The Vite dev server proxies API requests, so there are no CORS issues and the key never touches the browser.

The production build makes no API calls, so the live mode only works under `pnpm dev`.

## Build and deploy

```bash
pnpm build
```

Vite writes a static site to `dist/`.

The site is served by a Cloudflare Worker as static assets. To check that build in the Worker runtime:

```bash
pnpm run dev:worker
```

This builds and serves `dist/` at http://127.0.0.1:8787.

To deploy:

```bash
pnpm run deploy
```

The Worker has no public hostname yet (workers.dev and preview URLs are off). A domain is added to `cloudflare.config.ts` once it's picked.

## Tech stack

- React 19 + TypeScript
- Vite 8 with Tailwind CSS v4
- Cloudflare Workers (static assets)
- Anthropic API (optional, proxied through Vite dev server)
- Zero runtime dependencies beyond React

## What the demo proves

One transaction does not say much. A full ledger does. AI can turn a transparent payment trail into guesses about work, politics, health, relationships, and travel.

Zcash changes that tradeoff. Shielded transactions hide sender, receiver, amount, and memo while zero-knowledge proofs still let the network verify the transfer is valid. Transaction IDs and block timing remain visible, but the profile data does not.
