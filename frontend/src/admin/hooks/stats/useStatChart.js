import { useEffect, useState } from "react";
import api from "../../services/api";

/* =========================================================
 BARRAS POR PREGUNTA (sentimientos)
=========================================================*/
export function useChartQuestionsWeek(days = 7) {
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
        setState(prev => ({ ...prev, loading: true })); // Reiniciar loading al cambiar días
        // Pasamos el query param ?days=...
        const res = await api.get(`/stats/by-question-week?days=${days}`);

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
  }, [days]); // <--- Dependencia clave: si days cambia, se vuelve a ejecutar

  return state;
}

/* =========================================================
   RADAR COMPARACIÓN (Ahora flexible)
=========================================================*/
export function useWeeklyRadar(days = 7) {
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
        setState(prev => ({ ...prev, loading: true }));
        // Aunque el radar es comparativo, le pasamos los días base
        const res = await api.get(`/stats/weekly-comparison?days=${days}`);

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
  }, [days]);

  return state;
}

/* =========================================================
 SATISFACCIÓN POR TURNO Y DÍA (Dinámico 7 o 30 días)
=========================================================*/
export function useShiftWeekChart(days = 7) {
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
        setState(prev => ({ ...prev, loading: true }));
        const res = await api.get(`/stats/overall-distribution-week?days=${days}`);
        const data = res.data || [];
        
        const filledData = [];
        const daysMap = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

        // LÓGICA DINÁMICA: Iteramos según la cantidad de días solicitados
        // Restamos 1 porque el loop es 0-indexed (ej: 0 a 6 son 7 días)
        for (let i = days - 1; i >= 0; i--) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          
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

            // Ajuste visual: Si son 30 días, acortamos la etiqueta para que quepa
            const labelDay = days > 7 ? `${day}/${month}` : dayName;

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
  }, [days]); // <--- Dependencia clave

  return state;
}