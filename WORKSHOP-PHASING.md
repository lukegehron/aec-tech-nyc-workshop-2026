# How to phase this workshop

Facilitator notes. Not attendee-facing. The day already has an arc; this file is about what the *repo* should look like at each hour so that arc is easy to land on, not a wall of apps.

`gallery` is the 5pm kit: six live baseplates, Navy Yard Commons seen four ways, `/api/claude` and `/api/fal`, and initialed bricks talking through `lib/artifacts.js`. `main` at 9am is Flat only. The phase branches add the rest, in order.

---

## Locked for Wednesday

These are decided. Do not reopen them in the room.

- One shared repo. Attendees PR into `main`.
- **Four** stacked phase PRs, plus a frozen **`gallery`** deploy for Welcome.
- Attendee branch = **GitHub username**, all day. Initials live on the folder and `id`.
- **Two facilitators merge.** Attendees never press Merge.
- Vercel previews are on. Production (or a named alias) should track `gallery`.
- First README prompt = **nametag**.
- This file is Wednesday-only. Monday / template-vs-fork is out of scope here.

## The branches that actually exist

```
gallery                 ← frozen 5pm kit. Projector. Nobody develops here.
main                    ← 9am. Flat only. Codespaces boot this.
  └── phase/iterate     ← merge ~10:45. Adds Sketchpad.
        └── phase/ai    ← merge at lunch. Adds Vector Editor (+ ai-XX).
              └── phase/remix ← merge ~2:45. Dashboard, 3D, PDF, artifacts, Navy Yard.
```

Stacked means each branch **contains the previous one**. Creating them as siblings by deleting from today’s tree would make Wednesday’s merges drop files instead of adding them. They were built additively: peel `main` to Card, then check files back in on each later branch.

Wednesday merge order, always into `main`, always while the room is listening (or at lunch):

1. Merge the Iterate PR, tell the room to `git pull origin main`.
2. Merge the Call AI PR (at lunch). Pull at the start of session 3.
3. Merge the Remix PR just before the capstone brief.

Attendee PRs are a different queue: new brick folder + two lines in `bricks.js`. Review for that shape, then merge.

---

Attendees never juggle phase branches. They get **one working branch** (their GitHub username) and they pull `main` when you tell them to. You own **four stacked PRs** that add surfaces. You merge one at each session boundary. `package.json` is complete on day one so the Codespace prebuild lasts all day. The 5pm gallery is a **separate deployed preview** you tour during Welcome — it is not what boots in the Codespace.

Three-to-six branches is the right instinct. **Four** is the number that matches the timed agenda. Six live merges in one day will eat the git lesson you are trying to teach.

---

## Two different empty walls

The plan uses “reveal” a lot. Those reveals are not the same trick. Keep them apart or the room will not know what just happened.

| Wall | What fills it | Who fills it | When |
|---|---|---|---|
| **The social wall** | Nametag cards on `flat` | Attendees, via PR → merge → `git pull origin main` | End of session 1, then all day |
| **The kit wall** | New baseplates in the nav | You, by merging a phase PR | Session boundaries only |

“The wall is no longer empty” after the first PR is **their names**, not a 3D viewer appearing. If the nav already has six apps at 9:15, there is nothing to reveal later, and the nametag looks like a toy in a finished product.

---

## Verdict on 3–6 branches

**Do it. Make them facilitator PRs, not attendee starting points.**

| Count | Verdict |
|---|---|
| **3** | Workable, a bit coarse. You would fold Iterate into Card (too long on one surface) or fold Call AI into Remix (the “your app can ask a model” beat disappears). |
| **4** | **The one to build.** One PR per timed block: Card / Iterate / Call AI / Remix. |
| **5–6** | Tempting if you want Sketchpad, Dashboard, Vector, 3D, PDF, Chat as separate unlocks. Too many pulls, too many registry edits, too many “wait, which app are we in.” Save the extra surfaces as *choices inside* a phase, not as their own merge. |

