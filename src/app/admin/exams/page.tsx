"use client";

import { useEffect, useState, useCallback } from "react";
import {
  BookOpen, Plus, Pencil, Trash2, Eye, X,
  CheckCircle, AlertCircle, Loader2, Download, Upload, Info,
} from "lucide-react";

interface Batch { id: string; name: string; standard: string; medium: string }
interface FacultyOption { id: string; firstName: string; lastName: string; facultyProfile?: { id: string } }

interface Exam {
  id: string;
  subject: string;
  date: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  room: string | null;
  maxMarks: number;
  syllabus: string | null;
  facultyId: string | null;
  batch: { id: string; name: string; standard: string; medium: string };
  assignedFaculty: { id: string; user: { firstName: string; lastName: string } } | null;
  _count?: { grades: number; examPapers: number };
}

interface Paper {
  id: string; fileName: string; fileUrl: string;
  faculty: { user: { firstName: string; lastName: string } };
  createdAt: string;
}

const DAYS = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];

function getDayFromDate(d: string) { return d ? DAYS[new Date(d).getDay()] ?? "" : ""; }

function fmt12(t: string) {
  if (!t) return "—";
  const [h, m] = t.split(":").map(Number);
  return `${h % 12 || 12}:${m.toString().padStart(2,"0")} ${h < 12 ? "AM" : "PM"}`;
}

function fmtDate(d: string) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

const EMPTY: {
  subject: string; batchId: string; facultyId: string; date: string; dayOfWeek: string;
  startTime: string; endTime: string; room: string; maxMarks: string; syllabus: string;
} = {
  subject: "", batchId: "", facultyId: "", date: "", dayOfWeek: "",
  startTime: "", endTime: "", room: "", maxMarks: "100", syllabus: "",
};

