# ECKED School Findings

A school findings and reporting platform for Edmondo van der Berg, Subject Advisor, Eden & Central Karoo. This version implements the approved royal-blue and white design with the user-supplied ECKED logo.

- Repository: https://github.com/TeacherEdd/elearning-Dashboard-
- Site: https://teacheredd.github.io/elearning-Dashboard-/

## Reporting workflow

The platform records what the advisor finds at schools. It is not a visit planner.

**Overview** shows final reports, unfinished drafts, reported equipment faults, common findings and coverage. All figures come from actual records on the current device; there is no sample school-performance data.

**Schools** provides the supplied 200-school register, school/circuit search, and profiles with Summary, Assessment findings, Equipment, Recommendations and Previous reports. An equipment overview is available from the school directory.

**Capture findings** uses five steps: Details → Findings → Equipment → Recommendations → Review. Record the person consulted, assessment date, source of information, scores, observations and advice. Equipment is a separately saved dated snapshot. The final step can finalise a complete report; Save draft keeps incomplete records without rating the school.

**Reports** contains final school reports, saved drafts, management summaries and backups. Individual reports retain their printable/PDF and copy-to-Word options. The management export combines recorded school findings, equipment condition, recommendations and advisor commentary. There are no visit calendars or overdue-action widgets in the main navigation.

## Eleven-indicator scoring and legacy records

The LMS Usage at School indicator (`teaching-1`) has been removed from the scoring matrix and training-needs mapping. The remaining teaching indicator IDs are intentionally not renumbered:

| Section | Active IDs | Number |
| --- | --- | --- |
| Enabling Environment | env-0, env-1, env-2 | 3 |
| e-Culture & Change Management | culture-0, culture-1, culture-2, culture-3 | 4 |
| e-Teaching & Training | teaching-0, teaching-2, teaching-3, teaching-4 | 4 |

Each of the eleven included indicators has equal weight. Section weights are therefore 3/11, 4/11 and 4/11. Classification uses the raw average; displayed scores are rounded to one decimal place.

| Raw average | Maturity level |
| --- | --- |
| 1–2.5 inclusive | EMERGING |
| Above 2.5, below 3.5 | ESTABLISHING |
| 3.5 to below 4.5 | INTEGRATED |
| 4.5–5 | TRANSFORMATIVE |

Existing twelve-score records and older backups remain readable. Their original LMS value is retained in the record and JSON backup but excluded from current averages, section scores, recommendations, CSV indicator columns and printable reports. Remaining historical scores never shift into a different indicator. Historical comparisons are recalculated consistently on the eleven-indicator basis, so displayed historical averages can differ from exports produced before this change.

Unassessed schools and drafts have no maturity rating. Only final assessments feed school and district statistics. Information source is optional for historical records and defaults to Not specified.

## Drafts and storage

Records remain in browser localStorage at the existing site address:

- `wced-district-monitor-ai-v6`: final assessments; existing key preserved.
- `ecked-school-report-drafts-v1`: incomplete findings and edits saved as drafts.
- `ecked-school-equipment-v1`: equipment verification snapshots.
- `ecked-advisor-support-v1`: recorded recommendations and retained historical support entries.

Drafts are saved explicitly, not continuously autosaved. Finalising an edited draft preserves the original final record until a complete replacement is successfully saved. Finalisation and draft removal are written together with rollback on storage failure. Finalising an incomplete record is blocked. Management commentary is included in the export but is not autosaved.

Version 4 backups contain reports, drafts, equipment and support/recommendation records. Versions 1–3 and bare legacy assessment arrays are also accepted. Older backups merge existing collections and do not erase collection types they do not contain. Incoming records are validated before storage writes; matching IDs replace records after confirmation, and multi-key writes attempt rollback if a later write fails.

No school findings are stored in the GitHub repository. Different devices, browsers and web addresses have separate local records. Shared authentication, cloud storage and live manager access are not configured. Managers receive exported snapshots. Keep backups regularly through Reports → Backups.

## Equipment and infrastructure

School snapshots record projectors, laptops, tablets, visualisers and mini PCs. Each category has Total, Working, Faulty and Awaiting repair. Condition categories are mutually exclusive and must sum to Total. Blank categories mean Not captured; zeros confirm none. Each snapshot requires a verification date and source, with optional contact and notes. New snapshots retain history rather than overwriting previous verifications.

Smart classrooms have Yes/No/Unknown, installed and functional counts, and separate usage (Unknown, Regular use, Limited use, Not in use). Functional count cannot exceed installed count. Their component devices are not automatically added to equipment totals. These are school-level equipment summaries, not individual serial-number asset records.

Latest snapshots are selected by verification date, with update timestamp resolving same-date records. Historical manager exports use snapshots on or before the report end date. Category coverage and missing records remain visible.

## Training recommendations

The catalogue contains 100 virtual sessions (12 hosted by ECKED) extracted from the user's saved eTPD Upcoming Sessions page. It is a **13 November 2026 snapshot**, listing 2027 sessions, not a live feed. Source: https://wcedtpd.pages.dev/sessions. No external database credentials or preregistration code were copied.

Recommendations match named courses to actual indicators scored 1–3. Lower scores are prioritised, then earlier dates; past sessions are excluded. The default district is Eden & Central Karoo and can be broadened. Check school phase, availability and eligibility before recommending a session. Connectivity, maintenance, leadership and policy issues require appropriate direct advice; workshops are not presented as automatic fixes for them.

Record training recommendation adds a school recommendation only. It does not register teachers, confirm attendance or schedule a visit. Optional training-verification fields remain in school recommendation history for confirmed information. Existing support entries are preserved as historical records and are not surfaced as a planner.

## Run, test and publish

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

Core/model tests cover classification, legacy LMS preservation, drafts and rollback, coverage, equipment, training matching and escaping. DOM tests exercise reporting navigation, the eleven-indicator matrix, historical records, draft recovery, finalisation, equipment, training recommendations and backups. DOM tests do not replace visual or print-layout review.

`npm run build` generates dist. GitHub Actions checks and publishes main to the configured GitHub Pages site. Production React, icons, styles and the logo are bundled; the app does not depend on external CDNs to load its libraries. It is not an offline PWA.

## Structure

- `src/AppShell.jsx`, `src/styles.css`: approved reporting shell and responsive styles.
- `src/AdvisorDashboard.jsx`: overview, school profiles and reports.
- `src/CaptureFindings.jsx`: stepped findings capture.
- `src/app.jsx`: school register, current report/form state, persistence and individual report generation.
- `src/core.js`, `src/advisor.js`: scoring, validation, school profiles and management export.
- `src/drafts.js`: partial report validation and multi-key write rollback.
- `src/SchoolEquipment.jsx`, `src/equipment.js`: equipment capture and summaries.
- `src/TrainingRecommendations.jsx`, `src/training.js`, `src/training-sessions.json`: needs-based course suggestions.
- `src/assets/ecked-logo.png`: supplied district logo, used with the user's instruction.

Future integration can add authenticated shared records and read-only manager access. Departmental branding does not imply official approval of this custom tool. No software licence has been selected.
