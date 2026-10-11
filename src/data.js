/* Business AI Stack Practice Lab — content and scoring engine.
   Source: IITM EGAIBA Sync Deck, Week 2 "From Using AI to Choosing & Controlling AI"
   (The Business AI Stack, use layer part 1: the five core categories). */

const CAT_ORDER = ["chat", "search", "auto", "analytics", "agent"];

const CATS = {
  chat: {
    n: 1, name: "Chat Interfaces", short: "Chat",
    tag: "Q&A, drafting, ideation",
    examples: "Claude, ChatGPT, Gemini",
    use: "You need a fast first draft, an explanation or fresh ideas.",
    strengths: "Fast, flexible, low setup and low cost.",
    watch: "Lower control and variable outputs. Not grounded in your documents by default.",
    role: "Chat is the drafting and explaining layer: quick, flexible output for people to review."
  },
  search: {
    n: 2, name: "Search & Knowledge", short: "Search",
    tag: "Policy lookup, document Q&A",
    examples: "Claude Projects, Glean, NotebookLM",
    use: "Accuracy matters and answers must come from verified documents.",
    strengths: "Reliable and grounded, with sources people can check.",
    watch: "Moderate setup: someone must curate and own the documents.",
    role: "Search & Knowledge grounds the answer in verified documents, so accuracy can be checked."
  },
  auto: {
    n: 3, name: "Automation Platforms", short: "Automation",
    tag: "Workflow orchestration",
    examples: "Claude scheduled tasks, Zapier, n8n",
    use: "The task repeats and follows clear, rule-based steps.",
    strengths: "Scalable, consistent and easy to audit.",
    watch: "Less creative and can be rigid when the steps change.",
    role: "Automation runs the repeatable, rule-based steps the same way every time."
  },
  analytics: {
    n: 4, name: "Analytics & Insights", short: "Analytics",
    tag: "Pattern detection, summaries",
    examples: "Claude, Power BI Copilot, Julius",
    use: "You need trends, patterns or summaries from data, not just text.",
    strengths: "Turns data into evidence for decisions.",
    watch: "Only as good as the data. Needs clean, accessible data sources.",
    role: "Analytics detects the patterns and trends in the data."
  },
  agent: {
    n: 5, name: "Agent Frameworks", short: "Agent",
    tag: "Multi-step task execution",
    examples: "Claude Agent SDK, LangGraph, CrewAI",
    use: "The work needs planning and execution across several systems.",
    strengths: "Powerful for complex, changing, multi-step work.",
    watch: "Highest governance needs: permissions, logging and human checkpoints.",
    role: "An Agent framework plans and carries out the multi-step work across systems."
  }
};

const INDUSTRIES = [
  "Advertising/Marketing/PR", "Banking", "Biotechnology/Pharmaceuticals", "Construction", "Consulting",
  "Consumer Products/Retail", "Education", "Energy/Utilities", "Engineering", "Entertainment/Hospitality/Leisure",
  "Financial Services", "Insurance", "IT/Computers", "Law", "Manufacturing", "Media/Publishing",
  "Professional Services", "Technology/Telecom", "Other"
];
const PRACTICE_INDUSTRIES = INDUSTRIES.slice(0, -1).concat(["Healthcare", "Logistics", "Other"]);
const EXPERIENCE = ["<5 Years", "5-9 Years", "10-14 Years", "15-19 Years", "20+ Years", "unknown"];

/* req = categories the task needs; opt = allowed extras with no penalty; best = the recommended stack
   (defaults to req); gate = who must approve (empty when light review is enough). */
