import * as XLSX from 'xlsx-js-style';

// ─── Catálogos ───────────────────────────────────────────────────────────────

const SENTIMENT_LABEL = {
  'Positive': 'Positivo',
  'Negative': 'Negativo',
  'Neutral':  'Neutral',
  'Review':   'Queja Mixta',
  'Pending':  'Pendiente'
};

const MONTH_NAMES = {
  '01': 'Enero', '02': 'Febrero', '03': 'Marzo', '04': 'Abril',
  '05': 'Mayo', '06': 'Junio', '07': 'Julio', '08': 'Agosto',
  '09': 'Septiembre', '10': 'Octubre', '11': 'Noviembre', '12': 'Diciembre'
};

// ─── Estilos ─────────────────────────────────────────────────────────────────

const border = {
  top: { style: 'thin' }, bottom: { style: 'thin' },
  left: { style: 'thin' }, right: { style: 'thin' }
};

const S = {
  header:           { font: { bold: true, color: { rgb: 'FFFFFF' }, sz: 11 }, fill: { fgColor: { rgb: '4F46E5' } }, alignment: { horizontal: 'center', vertical: 'center', wrapText: true }, border },
  headerDark:       { font: { bold: true, color: { rgb: 'FFFFFF' }, sz: 11 }, fill: { fgColor: { rgb: '1E293B' } }, alignment: { horizontal: 'center', vertical: 'center' }, border },
  headerGold:       { font: { bold: true, color: { rgb: 'FFFFFF' }, sz: 11 }, fill: { fgColor: { rgb: 'B45309' } }, alignment: { horizontal: 'center', vertical: 'center' }, border },
  cell:             { alignment: { vertical: 'center', wrapText: true }, border },
  cellCenter:       { alignment: { horizontal: 'center', vertical: 'center' }, border },
  cellStripe:       { alignment: { vertical: 'center', wrapText: true }, fill: { fgColor: { rgb: 'F8FAFC' } }, border },
  cellCenterStripe: { alignment: { horizontal: 'center', vertical: 'center' }, fill: { fgColor: { rgb: 'F8FAFC' } }, border },
  positive:         { font: { bold: true, color: { rgb: '16A34A' } }, alignment: { horizontal: 'center', vertical: 'center' }, border },
  negative:         { font: { bold: true, color: { rgb: 'DC2626' } }, alignment: { horizontal: 'center', vertical: 'center' }, border },
  mixed:            { font: { bold: true, color: { rgb: 'D97706' } }, alignment: { horizontal: 'center', vertical: 'center' }, border },
  sectionTitle:     { font: { bold: true, color: { rgb: '1E293B' }, sz: 12 }, fill: { fgColor: { rgb: 'E2E8F0' } }, alignment: { horizontal: 'left', vertical: 'center' }, border },
  empty:            { fill: { fgColor: { rgb: 'F8FAFC' } }, border }
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

const cell  = (v, s) => ({ v, s, t: typeof v === 'number' ? 'n' : 's' });
const empty = ()     => ({ v: '', s: S.empty, t: 's' });

const addRow = (ws, rowIndex, cells) => {
  cells.forEach((c, colIndex) => {
    ws[XLSX.utils.encode_cell({ r: rowIndex, c: colIndex })] = c;
  });
};

const updateRef = (ws, maxRow, maxCol) => {
  ws['!ref'] = XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: maxRow, c: maxCol } });
};

const applyMerges = (ws) => {
  ws['!merges'] = [];
  const range = XLSX.utils.decode_range(ws['!ref']);
  for (let R = 0; R <= range.e.r; R++) {
    const addr = XLSX.utils.encode_cell({ r: R, c: 0 });
    if (ws[addr] && typeof ws[addr].v === 'string' &&
      (ws[addr].v.includes('COMENTARIOS DEL MES') || ws[addr].v.includes('DETALLE POR MESERO'))) {
      ws['!merges'].push({ s: { r: R, c: 0 }, e: { r: R, c: 7 } });
    }
  }
};

// ─── Hoja 1: Resumen del mes ──────────────────────────────────────────────────

