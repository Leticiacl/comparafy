const NewListModal: React.FC<NewListModalProps> = ({ isOpen, onClose, onCreate }) => {
  const [listName, setListName] = useState('');

  const handleCreate = () => {
    if (listName.trim() !== '') {
      onCreate(listName.trim());
      setListName('');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-center justify-center">
      <div className="bg-white w-full max-w-sm rounded-2xl p-6 shadow-lg">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Digite o nome da nova lista</h2>
        <input
          type="text"
          value={listName}
          onChange={(e) => setListName(e.target.value)}
          className="w-full border border-gray-300 rounded-xl px-4 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-yellow-500"
          placeholder="Ex: Compras do mês"
        />
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 transition"
          >
            Cancelar
          </button>
          <button
            onClick={handleCreate}
            className="px-4 py-2 rounded-xl bg-yellow-500 text-black font-semibold hover:bg-yellow-400 transition"
          >
            Criar
          </button>
        </div>
      </div>
    </div>
  );
};
