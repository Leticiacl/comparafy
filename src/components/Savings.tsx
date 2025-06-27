// src/components/Savings.tsx
import React, { useState } from 'react';
import { useData } from '../context/DataContext'; // Importando o DataContext

const Savings = () => {
  const { data, addSavings } = useData();  // Pegando os dados e a função addSavings do contexto
  const [month, setMonth] = useState('');
  const [amount, setAmount] = useState(0);

  const handleAddSavings = () => {
    if (month && amount > 0) {
      addSavings(month, amount);  // Adiciona a economia ao Firestore e ao estado
    }
  };

  return (
    <div>
      <h2>Economias</h2>
      <div>
        <label>Mes:</label>
        <input
          type="text"
          value={month}
          onChange={(e) => setMonth(e.target.value)}  // Atualiza o mês
          placeholder="Digite o mês"
        />
      </div>
      <div>
        <label>Valor:</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}  // Atualiza o valor economizado
          placeholder="Digite o valor economizado"
        />
      </div>
      <button onClick={handleAddSavings}>Adicionar Economia</button>

      <h3>Economias Registradas:</h3>
      <ul>
        {data.savings.map((savings, index) => (
          <li key={index}>
            {savings.month}: R$ {savings.amount}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Savings;