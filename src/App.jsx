import React, { useState, useEffect, useMemo, useCallback } from "react";
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
} from "lucide-react";
import { supabase } from "./lib/supabaseClient";

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
    label: "Paid / Privilege Leave (PL)",
    annual: 15,
    maxCarryForward: 30,
    approver: "Reporting Manager",
  },
  SL: {
    label: "Sick Leave (SL)",
    annual: 12,
    maxCarryForward: 0,
    approver: "Reporting Manager (+ HR if extended)",
  },
  CL: {
    label: "Casual Leave (CL)",
    annual: 10,
    maxCarryForward: 0,
    approver: "Reporting Manager (max 2 consecutive days)",
  },
  CO: {
    label: "Compensatory Off (CO)",
    annual: 0,
    maxCarryForward: 0,
    approver: "Reporting Manager (valid 60 days)",
  },
  LWP: {
    label: "Leave Without Pay (LWP)",
    annual: 999,
    maxCarryForward: 0,
    approver: "HR + Management",
  },
};

function InDiiServeLogo({ compact = false }) {
  const [imgMissing, setImgMissing] = useState(false);

  if (!imgMissing) {
    return (
      <div className="inline-flex items-center rounded-lg bg-white px-2.5 py-1.5 shadow-2xs select-none">
        <img
          src="/indiiserve-logo.jpeg"
          alt="InDiiServe.ai"
          onError={() => setImgMissing(true)}
          className={`w-auto object-contain ${compact ? "h-13" : "h-19"}`}
        />
      </div>
    );
  }

  return (
    <span className="inline-flex items-center gap-2 font-bold text-slate-900">
      InDiiServe.ai
    </span>
  );
}

