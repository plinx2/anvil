// 偽の herdr。実機で確かめた herdr 0.9.3 の振る舞い(名前の規則、サーバー未起動、起動中のブロック)だけを再現する。
// 状態は FAKE_HERDR_STATE のファイル(JSON)に持ち、呼び出しを calls に記録する。FAKE_HERDR_BLOCK=1 で、agent start が起動中にブロックされる。
import fs from 'node:fs';

const stateFile = process.env.FAKE_HERDR_STATE;
const state = fs.existsSync(stateFile)
  ? JSON.parse(fs.readFileSync(stateFile, 'utf8'))
  : { sessions: { default: { running: true } }, calls: [] };
const save = () => fs.writeFileSync(stateFile, JSON.stringify(state));
const out = (result) => {
  save();
  console.log(JSON.stringify({ id: 'fake', result }));
};
const fail = (code, message) => {
  save();
  console.error(JSON.stringify({ error: { code, message }, id: 'fake' }));
  process.exit(1);
};

let args = process.argv.slice(2);
let session = 'default';
if (args[0] === '--session') {
  session = args[1];
  args = args.slice(2);
}
state.calls.push({ session, args });
state.sessions[session] ??= { running: false };
const s = state.sessions[session];
s.workspaces ??= [];
s.panes ??= [];
s.agents ??= [];
s.next ??= 1;
const flag = (name) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : undefined;
};

if (args[0] === 'server') {
  s.running = true;
  save();
  process.exit(0);
}
if (!s.running) fail('server_not_running', `no herdr server is running for session ${session}`);

const [group, command] = args;
if (group === 'workspace' && command === 'list') out({ type: 'workspace_list', workspaces: s.workspaces });
else if (group === 'workspace' && command === 'create') {
  const workspace = { label: flag('--label'), workspace_id: `w${s.next++}` };
  s.workspaces.push(workspace);
  out({ workspace });
} else if (group === 'tab' && command === 'create') {
  const pane = { pane_id: `p${s.next++}`, workspace_id: flag('--workspace'), label: flag('--label'), cwd: flag('--cwd') };
  s.panes.push(pane);
  out({ root_pane: pane });
} else if (group === 'agent' && command === 'start') {
  const name = args[2];
  if (!/^[a-z][a-z0-9_-]{0,31}$/.test(name)) {
    fail(
      'invalid_agent_name',
      "agent name must start with a lowercase letter and contain only lowercase letters, digits, '-' or '_' (1-32 characters)",
    );
  }
  if (s.agents.some((a) => a.name === name)) fail('agent_name_taken', `agent name ${name} is already used`);
  s.agents.push({ name, pane_id: flag('--pane'), args: args.slice(args.indexOf('--') + 1) });
  if (process.env.FAKE_HERDR_BLOCK === '1') fail('agent_not_ready', `agent ${name} is blocked during startup and is not ready for prompts`);
  out({ agent: { name } });
} else if (group === 'agent' && command === 'prompt') {
  const agent = s.agents.find((a) => a.name === args[2]);
  if (!agent) fail('agent_not_found', `no agent ${args[2]}`);
  agent.prompts ??= [];
  agent.prompts.push(args[3]);
  out({});
} else if (group === 'agent' && command === 'list') out({ type: 'agent_list', agents: s.agents });
else if (group === 'agent' && command === 'get') {
  const agent = s.agents.find((a) => a.name === args[2]);
  if (!agent) fail('agent_not_found', `no agent ${args[2]}`);
  out({ agent });
} else if (group === 'pane' && command === 'close') {
  s.panes = s.panes.filter((p) => p.pane_id !== args[2]);
  s.agents = s.agents.filter((a) => a.pane_id !== args[2]);
  out({ type: 'ok' });
} else if (group === 'agent' && command === 'focus') out({});
else fail('unknown_command', args.join(' '));
