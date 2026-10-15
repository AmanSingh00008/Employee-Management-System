import api from "../utils/axios.js";

const DEFAULT_LIST_PARAMS = { limit: 100, page: 1 };

export async function fetchEmployees(params = {}) {
  const { data } = await api.get("/api/v1/employees", {
    params: { ...DEFAULT_LIST_PARAMS, ...params },
  });
  return data.data ?? [];
}

export async function fetchLeaveRequests(params = {}) {
  const { data } = await api.get("/api/v1/leave-requests", {
    params: { ...DEFAULT_LIST_PARAMS, ...params },
  });
  return data.data ?? [];
}

export async function fetchAttendanceRecords(params = {}) {
  const { data } = await api.get("/api/v1/attendance", {
    params: { ...DEFAULT_LIST_PARAMS, ...params },
  });
  return data.data ?? [];
}

export async function fetchAssets(params = {}) {
  const { data } = await api.get("/api/v1/assets", {
    params: { ...DEFAULT_LIST_PARAMS, ...params },
  });
  return data.data ?? [];
}
