import * as XLSX from 'xlsx-js-style';

const MINIMO_APROBATORIO = 90;

const border = {
  top: { style: 'thin' }, bottom: { style: 'thin' },
  left: { style: 'thin' }, right: { style: 'thin' }
};

const S = {
  title:    { font: { bold: true, color: { rgb: '1E293B' }, sz: 14 }, alignment: { horizontal: 'left', vertical: 'center' } },
  note:     { font: { italic: true, sz: 9, color: { rgb: '64748B' } } },
  header:   { font: { bold: true, color: { rgb: 'FFFFFF' }, sz: 11 }, fill: { fgColor: { rgb: '4F46E5' } }, alignment: { horizontal: 'center', vertical: 'center', wrapText: true }, border },
  cell:     { alignment: { vertical: 'center' }, border },
  center:   { alignment: { horizontal: 'center', vertical: 'center' }, border },
  stripe:   { alignment: { vertical: 'center' }, fill: { fgColor: { rgb: 'F8FAFC' } }, border },
  stripeC:  { alignment: { horizontal: 'center', vertical: 'center' }, fill: { fgColor: { rgb: 'F8FAFC' } }, border },
  approved: { font: { bold: true, color: { rgb: '16A34A' } }, alignment: { horizontal: 'center', vertical: 'center' }, border },
  failed:   { font: { bold: true, color: { rgb: 'DC2626' } }, alignment: { horizontal: 'center', vertical: 'center' }, border },
  warn:     { font: { bold: true, color: { rgb: 'D97706' } }, alignment: { horizontal: 'center', vertical: 'center' }, border },
  muted:    { font: { italic: true, color: { rgb: '94A3B8' } }, alignment: { horizontal: 'center', vertical: 'center' }, border },
  label:    { font: { bold: true }, alignment: { horizontal: 'left', vertical: 'center' }, border },
  section:  { font: { bold: true, color: { rgb: '1E293B' }, sz: 12 }, fill: { fgColor: { rgb: 'E2E8F0' } }, border },
};


const cell = (v, s, z) => {
  const style = { ...s };            
  if (z) style.numFmt = z;
  return { v, s: style, t: typeof v === 'number' ? 'n' : 's', ...(z && { z }) };
};
const put  = (ws, r, cells) => cells.forEach((c, i) => { ws[XLSX.utils.encode_cell({ r, c: i })] = c; });
const num  = (v) => (v === null || v === undefined ? null : parseFloat(v));

export const downloadPerformanceExcel = (data, monthLabel, year, fileName) => {
  if (!data || data.length === 0) return;

  const ws = {};
  put(ws, 0, [cell(`REPORTE DE RENDIMIENTO MENSUAL — ${monthLabel} ${year}`, S.title)]);
  put(ws, 1, [cell(`Servicio + Cumplimiento — Mínimo aprobatorio: ${MINIMO_APROBATORIO}%`, S.note)]);

  put(ws, 3, ['Mesero', 'Captadas', 'Rechazos', '% Aceptación de encuestas', 'Mesas reales',
              'Satisfacción', 'Cumplimiento', 'Resultado final', 'Estado'].map(h => cell(h, S.header)));

  let row = 4;
  let aprobados = 0, reprobados = 0, sinMesas = 0, suma = 0;
  let totCaptadas = 0, totRechazos = 0;

  data.forEach((m, i) => {
    const stripe = i % 2 === 0;
    const base   = stripe ? S.stripe : S.cell;
    const ctr    = stripe ? S.stripeC : S.center;

    const aceptacion = num(m.tasa_aceptacion);
    const resultado  = num(m.resultado_final);
    const tieneMesas = m.mesas_reales > 0;
    const pasa       = resultado !== null && resultado >= MINIMO_APROBATORIO;

    totCaptadas += m.captadas || 0;
    totRechazos += m.rechazos || 0;
    if (resultado === null) sinMesas++;
    else { suma += resultado; pasa ? aprobados++ : reprobados++; }

    put(ws, row, [
      cell(m.mesero, base),
      cell(m.captadas ?? 0, ctr),
      cell(m.rechazos ?? 0, ctr),
      aceptacion === null ? cell('—', S.muted) : cell(aceptacion / 100, aceptacion < 70 ? S.warn : ctr, '0.0%'),
      tieneMesas ? cell(m.mesas_reales, ctr) : cell('Sin capturas', S.muted),
      cell(num(m.satisfaccion) / 100, ctr, '0.00%'),
      tieneMesas ? cell(num(m.cumplimiento) / 100, ctr, '0.00%') : cell('—', S.muted),
      resultado === null ? cell('—', S.muted) : cell(resultado / 100, pasa ? S.approved : S.failed, '0.00%'),
      resultado === null ? cell('Sin mesas', S.muted) : cell(pasa ? 'Aprobado' : 'Reprobado', pasa ? S.approved : S.failed),
    ]);
    row++;
  });

  const evaluados = aprobados + reprobados;

  // Resumen
  row++;
  put(ws, row++, [cell('RESUMEN', S.section), cell('', S.section)]);
  put(ws, row++, [cell('Meseros evaluados', S.label),        cell(evaluados, S.center)]);
  put(ws, row++, [cell('Aprobados', S.label),                cell(aprobados, S.approved)]);
  put(ws, row++, [cell('Reprobados', S.label),               cell(reprobados, S.failed)]);
  put(ws, row++, [cell('Sin mesas capturadas', S.label),     cell(sinMesas, S.center)]);
  put(ws, row++, [cell('Promedio resultado final', S.label), cell(evaluados ? suma / evaluados / 100 : 0, S.center, '0.00%')]);
  put(ws, row++, [cell('Total encuestas captadas', S.label), cell(totCaptadas, S.center)]);
  put(ws, row++, [cell('Total rechazos', S.label),           cell(totRechazos, S.center)]);

  row++;
  put(ws, row++, [cell('Resultado Final = (Satisfacción × 50%) + (Cumplimiento × 50%).', S.note)]);
  put(ws, row++, [cell('Cumplimiento se calcula con las mesas reales capturadas día a día por el gerente.', S.note)]);
  put(ws, row++, [cell('% Aceptación = encuestas realizadas / (realizadas + rechazadas). En naranja si es menor a 70%.', S.note)]);

  ws['!cols'] = [{ wch: 24 }, { wch: 11 }, { wch: 11 }, { wch: 17 }, { wch: 14 }, { wch: 14 }, { wch: 15 }, { wch: 16 }, { wch: 14 }];
  ws['!rows'] = [];
  ws['!rows'][3] = { hpt: 32 };
  ws['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 8 } }, { s: { r: 1, c: 0 }, e: { r: 1, c: 8 } }];
  ws['!ref'] = XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: row, c: 8 } });

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Rendimiento');
  XLSX.writeFile(wb, fileName || `Reporte_Rendimiento_${monthLabel}_${year}.xlsx`);
};