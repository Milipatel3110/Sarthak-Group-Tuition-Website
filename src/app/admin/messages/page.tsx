"use client";

import { useEffect, useState } from "react";
import {
  MessageSquare,
  CheckCircle,
  Eye,
  X,
  RefreshCw,
  Mail,
  Phone,
  Search,
} from "lucide-react";

// ── Types ────────────────────────────────────────────────────────────────────

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  isResolved: boolean;
  createdAt: string;
}

type FilterTab = "all" | "pending" | "resolved";

// ── Page ─────────────────────────────────────────────────────────────────────

export default function MessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterTab>("all");
  const [search, setSearch] = useState("");
  const [resolvingId, setResolvingId] = useState<string | null>(null);
  const [viewMsg, setViewMsg] = useState<ContactMessage | null>(null);

  useEffect(() => {
    loadMessages();
  }, []);

  async function loadMessages() {
    setLoading(true);
    try {
      const res = await fetch("/api/contact");
      const data = await res.json();
      setMessages(data.messages || []);
    } finally {
      setLoading(false);
    }
  }

  async function markResolved(id: string) {
    setResolvingId(id);
    try {
      await fetch(`/api/contact?id=${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isResolved: true }),
      });
      setMessages((prev) =>
        prev.map((m) => (m.id === id ? { ...m, isResolved: true } : m))
      );
      if (viewMsg?.id === id) {
        setViewMsg((prev) => prev ? { ...prev, isResolved: true } : prev);
      }
    } finally {
      setResolvingId(null);
    }
  }

  // Derived list
  const filtered = messages
    .filter((m) => {
      if (filter === "pending") return !m.isResolved;
      if (filter === "resolved") return m.isResolved;
      return true;
    })
    .filter((m) => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q)
      );
    });

  const unresolvedCount = messages.filter((m) => !m.isResolved).length;

  const TABS: { key: FilterTab; label: string }[] = [
    { key: "all", label: "All" },
    { key: "pending", label: "Pending" },
    { key: "resolved", label: "Resolved" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <MessageSquare className="w-6 h-6 text-blue-600" />
        <h1 className="text-2xl font-bold text-gray-900">Contact Messages</h1>
        {unresolvedCount > 0 && (
          <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-semibold rounded-full">
            {unresolvedCount} pending
          </span>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        {/* Controls */}
        <div className="flex flex-wrap items-center gap-4 mb-5">
          {/* Filter tabs */}
          <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
            {TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => setFilter(t.key)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  filter === t.key
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="flex items-center gap-2 border border-gray-300 rounded-lg px-3 py-2 flex-1 min-w-[200px] max-w-xs">
            <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 text-sm outline-none bg-transparent"
            />
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex justify-center py-10">
            <RefreshCw className="w-6 h-6 text-blue-500 animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-gray-400 text-sm italic text-center py-8">
            No messages found.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600 text-left">
                <tr>
                  <th className="px-4 py-3 font-medium">Sender</th>
                  <th className="px-4 py-3 font-medium">Phone</th>
                  <th className="px-4 py-3 font-medium">Message</th>
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((m) => (
                  <tr
                    key={m.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    {/* Sender */}
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-800">{m.name}</p>
                      <p className="text-xs text-gray-400">{m.email}</p>
                    </td>

                    {/* Phone */}
                    <td className="px-4 py-3 text-gray-500">
                      {m.phone || "—"}
                    </td>

                    {/* Message preview */}
                    <td className="px-4 py-3 max-w-[240px]">
                      <p className="text-gray-600 line-clamp-2 text-xs leading-relaxed">
                        {m.message.length > 80
                          ? m.message.slice(0, 80) + "…"
                          : m.message}
                      </p>
                    </td>

                    {/* Date */}
                    <td className="px-4 py-3 text-gray-400 whitespace-nowrap">
                      {new Date(m.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                          m.isResolved
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {m.isResolved ? "Resolved" : "Pending"}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setViewMsg(m)}
                          className="flex items-center gap-1 px-2 py-1 text-xs text-gray-600 border border-gray-200 rounded hover:bg-gray-50 transition-colors"
                        >
                          <Eye className="w-3 h-3" />
                          View
                        </button>
                        {!m.isResolved && (
                          <button
                            onClick={() => markResolved(m.id)}
                            disabled={resolvingId === m.id}
                            className="flex items-center gap-1 px-2 py-1 text-xs text-green-700 border border-green-200 rounded hover:bg-green-50 disabled:opacity-60 transition-colors"
                          >
                            {resolvingId === m.id ? (
                              <RefreshCw className="w-3 h-3 animate-spin" />
                            ) : (
                              <CheckCircle className="w-3 h-3" />
                            )}
                            Resolve
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Detail Modal ──────────────────────────────────────────────────── */}
      {viewMsg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">
                Message Details
              </h3>
              <button
                onClick={() => setViewMsg(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="px-6 py-5 space-y-4">
              {/* Contact info */}
              <div className="flex flex-col gap-1.5">
                <p className="text-lg font-semibold text-gray-900">
                  {viewMsg.name}
                </p>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Mail className="w-4 h-4 flex-shrink-0" />
                  <a
                    href={`mailto:${viewMsg.email}`}
                    className="text-blue-600 hover:underline"
                  >
                    {viewMsg.email}
                  </a>
                </div>
                {viewMsg.phone && (
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Phone className="w-4 h-4 flex-shrink-0" />
                    {viewMsg.phone}
                  </div>
                )}
                <p className="text-xs text-gray-400">
                  Received:{" "}
                  {new Date(viewMsg.createdAt).toLocaleString("en-IN")}
                </p>
              </div>

              <div className="border-t border-gray-100 pt-4">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  Message
                </p>
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {viewMsg.message}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                    viewMsg.isResolved
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {viewMsg.isResolved ? "Resolved" : "Pending"}
                </span>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
              <a
                href={`mailto:${viewMsg.email}`}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-sm text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Mail className="w-4 h-4" />
                Reply via Email
              </a>
              <div className="flex gap-3">
                <button
                  onClick={() => setViewMsg(null)}
                  className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700"
                >
                  Close
                </button>
                {!viewMsg.isResolved && (
                  <button
                    onClick={() => markResolved(viewMsg.id)}
                    disabled={resolvingId === viewMsg.id}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-60 transition-colors"
                  >
                    {resolvingId === viewMsg.id ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <CheckCircle className="w-4 h-4" />
                    )}
                    Mark as Resolved
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