const CASES = [
  // Cross-industry examples from the session deck
  { id: "hr-policy", ind: "Other", fn: "HR", lvl: 1, deck: true,
    title: "HR policy questions",
    text: "Employees keep asking HR about leave, travel and benefits rules. You want them to get correct answers from the current policy documents.",
    req: ["search"], opt: ["chat"], best: ["search", "chat"],
    gate: "HR approves the policy library, and answers show their source",
    sys: "Search over the verified HR policy library, with Chat to phrase answers. Show sources, and have HR approve the content." },
  { id: "sales-weekly", ind: "Other", fn: "Sales & Marketing", lvl: 1, deck: true,
    title: "Weekly sales report generation",
    text: "Every Monday a sales analyst pulls last week's numbers, fills the same template and writes a short commentary for leadership.",
    req: ["auto", "chat"], opt: [],
    gate: "",
    sys: "Automation pulls the data and fills the template on schedule. Chat drafts the commentary for a quick human read." },
  { id: "market-trends", ind: "Other", fn: "Sales & Marketing", lvl: 1, deck: true,
    title: "Market trend analysis",
    text: "Leadership wants to know which product segments are growing, using sales data and published market research reports.",
    req: ["analytics", "search"], opt: ["chat"],
    gate: "",
    sys: "Analytics finds the trends in your data. Search grounds them in trusted market reports." },
  { id: "supplier-onboarding", ind: "Other", fn: "Operations", lvl: 2, deck: true,
    title: "Supplier onboarding",
    text: "Onboarding a supplier means collecting documents, checking them, creating records in procurement and finance systems and chasing missing items.",
    req: ["agent"], opt: ["search", "auto", "chat"],
    gate: "Legal and Operations approve each new supplier",
    sys: "An Agent coordinates the steps across systems, with human review and Legal and Operations approval before activation." },
  { id: "budget-variance", ind: "Other", fn: "Finance", lvl: 2, deck: true,
    title: "Budget variance explanations",
    text: "Each month, finance must explain why departments are over or under budget, line by line, for the leadership pack.",
    req: ["analytics", "chat"], opt: ["search"],
    gate: "Manager sign-off with an audit trail",
    sys: "Analytics finds the drivers of each variance. Chat drafts the explanations. A manager signs off, and every step is logged for audit." },
  { id: "hr-jd", ind: "Other", fn: "HR", lvl: 1,
    title: "Drafting job descriptions",
    text: "Hiring managers want a first draft of a job description from a few bullet points about the role.",
    req: ["chat"], opt: [],
    gate: "Hiring manager reviews for accuracy and inclusive language",
    sys: "Chat drafts the description. The hiring manager edits and approves it." },
  { id: "hr-attrition", ind: "Other", fn: "HR", lvl: 2,
    title: "Understanding attrition drivers",
    text: "HR leadership wants to understand which factors (tenure, team, pay band, manager changes) are linked to people leaving.",
    req: ["analytics"], opt: ["chat"],
    gate: "HR leadership reviews findings. No decisions about individuals are automated",
    sys: "Analytics finds the patterns in HR data, and Chat can summarise them. People decide what action to take." },
  { id: "cs-complaints", ind: "Other", fn: "Customer Service", lvl: 1,
    title: "Replying to long complaint emails",
    text: "Service agents spend time reading long complaint emails and writing polite, clear replies.",
    req: ["chat"], opt: [],
    gate: "The agent reviews every reply before sending",
    sys: "Chat summarises the complaint and drafts a reply. The service agent checks and sends it." },
  { id: "ops-employee-onboarding", ind: "Other", fn: "Operations", lvl: 2,
    title: "New employee onboarding tasks",
    text: "For every new joiner, the same steps run: create accounts, assign mandatory training, order a laptop and book induction.",
    req: ["auto"], opt: ["chat"],
    gate: "",
    sys: "Automation runs the same checklist for every joiner. The steps are fixed, so an Agent isn't needed." },

  // Advertising/Marketing/PR
  { id: "adv-taglines", ind: "Advertising/Marketing/PR", fn: "Sales & Marketing", lvl: 1,
    title: "Campaign taglines and a press release draft",
    text: "The team needs ten tagline ideas and a first-draft press release for a product launch by this afternoon.",
    req: ["chat"], opt: [],
    gate: "",
    sys: "Chat for fast ideation and drafting. The brand team picks and polishes." },
  { id: "adv-sentiment", ind: "Advertising/Marketing/PR", fn: "Sales & Marketing", lvl: 2,
    title: "Weekly brand sentiment tracking",
    text: "A client wants a weekly view of how sentiment about their brand is shifting across social media and news, with the main reasons.",
    req: ["analytics"], opt: ["auto", "chat"],
    gate: "",
    sys: "Analytics detects sentiment trends. Automation can schedule the weekly run, and Chat can summarise the reasons." },

  // Banking
  { id: "bank-kyc", ind: "Banking", fn: "Risk & Compliance", lvl: 1,
    title: "KYC document requirements lookup",
    text: "Branch staff need to check which KYC documents are required for each account type, based on the latest regulator circulars and the internal manual.",
    req: ["search"], opt: ["chat"],
    gate: "Compliance owns and approves the source documents",
    sys: "Search over the approved circulars and manual, with answers that cite the clause. Compliance keeps the sources current." },
  { id: "bank-loan-prep", ind: "Banking", fn: "Operations", lvl: 2,
    title: "Loan application file preparation",
    text: "Before a credit officer reviews a loan, someone gathers documents from several systems, checks completeness, notes risk indicators and chases the applicant.",
    req: ["agent"], opt: ["search", "analytics", "auto", "chat"],
    gate: "The credit officer makes every lending decision",
    sys: "An Agent prepares the file across systems. The credit officer reviews it and decides. AI never approves loans." },
  { id: "bank-fraud", ind: "Banking", fn: "Risk & Compliance", lvl: 2,
    title: "Unusual transaction patterns",
    text: "The fraud team wants to spot unusual transaction patterns early and queue them for investigation.",
    req: ["analytics"], opt: ["auto"],
    gate: "Fraud analysts review every flag before any action on a customer",
    sys: "Analytics detects the anomalies, and Automation can queue the cases. Analysts decide on every case." },

  // Biotechnology/Pharmaceuticals
  { id: "bio-sop", ind: "Biotechnology/Pharmaceuticals", fn: "Operations", lvl: 1,
    title: "Lab SOP questions",
    text: "Lab technicians ask how to perform procedures safely. Answers must come from the controlled SOP library, not memory.",
    req: ["search"], opt: ["chat"],
    gate: "Quality Assurance owns SOP versions",
    sys: "Search over the controlled SOP library, citing version numbers. QA keeps the library current." },
  { id: "bio-pv", ind: "Biotechnology/Pharmaceuticals", fn: "Risk & Compliance", lvl: 2,
    title: "Adverse-event signal review",
    text: "The drug safety team must spot emerging patterns in adverse-event reports each month and explain them against the product label.",
    req: ["analytics"], opt: ["search", "chat"],
    gate: "A drug safety physician reviews every signal",
    sys: "Analytics detects the signals. Search pulls label and literature context. A physician assesses every signal." },

  // Construction
  { id: "con-daily", ind: "Construction", fn: "Operations", lvl: 1,
    title: "Daily site progress emails",
    text: "Site supervisors jot rough notes. The project office wants a tidy daily progress email for the client.",
    req: ["chat"], opt: [],
    gate: "",
    sys: "Chat turns rough notes into a clear update. The supervisor checks it before sending." },
  { id: "con-reschedule", ind: "Construction", fn: "Operations", lvl: 2,
    title: "Re-planning after a delay",
    text: "When a delivery slips, the team must work out knock-on effects, re-sequence subcontractors, update the schedule tool and notify everyone.",
    req: ["agent"], opt: ["auto", "chat", "analytics"],
    gate: "The project manager approves schedule changes",
    sys: "An Agent proposes the re-plan and updates systems. The project manager approves before anything is sent." },

  // Consulting
  { id: "cons-interview", ind: "Consulting", fn: "Sales & Marketing", lvl: 1,
    title: "Discovery workshop questions",
    text: "A consultant wants a good set of questions to open a client discovery workshop on supply-chain issues.",
    req: ["chat"], opt: [],
    gate: "",
    sys: "Chat for quick ideation. The consultant tailors the questions to the client." },
  { id: "cons-benchmark", ind: "Consulting", fn: "Strategy", lvl: 2,
    title: "Benchmarking a client using firm knowledge",
    text: "Find insights from past engagements in the firm's knowledge base and benchmark the client's KPIs against industry data.",
    req: ["search", "analytics"], opt: ["chat"],
    gate: "",
    sys: "Search finds past engagement insights. Analytics benchmarks the KPIs. Chat can draft the storyline." },

  // Consumer Products/Retail
  { id: "ret-descriptions", ind: "Consumer Products/Retail", fn: "Sales & Marketing", lvl: 1,
    title: "Product descriptions for new items",
    text: "Fifty new products need short, friendly online descriptions from their spec sheets.",
    req: ["chat"], opt: ["auto"],
    gate: "",
    sys: "Chat drafts descriptions from spec sheets. Automation can help only if this becomes a weekly batch." },
  { id: "ret-returns", ind: "Consumer Products/Retail", fn: "Customer Service", lvl: 1,
    title: "Store returns policy answers",
    text: "Store staff need quick, correct answers on returns and exchanges, which differ by product category.",
    req: ["search"], opt: ["chat"],
    gate: "",
    sys: "Search over the current returns policy, with Chat to phrase the answer." },
  { id: "ret-replenish", ind: "Consumer Products/Retail", fn: "Supply Chain", lvl: 2,
    title: "Demand-led replenishment",
    text: "Detect weekly demand patterns by store and product, then raise replenishment orders in the ERP.",
    req: ["analytics", "auto"], opt: ["chat"],
    gate: "The category manager approves orders above a set value",
    sys: "Analytics forecasts demand, and Automation raises the orders. Large orders go to the category manager." },

  // Education
  { id: "edu-lesson", ind: "Education", fn: "Teaching & Learning", lvl: 1,
    title: "Lesson plan and quiz draft",
    text: "A faculty member wants a draft lesson plan and ten practice questions on a topic they teach.",
    req: ["chat"], opt: [],
    gate: "",
    sys: "Chat drafts the plan and questions. Faculty review and adapt them." },
  { id: "edu-atrisk", ind: "Education", fn: "Student Services", lvl: 2,
    title: "Students at risk of dropping out",
    text: "Use attendance, grades and LMS activity to identify students who may need support, and alert their advisors.",
    req: ["analytics"], opt: ["auto", "chat"],
    gate: "Advisors decide on any intervention",
    sys: "Analytics flags patterns, and Automation can alert advisors. People decide how to support each student." },

  // Energy/Utilities
  { id: "en-manuals", ind: "Energy/Utilities", fn: "Operations", lvl: 1,
    title: "Equipment maintenance procedures",
    text: "Field engineers need the correct maintenance steps for specific equipment from manufacturer manuals.",
    req: ["search"], opt: ["chat"],
    gate: "",
    sys: "Search over the equipment manuals, citing the section." },
  { id: "en-predictive", ind: "Energy/Utilities", fn: "Operations", lvl: 2,
    title: "Predicting transformer failures",
    text: "Sensor data shows early warning signs. Detect them and open maintenance work orders before failures happen.",
    req: ["analytics", "auto"], opt: ["chat"],
    gate: "The maintenance supervisor approves work orders",
    sys: "Analytics detects warning patterns, and Automation opens work orders. The supervisor approves them." },

  // Engineering
  { id: "eng-explain", ind: "Engineering", fn: "Engineering & IT", lvl: 1,
    title: "Explaining concepts to a new graduate",
    text: "A new graduate engineer asks for plain-language explanations of concepts like tolerance stack-up.",
    req: ["chat"], opt: [],
    gate: "",
    sys: "Chat explains concepts quickly. A senior engineer stays available for questions." },
  { id: "eng-design", ind: "Engineering", fn: "Engineering & IT", lvl: 2,
    title: "Design-review questions from past projects",
    text: "Reviewers ask what was decided on similar past projects. The answers sit in specs, test reports and review minutes.",
    req: ["search"], opt: ["chat"],
    gate: "The lead engineer verifies before design decisions",
    sys: "Search across past specs and test reports, with sources. The lead engineer verifies." },

  // Entertainment/Hospitality/Leisure
  { id: "hos-faq", ind: "Entertainment/Hospitality/Leisure", fn: "Customer Service", lvl: 1,
    title: "Guest FAQs on the website",
    text: "Guests ask about check-in times, parking and amenities. Answers must match the hotel's current information.",
    req: ["search"], opt: ["chat"],
    gate: "",
    sys: "Search over the hotel's verified guest information, with Chat for friendly phrasing." },
  { id: "hos-pricing", ind: "Entertainment/Hospitality/Leisure", fn: "Finance", lvl: 2,
    title: "Room rate recommendations",
    text: "Revenue managers want rate suggestions based on booking pace, local events and seasonality.",
    req: ["analytics"], opt: ["search", "chat"],
    gate: "The revenue manager sets final rates",
    sys: "Analytics finds demand patterns and suggests rates. The revenue manager decides." },

  // Financial Services
  { id: "fs-recon", ind: "Financial Services", fn: "Finance", lvl: 1,
    title: "Monthly reconciliation",
    text: "Match bank statements to the ledger every month and flag the exceptions.",
    req: ["auto"], opt: ["analytics"],
    gate: "An accountant reviews every exception",
    sys: "Automation runs the rule-based matching. An accountant reviews the exceptions." },
  { id: "fs-advisor", ind: "Financial Services", fn: "Sales & Marketing", lvl: 2,
    title: "Client review preparation",
    text: "Before client reviews, advisors want portfolio performance summarised and talking points drafted.",
    req: ["analytics", "chat"], opt: ["search"],
    gate: "The advisor reviews everything and remains responsible for the advice",
    sys: "Analytics summarises performance, and Chat drafts the talking points. The advisor owns the advice." },

  // Healthcare
  { id: "hc-discharge", ind: "Healthcare", fn: "Clinical", lvl: 1,
    title: "Patient-friendly discharge instructions",
    text: "Turn clinician notes into clear, plain-language discharge instructions for patients.",
    req: ["chat"], opt: [],
    gate: "A clinician reviews and approves before patients receive it",
    sys: "Chat simplifies the language. A clinician must approve every instruction." },
  { id: "hc-protocols", ind: "Healthcare", fn: "Clinical", lvl: 1,
    title: "Hospital protocol lookup",
    text: "Nurses need fast answers from the hospital's approved clinical protocols during shifts.",
    req: ["search"], opt: ["chat"],
    gate: "Clinical governance owns the protocols",
    sys: "Search over the approved protocols, citing the source. Clinical governance keeps them current." },
  { id: "hc-priorauth", ind: "Healthcare", fn: "Operations", lvl: 2,
    title: "Prior authorisation requests",
    text: "Gather patient records, check each payer's rules, fill forms in different portals and track responses.",
    req: ["agent"], opt: ["search", "auto", "chat"],
    gate: "Clinicians and billing staff approve each submission",
    sys: "An Agent prepares and tracks requests across portals. Staff approve every submission." },

  // Insurance
  { id: "ins-routing", ind: "Insurance", fn: "Customer Service", lvl: 1,
    title: "Routing claim emails",
    text: "Incoming claim emails must be sent to the right team (motor, health, property) and acknowledged.",
    req: ["auto"], opt: ["chat"],
    gate: "",
    sys: "Automation routes and acknowledges by rule. Chat can help classify unclear emails." },
  { id: "ins-triage", ind: "Insurance", fn: "Risk & Compliance", lvl: 2,
    title: "Suspicious claim triage",
    text: "Spot claims that look unusual compared with past patterns and give adjusters a short summary of why.",
    req: ["analytics", "chat"], opt: ["search"],
    gate: "Adjusters decide on every claim",
    sys: "Analytics flags unusual patterns, and Chat writes the summary. Adjusters decide." },

  // IT/Computers
  { id: "it-errors", ind: "IT/Computers", fn: "Engineering & IT", lvl: 1,
    title: "Explaining error messages",
    text: "Developers want quick explanations of error messages and suggestions for code comments.",
    req: ["chat"], opt: [],
    gate: "",
    sys: "Chat for quick explanations. The developer verifies before merging." },
  { id: "it-incident", ind: "IT/Computers", fn: "Engineering & IT", lvl: 2,
    title: "Incident investigation",
    text: "When an outage happens: check monitoring, look up the runbook, run diagnostics and propose a fix across several tools.",
    req: ["agent"], opt: ["search", "analytics", "auto", "chat"],
    gate: "The on-call engineer approves remediation steps",
    sys: "An Agent investigates across tools using the runbook. The on-call engineer approves every fix." },

  // Law
  { id: "law-clauses", ind: "Law", fn: "Legal", lvl: 1,
    title: "Finding precedent clauses",
    text: "Associates need to find relevant clauses across the firm's approved contract templates.",
    req: ["search"], opt: ["chat"],
    gate: "A lawyer verifies before advising",
    sys: "Search across the approved templates, with links to each clause." },
  { id: "law-playbook", ind: "Law", fn: "Legal", lvl: 2,
    title: "Contract review against a playbook",
    text: "Compare a third-party contract with the firm's negotiation playbook and draft suggested redlines.",
    req: ["search", "chat"], opt: ["auto"],
    gate: "A lawyer approves every redline",
    sys: "Search grounds the review in the playbook, and Chat drafts redlines. A lawyer approves all of them." },

  // Manufacturing
  { id: "mfg-handover", ind: "Manufacturing", fn: "Operations", lvl: 1,
    title: "Shift handover summaries",
    text: "Operators leave long logs. The next shift wants a short handover summary.",
    req: ["chat"], opt: ["auto"],
    gate: "",
    sys: "Chat summarises the logs. The incoming supervisor checks the key points." },
  { id: "mfg-3way", ind: "Manufacturing", fn: "Finance", lvl: 1,
    title: "Supplier invoice matching",
    text: "Match each supplier invoice to its purchase order and goods receipt, then post it to the ERP.",
    req: ["auto"], opt: ["chat"],
    gate: "Accounts payable approves mismatches",
    sys: "Automation runs the three-way match by rule. AP handles the mismatches." },
  { id: "mfg-defects", ind: "Manufacturing", fn: "Operations", lvl: 2,
    title: "Quality defect trends",
    text: "Find defect trends across production lines and suggest likely root causes for the quality team.",
    req: ["analytics"], opt: ["chat", "search"],
    gate: "A quality engineer validates root causes",
    sys: "Analytics finds the trends, and Chat can phrase hypotheses. Engineers validate root causes." },

  // Media/Publishing
  { id: "med-headlines", ind: "Media/Publishing", fn: "Product & Content", lvl: 1,
    title: "Headline and social post variants",
    text: "Editors want five headline options and social posts for each article.",
    req: ["chat"], opt: [],
    gate: "",
    sys: "Chat for quick variants. The editor chooses." },
  { id: "med-factcheck", ind: "Media/Publishing", fn: "Product & Content", lvl: 2,
    title: "Fact-checking a draft",
    text: "Check each claim in a draft article against the archive and trusted sources before publishing.",
    req: ["search"], opt: ["chat"],
    gate: "The editor makes the publish decision",
    sys: "Search checks claims against trusted sources and shows evidence. The editor decides." },

  // Professional Services
  { id: "ps-utilisation", ind: "Professional Services", fn: "Operations", lvl: 1,
    title: "Timesheet reminders and utilisation report",
    text: "Every Friday, remind staff to submit timesheets, then compile the utilisation report for partners.",
    req: ["auto"], opt: ["analytics", "chat"],
    gate: "",
    sys: "Automation sends reminders and compiles the report on schedule." },
  { id: "ps-rfp", ind: "Professional Services", fn: "Sales & Marketing", lvl: 2,
    title: "RFP responses",
    text: "Find the best past answers in the proposal library, draft responses to new questions and route them for expert review.",
    req: ["search", "chat"], opt: ["auto"],
    gate: "Subject experts and the partner approve the final submission",
    sys: "Search finds past answers, and Chat drafts the new ones. Automation can route them for review, and experts approve." },

  // Technology/Telecom
  { id: "tel-billing", ind: "Technology/Telecom", fn: "Customer Service", lvl: 1,
    title: "Plan and billing questions",
    text: "Customers ask about plans, roaming and bill charges. Answers must match current tariff documents.",
    req: ["search"], opt: ["chat"],
    gate: "",
    sys: "Search over current tariff documents, with Chat for friendly answers." },
  { id: "tel-churn", ind: "Technology/Telecom", fn: "Sales & Marketing", lvl: 2,
    title: "Churn prediction and retention offers",
    text: "Identify customers likely to leave from usage data and trigger the right retention offer.",
    req: ["analytics", "auto"], opt: ["chat"],
    gate: "The retention team approves the offer rules",
    sys: "Analytics scores churn risk, and Automation triggers the approved offers." },

  // Logistics
  { id: "log-delays", ind: "Logistics", fn: "Customer Service", lvl: 1,
    title: "Shipment delay notifications",
    text: "When a shipment status changes to 'delayed', notify the customer with the new estimated date.",
    req: ["auto"], opt: ["chat"],
    gate: "",
    sys: "Automation sends the notification when the status changes." },
  { id: "log-reroute", ind: "Logistics", fn: "Supply Chain", lvl: 2,
    title: "Rerouting after a port closure",
    text: "A port closes unexpectedly. Re-plan routes, rebook carriers in the transport system and update affected customers.",
    req: ["agent"], opt: ["analytics", "auto", "chat"],
    gate: "The logistics manager approves rebookings above a cost limit",
    sys: "An Agent re-plans and rebooks across systems. The manager approves costly changes." }
];

