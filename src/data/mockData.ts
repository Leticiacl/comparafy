import { ShoppingList, Store, PriceRecord, Product, User } from "../context/DataContext";
export const generateMockData = () => {
  // Stores
  const stores: Store[] = [{
    id: "1",
    name: "Carrefour",
    logo: "https://upload.wikimedia.org/wikipedia/commons/5/5b/Carrefour_logo.svg"
  }, {
    id: "2",
    name: "Extra",
    logo: "https://logodownload.org/wp-content/uploads/2014/12/extra-logo-1.png"
  }, {
    id: "3",
    name: "Pão de Açúcar",
    logo: "https://logodownload.org/wp-content/uploads/2014/12/pao-de-acucar-logo-0.png"
  }, {
    id: "4",
    name: "Assaí",
    logo: "https://logodownload.org/wp-content/uploads/2017/10/assai-logo-1.png"
  }];
  // Products
  const products: Product[] = [{
    id: "1",
    name: "Arroz Branco 5kg",
    category: "Alimentos"
  }, {
    id: "2",
    name: "Feijão Carioca 1kg",
    category: "Alimentos"
  }, {
    id: "3",
    name: "Açúcar Refinado 1kg",
    category: "Alimentos"
  }, {
    id: "4",
    name: "Café em Pó 500g",
    category: "Bebidas"
  }, {
    id: "5",
    name: "Óleo de Soja 900ml",
    category: "Alimentos"
  }, {
    id: "6",
    name: "Leite Integral 1L",
    category: "Laticínios"
  }, {
    id: "7",
    name: "Sabão em Pó 1kg",
    category: "Limpeza"
  }, {
    id: "8",
    name: "Papel Higiênico 12 rolos",
    category: "Higiene"
  }, {
    id: "9",
    name: "Detergente Líquido 500ml",
    category: "Limpeza"
  }, {
    id: "10",
    name: "Shampoo 400ml",
    category: "Higiene"
  }];
  // Price Records
  const priceRecords: PriceRecord[] = [];
  // Generate random prices for each product in each store
  products.forEach(product => {
    const basePrice = Math.random() * 20 + 5; // Base price between 5 and 25
    stores.forEach(store => {
      // Price variation between stores (±15%)
      const storeVariation = Math.random() * 0.3 - 0.15;
      const price = Math.round(basePrice * (1 + storeVariation) * 100) / 100;
      priceRecords.push({
        productId: product.id,
        storeId: store.id,
        price,
        date: new Date()
      });
    });
  });
  // Shopping Lists
  const lists: ShoppingList[] = [{
    id: "1",
    name: "Compras da Semana",
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    // 7 days ago
    items: [{
      id: "101",
      name: products[0].name,
      quantity: 1,
      unit: "un",
      price: priceRecords[0].price,
      purchased: true,
      storeId: "1"
    }, {
      id: "102",
      name: products[1].name,
      quantity: 2,
      unit: "un",
      price: priceRecords[4].price,
      purchased: true,
      storeId: "1"
    }, {
      id: "103",
      name: products[5].name,
      quantity: 6,
      unit: "un",
      price: priceRecords[20].price,
      purchased: false,
      storeId: "1"
    }]
  }, {
    id: "2",
    name: "Limpeza Mensal",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    // 2 days ago
    items: [{
      id: "201",
      name: products[6].name,
      quantity: 1,
      unit: "un",
      price: priceRecords[24].price,
      purchased: false,
      storeId: "2"
    }, {
      id: "202",
      name: products[8].name,
      quantity: 3,
      unit: "un",
      price: priceRecords[32].price,
      purchased: false,
      storeId: "2"
    }]
  }];
  // User
  const user: User = {
    name: "Maria Silva",
    email: "maria@exemplo.com",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg"
  };
  // Savings data for charts
  const savings = [{
    month: "Jan",
    amount: 45.72
  }, {
    month: "Fev",
    amount: 58.30
  }, {
    month: "Mar",
    amount: 75.12
  }, {
    month: "Abr",
    amount: 62.45
  }, {
    month: "Mai",
    amount: 80.21
  }, {
    month: "Jun",
    amount: 95.67
  }, {
    month: "Jul",
    amount: 88.34
  }, {
    month: "Ago",
    amount: 102.56
  }, {
    month: "Set",
    amount: 110.23
  }, {
    month: "Out",
    amount: 125.78
  }, {
    month: "Nov",
    amount: 118.45
  }, {
    month: "Dez",
    amount: 135.90
  }];
  return {
    lists,
    stores,
    priceRecords,
    products,
    user,
    savings
  };
};