const buildResumenSheet = (rows, monthLabel) => {
  const ws = {};
  addRow(ws, 0, ['Mes', 'Total', 'Positivos ✓', 'Negativos ✗', 'Quejas Mixtas ⚠', 'Neutrales', '% Críticos'].map(h => cell(h, S.headerDark)));

  const total = rows.length;
  const pos   = rows.filter(r => r.sentiment === 'Positive').length;
  const neg   = rows.filter(r => r.sentiment === 'Negative').length;
  const mix   = rows.filter(r => r.sentiment === 'Review').length;
  const neu   = rows.filter(r => r.sentiment === 'Neutral' || r.sentiment === 'Pending').length;
  const pct   = total > 0 ? `${Math.round(((neg + mix) / total) * 100)}%` : '0%';

  addRow(ws, 1, [
    cell(monthLabel,  S.cellCenter),
    cell(total,       S.cellCenter),
    cell(pos,         S.positive),
    cell(neg,         S.negative),
    cell(mix,         S.mixed),
    cell(neu,         S.cellCenter),
    cell(pct,         S.cellCenter),
  ]);

  ws['!cols'] = [{ wch: 14 }, { wch: 10 }, { wch: 14 }, { wch: 14 }, { wch: 16 }, { wch: 12 }, { wch: 12 }];
  updateRef(ws, 1, 6);
  return ws;
};

// ─── Hoja 2: Detalle por mesero ───────────────────────────────────────────────

const buildMeserosSheet = (rows, monthLabel) => {
  const ws = {};
  let row = 0;

  // ── Rankings ──
  addRow(ws, row, ['Mes', '⭐ Más Comentarios', '✓ Más Positivos', '✗ Más Negativos / Mixtas'].map(h => cell(h, S.headerGold)));
  row++;

  const withWaiter = rows.filter(r => r.mesero && r.mesero !== 'Sin asignar');
  if (withWaiter.length === 0) {
    addRow(ws, row, [cell(monthLabel, S.cellCenter), cell('Sin datos', S.cellCenter), cell('Sin datos', S.cellCenter), cell('Sin datos', S.cellCenter)]);
    row++;
  } else {
    const byWaiter = {};
    withWaiter.forEach(r => {
      if (!byWaiter[r.mesero]) byWaiter[r.mesero] = { total: 0, pos: 0, neg: 0 };
      byWaiter[r.mesero].total++;
      if (r.sentiment === 'Positive') byWaiter[r.mesero].pos++;
      if (r.sentiment === 'Negative' || r.sentiment === 'Review') byWaiter[r.mesero].neg++;
    });
    const entries  = Object.entries(byWaiter);
    const topTotal = [...entries].sort((a, b) => b[1].total - a[1].total)[0];
    const topPos   = [...entries].sort((a, b) => b[1].pos   - a[1].pos)[0];
    const topNeg   = [...entries].sort((a, b) => b[1].neg   - a[1].neg)[0];

    addRow(ws, row, [
      cell(monthLabel,                                      S.cellCenter),
      cell(`${topTotal[0]} (${topTotal[1].total})`,        S.cellCenter),
      cell(`${topPos[0]} (${topPos[1].pos})`,              S.positive),
      cell(`${topNeg[0]} (${topNeg[1].neg})`,              S.negative),
    ]);
    row++;
  }

  row++; // separador

  // ── Detalle completo ──
  addRow(ws, row, ['Mesero', 'Total', 'Positivos', 'Negativos', 'Quejas Mixtas', 'Neutrales', '% Críticos'].map(h => cell(h, S.headerDark)));
  row++;

  const byWaiterAll = {};
  rows.forEach(r => {
    const name = r.mesero || 'Sin asignar';
    if (!byWaiterAll[name]) byWaiterAll[name] = { total: 0, pos: 0, neg: 0, mix: 0, neu: 0 };
    byWaiterAll[name].total++;
    if (r.sentiment === 'Positive') byWaiterAll[name].pos++;
    else if (r.sentiment === 'Negative') byWaiterAll[name].neg++;
    else if (r.sentiment === 'Review')   byWaiterAll[name].mix++;
    else byWaiterAll[name].neu++;
  });

  Object.entries(byWaiterAll)
    .sort((a, b) => {
      if (a[0] === 'Sin asignar') return 1;
      if (b[0] === 'Sin asignar') return -1;
      return b[1].total - a[1].total;
    })
    .forEach(([name, d], i) => {
      const stripe = i % 2 === 0;
      const cs     = stripe ? S.cellCenterStripe : S.cellCenter;
      const pct    = d.total > 0 ? `${Math.round(((d.neg + d.mix) / d.total) * 100)}%` : '0%';
      addRow(ws, row, [
        cell(name,    stripe ? S.cellStripe : S.cell),
        cell(d.total, cs),
        cell(d.pos,   S.positive),
        cell(d.neg,   S.negative),
        cell(d.mix,   S.mixed),
        cell(d.neu,   cs),
        cell(pct,     cs),
      ]);
      row++;
    });

  ws['!cols'] = [{ wch: 22 }, { wch: 10 }, { wch: 12 }, { wch: 12 }, { wch: 16 }, { wch: 12 }, { wch: 12 }];
  updateRef(ws, row, 6);
  return ws;
};

