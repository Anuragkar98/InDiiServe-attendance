import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import {
  CheckCircle2,
  XCircle,
  Clock,
  Users,
  UserCheck,
  FilePlus2,
  Download,
  ShieldCheck,
  Search,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Sparkles,
  BookOpen,
  LogIn,
  LogOut,
  UserPlus,
  Trash2,
  Lock,
  FileSpreadsheet,
  Eye,
  UserCog,
  Pencil,
  Save,
  ArrowLeft,
  Undo2,
  Loader2,
  CalendarDays,
  Award,
  TableProperties,
  X,
} from "lucide-react";
import { supabase } from "./lib/supabaseClient";

const SESSION_STORAGE_KEY = "indiiserve_auth_session_v1";
const SESSION_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
const TODAY_ISO = "2026-11-28";

// Monthly earned rates per client specification
const MONTHLY_EARN_RATES = {
  PL: 1.25, // 1.25 days per month
  SL: 1.0,  // 1 day per month
  CL: 0.83, // 0.83 day per month
};

const HANDBOOK_QUICK_JUMPS = [
  { label: "Comp Off", keyword: "Comp Off", docId: "leave-attendance" },
  { label: "Notice Period", keyword: "notice period", docId: "separation-exit" },
  { label: "Payroll", keyword: "Payroll", docId: "payroll-policy" },
  { label: "Leave Accrual", keyword: "Accrual", docId: "leave-attendance" },
  { label: "Holidays", keyword: "Holiday", docId: "leave-attendance" },
  { label: "POSH / ICC", keyword: "ICC", docId: "posh" },
];

const INITIAL_ADMINS = [
  {
    id: "adm-1",
    code: "ADM001",
    name: "System Admin",
    password: "admin123",
  },
];

const INITIAL_TEAM_LEADERS = [
  {
    id: "tl-1",
    code: "TL001",
    name: "Aarav Sharma",
    password: "leader123",
    team: "Team Alpha",
  },
  {
    id: "tl-2",
    code: "TL002",
    name: "Priya Nair",
    password: "leader123",
    team: "Team Beta",
  },
];

// Mandatory National Holidays (MM-DD) from Indiiserve Policy Section 3.6
const NATIONAL_HOLIDAYS_MMDD = {
  "01-26": "Republic Day",
  "05-01": "Labour Day",
  "08-15": "Independence Day",
  "10-02": "Gandhi Jayanti",
};

const POLICY_LIMITS = {
  PL: {
    label: "Privilege Leave (PL) — 1.25/mo",
    monthlyRate: MONTHLY_EARN_RATES.PL,
    approver: "Reporting Manager",
  },
  SL: {
    label: "Sick Leave (SL) — 1/mo",
    monthlyRate: MONTHLY_EARN_RATES.SL,
    approver: "Reporting Manager (+ HR if extended)",
  },
  CL: {
    label: "Casual Leave (CL) — 0.83/mo",
    monthlyRate: MONTHLY_EARN_RATES.CL,
    approver: "Reporting Manager (max 2 consecutive days)",
  },
  CO: {
    label: "Compensatory Off (CO) — Sunday Work",
    monthlyRate: 0,
    approver: "Reporting Manager (valid 60 days)",
  },
  LWP: {
    label: "Leave Without Pay (LWP)",
    monthlyRate: 0,
    approver: "HR + Management",
  },
};

function InDiiServeLogo({
  compact = false,
  variant = "header",
  onClick = null,
}) {
  const [imgMissing, setImgMissing] = useState(false);

  const content =
    variant === "login" ? (
      <span className="inline-flex items-center text-2xl font-extrabold tracking-tight text-slate-900 select-none">
        InDiiServe
      </span>
    ) : !imgMissing ? (
      <img
        src="/indiiserve-logo.jpeg"
        alt="InDiiServe"
        onError={() => setImgMissing(true)}
        className={`w-auto object-contain select-none ${
          compact ? "h-10" : "h-11"
        }`}
      />
    ) : (
      <span className="inline-flex items-center text-lg font-extrabold tracking-tight text-slate-900 select-none">
        InDiiServe
      </span>
    );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        title="Go to Home"
        className="inline-flex items-center rounded-lg p-1 text-left transition hover:opacity-85 focus:outline-none cursor-pointer"
      >
        {content}
      </button>
    );
  }

  return <div className="inline-flex items-center">{content}</div>;
}

const HR_HANDBOOK_DOCS = [
  {
    id: "posh",
    title: "Prevention of Sexual Harassment (POSH)",
    badge: "Act 2013 Compliance",
    cardBg:
      "from-rose-500 to-pink-600 text-white border-rose-600 shadow-md shadow-rose-500/20",
    idleCard:
      "from-rose-50/90 to-white text-rose-950 border-rose-200/90 hover:border-rose-400 hover:shadow-sm",
    headerBand:
      "bg-gradient-to-r from-rose-600 via-pink-600 to-rose-500 text-white",
    sectionAccent: "border-l-4 border-rose-500 bg-rose-50/40",
    dotColor: "bg-rose-500",
    sections: [
      {
        heading: "1. Policy Statement",
        paragraphs: [
          "The organization is committed to providing a safe, secure, and respectful work environment for all employees. Sexual harassment in any form is strictly prohibited and will not be tolerated under any circumstances.",
          "This policy is in accordance with the Sexual Harassment of Women at Workplace (Prevention, Prohibition and Redressal) Act, 2013.",
        ],
      },
      {
        heading: "2. Scope",
        paragraphs: ["This policy applies to:"],
        bullets: [
          "All employees (full-time, part-time, contract, interns)",
          "Workplace interactions including:",
          "Office premises",
          "Client locations",
          "Work-related travel",
          "Virtual/online work environments",
        ],
      },
      {
        heading: "3. Definition of Sexual Harassment",
        paragraphs: [
          "Sexual harassment includes any unwelcome behavior (direct or implied), such as:",
        ],
        bullets: [
          "Physical contact and advances",
          "Demand or request for sexual favors",
          "Making sexually colored remarks",
          "Showing pornography or inappropriate content",
          "Any other unwelcome physical, verbal, or non-verbal conduct of a sexual nature",
        ],
      },
      {
        heading: "4. Examples of Prohibited Conduct",
        bullets: [
          "Inappropriate jokes, comments, or messages",
          "Repeated unwanted communication or advances",
          "Staring, gestures, or behavior causing discomfort",
          "Sharing offensive content (images, videos, messages)",
          "Misuse of authority for personal favors",
        ],
      },
      {
        heading: "5. Internal Complaints Committee (ICC)",
        bullets: [
          "The organization has constituted an Internal Complaints Committee (ICC) to address complaints of sexual harassment.",
          "Employees may report concerns to any ICC member or HR",
          "Details of ICC members will be shared internally and displayed as required",
        ],
      },
      {
        heading: "6. Complaint Mechanism",
        bullets: [
          "Complaints should ideally be made within 3 months of the incident",
          "Complaints can be submitted via:",
          "Email",
          "Written application",
          "The organization ensures:",
          "Confidentiality",
          "Fair and unbiased investigation",
          "Protection against retaliation",
        ],
      },
      {
        heading: "7. Inquiry Process",
        bullets: [
          "The ICC will conduct a fair inquiry as per legal guidelines",
          "Both parties will be given an opportunity to be heard",
          "Necessary actions will be taken based on findings",
        ],
      },
      {
        heading: "8. Disciplinary Action",
        paragraphs: ["If allegations are proven, disciplinary action may include:"],
        bullets: [
          "Written warning",
          "Suspension",
          "Termination of employment",
          "Legal action (if applicable)",
        ],
      },
      {
        heading: "9. False Complaints",
        bullets: [
          "Malicious or false complaints, if proven, may lead to disciplinary action",
          "However, inability to prove a complaint will not automatically attract action",
        ],
      },
      {
        heading: "10. Responsibility of Employees",
        paragraphs: ["All employees are expected to:"],
        bullets: [
          "Maintain respectful behavior at all times",
          "Refrain from any form of harassment",
          "Report incidents promptly",
          "Cooperate in investigations",
        ],
      },
      {
        heading: "11. Non-Retaliation",
        paragraphs: [
          "The organization strictly prohibits retaliation against any individual who:",
        ],
        bullets: [
          "Reports a concern in good faith",
          "Participates in an investigation",
        ],
      },
      {
        heading: "12. Confidentiality",
        paragraphs: [
          "All complaints and proceedings will be handled with strict confidentiality to protect the dignity of all individuals involved.",
        ],
      },
    ],
  },
  {
    id: "leave-attendance",
    title: "Leave & Attendance Policy — Indiiserve",
    badge: "Monthly Accrual & Comp Off",
    cardBg:
      "from-indigo-600 to-violet-600 text-white border-indigo-700 shadow-md shadow-indigo-500/20",
    idleCard:
      "from-indigo-50/90 to-white text-indigo-950 border-indigo-200/90 hover:border-indigo-400 hover:shadow-sm",
    headerBand:
      "bg-gradient-to-r from-indigo-600 via-blue-600 to-violet-600 text-white",
    sectionAccent: "border-l-4 border-indigo-500 bg-indigo-50/40",
    dotColor: "bg-indigo-500",
    sections: [
      {
        heading: "1. Purpose",
        paragraphs: [
          "The purpose of this policy is to provide a structured framework for employee leave entitlements while ensuring business continuity and employee well-being.",
        ],
      },
      {
        heading: "2. Scope",
        paragraphs: [
          "This policy applies to all full-time employees, contractual employees and interns of Indiiserve Solutions Pvt. Ltd.",
        ],
      },
      {
        heading: "3. Monthly Earned Leave Accrual & Types of Leave",
        paragraphs: [
          "After joining, full-month leave accrual starts from the 1st of the following month (or the joining month itself if joining on the 1st). Each completed month adds 1.25 Privilege Leave (PL), 1 Sick Leave (SL), and 0.83 Casual Leave (CL). Approved leave days are deducted from earned balances.",
        ],
        bullets: [
          "3.1 Privilege Leave (PL): Earned at 1.25 days per completed month. Planned in advance with reporting manager approval; full-day or half-day.",
          "3.2 Sick Leave (SL): Earned at 1 day per completed month for illness/medical recovery. Medical note may be required beyond 2 consecutive days.",
          "3.3 Casual Leave (CL): Earned at 0.83 day per completed month for urgent personal needs, generally up to 2 consecutive days at a time.",
          "3.9 Compensatory Off (CO): Sundays are Weekly Offs. Working on a Sunday (Present or Half-Day) earns 1 Comp Off leave.",
        ],
      },
      {
        heading: "3.4 Menstrual, Maternity & Paternity Leave",
        bullets: [
          "Menstrual & Maternity Leave: Maternity leave up to statutory norms (up to 26 weeks for first two children) with advance notice and medical documentation.",
          "Paternity Leave: 5–10 working days for eligible employees upon birth or legal adoption of a child, subject to managerial and HR coordination.",
        ],
      },
      {
        heading: "3.6 National Holidays & 3.7 Festival Holidays",
        bullets: [
          "National Holidays: Republic Day (26 January), Labour Day (1 May), Independence Day (15 August), and Gandhi Jayanti (2 October) are paid holidays.",
          "Festival Holidays: Observed as per the annual company holiday calendar.",
        ],
      },
      {
        heading: "3.8 Leave Without Pay (LWP) & Approval Rules",
        bullets: [
          "LWP applies when earned balances are exhausted or for unapproved/extended absence, subject to reporting manager and HR approval.",
          "Proper work handover is required before proceeding on leave, and leave during notice periods may extend the notice period.",
        ],
      },
    ],
  },
  {
    id: "separation-exit",
    title: "Separation & Exit Policy — Indiiserve",
    badge: "30-Day Notice & F&F",
    cardBg:
      "from-amber-500 to-orange-600 text-white border-amber-600 shadow-md shadow-amber-500/20",
    idleCard:
      "from-amber-50/90 to-white text-amber-950 border-amber-200/90 hover:border-amber-400 hover:shadow-sm",
    headerBand:
      "bg-gradient-to-r from-amber-600 via-orange-500 to-amber-500 text-white",
    sectionAccent: "border-l-4 border-amber-500 bg-amber-50/40",
    dotColor: "bg-amber-500",
    sections: [
      {
        heading: "1. Purpose & 2. Scope",
        paragraphs: [
          "Defines a structured, compliant exit process across all roles and employment types to protect company interests and ensure smooth knowledge transfer.",
        ],
      },
      {
        heading: "3. Types of Separation",
        bullets: [
          "Resignation: Formal notice submitted to the Reporting Manager with HR in copy, specifying last working day and serving the mandatory 30-day notice period.",
          "Termination: Initiated for performance, policy/ZTP violations, absconding (3+ consecutive unexplained working days), or restructuring following fair documentation.",
          "Retirement, Absconding & Medical/Compassionate Cases: Handled in accordance with company policy and statutory guidelines.",
        ],
      },
      {
        heading: "6. Exit Clearance & 7. Full & Final Settlement",
        bullets: [
          "Complete Knowledge Transfer (KT) and obtain clearance from IT, HR & Admin, Finance, and the Reporting Manager.",
          "Full & Final (F&F) settlement accounts for earned dues, applicable leave encashment, and any notice shortfall, asset, or advance recoveries.",
        ],
      },
    ],
  },
  {
    id: "payroll-policy",
    title: "Payroll Policy — Indiiserve",
    badge: "Monthly Cycle",
    cardBg:
      "from-emerald-600 to-teal-600 text-white border-emerald-700 shadow-md shadow-emerald-500/20",
    idleCard:
      "from-emerald-50/90 to-white text-emerald-950 border-emerald-200/90 hover:border-emerald-400 hover:shadow-sm",
    headerBand:
      "bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 text-white",
    sectionAccent: "border-l-4 border-emerald-500 bg-emerald-50/40",
    dotColor: "bg-emerald-500",
    sections: [
      {
        heading: "1. Purpose & 2. Scope",
        paragraphs: [
          "Establishes transparent, compliant monthly payroll governance for permanent, probationary, contractual, and eligible intern staff.",
        ],
      },
      {
        heading: "3. Payroll Cycle & Components",
        bullets: [
          "Monthly Payroll Cycle: Processed every month and credited to employee bank accounts on or before the 10th working day of the month.",
          "Earnings: Basic Salary, HRA, Special Allowance, Conveyance Allowance, approved incentives/variable pay, arrears, and approved reimbursements.",
          "Deductions: PF, ESIC, Professional Tax (where applicable), TDS, Leave Without Pay (LWP), and authorized recoveries.",
        ],
      },
      {
        heading: "Confidentiality & Policy Amendment",
        paragraphs: [
          "Compensation and payroll records are strictly confidential. The Company may update this policy as business or statutory requirements evolve.",
        ],
      },
    ],
  },
];

const FIRST_NAMES = [
  "Rohan", "Ananya", "Vikram", "Sneha", "Arjun", "Meera", "Karthik", "Pooja",
  "Rishabh", "Neha", "Siddharth", "Divya", "Aditya", "Kavita", "Nikhil", "Ritu",
  "Varun", "Swati", "Manish", "Shruti", "Harsh", "Preeti", "Akash", "Tanvi", "Deepak"
];

const LAST_NAMES = [
  "Das", "Sen", "Roy", "Banerjee", "Chatterjee", "Mukherjee", "Ghosh", "Bose",
  "Patel", "Verma", "Joshi", "Kulkarni", "Mishra", "Tiwari", "Rao", "Iyer"
];

function normalizeIsoDate(raw, fallback = TODAY_ISO) {
  if (!raw || typeof raw !== "string") return fallback;
  const trimmed = raw.trim();
  const isoMatch = trimmed.match(/^(\d{4}-\d{2}-\d{2})/);
  if (isoMatch) return isoMatch[1];
  const parsed = new Date(trimmed);
  if (isNaN(parsed)) return fallback;
  return `${parsed.getFullYear()}-${String(parsed.getMonth() + 1).padStart(2, "0")}-${String(
    parsed.getDate()
  ).padStart(2, "0")}`;
}

function expandDateRange(startStr, endStr) {
  const dates = [];
  const curr = new Date(`${normalizeIsoDate(startStr, "")}T00:00:00`);
  const end = new Date(`${normalizeIsoDate(endStr, "")}T00:00:00`);
  if (isNaN(curr) || isNaN(end) || curr > end) return dates;
  while (curr <= end) {
    const y = curr.getFullYear();
    const m = String(curr.getMonth() + 1).padStart(2, "0");
    const d = String(curr.getDate()).padStart(2, "0");
    dates.push(`${y}-${m}-${d}`);
    curr.setDate(curr.getDate() + 1);
  }
  return dates;
}

function isSundayDate(dateStr) {
  const dt = new Date(`${normalizeIsoDate(dateStr, "")}T00:00:00`);
  return !isNaN(dt) && dt.getDay() === 0;
}

function getHolidayName(dateStr) {
  const clean = normalizeIsoDate(dateStr, "");
  if (!clean) return null;
  const mmdd = clean.slice(5);
  return NATIONAL_HOLIDAYS_MMDD[mmdd] || null;
}

function countBillableLeaveDays(startDate, endDate, isHalfDay, leaveType) {
  if (isHalfDay) return 0.5;
  const dates = expandDateRange(startDate, endDate);
  if (dates.length === 0) return 0;
  const billable = dates.filter((dStr) => {
    const dow = new Date(`${dStr}T00:00:00`).getDay();
    return dow !== 0 && !getHolidayName(dStr);
  });
  return leaveType === "LWP" ? dates.length : billable.length;
}

/**
 * Returns the first month index (year * 12 + month) from which full-month accrual counts.
 * If joining on the 1st of a month, that month counts; otherwise next month's 1st.
 * Example: joining 2026-11-28 -> first accrual month is Dec 2026 (2026 * 12 + 11).
 */
function getFirstAccrualMonthIndex(joiningDateStr) {
  const iso = normalizeIsoDate(joiningDateStr, TODAY_ISO);
  const join = new Date(`${iso}T00:00:00`);
  if (isNaN(join)) return 2026 * 12 + 11;
  return join.getFullYear() * 12 + join.getMonth() + (join.getDate() === 1 ? 0 : 1);
}

/**
 * Counts completed accrual months through `referenceDateStr`.
 * A month with index `mIdx` is counted only once `referenceDateStr` reaches that month
 * (and if `referenceDateStr` is in the same month as `mIdx`, it counts once that month starts).
 * For example, on 2026-11-28, a new employee joined today has startMonthIndex = Dec 2026 (24323),
 * currentMonthIndex = Nov 2026 (24322) -> returns 0 earned months until December.
 */
function getCompletedAccrualMonths(joiningDateStr, referenceDateStr = TODAY_ISO) {
  const refIso = normalizeIsoDate(referenceDateStr, TODAY_ISO);
  const ref = new Date(`${refIso}T00:00:00`);
  if (isNaN(ref)) return 0;

  const startMonthIndex = getFirstAccrualMonthIndex(joiningDateStr);
  const currentMonthIndex = ref.getFullYear() * 12 + ref.getMonth();

  if (currentMonthIndex < startMonthIndex) return 0;
  return currentMonthIndex - startMonthIndex + 1;
}

/**
 * Builds month-by-month breakdown rows from the first accrual month through `referenceDateStr`.
 */
function buildMonthlyAccrualSchedule(joiningDateStr, referenceDateStr = TODAY_ISO) {
  const refIso = normalizeIsoDate(referenceDateStr, TODAY_ISO);
  const ref = new Date(`${refIso}T00:00:00`);
  if (isNaN(ref)) return [];

  const startMonthIndex = getFirstAccrualMonthIndex(joiningDateStr);
  const endMonthIndex = ref.getFullYear() * 12 + ref.getMonth();
  if (endMonthIndex < startMonthIndex) return [];

  const rows = [];
  let count = 0;
  for (let mIdx = startMonthIndex; mIdx <= endMonthIndex; mIdx++) {
    count += 1;
    const year = Math.floor(mIdx / 12);
    const month0 = mIdx % 12;
    const label = new Date(year, month0, 1).toLocaleString("en-US", {
      month: "short",
      year: "numeric",
    });

    rows.push({
      monthNumber: count,
      label,
      addedPL: MONTHLY_EARN_RATES.PL,
      addedSL: MONTHLY_EARN_RATES.SL,
      addedCL: MONTHLY_EARN_RATES.CL,
      cumulativePL: Number((count * MONTHLY_EARN_RATES.PL).toFixed(2)),
      cumulativeSL: Number((count * MONTHLY_EARN_RATES.SL).toFixed(2)),
      cumulativeCL: Number((count * MONTHLY_EARN_RATES.CL).toFixed(2)),
    });
  }
  return rows;
}

function computeEarnedLeaveBalances(emp, leaveRequests, referenceDateStr = TODAY_ISO) {
  const monthsEarned = getCompletedAccrualMonths(emp.joiningDate, referenceDateStr);

  const earnedPL = Number((monthsEarned * MONTHLY_EARN_RATES.PL).toFixed(2));
  const earnedSL = Number((monthsEarned * MONTHLY_EARN_RATES.SL).toFixed(2));
  const earnedCL = Number((monthsEarned * MONTHLY_EARN_RATES.CL).toFixed(2));

  let usedPL = 0;
  let usedSL = 0;
  let usedCL = 0;

  (leaveRequests || []).forEach((lr) => {
    if (lr.empId !== emp.id || lr.status !== "APPROVED") return;
    const days = Number(lr.daysCount) || 0;
    if (lr.leaveType === "PL") usedPL += days;
    else if (lr.leaveType === "SL") usedSL += days;
    else if (lr.leaveType === "CL") usedCL += days;
  });

  return {
    monthsEarned,
    PL: Math.max(0, Number((earnedPL - usedPL).toFixed(2))),
    SL: Math.max(0, Number((earnedSL - usedSL).toFixed(2))),
    CL: Math.max(0, Number((earnedCL - usedCL).toFixed(2))),
    CO: Math.max(0, Number((emp.balances?.CO ?? 0).toFixed(2))),
    earnedTotals: {
      PL: earnedPL,
      SL: earnedSL,
      CL: earnedCL,
    },
  };
}

