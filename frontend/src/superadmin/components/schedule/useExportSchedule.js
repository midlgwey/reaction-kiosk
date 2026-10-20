// useExportSchedule.js
import { useState } from 'react';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import logoDif from '../../../assets/logo/logodifengra.png';

export const useExportSchedule = () => {
  const WORK_DAYS = ['martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'];

  const [exporting, setExporting] = useState(false);

  const exportToExcel = async (editableSchedules, formattedStart, formattedEnd) => {
    if (exporting) return { success: false, error: 'Ya se está exportando' };
    if (!editableSchedules || editableSchedules.length === 0) {
      return { success: false, error: 'No hay datos para exportar' };
    }

    setExporting(true);

    try {
      const workbook = new ExcelJS.Workbook();
      const ws = workbook.addWorksheet('Horario Semanal');

      // ─── Anchos de columna ────────────────────────────────────────────────
      ws.columns = [
        { width: 24 }, // A - Colaborador
        { width: 18 }, // B - Horario
        { width: 20 }, // C - Martes
        { width: 20 }, // D - Miércoles
        { width: 20 }, // E - Jueves
        { width: 20 }, // F - Viernes
        { width: 20 }, // G - Sábado
        { width: 20 }, // H - Domingo
        { width: 14 }, // I - Lunes
      ];

      // ─── Logo desde carpeta assets ────────────────────────────────────────
      // Vite importa la imagen como URL, hacemos fetch para obtener el buffer
      const logoResponse = await fetch(logoDif);
      const logoArrayBuffer = await logoResponse.arrayBuffer();
      const logoId = workbook.addImage({
        buffer: logoArrayBuffer,
        extension: 'png',
      });
      // Logo en A2:B3 (row 1-3 en base 0 = filas 2-3 en Excel)
      // IMPORTANTE: br row: 3 en base 0 = hasta el final de fila 3 en Excel
      // Si se usa row: 4 aparece una fila vacía extra (fila 5) en el archivo
      ws.addImage(logoId, {
        tl: { col: 0, row: 1 },
        br: { col: 2, row: 3 },
        editAs: 'oneCell',
      });

      // ─── Helpers ──────────────────────────────────────────────────────────
      const cleanShiftName = (name) => {
        if (!name) return 'Descanso';
        return name
          .replace(/\s+\(hostess\)$/i, '')
          .replace(/\s+\(medio\)$/i, '')
          .replace(/\s+Hostess$/i, '')
          .replace(/\s+Caja$/i, '')
          .trim();
      };

      const toAmPm = (time) => {
        if (!time) return '';
        const [h, m] = time.split(':').map(Number);
        const period = h >= 12 ? 'pm' : 'am';
        const hour = h % 12 || 12;
        return `${hour}:${String(m).padStart(2, '0')} ${period}`;
      };

      const formatHour = (startTime, endTime) => {
        if (!startTime || !endTime) return 'DESCANSO';
        const closeHours = ['21:30', '21:00', '18:30'];
        if (closeHours.includes(endTime)) {
          return `${toAmPm(startTime)} - CIERRE`;
        }
        return `${toAmPm(startTime)} - ${toAmPm(endTime)}`;
      };

      // ─── Estilos base ─────────────────────────────────────────────────────
      const borderThin = {
        top:    { style: 'thin', color: { argb: 'FFD0D0D0' } },
        bottom: { style: 'thin', color: { argb: 'FFD0D0D0' } },
        left:   { style: 'thin', color: { argb: 'FFD0D0D0' } },
        right:  { style: 'thin', color: { argb: 'FFD0D0D0' } },
      };

      const borderBlue = {
        top:    { style: 'thin', color: { argb: 'FF9DC3E6' } },
        bottom: { style: 'thin', color: { argb: 'FF9DC3E6' } },
        left:   { style: 'thin', color: { argb: 'FF9DC3E6' } },
        right:  { style: 'thin', color: { argb: 'FF9DC3E6' } },
      };

      // ─── Fila 1: Título ───────────────────────────────────────────────────
      ws.mergeCells('A1:I1');
      const row1 = ws.getRow(1);
      row1.height = 34;
      const titleCell = ws.getCell('A1');
      titleCell.value = 'ROL SEMANAL DE HORARIOS';
      titleCell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 14, name: 'Calibri' };
      titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1F3864' } };
      titleCell.alignment = { horizontal: 'center', vertical: 'middle' };

      // ─── Fila 2: Logo / Semana ────────────────────────────────────────────
      ws.mergeCells('A2:B2');
      ws.mergeCells('C2:I2');
      const row2 = ws.getRow(2);
      // Altura suficiente para que el logo quepa bien en las filas 2-3
      row2.height = 50;

      // Celda A2 en blanco — el logo flota encima
      const restCell = ws.getCell('A2');
      restCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFFFF' } };

      const semanaCell = ws.getCell('C2');
      semanaCell.value = `Semana del: ${formattedStart} al ${formattedEnd}`;
      semanaCell.font = { bold: true, color: { argb: 'FF000000' }, size: 11, name: 'Calibri' };
      semanaCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFFFF' } };
      semanaCell.alignment = { horizontal: 'center', vertical: 'middle' };

      // ─── Fila 3: Mensaje motivacional ─────────────────────────────────────
      ws.mergeCells('A3:B3');
      ws.mergeCells('C3:I3');
      const row3 = ws.getRow(3);
      // Altura ajustada para complementar el espacio del logo
      row3.height = 30;

      const msgStyleA = ws.getCell('A3');
      msgStyleA.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2E75B6' } };

      const msgCell = ws.getCell('C3');
      msgCell.value = 'ASISTIR A TU TURNO ES APOYAR A TODO EL EQUIPO. ¡GRACIAS POR TU COMPROMISO!';
      msgCell.font = { bold: true, italic: true, color: { argb: 'FFFFFFFF' }, size: 10, name: 'Calibri' };
      msgCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2E75B6' } };
      msgCell.alignment = { horizontal: 'center', vertical: 'middle' };

      // ─── Fila 4: Encabezados de columna ───────────────────────────────────
      const headers = ['Colaborador', 'Horario', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo', 'Lunes'];
      const headerRow = ws.getRow(4);
      headerRow.height = 24;
      headers.forEach((h, i) => {
        const cell = headerRow.getCell(i + 1);
        cell.value = h;
        cell.font = { bold: true, color: { argb: 'FF000000' }, size: 10, name: 'Calibri Black' };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF90EE90' } };
        cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
        cell.border = {
          top:    { style: 'medium', color: { argb: 'FFFFFFFF' } },
          bottom: { style: 'medium', color: { argb: 'FFFFFFFF' } },
          left:   { style: 'thin',   color: { argb: 'FFFFFFFF' } },
          right:  { style: 'thin',   color: { argb: 'FFFFFFFF' } },
        };
      });

      // ─── Grupos de empleados ──────────────────────────────────────────────
      const ordenPuestos = {
        'Capitan':           'CAPITÁN',
        'Mesero':            'MESEROS',
        'Ayudante de Mesero':'AYUDANTE',
        'Bartender':         'BARRA',
        'Hostess':           'HOSTESS',
        'Capturista':        'CAJA',
        'Limpieza':          'LIMPIEZA',
      };
      const ordenGrupos = ['CAPITÁN', 'MESEROS', 'AYUDANTE', 'BARRA', 'HOSTESS', 'CAJA', 'LIMPIEZA'];

      const grupos = {};
      editableSchedules.forEach((emp) => {
        const grupo = ordenPuestos[emp.role] || emp.role?.toUpperCase() || 'OTROS';
        if (!grupos[grupo]) grupos[grupo] = [];
        grupos[grupo].push(emp);
      });

      ordenGrupos.forEach((grupo) => {
        if (!grupos[grupo] || grupos[grupo].length === 0) return;

        // Fila de categoría
        const catRow = ws.addRow([grupo, '', '', '', '', '', '', '', '']);
        catRow.height = 20;
        catRow.eachCell((cell) => {
          cell.font  = { bold: true, color: { argb: 'FF1F3864' }, size: 10, name: 'Calibri' };
          cell.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFBDD7EE' } };
          cell.alignment = { horizontal: 'left', vertical: 'middle' };
          cell.border = borderBlue;
        });

        // Filas de empleados
        grupos[grupo].forEach((emp) => {
          const turnos = WORK_DAYS.map((day) => emp.shifts?.[day]?.shift_name).filter(Boolean);
          const turnoConteo = {};
          turnos.forEach((t) => { turnoConteo[t] = (turnoConteo[t] || 0) + 1; });
          const turnoMasFrecuente = Object.keys(turnoConteo).sort((a, b) => turnoConteo[b] - turnoConteo[a])[0];
          const turnoPrincipal = cleanShiftName(turnoMasFrecuente) || 'Descanso';

          const rowValues = [
            emp.name,
            turnoPrincipal,
            ...WORK_DAYS.map((day) => {
              const shift = emp.shifts?.[day];
              return shift ? formatHour(shift.start_time, shift.end_time) : 'DESCANSO';
            }),
            'DESCANSO',
          ];

          const empRow = ws.addRow(rowValues);
          empRow.height = 20;
          empRow.eachCell((cell, colNumber) => {
            cell.alignment = {
              horizontal: colNumber === 1 ? 'left' : 'center',
              vertical: 'middle',
            };
            cell.border = borderThin;

            if (colNumber === 1) {
              cell.font = { bold: true, size: 12, name: 'Calibri' };
            } else if (colNumber >= 3) {
              if (cell.value === 'DESCANSO') {
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF6666' } };
                cell.font = { bold: true, size: 12, color: { argb: 'FF000000' }, name: 'Calibri' };
              } else {
                cell.font = { size: 12, name: 'Calibri' };
              }
            } else {
              cell.font = { size: 12, name: 'Calibri' };
            }
          });
        });
      });

      // ─── Descargar ────────────────────────────────────────────────────────
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      saveAs(blob, `Horario_${formattedStart}_al_${formattedEnd}.xlsx`);

      return { success: true };
    } catch (err) {
      console.error('Error al exportar Excel:', err);
      return { success: false, error: 'Error al generar el archivo' };
    } finally {
      setExporting(false);
    }
  };

  return { exportToExcel, exporting };
};
