import { useState } from 'react';
import { useContextPages } from '@/api/queries/use-context-pages';

export function ProjectContextPages({ projectId }: { projectId: number }) {
  const [open, setOpen] = useState(false);
  const context = useContextPages(projectId, open);

  return (
    <details onToggle={(e) => setOpen((e.target as HTMLDetailsElement).open)}>
      <summary className="cursor-pointer text-muted-foreground">プロジェクトコンテキスト</summary>
      {context.data?.pages.map((page) => (
        <div key={page.path}>
          <div className="mt-2 text-xs text-muted-foreground">{page.path}</div>
          <pre className="whitespace-pre-wrap rounded-md bg-secondary p-2 font-mono text-xs">{page.content}</pre>
        </div>
      ))}
    </details>
  );
}
