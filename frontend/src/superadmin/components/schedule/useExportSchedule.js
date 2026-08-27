// useExportSchedule.js
import XLSXStyle from 'xlsx-js-style';

export const useExportSchedule = () => {
  const WORK_DAYS = ['martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'];

  const exportToExcel = (editableSchedules, formattedStart, formattedEnd) => {
    if (!editableSchedules || editableSchedules.length === 0) {
      return { success: false, error: 'No hay datos para exportar' };
    }

    try {
      const wb = XLSXStyle.utils.book_new();
      const wsData = [];

      wsData.push(['ROL SEMANAL DE HORARIOS', '', '', '', '', '', '', '', '']);
      wsData.push(['La Diferencia', '', `Semana del: ${formattedStart} al ${formattedEnd}`, '', '', '', '', '', '']);
      wsData.push(['', '', 'ASISTIR A TU TURNO ES APOYAR A TODO EL EQUIPO. ¡GRACIAS POR TU COMPROMISO!', '', '', '', '', '', '']);
      wsData.push(['Colaborador', 'Horario', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo', 'Lunes']);

      // Valores exactos de position en la BD
      const ordenPuestos = {
        'Capitan': 'CAPITÁN',
        'Mesero': 'MESEROS',
        'Ayudante de Mesero': 'AYUDANTE',
        'Bartender': 'BARRA',
        'Hostess': 'HOSTESS',
        'Capturista': 'CAJA',
        'Limpieza': 'LIMPIEZA'
      };

      const ordenGrupos = ['CAPITÁN', 'MESEROS', 'AYUDANTE', 'BARRA', 'HOSTESS', 'CAJA', 'LIMPIEZA'];

      const grupos = {};
      editableSchedules.forEach(emp => {
        const grupo = ordenPuestos[emp.role] || emp.role?.toUpperCase() || 'OTROS';
        if (!grupos[grupo]) grupos[grupo] = [];
        grupos[grupo].push(emp);
      });

      const categoryRows = new Set();
      ordenGrupos.forEach(grupo => {
        if (!grupos[grupo] || grupos[grupo].length === 0) return;

        categoryRows.add(wsData.length);
        wsData.push([grupo, '', '', '', '', '', '', '', '']);

        grupos[grupo].forEach(emp => {
          const turnos = WORK_DAYS.map(day => emp.shifts[day]?.shift_name).filter(Boolean);
          const turnoConteo = {};
          turnos.forEach(t => { turnoConteo[t] = (turnoConteo[t] || 0) + 1; });
          const turnoPrincipal = Object.keys(turnoConteo).sort((a, b) => turnoConteo[b] - turnoConteo[a])[0] || 'Descanso';

          wsData.push([
            emp.name,
            turnoPrincipal,
            ...WORK_DAYS.map(day => {
              const shift = emp.shifts[day];
              return shift ? `${shift.start_time} - ${shift.end_time}` : 'DESCANSO';
            }),
            'DESCANSO' // Lunes siempre cerrado
          ]);
        });
      });

      const ws = XLSXStyle.utils.aoa_to_sheet(wsData);

      ws['!cols'] = [
        { wch: 22 }, { wch: 16 }, { wch: 18 }, { wch: 18 },
        { wch: 18 }, { wch: 18 }, { wch: 18 }, { wch: 18 }, { wch: 12 },
      ];

      ws['!merges'] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: 8 } },
        { s: { r: 1, c: 0 }, e: { r: 1, c: 1 } },
        { s: { r: 1, c: 2 }, e: { r: 1, c: 8 } },
        { s: { r: 2, c: 0 }, e: { r: 2, c: 1 } },
        { s: { r: 2, c: 2 }, e: { r: 2, c: 8 } },
      ];

      const COLS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'];

      const s = {
        titulo: {
          fill: { fgColor: { rgb: '1F3864' } },
          font: { bold: true, color: { rgb: 'FFFFFF' }, sz: 14, name: 'Calibri' },
          alignment: { horizontal: 'center', vertical: 'center' },
          border: { top: { style: 'thin', color: { rgb: 'FFFFFF' } }, bottom: { style: 'thin', color: { rgb: 'FFFFFF' } }, left: { style: 'thin', color: { rgb: 'FFFFFF' } }, right: { style: 'thin', color: { rgb: 'FFFFFF' } } }
        },
        restaurante: {
          fill: { fgColor: { rgb: 'FFFFFF' } },
          font: { bold: true, color: { rgb: '000000' }, sz: 11, name: 'Calibri' },
          alignment: { horizontal: 'left', vertical: 'center' },
          border: { top: { style: 'thin', color: { rgb: 'FFFFFF' } }, bottom: { style: 'thin', color: { rgb: 'FFFFFF' } }, left: { style: 'thin', color: { rgb: 'FFFFFF' } }, right: { style: 'thin', color: { rgb: 'FFFFFF' } } }
        },
        semana: {
          fill: { fgColor: { rgb: 'FFFFFF' } },
          font: { bold: true, color: { rgb: '000000' }, sz: 11, name: 'Calibri' },
          alignment: { horizontal: 'center', vertical: 'center' },
          border: { top: { style: 'thin', color: { rgb: 'FFFFFF' } }, bottom: { style: 'thin', color: { rgb: 'FFFFFF' } }, left: { style: 'thin', color: { rgb: 'FFFFFF' } }, right: { style: 'thin', color: { rgb: 'FFFFFF' } } }
        },
        mensaje: {
          fill: { fgColor: { rgb: '2E75B6' } },
          font: { bold: true, italic: true, color: { rgb: 'FFFFFF' }, sz: 10, name: 'Calibri' },
          alignment: { horizontal: 'center', vertical: 'center' },
          border: { top: { style: 'thin', color: { rgb: 'FFFFFF' } }, bottom: { style: 'thin', color: { rgb: 'FFFFFF' } }, left: { style: 'thin', color: { rgb: 'FFFFFF' } }, right: { style: 'thin', color: { rgb: 'FFFFFF' } } }
        },
        colHeader: {
          fill: { fgColor: { rgb: '90EE90' } },
          font: { bold: true, color: { rgb: '000000' }, sz: 10, name: 'Calibri Black' },
          alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
          border: { top: { style: 'medium', color: { rgb: 'FFFFFF' } }, bottom: { style: 'medium', color: { rgb: 'FFFFFF' } }, left: { style: 'thin', color: { rgb: 'FFFFFF' } }, right: { style: 'thin', color: { rgb: 'FFFFFF' } } }
        },
        categoria: {
          fill: { fgColor: { rgb: 'BDD7EE' } },
          font: { bold: true, color: { rgb: '1F3864' }, sz: 10, name: 'Calibri' },
          alignment: { horizontal: 'left', vertical: 'center' },
          border: { top: { style: 'thin', color: { rgb: '9DC3E6' } }, bottom: { style: 'thin', color: { rgb: '9DC3E6' } }, left: { style: 'thin', color: { rgb: '9DC3E6' } }, right: { style: 'thin', color: { rgb: '9DC3E6' } } }
        },
        celda: {
          font: { sz: 12, name: 'Calibri' },
          alignment: { horizontal: 'center', vertical: 'center' },
          border: { top: { style: 'thin', color: { rgb: 'D0D0D0' } }, bottom: { style: 'thin', color: { rgb: 'D0D0D0' } }, left: { style: 'thin', color: { rgb: 'D0D0D0' } }, right: { style: 'thin', color: { rgb: 'D0D0D0' } } }
        },
        descanso: {
          fill: { fgColor: { rgb: 'FF6666' } },
          font: { bold: true, sz: 12, color: { rgb: '000000' }, name: 'Calibri' },
          alignment: { horizontal: 'center', vertical: 'center' },
          border: { top: { style: 'thin', color: { rgb: 'D0D0D0' } }, bottom: { style: 'thin', color: { rgb: 'D0D0D0' } }, left: { style: 'thin', color: { rgb: 'D0D0D0' } }, right: { style: 'thin', color: { rgb: 'D0D0D0' } } }
        },
        nombre: {
          font: { bold: true, sz: 12, name: 'Calibri' },
          alignment: { horizontal: 'left', vertical: 'center' },
          border: { top: { style: 'thin', color: { rgb: 'D0D0D0' } }, bottom: { style: 'thin', color: { rgb: 'D0D0D0' } }, left: { style: 'thin', color: { rgb: 'D0D0D0' } }, right: { style: 'thin', color: { rgb: 'D0D0D0' } } }
        }
      };

      const apply = (addr, style) => {
        if (!ws[addr]) ws[addr] = { t: 's', v: '' };
        ws[addr].s = style;
      };

      COLS.forEach(c => apply(`${c}1`, s.titulo));
      ['A', 'B'].forEach(c => apply(`${c}2`, s.restaurante));
      ['C', 'D', 'E', 'F', 'G', 'H', 'I'].forEach(c => apply(`${c}2`, s.semana));
      ['A', 'B'].forEach(c => apply(`${c}3`, s.mensaje));
      ['C', 'D', 'E', 'F', 'G', 'H', 'I'].forEach(c => apply(`${c}3`, s.mensaje));
      COLS.forEach(c => apply(`${c}4`, s.colHeader));

      wsData.forEach((row, rowIdx) => {
        if (rowIdx < 4) return;
        const excelRow = rowIdx + 1;
        const isCategory = categoryRows.has(rowIdx);

        COLS.forEach((col, colIdx) => {
          const addr = `${col}${excelRow}`;
          if (isCategory) {
            apply(addr, s.categoria);
          } else if (colIdx === 0) {
            apply(addr, s.nombre);
          } else if (colIdx === 1) {
            apply(addr, s.celda);
          } else {
            const val = row[colIdx];
            apply(addr, val === 'DESCANSO' ? s.descanso : s.celda);
          }
        });
      });

      ws['!rows'] = [
        { hpt: 32 }, { hpt: 22 }, { hpt: 20 }, { hpt: 22 },
      ];

      XLSXStyle.utils.book_append_sheet(wb, ws, 'Horario Semanal');
      XLSXStyle.writeFile(wb, `Horario_${formattedStart}_al_${formattedEnd}.xlsx`);

      return { success: true };
    } catch (err) {
      console.error('Error al exportar Excel:', err);
      return { success: false, error: 'Error al generar el archivo' };
    }
  };

  return { exportToExcel };
};