<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## This repo runs Next.js 16 + React 19 — the gotchas that bite

- **`params` is async.** In `app/**/page.js`, `params` is a Promise. Unwrap it
  with `const { x } = await params` (server) or `use(params)` (client).
- **`ssr: false` only works inside a Client Component.** `next/dynamic(...,
  { ssr: false })` throws if evaluated in a Server Component. That's why the
  registry, `Nav`, the landing page, and the `[baseplateId]` route all carry
  `"use client"` — they touch baseplate modules that use `ssr: false`.
- **Route handlers use the Web `Request`/`Response` API** (`Response.json(...)`),
  not `NextApiRequest`/`res`.
- **Tailwind is v4** — no `tailwind.config.js`; theme lives in `app/globals.css`.
- **React Compiler is on** — components auto-memoize; skip `useMemo`/`useCallback`
  unless you have a measured reason.

## The libraries are newer than your training data too

Several packages here are past the version you'll recall, and their APIs
**renamed**. Check `package.json` and the installed package (`node_modules/<pkg>`
— its `.d.ts` or `dist/`) before writing an import. Known traps:

- `@p5-wrapper/react` is **v5**: the component is **`P5Canvas`**, not
  `ReactP5Wrapper`. It's a lazy component — wrap it in `<Suspense>`. Props:
  `sketch`, plus any custom props delivered to `updateWithProps`.
- `p5` is **v2.x** (the core drawing API is unchanged).
- `pdfjs-dist` is **v6**: prefer `page.render({ canvas, viewport })` — the old
  `canvasContext` form is legacy. Worker: `pdfjs-dist/build/pdf.worker.min.mjs`.
- `@react-three/fiber` **v9** / `@react-three/drei` **v10** are the React 19 lines.
- `recharts` is **v3**, `lucide-react` is **v1**.
- `motion` **v12** is the package formerly called `framer-motion`. Import from
  **`motion/react`**; `framer-motion` is not installed.
- `react-map-gl` **v8** has one entry point per renderer. Import from
  **`react-map-gl/maplibre`** (never bare `react-map-gl`) and load
  `maplibre-gl/dist/maplibre-gl.css`. `maplibre-gl` is **v6**.
- `web-ifc` loads a wasm binary at runtime. It's served from `public/wasm/`, so
  call `api.SetWasmPath("/wasm/")` before `api.Init()` — never point it at a CDN.
  Client-side only; `await import()` it.
- `chart.js` **v4** registers nothing by default:
  `import { Chart, registerables } from "chart.js"; Chart.register(...registerables)`.
- `suncalc` and `dxf-parser` are CommonJS — default import, not named.
- `@observablehq/plot` and `chart.js` return/own a DOM node, so they want a
  `ref` + `useEffect` in a client component, not JSX children.
