const AVATAR_GRADIENTS = [
  'linear-gradient(135deg, #0284c7 0%, #0d9488 100%)',
  'linear-gradient(135deg, #3b82f6 0%, #2dd4bf 100%)',
  'linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%)',
  'linear-gradient(135deg, #0ea5e9 0%, #10b981 100%)',
  'linear-gradient(135deg, #6366f1 0%, #38bdf8 100%)',
  'linear-gradient(135deg, #0d9488 0%, #14b8a6 100%)',
];

function getGradient(name = '') {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % AVATAR_GRADIENTS.length;
  return AVATAR_GRADIENTS[index];
}

function initials(name = '') {
  if (!name) return 'U';
  return name
    .trim()
    .split(/\s+/)
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export default function Avatar({ name = '', large, style = {} }) {
  const gradient = getGradient(name);
  return (
    <div
      className={`avatar ${large ? 'avatar-lg' : ''}`}
      style={{
        background: gradient,
        letterSpacing: '0.02em',
        ...style,
      }}
      title={name}
      aria-label={name}
    >
      {initials(name)}
    </div>
  );
}
