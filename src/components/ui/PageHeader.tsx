import React from "react";

type Props = {
  /** Título grande (igual ao do Dashboard) */
  title: string;
  /** Linha de apoio pequena (opcional) */
  subtitle?: React.ReactNode;
  /** Conteúdo à esquerda do título (ex.: botão de voltar) */
  leftSlot?: React.ReactNode;
  /** Ações no topo à direita (ex.: menu ⋮) */
  rightSlot?: React.ReactNode;
  /** Mostra a logo no canto direito (default: true) */
  showLogo?: boolean;
};

/**
 * Cabeçalho padrão do app.
 * Mantém título, tamanho de fonte e logo idênticos ao Dashboard.
 */
const PageHeader: React.FC<Props> = ({
  title,
  subtitle,
  leftSlot,
  rightSlot,
  showLogo = true,
}) => {
  return (
    <div className="mb-4 flex items-center justify-between">
      <div className="flex flex-1 items-start">
        {leftSlot ? <div className="mr-2">{leftSlot}</div> : null}
        <div className="flex-1">
          <h1 className="text-2xl font-extrabold text-gray-900">{title}</h1>
          {subtitle ? (
            <div className="-mt-0.5 text-sm text-gray-500">{subtitle}</div>
          ) : null}
        </div>
      </div>

      <div className="ml-2 flex items-center gap-2">
        {rightSlot}
        {showLogo && (
          <img
            src="/LOGO_REDUZIDA.png"
            alt="Comparafy"
            className="h-9 w-auto"
          />
        )}
      </div>
    </div>
  );
};

export default PageHeader;
