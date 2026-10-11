export function ReflectionField({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;

  return (
    <div className="text-sm">
      <span className="text-muted-foreground">{label}: </span>
      {value}
    </div>
  );
}
