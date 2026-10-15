
import { useEffect, useMemo, useState } from "react";
import { fetchEmployees } from "../services/workforceApi.js";
import { mapEmployee } from "../utils/workforceMappers.js";
import {
  Plus,
  Search,
  SlidersHorizontal,
  MoreHorizontal,
  Eye,
  Pencil,
  UserX,
  X,
  ChevronLeft,
  ChevronRight,
  Users,
  Mail,
  Building2,
  BriefcaseBusiness,
  CalendarDays,
} from "lucide-react";

const departments = [
  "Engineering",
  "Marketing",
  "Human Resources",
  "Sales",
  "Finance",
  "Design",
];

const emptyForm = {
  name: "",
  email: "",
  department: "Engineering",
  designation: "",
  status: "Active",
  joined: "",
  type: "Full-time",
};

const avatarColors = [
  "bg-indigo-100 text-indigo-700",
  "bg-pink-100 text-pink-700",
  "bg-sky-100 text-sky-700",
  "bg-emerald-100 text-emerald-700",
  "bg-amber-100 text-amber-700",
  "bg-violet-100 text-violet-700",
];

function StatusBadge({ status }) {
  const styles = {
    Active: "bg-emerald-50 text-emerald-700",
    "On Leave": "bg-amber-50 text-amber-700",
    Inactive: "bg-slate-100 text-slate-600",
  };

  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${styles[status]}`}>
      {status}
    </span>
  );
}

function EmployeeModal({ employee, onClose, onSave }) {
  const [form, setForm] = useState(employee || emptyForm);
  const [error, setError] = useState("");

  const updateField = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value });
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!form.name.trim() || !form.email.trim() || !form.designation.trim()) {
      setError("Please fill in the name, email and designation.");
      return;
    }

    const email = form.email.trim().toLowerCase();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    onSave({ ...form, name: form.name.trim(), email });
  };

  const inputClass =
    "mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100";

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
              {employee?.id ? "Edit Employee" : "Add Employee"}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Enter the employee's information below.
            </p>
          </div>

          <button type="button" onClick={onClose} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100" aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-medium text-slate-700">
              Full name *
              <input name="name" value={form.name} onChange={updateField} className={inputClass} placeholder="e.g. Aarav Sharma" />
            </label>

            <label className="text-sm font-medium text-slate-700">
              Work email *
              <input name="email" type="email" value={form.email} onChange={updateField} className={inputClass} placeholder="name@company.com" />
            </label>

            <label className="text-sm font-medium text-slate-700">
              Department
              <select name="department" value={form.department} onChange={updateField} className={inputClass}>
                {departments.map((department) => (
                  <option key={department}>{department}</option>
                ))}
              </select>
            </label>

            <label className="text-sm font-medium text-slate-700">
              Designation *
              <input name="designation" value={form.designation} onChange={updateField} className={inputClass} placeholder="e.g. Software Engineer" />
            </label>

            <label className="text-sm font-medium text-slate-700">
              Employment status
              <select name="status" value={form.status} onChange={updateField} className={inputClass}>
                <option>Active</option>
                <option>On Leave</option>
                <option>Inactive</option>
              </select>
            </label>

            <label className="text-sm font-medium text-slate-700">
              Employment type
              <select name="type" value={form.type} onChange={updateField} className={inputClass}>
                <option>Full-time</option>
                <option>Part-time</option>
                <option>Contract</option>
                <option>Intern</option>
              </select>
            </label>

            <label className="text-sm font-medium text-slate-700 sm:col-span-2">
              Joining date
              <input name="joined" type="date" value={form.joined} onChange={updateField} className={inputClass} />
            </label>
          </div>

          {error && (
            <p role="alert" className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
            <button type="button" onClick={onClose} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50">
              Cancel
            </button>
            <button type="submit" className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700">
              Save Employee
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function EmployeeDetails({ employee, onClose, onEdit }) {
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/40 p-4" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose();
    }}>
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 p-6">
          <h2 className="text-lg font-bold text-slate-900">Employee Profile</h2>
          <button type="button" onClick={onClose} aria-label="Close profile" className="rounded-lg p-2 text-slate-500 hover:bg-slate-100">
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-100 text-xl font-bold text-indigo-700">
              {employee.name.split(" ").map((part) => part[0]).slice(0, 2).join("").toUpperCase()}
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">{employee.name}</h3>
              <p className="mt-1 text-sm text-slate-500">{employee.designation}</p>
              <div className="mt-2"><StatusBadge status={employee.status} /></div>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <div className="flex items-center gap-3 text-sm">
              <Mail size={18} className="text-slate-400" />
              <span className="break-all text-slate-700">{employee.email}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Building2 size={18} className="text-slate-400" />
              <span className="text-slate-700">{employee.department}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <BriefcaseBusiness size={18} className="text-slate-400" />
              <span className="text-slate-700">{employee.type}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <CalendarDays size={18} className="text-slate-400" />
              <span className="text-slate-700">
                Joined {employee.joined || "Date not provided"}
              </span>
            </div>
          </div>

          <button type="button" onClick={() => onEdit(employee)} className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white hover:bg-indigo-700">
            <Pencil size={16} /> Edit Employee
          </button>
        </div>
      </div>
    </div>
  );
}

function Employees() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [search, setSearch] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("All Departments");
  const [statusFilter, setStatusFilter] = useState("All Statuses");
  const [currentPage, setCurrentPage] = useState(1);
  const [modalEmployee, setModalEmployee] = useState(null);
  const [viewEmployee, setViewEmployee] = useState(null);
  const [menuEmployeeId, setMenuEmployeeId] = useState(null);
  const [notice, setNotice] = useState("");

  const pageSize = 6;

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      setLoadError("");
      try {
        const rows = await fetchEmployees();
        if (!cancelled) {
          setEmployees(rows.map(mapEmployee));
        }
      } catch (err) {
        if (!cancelled) {
          setEmployees([]);
          setLoadError(
            err.response?.data?.message || "Could not load employees from the server."
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

  const filteredEmployees = useMemo(() => {
    const query = search.trim().toLowerCase();

    return employees.filter((employee) => {
      const matchesSearch =
        !query ||
        [employee.name, employee.email, employee.designation]
          .some((value) => value.toLowerCase().includes(query));

      const matchesDepartment =
        departmentFilter === "All Departments" ||
        employee.department === departmentFilter;

      const matchesStatus =
        statusFilter === "All Statuses" ||
        employee.status === statusFilter;

      return matchesSearch && matchesDepartment && matchesStatus;
    });
  }, [employees, search, departmentFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredEmployees.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const visibleEmployees = filteredEmployees.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize
  );

  const activeCount = employees.filter((employee) => employee.status === "Active").length;
  const inactiveCount = employees.filter((employee) => employee.status === "Inactive").length;

  const saveEmployee = (form) => {
    const duplicate = employees.some(
      (employee) =>
        employee.email.toLowerCase() === form.email.toLowerCase() &&
        employee.id !== form.id
    );

    if (duplicate) {
      setNotice("An employee with this email already exists.");
      return;
    }

    if (form.id) {
      setEmployees((current) =>
        current.map((employee) =>
          employee.id === form.id ? { ...employee, ...form } : employee
        )
      );
      setNotice("Employee updated successfully.");
    } else {
      setEmployees((current) => [
        { ...form, id: Date.now() },
        ...current,
      ]);
      setCurrentPage(1);
      setNotice("Employee added successfully.");
    }

    setModalEmployee(null);
  };

  const editEmployee = (employee) => {
    setViewEmployee(null);
    setModalEmployee(employee);
    setMenuEmployeeId(null);
  };

  const toggleEmployeeStatus = (employee) => {
    const nextStatus = employee.status === "Inactive" ? "Active" : "Inactive";

    setEmployees((current) =>
      current.map((item) =>
        item.id === employee.id ? { ...item, status: nextStatus } : item
      )
    );

    setMenuEmployeeId(null);
    setNotice(`${employee.name} is now ${nextStatus.toLowerCase()}.`);
  };

  const updateSearch = (value) => {
    setSearch(value);
    setCurrentPage(1);
  };

  const updateDepartment = (value) => {
    setDepartmentFilter(value);
    setCurrentPage(1);
  };

  const updateStatus = (value) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  const selectClass =
    "rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-600 outline-none focus:border-indigo-500";

  return (
    <div className="space-y-6" onClick={() => {
      if (menuEmployeeId !== null) setMenuEmployeeId(null);
    }}>
      <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-medium text-indigo-600">People directory</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Employees</h1>
          <p className="mt-2 text-sm text-slate-500">Manage your people, roles and employment information.</p>
        </div>

        <button type="button" onClick={() => {
          setNotice("");
          setModalEmployee(null);
        }} className="hidden" aria-hidden="true" />

        <button type="button" onClick={(event) => {
          event.stopPropagation();
          setNotice("");
          setModalEmployee({ ...emptyForm });
        }} className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700">
          <Plus size={18} /> Add Employee
        </button>
      </section>

      {loadError && (
        <div role="alert" className="rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          {loadError}
        </div>
      )}

      {loading && !loadError && (
        <p className="text-sm text-slate-500">Loading employees from the server…</p>
      )}

      {notice && (
        <div role="status" className="flex items-center justify-between gap-3 rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-3 text-sm text-indigo-800">
          <span>{notice}</span>
          <button type="button" onClick={() => setNotice("")} aria-label="Dismiss message">
            <X size={16} />
          </button>
        </div>
      )}

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-indigo-50 p-3 text-indigo-600"><Users size={21} /></div>
            <p className="text-sm font-medium text-slate-500">Total Employees</p>
          </div>
          <p className="mt-4 text-3xl font-bold text-slate-900">{employees.length}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600"><Users size={21} /></div>
            <p className="text-sm font-medium text-slate-500">Active Employees</p>
          </div>
          <p className="mt-4 text-3xl font-bold text-slate-900">{activeCount}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-slate-100 p-3 text-slate-600"><UserX size={21} /></div>
            <p className="text-sm font-medium text-slate-500">Inactive Employees</p>
          </div>
          <p className="mt-4 text-3xl font-bold text-slate-900">{inactiveCount}</p>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="flex flex-col gap-4 border-b border-slate-100 p-5 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-bold text-slate-900">All Employees</h2>
              <p className="mt-1 text-sm text-slate-500">{filteredEmployees.length} matching records</p>
            </div>
            <SlidersHorizontal size={20} className="text-slate-400" />
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[minmax(240px,1fr)_200px_170px]">
            <label className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 focus-within:border-indigo-500">
              <Search size={18} className="shrink-0 text-slate-400" />
              <input
                value={search}
                onChange={(event) => updateSearch(event.target.value)}
                placeholder="Search name, email, designation..."
                className="w-full py-2.5 text-sm outline-none placeholder:text-slate-400"
              />
            </label>

            <select value={departmentFilter} onChange={(event) => updateDepartment(event.target.value)} className={selectClass}>
              <option>All Departments</option>
              {departments.map((department) => <option key={department}>{department}</option>)}
            </select>

            <select value={statusFilter} onChange={(event) => updateStatus(event.target.value)} className={selectClass}>
              <option>All Statuses</option>
              <option>Active</option>
              <option>On Leave</option>
              <option>Inactive</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-left">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/70 text-xs uppercase tracking-wide text-slate-500">
                <th className="px-6 py-4 font-semibold">Employee</th>
                <th className="px-4 py-4 font-semibold">Department</th>
                <th className="px-4 py-4 font-semibold">Employment Type</th>
                <th className="px-4 py-4 font-semibold">Status</th>
                <th className="px-4 py-4 font-semibold">Joined Date</th>
                <th className="px-5 py-4 text-right font-semibold">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {visibleEmployees.map((employee, index) => (
                <tr key={employee.id} className="transition hover:bg-slate-50/70">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-bold ${avatarColors[index % avatarColors.length]}`}>
                        {employee.name.split(" ").map((part) => part[0]).slice(0, 2).join("").toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-800">{employee.name}</p>
                        <p className="mt-1 text-xs text-slate-500">{employee.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <p className="text-sm text-slate-700">{employee.department}</p>
                    <p className="mt-1 text-xs text-slate-400">{employee.designation}</p>
                  </td>
                  <td className="px-4 py-4 text-sm text-slate-600">{employee.type}</td>
                  <td className="px-4 py-4"><StatusBadge status={employee.status} /></td>
                  <td className="px-4 py-4 text-sm text-slate-500">{employee.joined || "—"}</td>
                  <td className="px-5 py-4 text-right">
                    <div className="relative inline-block" onClick={(event) => event.stopPropagation()}>
                      <button type="button" aria-label={`Actions for ${employee.name}`} onClick={() => setMenuEmployeeId(menuEmployeeId === employee.id ? null : employee.id)} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100">
                        <MoreHorizontal size={19} />
                      </button>

                      {menuEmployeeId === employee.id && (
                        <div className="absolute right-0 top-10 z-20 w-44 rounded-xl border border-slate-200 bg-white p-1.5 text-left shadow-xl">
                          <button type="button" onClick={() => {
                            setViewEmployee(employee);
                            setMenuEmployeeId(null);
                          }} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-50">
                            <Eye size={16} /> View profile
                          </button>
                          <button type="button" onClick={() => editEmployee(employee)} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-50">
                            <Pencil size={16} /> Edit employee
                          </button>
                          <button type="button" onClick={() => toggleEmployeeStatus(employee)} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-rose-600 hover:bg-rose-50">
                            <UserX size={16} /> {employee.status === "Inactive" ? "Reactivate" : "Deactivate"}
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}

              {visibleEmployees.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center">
                    <Users size={30} className="mx-auto text-slate-300" />
                    <p className="mt-3 font-semibold text-slate-700">No employees found</p>
                    <p className="mt-1 text-sm text-slate-500">Try another search or change the filters.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-3 border-t border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p className="text-sm text-slate-500">
            Showing {filteredEmployees.length === 0 ? 0 : (safePage - 1) * pageSize + 1}–{Math.min(safePage * pageSize, filteredEmployees.length)} of {filteredEmployees.length} employees
          </p>

          <div className="flex items-center gap-2">
            <button type="button" disabled={safePage === 1} onClick={() => setCurrentPage(safePage - 1)} className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40" aria-label="Previous page">
              <ChevronLeft size={18} />
            </button>
            <span className="px-2 text-sm font-medium text-slate-600">
              Page {safePage} of {totalPages}
            </span>
            <button type="button" disabled={safePage === totalPages} onClick={() => setCurrentPage(safePage + 1)} className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40" aria-label="Next page">
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </section>

      {modalEmployee && (
        <EmployeeModal
          key={modalEmployee.id || "new"}
          employee={modalEmployee}
          onClose={() => setModalEmployee(null)}
          onSave={saveEmployee}
        />
      )}

      {viewEmployee && (
        <EmployeeDetails
          employee={viewEmployee}
          onClose={() => setViewEmployee(null)}
          onEdit={editEmployee}
        />
      )}
    </div>
  );
}

export default Employees;