/* ---------- Scoring engine (pure) ---------- */

const MISSING = {
  chat: "Nothing here drafts or explains the output for people. Add Chat as the writing layer.",
  search: "Nothing grounds the answer in verified documents, so accuracy can't be trusted. Add Search & Knowledge.",
  auto: "The work repeats on clear steps, but nothing runs that workflow. Add an Automation platform.",
  analytics: "This task needs patterns from data, and nothing here analyses data. Add Analytics & Insights.",
  agent: "The work needs planning and actions across several systems. An Agent framework, with oversight, fits better."
};

const SUBS = [
  { miss: "search", use: "chat", pen: 5, text: "Chat on its own answers from general knowledge. It can sound right and still be wrong or out of date, so ground it with Search." },
  { miss: "analytics", use: "chat", pen: 5, text: "Chat can describe numbers you paste in, but it isn't built to find trends reliably across data. Use Analytics." },
  { miss: "auto", use: "agent", pen: 2, text: "An Agent could run these steps, but they are fixed and repeatable. Automation is cheaper, more predictable and easier to audit." },
  { miss: "chat", use: "agent", pen: 1, text: "The Agent's reasoning layer can write the output, though that's more machinery than drafting needs." },
  { miss: "agent", use: "auto", pen: 3, text: "Automation can run the fixed parts, but it can't plan or adapt when steps change across systems. People will need to fill the gaps." },
  { miss: "search", use: "agent", pen: 4, text: "An Agent still needs a verified knowledge source to stay grounded. On its own it adds risk without adding accuracy." },
  { miss: "chat", use: "search", pen: 2, text: "Search tools can give short answers, but the drafting or explaining step is better served by Chat." },
  { miss: "analytics", use: "agent", pen: 3, text: "An Agent can call analysis tools, but the core need is pattern detection. Analytics does that directly and more transparently." }
];

