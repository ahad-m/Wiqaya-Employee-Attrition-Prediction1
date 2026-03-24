import { useState, useEffect, useRef, useCallback } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, Cell,
  PieChart, Pie, LineChart, Line, CartesianGrid,
} from "recharts";

// ════════════════════════════════════════
// BACKEND URL
// ════════════════════════════════════════
const API = "";  // الطلبات تمر من Vite proxy → Flask

// ════════════════════════════════════════
// PALETTE
// ════════════════════════════════════════
const P = {
  bg: "#f7f9fc", card: "#ffffff", border: "#e8edf5", border2: "#d1dae8",
  blue: "#2563eb", blue2: "#1d4ed8", blueSoft: "#eff6ff",
  violet: "#7c3aed", violetSoft: "#f5f3ff",
  red: "#e11d48", redSoft: "#fff1f4",
  amber: "#d97706", amberSoft: "#fffbeb",
  emerald: "#059669", emeraldSoft: "#ecfdf5",
  sky: "#0284c7", skySoft: "#f0f9ff",
  teal: "#0d9488", tealSoft: "#f0fdfa",
  text: "#0f172a", text2: "#374151", text3: "#475569",
  ghost: "#94a3b8", ghost2: "#64748b",
  shadow: "0 2px 16px rgba(15,23,42,0.06)",
  shadowMd: "0 4px 24px rgba(15,23,42,0.10)",
  shadowLg: "0 8px 40px rgba(15,23,42,0.13)",
};

// ════════════════════════════════════════
// SVG ICONS
// ════════════════════════════════════════
const ICON_PATHS = {
  Home:<><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></>,
  Layers:<><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></>,
  Zap:<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>,
  User:<><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></>,
  Briefcase:<><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></>,
  DollarSign:<><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></>,
  TrendingUp:<><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></>,
  Star:<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>,
  AlertTriangle:<><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></>,
  UserMinus:<><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="23" y1="11" x2="17" y2="11"/></>,
  Activity:<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>,
  Award:<><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></>,
  RefreshCw:<><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></>,
  ArrowLeft:<><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></>,
  ChevronRight:<polyline points="9 18 15 12 9 6"/>,
  ChevronLeft:<polyline points="15 18 9 12 15 6"/>,
  Check:<polyline points="20 6 9 17 4 12"/>,
  CheckCircle:<><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></>,
  Upload:<><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/></>,
  BarChart2:<><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></>,
  PieChart:<><path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/></>,
  Target:<><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></>,
  Cpu:<><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="14" x2="23" y2="14"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="14" x2="4" y2="14"/></>,
  Database:<><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></>,
  GitBranch:<><line x1="6" y1="3" x2="6" y2="15"/><circle cx="18" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M18 9a9 9 0 0 1-9 9"/></>,
  Filter:<><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></>,
  Compass:<><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></>,
  FileText:<><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></>,
  Users:<><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></>,
  Heart:<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>,
  Shield:<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>,
  Clock:<><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></>,
};

const Icon = ({ name, size = 16, color = "currentColor", style = {} }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    style={{ display: "inline-block", flexShrink: 0, ...style }}>
    {ICON_PATHS[name] || null}
  </svg>
);

// ════════════════════════════════════════
// DATA
// ════════════════════════════════════════
const FEATURES = [
  { name: "الإرهاق النفسي",          v: 18.7, c: P.red },
  { name: "الراتب الشهري",           v: 14.2, c: P.amber },
  { name: "الأوفرتايم",              v: 12.8, c: P.amber },
  { name: "سنوات الخبرة",            v: 11.5, c: P.blue },
  { name: "التقدير والاعتراف",       v: 9.8,  c: P.violet },
  { name: "الترقية",                 v: 8.7,  c: P.sky },
  { name: "الرضا الوظيفي",           v: 7.6,  c: P.emerald },
  { name: "التوازن بين العمل والحياة",v: 6.5,  c: P.emerald },
];

const CLUSTERS = [
  {
    id: 0, name: "الموظف المستقر", n: 153, pct: 16, attrition: 22.2,
    c: P.amber, soft: P.amberSoft, iconN: "Shield",
    desc: "موظف صاحب خبرة طويلة (15+ سنة) بنفس المنظمة، تعوّد على وضعه رغم غياب الترقيات. لا يعاني من إرهاق لكن يعيش ركود مهني. مستقر لأنه مرتاح في منطقة الراحة.",
    chars: "خبرة طويلة · ركود مهني عالي · لكن مستقر ومرتاح",
    fix: "مسارات وظيفية واضحة + برامج تطوير",
    radar: [28, 95, 35, 30, 20, 55],
    scores: { b: 2.87, s: 3.63, d: 3.87, c: 1.44 },
    scoreLabels: [
      { l: "الإرهاق الوظيفي",  v: 2.87, max: 7 },
      { l: "الركود المهني",     v: 3.63, max: 5 },
      { l: "الانفصال العاطفي",  v: 3.87, max: 9 },
      { l: "فجوة التعويضات",   v: 1.44, max: 3 },
    ],
    features: [
      "ركود مهني أعلى من المتوسط بـ 1.08",
      "سنوات بنفس المنظمة أعلى بـ 1.03",
      "خبرة إجمالية أعلى بـ 0.98",
      "كبار بالعمر — أعلى بـ 0.63",
      "إرهاق أقل من المتوسط بـ 0.54",
    ],
    actions: [
      "تصميم مسار وظيفي واضح لكل موظف",
      "برامج تطوير مهني اختيارية",
      "معايير ترقية موضوعية وشفافة",
      "مراجعة أداء سنوية مع خطة نمو",
    ],
  },
  {
    id: 1, name: "الموظف المرتاح", n: 363, pct: 38, attrition: 35.3,
    c: P.emerald, soft: P.emeraldSoft, iconN: "Award",
    desc: "موظف يحصل على بيئة عمل جيدة: دعم وظيفي، بدلات، تدريب، ترقيات، وتقدير. أقل إرهاق وأقل انفصال عاطفي. هذا النموذج المثالي اللي نبغى نوسّعه.",
    chars: "أقل إرهاق وانفصال · يحصل دعم وتدريب وترقيات",
    fix: "المحافظة على بيئتهم + توسيع نموذجهم",
    radar: [15, 20, 18, 12, 90, 85],
    scores: { b: 2.22, s: 1.85, d: 3.43, c: 0.96 },
    scoreLabels: [
      { l: "الإرهاق الوظيفي",  v: 2.22, max: 7 },
      { l: "الركود المهني",     v: 1.85, max: 5 },
      { l: "الانفصال العاطفي",  v: 3.43, max: 9 },
      { l: "فجوة التعويضات",   v: 0.96, max: 3 },
    ],
    features: [
      "انفصال عاطفي أقل من المتوسط بـ 1.20",
      "إرهاق وظيفي أقل بـ 1.19",
      "دعم وظيفي أعلى بـ 0.60",
      "بدلات أعلى بـ 0.57",
      "تدريب أعلى بـ 0.53",
    ],
    actions: [
      "المحافظة على سياسات الدعم الحالية",
      "مراقبة دورية لمستوى الرضا",
      "برامج مكافآت للاحتفاظ بهم",
      "توسيع نموذجهم لباقي الموظفين",
    ],
  },
  {
    id: 2, name: "الموظف المنهك", n: 436, pct: 46, attrition: 57.3,
    c: P.red, soft: P.redSoft, iconN: "AlertTriangle",
    desc: "موظف منفصل عاطفياً عن المنظمة، مرهق نفسياً وجسدياً، لا يحصل على تقدير ولا دعم ولا تدريب. التعويض غير عادل مقارنة بجهده. 57% منهم غادروا فعلاً.",
    chars: "إرهاق شديد · انفصال عاطفي · بلا دعم ولا تقدير",
    fix: "تخفيف الضغط + تعزيز الانتماء + مراجعة التعويضات",
    radar: [92, 48, 95, 85, 15, 12],
    scores: { b: 4.59, s: 2.77, d: 5.89, c: 2.07 },
    scoreLabels: [
      { l: "الإرهاق الوظيفي",  v: 4.59, max: 7 },
      { l: "الركود المهني",     v: 2.77, max: 5 },
      { l: "الانفصال العاطفي",  v: 5.89, max: 9 },
      { l: "فجوة التعويضات",   v: 2.07, max: 3 },
    ],
    features: [
      "انفصال عاطفي أعلى من المتوسط بـ 1.26",
      "إرهاق وظيفي أعلى بـ 1.18",
      "غياب التدريب — أقل بـ 0.53",
      "فجوة تعويضات أعلى بـ 0.53",
      "غياب الدعم الوظيفي — أقل بـ 0.47",
    ],
    actions: [
      "تخفيف ضغط العمل وتوزيع المهام بعدالة",
      "تعزيز الانتماء والتقدير المعنوي",
      "مراجعة التعويضات والبدلات فوراً",
      "برامج تدريبية وتأهيلية عاجلة",
    ],
  },
];

