# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability, please report it responsibly.

**Email:** security@quvantic.com

**Do NOT:**
- Open a public GitHub issue for security vulnerabilities
- Disclose the vulnerability publicly before it has been addressed

**Response SLA:**
- Acknowledgment within 48 hours
- Status update within 5 business days
- Fix timeline communicated within 10 business days

## Supported Versions

| Version | Supported |
|---------|-----------|
| 1.x     | Yes       |

## Scope

This policy covers the test framework code in this repository. The application under test (SauceDemo) is maintained by Sauce Labs and has its own security policy.

## Best Practices

- Never commit credentials or API keys to this repository
- Use `.env` files for sensitive configuration (`.env` is in `.gitignore`)
- Auth state files (`.auth/`) are excluded from version control
- CI secrets are managed via GitHub Actions secrets
