import { State } from '@anvil/entity';
import { useParams } from 'react-router-dom';
import { useBoard } from '@/api/queries/use-board';
import { BoardColumn } from '@/components/board/BoardColumn';
import { BoardProjectFilter } from '@/components/board/BoardProjectFilter';

export function BoardPage() {
  const { projectId } = useParams();
  const { data, error } = useBoard(projectId ? Number(projectId) : undefined);
  const tickets = data?.tickets ?? [];
  if (error) return <p className="text-destructive">{error.message}</p>;

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-xl font-semibold">カンバン</h1>
        <BoardProjectFilter projectId={projectId} />
      </div>
      <div className="flex items-start gap-2.5 overflow-x-auto pb-3">
        {State.all.map((state) => (
          <BoardColumn key={state.id} state={state} tickets={tickets.filter((t) => t.state === state.id)} />
        ))}
      </div>
    </div>
  );
}
