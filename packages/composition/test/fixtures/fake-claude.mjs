// 偽の claude。`claude -p <prompt> --model <model>` の、PR 本文の生成だけを再現する。
const args = process.argv.slice(2);
const prompt = args[args.indexOf('-p') + 1];
const model = args[args.indexOf('--model') + 1];
console.log(`  \nmodel=${model}\n${prompt}\n`);
