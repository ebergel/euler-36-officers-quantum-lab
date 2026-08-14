# Security Policy

## Supported versions

Security updates are applied to the latest version on the main branch.

## Automated dependency security

Dependabot vulnerability alerts and security-update pull requests are enabled
in the repository’s GitHub security settings. Routine scheduled version-update
pull requests are intentionally disabled, so Dependabot should open a pull
request only when a known security advisory affects the dependency graph and a
compatible fix is available.

## Reporting a vulnerability

Please do not disclose a vulnerability in a public issue.

Use the repository’s **Security → Report a vulnerability** flow to send a
private report. Include:

- the affected page, component, or dependency;
- steps to reproduce;
- the likely impact;
- a minimal proof of concept, when safe;
- any suggested mitigation.

You should receive an acknowledgement within seven days. The maintainers will
coordinate disclosure after a fix is available.

The current app has no accounts, database, analytics, or application-owned
backend. Reports about the hosting provider itself should be sent to that
provider’s security channel.
