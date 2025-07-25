import React, { useState } from "react";
import { useData } from "../../context/DataContext";

const AddItemModal = ({ isOpen, onClose, listId, onItemAdded }) => {
  const { user, createNewItem } = useData();

  const [form, setForm] = useState({
    name: "",
    quantity: 1,
    unit: "un",
    price: "",
    market: "",
    notes: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.market) {
      alert("Preencha os campos obrigatórios: Nome e Mercado.");
      return;
    }

    await createNewItem(user.uid, listId, {
      name: form.name,
      quantity: Number(form.quantity),
      unit: form.unit,
      price: parseFloat(form.price || "0"),
      market: form.market,
      notes: form.notes,
    });

    onItemAdded(); // Atualiza a lista
    onClose(); // Fecha o modal
    setForm({ name: "", quantity: 1, unit: "un", price: "", market: "", notes: "" });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-md">
        <h2 className="text-lg font-semibold mb-4">Adicionar item</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="text"
            name="name"
            placeholder="Nome do produto *"
            value={form.name}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />

          <div className="flex gap-2">
            <input
              type="number"
              name="quantity"
              placeholder="Quantidade"
              value={form.quantity}
              onChange={handleChange}
              className="w-1/2 border p-2 rounded"
            />
            <select
              name="unit"
              value={form.unit}
              onChange={handleChange}
              className="w-1/2 border p-2 rounded"
            >
              <option value="un">un</option>
              <option value="kg">kg</option>
              <option value="g">g</option>
              <option value="dúzia">dúzia</option>
            </select>
          </div>

          <input
            type="number"
            name="price"
            placeholder="Preço"
            value={form.price}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />

          <input
            type="text"
            name="market"
            placeholder="Mercado *"
            value={form.market}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />

          <textarea
            name="notes"
            placeholder="Observações"
            value={form.notes}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            rows={2}
          />

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm rounded bg-gray-300 text-black"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm rounded bg-yellow-500 text-black font-semibold"
            >
              Adicionar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddItemModal;
