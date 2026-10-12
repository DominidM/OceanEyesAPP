/**
 * parse-results.mjs
 *
 * Agrega los .jtl de las 15 ejecuciones (3 niveles x 5 repeticiones) y
 * produce las tablas del informe.
 *
 * IMPORTANTE: el JTL es CSV con campos entrecomillados que pueden contener
 * comas y saltos de linea (p. ej. responseMessage con el mensaje de error).
 * Por eso hay que parsear CSV de verdad y NO hacer split(',').
 *
 * Uso:  node parse-results.mjs [directorio-de-resultados]
 * Genera: results-tables.md y results.json
 */

import fs from 'node:fs';
import path from 'node:path';

const dir = process.argv[2] || path.join(process.cwd(), 'results');

/** Parser CSV que respeta comillas dobles y saltos de linea dentro de campos. */
function parseCsvLine(line) {
  const out = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (line[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        cur += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ',') {
      out.push(cur);
      cur = '';
    } else {
      cur += ch;
    }
  }
  out.push(cur);
  return out;
}

/** Lee el JTL completo respetando campos multilinea entrecomillados. */
function readRecords(file) {
  const raw = fs.readFileSync(file, 'utf8');
  const lines = raw.split('\n');

  let header = null;
  const records = [];
  let pending = null; // acumulador para registro multilinea

  for (let rawLine of lines) {
    const line = rawLine.replace(/\r$/, '');

    if (pending !== null) {
      // estamos dentro de un campo entrecomillado multilinea
      pending += '\n' + line;
      const closes = countQuotes(pending) % 2 === 0;
      if (closes) {
        records.push(parseCsvLine(pending));
        pending = null;
      }
      continue;
    }

    if (!line || line.startsWith('#')) continue;

    if (!header) {
      header = parseCsvLine(line);
      continue;
    }

    if (countQuotes(line) % 2 !== 0) {
      pending = line; // empieza un campo multilinea
      continue;
    }

    records.push(parseCsvLine(line));
  }

  if (pending !== null) records.push(parseCsvLine(pending));
  return { header, records };
}

function countQuotes(s) {
  let n = 0;
  for (let i = 0; i < s.length; i++) {
    if (s[i] === '"') {
      // cuenta solo las no escapadas
      if (s[i - 1] !== '\\') n++;
    }
  }
  return n;
}

function percentile(sortedArr, p) {
  if (!sortedArr.length) return 0;
  const idx = Math.min(sortedArr.length - 1, Math.floor((p / 100) * sortedArr.length));
  return sortedArr[idx];
}

function analyze(file) {
  const { header, records } = readRecords(file);
  if (!header || !records.length) return null;

  const idx = Object.fromEntries(header.map((h, i) => [h.trim(), i]));
  const need = ['timeStamp', 'elapsed', 'label', 'responseCode', 'success'];
  for (const k of need) {
    if (!(k in idx)) return null;
  }

  const samples = [];
  for (const r of records) {
    const elapsed = Number(r[idx.elapsed]);
    if (!Number.isFinite(elapsed)) continue;
    samples.push({
      timeStamp: Number(r[idx.timeStamp]) || 0,
      elapsed,
      label: r[idx.label],
      responseCode: r[idx.responseCode],
      success: r[idx.success] === 'true',
      message: r[idx.responseMessage] || '',
    });
  }
  if (!samples.length) return null;

  const start = Math.min(...samples.map((s) => s.timeStamp));
  const end = Math.max(...samples.map((s) => s.timeStamp + s.elapsed));
  const durationSec = (end - start) / 1000;

  const times = samples.map((s) => s.elapsed).sort((a, b) => a - b);
  const errors = samples.filter((s) => !s.success);

  const byCode = {};
  for (const s of samples) byCode[s.responseCode] = (byCode[s.responseCode] || 0) + 1;

  const byLabel = {};
  for (const s of samples) {
    (byLabel[s.label] ||= []).push(s.elapsed);
  }
  const labelStats = {};
  for (const [label, arr] of Object.entries(byLabel)) {
    const sorted = [...arr].sort((a, b) => a - b);
    labelStats[label] = {
      count: arr.length,
      avg: arr.reduce((a, b) => a + b, 0) / arr.length,
      p95: percentile(sorted, 95),
      max: sorted[sorted.length - 1],
    };
  }

  // Errores por tipo de mensaje (para explicar la causa del fallo).
  const errTypes = {};
  for (const e of errors) {
    const t = (e.message || 'sin mensaje').replace(/(Non HTTP response code: |java\.\S+|org\.\S+)/g, '').trim();
    errTypes[t] = (errTypes[t] || 0) + 1;
  }

  return {
    file: path.basename(file),
    samples: samples.length,
    durationSec,
    throughput: durationSec > 0 ? samples.length / durationSec : 0,
    avg: times.reduce((a, b) => a + b, 0) / times.length,
    p50: percentile(times, 50),
    p90: percentile(times, 90),
    p95: percentile(times, 95),
    p99: percentile(times, 99),
    max: times[times.length - 1],
    min: times[0],
    errorPct: (errors.length / samples.length) * 100,
    errors: errors.length,
    byCode,
    labelStats,
    errTypes,
  };
}

function levelFromName(name) {
  const m = name.match(/signup-n(\d+)r(\d+)/);
  if (!m) return null;
  return { nivel: Number(m[1]), corrida: Number(m[2]) };
}

const files = fs.readdirSync(dir).filter((f) => f.endsWith('.jtl'));
if (!files.length) {
  console.error(`No se encontraron .jtl en ${dir}`);
  process.exit(1);
}

