import { useEffect, useState } from "react";
import api from "../../services/api";

/* =========================================================
   RADAR COMPARACIÓN 
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

        setState({ labels, current, last, loading: false, error: null });
      } catch {
        setState(prev => ({ ...prev, loading: false, error: "Error radar semanal" }));
      }
    };

    fetchRadar();
  }, [days, startDate, endDate]);

  return state;
}

/* =========================================================
   DISTRIBUCIÓN POR PREGUNTA — Barras horizontales 100% apiladas
=========================================================*/
export function useQuestionDistribution(config = { days: 7 }) {
  const [state, setState] = useState({
    questions: [], // [{ question, excelente, bueno, puede_mejorar, malo, total }]
    loading: true,
    error: null,
  });

  const { days, startDate, endDate } = config;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setState(prev => ({ ...prev, loading: true }));

        let url = `/stats/weekly-survey-chart`;
        if (startDate && endDate) {
          url += `?startDate=${startDate}&endDate=${endDate}`;
        } else {
          url += `?days=${days || 7}`;
        }

        const res = await api.get(url);
        const data = res.data || [];

        const questions = data.map(row => {
          const total = (row.excelente || 0) + (row.bueno || 0) + (row.puede_mejorar || 0) + (row.malo || 0);
          return {
            question: row.question,
            excelente: row.excelente || 0,
            bueno: row.bueno || 0,
            puede_mejorar: row.puede_mejorar || 0,
            malo: row.malo || 0,
            total,
            // Porcentajes para la barra 100%
            pctExcelente: total > 0 ? Math.round((row.excelente / total) * 100) : 0,
            pctBueno: total > 0 ? Math.round((row.bueno / total) * 100) : 0,
            pctPuedeMejorar: total > 0 ? Math.round((row.puede_mejorar / total) * 100) : 0,
            pctMalo: total > 0 ? Math.round((row.malo / total) * 100) : 0,
          };
        });

        setState({ questions, loading: false, error: null });
      } catch {
        setState(prev => ({ ...prev, loading: false, error: "Error distribución preguntas" }));
      }
    };

    fetchData();
  }, [days, startDate, endDate]);

  return state;
}

/* =========================================================
   ACEPTACIÓN DE ENCUESTAS POR DÍA
   Devuelve realizadas vs rechazadas por día + totales del periodo
=========================================================*/
export function useSurveyAcceptance(config = { days: 7 }) {
  const [state, setState] = useState({
    days: [],    // [{ day, label, realizadas, rechazadas, total, pctAceptacion }]
    totals: { realizadas: 0, rechazadas: 0, pctAceptacion: 0 },
    loading: true,
    error: null,
  });

  const { days: daysCount, startDate, endDate } = config;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setState(prev => ({ ...prev, loading: true }));

        const params = startDate && endDate
          ? `?startDate=${startDate}&endDate=${endDate}`
          : `?days=${daysCount || 7}`;

        const res = await api.get(`/stats/survey-acceptance-by-day${params}`);
        const data = res.data || [];

        // Etiquetas legibles (Lun, Mar, etc. o dd/mm si es rango largo)
        const daysMap = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
        const isLongRange = (startDate && endDate) || daysCount > 7;

        const enriched = data.map(row => {
          const d = new Date(`${row.day}T12:00:00`);
          const label = isLongRange
            ? `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`
            : daysMap[d.getDay()];
          return { ...row, label };
        });

        // Totales del periodo
        const totalRealizadas = enriched.reduce((s, r) => s + r.realizadas, 0);
        const totalRechazadas = enriched.reduce((s, r) => s + r.rechazadas, 0);
        const totalGeneral = totalRealizadas + totalRechazadas;

        setState({
          days: enriched,
          totals: {
            realizadas: totalRealizadas,
            rechazadas: totalRechazadas,
            pctAceptacion: totalGeneral > 0 ? Math.round((totalRealizadas / totalGeneral) * 100) : 0,
          },
          loading: false,
          error: null,
        });

      } catch {
        setState(prev => ({ ...prev, loading: false, error: 'Error cargando aceptación' }));
      }
    };

    fetchData();
  }, [daysCount, startDate, endDate]);

  return state;
}

/* =========================================================
   EVOLUCIÓN DE SATISFACCIÓN POR PREGUNTA EN EL TIEMPO
   Endpoint: GET /stats/question-trend
   Devuelve una línea por cada una de las 4 preguntas
=========================================================*/
export function useQuestionTrend(config = { days: 7 }) {
  const [state, setState] = useState({
    labels: [],      // periods del backend (fechas ISO, semanas o meses)
    questions: [],   // [{ id, label, data: [3.2, null, 3.5, ...], totalResponses }]
    labelType: 'day', // 'day' | 'week' | 'month' — decide cómo formatear el eje X
    loading: true,
    error: null,
  });
 
  const { days, startDate, endDate } = config;
 
  useEffect(() => {
    const fetchData = async () => {
      try {
        setState(prev => ({ ...prev, loading: true }));
 
        const params = startDate && endDate
          ? `?startDate=${startDate}&endDate=${endDate}`
          : `?days=${days || 7}`;
 
        const res = await api.get(`/stats/question-trend${params}`);
        const { labels, questions, labelType } = res.data || { labels: [], questions: [], labelType: 'day' };
 
        setState({ labels, questions, labelType, loading: false, error: null });
      } catch {
        setState(prev => ({ ...prev, loading: false, error: 'Error cargando evolución por pregunta' }));
      }
    };
 
    fetchData();
  }, [days, startDate, endDate]);
 
  return state;
}
 

/* =========================================================
   SATISFACCIÓN POR TURNO Y DÍA 
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

  const { days, startDate, endDate } = config;

  useEffect(() => {
    const fetchShift = async () => {
      try {
        setState(prev => ({ ...prev, loading: true }));

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

        let cycleStart, cycleEnd;
        let isDateRange = false;

        if (startDate && endDate) {
          isDateRange = true;
          cycleStart = new Date(`${startDate}T12:00:00`);
          cycleEnd = new Date(`${endDate}T12:00:00`);
        } else {
          cycleEnd = new Date();
          cycleStart = new Date();
          cycleStart.setDate(cycleEnd.getDate() - (days - 1));
        }

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
            const labelDay = (isDateRange || days > 7) ? `${day}/${month}` : dayName;

            const stat = {
              label: [labelDay, turno.id],
              excelente: 0, bueno: 0, puede_mejorar: 0, malo: 0
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