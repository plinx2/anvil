// 偽の gh。呼び出しを FAKE_GH_LOG に記録し、`pr create` は PR の URL を返す。
// `pr view` は、FAKE_GH_VIEW_OUTPUT を出力し、FAKE_GH_VIEW_EXIT があればその終了コードで終わる。
import fs from 'node:fs';

fs.appendFileSync(process.env.FAKE_GH_LOG, `${JSON.stringify(process.argv.slice(2))}\n`);
if (process.argv[2] === 'pr' && process.argv[3] === 'create') console.log('Creating pull request...\nhttps://github.com/o/r/pull/7');
if (process.argv[2] === 'pr' && process.argv[3] === 'view') {
  console.log(process.env.FAKE_GH_VIEW_OUTPUT ?? '');
  process.exit(Number(process.env.FAKE_GH_VIEW_EXIT ?? 0));
}
