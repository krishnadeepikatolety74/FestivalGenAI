# UtsavMitra — Local VS Code Export

This archive is a sanitized, self-contained copy of the current UtsavMitra full-stack project. It includes the complete React source tree, UI components, pages, Express/tRPC server, Groq integration, database schema and migrations, styles, configuration, lockfile, and all image assets used by the current experience.

## Run locally

Use Node.js 22 or a compatible current Node.js release. From this folder, run:

```bash
pnpm install
pnpm dev
```

Then open the local URL printed by Vite. The project uses hash previews for the main screens, including `#signin`, `#signup`, `#plan`, `#recipes`, and `#invitations`.

## Production build

```bash
pnpm check
pnpm build
pnpm start
```

## Secrets

No API keys, tokens, passwords, private keys, `.env` files, Manus project metadata, build output, dependency folders, or development logs are included. The frontend still contains the original integration code paths that read environment variables, but the actual values were intentionally omitted. Configure any optional values in a local `.env` file only if you add backend or third-party integrations.

## Image assets

All current image references were rewritten from managed storage paths to local `/assets/...` paths so the exported project runs directly in VS Code. The original landing hero image is preserved; the remaining current photo assets are bundled under `client/public/assets/`.