const CM = { tn: 125, fp: 11, fn: 27, tp: 76, total: 239 };
// ════════════════════════════════════════
// 34 SURVEY QUESTIONS
// ════════════════════════════════════════
const SURVEY_SECTIONS = [
  { id:"personal", title:"المعلومات الشخصية", icon:"User", color:P.blue, fields:[
    {k:"leftBefore",l:"هل سبق لك أن تركت العمل في منظمة سابقة؟",opts:["نعم / Yes","لا / No"]},
    {k:"gender",l:"الجنس",opts:["ذكر / Male","أُنثى / Female"]},
    {k:"age",l:"العمر",opts:["من 21 الى 30 سنة","من 31 الى 40 سنة","من 41 الى 50 سنة","من 51 الى 60 سنة"]},
    {k:"marital",l:"الحالة الاجتماعية",opts:["أعزب / Single","متزوج / Married","مطلق / Divorced"]},
    {k:"education",l:"الدرجة الأكاديمية",opts:["دكتوراه / Ph.D","ماجستير / Master's","بكالوريوس / Bachelor's","دبلوم أو ثانوي / Diploma or Secondary"]},
  ]},
  { id:"experience", title:"الخبرة والوظيفة", icon:"Briefcase", color:P.violet, fields:[
    {k:"totalExp",l:"إجمالي سنوات الخبرة",opts:["أقل من 5 سنوات","من 5 الى 10 سنوات","من 11 الى 15 سنة","من 16 الى 20 سنة","من 21 الى 25 سنة","من 26 الى 30 سنة","من 31 الى 35 سنة","من 36 الى 40 سنة"]},
    {k:"lastOrgExp",l:"سنوات الخبرة في آخر منظمة",opts:["أقل من 5 سنوات","من 5 الى 10 سنوات","من 11 الى 15 سنة","من 16 الى 20 سنة","من 21 الى 25 سنة","من 26 الى 30 سنة","من 31 الى 35 سنة","من 36 الى 40 سنة"]},
    {k:"sector",l:"القطاع",opts:["المالية / Finance","الصحة / Health","البيئة والمياه والزراعة","البلديات / Municipalities","الإسكان / Housing","الطاقة / Energy","الاتصالات / Telecommunications","التعليم / Education","النقل / Transport","الإعلام / Media"]},
    {k:"department",l:"القسم",opts:["الإدارة / Administration","المبيعات / Sales","المحاسبة / Accounting","العمليات / Processes","العلاقات / Relations","الموارد البشرية / HR","تكنولوجيا المعلومات / IT","خدمة العملاء / Customer Service","الدعم الفني / Technical Support"]},
    {k:"jobTitle",l:"المسمى الوظيفي",opts:["موظف / Employee","محلل / Analyst","مشرف / Supervisor","مدير / Manager","مدير عام / General Manager","مستشار / Consultant","تنفيذي / Executive","أخرى / Other"]},
  ]},
  { id:"salary", title:"الراتب والمزايا", icon:"DollarSign", color:P.emerald, fields:[
    {k:"salary",l:"الراتب الشهري شامل البدلات",opts:["أقل من 5,000 ر.س","من 5,000 الى 10,000 ر.س","من 11,000 الى 15,000 ر.س","من 16,000 الى 20,000 ر.س","من 21,000 الى 25,000 ر.س","من 26,000 الى 30,000 ر.س","31,000 ر.س فأكثر"]},
    {k:"allowances",l:"البدلات",opts:["بدل السكن / Housing","بدل المواصلات / Transportation","بدل المعيشة / Living","بدل السفر / Travel","لم أحصل على أي بدلات / None"]},
    {k:"medInsurance",l:"تأمين طبي؟",opts:["نعم / Yes","لا / No"]},
    {k:"annualBonus",l:"مكافأة سنوية (بونس)؟",opts:["نعم / Yes","لا / No"]},
    {k:"overtime",l:"ساعات عمل إضافية (أوفرتايم)؟",opts:["نعم / Yes","لا / No"]},
    {k:"overtimePay",l:"مقابل الأوفرتايم؟",opts:["نعم / Yes","لا / No","ليس لدي ساعات عمل إضافية / No overtime"]},
    {k:"salaryOk",l:"راضٍ عن الدخل مقارنة بالجهد؟",opts:["نعم / Yes","لا / No"]},
  ]},
  { id:"workenv", title:"بيئة العمل والضغط", icon:"Zap", color:P.red, fields:[
    {k:"promotion",l:"تحصل على ترقية مستحقة؟",opts:["نعم / Yes","لا / No"]},
    {k:"trainCount",l:"عدد البرامج التدريبية آخر 3 سنوات",opts:["من 1 الى 3 برامج","من 4 الى 6 برامج","من 7 برامج فأكثر","لم أتلقَّ أي تدريب"]},
    {k:"trainBenefit",l:"استفدت من التدريب؟",opts:["نعم / Yes","لا / No"]},
    {k:"travelFreq",l:"السفر لأغراض العمل",opts:["السفر بشكل متكرر / Frequently","السفر نادراً / Rarely","لا أسافر من أجل العمل / Never"]},
    {k:"orgSupport",l:"مستوى دعم المنظمة لإنجاز عملك",opts:["عالٍ / High","متوسط / Medium","منخفض / Low"]},
    {k:"recognition",l:"تشعر بالتقدير من رؤسائك؟",opts:["نعم / Yes","لا / No"]},
  ]},
  { id:"satisfaction", title:"الرضا والانتماء", icon:"Heart", color:P.amber, fields:[
    {k:"commitment",l:"الالتزام العاطفي بالمنظمة",opts:["عالٍ / High","متوسط / Medium","منخفض / Low"]},
    {k:"involvement",l:"سهولة الانخراط بالوظيفة",opts:["سهل / Easy","متوسط / Medium","صعب / Difficult"]},
    {k:"distance",l:"المسافة لمقر العمل",opts:["قريب / Close","متوسط / Medium","بعيد / Far"]},
    {k:"workLifeBal",l:"التوازن بين العمل والحياة",opts:["سهل / Easy","متوسط / Medium","صعب / Difficult"]},
    {k:"physStress",l:"إجهاد جسدي بسبب العمل؟",opts:["نعم / Yes","لا / No","أحياناً / Sometimes"]},
    {k:"mentalStress",l:"إرهاق نفسي وعاطفي؟",opts:["نعم / Yes","لا / No","أحياناً / Sometimes"]},
    {k:"jobSecurity",l:"تشعر بالأمان الوظيفي؟",opts:["نعم / Yes","لا / No"]},
    {k:"healthIssue",l:"مشاكل صحية دفعتك لترك العمل؟",opts:["نعم / Yes","لا / No"]},
  ]},
  { id:"evaluation", title:"التقييم والفرص", icon:"Star", color:P.violet, fields:[
    {k:"envSat",l:"رضاك عن بيئة العمل",opts:["عالٍ / High","متوسط / Medium","منخفض / Low"]},
    {k:"jobSat",l:"رضاك الوظيفي بشكل عام",opts:["راضٍ جداً / Very Satisfied","راضٍ / Satisfied","غير راضٍ / Not Satisfied"]},
    {k:"otherOffers",l:"فرص وظيفية في منظمة أخرى؟",opts:["نعم / Yes","لا / No"]},
  ]},
];

const SURVEY_TOTAL = SURVEY_SECTIONS.reduce((s, sec) => s + sec.fields.length, 0);

// ════════════════════════════════════════
// HOOKS
// ════════════════════════════════════════
function useCountUp(target, active = true, dur = 1000) {
  const [v, setV] = useState(0);
  const raf = useRef();
  useEffect(() => {
    if (!active) return;
    let start = null;
    const step = ts => { if (!start) start = ts; const p = Math.min((ts - start) / dur, 1); setV(Math.round((1 - Math.pow(1 - p, 3)) * target * 10) / 10); if (p < 1) raf.current = requestAnimationFrame(step); };
    raf.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf.current);
  }, [target, active]);
  return v;
}

// ════════════════════════════════════════
// SHARED COMPONENTS
// ════════════════════════════════════════
function Pill({ label, color, size = "sm" }) {
  return <span style={{ padding: size === "sm" ? "3px 10px" : "5px 14px", background: color + "15", color, border: `1px solid ${color}28`, fontSize: size === "sm" ? 10 : 12, fontWeight: 700, borderRadius: 20, display: "inline-flex", alignItems: "center", gap: 4 }}>{label}</span>;
}

function AnimBar({ v, max, color, delay = 0 }) {
  const [w, setW] = useState(0);
  useEffect(() => { const t = setTimeout(() => setW(Math.min((v / max) * 100, 100)), delay + 80); return () => clearTimeout(t); }, [v, delay]);
  return <div style={{ height: 5, background: "#f1f5f9", borderRadius: 3, overflow: "hidden" }}><div style={{ height: "100%", width: `${w}%`, background: color, borderRadius: 3, transition: `width 1.1s cubic-bezier(.34,1.56,.64,1) ${delay}ms` }} /></div>;
}

function Gauge({ value, color }) {
  const r = 66, cx = 86, cy = 88;
  const toRad = d => (d * Math.PI) / 180;
  const arc = (from, to, radius) => { const s = { x: cx + radius * Math.cos(toRad(from)), y: cy + radius * Math.sin(toRad(from)) }; const e = { x: cx + radius * Math.cos(toRad(to)), y: cy + radius * Math.sin(toRad(to)) }; return `M ${s.x} ${s.y} A ${radius} ${radius} 0 ${(to - from) > 180 ? 1 : 0} 1 ${e.x} ${e.y}`; };
  const filled = Math.min(210 + (value / 100) * 300, 510);
  return (
    <svg viewBox="0 0 172 132" style={{ width: "100%", maxWidth: 172 }}>
      <defs><linearGradient id="gg" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#22c55e" /><stop offset="50%" stopColor="#f59e0b" /><stop offset="100%" stopColor="#ef4444" /></linearGradient><filter id="ggl"><feGaussianBlur stdDeviation="2.5" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter></defs>
      <path d={arc(210, 510, r)} stroke="#e8edf5" strokeWidth="10" fill="none" strokeLinecap="round" />
      {value > 0 && <path d={arc(210, filled, r)} stroke="url(#gg)" strokeWidth="10" fill="none" strokeLinecap="round" filter="url(#ggl)" />}
      <circle cx={cx + r * Math.cos(toRad(filled))} cy={cy + r * Math.sin(toRad(filled))} r="5.5" fill={color} filter="url(#ggl)" />
      <text x={cx} y={cy + 2} textAnchor="middle" fontSize="26" fontWeight="900" fill={color} fontFamily="system-ui">{value}%</text>
      <text x={cx} y={cy + 18} textAnchor="middle" fontSize="8" fill="#94a3b8" fontFamily="monospace" letterSpacing="0.8">احتمال المغادرة</text>
    </svg>
  );
}

