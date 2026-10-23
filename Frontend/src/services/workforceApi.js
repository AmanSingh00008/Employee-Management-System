import api from "../utils/axios.js";

const DEFAULT_LIST_PARAMS = { limit: 100, page: 1 };

// ─── Employees ─────────────────────────────────────────────────────────────────
export async function fetchEmployees(params = {}) {
  const { data } = await api.get("/api/v1/employees", {
    params: { ...DEFAULT_LIST_PARAMS, ...params },
  });
  return data.data ?? [];
}

export async function fetchDepartments(params = {}) {
  const { data } = await api.get("/api/v1/departments", {
    params: { ...DEFAULT_LIST_PARAMS, ...params },
  });
  return data.data ?? [];
}

export async function fetchDashboardSummary() {
  const { data } = await api.get("/api/v1/dashboard/summary");
  return data.data;
}

export async function createDepartment(departmentData) {
  const { data } = await api.post("/api/v1/departments", departmentData);
  return data.data;
}

export async function updateDepartment(id, departmentData) {
  const { data } = await api.patch(`/api/v1/departments/${id}`, departmentData);
  return data.data;
}

export async function deactivateDepartment(id) {
  const { data } = await api.patch(`/api/v1/departments/${id}/deactivate`);
  return data;
}

export async function createEmployee(employeeData) {
  const { data } = await api.post("/api/v1/employees", employeeData);
  return data.data;
}

export async function updateEmployee(id, employeeData) {
  const { data } = await api.patch(`/api/v1/employees/${id}`, employeeData);
  return data.data;
}

export async function deactivateEmployee(id) {
  const { data } = await api.patch(`/api/v1/employees/${id}/deactivate`);
  return data;
}

// ─── Leave Requests ────────────────────────────────────────────────────────────
export async function fetchLeaveRequests(params = {}) {
  const { data } = await api.get("/api/v1/leave-requests", {
    params: { ...DEFAULT_LIST_PARAMS, ...params },
  });
  return data.data ?? [];
}

export async function fetchLeaveTypes(params = {}) {
  const { data } = await api.get("/api/v1/leave-types", {
    params: { ...DEFAULT_LIST_PARAMS, ...params },
  });
  return data.data ?? [];
}

export async function createLeaveRequest(leaveData) {
  const { data } = await api.post("/api/v1/leave-requests", leaveData);
  return data.data;
}

export async function reviewLeaveRequest(id, reviewData) {
  const { data } = await api.patch(`/api/v1/leave-requests/${id}/review`, reviewData);
  return data.data;
}

export async function cancelLeaveRequest(id) {
  const { data } = await api.patch(`/api/v1/leave-requests/${id}/cancel`);
  return data.data;
}

// ─── Attendance ────────────────────────────────────────────────────────────────
export async function fetchAttendanceRecords(params = {}) {
  const { data } = await api.get("/api/v1/attendance", {
    params: { ...DEFAULT_LIST_PARAMS, ...params },
  });
  return data.data ?? [];
}

export async function createAttendance(attendanceData) {
  const { data } = await api.post("/api/v1/attendance", attendanceData);
  return data.data;
}

export async function updateAttendance(id, attendanceData) {
  const { data } = await api.patch(`/api/v1/attendance/${id}`, attendanceData);
  return data.data;
}

// ─── Assets ────────────────────────────────────────────────────────────────────
export async function fetchAssets(params = {}) {
  const { data } = await api.get("/api/v1/assets", {
    params: { ...DEFAULT_LIST_PARAMS, ...params },
  });
  return data.data ?? [];
}

export async function createAsset(assetData) {
  const { data } = await api.post("/api/v1/assets", assetData);
  return data.data;
}

export async function updateAsset(id, assetData) {
  const { data } = await api.patch(`/api/v1/assets/${id}`, assetData);
  return data.data;
}

export async function retireAsset(id) {
  const { data } = await api.patch(`/api/v1/assets/${id}/retire`);
  return data;
}
