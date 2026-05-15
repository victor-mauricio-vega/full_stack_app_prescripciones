interface BadgeProps {
  status: "pending" | "consumed";
}

export default function Badge({ status }: BadgeProps) {
  const styles = {
    pending: "bg-amber-100 text-amber-700 border border-amber-200",
    consumed: "bg-green-100 text-green-700 border border-green-200",
  };

  const labels = { pending: "Pendiente", consumed: "Consumida" };

  return (
    <span
      className={`text-xs font-medium px-2.5 py-1 rounded-full ${styles[status]}`}
    >
      {labels[status]}
    </span>
  );
}
