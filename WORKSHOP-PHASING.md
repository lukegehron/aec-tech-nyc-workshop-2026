# How to phase this workshop

Facilitator notes. Not attendee-facing. The afternoon already has an arc; this file is about what the *repo* should look like at each point so that arc is easy to land on, not a wall of apps.

**Collaborative Vibe Coding for AEC** — AEC Tech NYC, Wednesday, November 11, **2:00–5:00 pm**, Verizon Education Center, Cornell Tech. The hackathon follows on Saturday, November 14.

This is a **half-day**. In Boston it was a full day. The morning (Card + Iterate) worked: 39 attendee PRs before lunch. The afternoon (Call AI + Remix) did not: 11. So New York re-runs Boston's 10–1 as 2–5, and then we call it a day. There is no lunch merge, no Call AI, no Remix, no capstone.

`main` at 2:00 is Flat only. One phase PR adds Sketchpad. That is the whole kit.

---

## Locked for Wednesday

These are decided. Do not reopen them in the room.

- One shared repo. Attendees PR into `main`.
- **One** phase PR (`phase-1-iterate`), merged once, mid-afternoon.
- Attendee branch = **GitHub username**, the whole afternoon. Initials live on the folder and `id`.
- **Two facilitators merge.** Attendees never press Merge.
- First README prompt = **nametag**.
- This file is Wednesday-only. Monday / template-vs-fork is out of scope here.

## The branches

