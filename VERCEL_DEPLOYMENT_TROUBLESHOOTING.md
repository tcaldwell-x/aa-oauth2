# Vercel Deployment Troubleshooting Guide

## 🚨 **Issue: New commits not triggering deployments**

### **Step 1: Check Vercel Dashboard**

1. **Go to Vercel Dashboard**: [vercel.com/dashboard](https://vercel.com/dashboard)
2. **Find your project** in the list
3. **Check the "Deployments" tab** for recent activity
4. **Look for any failed builds** or error messages

### **Step 2: Verify GitHub Integration**

#### **Check Repository Connection**
1. In Vercel dashboard, go to your project settings
2. Check "Git" section
3. Verify the repository is connected to the correct GitHub repo
4. Ensure the correct branch is selected (usually `main` or `master`)

#### **Check GitHub Webhook**
1. Go to your GitHub repository
2. Navigate to **Settings** → **Webhooks**
3. Look for a Vercel webhook entry
4. Check if it's **Active** and **Delivering** successfully
5. If missing or failed, you may need to reconnect the repository

### **Step 3: Manual Deployment Test**

If automatic deployments aren't working:

1. **Go to Vercel Dashboard**
2. **Click "Deploy"** on your project
3. **Select the branch** you want to deploy (usually `main`)
4. **Wait for build** to complete
5. **Check the logs** for any errors

### **Step 4: Check Project Configuration**

#### **Verify vercel.json**
```json
{
  "version": 2,
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "installCommand": "npm install",
  "framework": "node",
  "builds": [
    {
      "src": "api/**/*.ts",
      "use": "@vercel/node@3.0.0"
    }
  ]
}
```

#### **Verify package.json**
```json
{
  "name": "account-activity-dashboard-enterprise",
  "version": "1.0.0",
  "type": "module",
  "engines": {
    "node": ">=18.0.0"
  },
  "scripts": {
    "build": "tsc",
    "vercel-build": "tsc"
  }
}
```

### **Step 5: Common Issues & Solutions**

#### **Issue: "No deployments triggered"**
**Possible Causes:**
- GitHub webhook not configured
- Wrong branch selected
- Repository not properly connected

**Solutions:**
1. **Reconnect repository** in Vercel dashboard
2. **Check branch settings** in project configuration
3. **Verify webhook** in GitHub repository settings

#### **Issue: "Build failed"**
**Possible Causes:**
- TypeScript compilation errors
- Missing dependencies
- Node.js version incompatibility

**Solutions:**
1. **Test locally**: `npm run build`
2. **Check dependencies**: `npm install`
3. **Verify Node.js version**: Ensure >=18.0.0

#### **Issue: "Deployment timeout"**
**Possible Causes:**
- Complex build process
- Large dependencies
- Resource constraints

**Solutions:**
1. **Simplify build**: Remove unnecessary dependencies
2. **Optimize TypeScript**: Use `"noEmit": true` in tsconfig.json
3. **Check build logs**: Look for specific timeout reasons

### **Step 6: Force Redeploy**

If nothing else works:

#### **Method 1: Reconnect Repository**
1. Go to Vercel project settings
2. Disconnect the GitHub repository
3. Reconnect it again
4. This will trigger a fresh deployment

#### **Method 2: Delete and Recreate Project**
1. Delete the current Vercel project
2. Import the repository again
3. Set up environment variables
4. Deploy manually

#### **Method 3: Clear Cache**
1. Make a small change to any file
2. Commit and push
3. This forces a fresh build

### **Step 7: Debug Build Process**

#### **Check Local Build**
```bash
# Test build locally
npm run build

# Check for TypeScript errors
npx tsc --noEmit

# Test API endpoints locally
npm run dev
```

#### **Check Vercel Build Logs**
1. Go to Vercel dashboard
2. Click on a deployment
3. Check "Build Logs" tab
4. Look for specific error messages

### **Step 8: Environment Variables**

Ensure all required environment variables are set in Vercel dashboard:

- `X_CONSUMER_KEY`
- `X_CONSUMER_SECRET`
- `X_ACCESS_TOKEN`
- `X_ACCESS_TOKEN_SECRET`
- `X_USER_ID`
- `X_BEARER_TOKEN`

### **Step 9: Test Deployment**

Once deployment succeeds, test these endpoints:

```bash
# Health check
curl https://your-domain.vercel.app/api/health

# Test API
curl https://your-domain.vercel.app/api/test

# Webhooks
curl https://your-domain.vercel.app/api/webhooks

# Users
curl https://your-domain.vercel.app/api/users
```

### **Step 10: Contact Support**

If issues persist:

1. **Vercel Status**: [status.vercel.com](https://status.vercel.com)
2. **Vercel Support**: [vercel.com/support](https://vercel.com/support)
3. **Community**: [github.com/vercel/vercel/discussions](https://github.com/vercel/vercel/discussions)

## 🔧 **Prevention Tips**

1. **Always test locally first**:
   ```bash
   npm run build
   npm run dev
   ```

2. **Keep commits small and focused**

3. **Monitor deployment logs** regularly

4. **Set up notifications** for failed builds

5. **Use descriptive commit messages** to track changes 