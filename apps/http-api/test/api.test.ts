import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createAnvil } from '@anvil/composition';
import { OPERATIONS } from '@anvil/service';
import { describe, expect, it } from 'vitest';
import { createHttpApp } from '../src';

function setup() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'anvil-http-'));
  const anvil = createAnvil({
    home: path.join(dir, 'home'),
    dbFile: ':memory:',
    agentsDir: path.resolve(import.meta.dirname, '..', '..', '..', 'agents'), // 実物のロール定義(本文をプロンプトに埋め込むので、読める必要がある)
    mcpUrl: 'http://127.0.0.1:0/mcp',
    agent: 'noop',
    herdrSession: 'anvil',
    pullRequests: 'noop',
    models: { standard: 'standard-model', light: 'light-model' },
  });
  const app = createHttpApp(anvil.service);
  const request = async (method: string, url: string, body?: unknown) => {
    const response = await app.request(url, {
      method,
      headers: { 'content-type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    return { status: response.status, body: (await response.json()) as any };
  };
  return { anvil, request, dir };
}

describe('HTTP API', () => {
  it('チケットを起票して、パスの番号で読め、人間として進められる', async () => {
    const { request, dir } = setup();
    const project = await request('POST', '/api/projects', { name: 'demo' });
    expect(project.status).toBe(200);
    const repos = await request('POST', `/api/projects/${project.body.project.id}/repos`, { name: 'app', path: dir });
    expect(repos.body.repos).toHaveLength(1);

    const created = await request('POST', '/api/tickets', { projectId: project.body.project.id, title: 'ログイン', body: 'AC: …' });
    expect(created.body.ticket.state).toBe('todo');
    const detail = await request('GET', `/api/tickets/${created.body.ticket.id}`);
    expect(detail.body.detail.ticket.title).toBe('ログイン');

    const started = await request('POST', `/api/tickets/${created.body.ticket.id}/start`);
    expect(started.body.ticket.state).toBe('refine');

    const entries = await request('GET', `/api/tickets/${created.body.ticket.id}/entries?limit=3`);
    expect(entries.body).toEqual({ total: 0, entries: [] });

    const board = await request('GET', `/api/board?projectId=${project.body.project.id}`);
    expect(board.body.tickets).toHaveLength(1);
    expect(board.body.tickets[0].category).toBe('refine');
  });

  it('エラーは、コードに応じた状態で返る', async () => {
    const { request } = setup();
    const project = await request('POST', '/api/projects', { name: 'demo' });
    const ticket = await request('POST', '/api/tickets', { projectId: project.body.project.id, title: 'x', state: 'refine' });

    expect((await request('GET', '/api/tickets/999')).status).toBe(404);
    expect((await request('POST', '/api/projects', { name: 'demo' })).status).toBe(409); // 重複

    const invalid = await request('POST', '/api/tickets', { title: 'x' }); // projectId が無い
    expect(invalid.status).toBe(400);
    expect(invalid.body.code).toBe('invalid');

    const blocked = await request('POST', `/api/tickets/${ticket.body.ticket.id}/gates/pre-done`);
    expect(blocked.status).toBe(409);
  });

  it('OpenAPI の文書を返す(パスの番号は必須。入り口が、すべて載る)', async () => {
    const { request } = setup();
    const document = await request('GET', '/openapi.json');
    expect(document.status).toBe(200);
    expect(document.body.openapi).toMatch(/^3\.1/);

    const advance = document.body.paths['/api/tickets/{ticketId}/advance'].post;
    expect(advance.parameters[0]).toMatchObject({ name: 'ticketId', in: 'path', required: true });
    expect(advance.operationId).toBe('advanceTicket');

    const operations = Object.values<any>(document.body.paths).flatMap((p) => Object.keys(p));
    expect(operations).toHaveLength(31);
  });

  it('すべての操作を、HTTP API として提供する(operations.ts の対応表のとおり)', () => {
    const { anvil } = setup();
    const doc = createHttpApp(anvil.service).getOpenAPI31Document({ openapi: '3.1.0', info: { title: 'anvil', version: '0' } });
    const ids = Object.values(doc.paths ?? {}).flatMap((item) =>
      Object.values(item as Record<string, { operationId?: string }>).flatMap((op) => (op.operationId ? [op.operationId] : [])),
    );
    const expected = OPERATIONS.flatMap((o) => (o.http ? [o.http] : []));
    expect([...ids].sort()).toEqual([...expected].sort());
  });

  it('承認待ちフラグを、HTTP API で立てて、回答できる', async () => {
    const { request } = setup();
    const project = await request('POST', '/api/projects', { name: 'demo' });
    const ticket = await request('POST', '/api/tickets', { projectId: project.body.project.id, title: 'x', state: 'refine' });
    const id = ticket.body.ticket.id;
    expect((await request('POST', `/api/tickets/${id}/ask`, { question: 'どちらですか' })).body.ticket.awaiting).toBe(true);
    expect((await request('POST', `/api/tickets/${id}/answer`, { answer: 'A' })).body.ticket.awaiting).toBe(false);
  });
});
