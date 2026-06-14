Break the task to as smaller steps possible and execute them one by one.
Examine all existing code carefully.
Try to integrate with existing code rather than adding new code.
Never special-case unless absolutely necessary. Instead, extend existing interfaces to support the new case elegantly.
If possible to delete or rewrite code to enable a feature, that would be better.
If a utility/hook can be extracted to be reused in multiple places it should be done so early.
Pages with similar functionality should have their internals extracted to shared utilities.
Prefer small variable names, but not abbreviations, make it readable.
Use comments only to describe the code "why", not the changes that you did.
Use modern JavaScript/TypeScript features, such as optional chaining `?.` rather than if blocks.
Trace the path of execution and analyze each step before acting.
When a problem persists, add debug logs to see what is happening.
Never use // @ts-nocheck or // @ts-ignore unless absolutely necessary.
Always use file extensions for imports.
Use Tailwindcss, for widths and heights prefer the units `dvw` and `dvh`.
Consolidate rather than duplicate. Be pragmatic.
Don't write defensive code. No defensive statements unless explicitly instructed to. No out-of-bounds checks or anything similar. When a path is ambiguous it is better to throw an error.
Never create tests and never run the tests unless explicitly said so.
Never swallow errors, either throw or print with console.error(e).
Never run the dev server yourself. Never restart the dev server.
Never overwrite a migration file unless explicitly instructed to. Always create new migrations by default, taking into account the schema so far and make sure the filename sorts last (prefix with timestamp).
Don't test if the app compiles or runs.
In Tailwind code, never use transition classes unless explicitly asked to.
Don't do defensive programming, use guards only where it is absolutely necessary. ALWAYS THROW on invalid paths. No early returns or swallowing errors.
Don't run builds yourself. Don't run `npm run build` or similar.
Never run `bun run build` or any build command.
Don't create summary documents or README documents.
Skip the summary of what you did. Just do the thing.
AssemblyScript code requires all variables to be explicitly typed and all casts done manually, i.e from f64 to f32 or i32 to f32 etc.
In AssemblyScript Map get operations required a .has() check first.
You should run code to test things using `bun -e`.
You should typecheck with `bunx tsc --noEmit`.

## Build, run & deploy

The "never run the dev server / never run builds" rules above apply to routine
code-editing sessions. The commands in this section are for a human or an agent
explicitly tasked with building, running, or deploying the app.

Runtime: Bun is the package manager, dev runner, and production server. No
Node/npm required.

Install dependencies:

    bun install

Typecheck only (no build):

    bunx tsc --noEmit

Local development (runs the Vite client and the Bun server together; the client
proxies `/api`, `/analytics`, `/gallery`, `/graffiti`, `/photos` to the server
on port 3001):

    bun run dev

Production build and run (a single Bun process serves the built client, the HTTP
API, the multiplayer WebSocket, and the SQLite store, all on `PORT`, default
3001):

    bun install
    bun run build      # `tsc` typecheck + `vite build` -> dist/
    bun run start      # `bun server.ts`; open http://localhost:3001

Persistent state lives in `data/club.sqlite` (gitignored): chat history,
graffiti, and the synced duck/bridge state. Never delete it between deploys, and
back it up.

Deploy: pushing to `main` triggers `.github/workflows/deploy.yaml`, which over
SSH (1) rsyncs the repo to `REMOTE_PATH` excluding `node_modules/`, `data/`,
`.env`, and `storage/`, (2) `systemctl stop hallucinate`, (3) `bun install &&
bun run build`, then (4) `systemctl start hallucinate`. Feature branches do not
deploy — merge to `main` (or run the workflow via `workflow_dispatch` once
`main` has the code).

The deploy workflow needs these GitHub Actions secrets: `SSH_PRIVATE_KEY`,
`SSH_HOST`, `SSH_USER`, `SSH_PORT`, `REMOTE_PATH`. The server host needs Bun on
`PATH`, a `hallucinate` systemd unit that runs `bun server.ts`, passwordless
`sudo` for `systemctl`, a persistent `data/` directory, and a reverse proxy
terminating TLS in front of `PORT`.

Whenever a client/server message format changes, bump `protocolVersion` in
`src/protocol.ts`; on deploy the server rejects mismatched clients and they
auto-reload onto the new build.
