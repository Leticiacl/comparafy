// src/components/Savings.tsx
import React, { useState } from 'react';
import { useData } from '../context/DataContext'; // Importando o DataContext

const Savings = () => {
  const { data, addSavings } = useData(); // Pegando os dados e a função addSavings do contexto
  const [month, setMonth] = useState('');  // Armazenando o mês digitado
  const [amount, setAmount] = useState(0);  // Armazenando o valor economizado

  const handleAddSavings = () => {
    // Verifica se mês e valor foram preenchidos corretamente
    if (month && amount > 0) {
      addSavings(month, amount); // Chama a função para adicionar economia
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
          onChange={(e) => setMonth(e.target.value)}  // Atualiza o estado com o mês
          placeholder="Digite o mês"
        />
      </div>
      <div>
        <label>Valor:</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}  // Atualiza o estado com o valor
          placeholder="Digite o valor economizado"
        />
      </div>
      <button onClick={handleAddSavings}>Adicionar Economia</button>

      <h3>Economias Registradas:</h3>
      <ul>
        {data.savings.map((savings, index) => (
          <li key={index}>
            {savings.month}: R$ {savings.amount}  {/* Exibe mês e valor das economias */}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Savings;
