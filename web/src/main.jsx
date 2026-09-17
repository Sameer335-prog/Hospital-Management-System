import { createRoot } from 'react-dom/client';
import './legacy/legacy.css';
import App from './App.jsx';

/*
 * NOTE: intentionally not wrapped in <StrictMode>.
 * The ported legacy engine (src/legacy/legacyEngine.js) keeps its own
 * internal mutable module-level state (as the original static prototype
 * did) and renders into a single DOM node via innerHTML rather than
 * through React's virtual DOM. StrictMode's dev-only double-invoke of
 * effects is safe for idiomatic React components but would double-mount
 * that bridge. Every *new* component in this app (routes, context, pages)
 * is written to be StrictMode-safe; only the legacy bridge opts out.
 */
createRoot(document.getElementById('root')).render(<App />);

