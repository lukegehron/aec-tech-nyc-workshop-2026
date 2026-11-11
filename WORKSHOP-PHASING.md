# How to phase this workshop

Facilitator notes. Not attendee-facing. The afternoon already has an arc; this file is about what the *repo* should look like at each point so that arc is easy to land on, not a wall of apps.

**Collaborative Vibe Coding for AEC** — AEC Tech NYC, Wednesday, November 11, **2:00–5:00 pm**, Verizon Education Center, Cornell Tech. The hackathon follows on Saturday, November 14.

This is a **half-day**. In Boston it was a full day. The morning (Card + Iterate) worked: 39 attendee PRs before lunch. The afternoon (Call AI + Remix) did not: 11. So New York re-runs Boston's 10–1 as 2–5, and then we call it a day. There is no lunch merge, no Call AI, no Remix, no capstone.

One thing does move up from Boston's afternoon: **the 3D Viewer**. In August, 3D was a stretch goal buried in Remix. Models are now good enough at three.js that it is a fun toe-dip for a beginner, so it ships in the one phase PR, next to Sketchpad.

`main` at 2:00 is Flat only. One phase PR adds Sketchpad and the 3D Viewer. That is the whole kit.

---

## Locked for Wednesday

These are decided. Do not reopen them in the room.

- One shared repo. Attendees PR into `main`.
- **One** phase PR (`phase-1-iterate`), merged once, during the break.
- Attendee branch = **GitHub username**, the whole afternoon. Initials live on the folder and `id`.
- **Two facilitators merge.** Attendees never press Merge.
- First README prompt = **nametag**.
- This file is Wednesday-only. Monday / template-vs-fork is out of scope here.

## The branches

```
main                    ← 2:00. Flat only. Codespaces boot this.
  └── phase-1-iterate   ← merge in the 3:20 break. Adds Sketchpad + 3D Viewer.
        └── phase-2-ai  ← RESERVE. Only if the room is far ahead. See below.
```

`phase-1-iterate` **contains `main`** and only adds to it. Cut it from `main` after the last README / devcontainer fix, so the merge adds files and never drops any.

Attendee PRs are a different queue: new brick folder + two lines in `bricks.js`. Review for that shape, then merge.

---

## What Boston actually looked like

From the PR log on `pwluke/aec-tech-boston-workshop` (times EDT, Friday Aug 21). Read it as "Boston clock + 4 h = New York clock."

| Boston | New York | What happened |
|---|---|---|
| 10:00 | 2:00 | Welcome, setup, Codespaces booting. |
| 10:40–11:20 | 2:40–3:20 | **17 nametag PRs.** Median five minutes from open to merge. |
| 11:24 | 3:20–3:30 | `phase-1-iterate` merged. New York adds a ten-minute break around it. |
| 11:33–12:29 | 3:30–4:30 | **20 iterate PRs**: cards gained controls, animation, a runner game; first Sketchpad brushes. |
| 12:29 | — | `phase-2-ai` merged. **Do not do this in New York.** |
| 12:50–1:00 | 4:30–5:00 | Stragglers. In New York this is the close. |
| afternoon | — | Remix merged, 11 PRs across 2½ hours. Cut — except the 3D Viewer, which moved up. |

The lesson: the loop (prompt → look → PR → merge → pull) is the workshop. New surfaces are only worth it once, and only after everyone has had a card merged.

---

## Two different empty walls

The plan uses “reveal” a lot. Those reveals are not the same trick. Keep them apart or the room will not know what just happened.

| Wall | What fills it | Who fills it | When |
|---|---|---|---|
| **The social wall** | Nametag cards on `flat` | Attendees, via PR → merge → `git pull origin main` | From ~2:40, then all afternoon |
| **The kit wall** | Sketchpad and 3D Viewer appear in the nav | You, by merging `phase-1-iterate` | Once, in the break |

“The wall is no longer empty” after the first PR is **their names**, not a 3D viewer appearing. If the nav already has a 3D viewer at 2:15, there is nothing to reveal later, the nametag looks like a toy in a finished product, and the choose-your-own-adventure people vanish into three.js before they have committed anything.

---

## What does *not* get phased

Put these on `main` before anyone creates a Codespace. Changing them mid-afternoon means 25 people `npm install` on venue Wi-Fi, or a prebuild that no longer matches the tree.