Stacked, add-only, merged forward:

```
main                    ← 9am. Flat only.
  └── phase/iterate     ← merge ~10:45. Sketchpad + a data card.
        └── phase/ai    ← merge at lunch. Vector editor + the two API routes made obvious.
              └── phase/remix ← merge ~2:45. Dashboard, 3D, PDF, artifacts, Navy Yard as one building.
```

Each phase branch **contains the previous one**. You never ask anyone to check out `phase/ai`. You merge it into `main` and they pull.

A fifth ref is worth keeping, but it is not a live merge:

- **`gallery` (or `pm`)** — today’s two-thirds / 5pm tree, deployed on Vercel. Welcome points a projector at it. Nobody develops on it.

---

## What does *not* get phased

Put these on `main` before anyone creates a Codespace. Changing them mid-day means 25 people `npm install` on venue Wi-Fi, or a prebuild that no longer matches the tree.

- `.devcontainer/` and the Cline config
- The full `package.json` / lockfile (three.js, p5, pdf.js, FAL client, everything). **Installed ≠ visible.** Unused libraries sitting in `node_modules` do not scare anyone. New nav items do.
- `app/` shell, `components/ui/`, `AGENTS.md`
- `/api/claude` and `/api/fal` as files — they can exist unused. Session 3 is when you *point at them*.
- MIT license, README (attendee setup only — not the first prompt, see below)

What *does* get phased is **registration + example bricks**. A baseplate that is not imported in `lib/baseplates.js` is not in the nav. Better still: **do not even have the folder in the tree** until that phase. Cline and Claude Code will otherwise “helpfully” copy `carbon-heatmap-NE` during the nametag exercise.

---

## The four phases, against this repo

Treat current `main` as a quarry. You are carving 9am out of 4pm, not inventing new apps.

### Phase 0 — Card (`main` at 9am)

**In the tree**

- App shell, landing, nav
- `baseplates/flat/` only
- Starter bricks: `notes-XX`, `checklist-XX`, unregistered `_your-brick-here-XX`
- No initialed bricks. No site map, no material options, no review register. Those are remix proofs; they make the morning grid look like yesterday’s workshop.

**Landing page**

- One surface to click, or a short greeting plus that one card. Not a gallery of six.
- The first-prompt in the README today (“turn this page into a polished landing page”) fights the whole LEGO talk. Replace it with the nametag paste-and-fill prompt. Blank-page prompting is last year’s workshop.

**Hello world**

- A conference badge **on an existing card**, not a new file from nothing. Copy `_your-brick-here-XX` (or `notes-XX`), rename folder + `id` to `nametag-LG`, two lines in `bricks/bricks.js`. That *is* the first lesson: snapping a brick on.
- Who / place / boundary in the prompt: *you, this room, this folder only, don’t touch the baseplate.*

**Why this is not too simple**

- For people who have never seen GitHub, “my name on a card, live in the browser, then a green merge button, then the room can see it” is a full morning. The sophistication is the loop, not the widget.
- Fast-lane people who finish in eight minutes get a printed menu of *second* bricks still on `flat` (unit converter, countdown, QR of their PR). They do not unlock Vector Editor as a reward. That reward trains them to leave the lesson.

### Phase 1 — Iterate (merge ~10:45)

**Add**

- `sketchpad/` — a brick is one function. Lowest-ceremony surface after flat. Best second baseplate.
- One data story **still on flat** if you can: JSON file → CSV → a table card. Papaparse is already in `package.json`. A tiny dashboard on `flat` teaches “data in a card.” The full Building Dashboard teaches “a moulded surface for a building.” Those are different lessons. Do not spend both before lunch.

**Optional, not a fifth phase:** a couple of extra `_XX` brushes on sketchpad so copy-paste has a target.

**The iterate loop to actually say out loud**

1. Prompt.
2. Look at the browser, not the diff first.
3. Steer or restart.
4. Commit.

