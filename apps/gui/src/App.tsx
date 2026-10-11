import { Route, Routes } from 'react-router-dom';
import { Toaster } from 'sonner';
import { Nav } from '@/components/nav/Nav';
import { BoardPage } from '@/pages/Board';
import { DashboardPage } from '@/pages/Dashboard';
import { ProjectsPage } from '@/pages/Projects';
import { ReflectionsPage } from '@/pages/Reflections';
import { TicketPage } from '@/pages/Ticket';

export function App() {
  return (
    <>
      <Nav />
      <main className="mx-auto max-w-[1400px] p-4">
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/board" element={<BoardPage />} />
          <Route path="/board/:projectId" element={<BoardPage />} />
          <Route path="/tickets/:ticketId" element={<TicketPage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/reflections" element={<ReflectionsPage />} />
          <Route path="*" element={<p>見つからない</p>} />
        </Routes>
      </main>
      <Toaster richColors position="bottom-center" />
    </>
  );
}
