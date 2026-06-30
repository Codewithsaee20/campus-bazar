# Deployment Guide

## Environments

### Development
- **Branch**: Any feature branch
- **Database**: Local MongoDB
- **URL**: http://localhost:3000 (frontend), http://localhost:5000 (backend)
- **Purpose**: Local development and testing

### Staging
- **Branch**: `main` (before production release)
- **Database**: Staging MongoDB instance
- **URL**: https://staging.campusbazzar.com
- **Purpose**: Pre-production validation, QA testing

### Production
- **Branch**: `main` (after staging validation)
- **Database**: Production MongoDB instance
- **URL**: https://campusbazzar.com
- **Purpose**: Live user environment

## Deployment Process

### Prerequisites
- Merge PR to `main`
- Pass all CI/CD checks
- Get approval from tech lead
- Backup production data

### Staging Deployment
```bash
# Automatic on merge to main
git checkout main
git pull origin main

# Manual deployment
npm run build
npm run deploy:staging
```

### Production Deployment
```bash
# Create release tag
git tag -a v1.0.0 -m "Release 1.0.0"
git push origin v1.0.0

# Deploy via CI/CD
# OR manual deployment
npm run build
npm run deploy:production
```

## Configuration Management

### Environment Variables

#### Backend (.env)
```
NODE_ENV=production
DB_URI=mongodb://...
JWT_SECRET=<secret>
API_PORT=5000
```

#### Frontend (.env)
```
VITE_API_URL=https://api.campusbazzar.com
VITE_APP_NAME=Campus Bazzar
```

Store secrets in:
- Development: `.env` (local, git-ignored)
- Staging/Production: Environment variables in deployment platform

### Database Migrations

```bash
# Run migrations before deployment
npm run migrate:up

# Rollback if needed
npm run migrate:down
```

## Health Checks

After deployment, verify:
- **Backend**: `GET /api/health` returns 200
- **Frontend**: Application loads without errors
- **Database**: Connection is stable
- **External Services**: Third-party integrations working

## Rollback Procedure

If deployment fails:

```bash
# Revert to previous tag
git revert HEAD
git push origin main

# Or rollback to specific version
npm run deploy:rollback --version=1.0.0
```

## Monitoring

Post-deployment monitoring:
- Error logs and exceptions
- API response times
- Database query performance
- User-reported issues
- Server resource usage

## Release Checklist

- [ ] Code reviewed and approved
- [ ] All tests passing
- [ ] CHANGELOG updated
- [ ] Database migrations tested
- [ ] Staging deployment successful
- [ ] QA validation complete
- [ ] Backup created
- [ ] Production deployment initiated
- [ ] Health checks passed
- [ ] User communication sent

## Incident Response

For production issues:
1. Assess severity and impact
2. Implement hotfix or rollback
3. Update status page
4. Post-incident review within 24 hours
5. Document lessons learned

## Support

- **Deployment Issues**: Check CI/CD logs and deployment platform
- **Database Issues**: Contact DBA or check backup restore procedures
- **Performance Issues**: Review monitoring dashboards and query logs
