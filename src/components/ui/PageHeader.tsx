import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";

type Props = {
  title?: string;
  subtitle?: string;
  back?: boolean;
  rightSlot?: React.ReactNode;
  className?: string;
};

const PageHeader: React.FC<Props> = ({ title, subtitle, back, rightSlot, className }) => {
  const navigate = useNavigate();

  return (
    <div className={`mb-4 flex items-center justify-between ${className || ""}`}>
      <div className="flex flex-1 items-start">
        {back ? (
          <button onClick={() => navigate(-1)} className="mr-2 p-1" aria-label="Voltar">
            <ArrowLeftIcon className="h-6 w-6 text-gray-600" />
          </button>
        ) : null}

        <div className="flex-1">
          {title ? <h1 className="text-2xl font-bold text-gray-900">{title}</h1> : null}
          {subtitle ? <p className="mt-0.5 text-sm text-gray-500">{subtitle}</p> : null}
        </div>
      </div>

      {rightSlot ? (
        <div className="ml-2">{rightSlot}</div>
      ) : (
        <img src="/LOGO_REDUZIDA.png" alt="Comparafy" className="ml-2 h-9 w-9" />
      )}
    </div>
  );
};

export default PageHeader;
