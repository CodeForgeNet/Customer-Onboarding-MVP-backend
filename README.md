# Customer Onboarding Backend API

## Security Features

### Password Security

- All passwords are hashed using bcrypt with a salt of 12 rounds
- Plain-text passwords are never stored or logged
- Password validation enforces minimum 8 characters with lowercase, uppercase, and number requirements

### Authentication & Authorization

- JWT-based authentication with configurable expiry (default: 7 days)
- Role-based access control (RBAC) for different user types
- Tokens are validated on protected routes

### API Security

- Helmet middleware to set secure HTTP headers
- CORS configured to allow only the frontend application origin
- Rate limiting to prevent brute-force attacks
- Input validation and sanitization to prevent XSS and injection attacks
- Request size limiting to prevent denial of service attacks

### Environment Security

- Sensitive information stored in environment variables
- Different environment configurations for development, testing, and production

## Security Best Practices for Production

### Environment Variables

- Use strong, unique secrets for JWT_SECRET
- Rotate JWT_SECRET periodically (implement a secret rotation strategy)
- Store secrets in a secure vault service in production (e.g., AWS Secrets Manager, HashiCorp Vault)

### HTTPS

- Always use HTTPS in production
- Configure proper SSL/TLS settings
- Implement HTTP to HTTPS redirection

### Secrets Management

- Never commit .env files to version control
- Use a secrets management service in production
- Implement principle of least privilege for database users

### Monitoring and Logging

- Implement security event logging
- Set up alerts for suspicious activity
- Regularly review logs for security issues

### Regular Updates

- Keep dependencies up to date
- Monitor for security advisories
- Apply security patches promptly

## Integration Testing

To run integration tests:
