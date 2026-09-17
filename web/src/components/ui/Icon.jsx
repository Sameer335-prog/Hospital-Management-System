import { ICONS } from '../../legacy/legacyEngine.js';

export default function Icon({ name, style, 'aria-hidden': ariaHidden = 'true' }) {
  const svg = ICONS[name];
  if (!svg) return null;
  // eslint-disable-next-line react/no-danger
  return <span aria-hidden={ariaHidden} style={{ display: 'inline-flex', ...style }} dangerouslySetInnerHTML={{ __html: svg }} />;
}
