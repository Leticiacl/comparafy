import React from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

const Terms: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="p-4 pb-32 max-w-xl mx-auto bg-white space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-center mb-4">
        <button
          onClick={() => navigate(-1)}
          className="p-1 mr-2"
          aria-label="Voltar"
        >
          <ArrowLeftIcon className="w-6 h-6 text-gray-600" />
        </button>
        <h1 className="text-2xl font-bold">Termos de Uso</h1>
      </div>

      {/* Conteúdo dos termos */}
      <div className="prose prose-gray max-w-none">
        <h2>1. Introdução</h2>
        <p>
          Bem-vindo ao Comparafy! Estes Termos de Uso regem o acesso e uso dos nossos serviços.
        </p>
        <h2>2. Privacidade</h2>
        <p>
          Sua privacidade é muito importante. Consulte nossa Política de Privacidade para entender como coletamos e utilizamos seus dados.
        </p>
        <h2>3. Uso do Aplicativo</h2>
        <p>
          Você concorda em usar o Comparafy apenas para fins legais e de acordo com estes termos.
        </p>
        <h2>4. Limitações de Responsabilidade</h2>
        <p>
          O Comparafy não se responsabiliza por diferenças de preços que possam ocorrer nos supermercados.
        </p>
        <h2>5. Alterações nos Termos</h2>
        <p>
          Podemos atualizar estes termos a qualquer momento. Avisaremos sobre mudanças significativas.
        </p>
        <h2>6. Contato</h2>
        <p>
          Em caso de dúvidas, entre em contato conosco pelo suporte@comparafy.com.
        </p>
      </div>

      {/* Barra inferior */}
      <BottomNav activeTab="profile" />
    </div>
  );
};

export default Terms;