const HR_HANDBOOK_DOCS = [
  {
    id: "posh",
    title: "Prevention of Sexual Harassment (POSH)",
    accentClass: "border-rose-600 bg-rose-600 text-white",
    idleClass:
      "border-slate-200 bg-white text-slate-800 hover:border-rose-400 hover:bg-rose-50/50",
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
    title: "_Leave & Attendance Policy_Indiiserve",
    accentClass: "border-indigo-600 bg-indigo-600 text-white",
    idleClass:
      "border-slate-200 bg-white text-slate-800 hover:border-indigo-400 hover:bg-indigo-50/50",
    sections: [
      {
        heading: "1. Purpose",
        paragraphs: [
          "The purpose of this policy is to provide a structured framework for employee leave entitlements while ensuring business continuity and employee well-being. It aims to promote employee well-being, work-life balance, and fairness by clearly defining leave entitlements, processes, and guidelines. This policy outlines the various types of leave available to employees, including paid leave, sick leave, statutory leaves, and special leaves, along with their eligibility, approval process, and usage guidelines. It ensures transparency, consistency, and compliance with applicable labor laws, while supporting employees in managing personal, health, and family responsibilities.",
        ],
      },
      {
        heading: "2. Scope",
        paragraphs: [
          "This policy applies to all full-time employees, contractual employees and interns of Indiiserve Solutions Pvt. Ltd.",
        ],
      },
      {
        heading: "3. Types of Leave — 3.1 Paid Leave (Privilege Leave / Earned Leave)",
        paragraphs: [
          "Entitlement: 15 days per year (1.25 days per month)",
          "Guidelines:",
        ],
        bullets: [
          "Paid Leave must be planned and applied in advance through the prescribed leave management system or via email, and is subject to approval by the reporting manager.",
          "Employees are encouraged to plan leave in consultation with their team to ensure smooth workflow and business continuity.",
          "Paid Leave may be taken in full-day or half-day increments, as per company policy.",
          "A minimum notice period of 3–7 days is recommended for planned leave exceeding 2 consecutive days.",
          "Employees may carry forward unused Paid Leave to the next calendar year, subject to a maximum accumulation limit of 30.",
          "Encashment of unused Paid Leave may be permitted at the time of separation or as per company policy.",
          "Paid Leave can be clubbed with other leave types (such as sick leave), subject to managerial approval and business requirements.",
          "Paid Leave during critical business periods (e.g., audits, peak season, project deadlines) may be restricted or deferred based on management discretion.",
          "In case of emergency situations, employees must inform their reporting manager at the earliest, and regularize the leave subsequently.",
          "Any unauthorized absence or leave taken without approval may be treated as Leave Without Pay (LWP) or may attract disciplinary action.",
        ],
      },
      {
        heading: "3.2 Sick Leave",
        paragraphs: ["Entitlement: 12 days per year", "Guidelines:"],
        bullets: [
          "Sick Leave may be availed by employees in case of personal illness, injury, or medical conditions that prevent them from performing their duties.",
          "Employees are required to inform their reporting manager at the earliest, preferably before the start of the workday, in case of sudden illness.",
          "For planned medical procedures or known health conditions, employees are expected to apply for leave in advance wherever possible.",
          "A medical certificate or doctor’s note may be required for sick leave exceeding 2 consecutive days, or as deemed necessary by the Company.",
          "Sick Leave may be taken as a full day or half day, subject to approval and company policy.",
          "Sick Leave is intended strictly for health-related reasons and should not be used for personal work or leisure purposes.",
          "Sick Leave generally cannot be carried forward or encashed, unless otherwise specified by the Company.",
          "Employees may be required to remain available for communication in case of extended absence, for work handover or critical updates, where feasible.",
          "Misuse or false declaration of Sick Leave may lead to disciplinary action.",
          "In cases of prolonged illness, employees may be required to provide additional medical documentation and may be eligible for extended leave or Leave Without Pay (LWP) as per company policy.",
        ],
      },
      {
        heading: "3.3 Casual Leave (Optional but Recommended)",
        paragraphs: ["Entitlement: 10 days per year", "Guidelines:"],
        bullets: [
          "Casual Leave is intended for short-term, unforeseen, or urgent personal needs, such as personal work, emergencies, or family matters.",
          "Employees are encouraged to apply for Casual Leave in advance wherever possible; however, in case of urgency, same-day intimation to the reporting manager is acceptable.",
          "Casual Leave may be availed as a full day or half day, subject to approval and business requirements.",
          "Typically, Casual Leave should not be taken for extended durations and may be restricted to 2 consecutive days at a time, unless approved otherwise.",
          "Casual Leave generally cannot be carried forward to the next calendar year and will lapse if not utilized within the defined period.",
          "Casual Leave cannot be encashed.",
          "Casual Leave may be restricted during critical business periods or peak workload times, based on management discretion.",
          "Employees must ensure proper work handover or task delegation before proceeding on leave.",
          "Casual Leave may be clubbed with other leave types only with prior approval and subject to company policy.",
          "Any misuse or frequent unplanned absence may be reviewed and may lead to disciplinary action if found inappropriate.",
        ],
      },
      {
        heading: "3.4 Menstrual Leave & 3.5 Maternity Leave",
        paragraphs: [
          "3.4 Menstrual Leave",
          "3.5 Maternity Leave — Entitlement: Up to 26 weeks (as per Indian law) for first two children; 12 weeks for subsequent children. Guidelines:",
        ],
        bullets: [
          "Maternity Leave may be availed by eligible female employees in accordance with applicable laws and company policy.",
          "Employees are required to inform their reporting manager and HR in advance, preferably at least 8 weeks prior to the expected date of delivery, along with relevant medical documentation.",
          "Maternity Leave may be availed before and after childbirth, as per medical advice and within the total entitlement defined by the Company.",
          "A medical certificate from a registered medical practitioner confirming the expected date of delivery must be submitted at the time of applying for leave.",
          "Employees may also avail maternity leave in cases of adoption or surrogacy, subject to eligibility criteria and statutory provisions.",
          "During maternity leave, employees will continue to receive salary and benefits as per applicable law and company policy.",
          "Employees are expected to ensure proper work handover and transition planning before proceeding on leave.",
          "The Company may provide flexible working arrangements, including work-from-home or reduced hours, post return to work, subject to role feasibility and business requirements.",
          "In case of medical complications or extended recovery, additional leave may be granted based on medical advice and management approval, which may be adjusted against other leave balances or treated as Leave Without Pay.",
          "The Company ensures that no employee shall face discrimination or disadvantage due to maternity leave, in line with applicable laws.",
          "Employees are required to confirm their return-to-work date in advance and coordinate with HR for smooth reintegration.",
        ],
      },
      {
        heading: "3.5 Paternity Leave",
        paragraphs: ["Entitlement: 5–10 working days", "Guidelines:"],
        bullets: [
          "Paternity Leave may be availed by eligible male employees upon the birth or legal adoption of a child, as per company policy.",
          "Employees are required to inform their reporting manager and HR in advance, preferably at least 2–4 weeks prior to the expected date of childbirth or adoption.",
          "Paternity Leave must be availed within the defined time window (typically within 30–60 days of childbirth/adoption), failing which the entitlement may lapse.",
          "The leave may be taken in one continuous block or in parts, subject to managerial approval and business requirements.",
          "Employees may be required to submit supporting documentation, such as a birth certificate, hospital record, or adoption papers.",
          "Paternity Leave is intended to support employees in family care responsibilities and should be used for the intended purpose.",
          "Employees are expected to ensure proper work handover and task transition before proceeding on leave.",
          "Any extension beyond the entitled leave period may be considered based on available leave balance or treated as Leave Without Pay (LWP).",
          "The Company may offer flexible working arrangements, such as work-from-home or flexible hours, upon return, subject to role feasibility.",
          "Misuse of Paternity Leave or submission of false information may lead to disciplinary action.",
        ],
      },
      {
        heading: "3.6 National Holidays & 3.7 Festival Holidays",
        bullets: [
          "3.6 National Holidays: Employees are entitled to mandatory national holidays: Republic Day (26 January), Independence Day (15 August), Gandhi Jayanti (2 October), Labour Day (1 May). These are paid holidays and applicable to all employees.",
          "3.7 Festival Holidays: Entitlement: festival holidays per year as per company holiday calendar which is published at the beginning of the year.",
        ],
      },
      {
        heading: "3.8 Leave Without Pay (LWP)",
        paragraphs: ["Applicability & Guidelines:"],
        bullets: [
          "Leave Without Pay (LWP) may be availed when an employee has exhausted all eligible leave balances or in cases where leave does not fall under any defined category.",
          "LWP is not an entitlement and is subject to prior approval from the reporting manager and HR, based on business requirements.",
          "Employees are required to apply for LWP in advance, except in cases of genuine emergencies, where intimation must be provided at the earliest.",
          "During LWP, the employee will not be entitled to salary or allowances for the period of absence.",
          "LWP may have an impact on statutory benefits, including PF, ESIC, bonus, gratuity, and leave accrual, as per applicable laws and company policy.",
          "Extended LWP may affect continuity of service, eligibility for benefits, and performance evaluation, depending on the duration and company guidelines.",
          "Employees must ensure proper work handover and approvals before proceeding on LWP.",
          "In cases of prolonged absence, the Company may require supporting documentation and may review continuation of employment on a case-by-case basis.",
          "Unauthorized absence without approval may be treated as LWP and/or misconduct, and may lead to disciplinary action.",
          "The Company reserves the right to approve, reject, or limit LWP requests based on operational requirements.",
        ],
      },
      {
        heading: "3.9 Compensatory Off (CO)",
        bullets: [
          "Employees will be eligible for Comp Off if: Work is performed on a weekly off or public holiday with prior approval from the Reporting Manager; Attendance/work is verifiable through system records (login, attendance, task completion, etc.); Work is not part of regular shift or planned roster (especially for BPO/shift roles)",
          "Guidelines: Prior approval from the Reporting Manager is mandatory; Comp Off must be applied for and approved in the HR system/email; Comp Off cannot be clubbed with more than 2 consecutive leave days (as per company policy); Comp Off cannot be encashed and cannot be carried forward; Employees must ensure proper handover before availing Comp Off",
          "Validity & Utilization: Comp Off must be utilized within 60 days from the date it is earned; Unused Comp Off beyond the validity period will lapse automatically; Approval of Comp Off leave is subject to business requirements",
          "Comp Off is not applicable for: Employees on shift/roster where weekly offs are rotated; Work done without prior approval; Partial day work (unless policy allows half-day CO)",
        ],
      },
      {
        heading: "4. Leave Application Process",
        bullets: [
          "Apply leave via HRMS or email to reporting manager",
          "Obtain reporting manager approval and forward the same to HR team for record keeping",
          "Inform team for work handover",
          "Emergency leave must be informed within the same day",
        ],
      },
      {
        heading: "5. Leave Approval Matrix",
        bullets: [
          "Planned Leave, Casual Leave | Reporting Manager",
          "Sick Leave (extended) | Reporting Manager + HR",
          "Maternity / Paternity Leave | HR + Management",
          "LWP | HR + Management",
        ],
      },
      {
        heading: "6. Leave Clubbing Rules",
        bullets: [
          "Sick leave can be clubbed with earned leave",
          "Casual leave cannot be clubbed beyond defined limits",
          "Maternity leave cannot be combined with other leave types without approval",
          "Employees are advised not to apply for leave in a manner that creates a sandwich leave situation. Any such leave pattern will result in intervening weekly offs/holidays being counted as leave.",
          "Relaxation of this rule will be granted only in case of medical emergencies, supported by appropriate medical proof and approved by HR/management.",
        ],
      },
      {
        heading: "7. Leave During Notice Period",
        bullets: [
          "Leave during notice period is discouraged",
          "Any leave taken may extend the notice period",
          "Subject to management approval",
        ],
      },
      {
        heading: "8. Public Holiday Falling During Leave",
        paragraphs: [
          "If a public holiday falls during approved leave, it will not be counted as leave",
        ],
      },
      {
        heading: "9. Misuse of Leave Policy",
        paragraphs: ["Any misuse or false claim may lead to disciplinary action."],
      },
      {
        heading: "10. Exceptions & Special Cases",
        bullets: [
          "Critical business roles may have restricted leave during peak periods",
          "Management may approve exceptions on a case-to-case basis",
          "Medical emergencies will be treated with flexibility, submission of medical documents are mandatory to enable such flexibility.",
        ],
      },
      {
        heading: "11. Policy Review",
        paragraphs: [
          "The company reserves the right to modify this policy based on business needs or statutory changes.",
        ],
      },
    ],
  },
  {
    id: "separation-exit",
    title: "Separation & Exit Policy_Indiiserve",
    accentClass: "border-amber-600 bg-amber-600 text-white",
    idleClass:
      "border-slate-200 bg-white text-slate-800 hover:border-amber-400 hover:bg-amber-50/50",
    sections: [
      {
        heading: "1. Purpose",
        paragraphs: [
          "This policy defines a structured exit process for employees. It ensures smooth transition, compliance, and protection of company interests.",
        ],
      },
      {
        heading: "2. Scope",
        paragraphs: [
          "Applicable to all employees across roles and employment types. It covers all forms of separation.",
        ],
      },
      {
        heading: "3. Types of Separation — 3.1 Resignation",
        paragraphs: [
          "Separation can occur in different forms based on circumstances. Each type follows a defined process.",
          "3.1 Resignation:",
        ],
        bullets: [
          "Employees are required to submit a formal resignation via email or official HR system incase they do not wish to continue due to better opportunities or personal reasons.",
          "The resignation must be addressed to the Reporting Manager with HR in copy.",
          "The email should clearly mention:",
          "Last working day (as per notice period)",
          "Serving of 30 days notice period is mandatory",
          "Reason for resignation (optional but recommended)",
        ],
      },
      {
        heading: "3.2 Termination",
        paragraphs: [
          "Termination of employment Initiated by the organization due to performance, conduct, or business requirements.",
        ],
        bullets: [
          "Performance-Based Termination: Applicable when: Continuous underperformance despite feedback and support; Failure to meet KPIs over a defined period; No improvement during Performance Improvement Plan (PIP)",
          "Misconduct / Disciplinary Termination: Includes: Violation of company policies; Insubordination; Harassment or inappropriate behavior; Fraud, theft, or ethical misconduct",
          "Zero Tolerance Policy (ZTP) Violations: Immediate termination may apply in cases of: Data security breaches; Financial fraud or misrepresentation; Severe compliance violations; Abusive behavior on calls (for BPO roles)",
          "Absconding / Job Abandonment: Applicable when: Employee is absent without notice for [3] consecutive working days; No response to official communication; Formal notices remain unanswered",
          "Redundancy / Business Restructuring: Applicable when: Role becomes redundant; Organizational restructuring; Cost optimization or business closure",
          "Probation Termination: Services may be discontinued during probation with shorter notice or immediate effect, as per contract",
          "Termination Process: The reporting manager or supervisor should keep proper documentation of performance, warnings, or misconduct and ensure to follow principles of fairness and natural justice. Capture issues like (performance/misconduct/absence) and Maintain records: warnings, emails, PIP, call audits, etc. HR should provide employee an opportunity to respond (except in severe ZTP cases). All parties should maintain confidentiality throughout the process. Termination process can be initiated once required approvals are obtained (HR + Management)",
        ],
      },
      {
        heading: "3.3 Retirement, 3.4 Absconding & 3.5 Death/Medical",
        bullets: [
          "3.3 Retirement: Separation upon reaching retirement age of 58, as defined in the employment contract or company policy. Employees will automatically retire upon reaching the defined retirement age unless otherwise extended by the organization.",
          "3.4 Absconding: An employee will be considered absconding / job abandonment if: Absent from work for 3 consecutive working days without informing the Reporting Manager; No response to calls, emails, or official communication; Failure to report to duty even after formal notices. Employees are expected to inform their manager/HR in case of absence; Any unplanned absence must be communicated within 24 hours; Continuous absence without communication will be treated as misconduct",
          "3.5 Death/Medical: Handled with sensitivity and compliance. Support is extended to the employee or family.",
        ],
      },
      {
        heading: "4. Resignation Process",
        paragraphs: [
          "Employees must submit their resignation formally. Approval, notice period, and handover must be completed.",
        ],
      },
      {
        heading: "5. Notice Period",
        bullets: [
          "Employees must serve the entire notice period. Shortfall may result in recovery unless waived.",
          "The standard notice period is 30 days, as per the employment agreement for full time employees.",
          "Employees are expected to serve the full notice period unless waived by management.",
          "Any request for early release must be approved by the Reporting Manager and HR.",
        ],
      },
      {
        heading:
          "6. Exit Clearance (6.1 Resignation Acceptance, 6.2 Knowledge Transfer, 6.3 Clearance Process)",
        bullets: [
          "6.1 Resignation Acceptance: HR will formally acknowledge and accept the resignation. The last working day (LWD) will be confirmed.",
          "6.2 Knowledge Transfer (KT): Employees must complete proper handover of duties, including: Work status reports; Client communication updates; System/process documentation",
          "6.3 Clearance Process: Employees must return assets and complete formalities. Clearance ensures smooth exit. Employees must obtain clearance from: IT (assets, email access); HR & Admin (ID cards, office assets); Finance (dues, advances); Reporting Manager (handover completion)",
        ],
      },
      {
        heading: "7. Full & Final Settlement",
        paragraphs: [
          "All dues are settled after clearance. This includes salary and applicable benefits. FnF settlement will be processed within [45-60 days] from the last working day.",
        ],
        bullets: [
          "It includes: Salary up to last working day; Leave encashment (if applicable); Incentives/bonuses (as per policy eligibility)",
          "Deductions (if any): Notice shortfall; Asset recovery; Loans/advances",
        ],
      },
      {
        heading: "8. Exit Interview, 9. Exceptions & 10. Policy Review",
        bullets: [
          "8. Exit Interview: Feedback is collected to improve processes. It helps enhance employee experience.",
          "9. Exceptions: Special cases may be considered with approval from the HR head and Business head.",
          "10. Policy Review: Policy is reviewed periodically. Updates are communicated to all employees.",
        ],
      },
    ],
  },
  {
    id: "payroll-policy",
    title: "PAYROLL POLICY",
    accentClass: "border-emerald-600 bg-emerald-600 text-white",
    idleClass:
      "border-slate-200 bg-white text-slate-800 hover:border-emerald-400 hover:bg-emerald-50/50",
    sections: [
      {
        heading: "1. PURPOSE",
        paragraphs: [
          "This document establishes the standard procedures and policies governing payroll processing, employee reimbursements, incentives, and business travel expenses to ensure transparency, compliance, and operational efficiency.",
        ],
      },
      {
        heading: "2. SCOPE",
        paragraphs: ["This policy applies to:"],
        bullets: [
          "Permanent Employees",
          "Probationary Employees",
          "Contractual Staff",
          "Interns (where applicable)",
        ],
      },
      {
        heading: "3. PAYROLL POLICY — 3.1 Payroll Cycle",
        bullets: [
          "Payroll shall be processed monthly.",
          "Salary will be credited to employees' bank accounts on or before 10th working day of the month.",
        ],
      },
      {
        heading: "3.2 Payroll Components — Earnings",
        paragraphs: [
          "Payroll may include the following components — Earnings:",
        ],
        bullets: [
          "Basic Salary",
          "House Rent Allowance (HRA)",
          "Special Allowance",
          "Conveyance Allowance",
          "Incentives / Variable Pay",
          "Arrears (if applicable)",
          "Approved reimbursements",
        ],
      },
      {
        heading: "3.2 Payroll Components — Deductions",
        paragraphs: [
          "Payroll may include the following components — Deductions:",
        ],
        bullets: [
          "Provident Fund (PF)",
          "Employee State Insurance (ESI)",
          "Professional Tax (if applicable)",
          "Income Tax / TDS",
          "Leave Without Pay (LWP)",
          "Other authorized deductions",
        ],
      },
      {
        heading: "CONFIDENTIALITY",
        paragraphs: [
          "Payroll information, salary details, and employee compensation data are strictly confidential and must not be disclosed to unauthorized personnel.",
        ],
      },
      {
        heading: "POLICY AMENDMENT",
        paragraphs: [
          "The Company reserves the right to modify or update this policy at any time based on business requirements or statutory changes.",
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

function expandDateRange(startStr, endStr) {
  const dates = [];
  const curr = new Date(`${startStr}T00:00:00`);
  const end = new Date(`${endStr}T00:00:00`);
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
  const dt = new Date(`${dateStr}T00:00:00`);
  return !isNaN(dt) && dt.getDay() === 0;
}

function getHolidayName(dateStr) {
  const mmdd = dateStr.slice(5);
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
      onNoticePeriod: idx === 7,
      balances: {
        PL: 15,
        CL: 10,
        SL: 12,
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
  return {
    id: row.id,
    empCode: row.emp_code,
    name: row.name,
    password: row.password || "emp123",
    department: row.department,
    teamLeaderId: row.team_leader_id || "tl-1",
    onNoticePeriod: Boolean(row.on_notice_period),
    balances: {
      PL: Number(row.pl_balance ?? 15),
      CL: Number(row.cl_balance ?? 10),
      SL: Number(row.sl_balance ?? 12),
      CO: Number(row.co_balance ?? 0),
    },
  };
}

function toEmployeeDbRow(emp) {
  return {
    id: emp.id,
    emp_code: emp.empCode,
    name: emp.name,
    password: emp.password || "emp123",
    department: emp.department,
    team_leader_id: emp.teamLeaderId || null,
    on_notice_period: Boolean(emp.onNoticePeriod),
    pl_balance: Number(emp.balances?.PL ?? 15),
    cl_balance: Number(emp.balances?.CL ?? 10),
    sl_balance: Number(emp.balances?.SL ?? 12),
    co_balance: Number(emp.balances?.CO ?? 0),
  };
}

function mapLeaveRow(row) {
  return {
    id: row.id,
    empId: row.emp_id,
    leaveType: row.leave_type,
    startDate: row.start_date,
    endDate: row.end_date,
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

export default function App() {
  const [data, setData] = useState({
    admins: INITIAL_ADMINS,
    teamLeaders: INITIAL_TEAM_LEADERS,
    employees: [],
    attendance: {},
    leaveRequests: [],
  });
  const [loadingDb, setLoadingDb] = useState(true);
  const [dbError, setDbError] = useState("");

  // Page navigation: "PORTAL" | "HANDBOOK"
  const [activePage, setActivePage] = useState("PORTAL");
  const [selectedHandbookId, setSelectedHandbookId] = useState(HR_HANDBOOK_DOCS[0].id);

  // Auth state: null | { role: "ADMIN" | "TEAM_LEADER" | "EMPLOYEE", userId: string }
  const [authUser, setAuthUser] = useState(null);
  const [loginRole, setLoginRole] = useState("TEAM_LEADER");
  const [loginIdInput, setLoginIdInput] = useState("");
  const [loginPasswordInput, setLoginPasswordInput] = useState("");
  const [loginError, setLoginError] = useState("");

  const [leaderViewMode, setLeaderViewMode] = useState("TEAM_LEADER");
  const [leaderTab, setLeaderTab] = useState("ATTENDANCE");
  const [adminTab, setAdminTab] = useState("LEADERS");
  const [inspectedEmpId, setInspectedEmpId] = useState("emp-1");

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
    PL: 15,
    CL: 10,
    SL: 12,
    CO: 0,
  });

  const [calYear, setCalYear] = useState(2026);
  const [calMonth, setCalMonth] = useState(10);

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

  const seedSupabaseIfEmpty = useCallback(async () => {
    const seed = buildSeedData();

    await supabase.from("admins").upsert(seed.admins, { onConflict: "id" });
    await supabase
      .from("team_leaders")
      .upsert(seed.teamLeaders, { onConflict: "id" });
    await supabase
      .from("employees")
      .upsert(seed.employees.map(toEmployeeDbRow), { onConflict: "id" });

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

      if (isBrandNewDatabase) {
        const seeded = await seedSupabaseIfEmpty();
        setData(seeded);
      } else {
        const attendanceMap = {};
        (attRows || []).forEach((r) => {
          attendanceMap[`${r.emp_id}_${r.attendance_date}`] = {
            status: r.status,
            markedBy: r.marked_by,
            updatedAt: r.updated_at,
          };
        });

        setData({
          admins: adminRows && adminRows.length > 0 ? adminRows : INITIAL_ADMINS,
          teamLeaders:
            leaderRows && leaderRows.length > 0 ? leaderRows : INITIAL_TEAM_LEADERS,
          employees: (empRows || []).map(mapEmployeeRow),
          attendance: attendanceMap,
          leaveRequests: (leaveRows || []).map(mapLeaveRow),
        });
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
  }, [seedSupabaseIfEmpty]);

  useEffect(() => {
    fetchAllFromSupabase();
  }, [fetchAllFromSupabase]);

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
      setAuthUser({ role: "ADMIN", userId: admin.id });
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
      setAuthUser({ role: "TEAM_LEADER", userId: leader.id });
      setLeaderViewMode("TEAM_LEADER");
      setLeaderTab("ATTENDANCE");
      setActivePage("PORTAL");
      setLoginIdInput("");
      setLoginPasswordInput("");
      showToast(`Welcome back, ${leader.name}!`);
    } else {
      const emp = data.employees.find(
        (item) =>
          item.empCode.toUpperCase() === code &&
          (item.password || "emp123") === loginPasswordInput
      );
      if (!emp) {
        setLoginError("Invalid Employee ID or password.");
        return;
      }
      setAuthUser({ role: "EMPLOYEE", userId: emp.id });
      setActivePage("PORTAL");
      setLoginIdInput("");
      setLoginPasswordInput("");
      showToast(`Signed in as ${emp.name} (${emp.empCode})`);
    }
  };

  const handleLogout = () => {
    setAuthUser(null);
    setActivePage("PORTAL");
    setEditingLeaderId(null);
    setLoginError("");
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

  // Add Employee to Supabase
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

    const createdEmp = {
      id: `emp-${Date.now()}`,
      name: trimmedName,
      empCode: trimmedCode,
      password: newEmpForm.password.trim() || "emp123",
      department: newEmpForm.department,
      teamLeaderId: newEmpForm.teamLeaderId || data.teamLeaders[0]?.id || "tl-1",
      onNoticePeriod: false,
      balances: {
        PL: Number(newEmpForm.PL) || 0,
        CL: Number(newEmpForm.CL) || 0,
        SL: Number(newEmpForm.SL) || 0,
        CO: Number(newEmpForm.CO) || 0,
      },
    };

    const { error } = await supabase
      .from("employees")
      .insert(toEmployeeDbRow(createdEmp));

    if (error) {
      showToast(`Failed to add employee: ${error.message}`, "error");
      return;
    }

    setData((prev) => ({
      ...prev,
      employees: [...prev.employees, createdEmp],
    }));

    setNewEmpForm({
      name: "",
      empCode: "",
      password: "emp123",
      department: "Engineering",
      teamLeaderId: data.teamLeaders[0]?.id || "tl-1",
      PL: 15,
      CL: 10,
      SL: 12,
      CO: 0,
    });
    showToast(`Added ${createdEmp.name} (${createdEmp.empCode}) to Supabase.`);
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
    () => data.employees.find((e) => e.id === activeEmployeeId) || data.employees[0],
    [data.employees, activeEmployeeId]
  );

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

    calendarCells.forEach((c) => {
      if (c.type !== "DAY" || !c.info) return;
      if (c.info.kind === "PRESENT") present += 1;
      else if (c.info.kind === "HALF_DAY") halfDay += 1;
      else if (c.info.kind === "ABSENT") absent += 1;
      else if (c.info.kind === "APPROVED_LEAVE")
        approvedLeave += c.info.isHalfDay ? 0.5 : 1;
      else if (c.info.kind === "PENDING_SL")
        pendingSL += c.info.isHalfDay ? 0.5 : 1;
    });

    return { present, halfDay, absent, approvedLeave, pendingSL };
  }, [calendarCells]);

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
          `Insufficient ${leaveType} balance (${availableBalance} available, ${computedLeaveDays} needed). Consider LWP.`,
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
      createdAt: new Date().toISOString().slice(0, 10),
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

  // Mark attendance in Supabase
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
    }));
  };

  // Unmark a single employee's attendance on rosterDate in Supabase
  const handleUnmarkAttendance = async (empId, empName) => {
    const key = `${empId}_${rosterDate}`;
    if (!data.attendance[key]) return;

    const { error } = await supabase
      .from("attendance")
      .delete()
      .eq("emp_id", empId)
      .eq("attendance_date", rosterDate);

    if (error) {
      showToast(`Failed to unmark attendance: ${error.message}`, "error");
      return;
    }

    setData((prev) => {
      const nextAtt = { ...prev.attendance };
      delete nextAtt[key];
      return { ...prev, attendance: nextAtt };
    });
    showToast(`Unmarked attendance for ${empName} on ${rosterDate}.`);
  };

  // Clear all attendance marks for the currently selected Sunday in Supabase
  const handleClearSundayMarks = async () => {
    if (!isSundayDate(rosterDate)) return;

    const { error } = await supabase
      .from("attendance")
      .delete()
      .eq("attendance_date", rosterDate);

    if (error) {
      showToast(`Failed to clear Sunday marks: ${error.message}`, "error");
      return;
    }

    setData((prev) => {
      const suffix = `_${rosterDate}`;
      const nextAtt = {};
      let removed = 0;
      Object.entries(prev.attendance).forEach(([key, val]) => {
        if (key.endsWith(suffix)) {
          removed += 1;
        } else {
          nextAtt[key] = val;
        }
      });
      showToast(
        removed > 0
          ? `Removed ${removed} Sunday mark(s) on ${rosterDate}.`
          : `No attendance marks found on ${rosterDate}.`
      );
      return { ...prev, attendance: nextAtt };
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
    if (isSundayDate(rosterDate)) {
      showToast(
        `${rosterDate} is a Sunday. Unmark or select a weekday to mark Present.`,
        "error"
      );
      return;
    }
    const markerId = loggedInLeader?.id || loggedInAdmin?.id || "tl-1";

    const rowsToInsert = [];
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

    setData((prev) => {
      const nextAtt = { ...prev.attendance };
      rowsToInsert.forEach((r) => {
        nextAtt[`${r.emp_id}_${r.attendance_date}`] = {
          status: "PRESENT",
          markedBy: markerId,
        };
      });
      return { ...prev, attendance: nextAtt };
    });

    showToast(`Marked ${rowsToInsert.length} unmarked employee(s) as Present.`);
  };

  // Approve/Reject leave request and update balance in Supabase
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
    const emp = data.employees.find((e) => e.id === target.empId);

    if (decision === "APPROVED" && target.leaveType !== "LWP" && emp) {
      const currentBal = emp.balances[target.leaveType] ?? 0;
      nextBalanceValue = Math.max(
        0,
        Number((currentBal - target.daysCount).toFixed(1))
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
        ? "Approved — balance updated and calendar set to Pink."
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
      "PL",
      "CL",
      "SL",
      "CO",
    ];
    const rows = data.employees.map((emp) => {
      const onApprovedLeave = data.leaveRequests.some(
        (lr) =>
          lr.empId === emp.id &&
          lr.status === "APPROVED" &&
          expandDateRange(lr.startDate, lr.endDate).includes(rosterDate)
      );
      const attStatus = getHolidayName(rosterDate)
        ? `HOLIDAY (${getHolidayName(rosterDate)})`
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
      "PL Left",
      "CL Left",
      "SL Left",
      "CO Left",
    ];

    const rows = data.employees.map((emp) => {
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
    return data.employees
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
    data.employees,
    data.leaveRequests,
    data.attendance,
    rosterDate,
    searchQuery,
    statusFilter,
  ]);

  const rosterSummary = useMemo(() => {
    const all = data.employees.map((emp) => {
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
  }, [data.employees, data.leaveRequests, data.attendance, rosterDate]);

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
      return {
        className: "bg-slate-100 text-slate-400 border-slate-200",
        style: {},
        badge: "Sun",
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
              placeholder="e.g. Sourav Mondal"
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
                placeholder="e.g. EMP126"
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

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Initial Leave Balances (Indiiserve Policy Defaults)
            </label>
            <div className="grid grid-cols-4 gap-2">
              <div>
                <span className="block text-[10px] text-slate-500">PL</span>
                <input
                  type="number"
                  step="0.5"
                  value={newEmpForm.PL}
                  onChange={(e) =>
                    setNewEmpForm((p) => ({ ...p, PL: e.target.value }))
                  }
                  className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-xs"
                />
              </div>
              <div>
                <span className="block text-[10px] text-slate-500">CL</span>
                <input
                  type="number"
                  step="0.5"
                  value={newEmpForm.CL}
                  onChange={(e) =>
                    setNewEmpForm((p) => ({ ...p, CL: e.target.value }))
                  }
                  className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-xs"
                />
              </div>
              <div>
                <span className="block text-[10px] text-slate-500">SL</span>
                <input
                  type="number"
                  step="0.5"
                  value={newEmpForm.SL}
                  onChange={(e) =>
                    setNewEmpForm((p) => ({ ...p, SL: e.target.value }))
                  }
                  className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-xs"
                />
              </div>
              <div>
                <span className="block text-[10px] text-slate-500">CO</span>
                <input
                  type="number"
                  step="0.5"
                  value={newEmpForm.CO}
                  onChange={(e) =>
                    setNewEmpForm((p) => ({ ...p, CO: e.target.value }))
                  }
                  className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-xs"
                />
              </div>
            </div>
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
              Current Employees ({data.employees.length})
            </h2>
            <p className="text-xs text-slate-500">
              Remove departed staff or inspect their calendar and balances.
            </p>
          </div>
        </div>

        <div className="divide-y divide-slate-100 max-h-[520px] overflow-y-auto">
          {data.employees.map((emp) => {
            const assignedTl = data.teamLeaders.find((t) => t.id === emp.teamLeaderId);
            return (
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
                    {emp.department} • TL: {assignedTl?.name || "Unassigned"} • Pass:{" "}
                    <span className="font-mono">{emp.password || "emp123"}</span> • PL:{" "}
                    {emp.balances.PL} | CL: {emp.balances.CL} | SL: {emp.balances.SL}
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
            );
          })}
        </div>
      </div>
    </div>
  );

  // Reusable Attendance & Leave Approval Section
  const renderAttendanceAndLeavesSection = () => (
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
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-xs text-amber-950">
          <div className="font-semibold">
            {rosterDate} is a Sunday. You can unmark any accidental marks below or clear
            all marks on this Sunday.
          </div>
          <button
            type="button"
            onClick={handleClearSundayMarks}
            className="flex items-center gap-1.5 rounded-lg bg-amber-700 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-amber-800"
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
                Mark Present, Half-Day, or Absent per day, or tap Unmark to remove a mark.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <input
                type="date"
                value={rosterDate}
                onChange={(e) => setRosterDate(e.target.value)}
                className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700"
              />
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

          <div className="mb-4 flex flex-wrap items-center gap-3">
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

          <div className="divide-y divide-slate-100 max-h-[540px] overflow-y-auto">
            {filteredRoster.map((emp) => (
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
                    {emp.department} • PL: {emp.balances.PL} | CL: {emp.balances.CL} | SL:{" "}
                    {emp.balances.SL} | CO: {emp.balances.CO}
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
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs lg:col-span-4">
          <div className="mb-4 flex items-center gap-2">
            <Clock className="h-5 w-5 text-amber-600" />
            <h2 className="text-base font-bold text-slate-900">Leave Approval Queue</h2>
          </div>

          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
            {data.leaveRequests.filter((r) => r.status === "PENDING").length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-200 p-6 text-center text-xs text-slate-500">
                No pending leave requests right now.
              </div>
            ) : (
              data.leaveRequests
                .filter((r) => r.status === "PENDING")
                .map((lr) => {
                  const emp = data.employees.find((e) => e.id === lr.empId);
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
                        <span className="font-medium text-slate-800">{lr.startDate}</span>
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

  // ==================== LOADING SCREEN ====================
  if (loadingDb) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-6 py-4 text-sm font-semibold text-slate-700 shadow-xs">
          <Loader2 className="h-5 w-5 animate-spin text-indigo-600" />
          <span>Connecting to InDiiServe Supabase database...</span>
        </div>
      </div>
    );
  }

  // ==================== LOGIN SCREEN ====================
  if (!authUser) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-100 via-indigo-50/40 to-slate-100 px-4 py-10">
        <div className="w-full max-w-md rounded-2xl border border-slate-200/90 bg-white p-8 shadow-xl shadow-slate-200/60">
          <div className="flex flex-col gap-2.5">
            <InDiiServeLogo />
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
            <InDiiServeLogo compact />
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
                onClick={() => setActivePage("PORTAL")}
                className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Back to Portal
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setActivePage("HANDBOOK")}
                className="flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700 transition hover:bg-indigo-100"
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
                    {data.employees.map((emp) => (
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
          /* ==================== HR HANDBOOK PAGE ==================== */
          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white px-6 py-4 shadow-xs">
              <h2 className="text-xl font-bold text-slate-900">HR Handbook</h2>
            </div>

            <div className="flex flex-wrap -mx-1.5">
              {HR_HANDBOOK_DOCS.map((doc) => {
                const isSelected = doc.id === activeDoc.id;
                return (
                  <div
                    key={doc.id}
                    className="w-1/2 sm:w-1/4 px-1.5 mb-3 sm:mb-0"
                    style={{ flex: "0 0 25%" }}
                  >
                    <button
                      type="button"
                      onClick={() => setSelectedHandbookId(doc.id)}
                      className={`flex h-full min-h-[72px] w-full items-center justify-center rounded-xl border-2 px-3 py-3 text-center text-xs sm:text-sm font-bold transition ${
                        isSelected ? doc.accentClass : doc.idleClass
                      }`}
                    >
                      <span>{doc.title}</span>
                    </button>
                  </div>
                );
              })}
            </div>

            <article className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs">
              <h3 className="border-b border-slate-200 pb-3 text-xl font-extrabold text-slate-900">
                {activeDoc.title}
              </h3>

              <div className="mt-5 space-y-5">
                {activeDoc.sections.map((sec, idx) => (
                  <section key={idx} className="space-y-2">
                    <h4 className="text-sm font-bold text-slate-900">{sec.heading}</h4>
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
                      <ul className="list-disc space-y-1 pl-5 text-sm leading-relaxed text-slate-700">
                        {sec.bullets.map((b, bIdx) => (
                          <li key={bIdx}>{b}</li>
                        ))}
                      </ul>
                    )}
                  </section>
                ))}
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
                  Employees ({data.employees.length})
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
                  <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-block rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-700">
                          {currentEmployee.empCode} • {currentEmployee.department}
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
                    </div>

                    <div className="grid grid-cols-4 gap-2">
                      <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-center">
                        <div className="text-[10px] font-semibold uppercase text-slate-500">
                          PL (/15)
                        </div>
                        <div className="text-base font-bold text-slate-900">
                          {currentEmployee.balances.PL}
                        </div>
                      </div>
                      <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-center">
                        <div className="text-[10px] font-semibold uppercase text-slate-500">
                          CL (/10)
                        </div>
                        <div className="text-base font-bold text-slate-900">
                          {currentEmployee.balances.CL}
                        </div>
                      </div>
                      <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-center">
                        <div className="text-[10px] font-semibold uppercase text-slate-500">
                          SL (/12)
                        </div>
                        <div className="text-base font-bold text-slate-900">
                          {currentEmployee.balances.SL}
                        </div>
                      </div>
                      <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-center">
                        <div className="text-[10px] font-semibold uppercase text-slate-500">
                          Comp Off
                        </div>
                        <div className="text-base font-bold text-slate-900">
                          {currentEmployee.balances.CO}
                        </div>
                      </div>
                    </div>
                  </div>

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
                            Sick Leave (SL) — {currentEmployee.balances.SL} left
                          </option>
                          <option value="PL">
                            Paid / Privilege Leave (PL) — {currentEmployee.balances.PL}{" "}
                            left
                          </option>
                          <option value="CL">
                            Casual Leave (CL) — {currentEmployee.balances.CL} left
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
                  Manage Employees ({data.employees.length})
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