“Edit someone else’s brick” is the one line I would cut or rewrite. On a shared repo, with GitHub-newbies, it produces merge conflicts and hurt feelings. Neighbor **review** (comment on the PR, then copy the idea into your own brick) is the same social goal without two people owning one folder.

**Static card vs tiny editor** — stay on `flat`. The nametag grows inputs. That is the whole beat. Sketchpad is the CYOA fork for people who would rather draw than type.

### Phase 2 — Call AI (merge at lunch)

**Add**

- `vector-editor/` with the `-XX` tools plus `ai-XX`. That forty-line panel is the worked example for “the app goes and asks a model.” Read it with the room; do not make people reinvent the fetch.
- Point at `app/api/claude/route.js` and `app/api/fal/route.js`. The lesson is **the key stays on the server**. One OpenRouter key already in the Codespace should drive this. Do not put a key in a brick.

**Start tiny, then swap the model** — do this on a **flat card** first (a text box that POSTs to `/api/claude` and writes the answer back). Then walk them over to `ai-XX` so they see the same idea inside a real tool. If the first AI exercise is “add a hatch tool to the vector editor,” you will lose half the room to `ctx` and pointer events.

**FAL is a hole in the current setup.** Codespaces only asks for `OPENROUTER_API_KEY`. `/api/fal` wants `FAL_KEY`. Pick one before the invite goes out:

- Facilitator Codespaces secret `FAL_KEY` on the shared repo (simplest for the room, same caution as a shared OpenRouter key), or
- Skip FAL as a required beat; demo it on the projector; let fast-lane people add a sketchpad → `/api/fal` brick if they want.

Introducing a second signup after lunch will stall the session you care about.

**Say this distinction out loud, more than once**

- Cline / Claude Code = you prompting a model to *write the app*.
- `/api/claude` and `/api/fal` = the *app* prompting a model for its users.

The plan has both. People will conflate them. Last year’s blank-page hangover lives in that confusion.

### Phase 3 — Remix (merge ~2:45)

**Add**

- `building-dashboard/`
- `viewer3d/`
- `pdf-markup/`
- `lib/artifacts.js` + `public/sample-data/` (Navy Yard Commons as one building, four surfaces)
- The initialed example bricks that already wire those surfaces together (`material-options-MD`, `site-map-XP`, `carbon-budget-PF`, `accessible-route-SJ`, …). **This** is when the 5pm gallery belongs in the attendee tree — as a parts bin to remix, not as a museum they must not touch.

**Still later / maybe never in the attendee nav**

- `workshop-deck/` — that is *your* slides. Meta and distracting at 9am. A nice optional reveal at 4:30 (“these slides are a baseplate”) if it is registered on a facilitator machine, not on theirs.
- `chat/` — a collaboration surface is a whole extra contract (message kinds, a thread). Capstone groups can live on `flat` + artifacts without it. Add it only if a mini-product brief truly needs a thread.

**Capstone brief** should name the artifact `kind`s, not the libraries. “Publish a `design-option` from a card; show it on the dashboard; redline the sheet” is a remix. “Use three.js and Recharts” is a scavenger hunt.

---

## How the day maps onto the PRs

Times are the plan’s blocks, not a promise.

| Clock | Talk / work | Repo |
|---|---|---|
| Welcome + setup | Projector on **`gallery` deploy**. Codespaces on **phase 0 `main`**. | No merge. |
| Codespaces booting | LEGO talk, last year, barriers. | Still phase 0. |
| Session 1 · Card | Nametag, first prompt, first PR. | Social wall fills. |
| Session 2 · Iterate | Prompt / review / refine, card→editor, JSON→CSV→table. | Merge **phase/iterate** at the start, then they pull. |
| Lunch | You merge **phase/ai** while they are gone. | Codespaces already have the packages. |
| Session 3 · Call AI | Tiny fetch on a card, then `ai-XX`, then FAL if the key exists. | Pull at the start of the session, not mid-prompt. |
| Session 4 · Remix | Small groups, one brief, Navy Yard kit. | Merge **phase/remix** just before you give the brief. |
| Close | Barriers unlocked, Monday, how to run this yourselves. | `main` now *is* today’s two-thirds tree. |