function ParticlesBg() {
  const canvas = useRef();
  useEffect(() => { const c = canvas.current; if (!c) return; const ctx = c.getContext("2d"); let W = c.width = c.offsetWidth, H = c.height = c.offsetHeight; const pts = Array.from({ length: 45 }, () => ({ x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - .5) * .4, vy: (Math.random() - .5) * .4, r: Math.random() * 1.8 + 0.8 })); let r; const draw = () => { ctx.clearRect(0, 0, W, H); pts.forEach(p => { p.x += p.vx; p.y += p.vy; if (p.x < 0 || p.x > W) p.vx *= -1; if (p.y < 0 || p.y > H) p.vy *= -1; ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fillStyle = "rgba(255,255,255,0.22)"; ctx.fill(); }); pts.forEach((a, i) => pts.slice(i + 1).forEach(b => { const d = Math.hypot(a.x - b.x, a.y - b.y); if (d < 90) { ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.strokeStyle = `rgba(255,255,255,${0.10 * (1 - d / 90)})`; ctx.lineWidth = 0.5; ctx.stroke(); } })); r = requestAnimationFrame(draw); }; draw(); const resize = () => { W = c.width = c.offsetWidth; H = c.height = c.offsetHeight; }; window.addEventListener("resize", resize); return () => { cancelAnimationFrame(r); window.removeEventListener("resize", resize); }; }, []);
  return <canvas ref={canvas} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }} />;
}

