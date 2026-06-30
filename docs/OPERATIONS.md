# Operations Guide

## Monitoring

### Application Health
- **Backend Health Check**: `GET /api/health`
- **Database Connection**: Monitor connection pool
- **API Response Times**: Target <500ms for 95th percentile
- **Error Rate**: Target <0.1% of requests

### Dashboards
- Uptime monitoring: [status.campusbazzar.com](https://status.campusbazzar.com)
- Application metrics: Internal dashboard (request admin access)
- Database performance: MongoDB admin console
- Error tracking: Sentry or equivalent

### Alerts
Critical alerts trigger on:
- Database connection failure
- API error rate >1%
- Response time >2s (95th percentile)
- Memory usage >80%
- Disk usage >90%

## Logging

### Log Levels
- **ERROR**: Critical failures, exceptions
- **WARN**: Recoverable issues, deprecations
- **INFO**: Important events, deployments
- **DEBUG**: Detailed diagnostic information

### Log Locations
- Backend: `backend/logs/`
- Frontend: Browser console, error tracking service
- Database: MongoDB logs

### Log Retention
- Production: 30 days
- Staging: 7 days
- Development: As needed

## Backups

### Database Backups
- Frequency: Daily at 2 AM UTC
- Retention: 30 days for daily, 3 months for weekly
- Location: Secure cloud storage
- Verification: Monthly restore test

### Configuration Backups
- Environment files: Encrypted and versioned
- SSL certificates: 90+ day renewal automated
- Database indexes: Documented in source control

### Restore Procedure
```bash
# List available backups
npm run backup:list

# Restore from backup
npm run restore:backup --date=2024-01-15
```

## Incident Management

### Severity Levels

**P1 (Critical)**
- Service completely down
- Data loss or corruption
- Security breach
- SLA impact

Response: Immediate (oncall paged)

**P2 (High)**
- Service degraded
- Feature broken for some users
- Performance issue

Response: Within 30 minutes

**P3 (Medium)**
- Minor feature bug
- Cosmetic issues
- Performance degradation

Response: Within 2 hours

**P4 (Low)**
- Documentation issues
- Edge case bugs
- UX improvements

Response: Next business day

### Incident Response Steps

1. **Assess**: Determine severity and impact
2. **Alert**: Notify relevant teams
3. **Mitigate**: Reduce user impact (workaround or rollback)
4. **Fix**: Implement root cause fix
5. **Verify**: Confirm resolution
6. **Communicate**: Update status page
7. **Review**: Post-incident analysis

### Oncall Schedule

- Primary oncall: [Schedule link]
- Secondary oncall: [Schedule link]
- Escalation: Tech lead → Engineering manager

## Performance Optimization

### Database Optimization
- Monitor slow queries
- Add indexes as needed
- Archive old data
- Regular maintenance (vacuum, analyze)

### Application Performance
- Cache frequently accessed data
- Implement request queuing for heavy operations
- Monitor and optimize N+1 queries
- Use CDN for static assets

### Monitoring Queries
```bash
# Backend: Check slow logs
npm run logs:slow

# Database: MongoDB performance
db.system.profile.find().sort({ ts: -1 }).limit(10)
```

## Security Operations

### Access Control
- Production database: Restricted to authorized personnel only
- Secrets rotation: Monthly for sensitive credentials
- API keys: Regenerate compromised keys immediately
- Audit logs: Retain for 90 days

### Vulnerability Management
- Dependency scanning: Weekly automated checks
- Penetration testing: Quarterly
- Security patches: Apply within 48 hours of release

## Maintenance Windows

### Scheduled Maintenance
- Frequency: Monthly, typically Sunday 2-4 AM UTC
- Duration: 1-2 hours maximum
- Advance notice: 1 week minimum
- User communication: Broadcast notification

### Emergency Maintenance
- No advance notice
- Completed ASAP with minimal user impact
- Post-incident communication

## Disaster Recovery

### RTO (Recovery Time Objective): 4 hours
### RPO (Recovery Point Objective): 1 hour

Recovery procedures:
- Database: Restore from hourly backups
- Configuration: Redeploy from version control
- Secrets: Restore from encrypted vault
- Full system: Cold start from Docker images

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed procedures.

## Runbooks

For detailed procedures on specific operations, see:
- Runbook: Database failover
- Runbook: Cache invalidation
- Runbook: User data export
- Runbook: Emergency hotfix deployment

Contact operations team or platform lead for access.
