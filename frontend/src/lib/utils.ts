export function formatDate(date: string | Date) {
  return new Date(date).toLocaleDateString("es-CO", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function getErrorMessage(error: any): string {
  return error?.response?.data?.message ?? "Error inesperado";
}
