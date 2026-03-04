# ElevateHR App — Local Setup Guide

This document walks you through setting up the **ElevateHR** project on your machine step by step. The app is a Next.js 13 application with Convex (backend/database), Material UI, and optional integrations (Calendly, OpenAI).

---

## Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [Clone the Repository](#2-clone-the-repository)
3. [Install Node.js and Package Manager](#3-install-nodejs-and-package-manager)
4. [Install Dependencies](#4-install-dependencies)
5. [Environment Variables](#5-environment-variables)
6. [Convex Setup](#6-convex-setup)
7. [Run the Application](#7-run-the-application)
8. [Verify the Setup](#8-verify-the-setup)
9. [Optional Integrations](#9-optional-integrations)
10. [Troubleshooting](#10-troubleshooting)

---

## 1. Prerequisites

Before you begin, ensure you have the following installed and available in your terminal:

| Requirement | Purpose | How to check |
|-------------|---------|--------------|
| **Node.js** | Runtime for the app (v18.x or v20.x LTS recommended) | `node -v` |
| **npm** or **yarn** | Package manager | `npm -v` or `yarn -v` |
| **Git** | Clone and version control | `git --version` |

- **Node.js**: Download from [nodejs.org](https://nodejs.org/) (LTS). The project uses Next.js 13 and modern React.
- **Yarn** (optional): Install globally with `npm install -g yarn` if you prefer Yarn over npm.

---

## 2. Clone the Repository

1. Open a terminal (PowerShell, Command Prompt, or Git Bash on Windows; Terminal on macOS/Linux).

2. Navigate to the folder where you want the project:
   ```bash
   cd C:\Users\YourName\Documents\projects
   # or on macOS/Linux: cd ~/projects
   ```

3. Clone the repo (replace with your actual repo URL if different):
   ```bash
   git clone <repository-url> elevatehr-app
   cd elevatehr-app
   ```

   If you already have the code (e.g. from a zip), just `cd` into the project root:
   ```bash
   cd path/to/elevatehr-app
   ```

---

## 3. Install Node.js and Package Manager

- **Node.js**: Install v18 or v20 LTS from [nodejs.org](https://nodejs.org/). After install, restart the terminal and run:
  ```bash
  node -v   # e.g. v20.10.0
  npm -v    # e.g. 10.2.0
  ```

- **Yarn** (optional): To use Yarn instead of npm:
  ```bash
  npm install -g yarn
  yarn -v
  ```

---

## 4. Install Dependencies

From the **project root** (`elevatehr-app`), install all dependencies.

**Using npm:**
```bash
npm install
```

**Using Yarn:**
```bash
yarn install
```

This installs Next.js, React, Convex, Material UI, and the rest of the dependencies listed in `package.json`. The first run may take a few minutes.

---

## 5. Environment Variables

The app needs environment variables for Convex and optional services. These are loaded from a `.env.local` file in the project root (this file is git-ignored).

### Step 5.1 — Create `.env.local`

1. In the project root, create a file named `.env.local` (no space between `.env` and `.local`).

   **Windows (Command Prompt):**
   ```cmd
   type nul > .env.local
   ```

   **Windows (PowerShell):**
   ```powershell
   New-Item -Path .env.local -ItemType File
   ```

   **macOS / Linux:**
   ```bash
   touch .env.local
   ```

2. Open `.env.local` in your editor and add the variables below. Replace placeholder values with your real keys/URLs.

### Step 5.2 — Required variable: Convex

The app **must** have a Convex deployment URL. Without it, the app will not work.

```env
# Required — Convex backend URL (from Convex dashboard after project setup)
NEXT_PUBLIC_CONVEX_URL=https://your-deployment-name.convex.cloud
```

You will get this URL in [Step 6 (Convex Setup)](#6-convex-setup).

### Step 5.3 — Optional variables

Add only the ones you use.

```env
# Base URL of your app (for links in emails, share URLs, etc.)
NEXT_PUBLIC_HOST=http://localhost:3000

# ElevateHR API base URL (if you use an external Elevate API)
NEXT_PUBLIC_ELEVATE_BASE_URL=

# Calendly OAuth (for “Connect Calendly” and scheduling)
NEXT_PUBLIC_CALENDLY_CLIENT_ID=
NEXT_PUBLIC_CALENDLY_CLIENT_SECRET=

# Calendly Personal Access Token (for fetching scheduled events)
NEXT_PUBLIC_PERSONAL_ACCESS_TOKEN=

# OpenAI (for AI features, e.g. content generation)
NEXT_PUBLIC_OPENAI_KEY=
```

Save `.env.local`. **Do not commit this file** (it should already be in `.gitignore`).

---

## 6. Convex Setup

The app uses [Convex](https://convex.dev) for backend, database, and serverless functions. You need a Convex project and the deployment URL in `.env.local`.

### Step 6.1 — Install Convex CLI (if not already)

```bash
npm install -g convex
# or
yarn global add convex
```

Check:

```bash
npx convex --version
```

### Step 6.2 — Log in to Convex

```bash
npx convex login
```

This opens the browser to log in or create a Convex account.

### Step 6.3 — Create or link a Convex project

From the **project root**:

- **New project:**
  ```bash
  npx convex dev
  ```
  When prompted, choose “Create a new project” and follow the prompts. The CLI will create a Convex project and add a `.env.local` entry (or update it) with `NEXT_PUBLIC_CONVEX_URL=...`.

- **Existing project:** If you already have a Convex project (e.g. from a teammate), run:
  ```bash
  npx convex dev
  ```
  and choose “Use an existing project”, then select the project. Ensure `NEXT_PUBLIC_CONVEX_URL` in `.env.local` matches the deployment URL from the [Convex dashboard](https://dashboard.convex.dev).

### Step 6.4 — Push schema and functions

With `convex dev` running (or in a one-off run):

```bash
npx convex dev
```

This will:

- Push the schema from `convex/schema.ts`
- Deploy functions from `convex/` (e.g. `convex/modules/`, `convex/utils/`)
- Watch for changes and redeploy when you edit Convex code

Leave this terminal open while developing, or run it whenever you change Convex code. Your `NEXT_PUBLIC_CONVEX_URL` in `.env.local` must point to this Convex deployment.

### Step 6.5 — (Optional) Seed data

If the project provides a seed script for initial data:

```bash
npx convex run seed:run
# or as documented in the repo
```

Use the exact command from the project’s Convex/README if different.

---

## 7. Run the Application

You need **two** processes for full local development:

1. **Convex** (backend)
2. **Next.js** (frontend)

### Option A — Two terminals (recommended)

**Terminal 1 — Convex:**

```bash
cd path/to/elevatehr-app
npx convex dev
```

Keep this running so your Convex backend is live and in sync with `convex/`.

**Terminal 2 — Next.js:**

```bash
cd path/to/elevatehr-app
npm run dev
# or
yarn dev
```

The app will be at **http://localhost:3000**.

### Option B — One terminal (Convex in background)

You can run Convex in the background and only start Next in the foreground, but for debugging it’s easier to use two terminals as above.

### Build for production (optional)

```bash
npm run build
# or
yarn build
```

Then run the production server:

```bash
npm run start
# or
yarn start
```

Note: The project’s `package.json` no longer uses a Unix-only `prebuild` script, so `yarn build` / `npm run build` works on Windows as well.

---

## 8. Verify the Setup

1. **Convex:** In the terminal where `npx convex dev` is running, you should see a message that the deployment is synced and the Convex URL.
2. **App:** Open [http://localhost:3000](http://localhost:3000) in your browser. You should see the app load without a Convex connection error.
3. **Features:** Log in or sign up (if applicable), open the dashboard, and try creating a job or viewing assessments. If those use Convex, they should load data from your Convex project.

If you see “Missing CONVEX_URL” or similar, double-check that `.env.local` contains `NEXT_PUBLIC_CONVEX_URL` and that you restarted the Next.js dev server after creating or editing `.env.local`.

---

## 9. Optional Integrations

### Calendly

- Create an app at [Calendly Integrations](https://developer.calendly.com/) and get **Client ID** and **Client Secret**.
- Set `NEXT_PUBLIC_CALENDLY_CLIENT_ID` and `NEXT_PUBLIC_CALENDLY_CLIENT_SECRET` in `.env.local`.
- For “scheduled events” (e.g. dashboard), create a [Personal Access Token](https://developer.calendly.com/api-docs/) and set `NEXT_PUBLIC_PERSONAL_ACCESS_TOKEN`.

### OpenAI

- Get an API key from [OpenAI](https://platform.openai.com/api-keys).
- Set `NEXT_PUBLIC_OPENAI_KEY` in `.env.local`.

### ElevateHR API

- If you use an external ElevateHR API, set `NEXT_PUBLIC_ELEVATE_BASE_URL` to that API’s base URL.

---

## 10. Troubleshooting

### “-d was unexpected at this time” (Windows)

- This was caused by a Unix-style `prebuild` script in `package.json`. It has been removed. If you still see it, pull the latest `package.json` and run `yarn build` or `npm run build` again.

### “Missing CONVEX_URL” or Convex not connecting

- Ensure `.env.local` exists in the project root and contains `NEXT_PUBLIC_CONVEX_URL=https://....convex.cloud`.
- Restart the Next.js dev server after changing `.env.local`.
- Ensure `npx convex dev` has been run at least once so the Convex project exists and the URL is correct.

### Port 3000 already in use

- Stop the process using port 3000, or run Next on another port:
  ```bash
  npm run dev -- -p 3001
  # or
  yarn dev -p 3001
  ```
  Then open http://localhost:3001.

### Dependencies fail to install

- Clear cache and reinstall:
  ```bash
  rm -rf node_modules
  npm cache clean --force
  npm install
  ```
  On Windows (PowerShell): remove `node_modules` manually, then run `npm cache clean --force` and `npm install`.

### Convex CLI not found

- Install globally: `npm install -g convex`, or run via npx: `npx convex dev`.

### Build fails on Windows

- Use Node LTS (v18 or v20). Ensure `package.json` does not use Unix-only shell commands in scripts. The current `build` script is `next build` only.

---

## Quick reference

| Task | Command |
|------|--------|
| Install dependencies | `npm install` or `yarn install` |
| Convex (backend) | `npx convex dev` |
| Next.js (frontend) | `npm run dev` or `yarn dev` |
| Production build | `npm run build` or `yarn build` |
| Production start | `npm run start` or `yarn start` |
| Lint | `npm run lint` or `yarn lint` |

---

## Summary checklist

- [ ] Node.js v18+ (or v20 LTS) installed  
- [ ] Repository cloned and `cd` into project root  
- [ ] Dependencies installed (`npm install` or `yarn install`)  
- [ ] `.env.local` created with at least `NEXT_PUBLIC_CONVEX_URL`  
- [ ] Convex CLI installed and logged in (`npx convex login`)  
- [ ] Convex project created or linked (`npx convex dev`)  
- [ ] Convex schema/functions pushed (done by `convex dev`)  
- [ ] Next.js dev server started (`npm run dev` or `yarn dev`)  
- [ ] App opens at http://localhost:3000 and can talk to Convex  

For more on Next.js, see [Next.js Docs](https://nextjs.org/docs). For Convex, see [Convex Docs](https://docs.convex.dev).
