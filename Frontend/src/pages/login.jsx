
import { useState } from "react";
import {
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  Users,
} from "lucide-react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/authContext.jsx";

function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({
    email: "",
    password: "",
    loginAs: "employee",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (user) return <Navigate to="/" replace />;

  const inputClass =
    "w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm text-slate-900 caret-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100";
  const roleSelectClass =
    "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100";

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await login(form);
      const destination = location.state?.from?.pathname || "/";
      navigate(destination, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Unable to log in.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-white">
      <div className="relative hidden flex-1 flex-col justify-between overflow-hidden bg-indigo-700 p-12 text-white lg:flex">
        <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-indigo-500/40 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-violet-400/30 blur-3xl" />

        <Link to="/login" className="relative flex items-center gap-3">
          <div className="rounded-xl bg-white/15 p-3">
            <Users size={25} />
          </div>
          <span className="text-xl font-bold">WorkforceHub</span>
        </Link>

        <div className="relative max-w-xl">
          <span className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-200">
            People. Productivity. Progress.
          </span>
          <h1 className="mt-5 text-5xl font-bold leading-tight">
            Your workforce,
            <br />
            all in one place.
          </h1>
          <p className="mt-6 max-w-md text-base leading-7 text-indigo-100">
            Manage employees, attendance, leave requests and workplace
            resources from one organized dashboard.
          </p>

          <div className="mt-10 flex flex-wrap gap-3">
            {["Employee management", "Attendance tracking", "HR reports"].map(
              (item) => (
                <span
                  key={item}
                  className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm"
                >
                  {item}
                </span>
              )
            )}
          </div>
        </div>

        <p className="relative text-sm text-indigo-200">
          © {new Date().getFullYear()} WorkforceHub
        </p>
      </div>

      <div className="flex w-full items-center justify-center px-5 py-12 sm:px-10 lg:w-[520px] lg:flex-none">
        <div className="w-full max-w-md">
          <Link to="/login" className="mb-10 flex items-center gap-3 lg:hidden">
            <div className="rounded-xl bg-indigo-600 p-3 text-white">
              <Users size={23} />
            </div>
            <span className="text-xl font-bold text-slate-900">
              WorkforceHub
            </span>
          </Link>

          <div className="mb-8">
            <div className="mb-5 inline-flex rounded-xl bg-indigo-50 p-3 text-indigo-600">
              <LockKeyhole size={24} />
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">
              Welcome back
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Sign in to access your workforce dashboard.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Sign in as
              </label>
              <select
                required
                value={form.loginAs}
                onChange={(event) =>
                  setForm({ ...form, loginAs: event.target.value })
                }
                className={roleSelectClass}
              >
                <option value="employee">Employee</option>
                <option value="manager">Manager</option>
                <option value="admin">Admin / HR</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Email address
              </label>
              <div className="relative">
                <Mail
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="email"
                  autoComplete="email"
                  required
                  value={form.email}
                  onChange={(event) =>
                    setForm({ ...form, email: event.target.value })
                  }
                  placeholder="you@company.com"
                  className={inputClass}
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Password
              </label>
              <div className="relative">
                <LockKeyhole
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={form.password}
                  onChange={(event) =>
                    setForm({ ...form, password: event.target.value })
                  }
                  placeholder="Enter your password"
                  className={`${inputClass} pr-12`}
                />
                <button
                  type="button"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowPassword((value) => !value)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-400 hover:text-slate-700"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <p role="alert" className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:opacity-60"
            >
              {submitting ? "Signing in..." : "Sign in"}
              <ArrowRight size={18} />
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-slate-500">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="font-semibold text-indigo-600 hover:text-indigo-700"
            >
              Create account
            </Link>
          </p>

          <p className="mt-8 text-center text-xs leading-5 text-slate-400">
            Do not use real or sensitive credentials in test environments.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
