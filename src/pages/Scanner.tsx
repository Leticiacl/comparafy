// src/pages/Scanner.tsx
import React, { useRef, useState } from 'react';
import Header from '../components/Header';
import { showToast } from '../components/ui/Toaster';
import { auth } from '../services/firebase';
import BottomNav from '../components/BottomNav';

const Scanner: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [scannedData, setScannedData] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  const handleStartScan = () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      showToast('Seu navegador não suporta acesso à câmera.', 'error');
      return;
    }

    setIsScanning(true);

    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: 'environment' } })
      .then((stream) => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.setAttribute('playsinline', 'true');
          videoRef.current.play();
        }
      })
      .catch((error) => {
        console.error('Erro ao acessar a câmera:', error);
        showToast('Erro ao acessar a câmera.', 'error');
        setIsScanning(false);
      });
  };

  const handleStopScan = () => {
    const stream = videoRef.current?.srcObject as MediaStream;
    stream?.getTracks().forEach((track) => track.stop());
    setIsScanning(false);
  };

  return (
    <div className="p-4 space-y-6 pb-24">
      <Header title="Scanner" />

      <div className="space-y-4">
        {isScanning ? (
          <>
            <video
              ref={videoRef}
              className="w-full rounded-xl shadow bg-black"
              autoPlay
              muted
            />
            <button
              onClick={handleStopScan}
              className="w-full bg-red-500 text-white py-3 rounded-xl font-semibold"
            >
              Parar Scanner
            </button>
          </>
        ) : (
          <button
            onClick={handleStartScan}
            className="w-full bg-yellow-500 text-black py-3 rounded-xl font-semibold"
          >
            Iniciar Scanner
          </button>
        )}

        {scannedData && (
          <div className="bg-white p-4 rounded-xl shadow text-center">
            <p className="text-gray-700">QR Code lido:</p>
            <p className="font-mono break-all text-sm text-black">{scannedData}</p>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default Scanner;
