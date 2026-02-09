import { useEffect, useState } from "react";
import api from "../../services/api";

/* =========================================================
 BARRAS POR PREGUNTA (sentimientos)
/stats/by-question-week
=========================================================*/

export function useChartQuestionsWeek() {
const [state, setState] = useState({
labels: [],
excelente: [],
bueno: [],
puedeMejorar: [],
malo: [],
loading: true,
error: null,
});

useEffect(() => {
const fetchChart = async () => {
try {
const res = await api.get("/stats/by-question-week");


    if (!res.data || res.data.length === 0) {
      setState(prev => ({ ...prev, loading:false }));
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
      loading:false,
      error:null
    });

  } catch (err) {
    setState(prev => ({
      ...prev,
      loading:false,
      error:"Error gráfica preguntas"
    }));
  }
};

fetchChart();


}, []);

return state;
}

/* =========================================================
   RADAR COMPARACIÓN SEMANAL
   /stats/weekly-comparison
=========================================================*/

export function useWeeklyRadar() {
const [state, setState] = useState({
labels: [],
current: [],
last: [],
loading: true,
error: null,
});

useEffect(() => {
const fetchRadar = async () => {
try {
const res = await api.get("/stats/weekly-comparison");


    if (!res.data || res.data.length === 0) {
      setState(prev => ({ ...prev, loading:false }));
      return;
    }

    const labels = res.data.map(q => q.question);
    const current = res.data.map(q => q.current_week_score || 0);
    const last = res.data.map(q => q.last_week_score || 0);

    setState({
      labels,
      current,
      last,
      loading:false,
      error:null
    });

  } catch {
    setState(prev => ({
      ...prev,
      loading:false,
      error:"Error radar semanal"
    }));
  }
};

fetchRadar();


}, []);

return state;
}

/* =========================================================
SATISFACCIÓN POR TURNO Y DÍA
  /stats/overall-distribution-week
=========================================================*/

export function useShiftWeekChart() {
  const [state, setState] = useState({
    labels: [],
    excelente: [],
    bueno: [],
    puede_mejorar: [],
    malo: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    const fetchShift = async () => {
      try {
        const res = await api.get("/stats/overall-distribution-week");

        if (!res.data || res.data.length === 0) {
          setState(prev => ({ ...prev, loading: false }));
          return;
        }

        const daysMap = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
        const grouped = {};

        // Procesamos la info del Back
        res.data.forEach(row => {
          const date = new Date(row.day);
          const dayName = daysMap[date.getUTCDay()]; // Usamos UTC para evitar desfases de zona horaria
          const shift = row.shift === "Desayuno" ? "Des" : "Com";
          const key = `${row.day}-${shift}`; // Usamos la fecha real como llave para ordenar

          if (!grouped[key]) {
            grouped[key] = {
              label: [dayName, shift], // Esto crea las dos líneas en el eje X
              excelente: 0,
              bueno: 0,
              puede_mejorar: 0,
              malo: 0,
              sortKey: row.day + (shift === "Des" ? "0" : "1") // Para ordenar cronológicamente
            };
          }

          if (row.value === 4) grouped[key].excelente += row.total;
          if (row.value === 3) grouped[key].bueno += row.total;
          if (row.value === 2) grouped[key].puede_mejorar += row.total;
          if (row.value === 1) grouped[key].malo += row.total;
        });

        // Ordenamos por fecha y turno para que no salgan salteados
        const ordered = Object.values(grouped).sort((a, b) => a.sortKey.localeCompare(b.sortKey));

        setState({
          labels: ordered.map(d => d.label),
          excelente: ordered.map(d => d.excelente),
          bueno: ordered.map(d => d.bueno),
          puede_mejorar: ordered.map(d => d.puede_mejorar),
          malo: ordered.map(d => d.malo),
          loading: false,
          error: null
        });

      } catch (err) {
        setState(prev => ({ ...prev, loading: false, error: "Error gráfica turnos" }));
      }
    };
    fetchShift();
  }, []);

  return state;
}