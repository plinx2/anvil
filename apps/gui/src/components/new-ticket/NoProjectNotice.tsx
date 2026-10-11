import { Link } from 'react-router-dom';

export function NoProjectNotice({ onNavigate }: { onNavigate: () => void }) {
  return (
    <p className="text-sm">
      先にプロジェクトを登録する。{' '}
      <Link to="/projects" className="text-primary hover:underline" onClick={onNavigate}>
        プロジェクトへ
      </Link>
    </p>
  );
}
