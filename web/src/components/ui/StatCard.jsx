import Icon from './Icon.jsx';

export default function StatCard({ label, value, sub, trend, color = 'var(--c-primary)', iconName }) {
  return (
    <div className="stat-card">
      <div className="stat-top">
        <div>
          <div className="stat-label">{label}</div>
          <div className="stat-value" style={{ marginTop: 4 }}>{value}</div>
        </div>
        {iconName && (
          <div
            className="stat-icon"
            style={{
              background: `color-mix(in srgb, ${color} 12%, transparent)`,
              color: color,
              borderColor: `color-mix(in srgb, ${color} 25%, transparent)`,
            }}
          >
            <Icon name={iconName} />
          </div>
        )}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginTop: 'auto' }}>
        {sub && <div className="stat-sub">{sub}</div>}
        {trend && (
          <span
            style={{
              fontSize: '11px',
              fontWeight: 600,
              padding: '2px 6px',
              borderRadius: 'var(--radius-pill)',
              background: trend.startsWith('+') ? 'var(--c-success-bg)' : 'rgba(2, 132, 199, 0.1)',
              color: trend.startsWith('+') ? 'var(--c-success)' : 'var(--c-primary)',
              marginLeft: 'auto',
            }}
          >
            {trend}
          </span>
        )}
      </div>
    </div>
  );
}
