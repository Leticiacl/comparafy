import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRightIcon, ListIcon, BarChart4Icon, ScanLineIcon } from 'lucide-react';
interface OnboardingProps {
  onComplete: () => void;
}
const Onboarding: React.FC<OnboardingProps> = ({
  onComplete
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const navigate = useNavigate();
  const steps = [{
    title: 'Bem-vindo ao Comparify',
    description: 'Organize suas compras e economize dinheiro comparando preços entre supermercados.',
    icon: <img src="/COMPARAFY.png" alt="Logo" className="h-16 object-contain" />
  }, {
    title: 'Crie listas de compras',
    description: 'Adicione produtos, quantidades e acompanhe quanto vai gastar antes mesmo de ir ao mercado.',
    icon: <ListIcon className="w-16 h-16 text-yellow-500" />
  }, {
    title: 'Compare preços',
    description: 'Veja onde cada produto está mais barato e acompanhe sua economia ao longo do tempo.',
    icon: <BarChart4Icon className="w-16 h-16 text-yellow-500" />
  }, {
    title: 'Escaneie notas fiscais',
    description: 'Capture QR Codes das notas fiscais para importar automaticamente seus produtos.',
    icon: <ScanLineIcon className="w-16 h-16 text-yellow-500" />
  }];
  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
      navigate('/login');
    }
  };
  const handleSkip = () => {
    onComplete();
    navigate('/login');
  };
  return <div className="flex flex-col items-center justify-between min-h-screen bg-white dark:bg-black p-6">
      <div className="w-full text-center mt-8">
        {currentStep === 0 ? <div className="flex justify-center items-center h-32">
            <img src="/COMPARAFY.png" alt="Logo" className="h-10 object-contain" />
          </div> : <img src="/COMPARAFY.png" alt="Logo" className="h-10 object-contain mx-auto" />}
      </div>
      <div className="flex flex-col items-center justify-center flex-grow w-full max-w-sm">
        {currentStep > 0 && <div className="flex justify-center items-center mb-8 w-32 h-32 rounded-full bg-yellow-50 dark:bg-yellow-900/20">
            {steps[currentStep].icon}
          </div>}
        <h2 className="text-xl font-bold mb-2">{steps[currentStep].title}</h2>
        <p className="text-gray-600 dark:text-gray-300 text-center mb-8">
          {steps[currentStep].description}
        </p>
        <div className="flex gap-2 mb-4">
          {steps.map((_, index) => <div key={index} className={`w-2 h-2 rounded-full ${index === currentStep ? 'bg-yellow-500' : 'bg-gray-300 dark:bg-gray-700'}`} />)}
        </div>
      </div>
      <div className="w-full flex flex-col gap-4 mb-8">
        <button onClick={handleNext} className="w-full bg-yellow-500 text-black font-medium py-3 rounded-lg flex items-center justify-center">
          {currentStep < steps.length - 1 ? 'Próximo' : 'Começar'}
          <ChevronRightIcon className="ml-1 h-5 w-5" />
        </button>
        {currentStep < steps.length - 1 && <button onClick={handleSkip} className="w-full text-gray-500 dark:text-gray-400 py-2">
            Pular
          </button>}
      </div>
    </div>;
};
export default Onboarding;