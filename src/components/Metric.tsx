import './Metric.css';

interface MetricProps {
  label: string;
  value: string;
}

export function Metric({ label, value }: MetricProps) {
  return (
    <div className="cyber-metric">
      <span className="metric-label">[{label}]</span>
      <span className="metric-value">{value}</span>
    </div>
  );
}
