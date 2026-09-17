import Icon from './Icon.jsx';

export default function Toast({ text }) {
  if (!text) return null;
  return (
    <div className="toast" role="status" aria-live="polite">
      <Icon name="check" /> {text}
    </div>
  );
}
