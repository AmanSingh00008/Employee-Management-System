
import { useEffect, useState } from "react";
import {
  Bell,
  Building2,
  Check,
  Eye,
  EyeOff,
  LockKeyhole,
  Palette,
  Save,
  Settings as SettingsIcon,
  ShieldCheck,
  UserRound,
} from "lucide-react";

const initialSettings = {
  profile: {
    fullName: "Admin User",
    email: "admin@workforcehub.com",
    jobTitle: "HR Administrator",
    phone: "",
  },
  company: {
    name: "WorkforceHub Inc.",
    email: "hr@workforcehub.com",
    phone: "",
    address: "",
  },
  appearance: {
    theme: "light",
    compact: false,
  },
  notifications: {
    leaveRequests: true,
    attendanceAlerts: true,
    employeeUpdates: true,
    weeklyReports: false,
    emailNotifications: true,
  },
};

const navigation = [
  { id: "profile", label: "My Profile", icon: UserRound },
  { id: "company", label: "Company", icon: Building2 },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "security", label: "Security", icon: ShieldCheck },
];

function Settings() {
  const [activeTab, setActiveTab] = useState("profile");
  const [settings, setSettings] = useState(() => ({
    ...initialSettings,
    appearance: {
      ...initialSettings.appearance,
      theme: localStorage.getItem("workforcehub-theme") || "light",
    },
  }));
  const [savedMessage, setSavedMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [passwords, setPasswords] = useState({
    current: "",
    next: "",
    confirm: "",
  });

  useEffect(() => {
    const isDark = settings.appearance.theme === "dark";
    document.documentElement.classList.toggle("dark", isDark);
    document.documentElement.style.colorScheme = isDark ? "dark" : "light";
    localStorage.setItem("workforcehub-theme", settings.appearance.theme);
  }, [settings.appearance.theme]);

  const updateField = (section, field, value) => {
    setSettings((previous) => ({
      ...previous,
      [section]: {
        ...previous[section],
        [field]: value,
      },
    }));
    setSavedMessage("");
  };

  const handleSave = (event) => {
    event.preventDefault();
    setSavedMessage("Settings saved successfully.");
  };

  const handlePasswordSave = (event) => {
    event.preventDefault();

    if (!passwords.current || !passwords.next || !passwords.confirm) {
      setSavedMessage("Please fill in all password fields.");
      return;
    }

    if (passwords.next.length < 8) {
      setSavedMessage("New password must contain at least 8 characters.");
      return;
    }

    if (passwords.next !== passwords.confirm) {
      setSavedMessage("New password and confirmation do not match.");
      return;
    }

    setSavedMessage(
      "Password form validated. Connect the backend to update your password."
    );
  };

  const inputClass =
    "mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100";

  const labelClass = "block text-sm font-medium text-slate-700";

  return (
    <div className="min-h-screen space-y-6 bg-slate-50 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <SettingsIcon size={17} />
          <span>WorkforceHub / Settings</span>
        </div>

        <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Settings
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Manage your account, company preferences, and notifications.
        </p>
      </div>

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[250px_minmax(0,1fr)]">
        {/* Sidebar navigation */}
        <aside className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
          <div className="border-b border-slate-100 px-3 py-4">
            <p className="font-semibold text-slate-900">General Settings</p>
            <p className="mt-1 text-xs text-slate-500">
              Customize your workspace
            </p>
          </div>

          <nav className="mt-3 space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setActiveTab(item.id);
                    setSavedMessage("");
                  }}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium transition ${
                    isActive
                      ? "bg-indigo-50 text-indigo-700"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <Icon size={18} />
                  {item.label}
                </button>
              );
            })}
          </nav>

          <div className="mt-4 rounded-xl bg-slate-50 p-4">
            <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
              <LockKeyhole size={16} className="text-indigo-600" />
              Account security
            </div>
            <p className="mt-2 text-xs leading-5 text-slate-500">
              Keep your account details up to date and use a strong password.
            </p>
          </div>
        </aside>

        {/* Settings content */}
        <main className="min-w-0 space-y-6">
          <form
            onSubmit={handleSave}
            className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
          >
            {/* Profile */}
            {activeTab === "profile" && (
              <>
                <SectionHeader
                  icon={UserRound}
                  title="My Profile"
                  description="Update your personal and contact information."
                />

                <div className="space-y-6 p-5 sm:p-6">
                  <div className="flex items-center gap-4 rounded-xl bg-slate-50 p-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-600 text-xl font-bold text-white">
                      {settings.profile.fullName
                        .split(" ")
                        .filter(Boolean)
                        .map((part) => part[0])
                        .join("")
                        .slice(0, 2)
                        .toUpperCase() || "AU"}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">
                        {settings.profile.fullName || "Your name"}
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        {settings.profile.jobTitle || "Your job title"}
                      </p>
                      <p className="mt-1 text-xs text-slate-400">
                        Profile avatar preview
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <Field
                      label="Full name"
                      value={settings.profile.fullName}
                      onChange={(value) =>
                        updateField("profile", "fullName", value)
                      }
                      className={inputClass}
                      labelClass={labelClass}
                      required
                    />

                    <Field
                      label="Email address"
                      type="email"
                      value={settings.profile.email}
                      onChange={(value) =>
                        updateField("profile", "email", value)
                      }
                      className={inputClass}
                      labelClass={labelClass}
                      required
                    />

                    <Field
                      label="Job title"
                      value={settings.profile.jobTitle}
                      onChange={(value) =>
                        updateField("profile", "jobTitle", value)
                      }
                      className={inputClass}
                      labelClass={labelClass}
                    />

                    <Field
                      label="Phone number"
                      type="tel"
                      value={settings.profile.phone}
                      onChange={(value) =>
                        updateField("profile", "phone", value)
                      }
                      className={inputClass}
                      labelClass={labelClass}
                      placeholder="Enter phone number"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Company */}
            {activeTab === "company" && (
              <>
                <SectionHeader
                  icon={Building2}
                  title="Company Details"
                  description="Manage the company information displayed in your workspace."
                />

                <div className="grid grid-cols-1 gap-5 p-5 sm:grid-cols-2 sm:p-6">
                  <Field
                    label="Company name"
                    value={settings.company.name}
                    onChange={(value) =>
                      updateField("company", "name", value)
                    }
                    className={inputClass}
                    labelClass={labelClass}
                    required
                  />

                  <Field
                    label="Company email"
                    type="email"
                    value={settings.company.email}
                    onChange={(value) =>
                      updateField("company", "email", value)
                    }
                    className={inputClass}
                    labelClass={labelClass}
                    required
                  />

                  <Field
                    label="Contact number"
                    type="tel"
                    value={settings.company.phone}
                    onChange={(value) =>
                      updateField("company", "phone", value)
                    }
                    className={inputClass}
                    labelClass={labelClass}
                    placeholder="Enter contact number"
                  />

                  <Field
                    label="Office address"
                    value={settings.company.address}
                    onChange={(value) =>
                      updateField("company", "address", value)
                    }
                    className={inputClass}
                    labelClass={labelClass}
                    placeholder="Enter office address"
                  />
                </div>
              </>
            )}

            {/* Notifications */}
            {activeTab === "notifications" && (
              <>
                <SectionHeader
                  icon={Bell}
                  title="Notification Preferences"
                  description="Choose which updates you want to receive."
                />

                <div className="divide-y divide-slate-100 px-5 sm:px-6">
                  <ToggleRow
                    title="Leave requests"
                    description="Get notified when employees submit leave requests."
                    checked={settings.notifications.leaveRequests}
                    onChange={(value) =>
                      updateField("notifications", "leaveRequests", value)
                    }
                  />

                  <ToggleRow
                    title="Attendance alerts"
                    description="Receive alerts about attendance and late arrivals."
                    checked={settings.notifications.attendanceAlerts}
                    onChange={(value) =>
                      updateField("notifications", "attendanceAlerts", value)
                    }
                  />

                  <ToggleRow
                    title="Employee updates"
                    description="Receive updates when employee records change."
                    checked={settings.notifications.employeeUpdates}
                    onChange={(value) =>
                      updateField("notifications", "employeeUpdates", value)
                    }
                  />

                  <ToggleRow
                    title="Weekly reports"
                    description="Receive a weekly summary of workforce activity."
                    checked={settings.notifications.weeklyReports}
                    onChange={(value) =>
                      updateField("notifications", "weeklyReports", value)
                    }
                  />

                  <ToggleRow
                    title="Email notifications"
                    description="Allow the application to send updates by email."
                    checked={settings.notifications.emailNotifications}
                    onChange={(value) =>
                      updateField(
                        "notifications",
                        "emailNotifications",
                        value
                      )
                    }
                  />
                </div>
              </>
            )}

            {/* Appearance */}
            {activeTab === "appearance" && (
              <>
                <SectionHeader
                  icon={Palette}
                  title="Appearance"
                  description="Customize how your workspace should look."
                />

                <div className="space-y-6 p-5 sm:p-6">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-800">
                      Theme preference
                    </h3>
                    <p className="mt-1 text-sm text-slate-500">
                      Select your preferred appearance.
                    </p>

                    <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                      {[
                        {
                          value: "light",
                          label: "Light mode",
                          description: "A bright and clean workspace.",
                        },
                        {
                          value: "dark",
                          label: "Dark mode",
                          description: "A darker appearance preference.",
                        },
                      ].map((theme) => (
                        <button
                          key={theme.value}
                          type="button"
                          onClick={() =>
                            updateField("appearance", "theme", theme.value)
                          }
                          className={`rounded-xl border p-4 text-left transition ${
                            settings.appearance.theme === theme.value
                              ? "border-indigo-500 bg-indigo-50 ring-1 ring-indigo-500"
                              : "border-slate-200 hover:bg-slate-50"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-slate-800">
                              {theme.label}
                            </span>
                            {settings.appearance.theme === theme.value && (
                              <Check size={18} className="text-indigo-600" />
                            )}
                          </div>
                          <p className="mt-2 text-sm text-slate-500">
                            {theme.description}
                          </p>
                        </button>
                      ))}
                    </div>
                    <p className="mt-3 text-xs text-slate-400">
                      Your appearance preference is applied immediately and saved on this device.
                    </p>
                  </div>

                  <div className="border-t border-slate-100 pt-5">
                    <ToggleRow
                      title="Compact layout"
                      description="Prefer tighter spacing in supported views."
                      checked={settings.appearance.compact}
                      onChange={(value) =>
                        updateField("appearance", "compact", value)
                      }
                    />
                  </div>
                </div>
              </>
            )}

            {/* Save settings footer */}
            {activeTab !== "security" && (
              <div className="flex flex-col gap-3 border-t border-slate-100 bg-slate-50/70 p-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                <div aria-live="polite">
                  {savedMessage && (
                    <p
                      className={`text-sm ${
                        savedMessage.includes("successfully")
                          ? "text-emerald-700"
                          : "text-rose-600"
                      }`}
                    >
                      {savedMessage}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
                >
                  <Save size={17} />
                  Save changes
                </button>
              </div>
            )}
          </form>

          {/* Security form */}
          {activeTab === "security" && (
            <form
              onSubmit={handlePasswordSave}
              className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
            >
              <SectionHeader
                icon={ShieldCheck}
                title="Security Settings"
                description="Update your password to help protect your account."
              />

              <div className="space-y-5 p-5 sm:p-6">
                {[
                  {
                    key: "current",
                    label: "Current password",
                    placeholder: "Enter current password",
                  },
                  {
                    key: "next",
                    label: "New password",
                    placeholder: "At least 8 characters",
                  },
                  {
                    key: "confirm",
                    label: "Confirm new password",
                    placeholder: "Re-enter new password",
                  },
                ].map((field) => (
                  <div key={field.key}>
                    <label className={labelClass}>{field.label}</label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={passwords[field.key]}
                        onChange={(event) => {
                          setPasswords((previous) => ({
                            ...previous,
                            [field.key]: event.target.value,
                          }));
                          setSavedMessage("");
                        }}
                        placeholder={field.placeholder}
                        autoComplete={
                          field.key === "current"
                            ? "current-password"
                            : "new-password"
                        }
                        className={`${inputClass} pr-12`}
                        required
                      />

                      <button
                        type="button"
                        onClick={() => setShowPassword((value) => !value)}
                        aria-label={
                          showPassword ? "Hide passwords" : "Show passwords"
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 hover:text-slate-700"
                      >
                        {showPassword ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </button>
                    </div>
                  </div>
                ))}

                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                  <p className="text-sm font-medium text-amber-900">
                    Backend integration required
                  </p>
                  <p className="mt-1 text-sm leading-5 text-amber-800">
                    This form validates the password fields in the browser.
                    The actual password is not changed until a secure backend
                    endpoint is connected.
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-3 border-t border-slate-100 bg-slate-50/70 p-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                <p aria-live="polite" className="text-sm text-slate-600">
                  {savedMessage}
                </p>
                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
                >
                  <LockKeyhole size={17} />
                  Update password
                </button>
              </div>
            </form>
          )}

          {/* Information banner */}
          <div className="flex items-start gap-3 rounded-2xl border border-indigo-100 bg-indigo-50 p-4">
            <ShieldCheck
              size={20}
              className="mt-0.5 shrink-0 text-indigo-600"
            />
            <div>
              <p className="text-sm font-semibold text-indigo-900">
                Your workspace, your preferences
              </p>
              <p className="mt-1 text-sm leading-5 text-indigo-800">
                This frontend demo keeps changes in React state. Settings
                currently reset on refresh and are not saved to a database.
                Persistent settings and secure account updates will be added
                during backend integration.
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function SectionHeader({ icon: Icon, title, description }) {
  return (
    <div className="flex items-start gap-3 border-b border-slate-100 p-5 sm:p-6">
      <div className="rounded-xl bg-indigo-50 p-3 text-indigo-600">
        <Icon size={21} />
      </div>
      <div>
        <h2 className="font-semibold text-slate-900">{title}</h2>
        <p className="mt-1 text-sm leading-5 text-slate-500">{description}</p>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  className,
  labelClass,
  placeholder,
  required = false,
}) {
  return (
    <div>
      <label className={labelClass}>
        {label}
        <input
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className={className}
          placeholder={placeholder || `Enter ${label.toLowerCase()}`}
          required={required}
        />
      </label>
    </div>
  );
}

function ToggleRow({ title, description, checked, onChange }) {
  return (
    <div className="flex items-center justify-between gap-4 py-5">
      <div>
        <p className="text-sm font-medium text-slate-800">{title}</p>
        <p className="mt-1 text-sm leading-5 text-slate-500">{description}</p>
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={title}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition ${
          checked ? "bg-indigo-600" : "bg-slate-300"
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition ${
            checked ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
    </div>
  );
}

export default Settings;
