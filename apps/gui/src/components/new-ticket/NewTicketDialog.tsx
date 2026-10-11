import { useState } from 'react';
import { useProjects } from '@/api/queries/use-projects';
import { DirectCreateForm } from '@/components/new-ticket/DirectCreateForm';
import { IntakeRequestForm } from '@/components/new-ticket/IntakeRequestForm';
import { NoProjectNotice } from '@/components/new-ticket/NoProjectNotice';
import { ProjectSelect } from '@/components/new-ticket/ProjectSelect';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

/** 起票ボタン: やりたいことを入力して、PBI 起票担当を起動する。 */
export function NewTicketDialog() {
  const [open, setOpen] = useState(false);
  const [project, setProject] = useState('');
  const [autoGate, setAutoGate] = useState(false);
  const { data } = useProjects();
  const projects = data?.projects ?? [];
  const selected = project || String(projects[0]?.id);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>起票</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>起票</DialogTitle>
          <DialogDescription>やりたいことを入力すると、PBI 起票担当が、タイトル・ペイン・ゲイン・AC に整えて起票する。</DialogDescription>
        </DialogHeader>
        {projects.length ? (
          <div className="grid gap-3">
            <ProjectSelect projects={projects} value={selected} onChange={setProject} />
            <IntakeRequestForm
              projectId={Number(selected)}
              autoGate={autoGate}
              onAutoGateChange={setAutoGate}
              onDone={() => setOpen(false)}
            />
            <DirectCreateForm projectId={Number(selected)} autoGate={autoGate} onDone={() => setOpen(false)} />
          </div>
        ) : (
          <NoProjectNotice onNavigate={() => setOpen(false)} />
        )}
      </DialogContent>
    </Dialog>
  );
}
