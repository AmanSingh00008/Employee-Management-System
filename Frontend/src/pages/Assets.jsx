
import { useEffect, useMemo, useState } from "react";
import { fetchAssets } from "../services/workforceApi.js";
import { mapAsset } from "../utils/workforceMappers.js";
import {
  Plus,
  Search,
  Laptop,
  Monitor,
  Keyboard,
  Headphones,
  Smartphone,
  Package,
  CheckCircle2,
  UserRound,
  Wrench,
  Eye,
  Pencil,
  X,
  ChevronLeft,
  ChevronRight,
  Download,
  CalendarDays,
  Tag,
} from "lucide-react";

const categories = [
  "Laptop",
  "Monitor",
  "Keyboard",
  "Headphones",
  "Mobile",
  "Other",
];

const statuses = ["Available", "Assigned", "Maintenance", "Retired"];

const conditions = ["Good", "Fair", "Needs Repair"];

const departments = [
  "Engineering",
  "Marketing",
  "Sales",
  "Human Resources",
  "Finance",
  "Design",
  "Operations",
];

const emptyForm = {
  name: "",
  category: "Laptop",
  assetTag: "",
  serialNumber: "",
  assignedTo: "",
  department: "Engineering",
  purchaseDate: "",
  status: "Available",
  condition: "Good",
  notes: "",
};