Pulls happen **at the start of a block**, after a reveal sentence, never while Cline is mid-edit. The script is always the same: *save, commit your brick, `git pull origin main`, keep both if GitHub asks.*

---

## Critique of the plan you pasted

### What is strong — keep it

- **Web vs desktop as the barrier talk.** Right audience, right reason, and it justifies Codespaces without sounding like an IT policy.
- **Personal GitHub, not work SSO.** This will save the first hour. Say it twice. Put it on the invite.
- **“New with options…”, not the green button.** Correct, and easy to blow. Rehearse it on a projector.
- **Username as the Codespace branch.** Right for people new to git. See the collision below.
- **Paste-and-fill first prompt, with a boundary.** This is the actual anti-blank-page device. It needs to live in the README and on a paper recipe card, not only in the talk.
- **Predict → inspect → accept / steer / restart.** Teach that before “be creative.”
- **GitHub in five nouns, then the day’s loop.** Do not teach git. Teach a loop.
- **Three rules / keep both / one brick at a time.** Those are the fewest rules that keep a shared repo out of chaos. They belong on a slide that stays up.
- **One OpenRouter key for Cline, Claude Code, and the app.** That is the whole point of this starter. Guard it; do not add a third vendor unless FAL is decided (above).
- **Navy Yard Commons as one building, four surfaces.** That *is* the remix. It is already in the sample data. Do not invent a second fictional project for the afternoon.
- **Side topics while Cline is working.** Necessary. Pre-order them (vibe coding → last five years → tradeoffs → hosted vibe tools) so you are not inventing filler.
- **Don’t start with an app. Start with an annoyance.** Best closer you have. Put a sticky note on every chair for that sentence.
- **The five barriers, unlocked.** Good shape for the ending. Make sure the day actually touched each one or the slide will feel like marketing.

### What is confusing — decide before the invite

**1. Shared repo vs template, on the day vs on Monday**

The social wall only works if everyone PRs into **one** repo. A template-fork morning gives you 25 isolated nametags and no reveal. Monday can be “fork this, or start from the template.” Saturday cannot be both. Say it: *today we share a box of bricks; Monday you can take a copy home.*

**2. Branch = GitHub username vs `flat/nametag-LG`**

The setup talk says username. The brick contract says `baseplate-id/brick-id`. Both are right for different days. They are fatal if you teach both before the first commit.

Recommendation: **username branch all morning.** Folder and `id` still end in initials. After the first merge, fast-lane people may start `flat/unit-converter-LG` for brick two. Slow-lane people keep committing on the username branch. Do not stop the room to enforce one-brick-one-branch until the closer, when you explain how *you* work after the workshop.

**3. Who merges the nametag PRs?**

If you merge 25 PRs, you are the bottleneck and the wall fills in a clump at 11:02. If they self-merge with no CI, `main` can go red. Pick one:

- Attendees may merge their own PR once it only touches their brick folder + two lines in `bricks.js`, or
- One facilitator on the merge button, but the rule is visible and fast (approve on sight if the diff is a new folder).

“Neighbor review” should mean a comment, not a required approval from someone who also does not know GitHub.

**4. Cline is the room default, `claude` is advanced**

Good. Then the first prompt must work in Cline. Do not demo Claude Code until someone has had a win in the sidebar. The README currently leads with Cline and then a landing-page prompt that is the wrong win.

**5. “Gallery of 5pm examples” as the first bullet of What You Will Build**

Yes — on the **projector**. No — as the Codespace homepage. Otherwise the nametag is a letdown and the CYOA people vanish into three.js before they have committed.

### What is missing

