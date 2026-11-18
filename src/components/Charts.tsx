import { formatMXN } from "../domain/money";
import type { WeekPoint } from "../domain/calculations";

export function WeekChart({ points }: { points: WeekPoint[] }) {
  const max = Math.max(...points.map((point) => point.amount), 1);
  const summary = points.map((point) => `${point.label}: ${formatMXN(point.amount)}`).join(". ");
  return (
    <figure className="chart">
      <svg role="img" aria-label={`Gasto de las últimas ${points.length} semanas. ${summary}`} viewBox="0 0 360 168">
        {points.map((point, index) => {
          const height = Math.max(point.amount > 0 ? 8 : 3, (point.amount / max) * 112);
          const x = 18 + index * 58;
          const y = 128 - height;
          const current = index === points.length - 1;
          const tick = `${Number(point.start.slice(8))}/${point.start.slice(5, 7)}`;
          return (
            <g key={point.start}>
              <rect x={x} y={y} width="34" height={height} rx="8" fill={current ? "#0f5c38" : "#9ec9b0"} />
              <text x={x + 17} y="150" textAnchor="middle" fontSize="11" fill="#3e4f46">
                {tick}
              </text>
            </g>
          );
        })}
      </svg>
      <table className="sr-only">
        <caption>Gasto por semana</caption>
        <thead>
          <tr>
            <th>Semana del</th>
            <th>Importe</th>
          </tr>
        </thead>
        <tbody>
          {points.map((point) => (
            <tr key={point.start}>
              <td>{point.label}</td>
              <td>{formatMXN(point.amount)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}

export function Sparkline({ values, label }: { values: number[]; label: string }) {
  if (values.length < 2) return null;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const width = 148;
  const height = 44;
  const coords = values.map((value, index) => {
    const x = (index / (values.length - 1)) * (width - 8) + 4;
    const y = max === min ? height / 2 : height - 6 - ((value - min) / (max - min)) * (height - 12);
    return `${x},${y}`;
  });
  return (
    <svg className="spark" viewBox={`0 0 ${width} ${height}`} role="img" aria-label={label}>
      <polyline points={coords.join(" ")} />
    </svg>
  );
}