function sortCats(list) { return CAT_ORDER.filter(c => list.includes(c)); }
function stackLabel(list) { return sortCats(list).map(c => CATS[c].short).join(" + "); }
function bestOf(c) { return sortCats(c.best || c.req); }

function considerations(c) {
  const out = [];
  const add = (k, why) => { if (!out.some(o => o.k === k)) out.push({ k, why }); };
  if (c.req.includes("search")) { add("Accuracy", "answers must be right"); add("Grounding", "answers must come from verified sources"); }
  if (c.req.includes("analytics")) add("Data needs", "insight comes from data, not text alone");
  if (c.req.includes("auto")) { add("Workflow", "repeatable, rule-based steps"); add("Cost & scale", "runs many times cheaply"); }
  if (c.req.includes("agent")) { add("Control", "multi-step actions across systems"); add("Risk", "more autonomy means more ways to go wrong"); }
  if (c.req.includes("chat") && c.req.length === 1) add("Speed", "a quick draft is the goal");
  if (c.gate) { add("Compliance", "governance applies"); add("Human approval", c.gate); }
  return out.slice(0, 5);
}

/* Score a proposed stack for a use case. picks: category keys; gate: learner included a human approval step. */
function evaluate(c, picks, gate) {
  const S = sortCats(Array.from(new Set(picks)));
  const req = c.req, opt = c.opt || [];
  const lines = [];
  let score = 10, overComplex = false;
  const exempt = new Set();

  req.filter(r => S.includes(r)).forEach(r => lines.push(["good", CATS[r].role]));

  req.filter(r => !S.includes(r)).forEach(r => {
    const sub = SUBS.find(s => s.miss === r && S.includes(s.use));
    if (sub) {
      score -= sub.pen;
      if (sub.use === "agent") overComplex = true; else exempt.add(sub.use);
      lines.push(["warn", sub.text]);
    } else {
      score -= req.length === 1 ? 6 : 4;
      lines.push(["bad", MISSING[r]]);
    }
  });

  S.filter(s => !req.includes(s) && !opt.includes(s) && !exempt.has(s)).forEach(s => {
    overComplex = true;
    score -= s === "agent" ? 2.5 : 1.5;
    lines.push(["warn", s === "agent"
      ? "An Agent adds autonomy, cost and governance needs this task doesn't call for."
      : `${CATS[s].name} adds setup and cost this task doesn't really need.`]);
  });

  if (req.every(r => S.includes(r))) S.filter(s => opt.includes(s) && !req.includes(s)).forEach(s =>
    lines.push(["good", `${CATS[s].short} is a reasonable add-on here: ${CATS[s].tag.toLowerCase()}.`]));

  if (c.gate) {
    if (gate) lines.push(["good", `Human approval step included: ${c.gate}.`]);
    else { score -= 2; lines.push(["bad", `Add a human approval step: ${c.gate}.`]); }
  }
  if (S.includes("agent") && !gate) {
    score -= 1;
    lines.push(["bad", "Agents act across systems, so add permissions, logging and a human checkpoint."]);
  }

  score = Math.max(1, Math.min(10, Math.round(score)));
  const best = bestOf(c);
  const coversAll = req.every(r => S.includes(r));
  const leanAlt = coversAll && !overComplex && stackLabel(S) !== stackLabel(best);
  if (leanAlt) lines.push(["tip", `Valid alternative. The deck's go-to here is ${stackLabel(best)}.`]);

  let simpler = "";
  if (overComplex) simpler = `Start simpler: ${stackLabel(best)} meets this task's accuracy, control, cost and speed needs.`;

  const verdict = score >= 8 ? "Suitable" : score >= 5 ? "Partially suitable" : "Unsuitable";
  return { score, verdict, positive: score >= 7, lines: lines.slice(0, 7), simpler, stack: S, best };
}

