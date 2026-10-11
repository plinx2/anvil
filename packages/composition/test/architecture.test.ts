// 構成の検査。内側のレイヤーは外側を知らない。アプリケーション同士は依存しない。
import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const root = path.resolve(import.meta.dirname, '..', '..', '..');
const manifest = (dir: string) => JSON.parse(fs.readFileSync(path.join(root, dir, 'package.json'), 'utf8'));
const dependenciesOf = (dir: string): string[] => Object.keys(manifest(dir).dependencies ?? {});
const internalOf = (dir: string) => dependenciesOf(dir).filter((d) => d.startsWith('@anvil/'));

const ADAPTER_DIRS = fs.readdirSync(path.join(root, 'packages', 'adapter')).map((d) => `packages/adapter/${d}`);
const APP_DIRS = fs.readdirSync(path.join(root, 'apps')).map((d) => `apps/${d}`);
const LAYER_DIRS = ['packages/entity', 'packages/usecase', 'packages/service', 'packages/composition'];

function sourceFiles(dir: string): string[] {
  const found: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) found.push(...sourceFiles(full));
    else if (/\.(ts|tsx)$/.test(entry.name)) found.push(full);
  }
  return found;
}
const read = (file: string) => fs.readFileSync(file, 'utf8');

describe('レイヤーの依存方向', () => {
  it('entity: 何にも依存しない', () => {
    expect(dependenciesOf('packages/entity')).toEqual([]);
  });

  it('usecase: entity だけ(ports の実装を知らない)', () => {
    expect(dependenciesOf('packages/usecase')).toEqual(['@anvil/entity']);
  });

  it('service: entity と usecase と zod だけ', () => {
    expect(dependenciesOf('packages/service').sort()).toEqual(['@anvil/entity', '@anvil/usecase', 'zod']);
  });

  it('adapter: entity と usecase(ports)にだけ依存する。adapter 同士、service、composition を知らない', () => {
    for (const dir of ADAPTER_DIRS) {
      for (const dependency of internalOf(dir))
        expect(['@anvil/entity', '@anvil/usecase'], `${dir} -> ${dependency}`).toContain(dependency);
    }
  });

  it('entity、usecase、service のソースは、Node の組み込みモジュールや、通信の部品に依存しない', () => {
    for (const dir of ['packages/entity', 'packages/usecase', 'packages/service']) {
      for (const file of sourceFiles(path.join(root, dir, 'src'))) {
        expect(read(file), file).not.toMatch(/from 'node:/);
        expect(read(file), file).not.toMatch(/from '(hono|@hono\/|@modelcontextprotocol)/);
      }
    }
  });
});

describe('アプリケーションの独立', () => {
  it('apps は、他の apps に依存しない(コードでも、依存の宣言でも)', () => {
    for (const dir of APP_DIRS) {
      const names = APP_DIRS.map((d) => manifest(d).name as string).filter((n) => n !== manifest(dir).name);
      for (const dependency of dependenciesOf(dir)) expect(names, `${dir} -> ${dependency}`).not.toContain(dependency);
    }
  });

  it('cli は、apps を組み立てる入口。apps は cli に依存しない', () => {
    for (const dir of APP_DIRS) {
      for (const dependency of dependenciesOf(dir)) expect(dependency, `${dir} -> ${dependency}`).not.toBe(manifest('cli').name);
    }
  });

  it('apps と cli は、usecase と adapter を直接使わない(service と composition を通す)', () => {
    for (const dir of [...APP_DIRS, 'cli']) {
      for (const dependency of internalOf(dir)) {
        expect(dependency, `${dir} -> ${dependency}`).not.toBe('@anvil/usecase');
        expect(
          ADAPTER_DIRS.map((d) => manifest(d).name),
          `${dir} -> ${dependency}`,
        ).not.toContain(dependency);
      }
    }
  });
});

describe('ports と usecase の形', () => {
  const portFiles = sourceFiles(path.join(root, 'packages/usecase/src/ports')).filter((f) => !f.endsWith('index.ts'));

  it('ports のすべてのメソッドは、第一引数にリクエストの文脈を取る', () => {
    let checked = 0;
    for (const file of portFiles) {
      const methods = [...read(file).matchAll(/^ {2}(\w+)(?:<[^>]*>)?\(([^)]*)\)\s*:/gm)];
      for (const [, name, parameters] of methods) {
        expect(parameters, `${path.basename(file)} ${name}`).toMatch(/^ctx: RequestContext/);
        checked++;
      }
    }
    expect(checked).toBeGreaterThan(50); // 検査が空振りしていない
  });

  it('ユースケースは、単独のクラスで、UseCase を実装する。他のユースケースの集まりを持たない', () => {
    const useCaseDirs = [
      'agent',
      'branch',
      'dependency',
      'find',
      'flag',
      'flow',
      'intake',
      'pull-request',
      'query',
      'reflection',
      'ticket',
      'project',
    ];
    for (const dir of useCaseDirs) {
      for (const file of sourceFiles(path.join(root, 'packages/usecase/src', dir))) {
        const text = read(file);
        const classes = text.match(/^export class \w+/gm) ?? [];
        if (classes.length === 0) continue; // 型だけのファイル(read model など)
        expect(classes, file).toHaveLength(1); // 1 ファイル 1 クラス
        expect(text, file).toMatch(/implements UseCase</);
      }
    }
  });

  it('ユースケースは、自分専用の Input と Output(オブジェクトの形)を、同じファイルに持つ', () => {
    const useCaseDirs = [
      'agent',
      'branch',
      'dependency',
      'find',
      'flag',
      'flow',
      'intake',
      'pull-request',
      'query',
      'reflection',
      'ticket',
      'project',
    ];
    let checked = 0;
    for (const dir of useCaseDirs) {
      for (const file of sourceFiles(path.join(root, 'packages/usecase/src', dir))) {
        const text = read(file);
        const name = text.match(/^export class (\w+)/m)?.[1];
        if (!name) continue;
        // 入力と出力の型が、ユースケースの名前で、このファイルにある
        expect(text, `${file}: ${name}Input`).toMatch(new RegExp(`export (interface|type) ${name}Input\\b`));
        expect(text, `${file}: ${name}Output`).toMatch(new RegExp(`export (interface|type) ${name}Output\\b`));
        // 実装する型は、その 2 つだけ(インラインの型、配列、void、エンティティをそのまま返す形にしない)
        expect(text, file).toContain(`implements UseCase<${name}Input, ${name}Output>`);
        checked++;
      }
    }
    expect(checked).toBeGreaterThan(50);
  });

  it('service の出力は、操作ごとに専用の型で、内側のユースケースと 1 対 1 に対応する', () => {
    const useCaseNames = new Set(
      sourceFiles(path.join(root, 'packages/usecase/src'))
        .map((file) => read(file).match(/^export class (\w+)/m)?.[1])
        .filter((name): name is string => name !== undefined),
    );
    const outputFiles = sourceFiles(path.join(root, 'packages/service/src/output'));
    for (const file of outputFiles) {
      const text = read(file);
      const name = path
        .basename(file)
        .replace(/-output\.ts$/, '')
        .split('-')
        .map((w) => w[0]?.toUpperCase() + w.slice(1))
        .join('');
      // 内側の同名のユースケースがあり、その Output からだけ変換する
      expect(useCaseNames, file).toContain(name);
      expect(text, file).toContain(`import type { ${name}Output as UseCaseOutput } from '@anvil/usecase';`);
      expect(text, file).toMatch(new RegExp(`export type ${name}Output = z\\.infer`));
    }
    expect(outputFiles.length).toBeGreaterThan(25);

    // 操作で共有する応答の型(Response / List の DTO)を持たない。DTO は、出力の中の、エンティティなどを表すデータ
    for (const file of sourceFiles(path.join(root, 'packages/service/src/dto'))) {
      expect(path.basename(file), file).not.toMatch(/(response|list)-dto\.ts$/);
    }
  });

  it('全部の ports を束ねたオブジェクトを、usecase が持たない', () => {
    for (const file of sourceFiles(path.join(root, 'packages/usecase/src'))) {
      expect(read(file), file).not.toMatch(/\bPorts\b/);
    }
  });
});

describe('ビルドの成果物を公開しない(packages)', () => {
  it('packages は、ts のソースを直接 exports する', () => {
    const packages = [...LAYER_DIRS, ...ADAPTER_DIRS];
    for (const dir of packages) expect(manifest(dir).exports['.'], dir).toBe('./src/index.ts');
  });

  it('同種のパッケージは、名前の接頭辞ではなく、ディレクトリでまとまる', () => {
    for (const dir of ADAPTER_DIRS) expect(manifest(dir).name, dir).not.toMatch(/^@anvil\/adapter-/);
  });
});