const runs = [];
for (const f of files) {
  const meta = levelFromName(f);
  if (!meta) continue;
  const data = analyze(path.join(dir, f));
  if (data) runs.push({ ...meta, ...data });
}
runs.sort((a, b) => a.nivel - b.nivel || a.corrida - b.corrida);

const byLevel = {};
for (const r of runs) (byLevel[r.nivel] ||= []).push(r);

const levels = Object.keys(byLevel)
  .map(Number)
  .sort((a, b) => a - b)
  .map((nivel) => {
    const rs = byLevel[nivel];
    const totalSamples = rs.reduce((a, r) => a + r.samples, 0);
    const totalErrors = rs.reduce((a, r) => a + r.errors, 0);

    const codigos = {};
    const errTypes = {};
    for (const r of rs) {
      for (const [c, n] of Object.entries(r.byCode)) codigos[c] = (codigos[c] || 0) + n;
      for (const [t, n] of Object.entries(r.errTypes)) errTypes[t] = (errTypes[t] || 0) + n;
    }

    const lats = rs.map((r) => r.avg);
    const latMin = Math.min(...lats);
    const latMax = Math.max(...lats);

    return {
      nivel,
      replicas: rs.length,
      samples: totalSamples,
      errors: totalErrors,
      errorPct: (totalErrors / totalSamples) * 100,
      avgTps: rs.reduce((a, r) => a + r.throughput, 0) / rs.length,
      avgLat: rs.reduce((a, r) => a + r.avg, 0) / rs.length,
      avgP95: rs.reduce((a, r) => a + r.p95, 0) / rs.length,
      avgP99: rs.reduce((a, r) => a + r.p99, 0) / rs.length,
      latMin,
      latMax,
      variacion: latMin > 0 ? ((latMax - latMin) / latMin) * 100 : 0,
      codigos,
      errTypes,
      runs: rs,
    };
  });

const n = (x, d = 1) => Number(x).toFixed(d);
const out = [];

out.push('## Resultados por corrida\n');
out.push('| Nivel | Corrida | Muestras | TPS | Lat. media (ms) | p95 (ms) | max (ms) | Errores |');
out.push('|---:|---:|---:|---:|---:|---:|---:|---:|');
for (const r of runs) {
  out.push(
    `| ${r.nivel} | ${r.corrida} | ${r.samples} | ${n(r.throughput)} | ${n(r.avg)} | ${n(r.p95)} | ${n(r.max)} | ${r.errors} (${n(r.errorPct, 2)}%) |`
  );
}

out.push('\n## Resultados por nivel (promedio de 5 replicas)\n');
out.push('| Nivel | Replicas | Muestras | Errores | % error | TPS prom. | Lat. media (ms) | p95 prom. (ms) | p99 prom. (ms) | Variacion |');
out.push('|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|');
for (const l of levels) {
  out.push(
    `| ${l.nivel} | ${l.replicas} | ${l.samples} | ${l.errors} | ${n(l.errorPct, 2)}% | ${n(l.avgTps)} | ${n(l.avgLat)} | ${n(l.avgP95)} | ${n(l.avgP99)} | ±${n(l.variacion)}% |`
  );
}

out.push('\n## Latencia por sampler (por nivel, promedio de sus 5 réplicas)\n');
out.push('| Nivel | Sampler | Muestras | Media (ms) | p95 (ms) | Max (ms) |');
out.push('|---:|---|---:|---:|---:|---:|');
for (const l of levels) {
  const acc = {};
  for (const r of l.runs) {
    for (const [label, st] of Object.entries(r.labelStats)) {
      (acc[label] ||= { count: 0, sumAvg: 0, sumP95: 0, max: 0, n: 0 });
      acc[label].count += st.count;
      acc[label].sumAvg += st.avg;
      acc[label].sumP95 += st.p95;
      acc[label].max = Math.max(acc[label].max, st.max);
      acc[label].n++;
    }
  }
  for (const [label, a] of Object.entries(acc)) {
    out.push(`| ${l.nivel} | ${label} | ${a.count} | ${n(a.sumAvg / a.n)} | ${n(a.sumP95 / a.n)} | ${n(a.max)} |`);
  }
}

out.push('\n## Codigos de respuesta por nivel\n');
const allCodes = [...new Set(levels.flatMap((l) => Object.keys(l.codigos)))].sort();
out.push(`| Nivel | ${allCodes.join(' | ')} |`);
out.push(`|---${allCodes.map(() => ':---').join('|')}|`);
for (const l of levels) {
  out.push(`| ${l.nivel} | ${allCodes.map((c) => l.codigos[c] ?? 0).join(' | ')} |`);
}

out.push('\n## Tipos de error (mensajes del servidor)\n');
for (const l of levels) {
  const keys = Object.keys(l.errTypes).sort((a, b) => l.errTypes[b] - l.errTypes[a]).slice(0, 6);
  if (!keys.length) continue;
  out.push(`\n**Nivel ${l.nivel}:**`);
  for (const k of keys) out.push(`- \`${k}\` → ${l.errTypes[k]}`);
}

const md = out.join('\n');
fs.writeFileSync(path.join(dir, 'results-tables.md'), md, 'utf8');
fs.writeFileSync(path.join(dir, 'results.json'), JSON.stringify({ generatedAt: new Date().toISOString(), levels, runs }, null, 2), 'utf8');

console.log(md);
console.log(`\n[OK] results-tables.md y results.json escritos en ${dir}`);