export default function ExamsPage() {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [facultyList, setFacultyList] = useState<FacultyOption[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [filterBatchId, setFilterBatchId] = useState("");
  const [loadingBatches, setLoadingBatches] = useState(true);
  const [loadingExams, setLoadingExams] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [editExam, setEditExam] = useState<Exam | null>(null);
  const [form, setForm] = useState({ ...EMPTY });
  const [saving, setSaving] = useState(false);

  const [papersExam, setPapersExam] = useState<Exam | null>(null);
  const [papers, setPapers] = useState<Paper[]>([]);
  const [loadingPapers, setLoadingPapers] = useState(false);
  const [uploadFacultyId, setUploadFacultyId] = useState("");
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadingPaper, setUploadingPaper] = useState(false);

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  function showToast(type: "success" | "error", message: string) {
    setToast({ type, message });
    setTimeout(() => setToast(null), 5000);
  }

  useEffect(() => {
    async function init() {
      try {
        const [bRes, fRes] = await Promise.all([
          fetch("/api/admin/batches"),
          fetch("/api/auth/register?role=FACULTY"),
        ]);
        const bData = await bRes.json();
        const fData = await fRes.json();
        if (bData.success) setBatches(bData.batches ?? []);
        if (fData.success) setFacultyList(fData.users ?? []);
      } catch { showToast("error", "Failed to load data"); }
      finally { setLoadingBatches(false); }
    }
    init();
  }, []);

  const fetchExams = useCallback(async (batchId: string) => {
    setLoadingExams(true);
    try {
      const url = batchId ? `/api/admin/exams?batchId=${batchId}` : "/api/admin/exams";
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) setExams(data.exams ?? []);
      else showToast("error", data.error || "Failed to load exams");
    } catch { showToast("error", "Failed to load exams"); }
    finally { setLoadingExams(false); }
  }, []);

  useEffect(() => { fetchExams(filterBatchId); }, [filterBatchId, fetchExams]);

  function openCreate() {
    setEditExam(null);
    setForm({ ...EMPTY });
    setModalOpen(true);
  }

  function openEdit(exam: Exam) {
    setEditExam(exam);
    setForm({
      subject: exam.subject,
      batchId: exam.batch.id,
      facultyId: exam.facultyId ?? "",
      date: exam.date ? exam.date.split("T")[0] : "",
      dayOfWeek: exam.dayOfWeek,
      startTime: exam.startTime ?? "",
      endTime: exam.endTime ?? "",
      room: exam.room ?? "",
      maxMarks: String(exam.maxMarks),
      syllabus: exam.syllabus ?? "",
    });
    setModalOpen(true);
  }

  function closeModal() { setModalOpen(false); setEditExam(null); setForm({ ...EMPTY }); }

  function set<K extends keyof typeof EMPTY>(key: K, val: string) {
    setForm(f => {
      const next = { ...f, [key]: val };
      if (key === "date") next.dayOfWeek = getDayFromDate(val);
      return next;
    });
  }

  async function handleSave() {
    if (!form.subject.trim()) { showToast("error", "Subject is required"); return; }
    if (!form.batchId) { showToast("error", "Please select a batch"); return; }
    if (!form.date) { showToast("error", "Exam date is required"); return; }
    if (!form.startTime) { showToast("error", "Start time is required"); return; }
    if (!form.endTime) { showToast("error", "End time is required"); return; }
    if (form.startTime >= form.endTime) { showToast("error", "End time must be after start time"); return; }

    setSaving(true);
    try {
      const body = editExam
        ? { id: editExam.id, ...form }
        : { ...form };

      const res = await fetch("/api/admin/exams", {
        method: editExam ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        showToast("error", data.error || "Failed to save exam");
        return;
      }

      const msg = editExam
        ? "Exam updated successfully."
        : `Exam created. ${data.studentsNotified ?? 0} students and ${data.facultyNotified ?? 0} faculty notified.`;
      showToast("success", msg);
      closeModal();
      fetchExams(filterBatchId);
    } catch { showToast("error", "Failed to save exam"); }
    finally { setSaving(false); }
  }

  async function handleDelete(id: string) {
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/exams?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok || !data.success) { showToast("error", data.error || "Failed to delete"); return; }
      showToast("success", "Exam deleted");
      setExams(prev => prev.filter(e => e.id !== id));
    } catch { showToast("error", "Failed to delete exam"); }
    finally { setDeleting(false); setDeleteId(null); }
  }

  async function openPapers(exam: Exam) {
    setPapersExam(exam);
    setUploadFacultyId("");
    setUploadFile(null);
    setLoadingPapers(true);
    try {
      const res = await fetch(`/api/admin/exams/paper?examId=${exam.id}`);
      const data = await res.json();
      setPapers(data.success ? (data.papers ?? []) : []);
    } catch { setPapers([]); }
    finally { setLoadingPapers(false); }
  }

  async function handleUploadPaper() {
    if (!papersExam || !uploadFile || !uploadFacultyId) {
      showToast("error", "Select a faculty member and file");
      return;
    }
    setUploadingPaper(true);
    try {
      const fd = new FormData();
      fd.append("files", uploadFile);
      fd.append("examId", papersExam.id);
      fd.append("facultyId", uploadFacultyId);
      const res = await fetch("/api/admin/exams/paper", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok || !data.success) { showToast("error", data.error || "Upload failed"); return; }
      showToast("success", "Paper uploaded");
      setUploadFacultyId(""); setUploadFile(null);
      const r2 = await fetch(`/api/admin/exams/paper?examId=${papersExam.id}`);
      const d2 = await r2.json();
      if (d2.success) setPapers(d2.papers ?? []);
    } catch { showToast("error", "Upload failed"); }
    finally { setUploadingPaper(false); }
  }

  const inputCls = "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BookOpen className="w-6 h-6 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">Exams</h1>
        </div>
        <button onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm">
          <Plus className="w-4 h-4" /> Create Exam
        </button>
      </div>

      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-[100] flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium ${
          toast.type === "success" ? "bg-green-50 border-green-200 text-green-800" : "bg-red-50 border-red-200 text-red-800"
        }`}>
          {toast.type === "success" ? <CheckCircle className="w-4 h-4 text-green-600 shrink-0" /> : <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />}
          {toast.message}
          <button onClick={() => setToast(null)} className="ml-2 opacity-60 hover:opacity-100"><X className="w-3.5 h-3.5" /></button>
        </div>
      )}

      {/* Filter */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 flex items-center gap-4">
        <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Filter by Batch</label>
        {loadingBatches ? <div className="h-9 w-48 bg-gray-100 animate-pulse rounded-lg" /> : (
          <select value={filterBatchId} onChange={e => setFilterBatchId(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[220px]">
            <option value="">All Batches</option>
            {batches.map(b => <option key={b.id} value={b.id}>{b.standard} — {b.name} ({b.medium})</option>)}
          </select>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {loadingExams ? (
          <div className="p-6 space-y-3">{[...Array(4)].map((_,i) => <div key={i} className="h-12 bg-gray-100 animate-pulse rounded-lg" />)}</div>
        ) : exams.length === 0 ? (
          <div className="py-20 flex flex-col items-center text-center">
            <div className="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center mb-4">
              <BookOpen className="w-7 h-7 text-blue-400" />
            </div>
            <p className="text-gray-700 font-medium">No exams found</p>
            <p className="text-gray-400 text-sm mt-1">Create one using the button above.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600 text-left border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 font-medium">Subject</th>
                  <th className="px-4 py-3 font-medium">Batch</th>
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium">Time</th>
                  <th className="px-4 py-3 font-medium">Room</th>
                  <th className="px-4 py-3 font-medium">Faculty</th>
                  <th className="px-4 py-3 font-medium">Marks</th>
                  <th className="px-4 py-3 font-medium">Papers</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {exams.map(exam => (
                  <tr key={exam.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-900">{exam.subject}</td>
                    <td className="px-4 py-3 text-gray-600">
                      <div>{exam.batch.standard} — {exam.batch.name}</div>
                      <div className="text-xs text-gray-400">{exam.batch.medium}</div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      <div>{fmtDate(exam.date)}</div>
                      <div className="text-xs text-gray-400">{exam.dayOfWeek}</div>
                    </td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                      {fmt12(exam.startTime)} – {fmt12(exam.endTime)}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{exam.room || "—"}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {exam.assignedFaculty ? `${exam.assignedFaculty.user.firstName} ${exam.assignedFaculty.user.lastName}` : "—"}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{exam.maxMarks}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2 py-0.5 bg-gray-100 rounded-full text-xs font-medium">
                        {exam._count?.examPapers ?? 0}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => openPapers(exam)} title="View Papers"
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button onClick={() => openEdit(exam)} title="Edit"
                          className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => setDeleteId(exam.id)} title="Delete"
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
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

      {/* ── Create / Edit Modal ── */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[92vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
              <h3 className="text-base font-semibold text-gray-900">{editExam ? "Edit Exam" : "Create Exam"}</h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>

            <div className="px-6 py-5 space-y-4 overflow-y-auto">
              {/* Subject */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Subject <span className="text-red-500">*</span></label>
                <input type="text" value={form.subject} onChange={e => set("subject", e.target.value)}
                  placeholder="e.g. Mathematics" className={inputCls} />
              </div>

              {/* Batch */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Batch <span className="text-red-500">*</span></label>
                <select value={form.batchId} onChange={e => set("batchId", e.target.value)} className={inputCls}>
                  <option value="">— Select batch —</option>
                  {batches.map(b => <option key={b.id} value={b.id}>{b.standard} — {b.name} ({b.medium})</option>)}
                </select>
              </div>

              {/* Assign Faculty */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Assign Faculty <span className="text-gray-400 font-normal">(will be notified to upload paper)</span>
                </label>
                <select value={form.facultyId} onChange={e => set("facultyId", e.target.value)} className={inputCls}>
                  <option value="">— Select faculty —</option>
                  {facultyList.map(f => <option key={f.id} value={f.id}>{f.firstName} {f.lastName}</option>)}
                </select>
              </div>

              {/* Date + Day */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Exam Date <span className="text-red-500">*</span></label>
                  <input type="date" value={form.date} onChange={e => set("date", e.target.value)} className={inputCls} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Day of Week</label>
                  <input type="text" value={form.dayOfWeek} readOnly placeholder="Auto-filled"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-500 cursor-not-allowed" />
                </div>
              </div>

              {/* Start + End Time */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Start Time <span className="text-red-500">*</span></label>
                  <input type="time" value={form.startTime} onChange={e => set("startTime", e.target.value)} className={inputCls} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">End Time <span className="text-red-500">*</span></label>
                  <input type="time" value={form.endTime} onChange={e => set("endTime", e.target.value)} className={inputCls} />
                </div>
              </div>

              {/* Room + Max Marks */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Room <span className="text-gray-400 font-normal">(optional)</span></label>
                  <input type="text" value={form.room} onChange={e => set("room", e.target.value)}
                    placeholder="e.g. Room A" className={inputCls} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Max Marks</label>
                  <input type="number" min={1} value={form.maxMarks} onChange={e => set("maxMarks", e.target.value)} className={inputCls} />
                </div>
              </div>

              {/* Syllabus */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Syllabus <span className="text-gray-400 font-normal">(optional)</span></label>
                <textarea rows={3} value={form.syllabus} onChange={e => set("syllabus", e.target.value)}
                  placeholder="Topics covered in this exam..." className={`${inputCls} resize-none`} />
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-100 flex gap-3 justify-end shrink-0">
              <button onClick={closeModal}
                className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button onClick={handleSave} disabled={saving}
                className="flex items-center gap-2 px-5 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors">
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                {editExam ? "Update Exam" : "Create Exam"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Papers Modal ── */}
      {papersExam && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
              <div>
                <h3 className="text-base font-semibold text-gray-900">Exam Papers</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  {papersExam.subject} — {papersExam.batch.standard} {papersExam.batch.name} &middot; {fmtDate(papersExam.date)}
                </p>
              </div>
              <button onClick={() => setPapersExam(null)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>

            <div className="px-6 py-5 overflow-y-auto space-y-5">
              <div className="flex items-start gap-2 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3">
                <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                <p className="text-xs text-blue-700">Papers are visible to admin only — students cannot see them. Download to print.</p>
              </div>

              {/* Existing papers */}
              <div>
                <h4 className="text-sm font-semibold text-gray-800 mb-3">Uploaded Papers</h4>
                {loadingPapers ? (
                  <div className="space-y-2">{[...Array(3)].map((_,i) => <div key={i} className="h-10 bg-gray-100 animate-pulse rounded-lg" />)}</div>
                ) : papers.length === 0 ? (
                  <p className="text-gray-400 text-sm italic">No papers uploaded yet.</p>
                ) : (
                  <div className="rounded-lg border border-gray-200 overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 text-gray-600 text-left">
                        <tr>
                          <th className="px-3 py-2.5 font-medium">Faculty</th>
                          <th className="px-3 py-2.5 font-medium">File</th>
                          <th className="px-3 py-2.5 font-medium">Date</th>
                          <th className="px-3 py-2.5 font-medium">Download</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {papers.map(p => (
                          <tr key={p.id} className="hover:bg-gray-50">
                            <td className="px-3 py-2.5 text-gray-700">{p.faculty.user.firstName} {p.faculty.user.lastName}</td>
                            <td className="px-3 py-2.5 text-gray-600 max-w-[160px] truncate">{p.fileName}</td>
                            <td className="px-3 py-2.5 text-gray-500">{new Date(p.createdAt).toLocaleDateString("en-IN")}</td>
                            <td className="px-3 py-2.5">
                              <a href={p.fileUrl} target="_blank" rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 text-xs font-medium">
                                <Download className="w-3.5 h-3.5" /> Download
                              </a>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Upload */}
              <div className="border border-gray-200 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Upload className="w-4 h-4 text-gray-500" />
                  <h4 className="text-sm font-semibold text-gray-800">Upload Paper</h4>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Select Faculty <span className="text-red-500">*</span></label>
                  <select value={uploadFacultyId} onChange={e => setUploadFacultyId(e.target.value)} className={inputCls}>
                    <option value="">— Select faculty —</option>
                    {facultyList.map(f => <option key={f.id} value={f.id}>{f.firstName} {f.lastName}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">File <span className="text-red-500">*</span></label>
                  <input type="file" accept=".pdf,.doc,.docx,.jpg,.png"
                    onChange={e => setUploadFile(e.target.files?.[0] ?? null)}
                    className="w-full text-sm text-gray-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                  <p className="text-xs text-gray-400 mt-1">Accepted: .pdf, .doc, .docx, .jpg, .png</p>
                </div>
                <button onClick={handleUploadPaper} disabled={uploadingPaper || !uploadFile || !uploadFacultyId}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors">
                  {uploadingPaper ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  Upload Paper
                </button>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-100 flex justify-end shrink-0">
              <button onClick={() => setPapersExam(null)}
                className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirm ── */}
      {deleteId && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">Delete Exam?</h3>
            <p className="text-gray-500 text-sm text-center mb-6">
              This will permanently remove this exam and all associated papers and grades.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} disabled={deleting}
                className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50">
                Cancel
              </button>
              <button onClick={() => handleDelete(deleteId!)} disabled={deleting}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 text-white rounded-xl text-sm font-medium hover:bg-red-700 disabled:opacity-50">
                {deleting && <Loader2 className="w-4 h-4 animate-spin" />} Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
