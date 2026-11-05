# CRAM family business assessment workspace

A bilingual Arabic/English Next.js application for governance and institutional assessments, financial proposal requests, and client reporting.

## Local development

Install dependencies with `npm ci`, configure `.env`, then run `npm run dev`.

Required environment variables:

- `DATABASE_URL`: PostgreSQL connection used by Prisma.
- `ADMIN_USER` and `ADMIN_PASS`: administrator Basic Auth credentials. Configure both in production.
- `RESEND_API_KEY`: required for report email delivery.
- `REPORT_FROM_EMAIL`: optional verified sender; defaults to the existing CRAM report sender.

The existing Prisma schema is unchanged; this update needs no database migration. Fonts are served locally with their licenses under `public/fonts`.

## Client journey

1. `/assessment`: create a profile with name, company, email, and phone, or resume using a registered email.
2. `/assessment/Qs`: complete governance questions, review all answers, then submit. Questions and identifiers come from the database. Scores are calculated again on the server.
3. `/assessment2`: a completion transition explains that assessment two is unlocked. `/assessment2/form` verifies the first submission before showing the institutional form.
4. `/proposal`: opens only after both submissions are confirmed. The client can save a financial proposal request, which appears in the admin workspace.

Drafts are scoped to each user and assessment in browser storage. They survive refreshes on the same browser and device. Final submissions are stored in PostgreSQL. Switching profiles keeps drafts separated. Returning-user email lookup follows the existing account model; it is not password authentication.

The advisory team prepares the actual scope, service line items, fees, validity date, and applicable tax rate in the institutional report’s Financial proposal editor. Publishing makes the quote available for the client to view and download as a PDF. This app does not invent prices or automatically email a commercial offer. Request time and the published quote are saved as `_proposalRequestedAt` and `_financialProposal` inside the second assessment's existing JSON payload. Institutional submission accepts only known field keys, so clients cannot forge that metadata through form submissions.

## Administration and reports

`/admin` provides a searchable, sortable, paginated client directory and progress filters, including proposal requests. `/admin/reports` lists submitted reports. Governance reports show domain scores and responses; institutional reports show submitted business information without a numerical score.

Administrator authentication covers `/admin/*`, `/api/admin/*`, and `/api/export`. Reports can be printed, downloaded as PDFs, or emailed after confirming the recipient. Missing email configuration returns an error rather than claiming success. PDF templates escape submitted content and embed local Arabic and Latin fonts.

## Verification

```sh
npm run lint
npx tsc --noEmit
npm run build
npm run test:api
```

For browser checks, serve a production build with `npm run start`, then run:

```sh
npm run test:journey
```

Set `QA_BASE_URL` to use a different local port. Browser checks intercept all application API requests with isolated fixtures and do not create database records or send emails. They cover registration, gates, drafts, validation, review, failed submission recovery, unlock transitions, proposal persistence and publication, client quote downloads, admin search, report content, Arabic layouts, and mobile overflow. Screenshots, PDF samples, and a check summary are written to ignored `artifacts/qa/`.

The API verification replaces database methods in process to check server validation, scoring integrity, assessment ordering, proposal idempotency, and admin route protection without connecting to the database. Live production data and email delivery are deliberately excluded from automated verification.
