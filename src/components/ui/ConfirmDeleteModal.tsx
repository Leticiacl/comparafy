import React from "react";

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl p-6 w-11/12 max-w-sm shadow-xl"
        onClick={(e) => e.stopPropagation()} // impede clique no fundo de propagar
      >
        <h2 className="text-lg font-semibold mb-4">Deseja excluir esta lista?</h2>
        <div className="flex justify-end gap-4">
          <button onClick={onClose} className="text-gray-600">
            Cancelar
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onConfirm();
              onClose();
            }}
            className="text-red-600 font-semibold"
          >
            Excluir
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDeleteModal;
