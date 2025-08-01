// src/pages/Scanner.tsx
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BrowserMultiFormatReader } from '@zxing/browser';
import BottomNav from '../components/BottomNav';

const Scanner: React.FC = () => {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!videoRef.current) return;

    const codeReader = new BrowserMultiFormatReader();

    codeReader
      .decodeOnceFromVideoDevice(/* deviceId */ undefined, /* videoElem */ videoRef.current)
      .then(result => {
        const code = result.getText();
        // libera a câmera
        if (videoRef.current?.srcObject) {
          (videoRef.current.srcObject as MediaStream)
            .getTracks()
            .forEach(t => t.stop());
        }
        navigate(`/compare?barcode=${encodeURIComponent(code)}`);
      })
      .catch(err => {
        console.error(err);
        setError('Não foi possível ler o código. Verifique a permissão de câmera.');
      });

    // caso o componente desmonte antes da leitura
    return () => {
      if (videoRef.current?.srcObject) {
        (videoRef.current.srcObject as MediaStream)
          .getTracks()
          .forEach(t => t.stop());
      }
    };
  }, [navigate]);

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Header */}
      <div className="flex justify-between items-center p-4 border-b">
        <h1 className="text-xl font-bold">Scanner</h1>
        <img src="/LOGO_REDUZIDA.png" alt="Logo" className="h-10" />
      </div>

      {/* Preview ou erro */}
      <div className="flex-1 px-4 flex items-center justify-center">
        {error ? (
          <p className="text-red-500 text-center">{error}</p>
        ) : (
          <video
            ref={videoRef}
            className="w-full max-w-md h-80 bg-gray-100 rounded-lg"
            autoPlay
            muted
            playsInline
          />
        )}
      </div>

      <BottomNav activeTab="scanner" />
    </div>
  );
};

export default Scanner;