- `.devcontainer/`, `.clinerules/`, and the Cline config
- The full `package.json` / lockfile (three.js, react-three-fiber, p5, rhino3dm — already there). **Installed ≠ visible.** Unused libraries sitting in `node_modules` do not scare anyone. New nav items do.
- `public/wasm/` (Rhino and IFC run from here, never from a CDN)
- `app/` shell, `components/ui/`, `AGENTS.md`, `SURVIVAL-KIT.md`
- MIT license, README (attendee setup only — not the first prompt, see below)

What *does* get phased is **registration + example bricks**. A baseplate that is not imported in `lib/baseplates.js` is not in the nav. Better still: **do not even have the folder in the tree** until its phase. Cline and Claude Code will otherwise “helpfully” copy a 3D view mode during the nametag exercise.

---

## The two blocks

### Block 1 — Card (`main` at 2:00)

**In the tree**

- App shell, landing, nav
- `baseplates/flat/` only
- Starter bricks: `notes-XX`, `checklist-XX`, unregistered `_your-brick-here-XX`

**Landing page**

- One surface to click, or a short greeting plus that one card. Not a gallery.

**Hello world**

- A conference badge **on an existing card**, not a new file from nothing. Copy `_your-brick-here-XX` (or `notes-XX`), rename folder + `id` to `nametag-LG`, two lines in `bricks/bricks.js`. That *is* the first lesson: snapping a brick on.
- Who / place / boundary in the prompt: *you, this room, this folder only, don’t touch the baseplate.*
- **Break it on purpose, then undo it** (deck A-17), live, before anyone ships: make a bad change, then restore the Cline checkpoint. Nothing they do today is more than one sentence away from fixed.

**Why this is not too simple**

- For people who have never seen GitHub, “my name on a card, live in the browser, then a green merge button, then the room can see it” is a full hour. The sophistication is the loop, not the widget.
- Fast-lane people who finish in eight minutes get a printed menu of *second* bricks still on `flat` (unit converter, countdown, QR of their PR). They do not unlock 3D early as a reward. That reward trains them to leave the lesson.

### Block 2 — Iterate (merge `phase-1-iterate` in the break)

Three ways forward, all the same loop. Say it as a choice, not a ladder:

| If you’d rather… | Go to | First brick to read |
|---|---|---|
| keep typing | **Flat** — the nametag grows inputs | your own card |
| draw | **Sketchpad** — a brick is one function | `pen-XX` (six lines) |
| play in 3D | **3D Viewer** — Navy Yard Commons, orbit it | `_your-brick-here-XX`, then `spaces-XX` |

In Boston, most people stayed on their card, and that was fine. Sketchpad pulled the people who wanted to draw. The 3D Viewer is for the ones who walked in hoping to see a building.

**3D starter prompts** (put them on the menu; the viewer already colours rooms by department, so do not use that one):

- “Add a view mode that colours each room by its area, smallest to largest, with a legend.”
- “Add a view mode that pulls the floors apart so I can see inside — an exploded view.”
- “Add a toolbar toggle that hides one department.”
- Boston’s remix bricks are good *ideas* to describe out loud — a carbon heatmap, a sun-and-shadow study, massing options — not folders to copy.

**3D facilitator notes**

- Every 3D brick is a folder + two lines in `baseplates/viewer3d/bricks/bricks.js`, same as Flat. The contract is at the top of that file: a brick is a view mode (`buildBoxes`), a toolbar tool, or something drawn inside the canvas (`Scene3d`). The scene is **Z-up**; `boxFromOutline()` already knows that.
- `AGENTS.md` has the two r3f traps (no suspending loaders inside `<Canvas>`, no `Environment preset`). If someone’s canvas goes black on first load, that is why.
- `rhino-import-XX` reads a `.3dm` with wasm from `public/wasm/`. It is a demo, not a brief — do not make anyone depend on uploading a file over venue Wi-Fi.
- Open the 3D Viewer once in a fresh Codespace the morning of. Cold first load is where the context-loss bug shows up.

**The iterate loop to actually say out loud** (deck A-16: *ask, look, keep or undo*)

1. Prompt.
2. Look at the browser, not the diff first.
3. Steer or restart.
4. Commit.

“Edit someone else’s brick” is the one line I would cut or rewrite. On a shared repo, with GitHub-newbies, it produces merge conflicts and hurt feelings. Neighbor **review** (comment on the PR, then copy the idea into your own brick) is the same social goal without two people owning one folder.

---

## How the afternoon maps onto the PRs

