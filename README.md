# Collaborative Vibe Coding for AEC

AEC Tech NYC · Wednesday, November 11, 2:00–5:00 pm · Verizon Education Center, Cornell Tech

One shared repo. One branch (your GitHub username). One new folder per pull request. Two facilitators merge — **you never press Merge**.

[Create a Codespace](https://codespaces.new/lukegehron/aec-tech-nyc-workshop-2026)

## 1 · Create your branch

1. Ideally use a **personal** GitHub account (a work SSO may cause issues).
2. Create a new git branch named after your GitHub username. Stay on this branch for the whole workshop.
3. Open **Code → Codespaces → New with options**. Do not use the green button or plus button.
4. Paste the `sk-or-` key from a facilitator into `OPENROUTER_API_KEY`.
5. Create the Codespace. The first boot takes a few minutes — that is expected.

## 2 · Open Cline and check it works

1. Drag the **Cline** icon (the robot) in the left sidebar, right-click, move to secondary toolbar .
2. Run `npm run dev` in the terminal to make sure things are working correctly.
3. Click **Open in Browser** on port 3000.

## 3 · Three rules

1. Everything you write stays inside **your brick folder**. Do not edit a baseplate, the app shell, or anyone else's brick.
2. A brick's folder and its `id` end in **your two initials** (`nametag-LG`). Starter examples end in `-XX`.
3. After a facilitator merges (yours, a neighbor's, or a phase unlock): save, commit, then `git pull origin main`. If git asks, **keep both**.

Partway through, a second surface (**Sketchpad**) will appear in the nav. That is us unlocking it, not you missing a step.

## 4 · Your first brick — a nametag

Open **Flat Baseplate**. Copy the stub folder, put your initials on it, snap it on with two lines, and turn the clock into a trading card.

In Cline, stay in **Act** (toggle at the bottom of the panel if it says Plan). Paste the prompt from the bottom of the checkin questionnaire, then send.

Then: look at the browser (not the diff first). Steer with a follow-up, or restore a Cline checkpoint if it went wrong.

### Ship it

When the brick looks right, ask Cline to ship it. Paste this:

> Follow the **Wednesday Git loop for agents** in `AGENTS.md`. Review the changes
> for this brick and run the relevant checks. If everything is ready, stage
> only this brick's new folder and its two registration lines, make a concise
> commit, push my current GitHub-username branch, and open a pull request into
> `main`. If this branch already has an open pull request, update that one
> instead of opening another. Do not merge it. Give me the pull request link
> when you are done.

Stop there. A facilitator will merge the pull request. When they say the wall
has your card, paste this into Cline:

> Follow the post-merge step in the **Wednesday Git loop for agents** in
> `AGENTS.md`. The pull request has been merged. Pull the latest `main` into my
> current GitHub-username branch, then push the current branch so its remote is
> also up to date. Do not create or switch branches. Finish by confirming the
> working tree is clean with no commits ahead or behind.

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
