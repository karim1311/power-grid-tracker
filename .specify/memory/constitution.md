<!--
Sync Impact Report
- Version change: unratified template -> 1.0.0
- Modified principles: template placeholders -> five GridLog governing principles
- Added sections: Technical Constraints; Development Workflow
- Removed sections: none
- Templates requiring updates: plan-template.md (no update required; retains Constitution Check gate)
	spec-template.md (no update required); tasks-template.md (no update required)
- Follow-up TODOs: confirm the original ratification date
-->

# GridLog Constitution

## Core Principles

### I. Strict Type Safety and Domain Clarity
GridLog MUST use TypeScript strict mode and MUST NOT use `any`. Domain data, server
actions, route handlers, and component props MUST have explicit, meaningful types.
Validation MUST occur at system boundaries, and outage duration and daily averages
MUST use precise, documented units. This prevents unreliable reliability metrics and
makes failures diagnosable.

### II. Next.js-Native Architecture
The application MUST use Next.js App Router with file-based routing and TypeScript.
Server Components MUST be the default; Client Components MUST be limited to
interactive or browser-only behavior and MUST be marked with `use client`. Data
access and mutations MUST remain on the server through supported Next.js patterns,
and authentication and authorization MUST be enforced server-side. This keeps the
security boundary clear and limits unnecessary client JavaScript.

### III. Utility-First, Accessible Interface
Tailwind CSS utility classes MUST be the primary styling mechanism. Custom CSS MUST
be added only when Tailwind utilities cannot express the required behavior, and
such cases MUST remain local and documented by the code structure. UI MUST be
responsive, keyboard accessible, semantically structured, and usable at mobile and
desktop sizes. Reliability status, outage history, and charging guidance MUST be
presented with clear units, labels, and error or empty states.

### IV. Tested, Observable User Outcomes
Every feature MUST include tests appropriate to its risk. Unit tests MUST cover
calculations, validation, and edge cases; integration or end-to-end tests MUST cover
authentication, outage recording, and the primary reliability-analysis journey.
Tests MUST verify timezone and boundary behavior for daily averages. A change MUST
pass linting, type checking, and its relevant test suite before review. This protects
the correctness of decisions users make about backup power and charging.

### V. Secure and Trustworthy Reliability Data
Users MUST be authenticated before creating or changing personal outage records.
Authorization MUST prevent access to another user's private data. Credentials,
session secrets, and sensitive configuration MUST remain outside source control.
The system MUST preserve an auditable, consistent source of truth for outage start,
end, location, and ownership data; derived averages and charging recommendations
MUST be reproducible from that data. Security-sensitive or metric-affecting changes
MUST include regression coverage.

## Technical Constraints

GridLog MUST use Next.js App Router, TypeScript, and Tailwind CSS. New dependencies
MUST have a clear purpose, active maintenance, and a security review appropriate to
their access. Naming MUST follow the established ecosystem conventions: PascalCase
for React components and types, camelCase for variables and functions, kebab-case
for route segments and filenames where the framework permits it, and descriptive
names for domain concepts. Environment-specific values MUST be configured through
environment variables and documented without exposing secrets.

## Development Workflow

Work MUST be organized around independently testable user outcomes. Pull requests
MUST describe the behavior changed, identify database or security implications, and
include validation evidence. Reviewers MUST check constitution compliance, type
safety, accessibility, authentication boundaries, and test coverage. Contributors
MUST keep changes focused, avoid unrelated refactors, document intentional tradeoffs,
and update relevant user or developer documentation. Shared conventions and
decisions MUST be recorded in the repository rather than relying on private context.

## Governance
<!-- Example: Constitution supersedes all other practices; Amendments require documentation, approval, migration plan -->

This constitution supersedes conflicting project practices. Amendments MUST be made
through a reviewed change to this file with an updated Sync Impact Report, rationale,
and migration notes when existing work is affected. Versioning follows semantic
versioning: MAJOR for incompatible principle changes or removals, MINOR for new or
materially expanded requirements, and PATCH for clarifications that do not change
governance. Every implementation plan MUST include a Constitution Check, and every
pull request MUST verify the applicable principles. The project team MUST review
this constitution at each major release and whenever security, architecture, or
measurement rules change.

**Version**: 1.0.0 | **Ratified**: TODO(RATIFICATION_DATE): confirm original adoption date | **Last Amended**: 2026-09-09