```
main                    ← 2:00. Flat only. Codespaces boot this.
  └── phase-1-iterate   ← merge ~3:25. Adds Sketchpad.
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
| 11:24 | 3:25 | `phase-1-iterate` merged. Sketchpad appears. |
| 11:33–12:29 | 3:30–4:30 | **20 iterate PRs**: cards gained controls, animation, a runner game; first Sketchpad brushes. |
| 12:29 | — | `phase-2-ai` merged. **Do not do this in New York.** |
| 12:50–1:00 | 4:30–5:00 | Stragglers. In New York this is the close. |
| afternoon | — | Remix merged, 11 PRs across 2½ hours. Cut. |

The lesson: the loop (prompt → look → PR → merge → pull) is the workshop. A new baseplate is only worth it once, and only after everyone has had a card merged.

---

## Two different empty walls

The plan uses “reveal” a lot. Those reveals are not the same trick. Keep them apart or the room will not know what just happened.

| Wall | What fills it | Who fills it | When |
|---|---|---|---|
| **The social wall** | Nametag cards on `flat` | Attendees, via PR → merge → `git pull origin main` | From ~2:40, then all afternoon |
| **The kit wall** | Sketchpad appears in the nav | You, by merging `phase-1-iterate` | Once, ~3:25 |

“The wall is no longer empty” after the first PR is **their names**, not a new app appearing. If the nav already has Sketchpad at 2:15, there is nothing to reveal later, and the nametag looks like a toy in a finished product.

---

## What does *not* get phased

Put these on `main` before anyone creates a Codespace. Changing them mid-afternoon means 25 people `npm install` on venue Wi-Fi, or a prebuild that no longer matches the tree.

- `.devcontainer/`, `.clinerules/`, and the Cline config
- The full `package.json` / lockfile. **Installed ≠ visible.** Unused libraries sitting in `node_modules` do not scare anyone. New nav items do.
- `app/` shell, `components/ui/`, `AGENTS.md`
- MIT license, README (attendee setup only — not the first prompt, see below)

What *does* get phased is **registration + example bricks**. A baseplate that is not imported in `lib/baseplates.js` is not in the nav. Better still: **do not even have the folder in the tree** until its phase. Cline and Claude Code will otherwise “helpfully” copy a Sketchpad brush during the nametag exercise.

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

**Why this is not too simple**

- For people who have never seen GitHub, “my name on a card, live in the browser, then a green merge button, then the room can see it” is a full hour. The sophistication is the loop, not the widget.
- Fast-lane people who finish in eight minutes get a printed menu of *second* bricks still on `flat` (unit converter, countdown, QR of their PR). They do not unlock Sketchpad early as a reward. That reward trains them to leave the lesson.

### Block 2 — Iterate (merge `phase-1-iterate` ~3:25)

**Add**

- `sketchpad/` — a brick is one function. Lowest-ceremony surface after flat. `pen-XX` (six lines) is the right example to read with the room.
- A couple of extra `_XX` brushes so copy-paste has a target (`calligraphy-XX`, `mirror-XX`, `spray-XX`).
- Optional, still on `flat`: JSON file → CSV → a table card. Papaparse is already in `package.json`.

**The iterate loop to actually say out loud**

1. Prompt.
2. Look at the browser, not the diff first.
3. Steer or restart.
4. Commit.

“Edit someone else’s brick” is the one line I would cut or rewrite. On a shared repo, with GitHub-newbies, it produces merge conflicts and hurt feelings. Neighbor **review** (comment on the PR, then copy the idea into your own brick) is the same social goal without two people owning one folder.

**Static card vs tiny editor** — stay on `flat`. The nametag grows inputs. That is the whole beat. Sketchpad is the choose-your-own-adventure fork for people who would rather draw than type. In Boston, most people stayed on their card, and that was fine.

---

## How the afternoon maps onto the PRs

| Clock | Talk / work | Repo |
|---|---|---|
| 2:00 | Welcome + setup. | Codespaces on `main`. No merge. |
| ~2:10 | Codespaces booting: LEGO talk, last year, barriers. | Still `main`. |
| ~2:40 | **Card.** Nametag, first prompt, first PR. | Social wall fills. Merge on sight. |
| ~3:25 | Reveal: merge **`phase-1-iterate`**. Everyone commits, pulls, looks at the nav. | One merge, while the room is listening. |
| ~3:30 | **Iterate.** Prompt / look / refine. Card grows inputs, or a Sketchpad brush. | Second wave of PRs. |
| ~4:30 | **Close.** Last merges, everyone pulls, tour the wall. Barriers unlocked, Monday, how to run this yourselves, see you Saturday. | Nothing new merges after the tour. |
| 5:00 | Done. | Every working tree clean, nothing ahead or behind. |

Pulls happen **at the start of a block**, after a reveal sentence, never while Cline is mid-edit. The script is always the same: *save, commit your brick, `git pull origin main`, keep both if GitHub asks.*

**Success at each point**, in one sentence, so you know whether to merge or stall:

- 3:20 — a nametag is on `main` and they have pulled.
- 4:30 — their card changes when you touch it, or a brush they wrote is on Sketchpad.
- 5:00 — their work is on the wall and their branch is in sync with `main`.

If the room is behind at 3:20, hold the merge. Nametags first, Sketchpad second; the reveal can slide to 3:45 and nothing breaks.

---

## Critique of the plan, kept from Boston

### What is strong — keep it

- **Web vs desktop as the barrier talk.** Right audience, right reason, and it justifies Codespaces without sounding like an IT policy.
- **Personal GitHub, not work SSO.** This will save the first half hour. Say it twice. Put it on the invite.
- **“New with options…”, not the green button.** Correct, and easy to blow. Rehearse it on a projector.
- **Username as the Codespace branch.** Right for people new to git.
- **Paste-and-fill first prompt, with a boundary.** This is the actual anti-blank-page device. It needs to live in the README and on a paper recipe card, not only in the talk.
- **Predict → inspect → accept / steer / restart.** Teach that before “be creative.”
- **GitHub in five nouns, then the afternoon’s loop.** Do not teach git. Teach a loop.
- **Three rules / keep both / one brick at a time.** Those are the fewest rules that keep a shared repo out of chaos. They belong on a slide that stays up.
- **One OpenRouter key for Cline and Claude Code.** Guard it.
- **Side topics while Cline is working.** Necessary. Pre-order them (vibe coding → last five years → tradeoffs → hosted vibe tools) so you are not inventing filler.
- **Don’t start with an app. Start with an annoyance.** Best closer you have. Put a sticky note on every chair for that sentence.
- **The five barriers, unlocked.** Good shape for the ending. Make sure the afternoon actually touched each one or the slide will feel like marketing.

### What is confusing — decide before the invite

**1. Shared repo vs template, on the day vs on Monday**

The social wall only works if everyone PRs into **one** repo. A template-fork afternoon gives you 25 isolated nametags and no reveal. Monday can be “fork this, or start from the template.” Saturday cannot be both. Say it: *today we share a box of bricks; Monday you can take a copy home.*

**2. Branch = GitHub username vs `flat/nametag-LG`**

The setup talk says username. The brick contract says `baseplate-id/brick-id`. Both are right for different days. They are fatal if you teach both before the first commit.

Recommendation: **username branch all afternoon.** Folder and `id` still end in initials. Do not stop the room to enforce one-brick-one-branch until the closer, when you explain how *you* work after the workshop.

**3. Who merges the nametag PRs?**

Two facilitators, approve on sight if the diff is a new folder + two lines. Boston proved this keeps up: 17 nametags in 40 minutes, median five minutes from open to merge.

**4. Cline is the room default, `claude` is advanced**

Good. Then the first prompt must work in Cline. Do not demo Claude Code until someone has had a win in the sidebar.

### What is missing — check before 2:00

- **A written nametag prompt**, tested, in the README and on paper. Who / place / boundary. “Don’t change the baseplate.”
- **What to do if Codespaces takes 15 minutes.** Have a backup: a second region prebuild, a facilitator hotspot, `npm ci && npm run dev` on a laptop for the two people whose Codespace dies. The LEGO talk is the filler; it cannot be the only plan.
- **Fast lane / slow lane.** Nametag in four minutes vs still on the GitHub invite at 3:00. Fast lane stays on `flat` with a menu. Slow lane gets a human, not a harder baseplate.
- **Image-in-prompt rehearsal.** “How to reference images in prompts” is a side quest that fails if Cline-in-Codespaces cannot attach the image. Try it in the private/incognito path on the facilitator checklist.
- **A three-piece parts bin, not sixty.** `components/ui/` is a firehose. The iterate block should name Button, Input, Dialog (and where they live).
- **Repo write access.** Collaborator vs org member vs fork-and-PR. Decide the permission model with the GitHub org admin, not at 2:05.
- **How `git pull origin main` interacts with an uncommitted Cline edit.** It will happen at the 3:25 merge. Script: commit or stash, then pull. Put it on the stay-up slide.

### What is too simple — and why it isn’t

- Nametag *as the whole afternoon* would be too simple. Nametag *as the first loop* is not. The second brick on `flat` is the pressure valve, not a new baseplate.
- “GitHub in five nouns” is the right size. Do not add remotes, rebase, or “what is HEAD.”

### What is too complex — leave it out

- **More than one unlock.** Boston’s second and third merges are what turned the afternoon into a dud. One reveal, mid-afternoon.
- **Building a new baseplate.** Keep it off the agenda. `flat` is the answer to “I need a different surface” nine times out of ten.
- **One-brick-one-branch, strictly.** Right as a firm convention. Wrong as a 2:30 exam.
- **“Create a new UI file” as a named step.** Too close to frontend homework. “Use `Button` and `Input` from the parts bin” is enough.

### What is a little off, but fixable

- **Half guided, half choose-your-own-adventure** is the right spirit. Give it a time: guided until the first merge; CYOA after, with a menu, not an open field.
- **Blocks named after activities (Card / Iterate)** beat blocks named after products. Do not rename them “Flat / Sketchpad.”
- **“We cannot wait to see what you build”** as the facilitator identity — good. Pair it with “we will not touch your brick unless you ask.” The do-not-modify-the-baseplate rule needs to apply to *you* too, in front of them.

---

## Fast lane / slow lane (so CYOA does not mean “go somewhere else”)

Print this. Do not improvise it.

**If you are done with the nametag and it is on `main`**

1. Make the card editable (name, role, one annoyance).
2. Still on `flat`: converter, countdown, punch list, QR of the PR — copy `_your-brick-here-XX` again.
3. Review a neighbor’s PR: leave a comment, then borrow the idea for your own brick.
4. After `phase-1-iterate` is merged: a Sketchpad brush, or a CSV table on `flat`.

**If you are still on signup / Codespaces / the first prompt**

- A facilitator sits down. They do not get a harder explanation of git. They get the paste-and-fill prompt and a human who clicks **New with options** with them.
- They are not behind. The nametag *is* the workshop until it exists.

---

## Facilitator git choreography

- Bugfixes to the shell (devcontainer, README setup, a crash in `flat/Screen.jsx`) land on `main` and get merged *forward* into `phase-1-iterate` if it is not merged yet. Never the other way.
- The phase PR only **adds** `baseplates/sketchpad/` and its registration (plus the small shell tweaks it needs). It does not restyle the landing page. It does not rewrite AGENTS.md mid-afternoon.
- Merge when the room is listening to you — not while 15 Clines are applying diffs.
- After the merge, say the same three things: commit your work, pull `main`, keep both if asked, look at the nav.

Do not open the phase PR from an attendee fork. It is yours, already reviewed, already green, waiting on a clock.

---

## Decisions to lock before anyone is invited

1. Day-of is a **shared repo**; Monday is template-or-fork. Not both on Saturday.
2. **One** phase PR, `phase-1-iterate`, cut from `main`, merged ~3:25.
3. Afternoon branch = **GitHub username**. Initials live on the folder/`id`.
4. **Who may merge** attendee PRs (two facilitators, approve on sight).
5. First README prompt = **nametag**, not a landing page.

Once those five are decided, the talk is in the right order. Boston showed the morning works. New York is that morning, in the afternoon, and then everyone goes home.
