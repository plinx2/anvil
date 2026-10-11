// 偽の gh。呼び出しを FAKE_GH_LOG に記録し、`pr create` は PR の URL を返す。
import fs from 'node:fs';

fs.appendFileSync(process.env.FAKE_GH_LOG, `${JSON.stringify(process.argv.slice(2))}\n`);
if (process.argv[2] === 'pr' && process.argv[3] === 'create') console.log('Creating pull request...\nhttps://github.com/o/r/pull/7');
