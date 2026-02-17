---
description: how to deploy the Biolab Box Manager to Vercel via Git
---

Follow these steps to deploy your project:

### 1. Initialize Git locally
If you haven't already, initialize git and make your first commit:
```bash
git init
git add .
git commit -m "feat: integrate supabase and prepare for deployment"
```

### 2. Create a GitHub Repository
1. Go to [github.com/new](https://github.com/new).
2. Name your repository (e.g., `box-manager`).
3. Keep it Public or Private as you prefer.
4. **Do not** initialize with README, license, or .gitignore (we already have these).

### 3. Link Local to Remote
Copy the commands from GitHub and run them in your terminal (replace `USERNAME` and `REPO`):
```bash
git remote add origin https://github.com/USERNAME/REPO.git
git branch -M main
git push -u origin main
```

### 4. Connect to Vercel
1. Go to the [Vercel Dashboard](https://vercel.com/dashboard).
2. Click **Add New** > **Project**.
3. Import your GitHub repository.
4. **Environment Variables**:
   Under the "Environment Variables" section, add:
   - `VITE_SUPABASE_URL`: (your URL)
   - `VITE_SUPABASE_ANON_KEY`: (your Key)
5. Click **Deploy**.

### 5. Future Updates
Whenever you want to update the live app:
```bash
git add .
git commit -m "your description"
git push
```
Vercel will detect the push and automatically redeploy!
