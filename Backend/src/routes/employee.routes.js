router.use(verifyJWT);

router.post(
  "/",
  authorizeRoles("super_admin", "hr_admin"),
  createEmployee
);

router.get(
  "/",
  authorizeRoles("super_admin", "hr_admin", "manager"),
  getEmployees
);

router.get("/:id", getEmployeeById);

router.patch(
  "/:id",
  authorizeRoles("super_admin", "hr_admin"),
  updateEmployee
);

router.delete(
  "/:id",
  authorizeRoles("super_admin", "hr_admin"),
  deactivateEmployee
);