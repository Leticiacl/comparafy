import React from "react";
import { useNavigate } from "react-router-dom";
import LogoMark from "./LogoMark";

type Props = {
  subtitle?: string;
  divider?: boolean;
  subtitle?: string;
  title: string;
  showBack?: boolean;
  right?: React.ReactNode;
};

/** Cabeçalho padrão das páginas: título à esquerda e logo à direita */
const PageHeader: React.FC<Props> = ({ title, subtitle, divider, showBack = false, right }) => {
  const navigate = useNavigate();
  return (
    <div>
      <div className="flex justify-between items-center p-4">
      <div className="flex items-center gap-2">
        {showBack && (
          <button onClick={() => navigate(-1)} className="text-gray-500 text-xl leading-none">←</button>
        )}
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">{title}</h1>
          {subtitle ? <p className="text-sm text-gray-500 -mt-1">{subtitle}</p> : null}
        </div>
      </div>
      {right ?? <LogoMark />}
      </div>
      {divider ? <div className="px-4"><div className="border-b border-gray-200" /></div> : null}
    </div>
  );
};

export default PageHeader;
