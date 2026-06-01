"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Search, X, Plus, Trash2, Edit2, Eye, ChevronDown,
  CheckCircle, XCircle, Users, Layers, Key, EyeOff,
} from "lucide-react";

// Types
interface Batch {
  id: string;
  name: string;
  standard: string;
  medium: string;
  description?: string;
  isActive: boolean;
  _count: { students: number };
}

interface StudentProfile {
  id: string;
  class: string;
  medium: string;
  dateOfBirth?: string;
  schoolName?: string;
  address?: string;
  personalPhone?: string;
  guardian1Phone?: string;
  guardian2Phone?: string;
  batchId?: string;
  fatherFirstName?: string;
  fatherLastName?: string;
  fatherOccupation?: string;
  motherFirstName?: string;
  motherLastName?: string;
  motherOccupation?: string;
  batch?: { name: string; standard: string };
}

interface Student {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  isActive: boolean;
  studentProfile?: StudentProfile;
}

interface FeeInstallment {
  amount: string;
  dueDate: string;
  note: string;
}

type ToastState = { message: string; type: "success" | "error" } | null;

const STANDARDS = [
  "Class 1","Class 2","Class 3","Class 4","Class 5","Class 6",
  "Class 7","Class 8","Class 9","Class 10","Class 11","Class 12",
];

// Toast

function Toast({ message, type, onClose }: { message: string; type: "success" | "error"; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [onClose]);
  return (
    <div className={`fixed top-6 right-6 z-[100] flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-sm font-medium ${type === "success" ? "bg-green-600 text-white" : "bg-red-600 text-white"}`}>
      {type === "success" ? <CheckCircle className="w-4 h-4 shrink-0" /> : <XCircle className="w-4 h-4 shrink-0" />}
      {message}
      <button onClick={onClose} className="ml-2 hover:opacity-80"><X className="w-3.5 h-3.5" /></button>
    </div>
  );
}

function SectionHeader({ title }: { title: string }) {
  return <div className="bg-gray-100 px-4 py-2 rounded-lg mb-3"><p className="text-xs font-semibold text-gray-700 uppercase tracking-wide">{title}</p></div>;
}

// Batch Modal

interface BatchModalProps {
  batch?: Batch | null;
  onClose: () => void;
  onSuccess: () => void;
  onToast: (msg: string, type: "success" | "error") => void;
}