/* ---------- Free-text parsing ---------- */

const STACK_TERMS = [
  // longest and most specific first; matches are removed so "Claude Projects" doesn't also count as Chat
  ["agent", ["claude agent sdk", "agent sdk", "langgraph", "crewai", "crew ai", "autogen", "copilot studio", "multi-agent", "multi agent", "agentic", "agents", "agent"]],
  ["auto", ["claude scheduled tasks", "scheduled tasks", "scheduled task", "power automate", "automation anywhere", "make.com", "zapier", "n8n", "uipath", "rpa", "workflow", "automation", "automate", "scheduler"]],
  ["search", ["claude projects", "notebooklm", "notebook lm", "glean", "sharepoint", "confluence", "knowledge base", "enterprise search", "vector database", "vector db", "retrieval", "rag", "perplexity", "document q&a", "search", "knowledge"]],
  ["analytics", ["power bi copilot", "power bi", "powerbi", "julius", "tableau", "looker", "qlik", "databricks", "snowflake", "excel", "analytics", "dashboard", "machine learning", "forecasting", "bi", "ml", "sql", "python"]],
  ["chat", ["chatgpt", "claude", "gemini", "copilot", "gpt", "llm", "chatbot", "chat"]]
];
const GATE_TERMS = ["human", "review", "approv", "sign-off", "sign off", "signs off", "signoff", "sign-off", "check", "in the loop", "hitl", "oversight", "maker-checker", "checker", "validate", "verification", "audit trail"];

