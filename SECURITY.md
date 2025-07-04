# Security Policy

## Supported Versions

We take security seriously and actively maintain security updates for the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |

## Security Features Implemented

### Authentication & Authorization
- JWT-based authentication with strong secret requirements
- Role-based access control (driver, admin, dispatcher)
- Secure password requirements (minimum 8 characters with complexity)
- No fallback authentication secrets

### Input Validation & Sanitization  
- Comprehensive input validation for all API endpoints
- XSS prevention through input sanitization
- Rate limiting on API endpoints and Socket.IO events
- Message length and content validation

### Security Headers & HTTPS
- Comprehensive security headers via Helmet
- Content Security Policy (CSP)
- HTTP Strict Transport Security (HSTS)
- HTTPS enforcement in production

### Data Protection
- Secure logging practices (no sensitive data in logs)
- Input/output sanitization
- Protected emergency alert system with rate limiting

## Reporting a Vulnerability

We appreciate the responsible disclosure of security vulnerabilities. 

### How to Report
1. **Email**: Send details to [security@hotshotlogistics.com]
2. **GitHub**: Create a private security advisory
3. **Response Time**: We will acknowledge receipt within 24 hours
4. **Updates**: Expect updates every 72 hours on progress

### What to Include
- Description of the vulnerability
- Steps to reproduce the issue
- Potential impact assessment
- Any suggested fixes or mitigations

### What to Expect
- **Acknowledgment**: Within 24 hours
- **Initial Assessment**: Within 72 hours  
- **Status Updates**: Every 72 hours until resolved
- **Resolution Timeline**: Critical issues within 7 days, others within 30 days

### Responsible Disclosure
- Please do not publicly disclose the vulnerability until we have had a chance to address it
- We will acknowledge your contribution when the fix is released
- For qualifying vulnerabilities, we may offer a bounty or recognition

## Security Best Practices for Deployment

### Environment Variables
Ensure these critical environment variables are set:
```bash
JWT_SECRET=<minimum-32-character-secret>
NODE_ENV=production
FRONTEND_URL=https://yourdomain.com
```

### Production Checklist
- [ ] HTTPS enabled and enforced
- [ ] Strong JWT_SECRET configured (32+ characters)
- [ ] Rate limiting configured
- [ ] Security headers enabled
- [ ] Database credentials secured
- [ ] Regular security updates applied
- [ ] Monitoring and alerting configured

### Regular Maintenance
- Monthly dependency updates with `npm audit fix`
- Quarterly security reviews
- Annual penetration testing
- Monitor security advisories for dependencies

## Contact

For security-related questions or concerns:
- Email: security@hotshotlogistics.com
- GitHub: Create a security advisory
- Documentation: See `backend/SECURITY_IMPLEMENTATION.md` for technical details
