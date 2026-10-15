
import { useMemo, useState } from "react";
import {
  Plus,
  Search,
  Building2,
  Users,
  UserRound,
  MoreHorizontal,
  Pencil,
  Power,
  X,
  ChevronLeft,
  ChevronRight,
  BriefcaseBusiness,
  Code2,
  Megaphone,
  Calculator,
  Headset,
  Palette,
  Check,
} from "lucide-react";

const initialDepartments = [
  {
    id: 1,
    name: "Engineering",
    code: "ENG",
    description: "Software development, infrastructure and engineering.",
    head: "Aarav Sharma",
    headEmail: "aarav@workforcehub.com",
    employeeCount: 82,
    status: "Active",
  },
  {
    id: 2,
    name: "Marketing",
    code: "MKT",
    description: "Brand strategy, campaigns and marketing operations.",
    head: "Priya Patel",
    headEmail: "priya@workforcehub.com",
    employeeCount: 38,
    status: "Active",
  },
  {
    id: 3,
    name: "Sales",
    code: "SAL",
    description: "Customer acquisition, sales and business development.",
    head: "Ishaan Gupta",
    headEmail: "ishaan@workforcehub.com",
    employeeCount: 54,
    status: "Active",
  },
  {
    id: 4,
    name: "Human Resources",
    code: "HR",
    description: "Employee relations, hiring and people operations.",
    head: "Ananya Singh",
    headEmail: "ananya@workforcehub.com",
    employeeCount: 16,
    status: "Active",
  },
  {
    id: 5,
    name: "Finance",
    code: "FIN",
    description: "Financial planning, accounting and reporting.",
    head: "Meera Joshi",
    headEmail: "meera@workforcehub.com",
    employeeCount: 29,
    status: "Active",
  },
  {
    id: 6,
    name: "Design",
    code: "DSN",
    description: "Product design, user experience and visual design.",
    head: "Riya Kapoor",
    headEmail: "riya@workforcehub.com",
    employeeCount: 18,
    status: "Active",
  },
  {
    id: 7,
    name: "Operations",
    code: "OPS",
    description: "Internal operations and business processes.",
    head: "Dev Shah",
    headEmail: "dev@workforcehub.com",
    employeeCount: 11,
    status: "Inactive",
  },
];

const employees = [
  { name: "Aarav Sharma", email: "aarav@workforcehub.com" },
  { name: "Priya Patel", email: "priya@workforcehub.com" },
  { name: "Ishaan Gupta", email: "ishaan@workforcehub.com" },
  { name: "Ananya Singh", email: "ananya@workforcehub.com" },
  { name: "Meera Joshi", email: "meera@workforcehub.com" },
  { name: "Riya Kapoor", email: "riya@workforcehub.com" },
  { name: "Dev Shah", email: "dev@workforcehub.com" },
  { name: "Rohan Verma", email: "rohan@workforcehub.com" },
];

const emptyForm = {
  name: "",
  code: "",
  description: "",
  head: "",
  status: "Active",
};

const departmentStyles = [
  { icon: Code2, style: "bg-indigo-50 text-indigo-600" },
  { icon: Megaphone, style: "bg-pink-50 text-pink-600" },
  { icon: BriefcaseBusiness, style: "bg-sky-50 text-sky-600" },
  { icon: Users, style: "bg-emerald-50 text-emerald-600" },
  { icon: Calculator, style: "bg-amber-50 text-amber-600" },
  { icon: Palette, style: "bg-violet-50 text-violet-600" },
  { icon: Headset, style: "bg-orange-50 text-orange-600" },
];