- **shadcn here wraps [Base UI](https://base-ui.com), NOT Radix.** There is no
  `asChild`. To change the underlying tag, use `render` with an element, and set
  `nativeButton={false}` when it isn't a real button:
  `<Button nativeButton={false} render={<label />}>Upload</Button>`.
  Passing `asChild` silently leaks an `aschild` attribute to the DOM.

## Two traps that cost real debugging time here

- **Don't put a suspending loader inside `<Canvas>`** — e.g. drei's
  `<Environment preset="…">`, `useLoader`, `useGLTF`. When it suspends, r3f
  tears down and remounts the renderer; the disposed renderer calls
  `forceContextLoss()` on the canvas, which can never get a context again →
  "THREE.WebGLRenderer: Context Lost" and a dead canvas on **first** load only
  (it works after navigating away and back, because the asset is then cached).
  Preload outside the Canvas, or skip it. `Environment preset` also downloads an
  HDR from an external CDN (`raw.githack.com`) — skip it on flaky networks.
- **`mx-auto` on a flex item shrink-wraps it.** Auto margins absorb free space
  and override `align-self: stretch`, so a `<main className="mx-auto max-w-6xl">`
  inside a `flex flex-col` parent collapses to its content width. Keep the
  layout wrapper a plain block.

## Repo conventions

This repo has **two levels**: the **baseplates** in `baseplates/`, each a
moulded surface, and **bricks** snapped onto one in
`baseplates/<id>/bricks/<id>-XX/`. A brick is what you build; a baseplate is the
surface it snaps onto. Adding a brick never edits the baseplate or the shared
app shell.

**Scene vs artifacts vs kit.** Three different stores — do not merge them.

- **Scene** (`lib/scene.js`) is what you are looking at: building, floor,
  department, space. In-memory; export snapshots it. After remix, alias
  dashboard `selectedBuildingAtom` / 3D `levelFilterAtom` to these.
- **Artifacts** (`lib/artifacts.js`, remix) are what you publish: a design
  option, a hatch, a redline. Bricks agree on `kind`.
- **Kit** (`lib/bricks.js`) is what is on the canvas versus in the tray.
  `-XX` starter bricks default on; initialed remix bricks default off —
  except Flat, which is the nametag wall and defaults everything on.

**Every brick is owned, and says so.** A brick's folder and its `id` end in its
owner's two initials — `hatch-tool-LG`. Example bricks that ship with the
starter end in `-XX`, which is nobody's initials. Only the brick id carries
initials — tool ids, panel ids and message `kind`s belong to the baseplate's
contract and stay plain.

**Wednesday git (the whole room shares this repo):**

- Your branch is your **GitHub username**, all day. Do not make a branch per brick.
- Each PR adds **one new folder** (plus two lines in that baseplate's
  `bricks/bricks.js`). Facilitators merge. You never press Merge.
- After a merge is announced: commit your work, then `git pull origin main`.
  If git asks, keep both.

### Wednesday Git loop for agents

Use this exact loop repeatedly. Do not create a new branch, merge a PR, or push
directly to `main`.

1. **Before editing:** run `git status --short --branch`. Work only on the
   branch named after the user's GitHub username. If there are unexpected
   changes, stop and ask rather than discarding them.
2. **Implement/refine:** make the requested change and run the relevant checks.
   Refinements and redos stay uncommitted until the user asks for a commit, or
   become additional commits on the same branch if a PR is already open.
3. **Commit when asked:** inspect `git diff`, stage only files for this task,
   and make a concise commit. Never amend, squash, reset, or force-push unless
   the user explicitly requests it.
4. **Open/update the PR when asked:** push with `git push -u origin HEAD`. If a
   PR from this branch to `main` is already open, the push updates it—do not
   open another. Otherwise create one. `gh` may not be installed in Codespaces;
   use the GitHub REST API with the existing `GITHUB_TOKEN`, `GITHUB_API_URL`,
   and `GITHUB_REPOSITORY` environment variables when needed.
5. **After the facilitator merges:** run `git pull origin main`, then
   `git push origin HEAD`. The second command advances the remote username
   branch to the merged `main` commit and clears VS Code's **Sync Changes N ↑**
   indicator. Finish by checking `git status --short --branch`; the working
   tree should be clean and have no ahead/behind count.

Useful commands:

```bash
# Commit and publish
git status --short --branch
git diff --check
git diff
git add <only-the-files-for-this-task>
git commit -m "Concise description"
git push -u origin HEAD

# Find this branch's open PR (an existing PR was updated by the push)
branch=$(git branch --show-current)
owner=${GITHUB_REPOSITORY%%/*}
pr=$(curl --connect-timeout 5 --max-time 20 --fail-with-body --silent --show-error \
  --get "$GITHUB_API_URL/repos/$GITHUB_REPOSITORY/pulls" \
  -H "Authorization: Bearer $GITHUB_TOKEN" \
  -H "Accept: application/vnd.github+json" \
  --data-urlencode "state=open" \
  --data-urlencode "base=main" \
  --data-urlencode "head=$owner:$branch")
pr_url=$(printf '%s' "$pr" | jq -r '.[0].html_url // empty')

# Only when pr_url is empty, create one and capture its URL
if [ -z "$pr_url" ]; then
  pr_url=$(curl --connect-timeout 5 --max-time 20 --fail-with-body \
    --silent --show-error -X POST \
    "$GITHUB_API_URL/repos/$GITHUB_REPOSITORY/pulls" \
    -H "Authorization: Bearer $GITHUB_TOKEN" \
    -H "Accept: application/vnd.github+json" \
    -H "Content-Type: application/json" \
    -d "$(jq -n --arg title "<title>" --arg head "$branch" \
      --arg body "<summary>" \
      '{title:$title,head:$head,base:"main",body:$body}')" \
    | jq -r '.html_url')
fi
printf '%s\n' "$pr_url"

# Refresh this username branch after its PR is merged
git pull origin main
git push origin HEAD
git status --short --branch
```

For PR operations, follow the recipe above instead of improvising. Run the
lookup first; a nonempty `pr_url` means the push already updated that PR. Run
the create command only when the lookup returns no URL. Use bounded `curl`
timeouts, never print tokens, and do not repeatedly retry a hanging request.
If GitHub is unreachable, report that the commit was pushed but PR creation
could not be confirmed; do not guess and do not create duplicates.

There is no third layer — everything in `baseplates/<id>/` that isn't in
`bricks/` **is** the baseplate. Don't reintroduce "base" or "project" as a word
for it. ("Project" survives only in its architectural sense: `lib/projectData.js`
and `sample-data/project.json` describe a *building*.)

Read this file before changing anything. The contract for a given surface is
at the top of that baseplate's `bricks/bricks.js`. On Wednesday morning the only
surface in the tree is `flat`; more appear in the nav after facilitators merge
a phase. Do not add a baseplate — snap a brick onto one that exists.
`baseplates/flat/bricks/bricks.js` is the one to copy first.

