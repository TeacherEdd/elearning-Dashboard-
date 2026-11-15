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
- `ecked-action-impact-v1`: linked school findings, support, dated observations and correction history.

Drafts are saved explicitly, not continuously autosaved. Finalising an edited draft preserves the original final record until a complete replacement is successfully saved. Finalisation and draft removal are written together with rollback on storage failure. Finalising an incomplete record is blocked. Management commentary is included in the export but is not autosaved.

Version 5 backups contain reports, drafts, equipment, support/recommendation records and Action to Impact evidence. Versions 1–4 and bare legacy assessment arrays are also accepted. Older backups merge existing collections and do not erase collection types they do not contain. Incoming records are validated before storage writes; matching IDs replace records after confirmation, and multi-key writes attempt rollback if a later write fails.

No school findings are stored in the GitHub repository. Different devices, browsers and web addresses have separate local records. Shared authentication, cloud storage and live manager access are not configured. Managers receive exported snapshots. Keep backups regularly through Reports → Backups.

## 2027 focus: From Action to Impact

The school Summary includes a compact What we found → What we did → What changed panel, without another main navigation item. Start with a finding and optional support provided. Later updates require only an observation and an evidence judgement; advisor/date details are tucked into an expandable section. More than one focus can be recorded per school, selected within the same panel.

The Findings step has one optional Support provided field. Finalising a report with a finding and support creates a linked impact baseline automatically. Editing that report updates the linked record without duplicating the need or deleting its observation history. Findings with support are kept separate from planned training recommendations; the app never claims an action occurred simply because a course was recommended.

Baseline finding, support and each later observation retain their own names and dates. Optional details allow one advisor to record a baseline and the other to provide support or record later evidence. Baseline corrections retain the previous text and correction author. These are self-entered names, not authenticated identities. Shared storage and sign-in remain unconfigured; this update does not create a multi-user cloud system.

Evidence judgements are Not checked, Implementation seen, Early positive change, Sustained positive change and No change yet. Implementation is not automatically positive learner impact. Sustained positive change requires positive evidence on an earlier date; a single observation or two observations on the same day are insufficient. This is a minimum check, not a guarantee of impact or causation. Later judgements do not delete previous observations.

Overview counts use the latest observation for each recorded need as at the current date. Positive-change cases also count as implementation, so those categories overlap. Counts are needs/cases, not unique schools, and cover records up to the snapshot date (including a baseline captured before 2027). No observed change is inferred from maturity-score improvements alone.

Management reports reuse the same school notes and evidence as at the reporting end date. Individual reports show evidence as at that assessment date. Future observations are excluded. Historical exports use the current corrected baseline; they are generated views, not immutable original PDF snapshots.

Version 5 backups preserve the full impact history. Restoring older backups keeps it intact. Matching impact record IDs merge independent observation IDs, preserving both advisors' observations when backups are exchanged. Conflicting content under the same observation ID stops restoration before any writes. This supports safe manual transfer, not live collaboration.

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
- `src/ImpactPanel.jsx`, `src/impact.js`: minimal school impact capture, history, validation, counts and report exports.
- `src/SchoolEquipment.jsx`, `src/equipment.js`: equipment capture and summaries.
- `src/TrainingRecommendations.jsx`, `src/training.js`, `src/training-sessions.json`: needs-based course suggestions.
- `src/assets/ecked-logo.png`: supplied district logo, used with the user's instruction.

Future integration can add authenticated shared records and read-only manager access. Departmental branding does not imply official approval of this custom tool. No software licence has been selected.

## Job-description reporting (0.6)

Capture findings now offers Full school assessment or Quick support record, retaining the same four main navigation items. Quick records capture support already delivered to teachers, SMTs, subject advisors or officials without maturity scoring. One activity can link several registered schools across circuits; no school links means district/official support, which is excluded from school coverage. Linked schools receive one Action to Impact baseline, including optional intended change. School Summary remains the place to record later observations.

Quick support includes one explicit KRA, optional resource URL/subject/phase, support method, attendance, implementation, verification evidence and barrier state. Confirmed outcomes require evidence; no automatic LMS maturity score is added. Update evidence from Reports → KRA report → Recorded support activities or a school's Recommendations. Updates preserve earlier support versions. Dates and school links are fixed when updating to protect linked evidence chronology.

Reports → KRA report offers quarter/date and advisor filters, counts activities once across school links, and exports all four performance areas. It includes linked school follow-up evidence up to the period end. Attendance/implementation counts are activity counts, not teacher headcounts. Verification fields reflect their current saved state, including later corrections; historical reports are generated views rather than immutable original snapshots. Management summaries include the KRA section as well. Legacy recommendations remain visible but are not recategorised as delivered activities.

Overview includes reporting prompts for support without follow-up evidence, explicitly recorded open barriers and equipment snapshots older than 180 days. These are prompts to verify information, not visit schedules or official performance targets.

Version 5 backups retain the optional activity metadata and correction history in supportLogs. Existing backups remain readable. Shared authentication and live synchronisation remain unconfigured: connecting a managed database and authorising the two advisor accounts and a read-only manager account is still required. No school data or credentials are committed to the public repository.

