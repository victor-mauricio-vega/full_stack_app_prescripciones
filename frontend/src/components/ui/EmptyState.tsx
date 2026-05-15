import { FileX } from "lucide-react";

export default function EmptyState({
  message = "No hay datos",
}: {
  message?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-3 text-gray-400">
      <FileX size={40} strokeWidth={1.5} />
      <p className="text-sm">{message}</p>
    </div>
  );
}
