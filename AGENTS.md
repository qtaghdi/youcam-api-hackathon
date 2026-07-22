# Presence + Boundra Working Agreement

Presence is a Boundra dogfooding application. Treat the application and the
companion framework at `../boundra` as one feedback loop while keeping them as
independently buildable and deployable repositories.

## Required application workflow

- Preserve the domain manifests under `src/lib/domains/*/domain.json`.
- App routes import domain code only through declared `public.ts` entrypoints.
- Cross-domain imports require a declared acyclic `dependsOn` edge.
- Network-facing domain operations use a Boundra contract on both the client
  and server sides.
- Run `pnpm check`, `pnpm test`, `pnpm lint`, and `pnpm build` after relevant
  changes. `pnpm check` includes the Boundra boundary gate.

## Runtime error ownership

- `RUNTIME-001`: fix the caller or input schema mismatch.
- `RUNTIME-002`: fix the handler/transport result or result schema mismatch.
- `RUNTIME-003`: inspect the original cause and fix the domain transport,
  endpoint, or handler. Intentional cancellation must remain cancellation.
- Keep user-facing API errors localized and do not expose internal causes in
  production responses.

## Writing and typography

- Do not use em dashes (`U+2014`) or en dashes (`U+2013`) in hand-authored
  product copy, documentation, code comments, commit messages, or pull request
  text.
- Rewrite the sentence with a period, comma, colon, or parentheses instead.
  Use an ASCII hyphen only where it is grammatically appropriate.
- Do not rewrite vendored or generated files under `docs/youcam-api` solely to
  enforce this typography rule.

## Framework feedback loop

- If an issue is specific to Presence, fix it here.
- If the same issue is a framework-neutral contract, transport, boundary, or
  diagnostic gap, document and test the behavior in `../boundra` first, then
  implement it there without breaking existing consumers.
- Verify Boundra with at least `pnpm typecheck` and `pnpm test-runtime`, then
  re-run the Presence checks.
- Keep Presence on a published npm version of `boundra`; do not commit a
  sibling `file:` or `link:` dependency because production builds cannot access
  the sibling repository.
- Do not publish Boundra or change its released version without explicit user
  approval. Adopt new APIs here after the corresponding npm release.
