# Backend Deployment Instructions

## Changes Ready for Deployment

The following changes have been committed locally and need to be deployed to Vercel:

### Commit: 2293555
**Message**: Fix messages API: add messages key to response and add read endpoint

**Files Changed**:
1. `app/api/messages/route.ts` - Added `messages` key to response and support for snake_case parameters
2. `app/api/messages/[id]/read/route.ts` - New endpoint for marking messages as read

## Deployment Options

### Option 1: Manual Push to GitHub
Since the terminal doesn't support interactive git authentication, you need to push from a different environment:

```bash
# On a machine with git credentials configured
cd dugtong-nextjs
git push origin main
```

Vercel will automatically deploy once the code is pushed to GitHub.

### Option 2: Vercel Dashboard Redeploy
1. Go to https://vercel.com/dashboard
2. Find your project (dugtong-next)
3. Click on the project
4. Go to "Deployments" tab
5. Click the three dots on the latest deployment
6. Select "Redeploy"
7. Check "Use existing Build Cache" or uncheck for fresh build

Note: This won't include the new changes since they haven't been pushed to GitHub yet.

### Option 3: Vercel CLI
```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy to production
cd dugtong-nextjs
vercel --prod
```

### Option 4: GitHub Web Upload
1. Go to https://github.com/your-username/dugtong-nextjs
2. Navigate to `app/api/messages/route.ts`
3. Click "Edit this file"
4. Copy the local content and paste it
5. Commit changes
6. Repeat for `app/api/messages/[id]/read/route.ts` (create new file)

## Verify Deployment

After deployment:

1. Go to https://dugtung-next.vercel.app/api/messages
2. You should see the new response format with both `items` and `messages` keys
3. Test the new `/api/messages/[id]/read` endpoint

## Test the Fix

```bash
# From app-project directory
npx expo start

# Login as:
# Full Name: Admin User
# Contact Number: 09111222333

# Navigate to Messages page
# You should see all messages displayed correctly
```

## Expected Behavior

Once deployed, the Messages page will:
- ✅ Display all messages from the database
- ✅ Show sender names correctly
- ✅ Allow marking messages as read
- ✅ Allow closing messages
- ✅ Support search and filtering
- ✅ Show modern card-based UI
