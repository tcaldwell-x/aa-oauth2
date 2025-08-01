# Vercel Deployment Troubleshooting Guide

## 🚨 **If Vercel is not deploying new commits:**

### **Step 1: Check Vercel Dashboard**
1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Find your project
3. Check the "Deployments" tab
4. Look for failed builds and error messages

### **Step 2: Common Issues & Solutions**

#### **Issue: Build Failing**
**Symptoms:**
- Build status shows "Failed" in Vercel dashboard
- Error messages in build logs

**Solutions:**
1. **Check Node.js Version**: Ensure your project specifies Node.js 18+
   ```json
   {
     "engines": {
       "node": ">=18.0.0"
     }
   }
   ```

2. **Check Dependencies**: Make sure all dependencies are in `package.json`
   ```bash
   npm install
   npm run build
   ```

3. **Check TypeScript**: Ensure no compilation errors
   ```bash
   npx tsc --noEmit
   ```

#### **Issue: No Automatic Deployments**
**Symptoms:**
- Commits not triggering new deployments
- Manual deployments work but auto-deploy doesn't

**Solutions:**
1. **Check GitHub Integration**: 
   - Go to Vercel project settings
   - Verify GitHub repository is connected
   - Check branch settings

2. **Check Webhook**: 
   - In GitHub repo settings → Webhooks
   - Verify Vercel webhook is active

3. **Check Branch**: 
   - Ensure you're pushing to the correct branch
   - Check Vercel project settings for branch configuration

#### **Issue: Environment Variables**
**Symptoms:**
- Build succeeds but runtime errors
- 500 errors on API endpoints

**Solutions:**
1. **Set Environment Variables** in Vercel dashboard:
   - `X_CONSUMER_KEY`
   - `X_CONSUMER_SECRET`
   - `X_ACCESS_TOKEN`
   - `X_ACCESS_TOKEN_SECRET`
   - `X_USER_ID`
   - `X_BEARER_TOKEN`

### **Step 3: Test Your Deployment**

#### **Health Check Endpoint:**
```
GET https://your-domain.vercel.app/api/health
```
**Expected Response:**
```json
{
  "status": "healthy",
  "message": "Vercel deployment is working!",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "environment": "production",
  "nodeVersion": "v18.x.x"
}
```

#### **Test API Endpoint:**
```
GET https://your-domain.vercel.app/api/test
```
**Expected Response:**
```json
{
  "message": "API is working!",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "environment": "production"
}
```

### **Step 4: Manual Deployment**

If automatic deployments aren't working:

1. **Go to Vercel Dashboard**
2. **Click "Deploy"** on your project
3. **Select the branch** you want to deploy
4. **Wait for build** to complete
5. **Check logs** for any errors

### **Step 5: Debug Build Logs**

#### **Common Error Messages:**

**"Cannot find module"**
- Check import paths in API files
- Ensure all dependencies are in `package.json`

**"TypeScript compilation failed"**
- Run `npm run build` locally to check for errors
- Fix any TypeScript errors

**"Node.js version incompatible"**
- Add `"engines": { "node": ">=18.0.0" }` to `package.json`

**"Build timeout"**
- Simplify API routes
- Remove complex dependencies

### **Step 6: Force Redeploy**

If nothing else works:

1. **Delete and recreate Vercel project:**
   - Go to Vercel dashboard
   - Delete the project
   - Re-import from GitHub
   - Set environment variables again

2. **Clear cache:**
   - Add a small change to any file
   - Commit and push
   - This forces a fresh build

### **Step 7: Contact Support**

If issues persist:
1. **Check Vercel Status**: [status.vercel.com](https://status.vercel.com)
2. **Vercel Support**: [vercel.com/support](https://vercel.com/support)
3. **Community**: [github.com/vercel/vercel/discussions](https://github.com/vercel/vercel/discussions)

## 🔧 **Prevention Tips**

1. **Always test locally first:**
   ```bash
   npm run build
   npm run dev
   ```

2. **Keep dependencies minimal:**
   - Remove unused packages
   - Use specific versions

3. **Use TypeScript properly:**
   - Enable strict mode
   - Fix all type errors

4. **Monitor deployments:**
   - Check Vercel dashboard regularly
   - Set up notifications for failed builds 