| Clock | Talk / work | Repo |
|---|---|---|
| 2:00 | Welcome + setup: GitHub account, **New with options**, paste the key. | Codespaces on `main`. No merge. |
| ~2:10 | Talk while Codespaces boot: the deck’s opening (A-02 → A-10b) — why you’re here, the two hackathon stories, how fast this moves, you’re the AEC expert, GitHub is Drive + 3D Warehouse, which AI. | Still `main`. |
| ~2:40 | **Card.** Agent vs chat (A-15), break-it-and-undo (A-17), nametag, GitHub in six words (A-18), first PR. | Social wall fills. Merge on sight. |
| 3:20 | **Ten-minute break.** Merge **`phase-1-iterate`** while they are gone. | One merge, nobody mid-edit. |
| 3:30 | Reveal: “look at the nav.” Everyone commits, pulls. Five habits (A-20). | Two new surfaces. |
| ~3:35 | **Iterate.** Card grows inputs, a Sketchpad brush, or a 3D view mode. | Second wave of PRs. |
| ~4:35 | **Close.** Last merges. Three or four volunteers demo on the projector in 60 seconds each (A-25: the annoyance / show it working / what’s next). Survival kit, Saturday’s hackathon. | Nothing new merges after the demos. |
| 5:00 | Done. | Every working tree clean, nothing ahead or behind. |

Pulls happen **at the start of a block**, after a reveal sentence, never while Cline is mid-edit. The script is always the same: *save, commit your brick, `git pull origin main`, keep both if GitHub asks.*

**Success at each point**, in one sentence, so you know whether to merge or stall:

- 3:20 — a nametag is on `main` and they have pulled.
- 4:30 — their card changes when you touch it, or a brush or 3D mode they wrote is in the nav.
- 5:00 — their work is on the wall and their branch is in sync with `main`.

If the room is behind at 3:20, take the break anyway and merge — but tell the slow lane to finish the nametag first. Nametags first, new surfaces second.

---

## Critique of the plan, kept from Boston

### What is strong — keep it

- **Web vs desktop as the barrier talk.** Right audience, right reason, and it justifies Codespaces without sounding like an IT policy. The deck’s “one web app → browser, Revit, Rhino, Excel” (A-14) is the same point, made better.
- **Personal GitHub, not work SSO.** This will save the first half hour. Say it twice. Put it on the invite.
- **“New with options…”, not the green button.** Correct, and easy to blow. Rehearse it on a projector. The green button skips the key prompt; `welcome.sh` catches it, but only after the Codespace exists.
- **Username as the Codespace branch.** Right for people new to git.
- **Paste-and-fill first prompt, with a boundary.** This is the actual anti-blank-page device. It needs to live in the README and on a paper recipe card, not only in the talk.
- **Predict → inspect → accept / steer / restart.** Teach that before “be creative.”
- **GitHub in six words, in Revit terms** (repo = central model, branch = local file, commit = save local, PR = submittal, merge = sync with central, pull = reload latest). Do not teach git. Teach a loop.
- **Three rules / keep both / one brick at a time.** Those are the fewest rules that keep a shared repo out of chaos. They belong on a slide that stays up.
- **One OpenRouter key for Cline and Claude Code.** Guard it.
- **Side topics while Cline is working.** Necessary. Pre-order them (vibe coding → last five years → tradeoffs → hosted vibe tools) so you are not inventing filler.
- **Don’t start with an app. Start with an annoyance.** Best closer you have. It is also the first 10 seconds of every demo.
- **You’re the AEC expert** (A-10). The roles — problem owner, data finder, tester, demo lead — are the hackathon pitch. Say them at the close, not as a team exercise.

### What is confusing — decide before the invite

**1. Shared repo vs template, on the day vs on Monday**

The social wall only works if everyone PRs into **one** repo. A template-fork afternoon gives you 25 isolated nametags and no reveal. Monday can be “fork this, or start from the template.” Saturday cannot be both. Say it: *today we share a box of bricks; Monday you can take a copy home.*

**2. Branch = GitHub username vs `flat/nametag-LG`**

The setup talk says username. The brick contract says `baseplate-id/brick-id`. Both are right for different days. They are fatal if you teach both before the first commit.

Recommendation: **username branch all afternoon.** Folder and `id` still end in initials. Do not stop the room to enforce one-brick-one-branch until the closer, when you explain how *you* work after the workshop (that is what `SURVIVAL-KIT.md` is for).

**3. Who merges the nametag PRs?**

Two facilitators, approve on sight if the diff is a new folder + two lines. Boston proved this keeps up: 17 nametags in 40 minutes, median five minutes from open to merge.

