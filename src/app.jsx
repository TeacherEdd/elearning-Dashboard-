import {EQUIPMENT_KEY,validateEquipment} from './equipment.js';
import AdvisorDashboard from './AdvisorDashboard.jsx';
import { SUPPORT_KEY, validateSupportLogs } from './advisor.js';
import './styles.css';
import { calculateReadiness, validateReports, mergeReports, csvExport } from './core.js';

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
          { name: 'Connectivity Quality', desc: 'Reliability and speed of internet access.' },
          { name: 'Physical Security', desc: 'Security of ICT assets and storage.' },
          { name: 'Technical Maintenance', desc: 'Device upkeep and repairs.' },
        ],
      },
      {
        id: 'culture',
        title: 'e-Culture & Change Management',
        icon: Users,
        items: [
          { name: 'ICT Policy & Integration', desc: 'Use of a practical digital plan.' },
          { name: 'Leadership Drive', desc: 'SMT involvement in digital transformation.' },
          { name: 'Formal Training Intake', desc: 'Staff participation in formal ICT and e-learning training opportunities.' },
          { name: 'Informal Support Culture', desc: 'Evidence of peer-to-peer support, mentoring and teacher collaboration around ICT.' },
        ],
      },
      {
        id: 'teaching',
        title: 'e-Teaching & Training',
        icon: BookOpen,
        items: [
          { name: 'ePortal/Teletuks Use', desc: 'Use of digital curriculum resources.' },
          { name: 'LMS Usage at School', desc: 'Use of school-based learning management systems or digital platforms to support teaching and learning.' },
          { name: 'Pedagogical Shift', desc: 'Evidence that teaching practices are changing meaningfully through technology.' },
          { name: 'Teacher Content Creation', desc: 'Teachers creating their own digital teaching and learning resources.' },
          { name: 'Learner Digital Literacy', desc: 'Learners are able to use digital tools confidently and appropriately for learning.' },
        ],
      },
    ];

    const maturityLevels = [
      { label: 'EMERGING', color: 'bg-red-500', text: 'text-red-700', light: 'bg-red-50', border: 'border-red-200' },
      { label: 'ESTABLISHING', color: 'bg-orange-500', text: 'text-orange-700', light: 'bg-orange-50', border: 'border-orange-200' },
      { label: 'INTEGRATED', color: 'bg-blue-500', text: 'text-blue-700', light: 'bg-blue-50', border: 'border-blue-200' },
      { label: 'TRANSFORMATIVE', color: 'bg-green-500', text: 'text-green-700', light: 'bg-green-50', border: 'border-green-200' },
    ];

    const indicatorGuidance = {
      'Connectivity Quality': { problem: 'Internet reliability is limiting classroom use of digital tools.', action: 'Test coverage in all teaching spaces and monitor uptime weekly.', advisor: 'Support the school with a connectivity review and escalation plan.', school: 'Keep a simple fault log and follow up unresolved issues.' },
      'Physical Security': { problem: 'ICT equipment may be vulnerable because storage and access control need strengthening.', action: 'Review lockable storage and sign-out routines for devices.', advisor: 'Guide the school on minimum ICT protection measures.', school: 'Use clear storage and accountability routines.' },
      'Technical Maintenance': { problem: 'Repairs and upkeep are slowing down effective use of devices.', action: 'Introduce a maintenance register with dates and turnaround tracking.', advisor: 'Help the school set up a simple support workflow.', school: 'Assign a staff member to record and follow up faults.' },
      'ICT Policy & Integration': { problem: 'Digital integration is not yet guided by a clear school routine.', action: 'Develop a short practical ICT plan with priorities and roles.', advisor: 'Support leadership to align policy with implementation.', school: 'Review the ICT plan termly.' },
      'Leadership Drive': { problem: 'Leadership support for digital transformation needs to be more visible and consistent.', action: 'Place ICT progress on the SMT agenda and track actions monthly.', advisor: 'Coach the SMT on digital change management.', school: 'Assign clear leadership roles for ICT adoption.' },
      'Formal Training Intake': { problem: 'Teachers are not yet accessing enough formal ICT and e-learning training opportunities.', action: 'Create a simple training participation plan and monitor attendance each term.', advisor: 'Share relevant formal training opportunities and support uptake.', school: 'Track teacher attendance and encourage wider participation in formal development.' },
      'Informal Support Culture': { problem: 'Teachers are not consistently supporting one another through peer mentoring and practical ICT sharing.', action: 'Build simple peer-support routines such as demonstrations, staff sharing slots and teacher buddy systems.', advisor: 'Model low-pressure informal support practices that can be sustained internally.', school: 'Create regular opportunities for teachers to share ideas and help one another with digital teaching practices.' },
      'ePortal/Teletuks Use': { problem: 'Digital platforms are not yet being used consistently to support learning.', action: 'Pilot stronger use in two subjects with weekly targets.', advisor: 'Provide hands-on support with lesson integration.', school: 'Track teacher usage and celebrate small wins.' },
      'LMS Usage at School': { problem: 'The school is not yet using a learning management system consistently to support teaching, communication and learner access.', action: 'Identify one main platform and build a simple whole-school usage routine.', advisor: 'Support the school with practical LMS onboarding and use cases.', school: 'Encourage staff to use the LMS for class resources, communication and structured learning tasks.' },
      'Pedagogical Shift': { problem: 'Technology is not yet changing teaching practice in a meaningful and learner-centred way.', action: 'Support teachers to move from substitution to more interactive and transformative use of ICT.', advisor: 'Model practical examples of stronger pedagogy through technology.', school: 'Encourage classroom strategies where learners engage, create and collaborate using digital tools.' },
      'Teacher Content Creation': { problem: 'Teachers are relying mostly on existing material instead of creating contextual digital resources.', action: 'Train staff to create simple presentations, quizzes and CAPS-linked materials.', advisor: 'Facilitate practical content-creation workshops.', school: 'Build a shared folder of teacher-created content.' },
      'Learner Digital Literacy': { problem: 'Learners are not yet confident and independent in using digital tools for learning.', action: 'Introduce structured opportunities for learners to practise digital skills during normal teaching.', advisor: 'Support teachers with strategies to integrate learner digital skill development into lessons.', school: 'Create regular learner activities that build navigation, responsible use and digital confidence.' },
    };

    function buildDetailedAnalysis(scoreMap, readinessLabel, schoolName) {
      const entries = monitoringSections.flatMap((section) =>
        section.items.map((item, idx) => ({
          key: `${section.id}-${idx}`,
          name: item.name,
          section: section.title,
          score: scoreMap[`${section.id}-${idx}`] ?? null,
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
              : item.name === 'LMS Usage at School' || item.name === 'Teacher Content Creation' || item.name === 'Learner Digital Literacy'
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
          score: scoreMap[`${section.id}-${idx}`] ?? 0,
        }));
        const sectionAverage = sectionEntries.length 
            ? sectionEntries.reduce((sum, item) => sum + item.score, 0) / sectionEntries.length 
            : 0;
        return {
          title: section.title,
          average: sectionAverage.toFixed(1),
          status:
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

    function generateInterventionPlan(analysis) {
      const main = analysis?.weak_areas?.[0];
      if (!main) {
        return [
          'Week 1: Monitor strong practices already in place.',
          'Week 2: Share effective classroom examples with staff.',
          'Week 3: Track consistency across departments.',
          'Week 4: Provide light-touch coaching where needed.',
          'Week 5: Review evidence of sustained implementation.',
          'Week 6: Consolidate strengths into whole-school routines.',
        ];
      }
      return [
        `Week 1: Conduct focused support on ${main.name}.`,
        `Week 2: Support teachers or leaders in applying improvements linked to ${main.name}.`,
        'Week 3: Monitor implementation in practice and gather evidence.',
        'Week 4: Provide feedback, coaching and corrective support.',
        'Week 5: Strengthen consistency across staff and systems.',
        'Week 6: Review progress and refine the school improvement strategy.',
      ];
    }

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

    function ReportModal({ report, onClose, onEdit, totalIndicators }) {
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
            sec.items.map((item, idx) => `  - ${item.name}: ${report.scores[`${sec.id}-${idx}`] || 0}/5`).join('\n');
        }).join('\n\n');

        return `WESTERN CAPE EDUCATION DEPARTMENT (WCED)
E-LEARNING SUPPORT AUDIT MEMORANDUM
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
7. RECOMMENDED 6-WEEK INTERVENTION PLAN
--------------------------------------------------------------------------------
${report.interventionPlan?.length > 0 
      ? report.interventionPlan.map((step, i) => `Week ${i + 1}: ${step.replace(/^Week \d+: /, '')}`).join('\n')
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
                <div className="mb-2 text-[10px] font-black uppercase tracking-[0.3em] text-blue-400">Support Audit Report</div>
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
                   <h1>Western Cape Education Department</h1>
                   <h2>E-Learning Support Audit Memorandum</h2>
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
                       <tr><td className="label">INTERVIEWEE:</td><td>{report.staff} ({report.designation})</td></tr>
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
                    <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Audit Completion</div>
                    <div className="mt-2 text-xl font-black text-slate-900">{Object.keys(report.scores || {}).length}/{totalIndicators} Indicators</div>
                    <div className="mt-1 text-sm font-bold text-slate-500">Evaluated on site</div>
                  </div>
                </div>

                {/* Report Content Blocks */}
                
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
                                     const score = report.scores[`${section.id}-${idx}`] || 0;
                                     return (
                                         <li key={item.name} className="flex justify-between items-start gap-2 border-b border-slate-50 pb-1.5 last:border-0 last:pb-0 print:border-slate-200 print:pb-1">
                                             <span className="text-[11px] font-semibold text-slate-600 leading-tight print:text-[10pt] print:text-slate-800">{item.name}</span>
                                             <span className="text-[11px] font-black text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded print:bg-white print:border print:border-slate-200 print:text-[10pt] print:text-black">{score}/5</span>
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
                  <h3 className="section-title print:block hidden">6. Recommended 6-Week Intervention Plan</h3>
                  <div className="rounded-2xl border-2 border-blue-200 bg-blue-50 p-6">
                    <h5 className="mb-3 text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 no-print">Recommended 6-Week Intervention Plan</h5>
                    {report.interventionPlan?.length > 0 ? (
                       <ul className="space-y-3 mt-2 print:space-y-3">
                         {report.interventionPlan.map((step, idx) => (
                           <li key={idx} className="text-sm print:text-[11pt] font-medium text-blue-900 flex items-start gap-3">
                             <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-blue-200 text-blue-700 text-xs font-black no-print">{idx + 1}</span> 
                             <span className="hidden print:inline font-black text-blue-800">Week {idx + 1}:</span>
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
      const [view, setView] = useState('dashboard');
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
        JSON.stringify({version: 3, exportedAt: new Date().toISOString(), reports: savedReports, supportLogs, equipmentRecords}, null, 2), 'application/json');
      const importBackup = async (event) => {
        const file = event.target.files[0]; event.target.value = '';
        if (!file) return;
        try {
          if (file.size > 10 * 1024 * 1024) throw new Error('Backup exceeds 10 MB.');
          const parsed = JSON.parse(await file.text());
          if (!Array.isArray(parsed) && ![1,2,3].includes(parsed.version)) throw new Error('Unsupported backup version.');
          const incoming = validateReports(Array.isArray(parsed) ? parsed : parsed.reports);
          const incomingSupport = validateSupportLogs(parsed.version >= 2 ? parsed.supportLogs : []);
          const incomingEquipment=validateEquipment(parsed.version===3?parsed.equipmentRecords:[]);
          if (!window.confirm('Merge ' + incoming.length + ' assessments and ' + incomingSupport.length + ' support records and ' + incomingEquipment.length + ' equipment snapshots? Matching IDs will be replaced. Export a backup first if needed.')) return;
          const nextReports = mergeReports(savedReports, incoming).map(report => {
            const ready = calculateReadiness(report.scores);
            const analysis = buildDetailedAnalysis(report.scores, ready.label, report.school);
            return {...report, avg: ready.score, readiness: ready.label, aiAnalysis: analysis, interventionPlan: generateInterventionPlan(analysis)};
          });
          const nextSupport = mergeReports(supportLogs, incomingSupport);
          const nextEquipment = [...new Map([...equipmentRecords,...incomingEquipment].map(r=>[r.id,r])).values()];
          const oldReports = localStorage.getItem(STORAGE_KEY), oldSupport = localStorage.getItem(SUPPORT_KEY),oldEquipment=localStorage.getItem(EQUIPMENT_KEY);
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(nextReports));
            localStorage.setItem(SUPPORT_KEY, JSON.stringify(nextSupport));
            localStorage.setItem(EQUIPMENT_KEY, JSON.stringify(nextEquipment));
          } catch(error) {
            try {
              if(oldReports===null) localStorage.removeItem(STORAGE_KEY); else localStorage.setItem(STORAGE_KEY, oldReports);
              if(oldSupport===null) localStorage.removeItem(SUPPORT_KEY); else localStorage.setItem(SUPPORT_KEY, oldSupport);
              if(oldEquipment===null) localStorage.removeItem(EQUIPMENT_KEY); else localStorage.setItem(EQUIPMENT_KEY, oldEquipment);
            } catch(rollbackError) {setStorageError('Restore failed and storage could not be rolled back. Export a backup of the current in-memory records before closing.');}
            throw error;
          }
          setSavedReports(nextReports);setSupportLogs(nextSupport);setEquipmentRecords(nextEquipment);setStorageError('');setSupportError('');setEquipmentError('');
          setNotice('Backup restored: ' + incoming.length + ' assessments and ' + incomingSupport.length + ' support records, ' + incomingEquipment.length + ' equipment snapshots.');
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
      const completedCount = Object.keys(scores).length;
      const formComplete = Boolean(
        selectedSchool && monitoringDate && selectedAdvisor.trim() && personSpeakingTo.trim() && designation.trim() && completedCount === totalIndicators
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
        setInterventionPlan(report.interventionPlan || []);
        setEditingReportId(report.id);
        setView('form');
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
          scores: { ...scores },
          notes: auditNotes,
          aiAnalysis: finalAnalysis,
          interventionPlan: generatedIntervention
        };

        const updatedReports = editingReportId 
          ? savedReports.map(r => r.id === editingReportId ? reportPayload : r)
          : [reportPayload, ...savedReports];

        if (!persistReports(updatedReports)) { setIsSaving(false); return; }

        setTimeout(() => {
          setIsSaving(false);
          resetForm();
          setView('dashboard');
        }, 500);
      };

      return (
        <>
          <PrintStyles />
          {/* Hide the main app wrapper when printing to guarantee zero dashboard bleed */}
          <div id="app-main-wrapper" className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-20 print:hidden">
            
            {/* Navigation Bar */}
            <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                  <div className="flex items-center gap-3">
                    <div className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white p-2.5 rounded-xl shadow-sm">
                      <BrainCircuit size={24} />
                    </div>
                    <div>
                      <h1 className="text-xl font-black text-slate-800 tracking-tight leading-none">Elearning Monitor</h1>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Eden & Central Karoo</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => { resetForm(); setView('dashboard'); }}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition shadow-sm ${view === 'dashboard' ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                    >
                      <LayoutDashboard size={18} />
                      <span className="hidden sm:inline">Dashboard</span>
                    </button>
                    <button
                      onClick={() => { resetForm(); setView('form'); }}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition shadow-sm ${view === 'form' ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-100'}`}
                    >
                      <PlusCircle size={18} />
                      <span className="hidden sm:inline">New Audit</span>
                    </button>
                  </div>
                </div>
              </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <aside className="mb-6 rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900 space-y-3">
                <p><strong>Device storage:</strong> Assessments, equipment and support records stay in this browser. Export a backup to transfer them or protect against data loss. Your manager does not have live access; use the Management summary to export a dated report. Recommendations use built-in rules; no AI service is connected.</p>
                <div className="flex flex-wrap gap-3">
                  <button onClick={exportBackup} className="rounded-lg bg-white border border-blue-200 px-4 py-2 font-bold">Export backup</button>
                  <label className="rounded-lg bg-white border border-blue-200 px-4 py-2 font-bold cursor-pointer">Restore backup<input aria-label="Restore backup" type="file" accept=".json,application/json" className="hidden" onChange={importBackup}/></label>
                  <button onClick={() => download('elearning-reports-' + todayStr + '.csv', csvExport(savedReports), 'text/csv;charset=utf-8')} className="rounded-lg bg-white border border-blue-200 px-4 py-2 font-bold">Export assessment CSV</button>
                </div>
              </aside>
              {equipmentError && <p role="alert" className="mb-4 rounded-xl bg-red-50 border border-red-300 p-4 text-red-800">{equipmentError}</p>}
              {supportError && <p role="alert" className="mb-4 rounded-xl bg-red-50 border border-red-300 p-4 text-red-800">{supportError}</p>}
              {storageError && <p role="alert" className="mb-4 rounded-xl bg-red-50 border border-red-300 p-4 text-red-800">{storageError}</p>}
              {notice && <p role="status" className="mb-4 rounded-xl bg-slate-100 p-4">{notice}</p>}

              
              {/* VIEW: FORM */}
              {view === 'form' && (
                <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  
                  <div className="text-center space-y-2 mb-8">
                    <h2 className="text-3xl font-black text-slate-900">
                      {editingReportId ? 'Edit Support Audit' : 'New School Support Audit'}
                    </h2>
                    <p className="text-slate-500 font-medium">Evaluate e-Learning integration and generate recommendations from your indicator scores.</p>
                  </div>

                  {/* School Info Section */}
                  <div className="bg-white p-6 md:p-8 rounded-[2rem] shadow-sm border border-slate-200 space-y-6">
                    <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-4">
                      <div className="bg-blue-100 p-2 rounded-lg text-blue-600"><School size={20} /></div>
                      <h3 className="text-lg font-black uppercase tracking-widest text-slate-800">School Details</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-2">Education Circuit</label>
                        <select
                          value={selectedCircuit}
                          onChange={(e) => { setSelectedCircuit(e.target.value); setSelectedSchool(''); }}
                          className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-sm font-bold text-slate-700 outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50 transition"
                        >
                          <option value="">Select Circuit...</option>
                          {Object.keys(schoolDatabase).map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-2">School Name</label>
                        <select
                          value={selectedSchool}
                          onChange={(e) => setSelectedSchool(e.target.value)}
                          disabled={!selectedCircuit}
                          className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-sm font-bold text-slate-700 outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50 transition disabled:opacity-50"
                        >
                          <option value="">Select School...</option>
                          {filteredSchools.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-2">Monitoring Date</label>
                        <div className="relative">
                          <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                          <input
                            type="date"
                            value={monitoringDate}
                            onChange={(e) => setMonitoringDate(e.target.value)}
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3.5 pl-11 text-sm font-bold text-slate-700 outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50 transition"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-2">e-Learning Advisor</label>
                        <div className="relative">
                          <UserCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                          <input
                            type="text"
                            value={selectedAdvisor}
                            onChange={(e) => setSelectedAdvisor(e.target.value)}
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3.5 pl-11 text-sm font-bold text-slate-700 outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50 transition"
                            placeholder="Advisor Name"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-2">Staff Interviewed</label>
                        <input
                          type="text"
                          value={personSpeakingTo}
                          onChange={(e) => setPersonSpeakingTo(e.target.value)}
                          className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-sm font-bold text-slate-700 outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50 transition"
                          placeholder="e.g. Mr. S. Jacobs"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-2">Designation / Role</label>
                        <input
                          type="text"
                          value={designation}
                          onChange={(e) => setDesignation(e.target.value)}
                          className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-sm font-bold text-slate-700 outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50 transition"
                          placeholder="e.g. ICT Coordinator"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Assessment Indicators */}
                  <div className="space-y-6">
                    {monitoringSections.map((section) => (
                      <div key={section.id} className="bg-white p-6 md:p-8 rounded-[2rem] shadow-sm border border-slate-200 space-y-6">
                        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                          <div className="bg-blue-100 p-2 rounded-lg text-blue-600"><section.icon size={20} /></div>
                          <h3 className="text-lg font-black uppercase tracking-widest text-slate-800">{section.title}</h3>
                        </div>

                        <div className="space-y-8">
                          {section.items.map((item, idx) => {
                            const key = `${section.id}-${idx}`;
                            return (
                              <div key={key} className="space-y-3">
                                <div>
                                  <h4 className="text-sm font-black text-slate-800">{item.name}</h4>
                                  <p className="text-xs font-medium text-slate-500 mt-1">{item.desc}</p>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                  {[1, 2, 3, 4, 5].map((val) => (
                                    <button
                                      key={val}
                                      onClick={() => setScores(prev => ({ ...prev, [key]: val }))}
                                      className={`flex-1 min-w-[40px] md:min-w-[60px] py-3 px-2 rounded-xl text-xs font-bold transition-all border
                                        ${scores[key] === val 
                                          ? 'bg-blue-600 text-white border-blue-600 shadow-md scale-[1.02]' 
                                          : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50 hover:border-slate-300'}`}
                                      title={ratingScale[val]}
                                    >
                                      {val}
                                    </button>
                                  ))}
                                </div>
                                {scores[key] && (
                                  <div className="text-[10px] font-bold text-blue-600 bg-blue-50 inline-block px-2.5 py-1 rounded-md border border-blue-100">
                                    Selected: {ratingScale[scores[key]]}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Additional Notes */}
                  <div className="bg-white p-6 md:p-8 rounded-[2rem] shadow-sm border border-slate-200">
                    <label className="flex items-center gap-3 text-lg font-black uppercase tracking-widest text-slate-800 border-b border-slate-100 pb-4 mb-4">
                      <div className="bg-blue-100 p-2 rounded-lg text-blue-600"><FileText size={20} /></div>
                      General Notes
                    </label>
                    <textarea
                      value={auditNotes}
                      onChange={(e) => setAuditNotes(e.target.value)}
                      className="w-full h-32 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm font-medium text-slate-700 outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50 transition resize-none"
                      placeholder="Any additional observations about the school's e-learning context..."
                    ></textarea>
                  </div>

                  {/* Progress & Actions */}
                  <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-6 md:p-8 rounded-[2rem] shadow-xl text-white space-y-6 mt-8 border border-slate-700">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                      <div className="text-center md:text-left">
                        <div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400">Readiness Score</div>
                        <div className="text-3xl font-black flex items-baseline gap-2">
                          {currentReadiness.score} <span className="text-lg text-slate-400 font-bold">/ 5.0</span>
                        </div>
                        <div className={`mt-1 text-[11px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded inline-block ${
                          currentReadiness.label === 'EMERGING' ? 'bg-red-500/20 text-red-300' :
                          currentReadiness.label === 'ESTABLISHING' ? 'bg-orange-500/20 text-orange-300' :
                          currentReadiness.label === 'INTEGRATED' ? 'bg-blue-500/20 text-blue-300' :
                          currentReadiness.label === 'TRANSFORMATIVE' ? 'bg-green-500/20 text-green-300' : 'bg-slate-700 text-slate-400'
                        }`}>
                          {currentReadiness.label}
                        </div>
                      </div>

                      <div className="text-center md:text-right bg-white/5 p-4 rounded-xl border border-white/10">
                         <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Completion</div>
                         <div className="text-xl font-bold">{completedCount} <span className="text-sm text-slate-500">/ {totalIndicators}</span></div>
                      </div>
                    </div>

                    {aiAnalysis && (
                      <div className="bg-white rounded-2xl p-6 md:p-8 space-y-6 text-slate-800 shadow-inner mt-6 border border-slate-200 animate-in fade-in zoom-in duration-300">
                        <div className="border-b border-slate-200 pb-4 mb-4">
                          <h4 className="text-lg font-black text-slate-900 flex items-center gap-2">
                            <Sparkles className="text-blue-600" size={20} /> Report Preview
                          </h4>
                          <p className="text-sm text-slate-500 mt-1">Review these rules-based recommendations before saving on this device.</p>
                        </div>
                        
                        <div>
                          <h5 className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-2">Executive Summary</h5>
                          <p className="text-sm font-medium leading-relaxed">{aiAnalysis.executive_summary}</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                             <h5 className="text-[11px] font-black uppercase tracking-widest text-red-500 mb-2 flex items-center gap-1"><AlertTriangle size={14}/> Primary Challenge</h5>
                             <p className="text-sm font-medium leading-relaxed">{aiAnalysis.main_problem}</p>
                          </div>
                          <div>
                             <h5 className="text-[11px] font-black uppercase tracking-widest text-green-600 mb-2 flex items-center gap-1"><Award size={14}/> Key Strength</h5>
                             <p className="text-sm font-medium leading-relaxed">{aiAnalysis.strengths[0]?.name || "Establishing foundational practices."}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-white/10">
                      <button
                        onClick={generateAIAnalysis}
                        disabled={isAnalyzing || completedCount !== totalIndicators}
                        className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 disabled:border-slate-700 text-white font-bold py-4 px-6 rounded-xl transition shadow-md border border-indigo-500 w-full"
                      >
                        {isAnalyzing ? <Loader2 size={20} className="animate-spin" /> : <Sparkles size={20} />}
                        {isAnalyzing ? 'Analyzing Data...' : '✨ Generate Detailed Report'}
                      </button>
                      <button
                        onClick={saveReport}
                        disabled={isSaving || !formComplete}
                        className="flex items-center justify-center gap-2 bg-white hover:bg-slate-100 disabled:bg-slate-800 disabled:text-slate-500 disabled:border-slate-700 text-slate-900 font-bold py-4 px-6 rounded-xl transition shadow-md w-full"
                      >
                        {isSaving ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
                        {isSaving ? 'Saving...' : 'Save Audit to District'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {view === 'dashboard' && <AdvisorDashboard database={schoolDatabase} reports={savedReports} logs={supportLogs} equipment={equipmentRecords} onSaveEquipment={persistEquipment} onSaveLogs={persistSupport} today={todayStr} download={download}
                onNewAudit={(profile) => {resetForm(); if(profile){setSelectedCircuit(profile.circuit);setSelectedSchool(profile.school);} setView('form');}}
                onViewReport={setActiveReport} onEditReport={loadReportIntoForm} onDeleteReport={deleteReport}/>}
            </main>
          </div>
          
          {/* Report Modal renders completely standalone so printing hides the dashboard */}
          <ReportModal report={activeReport} onClose={() => setActiveReport(null)} onEdit={loadReportIntoForm} totalIndicators={totalIndicators} />
        </>
      );
    }

    // Mount the React Application
    const root = createRoot(document.getElementById('root'));
    root.render(<App />);
  