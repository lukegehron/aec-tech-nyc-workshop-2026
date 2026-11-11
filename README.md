# Collaborative Vibe Coding for AEC

AEC Tech NYC · Wednesday, November 11, 2:00–5:00 pm · Verizon Education Center, Cornell Tech

One shared repo. One branch (your initials). One new folder per pull request. Two facilitators merge — **you never press Merge**.

[Create a Codespace](https://codespaces.new/lukegehron/aec-tech-nyc-workshop-2026)

## 1 · Open your Codespace

1. Ideally use a **personal** GitHub account (a work SSO may cause issues).
2. Your branch already exists: it is **your two initials** (e.g. `LG`). Do not create a new branch. Stay on this one for the whole workshop.
3. Open **Code → Codespaces → New with options**. Do not use the green button or plus button. Pick **your initials branch**.
4. Paste the `sk-or-` key from a facilitator into `OPENROUTER_API_KEY`.
5. Create the Codespace. The first boot takes a few minutes — that is expected. Press **Trust** when it asks.

## 2 · Open Cline and start the app

1. Drag the **Cline** icon (the robot) in the left sidebar, right-click, **Move To → Secondary Side Bar**.
2. In the **Terminal** tab, type `npm run dev` and wait for **Ready**. Leave that terminal open all afternoon.
3. Open the **Ports** tab and click the link for port **3000**.

If `npm run dev` says *Another next dev server is already running*, the app is already up — just open port 3000.

## 3 · Three rules

1. Everything you write stays inside **your brick folder**. Do not edit a baseplate, the app shell, or anyone else's brick.
2. A brick's folder and its `id` end in **your two initials** (`nametag-LG`). Starter examples end in `-XX`.
3. After a facilitator merges (yours, a neighbor's, or a phase unlock): save, commit, then `git pull origin main`. If git asks, **keep both**.

After the break, two new surfaces appear in the nav: **Sketchpad** (draw) and the **3D Viewer** (orbit a building). That is us unlocking them, not you missing a step.

## 4 · Your first brick — a nametag

Open **Flat Baseplate**. Copy the stub folder, put your initials on it, snap it on with two lines, and turn the clock into a trading card.

In Cline, press **+** for a new chat and stay in **Act** (toggle at the bottom of the panel if it says Plan). Paste the prompt from the bottom of the check-in questionnaire, then send.

Then: look at the browser (not the diff first). Steer with a follow-up, or restore a Cline checkpoint if it went wrong.

### Ship it — with buttons

Open **Source Control** (the branch icon in the left bar). The message box should say *commit on* **your initials** branch. If it says `main`, stop and ask a facilitator.

1. **Message** — click the **Cline** icon (the robot) at the top of **Changes**. It writes the commit message for you.
2. **Commit** — the green button.
3. **Push** — click **Sync Changes** (or **Publish Branch**).
4. **Pull request** — click the **Create Pull Request** icon at the top of **Changes**. Into `main`, then **Create**.
5. **Stop.** A facilitator merges. You never press Merge.

Accept the popups about copying text to the clipboard.

### After we merge — type one command

When a facilitator says the wall has your card, open a **new terminal** (the **+**) — not the one running `npm run dev` — and type:

```bash
git pull origin main
```

Then click **Sync Changes** once more so your branch on GitHub catches up too.

- *divergent branches* / *need to specify how to reconcile*: run `git pull --no-rebase --no-edit origin main`.
- A merge-message tab opens: just close it.
- A conflict: **keep both**.

Every later brick is the same loop: new folder, initials on the `id`, two lines in that baseplate's `bricks.js`, new PR, wait.

## 5 · Cline (default) and Claude Code (advanced)

One OpenRouter key powers Cline, Claude Code, and the app's own API routes. Never put a key in a brick or in the browser.

Cline is the room default. It is already signed in with **OpenRouter** (bring-your-own-key) and **auto-approve is on**, so you should not hit a provider login or an Approve button on every file. If Cline still asks you to pick a provider, run **Developer: Reload Window** from the Command Palette. If the model picker is empty, choose OpenRouter in Cline settings (gear icon).

If you already live in a terminal, `claude` uses the same key. Run `/status` and confirm the token is `ANTHROPIC_AUTH_TOKEN` and the base URL is `https://openrouter.ai/api`. Finish a nametag in Cline before switching.

### Which model

The room uses two models. Both cost the same and both can read images, so you can attach a screenshot or sketch with either one. The shared key is the room's budget, so keep chats short (see below).

- **anthropic/claude-sonnet-5.5** — start here.
- **openai/gpt-6.1-sol** — switch here if Sonnet keeps going in circles on the same problem. A second model often gets unstuck where the first one did not. Start a new chat when you switch.

### Start a new chat

Each turn resends the whole thread, so a long chat costs more than a short one — even if you are only asking a small follow-up. Start a **new Cline chat** when you begin a new brick, after you ship, or when the agent is looping. Do not keep the nametag thread going into the next task.

## 6 · Take it with you

The [survival kit](SURVIVAL-KIT.md) has the phrasebook, the prompts for a project you have never seen, and what to do when you are stuck. Hacking this weekend? It is not too late to [sign up for Saturday's hackathon](https://www.aectech.us/nyc-hackathon).