function BatchModal({ batch, onClose, onSuccess, onToast }: BatchModalProps) {
  const [form, setForm] = useState({
    name: batch?.name ?? "",
    standard: batch?.standard ?? "",
    medium: batch?.medium ?? "English",
    description: batch?.description ?? "",
  });
  const [errors, setErrors] = useState<Partial<typeof form>>({});
  const [loading, setLoading] = useState(false);

  function validate() {
    const e: Partial<typeof form> = {};
    if (!form.name.trim()) e.name = "Required";
    if (!form.standard) e.standard = "Required";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const method = batch ? "PUT" : "POST";
      const body = batch ? { ...form, id: batch.id } : form;
      const res = await fetch("/api/admin/batches", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save batch");
      onToast(batch ? "Batch updated" : "Batch created", "success");
      onSuccess();
      onClose();
    } catch (err: unknown) {
      onToast(err instanceof Error ? err.message : "Error", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">{batch ? "Edit Batch" : "Create Batch"}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"><X className="w-4 h-4" /></button>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Batch Name <span className="text-red-500">*</span></label>
            <input type="text" placeholder="e.g. 10 Ramanujan" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.name ? "border-red-300 bg-red-50" : "border-gray-200"}`} />
            {errors.name && <p className="text-xs text-red-500 mt-0.5">{errors.name}</p>}
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Standard <span className="text-red-500">*</span></label>
            <select value={form.standard} onChange={e => setForm(f => ({ ...f, standard: e.target.value }))}
              className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.standard ? "border-red-300 bg-red-50" : "border-gray-200"}`}>
              <option value="">Select standard...</option>
              {STANDARDS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            {errors.standard && <p className="text-xs text-red-500 mt-0.5">{errors.standard}</p>}
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Medium</label>
            <select value={form.medium} onChange={e => setForm(f => ({ ...f, medium: e.target.value }))}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="English">English</option>
              <option value="Gujarati">Gujarati</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Description (optional)</label>
            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={loading} className="px-5 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60 font-medium">
              {loading ? "Saving..." : batch ? "Update Batch" : "Create Batch"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Registration Form Modal

const EMPTY_FORM = {
  firstName: "", lastName: "", dateOfBirth: "", schoolName: "",
  standard: "", medium: "English", batchId: "", address: "",
  personalPhone: "", guardian1Phone: "", guardian2Phone: "",
  fatherFirstName: "", fatherLastName: "", fatherOccupation: "",
  motherFirstName: "", motherLastName: "", motherOccupation: "",
  email: "", password: "",
};

interface RegFormModalProps {
  student?: Student | null;
  batches: Batch[];
  onClose: () => void;
  onSuccess: () => void;
  onToast: (msg: string, type: "success" | "error") => void;
}

function RegFormModal({ student, batches, onClose, onSuccess, onToast }: RegFormModalProps) {
  const sp = student?.studentProfile;
  const [form, setForm] = useState({ ...EMPTY_FORM,
    ...(student ? {
      firstName: student.firstName, lastName: student.lastName, email: student.email,
      dateOfBirth: sp?.dateOfBirth ?? "", schoolName: sp?.schoolName ?? "",
      standard: sp?.class ?? "", medium: sp?.medium ?? "English",
      batchId: sp?.batchId ?? "", address: sp?.address ?? "",
      personalPhone: sp?.personalPhone ?? "", guardian1Phone: sp?.guardian1Phone ?? "",
      guardian2Phone: sp?.guardian2Phone ?? "",
      fatherFirstName: sp?.fatherFirstName ?? "", fatherLastName: sp?.fatherLastName ?? "",
      fatherOccupation: sp?.fatherOccupation ?? "",
      motherFirstName: sp?.motherFirstName ?? "", motherLastName: sp?.motherLastName ?? "",
      motherOccupation: sp?.motherOccupation ?? "",
    } : {}),
  });
  const [feeInstallments, setFeeInstallments] = useState<FeeInstallment[]>([]);
  const [showPw, setShowPw] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof typeof EMPTY_FORM, string>>>({});
  const [loading, setLoading] = useState(false);

  const filteredBatches = batches.filter(b => !form.standard || b.standard === form.standard);

  function set(key: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm(f => ({ ...f, [key]: e.target.value }));
  }

  function validate() {
    const e: Partial<Record<keyof typeof EMPTY_FORM, string>> = {};
    if (!form.firstName.trim()) e.firstName = "Required";
    if (!form.lastName.trim()) e.lastName = "Required";
    if (!form.email.trim()) e.email = "Required";
    if (!student && !form.password.trim()) e.password = "Required";
    if (!form.guardian1Phone.trim()) e.guardian1Phone = "Required";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const method = student ? "PUT" : "POST";
      const body = student
        ? { id: student.id, ...form, feeInstallments }
        : { ...form, feeInstallments };
      const res = await fetch("/api/admin/students", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save student");
      onToast(student ? "Student updated" : "Student created", "success");
      onSuccess();
      onClose();
    } catch (err: unknown) {
      onToast(err instanceof Error ? err.message : "Error", "error");
    } finally {
      setLoading(false);
    }
  }

  function Field({ id, label, type = "text", required = false }: { id: keyof typeof EMPTY_FORM; label: string; type?: string; required?: boolean }) {
    return (
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">{label}{required && <span className="text-red-500 ml-0.5">*</span>}</label>
        <input type={type} value={form[id]} onChange={set(id)}
          className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors[id] ? "border-red-300 bg-red-50" : "border-gray-200"}`} />
        {errors[id] && <p className="text-xs text-red-500 mt-0.5">{errors[id]}</p>}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <h2 className="text-lg font-semibold text-gray-900">{student ? "Edit Student" : "Add New Student"}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"><X className="w-4 h-4" /></button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto px-6 py-5 space-y-5 flex-1">
          {/* Personal Info */}
          <div>
            <SectionHeader title="Personal Information" />
            <div className="grid grid-cols-2 gap-4">
              <Field id="firstName" label="First Name" required />
              <Field id="lastName" label="Last Name" required />
              <Field id="dateOfBirth" label="Date of Birth" type="date" />
              <Field id="schoolName" label="School Name" />
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Standard</label>
                <select value={form.standard} onChange={e => setForm(f => ({ ...f, standard: e.target.value, batchId: "" }))}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">Select class...</option>
                  {STANDARDS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Medium</label>
                <select value={form.medium} onChange={set("medium")}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="English">English</option>
                  <option value="Gujarati">Gujarati</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-600 mb-1">Batch</label>
                <select value={form.batchId} onChange={set("batchId")}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">Select batch...</option>
                  {filteredBatches.map(b => <option key={b.id} value={b.id}>{b.name} ({b.standard} – {b.medium})</option>)}
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-600 mb-1">Address</label>
                <textarea value={form.address} onChange={set("address")} rows={2} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
              </div>
            </div>
          </div>

          {/* Contact */}
          <div>
            <SectionHeader title="Contact Details" />
            <div className="grid grid-cols-2 gap-4">
              <Field id="personalPhone" label="Personal Mobile" />
              <Field id="guardian1Phone" label="Guardian 1 Mobile" required />
              <Field id="guardian2Phone" label="Guardian 2 Mobile" />
            </div>
          </div>

          {/* Father */}
          <div>
            <SectionHeader title="Father's Details" />
            <div className="grid grid-cols-2 gap-4">
              <Field id="fatherFirstName" label="Father First Name" />
              <Field id="fatherLastName" label="Father Last Name" />
              <div className="col-span-2"><Field id="fatherOccupation" label="Father's Occupation" /></div>
            </div>
          </div>

          {/* Mother */}
          <div>
            <SectionHeader title="Mother's Details" />
            <div className="grid grid-cols-2 gap-4">
              <Field id="motherFirstName" label="Mother First Name" />
              <Field id="motherLastName" label="Mother Last Name" />
              <div className="col-span-2"><Field id="motherOccupation" label="Mother's Occupation" /></div>
            </div>
          </div>

          {/* Account */}
          <div>
            <SectionHeader title="Account (Portal Login)" />
            <div className="grid grid-cols-2 gap-4">
              <Field id="email" label="Email Address" type="email" required />
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Password{!student && <span className="text-red-500 ml-0.5">*</span>}
                  {student && <span className="text-gray-400 ml-1">(leave blank to keep)</span>}
                </label>
                <div className="relative">
                  <input type={showPw ? "text" : "password"} value={form.password} onChange={set("password")}
                    className={`w-full px-3 py-2 pr-9 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.password ? "border-red-300 bg-red-50" : "border-gray-200"}`} />
                  <button type="button" onClick={() => setShowPw(v => !v)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400">
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-xs text-red-500 mt-0.5">{errors.password}</p>}
              </div>
            </div>
          </div>

          {/* Fee Installments */}
          <div>
            <SectionHeader title="Fee Installments" />
            <div className="space-y-2">
              {feeInstallments.map((inst, i) => (
                <div key={i} className="grid grid-cols-[1fr_1fr_1fr_auto] gap-2 items-start">
                  <div>
                    <input type="number" placeholder="Amount (₹)" value={inst.amount}
                      onChange={e => setFeeInstallments(f => f.map((x, j) => j === i ? { ...x, amount: e.target.value } : x))}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <input type="date" value={inst.dueDate}
                      onChange={e => setFeeInstallments(f => f.map((x, j) => j === i ? { ...x, dueDate: e.target.value } : x))}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <input type="text" placeholder="Note (optional)" value={inst.note}
                      onChange={e => setFeeInstallments(f => f.map((x, j) => j === i ? { ...x, note: e.target.value } : x))}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <button type="button" onClick={() => setFeeInstallments(f => f.filter((_, j) => j !== i))}
                    className="mt-0.5 p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <button type="button" onClick={() => setFeeInstallments(f => [...f, { amount: "", dueDate: "", note: "" }])}
                className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 font-medium mt-1">
                <Plus className="w-4 h-4" /> Add Installment
              </button>
            </div>
          </div>
        </form>

        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-2 shrink-0">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50">Cancel</button>
          <button onClick={handleSubmit} disabled={loading} className="px-5 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60 font-medium">
            {loading ? "Saving..." : student ? "Update Student" : "Add Student"}
          </button>
        </div>
      </div>
    </div>
  );
}

// Student Detail Modal

interface DetailModalProps {
  student: Student;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onToast: (msg: string, type: "success" | "error") => void;
}

function StudentDetailModal({ student, onClose, onEdit, onDelete, onToast }: DetailModalProps) {
  const sp = student.studentProfile;
  const [innerTab, setInnerTab] = useState<"credentials" | "fees">("credentials");
  const [newPw, setNewPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [credLoading, setCredLoading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  async function resetCredentials() {
    if (!newPw.trim()) { onToast("Enter a new password", "error"); return; }
    setCredLoading(true);
    try {
      const res = await fetch("/api/admin/students/credentials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId: student.id, password: newPw }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to reset");
      onToast("Password reset successfully", "success");
      setNewPw("");
    } catch (err: unknown) {
      onToast(err instanceof Error ? err.message : "Error", "error");
    } finally {
      setCredLoading(false);
    }
  }

  function Row({ label, value }: { label: string; value?: string }) {
    return (
      <div className="flex gap-2">
        <span className="text-xs text-gray-400 w-32 shrink-0 pt-0.5">{label}</span>
        <span className="text-sm text-gray-800">{value || "—"}</span>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm">
              {student.firstName[0]}{student.lastName[0]}
            </div>
            <div>
              <p className="font-semibold text-gray-900">{student.firstName} {student.lastName}</p>
              <p className="text-xs text-gray-400">{student.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={onEdit} className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50">
              <Edit2 className="w-3.5 h-3.5" /> Edit
            </button>
            {!confirmDelete ? (
              <button onClick={() => setConfirmDelete(true)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg border border-red-200 text-red-600 hover:bg-red-50">
                <Trash2 className="w-3.5 h-3.5" /> Delete
              </button>
            ) : (
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-red-600 font-medium">Sure?</span>
                <button onClick={onDelete} className="px-3 py-1.5 text-xs rounded-lg bg-red-600 text-white hover:bg-red-700">Yes</button>
                <button onClick={() => setConfirmDelete(false)} className="px-3 py-1.5 text-xs rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50">No</button>
              </div>
            )}
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"><X className="w-4 h-4" /></button>
          </div>
        </div>

        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">
          {/* Personal */}
          <div>
            <SectionHeader title="Personal" />
            <div className="space-y-1.5">
              <Row label="Class" value={sp?.class} />
              <Row label="Medium" value={sp?.medium} />
              <Row label="School" value={sp?.schoolName} />
              <Row label="Date of Birth" value={sp?.dateOfBirth} />
              <Row label="Address" value={sp?.address} />
              <Row label="Batch" value={sp?.batch ? `${sp.batch.name} (${sp.batch.standard})` : undefined} />
            </div>
          </div>
          {/* Contact */}
          <div>
            <SectionHeader title="Contact" />
            <div className="space-y-1.5">
              <Row label="Personal Phone" value={sp?.personalPhone} />
              <Row label="Guardian 1" value={sp?.guardian1Phone} />
              <Row label="Guardian 2" value={sp?.guardian2Phone} />
            </div>
          </div>
          {/* Parents */}
          <div>
            <SectionHeader title="Parents" />
            <div className="space-y-1.5">
              <Row label="Father" value={[sp?.fatherFirstName, sp?.fatherLastName].filter(Boolean).join(" ") || undefined} />
              <Row label="Father Occ." value={sp?.fatherOccupation} />
              <Row label="Mother" value={[sp?.motherFirstName, sp?.motherLastName].filter(Boolean).join(" ") || undefined} />
              <Row label="Mother Occ." value={sp?.motherOccupation} />
            </div>
          </div>

          {/* Inner tabs */}
          <div>
            <div className="flex gap-1 mb-4 border-b border-gray-100">
              {(["credentials", "fees"] as const).map(tab => (
                <button key={tab} onClick={() => setInnerTab(tab)}
                  className={`px-4 py-2 text-sm font-medium capitalize border-b-2 transition ${innerTab === tab ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-800"}`}>
                  {tab === "credentials" ? "Login Credentials" : "Fee Installments"}
                </button>
              ))}
            </div>

            {innerTab === "credentials" && (
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                  <p className="text-xs font-medium text-gray-500">Portal Email</p>
                  <p className="text-sm font-mono text-gray-800">{student.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Reset Password</p>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <input type={showPw ? "text" : "password"} placeholder="New password" value={newPw} onChange={e => setNewPw(e.target.value)}
                        className="w-full px-3 py-2 pr-9 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                      <button type="button" onClick={() => setShowPw(v => !v)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400">
                        {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <button onClick={resetCredentials} disabled={credLoading}
                      className="flex items-center gap-1.5 px-4 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60 font-medium">
                      <Key className="w-3.5 h-3.5" /> {credLoading ? "Saving..." : "Reset"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {innerTab === "fees" && (
              <div className="bg-gray-50 rounded-xl p-6 flex flex-col items-center gap-2 text-center">
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-gray-400" />
                </div>
                <p className="text-sm font-medium text-gray-700">Fee management coming soon</p>
                <p className="text-xs text-gray-400">Installment tracking will be available in the next update.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function SkeletonRow() {
  return (
    <tr className="border-b border-gray-50">
      {[...Array(6)].map((_, i) => (
        <td key={i} className="px-6 py-4"><div className="h-4 bg-gray-200 rounded animate-pulse" style={{ width: `${60 + (i % 3) * 20}%` }} /></td>
      ))}
    </tr>
  );
}

// Main Page

export default function StudentsPage() {
  const [activeTab, setActiveTab] = useState<"batches" | "students">("batches");
  const [batches, setBatches] = useState<Batch[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [batchesLoading, setBatchesLoading] = useState(true);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [selectedStandard, setSelectedStandard] = useState("");
  const [selectedBatchId, setSelectedBatchId] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [editingBatch, setEditingBatch] = useState<Batch | null>(null);
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [toast, setToast] = useState<ToastState>(null);

  const showToast = (message: string, type: "success" | "error") => setToast({ message, type });

  // Fetch batches
  const fetchBatches = useCallback(async () => {
    setBatchesLoading(true);
    try {
      const res = await fetch("/api/admin/batches");
      const data = await res.json();
      setBatches(data.batches || []);
    } catch {
      showToast("Failed to load batches", "error");
    } finally {
      setBatchesLoading(false);
    }
  }, []);

  // Fetch students
  const fetchStudents = useCallback(async () => {
    if (!selectedBatchId) { setStudents([]); return; }
    setStudentsLoading(true);
    try {
      const params = new URLSearchParams({ batchId: selectedBatchId });
      if (searchQuery) params.set("search", searchQuery);
      const res = await fetch(`/api/admin/students?${params}`);
      const data = await res.json();
      setStudents(data.students || []);
    } catch {
      showToast("Failed to load students", "error");
    } finally {
      setStudentsLoading(false);
    }
  }, [selectedBatchId, searchQuery]);

  useEffect(() => { fetchBatches(); }, [fetchBatches]);
  useEffect(() => { if (activeTab === "students") fetchStudents(); }, [activeTab, fetchStudents]);

  async function deleteBatch(id: string, name: string) {
    if (!window.confirm(`Delete batch "${name}"? This cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/admin/batches?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete batch");
      showToast("Batch deleted", "success");
      fetchBatches();
    } catch {
      showToast("Failed to delete batch", "error");
    }
  }

  async function deleteStudent(id: string) {
    try {
      const res = await fetch(`/api/admin/students?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete student");
      showToast("Student deleted", "success");
      setSelectedStudent(null);
      fetchStudents();
    } catch {
      showToast("Failed to delete student", "error");
    }
  }

  const standardsInBatches = [...new Set(batches.map(b => b.standard))].sort();
  const filteredBatches = selectedStandard ? batches.filter(b => b.standard === selectedStandard) : batches;
  const filteredStudents = students.filter(s => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return `${s.firstName} ${s.lastName}`.toLowerCase().includes(q) ||
      s.email.toLowerCase().includes(q) ||
      (s.studentProfile?.guardian1Phone || "").includes(q);
  });

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Student Management</h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white border border-gray-200 rounded-xl p-1 w-fit">
        <button onClick={() => setActiveTab("batches")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${activeTab === "batches" ? "bg-blue-600 text-white shadow-sm" : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"}`}>
          <Layers className="w-4 h-4" /> Batches
        </button>
        <button onClick={() => setActiveTab("students")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${activeTab === "students" ? "bg-blue-600 text-white shadow-sm" : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"}`}>
          <Users className="w-4 h-4" /> Students
        </button>
      </div>

      {/* ── BATCHES TAB ── */}
      {activeTab === "batches" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800">Manage Batches</h2>
            <button onClick={() => { setEditingBatch(null); setShowBatchModal(true); }}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition">
              <Plus className="w-4 h-4" /> Create Batch
            </button>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {batchesLoading ? (
              <table className="w-full"><tbody>{[...Array(4)].map((_, i) => <SkeletonRow key={i} />)}</tbody></table>
            ) : batches.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 gap-3">
                <Layers className="w-10 h-10 text-gray-200" />
                <p className="text-sm text-gray-400">No batches yet. Create your first batch.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50/60">
                      {["Name", "Standard", "Medium", "Students", "Status", "Actions"].map(h => (
                        <th key={h} className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {batches.map(batch => (
                      <tr key={batch.id} className="hover:bg-gray-50/50 transition">
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{batch.name}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{batch.standard}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{batch.medium}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{batch._count.students}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${batch.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                            {batch.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1.5">
                            <button onClick={() => { setEditingBatch(batch); setShowBatchModal(true); }}
                              className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition">
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button onClick={() => deleteBatch(batch.id, batch.name)}
                              className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── STUDENTS TAB ── */}
      {activeTab === "students" && (
        <div className="space-y-4">
          {/* Toolbar */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Standard filter */}
            <div className="relative">
              <select value={selectedStandard} onChange={e => { setSelectedStandard(e.target.value); setSelectedBatchId(""); }}
                className="appearance-none pl-3 pr-8 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700">
                <option value="">All Standards</option>
                {standardsInBatches.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
            </div>
            {/* Batch filter */}
            <div className="relative">
              <select value={selectedBatchId} onChange={e => setSelectedBatchId(e.target.value)}
                className="appearance-none pl-3 pr-8 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 min-w-[180px]">
                <option value="">Select Batch</option>
                {filteredBatches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
            </div>
            {/* Search */}
            <div className="relative flex-1 min-w-[200px] max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" placeholder="Search students..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <div className="ml-auto">
              <button onClick={() => { setEditingStudent(null); setShowAddStudent(true); }}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition">
                <Plus className="w-4 h-4" /> Add Student
              </button>
            </div>
          </div>

          {/* Students table */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {!selectedBatchId ? (
              <div className="flex flex-col items-center justify-center h-48 gap-2">
                <Users className="w-10 h-10 text-gray-200" />
                <p className="text-sm text-gray-400">Select a batch to view students</p>
              </div>
            ) : studentsLoading ? (
              <table className="w-full"><tbody>{[...Array(5)].map((_, i) => <SkeletonRow key={i} />)}</tbody></table>
            ) : filteredStudents.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 gap-2">
                <Users className="w-10 h-10 text-gray-200" />
                <p className="text-sm text-gray-400">{searchQuery ? "No students match your search" : "No students in this batch"}</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50/60">
                      {["Student", "Class / Medium", "Guardian Phone", "Email", "Status", "Actions"].map(h => (
                        <th key={h} className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filteredStudents.map(student => (
                      <tr key={student.id} className="hover:bg-gray-50/50 transition">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-xs font-bold shrink-0">
                              {student.firstName[0]}{student.lastName[0]}
                            </div>
                            <button onClick={() => setSelectedStudent(student)} className="text-sm font-medium text-gray-900 hover:text-blue-600 transition text-left">
                              {student.firstName} {student.lastName}
                            </button>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-gray-800">{student.studentProfile?.class || "—"}</p>
                          <p className="text-xs text-gray-400">{student.studentProfile?.medium || "—"}</p>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">{student.studentProfile?.guardian1Phone || "—"}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{student.email}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${student.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                            {student.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1.5">
                            <button onClick={() => setSelectedStudent(student)} title="View details"
                              className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition">
                              <Eye className="w-4 h-4" />
                            </button>
                            <button onClick={() => { setEditingStudent(student); setShowAddStudent(true); }} title="Edit"
                              className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition">
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button onClick={() => deleteStudent(student.id)} title="Delete"
                              className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Modals ── */}
      {showBatchModal && (
        <BatchModal
          batch={editingBatch}
          onClose={() => setShowBatchModal(false)}
          onSuccess={fetchBatches}
          onToast={showToast}
        />
      )}

      {showAddStudent && (
        <RegFormModal
          student={editingStudent}
          batches={batches}
          onClose={() => { setShowAddStudent(false); setEditingStudent(null); }}
          onSuccess={() => { fetchStudents(); fetchBatches(); }}
          onToast={showToast}
        />
      )}

      {selectedStudent && (
        <StudentDetailModal
          student={selectedStudent}
          onClose={() => setSelectedStudent(null)}
          onEdit={() => { setEditingStudent(selectedStudent); setSelectedStudent(null); setShowAddStudent(true); }}
          onDelete={() => deleteStudent(selectedStudent.id)}
          onToast={showToast}
        />
      )}

      {/* Toast */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
