import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  LineController,
  BarController,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Chart } from "react-chartjs-2";
 
import DashboardFilter from "../../shared/DashboardFilter";
import { useDailySatisfactionArea } from "./useDailySatisfactionArea";
import { AREA_OPTIONS, buildChartDataset, CHART_OPTIONS } from "../../../utils/satisfactionAreaUtils";
 
ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, LineController, BarController, Title, Tooltip, Legend, Filler
);
 
const ChartLoading = () => (
  <div className="h-full min-h-[300px] w-full flex flex-col items-center justify-center bg-slate-50 rounded-xl animate-pulse border-2 border-dashed border-slate-200">
    <div className="w-10 h-10 border-4 border-indigo-300 border-t-indigo-600 rounded-full animate-spin mb-3" />
    <span className="text-indigo-400 text-sm font-semibold tracking-wide">
      Cargando métricas...
    </span>
  </div>
);
 
export default function DailySatisfactionArea() {
  const {
    selectedOption, setSelectedOption,
    selectedDay, setSelectedDay,
    loading, chartData,
  } = useDailySatisfactionArea();
 
  const dataset = buildChartDataset(chartData.labels, chartData.values, chartData.counts);
 
  return (
    <div className="col-span-12 lg:col-span-8 bg-white border border-slate-200 p-6 rounded-3xl shadow-sm flex flex-col min-h-[450px]">
      <div className="flex justify-between items-start mb-6">
        <h3 className="text-slate-800 font-bold uppercase text-sm tracking-wider">
          Tendencia de Satisfacción
        </h3>
        <DashboardFilter
          options={AREA_OPTIONS}
          selectedOption={selectedOption}
          setSelectedOption={setSelectedOption}
          selectedDay={selectedDay}
          setSelectedDay={setSelectedDay}
        />
      </div>
 
      <div className="flex-1 flex items-center justify-center w-full">
        {loading ? (
          <ChartLoading />
        ) : (
          <div className="w-full h-80 md:h-96">
            <Chart type="bar" data={dataset} options={CHART_OPTIONS} />
          </div>
        )}
      </div>
    </div>
  );
}