function escapeRe(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }

function parseStack(text) {
  let t = " " + text.toLowerCase().replace(/[\n\t]/g, " ") + " ";
  const found = [], hits = [];
  for (const [cat, terms] of STACK_TERMS) {
    for (const term of terms) {
      const re = new RegExp("(^|[^a-z0-9])" + escapeRe(term) + "(?=[^a-z0-9]|$)", "g");
      if (re.test(t)) {
        if (!found.includes(cat)) found.push(cat);
        hits.push([term, cat]);
        t = t.replace(re, "$1 ");
      }
    }
  }
  const lower = text.toLowerCase();
  const gate = GATE_TERMS.some(g => lower.includes(g));
  return { cats: sortCats(found), gate, hits };
}

/* ---------- Custom use-case inference ---------- */

const NEED_TERMS = {
  search: ["policy", "policies", "manual", "sop", "procedure", "handbook", "document", "contract", "clause", "regulation", "circular", "faq", "knowledge", "look up", "lookup", "guideline", "protocol", "terms", "archive", "cite", "source", "grounded", "correct answer"],
  chat: ["draft", "write", "rewrite", "brainstorm", "idea", "explain", "summar", "email", "tagline", "translate", "simplify", "outline", "caption", "post"],
  auto: ["weekly", "daily", "monthly", "every ", "recurring", "repeat", "routine", "schedul", "automatic", "route", "routing", "notify", "notification", "reminder", "invoice", "workflow", "trigger", "data entry", "same steps", "checklist"],
  analytics: ["trend", "pattern", "forecast", "predict", "kpi", "metric", "dashboard", "variance", "anomal", "churn", "segment", "insight", "analys", "analyz", "benchmark", "sentiment", "utilisation", "utilization", "data"],
  agent: ["across systems", "several systems", "multiple systems", "different systems", "end-to-end", "end to end", "coordinate", "orchestrat", "multi-step", "multistep", "autonomous", "investigate", "reroute", "re-plan", "replan", "chase", "gather"]
};
const RISK_TERMS = ["patient", "clinical", "medical", "diagnos", "loan", "credit", "lending", "hiring", "recruit", "candidate", "salary", "termination", "legal", "contract", "compliance", "regulat", "payment", "fraud", "claim", "safety", "insurance", "price", "pricing", "audit", "personal data", "customer data", "student"];

