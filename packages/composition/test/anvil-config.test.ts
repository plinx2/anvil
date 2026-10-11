import { describe, expect, it } from 'vitest';
import { anvilConfigFromEnv } from '../src';

describe('anvilConfigFromEnv(環境変数から設定を作る)', () => {
  const config = (env: Record<string, string>) =>
    anvilConfigFromEnv({ ANVIL_HOME: '/tmp/anvil-home', ANVIL_AGENTS_DIR: '/tmp/agents', ...env });

  it('既定: エージェントは herdr + Claude Code、専用の herdr セッション anvil、PR は何もしない', () => {
    const c = config({});

    expect(c.agent).toBe('herdr-claude-cli');
    expect(c.herdrSession).toBe('anvil');
    expect(c.pullRequests).toBe('noop');
    expect(c.mcpUrl).toBe('http://127.0.0.1:4731/mcp');
    expect(c.agentsDir).toBe('/tmp/agents');
  });

  it('ANVIL_AGENT=noop だけが、エージェントを起動しない構成。ほかの値は既定(herdr)', () => {
    expect(config({ ANVIL_AGENT: 'noop' }).agent).toBe('noop');
    expect(config({ ANVIL_AGENT: 'herdr-claude-cli' }).agent).toBe('herdr-claude-cli');
    expect(config({ ANVIL_AGENT: 'typo' }).agent).toBe('herdr-claude-cli');
  });

  it('herdr のセッションは変えられる。空なら既定の anvil、default なら herdr の既定のセッション', () => {
    expect(config({ ANVIL_HERDR_SESSION: 'team-a' }).herdrSession).toBe('team-a');
    expect(config({ ANVIL_HERDR_SESSION: '' }).herdrSession).toBe('anvil');
    expect(config({ ANVIL_HERDR_SESSION: 'default' }).herdrSession).toBe('default');
  });

  it('PR は gh-cli を指定したときだけ作る。MCP のポートは変えられる', () => {
    expect(config({ ANVIL_PULL_REQUESTS: 'gh-cli' }).pullRequests).toBe('gh-cli');
    expect(config({ ANVIL_PULL_REQUESTS: 'x' }).pullRequests).toBe('noop');
    expect(config({ ANVIL_MCP_PORT: '5000' }).mcpUrl).toBe('http://127.0.0.1:5000/mcp');
    expect(config({ ANVIL_MCP_URL: 'http://h:1/mcp' }).mcpUrl).toBe('http://h:1/mcp');
  });
});
