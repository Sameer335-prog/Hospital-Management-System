import { useState, useEffect } from 'react';
import QRCode from 'qrcode';

export default function QrCode({
  value,
  size = 110,
  darkColor = '#000000',
  lightColor = '#ffffff',
  className = '',
  style = {},
}) {
  const [dataUrl, setDataUrl] = useState('');
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    let isMounted = true;
    if (!value) {
      setDataUrl('');
      return;
    }

    setHasError(false);
    QRCode.toDataURL(String(value), {
      width: Math.max(size * 2, 200), // Generate at 2x resolution for crisp thermal/A4 printing
      margin: 1,
      color: {
        dark: darkColor,
        light: lightColor,
      },
      errorCorrectionLevel: 'M',
    })
      .then((url) => {
        if (isMounted) {
          setDataUrl(url);
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.warn('[QRCode generation error]', err);
          setHasError(true);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [value, size, darkColor, lightColor]);

  if (hasError) {
    return (
      <div
        style={{
          width: size,
          height: size,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: lightColor,
          border: '1px solid #ef4444',
          borderRadius: 4,
          fontSize: 9,
          color: '#dc2626',
          textAlign: 'center',
          padding: 4,
          ...style,
        }}
        className={className}
      >
        QR Error
      </div>
    );
  }

  if (!dataUrl) {
    return (
      <div
        style={{
          width: size,
          height: size,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: lightColor,
          border: '1px solid rgba(0,0,0,0.08)',
          borderRadius: 4,
          ...style,
        }}
        className={className}
      >
        <span style={{ fontSize: 9, color: '#94a3b8' }}>…</span>
      </div>
    );
  }

  return (
    <img
      src={dataUrl}
      alt={`QR Code verification: ${value}`}
      width={size}
      height={size}
      loading="eager"
      style={{
        display: 'inline-block',
        borderRadius: 4,
        imageRendering: 'pixelated', // Razor sharp on 203dpi thermal printers and screens
        maxWidth: '100%',
        height: 'auto',
        ...style,
      }}
      className={className}
    />
  );
}

