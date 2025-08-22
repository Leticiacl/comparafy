// src/pages/Terms.tsx
import React from "react";
import { useNavigate } from "react-router-dom";
import BottomNav from "../components/BottomNav";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import PageHeader from "../components/ui/PageHeader";

const Terms: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="p-4 pb-32 max-w-xl mx-auto bg-white space-y-6">
      <PageHeader
        title="Termos de Uso"
        leftSlot={
          <button onClick={() => navigate(-1)} className="p-1" aria-label="Voltar">
            <ArrowLeftIcon className="w-6 h-6 text-gray-600" />
          </button>
        }
      />

      <div className="prose max-w-none">
        <h2>1. Introdução</h2>
        <p>
          Bem-vindo ao Comparafy! Estes Termos de Uso regem o acesso e uso dos nossos serviços.
        </p>
        <h2>2. Privacidade</h2>
        <p>
          Sua privacidade é muito importante. Consulte nossa Política de Privacidade para entender como coletamos e
          utilizamos seus dados.
        </p>
        <h2>3. Uso do Aplicativo</h2>
        <p>Você concorda em usar o Comparafy apenas para fins legais e de acordo com estes termos.</p>
        <h2>4. Limitações de Responsabilidade</h2>
        <p>O Comparafy não se responsabiliza por diferenças de preços que possam ocorrer nos supermercados.</p>
        <h2>5. Alterações nos Termos</h2>
        <p>Podemos atualizar estes termos a qualquer momento. Avisaremos sobre mudanças significativas.</p>
        <h2>6. Contato</h2>
        <p>Em caso de dúvidas, entre em contato conosco pelo suporte@comparafy.com.</p>
      </div>

      <BottomNav activeTab="profile" />
    </div>
  );
};

export default Terms;
