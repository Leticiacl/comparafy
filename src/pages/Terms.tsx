import React from "react";
import PageHeader from "../components/ui/PageHeader";
import BottomNav from "../components/BottomNav";
import { ShieldCheckIcon, ScaleIcon, DocumentTextIcon, ExclamationTriangleIcon, ShoppingCartIcon, ChartBarIcon } from "@heroicons/react/24/outline";

const UPDATED_AT = new Date().toLocaleDateString("pt-BR");

const Row: React.FC<{ icon: React.ReactNode; title: string; children: React.ReactNode }> = ({ icon, title, children }) => (
  <section className="rounded-2xl border border-gray-200 p-4">
    <div className="mb-2 flex items-center gap-2">
      {icon}
      <h2 className="text-base font-semibold text-gray-900">{title}</h2>
    </div>
    <div className="space-y-2 text-gray-700">{children}</div>
  </section>
);

const Terms: React.FC = () => {
  const containerClass =
    "mx-auto w-full max-w-screen-sm md:max-w-screen-md lg:max-w-screen-lg xl:max-w-screen-xl bg-white px-4 md:px-6 pb-28";
  return (
    <div className={containerClass}>
      <PageHeader title="Termos de Uso" />
      <p className="mb-4 text-sm text-gray-500">Última atualização: {UPDATED_AT}</p>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Row icon={<DocumentTextIcon className="h-5 w-5 text-yellow-600" />} title="Introdução">
          <p>
            Bem-vindo ao <strong>Comparafy</strong>. Estes Termos de Uso regem o acesso e a utilização do aplicativo e
            serviços relacionados. Ao usar o Comparafy, você concorda integralmente com estes termos.
          </p>
        </Row>

        <Row icon={<ShieldCheckIcon className="h-5 w-5 text-yellow-600" />} title="Privacidade e Dados">
          <p>Valorizamos sua privacidade e tratamos dados conforme a LGPD.</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Exclusão de conta/dados pelo app quando desejar.</li>
            <li>Coleta de metadados de uso para melhoria do serviço.</li>
          </ul>
        </Row>

        <Row icon={<ShoppingCartIcon className="h-5 w-5 text-yellow-600" />} title="Funcionalidades">
          <ul className="list-disc pl-5 space-y-1">
            <li>Organização de <strong>listas</strong> e registro de <strong>compras</strong>.</li>
            <li><strong>Comparação de preços</strong> entre mercados.</li>
            <li>Importação via QR Code/NFC‑e quando disponível.</li>
          </ul>
        </Row>

        <Row icon={<ExclamationTriangleIcon className="h-5 w-5 text-yellow-600" />} title="Limitações">
          <ul className="list-disc pl-5 space-y-1">
            <li>Preços podem variar por data/região/promoções.</li>
            <li>Serviços de terceiros (SEFAZ, redes) podem afetar a disponibilidade.</li>
            <li>O Comparafy é fornecido “como está”.</li>
          </ul>
        </Row>

        <Row icon={<ChartBarIcon className="h-5 w-5 text-yellow-600" />} title="Alterações e Encerramento">
          <p>Podemos atualizar estes termos; avisaremos mudanças relevantes.</p>
          <p>Conta pode ser encerrada a qualquer momento pelo usuário.</p>
        </Row>

        <Row icon={<ScaleIcon className="h-5 w-5 text-yellow-600" />} title="Lei e Foro">
          <p>Leis do Brasil. Foro do seu domicílio, conforme regras legais.</p>
        </Row>
      </div>

      <div className="mt-4 text-sm text-gray-600">
        Suporte: <strong>Instagram → @comparafy</strong>.
      </div>

      <BottomNav activeTab="profile" />
    </div>
  );
};

export default Terms;
