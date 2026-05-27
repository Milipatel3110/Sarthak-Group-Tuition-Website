"use client";

import { useEffect, useState } from "react";
import { IndianRupee, Plus, X, RefreshCw } from "lucide-react";

// ── Types ────────────────────────────────────────────────────────────────────

interface StudentProfile {
  id: string;
  class: string;
}

interface User {
  id: string;
  firstName: string;
  lastName: string;
  studentProfile: StudentProfile | null;
}

interface Course {
  id: string;
  name: string;
}

interface FeeStructure {
  id: string;
  amount: number;
  paymentFrequency: string;
  academicYear: string;
  course: { id: string; name: string };
}

interface FeePayment {
  id: string;
  amountPaid: number;
  paymentDate: string;
  paymentMethod: string | null;
  transactionId: string | null;
  student: {
    id: string;
    class: string;
    user: { firstName: string; lastName: string };
  };
  feeStructure: {
    id: string;
    amount: number;
    course: { name: string };
  };
}

type Tab = "structures" | "record" | "history";

// ── Page ─────────────────────────────────────────────────────────────────────

export default function FeesPage() {
  const [tab, setTab] = useState<Tab>("structures");

  // Reference data
  const [students, setStudents] = useState<User[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [structures, setStructures] = useState<FeeStructure[]>([]);
  const [payments, setPayments] = useState<FeePayment[]>([]);
  const [loadingStructures, setLoadingStructures] = useState(false);
  const [loadingPayments, setLoadingPayments] = useState(false);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [modalSubmitting, setModalSubmitting] = useState(false);
  const [modalMsg, setModalMsg] = useState("");
  const [modalError, setModalError] = useState("");
  const [structureForm, setStructureForm] = useState({
    courseId: "",
    amount: "",
    paymentFrequency: "monthly",
    academicYear: "2025-26",
  });

  // Payment form state
  const [payForm, setPayForm] = useState({
    studentId: "",
    feeStructureId: "",
    amountPaid: "",
    paymentMethod: "Cash",
    transactionId: "",
  });
  const [paySubmitting, setPaySubmitting] = useState(false);
  const [payMsg, setPayMsg] = useState("");
  const [payError, setPayError] = useState("");

  useEffect(() => {
    fetch("/api/admin/users?role=STUDENT")
      .then((r) => r.json())
      .then((d) => d.users && setStudents(d.users));

    fetch("/api/courses")
      .then((r) => r.json())
      .then((d) => d.courses && setCourses(d.courses));

    loadStructures();
    loadPayments();
  }, []);

  async function loadStructures() {
    setLoadingStructures(true);
    try {
      const res = await fetch("/api/fees?type=structures");
      const data = await res.json();
      setStructures(data.structures || []);
    } finally {
      setLoadingStructures(false);
    }
  }

  async function loadPayments() {
    setLoadingPayments(true);
    try {
      const res = await fetch("/api/fees");
      const data = await res.json();
      setPayments(data.payments || []);
    } finally {
      setLoadingPayments(false);
    }
  }

  function setStructField(
    key: keyof typeof structureForm,
    value: string
  ) {
    setStructureForm((p) => ({ ...p, [key]: value }));
  }

  function setPayField(key: keyof typeof payForm, value: string) {
    setPayForm((p) => ({ ...p, [key]: value }));
  }

  async function handleAddStructure(e: React.FormEvent) {
    e.preventDefault();
    setModalMsg("");
    setModalError("");
    if (!structureForm.courseId || !structureForm.amount) {
      setModalError("Please fill in all required fields.");
      return;
    }
    setModalSubmitting(true);
    try {
      const res = await fetch("/api/fees?type=structure", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "structure",
          courseId: structureForm.courseId,
          amount: parseFloat(structureForm.amount),
          paymentFrequency: structureForm.paymentFrequency,
          academicYear: structureForm.academicYear,
        }),
      });
      if (!res.ok) throw new Error("Failed");
      setModalMsg("Fee structure added successfully.");
      setStructureForm({
        courseId: "",
        amount: "",
        paymentFrequency: "monthly",
        academicYear: "2025-26",
      });
      loadStructures();
      setTimeout(() => {
        setShowModal(false);
        setModalMsg("");
      }, 1500);
    } catch {
      setModalError("Failed to add fee structure.");
    } finally {
      setModalSubmitting(false);
    }
  }

  async function handleRecordPayment(e: React.FormEvent) {
    e.preventDefault();
    setPayMsg("");
    setPayError("");

    const student = students.find((u) => u.id === payForm.studentId);
    const profileId = student?.studentProfile?.id;
    if (!profileId) {
      setPayError("Selected student does not have a registered profile.");
      return;
    }
    if (!payForm.feeStructureId || payForm.amountPaid === "") {
      setPayError("Please fill in all required fields.");
      return;
    }

    setPaySubmitting(true);
    try {
      const res = await fetch("/api/fees?type=payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "payment",
          studentId: profileId,
          feeStructureId: payForm.feeStructureId,
          amountPaid: parseFloat(payForm.amountPaid),
          paymentMethod: payForm.paymentMethod,
          transactionId: payForm.transactionId || undefined,
        }),
      });
      if (!res.ok) throw new Error("Failed");
      setPayMsg("Payment recorded successfully.");
      setPayForm({
        studentId: "",
        feeStructureId: "",
        amountPaid: "",
        paymentMethod: "Cash",
        transactionId: "",
      });
      loadPayments();
    } catch {
      setPayError("Failed to record payment. Please try again.");
    } finally {
      setPaySubmitting(false);
    }
  }

  const studentsWithProfile = students.filter((u) => u.studentProfile);

  const TABS: { key: Tab; label: string }[] = [
    { key: "structures", label: "Fee Structures" },
    { key: "record", label: "Record Payment" },
    { key: "history", label: "Payment History" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <IndianRupee className="w-6 h-6 text-blue-600" />
        <h1 className="text-2xl font-bold text-gray-900">Fee Management</h1>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              tab === t.key
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Tab 1: Fee Structures ─────────────────────────────────────────── */}
      {tab === "structures" && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-semibold text-gray-800">
              Fee Structures
            </h2>
            <button
              onClick={() => {
                setShowModal(true);
                setModalMsg("");
                setModalError("");
              }}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Fee Structure
            </button>
          </div>

          {loadingStructures ? (
            <div className="flex justify-center py-10">
              <RefreshCw className="w-6 h-6 text-blue-500 animate-spin" />
            </div>
          ) : structures.length === 0 ? (
            <p className="text-gray-400 text-sm italic text-center py-8">
              No fee structures defined yet.
            </p>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-600 text-left">
                  <tr>
                    <th className="px-4 py-3 font-medium">Course</th>
                    <th className="px-4 py-3 font-medium">Amount (₹)</th>
                    <th className="px-4 py-3 font-medium">Frequency</th>
                    <th className="px-4 py-3 font-medium">Academic Year</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {structures.map((s) => (
                    <tr
                      key={s.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-4 py-3 font-medium text-gray-800">
                        {s.course.name}
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        ₹{s.amount.toLocaleString("en-IN")}
                      </td>
                      <td className="px-4 py-3 text-gray-600 capitalize">
                        {s.paymentFrequency}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {s.academicYear}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── Tab 2: Record Payment ─────────────────────────────────────────── */}
      {tab === "record" && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-5">
            Record Payment
          </h2>
          <form onSubmit={handleRecordPayment} className="space-y-4 max-w-lg">
            {/* Student */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-600">
                Student <span className="text-red-500">*</span>
              </label>
              <select
                value={payForm.studentId}
                onChange={(e) => setPayField("studentId", e.target.value)}
                required
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select student</option>
                {studentsWithProfile.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.firstName} {u.lastName} — {u.studentProfile!.class}
                  </option>
                ))}
              </select>
            </div>

            {/* Fee Structure */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-600">
                Fee Structure <span className="text-red-500">*</span>
              </label>
              <select
                value={payForm.feeStructureId}
                onChange={(e) => setPayField("feeStructureId", e.target.value)}
                required
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select fee structure</option>
                {structures.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.course.name} — ₹{s.amount} ({s.paymentFrequency}) {s.academicYear}
                  </option>
                ))}
              </select>
            </div>

            {/* Amount */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-600">
                Amount Paid (₹) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min={0}
                step="0.01"
                placeholder="5000"
                value={payForm.amountPaid}
                onChange={(e) => setPayField("amountPaid", e.target.value)}
                required
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Payment Method */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-600">
                Payment Method
              </label>
              <select
                value={payForm.paymentMethod}
                onChange={(e) => setPayField("paymentMethod", e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Cash">Cash</option>
                <option value="Online">Online</option>
                <option value="Cheque">Cheque</option>
              </select>
            </div>

            {/* Transaction ID */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-600">
                Transaction ID (optional)
              </label>
              <input
                type="text"
                placeholder="TXN123456"
                value={payForm.transactionId}
                onChange={(e) => setPayField("transactionId", e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center gap-4">
              <button
                type="submit"
                disabled={paySubmitting}
                className="flex items-center gap-2 px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-60 transition-colors"
              >
                {paySubmitting ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <IndianRupee className="w-4 h-4" />
                )}
                Record Payment
              </button>
              {payMsg && (
                <span className="text-green-600 text-sm font-medium">
                  {payMsg}
                </span>
              )}
              {payError && (
                <span className="text-red-600 text-sm">{payError}</span>
              )}
            </div>
          </form>
        </div>
      )}

      {/* ── Tab 3: Payment History ────────────────────────────────────────── */}
      {tab === "history" && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-5">
            Payment History
          </h2>

          {loadingPayments ? (
            <div className="flex justify-center py-10">
              <RefreshCw className="w-6 h-6 text-blue-500 animate-spin" />
            </div>
          ) : payments.length === 0 ? (
            <p className="text-gray-400 text-sm italic text-center py-8">
              No payments recorded yet.
            </p>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-600 text-left">
                  <tr>
                    <th className="px-4 py-3 font-medium">Student</th>
                    <th className="px-4 py-3 font-medium">Course</th>
                    <th className="px-4 py-3 font-medium">Amount (₹)</th>
                    <th className="px-4 py-3 font-medium">Method</th>
                    <th className="px-4 py-3 font-medium">Date</th>
                    <th className="px-4 py-3 font-medium">Transaction ID</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {payments.map((p) => (
                    <tr
                      key={p.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <span className="font-medium text-gray-800">
                          {p.student.user.firstName} {p.student.user.lastName}
                        </span>
                        <br />
                        <span className="text-xs text-gray-400">
                          {p.student.class}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {p.feeStructure.course.name}
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-800">
                        ₹{p.amountPaid.toLocaleString("en-IN")}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {p.paymentMethod ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                        {new Date(p.paymentDate).toLocaleDateString("en-IN")}
                      </td>
                      <td className="px-4 py-3 text-gray-400 font-mono text-xs">
                        {p.transactionId ?? "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── Add Structure Modal ───────────────────────────────────────────── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold text-gray-800">
                Add Fee Structure
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddStructure} className="space-y-4">
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-600">
                  Course <span className="text-red-500">*</span>
                </label>
                <select
                  value={structureForm.courseId}
                  onChange={(e) => setStructField("courseId", e.target.value)}
                  required
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select course</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-600">
                  Monthly Amount (₹) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  placeholder="2500"
                  value={structureForm.amount}
                  onChange={(e) => setStructField("amount", e.target.value)}
                  required
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-600">
                  Payment Frequency
                </label>
                <select
                  value={structureForm.paymentFrequency}
                  onChange={(e) =>
                    setStructField("paymentFrequency", e.target.value)
                  }
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-600">
                  Academic Year
                </label>
                <input
                  type="text"
                  placeholder="2025-26"
                  value={structureForm.academicYear}
                  onChange={(e) =>
                    setStructField("academicYear", e.target.value)
                  }
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <div>
                  {modalMsg && (
                    <span className="text-green-600 text-sm font-medium">
                      {modalMsg}
                    </span>
                  )}
                  {modalError && (
                    <span className="text-red-600 text-sm">{modalError}</span>
                  )}
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={modalSubmitting}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-60"
                  >
                    {modalSubmitting ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Plus className="w-4 h-4" />
                    )}
                    Add Structure
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
