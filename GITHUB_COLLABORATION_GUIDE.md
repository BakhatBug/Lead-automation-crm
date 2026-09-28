# 🐙 Git & GitHub Team Collaboration Guide

This guide describes the standard Git workflow for your 5-person engineering team to collaborate smoothly without stepping on each other's code.

---

## 🌳 1. Branching Strategy

Our repository uses a **Trunk-Based / Protected Branch** workflow:

```
[main] (Production Ready, Protected)
  ▲
  └── [staging] (Integration Branch)
        ▲
        ├── [module/1-lead-data]              (Team Member 1)
        ├── [module/2-campaign-engine]        (Team Member 2)
        ├── [module/3-mailbox-deliverability] (Team Member 3)
        ├── [module/4-unified-inbox-ai]       (Team Member 4)
        └── [module/5-pipeline-analytics]     (Team Member 5)
```

### Branch Rules:
- **`main`**: Always releasable, stable code. Direct pushes are blocked.
- **`staging`**: Shared integration branch where module features merge first for QA before release.
- **`module/<name>`**: Dedicated development branch for each team member's domain.

---

## 🚀 2. Initial Setup for Team Members

### Step 1: Clone the Repository
```bash
git clone https://github.com/<YOUR_ORGANIZATION>/lead-automation.git
cd lead-automation
```

### Step 2: Install Dependencies
```bash
npm install
cd server && npm install
cd ../client && npm install
cd ..
```

### Step 3: Run the Full-Stack Application
To start both backend API (port 5000) and frontend UI (port 5173) concurrently:
```bash
npm run dev
```
Open **`http://localhost:5173`** in your browser.

---

## 🌿 3. Daily Workflow for Each Team Member

### Starting Your Work:
Always ensure your branch is up to date with `staging`:
```bash
# Example for Team Member 1:
git checkout module/1-lead-data
git fetch origin
git merge origin/staging
```

### Making Changes:
Work on your assigned module files (see [MODULES_DIVISION_AND_ROADMAP.md](file:///d:/Projects/lead%20automation/MODULES_DIVISION_AND_ROADMAP.md)).

### Pre-Commit Checklist:
Before committing, always test the production build:
```bash
# From repository root:
npm run build
```
Ensure there are **0 TypeScript compilation errors**.

### Committing & Pushing:
Write clear, conventional commit messages:
```bash
git add .
git commit -m "feat(leads): add CSV drag-and-drop parser with column validation"
git push origin module/1-lead-data
```

---

## 🔀 4. Pull Requests (PRs) & Code Review

1. Go to GitHub and open a **Pull Request** from your `module/<name>` branch targeting `staging` (or `main`).
2. The custom PR template will automatically load with checklists:
   - Module selection
   - Description of changes
   - Verification steps (`npm run build` passed)
   - Security & compliance checks
3. **Automated CI Validation:**
   - GitHub Actions (`.github/workflows/ci.yml`) will automatically trigger and verify that the backend and frontend compile with 0 errors.
4. **Peer Review:**
   - Request review from at least 1 other teammate before merging.
5. **Merge:**
   - Use **"Squash and Merge"** to keep git history clean and legible.

---

## 🔄 5. Resolving Merge Conflicts

If another teammate merged changes into `staging`, rebase or merge `staging` into your branch:
```bash
git checkout module/your-module
git pull origin staging
```
If Git flags a conflict in `package.json` or `db/store.ts`:
1. Open the conflicted file in VS Code or your IDE.
2. Accept both changes or keep the updated schema.
3. Run `npm run build` to confirm everything still builds cleanly.
4. Stage and commit the resolution:
   ```bash
   git add .
   git commit -m "chore: resolve merge conflicts with staging"
   git push origin module/your-module
   ```

---

## 🏷️ Commit Convention Cheat Sheet

| Prefix | Use Case | Example |
| :--- | :--- | :--- |
| `feat:` | New feature | `feat(inbox): add 1-click objection handling swap` |
| `fix:` | Bug fix | `fix(mailboxes): prevent sending when quota is exceeded` |
| `refactor:` | Code improvements | `refactor(pipeline): simplify deal probability formula` |
| `style:` | UI / CSS polish | `style(dashboard): improve responsive metric cards` |
| `test:` | Adding test cases | `test(leads): add unit test for CSV edge case parsing` |
| `docs:` | Documentation | `docs: update API endpoints in roadmap` |
