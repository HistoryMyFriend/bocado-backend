const express = require('express');
const cors = require('cors');
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// ============================================
// DATOS DE EJEMPLO
// ============================================

// Platos del menú
const dishes = [
  { id: 1, name: "Tacos al Pastor", description: "Tacos de cerdo con piña, cebolla y cilantro", price: 12.99, category: "Entradas", imageUrl: "https://picsum.photos/seed/tacos/400/400", stock: 50 },
  { id: 2, name: "Pizza Margarita", description: "Pizza con tomate, mozzarella y albahaca", price: 18.99, category: "Platos Principales", imageUrl: "https://picsum.photos/seed/pizza/400/400", stock: 30 },
  { id: 3, name: "Pastel de Chocolate", description: "Pastel de chocolate con ganache", price: 7.99, category: "Postres", imageUrl: "https://picsum.photos/seed/chocolate/400/400", stock: 20 },
  { id: 4, name: "Ceviche", description: "Pescado fresco con limón y cilantro", price: 15.99, category: "Entradas", imageUrl: "https://picsum.photos/seed/ceviche/400/400", stock: 25 },
  { id: 5, name: "Hamburguesa Clásica", description: "Con queso, lechuga y tomate", price: 14.99, category: "Platos Principales", imageUrl: "https://picsum.photos/seed/burger/400/400", stock: 40 },
  { id: 6, name: "Flan Casero", description: "Con dulce de leche", price: 5.99, category: "Postres", imageUrl: "https://picsum.photos/seed/flan/400/400", stock: 15 }
];

// Pedidos (se irán agregando)
let orders = [];
let nextOrderId = 1;

// Pagos (se irán agregando)
let payments = [];
let nextPaymentId = 1;

// Restaurantes
const restaurants = [
  { id: 1, name: "Bocado Centro", address: "Av. Principal 123", qrCode: "QR001", phone: "123456789" },
  { id: 2, name: "Bocado Norte", address: "Calle Norte 456", qrCode: "QR002", phone: "987654321" }
];

// ============================================
// ENDPOINTS DE DISHES (Platos)
// ============================================

// GET /api/v1/dishes - Obtener todos los platos
app.get('/api/v1/dishes', (req, res) => {
  res.json({
    success: true,
    data: dishes
  });
});

// GET /api/v1/dishes/:id - Obtener un plato por ID
app.get('/api/v1/dishes/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const dish = dishes.find(d => d.id === id);
  
  if (dish) {
    res.json({ success: true, data: dish });
  } else {
    res.status(404).json({ success: false, error: "Plato no encontrado" });
  }
});

// GET /api/v1/dishes/category/:category - Obtener platos por categoría
app.get('/api/v1/dishes/category/:category', (req, res) => {
  const category = req.params.category;
  const filteredDishes = dishes.filter(d => d.category === category);
  
  res.json({
    success: true,
    data: filteredDishes
  });
});

// ============================================
// ENDPOINTS DE ORDERS (Pedidos)
// ============================================

// POST /api/v1/orders - Crear un nuevo pedido
app.post('/api/v1/orders', (req, res) => {
  const { items, total, tableNumber, paymentMethod } = req.body;
  
  if (!items || items.length === 0) {
    return res.status(400).json({ success: false, error: "El pedido debe tener al menos un item" });
  }
  
  const newOrder = {
    id: nextOrderId++,
    items: items,
    total: total,
    tableNumber: tableNumber,
    paymentMethod: paymentMethod,
    status: "pendiente",
    createdAt: new Date().toISOString()
  };
  
  orders.push(newOrder);
  
  res.json({
    success: true,
    data: newOrder
  });
});

// GET /api/v1/orders - Obtener todos los pedidos
app.get('/api/v1/orders', (req, res) => {
  res.json({
    success: true,
    data: orders
  });
});

// GET /api/v1/orders/:id - Obtener un pedido por ID
app.get('/api/v1/orders/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const order = orders.find(o => o.id === id);
  
  if (order) {
    res.json({ success: true, data: order });
  } else {
    res.status(404).json({ success: false, error: "Pedido no encontrado" });
  }
});

// PUT /api/v1/orders/:id - Actualizar un pedido completo
app.put('/api/v1/orders/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = orders.findIndex(o => o.id === id);
  
  if (index !== -1) {
    orders[index] = { ...orders[index], ...req.body };
    res.json({ success: true, data: orders[index] });
  } else {
    res.status(404).json({ success: false, error: "Pedido no encontrado" });
  }
});

// PUT /api/v1/orders/:id/status/:status - Actualizar solo el estado del pedido
app.put('/api/v1/orders/:id/status/:status', (req, res) => {
  const id = parseInt(req.params.id);
  const newStatus = req.params.status;
  const order = orders.find(o => o.id === id);
  
  if (order) {
    order.status = newStatus;
    res.json({ success: true, data: order });
  } else {
    res.status(404).json({ success: false, error: "Pedido no encontrado" });
  }
});

// ============================================
// ENDPOINTS DE PAYMENTS (Pagos)
// ============================================

// POST /api/v1/payments - Procesar un pago
app.post('/api/v1/payments', (req, res) => {
  const { orderId, amount, method, cardInfo } = req.body;
  
  const order = orders.find(o => o.id === orderId);
  if (!order) {
    return res.status(404).json({ success: false, error: "Pedido no encontrado" });
  }
  
  const newPayment = {
    id: nextPaymentId++,
    orderId: orderId,
    amount: amount,
    method: method,
    status: "completado",
    createdAt: new Date().toISOString()
  };
  
  payments.push(newPayment);
  
  // Actualizar estado del pedido
  order.status = "pagado";
  
  res.json({
    success: true,
    data: newPayment
  });
});

// GET /api/v1/payments/:orderId - Obtener pago por orderId
app.get('/api/v1/payments/:orderId', (req, res) => {
  const orderId = parseInt(req.params.orderId);
  const payment = payments.find(p => p.orderId === orderId);
  
  if (payment) {
    res.json({ success: true, data: payment });
  } else {
    res.status(404).json({ success: false, error: "Pago no encontrado" });
  }
});

// ============================================
// ENDPOINTS DE RESTAURANTS
// ============================================

// GET /api/v1/restaurants - Obtener todos los restaurantes
app.get('/api/v1/restaurants', (req, res) => {
  res.json({
    success: true,
    data: restaurants
  });
});

// GET /api/v1/restaurants/:qrCode - Obtener restaurante por código QR
app.get('/api/v1/restaurants/:qrCode', (req, res) => {
  const qrCode = req.params.qrCode;
  const restaurant = restaurants.find(r => r.qrCode === qrCode);
  
  if (restaurant) {
    res.json({ success: true, data: restaurant });
  } else {
    res.status(404).json({ success: false, error: "Restaurante no encontrado" });
  }
});

// ============================================
// INICIAR EL SERVIDOR
// ============================================

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor Bocado API corriendo en http://localhost:${PORT}`);
  console.log(`📋 Endpoints disponibles:`);
  console.log(`   GET    /api/v1/dishes`);
  console.log(`   GET    /api/v1/dishes/:id`);
  console.log(`   GET    /api/v1/dishes/category/:category`);
  console.log(`   POST   /api/v1/orders`);
  console.log(`   GET    /api/v1/orders`);
  console.log(`   PUT    /api/v1/orders/:id/status/:status`);
  console.log(`   POST   /api/v1/payments`);
  console.log(`   GET    /api/v1/restaurants/:qrCode`);
});