- **A written nametag prompt**, tested, in the README and on paper. Who / place / boundary. “Don’t change the baseplate.”
- **FAL key logistics** (see phase 2).
- **Vercel on every PR.** The closer treats this as already true. Confirm the GitHub integration on this repo before you promise it. If it is not wired, either wire it or cut the line — “deploy already happened” is a bad thing to discover is false at 3:50.
- **What to do if Codespaces takes 15 minutes.** The plan says five minutes is a good thing. Have a backup: a second region prebuild, a facilitator hotspot, `npm ci && npm run dev` on a laptop for the two people whose Codespace dies. The LEGO talk is the filler; it cannot be the only plan.
- **Fast lane / slow lane.** Nametag in four minutes vs still on the GitHub invite at 10:30. Fast lane stays on `flat` with a menu. Slow lane gets a human, not a harder baseplate.
- **Image-in-prompt rehearsal.** “How to reference images in prompts” is a side quest that fails if Cline-in-Codespaces cannot attach the image. Try it in the private/incognito path you already have on the facilitator checklist.
- **A three-piece parts bin, not sixty.** `components/ui/` is a firehose. Session 2 should name Button, Input, Dialog (and where they live). The rest is for remix.
- **Success at each hour**, in one sentence, so you know whether to merge the next phase or stall.
  - 10:30 — a nametag is on `main` and they have pulled.
  - 12:30 — the card can change, or a brush exists, or a table shows their data.
  - 14:30 — a brick they wrote has called `/api/claude` or they have run `ai-XX` with their own prompt.
  - 16:30 — a group can point at two baseplates that share an artifact `kind`.
- **Pairing leftover people** for the capstone. “Builder vs everyone else” needs a role card: one person at the keyboard, one on the brief, one on the demo script. Otherwise four architects watch one Codespace.
- **Wi-Fi and wasm.** `viewer3d` and Rhino/IFC will fail on a hotel network the first time. Remix briefs that *require* a `.3dm` import are how you strand a table. Have a sample already in `public/`.
- **Repo write access.** Invites, seats, and “personal account” are in the plan. Collaborator vs org member vs fork-and-PR is not. Self-merge only works if they can write to `main` or their PR can merge. Decide the permission model with the GitHub org admin, not at 9:05.
- **How `git pull origin main` interacts with an uncommitted Cline edit.** It will happen every time you merge a phase. Script: commit or stash, then pull. Put it on the stay-up slide.

### What is too simple

- Nametag *as the whole day* would be too simple. Nametag *as the first loop* is not. The risk is leaving them on it too long *or* fleeing it too fast. The second brick on `flat` is the pressure valve, not a new baseplate.
- “GitHub in five nouns” is the right size. Do not add remotes, rebase, or “what is HEAD.”
- Sketchpad’s `pen-XX` (six lines) is the right second-surface example. Do not open with Vector Editor because it looks more like “real CAD.”

### What is too complex, too early

- **Current `main` as the 9am tree.** Six nav items, wasm, MapLibre, Recharts, a vector editor with twelve bricks, and a pile of initialed remix bricks. That is a studio, not a hello world. It is also exactly what you want at 2:45. Phase it; do not delete it.
- **Vector editor as an iterate exercise.** `ctx` rebuilt every event, history, SVG coordinates — that is a day. In this workshop it is a *place you visit* in session 3 (`ai-XX`) and a *parts bin* in session 4.
- **Building a new baseplate.** Correctly marked optional at the end. Keep it off the timed agenda. `flat` is the answer to “I need a different surface” nine times out of ten; you already wrote that down.
- **Chat + deck + 3D + PDF + dashboard in one capstone.** Pick two surfaces and one `kind`. The ecosystem feeling comes from the *room’s* PRs sitting next to each other, not from one group touching every folder.
- **One-brick-one-branch, strictly, all day.** Right as a firm convention. Wrong as a 10am exam. See the username collision above.
- **“Create a new UI file” as a named step.** Too close to frontend homework. “Use `Button` and `Input` from the parts bin” is enough.

### What is a little off, but fixable

