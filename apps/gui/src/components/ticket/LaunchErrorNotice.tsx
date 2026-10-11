export function LaunchErrorNotice({ message }: { message: string }) {
  return <div className="rounded-lg border border-gate-border bg-gate p-3 text-sm text-destructive">{message}</div>;
}
