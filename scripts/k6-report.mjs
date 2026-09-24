import fs from 'node:fs';
import path from 'node:path';

const input = process.argv[2];
const output = process.argv[3] ?? input?.replace(/\.json$/i, '.html');
if (!input) { console.error('Usage: node scripts/k6-report.mjs <summary.json> [report.html]'); process.exit(1); }
const summary = JSON.parse(fs.readFileSync(input, 'utf8'));
const metrics = summary.metrics ?? {};
const metric = (name) => metrics[name] ?? {};
const requests = metric('http_reqs').count ?? metric('grpc_status_codes').count ?? metric('iterations').count ?? 0;
const failed = Math.round((metric('http_req_failed').rate ?? metric('grpc_rpc_errors').rate ?? 0) * requests);
const checks = metric('checks');
const failedChecks = checks.fails ?? 0;
const breached = Object.values(metrics).reduce((n, item) => n + Object.values(item.thresholds ?? {}).filter((v) => v === false).length, 0);
const rows = Object.entries(metrics).filter(([name]) => /^(http_req_|grpc_req_|iteration_duration|rest_operation_duration)/.test(name)).map(([name, item]) => metricRow(name, item)).join('');
const checkRows = Object.entries(summary.root_group?.checks ?? {}).map(([name, item]) => `<tr><td>${esc(name)}</td><td>${item.passes ?? 0}</td><td>${item.fails ?? 0}</td><td>${item.fails ? '✗ Failed' : '✓ Passed'}</td></tr>`).join('');
const file = path.basename(input);
const html = `<!doctype html><html><head><meta charset="utf-8"><title>k6 Report</title><style>body{font:14px Arial;margin:0;background:#fff;color:#202124}main{max-width:1280px;margin:42px auto;padding:0 28px}h1{font-size:30px;margin-bottom:30px}.cards{display:grid;grid-template-columns:repeat(4,1fr);gap:24px}.card{color:#fff;border-radius:5px;padding:18px 22px;box-shadow:0 2px 5px #bbb}.card strong{display:block;font-size:18px}.card b{display:block;font-size:48px;margin-top:12px}.ok{background:#2dbb38}.bad{background:#ff6464}.tabs{margin-top:30px;border-bottom:3px solid #ddd;padding:12px 18px;font-size:18px;font-weight:bold}table{border-collapse:collapse;width:100%;box-shadow:0 1px 3px #ccc}th,td{padding:13px 16px;text-align:left;border:1px solid #d5d5d5}th{background:#e2e2e2}tr:nth-child(even){background:#f2f2f2}.note{color:#666}@media(max-width:800px){.cards{grid-template-columns:repeat(2,1fr)}}</style></head><body><main><h1>◢ k6 Performance Test: ${esc(file.replace('.json',''))}</h1><section class="cards"><div class="card ok"><strong>Total Requests</strong><b>${fmt(requests)}</b></div><div class="card ${failed ? 'bad' : 'ok'}"><strong>Failed Requests</strong><b>${fmt(failed)}</b></div><div class="card ${breached ? 'bad' : 'ok'}"><strong>Breached Thresholds</strong><b>${fmt(breached)}</b></div><div class="card ${failedChecks ? 'bad' : 'ok'}"><strong>Failed Checks</strong><b>${fmt(failedChecks)}</b></div></section><div class="tabs">◷ Request Metrics</div><table><thead><tr><th>Metric</th><th>Count</th><th>Rate</th><th>Average</th><th>Maximum</th><th>Median</th><th>Minimum</th><th>90th Percentile</th><th>95th Percentile</th></tr></thead><tbody>${rows}</tbody></table><div class="tabs">☷ Checks</div><table><thead><tr><th>Check</th><th>Passes</th><th>Fails</th><th>Status</th></tr></thead><tbody>${checkRows || '<tr><td colspan="4">No checks recorded</td></tr>'}</tbody></table><p class="note">All times are milliseconds. Generated from ${esc(file)}.</p></main></body></html>`;
fs.writeFileSync(output, html);
console.log(`HTML report written to ${output}`);
function metricRow(name, v) { return `<tr><td>${esc(name)}</td><td>${fmt(v.count)}</td><td>${rate(v.rate)}</td><td>${fmt(v.avg)}</td><td>${fmt(v.max)}</td><td>${fmt(v.med)}</td><td>${fmt(v.min)}</td><td>${fmt(v['p(90)'])}</td><td>${fmt(v['p(95)'])}</td></tr>`; }
function fmt(v) { return v === undefined || v === null ? '-' : typeof v === 'number' ? Number(v.toFixed(2)).toLocaleString() : esc(v); }
function rate(v) { return v === undefined || v === null ? '-' : `${(v * 100).toFixed(2)}%`; }
function esc(v) { return String(v).replace(/[&<>"']/g, (c) => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c])); }
