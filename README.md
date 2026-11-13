# ECKED School Monitoring Dashboard

An advisor workspace for Edmondo van der Berg to monitor schools' digital maturity, record support, plan follow-ups and prepare management summaries for Eden & Central Karoo.

Repository: https://github.com/TeacherEdd/elearning-Dashboard-

Live site: https://teacheredd.github.io/elearning-Dashboard-/

## Advisor and management views

- **My overview:** assessment coverage, unassessed schools, priority indicators, overdue actions, latest-score average, score changes and circuit coverage.
- **School profiles:** all 200 schools in the supplied register, searchable by school and circuit, with dated assessment history, section scores, latest observations and support history.
- **Support & follow-ups:** school visits, training, advice, follow-ups and resource support. Record the activity/action, responsible person, activity date, follow-up deadline, status and outcome. Existing records can be edited.
- **Management summary:** select a reporting period and circuit, add commentary or decisions needed, and download a printable HTML snapshot. Open the downloaded report and use Print → Save as PDF if required.
- **Existing assessment flow:** twelve indicators, 1–5 scoring, generated recommendations, individual reports, editing and deletion remain available.

Unassessed schools are clearly distinguished from low-scoring schools. Assessments older than 180 days are flagged for review. A low indicator (1–2) creates a priority flag even when the overall average is relatively high.

## Run and test

Requires Node.js 24 and npm.

```bash
git clone https://github.com/TeacherEdd/elearning-Dashboard-.git
cd elearning-Dashboard-
npm ci
npm run dev
```

```bash
npm test
npm run test:ui
npm run preview
```

`npm test` runs core scoring and advisor-model tests. `npm run test:ui` builds the production application and runs simulated DOM interaction tests. `npm run build` alone produces `dist/`. Browser visual layout and print/PDF output require separate visual review; the DOM tests do not verify those.

React, icons and styles are bundled locally; the application does not fetch these libraries from CDNs during normal use.

## Publish

GitHub Pages is configured for this repository. The publish workflow now runs on pushes to `main`, and can also be started manually from **Actions → Publish to GitHub Pages**. GitHub Pages must use **GitHub Actions** as its source. Changes to `main` are tested and built before publication.

The project is a static React application. Do not commit personal school reports, support logs, backups, `node_modules`, API keys or `.env` files.

## Data, backups and manager access

**This version does not have shared sign-in, a cloud database or automatic cross-device syncing.** The manager report is a dated export from the advisor's device, not a live shared dashboard. GitHub stores application code, not the school records entered into the dashboard.

Two browser `localStorage` keys are used:

- `wced-district-monitor-ai-v6`: assessments; the original key is retained for compatibility.
- `ecked-advisor-support-v1`: support and follow-up records.

The dashboard can read records already stored at the same web address. Different browsers, devices and web addresses have separate storage. Changing the code on the existing site does not change these keys.

**Export backup** downloads version 2 JSON containing both assessments and support logs. **Restore backup** accepts version 2, legacy version 1 assessment backups, or a legacy assessment array. Legacy imports leave existing support records intact. Matching IDs are replaced only after confirmation. Incoming records are validated before storage changes, and an unsuccessful multi-key write attempts to restore the previous data. Derived assessment analysis is recalculated from the scores.

CSV export contains assessment records only. The management report includes support records and outstanding actions. Export a backup regularly, particularly before changing browsers or devices. Incomplete assessment/support forms and management commentary are not autosaved.

The original uploaded HTML tool did not contain a JSON export button. Migrating its separately stored browser data requires exporting those records from the original environment first; a new web address cannot automatically read them.

## How metrics are calculated

- **Coverage:** registered schools with at least one assessment dated on or before the snapshot date, divided by schools in the selected circuit scope. Support-only activity does not count as an assessment.
- **School visit entries:** support entries marked School visit that are In progress or Completed; these are separate from assessment counts.
- **Latest score:** each school contributes its latest dated assessment once. Same-date assessments use `updatedAt` where present; otherwise first-listed record wins.
- **Change:** difference between the latest two recorded assessments, using raw averages. Above +0.05 points is improved; below −0.05 is declined; otherwise unchanged. Single-assessment schools have no comparison. Changes can span dates outside a selected reporting period and do not establish causation.
- **Priority gap:** at least one indicator scored 1 or 2, regardless of the overall score.
- **Stale assessment:** more than 180 calendar days before the snapshot date. This is a review cue, not an assumed official visit target.
- **Overdue:** a non-completed support record with a due date before the snapshot date, and activity date no later than that snapshot date.
- **Period activity:** assessments/support records with activity dates within the selected range, inclusively. Completion counts use the entered completion date.
- **Management period:** school positions are reconstructed from assessments on or before the period-end date. Support statuses reflect their current recorded values; historical status transitions are not stored or reconstructed.
- **Outside-register records:** imported schools outside the supplied register remain visible, labelled accordingly. They do not inflate registered-school coverage. Their assessments are included in the overall assessed-school average; the management export explains this distinction.

All twelve indicators carry equal weight. The three sections contain 3, 4 and 5 indicators, so their effective overall weights are 25%, 33⅓% and 41⅔% respectively.

| Raw average | Maturity level |
| --- | --- |
| 1–2.5 inclusive | EMERGING |
| Above 2.5, below 3.5 | ESTABLISHING |
| 3.5 to below 4.5 | INTEGRATED |
| 4.5–5 | TRANSFORMATIVE |

Classification uses unrounded averages; displayed scores have one decimal place. Recommendations use the original built-in indicator guidance. No external AI service is connected; the internal `aiAnalysis` field name remains for format compatibility.

## Structure

- `src/app.jsx`: school register, assessment form, original report layout and persistence.
- `src/AdvisorDashboard.jsx`: advisor overview, school profiles, support log and management controls.
- `src/advisor.js`: coverage/progress calculations, support validation and escaped management HTML generation.
- `src/core.js`: assessment scoring, legacy backup validation and CSV export.
- `tests/`: scoring, advisor calculations and simulated DOM user-flow checks.
- `.github/workflows/`: checks and Pages publication.

## Remaining integration work

Shared access needs an authenticated backend and access rules for the advisor and manager. No backend provider/account has been configured here. Future work can add shared records, read-only manager access, automatic backups, draft recovery, a full offline queue and a history of support status changes. The current bundle is not an offline PWA.

WCED naming is inherited from the user's original instrument. No official departmental endorsement or software licence is implied.