function formatDate(date) {
  if (!date) return "—";

  return new Date(`${date}T00:00:00`).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getAssetIcon(category, size = 21) {
  const icons = {
    Laptop,
    Monitor,
    Keyboard,
    Headphones,
    Mobile: Smartphone,
    Other: Package,
  };

  const Icon = icons[category] || Package;
  return <Icon size={size} />;
}

function StatusBadge({ status }) {
  const styles = {
    Available: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    Assigned: "bg-blue-50 text-blue-700 ring-blue-200",
    Maintenance: "bg-amber-50 text-amber-700 ring-amber-200",
    Retired: "bg-gray-100 text-gray-600 ring-gray-200",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${
        styles[status] || "bg-gray-100 text-gray-600 ring-gray-200"
      }`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {status}
    </span>
  );
}

function SummaryCard({ title, value, subtitle, icon: Icon, color }) {
  const colors = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-emerald-50 text-emerald-600",
    amber: "bg-amber-50 text-amber-600",
    violet: "bg-violet-50 text-violet-600",
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900">
            {value}
          </p>
          <p className="mt-2 text-xs text-gray-500">{subtitle}</p>
        </div>
        <div className={`rounded-xl p-3 ${colors[color]}`}>
          <Icon size={21} />
        </div>
      </div>
    </div>
  );
}

function AssetModal({ asset, onClose, onSave }) {
  const [form, setForm] = useState(asset ? { ...asset } : { ...emptyForm });
  const [error, setError] = useState("");

  const inputClass =
    "mt-1.5 w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

  function updateField(field, value) {
    setForm((previous) => {
      const updated = { ...previous, [field]: value };

      if (field === "assignedTo" && value.trim()) {
        if (updated.status === "Available") updated.status = "Assigned";
      }

      if (field === "assignedTo" && !value.trim()) {
        if (updated.status === "Assigned") updated.status = "Available";
      }

      return updated;
    });
    setError("");
  }

  function handleSubmit(event) {
    event.preventDefault();

    if (form.status === "Assigned" && !form.assignedTo.trim()) {
      setError("Please enter the employee name for an assigned asset.");
      return;
    }

    if (form.status === "Available" && form.assignedTo.trim()) {
      setError("Remove the assigned employee or change the asset status.");
      return;
    }

    onSave(form);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/40 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              {asset ? "Edit Asset" : "Add New Asset"}
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Enter the equipment details below.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-gray-700">
                Asset name *
              </label>
              <input
                required
                value={form.name}
                onChange={(event) => updateField("name", event.target.value)}
                placeholder="e.g. Dell Latitude 5450"
                className={inputClass}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">
                Category *
              </label>
              <select
                value={form.category}
                onChange={(event) =>
                  updateField("category", event.target.value)
                }
                className={inputClass}
              >
                {categories.map((category) => (
                  <option key={category}>{category}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">
                Asset tag *
              </label>
              <input
                required
                value={form.assetTag}
                onChange={(event) =>
                  updateField("assetTag", event.target.value)
                }
                placeholder="e.g. AST-1011"
                className={inputClass}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">
                Serial number
              </label>
              <input
                value={form.serialNumber}
                onChange={(event) =>
                  updateField("serialNumber", event.target.value)
                }
                placeholder="Enter serial number"
                className={inputClass}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">
                Assigned employee
              </label>
              <input
                value={form.assignedTo}
                onChange={(event) =>
                  updateField("assignedTo", event.target.value)
                }
                placeholder="Leave empty if unassigned"
                className={inputClass}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">
                Department
              </label>
              <select
                value={form.department}
                onChange={(event) =>
                  updateField("department", event.target.value)
                }
                className={inputClass}
              >
                {departments.map((department) => (
                  <option key={department}>{department}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">
                Purchase date
              </label>
              <input
                type="date"
                value={form.purchaseDate}
                onChange={(event) =>
                  updateField("purchaseDate", event.target.value)
                }
                className={inputClass}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">
                Status
              </label>
              <select
                value={form.status}
                onChange={(event) => updateField("status", event.target.value)}
                className={inputClass}
              >
                {statuses.map((status) => (
                  <option key={status}>{status}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">
                Condition
              </label>
              <select
                value={form.condition}
                onChange={(event) =>
                  updateField("condition", event.target.value)
                }
                className={inputClass}
              >
                {conditions.map((condition) => (
                  <option key={condition}>{condition}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">
              Notes (optional)
            </label>
            <textarea
              rows={3}
              value={form.notes}
              onChange={(event) => updateField("notes", event.target.value)}
              placeholder="Add asset details or maintenance notes..."
              className={inputClass}
            />
          </div>

          {error && (
            <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Save Asset
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AssetDetails({ asset, onClose, onEdit }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/40 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 p-6">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              Asset Details
            </h2>
            <p className="mt-1 text-sm text-gray-500">{asset.assetTag}</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
            aria-label="Close details"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-5 p-6">
          <div className="flex items-center gap-4">
            <div className="rounded-2xl bg-blue-50 p-4 text-blue-600">
              {getAssetIcon(asset.category, 28)}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-lg font-bold text-gray-900">{asset.name}</h3>
              <p className="mt-1 text-sm text-gray-500">{asset.category}</p>
              <div className="mt-2">
                <StatusBadge status={asset.status} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              ["Asset tag", asset.assetTag],
              ["Serial number", asset.serialNumber || "—"],
              ["Department", asset.department],
              ["Condition", asset.condition],
              ["Purchase date", formatDate(asset.purchaseDate)],
              ["Assigned to", asset.assignedTo || "Unassigned"],
            ].map(([label, value]) => (
              <div key={label} className="rounded-xl bg-gray-50 p-3">
                <p className="text-xs text-gray-500">{label}</p>
                <p className="mt-1 break-words text-sm font-semibold text-gray-800">
                  {value}
                </p>
              </div>
            ))}
          </div>

          <div>
            <p className="text-sm font-semibold text-gray-700">Notes</p>
            <p className="mt-2 rounded-xl border border-gray-100 p-3 text-sm text-gray-600">
              {asset.notes || "No notes added."}
            </p>
          </div>

          <div className="flex gap-3 border-t border-gray-100 pt-4">
            <button
              onClick={onClose}
              className="flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              Close
            </button>
            <button
              onClick={() => onEdit(asset)}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
            >
              <Pencil size={16} />
              Edit Asset
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Assets() {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editingAsset, setEditingAsset] = useState(null);
  const [selectedAsset, setSelectedAsset] = useState(null);

  const pageSize = 6;

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      setLoadError("");
      try {
        const rows = await fetchAssets();
        if (!cancelled) {
          setAssets(rows.map(mapAsset));
        }
      } catch (err) {
        if (!cancelled) {
          setAssets([]);
          setLoadError(
            err.response?.data?.message || "Could not load assets from the server."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const summary = useMemo(
    () => ({
      total: assets.length,
      assigned: assets.filter((asset) => asset.status === "Assigned").length,
      available: assets.filter((asset) => asset.status === "Available").length,
      maintenance: assets.filter((asset) => asset.status === "Maintenance").length,
    }),
    [assets]
  );

  const filteredAssets = useMemo(() => {
    const query = search.trim().toLowerCase();

    return assets.filter((asset) => {
      const matchesSearch =
        asset.name.toLowerCase().includes(query) ||
        asset.assetTag.toLowerCase().includes(query) ||
        asset.assignedTo.toLowerCase().includes(query) ||
        asset.serialNumber.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "All" || asset.status === statusFilter;

      const matchesCategory =
        categoryFilter === "All" || asset.category === categoryFilter;

      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [assets, search, statusFilter, categoryFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredAssets.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);

  const visibleAssets = filteredAssets.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize
  );

  function changeFilter(setter, value) {
    setter(value);
    setCurrentPage(1);
  }

  function openAddModal() {
    setEditingAsset(null);
    setShowModal(true);
  }

  function openEditModal(asset) {
    setSelectedAsset(null);
    setEditingAsset(asset);
    setShowModal(true);
  }

  function saveAsset(form) {
    const duplicateTag = assets.some(
      (asset) =>
        asset.id !== editingAsset?.id &&
        asset.assetTag.trim().toLowerCase() ===
          form.assetTag.trim().toLowerCase()
    );

    if (duplicateTag) {
      window.alert("This asset tag already exists. Please use a unique tag.");
      return;
    }

    const savedAsset = {
      ...form,
      id: editingAsset?.id ?? Date.now(),
      name: form.name.trim(),
      assetTag: form.assetTag.trim(),
      serialNumber: form.serialNumber.trim(),
      assignedTo: form.assignedTo.trim(),
    };

    setAssets((previous) =>
      editingAsset
        ? previous.map((asset) =>
            asset.id === editingAsset.id ? savedAsset : asset
          )
        : [savedAsset, ...previous]
    );

    setCurrentPage(1);
    setSearch("");
    setStatusFilter("All");
    setCategoryFilter("All");
    setShowModal(false);
    setEditingAsset(null);
  }

  function exportCSV() {
    const headers = [
      "Asset Name",
      "Category",
      "Asset Tag",
      "Serial Number",
      "Assigned To",
      "Department",
      "Purchase Date",
      "Status",
      "Condition",
      "Notes",
    ];

    const rows = filteredAssets.map((asset) => [
      asset.name,
      asset.category,
      asset.assetTag,
      asset.serialNumber,
      asset.assignedTo,
      asset.department,
      asset.purchaseDate,
      asset.status,
      asset.condition,
      asset.notes,
    ]);

    const escapeCSV = (value) =>
      `"${String(value ?? "").replace(/"/g, '""')}"`;

    const csv = [headers, ...rows]
      .map((row) => row.map(escapeCSV).join(","))
      .join("\n");

    const blob = new Blob(["\uFEFF" + csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "workforcehub-assets.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="min-h-screen bg-gray-50/70 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {loadError && (
          <div role="alert" className="rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-800">
            {loadError}
          </div>
        )}

        {loading && !loadError && (
          <p className="text-sm text-gray-500">Loading assets from the server…</p>
        )}

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span>WorkforceHub</span>
              <span>/</span>
              <span className="text-gray-800">Assets</span>
            </div>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
              Asset Management
            </h1>
            <p className="mt-2 text-sm text-gray-500">
              Track company equipment, assignments and asset condition.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={exportCSV}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              <Download size={17} />
              Export CSV
            </button>
            <button
              onClick={openAddModal}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
            >
              <Plus size={18} />
              Add Asset
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard
            title="Total Assets"
            value={summary.total}
            subtitle="All company equipment"
            icon={Package}
            color="blue"
          />
          <SummaryCard
            title="Assigned"
            value={summary.assigned}
            subtitle="Currently in use"
            icon={UserRound}
            color="violet"
          />
          <SummaryCard
            title="Available"
            value={summary.available}
            subtitle="Ready for allocation"
            icon={CheckCircle2}
            color="green"
          />
          <SummaryCard
            title="Maintenance"
            value={summary.maintenance}
            subtitle="Needs attention"
            icon={Wrench}
            color="amber"
          />
        </div>

        <div className="rounded-2xl border border-blue-100 bg-blue-50/70 p-5">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-white p-3 text-blue-600">
              <Tag size={21} />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">
                Keep your asset register up to date
              </h2>
              <p className="mt-1 text-sm leading-6 text-gray-600">
                Use a unique asset tag for each item and update its assignment
                whenever equipment is issued, returned or sent for repair.
              </p>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-100 p-5 sm:p-6">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  Company Assets
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  View, assign and update company equipment.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="relative sm:w-64">
                  <Search
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    value={search}
                    onChange={(event) => {
                      setSearch(event.target.value);
                      setCurrentPage(1);
                    }}
                    placeholder="Search assets..."
                    className="w-full rounded-xl border border-gray-200 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <select
                  value={categoryFilter}
                  onChange={(event) =>
                    changeFilter(setCategoryFilter, event.target.value)
                  }
                  className="rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-blue-500 sm:w-40"
                >
                  <option value="All">All categories</option>
                  {categories.map((category) => (
                    <option key={category}>{category}</option>
                  ))}
                </select>

                <select
                  value={statusFilter}
                  onChange={(event) =>
                    changeFilter(setStatusFilter, event.target.value)
                  }
                  className="rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-blue-500 sm:w-40"
                >
                  <option value="All">All statuses</option>
                  {statuses.map((status) => (
                    <option key={status}>{status}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[950px] text-left">
              <thead className="bg-gray-50">
                <tr className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  <th className="px-6 py-4">Asset</th>
                  <th className="px-6 py-4">Asset Tag</th>
                  <th className="px-6 py-4">Assigned To</th>
                  <th className="px-6 py-4">Purchase Date</th>
                  <th className="px-6 py-4">Condition</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {visibleAssets.map((asset) => (
                  <tr
                    key={asset.id}
                    className="transition hover:bg-gray-50/70"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                          {getAssetIcon(asset.category)}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">
                            {asset.name}
                          </p>
                          <p className="mt-1 text-xs text-gray-500">
                            {asset.category} · {asset.department}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span className="rounded-lg bg-gray-100 px-2.5 py-1.5 font-mono text-xs font-semibold text-gray-700">
                        {asset.assetTag}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-gray-800">
                        {asset.assignedTo || "Unassigned"}
                      </p>
                    </td>

                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-2 text-sm text-gray-600">
                        <CalendarDays size={15} className="text-gray-400" />
                        {formatDate(asset.purchaseDate)}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`text-sm font-medium ${
                          asset.condition === "Needs Repair"
                            ? "text-rose-600"
                            : asset.condition === "Fair"
                              ? "text-amber-600"
                              : "text-gray-700"
                        }`}
                      >
                        {asset.condition}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <StatusBadge status={asset.status} />
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          title="View details"
                          onClick={() => setSelectedAsset(asset)}
                          className="rounded-lg border border-gray-200 p-2 text-gray-600 hover:bg-gray-100"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          title="Edit asset"
                          onClick={() => openEditModal(asset)}
                          className="rounded-lg border border-gray-200 p-2 text-blue-600 hover:bg-blue-50"
                        >
                          <Pencil size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {visibleAssets.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-16 text-center">
                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-500">
                        <Package size={22} />
                      </div>
                      <p className="mt-3 font-semibold text-gray-800">
                        No assets found
                      </p>
                      <p className="mt-1 text-sm text-gray-500">
                        Try changing your search or filters.
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col gap-3 border-t border-gray-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <p className="text-sm text-gray-500">
              Showing{" "}
              {filteredAssets.length === 0
                ? 0
                : (safePage - 1) * pageSize + 1}
              {"–"}
              {Math.min(safePage * pageSize, filteredAssets.length)} of{" "}
              {filteredAssets.length} assets
            </p>

            <div className="flex items-center gap-2">
              <button
                disabled={safePage <= 1}
                onClick={() => setCurrentPage(safePage - 1)}
                className="rounded-lg border border-gray-200 p-2 text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Previous page"
              >
                <ChevronLeft size={18} />
              </button>

              <span className="min-w-20 text-center text-sm font-medium text-gray-700">
                Page {safePage} of {totalPages}
              </span>

              <button
                disabled={safePage >= totalPages}
                onClick={() => setCurrentPage(safePage + 1)}
                className="rounded-lg border border-gray-200 p-2 text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Next page"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <AssetModal
          asset={editingAsset}
          onClose={() => {
            setShowModal(false);
            setEditingAsset(null);
          }}
          onSave={saveAsset}
        />
      )}

      {selectedAsset && (
        <AssetDetails
          asset={selectedAsset}
          onClose={() => setSelectedAsset(null)}
          onEdit={openEditModal}
        />
      )}
    </div>
  );
}
