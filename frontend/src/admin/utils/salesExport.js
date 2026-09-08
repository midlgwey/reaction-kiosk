// frontend/src/admin/utils/salesExcelExport.js
import * as XLSX from 'xlsx-js-style';

// ─── Catálogos ───────────────────────────────────────────────────────────────

const MONTH_NAMES = {
  '08': 'Agosto', '09': 'Septiembre', '10': 'Octubre'
};

const SEMAFORO_LABEL = {
  green:  '🟢 Al corriente',
  orange: '🟠 Ligeramente atrás',
  blue:   '🔵 Atrasado',
  red:    '🔴 Atención urgente'
};

// ─── Estilos ─────────────────────────────────────────────────────────────────

const border = {
  top: { style: 'thin' }, bottom: { style: 'thin' },
  left: { style: 'thin' }, right: { style: 'thin' }
};

const S = {
  // Headers
  headerIndigo:  { font: { bold: true, color: { rgb: 'FFFFFF' }, sz: 11 }, fill: { fgColor: { rgb: '4F46E5' } }, alignment: { horizontal: 'center', vertical: 'center', wrapText: true }, border },
  headerDark:    { font: { bold: true, color: { rgb: 'FFFFFF' }, sz: 11 }, fill: { fgColor: { rgb: '1E293B' } }, alignment: { horizontal: 'center', vertical: 'center' }, border },
  headerGold:    { font: { bold: true, color: { rgb: 'FFFFFF' }, sz: 11 }, fill: { fgColor: { rgb: 'B45309' } }, alignment: { horizontal: 'center', vertical: 'center' }, border },
  headerGreen:   { font: { bold: true, color: { rgb: 'FFFFFF' }, sz: 11 }, fill: { fgColor: { rgb: '15803D' } }, alignment: { horizontal: 'center', vertical: 'center' }, border },
  headerRed:     { font: { bold: true, color: { rgb: 'FFFFFF' }, sz: 11 }, fill: { fgColor: { rgb: 'DC2626' } }, alignment: { horizontal: 'center', vertical: 'center' }, border },
  // Celdas
  cell:          { alignment: { vertical: 'center', wrapText: true }, border },
  cellCenter:    { alignment: { horizontal: 'center', vertical: 'center' }, border },
  cellStripe:    { alignment: { vertical: 'center', wrapText: true }, fill: { fgColor: { rgb: 'F8FAFC' } }, border },
  cellCenterStripe: { alignment: { horizontal: 'center', vertical: 'center' }, fill: { fgColor: { rgb: 'F8FAFC' } }, border },
  // Semáforos
  green:         { font: { bold: true, color: { rgb: '15803D' } }, alignment: { horizontal: 'center', vertical: 'center' }, border },
  orange:        { font: { bold: true, color: { rgb: 'D97706' } }, alignment: { horizontal: 'center', vertical: 'center' }, border },
  blue:          { font: { bold: true, color: { rgb: '1D4ED8' } }, alignment: { horizontal: 'center', vertical: 'center' }, border },
  red:           { font: { bold: true, color: { rgb: 'DC2626' } }, alignment: { horizontal: 'center', vertical: 'center' }, border },
  // Especiales
  highlight:     { font: { bold: true, color: { rgb: '1E293B' }, sz: 12 }, fill: { fgColor: { rgb: 'FEF9C3' } }, alignment: { horizontal: 'left', vertical: 'center' }, border },
  sectionTitle:  { font: { bold: true, color: { rgb: '1E293B' }, sz: 12 }, fill: { fgColor: { rgb: 'E2E8F0' } }, alignment: { horizontal: 'left', vertical: 'center' }, border },
  metricLabel:   { font: { bold: true, color: { rgb: '475569' }, sz: 11 }, fill: { fgColor: { rgb: 'F1F5F9' } }, alignment: { horizontal: 'left', vertical: 'center' }, border },
  metricValue:   { font: { bold: true, color: { rgb: '1E293B' }, sz: 14 }, alignment: { horizontal: 'center', vertical: 'center' }, border },
  metricGreen:   { font: { bold: true, color: { rgb: '15803D' }, sz: 14 }, alignment: { horizontal: 'center', vertical: 'center' }, border },
  metricRed:     { font: { bold: true, color: { rgb: 'DC2626' }, sz: 14 }, alignment: { horizontal: 'center', vertical: 'center' }, border },
  empty:         { fill: { fgColor: { rgb: 'F8FAFC' } }, border }
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

const mergeCols = (ws, row, fromCol, toCol) => {
  if (!ws['!merges']) ws['!merges'] = [];
  ws['!merges'].push({ s: { r: row, c: fromCol }, e: { r: row, c: toCol } });
};

const semStyle = (status) => S[status] || S.red;

// ─── Hoja 1: Resumen ejecutivo ────────────────────────────────────────────────

const buildResumenSheet = (dashboard, monthLabel) => {
  const ws = {};
  let row = 0;

  const { global_sold, global_percentage, elapsed_work_days, total_work_days, season, employees } = dashboard;
  const remainingDays  = total_work_days - elapsed_work_days;
  const totalMonthSold = employees.reduce((sum, e) => sum + Number(e.month_sold || 0), 0);
  const teamGoalTotal  = employees.reduce((sum, e) => sum + Number(e.monthly_goal || 0), 0);
  const teamPct        = teamGoalTotal > 0 ? Math.round((totalMonthSold / teamGoalTotal) * 100) : 0;

  // Título
  addRow(ws, row, [cell(`📊  REPORTE DE VENTAS — ${monthLabel.toUpperCase()}`, S.sectionTitle), empty(), empty(), empty()]);
  mergeCols(ws, row, 0, 3);
  row += 2;

  // Métricas principales — 2 columnas: label | valor
  const metrics = [
    ['META GLOBAL DE TEMPORADA',    `${season.global_goal.toLocaleString()} chiles`,   null],
    ['VENDIDOS EN TEMPORADA',       `${global_sold.toLocaleString()} chiles`,           global_sold >= season.global_goal ? 'green' : null],
    ['AVANCE GLOBAL',               `${global_percentage}%`,                            global_percentage >= 100 ? 'green' : global_percentage < 50 ? 'red' : null],
    ['META EQUIPO MESEROS',         `${season.team_goal.toLocaleString()} chiles`,      null],
    ['VENDIDOS ESTE MES',           `${totalMonthSold.toLocaleString()} chiles`,        null],
    ['AVANCE DEL MES',              `${teamPct}%`,                                      teamPct >= 100 ? 'green' : teamPct < 50 ? 'red' : null],
    ['DÍAS HÁBILES TRANSCURRIDOS',  `${elapsed_work_days} de ${total_work_days}`,       null],
    ['DÍAS RESTANTES',              `${remainingDays}`,                                 remainingDays === 0 ? 'red' : null],
  ];

  metrics.forEach(([label, value, color], i) => {
    const stripe = i % 2 === 0;
    const valStyle = color ? (color === 'green' ? S.metricGreen : S.metricRed) : S.metricValue;
    addRow(ws, row, [
      cell(label, S.metricLabel),
      cell(value, valStyle),
      empty(), empty()
    ]);
    mergeCols(ws, row, 2, 3);
    row++;
  });

  ws['!cols'] = [{ wch: 35 }, { wch: 22 }, { wch: 10 }, { wch: 10 }];
  updateRef(ws, row, 3);
  if (!ws['!merges']) ws['!merges'] = [];
  return ws;
};

// ─── Hoja 2: Rankings ─────────────────────────────────────────────────────────

const buildRankingsSheet = (employees, monthLabel) => {
  const ws = {};
  let row = 0;

  const sorted = [...employees].sort((a, b) => Number(b.month_sold) - Number(a.month_sold));

  // ── TOP VENDEDORES ──
  addRow(ws, row, [cell(`🏆  TOP VENDEDORES — ${monthLabel}`, S.headerGold), empty(), empty(), empty(), empty()]);
  mergeCols(ws, row, 0, 4);
  row++;

  addRow(ws, row, ['#', 'Colaborador', 'Puesto', 'Chiles Vendidos', 'Meta Mensual'].map(h => cell(h, S.headerDark)));
  row++;

  sorted.forEach((emp, i) => {
    const stripe = i % 2 === 0;
    const cs = stripe ? S.cellCenterStripe : S.cellCenter;
    const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}`;
    addRow(ws, row, [
      cell(medal,                          cs),
      cell(`${emp.first_name} ${emp.last_name}`, stripe ? S.cellStripe : S.cell),
      cell(emp.position,                   cs),
      cell(Number(emp.month_sold),         i === 0 ? S.green : cs),
      cell(Number(emp.monthly_goal),       cs),
    ]);
    row++;
  });

  row++; // separador

  // ── SUPERARON SU RÉCORD DEL AÑO ANTERIOR ──
  const recordBreakers = employees.filter(e => Number(e.month_sold) > Number(e.base_prev_year));

  addRow(ws, row, [cell(`📈  SUPERARON SU RÉCORD DEL AÑO ANTERIOR`, S.headerGreen), empty(), empty(), empty(), empty()]);
  mergeCols(ws, row, 0, 4);
  row++;

  addRow(ws, row, ['Colaborador', 'Puesto', 'Récord Anterior', 'Vendido Este Mes', 'Diferencia'].map(h => cell(h, S.headerDark)));
  row++;

  if (recordBreakers.length === 0) {
    addRow(ws, row, [cell('Ningún colaborador ha superado su récord aún.', S.cellCenter), empty(), empty(), empty(), empty()]);
    mergeCols(ws, row, 0, 4);
    row++;
  } else {
    recordBreakers.sort((a, b) => (Number(b.month_sold) - Number(b.base_prev_year)) - (Number(a.month_sold) - Number(a.base_prev_year)));
    recordBreakers.forEach((emp, i) => {
      const stripe  = i % 2 === 0;
      const cs      = stripe ? S.cellCenterStripe : S.cellCenter;
      const diff    = Number(emp.month_sold) - Number(emp.base_prev_year);
      addRow(ws, row, [
        cell(`${emp.first_name} ${emp.last_name}`, stripe ? S.cellStripe : S.cell),
        cell(emp.position,                  cs),
        cell(Number(emp.base_prev_year),    cs),
        cell(Number(emp.month_sold),        S.green),
        cell(`+${diff}`,                    S.green),
      ]);
      row++;
    });
  }

  row++; // separador

  // ── YA CUMPLIERON SU META MENSUAL ──
  const goalReached = employees.filter(e => Number(e.month_sold) >= Number(e.monthly_goal));

  addRow(ws, row, [cell(`🎯  YA CUMPLIERON SU META MENSUAL`, S.headerGreen), empty(), empty(), empty(), empty()]);
  mergeCols(ws, row, 0, 4);
  row++;

  addRow(ws, row, ['Colaborador', 'Puesto', 'Meta', 'Vendido', '% Avance'].map(h => cell(h, S.headerDark)));
  row++;

  if (goalReached.length === 0) {
    addRow(ws, row, [cell('Ningún colaborador ha cumplido su meta aún.', S.cellCenter), empty(), empty(), empty(), empty()]);
    mergeCols(ws, row, 0, 4);
    row++;
  } else {
    goalReached.forEach((emp, i) => {
      const stripe = i % 2 === 0;
      const cs     = stripe ? S.cellCenterStripe : S.cellCenter;
      const pct    = Math.round((Number(emp.month_sold) / Number(emp.monthly_goal)) * 100);
      addRow(ws, row, [
        cell(`${emp.first_name} ${emp.last_name}`, stripe ? S.cellStripe : S.cell),
        cell(emp.position,               cs),
        cell(Number(emp.monthly_goal),   cs),
        cell(Number(emp.month_sold),     S.green),
        cell(`${pct}%`,                  S.green),
      ]);
      row++;
    });
  }

  row++; // separador

  // ── POR DEBAJO DE LO ESPERADO HOY ──
  const behind = employees.filter(e => Number(e.month_sold) < Number(e.expected_today));

  addRow(ws, row, [cell(`⚠️  POR DEBAJO DE LO ESPERADO AL DÍA DE HOY`, S.headerRed), empty(), empty(), empty(), empty()]);
  mergeCols(ws, row, 0, 4);
  row++;

  addRow(ws, row, ['Colaborador', 'Puesto', 'Esperado Hoy', 'Vendido', 'Diferencia'].map(h => cell(h, S.headerDark)));
  row++;

  if (behind.length === 0) {
    addRow(ws, row, [cell('¡Todos van al corriente o adelantados!', S.cellCenter), empty(), empty(), empty(), empty()]);
    mergeCols(ws, row, 0, 4);
    row++;
  } else {
    behind.sort((a, b) => (Number(a.month_sold) - Number(a.expected_today)) - (Number(b.month_sold) - Number(b.expected_today)));
    behind.forEach((emp, i) => {
      const stripe = i % 2 === 0;
      const cs     = stripe ? S.cellCenterStripe : S.cellCenter;
      const diff   = Number(emp.month_sold) - Number(emp.expected_today);
      addRow(ws, row, [
        cell(`${emp.first_name} ${emp.last_name}`, stripe ? S.cellStripe : S.cell),
        cell(emp.position,                cs),
        cell(Number(emp.expected_today),  cs),
        cell(Number(emp.month_sold),      S.red),
        cell(diff,                        S.red),
      ]);
      row++;
    });
  }

  ws['!cols'] = [{ wch: 24 }, { wch: 18 }, { wch: 18 }, { wch: 18 }, { wch: 14 }];
  updateRef(ws, row, 4);
  if (!ws['!merges']) ws['!merges'] = [];
  return ws;
};

// ─── Hoja 3: Rendimiento Individual ──────────────────────────────────────────

const buildRendimientoSheet = (employees) => {
  const ws = {};
  let row = 0;

  const headers = [
    'Colaborador', 'Puesto', 'Récord 2025', 'Meta 2026',
    'Vendido', '% vs Meta', 'Esperado Hoy', 'Semáforo', '¿Superó Récord?'
  ];
  addRow(ws, row, headers.map(h => cell(h, S.headerIndigo)));
  row++;

  [...employees]
    .sort((a, b) => Number(b.month_sold) - Number(a.month_sold))
    .forEach((emp, i) => {
      const stripe   = i % 2 === 0;
      const cs       = stripe ? S.cellCenterStripe : S.cellCenter;
      const pct      = Math.round((Number(emp.month_sold) / Number(emp.monthly_goal)) * 100);
      const supRec   = Number(emp.month_sold) > Number(emp.base_prev_year);
      const cumMeta  = Number(emp.month_sold) >= Number(emp.monthly_goal);

      addRow(ws, row, [
        cell(`${emp.first_name} ${emp.last_name}`,  stripe ? S.cellStripe : S.cell),
        cell(emp.position,                           cs),
        cell(Number(emp.base_prev_year),             cs),
        cell(Number(emp.monthly_goal),               cs),
        cell(Number(emp.month_sold),                 cumMeta ? S.green : semStyle(emp.status)),
        cell(`${pct}%`,                              cumMeta ? S.green : semStyle(emp.status)),
        cell(Number(emp.expected_today),             cs),
        cell(SEMAFORO_LABEL[emp.status] || '—',     semStyle(emp.status)),
        cell(supRec ? '✓ Sí' : '✗ No',             supRec ? S.green : S.red),
      ]);
      row++;
    });

  ws['!cols'] = [
    { wch: 24 }, { wch: 16 }, { wch: 14 }, { wch: 14 },
    { wch: 12 }, { wch: 12 }, { wch: 14 }, { wch: 22 }, { wch: 16 }
  ];
  updateRef(ws, row, 8);
  return ws;
};

// ─── Hoja 4: Semáforo ────────────────────────────────────────────────────────

const buildSemaforoSheet = (employees) => {
  const ws = {};
  let row = 0;

  const groups = {
    green:  { label: '🟢  AL CORRIENTE',       style: S.headerGreen,  employees: [] },
    orange: { label: '🟠  LIGERAMENTE ATRÁS',  style: S.headerGold,   employees: [] },
    blue:   { label: '🔵  ATRASADO',           style: S.headerIndigo, employees: [] },
    red:    { label: '🔴  ATENCIÓN URGENTE',   style: S.headerRed,    employees: [] },
  };

  employees.forEach(e => {
    if (groups[e.status]) groups[e.status].employees.push(e);
  });

  Object.values(groups).forEach(group => {
    // Título del grupo
    addRow(ws, row, [cell(`${group.label} (${group.employees.length})`, group.style), empty(), empty(), empty()]);
    mergeCols(ws, row, 0, 3);
    row++;

    if (group.employees.length === 0) {
      addRow(ws, row, [cell('Sin colaboradores en este estado.', S.cellCenter), empty(), empty(), empty()]);
      mergeCols(ws, row, 0, 3);
      row++;
    } else {
      addRow(ws, row, ['Colaborador', 'Puesto', 'Vendido', '% Avance'].map(h => cell(h, S.headerDark)));
      row++;

      group.employees.forEach((emp, i) => {
        const stripe = i % 2 === 0;
        const cs     = stripe ? S.cellCenterStripe : S.cellCenter;
        const pct    = Math.round((Number(emp.month_sold) / Number(emp.monthly_goal)) * 100);
        addRow(ws, row, [
          cell(`${emp.first_name} ${emp.last_name}`, stripe ? S.cellStripe : S.cell),
          cell(emp.position,               cs),
          cell(Number(emp.month_sold),     cs),
          cell(`${pct}%`,                  cs),
        ]);
        row++;
      });
    }

    row++; // separador entre grupos
  });

  ws['!cols'] = [{ wch: 24 }, { wch: 18 }, { wch: 14 }, { wch: 12 }];
  updateRef(ws, row, 3);
  if (!ws['!merges']) ws['!merges'] = [];
  return ws;
};

// ─── Export principal ─────────────────────────────────────────────────────────

export const downloadSalesExcel = (dashboard, selectedMonth) => {
  if (!dashboard || !dashboard.employees || dashboard.employees.length === 0) return;

  const monthLabel = MONTH_NAMES[selectedMonth] || selectedMonth;
  const workbook   = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(workbook, buildResumenSheet(dashboard, monthLabel),       'Resumen');
  XLSX.utils.book_append_sheet(workbook, buildRankingsSheet(dashboard.employees, monthLabel), 'Rankings');
  XLSX.utils.book_append_sheet(workbook, buildRendimientoSheet(dashboard.employees),     'Rendimiento Individual');
  XLSX.utils.book_append_sheet(workbook, buildSemaforoSheet(dashboard.employees),        'Semáforo');

  XLSX.writeFile(workbook, `Reporte_Ventas_${monthLabel}_${new Date().getFullYear()}.xlsx`);
};