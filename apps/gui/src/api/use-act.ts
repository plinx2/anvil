import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

/** 操作を実行する。成功したら、画面のデータを取り直す。失敗したら、通知する。 */
export function useAct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (run: () => Promise<unknown>) => run(),
    onSuccess: () => qc.invalidateQueries(),
    onError: (e: Error) => toast.error(e.message),
  });
}
