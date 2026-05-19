export function formatDate(date: string | Date) {
  return new Date(date).toLocaleDateString("es-CO", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function getErrorMessage(
  err: unknown,
  fallback = "Error inesperado",
): string {
  if (err instanceof Error) return err.message;
  if (typeof err === "object" && err !== null) {
    const e = err as Record<string, unknown>;
    const data = (e.response as Record<string, unknown>)?.data as Record<
      string,
      unknown
    >;
    if (typeof data?.message === "string") return data.message;
  }
  return fallback;
}
