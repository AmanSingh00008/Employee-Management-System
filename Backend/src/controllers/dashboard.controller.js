
import { Employee } from "../models/employee.model.js";
import { Department } from "../models/department.model.js";
import { LeaveRequest } from "../models/leaveRequest.model.js";
import { Attendance } from "../models/attendance.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const HR_ROLES = ["super_admin", "hr_admin"];

// GET /api/v1/dashboard/summary
export const getDashboardSummary = asyncHandler(async (req, res) => {
  const isHR = HR_ROLES.includes(req.user.role);
  const isManager = req.user.role === "manager";
  const isEmployee = req.user.role === "employee";

  if (!isHR && !isManager && !isEmployee) {
    throw new ApiError(403, "You are not allowed to view the dashboard");
  }

  // Company-wide dashboard for HR/Admin.
  if (isHR) {
    const [
      totalEmployees,
      activeEmployees,
      inactiveEmployees,
      totalDepartments,
      activeDepartments,
      pendingLeaveRequests,
      recentEmployees,
    ] = await Promise.all([
      Employee.countDocuments(),
      Employee.countDocuments({ employmentStatus: "active" }),
      Employee.countDocuments({
        employmentStatus: { $ne: "active" },
      }),
      Department.countDocuments(),
      Department.countDocuments({ isActive: true }),
      LeaveRequest.countDocuments({ status: "pending" }),
      Employee.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select(
          "employeeCode firstName lastName designation employmentStatus joiningDate departmentId"
        )
        .populate("departmentId", "name code")
        .lean(),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        scope: "company",
        employees: {
          total: totalEmployees,
          active: activeEmployees,
          inactive: inactiveEmployees,
        },
        departments: {
          total: totalDepartments,
          active: activeDepartments,
        },
        leaveRequests: {
          pending: pendingLeaveRequests,
        },
        recentEmployees,
      },
    });
  }

  // Find the logged-in manager/employee's active employee profile.
  const ownProfile = await Employee.findOne({
    userId: req.user._id,
    employmentStatus: "active",
  }).select("_id employeeCode firstName lastName");

  if (!ownProfile) {
    throw new ApiError(
      404,
      "No active employee profile is linked to your account"
    );
  }

  // Employee dashboard: own leave requests and attendance.
  if (isEmployee) {
    const [myPendingLeaves, myApprovedLeaves, myAttendance] =
      await Promise.all([
        LeaveRequest.countDocuments({
          employeeId: ownProfile._id,
          status: "pending",
        }),
        LeaveRequest.countDocuments({
          employeeId: ownProfile._id,
          status: "approved",
        }),
        Attendance.countDocuments({
          employeeId: ownProfile._id,
        }),
      ]);

    return res.status(200).json({
      success: true,
      data: {
        scope: "self",
        employee: ownProfile,
        leaveRequests: {
          pending: myPendingLeaves,
          approved: myApprovedLeaves,
        },
        attendance: {
          recordedDays: myAttendance,
        },
      },
    });
  }

  // Manager dashboard: only direct reports.
  const teamMembers = await Employee.find({
    managerId: ownProfile._id,
  })
    .select("_id")
    .lean();

  const teamIds = teamMembers.map((member) => member._id);

  const [
    totalTeamMembers,
    activeTeamMembers,
    pendingTeamLeaves,
    recentTeamEmployees,
  ] = await Promise.all([
    Employee.countDocuments({ _id: { $in: teamIds } }),
    Employee.countDocuments({
      _id: { $in: teamIds },
      employmentStatus: "active",
    }),
    LeaveRequest.countDocuments({
      employeeId: { $in: teamIds },
      status: "pending",
    }),
    Employee.find({ _id: { $in: teamIds } })
      .sort({ createdAt: -1 })
      .limit(5)
      .select(
        "employeeCode firstName lastName designation employmentStatus departmentId"
      )
      .populate("departmentId", "name code")
      .lean(),
  ]);

  return res.status(200).json({
    success: true,
    data: {
      scope: "team",
      manager: ownProfile,
      employees: {
        total: totalTeamMembers,
        active: activeTeamMembers,
        inactive: totalTeamMembers - activeTeamMembers,
      },
      leaveRequests: {
        pending: pendingTeamLeaves,
      },
      recentEmployees: recentTeamEmployees,
    },
  });
});
