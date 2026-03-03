import { useEffect, useState } from "react";
import api from "../../services/api";

/* =========================================================
 BARRAS POR PREGUNTA (sentimientos)
=========================================================*/
export function useChartQuestionsWeek(config = { days: 7 }) {
  const [state, setState] = useState({
    labels: [],
    excelente: [],
    bueno: [],
    puedeMejorar: [],
    malo: [],
    loading: true,
    error: null,
  });

  // Extraemos las variables del objeto de configuración
  const { days, startDate, endDate } = config;

  useEffect(() => {
    const fetchChart = async () => {
      try {
        setState(prev => ({ ...prev, loading: true })); 
        
        // Armamos la URL dinámica
        let url = `/stats/by-question-week`;
        if (startDate && endDate) {
          url += `?startDate=${startDate}&endDate=${endDate}`;
        } else {
          url += `?days=${days || 7}`;
        }

        const res = await api.get(url);

        if (!res.data || res.data.length === 0) {
          setState(prev => ({ ...prev, loading: false }));
          return;
        }

        const labels = res.data.map(q => q.question);
        const excelente = res.data.map(q => q.excelente || 0);
        const bueno = res.data.map(q => q.bueno || 0);
        const puedeMejorar = res.data.map(q => q.puede_mejorar || 0);
        const malo = res.data.map(q => q.malo || 0);

        setState({
          labels,
          excelente,
          bueno,
          puedeMejorar,
          malo,
          loading: false,
          error: null
        });

      } catch (err) {
        setState(prev => ({
          ...prev,
          loading: false,
          error: "Error gráfica preguntas"
        }));
      }
    };

    fetchChart();
  }, [days, startDate, endDate]); // <--- Se vuelve a ejecutar si cambian las fechas

  return state;
}

/* =========================================================
   RADAR COMPARACIÓN (Ahora flexible)
=========================================================*/
export function useWeeklyRadar(config = { days: 7 }) {
  const [state, setState] = useState({
    labels: [],
    current: [],
    last: [],
    loading: true,
    error: null,
  });

  const { days, startDate, endDate } = config;

  useEffect(() => {
    const fetchRadar = async () => {
      try {
        setState(prev => ({ ...prev, loading: true }));
        
        // Configuración de URL dinámica
        let url = `/stats/weekly-comparison`;
        if (startDate && endDate) {
          url += `?startDate=${startDate}&endDate=${endDate}`;
        } else {
          url += `?days=${days || 7}`;
        }

        const res = await api.get(url);

        if (!res.data || res.data.length === 0) {
          setState(prev => ({ ...prev, loading: false }));
          return;
        }

        const labels = res.data.map(q => q.question);
        const current = res.data.map(q => q.current_week_score || 0);
        const last = res.data.map(q => q.last_week_score || 0);

        setState({
          labels,
          current,
          last,
          loading: false,
          error: null
        });

      } catch {
        setState(prev => ({
          ...prev,
          loading: false,
          error: "Error radar semanal"
        }));
      }
    };

    fetchRadar();
  }, [days, startDate, endDate]);

  return state;
}

/* =========================================================
 SATISFACCIÓN POR TURNO Y DÍA (Dinámico 7 o 30 días)
=========================================================*/
export function useShiftWeekChart(config = { days: 7 }) {
  const [state, setState] = useState({
    labels: [],
    excelente: [],
    bueno: [],
    puede_mejorar: [],
    malo: [],
    loading: true,
    error: null,
  });

  // Extraemos variables del objeto de configuración
  const { days, startDate, endDate } = config;

  useEffect(() => {
    const fetchShift = async () => {
      try {
        setState(prev => ({ ...prev, loading: true }));
        
        // Armamos la URL dependiendo si mandan fechas o días
        let url = `/stats/overall-distribution-week`;
        if (startDate && endDate) {
          url += `?startDate=${startDate}&endDate=${endDate}`;
        } else {
          url += `?days=${days || 7}`;
        }

        const res = await api.get(url);
        const data = res.data || [];
        
        const filledData = [];
        const daysMap = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

        // Lógica para determinar el inicio y fin del ciclo
        let cycleStart, cycleEnd;
        let isDateRange = false;

        if (startDate && endDate) {
            isDateRange = true;
            // T12:00:00 evita bugs de desfase por zonas horarias en JS
            cycleStart = new Date(`${startDate}T12:00:00`); 
            cycleEnd = new Date(`${endDate}T12:00:00`);
        } else {
            cycleEnd = new Date();
            cycleStart = new Date();
            cycleStart.setDate(cycleEnd.getDate() - (days - 1));
        }

        // Iteramos día por día desde el inicio hasta el fin
        for (let d = new Date(cycleStart); d <= cycleEnd; d.setDate(d.getDate() + 1)) {
          const year = d.getFullYear();
          const month = String(d.getMonth() + 1).padStart(2, '0');
          const day = String(d.getDate()).padStart(2, '0');
          const dateStr = `${year}-${month}-${day}`;
          
          const dayName = daysMap[d.getDay()];

          const turnosConfig = [
             { id: "Des", filter: (s) => s === "Desayuno" },       
             { id: "Com", filter: (s) => s && s !== "Desayuno" }   
          ];

          turnosConfig.forEach((turno) => {
            const foundRows = data.filter(r => r.day === dateStr && turno.filter(r.shift));

            // Ajuste visual: Si es rango de fechas o > 7 días, acortamos la etiqueta
            const labelDay = (isDateRange || days > 7) ? `${day}/${month}` : dayName;

            const stat = {
              label: [labelDay, turno.id], 
              excelente: 0,
              bueno: 0,
              puede_mejorar: 0,
              malo: 0
            };

            foundRows.forEach(row => {
               const val = Number(row.total);
               if (row.value === 4) stat.excelente += val;
               if (row.value === 3) stat.bueno += val;
               if (row.value === 2) stat.puede_mejorar += val;
               if (row.value === 1) stat.malo += val;
            });
            filledData.push(stat);
          });
        }

        setState({
          labels: filledData.map(d => d.label),
          excelente: filledData.map(d => d.excelente),
          bueno: filledData.map(d => d.bueno),
          puede_mejorar: filledData.map(d => d.puede_mejorar),
          malo: filledData.map(d => d.malo),
          loading: false,
          error: null
        });

      } catch (err) {
        console.error(err);
        setState(prev => ({ ...prev, loading: false, error: "Error gráfica turnos" }));
      }
    };

    fetchShift();
  }, [days, startDate, endDate]); 

  return state;
}