- **Half guided, half CYOA** is the right spirit. Give it a time: guided until the first merge; CYOA after, with a menu, not an open field.
- **Timed agenda named after activities (Card / Iterate / Call AI / Remix)** is better than naming them after products. Keep that. Do not rename the blocks “Flat / Sketchpad / Vector / 3D.”
- **Live commit ticker** is a facilitator brick on the deck, not an attendee task. If the deck is not in their nav, run the ticker on the projector from your Codespace.
- **“We cannot wait to see what you build”** as the facilitator identity — good. Pair it with “we will not touch your brick unless you ask.” The do-not-modify-the-baseplate rule needs to apply to *you* too, in front of them.

---

## Fast lane / slow lane (so CYOA does not mean “go to 3D”)

Print this. Do not improvise it.

**If you are done with the nametag and it is on `main`**

1. Make the card editable (name, role, one annoyance).
2. Still on `flat`: converter, countdown, punch list, QR of the PR — copy `_your-brick-here-XX` again.
3. After phase/iterate is merged: a brush, or a CSV table.
4. After phase/ai is merged: a card that calls `/api/claude`, *then* a prompt in `ai-XX`.
5. Remix: join a table; do not start a seventh baseplate.

**If you are still on signup / Codespaces / the first prompt**

- A facilitator sits down. They do not get a harder explanation of git. They get the paste-and-fill prompt and a human who clicks **New with options** with them.
- They are not behind. The nametag *is* the workshop until it exists.

---

## Facilitator git choreography

Maintenance cost is why this should stay at four phases.

- Bugfixes to the shell (devcontainer, README setup, a crash in `flat/Screen.jsx`) land on `main` and get merged *forward* into unmerged phase branches. Never the other way.
- Phase PRs only **add** a directory and two lines in `lib/baseplates.js` (and that baseplate’s own `bricks.js`). They do not restyle the landing page. They do not rewrite AGENTS.md mid-day.
- Merge when the room is listening to you, or at lunch — not while 15 Clines are applying diffs.
- After each merge, say the same three things: commit your work, pull `main`, keep both if asked, look at the nav.

Do not open phase PRs from attendee forks. They are yours, already reviewed, already green, waiting on a clock.

---

## What to peel off current `main` to make phase 0

You do not need new apps. You need a thinner `main` and the rest stacked on top.

**Leave on phase 0 `main`**

- Shell, UI kit, APIs, full dependencies, `flat` with `notes-XX` / `checklist-XX` / the stub

**Move to phase/iterate**

- `sketchpad/`

**Move to phase/ai**

- `vector-editor/` (keep `ai-XX`; it is the point)

**Move to phase/remix**

- `building-dashboard/`, `viewer3d/`, `pdf-markup/`
- Initialed bricks on every surface
- `public/sample-data/` + `lib/artifacts.js` if nothing in phase 0 needs them
- Artifact-seeded examples

**Keep off the attendee nav unless you have a specific reason**

- `workshop-deck/` (your projector)
- `chat/` (only if a brief needs a thread)

That mapping is why “current repo = two-thirds” is right: phases 0–2 are a *reduction* of what you already have. Phase 3 *is* what you already have, plus a capstone brief that uses it.

---

## Decisions to lock before anyone is invited

1. Day-of is a **shared repo**; Monday is template-or-fork. Not both on Saturday.
2. **Four** phase PRs, stacked, add-only. Plus a frozen **`gallery`** deploy for Welcome.
3. Morning branch = **GitHub username**. Initials live on the folder/`id`.
4. **Who may merge** attendee PRs.
5. **FAL_KEY**: secret, or demo-only.
6. **Vercel previews**: true, or cut from the closer.
7. First README prompt = **nametag**, not a landing page.
8. Capstone brief = **two surfaces, one artifact `kind`**, sample files already in `public/`.

Once those eight are decided, the talk you already wrote is in the right order. The missing piece was not another section of slides. It was a 9am tree that looks like a nametag, and a 4pm tree that looks like this repo.
