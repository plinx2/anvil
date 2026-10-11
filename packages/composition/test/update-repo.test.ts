import { describe, expect, it } from 'vitest';
import { human, setup } from './helpers';

/** プロジェクト P1 にリポジトリ a(リモートあり)と b(リモートなし)、別プロジェクト P2 にリポジトリ c */
async function setupRepos() {
  const { s, project } = await setup();
  const { project: p2 } = await s.projects.create(human, { name: 'other' });
  await s.projects.addRepo(human, { projectId: project.id, name: 'a', path: '/a', defaultBranch: 'main', hasRemote: true });
  await s.projects.addRepo(human, { projectId: project.id, name: 'b', path: '/b', defaultBranch: 'develop', hasRemote: false });
  await s.projects.addRepo(human, { projectId: p2.id, name: 'c', path: '/c' });

  const snapshot = async () =>
    (await s.projects.list(human, {})).projects.map((p) => ({ id: p.id, updatedAt: p.updatedAt, repos: p.repos }));
  const repoOf = async (name: string) => (await snapshot()).flatMap((p) => p.repos).find((r) => r.name === name);
  return { s, p1: project, p2, snapshot, repoOf };
}

describe('リポジトリの更新(repo update)', () => {
  it('指定した項目だけ更新し、指定しなかった項目、名前、番号は変えない(hasRemote の true → false を含む)', async () => {
    const { s, p1, repoOf } = await setupRepos();
    const before = await repoOf('a');

    const { repos } = await s.projects.updateRepo(human, { projectId: p1.id, name: 'a', hasRemote: false });

    expect(repos.find((r) => r.name === 'a')).toEqual({ ...before, hasRemote: false });
    expect(await repoOf('a')).toEqual({ ...before, hasRemote: false });
  });

  it('false → true にも更新できる', async () => {
    const { s, p1, repoOf } = await setupRepos();
    const before = await repoOf('b');

    await s.projects.updateRepo(human, { projectId: p1.id, name: 'b', hasRemote: true });

    expect(await repoOf('b')).toEqual({ ...before, hasRemote: true });
  });

  it('defaultBranch だけ、path だけ、3 項目まとめて、更新できる', async () => {
    const { s, p1, repoOf } = await setupRepos();
    const before = await repoOf('a');

    await s.projects.updateRepo(human, { projectId: p1.id, name: 'a', defaultBranch: 'trunk' });
    expect(await repoOf('a')).toEqual({ ...before, defaultBranch: 'trunk' });

    await s.projects.updateRepo(human, { projectId: p1.id, name: 'a', path: '/a2' });
    expect(await repoOf('a')).toEqual({ ...before, defaultBranch: 'trunk', path: '/a2' });

    await s.projects.updateRepo(human, { projectId: p1.id, name: 'a', defaultBranch: 'main', hasRemote: false, path: '/a3' });
    expect(await repoOf('a')).toEqual({ ...before, defaultBranch: 'main', hasRemote: false, path: '/a3' });
  });

  it('戻り値は更新後のプロジェクトのリポジトリ一覧(名前順)で、ほかのリポジトリ、ほかのプロジェクトは変わらない', async () => {
    const { s, p1, repoOf } = await setupRepos();
    const b = await repoOf('b');
    const c = await repoOf('c');

    const { repos } = await s.projects.updateRepo(human, { projectId: p1.id, name: 'a', defaultBranch: 'trunk' });

    expect(repos.map((r) => r.name)).toEqual(['a', 'app', 'b']);
    expect(await repoOf('b')).toEqual(b);
    expect(await repoOf('c')).toEqual(c);
  });

  it('現在の値と同じ指定、自分自身の現在のパスの指定は、エラーにならない。プロジェクトの更新日時は進む', async () => {
    const { s, p1, snapshot, repoOf } = await setupRepos();
    const before = await repoOf('a');
    const updatedAtBefore = (await snapshot()).find((p) => p.id === p1.id)?.updatedAt ?? '';
    await new Promise((resolve) => setTimeout(resolve, 5));

    await s.projects.updateRepo(human, { projectId: p1.id, name: 'a', path: '/a', defaultBranch: 'main', hasRemote: true });

    expect(await repoOf('a')).toEqual(before);
    expect((await snapshot()).find((p) => p.id === p1.id)?.updatedAt ?? '').not.toBe(updatedAtBefore);
  });

  it('パスの実在は検証しない。解放されたパスは、ほかのリポジトリが使える', async () => {
    const { s, p1, repoOf } = await setupRepos();

    await s.projects.updateRepo(human, { projectId: p1.id, name: 'a', path: '/not/exist' });
    await s.projects.updateRepo(human, { projectId: p1.id, name: 'b', path: '/a' });

    expect((await repoOf('a'))?.path).toBe('/not/exist');
    expect((await repoOf('b'))?.path).toBe('/a');
  });

  describe('エラーのときは、何も更新しない', () => {
    const cases = [
      {
        title: '存在しないプロジェクト',
        code: 'not_found',
        message: /9999/,
        input: () => ({ projectId: 9999, name: 'a', hasRemote: false }),
      },
      {
        title: '存在しないリポジトリ名',
        code: 'not_found',
        message: /zzz.*プロジェクト/,
        input: (p: number) => ({ projectId: p, name: 'zzz', hasRemote: false }),
      },
      {
        title: '別のプロジェクトのリポジトリ名',
        code: 'not_found',
        message: /c/,
        input: (p: number) => ({ projectId: p, name: 'c', hasRemote: false }),
      },
      {
        title: '同じプロジェクトの別のリポジトリのパス',
        code: 'conflict',
        message: /既に/,
        input: (p: number) => ({ projectId: p, name: 'a', path: '/b' }),
      },
      {
        title: '別のプロジェクトのリポジトリのパス',
        code: 'conflict',
        message: /既に/,
        input: (p: number) => ({ projectId: p, name: 'a', path: '/c' }),
      },
      {
        title: 'パスの重複と、ほかの項目の同時の指定',
        code: 'conflict',
        message: /既に/,
        input: (p: number) => ({ projectId: p, name: 'a', hasRemote: false, path: '/b' }),
      },
      { title: '更新する項目が無い', code: 'invalid', message: /1 つ以上/, input: (p: number) => ({ projectId: p, name: 'a' }) },
      {
        title: '更新する項目が無く、プロジェクトも存在しない(項目の検査が先)',
        code: 'invalid',
        message: /1 つ以上/,
        input: () => ({ projectId: 9999, name: 'a' }),
      },
      {
        title: '更新する項目が無く、リポジトリ名も存在しない(項目の検査が先)',
        code: 'invalid',
        message: /1 つ以上/,
        input: (p: number) => ({ projectId: p, name: 'zzz' }),
      },
    ];

    it.each(cases)('$title → $code', async ({ code, message, input }) => {
      const { s, p1, snapshot } = await setupRepos();
      const before = await snapshot();

      await expect(s.projects.updateRepo(human, input(p1.id))).rejects.toMatchObject({ code, message: expect.stringMatching(message) });

      expect(await snapshot()).toEqual(before);
    });
  });
});
