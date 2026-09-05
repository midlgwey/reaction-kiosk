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
  '01': 'Ene', '02': 'Feb', '03': 'Mar', '04': 'Abr',
  '05': 'May', '06': 'Jun', '07': 'Jul', '08': 'Ago',
  '09': 'Sep', '10': 'Oct', '11': 'Nov', '12': 'Dic'
};

// ─── Estilos ─────────────────────────────────────────────────────────────────

const border = {
  top: { style: 'thin' }, bottom: { style: 'thin' },
  left: { style: 'thin' }, right: { style: 'thin' }
};

const S = {
  header:          { font: { bold: true, color: { rgb: 'FFFFFF' }, sz: 11 }, fill: { fgColor: { rgb: '4F46E5' } }, alignment: { horizontal: 'center', vertical: 'center', wrapText: true }, border },
  headerDark:      { font: { bold: true, color: { rgb: 'FFFFFF' }, sz: 11 }, fill: { fgColor: { rgb: '1E293B' } }, alignment: { horizontal: 'center', vertical: 'center' }, border },
  headerGold:      { font: { bold: true, color: { rgb: 'FFFFFF' }, sz: 11 }, fill: { fgColor: { rgb: 'B45309' } }, alignment: { horizontal: 'center', vertical: 'center' }, border },
  cell:            { alignment: { vertical: 'center', wrapText: true }, border },
  cellCenter:      { alignment: { horizontal: 'center', vertical: 'center' }, border },
  cellStripe:      { alignment: { vertical: 'center', wrapText: true }, fill: { fgColor: { rgb: 'F8FAFC' } }, border },
  cellCenterStripe:{ alignment: { horizontal: 'center', vertical: 'center' }, fill: { fgColor: { rgb: 'F8FAFC' } }, border },
  positive:        { font: { bold: true, color: { rgb: '16A34A' } }, alignment: { horizontal: 'center', vertical: 'center' }, border },
  negative:        { font: { bold: true, color: { rgb: 'DC2626' } }, alignment: { horizontal: 'center', vertical: 'center' }, border },
  mixed:           { font: { bold: true, color: { rgb: 'D97706' } }, alignment: { horizontal: 'center', vertical: 'center' }, border },
  sectionTitle:    { font: { bold: true, color: { rgb: '1E293B' }, sz: 12 }, fill: { fgColor: { rgb: 'E2E8F0' } }, alignment: { horizontal: 'left', vertical: 'center' }, border },
  empty:           { fill: { fgColor: { rgb: 'F8FAFC' } }, border }
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

// ─── Hoja 1: Resumen por mes ─────────────────────────────────────────────────

const buildResumenSheet = (sortedKeys, grouped) => {
  const ws = {};
  addRow(ws, 0, ['Mes', 'Total', 'Positivos ✓', 'Negativos ✗', 'Quejas Mixtas ⚠', 'Neutrales', '% Críticos'].map(h => cell(h, S.headerDark)));

  sortedKeys.forEach((key, i) => {
    const [year, month] = key.split('-');
    const rows  = grouped[key];
    const total = rows.length;
    const pos   = rows.filter(r => r.sentiment === 'Positive').length;
    const neg   = rows.filter(r => r.sentiment === 'Negative').length;
    const mix   = rows.filter(r => r.sentiment === 'Review').length;
    const neu   = rows.filter(r => r.sentiment === 'Neutral' || r.sentiment === 'Pending').length;
    const pct   = total > 0 ? `${Math.round(((neg + mix) / total) * 100)}%` : '0%';
    const s     = i % 2 === 0 ? S.cellCenterStripe : S.cellCenter;

    addRow(ws, i + 1, [
      cell(`${MONTH_NAMES[month]} ${year}`, s),
      cell(total, s),
      cell(pos,   S.positive),
      cell(neg,   S.negative),
      cell(mix,   S.mixed),
      cell(neu,   s),
      cell(pct,   s),
    ]);
  });

  ws['!cols'] = [{ wch: 14 }, { wch: 10 }, { wch: 14 }, { wch: 14 }, { wch: 16 }, { wch: 12 }, { wch: 12 }];
  updateRef(ws, sortedKeys.length, 6);
  return ws;
};

// ─── Hoja 2: Rankings por mes (solo rankings, limpia) ────────────────────────

const buildRankingsSheet = (sortedKeys, grouped) => {
  const ws = {};
  addRow(ws, 0, ['Mes', '⭐ Más Comentarios', '✓ Más Positivos', '✗ Más Negativos / Mixtas'].map(h => cell(h, S.headerGold)));

  sortedKeys.forEach((key, i) => {
    const [year, month] = key.split('-');
    const rows   = grouped[key].filter(r => r.mesero && r.mesero !== 'Sin asignar');
    const s      = i % 2 === 0 ? S.cellCenterStripe : S.cellCenter;
    const label  = `${MONTH_NAMES[month]} ${year}`;

    if (rows.length === 0) {
      addRow(ws, i + 1, [cell(label, s), cell('Sin datos', s), cell('Sin datos', s), cell('Sin datos', s)]);
      return;
    }

    const byWaiter = {};
    rows.forEach(r => {
      if (!byWaiter[r.mesero]) byWaiter[r.mesero] = { total: 0, pos: 0, neg: 0 };
      byWaiter[r.mesero].total++;
      if (r.sentiment === 'Positive') byWaiter[r.mesero].pos++;
      if (r.sentiment === 'Negative' || r.sentiment === 'Review') byWaiter[r.mesero].neg++;
    });

    const entries    = Object.entries(byWaiter);
    const topTotal   = [...entries].sort((a, b) => b[1].total - a[1].total)[0];
    const topPos     = [...entries].sort((a, b) => b[1].pos   - a[1].pos)[0];
    const topNeg     = [...entries].sort((a, b) => b[1].neg   - a[1].neg)[0];

    addRow(ws, i + 1, [
      cell(label,                                        s),
      cell(`${topTotal[0]} (${topTotal[1].total})`,     s),
      cell(`${topPos[0]} (${topPos[1].pos})`,           S.positive),
      cell(`${topNeg[0]} (${topNeg[1].neg})`,           S.negative),
    ]);
  });

  ws['!cols'] = [{ wch: 14 }, { wch: 26 }, { wch: 26 }, { wch: 26 }];
  updateRef(ws, sortedKeys.length, 3);
  return ws;
};

// ─── Hoja por mes: comentarios + detalle de meseros ──────────────────────────

const buildMonthSheet = (rows) => {
  const ws = {};
  let row = 0;

  // ── Sección 1: Comentarios individuales ──
  addRow(ws, row, [cell('📋  COMENTARIOS DEL MES', S.sectionTitle), empty(), empty(), empty(), empty(), empty(), empty(), empty()]);
  row++;

  const commentHeaders = ['#', 'Fecha', 'Hora', 'Turno', 'Mesa', 'Mesero', 'Sentimiento', 'Sugerencia'];
  addRow(ws, row, commentHeaders.map(h => cell(h, S.header)));
  row++;

  rows.forEach((item, i) => {
    const date  = new Date(item.date);
    const stripe = i % 2 === 0;
    const cs    = stripe ? S.cellCenterStripe : S.cellCenter;

    addRow(ws, row, [
      cell(i + 1,                                                                             cs),
      cell(date.toLocaleDateString('es-MX'),                                                 cs),
      cell(date.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }),         cs),
      cell(item.shift        || '—',                                                          cs),
      cell(item.table_number || '—',                                                          cs),
      cell(item.mesero       || 'Sin asignar',  stripe ? S.cellStripe : S.cell),
      cell(SENTIMENT_LABEL[item.sentiment] || 'Neutral',                                      cs),
      cell(item.comment      || '',             stripe ? S.cellStripe : S.cell),
    ]);
    row++;
  });

  // Fila vacía entre secciones
  row++;

  // ── Sección 2: Detalle por mesero ──
  addRow(ws, row, [cell('👤  DETALLE POR MESERO', S.sectionTitle), empty(), empty(), empty(), empty(), empty(), empty(), empty()]);
  row++;

  const waiterHeaders = ['Mesero', 'Total', 'Positivos', 'Negativos', 'Quejas Mixtas', 'Neutrales', '% Críticos'];
  addRow(ws, row, waiterHeaders.map(h => cell(h, S.headerDark)));
  row++;

  // Agrupar por mesero
  const byWaiter = {};
  rows.forEach(r => {
    const name = r.mesero || 'Sin asignar';
    if (!byWaiter[name]) byWaiter[name] = { total: 0, pos: 0, neg: 0, mix: 0, neu: 0 };
    byWaiter[name].total++;
    if (r.sentiment === 'Positive') byWaiter[name].pos++;
    else if (r.sentiment === 'Negative') byWaiter[name].neg++;
    else if (r.sentiment === 'Review')   byWaiter[name].mix++;
    else byWaiter[name].neu++;
  });

  const sorted = Object.entries(byWaiter).sort((a, b) => {
    if (a[0] === 'Sin asignar') return 1;
    if (b[0] === 'Sin asignar') return -1;
    return b[1].total - a[1].total;
  });

  sorted.forEach(([name, d], i) => {
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

  ws['!cols'] = [
    { wch: 22 }, { wch: 12 }, { wch: 8 }, { wch: 14 },
    { wch: 8 }, { wch: 20 }, { wch: 14 }, { wch: 55 }
  ];
  updateRef(ws, row, 7);
  // Merge de títulos de sección — debe ir DESPUÉS de updateRef para que ws['!ref'] exista
  ws['!merges'] = [];
  const wsRange = XLSX.utils.decode_range(ws['!ref']);
  for (let R = 0; R <= wsRange.e.r; R++) {
    const addr = XLSX.utils.encode_cell({ r: R, c: 0 });
    if (ws[addr] && typeof ws[addr].v === 'string' &&
       (ws[addr].v.includes('COMENTARIOS DEL MES') || ws[addr].v.includes('DETALLE POR MESERO'))) {
      ws['!merges'].push({ s: { r: R, c: 0 }, e: { r: R, c: 7 } });
    }
  }
  return ws;
};

// ─── Export principal ─────────────────────────────────────────────────────────

export const downloadExcel = (comments, fileName = 'Reporte_Sugerencias.xlsx') => {
  if (!comments || comments.length === 0) return;

  const grouped = {};
  comments.forEach(item => {
    const date  = new Date(item.date);
    const year  = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const key   = `${year}-${month}`;
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(item);
  });

  const sortedKeys = Object.keys(grouped).sort();
  const workbook   = XLSX.utils.book_new();

  // 1. Resumen
  XLSX.utils.book_append_sheet(workbook, buildResumenSheet(sortedKeys, grouped), 'Resumen');

  // 2. Rankings (hoja limpia, solo la tabla de rankings)
  XLSX.utils.book_append_sheet(workbook, buildRankingsSheet(sortedKeys, grouped), 'Rankings');

  // 3. Una hoja por mes con comentarios + detalle de meseros
  sortedKeys.forEach(key => {
    const [year, month] = key.split('-');
    XLSX.utils.book_append_sheet(workbook, buildMonthSheet(grouped[key]), `${MONTH_NAMES[month]} ${year}`);
  });

  XLSX.writeFile(workbook, fileName);
};