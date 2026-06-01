"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Search, X, Eye, CheckCircle, XCircle, Clock,
  MessageSquare, Phone, Mail, User, BookOpen,
  Trash2, ChevronDown, RefreshCw,
} from "lucide-react";

type InquiryStatus = "PENDING" | "ACTIVE" | "REJECTED" | "COMPLETED";

interface Inquiry {
  id: string;
  studentName: string;
  parentName: string;
  email: string;
  phone: string;
  class: string;
  medium: string;
  course: string;
  status: InquiryStatus;
  comments: string | null;
  createdAt: string;
  updatedAt: string;
}

const STATUS: Record<InquiryStatus, { label: string; bg: string; text: string; icon: React.ElementType }> = {
  PENDING:   { label: "Pending",        bg: "bg-amber-100", text: "text-amber-700", icon: Clock       },
  ACTIVE:    { label: "Interested",     bg: "bg-green-100", text: "text-green-700", icon: CheckCircle },
  REJECTED:  { label: "Not Interested", bg: "bg-red-100",   text: "text-red-700",   icon: XCircle     },
  COMPLETED: { label: "Converted",      bg: "bg-blue-100",  text: "text-blue-700",  icon: CheckCircle },
};

const TABS = [
  { label: "All",            value: "ALL"      },
  { label: "Pending",        value: "PENDING"  },
  { label: "Interested",     value: "ACTIVE"   },
  { label: "Not Interested", value: "REJECTED" },
  { label: "Converted",      value: "COMPLETED"},
];

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function StatusBadge({ status }: { status: InquiryStatus }) {
  const cfg = STATUS[status];
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${cfg.bg} ${cfg.text}`}>
      <Icon className="w-3 h-3" />{cfg.label}
    </span>
  );
}

export default function EnrollmentsPage() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("ALL");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Inquiry | null>(null);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [actionStatus, setActionStatus] = useState<InquiryStatus>("PENDING");
  const [actionComments, setActionComments] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  function showToast(type: "success" | "error", message: string) {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  }

  const fetchInquiries = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/enrollments");
      const data = await res.json();
      if (data.success) setInquiries(data.enrollments ?? []);
    } catch { showToast("error", "Failed to load inquiries"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchInquiries(); }, [fetchInquiries]);

  function openDetail(inquiry: Inquiry) {
    setSelected(inquiry);
    setActionStatus(inquiry.status);
    setActionComments(inquiry.comments ?? "");
  }

  function closeDetail() { setSelected(null); }

  async function handleSave() {
    if (!selected) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/enrollments?id=${selected.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: actionStatus, comments: actionComments }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Failed");
      showToast("success", "Inquiry updated");
      const updated = { ...selected, status: actionStatus, comments: actionComments };
      setInquiries(prev => prev.map(i => i.id === selected.id ? updated : i));
      setSelected(updated);
    } catch (e: any) { showToast("error", e.message || "Failed to update"); }
    finally { setSaving(false); }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this inquiry permanently?")) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/enrollments?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed");
      showToast("success", "Inquiry deleted");
      setInquiries(prev => prev.filter(i => i.id !== id));
      if (selected?.id === id) closeDetail();
    } catch { showToast("error", "Failed to delete"); }
    finally { setDeleting(false); }
  }

  const counts: Record<string, number> = { ALL: inquiries.length };
  inquiries.forEach(i => { counts[i.status] = (counts[i.status] ?? 0) + 1; });

  const filtered = inquiries.filter(i => {
    const matchesTab = activeTab === "ALL" || i.status === activeTab;
    const matchesSearch = !search || [i.studentName, i.parentName, i.email, i.phone, i.course]
      .some(v => v?.toLowerCase().includes(search.toLowerCase()));
    return matchesTab && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Enrollment Inquiries</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Requests from the Enroll Now form. Contact them, update the outcome, and add notes.
          </p>
        </div>
        <button onClick={fetchInquiries}
          className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-[100] flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-sm font-medium border ${
          toast.type === "success" ? "bg-green-50 border-green-200 text-green-800" : "bg-red-50 border-red-200 text-red-800"
        }`}>
          {toast.type === "success" ? <CheckCircle className="w-4 h-4 text-green-600" /> : <XCircle className="w-4 h-4 text-red-600" />}
          {toast.message}
          <button onClick={() => setToast(null)}><X className="w-3.5 h-3.5" /></button>
        </div>
      )}

      {/* Status tabs */}
      <div className="flex gap-1 bg-white border border-gray-200 rounded-xl p-1 w-fit flex-wrap">
        {TABS.map(tab => (
          <button key={tab.value} onClick={() => setActiveTab(tab.value)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab.value ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-50"
            }`}>
            {tab.label}
            {counts[tab.value] !== undefined && (
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${activeTab === tab.value ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-600"}`}>
                {counts[tab.value]}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className={`flex gap-6 ${selected ? "flex-col lg:flex-row items-start" : ""}`}>
        {/* Table */}
        <div className={`flex-1 min-w-0 space-y-4 ${selected ? "lg:w-[55%]" : ""}`}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" placeholder="Search name, email, phone, course..." value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            {search && <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"><X className="w-4 h-4" /></button>}
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            {loading ? (
              <div className="p-6 space-y-3">{[...Array(5)].map((_,i) => <div key={i} className="h-14 bg-gray-100 animate-pulse rounded-lg" />)}</div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <BookOpen className="w-12 h-12 text-gray-200" />
                <p className="text-gray-500 font-medium">No inquiries found</p>
                <p className="text-gray-400 text-sm">Students who fill the Enroll Now form will appear here.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      {["Student / Parent", "Course & Class", "Contact", "Status", "Date", ""].map((h, i) => (
                        <th key={i} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filtered.map(inquiry => (
                      <tr key={inquiry.id} onClick={() => openDetail(inquiry)}
                        className={`hover:bg-gray-50 cursor-pointer transition-colors ${selected?.id === inquiry.id ? "bg-blue-50/60" : ""}`}>
                        <td className="px-4 py-3">
                          <p className="font-medium text-gray-900">{inquiry.studentName}</p>
                          <p className="text-xs text-gray-400">{inquiry.parentName || "—"}</p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-gray-800 truncate max-w-[140px]">{inquiry.course || "—"}</p>
                          <p className="text-xs text-gray-400">{[inquiry.class, inquiry.medium].filter(Boolean).join(" · ")}</p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-gray-700">{inquiry.phone || "—"}</p>
                          <p className="text-xs text-gray-400 truncate max-w-[150px]">{inquiry.email}</p>
                        </td>
                        <td className="px-4 py-3"><StatusBadge status={inquiry.status} /></td>
                        <td className="px-4 py-3 text-gray-500 whitespace-nowrap text-xs">{fmtDate(inquiry.createdAt)}</td>
                        <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                          <div className="flex items-center gap-1">
                            <button onClick={() => openDetail(inquiry)} className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600">
                              <Eye className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleDelete(inquiry.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500">
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

        {/* Detail / Action panel */}
        {selected && (
          <div className="lg:w-[42%] shrink-0">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm sticky top-4">
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <div>
                  <p className="font-semibold text-gray-900">{selected.studentName}</p>
                  <StatusBadge status={selected.status} />
                </div>
                <button onClick={closeDetail} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"><X className="w-4 h-4" /></button>
              </div>

              <div className="px-5 py-4 space-y-5 max-h-[75vh] overflow-y-auto">
                {/* Details */}
                <div className="space-y-1.5 text-sm">
                  {[
                    ["Parent", selected.parentName],
                    ["Class", selected.class],
                    ["Medium", selected.medium],
                    ["Course", selected.course],
                    ["Received", fmtDate(selected.createdAt)],
                  ].map(([label, value]) => (
                    <div key={label} className="flex gap-2">
                      <span className="text-gray-400 w-24 shrink-0">{label}</span>
                      <span className="text-gray-800">{value || "—"}</span>
                    </div>
                  ))}
                </div>

                {/* Contact buttons */}
                <div className="flex gap-2">
                  <a href={`tel:${selected.phone}`}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 bg-green-50 border border-green-200 rounded-xl text-sm font-medium text-green-700 hover:bg-green-100 transition-colors">
                    <Phone className="w-4 h-4" /> Call
                  </a>
                  <a href={`mailto:${selected.email}`}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 bg-blue-50 border border-blue-200 rounded-xl text-sm font-medium text-blue-700 hover:bg-blue-100 transition-colors">
                    <Mail className="w-4 h-4" /> Email
                  </a>
                </div>

                {/* Update outcome */}
                <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5" /> Update Outcome
                  </p>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Status after contact</label>
                    <div className="relative">
                      <select value={actionStatus} onChange={e => setActionStatus(e.target.value as InquiryStatus)}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none pr-8">
                        <option value="PENDING">⏳  Pending — not contacted yet</option>
                        <option value="ACTIVE">✅  Interested — positive response</option>
                        <option value="REJECTED">❌  Not Interested — declined</option>
                        <option value="COMPLETED">🎓  Converted — student added to system</option>
                      </select>
                      <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Notes <span className="text-gray-400 font-normal">(fees, follow-up, discussion outcome...)</span>
                    </label>
                    <textarea value={actionComments} onChange={e => setActionComments(e.target.value)}
                      rows={4} placeholder="e.g. Spoke with parent on 1 June. Fee agreed: ₹25,000. Will visit tomorrow."
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none bg-white" />
                  </div>

                  <div className="flex gap-2">
                    <button onClick={handleSave} disabled={saving}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors">
                      {saving ? "Saving..." : "Save"}
                    </button>
                    <button onClick={() => handleDelete(selected.id)} disabled={deleting}
                      className="px-3 py-2 border border-red-200 text-red-500 rounded-xl hover:bg-red-50 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {actionStatus === "ACTIVE" && (
                    <p className="text-xs text-green-700 bg-green-50 border border-green-200 rounded-lg p-2.5">
                      <strong>Next step:</strong> Go to <strong>Students → Add Student</strong> to create their portal account and assign a batch.
                    </p>
                  )}
                  {actionStatus === "COMPLETED" && (
                    <p className="text-xs text-blue-700 bg-blue-50 border border-blue-200 rounded-lg p-2.5">
                      Marked as converted — student has been added via the Students section.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
