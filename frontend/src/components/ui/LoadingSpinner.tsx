export default function LoadingSpinner({
  text = "Cargando...",
}: {
  text?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-3">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      <p className="text-sm text-gray-500">{text}</p>
    </div>
  );
}
