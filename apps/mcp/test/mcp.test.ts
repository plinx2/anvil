import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { type Anvil, createAnvil } from '@anvil/composition';
import { Actor, Role } from '@anvil/entity';
import { newRequestContext, OPERATIONS } from '@anvil/service';
import { serve } from '@hono/node-server';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import { describe, expect, it } from 'vitest';
import { createMcpApp } from '../src';

const human = newRequestContext(Actor.human());
const asRole = (role: Role) => newRequestContext(Actor.ofRole(role));

async function withServer(test: (o: { anvil: Anvil; connect: (headers: Record<string, string>) => Promise<Client> }) => Promise<void>) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'anvil-mcp-'));
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
  const server = serve({ fetch: createMcpApp(anvil.service).fetch, port: 0, hostname: '127.0.0.1' });
  await new Promise((resolve) => server.once('listening', resolve));
  const { port } = server.address() as { port: number };

  const clients: Client[] = [];
  const connect = async (headers: Record<string, string>) => {
    const client = new Client({ name: 'test', version: '0' });
    await client.connect(new StreamableHTTPClientTransport(new URL(`http://127.0.0.1:${port}/mcp`), { requestInit: { headers } }));
    clients.push(client);
    return client;
  };
  try {
    await test({ anvil, connect });
  } finally {
    await Promise.allSettled(clients.map((c) => c.close()));
    server.close();
  }
}

const textOf = (result: any) => result.content[0].text as string;

