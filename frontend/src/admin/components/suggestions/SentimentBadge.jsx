
const sentimentConfig = {
  'Positive': { label: 'Positivo', color: 'bg-green-50 text-green-600' },
  'Negative': { label: 'Negativo', color: 'bg-rose-50 text-rose-600' },
  'Neutral': { label: 'Neutral', color: 'bg-slate-100 text-slate-600' }
};

export default function SentimentBadge({ sentiment }) {

  const config = sentimentConfig[sentiment] || sentimentConfig['Neutral'];

  return (
    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black inline-flex items-center gap-1.5 shadow-sm ${config.color}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60"></span>
      {config.label}
    </span>
  );
}