import type { AnvilService } from '@anvil/service';
import type { InProcessTaskRunner } from '@anvil/system';
import type { AnvilConfig } from './anvil-config';
import type { AnvilPorts } from './anvil-ports';
import { type AnvilFakes, createPorts } from './create-ports';
import { createServices } from './create-services';
import { type AnvilUseCases, createUseCases } from './create-use-cases';

export * from './anvil-config';
export type { AnvilPorts } from './anvil-ports';
export type { AnvilFakes } from './create-ports';
export type { AnvilUseCases } from './create-use-cases';

export interface Anvil {
  config: AnvilConfig;
  /** transport(HTTP、MCP、コマンド)が使う、機能の入口 */
  service: AnvilService;
  useCases: AnvilUseCases;
  ports: AnvilPorts;
  /** 結果を待たない処理の完了を待てる(終了処理、テスト) */
  tasks: InProcessTaskRunner;
  /** 何もしない実装を選んだときの、記録 */
  fakes: AnvilFakes;
}

/** 設定に従って、anvil を組み立てる。 */
export function createAnvil(config: AnvilConfig): Anvil {
  const { ports, tasks, fakes } = createPorts(config);
  const useCases = createUseCases(ports);
  return { config, service: createServices(useCases), useCases, ports, tasks, fakes };
}