## Simplified school reporting (0.6.1)

KRA categories and the separate KRA report are no longer shown in the app or current management exports. Quick support asks about the need, support provided, intended change and optional resources/platforms and evidence. Existing classification metadata remains in backups for compatibility. Reports → Support history retains access to district activities, evidence updates and previous versions without KRA grouping.

Overview shows three numbered challenge cards based on each school's latest final assessment within the circuit filter. Indicators scored 1–3 qualify; unassessed schools and drafts are excluded. Rank uses affected school count descending, then average score ascending, with stable indicator-key tie breaking. The card colour reflects its lowest score; counts show each score band separately. Each school counts once per indicator. Fewer than three challenges leaves explicitly empty slots; no findings are invented. School links open the relevant Summary. Red=1, orange=2, amber=3, blue=4, green=5; numeric labels accompany colour. The same colours appear in assessment scoring controls. LMS remains excluded.

## Focus schools

Overview includes a Focus schools panel and Add focus school button. No schools are preselected and no fixed count or limit of four is assumed: select the current four schools from the register, then add others as needed. The panel respects circuit scope and shows stage counts and school cards. Stages are advisor-confirmed: starting point, foundations, teacher confidence, classroom application, sustained change. Stages 4–5 require a written evidence note; this is a validation aid, not proof of impact. Priority is required; next step and early-stage evidence are optional. School links open the existing Summary. Pathway edits retain prior versions; archiving is reversible and preserves school reports. Reactivate an archived record instead of adding a duplicate school.

Focus pathways use browser key `ecked-focus-schools-v1`. Version 6 backups include focusSchools; versions 1–5 and legacy arrays still restore without removing existing pathways. Merging uses school identity and keeps the latest update and prior snapshots. Unreadable focus storage is protected from accidental replacement. Shared sign-in and live syncing remain unconfigured.

## School adoption pathway update

The focus school pathway now follows the advisor's four steps: Audit; ICT Policy and eLearning Plan; ICT Adoption Strategy; Digital Skills Course. The four overview cards count schools confirmed to have completed each step. School cards show a sequential completed checklist and the next step, with a distinct all-four-completed state. Completion is manually confirmed with a short evidence note, not inferred from audit scores, course recommendations or attendance. Course completion is kept separate from classroom impact.

New focus records use pathwayVersion 2, completed 0–4 and a derived next stage. Earlier five-stage records remain readable and preserved, but show Needs pathway review and contribute no confirmed completions until the advisor reviews them. Editing a legacy record begins with no confirmed new steps or reused evidence; saving preserves the previous record in history. Existing version 6 backups continue to retain the full record and its pathway version. Step accents follow the supplied reference: teal, lime, blue and magenta.

## Automatic audit and manual step boxes

Audit completion now comes directly from the existence of a finalised Capture findings report for the same school and circuit, dated today or earlier. Existing final reports count immediately. Draft reports, quick support and old manually confirmed audit steps do not count. Audit is read-only; removing the last qualifying report makes it pending again. Summary counts and checklist status recompute from current final reports.

Policy/eLearning Plan, ICT Adoption Strategy and Digital Skills Course have separate checkboxes. School-card changes save immediately with advisor/date and previous versions; the add/edit form saves its boxes with Save focus school. Steps can be ticked or unticked independently; no later step silently checks earlier ones. Extra evidence notes are optional. Records use pathwayVersion 3 with three manual step booleans. Previous four-step records preserve their manually confirmed steps 2–4, while Audit is derived from final reports. Earlier five-stage records retain history and need the remaining steps confirmed. Version 6 backups preserve all versions.

## Transformation Agent step

Transformation Agent is the fifth focus school pathway step, after Digital Skills Course. Its independent checkbox saves just like steps 2–4, with a purple accent and a fifth completion count. Audit still derives from finalised Capture findings. The overall badge now counts out of five. New pathwayVersion 4 records contain four manual booleans. Previous pathway records retain steps 1–4; Transformation Agent starts unchecked and is never inferred from older completion totals. History and version 6 backups remain compatible.

## Cyberwellness assessment heading

Cyberwellness adds Online Safety and Privacy (`cyber-0`), Responsible Digital Behaviour (`cyber-1`), and Cyberbullying and Reporting (`cyber-2`). New and edited final assessments require all 14 current indicators. The same 1–5 scale applies, with an evidence prompt asking for school practices and procedures rather than identifiable incident details. Cyberwellness feeds section findings, challenge rankings, guidance, training matches, print/text reports and CSV exports; LMS remains excluded.

Legacy complete 11-indicator reports remain valid with no invented cyber scores. All three cyber ratings must be present together in a current final record; partial cyber records are rejected. Legacy reports label Cyberwellness Not assessed and retain their original mean and scoring basis. CSV includes Indicators scored. Progress deltas are withheld across different scoring bases. Management summaries disclose that aggregate means can include 11- and 14-indicator reports and should be interpreted with coverage in mind. Drafts can be partial, including the new indicators, and older drafts require the three extra ratings before finalisation. Existing backups and focus-school automatic audits continue to accept complete legacy reports.
