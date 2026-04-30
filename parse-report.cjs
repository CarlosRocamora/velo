const fs = require('fs');
function readUtf16(path) {
  const buf = fs.readFileSync(path);
  if (buf[0] === 0xff && buf[1] === 0xfe) return buf.slice(2).toString('utf16le');
  if (buf[0] === 0xfe && buf[1] === 0xff) return buf.slice(2).toString('utf16le');
  return buf.toString('utf8');
}
let raw = readUtf16('pw-report.json');
raw = raw.substring(raw.indexOf('{'));
const data = JSON.parse(raw);

function traverseSuites(suites, specs = []) {
  for (const s of suites) {
    if (s.specs) specs.push(...s.specs);
    if (s.suites) traverseSuites(s.suites, specs);
  }
  return specs;
}

const specs = traverseSuites(data.suites || []);
for (const spec of specs) {
  for (const test of spec.tests) {
     const lastResult = test.results[test.results.length - 1];
     if (lastResult.status !== 'expected') {
        console.log(`--- FAIL: ${spec.title} ---`);
        if (lastResult.error) {
           console.log(lastResult.error.message.substring(0, 1000));
        }
     }
  }
}