// ════════════════════════════════════════
// NAVBAR
// ════════════════════════════════════════
function NavBar({ page, setPage }) {
  const tabs = [
    { id: "home",     iconN: "Home",     label: "الرئيسية" },
    { id: "results",  iconN: "BarChart2", label: "نتائج النموذج" },
    { id: "clusters", iconN: "Layers",   label: "التحليل التجميعي" },
    { id: "predict",  iconN: "Zap",      label: "التنبؤ" },
  ];
  return (
    <nav style={{ background: P.card, borderBottom: `1px solid ${P.border}`, position: "sticky", top: 0, zIndex: 999, boxShadow: "0 1px 12px rgba(15,23,42,0.07)" }}>
      <div style={{ padding: "0 28px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 11, padding: "12px 0" }}>
          <div style={{ width: 37, height: 37, borderRadius: 10, background: `linear-gradient(135deg, ${P.blue}, ${P.violet})`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 4px 14px ${P.blue}45`, fontSize: 17, fontWeight: 900, color: "white" }}>و</div>
          <div>
            <div style={{ color: P.text, fontSize: 16, fontWeight: 900, letterSpacing: -0.5 }}>وِقَايَة</div>
            <div style={{ color: P.ghost, fontSize: 9, letterSpacing: 0.8, marginTop: 1 }}>نظام التنبؤ المبكر بالاستقالات</div>
          </div>
        </div>
        <div style={{ display: "flex" }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setPage(t.id)} style={{
              padding: "13px 15px", border: "none", background: "transparent",
              borderBottom: `2px solid ${page === t.id ? P.blue : "transparent"}`,
              color: page === t.id ? P.blue : P.ghost,
              fontSize: 12, fontWeight: page === t.id ? 700 : 500,
              cursor: "pointer", transition: "all 0.2s",
              display: "flex", alignItems: "center", gap: 6,
            }}>
              <Icon name={t.iconN} size={13} color={page === t.id ? P.blue : P.ghost} />
              {t.label}
            </button>
          ))}
        </div>
        <div style={{ display: "flex", gap: 7 }}>
          <Pill label="XGBoost" color={P.emerald} />
          <Pill label="دقة 86.2%" color={P.blue} />
        </div>
      </div>
    </nav>
  );
}

// ════════════════════════════════════════
// PAGE 1 — الرئيسية (ستايل مثل الصورة)
// ════════════════════════════════════════
function HomePage({ goTo }) {
  const STEPS = [
    {
      step: 1,
      title: "جمع البيانات",
      desc: "استبيان 34 سؤال شمل 1,191 موظف حكومي سعودي من 10 قطاعات",
      icon: "FileText",
      color: P.blue,
    },
    {
      step: 2,
      title: "معالجة وتنظيف",
      desc: "ترميز المتغيرات + تجهيز السمات + هندسة 7 مؤشرات مركبة",
      icon: "Filter",
      color: P.sky,
    },
    {
      step: 3,
      title: "تحليل تجميعي",
      desc: "PCA (≈81%) + KMeans (K=3) لاكتشاف 3 أنماط سلوكية للموظفين",
      icon: "Layers",
      color: P.violet,
    },
    {
      step: 4,
      title: "نموذج تنبؤي",
      desc: "XGBoost بدقة اختبار ≈84% و ROC-AUC ≈92.5% لتقدير خطر المغادرة مبكرًا",
      icon: "TrendingUp",
      color: P.emerald,
    },
  ];

  const TARGETS = [
    {
      title: "إدارات الموارد البشرية",
      desc: "تعرف الموظف اللي ممكن يستقيل وتتدخل قبل فوات الأوان بخطة احتفاظ مناسبة",
      icon: "Users",
      color: P.violet,
    },
    {
      title: "صنّاع القرار",
      desc: "يفهمون أسباب دوران الموظفين ويصمّمون سياسات احتفاظ فعّالة مبنية على بيانات",
      icon: "Target",
      color: P.blue,
    },
    {
      title: "الباحثون والأكاديميون",
      desc: "نموذج قابل للتطبيق والتوسع على أي منظمة حكومية سعودية لدعم الدراسات والتحسين",
      icon: "Award",
      color: P.emerald,
    },
  ];

  const Section = ({ kicker, title, children }) => (
    <div style={{ background: P.card, border: `1px solid ${P.border}`, borderRadius: 18, boxShadow: P.shadow, overflow: "hidden", marginBottom: 16 }}>
      <div style={{ padding: "16px 18px", borderBottom: `1px solid ${P.border}` }}>
        <div style={{ color: P.ghost, fontSize: 12, fontWeight: 700, marginBottom: 6 }}>{kicker}</div>
        <div style={{ color: P.text, fontSize: 22, fontWeight: 900 }}>{title}</div>
      </div>
      <div style={{ padding: 18 }}>{children}</div>
    </div>
  );

  const Card = ({ top, title, desc, icon, color }) => (
    <div style={{
      background: "#f8fafc",
      border: `1px solid ${P.border}`,
      borderRadius: 16,
      padding: "18px 16px",
      minHeight: 150,
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      position: "relative",
    }}>
      {/* icon box */}
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}>
        <div style={{
          width: 52, height: 52, borderRadius: 14,
          background: color + "12",
          display: "flex", alignItems: "center", justifyContent: "center",
          border: `1px solid ${color}22`,
        }}>
          <Icon name={icon} size={22} color={color} />
        </div>
      </div>

      {/* top label */}
      {top && (
        <div style={{ textAlign: "center", color: color, fontSize: 14, fontWeight: 800, marginBottom: 8 }}>
          {top}
        </div>
      )}

      <div style={{ textAlign: "center" }}>
        <div style={{ color: P.text, fontSize: 18, fontWeight: 900, marginBottom: 8 }}>
          {title}
        </div>
        <div style={{ color: P.ghost2, fontSize: 13, lineHeight: 1.9 }}>
          {desc}
        </div>
      </div>
    </div>
  );

  const CTA = () => (
    <div style={{
      background: P.card,
      border: `1px solid ${P.border}`,
      borderRadius: 18,
      boxShadow: P.shadow,
      padding: 16,
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      gap: 12,
      flexWrap: "wrap",
    }}>
      <div>
        <div style={{ color: P.text, fontSize: 14, fontWeight: 900, marginBottom: 4 }}>
          جاهز تبدأ؟
        </div>
        <div style={{ color: P.ghost2, fontSize: 12, lineHeight: 1.8 }}>
          انتقل مباشرة لصفحة النتائج أو التحليل التجميعي أو صفحة التنبؤ.
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button
          onClick={() => goTo("results")}
          style={{
            padding: "10px 14px",
            borderRadius: 12,
            border: `1px solid ${P.border}`,
            background: P.bg,
            color: P.text2,
            fontSize: 12,
            fontWeight: 800,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 7,
          }}
        >
          <Icon name="BarChart2" size={14} color={P.text2} />
          نتائج النموذج
          <Icon name="ArrowLeft" size={14} color={P.text2} />
        </button>

        <button
          onClick={() => goTo("clusters")}
          style={{
            padding: "10px 14px",
            borderRadius: 12,
            border: `1px solid ${P.border}`,
            background: P.bg,
            color: P.text2,
            fontSize: 12,
            fontWeight: 800,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 7,
          }}
        >
          <Icon name="Layers" size={14} color={P.text2} />
          التحليل التجميعي
          <Icon name="ArrowLeft" size={14} color={P.text2} />
        </button>

        <button
          onClick={() => goTo("predict")}
          style={{
            padding: "10px 16px",
            borderRadius: 12,
            border: "none",
            background: `linear-gradient(135deg,${P.blue},${P.violet})`,
            color: "white",
            fontSize: 12,
            fontWeight: 900,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 7,
            boxShadow: `0 6px 18px ${P.blue}35`,
          }}
        >
          <Icon name="Zap" size={14} color="white" />
          ابدأ التنبؤ
          <Icon name="ArrowLeft" size={14} color="white" />
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "calc(100vh - 57px)", background: P.bg, direction: "rtl" }}>
     {/* HERO — مثل التصميم القديم (عريض + متمركز) */}
<div
  style={{
    position: "relative",
    background: `linear-gradient(135deg, #1e3a8a 0%, ${P.blue} 52%, ${P.violet} 100%)`,
    padding: "78px 28px 86px",
    overflow: "hidden",
  }}
>
  <ParticlesBg />

  {/* زخرفة خفيفة */}
  <div
    style={{
      position: "absolute",
      inset: 0,
      background:
        "radial-gradient(800px 260px at 50% 80%, rgba(255,255,255,0.12), transparent 55%)",
      pointerEvents: "none",
    }}
  />

  <div style={{ maxWidth: 980, margin: "0 auto", textAlign: "center", position: "relative" }}>
    <div style={{ color: "rgba(255,255,255,0.75)", fontSize: 13, fontWeight: 700, marginBottom: 10 }}>
      نظام تعلم الآلة للتنبؤ المبكر بالاستقالات
    </div>

    <h1
      style={{
        color: "white",
        fontSize: 78,
        fontWeight: 900,
        margin: "0 0 10px",
        letterSpacing: -2.2,
        textShadow: "0 10px 40px rgba(0,0,0,0.25)",
      }}
    >
      وِقَايَة
    </h1>

    <p
      style={{
        color: "rgba(255,255,255,0.9)",
        fontSize: 18,
        fontWeight: 700,
        margin: "0 auto 10px",
        maxWidth: 720,
        lineHeight: 2,
      }}
    >
      يحلل بيانات الموظف، ويعطيك احتمال المغادرة، ويحدّد نمطه السلوكي ضمن 3 مجموعات
      مع توصيات تدخل واضحة.
    </p>

    <p
      style={{
        color: "rgba(255,255,255,0.62)",
        fontSize: 13,
        margin: "0 auto 34px",
        maxWidth: 620,
        lineHeight: 2,
      }}
    >
      يساعد إدارات الموارد البشرية على التدخل المبكر وتقليل الاستقالات المفاجئة.
    </p>

    {/* STATS — مثل القديم */}
    <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
      {[
        { v: "34", l: "سؤال" },
        { v: "3", l: "مجموعات" },
        { v: "86.2%", l: "دقة" },
        { v: "1,191", l: "عينة" },
      ].map((s, i) => (
        <div
          key={i}
          style={{
            width: 150,
            padding: "18px 16px",
            background: "rgba(255,255,255,0.12)",
            border: "1px solid rgba(255,255,255,0.18)",
            borderRadius: 14,
            backdropFilter: "blur(10px)",
            boxShadow: "0 10px 26px rgba(0,0,0,0.12)",
          }}
        >
          <div style={{ color: "white", fontSize: 28, fontWeight: 900 }}>{s.v}</div>
          <div style={{ color: "rgba(255,255,255,0.65)", fontSize: 11, marginTop: 6 }}>{s.l}</div>
        </div>
      ))}
    </div>

    {/* أزرار التنقل (خفيفة) */}
    <div style={{ marginTop: 28, display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
      <button
        onClick={() => goTo("predict")}
        style={{
          padding: "12px 18px",
          borderRadius: 12,
          border: "none",
          background: "rgba(255,255,255,0.18)",
          color: "white",
          fontSize: 12.5,
          fontWeight: 900,
          cursor: "pointer",
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <Icon name="Zap" size={14} color="white" />
        ابدأ التنبؤ
        <Icon name="ArrowLeft" size={14} color="white" />
      </button>

      <button
        onClick={() => goTo("clusters")}
        style={{
          padding: "12px 18px",
          borderRadius: 12,
          border: "1px solid rgba(255,255,255,0.22)",
          background: "transparent",
          color: "rgba(255,255,255,0.9)",
          fontSize: 12.5,
          fontWeight: 900,
          cursor: "pointer",
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <Icon name="Layers" size={14} color="rgba(255,255,255,0.9)" />
        التحليل التجميعي
      </button>

      <button
        onClick={() => goTo("results")}
        style={{
          padding: "12px 18px",
          borderRadius: 12,
          border: "1px solid rgba(255,255,255,0.22)",
          background: "transparent",
          color: "rgba(255,255,255,0.9)",
          fontSize: 12.5,
          fontWeight: 900,
          cursor: "pointer",
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <Icon name="BarChart2" size={14} color="rgba(255,255,255,0.9)" />
        نتائج النموذج
      </button>
    </div>
  </div>
</div>

      {/* CONTENT */}
      <div style={{ padding: "10px 28px 30px", maxWidth: 1100, margin: "0 auto" }}>
        <Section kicker="خطوات المشروع" title="كيف يشتغل النظام؟">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14 }}>
            {STEPS.map((s) => (
              <Card
                key={s.step}
                top={`الخطوة ${s.step}`}
                title={s.title}
                desc={s.desc}
                icon={s.icon}
                color={s.color}
              />
            ))}
          </div>
        </Section>

        <Section kicker="الفئة المستهدفة" title="مين يستفيد من وقاية؟">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}>
            {TARGETS.map((t, i) => (
              <Card
                key={i}
                top={null}
                title={t.title}
                desc={t.desc}
                icon={t.icon}
                color={t.color}
              />
            ))}
          </div>
        </Section>

        <CTA />
      </div>
    </div>
  );
}
// ════════════════════════════════════════
// PAGE 2 — نتائج النموذج (XGBoost فقط)
// ════════════════════════════════════════
function ResultsPage() {
  const [tab, setTab] = useState("report");

  // === Final Test Metrics (مطابقة لنتائجك) ===
  const METRICS = {
    accuracy: 84,                      // 0.84
    auc: 92.5,                         // 0.9253
    recall_leavers: 74,                // recall للفئة 1
    precision_leavers: 87,             // precision للفئة 1
    f1_leavers: 80,                    // f1 للفئة 1
  };

  const REPORT_ROWS = [
    { cls: "سيبقى (0)", p: 0.82, r: 0.92, f: 0.87, s: 136, c: P.emerald },
    { cls: "سيغادر (1)", p: 0.87, r: 0.74, f: 0.80, s: 103, c: P.red },
  ];

  const AVG_ROWS = [
    { cls: "المتوسط الكلي (Macro Avg)", p: 0.85, r: 0.83, f: 0.83, s: 239, c: P.violet },
    { cls: "المتوسط الموزون (Weighted Avg)", p: 0.84, r: 0.84, f: 0.84, s: 239, c: P.blue },
  ];

  // Confusion Matrix Values
  const tn = 125, fp = 11, fn = 27, tp = 76;
  const total = 239;

  // Extra helpful derived metrics (تساعد في الشرح)
  const fpr = Math.round((fp / (fp + tn)) * 100);  // False Positive Rate
  const fnr = Math.round((fn / (fn + tp)) * 100);  // False Negative Rate

  return (
    <div style={{ padding: "22px 28px", background: P.bg, direction: "rtl" }}>
      {/* Metrics */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 10, marginBottom: 18 }}>
        {[
          { iconN:"Target",     label:"الدقة (Accuracy)",    v: METRICS.accuracy, c:P.blue,    s:"%" },
          { iconN:"Activity",   label:"F1 للمغادرين",       v: METRICS.f1_leavers, c:P.emerald, s:"%" },
          { iconN:"Compass",    label:"استدعاء المغادرين",  v: METRICS.recall_leavers, c:P.amber, s:"%" },
          { iconN:"CheckCircle",label:"Precision للمغادرين",v: METRICS.precision_leavers, c:P.violet, s:"%" },
          { iconN:"BarChart2",  label:"ROC-AUC",            v: METRICS.auc, c:P.sky, s:"%" },
        ].map((m, i) => {
          const cv = useCountUp(m.v, true, 900);
          return (
            <div key={i} style={{ background: P.card, borderRadius: 16, border: `1px solid ${P.border}`, boxShadow: P.shadow, padding: 16, borderTop: `3px solid ${m.c}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ color: P.ghost, fontSize: 10, fontWeight: 700 }}>{m.label}</span>
                <Icon name={m.iconN} size={16} color={m.c} />
              </div>
              <div style={{ color: m.c, fontSize: 26, fontWeight: 900 }}>{cv}{m.s}</div>
              <div style={{ marginTop: 8 }}><AnimBar v={m.v} max={100} color={m.c} delay={i * 100} /></div>
            </div>
          );
        })}
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
        {[
          {id:"report",label:"تقرير التصنيف",iconN:"Filter"},
          {id:"confusion",label:"مصفوفة الالتباس",iconN:"Database"},
          {id:"explainer",label:"شرح النتائج",iconN:"FileText"},
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            padding: "7px 15px", borderRadius: 10,
            border: `1px solid ${tab === t.id ? P.blue : P.border}`,
            background: tab === t.id ? P.blueSoft : P.card,
            color: tab === t.id ? P.blue : P.ghost,
            fontSize: 12, fontWeight: tab === t.id ? 800 : 600,
            cursor: "pointer", display: "flex", alignItems: "center", gap: 6
          }}>
            <Icon name={t.iconN} size={12} color={tab === t.id ? P.blue : P.ghost} />
            {t.label}
          </button>
        ))}
      </div>

      {/* REPORT */}
      {tab === "report" && (
        <div style={{ background: P.card, borderRadius: 16, border: `1px solid ${P.border}`, boxShadow: P.shadow, overflow: "hidden" }}>
          <div style={{ padding: "13px 18px", borderBottom: `1px solid ${P.border}` }}>
            <div style={{ color: P.ghost, fontSize: 9.5, fontWeight: 800, letterSpacing: 1.4 }}>Final Test — XGBoost</div>
            <div style={{ color: P.text, fontSize: 14, fontWeight: 900, marginTop: 2 }}>Classification Report (مطابق لنتائج التدريب)</div>
          </div>

          <div style={{ padding: 20 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1.7fr 1fr 1fr 1fr 1fr", gap: 6, marginBottom: 8 }}>
              {["", "Precision", "Recall", "F1", "Support"].map((h, i) => (
                <div key={i} style={{ color: P.ghost, fontSize: 10, fontFamily: "monospace", fontWeight: 800, textAlign: i > 0 ? "center" : "right", padding: "4px 8px" }}>
                  {h}
                </div>
              ))}
            </div>

            {REPORT_ROWS.map((row, i) => (
              <div key={i} style={{ display: "grid", gridTemplateColumns: "1.7fr 1fr 1fr 1fr 1fr", gap: 6, marginBottom: 6 }}>
                <div style={{ padding: "10px 12px", background: row.c + "0e", borderRadius: 10, color: row.c, fontSize: 12, fontWeight: 900, border: `1px solid ${row.c}20` }}>
                  {row.cls}
                </div>
                {[row.p, row.r, row.f, row.s].map((v, j) => (
                  <div key={j} style={{ padding: "10px", background: P.bg, borderRadius: 10, textAlign: "center", color: P.text, fontSize: 13, fontWeight: 800 }}>
                    {typeof v === "number" && j < 3 ? v.toFixed(2) : v}
                  </div>
                ))}
              </div>
            ))}

            {AVG_ROWS.map((row, i) => (
              <div key={i} style={{ display: "grid", gridTemplateColumns: "1.7fr 1fr 1fr 1fr 1fr", gap: 6, marginTop: 8 }}>
                <div style={{ padding: "10px 12px", background: row.c + "0b", borderRadius: 10, color: row.c, fontSize: 12, fontWeight: 900, border: `1px solid ${row.c}18` }}>
                  {row.cls}
                </div>
                {[row.p, row.r, row.f, row.s].map((v, j) => (
                  <div key={j} style={{ padding: "10px", background: P.bg, borderRadius: 10, textAlign: "center", color: P.text, fontSize: 13, fontWeight: 800 }}>
                    {j < 3 ? v.toFixed(2) : v}
                  </div>
                ))}
              </div>
            ))}

            <div style={{ marginTop: 14, padding: "13px 15px", background: P.amberSoft, border: `1px solid ${P.amber}22`, borderRadius: 12 }}>
              <div style={{ color: P.amber, fontWeight: 900, fontSize: 12, marginBottom: 5 }}>ملاحظة سريعة</div>
              <div style={{ color: P.text2, fontSize: 11.5, lineHeight: 1.9 }}>
                استدعاء المغادرين (Class 1) = <b>0.74</b> يعني من كل 100 موظف سيغادر — النموذج يكتشف 74 ويفوّت 26.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CONFUSION MATRIX */}
      {tab === "confusion" && (
        <div style={{ background: P.card, borderRadius: 16, border: `1px solid ${P.border}`, boxShadow: P.shadow, padding: 22 }}>
          <div style={{ marginBottom: 14 }}>
            <div style={{ color: P.ghost, fontSize: 9.5, fontWeight: 800, letterSpacing: 1.4 }}>Confusion Matrix</div>
            <div style={{ color: P.text, fontSize: 14, fontWeight: 900, marginTop: 2 }}>[[125, 11], [27, 76]]</div>
          </div>

          <div style={{ textAlign: "center", color: P.ghost, fontSize: 10, marginBottom: 10 }}>التوقع ←</div>

          <div style={{ display: "grid", gridTemplateColumns: "auto 1fr 1fr", gap: 10, alignItems: "center", maxWidth: 520, margin: "0 auto" }}>
            <div />
            {["توقع: سيبقى (0)", "توقع: سيغادر (1)"].map((h, i) => (
              <div key={i} style={{ textAlign: "center", color: i === 0 ? P.emerald : P.red, fontSize: 11.5, fontWeight: 900 }}>
                {h}
              </div>
            ))}

            <div style={{ color: P.emerald, fontSize: 11, fontWeight: 900 }}>فعلاً بقي (0)</div>
            {[
              { v: tn, tag: "TN", label: "صحيح سلبي", hint: "توقّع بقاء وكان فعلاً بقاء", c: P.emerald, strong: true },
              { v: fp, tag: "FP", label: "إيجابي كاذب", hint: "توقّع مغادرة لكنه بقي", c: P.red },
            ].map((cell, i) => (
              <div key={i} style={{ background: cell.c + "10", border: `2px solid ${cell.c}${cell.strong ? "55" : "25"}`, borderRadius: 14, padding: "18px", textAlign: "center" }}>
                <div style={{ color: cell.c, fontSize: 40, fontWeight: 900 }}>{cell.v}</div>
                <div style={{ marginTop: 6, display: "flex", justifyContent: "center", gap: 8, alignItems: "center" }}>
                  <Pill label={cell.tag} color={cell.c} />
                  <span style={{ color: cell.c, fontSize: 11, fontWeight: 900 }}>{cell.label}</span>
                </div>
                <div style={{ color: P.ghost2, fontSize: 11, marginTop: 8, lineHeight: 1.7 }}>{cell.hint}</div>
              </div>
            ))}

            <div style={{ color: P.red, fontSize: 11, fontWeight: 900 }}>فعلاً غادر (1)</div>
            {[
              { v: fn, tag: "FN", label: "سلبي كاذب ⚠️", hint: "توقّع بقاء لكنه غادر (أخطر حالة)", c: P.amber },
              { v: tp, tag: "TP", label: "صحيح إيجابي", hint: "توقّع مغادرة وكان فعلاً مغادرة", c: P.emerald, strong: true },
            ].map((cell, i) => (
              <div key={i} style={{ background: cell.c + "10", border: `2px solid ${cell.c}${cell.strong ? "55" : "25"}`, borderRadius: 14, padding: "18px", textAlign: "center" }}>
                <div style={{ color: cell.c, fontSize: 40, fontWeight: 900 }}>{cell.v}</div>
                <div style={{ marginTop: 6, display: "flex", justifyContent: "center", gap: 8, alignItems: "center" }}>
                  <Pill label={cell.tag} color={cell.c} />
                  <span style={{ color: cell.c, fontSize: 11, fontWeight: 900 }}>{cell.label}</span>
                </div>
                <div style={{ color: P.ghost2, fontSize: 11, marginTop: 8, lineHeight: 1.7 }}>{cell.hint}</div>
              </div>
            ))}
          </div>

          {/* Impact explainer */}
          <div style={{ marginTop: 16, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div style={{ padding: 14, background: P.redSoft, border: `1px solid ${P.red}25`, borderRadius: 12 }}>
              <div style={{ color: P.red, fontSize: 12.5, fontWeight: 900, marginBottom: 6 }}>ماذا يعني FP (إيجابي كاذب)؟</div>
              <div style={{ color: P.text2, fontSize: 11.5, lineHeight: 1.9 }}>
                النموذج “ينبّه” أنك قد تخسر موظف لكنه بالحقيقة سيبقى. تأثيره: <b>تشتيت الموارد</b> أو تدخل غير لازم.
                <div style={{ marginTop: 8, color: P.ghost2 }}>معدل FP ≈ {fpr}% من الذين سيبقون.</div>
              </div>
            </div>

            <div style={{ padding: 14, background: P.amberSoft, border: `1px solid ${P.amber}25`, borderRadius: 12 }}>
              <div style={{ color: P.amber, fontSize: 12.5, fontWeight: 900, marginBottom: 6 }}>ماذا يعني FN (سلبي كاذب)؟</div>
              <div style={{ color: P.text2, fontSize: 11.5, lineHeight: 1.9 }}>
                النموذج يقول “سيبقى” لكنه بالحقيقة سيغادر. تأثيره: <b>فقدان موظف بدون إنذار</b> (عادةً هو الأخطر في HR).
                <div style={{ marginTop: 8, color: P.ghost2 }}>معدل FN ≈ {fnr}% من الذين سيغادرون.</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* EXPLAINER */}
      {tab === "explainer" && (
        <div style={{ background: P.card, borderRadius: 16, border: `1px solid ${P.border}`, boxShadow: P.shadow, overflow: "hidden" }}>
          <div style={{ padding: "13px 18px", borderBottom: `1px solid ${P.border}` }}>
            <div style={{ color: P.ghost, fontSize: 9.5, fontWeight: 800, letterSpacing: 1.4 }}>شرح مبسّط</div>
            <div style={{ color: P.text, fontSize: 14, fontWeight: 900, marginTop: 2 }}>كيف نقرأ الأرقام بسرعة؟</div>
          </div>

          <div style={{ padding: 18, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div style={{ padding: 14, background: P.bg, border: `1px solid ${P.border}`, borderRadius: 12 }}>
              <div style={{ color: P.text, fontSize: 12.5, fontWeight: 900, marginBottom: 6 }}>Precision (للمغادرين)</div>
              <div style={{ color: P.text2, fontSize: 11.5, lineHeight: 1.9 }}>
                إذا النموذج قال “سيغادر”، كم مرة يكون كلامه صحيح؟
                <div style={{ marginTop: 8, color: P.violet, fontWeight: 900 }}>هنا = 0.87</div>
              </div>
            </div>

            <div style={{ padding: 14, background: P.bg, border: `1px solid ${P.border}`, borderRadius: 12 }}>
              <div style={{ color: P.text, fontSize: 12.5, fontWeight: 900, marginBottom: 6 }}>Recall (للمغادرين)</div>
              <div style={{ color: P.text2, fontSize: 11.5, lineHeight: 1.9 }}>
                من كل الموظفين الذين سيغادرون فعلًا، كم واحد اكتشفهم النموذج؟
                <div style={{ marginTop: 8, color: P.amber, fontWeight: 900 }}>هنا = 0.74</div>
              </div>
            </div>

            <div style={{ padding: 14, background: P.bg, border: `1px solid ${P.border}`, borderRadius: 12 }}>
              <div style={{ color: P.text, fontSize: 12.5, fontWeight: 900, marginBottom: 6 }}>F1 (للمغادرين)</div>
              <div style={{ color: P.text2, fontSize: 11.5, lineHeight: 1.9 }}>
                توازن بين Precision و Recall. جيد إذا تبغى حكم “عادل” بين الإنذارات الزائدة وتفويت الحالات.
                <div style={{ marginTop: 8, color: P.emerald, fontWeight: 900 }}>هنا = 0.80</div>
              </div>
            </div>

            <div style={{ padding: 14, background: P.bg, border: `1px solid ${P.border}`, borderRadius: 12 }}>
              <div style={{ color: P.text, fontSize: 12.5, fontWeight: 900, marginBottom: 6 }}>ROC-AUC</div>
              <div style={{ color: P.text2, fontSize: 11.5, lineHeight: 1.9 }}>
                يقيس قدرة النموذج على التفريق بين “سيغادر” و “سيبقى” عبر عتبات مختلفة.
                <div style={{ marginTop: 8, color: P.sky, fontWeight: 900 }}>هنا = 0.925 (ممتاز)</div>
              </div>
            </div>
          </div>

          <div style={{ padding: "0 18px 18px" }}>
            <div style={{ padding: 14, background: P.emeraldSoft, border: `1px solid ${P.emerald}22`, borderRadius: 12 }}>
              <div style={{ color: P.emerald, fontSize: 12.5, fontWeight: 900, marginBottom: 6 }}>متى نعدّل العتبة (Threshold)؟</div>
              <div style={{ color: P.text2, fontSize: 11.5, lineHeight: 1.9 }}>
                إذا هدفك تقلل <b>تفويت المغادرين (FN)</b>، ممكن تنزل العتبة من 0.50 إلى 0.40 مثلاً
                عشان تزيد Recall — لكن غالبًا يزيد FP. (قرار يعتمد على سياسة HR).
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════
// PAGE 3 — التحليل التجميعي
// ════════════════════════════════════════
function ClustersPage() {
  const [active, setActive] = useState(0);
  const C = CLUSTERS[active];
  const radarData = ["الإرهاق","الركود","الانفصال","فجوة التعويض","الدعم","التوازن"].map((s, i) => ({ subject: s, A: C.radar[i] }));

  return (
    <div style={{ padding: "22px 28px", background: P.bg, direction: "rtl" }}>
      {/* Header */}
      <div style={{ background: P.card, borderRadius: 16, border: `1px solid ${P.border}`, boxShadow: P.shadow, marginBottom: 18, padding: "14px 18px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ color: P.ghost, fontSize: 9.5, fontWeight: 700, letterSpacing: 1.5, marginBottom: 4 }}>التحليل التجميعي — 3 أنماط من الموظفين</div>
          <div style={{ color: P.text, fontSize: 17, fontWeight: 900 }}>تصنيف الموظفين حسب سلوكهم الوظيفي</div>
        </div>
        <div style={{ display: "flex", gap: 7 }}><Pill label="جودة التجميع: 0.175" color={P.blue} size="md" /><Pill label="تقليل أبعاد 80%" color={P.violet} size="md" /></div>
      </div>

      {/* Tabs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 18 }}>
        {CLUSTERS.map((cl, i) => (
          <div key={i} onClick={() => setActive(i)} style={{ background: P.card, borderRadius: 16, border: `1px solid ${active === i ? cl.c : P.border}`, boxShadow: P.shadow, padding: 18, cursor: "pointer", transition: "all 0.25s", borderTop: `3px solid ${active === i ? cl.c : "transparent"}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 11 }}>
              <div style={{ width: 40, height: 40, borderRadius: 11, background: cl.c + "15", display: "flex", alignItems: "center", justifyContent: "center" }}><Icon name={cl.iconN} size={20} color={cl.c} /></div>
              <div style={{ textAlign: "center" }}><div style={{ color: cl.c, fontSize: 24, fontWeight: 900 }}>{cl.n}</div><div style={{ color: P.ghost, fontSize: 10 }}>موظف</div></div>
            </div>
            <div style={{ color: active === i ? cl.c : P.text, fontSize: 14, fontWeight: 800, marginBottom: 4 }}>{cl.name}</div>
            <div style={{ color: P.ghost, fontSize: 11, marginBottom: 8, lineHeight: 1.6 }}>{cl.chars}</div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <span style={{ color: P.ghost, fontSize: 10 }}>نسبة المغادرة</span>
              <span style={{ color: cl.attrition > 50 ? P.red : cl.attrition > 30 ? P.amber : P.emerald, fontSize: 18, fontWeight: 900 }}>{cl.attrition}%</span>
            </div>
            <AnimBar v={cl.attrition} max={60} color={cl.attrition > 50 ? P.red : cl.attrition > 30 ? P.amber : P.emerald} delay={i * 100} />
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.7fr", gap: 14 }}>
        {/* Profile */}
        <div style={{ background: P.card, borderRadius: 16, border: `1px solid ${P.border}`, boxShadow: P.shadow, overflow: "hidden" }}>
          <div style={{ padding: "13px 17px", background: C.c + "08", borderBottom: `1px solid ${C.c}18` }}>
            <div style={{ color: C.c, fontSize: 16, fontWeight: 900 }}>{C.name}</div>
            <div style={{ color: P.ghost, fontSize: 11, marginTop: 4, lineHeight: 1.7 }}>{C.desc}</div>
          </div>
          <div style={{ padding: 17 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 13 }}>
              {[{ l: "عدد الموظفين", v: C.n, c: C.c },{ l: "النسبة من الكل", v: C.pct + "%", c: C.c },{ l: "نسبة المغادرة", v: C.attrition + "%", c: C.attrition > 50 ? P.red : C.attrition > 30 ? P.amber : P.emerald },{ l: "مستوى الخطر", v: C.id === 2 ? "عالي" : C.id === 0 ? "منخفض" : "متوسط", c: C.id === 2 ? P.red : C.id === 0 ? P.emerald : P.amber }].map((s, i) => (
                <div key={i} style={{ padding: 9, background: P.bg, borderRadius: 9, textAlign: "center" }}>
                  <div style={{ color: s.c, fontSize: 15, fontWeight: 900 }}>{s.v}</div>
                  <div style={{ color: P.ghost, fontSize: 9, marginTop: 2 }}>{s.l}</div>
                </div>
              ))}
            </div>
            {/* Scores */}
            <div style={{ marginBottom: 9 }}>
              <div style={{ color: P.ghost, fontSize: 9, fontWeight: 700, letterSpacing: 1, marginBottom: 6 }}>المؤشرات المركبة (متوسط المجموعة)</div>
              {C.scoreLabels.map((s, i) => (
                <div key={i} style={{ marginBottom: 6 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                    <span style={{ color: P.ghost, fontSize: 10 }}>{s.l}</span>
                    <span style={{ color: [P.red, P.amber, "#ea580c", P.violet][i], fontSize: 11, fontWeight: 800 }}>{s.v}/{s.max}</span>
                  </div>
                  <AnimBar v={s.v} max={s.max} color={[P.red, P.amber, "#ea580c", P.violet][i]} delay={i * 60} />
                </div>
              ))}
            </div>
            <div style={{ padding: "11px 13px", background: P.emeraldSoft, border: `1px solid ${P.emerald}20`, borderRadius: 10 }}>
              <div style={{ color: P.ghost, fontSize: 10, marginBottom: 4 }}>التدخل المقترح</div>
              <div style={{ color: P.emerald, fontSize: 12, fontWeight: 700 }}>{C.fix}</div>
            </div>
          </div>
        </div>

        {/* Radar + Features + Actions */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ background: P.card, borderRadius: 16, border: `1px solid ${P.border}`, boxShadow: P.shadow, overflow: "hidden" }}>
            <div style={{ padding: "13px 17px", borderBottom: `1px solid ${P.border}` }}><div style={{ color: P.text, fontSize: 14, fontWeight: 800 }}>خصائص المجموعة</div></div>
            <div style={{ padding: 17, display: "flex", gap: 14 }}>
              <ResponsiveContainer width="45%" height={200}>
                <RadarChart data={radarData}><PolarGrid stroke={P.border} /><PolarAngleAxis dataKey="subject" tick={{ fill: P.ghost, fontSize: 10 }} /><Radar dataKey="A" stroke={C.c} fill={C.c} fillOpacity={0.15} strokeWidth={2.5} dot={{ fill: C.c, r: 4 }} /></RadarChart>
              </ResponsiveContainer>
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
                <div style={{ color: P.ghost, fontSize: 9.5, fontWeight: 700, letterSpacing: 1.5, marginBottom: 2 }}>أبرز الخصائص المميزة</div>
                {C.features.map((f, i) => (
                  <div key={i} style={{ padding: "6px 10px", background: P.bg, border: `1px solid ${P.border}`, borderRadius: 7, fontSize: 11, color: P.text2, display: "flex", gap: 7 }}>
                    <span style={{ color: C.c, fontWeight: 800, fontSize: 10, minWidth: 14 }}>{i + 1}</span>{f}
                  </div>
                ))}
                <div style={{ color: P.ghost, fontSize: 9.5, fontWeight: 700, letterSpacing: 1.5, marginTop: 5, marginBottom: 2 }}>الإجراءات المقترحة</div>
                {C.actions.map((a, i) => (
                  <div key={i} style={{ padding: "8px 12px", background: C.soft, border: `1px solid ${C.c}18`, borderRight: `3px solid ${C.c}`, borderRadius: 8, display: "flex", gap: 9, transition: "all 0.2s", cursor: "default" }}
                    onMouseEnter={e => e.currentTarget.style.transform = "translateX(-4px)"} onMouseLeave={e => e.currentTarget.style.transform = "translateX(0)"}>
                    <span style={{ color: C.c, fontWeight: 900, fontSize: 11, minWidth: 20 }}>0{i + 1}</span><span style={{ color: P.text2, fontSize: 12 }}>{a}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════
// PAGE 4 — التنبؤ (استبيان + ملف)
// ════════════════════════════════════════
function PredictPage() {
  const [mode, setMode] = useState("survey"); // survey | file
  const [form, setForm] = useState({});
  const [result, setResult] = useState(null);
  const [fileResult, setFileResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeSec, setActiveSec] = useState(0);
  const [animScore, setAnimScore] = useState(0);
  const [error, setError] = useState(null);

  const filled = Object.keys(form).length;
  const fillPct = Math.round((filled / SURVEY_TOTAL) * 100);
  const canRun = filled >= Math.round(SURVEY_TOTAL * 0.6);

  const predict = async () => {
    if (!canRun || loading) return;
    setLoading(true); setResult(null); setError(null);
    try {
      const res = await fetch(`${API}/predict`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const text = await res.text();  // أول شي نقرأه كنص
      let data;
      try { data = JSON.parse(text); } catch { throw new Error("السيرفر رجّع رد غير صالح: " + text.slice(0, 200)); }
      if (!data.success) throw new Error(data.error || "خطأ غير معروف");
      setResult(data);
      let s = 0;
      const target = Math.round(data.risk);
      const t = setInterval(() => { s += 2; setAnimScore(Math.min(s, target)); if (s >= target) clearInterval(t); }, 18);
    } catch (e) { setError(e.message); }
    setLoading(false);
  };

  const uploadFile = async (file) => {
    setLoading(true); setFileResult(null); setError(null);
    try {
      const fd = new FormData(); fd.append("file", file);
      const res = await fetch(`${API}/predict-file`, { method: "POST", body: fd });
      const text = await res.text();
      let data;
      try { data = JSON.parse(text); } catch { throw new Error("السيرفر رجّع رد غير صالح: " + text.slice(0, 200)); }
      if (!data.success) throw new Error(data.error || "خطأ غير معروف");
      setFileResult(data);
    } catch (e) { setError(e.message); }
    setLoading(false);
  };

  const CL = result ? CLUSTERS[result.cluster] : null;
  const riskColor = result ? (result.cluster === 2 ? P.red : result.cluster === 0 ? P.amber : P.emerald) : P.ghost;

  return (
    <div style={{ padding: "22px 28px", background: P.bg, direction: "rtl" }}>
      {/* Header + Mode Toggle */}
      <div style={{ background: P.card, borderRadius: 16, border: `1px solid ${P.border}`, boxShadow: P.shadow, marginBottom: 16, padding: "14px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ color: P.ghost, fontSize: 9.5, fontWeight: 700, letterSpacing: 1.5, marginBottom: 4 }}>التنبؤ بالمغادرة — مودل XGBoost الحقيقي</div>
          <div style={{ color: P.text, fontSize: 17, fontWeight: 900 }}>أدخل بيانات موظف أو ارفع ملف مجموعة</div>
        </div>
        <div style={{ display: "flex", gap: 5, background: P.bg, padding: 3, borderRadius: 10 }}>
          {[{ id: "survey", label: "استبيان فردي", iconN: "User" },{ id: "file", label: "رفع ملف", iconN: "FileText" }].map(m => (
            <button key={m.id} onClick={() => { setMode(m.id); setResult(null); setFileResult(null); setError(null); }} style={{ padding: "7px 16px", borderRadius: 8, border: "none", background: mode === m.id ? P.blue : "transparent", color: mode === m.id ? "white" : P.ghost, fontSize: 12, fontWeight: mode === m.id ? 700 : 500, cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }}>
              <Icon name={m.iconN} size={12} color={mode === m.id ? "white" : P.ghost} />{m.label}
            </button>
          ))}
        </div>
      </div>

      {error && <div style={{ padding: "12px 16px", background: P.redSoft, border: `1px solid ${P.red}30`, borderRadius: 12, marginBottom: 14, color: P.red, fontSize: 12 }}><b>خطأ: </b>{error}<br /><span style={{ color: P.ghost, fontSize: 11 }}>تأكد إن السيرفر شغّال: python backend.py</span></div>}

      {/* ═══ FILE MODE ═══ */}
      {mode === "file" && (
        <div>
          <div onDrop={e => { e.preventDefault(); if (e.dataTransfer.files[0]) uploadFile(e.dataTransfer.files[0]); }} onDragOver={e => e.preventDefault()}
            style={{ padding: "50px 28px", border: `2px dashed ${P.border2}`, background: P.card, textAlign: "center", borderRadius: 22, boxShadow: P.shadowMd, cursor: "pointer" }}
            onClick={() => { const inp = document.createElement("input"); inp.type = "file"; inp.accept = ".csv,.xlsx,.xls"; inp.onchange = e => { if (e.target.files[0]) uploadFile(e.target.files[0]); }; inp.click(); }}>
            {loading ? (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
                <div style={{ width: 50, height: 50, borderRadius: "50%", border: `3px solid ${P.border}`, borderTopColor: P.blue, animation: "spin 0.8s linear infinite" }} />
                <div style={{ color: P.blue, fontSize: 13, fontWeight: 700 }}>جاري تحليل الملف...</div>
              </div>
            ) : (
              <>
                <div style={{ width: 60, height: 60, borderRadius: 16, background: P.blueSoft, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}><Icon name="Upload" size={26} color={P.blue} /></div>
                <div style={{ color: P.text, fontSize: 16, fontWeight: 800, marginBottom: 6 }}>ارفع ملف الموظفين</div>
                <div style={{ color: P.ghost, fontSize: 12 }}>CSV أو Excel — نفس تنسيق بيانات الاستبيان الأصلي</div>
              </>
            )}
          </div>
          {/* File Results */}
          {fileResult && (
            <div style={{ marginTop: 18 }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, marginBottom: 16 }}>
                {[{ l: "إجمالي الموظفين", v: fileResult.total, c: P.blue },{ l: "سيغادرون", v: fileResult.leaving, c: P.red },{ l: "سيبقون", v: fileResult.staying, c: P.emerald },{ l: "نسبة المغادرة", v: fileResult.leaving_pct + "%", c: P.amber }].map((s, i) => (
                  <div key={i} style={{ background: P.card, borderRadius: 16, border: `1px solid ${P.border}`, boxShadow: P.shadow, padding: 16, textAlign: "center", borderTop: `3px solid ${s.c}` }}>
                    <div style={{ color: s.c, fontSize: 28, fontWeight: 900 }}>{s.v}</div>
                    <div style={{ color: P.ghost, fontSize: 10, marginTop: 3 }}>{s.l}</div>
                  </div>
                ))}
              </div>
              {/* Cluster Distribution */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 16 }}>
                {fileResult.clusters.map((cl, i) => (
                  <div key={i} style={{ background: P.card, borderRadius: 16, border: `1px solid ${CLUSTERS[cl.id].c}30`, boxShadow: P.shadow, padding: 14, display: "flex", gap: 11, alignItems: "center" }}>
                    <div style={{ width: 38, height: 38, borderRadius: 10, background: CLUSTERS[cl.id].c + "15", display: "flex", alignItems: "center", justifyContent: "center" }}><Icon name={CLUSTERS[cl.id].iconN} size={18} color={CLUSTERS[cl.id].c} /></div>
                    <div>
                      <div style={{ color: CLUSTERS[cl.id].c, fontSize: 13, fontWeight: 800 }}>{cl.name}</div>
                      <div style={{ color: P.ghost, fontSize: 11 }}>{cl.count} موظف ({fileResult.total > 0 ? Math.round(cl.count / fileResult.total * 100) : 0}%)</div>
                    </div>
                  </div>
                ))}
              </div>
              {/* Employee Table */}
              <div style={{ background: P.card, borderRadius: 16, border: `1px solid ${P.border}`, boxShadow: P.shadow, overflow: "hidden" }}>
                <div style={{ padding: "13px 18px", borderBottom: `1px solid ${P.border}` }}><div style={{ color: P.text, fontSize: 14, fontWeight: 800 }}>نتائج الموظفين</div></div>
                <div style={{ maxHeight: 400, overflow: "auto" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "60px 1fr 100px 100px", gap: 5, padding: "8px 18px" }}>
                    {["#", "المجموعة", "احتمال المغادرة", "التوقع"].map((h, i) => <div key={i} style={{ color: P.ghost, fontSize: 10, fontWeight: 700 }}>{h}</div>)}
                  </div>
                  {fileResult.employees.slice(0, 50).map((emp, i) => (
                    <div key={i} style={{ display: "grid", gridTemplateColumns: "60px 1fr 100px 100px", gap: 5, padding: "8px 18px", background: i % 2 === 0 ? P.bg : "transparent", alignItems: "center" }}>
                      <div style={{ color: P.ghost, fontSize: 11 }}>{emp.index + 1}</div>
                      <div style={{ color: CLUSTERS[emp.cluster].c, fontSize: 11, fontWeight: 700 }}>{emp.cluster_name}</div>
                      <div style={{ fontSize: 12, fontWeight: 800, color: emp.risk > 55 ? P.red : emp.risk > 35 ? P.amber : P.emerald }}>{emp.risk}%</div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: emp.prediction === "سيغادر" ? P.red : P.emerald }}>{emp.prediction}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ═══ SURVEY MODE ═══ */}
      {mode === "survey" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 20, alignItems: "start" }}>
          <div>
            {/* Progress */}
            <div style={{ height: 5, background: P.border, borderRadius: 3, marginBottom: 16, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${fillPct}%`, background: `linear-gradient(90deg,${P.blue},${P.violet})`, borderRadius: 3, transition: "width 0.4s cubic-bezier(.34,1.56,.64,1)" }} />
            </div>
            {/* Section Tabs */}
            <div style={{ display: "flex", gap: 6, marginBottom: 13, flexWrap: "wrap" }}>
              {SURVEY_SECTIONS.map((sec, i) => {
                const sf = sec.fields.filter(f => form[f.k]).length;
                return (
                  <button key={i} onClick={() => setActiveSec(i)} style={{ padding: "6px 12px", borderRadius: 10, border: `1px solid ${activeSec === i ? sec.color : P.border}`, background: activeSec === i ? sec.color + "0e" : P.card, color: activeSec === i ? sec.color : P.ghost, fontSize: 11, fontWeight: activeSec === i ? 700 : 500, cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }}>
                    <Icon name={sec.icon} size={12} color={activeSec === i ? sec.color : P.ghost} />{sec.title} <span style={{ color: sf === sec.fields.length ? P.emerald : sf > 0 ? sec.color : P.ghost, fontSize: 10, fontWeight: 700 }}>{sf}/{sec.fields.length}</span>
                  </button>
                );
              })}
            </div>
            {/* Fields */}
            {SURVEY_SECTIONS.map((sec, si) => activeSec === si && (
              <div key={si} style={{ background: P.card, borderRadius: 18, border: `1px solid ${P.border}`, overflow: "hidden", boxShadow: P.shadow }}>
                <div style={{ padding: "13px 18px", borderBottom: `1px solid ${P.border}`, background: sec.color + "06", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                    <div style={{ width: 35, height: 35, borderRadius: 10, background: sec.color + "14", display: "flex", alignItems: "center", justifyContent: "center" }}><Icon name={sec.icon} size={16} color={sec.color} /></div>
                    <div><div style={{ color: sec.color, fontSize: 13, fontWeight: 800 }}>{sec.title}</div><div style={{ color: P.ghost, fontSize: 10, marginTop: 1 }}>{sec.fields.filter(f => form[f.k]).length}/{sec.fields.length} مكتمل</div></div>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={() => si > 0 && setActiveSec(si - 1)} disabled={si === 0} style={{ padding: "5px 11px", borderRadius: 8, border: `1px solid ${P.border}`, background: "transparent", color: si === 0 ? P.ghost : P.text2, fontSize: 11, cursor: si === 0 ? "default" : "pointer" }}><Icon name="ChevronRight" size={12} /> السابق</button>
                    <button onClick={() => si < SURVEY_SECTIONS.length - 1 && setActiveSec(si + 1)} disabled={si === SURVEY_SECTIONS.length - 1} style={{ padding: "5px 12px", borderRadius: 8, border: "none", background: si === SURVEY_SECTIONS.length - 1 ? P.border : sec.color, color: si === SURVEY_SECTIONS.length - 1 ? P.ghost : "white", fontSize: 11, cursor: si === SURVEY_SECTIONS.length - 1 ? "default" : "pointer", fontWeight: 700 }}>التالي <Icon name="ChevronLeft" size={12} /></button>
                  </div>
                </div>
                <div style={{ padding: "17px 18px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 9 }}>
                  {sec.fields.map(f => (
                    <div key={f.k} style={{ padding: "12px 14px", background: P.bg, border: `1.5px solid ${form[f.k] ? sec.color + "55" : P.border}`, borderRadius: 12, transition: "all 0.2s" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 7 }}>
                        <div style={{ color: P.ghost, fontSize: 10, fontWeight: 600, lineHeight: 1.45, flex: 1, paddingLeft: 4 }}>{f.l}</div>
                        {form[f.k] && <div style={{ width: 16, height: 16, borderRadius: "50%", background: sec.color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Icon name="Check" size={9} color="white" /></div>}
                      </div>
                      <select value={form[f.k] || ""} onChange={e => setForm(p => ({ ...p, [f.k]: e.target.value }))} style={{ width: "100%", background: "transparent", border: "none", color: form[f.k] ? P.text : P.ghost, fontSize: 12, fontWeight: form[f.k] ? 700 : 400, cursor: "pointer", outline: "none" }}>
                        <option value="">اختر...</option>
                        {f.opts.map(o => <option key={o} value={o}>{o}</option>)}
                      </select>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            {/* Run */}
            <div style={{ marginTop: 13 }}>
              <button onClick={predict} disabled={!canRun || loading} style={{ width: "100%", padding: "14px", borderRadius: 13, border: "none", background: canRun ? `linear-gradient(135deg,${P.blue},${P.violet})` : P.border, color: canRun ? "white" : P.ghost, fontSize: 14, fontWeight: 800, cursor: canRun ? "pointer" : "default", boxShadow: canRun ? `0 6px 22px ${P.blue}40` : "none", display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
                {loading ? (<><span style={{ width: 17, height: 17, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "white", borderRadius: "50%", display: "inline-block", animation: "spin 0.8s linear infinite" }} />جاري التحليل...</>) : canRun ? (<><Icon name="Activity" size={16} color="white" />تشغيل النموذج ({filled}/{SURVEY_TOTAL})<Icon name="ArrowLeft" size={14} color="white" /></>) : (`أكمل ${Math.round(SURVEY_TOTAL * 0.6) - filled} سؤال إضافي`)}
              </button>
            </div>
          </div>

          {/* Result Panel */}
          <div style={{ position: "sticky", top: 80 }}>
            {!result ? (
              <div style={{ background: P.card, borderRadius: 18, border: `2px dashed ${P.border}`, padding: "30px 18px", textAlign: "center", boxShadow: P.shadow }}>
                <div style={{ width: 52, height: 52, borderRadius: 15, background: P.blueSoft, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 13px" }}><Icon name="Activity" size={25} color={P.blue} /></div>
                <div style={{ color: P.text, fontSize: 14, fontWeight: 700, marginBottom: 5 }}>في انتظار البيانات</div>
                <div style={{ color: P.ghost, fontSize: 11, lineHeight: 1.8 }}>عبّي الاستبيان ثم اضغط "تشغيل النموذج"<br />النتيجة تطلع من المودل الحقيقي المتدرب</div>
                <div style={{ marginTop: 18, textAlign: "right" }}>
                  <div style={{ color: P.ghost, fontSize: 9.5, fontWeight: 700, letterSpacing: 1.5, marginBottom: 10 }}>تقدم الأقسام</div>
                  {SURVEY_SECTIONS.map((sec, i) => { const sf = sec.fields.filter(f => form[f.k]).length; return (
                    <div key={i} style={{ marginBottom: 8 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                        <span style={{ color: P.ghost, fontSize: 11 }}>{sec.title}</span>
                        <span style={{ color: sf === sec.fields.length ? P.emerald : sf > 0 ? sec.color : P.ghost, fontSize: 11, fontWeight: 700 }}>{sf}/{sec.fields.length}</span>
                      </div>
                      <div style={{ height: 3, background: P.border, borderRadius: 2, overflow: "hidden" }}><div style={{ height: "100%", width: `${(sf / sec.fields.length) * 100}%`, background: sf === sec.fields.length ? P.emerald : sec.color, borderRadius: 2, transition: "width 0.35s" }} /></div>
                    </div>
                  ); })}
                </div>
              </div>
            ) : (
              <div style={{ background: P.card, borderRadius: 18, border: `1px solid ${P.border}`, overflow: "hidden", boxShadow: `0 6px 32px ${riskColor}18` }}>
                {/* Score */}
                <div style={{ padding: 18, textAlign: "center", borderBottom: `1px solid ${P.border}`, background: `linear-gradient(135deg,${riskColor}06,${riskColor}12)` }}>
                  <Gauge value={animScore} color={riskColor} />
                  <div style={{ marginTop: 9, display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 17px", background: riskColor + "16", border: `2px solid ${riskColor}32`, color: riskColor, fontSize: 13, fontWeight: 800, borderRadius: 24 }}>
                    <Icon name={CL.iconN} size={13} color={riskColor} />
                    {result.label === "سيغادر" ? "خطر مغادرة عالي" : "احتمال بقاء مرتفع"}
                  </div>
                </div>
                {/* Cluster */}
                <div style={{ padding: "13px 17px", borderBottom: `1px solid ${P.border}`, background: CL.soft, display: "flex", gap: 9, alignItems: "center" }}>
                  <div style={{ width: 35, height: 35, borderRadius: 10, background: CL.c + "18", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Icon name={CL.iconN} size={17} color={CL.c} /></div>
                  <div>
                    <div style={{ color: P.ghost, fontSize: 9, letterSpacing: 1 }}>المجموعة</div>
                    <div style={{ color: CL.c, fontSize: 14, fontWeight: 800, marginTop: 1 }}>{CL.name}</div>
                    <div style={{ color: P.ghost, fontSize: 11, marginTop: 1 }}>{CL.chars}</div>
                  </div>
                </div>
                {/* Scores */}
                {result.scores && (
                  <div style={{ padding: "13px 17px", borderBottom: `1px solid ${P.border}` }}>
                    <div style={{ color: P.ghost, fontSize: 9, fontWeight: 700, letterSpacing: 1.5, marginBottom: 8 }}>المؤشرات المركبة</div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                      {[{ l: "الإرهاق", v: result.scores.burnout, max: 7, c: P.red },{ l: "الركود", v: result.scores.stagnation, max: 5, c: P.amber },{ l: "الانفصال", v: result.scores.disengagement, max: 9, c: "#ea580c" },{ l: "فجوة التعويض", v: result.scores.compensation, max: 3, c: P.violet }].map((s, i) => (
                        <div key={i} style={{ padding: "7px 10px", background: P.bg, borderRadius: 8, textAlign: "center" }}>
                          <div style={{ color: s.c, fontSize: 16, fontWeight: 900 }}>{s.v.toFixed(1)}</div>
                          <div style={{ color: P.ghost, fontSize: 9 }}>{s.l} (/{s.max})</div>
                          <div style={{ marginTop: 4 }}><AnimBar v={s.v} max={s.max} color={s.c} delay={i * 60} /></div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {/* Actions */}
                <div style={{ padding: "13px 17px" }}>
                  <div style={{ color: P.ghost, fontSize: 9, fontWeight: 700, letterSpacing: 1.5, marginBottom: 9 }}>الإجراءات المقترحة</div>
                  {CL.actions.map((a, i) => (
                    <div key={i} style={{ padding: "8px 11px", marginBottom: 7, background: CL.soft, border: `1px solid ${CL.c}18`, borderRight: `3px solid ${CL.c}`, borderRadius: 8, display: "flex", gap: 8 }}>
                      <span style={{ color: CL.c, fontWeight: 900, fontSize: 11, minWidth: 19 }}>0{i + 1}</span><span style={{ color: P.text2, fontSize: 12 }}>{a}</span>
                    </div>
                  ))}
                </div>
                {/* Reset */}
                <div style={{ padding: "0 17px 15px" }}>
                  <button onClick={() => { setResult(null); setForm({}); setActiveSec(0); setAnimScore(0); }} style={{ width: "100%", padding: "9px", background: P.bg, color: P.ghost, border: `1px solid ${P.border}`, borderRadius: 10, fontSize: 11, cursor: "pointer", fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                    <Icon name="RefreshCw" size={12} color={P.ghost} />تحليل موظف جديد
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════
// APP ROOT
// ════════════════════════════════════════
export default function App() {
  const [page, setPage] = useState("home");
  return (
    <div style={{ minHeight: "100vh", background: P.bg, direction: "rtl", fontFamily: "'IBM Plex Sans Arabic','Segoe UI',system-ui,sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;500;600;700;800;900&display=swap');
        * { box-sizing:border-box; margin:0; padding:0; }
        @keyframes float  { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
        @keyframes spin   { to{transform:rotate(360deg)} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        select option { background:white; color:#0f172a; }
        select, button { font-family:inherit; }
        ::-webkit-scrollbar { width:4px }
        ::-webkit-scrollbar-thumb { background:#e2e8f0; border-radius:4px }
      `}</style>
      <NavBar page={page} setPage={setPage} />
      {page === "home"     && <HomePage onUpload={() => setPage("results")} />}
      {page === "results"  && <ResultsPage />}
      {page === "clusters" && <ClustersPage />}
      {page === "predict"  && <PredictPage />}
    </div>
  );
}