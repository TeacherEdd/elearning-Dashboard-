# ECKED School Monitoring Dashboard

An advisor workspace for Edmondo van der Berg to monitor schools' digital maturity, record support, plan follow-ups and prepare management summaries for Eden & Central Karoo.

Repository: https://github.com/TeacherEdd/elearning-Dashboard-

Live site: https://teacheredd.github.io/elearning-Dashboard-/

## Advisor and management views

- **My overview:** assessment coverage, unassessed schools, priority indicators, overdue actions, latest-score average, score changes and circuit coverage.
- **School profiles:** all 200 schools in the supplied register, searchable by school and circuit, with dated assessment history, section scores, latest observations and support history.
- **Support & follow-ups:** school visits, training, advice, follow-ups and resource support. Record the activity/action, responsible person, activity date, follow-up deadline, status and outcome. Existing records can be edited.
- **Management summary:** select a reporting period and circuit, add commentary or decisions needed, and download a printable HTML snapshot. Open the downloaded report and use Print → Save as PDF if required.
- **Equipment register:** latest per-school counts for projectors, laptops, tablets, visualisers and mini PCs, with working/faulty/awaiting-repair condition totals. Record smart-classroom presence, number installed, number functional and actual use separately. Dated verification snapshots preserve the source and contact. Missing categories remain unknown rather than becoming zero.
- **Recommended training:** on each school profile, map the latest assessment's indicators scored 1–3 to relevant upcoming sessions from the uploaded schedule snapshot. Planning creates an editable support action, with attendance and classroom implementation verified separately.
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

Three browser `localStorage` keys are used:

- `wced-district-monitor-ai-v6`: assessments; the original key is retained for compatibility.
- `ecked-advisor-support-v1`: support and follow-up records, including optional training verification.
- `ecked-school-equipment-v1`: dated school equipment snapshots.

The dashboard can read records already stored at the same web address. Different browsers, devices and web addresses have separate storage. Changing the code on the existing site does not change these keys.

**Export backup** downloads version 3 JSON containing assessments, support logs and equipment snapshots. **Restore backup** accepts versions 3 and 2, legacy version 1 assessment backups, or a legacy assessment array. Older imports leave existing equipment and (where absent) support records intact. Matching IDs are replaced only after confirmation. Incoming records are validated before storage changes, and an unsuccessful multi-key write attempts to restore the previous data. Derived assessment analysis is recalculated from the scores.

CSV export contains assessment records only. The management report includes support records and outstanding actions. Export a backup regularly, particularly before changing browsers or devices. Incomplete assessment/support/equipment forms and management commentary are not autosaved. Equipment snapshots retain previous counts as editable starting values; a new verification source must be chosen for each new snapshot.

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

## Equipment counts and verification

All five device types have total, working, faulty and awaiting-repair fields. The three condition categories are mutually exclusive and must sum to total. Use Faulty for broken devices not yet in the repair queue; do not count a queued device in both Faulty and Awaiting repair. Entirely blank categories mean not captured; four zeros confirm no devices in that category. Smart classrooms are infrastructure and are not added to device totals, avoiding double-counting their component equipment.

A functional smart classroom has operating core equipment and required connectivity. Actual use is recorded separately (Unknown, Regular use, Limited use, Not in use). Presence is Yes, No or Unknown. Installed and functional counts are required for Yes, with functional no greater than installed. These are school summaries, not individual serial-number asset records.

Equipment totals use each school's latest verified snapshot on or before the snapshot date. The management export includes condition totals, school-level verification sources, and working/faulty/repair breakdowns. Older records remain available under school verification history. Missing school/category coverage is displayed alongside the totals.

## Training recommendations

`src/training-sessions.json` contains 100 virtual sessions (12 hosted by Eden & Central Karoo) extracted from the user's saved Upcoming Sessions page. Snapshot date: **13 November 2026**; the listed sessions are for 2027. The source portal is https://wcedtpd.pages.dev/sessions. No external database credentials or preregistration code were copied into this project.

This is a **dated snapshot, not a live feed**. Verify details, availability and eligibility on the portal before agreeing an action. Recommendations omit sessions whose date has passed. The default district preference is Eden & Central Karoo, and can be expanded to other host districts. Recommendations prioritise lower indicator scores and then earlier dates. Strong indicators (4–5) do not trigger recommendations. No recommendations are inferred for an unassessed school.

Mappings cover formal training intake, digital curriculum resources, LMS use, pedagogical shift, teacher content creation and learner digital literacy. Session titles are matched explicitly and each card explains the relevant indicator score and why the session may help. Connectivity, security, maintenance, leadership and policy gaps are not treated as problems a teaching-tool workshop would automatically fix. Assess phase suitability, particularly for Foundation Phase sessions.

**Plan training support** records a Planned advisor support action only. It does not preregister a teacher or establish attendance. Attendance (Not confirmed, Confirmed, Did not attend) and classroom implementation (Not checked, Observed, Not yet evident) are separate fields, preserved in backups and shown in the management report. Record the evidence/source in the outcome notes. Reopening the same recommendation uses its existing linked action instead of creating a duplicate.

## Structure

- `src/app.jsx`: school register, assessment form, original report layout and persistence.
- `src/AdvisorDashboard.jsx`: advisor overview, school profiles, support log and management controls.
- `src/SchoolEquipment.jsx` and `src/equipment.js`: school equipment snapshots, validation, aggregation and management export.
- `src/TrainingRecommendations.jsx`, `src/training.js` and `src/training-sessions.json`: needs matching, snapshot catalogue and linked support actions.
- `src/advisor.js`: coverage/progress calculations, support validation and escaped management HTML generation.
- `src/core.js`: assessment scoring, legacy backup validation and CSV export.
- `tests/`: scoring, advisor calculations and simulated DOM user-flow checks.
- `.github/workflows/`: checks and Pages publication.

## Remaining integration work

Shared access needs an authenticated backend and access rules for the advisor and manager. No backend provider/account has been configured here. Future work can add shared records, read-only manager access, automatic backups, draft recovery, a full offline queue and a history of support status changes. The current bundle is not an offline PWA.

WCED naming is inherited from the user's original instrument. No official departmental endorsement or software licence is implied.
