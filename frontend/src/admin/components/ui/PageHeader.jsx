// components/common/PageHeader.jsx
export default function PageHeader({ title, subtitle }) {
  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 tracking-tight border-l-4 border-indigo-600 pl-4">
        {title}
      </h1>
      {subtitle && (
        <p className="text-sm mt-2 text-gray-500">{subtitle}</p>
      )}
    </div>
  );
}