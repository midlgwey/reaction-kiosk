// src/admin/hooks/report/useReportSummary.js
import { useState, useEffect } from 'react';
import api from '../../services/api'

export function useReportSummary(days = 30) {
  const [summary, setSummary] = useState({
    bestQuestion: null,
    worstQuestion: null,
    bestDay: null,
    worstDay: null,
    loading: true,
    error: null
  });

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        setSummary(prev => ({ ...prev, loading: true }));
        
        // Ejecutamos las 4 peticiones AL MISMO TIEMPO (Paralelo) = Más rápido
        const [resBestQ, resWorstQ, resBestD, resWorstD] = await Promise.all([
          api.get(`/stats/best-question-week?days=${days}`),
          api.get(`/stats/worst-question-week?days=${days}`),
          api.get(`/stats/weekly-day-strong?days=${days}`),
          api.get(`/stats/weekly-day-weak?days=${days}`)
        ]);

        setSummary({
          bestQuestion: resBestQ.data.bestQuestionWeek, // Ojo con la estructura de tu JSON
          worstQuestion: resWorstQ.data.worstQuestionWeek,
          bestDay: resBestD.data, 
          worstDay: resWorstD.data,
          loading: false,
          error: null
        });

      } catch (err) {
        console.error("Error fetching report summary", err);
        setSummary(prev => ({ ...prev, loading: false, error: "Error cargando resumen" }));
      }
    };

    fetchSummary();
  }, [days]);

  return summary;
}