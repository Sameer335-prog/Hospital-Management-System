import { useCallback, useRef, useState } from 'react';

/** Usage: const { toast, showToast } = useToast();  ...  {toast && <Toast text={toast} />} */
export function useToast() {
  const [toast, setToast] = useState(null);
  const timerRef = useRef(null);

  const showToast = useCallback((message) => {
    setToast(message);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setToast(null), 2600);
  }, []);

  return { toast, showToast };
}