function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
        status === "Active"
          ? "bg-emerald-50 text-emerald-700"
          : "bg-slate-100 text-slate-600"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          status === "Active" ? "bg-emerald-500" : "bg-slate-400"
        }`}
      />
      {status}
    </span>
  );
}

function DepartmentModal({ department, onClose, onSave, departments }) {
  const [form, setForm] = useState(department || emptyForm);
  const [error, setError] = useState("");

  const inputClass =
    "mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100";

  const updateField = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: name === "code" ? value.toUpperCase().replace(/\s/g, "") : value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!form.name.trim() || !form.code.trim()) {
      setError("Department name and code are required.");
      return;
    }

    const duplicateName = departments.some(
      (item) =>
        item.name.toLowerCase() === form.name.trim().toLowerCase() &&
        item.id !== form.id
    );

    const duplicateCode = departments.some(
      (item) =>
        item.code.toLowerCase() === form.code.trim().toLowerCase() &&
        item.id !== form.id
    );

    if (duplicateName) {
      setError("A department with this name already exists.");
      return;
    }

    if (duplicateCode) {
      setError("This department code is already in use.");
      return;
    }

    onSave({
      ...form,
      name: form.name.trim(),
      code: form.code.trim().toUpperCase(),
      description: form.description.trim(),
    });
  };

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/40 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              {department?.id ? "Edit Department" : "Create Department"}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Configure the department details and leadership.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 p-6">
          <label className="block text-sm font-medium text-slate-700">
            Department name *
            <input
              name="name"
              value={form.name}
              onChange={updateField}
              placeholder="e.g. Engineering"
              className={inputClass}
            />
          </label>

          <label className="block text-sm font-medium text-slate-700">
            Department code *
            <input
              name="code"
              value={form.code}
              onChange={updateField}
              placeholder="e.g. ENG"
              maxLength={10}
              className={inputClass}
            />
          </label>

          <label className="block text-sm font-medium text-slate-700">
            Description
            <textarea
              name="description"
              value={form.description}
              onChange={updateField}
              rows={3}
              placeholder="What does this department do?"
              className={`${inputClass} resize-y`}
            />
          </label>

          <label className="block text-sm font-medium text-slate-700">
            Department head
            <select
              name="head"
              value={form.head || ""}
              onChange={updateField}
              className={inputClass}
            >
              <option value="">Not assigned</option>
              {employees.map((employee) => (
                <option key={employee.email} value={employee.name}>
                  {employee.name}
                </option>
              ))}
            </select>
          </label>

          <label className="block text-sm font-medium text-slate-700">
            Status
            <select
              name="status"
              value={form.status || "Active"}
              onChange={updateField}
              className={inputClass}
            >
              <option>Active</option>
              <option>Inactive</option>
            </select>
          </label>

          {error && (
            <p
              role="alert"
              className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700"
            >
              {error}
            </p>
          )}

          <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
            >
              Save Department
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DepartmentDetails({ department, onClose, onEdit }) {
  const index = Math.max(
    0,
    initialDepartments.findIndex((item) => item.id === department.id)
  );
  const Icon = departmentStyles[index % departmentStyles.length].icon;
  const style = departmentStyles[index % departmentStyles.length].style;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/40 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 p-6">
          <h2 className="text-lg font-bold text-slate-900">
            Department Details
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close details"
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          <div className="flex items-center gap-4">
            <div className={`rounded-2xl p-4 ${style}`}>
              <Icon size={28} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">
                {department.name}
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Department code: {department.code}
              </p>
              <div className="mt-2">
                <StatusBadge status={department.status} />
              </div>
            </div>
          </div>

          <p className="mt-5 text-sm leading-6 text-slate-600">
            {department.description || "No description has been added."}
          </p>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-slate-50 p-4">
              <Users size={20} className="text-indigo-600" />
              <p className="mt-3 text-2xl font-bold text-slate-900">
                {department.employeeCount}
              </p>
              <p className="mt-1 text-xs text-slate-500">Employees</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-4">
              <UserRound size={20} className="text-indigo-600" />
              <p className="mt-3 text-base font-bold text-slate-900">
                {department.head || "Unassigned"}
              </p>
              <p className="mt-1 text-xs text-slate-500">Department head</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onEdit(department)}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            <Pencil size={16} /> Edit Department
          </button>
        </div>
      </div>
    </div>
  );
}

function Departments() {
  const [departments, setDepartments] = useState(initialDepartments);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Statuses");
  const [currentPage, setCurrentPage] = useState(1);
  const [modalDepartment, setModalDepartment] = useState(null);
  const [viewDepartment, setViewDepartment] = useState(null);
  const [menuDepartmentId, setMenuDepartmentId] = useState(null);
  const [notice, setNotice] = useState("");

  const pageSize = 6;

  const filteredDepartments = useMemo(() => {
    const query = search.trim().toLowerCase();

    return departments.filter((department) => {
      const matchesSearch =
        !query ||
        [department.name, department.code, department.head || ""].some(
          (value) => value.toLowerCase().includes(query)
        );

      const matchesStatus =
        statusFilter === "All Statuses" ||
        department.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [departments, search, statusFilter]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredDepartments.length / pageSize)
  );
  const safePage = Math.min(currentPage, totalPages);
  const visibleDepartments = filteredDepartments.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize
  );

  const activeCount = departments.filter(
    (department) => department.status === "Active"
  ).length;
  const totalEmployees = departments
    .filter((department) => department.status === "Active")
    .reduce((total, department) => total + department.employeeCount, 0);

  const saveDepartment = (form) => {
    if (form.id) {
      setDepartments((current) =>
        current.map((department) =>
          department.id === form.id ? { ...department, ...form } : department
        )
      );
      setNotice("Department updated successfully.");
    } else {
      setDepartments((current) => [
        {
          ...form,
          id: Date.now(),
          employeeCount: 0,
          headEmail:
            employees.find((employee) => employee.name === form.head)?.email ||
            "",
        },
        ...current,
      ]);
      setCurrentPage(1);
      setNotice("Department created successfully.");
    }

    setModalDepartment(null);
  };

  const editDepartment = (department) => {
    setViewDepartment(null);
    setMenuDepartmentId(null);
    setModalDepartment(department);
  };

  const toggleDepartmentStatus = (department) => {
    const nextStatus =
      department.status === "Active" ? "Inactive" : "Active";

    setDepartments((current) =>
      current.map((item) =>
        item.id === department.id ? { ...item, status: nextStatus } : item
      )
    );

    setMenuDepartmentId(null);
    setNotice(`${department.name} is now ${nextStatus.toLowerCase()}.`);
  };

  const inputClass =
    "rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-600 outline-none focus:border-indigo-500";

  return (
    <div
      className="space-y-6"
      onClick={() => {
        if (menuDepartmentId !== null) setMenuDepartmentId(null);
      }}
    >
      <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-medium text-indigo-600">
            Organization structure
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Departments
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Organize teams, assign department heads and manage departments.
          </p>
        </div>

        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            setNotice("");
            setModalDepartment({ ...emptyForm });
          }}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700"
        >
          <Plus size={18} /> Add Department
        </button>
      </section>

      {notice && (
        <div
          role="status"
          className="flex items-center justify-between gap-3 rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-3 text-sm text-indigo-800"
        >
          <span>{notice}</span>
          <button
            type="button"
            onClick={() => setNotice("")}
            aria-label="Dismiss message"
          >
            <X size={16} />
          </button>
        </div>
      )}

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-indigo-50 p-3 text-indigo-600">
              <Building2 size={21} />
            </div>
            <p className="text-sm font-medium text-slate-500">
              Total Departments
            </p>
          </div>
          <p className="mt-4 text-3xl font-bold text-slate-900">
            {departments.length}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600">
              <Check size={21} />
            </div>
            <p className="text-sm font-medium text-slate-500">
              Active Departments
            </p>
          </div>
          <p className="mt-4 text-3xl font-bold text-slate-900">
            {activeCount}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-sky-50 p-3 text-sky-600">
              <Users size={21} />
            </div>
            <p className="text-sm font-medium text-slate-500">
              Employees in Active Departments
            </p>
          </div>
          <p className="mt-4 text-3xl font-bold text-slate-900">
            {totalEmployees}
          </p>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {visibleDepartments.map((department) => {
          const originalIndex = initialDepartments.findIndex(
            (item) => item.id === department.id
          );
          const styleIndex =
            originalIndex >= 0
              ? originalIndex
              : departments.findIndex((item) => item.id === department.id);
          const { icon: Icon, style } =
            departmentStyles[styleIndex % departmentStyles.length];

          return (
            <article
              key={department.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-3">
                <div className={`rounded-xl p-3 ${style}`}>
                  <Icon size={23} />
                </div>

                <div
                  className="relative"
                  onClick={(event) => event.stopPropagation()}
                >
                  <button
                    type="button"
                    aria-label={`Actions for ${department.name}`}
                    onClick={() =>
                      setMenuDepartmentId(
                        menuDepartmentId === department.id
                          ? null
                          : department.id
                      )
                    }
                    className="rounded-lg p-2 text-slate-400 hover:bg-slate-50"
                  >
                    <MoreHorizontal size={20} />
                  </button>

                  {menuDepartmentId === department.id && (
                    <div className="absolute right-0 top-10 z-20 w-44 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl">
                      <button
                        type="button"
                        onClick={() => {
                          setViewDepartment(department);
                          setMenuDepartmentId(null);
                        }}
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-50"
                      >
                        <Building2 size={16} /> View details
                      </button>
                      <button
                        type="button"
                        onClick={() => editDepartment(department)}
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-50"
                      >
                        <Pencil size={16} /> Edit department
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleDepartmentStatus(department)}
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-rose-600 hover:bg-rose-50"
                      >
                        <Power size={16} />
                        {department.status === "Active"
                          ? "Deactivate"
                          : "Activate"}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4 flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    {department.name}
                  </h2>
                  <p className="mt-1 text-xs font-medium tracking-wider text-slate-400">
                    {department.code}
                  </p>
                </div>
                <StatusBadge status={department.status} />
              </div>

              <p className="mt-3 min-h-10 text-sm leading-5 text-slate-500">
                {department.description || "No description provided."}
              </p>

              <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                <div className="flex min-w-0 items-center gap-2.5">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-600">
                    {department.head
                      ? department.head
                          .split(" ")
                          .map((part) => part[0])
                          .slice(0, 2)
                          .join("")
                          .toUpperCase()
                      : "—"}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-slate-400">Department head</p>
                    <p className="truncate text-sm font-semibold text-slate-700">
                      {department.head || "Not assigned"}
                    </p>
                  </div>
                </div>

                <div className="shrink-0 text-right">
                  <p className="text-xl font-bold text-slate-900">
                    {department.employeeCount}
                  </p>
                  <p className="text-xs text-slate-400">Employees</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setViewDepartment(department)}
                className="mt-4 w-full rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-600 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
              >
                View department
              </button>
            </article>
          );
        })}
      </section>

      {visibleDepartments.length === 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center">
          <Building2 size={32} className="mx-auto text-slate-300" />
          <p className="mt-3 font-semibold text-slate-800">
            No departments found
          </p>
          <p className="mt-1 text-sm text-slate-500">
            Try a different search or status filter.
          </p>
        </div>
      )}

      <section className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Search size={16} />
          <input
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search departments, codes or heads..."
            className="w-full min-w-0 bg-transparent outline-none placeholder:text-slate-400 sm:w-64"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={statusFilter}
            onChange={(event) => {
              setStatusFilter(event.target.value);
              setCurrentPage(1);
            }}
            className={inputClass}
          >
            <option>All Statuses</option>
            <option>Active</option>
            <option>Inactive</option>
          </select>

          <span className="text-sm text-slate-500">
            {filteredDepartments.length} departments
          </span>

          <button
            type="button"
            disabled={safePage === 1}
            onClick={() => setCurrentPage(safePage - 1)}
            aria-label="Previous page"
            className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 disabled:opacity-40"
          >
            <ChevronLeft size={18} />
          </button>
          <span className="text-sm text-slate-600">
            {safePage}/{totalPages}
          </span>
          <button
            type="button"
            disabled={safePage === totalPages}
            onClick={() => setCurrentPage(safePage + 1)}
            aria-label="Next page"
            className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 disabled:opacity-40"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </section>

      {modalDepartment && (
        <DepartmentModal
          key={modalDepartment.id || "new"}
          department={modalDepartment}
          departments={departments}
          onClose={() => setModalDepartment(null)}
          onSave={saveDepartment}
        />
      )}

      {viewDepartment && (
        <DepartmentDetails
          department={viewDepartment}
          onClose={() => setViewDepartment(null)}
          onEdit={editDepartment}
        />
      )}
    </div>
  );
}

export default Departments;