function buildSeedData() {
  const year = 2026;
  const month = 10; // November (0-indexed)

  const employees = FIRST_NAMES.map((first, idx) => {
    const id = `emp-${idx + 1}`;
    const last = LAST_NAMES[(idx * 3) % LAST_NAMES.length];
    return {
      id,
      name: `${first} ${last}`,
      empCode: `EMP${String(idx + 101).padStart(3, "0")}`,
      password: "emp123",
      department: idx < 13 ? "Engineering" : "Operations",
      teamLeaderId: idx % 2 === 0 ? "tl-1" : "tl-2",
      joiningDate: "2026-01-01",
      onNoticePeriod: idx === 7,
      balances: {
        PL: 13.75,
        CL: 9.13,
        SL: 11.0,
        CO: idx % 4 === 0 ? 1 : 0,
      },
    };
  });

  const attendance = {};
  const fmt = (d) =>
    `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

  employees.forEach((emp, idx) => {
    for (let day = 1; day <= 20; day++) {
      const dateStr = fmt(day);
      const dow = new Date(year, month, day).getDay();
      if (dow === 0 || getHolidayName(dateStr)) continue;

      if (emp.id === "emp-1") {
        if (day === 12 || day === 13) continue;
        if (day === 17) {
          attendance[`${emp.id}_${dateStr}`] = { status: "PRESENT", markedBy: "tl-1" };
        } else if (day === 18) {
          attendance[`${emp.id}_${dateStr}`] = { status: "HALF_DAY", markedBy: "tl-1" };
        } else if (day === 19) {
          attendance[`${emp.id}_${dateStr}`] = { status: "ABSENT", markedBy: "tl-1" };
        } else {
          attendance[`${emp.id}_${dateStr}`] = { status: "PRESENT", markedBy: "tl-1" };
        }
      } else {
        if (day === 19 && idx % 6 === 0) {
          attendance[`${emp.id}_${dateStr}`] = { status: "ABSENT", markedBy: emp.teamLeaderId };
        } else if (day === 18 && idx % 5 === 0) {
          attendance[`${emp.id}_${dateStr}`] = { status: "HALF_DAY", markedBy: emp.teamLeaderId };
        } else {
          attendance[`${emp.id}_${dateStr}`] = { status: "PRESENT", markedBy: emp.teamLeaderId };
        }
      }
    }
  });

  const leaveRequests = [
    {
      id: "lr-1",
      empId: "emp-1",
      leaveType: "PL",
      startDate: fmt(12),
      endDate: fmt(13),
      isHalfDay: false,
      daysCount: 2,
      reason: "Planned family trip",
      handoverNote: "Assigned sprint tickets to Arjun Roy.",
      status: "APPROVED",
      reviewedBy: "tl-1",
      createdAt: fmt(8),
    },
    {
      id: "lr-2",
      empId: "emp-1",
      leaveType: "SL",
      startDate: fmt(23),
      endDate: fmt(23),
      isHalfDay: false,
      daysCount: 1,
      reason: "Fever and medical rest",
      handoverNote: "Urgent alerts covered by Team Alpha.",
      status: "PENDING",
      reviewedBy: null,
      createdAt: fmt(19),
    },
    {
      id: "lr-3",
      empId: "emp-2",
      leaveType: "SL",
      startDate: fmt(24),
      endDate: fmt(25),
      isHalfDay: false,
      daysCount: 2,
      reason: "Medical checkup & recovery",
      handoverNote: "Documentation handed over to Sneha Banerjee.",
      status: "PENDING",
      reviewedBy: null,
      createdAt: fmt(19),
    },
    {
      id: "lr-4",
      empId: "emp-3",
      leaveType: "CL",
      startDate: fmt(25),
      endDate: fmt(25),
      isHalfDay: true,
      daysCount: 0.5,
      reason: "Urgent personal work",
      handoverNote: "Afternoon tasks handed to Meera Chatterjee.",
      status: "PENDING",
      reviewedBy: null,
      createdAt: fmt(20),
    },
  ];

  return {
    admins: INITIAL_ADMINS,
    teamLeaders: INITIAL_TEAM_LEADERS,
    employees,
    attendance,
    leaveRequests,
  };
}

function mapEmployeeRow(row) {
  // Prefer explicit joining_date; if absent on a newly created employee, use created_at date rather than 2026-01-01
  const derivedJoin = row.joining_date
    ? normalizeIsoDate(row.joining_date, TODAY_ISO)
    : row.created_at
    ? normalizeIsoDate(row.created_at, TODAY_ISO)
    : TODAY_ISO;

  return {
    id: row.id,
    empCode: row.emp_code,
    name: row.name,
    password: row.password || "emp123",
    department: row.department,
    teamLeaderId: row.team_leader_id || null,
    joiningDate: derivedJoin,
    onNoticePeriod: Boolean(row.on_notice_period),
    balances: {
      PL: Number(row.pl_balance ?? 0),
      CL: Number(row.cl_balance ?? 0),
      SL: Number(row.sl_balance ?? 0),
      CO: Number(row.co_balance ?? 0),
    },
  };
}

function toEmployeeDbRow(emp, validTeamLeaderId = null, includeJoiningDate = true) {
  const base = {
    id: emp.id,
    emp_code: emp.empCode,
    name: emp.name,
    password: emp.password || "emp123",
    department: emp.department,
    team_leader_id: validTeamLeaderId,
    on_notice_period: Boolean(emp.onNoticePeriod),
    pl_balance: Number(emp.balances?.PL ?? 0),
    cl_balance: Number(emp.balances?.CL ?? 0),
    sl_balance: Number(emp.balances?.SL ?? 0),
    co_balance: Number(emp.balances?.CO ?? 0),
  };
  if (includeJoiningDate && emp.joiningDate) {
    base.joining_date = normalizeIsoDate(emp.joiningDate, TODAY_ISO);
  }
  return base;
}

function mapLeaveRow(row) {
  return {
    id: row.id,
    empId: row.emp_id,
    leaveType: row.leave_type,
    startDate: normalizeIsoDate(row.start_date, TODAY_ISO),
    endDate: normalizeIsoDate(row.end_date, TODAY_ISO),
    isHalfDay: Boolean(row.is_half_day),
    daysCount: Number(row.days_count),
    reason: row.reason || "",
    handoverNote: row.handover_note || "",
    status: row.status,
    reviewedBy: row.reviewed_by || null,
    createdAt: row.created_at,
  };
}

function toLeaveDbRow(lr) {
  return {
    id: lr.id,
    emp_id: lr.empId,
    leave_type: lr.leaveType,
    start_date: lr.startDate,
    end_date: lr.endDate,
    is_half_day: Boolean(lr.isHalfDay),
    days_count: Number(lr.daysCount),
    reason: lr.reason || "",
    handover_note: lr.handoverNote || "",
    status: lr.status,
    reviewed_by: lr.reviewedBy || null,
    created_at: lr.createdAt,
  };
}

function readPersistedSession() {
  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.authUser || !parsed?.expiresAt) return null;
    if (Date.now() > Number(parsed.expiresAt)) {
      localStorage.removeItem(SESSION_STORAGE_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export default function App() {
  const persistedSession = useMemo(() => readPersistedSession(), []);

  const [data, setData] = useState({
    admins: INITIAL_ADMINS,
    teamLeaders: INITIAL_TEAM_LEADERS,
    employees: [],
    attendance: {},
    leaveRequests: [],
  });
  const [loadingDb, setLoadingDb] = useState(true);
  const [dbError, setDbError] = useState("");

  const [activePage, setActivePage] = useState(
    persistedSession?.activePage || "PORTAL"
  );
  const [selectedHandbookId, setSelectedHandbookId] = useState(
    persistedSession?.selectedHandbookId || HR_HANDBOOK_DOCS[0].id
  );
  const [handbookQuery, setHandbookQuery] = useState("");
  const handbookSectionRefs = useRef({});

  const [authUser, setAuthUser] = useState(persistedSession?.authUser || null);
  const [sessionExpiresAt, setSessionExpiresAt] = useState(
    persistedSession?.expiresAt || null
  );

  const [loginRole, setLoginRole] = useState("TEAM_LEADER");
  const [loginIdInput, setLoginIdInput] = useState("");
  const [loginPasswordInput, setLoginPasswordInput] = useState("");
  const [loginError, setLoginError] = useState("");

  const [leaderViewMode, setLeaderViewMode] = useState(
    persistedSession?.leaderViewMode || "TEAM_LEADER"
  );
  const [leaderTab, setLeaderTab] = useState(
    persistedSession?.leaderTab || "ATTENDANCE"
  );
  const [adminTab, setAdminTab] = useState(
    persistedSession?.adminTab || "LEADERS"
  );
  const [inspectedEmpId, setInspectedEmpId] = useState(
    persistedSession?.inspectedEmpId || "emp-1"
  );
  const [showAccrualDrawer, setShowAccrualDrawer] = useState(false);

  // Admin Team Leader management state
  const [editingLeaderId, setEditingLeaderId] = useState(null);
  const [editLeaderForm, setEditLeaderForm] = useState({
    name: "",
    code: "",
    password: "",
    team: "",
  });
  const [newLeaderForm, setNewLeaderForm] = useState({
    name: "",
    code: "",
    password: "leader123",
    team: "",
  });

  const [newEmpForm, setNewEmpForm] = useState({
    name: "",
    empCode: "",
    password: "emp123",
    department: "Engineering",
    teamLeaderId: "tl-1",
    joiningDate: TODAY_ISO,
    CO: 0,
  });

  const [calYear, setCalYear] = useState(2026);
  const [calMonth, setCalMonth] = useState(10); // November 2026

  const [rosterDate, setRosterDate] = useState("2026-11-20");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [leaveForm, setLeaveForm] = useState({
    leaveType: "SL",
    startDate: "2026-11-26",
    endDate: "2026-11-26",
    isHalfDay: false,
    reason: "",
    handoverNote: "",
  });
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  const goHomePortal = useCallback(() => {
    setActivePage("PORTAL");
  }, []);

  // Keep newEmpForm.teamLeaderId aligned with available team leaders
  useEffect(() => {
    if (data.teamLeaders.length > 0) {
      const stillExists = data.teamLeaders.some(
        (tl) => tl.id === newEmpForm.teamLeaderId
      );
      if (!stillExists) {
        setNewEmpForm((prev) => ({
          ...prev,
          teamLeaderId: data.teamLeaders[0].id,
        }));
      }
    }
  }, [data.teamLeaders, newEmpForm.teamLeaderId]);

  // Persist active authenticated session & UI view across page reloads
  useEffect(() => {
    if (!authUser) {
      localStorage.removeItem(SESSION_STORAGE_KEY);
      return;
    }
    const expiresAt = sessionExpiresAt || Date.now() + SESSION_TTL_MS;
    if (!sessionExpiresAt) {
      setSessionExpiresAt(expiresAt);
    }
    try {
      localStorage.setItem(
        SESSION_STORAGE_KEY,
        JSON.stringify({
          authUser,
          expiresAt,
          activePage,
          selectedHandbookId,
          leaderViewMode,
          leaderTab,
          adminTab,
          inspectedEmpId,
        })
      );
    } catch {
      // Ignore storage quota issues
    }
  }, [
    authUser,
    sessionExpiresAt,
    activePage,
    selectedHandbookId,
    leaderViewMode,
    leaderTab,
    adminTab,
    inspectedEmpId,
  ]);

  // Periodically check session expiration
  useEffect(() => {
    if (!authUser || !sessionExpiresAt) return;
    const timer = setInterval(() => {
      if (Date.now() > sessionExpiresAt) {
        setAuthUser(null);
        setSessionExpiresAt(null);
        localStorage.removeItem(SESSION_STORAGE_KEY);
        showToast("Session expired. Please sign in again.", "error");
      }
    }, 60 * 1000);
    return () => clearInterval(timer);
  }, [authUser, sessionExpiresAt, showToast]);

  const seedSupabaseIfEmpty = useCallback(async () => {
    const seed = buildSeedData();

    await supabase.from("admins").upsert(seed.admins, { onConflict: "id" });
    await supabase
      .from("team_leaders")
      .upsert(seed.teamLeaders, { onConflict: "id" });
    await supabase
      .from("employees")
      .upsert(
        seed.employees.map((e) => toEmployeeDbRow(e, e.teamLeaderId, true)),
        { onConflict: "id" }
      );

    const attRows = Object.entries(seed.attendance).map(([key, rec]) => {
      const idx = key.lastIndexOf("_");
      const empId = key.slice(0, idx);
      const attendanceDate = key.slice(idx + 1);
      return {
        emp_id: empId,
        attendance_date: attendanceDate,
        status: rec.status,
        marked_by: rec.markedBy || null,
      };
    });

    for (let i = 0; i < attRows.length; i += 200) {
      await supabase
        .from("attendance")
        .upsert(attRows.slice(i, i + 200), {
          onConflict: "emp_id,attendance_date",
        });
    }

    await supabase
      .from("leave_requests")
      .upsert(seed.leaveRequests.map(toLeaveDbRow), { onConflict: "id" });

    return seed;
  }, []);

  const fetchAllFromSupabase = useCallback(async () => {
    setLoadingDb(true);
    setDbError("");

    try {
      const [
        { data: adminRows, error: adminErr },
        { data: leaderRows, error: leaderErr },
        { data: empRows, error: empErr },
        { data: attRows, error: attErr },
        { data: leaveRows, error: leaveErr },
      ] = await Promise.all([
        supabase.from("admins").select("*"),
        supabase.from("team_leaders").select("*"),
        supabase.from("employees").select("*").order("emp_code", { ascending: true }),
        supabase.from("attendance").select("*"),
        supabase.from("leave_requests").select("*").order("created_at", { ascending: false }),
      ]);

      const firstErr = adminErr || leaderErr || empErr || attErr || leaveErr;
      if (firstErr) {
        throw new Error(firstErr.message);
      }

      const isBrandNewDatabase =
        (!adminRows || adminRows.length === 0) &&
        (!leaderRows || leaderRows.length === 0) &&
        (!empRows || empRows.length === 0);

      let nextState;
      if (isBrandNewDatabase) {
        nextState = await seedSupabaseIfEmpty();
      } else {
        const attendanceMap = {};
        (attRows || []).forEach((r) => {
          attendanceMap[`${r.emp_id}_${r.attendance_date}`] = {
            status: r.status,
            markedBy: r.marked_by,
            updatedAt: r.updated_at,
          };
        });

        nextState = {
          admins: adminRows && adminRows.length > 0 ? adminRows : INITIAL_ADMINS,
          teamLeaders:
            leaderRows && leaderRows.length > 0 ? leaderRows : INITIAL_TEAM_LEADERS,
          employees: (empRows || []).map(mapEmployeeRow),
          attendance: attendanceMap,
          leaveRequests: (leaveRows || []).map(mapLeaveRow),
        };
      }

      setData(nextState);

      if (persistedSession?.authUser) {
        const { role, userId } = persistedSession.authUser;
        const exists =
          (role === "ADMIN" && nextState.admins.some((a) => a.id === userId)) ||
          (role === "TEAM_LEADER" &&
            nextState.teamLeaders.some((t) => t.id === userId)) ||
          (role === "EMPLOYEE" &&
            nextState.employees.some((e) => e.id === userId));
        if (!exists) {
          setAuthUser(null);
          localStorage.removeItem(SESSION_STORAGE_KEY);
        }
      }
    } catch (err) {
      console.error("Supabase fetch error:", err);
      setDbError(
        err.message ||
          "Could not connect to Supabase. Check your .env keys and table policies."
      );
      setData(buildSeedData());
    } finally {
      setLoadingDb(false);
    }
  }, [seedSupabaseIfEmpty, persistedSession]);

  useEffect(() => {
    fetchAllFromSupabase();
  }, [fetchAllFromSupabase]);

  // Reference date reflects month end when browsing future months, else today's date
  const accrualReferenceDate = useMemo(() => {
    const lastDayOfViewedMonth = new Date(calYear, calMonth + 1, 0);
    const viewedEndStr = `${calYear}-${String(calMonth + 1).padStart(2, "0")}-${String(
      lastDayOfViewedMonth.getDate()
    ).padStart(2, "0")}`;
    return viewedEndStr > TODAY_ISO ? viewedEndStr : TODAY_ISO;
  }, [calYear, calMonth]);

  // Compute earned leave balances dynamically for every employee
  const employeesWithEarnedLeaves = useMemo(() => {
    return data.employees.map((emp) => {
      const earned = computeEarnedLeaveBalances(
        emp,
        data.leaveRequests,
        accrualReferenceDate
      );
      return {
        ...emp,
        monthsEarned: earned.monthsEarned,
        earnedTotals: earned.earnedTotals,
        balances: {
          PL: earned.PL,
          CL: earned.CL,
          SL: earned.SL,
          CO: earned.CO,
        },
      };
    });
  }, [data.employees, data.leaveRequests, accrualReferenceDate]);

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setLoginError("");
    const code = loginIdInput.trim().toUpperCase();

    if (loginRole === "ADMIN") {
      const admin = data.admins.find(
        (ad) => ad.code.toUpperCase() === code && ad.password === loginPasswordInput
      );
      if (!admin) {
        setLoginError("Invalid Admin ID or password.");
        return;
      }
      const nextAuth = { role: "ADMIN", userId: admin.id };
      const expiresAt = Date.now() + SESSION_TTL_MS;
      setAuthUser(nextAuth);
      setSessionExpiresAt(expiresAt);
      setAdminTab("LEADERS");
      setActivePage("PORTAL");
      setLoginIdInput("");
      setLoginPasswordInput("");
      showToast(`Signed in as ${admin.name}`);
      return;
    }

    if (loginRole === "TEAM_LEADER") {
      const leader = data.teamLeaders.find(
        (tl) => tl.code.toUpperCase() === code && tl.password === loginPasswordInput
      );
      if (!leader) {
        setLoginError("Invalid Team Leader ID or password.");
        return;
      }
      const nextAuth = { role: "TEAM_LEADER", userId: leader.id };
      const expiresAt = Date.now() + SESSION_TTL_MS;
      setAuthUser(nextAuth);
      setSessionExpiresAt(expiresAt);
      setLeaderViewMode("TEAM_LEADER");
      setLeaderTab("ATTENDANCE");
      setActivePage("PORTAL");
      setLoginIdInput("");
      setLoginPasswordInput("");
      showToast(`Welcome back, ${leader.name}!`);
    } else {
      const emp = employeesWithEarnedLeaves.find(
        (item) =>
          item.empCode.toUpperCase() === code &&
          (item.password || "emp123") === loginPasswordInput
      );
      if (!emp) {
        setLoginError("Invalid Employee ID or password.");
        return;
      }
      const nextAuth = { role: "EMPLOYEE", userId: emp.id };
      const expiresAt = Date.now() + SESSION_TTL_MS;
      setAuthUser(nextAuth);
      setSessionExpiresAt(expiresAt);
      setActivePage("PORTAL");
      setLoginIdInput("");
      setLoginPasswordInput("");
      showToast(`Signed in as ${emp.name} (${emp.empCode})`);
    }
  };

  const handleLogout = () => {
    setAuthUser(null);
    setSessionExpiresAt(null);
    localStorage.removeItem(SESSION_STORAGE_KEY);
    setActivePage("PORTAL");
    setEditingLeaderId(null);
    setLoginError("");
    showToast("Logged out securely.");
  };

  // Admin: Start editing a Team Leader
  const startEditLeader = (leader) => {
    setEditingLeaderId(leader.id);
    setEditLeaderForm({
      name: leader.name,
      code: leader.code,
      password: leader.password,
      team: leader.team,
    });
  };

  // Admin: Save updated Team Leader details to Supabase
  const handleSaveLeaderEdit = async (e, leaderId) => {
    e.preventDefault();
    const trimmedName = editLeaderForm.name.trim();
    const trimmedCode = editLeaderForm.code.trim().toUpperCase();
    const trimmedTeam = editLeaderForm.team.trim();

    if (!trimmedName || !trimmedCode || !trimmedTeam || !editLeaderForm.password) {
      showToast("All Team Leader fields are required.", "error");
      return;
    }

    const duplicateCode = data.teamLeaders.some(
      (tl) => tl.id !== leaderId && tl.code.toUpperCase() === trimmedCode
    );
    if (duplicateCode) {
      showToast(`Team Leader ID ${trimmedCode} is already in use.`, "error");
      return;
    }

    const updatedPayload = {
      name: trimmedName,
      code: trimmedCode,
      password: editLeaderForm.password,
      team: trimmedTeam,
    };

    const { error } = await supabase
      .from("team_leaders")
      .update(updatedPayload)
      .eq("id", leaderId);

    if (error) {
      showToast(`Failed to update Team Leader: ${error.message}`, "error");
      return;
    }

    setData((prev) => ({
      ...prev,
      teamLeaders: prev.teamLeaders.map((tl) =>
        tl.id === leaderId ? { ...tl, ...updatedPayload } : tl
      ),
    }));
    setEditingLeaderId(null);
    showToast(`Updated ${trimmedName} (${trimmedCode}).`);
  };

  // Admin: Add a new Team Leader to Supabase
  const handleAddLeader = async (e) => {
    e.preventDefault();
    const trimmedName = newLeaderForm.name.trim();
    const trimmedCode = newLeaderForm.code.trim().toUpperCase();
    const trimmedTeam = newLeaderForm.team.trim();

    if (!trimmedName || !trimmedCode || !trimmedTeam) {
      showToast("Please fill in Name, ID/Code, and Team.", "error");
      return;
    }

    if (data.teamLeaders.some((tl) => tl.code.toUpperCase() === trimmedCode)) {
      showToast(`Team Leader ID ${trimmedCode} already exists.`, "error");
      return;
    }

    const createdLeader = {
      id: `tl-${Date.now()}`,
      name: trimmedName,
      code: trimmedCode,
      password: newLeaderForm.password.trim() || "leader123",
      team: trimmedTeam,
    };

    const { error } = await supabase.from("team_leaders").insert(createdLeader);
    if (error) {
      showToast(`Failed to create Team Leader: ${error.message}`, "error");
      return;
    }

    setData((prev) => ({
      ...prev,
      teamLeaders: [...prev.teamLeaders, createdLeader],
    }));

    setNewLeaderForm({
      name: "",
      code: "",
      password: "leader123",
      team: "",
    });
    showToast(`Added Team Leader ${createdLeader.name} (${createdLeader.code}).`);
  };

  // Admin: Remove a Team Leader from Supabase
  const handleRemoveLeader = async (leaderId, leaderName) => {
    if (data.teamLeaders.length <= 1) {
      showToast("At least one Team Leader must remain.", "error");
      return;
    }
    const fallbackLeader = data.teamLeaders.find((tl) => tl.id !== leaderId);

    if (fallbackLeader) {
      await supabase
        .from("employees")
        .update({ team_leader_id: fallbackLeader.id })
        .eq("team_leader_id", leaderId);
    }

    const { error } = await supabase
      .from("team_leaders")
      .delete()
      .eq("id", leaderId);

    if (error) {
      showToast(`Failed to remove Team Leader: ${error.message}`, "error");
      return;
    }

    setData((prev) => ({
      ...prev,
      teamLeaders: prev.teamLeaders.filter((tl) => tl.id !== leaderId),
      employees: prev.employees.map((emp) =>
        emp.teamLeaderId === leaderId && fallbackLeader
          ? { ...emp, teamLeaderId: fallbackLeader.id }
          : emp
      ),
    }));
    if (editingLeaderId === leaderId) setEditingLeaderId(null);
    showToast(`Removed Team Leader ${leaderName}.`);
  };

  // Add Employee to Supabase safely (validates foreign key + schema fallback)
  const handleAddEmployee = async (e) => {
    e.preventDefault();
    const trimmedName = newEmpForm.name.trim();
    const trimmedCode = newEmpForm.empCode.trim().toUpperCase();

    if (!trimmedName || !trimmedCode) {
      showToast("Please enter both Employee Name and Employee Code.", "error");
      return;
    }

    const exists = data.employees.some(
      (emp) => emp.empCode.toUpperCase() === trimmedCode
    );
    if (exists) {
      showToast(`Employee Code ${trimmedCode} already exists.`, "error");
      return;
    }

    const joiningDate = normalizeIsoDate(newEmpForm.joiningDate, TODAY_ISO);
    const matchedLeader =
      data.teamLeaders.find((tl) => tl.id === newEmpForm.teamLeaderId) ||
      data.teamLeaders[0] ||
      null;
    const validLeaderId = matchedLeader ? matchedLeader.id : null;

    const createdEmp = {
      id: `emp-${Date.now()}`,
      name: trimmedName,
      empCode: trimmedCode,
      password: newEmpForm.password.trim() || "emp123",
      department: newEmpForm.department,
      teamLeaderId: validLeaderId,
      joiningDate,
      onNoticePeriod: false,
      balances: {
        PL: 0,
        CL: 0,
        SL: 0,
        CO: Number(newEmpForm.CO) || 0,
      },
    };

    let { data: insertedRows, error } = await supabase
      .from("employees")
      .insert(toEmployeeDbRow(createdEmp, validLeaderId, true))
      .select();

    // Retry without joining_date if that column doesn't exist in the user's Supabase table
    if (error && error.message?.includes("joining_date")) {
      const retry = await supabase
        .from("employees")
        .insert(toEmployeeDbRow(createdEmp, validLeaderId, false))
        .select();
      error = retry.error;
      insertedRows = retry.data;
    }

    if (error) {
      showToast(`Failed to add employee: ${error.message}`, "error");
      return;
    }

    const persistedEmp =
      insertedRows && insertedRows[0]
        ? { ...mapEmployeeRow(insertedRows[0]), joiningDate }
        : createdEmp;

    setData((prev) => ({
      ...prev,
      employees: [...prev.employees, persistedEmp],
    }));

    setNewEmpForm({
      name: "",
      empCode: "",
      password: "emp123",
      department: "Engineering",
      teamLeaderId: validLeaderId || "",
      joiningDate: TODAY_ISO,
      CO: 0,
    });
    showToast(
      `Added ${persistedEmp.name} (${persistedEmp.empCode}) — accrual starts Dec 2026.`
    );
  };

  // Remove Employee from Supabase
  const handleRemoveEmployee = async (empId, empName) => {
    if (data.employees.length <= 1) {
      showToast("At least one employee must remain in the system.", "error");
      return;
    }

    const { error } = await supabase.from("employees").delete().eq("id", empId);
    if (error) {
      showToast(`Failed to remove employee: ${error.message}`, "error");
      return;
    }

    setData((prev) => {
      const nextEmployees = prev.employees.filter((e) => e.id !== empId);
      const nextAttendance = {};
      Object.entries(prev.attendance).forEach(([key, val]) => {
        if (!key.startsWith(`${empId}_`)) {
          nextAttendance[key] = val;
        }
      });
      const nextLeaveRequests = prev.leaveRequests.filter((lr) => lr.empId !== empId);
      return {
        ...prev,
        employees: nextEmployees,
        attendance: nextAttendance,
        leaveRequests: nextLeaveRequests,
      };
    });

    if (inspectedEmpId === empId) {
      const fallback = data.employees.find((e) => e.id !== empId);
      if (fallback) setInspectedEmpId(fallback.id);
    }
    showToast(`Removed ${empName} from the roster.`);
  };

  const loggedInAdmin = useMemo(
    () =>
      authUser?.role === "ADMIN"
        ? data.admins.find((ad) => ad.id === authUser.userId) || data.admins[0]
        : null,
    [authUser, data.admins]
  );

  const loggedInLeader = useMemo(
    () =>
      authUser?.role === "TEAM_LEADER"
        ? data.teamLeaders.find((tl) => tl.id === authUser.userId) || data.teamLeaders[0]
        : null,
    [authUser, data.teamLeaders]
  );

  const isAdminUser = authUser?.role === "ADMIN";
  const isLeaderUser = authUser?.role === "TEAM_LEADER";
  const effectiveView = isAdminUser
    ? "ADMIN"
    : isLeaderUser
    ? leaderViewMode
    : "EMPLOYEE";
  const isReadOnlyEmployeeInspection = isLeaderUser && effectiveView === "EMPLOYEE";

  const activeEmployeeId =
    authUser?.role === "EMPLOYEE" ? authUser.userId : inspectedEmpId;

  const currentEmployee = useMemo(
    () =>
      employeesWithEarnedLeaves.find((e) => e.id === activeEmployeeId) ||
      employeesWithEarnedLeaves[0],
    [employeesWithEarnedLeaves, activeEmployeeId]
  );

  // Month-by-month accrual schedule for currentEmployee (extending through at least Feb 2027)
  const accrualScheduleRows = useMemo(() => {
    if (!currentEmployee) return [];
    const previewRef =
      accrualReferenceDate < "2027-02-28" ? "2027-02-28" : accrualReferenceDate;
    return buildMonthlyAccrualSchedule(currentEmployee.joiningDate, previewRef);
  }, [currentEmployee, accrualReferenceDate]);

  const computedLeaveDays = useMemo(() => {
    const effectiveEnd = leaveForm.isHalfDay ? leaveForm.startDate : leaveForm.endDate;
    return countBillableLeaveDays(
      leaveForm.startDate,
      effectiveEnd,
      leaveForm.isHalfDay,
      leaveForm.leaveType
    );
  }, [leaveForm]);

  const employeeDayMap = useMemo(() => {
    if (!currentEmployee) return {};
    const map = {};

    Object.entries(data.attendance).forEach(([key, rec]) => {
      const idx = key.lastIndexOf("_");
      const empId = key.slice(0, idx);
      const dateStr = key.slice(idx + 1);
      if (empId === currentEmployee.id) {
        map[dateStr] = { kind: rec.status };
      }
    });

    data.leaveRequests.forEach((lr) => {
      if (lr.empId !== currentEmployee.id || lr.status === "REJECTED") return;
      const days = expandDateRange(lr.startDate, lr.endDate);
      days.forEach((dStr) => {
        if (getHolidayName(dStr)) return;
        if (lr.status === "APPROVED") {
          map[dStr] = {
            kind: "APPROVED_LEAVE",
            leaveType: lr.leaveType,
            isHalfDay: lr.isHalfDay,
            reason: lr.reason,
          };
        } else if (lr.status === "PENDING") {
          if (lr.leaveType === "SL") {
            map[dStr] = {
              kind: "PENDING_SL",
              leaveType: lr.leaveType,
              isHalfDay: lr.isHalfDay,
              reason: lr.reason,
            };
          } else {
            map[dStr] = {
              kind: "PENDING_OTHER",
              leaveType: lr.leaveType,
              isHalfDay: lr.isHalfDay,
              reason: lr.reason,
            };
          }
        }
      });
    });

    return map;
  }, [data.attendance, data.leaveRequests, currentEmployee]);

  const calendarCells = useMemo(() => {
    const firstDayOfMonth = new Date(calYear, calMonth, 1).getDay();
    const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
    const cells = [];

    for (let i = 0; i < firstDayOfMonth; i++) {
      cells.push({ type: "EMPTY", key: `empty-${i}` });
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${calYear}-${String(calMonth + 1).padStart(2, "0")}-${String(
        d
      ).padStart(2, "0")}`;
      const dow = new Date(calYear, calMonth, d).getDay();
      const holidayName = getHolidayName(dateStr);
      cells.push({
        type: "DAY",
        day: d,
        dateStr,
        isSunday: dow === 0,
        holidayName,
        info: employeeDayMap[dateStr] || null,
      });
    }
    return cells;
  }, [calYear, calMonth, employeeDayMap]);

  const monthlyStats = useMemo(() => {
    let present = 0;
    let halfDay = 0;
    let absent = 0;
    let approvedLeave = 0;
    let pendingSL = 0;
    let sundayCompOffEarned = 0;

    calendarCells.forEach((c) => {
      if (c.type !== "DAY" || !c.info) return;
      if (c.info.kind === "PRESENT") {
        present += 1;
        if (c.isSunday) sundayCompOffEarned += 1;
      } else if (c.info.kind === "HALF_DAY") {
        halfDay += 1;
        if (c.isSunday) sundayCompOffEarned += 1;
      } else if (c.info.kind === "ABSENT") {
        absent += 1;
      } else if (c.info.kind === "APPROVED_LEAVE") {
        approvedLeave += c.info.isHalfDay ? 0.5 : 1;
      } else if (c.info.kind === "PENDING_SL") {
        pendingSL += c.info.isHalfDay ? 0.5 : 1;
      }
    });

    return {
      present,
      halfDay,
      absent,
      approvedLeave,
      pendingSL,
      sundayCompOffEarned,
    };
  }, [calendarCells]);

  const handleJumpToCurrentMonth = () => {
    const [y, m] = TODAY_ISO.split("-").map(Number);
    setCalYear(y);
    setCalMonth(m - 1);
  };

  const handleSetRosterToday = () => {
    setRosterDate(TODAY_ISO);
  };

  const handleClearRosterFilters = () => {
    setSearchQuery("");
    setStatusFilter("ALL");
  };

  // Handbook quick-jump handler: switches doc if needed, sets filter/highlight, and scrolls to matching section
  const handleHandbookQuickJump = (jumpItem) => {
    setSelectedHandbookId(jumpItem.docId);
    setHandbookQuery(jumpItem.keyword);

    const targetDoc =
      HR_HANDBOOK_DOCS.find((d) => d.id === jumpItem.docId) || HR_HANDBOOK_DOCS[0];
    const q = jumpItem.keyword.toLowerCase();
    const matchedIdx = targetDoc.sections.findIndex((sec) => {
      const hay = [
        sec.heading,
        ...(sec.paragraphs || []),
        ...(sec.bullets || []),
      ]
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });

    requestAnimationFrame(() => {
      const key = `${jumpItem.docId}-${matchedIdx >= 0 ? matchedIdx : 0}`;
      const el = handbookSectionRefs.current[key];
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    });
  };

  // Submit leave request to Supabase
  const handleSubmitLeave = async (e) => {
    e.preventDefault();
    if (isReadOnlyEmployeeInspection) {
      showToast("Team Leaders inspect employee profiles in read-only mode.", "error");
      return;
    }
    if (!currentEmployee) return;
    const { leaveType, startDate, endDate, isHalfDay, reason, handoverNote } = leaveForm;
    const effectiveEnd = isHalfDay ? startDate : endDate;
    const rawDays = expandDateRange(startDate, effectiveEnd);

    if (rawDays.length === 0) {
      showToast("Please select a valid date range.", "error");
      return;
    }

    if (leaveType === "CL" && !isHalfDay && rawDays.length > 2) {
      showToast(
        "Casual Leave is typically limited to 2 consecutive days per policy.",
        "error"
      );
      return;
    }

    if (leaveType !== "LWP") {
      const availableBalance = currentEmployee.balances[leaveType] ?? 0;
      if (computedLeaveDays > availableBalance) {
        showToast(
          `Insufficient earned ${leaveType} balance (${availableBalance} available, ${computedLeaveDays} needed). Consider LWP.`,
          "error"
        );
        return;
      }
    }

    const newRequest = {
      id: `lr-${Date.now()}`,
      empId: currentEmployee.id,
      leaveType,
      startDate,
      endDate: effectiveEnd,
      isHalfDay,
      daysCount: computedLeaveDays,
      reason: reason.trim() || "Leave request",
      handoverNote: handoverNote.trim() || "Work handover coordinated with team.",
      status: "PENDING",
      reviewedBy: null,
      createdAt: TODAY_ISO,
    };

    const { error } = await supabase
      .from("leave_requests")
      .insert(toLeaveDbRow(newRequest));

    if (error) {
      showToast(`Failed to submit leave request: ${error.message}`, "error");
      return;
    }

    setData((prev) => ({
      ...prev,
      leaveRequests: [newRequest, ...prev.leaveRequests],
    }));

    setLeaveForm((prev) => ({ ...prev, reason: "", handoverNote: "" }));
    showToast(
      `${leaveType} request submitted (${computedLeaveDays} day${
        computedLeaveDays === 1 ? "" : "s"
      }).`
    );
  };

  // Mark attendance in Supabase (+1 Comp Off if marking Present or Half-Day on a Sunday)
  const handleMarkAttendance = async (empId, status) => {
    if (getHolidayName(rosterDate)) {
      showToast(
        `${rosterDate} is a National Holiday (${getHolidayName(rosterDate)}).`,
        "error"
      );
      return;
    }

    const markerId = loggedInLeader?.id || loggedInAdmin?.id || "tl-1";
    const key = `${empId}_${rosterDate}`;
    const prevRecord = data.attendance[key];
    const isSunday = isSundayDate(rosterDate);

    const wasSundayCompOff =
      isSunday &&
      prevRecord &&
      (prevRecord.status === "PRESENT" || prevRecord.status === "HALF_DAY");
    const willEarnSundayCompOff =
      isSunday && (status === "PRESENT" || status === "HALF_DAY");

    const { error } = await supabase.from("attendance").upsert(
      {
        emp_id: empId,
        attendance_date: rosterDate,
        status,
        marked_by: markerId,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "emp_id,attendance_date" }
    );

    if (error) {
      showToast(`Failed to save attendance: ${error.message}`, "error");
      return;
    }

    let coDelta = 0;
    if (!wasSundayCompOff && willEarnSundayCompOff) coDelta = 1;
    else if (wasSundayCompOff && !willEarnSundayCompOff) coDelta = -1;

    const targetEmp = data.employees.find((e) => e.id === empId);
    let nextCoBalance = targetEmp?.balances?.CO ?? 0;

    if (targetEmp && coDelta !== 0) {
      nextCoBalance = Math.max(0, Number((nextCoBalance + coDelta).toFixed(2)));
      await supabase
        .from("employees")
        .update({ co_balance: nextCoBalance })
        .eq("id", empId);
    }

    setData((prev) => ({
      ...prev,
      attendance: {
        ...prev.attendance,
        [key]: {
          status,
          markedBy: markerId,
          updatedAt: new Date().toISOString(),
        },
      },
      employees:
        coDelta !== 0
          ? prev.employees.map((e) =>
              e.id === empId
                ? { ...e, balances: { ...e.balances, CO: nextCoBalance } }
                : e
            )
          : prev.employees,
    }));

    if (coDelta > 0) {
      showToast(
        `Sunday work recorded — ${targetEmp?.name || "Employee"} earned +1 Comp Off!`
      );
    } else if (coDelta < 0) {
      showToast(
        `Sunday Comp Off adjusted (-1 CO) for ${targetEmp?.name || "Employee"}.`
      );
    }
  };

  // Unmark a single employee's attendance on rosterDate in Supabase
  const handleUnmarkAttendance = async (empId, empName) => {
    const key = `${empId}_${rosterDate}`;
    const existing = data.attendance[key];
    if (!existing) return;

    const { error } = await supabase
      .from("attendance")
      .delete()
      .eq("emp_id", empId)
      .eq("attendance_date", rosterDate);

    if (error) {
      showToast(`Failed to unmark attendance: ${error.message}`, "error");
      return;
    }

    const hadSundayCompOff =
      isSundayDate(rosterDate) &&
      (existing.status === "PRESENT" || existing.status === "HALF_DAY");

    const targetEmp = data.employees.find((e) => e.id === empId);
    const nextCoBalance = hadSundayCompOff
      ? Math.max(0, Number(((targetEmp?.balances?.CO ?? 0) - 1).toFixed(2)))
      : targetEmp?.balances?.CO ?? 0;

    if (hadSundayCompOff && targetEmp) {
      await supabase
        .from("employees")
        .update({ co_balance: nextCoBalance })
        .eq("id", empId);
    }

    setData((prev) => {
      const nextAtt = { ...prev.attendance };
      delete nextAtt[key];
      return {
        ...prev,
        attendance: nextAtt,
        employees: hadSundayCompOff
          ? prev.employees.map((e) =>
              e.id === empId
                ? { ...e, balances: { ...e.balances, CO: nextCoBalance } }
                : e
            )
          : prev.employees,
      };
    });
    showToast(`Unmarked attendance for ${empName} on ${rosterDate}.`);
  };

  // Clear all attendance marks for the currently selected Sunday in Supabase
  const handleClearSundayMarks = async () => {
    if (!isSundayDate(rosterDate)) return;

    const suffix = `_${rosterDate}`;
    const affectedEmpIds = Object.entries(data.attendance)
      .filter(
        ([key, rec]) =>
          key.endsWith(suffix) &&
          (rec.status === "PRESENT" || rec.status === "HALF_DAY")
      )
      .map(([key]) => key.slice(0, key.lastIndexOf("_")));

    const { error } = await supabase
      .from("attendance")
      .delete()
      .eq("attendance_date", rosterDate);

    if (error) {
      showToast(`Failed to clear Sunday marks: ${error.message}`, "error");
      return;
    }

    for (const empId of affectedEmpIds) {
      const emp = data.employees.find((e) => e.id === empId);
      if (emp) {
        const updatedCo = Math.max(0, Number(((emp.balances?.CO ?? 0) - 1).toFixed(2)));
        await supabase
          .from("employees")
          .update({ co_balance: updatedCo })
          .eq("id", empId);
      }
    }

    setData((prev) => {
      const nextAtt = {};
      let removed = 0;
      Object.entries(prev.attendance).forEach(([key, val]) => {
        if (key.endsWith(suffix)) {
          removed += 1;
        } else {
          nextAtt[key] = val;
        }
      });

      const nextEmployees = prev.employees.map((e) => {
        const countForEmp = affectedEmpIds.filter((id) => id === e.id).length;
        if (countForEmp === 0) return e;
        return {
          ...e,
          balances: {
            ...e.balances,
            CO: Math.max(0, Number(((e.balances?.CO ?? 0) - countForEmp).toFixed(2))),
          },
        };
      });

      showToast(
        removed > 0
          ? `Removed ${removed} Sunday mark(s) on ${rosterDate}.`
          : `No attendance marks found on ${rosterDate}.`
      );
      return { ...prev, attendance: nextAtt, employees: nextEmployees };
    });
  };

  // Bulk mark unmarked employees Present in Supabase
  const handleBulkMarkPresent = async () => {
    if (getHolidayName(rosterDate)) {
      showToast(
        `${rosterDate} is a National Holiday (${getHolidayName(rosterDate)}).`,
        "error"
      );
      return;
    }
    const markerId = loggedInLeader?.id || loggedInAdmin?.id || "tl-1";
    const isSunday = isSundayDate(rosterDate);

    const rowsToInsert = [];
    const compOffEmpIds = [];

    data.employees.forEach((emp) => {
      const hasApprovedLeave = data.leaveRequests.some(
        (lr) =>
          lr.empId === emp.id &&
          lr.status === "APPROVED" &&
          expandDateRange(lr.startDate, lr.endDate).includes(rosterDate)
      );
      const key = `${emp.id}_${rosterDate}`;
      if (!hasApprovedLeave && !data.attendance[key]) {
        rowsToInsert.push({
          emp_id: emp.id,
          attendance_date: rosterDate,
          status: "PRESENT",
          marked_by: markerId,
        });
        if (isSunday) compOffEmpIds.push(emp.id);
      }
    });

    if (rowsToInsert.length === 0) {
      showToast("No unmarked employees eligible for bulk Present.");
      return;
    }

    const { error } = await supabase
      .from("attendance")
      .upsert(rowsToInsert, { onConflict: "emp_id,attendance_date" });

    if (error) {
      showToast(`Bulk mark failed: ${error.message}`, "error");
      return;
    }

    for (const empId of compOffEmpIds) {
      const emp = data.employees.find((e) => e.id === empId);
      if (emp) {
        const nextCo = Number(((emp.balances?.CO ?? 0) + 1).toFixed(2));
        await supabase.from("employees").update({ co_balance: nextCo }).eq("id", empId);
      }
    }

    setData((prev) => {
      const nextAtt = { ...prev.attendance };
      rowsToInsert.forEach((r) => {
        nextAtt[`${r.emp_id}_${r.attendance_date}`] = {
          status: "PRESENT",
          markedBy: markerId,
        };
      });

      const nextEmployees =
        compOffEmpIds.length > 0
          ? prev.employees.map((e) =>
              compOffEmpIds.includes(e.id)
                ? {
                    ...e,
                    balances: {
                      ...e.balances,
                      CO: Number(((e.balances?.CO ?? 0) + 1).toFixed(2)),
                    },
                  }
                : e
            )
          : prev.employees;

      return { ...prev, attendance: nextAtt, employees: nextEmployees };
    });

    showToast(
      isSunday
        ? `Marked ${rowsToInsert.length} employee(s) Present on Sunday (+1 Comp Off each).`
        : `Marked ${rowsToInsert.length} unmarked employee(s) as Present.`
    );
  };

  // Approve/Reject leave request and deduct from earned leave balance in Supabase
  const handleLeaveDecision = async (reqId, decision) => {
    const reviewerId = loggedInLeader?.id || loggedInAdmin?.id || "tl-1";
    const target = data.leaveRequests.find((r) => r.id === reqId);
    if (!target || target.status !== "PENDING") return;

    const { error: reqErr } = await supabase
      .from("leave_requests")
      .update({ status: decision, reviewed_by: reviewerId })
      .eq("id", reqId);

    if (reqErr) {
      showToast(`Failed to update leave request: ${reqErr.message}`, "error");
      return;
    }

    let nextBalanceValue = null;
    const emp = employeesWithEarnedLeaves.find((e) => e.id === target.empId);

    if (decision === "APPROVED" && target.leaveType !== "LWP" && emp) {
      const currentBal = emp.balances[target.leaveType] ?? 0;
      nextBalanceValue = Math.max(
        0,
        Number((currentBal - target.daysCount).toFixed(2))
      );

      const balanceColumnMap = {
        PL: "pl_balance",
        CL: "cl_balance",
        SL: "sl_balance",
        CO: "co_balance",
      };
      const colName = balanceColumnMap[target.leaveType];
      if (colName) {
        const { error: balErr } = await supabase
          .from("employees")
          .update({ [colName]: nextBalanceValue })
          .eq("id", emp.id);

        if (balErr) {
          showToast(
            `Leave approved, but balance update failed: ${balErr.message}`,
            "error"
          );
        }
      }
    }

    setData((prev) => {
      const updatedRequests = prev.leaveRequests.map((r) =>
        r.id === reqId ? { ...r, status: decision, reviewedBy: reviewerId } : r
      );

      const updatedEmployees =
        decision === "APPROVED" &&
        target.leaveType !== "LWP" &&
        nextBalanceValue !== null
          ? prev.employees.map((item) =>
              item.id === target.empId
                ? {
                    ...item,
                    balances: {
                      ...item.balances,
                      [target.leaveType]: nextBalanceValue,
                    },
                  }
                : item
            )
          : prev.employees;

      return {
        ...prev,
        employees: updatedEmployees,
        leaveRequests: updatedRequests,
      };
    });

    showToast(
      decision === "APPROVED"
        ? "Approved — earned leave deducted and calendar set to Pink."
        : "Leave request rejected."
    );
  };

  const downloadCsvString = (csvString, filename) => {
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExportCSV = () => {
    const headers = [
      "Emp Code",
      "Name",
      "Department",
      "Notice Period",
      rosterDate,
      "Earned PL",
      "Earned CL",
      "Earned SL",
      "Comp Off (CO)",
    ];
    const rows = employeesWithEarnedLeaves.map((emp) => {
      const onApprovedLeave = data.leaveRequests.some(
        (lr) =>
          lr.empId === emp.id &&
          lr.status === "APPROVED" &&
          expandDateRange(lr.startDate, lr.endDate).includes(rosterDate)
      );
      const attStatus = getHolidayName(rosterDate)
        ? `HOLIDAY (${getHolidayName(rosterDate)})`
        : isSundayDate(rosterDate) && !data.attendance[`${emp.id}_${rosterDate}`]
        ? "WEEKLY_OFF_SUNDAY"
        : onApprovedLeave
        ? "APPROVED_LEAVE"
        : data.attendance[`${emp.id}_${rosterDate}`]?.status || "UNMARKED";
      return [
        emp.empCode,
        `"${emp.name}"`,
        emp.department,
        emp.onNoticePeriod ? "YES" : "NO",
        attStatus,
        emp.balances.PL,
        emp.balances.CL,
        emp.balances.SL,
        emp.balances.CO,
      ].join(",");
    });
    const csvContent = [headers.join(","), ...rows].join("\n");
    downloadCsvString(csvContent, `indiiserve_attendance_${rosterDate}.csv`);
    showToast(`Exported indiiserve_attendance_${rosterDate}.csv`);
  };

  const handleExportMonthEndSummaryCSV = () => {
    const yearMonth = rosterDate.slice(0, 7);
    const [yStr, mStr] = yearMonth.split("-");
    const yNum = Number(yStr);
    const mIdx = Number(mStr) - 1;
    const daysInMonth = new Date(yNum, mIdx + 1, 0).getDate();

    const monthDates = [];
    for (let d = 1; d <= daysInMonth; d++) {
      monthDates.push(`${yearMonth}-${String(d).padStart(2, "0")}`);
    }

    const headers = [
      "Month",
      "Emp Code",
      "Name",
      "Department",
      "Notice Period",
      "Full Days (Green)",
      "Half Days (Half-Green)",
      "Absent Days (Red)",
      "Approved Leave Days (Pink)",
      "Pending Sick Leave Days (Grey)",
      "LWP Days",
      "Paid / Attendance Day Credits",
      "Earned PL Left",
      "Earned CL Left",
      "Earned SL Left",
      "Comp Off (CO)",
    ];

    const rows = employeesWithEarnedLeaves.map((emp) => {
      let fullDays = 0;
      let halfDays = 0;
      let absentDays = 0;
      let approvedLeaveDays = 0;
      let approvedPaidLeaveDays = 0;
      let lwpDays = 0;
      let pendingSickDays = 0;

      data.leaveRequests.forEach((lr) => {
        if (lr.empId !== emp.id || lr.status === "REJECTED") return;
        const overlappingDays = expandDateRange(lr.startDate, lr.endDate).filter(
          (dStr) => dStr.startsWith(yearMonth) && !getHolidayName(dStr)
        );
        if (overlappingDays.length === 0) return;

        const dayWeight = lr.isHalfDay ? 0.5 : overlappingDays.length;
        if (lr.status === "APPROVED") {
          approvedLeaveDays += dayWeight;
          if (lr.leaveType === "LWP") {
            lwpDays += dayWeight;
          } else {
            approvedPaidLeaveDays += dayWeight;
          }
        } else if (lr.status === "PENDING" && lr.leaveType === "SL") {
          pendingSickDays += dayWeight;
        }
      });

      monthDates.forEach((dStr) => {
        const rec = data.attendance[`${emp.id}_${dStr}`];
        if (!rec) return;
        if (rec.status === "PRESENT") fullDays += 1;
        else if (rec.status === "HALF_DAY") halfDays += 1;
        else if (rec.status === "ABSENT") absentDays += 1;
      });

      const paidDayCredits = Number(
        (fullDays + halfDays * 0.5 + approvedPaidLeaveDays).toFixed(1)
      );

      return [
        yearMonth,
        emp.empCode,
        `"${emp.name}"`,
        emp.department,
        emp.onNoticePeriod ? "YES" : "NO",
        fullDays,
        halfDays,
        absentDays,
        Number(approvedLeaveDays.toFixed(1)),
        Number(pendingSickDays.toFixed(1)),
        Number(lwpDays.toFixed(1)),
        paidDayCredits,
        emp.balances.PL,
        emp.balances.CL,
        emp.balances.SL,
        emp.balances.CO,
      ].join(",");
    });

    const csvContent = [headers.join(","), ...rows].join("\n");
    const filename = `indiiserve_month_end_summary_${yearMonth}.csv`;
    downloadCsvString(csvContent, filename);
    showToast(`Exported ${filename}`);
  };

  const filteredRoster = useMemo(() => {
    return employeesWithEarnedLeaves
      .map((emp) => {
        const approvedLeave = data.leaveRequests.find(
          (lr) =>
            lr.empId === emp.id &&
            lr.status === "APPROVED" &&
            expandDateRange(lr.startDate, lr.endDate).includes(rosterDate)
        );
        const rec = data.attendance[`${emp.id}_${rosterDate}`];
        const effectiveStatus = approvedLeave ? "ON_LEAVE" : rec?.status || "UNMARKED";
        const isMarked = Boolean(rec);
        return { ...emp, effectiveStatus, approvedLeave, isMarked };
      })
      .filter((item) => {
        const matchesQuery =
          item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.empCode.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus =
          statusFilter === "ALL" || item.effectiveStatus === statusFilter;
        return matchesQuery && matchesStatus;
      });
  }, [
    employeesWithEarnedLeaves,
    data.leaveRequests,
    data.attendance,
    rosterDate,
    searchQuery,
    statusFilter,
  ]);

  const rosterSummary = useMemo(() => {
    const all = employeesWithEarnedLeaves.map((emp) => {
      const approvedLeave = data.leaveRequests.some(
        (lr) =>
          lr.empId === emp.id &&
          lr.status === "APPROVED" &&
          expandDateRange(lr.startDate, lr.endDate).includes(rosterDate)
      );
      if (approvedLeave) return "ON_LEAVE";
      return data.attendance[`${emp.id}_${rosterDate}`]?.status || "UNMARKED";
    });
    return {
      present: all.filter((s) => s === "PRESENT").length,
      halfDay: all.filter((s) => s === "HALF_DAY").length,
      absent: all.filter((s) => s === "ABSENT").length,
      onLeave: all.filter((s) => s === "ON_LEAVE").length,
      unmarked: all.filter((s) => s === "UNMARKED").length,
    };
  }, [employeesWithEarnedLeaves, data.leaveRequests, data.attendance, rosterDate]);

  const selectedIsSunday = isSundayDate(rosterDate);

  const monthLabel = new Date(calYear, calMonth, 1).toLocaleString("en-US", {
    month: "long",
    year: "numeric",
  });

  const renderCalendarDayStyle = (cell) => {
    if (cell.holidayName) {
      return {
        className: "bg-amber-50 text-amber-900 border-amber-300 font-semibold",
        style: {},
        badge: cell.holidayName,
      };
    }
    if (cell.isSunday) {
      const workedSunday =
        cell.info?.kind === "PRESENT" || cell.info?.kind === "HALF_DAY";
      return {
        className: workedSunday
          ? "bg-violet-100 text-violet-950 border-violet-300 font-semibold"
          : "bg-slate-100 text-slate-600 border-slate-200 font-medium",
        style: {},
        badge: workedSunday ? "Weekly Off • +1 CO" : "Weekly Off",
      };
    }
    if (!cell.info) {
      return {
        className:
          "bg-white text-slate-700 border-slate-200 hover:border-indigo-200",
        style: {},
        badge: "",
      };
    }
    switch (cell.info.kind) {
      case "PRESENT":
        return {
          className:
            "bg-emerald-500 text-white border-emerald-600 font-semibold shadow-2xs",
          style: {},
          badge: "Full Day",
        };
      case "HALF_DAY":
        return {
          className:
            "text-slate-900 border-emerald-600 font-semibold shadow-2xs",
          style: {
            background: "linear-gradient(135deg, #22c55e 50%, #f1f5f9 50%)",
          },
          badge: "Half Day",
        };
      case "ABSENT":
        return {
          className:
            "bg-rose-500 text-white border-rose-600 font-semibold shadow-2xs",
          style: {},
          badge: "Absent",
        };
      case "PENDING_SL":
        return {
          className: "bg-gray-400 text-white border-gray-500 font-medium",
          style: {},
          badge: "Sick Req",
        };
      case "APPROVED_LEAVE":
        return {
          className:
            "bg-pink-400 text-white border-pink-500 font-semibold shadow-2xs",
          style: {},
          badge: cell.info.isHalfDay
            ? `Pink 0.5d (${cell.info.leaveType})`
            : `Approved (${cell.info.leaveType})`,
        };
      case "PENDING_OTHER":
      default:
        return {
          className: "bg-amber-100 text-amber-900 border-amber-300 font-medium",
          style: {},
          badge: `Pending ${cell.info.leaveType || ""}`,
        };
    }
  };

  // Reusable Add/Remove Employees Section
  const renderManageEmployeesSection = () => (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs lg:col-span-5">
        <div className="mb-4 flex items-center gap-2">
          <UserPlus className="h-5 w-5 text-indigo-600" />
          <h2 className="text-base font-bold text-slate-900">Add New Employee</h2>
        </div>

        <form onSubmit={handleAddEmployee} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Full Name
            </label>
            <input
              type="text"
              value={newEmpForm.name}
              onChange={(e) => setNewEmpForm((p) => ({ ...p, name: e.target.value }))}
              placeholder="e.g. Bibek Kar"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-indigo-500 focus:outline-none"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Employee ID / Code
              </label>
              <input
                type="text"
                value={newEmpForm.empCode}
                onChange={(e) =>
                  setNewEmpForm((p) => ({ ...p, empCode: e.target.value }))
                }
                placeholder="e.g. JSW123"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs uppercase focus:border-indigo-500 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Login Password
              </label>
              <input
                type="text"
                value={newEmpForm.password}
                onChange={(e) =>
                  setNewEmpForm((p) => ({ ...p, password: e.target.value }))
                }
                placeholder="emp123"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-indigo-500 focus:outline-none"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Department
              </label>
              <select
                value={newEmpForm.department}
                onChange={(e) =>
                  setNewEmpForm((p) => ({ ...p, department: e.target.value }))
                }
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-indigo-500 focus:outline-none"
              >
                <option value="Engineering">Engineering</option>
                <option value="Operations">Operations</option>
                <option value="HR & Admin">HR & Admin</option>
                <option value="Sales & Support">Sales & Support</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Reporting Leader
              </label>
              <select
                value={newEmpForm.teamLeaderId}
                onChange={(e) =>
                  setNewEmpForm((p) => ({ ...p, teamLeaderId: e.target.value }))
                }
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-indigo-500 focus:outline-none"
              >
                {data.teamLeaders.map((tl) => (
                  <option key={tl.id} value={tl.id}>
                    {tl.name} ({tl.team})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Joining Date
              </label>
              <input
                type="date"
                value={newEmpForm.joiningDate}
                onChange={(e) =>
                  setNewEmpForm((p) => ({ ...p, joiningDate: e.target.value }))
                }
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Initial Comp Off (CO)
              </label>
              <input
                type="number"
                step="0.5"
                min="0"
                value={newEmpForm.CO}
                onChange={(e) =>
                  setNewEmpForm((p) => ({ ...p, CO: e.target.value }))
                }
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
              />
            </div>
          </div>

          <div className="rounded-xl border border-indigo-100 bg-indigo-50/60 p-3 text-[11px] text-indigo-950">
            <strong>Monthly Accrual Rule:</strong> Accrual begins from the 1st of the
            month after joining (or joining month if on the 1st), adding{" "}
            <strong>1.25 PL</strong>, <strong>1.00 SL</strong>, and{" "}
            <strong>0.83 CL</strong> per month.
          </div>

          <button
            type="submit"
            className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow-xs transition hover:bg-indigo-700"
          >
            <UserPlus className="h-4 w-4" />
            Add Employee to Company Roster
          </button>
        </form>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs lg:col-span-7">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Current Employees ({employeesWithEarnedLeaves.length})
            </h2>
            <p className="text-xs text-slate-500">
              Earned leave balances update monthly and deduct approved leaves.
            </p>
          </div>
        </div>

        <div className="divide-y divide-slate-100 max-h-[520px] overflow-y-auto">
          {employeesWithEarnedLeaves.map((emp) => (
            <div
              key={emp.id}
              className="flex flex-wrap items-center justify-between gap-3 py-3 px-2 rounded-lg transition hover:bg-slate-50"
            >
              <div>
                <div className="text-sm font-semibold text-slate-900">
                  {emp.name}{" "}
                  <span className="rounded bg-slate-100 px-1.5 py-0.5 text-xs font-mono text-slate-700">
                    {emp.empCode}
                  </span>
                </div>
                <div className="mt-0.5 text-xs text-slate-500">
                  {emp.department} • Joined: {emp.joiningDate} • Earned (
                  {emp.monthsEarned} mo): PL {emp.balances.PL} | CL{" "}
                  {emp.balances.CL} | SL {emp.balances.SL} | CO {emp.balances.CO}
                </div>
              </div>

              <div className="flex items-center gap-2">
                {isLeaderUser && (
                  <button
                    type="button"
                    onClick={() => {
                      setInspectedEmpId(emp.id);
                      setLeaderViewMode("EMPLOYEE");
                    }}
                    className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
                  >
                    View Calendar
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleRemoveEmployee(emp.id, emp.name)}
                  className="flex items-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1.5 text-xs font-semibold text-rose-700 transition hover:bg-rose-100"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Reusable Attendance & Leave Approval Section
  const renderAttendanceAndLeavesSection = () => {
    const hasActiveFilter =
      searchQuery.trim().length > 0 || statusFilter !== "ALL";

    return (
      <>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
            <div className="text-xs font-medium text-emerald-700">Present</div>
            <div className="mt-1 text-2xl font-bold text-emerald-900">
              {rosterSummary.present}
            </div>
          </div>
          <div className="rounded-xl border border-emerald-200 bg-white p-4">
            <div className="text-xs font-medium text-emerald-700">Half-Day</div>
            <div className="mt-1 text-2xl font-bold text-slate-900">
              {rosterSummary.halfDay}
            </div>
          </div>
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-4">
            <div className="text-xs font-medium text-rose-700">Absent</div>
            <div className="mt-1 text-2xl font-bold text-rose-900">
              {rosterSummary.absent}
            </div>
          </div>
          <div className="rounded-xl border border-pink-200 bg-pink-50 p-4">
            <div className="text-xs font-medium text-pink-700">Approved Leave</div>
            <div className="mt-1 text-2xl font-bold text-pink-900">
              {rosterSummary.onLeave}
            </div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 col-span-2 sm:col-span-1">
            <div className="text-xs font-medium text-slate-500">Unmarked</div>
            <div className="mt-1 text-2xl font-bold text-slate-900">
              {rosterSummary.unmarked}
            </div>
          </div>
        </div>

        {getHolidayName(rosterDate) && (
          <div className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-xs font-semibold text-amber-900">
            {rosterDate} is a National Holiday ({getHolidayName(rosterDate)}) under
            Indiiserve Policy Section 3.6.
          </div>
        )}

        {selectedIsSunday && (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-violet-300 bg-violet-50 px-4 py-3 text-xs text-violet-950">
            <div className="font-semibold">
              {rosterDate} is a Sunday (Weekly Off). Marking Present or Half-Day grants{" "}
              <span className="underline">+1 Comp Off</span> automatically.
            </div>
            <button
              type="button"
              onClick={handleClearSundayMarks}
              className="flex items-center gap-1.5 rounded-lg bg-violet-700 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-violet-800"
            >
              <Undo2 className="h-3.5 w-3.5" />
              Clear Sunday Marks
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs lg:col-span-8">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Daily Attendance Roster
                </h2>
                <p className="text-xs text-slate-500">
                  Mark Present, Half-Day, or Absent per day. Sunday work earns +1 Comp Off.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <div className="inline-flex items-center gap-1">
                  <input
                    type="date"
                    value={rosterDate}
                    onChange={(e) => setRosterDate(e.target.value)}
                    className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700"
                  />
                  <button
                    type="button"
                    onClick={handleSetRosterToday}
                    className="rounded-lg border border-indigo-200 bg-indigo-50 px-2.5 py-1.5 text-xs font-semibold text-indigo-700 transition hover:bg-indigo-100"
                  >
                    Today
                  </button>
                </div>
                <button
                  type="button"
                  onClick={handleBulkMarkPresent}
                  className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-emerald-700"
                >
                  <UserCheck className="h-3.5 w-3.5" />
                  Mark Unmarked Present
                </button>
                <button
                  type="button"
                  onClick={handleExportCSV}
                  title="Export selected day's attendance CSV"
                  className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  <Download className="h-3.5 w-3.5" />
                  Day CSV
                </button>
                <button
                  type="button"
                  onClick={handleExportMonthEndSummaryCSV}
                  title={`Export full month-end summary CSV for ${rosterDate.slice(0, 7)}`}
                  className="flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700 transition hover:bg-indigo-100"
                >
                  <FileSpreadsheet className="h-3.5 w-3.5" />
                  Month Summary CSV
                </button>
              </div>
            </div>

            <div className="mb-3 flex flex-wrap items-center gap-3">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search employee name or code..."
                  className="w-full rounded-lg border border-slate-300 pl-9 pr-3 py-1.5 text-xs focus:border-indigo-500 focus:outline-none"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700"
              >
                <option value="ALL">All Statuses</option>
                <option value="UNMARKED">Unmarked</option>
                <option value="PRESENT">Present</option>
                <option value="HALF_DAY">Half-Day</option>
                <option value="ABSENT">Absent</option>
                <option value="ON_LEAVE">Approved Leave</option>
              </select>
            </div>

            {/* Active Search & Filter Reset Pill Bar */}
            {hasActiveFilter && (
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-indigo-100 bg-indigo-50/60 px-3 py-2 text-xs">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[11px] font-medium text-slate-600">
                    Active filters ({filteredRoster.length} shown):
                  </span>
                  {searchQuery.trim() && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-0.5 text-[11px] font-semibold text-indigo-800 border border-indigo-200">
                      Search: &ldquo;{searchQuery.trim()}&rdquo;
                      <button
                        type="button"
                        onClick={() => setSearchQuery("")}
                        aria-label="Remove search filter"
                        className="text-indigo-500 hover:text-indigo-900"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  )}
                  {statusFilter !== "ALL" && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-0.5 text-[11px] font-semibold text-indigo-800 border border-indigo-200">
                      Status: {statusFilter.replace("_", " ")}
                      <button
                        type="button"
                        onClick={() => setStatusFilter("ALL")}
                        aria-label="Remove status filter"
                        className="text-indigo-500 hover:text-indigo-900"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={handleClearRosterFilters}
                  className="inline-flex items-center gap-1 rounded-full bg-indigo-600 px-3 py-1 text-[11px] font-semibold text-white transition hover:bg-indigo-700"
                >
                  <X className="h-3 w-3" />
                  Clear Filters
                </button>
              </div>
            )}

            <div className="divide-y divide-slate-100 max-h-[540px] overflow-y-auto">
              {filteredRoster.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center text-xs text-slate-500">
                  No employees match the current filter.{" "}
                  <button
                    type="button"
                    onClick={handleClearRosterFilters}
                    className="font-semibold text-indigo-600 underline"
                  >
                    Clear Filters
                  </button>
                </div>
              ) : (
                filteredRoster.map((emp) => (
                  <div
                    key={emp.id}
                    className="flex flex-wrap items-center justify-between gap-3 py-3 px-2 rounded-lg transition hover:bg-slate-50"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-slate-900">
                          {emp.name}{" "}
                          <span className="text-xs font-normal text-slate-500">
                            ({emp.empCode})
                          </span>
                        </span>
                        {emp.onNoticePeriod && (
                          <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-800">
                            Notice
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-500">
                        {emp.department} • Earned PL: {emp.balances.PL} | CL:{" "}
                        {emp.balances.CL} | SL: {emp.balances.SL} | CO: {emp.balances.CO}
                      </div>
                    </div>

                    {emp.effectiveStatus === "ON_LEAVE" ? (
                      <span className="rounded-full bg-pink-100 px-3 py-1 text-xs font-semibold text-pink-800">
                        Approved Leave ({emp.approvedLeave?.leaveType})
                      </span>
                    ) : (
                      <div className="flex flex-wrap items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleMarkAttendance(emp.id, "PRESENT")}
                          className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold transition ${
                            emp.effectiveStatus === "PRESENT"
                              ? "bg-emerald-600 text-white shadow-2xs"
                              : "bg-slate-100 text-slate-700 hover:bg-emerald-100 hover:text-emerald-800"
                          }`}
                        >
                          Present
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMarkAttendance(emp.id, "HALF_DAY")}
                          className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold transition ${
                            emp.effectiveStatus === "HALF_DAY"
                              ? "bg-emerald-500 text-white shadow-2xs"
                              : "bg-slate-100 text-slate-700 hover:bg-emerald-50"
                          }`}
                        >
                          Half-Day
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMarkAttendance(emp.id, "ABSENT")}
                          className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold transition ${
                            emp.effectiveStatus === "ABSENT"
                              ? "bg-rose-600 text-white shadow-2xs"
                              : "bg-slate-100 text-slate-700 hover:bg-rose-100 hover:text-rose-800"
                          }`}
                        >
                          Absent
                        </button>
                        {emp.isMarked && (
                          <button
                            type="button"
                            onClick={() => handleUnmarkAttendance(emp.id, emp.name)}
                            title={`Unmark attendance for ${emp.name} on ${rosterDate}`}
                            className="flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-amber-50 hover:border-amber-300 hover:text-amber-900"
                          >
                            <Undo2 className="h-3.5 w-3.5" />
                            Unmark
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs lg:col-span-4">
            <div className="mb-4 flex items-center gap-2">
              <Clock className="h-5 w-5 text-amber-600" />
              <h2 className="text-base font-bold text-slate-900">
                Leave Approval Queue
              </h2>
            </div>

            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
              {data.leaveRequests.filter((r) => r.status === "PENDING").length ===
              0 ? (
                <div className="rounded-xl border border-dashed border-slate-200 p-6 text-center text-xs text-slate-500">
                  No pending leave requests right now.
                </div>
              ) : (
                data.leaveRequests
                  .filter((r) => r.status === "PENDING")
                  .map((lr) => {
                    const emp = employeesWithEarnedLeaves.find(
                      (e) => e.id === lr.empId
                    );
                    return (
                      <div
                        key={lr.id}
                        className="rounded-xl border border-slate-200 bg-slate-50/90 p-3.5 text-xs"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="font-bold text-slate-900">
                              {emp?.name} ({emp?.empCode})
                            </div>
                            <div className="mt-0.5 font-semibold text-indigo-700">
                              {lr.leaveType} • {lr.daysCount} day
                              {lr.daysCount === 1 ? "" : "s"}
                            </div>
                          </div>
                          <span className="rounded bg-gray-200 px-2 py-0.5 text-[10px] font-bold text-gray-800">
                            PENDING
                          </span>
                        </div>

                        <div className="mt-2 text-slate-600">
                          Dates:{" "}
                          <span className="font-medium text-slate-800">
                            {lr.startDate}
                          </span>
                          {lr.endDate !== lr.startDate && (
                            <>
                              {" "}
                              to{" "}
                              <span className="font-medium text-slate-800">
                                {lr.endDate}
                              </span>
                            </>
                          )}
                        </div>
                        <p className="mt-1 text-slate-600 italic">“{lr.reason}”</p>
                        {lr.handoverNote && (
                          <p className="mt-1 text-[11px] text-slate-500">
                            Handover: {lr.handoverNote}
                          </p>
                        )}

                        <div className="mt-3 flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleLeaveDecision(lr.id, "APPROVED")}
                            className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-pink-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-pink-700"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Approve (Pink)
                          </button>
                          <button
                            type="button"
                            onClick={() => handleLeaveDecision(lr.id, "REJECTED")}
                            className="flex flex-1 items-center justify-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-rose-50 hover:text-rose-700"
                          >
                            <XCircle className="h-3.5 w-3.5" />
                            Reject
                          </button>
                        </div>
                      </div>
                    );
                  })
              )}
            </div>
          </div>
        </div>
      </>
    );
  };

  // ==================== LOADING SCREEN ====================
  if (loadingDb) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-6 py-4 text-sm font-semibold text-slate-700 shadow-xs">
          <Loader2 className="h-5 w-5 animate-spin text-indigo-600" />
          <span>Connecting to InDiiServe database...</span>
        </div>
      </div>
    );
  }

  // ==================== LOGIN SCREEN ====================
  if (!authUser) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-100 via-indigo-50/40 to-slate-100 px-4 py-10">
        <div className="w-full max-w-md rounded-2xl border border-slate-200/90 bg-white p-8 shadow-xl shadow-slate-200/60">
          <div className="flex flex-col gap-1">
            <InDiiServeLogo variant="login" />
            <p className="text-xs text-slate-500">
              Attendance & Leave Management System
            </p>
          </div>

          {dbError && (
            <div className="mt-4 rounded-xl border border-amber-300 bg-amber-50 px-3.5 py-2.5 text-xs text-amber-900">
              <strong>Supabase Notice:</strong> {dbError}
            </div>
          )}

          <div className="mt-6 grid grid-cols-3 rounded-xl bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => {
                setLoginRole("ADMIN");
                setLoginError("");
              }}
              className={`flex items-center justify-center gap-1 rounded-lg py-2 text-xs font-semibold transition ${
                loginRole === "ADMIN"
                  ? "bg-white text-indigo-700 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <UserCog className="h-3.5 w-3.5" />
              Admin
            </button>
            <button
              type="button"
              onClick={() => {
                setLoginRole("TEAM_LEADER");
                setLoginError("");
              }}
              className={`flex items-center justify-center gap-1 rounded-lg py-2 text-xs font-semibold transition ${
                loginRole === "TEAM_LEADER"
                  ? "bg-white text-indigo-700 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              Leader
            </button>
            <button
              type="button"
              onClick={() => {
                setLoginRole("EMPLOYEE");
                setLoginError("");
              }}
              className={`flex items-center justify-center gap-1 rounded-lg py-2 text-xs font-semibold transition ${
                loginRole === "EMPLOYEE"
                  ? "bg-white text-indigo-700 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Users className="h-3.5 w-3.5" />
              Employee
            </button>
          </div>

          <form onSubmit={handleLoginSubmit} className="mt-5 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                {loginRole === "ADMIN"
                  ? "Admin ID"
                  : loginRole === "TEAM_LEADER"
                  ? "Team Leader ID"
                  : "Employee Code"}
              </label>
              <input
                type="text"
                value={loginIdInput}
                onChange={(e) => setLoginIdInput(e.target.value)}
                placeholder={
                  loginRole === "ADMIN"
                    ? "Enter Admin ID"
                    : loginRole === "TEAM_LEADER"
                    ? "Enter Team Leader ID"
                    : "Enter Employee Code"
                }
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm font-medium text-slate-900 transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="password"
                  value={loginPasswordInput}
                  onChange={(e) => setLoginPasswordInput(e.target.value)}
                  placeholder="Enter password"
                  className="w-full rounded-xl border border-slate-300 pl-10 pr-3.5 py-2.5 text-sm text-slate-900 transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15 focus:outline-none"
                  required
                />
              </div>
            </div>

            {loginError && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-xs font-medium text-rose-700">
                {loginError}
              </div>
            )}

            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
            >
              <LogIn className="h-4 w-4" />
              Sign In
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ==================== AUTHENTICATED PORTAL ====================
  const signedInLabel = isAdminUser
    ? `${loggedInAdmin?.name} (${loggedInAdmin?.code} • Admin)`
    : isLeaderUser
    ? `${loggedInLeader?.name} (${loggedInLeader?.code} • Team Leader)`
    : `${currentEmployee?.name} (${currentEmployee?.empCode} • Employee)`;

  const activeDoc =
    HR_HANDBOOK_DOCS.find((d) => d.id === selectedHandbookId) || HR_HANDBOOK_DOCS[0];

  const filteredHandbookSections = activeDoc.sections
    .map((sec, idx) => ({ ...sec, originalIdx: idx }))
    .filter((sec) => {
      const q = handbookQuery.trim().toLowerCase();
      if (!q) return true;
      const hay = [
        sec.heading,
        ...(sec.paragraphs || []),
        ...(sec.bullets || []),
      ]
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });

  return (
    <div className="min-h-screen bg-slate-50/90 text-slate-800">
      {toast && (
        <div
          className={`fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium text-white shadow-lg ${
            toast.type === "error" ? "bg-rose-600" : "bg-slate-900"
          }`}
        >
          {toast.type === "error" ? (
            <AlertCircle className="h-4 w-4 shrink-0" />
          ) : (
            <Sparkles className="h-4 w-4 shrink-0 text-emerald-400" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-30 border-b border-slate-200/90 bg-white/95 backdrop-blur-xs">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-3.5 sm:px-6">
          <div className="flex items-center gap-3">
            <InDiiServeLogo compact onClick={goHomePortal} />
            <div className="hidden sm:block h-6 w-px bg-slate-200" />
            <div>
              <h1 className="text-sm sm:text-base font-bold tracking-tight text-slate-900">
                {activePage === "HANDBOOK"
                  ? "HR Handbook"
                  : "Attendance & Leave Portal"}
              </h1>
              <p className="text-xs text-slate-500">
                Signed in as{" "}
                <strong className="text-slate-700">{signedInLabel}</strong>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {activePage === "HANDBOOK" ? (
              <button
                type="button"
                onClick={goHomePortal}
                className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Back to Portal
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setActivePage("HANDBOOK")}
                className="flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-gradient-to-r from-indigo-50 to-purple-50 px-3 py-1.5 text-xs font-semibold text-indigo-700 transition hover:from-indigo-100 hover:to-purple-100"
              >
                <BookOpen className="h-3.5 w-3.5" />
                HR Handbook
              </button>
            )}

            {activePage === "PORTAL" && isLeaderUser && (
              <>
                <div className="inline-flex rounded-lg bg-slate-100 p-1">
                  <button
                    type="button"
                    onClick={() => setLeaderViewMode("TEAM_LEADER")}
                    className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition ${
                      leaderViewMode === "TEAM_LEADER"
                        ? "bg-white text-indigo-700 shadow-2xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Leader Dashboard
                  </button>
                  <button
                    type="button"
                    onClick={() => setLeaderViewMode("EMPLOYEE")}
                    className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition ${
                      leaderViewMode === "EMPLOYEE"
                        ? "bg-white text-indigo-700 shadow-2xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <Users className="h-3.5 w-3.5" />
                    Employee View
                  </button>
                </div>

                {leaderViewMode === "EMPLOYEE" && (
                  <select
                    value={inspectedEmpId}
                    onChange={(e) => setInspectedEmpId(e.target.value)}
                    className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-2xs focus:border-indigo-500 focus:outline-none"
                  >
                    {employeesWithEarnedLeaves.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.empCode} — {emp.name}
                      </option>
                    ))}
                  </select>
                )}
              </>
            )}

            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-slate-800"
            >
              <LogOut className="h-3.5 w-3.5" />
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        {activePage === "HANDBOOK" ? (
          /* ==================== COLORFUL PROFESSIONAL HR HANDBOOK PAGE ==================== */
          <div className="space-y-6">
            <div className="overflow-hidden rounded-2xl border border-indigo-200/80 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 px-6 py-6 text-white shadow-md">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[11px] font-semibold tracking-wide text-indigo-100">
                    <Award className="h-3.5 w-3.5 text-amber-300" />
                    InDiiServe Corporate Governance
                  </span>
                  <h2 className="mt-2 text-2xl font-bold tracking-tight">
                    HR Handbook & Company Policies
                  </h2>
                  <p className="mt-1 text-xs sm:text-sm text-indigo-100/85">
                    Structured guidelines for workplace conduct, monthly leave accruals,
                    Sunday comp-off rules, exits, and payroll.
                  </p>
                </div>
              </div>
            </div>

            {/* Handbook Search & Quick Jump Pills */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="relative flex-1 min-w-[220px]">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={handbookQuery}
                    onChange={(e) => setHandbookQuery(e.target.value)}
                    placeholder="Filter policy clauses (e.g. Comp Off, notice period, payroll, POSH)..."
                    className="w-full rounded-lg border border-slate-300 pl-9 pr-8 py-1.5 text-xs focus:border-indigo-500 focus:outline-none"
                  />
                  {handbookQuery && (
                    <button
                      type="button"
                      onClick={() => setHandbookQuery("")}
                      aria-label="Clear handbook search"
                      className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-700"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
                <div className="text-[11px] text-slate-500">
                  Quick jump:
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                {HANDBOOK_QUICK_JUMPS.map((jump) => {
                  const isActiveJump =
                    handbookQuery.toLowerCase() === jump.keyword.toLowerCase() &&
                    selectedHandbookId === jump.docId;
                  return (
                    <button
                      key={jump.label}
                      type="button"
                      onClick={() => handleHandbookQuickJump(jump)}
                      className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                        isActiveJump
                          ? "bg-indigo-600 text-white shadow-2xs"
                          : "bg-slate-100 text-slate-700 hover:bg-indigo-50 hover:text-indigo-700"
                      }`}
                    >
                      {jump.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
              {HR_HANDBOOK_DOCS.map((doc) => {
                const isSelected = doc.id === activeDoc.id;
                return (
                  <button
                    key={doc.id}
                    type="button"
                    onClick={() => setSelectedHandbookId(doc.id)}
                    className={`flex flex-col items-start justify-between rounded-2xl border bg-gradient-to-br p-4 text-left transition ${
                      isSelected ? doc.cardBg : doc.idleCard
                    }`}
                  >
                    <span
                      className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                        isSelected
                          ? "bg-white/20 text-white"
                          : "bg-slate-900/5 text-slate-700"
                      }`}
                    >
                      {doc.badge}
                    </span>
                    <span className="mt-3 text-sm font-bold leading-snug">
                      {doc.title}
                    </span>
                  </button>
                );
              })}
            </div>

            <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className={`px-6 py-5 sm:px-8 ${activeDoc.headerBand}`}>
                <div className="text-xs font-semibold uppercase tracking-wider opacity-90">
                  {activeDoc.badge}
                </div>
                <h3 className="mt-1 text-xl sm:text-2xl font-extrabold">
                  {activeDoc.title}
                </h3>
              </div>

              <div className="p-6 sm:p-8 space-y-5">
                {filteredHandbookSections.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center text-xs text-slate-500">
                    No sections in <strong>{activeDoc.title}</strong> match &ldquo;
                    {handbookQuery}&rdquo;.{" "}
                    <button
                      type="button"
                      onClick={() => setHandbookQuery("")}
                      className="font-semibold text-indigo-600 underline"
                    >
                      Reset filter
                    </button>
                  </div>
                ) : (
                  filteredHandbookSections.map((sec) => (
                    <section
                      key={sec.originalIdx}
                      ref={(el) => {
                        handbookSectionRefs.current[
                          `${activeDoc.id}-${sec.originalIdx}`
                        ] = el;
                      }}
                      className={`rounded-xl p-4 sm:p-5 space-y-2.5 ${activeDoc.sectionAccent}`}
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className={`h-2.5 w-2.5 rounded-full shrink-0 ${activeDoc.dotColor}`}
                        />
                        <h4 className="text-sm font-bold text-slate-900">
                          {sec.heading}
                        </h4>
                      </div>
                      {sec.paragraphs &&
                        sec.paragraphs.map((p, pIdx) => (
                          <p
                            key={pIdx}
                            className="text-sm leading-relaxed text-slate-700"
                          >
                            {p}
                          </p>
                        ))}
                      {sec.bullets && sec.bullets.length > 0 && (
                        <ul className="list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-slate-700">
                          {sec.bullets.map((b, bIdx) => (
                            <li key={bIdx}>{b}</li>
                          ))}
                        </ul>
                      )}
                    </section>
                  ))
                )}
              </div>
            </article>
          </div>
        ) : effectiveView === "ADMIN" ? (
          /* ADMIN VIEW */
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-3 shadow-xs">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setAdminTab("LEADERS")}
                  className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold transition ${
                    adminTab === "LEADERS"
                      ? "bg-indigo-600 text-white shadow-2xs"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  <UserCog className="h-4 w-4" />
                  Team Leaders ({data.teamLeaders.length})
                </button>
                <button
                  type="button"
                  onClick={() => setAdminTab("ATTENDANCE")}
                  className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold transition ${
                    adminTab === "ATTENDANCE"
                      ? "bg-indigo-600 text-white shadow-2xs"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  <UserCheck className="h-4 w-4" />
                  Attendance & Leaves
                </button>
                <button
                  type="button"
                  onClick={() => setAdminTab("EMPLOYEES")}
                  className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold transition ${
                    adminTab === "EMPLOYEES"
                      ? "bg-indigo-600 text-white shadow-2xs"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  <UserPlus className="h-4 w-4" />
                  Employees ({employeesWithEarnedLeaves.length})
                </button>
              </div>
              <div className="text-xs text-slate-500">
                Admin Control:{" "}
                <strong className="text-slate-800">{loggedInAdmin?.name}</strong>
              </div>
            </div>

            {adminTab === "LEADERS" && (
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs lg:col-span-4">
                  <div className="mb-4 flex items-center gap-2">
                    <UserPlus className="h-5 w-5 text-indigo-600" />
                    <h2 className="text-base font-bold text-slate-900">
                      Add Team Leader
                    </h2>
                  </div>

                  <form onSubmit={handleAddLeader} className="space-y-3.5">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={newLeaderForm.name}
                        onChange={(e) =>
                          setNewLeaderForm((p) => ({ ...p, name: e.target.value }))
                        }
                        placeholder="e.g. Anirban Sen"
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-indigo-500 focus:outline-none"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Leader ID / Code
                        </label>
                        <input
                          type="text"
                          value={newLeaderForm.code}
                          onChange={(e) =>
                            setNewLeaderForm((p) => ({ ...p, code: e.target.value }))
                          }
                          placeholder="e.g. TL003"
                          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs uppercase focus:border-indigo-500 focus:outline-none"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Password
                        </label>
                        <input
                          type="text"
                          value={newLeaderForm.password}
                          onChange={(e) =>
                            setNewLeaderForm((p) => ({
                              ...p,
                              password: e.target.value,
                            }))
                          }
                          placeholder="leader123"
                          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-indigo-500 focus:outline-none"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Assigned Team
                      </label>
                      <input
                        type="text"
                        value={newLeaderForm.team}
                        onChange={(e) =>
                          setNewLeaderForm((p) => ({ ...p, team: e.target.value }))
                        }
                        placeholder="e.g. Team Gamma"
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-indigo-500 focus:outline-none"
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow-xs transition hover:bg-indigo-700"
                    >
                      <UserPlus className="h-4 w-4" />
                      Create Team Leader
                    </button>
                  </form>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs lg:col-span-8">
                  <div className="mb-4">
                    <h2 className="text-base font-bold text-slate-900">
                      Team Leaders ({data.teamLeaders.length})
                    </h2>
                    <p className="text-xs text-slate-500">
                      Edit Team Leader names, login IDs, passwords, or team assignments.
                    </p>
                  </div>

                  <div className="space-y-3">
                    {data.teamLeaders.map((tl) => {
                      const isEditing = editingLeaderId === tl.id;
                      const teamCount = data.employees.filter(
                        (e) => e.teamLeaderId === tl.id
                      ).length;

                      if (isEditing) {
                        return (
                          <form
                            key={tl.id}
                            onSubmit={(e) => handleSaveLeaderEdit(e, tl.id)}
                            className="rounded-xl border border-indigo-200 bg-indigo-50/40 p-4 space-y-3"
                          >
                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                              <div>
                                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                                  Name
                                </label>
                                <input
                                  type="text"
                                  value={editLeaderForm.name}
                                  onChange={(e) =>
                                    setEditLeaderForm((p) => ({
                                      ...p,
                                      name: e.target.value,
                                    }))
                                  }
                                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs"
                                  required
                                />
                              </div>
                              <div>
                                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                                  Team Name
                                </label>
                                <input
                                  type="text"
                                  value={editLeaderForm.team}
                                  onChange={(e) =>
                                    setEditLeaderForm((p) => ({
                                      ...p,
                                      team: e.target.value,
                                    }))
                                  }
                                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs"
                                  required
                                />
                              </div>
                              <div>
                                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                                  Leader ID / Code
                                </label>
                                <input
                                  type="text"
                                  value={editLeaderForm.code}
                                  onChange={(e) =>
                                    setEditLeaderForm((p) => ({
                                      ...p,
                                      code: e.target.value,
                                    }))
                                  }
                                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs uppercase"
                                  required
                                />
                              </div>
                              <div>
                                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                                  Password
                                </label>
                                <input
                                  type="text"
                                  value={editLeaderForm.password}
                                  onChange={(e) =>
                                    setEditLeaderForm((p) => ({
                                      ...p,
                                      password: e.target.value,
                                    }))
                                  }
                                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs"
                                  required
                                />
                              </div>
                            </div>

                            <div className="flex items-center justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => setEditingLeaderId(null)}
                                className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                              >
                                Cancel
                              </button>
                              <button
                                type="submit"
                                className="flex items-center gap-1 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700"
                              >
                                <Save className="h-3.5 w-3.5" />
                                Save Changes
                              </button>
                            </div>
                          </form>
                        );
                      }

                      return (
                        <div
                          key={tl.id}
                          className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50/70 p-4"
                        >
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-sm font-bold text-slate-900">
                                {tl.name}
                              </span>
                              <span className="rounded bg-indigo-100 px-2 py-0.5 text-xs font-mono font-semibold text-indigo-800">
                                {tl.code}
                              </span>
                              <span className="rounded bg-slate-200 px-2 py-0.5 text-[11px] font-medium text-slate-700">
                                {tl.team}
                              </span>
                            </div>
                            <div className="mt-1 text-xs text-slate-500">
                              Password: <span className="font-mono">{tl.password}</span>{" "}
                              • {teamCount} assigned employee
                              {teamCount === 1 ? "" : "s"}
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => startEditLeader(tl)}
                              className="flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                              Edit Details
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRemoveLeader(tl.id, tl.name)}
                              className="flex items-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1.5 text-xs font-semibold text-rose-700 transition hover:bg-rose-100"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              Remove
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {adminTab === "ATTENDANCE" && renderAttendanceAndLeavesSection()}
            {adminTab === "EMPLOYEES" && renderManageEmployeesSection()}
          </div>
        ) : effectiveView === "EMPLOYEE" && currentEmployee ? (
          /* EMPLOYEE VIEW (or Read-Only Leader Inspection) */
          <div className="space-y-6">
            {isReadOnlyEmployeeInspection && (
              <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-indigo-200 bg-indigo-50/90 px-4 py-3 text-xs text-indigo-900">
                <div className="flex items-center gap-2 font-medium">
                  <Eye className="h-4 w-4 text-indigo-600 shrink-0" />
                  <span>
                    Inspecting <strong>{currentEmployee.name}</strong> (
                    {currentEmployee.empCode}) in read-only mode. Leave submission is
                    disabled for Team Leaders in this view.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setLeaderViewMode("TEAM_LEADER")}
                  className="rounded-lg bg-white px-2.5 py-1 text-xs font-semibold text-indigo-700 shadow-2xs hover:bg-indigo-100"
                >
                  Back to Leader Dashboard
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
              <div className="space-y-6 lg:col-span-8">
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
                  <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-4">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-block rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-700">
                          {currentEmployee.empCode} • {currentEmployee.department}
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                          <CalendarDays className="h-3 w-3" />
                          {currentEmployee.monthsEarned} completed accrual mo
                        </span>
                        {currentEmployee.onNoticePeriod && (
                          <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800">
                            Notice Period
                          </span>
                        )}
                      </div>
                      <h2 className="mt-1 text-xl font-bold text-slate-900">
                        {currentEmployee.name}
                      </h2>
                      <p className="text-[11px] text-slate-500">
                        Joined {currentEmployee.joiningDate} • Full-month leave accrual
                        runs from next month&apos;s 1st (or joining month if on the 1st)
                      </p>
                      <button
                        type="button"
                        onClick={() => setShowAccrualDrawer((v) => !v)}
                        className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50/70 px-2.5 py-1 text-[11px] font-semibold text-indigo-700 transition hover:bg-indigo-100"
                      >
                        <TableProperties className="h-3.5 w-3.5" />
                        {showAccrualDrawer
                          ? "Hide Monthly Accrual Table"
                          : "Monthly Accrual Breakdown"}
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                      <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 px-3 py-2 text-center">
                        <div className="text-[10px] font-semibold uppercase text-indigo-700">
                          Earned PL
                        </div>
                        <div className="text-base font-bold text-slate-900">
                          {currentEmployee.balances.PL}
                        </div>
                        <div className="text-[10px] text-slate-500">+1.25/mo</div>
                      </div>
                      <div className="rounded-xl border border-sky-100 bg-sky-50/50 px-3 py-2 text-center">
                        <div className="text-[10px] font-semibold uppercase text-sky-700">
                          Earned CL
                        </div>
                        <div className="text-base font-bold text-slate-900">
                          {currentEmployee.balances.CL}
                        </div>
                        <div className="text-[10px] text-slate-500">+0.83/mo</div>
                      </div>
                      <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 px-3 py-2 text-center">
                        <div className="text-[10px] font-semibold uppercase text-emerald-700">
                          Earned SL
                        </div>
                        <div className="text-base font-bold text-slate-900">
                          {currentEmployee.balances.SL}
                        </div>
                        <div className="text-[10px] text-slate-500">+1/mo</div>
                      </div>
                      <div className="rounded-xl border border-violet-100 bg-violet-50/50 px-3 py-2 text-center">
                        <div className="text-[10px] font-semibold uppercase text-violet-700">
                          Comp Off
                        </div>
                        <div className="text-base font-bold text-slate-900">
                          {currentEmployee.balances.CO}
                        </div>
                        <div className="text-[10px] text-slate-500">Sunday +1</div>
                      </div>
                    </div>
                  </div>

                  {/* Month-by-Month Accrual Breakdown Drawer / Table */}
                  {showAccrualDrawer && (
                    <div className="mt-4 rounded-xl border border-indigo-200 bg-indigo-50/40 p-4">
                      <div className="mb-2.5 flex items-center justify-between gap-2">
                        <div>
                          <h4 className="text-xs font-bold text-slate-900">
                            Month-by-Month Earned Leave Schedule (Joined{" "}
                            {currentEmployee.joiningDate})
                          </h4>
                          <p className="text-[11px] text-slate-600">
                            Each completed month adds +1.25 PL, +1.00 SL, and +0.83 CL.
                            Active earned months so far:{" "}
                            <strong>{currentEmployee.monthsEarned}</strong>.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setShowAccrualDrawer(false)}
                          className="rounded-lg p-1 text-slate-500 hover:bg-white hover:text-slate-800"
                          aria-label="Close accrual table"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>

                      {accrualScheduleRows.length === 0 ? (
                        <p className="text-xs text-slate-600">
                          No completed accrual months yet. Accrual begins on the 1st of
                          the month following joining.
                        </p>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full text-left border-collapse text-xs">
                            <thead>
                              <tr className="border-b border-indigo-200/80 text-[11px] font-semibold text-slate-700">
                                <th className="py-1.5 pr-3">Month</th>
                                <th className="py-1.5 px-2">Monthly Add</th>
                                <th className="py-1.5 px-2">Cumulative PL</th>
                                <th className="py-1.5 px-2">Cumulative SL</th>
                                <th className="py-1.5 pl-2">Cumulative CL</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-indigo-100">
                              {accrualScheduleRows.map((row) => {
                                const isActiveMonth =
                                  row.monthNumber <= currentEmployee.monthsEarned;
                                return (
                                  <tr
                                    key={row.label}
                                    className={
                                      isActiveMonth
                                        ? "text-slate-900 font-medium"
                                        : "text-slate-500"
                                    }
                                  >
                                    <td className="py-1.5 pr-3">
                                      {row.label}{" "}
                                      {!isActiveMonth && (
                                        <span className="ml-1 rounded bg-slate-200/80 px-1.5 py-0.5 text-[10px] text-slate-600">
                                          Projected
                                        </span>
                                      )}
                                    </td>
                                    <td className="py-1.5 px-2">
                                      +{row.addedPL} PL, +{row.addedSL} SL, +
                                      {row.addedCL} CL
                                    </td>
                                    <td className="py-1.5 px-2">{row.cumulativePL}</td>
                                    <td className="py-1.5 px-2">{row.cumulativeSL}</td>
                                    <td className="py-1.5 pl-2">{row.cumulativeCL}</td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  )}

                  {currentEmployee.onNoticePeriod && (
                    <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
                      Policy Note: Leave during notice period is discouraged and may
                      extend your notice period.
                    </div>
                  )}

                  <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-5">
                    <div className="rounded-xl bg-emerald-50 px-3 py-2.5">
                      <div className="text-xs text-emerald-700">Full Days</div>
                      <div className="text-base font-bold text-emerald-900">
                        {monthlyStats.present}
                      </div>
                    </div>
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 px-3 py-2.5">
                      <div className="text-xs text-emerald-800">Half Days</div>
                      <div className="text-base font-bold text-emerald-950">
                        {monthlyStats.halfDay}
                      </div>
                    </div>
                    <div className="rounded-xl bg-rose-50 px-3 py-2.5">
                      <div className="text-xs text-rose-700">Absent</div>
                      <div className="text-base font-bold text-rose-900">
                        {monthlyStats.absent}
                      </div>
                    </div>
                    <div className="rounded-xl bg-pink-50 px-3 py-2.5">
                      <div className="text-xs text-pink-700">Approved Leave</div>
                      <div className="text-base font-bold text-pink-900">
                        {monthlyStats.approvedLeave}
                      </div>
                    </div>
                    <div className="rounded-xl bg-gray-100 px-3 py-2.5 col-span-2 sm:col-span-1">
                      <div className="text-xs text-gray-700">Sick Req (Grey)</div>
                      <div className="text-base font-bold text-gray-900">
                        {monthlyStats.pendingSL}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                    <h3 className="text-base font-bold text-slate-900">{monthLabel}</h3>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleJumpToCurrentMonth}
                        className="rounded-lg border border-indigo-200 bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700 transition hover:bg-indigo-100"
                      >
                        Current Month
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (calMonth === 0) {
                            setCalMonth(11);
                            setCalYear((y) => y - 1);
                          } else {
                            setCalMonth((m) => m - 1);
                          }
                        }}
                        className="rounded-lg border border-slate-200 p-1.5 text-slate-600 transition hover:bg-slate-50"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (calMonth === 11) {
                            setCalMonth(0);
                            setCalYear((y) => y + 1);
                          } else {
                            setCalMonth((m) => m + 1);
                          }
                        }}
                        className="rounded-lg border border-slate-200 p-1.5 text-slate-600 transition hover:bg-slate-50"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="mb-4 flex flex-wrap items-center gap-3 rounded-xl bg-slate-50 px-3.5 py-2.5 text-xs">
                    <span className="flex items-center gap-1.5 font-medium text-slate-700">
                      <span className="h-3.5 w-3.5 rounded bg-emerald-500 inline-block" />
                      Full Day (Green)
                    </span>
                    <span className="flex items-center gap-1.5 font-medium text-slate-700">
                      <span
                        className="h-3.5 w-3.5 rounded border border-emerald-600 inline-block"
                        style={{
                          background:
                            "linear-gradient(135deg, #22c55e 50%, #f1f5f9 50%)",
                        }}
                      />
                      Half Day (Half Green)
                    </span>
                    <span className="flex items-center gap-1.5 font-medium text-slate-700">
                      <span className="h-3.5 w-3.5 rounded bg-rose-500 inline-block" />
                      Absent (Red)
                    </span>
                    <span className="flex items-center gap-1.5 font-medium text-slate-700">
                      <span className="h-3.5 w-3.5 rounded bg-slate-200 border border-slate-300 inline-block" />
                      Sunday Weekly Off (+1 CO if worked)
                    </span>
                    <span className="flex items-center gap-1.5 font-medium text-slate-700">
                      <span className="h-3.5 w-3.5 rounded bg-gray-400 inline-block" />
                      Sick Leave Req (Grey)
                    </span>
                    <span className="flex items-center gap-1.5 font-medium text-slate-700">
                      <span className="h-3.5 w-3.5 rounded bg-pink-400 inline-block" />
                      Approved Leave (Pink)
                    </span>
                  </div>

                  <div className="grid grid-cols-7 gap-2 text-center text-xs font-semibold text-slate-500 mb-2">
                    <div>Sun</div>
                    <div>Mon</div>
                    <div>Tue</div>
                    <div>Wed</div>
                    <div>Thu</div>
                    <div>Fri</div>
                    <div>Sat</div>
                  </div>

                  <div className="grid grid-cols-7 gap-2">
                    {calendarCells.map((cell) => {
                      if (cell.type === "EMPTY") {
                        return (
                          <div
                            key={cell.key}
                            className="h-16 rounded-xl bg-transparent"
                          />
                        );
                      }
                      const visual = renderCalendarDayStyle(cell);
                      return (
                        <div
                          key={cell.dateStr}
                          style={visual.style}
                          title={
                            cell.info?.reason
                              ? `${visual.badge}: ${cell.info.reason}`
                              : visual.badge
                          }
                          className={`flex h-16 flex-col justify-between rounded-xl border p-2 transition ${visual.className}`}
                        >
                          <span className="text-xs font-bold">{cell.day}</span>
                          <span className="truncate text-[10px] leading-tight opacity-95">
                            {visual.badge}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="space-y-6 lg:col-span-4">
                {!isReadOnlyEmployeeInspection ? (
                  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
                    <div className="mb-4 flex items-center gap-2">
                      <FilePlus2 className="h-5 w-5 text-indigo-600" />
                      <h3 className="text-base font-bold text-slate-900">
                        Apply for Leave
                      </h3>
                    </div>

                    <form onSubmit={handleSubmitLeave} className="space-y-3.5">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Leave Type
                        </label>
                        <select
                          value={leaveForm.leaveType}
                          onChange={(e) =>
                            setLeaveForm((p) => ({
                              ...p,
                              leaveType: e.target.value,
                            }))
                          }
                          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-medium focus:border-indigo-500 focus:outline-none"
                        >
                          <option value="SL">
                            Sick Leave (SL) — {currentEmployee.balances.SL} earned left
                          </option>
                          <option value="PL">
                            Privilege Leave (PL) — {currentEmployee.balances.PL} earned
                            left
                          </option>
                          <option value="CL">
                            Casual Leave (CL) — {currentEmployee.balances.CL} earned left
                          </option>
                          <option value="CO">
                            Compensatory Off (CO) — {currentEmployee.balances.CO} left
                          </option>
                          <option value="LWP">Leave Without Pay (LWP)</option>
                        </select>
                        <p className="mt-1 text-[11px] text-slate-500">
                          Approver: {POLICY_LIMITS[leaveForm.leaveType]?.approver}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          id="halfDayCheck"
                          type="checkbox"
                          checked={leaveForm.isHalfDay}
                          onChange={(e) =>
                            setLeaveForm((p) => ({
                              ...p,
                              isHalfDay: e.target.checked,
                              endDate: e.target.checked ? p.startDate : p.endDate,
                            }))
                          }
                          className="h-4 w-4 rounded border-slate-300 text-indigo-600"
                        />
                        <label
                          htmlFor="halfDayCheck"
                          className="text-xs font-medium text-slate-700"
                        >
                          Half-Day Leave (0.5 day)
                        </label>
                      </div>

                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            {leaveForm.isHalfDay ? "Date" : "Start Date"}
                          </label>
                          <input
                            type="date"
                            value={leaveForm.startDate}
                            onChange={(e) =>
                              setLeaveForm((p) => ({
                                ...p,
                                startDate: e.target.value,
                                endDate:
                                  p.isHalfDay || e.target.value > p.endDate
                                    ? e.target.value
                                    : p.endDate,
                              }))
                            }
                            className="w-full rounded-lg border border-slate-300 px-2.5 py-2 text-xs focus:border-indigo-500 focus:outline-none"
                            required
                          />
                        </div>

                        {!leaveForm.isHalfDay && (
                          <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                              End Date
                            </label>
                            <input
                              type="date"
                              value={leaveForm.endDate}
                              min={leaveForm.startDate}
                              onChange={(e) =>
                                setLeaveForm((p) => ({
                                  ...p,
                                  endDate: e.target.value,
                                }))
                              }
                              className="w-full rounded-lg border border-slate-300 px-2.5 py-2 text-xs focus:border-indigo-500 focus:outline-none"
                              required
                            />
                          </div>
                        )}
                      </div>

                      <div className="rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-700">
                        Calculated Leave Days (excl. Sundays & National Holidays):{" "}
                        <strong className="text-slate-900">{computedLeaveDays}</strong>
                      </div>

                      {leaveForm.leaveType === "SL" && computedLeaveDays > 2 && (
                        <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] text-amber-900">
                          Medical certificate or doctor's note may be required for Sick
                          Leave exceeding 2 consecutive days.
                        </div>
                      )}

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Reason
                        </label>
                        <textarea
                          rows={2}
                          value={leaveForm.reason}
                          onChange={(e) =>
                            setLeaveForm((p) => ({ ...p, reason: e.target.value }))
                          }
                          placeholder="Reason for leave..."
                          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-indigo-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Work Handover Note
                        </label>
                        <input
                          type="text"
                          value={leaveForm.handoverNote}
                          onChange={(e) =>
                            setLeaveForm((p) => ({
                              ...p,
                              handoverNote: e.target.value,
                            }))
                          }
                          placeholder="Who is covering your tasks?"
                          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-indigo-500 focus:outline-none"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow-xs transition hover:bg-indigo-700"
                      >
                        Submit Leave Request
                      </button>
                    </form>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
                    <div className="flex items-center gap-2 text-slate-900">
                      <ShieldCheck className="h-5 w-5 text-indigo-600" />
                      <h3 className="text-sm font-bold">
                        Team Leader Inspection Mode
                      </h3>
                    </div>
                    <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                      Employees submit their own leave requests from their account, which
                      then appear in your <strong>Leave Approval Queue</strong> on the
                      Leader Dashboard.
                    </p>
                  </div>
                )}

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
                  <h3 className="mb-3 text-sm font-bold text-slate-900">
                    {isReadOnlyEmployeeInspection
                      ? `${currentEmployee.name}'s Leave History`
                      : "My Leave History"}
                  </h3>
                  <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                    {data.leaveRequests.filter((r) => r.empId === currentEmployee.id)
                      .length === 0 ? (
                      <div className="rounded-xl border border-dashed border-slate-200 p-5 text-center text-xs text-slate-500">
                        No leave requests recorded yet.
                      </div>
                    ) : (
                      data.leaveRequests
                        .filter((r) => r.empId === currentEmployee.id)
                        .map((lr) => (
                          <div
                            key={lr.id}
                            className="rounded-xl border border-slate-200/90 bg-slate-50/70 p-3 text-xs"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-bold text-slate-800">
                                {lr.leaveType} • {lr.daysCount}d ({lr.startDate}
                                {lr.endDate !== lr.startDate
                                  ? ` to ${lr.endDate}`
                                  : ""}
                                )
                              </span>
                              <span
                                className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                                  lr.status === "APPROVED"
                                    ? "bg-pink-100 text-pink-800"
                                    : lr.status === "REJECTED"
                                    ? "bg-rose-100 text-rose-800"
                                    : "bg-gray-200 text-gray-800"
                                }`}
                              >
                                {lr.status}
                              </span>
                            </div>
                            <p className="mt-1 text-slate-600">{lr.reason}</p>
                            {lr.handoverNote && (
                              <p className="mt-0.5 text-[11px] text-slate-500">
                                Handover: {lr.handoverNote}
                              </p>
                            )}
                          </div>
                        ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* TEAM LEADER VIEW */
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-3 shadow-xs">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setLeaderTab("ATTENDANCE")}
                  className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold transition ${
                    leaderTab === "ATTENDANCE"
                      ? "bg-indigo-600 text-white shadow-2xs"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  <UserCheck className="h-4 w-4" />
                  Daily Attendance & Leaves
                </button>
                <button
                  type="button"
                  onClick={() => setLeaderTab("MANAGE_EMPLOYEES")}
                  className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold transition ${
                    leaderTab === "MANAGE_EMPLOYEES"
                      ? "bg-indigo-600 text-white shadow-2xs"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  <UserPlus className="h-4 w-4" />
                  Manage Employees ({employeesWithEarnedLeaves.length})
                </button>
              </div>
              <div className="text-xs text-slate-500">
                Active Team Leader:{" "}
                <strong className="text-slate-800">{loggedInLeader?.name}</strong>
              </div>
            </div>

            {leaderTab === "MANAGE_EMPLOYEES"
              ? renderManageEmployeesSection()
              : renderAttendanceAndLeavesSection()}
          </div>
        )}
      </main>
    </div>
  );
}