**4. Cline is the room default, `claude` is advanced**

Good. Then the first prompt must work in Cline. Do not demo Claude Code until someone has had a win in the sidebar.

### What is missing — check before 2:00

- **A written nametag prompt**, tested, in the README and on paper. Who / place / boundary. “Don’t change the baseplate.”
- **What to do if Codespaces takes 15 minutes.** Have a backup: a second region prebuild, a facilitator hotspot, `npm ci && npm run dev` on a laptop for the two people whose Codespace dies. The opening talk is the filler; it cannot be the only plan.
- **Fast lane / slow lane.** Nametag in four minutes vs still on the GitHub invite at 3:00. Fast lane stays on `flat` with a menu. Slow lane gets a human, not a harder baseplate.
- **Image-in-prompt rehearsal.** “How to reference images in prompts” is a side quest that fails if Cline-in-Codespaces cannot attach the image. Try it in the private/incognito path on the facilitator checklist.
- **A three-piece parts bin, not sixty.** `components/ui/` is a firehose. The iterate block should name Button, Input, Dialog (and where they live).
- **Repo write access.** Collaborator vs org member vs fork-and-PR. Decide the permission model with the GitHub org admin, not at 2:05.
- **How `git pull origin main` interacts with an uncommitted Cline edit.** It will happen at the 3:30 pull. Script: commit or stash, then pull. Put it on the stay-up slide.

### What is too simple — and why it isn’t

- Nametag *as the whole afternoon* would be too simple. Nametag *as the first loop* is not. The second brick on `flat` is the pressure valve, not a new baseplate.
- “GitHub in six words” is the right size. Do not add remotes, rebase, or “what is HEAD.”

### What is too complex — leave it out

- **More than one unlock.** Boston’s second and third merges are what turned the afternoon into a dud. One reveal, in the break — two surfaces in it is fine; two merges is not.
- **A team build.** Tables of four, one brief, 40 minutes is Boston’s capstone with a new name. Save it for Saturday.
- **Building a new baseplate.** Keep it off the agenda. `flat` is the answer to “I need a different surface” nine times out of ten.
- **One-brick-one-branch, strictly.** Right as a firm convention. Wrong as a 2:30 exam.
- **“Create a new UI file” as a named step.** Too close to frontend homework. “Use `Button` and `Input` from the parts bin” is enough.

### What is a little off, but fixable

- **Half guided, half choose-your-own-adventure** is the right spirit. Give it a time: guided until the first merge; CYOA after, with a menu, not an open field.
- **Blocks named after activities (Card / Iterate)** beat blocks named after products. Do not rename them “Flat / Sketchpad / 3D.”
- **“We cannot wait to see what you build”** as the facilitator identity — good. Pair it with “we will not touch your brick unless you ask.” The do-not-modify-the-baseplate rule needs to apply to *you* too, in front of them.

---

## Fast lane / slow lane (so CYOA does not mean “go somewhere else”)

Print this. Do not improvise it.

**If you are done with the nametag and it is on `main`**

1. Make the card editable (name, role, one annoyance).
2. Still on `flat`: converter, countdown, punch list, QR of the PR — copy `_your-brick-here-XX` again.
3. Review a neighbor’s PR: leave a comment, then borrow the idea for your own brick.
4. After the break: a Sketchpad brush, or a 3D view mode (prompts above).

**If you are still on signup / Codespaces / the first prompt**

- A facilitator sits down. They do not get a harder explanation of git. They get the paste-and-fill prompt and a human who clicks **New with options** with them.
- They are not behind. The nametag *is* the workshop until it exists.

---

## Building `phase-1-iterate`

Both halves already exist in the Boston repo, and this repo’s `main` matches what they were built on (`lib/scene.js`, `lib/bricks.js`, `lib/useSyncSceneCatalog.js` are identical; every 3D package is already installed). It is a port, not new work.

**From Boston PR #20 (`phase-1-iterate`) — Sketchpad**

- `baseplates/sketchpad/` with `pen-XX`, `calligraphy-XX`, `mirror-XX`, `spray-XX` and the stub
- `lib/KitTray.jsx`, the small `flat/Screen.jsx` + `flat/Workspace.jsx` changes, one line in `lib/baseplates.js`

**From Boston `phase-3-remix` — the 3D Viewer only**

