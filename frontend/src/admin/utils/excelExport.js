import * as XLSX from 'xlsx-js-style'; 

/**
  @param {Array} data - Array de objetos con los datos a exportar.
  @param {string} fileName - Nombre del archivo de salida 
 */
export const downloadExcel = (data, fileName = 'Reporte.xlsx') => {

  // Validación temprana: Retorna si no hay datos para procesar
  if (!data || data.length === 0) return;

  //Transforma el array JSON en una hoja de trabajo 
  const worksheet = XLSX.utils.json_to_sheet(data);

  
  // Calcula dinámicamente el ancho basado en la longitud de las claves, estableciendo un mínimo de 20 unidades.
  const columnWidths = Object.keys(data[0]).map(key => ({
    wch: Math.max(key.length, 20) 
  }));
  worksheet['!cols'] = columnWidths;

  // Estilo para la cabecera
  const headerStyle = {
    font: { bold: true, color: { rgb: "FFFFFF" }, sz: 12 },
    fill: { fgColor: { rgb: "4F46E5" } }, 
    alignment: { horizontal: "center", vertical: "center" },
    border: {
        top: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
        left: { style: "thin" }
    }
  };

  // Estilo base para celdas de datos: Alineación vertical, ajuste de texto y bordes completos.
  const cellStyle = {
    alignment: { vertical: "center", wrapText: true },
    border: {
        top: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
        left: { style: "thin" }
    }
  };

  // Obtiene el rango total de celdas (ej. A1:D10) para iterar sobre cada una.
  const range = XLSX.utils.decode_range(worksheet['!ref']); 

  for (let R = range.s.r; R <= range.e.r; ++R) {
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
      
      // Verifica existencia de la celda antes de aplicar estilos
      if (!worksheet[cellAddress]) continue;

      // Lógica de aplicación condicional
      if (R === 0) {
        // Fila 0: Aplica estilo de cabecera
        worksheet[cellAddress].s = headerStyle;
      } else {
        // Filas > 0: Aplica estilo base
        worksheet[cellAddress].s = cellStyle;
        
        // Aplica fondo gris claro a filas pares para mejorar legibilidad
        if (R % 2 === 0) {
            worksheet[cellAddress].s = {
                ...cellStyle,
                fill: { fgColor: { rgb: "F8FAFC" } } 
            };
        }
      }
    }
  }

  // Crea un nuevo libro de trabajo, añade la hoja procesada y ejecuta la descarga.
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Datos");
  XLSX.writeFile(workbook, fileName);
};