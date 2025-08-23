import React, { useCallback, useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";
import BottomNav from "../components/BottomNav";
import PageHeader from "../components/ui/PageHeader";
import CameraPermissionModal from "@/components/ui/CameraPermissionModal";

const Scanner: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const readerRef = useRef<BrowserMultiFormatReader | null>(null);
  const [status, setStatus] = useState<string>("Pronto para ler QR code.");
  const [running, setRunning] = useState(false);

  // modal de permissão
  const [needPerm, setNeedPerm] = useState(false);

  // libera câmera/reader
  const stop = useCallback(() => {
    try {
      readerRef.current?.reset();
    } catch {}
    // também encerra qualquer stream preso no <video>
    const stream = videoRef.current?.srcObject as MediaStream | null;
    stream?.getTracks().forEach((t) => t.stop());
    if (videoRef.current) videoRef.current.srcObject = null;
    setRunning(false);
    setStatus("Leitura parada.");
  }, []);

  useEffect(() => {
    return () => stop(); // cleanup ao sair da tela
  }, [stop]);

  // escolhe a melhor câmera (traseira se existir)
  const pickDeviceId = async (): Promise<string | undefined> => {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const videos = devices.filter((d) => d.kind === "videoinput");
    if (videos.length === 0) return undefined;
    const back = videos.find((d) => /back|traseira|rear/i.test(d.label));
    return (back || videos[0]).deviceId;
  };

  const beginReading = useCallback(async () => {
    setStatus("Preparando câmera...");
    const deviceId = await pickDeviceId();
    if (!deviceId) {
      setStatus("Nenhuma câmera encontrada.");
      return;
    }

    try {
      const reader = new BrowserMultiFormatReader();
      readerRef.current = reader;

      // Inicia leitura contínua
      await reader.decodeFromVideoDevice(deviceId, videoRef.current!, (result, _err, controls) => {
        if (!running) return; // só por segurança
        if (result) {
          setStatus(`QR lido: ${result.getText()}`);
          controls.stop(); // para após o primeiro QR (se quiser contínuo, remova)
          setRunning(false);
        }
      });

      setRunning(true);
      setStatus("Aponte a câmera para o QR code.");
    } catch (e) {
      console.error(e);
      setStatus("Erro ao iniciar a câmera.");
      stop();
    }
  }, [running, stop]);

  // botão principal
  const start = useCallback(async () => {
    setStatus("Verificando permissão da câmera...");
    try {
      // alguns navegadores suportam checagem de permissão
      // @ts-ignore
      const status = await navigator.permissions?.query({ name: "camera" as PermissionName });
      if (status?.state === "granted") {
        await beginReading();
      } else {
        setNeedPerm(true); // abre modal bonitinho
      }
    } catch {
      // se não der para checar, abrimos o modal mesmo assim
      setNeedPerm(true);
    }
  }, [beginReading]);

  return (
    <div className="mx-auto flex min-h-screen max-w-xl flex-col bg-white">
      <PageHeader title="Scanner" />
      <div className="flex flex-1 flex-col items-center justify-center px-4 pb-2 text-gray-600">
        {/* Vídeo com cantos arredondados, mesmo padrão dos modais compactos */}
        <video
          ref={videoRef}
          className="mb-4 w-full max-w-md rounded-xl border border-gray-200"
          muted
          playsInline
        />
        <p className="mb-4 text-sm">{status}</p>

        {!running ? (
          <button
            className="rounded-xl bg-yellow-500 px-5 py-3 font-semibold text-black hover:brightness-95"
            onClick={start}
          >
            Ler QR code
          </button>
        ) : (
          <button
            className="rounded-xl bg-gray-100 px-5 py-3 font-semibold text-gray-800 hover:bg-gray-200"
            onClick={stop}
          >
            Parar
          </button>
        )}
      </div>

      <BottomNav activeTab="compare" />

      {/* Modal de permissão: ao conceder, iniciamos a leitura */}
      <CameraPermissionModal
        open={needPerm}
        onClose={() => setNeedPerm(false)}
        onGranted={async (_stream) => {
          // Não usamos diretamente o stream; apenas garantimos a permissão concedida
          // (re-enumerar dispositivos agora traz rótulos e traseira)
          setNeedPerm(false);
          await beginReading();
        }}
      />
    </div>
  );
};

export default Scanner;
