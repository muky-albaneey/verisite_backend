# Quick Start: Deploy to Render

## 🚀 Quick Deployment Steps

### 1. Push Code to GitHub
```bash
git add .
git commit -m "Prepare for Render deployment"
git push origin main
```

### 2. Create Database on Render

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **New +** → **PostgreSQL**
3. Name: `verisite-db`
4. Database: `verisite_db`
5. Plan: **Starter** (or Free for testing)
6. Click **Create Database**

### 3. Create Web Service

1. Click **New +** → **Web Service**
2. Connect your GitHub repository
3. Select `verisite_backend` repository
4. Configure:
   - **Name**: `verisite-backend`
   - **Environment**: `Node`
   - **Build Command**: `npm ci && npm run build`
   - **Start Command**: `npm run start:prod`
   - **Plan**: Starter (or Free)

### 4. Add Environment Variables

In the **Environment** tab, add:

**Required:**
```
NODE_ENV=production
PORT=10000
DATABASE_SSL=true
API_PREFIX=/api/v1
```

**JWT Secrets** (generate with: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`):
```
JWT_ACCESS_SECRET=<your-secret>
JWT_REFRESH_SECRET=<your-secret>
```

**Database** (link database first, then these auto-populate):
```
DATABASE_HOST=<auto-filled>
DATABASE_PORT=<auto-filled>
DATABASE_USER=<auto-filled>
DATABASE_PASSWORD=<auto-filled>
DATABASE_NAME=<auto-filled>
```

**S3/Linode:**
```
S3_ENDPOINT=https://us-east-1.linodeobjects.com
S3_REGION=us-east-1
S3_BUCKET=<your-bucket>
S3_ACCESS_KEY=<your-key>
S3_SECRET_KEY=<your-secret>
S3_PUBLIC_BASE_URL=https://<bucket>.<region>.linodeobjects.com
```

**Paystack:**
```
PAYSTACK_SECRET_KEY=sk_test_xxx
PAYSTACK_PUBLIC_KEY=pk_test_xxx
```

**CORS:**
```
FRONTEND_URL=https://your-frontend.com
CORS_ORIGIN=https://your-frontend.com
```

### 5. Link Database

1. In Web Service → **Environment** tab
2. Click **Link Database**
3. Select `verisite-db`
4. Database vars auto-populate

### 6. Run Migrations

1. Go to **Shell** tab
2. Run:
   ```bash
   npm run migration:run
   ```

### 7. Seed Database (Optional)

```bash
npm run seed
```

### 8. Verify

- Health: `https://your-service.onrender.com/api/v1/health`
- Docs: `https://your-service.onrender.com/api/docs`

## ⚠️ Important Settings

### Ensure synchronize is disabled in production

Check `src/config/database.config.ts`:
```typescript
synchronize: process.env.NODE_ENV !== 'production',
```

### Health Check Path

Set in Render: `/api/v1/health`

## 📝 Notes

- Free tier services sleep after 15 min inactivity
- Starter tier ($7/mo) keeps service awake 24/7
- Database backups are automatic on paid plans
- Use internal database URL for better performance

## 🔧 Troubleshooting

**Service won't start?**
- Check Logs tab
- Verify all env vars are set
- Ensure database is linked

**Database connection failed?**
- Verify `DATABASE_SSL=true`
- Check database is linked
- Verify credentials in env vars

**Build fails?**
- Check Logs during build
- Verify Node.js version compatibility
- Ensure all dependencies are in package.json