describe('MCP(HTTP)', () => {
  it('チケットとロールはヘッダーで結びつく。振り返り → 次へ、の順で進められる', async () => {
    await withServer(async ({ anvil, connect }) => {
      const s = anvil.service;
      const { project } = await s.projects.create(human, { name: 'p' });
      const { ticket } = await s.tickets.create(human, { projectId: project.id, title: 'x', state: 'refine' });
      await anvil.tasks.idle();
      const client = await connect({ 'x-anvil-ticket': String(ticket.id), 'x-anvil-role': 'ac_refiner' });

      const tools = (await client.listTools()).tools.map((t) => t.name);
      expect(tools).toEqual(expect.arrayContaining(['anvil_advance', 'anvil_ask', 'anvil_save_reflection', 'anvil_request_intake']));
      expect(tools).not.toContain('anvil_start'); // 結びつきのあるエージェントには、人間用のツールを出さない

      await client.callTool({ name: 'anvil_add_entry', arguments: { body: 'AC を確認した' } });
      expect((await s.tickets.detail(human, { ticketId: ticket.id })).detail.entries.at(-1)?.role).toBe('ac_refiner');

      await client.callTool({ name: 'anvil_save_reflection', arguments: { trouble: '特に無し', target: 'role' } });
      const { reflections } = await s.reflections.list(human, {});
      expect(reflections).toHaveLength(1);
      expect(reflections[0]?.role).toBe('ac_refiner');

      // 質問 → フラグ。フラグ中は進められない
      await client.callTool({ name: 'anvil_ask', arguments: { question: 'どちらですか' } });
      const blocked: any = await client.callTool({ name: 'anvil_advance', arguments: {} });
      expect(blocked.isError).toBe(true);
      expect(textOf(blocked)).toMatch(/承認待ち/);

      // 会話の中で人間が答えた内容を、代わりに記録する(書き手は人間)
      await client.callTool({ name: 'anvil_record_answer', arguments: { answer: 'A でお願いします' } });
      const { detail } = await s.tickets.detail(human, { ticketId: ticket.id });
      expect(detail.ticket.awaiting).toBe(false);
      expect(detail.entries.at(-1)?.role).toBe('human');

      const advanced: any = await client.callTool({ name: 'anvil_advance', arguments: { handoff: '次は実装方針' } });
      expect(advanced.isError).toBeFalsy();
      expect((await s.tickets.detail(human, { ticketId: ticket.id })).detail.ticket.state).toBe('dev_refine');
    });
  });

  it('担当でないロールは、結びつきがあっても、他の状態を進められない', async () => {
    await withServer(async ({ anvil, connect }) => {
      const s = anvil.service;
      const { project } = await s.projects.create(human, { name: 'p' });
      const { ticket } = await s.tickets.create(human, { projectId: project.id, title: 'x', state: 'refine' });
      await anvil.tasks.idle();
      const client = await connect({ 'x-anvil-ticket': String(ticket.id), 'x-anvil-role': 'coder' });
      const result: any = await client.callTool({ name: 'anvil_advance', arguments: {} });
      expect(result.isError).toBe(true);
      expect(textOf(result)).toMatch(/担当/);
    });
  });

  it('起票担当は、起票の依頼の項目に結びつく', async () => {
    await withServer(async ({ anvil, connect }) => {
      const s = anvil.service;
      const { project } = await s.projects.create(human, { name: 'p' });
      const { ticket: source } = await s.tickets.create(human, { projectId: project.id, title: '元', state: 'dev_refine' });
      await anvil.tasks.idle();
      const { intakeId } = await s.intakes.request(asRole(Role.IMPL_PLANNER), {
        sourceTicketId: source.id,
        discard: true,
        items: [{ wish: '前半' }],
      });
      await anvil.tasks.idle();
      const item = (await s.intakes.progress(human, { intakeId })).items[0];

      const client = await connect({
        'x-anvil-role': 'pbi_author',
        'x-anvil-intake-item': String(item?.id),
        'x-anvil-project': String(project.id),
      });
      await client.callTool({ name: 'anvil_create_ticket', arguments: { title: '前半', body: 'ペイン / ゲイン / AC' } });
      await anvil.tasks.idle();

      expect((await s.intakes.progress(human, { intakeId })).intake.status).toBe('done');
      await expect(s.tickets.detail(human, { ticketId: source.id })).rejects.toMatchObject({ code: 'not_found' }); // 元は破棄された
    });
  });

  it('人間が使う Claude(結びつきなし)は、ticketId を渡し、人間として振る舞う', async () => {
    await withServer(async ({ anvil, connect }) => {
      const s = anvil.service;
      const { project } = await s.projects.create(human, { name: 'p' });
      const { ticket } = await s.tickets.create(human, { projectId: project.id, title: 'x' });
      const client = await connect({});

      expect((await client.listTools()).tools.map((t) => t.name)).toContain('anvil_start');
      await client.callTool({ name: 'anvil_start', arguments: { ticketId: ticket.id } });
      expect((await s.tickets.detail(human, { ticketId: ticket.id })).detail.ticket.state).toBe('refine');

      await client.callTool({ name: 'anvil_add_entry', arguments: { ticketId: ticket.id, body: '人間の指示' } });
      expect((await s.tickets.detail(human, { ticketId: ticket.id })).detail.entries.at(-1)?.role).toBe('human');
    });
  });

  it('人間が使う Claude には、すべての操作をツールとして出す。ロールのエージェントには、限られたものだけ', async () => {
    await withServer(async ({ connect }) => {
      const humanTools = (await (await connect({})).listTools()).tools.map((t) => t.name);
      // 振り返りの保存は、ロールのエージェントだけの操作(サービスが人間を拒否する)
      const expected = OPERATIONS.filter((o) => o.id !== 'reflections.save').map((o) => o.mcp);
      expect([...humanTools].sort()).toEqual([...expected].sort());

      const agentTools = (await (await connect({ 'x-anvil-ticket': '1', 'x-anvil-role': 'coder' })).listTools()).tools.map((t) => t.name);
      expect(agentTools).toContain('anvil_save_reflection');
      for (const forbidden of [
        'anvil_pass_pre_design_gate',
        'anvil_pass_pre_impl_gate',
        'anvil_pass_pre_done_gate',
        'anvil_create_project',
      ]) {
        expect(agentTools).not.toContain(forbidden); // ゲートの判断と、プロジェクトの管理は、エージェントにさせない
      }
    });
  });

  it('人間が使う Claude は、プロジェクトを作って、一覧で読める', async () => {
    await withServer(async ({ connect }) => {
      const client = await connect({});
      const created = JSON.parse(textOf(await client.callTool({ name: 'anvil_create_project', arguments: { name: 'demo' } })));
      expect(created.project.name).toBe('demo');
      const listed = JSON.parse(textOf(await client.callTool({ name: 'anvil_list_projects', arguments: {} })));
      expect(listed.projects).toHaveLength(1);
    });
  });
});
