// src/pages/Scanner.tsx
import React, { useState } from 'react';
import { QrReader } from 'react-qr-reader';
import BottomNav from '../components/BottomNav';

const Scanner: React.FC = () => {
  const [result, setResult] = useState<string>('');
  const [error, setError]   = useState<string>('');

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Header */}
      <div className="flex justify-between items-center p-4">
        <h1 className="text-xl font-bold">Scanner</h1>
        <img src="/LOGO_REDUZIDA.png" alt="Logo" className="h-10" />
      </div>

      {/* Leitor de QR */}
      <div className="flex-1 px-4 flex flex-col items-center justify-center space-y-4">
        <div className="w-full max-w-sm">
          <QrReader
            constraints={{ facingMode: 'environment' }}
            onResult={(res, err) => {
              if (res) {
                setResult(res.getText());
                setError('');
              }
              if (err) {
                // Exibe só o primeiro erro ou mensagem genérica
                setError(() => err.message);
              }
            }}
            videoStyle={{ width: '100%', borderRadius: 8 }}
          />
        </div>

        {result && (
          <p className="text-green-600 break-words">
            📄 Resultado: {result}
          </p>
        )}
        {error && (
          <p className="text-red-500">
            ⚠️ {error}
          </p>
        )}
      </div>

      <BottomNav activeTab="scanner" />
    </div>
  );
};

export default Scanner;