- `baseplates/viewer3d/` with the `-XX` bricks (`massing`, `floors`, `spaces`, `measure`, `z-slice`, `rhino-import`) and the stub. **Drop the initialed Boston bricks** (`carbon-heatmap-NE`, `sun-shadow-YQ`, `massing-options-ZR`, `route-preview-UL`, `rhino-project-import-AR`, `model-health-BS`) and their two lines each in `bricks.js` — they make the afternoon grid look like someone else’s workshop, and agents copy them.
- `lib/projectData.js`, `lib/boardChrome.js` (both import only React)
- `public/sample-data/project.json` (Navy Yard Commons — change `location` from Boston to Brooklyn, NY) and a sample-data README that lists only that file
- One more line in `lib/baseplates.js`

**Leave behind:** `building-dashboard/`, `pdf-markup/`, `vector-editor/`, `lib/artifacts.js`, `artifacts/seed.json`, the PDF and SVG samples, `/api` demos.

Before you open the PR: `npm run build`, then click every 3D mode in a fresh Codespace.

---

## Reserve: `phase-2-ai` (only if the room runs fast)

Boston's lesson still stands — a second unlock is what sank its afternoon — so this is a break-glass branch, not a plan. Merge it only if, by ~4:15, nearly everyone has a nametag **and** an iterate brick on `main`, and there is a natural pause. Otherwise leave it unmerged; it costs nothing to keep.

It is cut from `phase-1-iterate` and contains it, so **merge `phase-1-iterate` first**. It is a port of Boston's `phase 2` commit (`dfd70fa`), and like phase 1 it only adds:

- **`/api/claude`** takes an optional `maxTokens` (capped at 16k; default now 4096). **`/api/fal`** runs any fal endpoint (`{ model, input, fetchFile? }`) as well as the old `{ prompt }`; `lib/fal.js` gains `runModel` / `fetchResultFile`.
- **Flat:** `ai-summarizer-LG` — paste notes, Claude summarizes. The smallest worked example of a brick calling `/api/claude`.
- **Sketchpad:** bricks may now contribute `panels` beside the pad (they receive `getSketchDataUrl`). `sketch-to-3d-LG` sends the drawing to fal's Hunyuan3D and orbits the GLB. Initialed, so it starts **off** — switch it on in the kit tray.
- **Vector Editor** (`baseplates/vector-editor/`, nav slot 30): a full SVG drafting app whose `ai-XX` panel draws with Claude (JSON path data in sheet units) or Recraft (text → SVG, image → SVG). Plus `public/sample-data/floor-plan.svg` and `lib/artifacts.js`. Boston's attendee bricks `accessible-route-SJ` and `door-clearance-TK` were left behind.

**Keys.** Claude features run on the OpenRouter key the Codespace already has. The fal features (sketch → 3D, Recraft) need `FAL_KEY` in `.env.local` and a dev-server restart — nothing in `.devcontainer/` supplies it. Decide before the day whether you hand out a fal key at all; if not, steer the room to the Claude features.

**AI starter prompts** (on the menu if you merge it):

- "Add a Flat card that takes a room schedule I paste in and asks Claude which rooms look undersized."
- "Add a Sketchpad panel that sends my drawing to Claude and gets back a one-line critique."
- "Make the Vector Editor's AI panel send the current drawing to Claude, so I can ask it to add a stair core that fits what's already there."

---

## Facilitator git choreography

- Bugfixes to the shell (devcontainer, README setup, a crash in `flat/Screen.jsx`) land on `main` and get merged *forward* into `phase-1-iterate` if it is not merged yet. Never the other way.
- The phase PR only **adds** `baseplates/sketchpad/`, `baseplates/viewer3d/`, the sample building and their registration (plus the small shell tweaks they need). It does not restyle the landing page. It does not rewrite AGENTS.md mid-afternoon.
- Merge when nobody is mid-edit — that is what the break is for.
- After the merge, say the same three things: commit your work, pull `main`, keep both if asked, look at the nav.

Do not open the phase PR from an attendee fork. It is yours, already reviewed, already green, waiting on a clock.

---

## Decisions to lock before anyone is invited

1. Day-of is a **shared repo**; Monday is template-or-fork. Not both on Saturday.
2. **One** phase PR, `phase-1-iterate` (Sketchpad + 3D Viewer), cut from `main`, merged in the 3:20 break.
3. Afternoon branch = **GitHub username**. Initials live on the folder/`id`.
4. **Who may merge** attendee PRs (two facilitators, approve on sight).
5. First README prompt = **nametag**, not a landing page.

Once those five are decided, the talk is in the right order. Boston showed the morning works. New York is that morning, in the afternoon, with a building to orbit at the end of it — and then everyone goes home.
