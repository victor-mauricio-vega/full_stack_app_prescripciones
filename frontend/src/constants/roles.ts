export type Role = "admin" | "doctor" | "patient";

export const ROLE_ROUTES: Record<Role, string> = {
  admin: "/MediPrescribe/admin",
  doctor: "/MediPrescribe/doctor/prescriptions",
  patient: "/MediPrescribe/patient/prescriptions",
};

export const ROLE_LABELS: Record<Role, string> = {
  admin: "Administrador",
  doctor: "Médico",
  patient: "Paciente",
};

export const ROLE_COLORS: Record<Role, string> = {
  admin: "bg-purple-100 text-purple-700",
  doctor: "bg-blue-100 text-blue-700",
  patient: "bg-green-100 text-green-700",
};
