
import { useState } from "react";
import {
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  UserRound,
  Users,
} from "lucide-react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/authContext.jsx";

function Register() {
  const { user, register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  if (user) return <Navigate to="/" replace />;

  const inputClass =
    "w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100";

  const handleSubmit = (event) => {
    event.preventDefault();
    setError("");

    if (form.password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      register({
        fullName: form.fullName,
        email: form.email,
        password: form.password,
      });
      navigate("/", { replace: true });
    } catch (err) {
      setError(err.message || "Unable to create account.");
    }
  };

  return (
    <div className="flex min-h-screen bg-white">
      <div className="relative hidden flex-1 flex-col justify-between overflow-hidden bg-indigo-700 p-12 text-white lg:flex">
        <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-indigo-500/40 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-violet-400/30 blur-3xl" />

        <Link to="/register" className="relative flex items-center gap-3">
          <div className="rounded-xl bg-white/15 p-3">
            <Users size={25} />
          </div>
          <span className="text-xl font-bold">WorkforceHub</span>
        </Link>

        <div className="relative max-w-xl">
          <span className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-200">
            Build a better workplace
          </span>
          <h1 className="mt-5 text-5xl font-bold leading-tight">
            Simplify HR.
            <br />
            Empower people.
          </h1>
          <p className="mt-6 max-w-md text-base leading-7 text-indigo-100">
            Bring your employee records, attendance, leave management and
            workplace reports together.
          </p>
        </div>

        <p className="relative text-sm text-indigo-200">
          © {new Date().getFullYear()} WorkforceHub
        </p>
      </div>

      <div className="flex w-full items-center justify-center px-5 py-12 sm:px-10 lg:w-[520px] lg:flex-none">
        <div className="w-full max-w-md">
          <Link to="/register" className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="rounded-xl bg-indigo-600 p-3 text-white">
              <Users size={23} />
            </div>
            <span className="text-xl font-bold text-slate-900">
              WorkforceHub
            </span>
          </Link>

          <div className="mb-7">
            <div className="mb-5 inline-flex rounded-xl bg-indigo-50 p-3 text-indigo-600">
              <UserRound size={24} />
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">
              Create an account
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Get started with your WorkforceHub workspace.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Full name
              </label>
              <div className="relative">
                <UserRound
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  required
                  autoComplete="name"
                  value={form.fullName}
                  onChange={(event) =>
                    setForm({ ...form, fullName: event.target.value })
                  }
                  placeholder="Your full name"
                  className={inputClass}
                />
              </div>
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
                  required
                  autoComplete="email"
                  value={form.email}
                  onChange={(event) =>
                    setForm({ ...form, email: event.target.value })
                  }
                  placeholder="you@company.com"
                  className={inputClass}
                />
              </div>
            </div>

            {[
              {
                key: "password",
                label: "Password",
                placeholder: "At least 8 characters",
              },
              {
                key: "confirmPassword",
                label: "Confirm password",
                placeholder: "Re-enter your password",
              },
            ].map((field) => (
              <div key={field.key}>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  {field.label}
                </label>
                <div className="relative">
                  <LockKeyhole
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={8}
                    autoComplete={
                      field.key === "password"
                        ? "new-password"
                        : "new-password"
                    }
                    value={form[field.key]}
                    onChange={(event) =>
                      setForm({ ...form, [field.key]: event.target.value })
                    }
                    placeholder={field.placeholder}
                    className={`${inputClass} pr-12`}
                  />
                  {field.key === "password" && (
                    <button
                      type="button"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      onClick={() => setShowPassword((value) => !value)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-400 hover:text-slate-700"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  )}
                </div>
              </div>
            ))}

            {error && (
              <p role="alert" className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700">
                {error}
              </p>
            )}

            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
            >
              Create account
              <ArrowRight size={18} />
            </button>
          </form>

          <p className="mt-7 text-center text-sm text-slate-500">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-semibold text-indigo-600 hover:text-indigo-700"
            >
              Sign in
            </Link>
          </p>

          <p className="mt-7 text-center text-xs leading-5 text-slate-400">
            Demo registration only. Do not enter real or sensitive credentials.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;