// ─── Hoja 3: Comentarios del mes ─────────────────────────────────────────────

const buildComentariosSheet = (rows) => {
  const ws = {};
  let row = 0;

  addRow(ws, row, [cell('📋  COMENTARIOS DEL MES', S.sectionTitle), empty(), empty(), empty(), empty(), empty(), empty(), empty()]);
  row++;

  addRow(ws, row, ['#', 'Fecha', 'Hora', 'Turno', 'Mesa', 'Mesero', 'Sentimiento', 'Sugerencia'].map(h => cell(h, S.header)));
  row++;

  rows.forEach((item, i) => {
    const date   = new Date(item.date);
    const stripe = i % 2 === 0;
    const cs     = stripe ? S.cellCenterStripe : S.cellCenter;

    addRow(ws, row, [
      cell(i + 1,                                                                            cs),
      cell(date.toLocaleDateString('es-MX'),                                                cs),
      cell(date.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }),        cs),
      cell(item.shift        || '—',                                                         cs),
      cell(item.table_number || '—',                                                         cs),
      cell(item.mesero       || 'Sin asignar', stripe ? S.cellStripe : S.cell),
      cell(SENTIMENT_LABEL[item.sentiment] || 'Neutral',                                     cs),
      cell(item.comment      || '',            stripe ? S.cellStripe : S.cell),
    ]);
    row++;
  });

  ws['!cols'] = [
    { wch: 5 }, { wch: 12 }, { wch: 8 }, { wch: 14 },
    { wch: 8 }, { wch: 22 }, { wch: 14 }, { wch: 55 }
  ];

  updateRef(ws, row, 7);
  applyMerges(ws);
  return ws;
};

// ─── Util: obtener meses disponibles desde el array de comentarios ────────────

export const getAvailableMonths = (comments) => {
  if (!comments || comments.length === 0) return [];

  const seen = new Set();
  const months = [];

  comments.forEach(item => {
    const date  = new Date(item.date);
    const year  = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const key   = `${year}-${month}`;

    if (!seen.has(key)) {
      seen.add(key);
      months.push({
        key,
        label: `${MONTH_NAMES[month]} ${year}`
      });
    }
  });

  // Ordenar cronológicamente más reciente primero
  return months.sort((a, b) => b.key.localeCompare(a.key));
};

// ─── Export principal ─────────────────────────────────────────────────────────

export const downloadExcel = (comments, selectedKey, fileName) => {
  if (!comments || comments.length === 0) return;

  const [year, month] = selectedKey.split('-');
  const monthLabel    = `${MONTH_NAMES[month]} ${year}`;

  // Filtrar solo los comentarios del mes seleccionado
  const rows = comments.filter(item => {
    const date = new Date(item.date);
    const y    = String(date.getFullYear());
    const m    = String(date.getMonth() + 1).padStart(2, '0');
    return y === year && m === month;
  });

  if (rows.length === 0) return;

  const workbook = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(workbook, buildResumenSheet(rows, monthLabel),   'Resumen');
  XLSX.utils.book_append_sheet(workbook, buildMeserosSheet(rows, monthLabel),   'Meseros');
  XLSX.utils.book_append_sheet(workbook, buildComentariosSheet(rows),           'Comentarios');

  XLSX.writeFile(workbook, fileName || `Reporte_Sugerencias_${monthLabel}.xlsx`);
};