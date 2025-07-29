// src/components/ui/NewListModal.tsx
import React from "react";
import CreateListModal from "./CreateListModal";
import { useData } from "../../context/DataContext";
import { useNavigate } from "react-router-dom";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const NewListModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { createList } = useData();
  const navigate = useNavigate();

  const handleCreate = async (name: string) => {
    const nova = await createList(name);
    if (nova) {
      navigate(`/lists/${nova.id}`);
      onClose();
    }
  };

  return <CreateListModal isOpen={isOpen} onClose={onClose} onCreate={handleCreate} />;
};

export default NewListModal;
