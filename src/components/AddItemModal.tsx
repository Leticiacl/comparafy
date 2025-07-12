import React, { useState } from 'react';

interface Item {
  name: string;
  quantity: number;
  unit: 'un' | 'g' | 'kg';
  price: number;
  storeId: string;
  notes?: string;
}

interface AddItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (item: Item) => void;
}

const AddItemModal: React.FC<AddItemModalProps> = ({ isOpen, onClose, onAdd }) => {
  const [item, setItem] = useState<Item>({
    name: '',
    quantity: 1,
    unit: 'un',
    price: 0,
    storeId: '',
    notes: ''
  });

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setItem(prev => ({
      ...prev,
      [name]: name === 'quantity' || name === 'price' ? Number(value) : value
    }));
  };

  const handleSubmit = () => {
    onAdd(item);
    onClose();
    setItem({ name: '', quantity: 1, unit: 'un', price: 0, storeId: '', notes: '' });
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-md">
        <h2 className="text-lg font-semibold mb-4">Adicionar Item</h2>
        <div className="space-y-3">
          <input type="text" name="name" placeholder="Nome" value={item.name} onChange={handleChange} className="w-full p-2 border rounded" />
          <input type="number" name="quantity" placeholder="Quantidade" value={item.quantity} onChange={handleChange} className="w-full p-2 border rounded" />
          <select name="unit" value={item.unit} onChange={handleChange} className="w-full p-2 border rounded">
            <option value="un">Unidade</option>
            <option value="g">Gramas</option>
            <option value="kg">Quilos</option>
          </select>
          <input type="number" name="price" placeholder="Preço" value={item.price} onChange={handleChange} className="w-full p-2 border rounded" />
          <input type="text" name="storeId" placeholder="ID da loja" value={item.storeId} onChange={handleChange} className="w-full p-2 border rounded" />
          <input type="text" name="notes" placeholder="Notas (opcional)" value={item.notes} onChange={handleChange} className="w-full p-2 border rounded" />
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <button onClick={onClose} className="px-4 py-2 rounded bg-gray-200">Cancelar</button>
          <button onClick={handleSubmit} className="px-4 py-2 rounded bg-yellow-500 text-white">Adicionar</button>
        </div>
      </div>
    </div>
  );
};

export default AddItemModal;