function inferCase(text, ind) {
  const t = " " + text.toLowerCase() + " ";
  const signals = {};
  for (const cat of CAT_ORDER) {
    const words = NEED_TERMS[cat].filter(w => t.includes(w));
    if (words.length) signals[cat] = words;
  }
  let detected = sortCats(Object.keys(signals));
  let req, opt;
  if (!detected.length) { req = ["chat"]; opt = []; }
  else if (detected.includes("agent")) { req = ["agent"]; opt = detected.filter(c => c !== "agent"); }
  else if (detected.length > 1 && detected.includes("chat") && signals.chat.length < 2) {
    req = detected.filter(c => c !== "chat"); opt = ["chat"];
  } else { req = detected; opt = []; }
  if (!opt.includes("chat") && !req.includes("chat")) opt.push("chat");
  const risks = RISK_TERMS.filter(w => t.includes(w));
  const gate = risks.length || req.includes("agent") ? "A named person reviews and approves before anything high-impact happens" : "";
  return {
    id: "custom", ind: ind || "Other", fn: "Your use case", lvl: 0, custom: true,
    title: "Your own use case", text, req: sortCats(req), opt: sortCats(opt), gate,
    sys: `Suggested system: ${stackLabel(req)}${gate ? ", with a human approval step" : ""}. Inferred from your description.`,
    signals, risks, confident: detected.length > 0
  };
}

