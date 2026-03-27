import { useMemo, useState } from "react";
import { useDailySatisfactionTrend } from "../../../hooks/dashboard/useDashboardWeekly";
import { AREA_OPTIONS, buildAreaChartData } from "../../../utils/satisfactionAreaUtils";
 
export function useDailySatisfactionArea() {
  const [selectedOption, setSelectedOption] = useState(AREA_OPTIONS[0]);
  const [selectedDay, setSelectedDay]       = useState(new Date());
 
  const params = useMemo(
    () => ({ days: Number(selectedOption.value) }),
    [selectedOption]
  );
 
  const { data, loading, error } = useDailySatisfactionTrend(params);
 
  const chartData = useMemo(
    () => buildAreaChartData(data, params.days),
    [data, params.days]
  );
 
  return {
    selectedOption, setSelectedOption,
    selectedDay, setSelectedDay,
    loading, error,
    chartData,
  };
}
 