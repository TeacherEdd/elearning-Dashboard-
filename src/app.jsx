import {FOCUS_KEY,validateFocus,mergeFocus} from './focus.js';
import QuickSupport from './QuickSupport.jsx';
import {IMPACT_KEY,validateImpacts,findingFromReport,latestImpactEvidence,mergeImpactRecords} from './impact.js';
import {ImpactReportEvidence} from './ImpactPanel.jsx';
import AppShell from './AppShell.jsx';
import CaptureFindings from './CaptureFindings.jsx';
import {DRAFTS_KEY,validateDrafts,writeCollections} from './drafts.js';
import districtLogo from './assets/ecked-logo.png';
import {EQUIPMENT_KEY,validateEquipment} from './equipment.js';
import AdvisorDashboard from './AdvisorDashboard.jsx';
import { SUPPORT_KEY, validateSupportLogs, validDate } from './advisor.js';
import './styles.css';
import { INDICATORS, scoreBasis, calculateReadiness, validateReports, mergeReports, csvExport } from './core.js';

    import React, { useEffect, useMemo, useState } from 'react';
    import { createRoot } from 'react-dom/client';
    import {
      BookOpen, BrainCircuit, Calendar, ClipboardCheck, Eye, LayoutDashboard, 
      Loader2, Printer, Save, School, ShieldCheck, Trash2, Users, X, 
      PlusCircle, FileText, AlertTriangle, Award, TrendingUp, MapPin, 
      UserCheck, Sparkles, CheckCircle2, FileDown, BarChart3
    } from 'lucide-react';

    const STORAGE_KEY = 'wced-district-monitor-ai-v6';

    const schoolDatabase = {
      'Circuit 1': ['AMALIENSTEIN LB PRIM','ALBERTINIA HS','BERTIE BARNARD LS','BRAKFONTEIN EK PRIM','DANKOORD VGK PRIM','DE WAALVILLE PRIM','GERRIT DU PLESSIS SEK','GOEDGEGUN VGK PRIM','HEIDELBERG HS','HOEKO VGK PRIM','KAIROS SEK','LADISMITH HS','LADISMITH SEK','LANGENHOVEN HS','MELKHOUTFONTEIN PRIM','MOLENRIVIER PRIM','OAKDALE LANDBOUSKOOL','OKER PRIM','PANORAMA PRIM','SLANGRIVIER PRIM','TOWERKOP PRIM','VAN WYKSDORP PRIM','VOLSCHENK LS','VONDELING NAK PRIM','VOORWAARTS PRIM','W.J. LE ROUX LB PRIM','ZOAR EK PRIM','ZOAR R.P. BOTHA VGK PRIM'],
      'Circuit 2': ['DENNEPRAG PRIM','DIAZ PRIM','ERIKA PRIM','FRIEMERSHEIM PRIM','GARDEN ROUTE PRIM','GROOT BRAKRIVIER PRIM','GROOT BRAKRIVIER SEK','HARTENBOS LS','HERBERTSDALE LS','HILLCREST SEK','IMEKHAYA PRIM','INDWE SEC','ISALATHISO PRIM','MILKWOOD PRIM','MOSSELBAAI EK PRIM','PARK LS','PUNT HS','RIDGEVIEW PRIM','RUITERBOS LS','SAO BRAS SEK',"ST LUKE'S PRIM",'ST. BLAIZE RK PRIM','TM NDANDA PRIM','VORENTOE LS'],
      'Circuit 3': ['CONVILLE PRIM','DIEPKLOOF VGK PRIM','HIBERNIA VGK PRIM','HOEKWIL LS','KARATARA LS','KLIPDRIFT EK PRIM','LANCEWOOD PRIM','M M MATEZA PRIM','OLYMPIA SKOOL','OUTENIQUA LS','PARKDENE PRIM','PARKDENE SEK','PW BOTHA KOLLEGE','REDLANDS PRIM','RUIGTEVLEI PRIM','SEDGEFIELD LS','SEDGEFIELD PRIM','TABATA PRIM','THEMBALETHU SEC','THEMBALETU PRIM','TOUWSRANTEN VGK PRIM','TYHOLORA PRIM','WABOOMSKRAAL VGK','YORK HS'],
      'Circuit 4': ['BRACKEN HILL EK PRIM','CHRIS NISSEN PRIM','CONCORDIA PRIM','CONCORDIA SEK','FORMOSA PRIM','FRAAISIG PRIM','HARKERVILLE EK PRIM','HORNLEE PRIM','KNYSNA HS','KNYSNA PRIM','KNYSNA SEK','KRANSHOEK PRIM','KWANOKUTHULA PRIM','MURRAY HS','PERCY MDALA SEC','PHAKAMISANI PRIM','PLETTENBERG BAY PRIM','PLETTENBERGBAAI SEK','RHEENENDAL PRIM','SUNRIDGE PRIM','THE CRAGS PRIM','THEMBELITSHA PRIM','WITTEDRIFT HS','WITTEDRIFT PS'],
      'Circuit 5': ['AURIAL KOLLEGE','BERGSIG PRIM','BRIDGTON SEK','CALITZDORP HS','COLRIDGE PRIM','DE JAGER VGK PRIM','DE VILLIERS PRIM','ELJADA-KAIROS SKOOL','EXCELSIOR VGK PRIM','FEZEKILE SEC','GAMKA-OOS PRIM','GROOTKRAAL UCC PRIM','KRUISRIVIER-WES UCC PRIM','LANGENHOVEN GIM','LATEGANSVLEI SSKV PRIM','LAURUS LS','OUDTSHOORN HS','OUDTSHOORN SOS','RODEWAL PRIM','ROOIBERG PRIM','VOLMOED PRIM','VOORBEDAG PRIM','WESBANK LS','ZEEKOEGAT VGK PRIM'],
      'Circuit 6': ['AVONTUUR LB PRIM','BONGOLETHU PRIM','BRITSEVLAKTE NGK PRIM','DE RUST PRIM','DE RUST SEK','DIRK BOSHOFF PRIM','DYSSELSDORP PS','DYSSELSDORP SEK','HAARLEM SEK','MORESTER SEK','MOOIUITSIG PRIM','PJ BADENHORST PRIM','PROTEA HS','ROOIHEUWEL VGK PRIM','ROOIRIVIER VGK PRIM','SACRED HEART RK PRIM','SATURNUS PRIM','SCHEEPERSKRAAL PRIM','ST. KONRAD RK PRIM','UNIONDALE HS','VAN REEDE LS','VLAKTEPLAAS UCC PRIM'],
      'Circuit 7': ['A.H. BARNARD PRIM','ACACIA PRIM','BAARTMANSFONTEIN','BASTIAANS SEK','BEAUFORT WES PRIM','BEAUFORT WES VOORB','BEAUFORT-WES SEK','GEORGE FREDERICKS PR','H.M. DLIKIDLA PRIM','J D CRAWFORD PRIM','KLAARSTROOM PRIM','KLAWERVLEI PRIM','LAINGSBURG HS','LEEU GAMKA PRIM','MANDLENKOSI SEC','MATJIESFONTEIN LB','MERWEVILLE PRIM','MURRAYSBURG HS','MURRAYSBURG PRIM','NIKO BRUMMER PRIM','PRINS ALBERT PRIM','RESTVALE MET PRIM','SEEKOEGAT VGK PRIM','SENTRAAL HS','ST. MATTHEWS PRIM','TESKE GEDENK PRIM','ZWARTBERG HS'],
      'Circuit 8': ['BLANCO LS','CARPE DIEM SKOOL','DELLVILLE PARK PRIM','DENNEOORD LS','DIEPRIVIER VGK PRIM','FRANKEN VGK PRIM','GEELHOUTBOOM PRIM','GEORGE SEK','GEORGE-SUID LS','HEATHERLANDS HS','HEIDEDAL PRIM','HEROLD LS','HOLY CROSS PRIM','HOOGEKRAAL SSKV PRIM','IMIZAMO YETHU SEC','JONGA STREET HS','KOMMANDANTSDRIFT PRIM','KRETZENSHOOP PRIM','MZOXOLO PRIM','NEW DAWN PARK PRIM','OUTENIQUA HS','PACALTSDORP PRIM','PACALTSDORP SEK','ROSEMOOR PRIM',"ST PAUL'S PRIM",`ST. MARY'S RK PRIM`,'VAN DER HOVEN LS'],
    };

    const ratingScale = {
      1: 'Very Weak – Not evident at all',
      2: 'Weak – Limited / inconsistent',
      3: 'Developing – Some evidence, not consistent',
      4: 'Strong – Regular and effective',
      5: 'Excellent – Fully embedded / best practice',
    };

    const monitoringSections = [
      {
        id: 'env',
        title: 'Enabling Environment',
        icon: ShieldCheck,
        items: [
          { key: 'env-0', name: 'Connectivity Quality', desc: 'Reliability and speed of internet access.' },
          { key: 'env-1', name: 'Physical Security', desc: 'Security of ICT assets and storage.' },
          { key: 'env-2', name: 'Technical Maintenance', desc: 'Device upkeep and repairs.' },
        ],
      },
      {
        id: 'culture',
        title: 'e-Culture & Change Management',
        icon: Users,
        items: [
          { key: 'culture-0', name: 'ICT Policy & Integration', desc: 'Use of a practical digital plan.' },
          { key: 'culture-1', name: 'Leadership Drive', desc: 'SMT involvement in digital transformation.' },
          { key: 'culture-2', name: 'Formal Training Intake', desc: 'Staff participation in formal ICT and e-learning training opportunities.' },
          { key: 'culture-3', name: 'Informal Support Culture', desc: 'Evidence of peer-to-peer support, mentoring and teacher collaboration around ICT.' },
        ],
      },
      {
        id: 'teaching',
        title: 'e-Teaching & Training',
        icon: BookOpen,
        items: [
          { key: 'teaching-0', name: 'ePortal/Teletuks Use', desc: 'Use of digital curriculum resources.' },
          { key: 'teaching-2', name: 'Pedagogical Shift', desc: 'Evidence that teaching practices are changing meaningfully through technology.' },
          { key: 'teaching-3', name: 'Teacher Content Creation', desc: 'Teachers creating their own digital teaching and learning resources.' },
          { key: 'teaching-4', name: 'Learner Digital Literacy', desc: 'Learners are able to use digital tools confidently and appropriately for learning.' },
        ],
      },
      {id:'cyber',title:'Cyberwellness',icon:ShieldCheck,items:[
        {key:'cyber-0',name:'Online Safety and Privacy',desc:'How effectively does the school teach learners and staff to protect personal information, passwords and accounts, and recognise online risks?'},
        {key:'cyber-1',name:'Responsible Digital Behaviour',desc:'How consistently does the school promote respectful online behaviour, responsible sharing and healthy technology use?'},
        {key:'cyber-2',name:'Cyberbullying and Reporting',desc:'How clear and understood are the school’s procedures for reporting and responding to cyberbullying or harmful online content?'},
      ]},
    ];


    const maturityLevels = [
      { label: 'EMERGING', color: 'bg-red-500', text: 'text-red-700', light: 'bg-red-50', border: 'border-red-200' },
      { label: 'ESTABLISHING', color: 'bg-orange-500', text: 'text-orange-700', light: 'bg-orange-50', border: 'border-orange-200' },
      { label: 'INTEGRATED', color: 'bg-blue-500', text: 'text-blue-700', light: 'bg-blue-50', border: 'border-blue-200' },
      { label: 'TRANSFORMATIVE', color: 'bg-green-500', text: 'text-green-700', light: 'bg-green-50', border: 'border-green-200' },
    ];

    const indicatorGuidance = {
      'Online Safety and Privacy':{problem:'Online safety and privacy guidance needs strengthening.',action:'Teach safe passwords, account protection, privacy and recognition of online risks.',advisor:'Support a practical online safety awareness activity for staff and learners.',school:'Review safe account practices and reinforce age-appropriate privacy guidance.'},
      'Responsible Digital Behaviour':{problem:'Responsible and balanced technology use is not yet consistent.',action:'Teach respectful communication, responsible sharing and healthy technology routines.',advisor:'Model classroom activities that develop responsible digital behaviour.',school:'Reinforce acceptable-use expectations with staff, learners and families.'},
      'Cyberbullying and Reporting':{problem:'Reporting and response procedures need to be clearer and better understood.',action:'Review the reporting route and explain how learners can seek help.',advisor:'Help the SMT communicate and review the school reporting procedure.',school:'Make safe reporting routes visible and check that staff and learners understand them.'},

      'Connectivity Quality': { problem: 'Internet reliability is limiting classroom use of digital tools.', action: 'Test coverage in all teaching spaces and monitor uptime weekly.', advisor: 'Support the school with a connectivity review and escalation plan.', school: 'Keep a simple fault log and follow up unresolved issues.' },
      'Physical Security': { problem: 'ICT equipment may be vulnerable because storage and access control need strengthening.', action: 'Review lockable storage and sign-out routines for devices.', advisor: 'Guide the school on minimum ICT protection measures.', school: 'Use clear storage and accountability routines.' },
      'Technical Maintenance': { problem: 'Repairs and upkeep are slowing down effective use of devices.', action: 'Introduce a maintenance register with dates and turnaround tracking.', advisor: 'Help the school set up a simple support workflow.', school: 'Assign a staff member to record and follow up faults.' },
      'ICT Policy & Integration': { problem: 'Digital integration is not yet guided by a clear school routine.', action: 'Develop a short practical ICT plan with priorities and roles.', advisor: 'Support leadership to align policy with implementation.', school: 'Review the ICT plan termly.' },
      'Leadership Drive': { problem: 'Leadership support for digital transformation needs to be more visible and consistent.', action: 'Place ICT progress on the SMT agenda and track actions monthly.', advisor: 'Coach the SMT on digital change management.', school: 'Assign clear leadership roles for ICT adoption.' },
      'Formal Training Intake': { problem: 'Teachers are not yet accessing enough formal ICT and e-learning training opportunities.', action: 'Create a simple training participation plan and monitor attendance each term.', advisor: 'Share relevant formal training opportunities and support uptake.', school: 'Track teacher attendance and encourage wider participation in formal development.' },
      'Informal Support Culture': { problem: 'Teachers are not consistently supporting one another through peer mentoring and practical ICT sharing.', action: 'Build simple peer-support routines such as demonstrations, staff sharing slots and teacher buddy systems.', advisor: 'Model low-pressure informal support practices that can be sustained internally.', school: 'Create regular opportunities for teachers to share ideas and help one another with digital teaching practices.' },
      'ePortal/Teletuks Use': { problem: 'Digital platforms are not yet being used consistently to support learning.', action: 'Pilot stronger use in two subjects with weekly targets.', advisor: 'Provide hands-on support with lesson integration.', school: 'Track teacher usage and celebrate small wins.' },
      'Pedagogical Shift': { problem: 'Technology is not yet changing teaching practice in a meaningful and learner-centred way.', action: 'Support teachers to move from substitution to more interactive and transformative use of ICT.', advisor: 'Model practical examples of stronger pedagogy through technology.', school: 'Encourage classroom strategies where learners engage, create and collaborate using digital tools.' },
      'Teacher Content Creation': { problem: 'Teachers are relying mostly on existing material instead of creating contextual digital resources.', action: 'Train staff to create simple presentations, quizzes and CAPS-linked materials.', advisor: 'Facilitate practical content-creation workshops.', school: 'Build a shared folder of teacher-created content.' },
      'Learner Digital Literacy': { problem: 'Learners are not yet confident and independent in using digital tools for learning.', action: 'Introduce structured opportunities for learners to practise digital skills during normal teaching.', advisor: 'Support teachers with strategies to integrate learner digital skill development into lessons.', school: 'Create regular learner activities that build navigation, responsible use and digital confidence.' },
    };

    function buildDetailedAnalysis(scoreMap, readinessLabel, schoolName) {
      const entries = monitoringSections.flatMap((section) =>
        section.items.map((item, idx) => ({
          key: item.key,
          name: item.name,
          section: section.title,
          score: scoreMap[item.key] ?? null,
          ...indicatorGuidance[item.name],
        }))
      ).filter((item) => item.score !== null);

      const averageScore = entries.length
        ? entries.reduce((sum, item) => sum + item.score, 0) / entries.length
        : 0;

      const weightedPriority = entries
        .map((item) => {
          const severity = 6 - item.score;
          const strategicWeight =
            item.name === 'Leadership Drive' || item.name === 'Connectivity Quality' || item.name === 'Pedagogical Shift'
              ? 1.35
              : item.name === 'Teacher Content Creation' || item.name === 'Learner Digital Literacy'
                ? 1.2
                : 1;
          return {
            ...item,
            weightedScore: Number((severity * strategicWeight).toFixed(2)),
          };
        })
        .sort((a, b) => b.weightedScore - a.weightedScore);

      const weakAreas = weightedPriority
        .filter((item) => item.score <= 2)
        .slice(0, 4)
        .map((item, index) => ({
          name: item.name,
          section: item.section,
          score: item.score,
          rank: index + 1,
          priority: item.score === 1 ? 'Urgent' : 'High',
          problem: item.problem,
          advisor_action: item.advisor,
          school_action: item.school,
          action: item.action,
          urgency_reason:
            item.score === 1
              ? `${item.name} is almost absent in current practice and is restricting wider digital progress.`
              : `${item.name} is weak and needs focused support before improvement can scale across the school.`,
        }));

      const strengths = entries
        .filter((item) => item.score >= 4)
        .sort((a, b) => b.score - a.score)
        .slice(0, 3)
        .map((item) => ({
          name: item.name,
          section: item.section,
          score: item.score,
          why_it_matters: `${item.name} is a current strength that can be used as a lever to improve weaker areas across the school.`,
        }));

      const categoryBreakdown = monitoringSections.map((section) => {
        const sectionEntries = section.items.map((item, idx) => ({
          name: item.name,
          score: scoreMap[item.key] ?? null,
        })).filter(item=>item.score!==null);
        const sectionAverage = sectionEntries.length 
            ? sectionEntries.reduce((sum, item) => sum + item.score, 0) / sectionEntries.length 
            : 0;
        return {
          title: section.title,
          average: sectionEntries.length?sectionAverage.toFixed(1):'Not assessed',
          status: !sectionEntries.length?'Not assessed':
            sectionAverage <= 2.5 ? 'Emerging'
            : sectionAverage < 3.5 ? 'Establishing'
            : sectionAverage < 4.5 ? 'Integrated'
            : 'Transformative'
        };
      });

      const mainWeakness = weakAreas[0];
      const secondWeakness = weakAreas[1];
      const strongestArea = strengths[0];

      const readinessNarrative =
        readinessLabel === 'EMERGING'
          ? 'Digital integration is still at an early stage and requires strong support, clearer routines and tighter leadership follow-through.'
          : readinessLabel === 'ESTABLISHING'
            ? 'There is visible progress, but implementation is not yet consistent enough across systems, staff practice and classroom use.'
            : readinessLabel === 'INTEGRATED'
              ? 'The school has a good digital foundation, but selected weak indicators are preventing stronger whole-school impact.'
              : 'The school is functioning at a high level of digital maturity and should now focus on sustaining excellence and mentoring others.';

      const executiveSummary = weakAreas.length
        ? `${schoolName} achieved an overall digital maturity score of ${averageScore.toFixed(1)}/5 and is currently rated ${readinessLabel}. ${readinessNarrative} The most pressing issue is ${mainWeakness.name.toLowerCase()}, with ${secondWeakness ? `${secondWeakness.name.toLowerCase()} also needing attention.` : 'one clear priority needing immediate action.'}`
        : `${schoolName} achieved an overall digital maturity score of ${averageScore.toFixed(1)}/5 and is currently rated ${readinessLabel}. ${readinessNarrative} No critical weak area was identified, but the focus should now shift to consistency, sustainability and scaling strong practice.`;

      const priorityActions = weakAreas.length
        ? weakAreas.map((item, index) => {
            if (index === 0) return `Immediately address ${item.name.toLowerCase()} through a focused support plan, short-term monitoring and visible leadership follow-up.`;
            if (index === 1) return `Strengthen ${item.name.toLowerCase()} so that progress is not isolated and implementation becomes more consistent across the school.`;
            return item.action;
          })
        : [
            'Protect current strengths through regular monitoring and follow-up support.',
            'Move developing indicators into routine whole-school practice.',
            'Use the strongest areas as models for staff support and internal sharing.',
          ];

      return {
        executive_summary: executiveSummary,
        main_problem: mainWeakness
          ? `${mainWeakness.name} is currently the main barrier slowing stronger and more consistent digital integration at ${schoolName}.`
          : `No critical problem area was identified in this audit for ${schoolName}.`,
        weak_areas: weakAreas,
        strengths,
        priority_actions: priorityActions,
        category_breakdown: categoryBreakdown
      };
    }

    function generateInterventionPlan(analysis) { return analysis?.priority_actions || []; }

    function PrintStyles() {
      return (
        <style>{`
          @media print {
            @page { size: A4; margin: 15mm; }
            
            /* Hide the main application body completely */
            body * { visibility: hidden; }
            
            /* Show ONLY the printable report container */
            #printable-report, #printable-report * { visibility: visible; }
            #printable-report { 
              position: absolute; 
              left: 0; 
              top: 0; 
              width: 100%; 
              padding: 0;
              margin: 0;
            }
            
            /* Format text for standard formal printing - Use exact colors! */
            body, #printable-report {
              background: white !important; 
              -webkit-print-color-adjust: exact !important; 
              print-color-adjust: exact !important; 
              font-family: 'Inter', system-ui, sans-serif !important;
            }

            /* Hide interactive UI elements inside the printable area */
            .no-print, .no-print * { display: none !important; }
            
            /* Formal WCED Letterhead Layout with Colors */
            .wced-header { 
              text-align: center; 
              margin-bottom: 25px; 
              border-bottom: 4px solid #2563eb; /* WCED Blue */
              padding-bottom: 15px; 
            }
            .wced-header h1 { font-size: 22pt; font-weight: 900; margin: 0 0 5px 0; text-transform: uppercase; color: #1e3a8a !important; }
            .wced-header h2 { font-size: 14pt; font-weight: bold; margin: 0; color: #3b82f6 !important; letter-spacing: 1px; }
            
            /* Clean table for school details */
            .meta-table { width: 100%; margin-bottom: 30px; border-collapse: collapse; }
            .meta-table td { padding: 8px 0; font-size: 11pt; border-bottom: 1px solid #e2e8f0; color: #334155 !important; }
            .meta-table .label { font-weight: 900; width: 160px; text-transform: uppercase; color: #64748b !important; font-size: 10pt; letter-spacing: 0.05em; }
            
            /* Score Box for top right */
            .score-box { 
              border: 2px solid #000; 
              padding: 15px; 
              text-align: center; 
              width: 250px; 
              float: right; 
              margin-left: 20px; 
              margin-bottom: 20px; 
              background-color: #f9f9f9 !important;
            }
            .score-box .sb-title { font-size: 10pt; font-weight: bold; text-transform: uppercase; margin-bottom: 5px; }
            .score-box .score { font-size: 24pt; font-weight: bold; }
            .score-box .level { font-size: 12pt; text-transform: uppercase; font-weight: bold; margin-top: 5px; }
            
            /* Sections */
            .section-title { 
              font-size: 14pt; 
              font-weight: 900; 
              text-transform: uppercase; 
              border-bottom: 2px solid #cbd5e1; 
              color: #0f172a !important;
              padding-bottom: 5px; 
              margin: 25px 0 15px 0; 
              page-break-after: avoid; 
              clear: both;
            }
            
            .page-break { page-break-before: always; }
          }
        `}</style>
      );
    }

    function ReportModal({ report, onClose, onEdit, totalIndicators, impactRecords=[] }) {
      const [copiedWord, setCopiedWord] = useState(false);

      const localCalc = useMemo(() => {
          if (!report) return null;
          return buildDetailedAnalysis(report.scores, report.readiness, report.school);
      }, [report]);

      if (!report) return null;

      // Extract Breakdown data safely
      const breakdownData = report.aiAnalysis?.category_breakdown || localCalc?.category_breakdown || [];

      const generateWordReportText = () => {
        const ai = report.aiAnalysis || localCalc;

        const indicatorsText = monitoringSections.map(sec => {
            return `${sec.title.toUpperCase()}\n` + 
            sec.items.map((item, idx) => `  - ${item.name}: ${report.scores[item.key] ? report.scores[item.key]+'/5' : 'Not assessed'}`).join('\n');
        }).join('\n\n');

        return `WESTERN CAPE EDUCATION DEPARTMENT (WCED)
E-LEARNING SCHOOL FINDINGS REPORT
--------------------------------------------------------------------------------

TO: The Principal, ${report.school}
FROM: ${report.advisor}, e-Learning Advisor (${report.circuit})
DATE: ${report.date}
SUBJECT: e-Learning Readiness and Implementation Audit
INTERVIEWEE: ${report.staff} (${report.designation})

--------------------------------------------------------------------------------
1. OVERALL READINESS SCORE
--------------------------------------------------------------------------------
Score: ${report.avg} / 5.0
Maturity Level: ${report.readiness}
Information source: ${report.informationSource || 'Not specified'}
Scoring basis: ${scoreBasis(report)} indicators; LMS excluded${scoreBasis(report)===11?'; Cyberwellness not assessed':''}

RECORDED FINDINGS AND EVIDENCE
${report.notes || 'No additional observations recorded.'}

SUPPORT PROVIDED
${report.supportProvided||'Not recorded'}

FROM ACTION TO IMPACT
${impactRecords.filter(r=>r.school===report.school&&r.circuit===report.circuit&&r.baseline.date<=report.date).map(r=>{const e=latestImpactEvidence(r,report.date);return `Finding: ${r.baseline.finding}\nSupport: ${r.baseline.action||'Not recorded'}\nLatest evidence: ${e?.evidence||'Not checked'}\nJudgement: ${e?.status||'Not checked'}${e?` (${e.date}; ${e.author})`:''}`;}).join('\n\n')||'No linked evidence recorded as at this report date.'}

--------------------------------------------------------------------------------
2. DETAILED INDICATOR SCORES
--------------------------------------------------------------------------------
${indicatorsText}

--------------------------------------------------------------------------------
3. CATEGORY PERFORMANCE BREAKDOWN
--------------------------------------------------------------------------------
${breakdownData.map(cat => `- ${cat.title}: ${cat.average}/5.0 (${cat.status})`).join('\n')}

--------------------------------------------------------------------------------
4. EXECUTIVE SUMMARY
--------------------------------------------------------------------------------
${ai?.executive_summary || 'No summary available.'}

--------------------------------------------------------------------------------
5. PRIORITY AREAS (AT RISK)
--------------------------------------------------------------------------------
${ai?.weak_areas?.length > 0 
      ? ai.weak_areas.map((w, i) => `${i + 1}. ${w.name} (Score: ${w.score}/5)\n   Problem: ${w.problem}\n   Action required: ${w.action}`).join('\n\n')
      : 'No critical weak areas identified during this audit.'}

--------------------------------------------------------------------------------
6. KEY STRENGTHS
--------------------------------------------------------------------------------
${ai?.strengths?.length > 0 
      ? ai.strengths.map((s, i) => `${i + 1}. ${s.name} (Score: ${s.score}/5)\n   Impact: ${s.why_it_matters}`).join('\n\n')
      : 'The school is currently building foundational practices.'}

--------------------------------------------------------------------------------
7. RECOMMENDATIONS LINKED TO FINDINGS
--------------------------------------------------------------------------------
${report.interventionPlan?.length > 0 
      ? report.interventionPlan.map((step, i) => `Recommendation ${i + 1}: ${step.replace(/^Week \d+: /, '')}`).join('\n')
      : 'Monitor progress and maintain current standard.'}

--------------------------------------------------------------------------------
Compiled by the WCED District e-Learning Team
Innovation | Accountability | Care | Responsiveness`;
      };

      const handleCopyWord = async () => {
        try { await navigator.clipboard.writeText(generateWordReportText()); }
        catch (error) { window.alert("Copy failed. Use the printable report instead."); return; }
        setCopiedWord(true);
        setTimeout(() => setCopiedWord(false), 3000);
      };

      const ml = maturityLevels.find(m => m.label === report.readiness) || maturityLevels[0];

      return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm md:p-8 print:static print:block print:bg-white print:p-0">
          
          <div className="max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-3xl border border-slate-200 bg-white shadow-2xl print:max-h-none print:max-w-none print:overflow-visible print:rounded-none print:border-0 print:shadow-none relative">
            
            {/* Screen Header (Hidden on Print) */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 to-slate-800 p-6 md:p-8 text-white sticky top-0 z-10 no-print">
              <div>
                <div className="mb-2 text-[10px] font-black uppercase tracking-[0.3em] text-blue-400">School Findings Report</div>
                <h3 className="text-2xl md:text-3xl font-black">{report.school}</h3>
                <p className="mt-2 text-xs font-bold uppercase tracking-[0.2em] text-slate-300 flex items-center gap-2">
                  <MapPin size={14}/> {report.circuit} <span className="text-slate-500">|</span> <Calendar size={14}/> {report.date}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={handleCopyWord}
                  className={`flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-bold transition ${copiedWord ? 'bg-green-500 text-white' : 'bg-white/10 hover:bg-white/20'}`}
                  title="Copy cleanly formatted text to paste into MS Word"
                >
                  {copiedWord ? <CheckCircle2 size={18} /> : <FileDown size={18} />}
                  <span className="hidden sm:inline">{copiedWord ? 'Copied to Clipboard!' : 'Copy for MS Word'}</span>
                </button>
                <button
                  onClick={() => {
                    window.alert('For a clean, colorful PDF document, uncheck "Headers and footers" and enable "Background Graphics/Colors" in your browser print settings.');
                    window.print();
                  }}
                  className="flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white px-4 py-3 text-sm font-bold transition shadow-sm"
                  title="Print or Save as Official PDF"
                >
                  <Printer size={18} />
                  <span className="hidden sm:inline">Print Formal Report</span>
                </button>
                <button onClick={() => onEdit(report)} className="rounded-xl bg-white/10 p-3 transition hover:bg-white/20" title="Edit Report">✏️</button>
                <button onClick={onClose} className="rounded-xl bg-white/10 p-3 transition hover:bg-white/20 bg-red-500/20 text-red-200 hover:bg-red-500/40 hover:text-white" title="Close"><X size={20} /></button>
              </div>
            </div>

            {/* This is the container that prints cleanly */}
            <div id="printable-report" className="p-6 md:p-8 print:p-0 bg-white">
                
                {/* --- Formal WCED Letterhead (ONLY VISIBLE ON PRINT) --- */}
                <div className="hidden print:block wced-header">
                   <img src={districtLogo} alt="Eden and Central Karoo Education District" style={{width:92,height:92,objectFit:'contain',float:'right'}}/><h1>Western Cape Education Department</h1>
                   <h2>E-Learning School Findings Report</h2>
                </div>
                
                {/* Print Meta Data & Score */}
                <div className="hidden print:block">
                   <div className={`border-2 ${ml.border} ${ml.light} p-5 text-center w-[250px] float-right ml-6 mb-6 rounded-2xl shadow-sm`}>
                     <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Overall Readiness</div>
                     <div className={`text-4xl font-black ${ml.text}`}>{report.avg} <span className="text-xl opacity-50">/ 5.0</span></div>
                     <div className={`text-sm uppercase font-black mt-2 tracking-widest ${ml.text}`}>{report.readiness}</div>
                   </div>

                   <table className="meta-table">
                     <tbody>
                       <tr><td className="label">TO:</td><td>The Principal, <span className="font-bold text-slate-900">{report.school}</span></td></tr>
                       <tr><td className="label">FROM:</td><td>{report.advisor}, e-Learning Advisor ({report.circuit})</td></tr>
                       <tr><td className="label">DATE:</td><td>{report.date}</td></tr>
                       <tr><td className="label">INTERVIEWEE:</td><td>{report.staff} ({report.designation})</td></tr><tr><td className="label">SOURCE:</td><td>{report.informationSource||'Not specified'}</td></tr>
                     </tbody>
                   </table>
                </div>
                <div className="clear hidden print:block"></div>
                {/* ---------------------------------------------------- */}

                {/* Dashboard-style Screen Meta Blocks (Hidden on Print) */}
                <div className="grid gap-4 md:grid-cols-3 mb-8 no-print">
                  <div className={`rounded-2xl border ${ml.border} ${ml.light} p-6`}>
                    <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Overall Readiness</div>
                    <div className="mt-2 text-3xl font-black text-slate-900">{report.readiness}</div>
                    <div className="mt-1 text-sm font-bold text-slate-600">Score: {report.avg} / 5.0</div>
                  </div>
                  <div className="rounded-2xl border border-slate-100 bg-slate-50 p-6">
                    <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Interview Details</div>
                    <div className="mt-2 text-xl font-black text-slate-900">{report.staff || 'Not captured'}</div>
                    <div className="mt-1 text-sm font-bold text-slate-500">{report.designation || 'No designation'}</div>
                  </div>
                  <div className="rounded-2xl border border-slate-100 bg-slate-50 p-6">
                    <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Report Completion</div>
                    <div className="mt-2 text-xl font-black text-slate-900">{INDICATORS.filter(key=>Number.isInteger(report.scores?.[key])).length}/{scoreBasis(report)} Indicators · {scoreBasis(report)===11?'Legacy basis; Cyberwellness not assessed':'Includes Cyberwellness'}</div>
                    <div className="mt-1 text-sm font-bold text-slate-500">Source: {report.informationSource || 'Not specified'}</div>
                  </div>
                </div>

                {/* Report Content Blocks */}
                
                <div className="rounded-2xl border border-slate-200 p-6 mb-6"><h3 className="section-title">Recorded findings and evidence</h3><p className="text-sm text-slate-600 mb-3">Information source: {report.informationSource||'Not specified'}</p><p className="whitespace-pre-wrap text-sm leading-relaxed">{report.notes||'No additional observations recorded.'}</p></div>
                {report.supportProvided&&<div className="rounded-2xl border border-slate-200 p-6 mb-6"><h3 className="section-title">Support provided</h3><p className="whitespace-pre-wrap text-sm leading-relaxed">{report.supportProvided}</p></div>}
                <ImpactReportEvidence records={impactRecords.filter(r=>r.school===report.school&&r.circuit===report.circuit)} asOf={report.date}/>
                {/* Executive Summary */}
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 mb-6 print:border print:p-6 print:mb-6">
                  <h3 className="section-title print:block hidden mt-0">1. Executive Summary</h3>
                  <h5 className="mb-3 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 no-print">Executive Summary</h5>
                  <div className="text-sm print:text-[11pt] font-medium print:font-semibold leading-relaxed text-slate-700 print:text-slate-800">
                    {report.aiAnalysis?.executive_summary || localCalc?.executive_summary || 'No summary available.'}
                  </div>
                </div>
                <div className="clear hidden print:block"></div>

                {/* Detailed Indicator Ratings */}
                <div className="mb-8 print:mb-6">
                  <h3 className="section-title print:block hidden">2. Detailed Indicator Scores</h3>
                  <h5 className="mb-3 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 no-print flex items-center gap-2"><ClipboardCheck size={14}/> Detailed Indicator Scores</h5>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 print:grid-cols-3 print:gap-4">
                     {monitoringSections.map(section => (
                         <div key={section.id} className="border border-slate-100 bg-white rounded-xl p-4 print:border-slate-200 print:bg-slate-50">
                             <div className="text-[10px] font-black uppercase tracking-widest text-blue-600 mb-3 print:text-slate-600 print:mb-2">{section.title}</div>
                             <ul className="space-y-2 print:space-y-1">
                                 {section.items.map((item, idx) => {
                                     const score = report.scores[item.key];
                                     return (
                                         <li key={item.name} className="flex justify-between items-start gap-2 border-b border-slate-50 pb-1.5 last:border-0 last:pb-0 print:border-slate-200 print:pb-1">
                                             <span className="text-[11px] font-semibold text-slate-600 leading-tight print:text-[10pt] print:text-slate-800">{item.name}</span>
                                             <span className="text-[11px] font-black text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded print:bg-white print:border print:border-slate-200 print:text-[10pt] print:text-black">{score?`${score}/5`:'Not assessed'}</span>
                                         </li>
                                     );
                                 })}
                             </ul>
                         </div>
                     ))}
                  </div>
                </div>

                {/* Section Breakdown Visuals */}
                <div className="mt-8 mb-8 print:mt-6">
                   <h3 className="section-title print:block hidden">3. Category Performance</h3>
                   <h5 className="mb-3 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 no-print flex items-center gap-2"><BarChart3 size={14}/> Section Breakdown</h5>
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-4 print:grid-cols-3">
                     {breakdownData.map((cat, idx) => {
                       const isStrong = cat.status === 'Integrated' || cat.status === 'Transformative';
                       const isWeak = cat.status === 'Emerging';
                       const colorClass = isStrong ? 'text-green-600' : isWeak ? 'text-red-600' : 'text-orange-500';
                       
                       return (
                         <div key={idx} className="border-2 border-slate-100 bg-white shadow-sm rounded-2xl p-5 print:shadow-none print:border-slate-200 print:bg-slate-50">
                           <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">{cat.title}</div>
                           <div className="mt-3 text-3xl font-black text-slate-800 print:text-2xl">{cat.average} <span className="text-sm font-bold text-slate-400">/ 5.0</span></div>
                           <div className={`mt-1 text-xs font-black uppercase tracking-widest ${colorClass}`}>{cat.status}</div>
                         </div>
                       );
                     })}
                   </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2 print:grid-cols-1 print:gap-6 page-break-before">
                   {/* Weak Areas */}
                   <div>
                      <h3 className="section-title print:block hidden">4. Priority Areas (At Risk)</h3>
                      <div className="rounded-2xl border-2 border-red-200 bg-red-50 p-6">
                        <h5 className="mb-4 text-[10px] font-black uppercase tracking-[0.2em] text-red-600 no-print">Priority Areas (At Risk)</h5>
                        {(report.aiAnalysis?.weak_areas || localCalc?.weak_areas || []).length > 0 ? (
                          <ul className="space-y-4 print:space-y-4">
                            {(report.aiAnalysis?.weak_areas || localCalc?.weak_areas).map((w, i) => (
                              <li key={i} className="flex flex-col border-b border-red-100/50 pb-3 print:pb-3 last:border-0 last:pb-0">
                                <span className="text-sm print:text-[11pt] font-black text-red-900">{w.name} (Score: {w.score}/5)</span>
                                <span className="text-xs print:text-[11pt] text-red-800 mt-1 leading-relaxed"><span className="font-black">Problem:</span> {w.problem}</span>
                                <span className="text-xs print:text-[11pt] text-red-700 font-bold mt-1"><span className="font-black">Action Required:</span> {w.action}</span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-sm print:text-[11pt] text-slate-600">No critical weak areas identified.</p>
                        )}
                      </div>
                   </div>

                   {/* Strengths */}
                   <div>
                      <h3 className="section-title print:block hidden">5. Key Strengths</h3>
                      <div className="rounded-2xl border-2 border-green-200 bg-green-50 p-6">
                        <h5 className="mb-4 text-[10px] font-black uppercase tracking-[0.2em] text-green-600 no-print">Key Strengths</h5>
                        {(report.aiAnalysis?.strengths || localCalc?.strengths || []).length > 0 ? (
                          <ul className="space-y-4 print:space-y-4">
                            {(report.aiAnalysis?.strengths || localCalc?.strengths).map((s, i) => (
                              <li key={i} className="flex flex-col border-b border-green-100/50 pb-3 print:pb-3 last:border-0 last:pb-0">
                                <span className="text-sm print:text-[11pt] font-black text-green-900">{s.name} (Score: {s.score}/5)</span>
                                <span className="text-xs print:text-[11pt] text-green-800 mt-1 leading-relaxed"><span className="font-black">Impact:</span> {s.why_it_matters}</span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-sm print:text-[11pt] text-slate-600">No specific mature strengths recorded yet.</p>
                        )}
                      </div>
                   </div>
                </div>

                {/* Intervention Plan */}
                <div className="mt-6 print:mt-8">
                  <h3 className="section-title print:block hidden">6. Recommendations linked to findings</h3>
                  <div className="rounded-2xl border-2 border-blue-200 bg-blue-50 p-6">
                    <h5 className="mb-3 text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 no-print">Recommendations linked to findings</h5>
                    {report.interventionPlan?.length > 0 ? (
                       <ul className="space-y-3 mt-2 print:space-y-3">
                         {report.interventionPlan.map((step, idx) => (
                           <li key={idx} className="text-sm print:text-[11pt] font-medium text-blue-900 flex items-start gap-3">
                             <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-blue-200 text-blue-700 text-xs font-black no-print">{idx + 1}</span> 
                             <span className="hidden print:inline font-black text-blue-800">Recommendation {idx + 1}:</span>
                             <span className="pt-0.5 print:pt-0 leading-relaxed">{step.replace(/^Week \d+: /, '')}</span>
                           </li>
                         ))}
                       </ul>
                    ) : (
                       <p className="text-sm print:text-[11pt] text-slate-500">No intervention plan generated.</p>
                    )}
                  </div>
                </div>

            </div>
          </div>
        </div>
      );
    }

    function App() {
      const [view, setView] = useState('overview');
      const [selectedCircuit, setSelectedCircuit] = useState('');
      const [selectedSchool, setSelectedSchool] = useState('');
      const [scores, setScores] = useState({});
      const [savedReports, setSavedReports] = useState([]);
      const [activeReport, setActiveReport] = useState(null);
      const [editingReportId, setEditingReportId] = useState(null);
      const [isSaving, setIsSaving] = useState(false);
      const isAnalyzing = false;
      const [aiAnalysis, setAiAnalysis] = useState(null);
      
      const todayStr = new Intl.DateTimeFormat('en-CA', {timeZone: 'Africa/Johannesburg', year: 'numeric', month: '2-digit', day: '2-digit'}).format(new Date());
      const [monitoringDate, setMonitoringDate] = useState(todayStr);
      const [personSpeakingTo, setPersonSpeakingTo] = useState('');
      const [designation, setDesignation] = useState('');
      const [selectedAdvisor, setSelectedAdvisor] = useState('E. van der Berg');
      const [auditNotes, setAuditNotes] = useState('');
      const [supportProvided,setSupportProvided] = useState('');
      const [impactRecords,setImpactRecords] = useState([]);
      const [impactError,setImpactError] = useState('');
      const [focusSchools,setFocusSchools]=useState([]),[focusError,setFocusError]=useState('');
      useEffect(()=>{try{const raw=localStorage.getItem(FOCUS_KEY);if(raw)setFocusSchools(validateFocus(JSON.parse(raw)));}catch(e){setFocusError('Stored focus schools could not be read. Existing data has not been overwritten. Restore a valid backup.');}},[]);
      const persistFocus=records=>{try{if(focusError.startsWith('Stored focus'))throw new Error('Restore a valid backup before saving focus schools.');const valid=validateFocus(records);localStorage.setItem(FOCUS_KEY,JSON.stringify(valid));setFocusSchools(valid);setFocusError('');return true;}catch(e){setNotice('Focus schools could not be saved. '+e.message);return false;}};
      const [informationSource,setInformationSource] = useState('Not specified');
      const [draftRecords,setDraftRecords] = useState([]);
      const [draftEditingId,setDraftEditingId] = useState(null);
      const [draftError,setDraftError] = useState('');
      const [interventionPlan, setInterventionPlan] = useState([]);
      const [equipmentRecords,setEquipmentRecords] = useState([]);
      const [equipmentError,setEquipmentError] = useState('');
      const [supportLogs, setSupportLogs] = useState([]);
      const [supportError, setSupportError] = useState('');

      const [storageError, setStorageError] = useState('');
      const [notice, setNotice] = useState('');
      const persistReports = (reports) => {
        if (storageError.startsWith('Stored reports') && !window.confirm('Stored data could not be read. Saving will replace it. Continue only if you have a backup.')) return false;
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
          setSavedReports(reports);
          setStorageError('');
          return true;
        } catch (error) {
          setStorageError('The change could not be saved. Keep this form open, free browser storage and retry. Export a backup of existing reports if needed.');
          return false;
        }
      };
      useEffect(() => {
        try {
          const raw = localStorage.getItem(STORAGE_KEY);
          if (raw) {
            const reports = validateReports(JSON.parse(raw));
            setSavedReports(reports.map((report) => {
              const readiness = calculateReadiness(report.scores);
              const analysis = buildDetailedAnalysis(report.scores, readiness.label, report.school);
              return { ...report, readiness: readiness.label, avg: readiness.score,
                aiAnalysis: analysis, interventionPlan: generateInterventionPlan(analysis) };
            }));
          }
        } catch (error) {
          setStorageError('Stored reports could not be read. Existing storage has not been overwritten. Restore a valid backup or contact support.');
        }
      }, []);
      useEffect(() => {
        try {
          const raw = localStorage.getItem(SUPPORT_KEY);
          if (raw) setSupportLogs(validateSupportLogs(JSON.parse(raw)));
        } catch(error) {setSupportError('Stored support records could not be read. The data has not been overwritten. Restore a valid backup.');}
      }, []);
      useEffect(() => {
        try {const raw=localStorage.getItem(EQUIPMENT_KEY);if(raw)setEquipmentRecords(validateEquipment(JSON.parse(raw)));}
        catch(error){setEquipmentError('Stored equipment records could not be read. Existing data has not been overwritten. Restore a valid backup.');}
      }, []);
      useEffect(()=>{try{const raw=localStorage.getItem(DRAFTS_KEY);if(raw)setDraftRecords(validateDrafts(JSON.parse(raw)));}catch(error){setDraftError('Stored drafts could not be read. They have not been overwritten. Restore a valid backup.');}},[]);
      const persistDrafts=records=>{try{const valid=validateDrafts(records);if(draftError.startsWith('Stored drafts')&&!window.confirm('Saving replaces unreadable draft storage. Continue only with a backup.'))return false;localStorage.setItem(DRAFTS_KEY,JSON.stringify(valid));setDraftRecords(valid);setDraftError('');return true;}catch(error){setDraftError('Draft could not be saved. Keep this page open. '+error.message);return false;}};
      useEffect(()=>{try{const raw=localStorage.getItem(IMPACT_KEY);if(raw)setImpactRecords(validateImpacts(JSON.parse(raw)));}catch(error){setImpactError('Stored impact records could not be read. They have not been overwritten. Restore a valid backup.');}},[]);
      const persistImpacts=(records,advisor)=>{try{
        if(impactError.startsWith('Stored impact')){setNotice('Restore a valid impact backup before saving, to protect unreadable records.');return false;}
        const valid=validateImpacts(records);localStorage.setItem(IMPACT_KEY,JSON.stringify(valid));setImpactRecords(valid);setImpactError('');if(advisor?.trim())setSelectedAdvisor(advisor.trim());return true;
      }catch(error){setImpactError('Impact evidence could not be saved. Keep the form open and retry. '+error.message);return false;}};
      const persistEquipment = records => {
        try {
          const validated=validateEquipment(records);
          if(equipmentError.startsWith('Stored equipment')&&!window.confirm('Saving will replace unreadable equipment data. Continue only if you have a backup.'))return false;
          localStorage.setItem(EQUIPMENT_KEY,JSON.stringify(validated));setEquipmentRecords(validated);setEquipmentError('');return true;
        } catch(error){setEquipmentError('Equipment could not be saved. Keep the form open and retry. '+error.message);return false;}
      };
      const persistSupport = (records) => {
        try {
          const validated = validateSupportLogs(records);
          if (supportError.startsWith('Stored support') && !window.confirm('Saving will replace unreadable support data. Continue only if you have a backup.')) return false;
          localStorage.setItem(SUPPORT_KEY, JSON.stringify(validated));
          setSupportLogs(validated); setSupportError(''); return true;
        } catch(error) {setSupportError('Support could not be saved. Keep the form open and retry. ' + error.message); return false;}
      };
      useEffect(() => {
        setAiAnalysis(null);
        setInterventionPlan([]);
      }, [scores, selectedSchool]);
      const download = (name, content, type) => {
        const url = URL.createObjectURL(new Blob([content], {type}));
        const link = document.createElement('a');
        link.href = url; link.download = name; link.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      };
      const exportBackup = () => download('elearning-backup-' + todayStr + '.json',
        JSON.stringify({version: 6, exportedAt: new Date().toISOString(), reports: savedReports, supportLogs, equipmentRecords, drafts:draftRecords, impactRecords, focusSchools}, null, 2), 'application/json');
      const importBackup = async (event) => {
        const file = event.target.files[0]; event.target.value = '';
        if (!file) return;
        try {
          if (file.size > 10 * 1024 * 1024) throw new Error('Backup exceeds 10 MB.');
          const parsed = JSON.parse(await file.text());
          if (!Array.isArray(parsed) && ![1,2,3,4,5,6].includes(parsed.version)) throw new Error('Unsupported backup version.');
          const incoming = validateReports(Array.isArray(parsed) ? parsed : parsed.reports);
          const incomingSupport = validateSupportLogs(parsed.version >= 2 ? parsed.supportLogs : []);
          const incomingEquipment=validateEquipment(parsed.version>=3?parsed.equipmentRecords:[]);
          const incomingDrafts=validateDrafts(parsed.version>=4?parsed.drafts:[]);
          const incomingFocus=validateFocus(parsed.version>=6?parsed.focusSchools:[]);
          const incomingImpacts=validateImpacts(parsed.version>=5?parsed.impactRecords:[]);
          if (!window.confirm('Merge ' + incoming.length + ' assessments and ' + incomingSupport.length + ' support records and ' + incomingEquipment.length + ' equipment snapshots and ' + incomingDrafts.length + ' drafts and ' + incomingImpacts.length + ' impact records and ' + incomingFocus.length + ' focus schools? Matching report IDs will be replaced; impact observation histories are merged. Export a backup first if needed.')) return;
          const nextReports = mergeReports(savedReports, incoming).map(report => {
            const ready = calculateReadiness(report.scores);
            const analysis = buildDetailedAnalysis(report.scores, ready.label, report.school);
            return {...report, avg: ready.score, readiness: ready.label, aiAnalysis: analysis, interventionPlan: generateInterventionPlan(analysis)};
          });
          const nextSupport = mergeReports(supportLogs, incomingSupport);
          const nextEquipment = [...new Map([...equipmentRecords,...incomingEquipment].map(r=>[r.id,r])).values()];
          const nextDrafts=[...new Map([...draftRecords,...incomingDrafts].map(d=>[d.id,d])).values()];
          const nextImpacts=mergeImpactRecords(impactRecords,incomingImpacts);
          const nextFocus=mergeFocus(focusSchools,incomingFocus);
          writeCollections(localStorage,[[STORAGE_KEY,nextReports],[SUPPORT_KEY,nextSupport],[EQUIPMENT_KEY,nextEquipment],[DRAFTS_KEY,nextDrafts],[IMPACT_KEY,nextImpacts],[FOCUS_KEY,nextFocus]]);
          setSavedReports(nextReports);setSupportLogs(nextSupport);setEquipmentRecords(nextEquipment);setDraftRecords(nextDrafts);setImpactRecords(nextImpacts);setFocusSchools(nextFocus);setFocusError('');setStorageError('');setSupportError('');setEquipmentError('');setDraftError('');setImpactError('');
          setNotice('Backup restored: ' + incoming.length + ' assessments and ' + incomingSupport.length + ' support records, ' + incomingEquipment.length + ' equipment snapshots, ' + incomingDrafts.length + ' drafts, ' + incomingImpacts.length + ' impact records.');
        } catch(error) { setNotice('Import failed: ' + error.message); }
      };

      const totalIndicators = useMemo(
        () => monitoringSections.reduce((sum, section) => sum + section.items.length, 0),
        []
      );

      const filteredSchools = useMemo(
        () => (selectedCircuit ? [...schoolDatabase[selectedCircuit]].sort() : []),
        [selectedCircuit]
      );

      const currentReadiness = calculateReadiness(scores);
      const completedCount = INDICATORS.filter(k=>Number.isInteger(scores[k])&&scores[k]>=1&&scores[k]<=5).length;
      const formComplete = Boolean(
        selectedSchool && validDate(monitoringDate) && monitoringDate<=todayStr && selectedAdvisor.trim() && personSpeakingTo.trim() && designation.trim() && completedCount === totalIndicators && (!supportProvided.trim()||auditNotes.trim())
      );

      const resetForm = () => {
        setSelectedCircuit('');
        setSelectedSchool('');
        setScores({});
        setAiAnalysis(null);
        setPersonSpeakingTo('');
        setDesignation('');
        setMonitoringDate(todayStr);
        setAuditNotes('');
        setSupportProvided('');
        setInformationSource('Not specified');
        setDraftEditingId(null);
        setInterventionPlan([]);
        setEditingReportId(null);
      };

      const loadReportIntoForm = (report) => {
        setSelectedCircuit(report.circuit || '');
        setSelectedSchool(report.school || '');
        setScores(report.scores || {});
        setAiAnalysis(report.aiAnalysis || null);
        setPersonSpeakingTo(report.staff || '');
        setDesignation(report.designation || '');
        setSelectedAdvisor(report.advisor || 'E. van der Berg');
        setMonitoringDate(report.date || todayStr);
        setAuditNotes(report.notes || '');
        setSupportProvided(report.supportProvided||'');
        setInformationSource(report.informationSource||'Not specified');
        setDraftEditingId(null);
        setInterventionPlan(report.interventionPlan || []);
        setEditingReportId(report.id);
        setView('capture');
        setActiveReport(null);
      };

      const deleteReport = (id) => {
        if (window.confirm('Are you sure you want to delete this report?')) {
          const updated = savedReports.filter(r => r.id !== id);
          persistReports(updated);
        }
      };

      const generateAIAnalysis = () => {
        if (!selectedSchool || completedCount !== totalIndicators) return;
        const analysis = buildDetailedAnalysis(scores, currentReadiness.label, selectedSchool);
        setAiAnalysis(analysis);
        setInterventionPlan(generateInterventionPlan(analysis));
      };

      const saveReport = () => {
        if (!formComplete) return;
        if(storageError.startsWith('Stored reports')||draftError.startsWith('Stored drafts')||(supportProvided.trim()&&impactError.startsWith('Stored impact'))){setNotice('Restore a valid backup before finalising, so unreadable records are not replaced.');return;}

        setIsSaving(true);
        const localCalc = buildDetailedAnalysis(scores, currentReadiness.label, selectedSchool);
        
        // Regenerate from the saved scores to prevent stale recommendations.
        const finalAnalysis = localCalc;
        if (!finalAnalysis.category_breakdown) finalAnalysis.category_breakdown = localCalc.category_breakdown;
        
        const generatedIntervention = generateInterventionPlan(finalAnalysis);
        
        const reportPayload = {
          id: editingReportId || crypto.randomUUID(),
          school: selectedSchool,
          circuit: selectedCircuit,
          readiness: currentReadiness.label,
          avg: currentReadiness.score,
          date: monitoringDate,
          updatedAt: new Date().toISOString(),
          advisor: selectedAdvisor,
          staff: personSpeakingTo,
          designation,
          scores: { ...(savedReports.find(r=>r.id===editingReportId)?.scores||{}), ...scores },
          notes: auditNotes,
          supportProvided,
          informationSource,
          aiAnalysis: finalAnalysis,
          interventionPlan: generatedIntervention
        };

        const updatedReports = editingReportId 
          ? savedReports.map(r => r.id === editingReportId ? reportPayload : r)
          : [reportPayload, ...savedReports];

        try {const nextDrafts=draftRecords.filter(d=>d.id!==draftEditingId);const nextImpacts=findingFromReport(reportPayload,impactRecords,new Date().toISOString());const changes=[[STORAGE_KEY,updatedReports],[DRAFTS_KEY,nextDrafts]];if(supportProvided.trim())changes.push([IMPACT_KEY,nextImpacts]);writeCollections(localStorage,changes);setSavedReports(updatedReports);setDraftRecords(nextDrafts);setImpactRecords(nextImpacts);setStorageError('');setDraftError('');setNotice('Final report saved on this device.'+(supportProvided.trim()?' Finding and support added to Action to Impact.':''));}
        catch(error){setStorageError(error.message);setIsSaving(false);return;}

        setTimeout(() => {
          setIsSaving(false);
          resetForm();
          setView('reports');
        }, 500);
      };

      const captureData={circuit:selectedCircuit,school:selectedSchool,date:monitoringDate,staff:personSpeakingTo,designation,advisor:selectedAdvisor,notes:auditNotes,supportProvided,scores,informationSource};
      const changeCapture=(field,value)=>({circuit:setSelectedCircuit,school:setSelectedSchool,date:setMonitoringDate,staff:setPersonSpeakingTo,designation:setDesignation,advisor:setSelectedAdvisor,notes:setAuditNotes,supportProvided:setSupportProvided,scores:setScores,informationSource:setInformationSource}[field]?.(value));
      const [quickEditing,setQuickEditing]=useState([]);
      const [captureMode,setCaptureMode]=useState('full');
      const saveQuickSupport=rows=>{try{if(supportError.startsWith('Stored support')||impactError.startsWith('Stored impact'))throw new Error('Restore unreadable records before recording support.');const nextLogs=validateSupportLogs([...rows,...supportLogs.filter(r=>!rows.some(n=>n.id===r.id))]);let nextImpacts=impactRecords;for(const row of rows.filter(r=>r.circuit!=='District')){const a=row.activity;nextImpacts=findingFromReport({id:'support:'+row.id,school:row.school,circuit:row.circuit,date:row.date,advisor:row.owner,notes:a.need,supportProvided:row.summary,informationSource:'Advisor support record'},nextImpacts,new Date().toISOString());nextImpacts=nextImpacts.map(r=>r.reportId==='support:'+row.id?{...r,baseline:{...r.baseline,intendedChange:a.intendedChange}}:r);}nextImpacts=validateImpacts(nextImpacts);writeCollections(localStorage,[[SUPPORT_KEY,nextLogs],[IMPACT_KEY,nextImpacts]]);setSupportLogs(nextLogs);setImpactRecords(nextImpacts);setSelectedAdvisor(rows[0].owner);return true;}catch(e){setNotice('Support could not be saved. '+e.message);return false;}};
      const beginCapture=(profile)=>{setQuickEditing([]);setCaptureMode('full');resetForm();if(profile){setSelectedCircuit(profile.circuit);setSelectedSchool(profile.school);}setView('capture');};
      const saveDraft=()=>{const id=draftEditingId||crypto.randomUUID();const record={id,reportId:editingReportId,updatedAt:new Date().toISOString(),data:captureData};const next=[record,...draftRecords.filter(d=>d.id!==id)];if(persistDrafts(next)){setDraftEditingId(id);setNotice('Draft saved on this device. It is excluded from final school scores.');}};
      const resumeDraft=d=>{const data=d.data;setSelectedCircuit(data.circuit);setSelectedSchool(data.school);setMonitoringDate(data.date);setPersonSpeakingTo(data.staff);setDesignation(data.designation);setSelectedAdvisor(data.advisor);setAuditNotes(data.notes);setSupportProvided(data.supportProvided||'');setScores(data.scores);setInformationSource(data.informationSource||'Not specified');setDraftEditingId(d.id);setEditingReportId(savedReports.some(r=>r.id===d.reportId)?d.reportId:null);setAiAnalysis(null);setView('capture');};
      const dataTools=<div className="i-data-tools"><div className="i-actions"><button className="i-button" onClick={exportBackup}>Export backup</button><label className="i-button">Restore backup<input aria-label="Restore backup" type="file" accept=".json,application/json" className="sr-only" onChange={importBackup}/></label><button className="i-button" onClick={()=>download('elearning-reports-'+todayStr+'.csv',csvExport(savedReports),'text/csv;charset=utf-8')}>Export assessment CSV</button></div><p className="i-note">Backups include final reports, drafts, equipment, recommendations, impact evidence and focus school pathways. Shared live manager access is not connected.</p></div>;
      return <><PrintStyles/><AppShell page={view} today={todayStr} onNavigate={page=>{if(page==='capture'&&view!=='capture')beginCapture();else setView(page);}}>
        {[storageError,supportError,equipmentError,draftError,impactError,focusError].filter(Boolean).map((error,i)=><p className="i-error" role="alert" key={i}>{error}</p>)}
        {notice&&<p className="i-notice" role="status">{notice}<button aria-label="Dismiss notification" onClick={()=>setNotice('')}>×</button></p>}
        {view==='capture'?<><div className="i-actions capture-choice"><button className="i-button" aria-pressed={captureMode==='full'} onClick={()=>setCaptureMode('full')}>Full school assessment</button><button className="i-button" aria-pressed={captureMode==='quick'} onClick={()=>setCaptureMode('quick')}>Quick support record</button></div>{captureMode==='quick'?<QuickSupport key={quickEditing[0]?.id||'new'} existing={quickEditing} database={schoolDatabase} today={todayStr} advisor={selectedAdvisor} onSave={saveQuickSupport} onExit={()=>setView('overview')}/>:<CaptureFindings key={String(editingReportId||'capture')} data={captureData} onChange={changeCapture} database={schoolDatabase} sections={monitoringSections} ratingScale={ratingScale} onSaveDraft={saveDraft} onFinalise={saveReport} onPreview={generateAIAnalysis} complete={formComplete} isSaving={isSaving} analysis={aiAnalysis} equipment={equipmentRecords} onSaveEquipment={persistEquipment} today={todayStr} isEdit={Boolean(editingReportId)} onExit={()=>setView('overview')}/>}</>:<AdvisorDashboard focusSchools={focusSchools} onSaveFocus={persistFocus} onEditSupport={eventId=>{setQuickEditing(supportLogs.filter(r=>r.activity?.eventId===eventId));setCaptureMode('quick');setView('capture');}} page={view} onNavigate={setView} database={schoolDatabase} reports={savedReports} impacts={impactRecords} onSaveImpacts={persistImpacts} defaultAdvisor={selectedAdvisor} drafts={draftRecords} logs={supportLogs} equipment={equipmentRecords} onSaveEquipment={persistEquipment} onSaveLogs={persistSupport} today={todayStr} download={download} dataTools={dataTools} onNewAudit={beginCapture} onResumeDraft={resumeDraft} onDeleteDraft={id=>{if(window.confirm('Delete this unfinished draft? Final reports are unaffected.'))persistDrafts(draftRecords.filter(d=>d.id!==id));}} onViewReport={setActiveReport} onEditReport={loadReportIntoForm} onDeleteReport={deleteReport}/>}</AppShell><ReportModal report={activeReport} onClose={()=>setActiveReport(null)} onEdit={loadReportIntoForm} totalIndicators={totalIndicators} impactRecords={impactRecords}/></>;
    }

    // Mount the React Application
    const root = createRoot(document.getElementById('root'));
    root.render(<App />);
  