/* ---------- Quiz options ---------- */

function allStacks() {
  const out = [];
  for (let m = 1; m < 32; m++) {
    const s = CAT_ORDER.filter((_, i) => m & (1 << i));
    if (s.length <= 3) out.push(s);
  }
  return out;
}

function quizOptions(c, rand) {
  const best = bestOf(c);
  const bestKey = stackLabel(best);
  const pool = allStacks()
    .filter(s => stackLabel(s) !== bestKey)
    .map(s => ({ s, score: evaluate(c, s, true).score }))
    .filter(o => o.score <= 6);
  const pick = [];
  const take = pred => {
    const cands = pool.filter(o => pred(o) && !pick.includes(o));
    if (cands.length) pick.push(cands[Math.floor(rand() * cands.length)]);
  };
  take(o => o.s.includes("agent") && !best.includes("agent")); // over-complex choice
  take(o => o.s.length === 1);                                  // too-simple or wrong single
  take(o => o.s.length === 2);
  for (let k = 0; k < 6 && pick.length < 3; k++) take(() => true);
  const opts = [{ s: best, score: 10 }].concat(pick.slice(0, 3));
  for (let i = opts.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [opts[i], opts[j]] = [opts[j], opts[i]]; }
  return opts.map(o => o.s);
}

if (typeof module !== "undefined") module.exports = { CATS, CAT_ORDER, CASES, INDUSTRIES, EXPERIENCE, evaluate, parseStack, inferCase, quizOptions, stackLabel, bestOf, allStacks, considerations };
