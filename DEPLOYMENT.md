# Deploying Verisite Backend to Render

This guide will walk you through deploying the Verisite backend to Render.

## Prerequisites

- A Render account (sign up at [render.com](https://render.com))
- GitHub repository with your code (or GitLab/Bitbucket)
- Linode Object Storage credentials (for file uploads)
- Paystack API keys (for payments)

## Step 1: Prepare Your Repository

1. Push your code to GitHub/GitLab/Bitbucket
2. Ensure all environment variables are documented in `.env.example`

## Step 2: Create PostgreSQL Database on Render

1. Go to your Render Dashboard
2. Click **New +** → **PostgreSQL**
3. Configure:
   - **Name**: `verisite-db`
   - **Database**: `verisite_db`
   - **User**: `verisite_user`
   - **Plan**: Starter (Free tier available) or higher
4. Click **Create Database**
5. Wait for the database to be provisioned
6. Note the **Internal Database URL** (you'll need this)

## Step 3: Create Web Service on Render

### Option A: Using Render Dashboard (Recommended for first-time setup)

1. Go to Render Dashboard
2. Click **New +** → **Web Service**
3. Connect your repository:
   - Select your Git provider (GitHub/GitLab/Bitbucket)
   - Authorize Render
   - Select the `verisite_backend` repository
   - Select the branch (usually `main` or `master`)

4. Configure the service:
   - **Name**: `verisite-backend`
   - **Environment**: `Node`
   - **Region**: Choose closest to your users
   - **Branch**: `main` (or your default branch)
   - **Root Directory**: Leave empty (or `.` if needed)
   - **Runtime**: `Node`
   - **Build Command**: `npm ci && npm run build`
   - **Start Command**: `npm run start:prod`
   - **Plan**: Free or Starter (Free tier has limitations)

5. **Environment Variables**: Add the following (click **Add Environment Variable** for each):

   #### Database (Auto-filled if you link the database)
   ```
   DATABASE_HOST=<from linked database>
   DATABASE_PORT=<from linked database>
   DATABASE_USER=<from linked database>
   DATABASE_PASSWORD=<from linked database>
   DATABASE_NAME=<from linked database>
   DATABASE_SSL=true
   ```

   #### Application
   ```
   NODE_ENV=production
   PORT=10000
   API_PREFIX=/api/v1
   FRONTEND_URL=https://your-frontend-domain.com
   CORS_ORIGIN=https://your-frontend-domain.com,https://your-admin-dashboard.com
   ```

   #### JWT Secrets (Generate strong random strings)
   ```bash
   # Generate secrets (run locally):
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```
   ```
   JWT_ACCESS_SECRET=<generated-secret>
   JWT_REFRESH_SECRET=<generated-secret>
   JWT_ACCESS_EXPIRES_IN=15m
   JWT_REFRESH_EXPIRES_IN=7d
   ```

   #### Linode S3 (Object Storage)
   ```
   S3_ENDPOINT=https://us-east-1.linodeobjects.com
   S3_REGION=us-east-1
   S3_BUCKET=your-bucket-name
   S3_ACCESS_KEY=your-access-key
   S3_SECRET_KEY=your-secret-key
   S3_PUBLIC_BASE_URL=https://your-bucket-name.us-east-1.linodeobjects.com
   S3_FORCE_PATH_STYLE=true
   MAX_FILE_SIZE=52428800
   ```

   #### Paystack
   ```
   PAYSTACK_SECRET_KEY=sk_live_xxxxx (or sk_test_xxxxx for testing)
   PAYSTACK_PUBLIC_KEY=pk_live_xxxxx (or pk_test_xxxxx for testing)
   PAYSTACK_BASE_URL=https://api.paystack.co
   ```

6. **Advanced Settings**:
   - **Health Check Path**: `/api/v1/health`
   - **Auto-Deploy**: `Yes` (auto-deploy on git push)

7. Click **Create Web Service**

### Option B: Using render.yaml (Infrastructure as Code)

1. Ensure `render.yaml` is in your repository root
2. Go to Render Dashboard → **New +** → **Blueprint**
3. Connect your repository
4. Render will automatically detect `render.yaml` and configure services
5. You'll still need to add sensitive environment variables manually

## Step 4: Link Database to Web Service

If you didn't use render.yaml:

1. Go to your Web Service dashboard
2. Click **Environment** tab
3. Click **Link Database** (or **Link Resource**)
4. Select your `verisite-db` database
5. Render will automatically add database connection variables

## Step 5: Run Database Migrations

Since TypeORM `synchronize` should be `false` in production, you need to run migrations:

### Option 1: Using Render Shell (Recommended)

1. Go to your Web Service on Render
2. Click **Shell** tab
3. Run:
   ```bash
   npm run migration:run
   ```

### Option 2: Using npm Script in package.json

Add a script to run migrations on deployment:

```json
"scripts": {
  "postbuild": "npm run migration:run",
  "migration:run": "typeorm-ts-node-commonjs migration:run -d src/database/data-source.ts"
}
```

**⚠️ Warning**: This runs migrations on every build. Use with caution.

### Option 3: Manual Migration via SSH/Shell

After deployment, connect via Render Shell and run migrations manually.

## Step 6: Seed Initial Data (Optional)

1. Go to your Web Service → **Shell**
2. Run:
   ```bash
   npm run seed
   ```

Or add seeding to your deployment process (not recommended for production).

## Step 7: Configure Custom Domain (Optional)

1. Go to your Web Service → **Settings**
2. Scroll to **Custom Domains**
3. Add your domain (e.g., `api.yourdomain.com`)
4. Configure DNS records as instructed by Render

## Step 8: Verify Deployment

1. Check service status in Render Dashboard (should show "Live")
2. Visit: `https://your-service.onrender.com/api/v1/health`
3. Expected response:
   ```json
   {
     "success": true,
     "data": {
       "status": "ok",
       "timestamp": "2024-01-01T00:00:00.000Z"
     }
   }
   ```
4. Visit Swagger docs: `https://your-service.onrender.com/api/docs`

## Step 9: Update Environment Variables After Deployment

1. Go to your Web Service → **Environment**
2. Update `FRONTEND_URL` and `CORS_ORIGIN` with your actual frontend URLs
3. Click **Save Changes**
4. Service will automatically redeploy

## Important Notes

### Database Connection

- Render provides an **Internal Database URL** for services in the same region
- Use `DATABASE_SSL=true` in production
- The internal connection is faster and more secure

### Environment Variables

- **Never commit secrets** to your repository
- Use Render's **Environment Variables** for all sensitive data
- Use **Sync** feature carefully (only for non-sensitive configs)

### Build Settings

- **Build Command**: `npm ci && npm run build`
  - `npm ci` installs dependencies from `package-lock.json`
  - `npm run build` compiles TypeScript to JavaScript

- **Start Command**: `npm run start:prod`
  - Runs the compiled JavaScript from `dist/` folder

### TypeORM Synchronize

⚠️ **IMPORTANT**: Ensure `synchronize: false` in production!

Check `src/config/database.config.ts`:
```typescript
synchronize: process.env.NODE_ENV === 'development', // false in production
```

### Health Checks

- Render uses the health check path to monitor your service
- If health checks fail, Render will restart your service
- Make sure `/api/v1/health` returns 200 OK

### Logs

- View logs in Render Dashboard → **Logs** tab
- Logs help debug deployment issues
- Set up log aggregation if needed

### Scaling

- **Free tier**: Services sleep after 15 minutes of inactivity
- **Starter/Pro tiers**: Services stay awake 24/7
- Consider upgrading for production workloads

### Auto-Deploy

- Render auto-deploys on push to the connected branch
- Use branch protection on `main`/`master`
- Consider using preview environments for testing

## Troubleshooting

### Service Won't Start

1. Check **Logs** tab for errors
2. Verify all environment variables are set
3. Ensure database is linked and accessible
4. Check build command completes successfully

### Database Connection Errors

1. Verify database is linked to the service
2. Check `DATABASE_SSL=true` is set
3. Verify database credentials in environment variables
4. Check database is in the same region as the service

### Build Failures

1. Check **Logs** during build phase
2. Verify `package.json` has all required dependencies
3. Ensure Node.js version is compatible (check `engines` in package.json)
4. Check for TypeScript compilation errors

### Migration Issues

1. Run migrations manually via Shell
2. Check database connection before running migrations
3. Verify migration files are in `src/database/migrations/`
4. Check `data-source.ts` is configured correctly

## Security Best Practices

1. ✅ Use strong JWT secrets (64+ characters)
2. ✅ Enable SSL for database connections
3. ✅ Restrict CORS to your frontend domains only
4. ✅ Use environment variables for all secrets
5. ✅ Enable HTTPS (automatic on Render)
6. ✅ Keep dependencies updated
7. ✅ Use database backups (automated on Render)
8. ✅ Monitor logs for suspicious activity

## Cost Estimates

- **Free Tier**: Good for development/testing
  - Web Service: Free (sleeps after inactivity)
  - Database: Free (limited to 90 days, 1GB storage)
  
- **Starter Tier**: Recommended for production
  - Web Service: ~$7/month (always-on)
  - Database: ~$7/month (persistent, backups)
  
- **Pro Tier**: For high traffic
  - Web Service: ~$25/month+
  - Database: ~$20/month+

## Next Steps

1. Set up monitoring and alerts
2. Configure automated backups
3. Set up staging environment
4. Configure CI/CD pipelines
5. Set up log aggregation
6. Configure custom domain with SSL

## Support

- Render Documentation: https://render.com/docs
- Render Community: https://community.render.com
- Render Support: support@render.com

