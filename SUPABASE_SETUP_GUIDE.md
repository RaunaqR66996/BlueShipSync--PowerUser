# Supabase Integration Setup Guide

## Overview
This guide covers the complete Supabase integration for the REBUILD3pl TMS/WMS platform.

## Prerequisites
- Supabase account and project
- Node.js 18+ installed
- PostgreSQL database access

## 1. Supabase Project Setup

### Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Note your project URL and API keys

### Database Configuration
1. In Supabase Dashboard → Settings → Database
2. Copy the connection string
3. Update your `.env.local` file:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL="https://tvgelajhgtqiwqxgxatg.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR2Z2VsYWpoZ3RxaXdxeGd4YXRnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE0OTUwODQsImV4cCI6MjA3NzA3MTA4NH0.YVy3v3tQYRseUtjjmaOqeiIHt6vhhhOAANjykdb7AV8"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

# Database URL for Prisma
DATABASE_URL="postgresql://postgres:[password]@db.tvgelajhgtqiwqxgxatg.supabase.co:5432/postgres"
```

## 2. Authentication Setup

### Enable Auth Providers
In Supabase Dashboard → Authentication → Providers:
- ✅ Email/Password
- ✅ Google (optional)
- ✅ GitHub (optional)

### Configure Auth Settings
- Site URL: `http://localhost:3000` (development)
- Redirect URLs: `http://localhost:3000/auth/callback`

## 3. Database Schema Migration

### Run Prisma Migrations
```bash
# Generate Prisma client
npx prisma generate

# Push schema to Supabase
npx prisma db push

# Or run migrations
npx prisma migrate dev
```

### Verify Tables
Check Supabase Dashboard → Table Editor to confirm all tables are created.

## 4. Row Level Security (RLS)

### Enable RLS on Tables
```sql
-- Enable RLS on all tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
-- ... repeat for all tables
```

### Create RLS Policies
```sql
-- Example policy for organizations
CREATE POLICY "Users can view their organization" ON organizations
  FOR SELECT USING (auth.uid() IN (
    SELECT id FROM users WHERE organization_id = organizations.id
  ));

-- Example policy for users
CREATE POLICY "Users can view users in their organization" ON users
  FOR SELECT USING (organization_id IN (
    SELECT organization_id FROM users WHERE id = auth.uid()
  ));
```

## 5. Environment Variables

### Development (.env.local)
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL="https://your-project-ref.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

# Database
DATABASE_URL="postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres"

# Other existing variables...
JWT_SECRET="your-jwt-secret"
OPENAI_API_KEY="your-openai-key"
# ... etc
```

### Production (Kubernetes)
Update `kubernetes/supabase-deployment.yaml` with actual values:
```yaml
data:
  NEXT_PUBLIC_SUPABASE_URL: "https://your-project-ref.supabase.co"
  NEXT_PUBLIC_SUPABASE_ANON_KEY: "your-anon-key"
  SUPABASE_SERVICE_ROLE_KEY: "your-service-role-key"
  DATABASE_URL: "postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres"
```

## 6. Testing the Integration

### Test Database Connection
```bash
# Test Prisma connection
npx prisma db pull

# Test Supabase client
npm run dev
# Check browser console for Supabase connection
```

### Test Authentication
1. Start development server: `npm run dev`
2. Navigate to `/auth/login`
3. Try creating an account
4. Verify user appears in Supabase Dashboard → Authentication → Users

## 7. Deployment

### Kubernetes Deployment
```bash
# Apply Supabase configuration
kubectl apply -f kubernetes/supabase-deployment.yaml

# Verify deployment
kubectl get pods -l app=rebuild3pl-app
kubectl get services
```

### Environment Variables in Production
Ensure all Supabase environment variables are set in your production environment:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `DATABASE_URL`

## 8. Monitoring and Maintenance

### Supabase Dashboard
- Monitor database performance
- Check authentication logs
- Review API usage
- Monitor storage usage

### Application Monitoring
- Check Prisma connection health
- Monitor authentication flows
- Track database query performance

## 9. Security Considerations

### API Keys
- Never commit service role key to version control
- Use environment variables for all secrets
- Rotate keys regularly

### Database Security
- Enable RLS on all tables
- Create appropriate policies
- Regular security audits
- Monitor for suspicious activity

## 10. Troubleshooting

### Common Issues
1. **Connection refused**: Check DATABASE_URL format
2. **Auth errors**: Verify API keys and URLs
3. **RLS errors**: Check policy configurations
4. **Migration issues**: Ensure schema compatibility

### Debug Commands
```bash
# Check Prisma connection
npx prisma db pull

# Test Supabase connection
node -e "console.log(require('./lib/supabase/client').supabase)"

# Check environment variables
node -e "console.log(process.env.NEXT_PUBLIC_SUPABASE_URL)"
```

## Next Steps
1. Set up your Supabase project
2. Configure environment variables
3. Run database migrations
4. Test authentication flow
5. Deploy to production

For additional help, refer to:
- [Supabase Documentation](https://supabase.com/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Next.js Middleware](https://nextjs.org/docs/app/building-your-application/routing/middleware)
