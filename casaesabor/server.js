const Order = require('./models/Orders');
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const mercadopagoService = require('./js/components/mercadopagoService');

const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');

const app = express();

// Configurações baseadas no seu .env
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;
const FRONTEND_URL = process.env.FRONTEND_URL;
const BACKEND_URL = process.env.BACKEND_URL;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Configuração de CORS atualizada
const corsOptions = {
  origin: [
    FRONTEND_URL,
    'https://casa-sabor-phi.vercel.app', // redundância para segurança
    'http://localhost:3000', // para desenvolvimento local
    'http://127.0.0.1:3000'  // para desenvolvimento local
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// REMOVA ESTA LINHA - ELA ESTÁ CAUSANDO O ERRO:
// app.use(express.static(path.join(__dirname, '..')));

if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });
}

app.use('/api/products', productRoutes);
app.use('/api/admin/orders', orderRoutes);

app.post('/api/create-payment', async (req, res) => {
  try {
    console.log('Recebendo requisição para criar sessão de pagamento:', req.body);
    
    const { items, customer, total_amount } = req.body;

    if (!items?.length) {
      return res.status(400).json({ error: 'Carrinho vazio' });
    }
    
    const result = await mercadopagoService.createPaymentSession({ items, customer, total_amount });
    
    res.status(200).json({
      id: result.id,
      message: 'Sessão de pagamento criada com sucesso'
    });
    
  } catch (error) {
    console.error('Erro ao criar sessão de pagamento:', error);
    
    let errorMessage = 'Erro ao criar sessão de pagamento';
    if (error.message) errorMessage = error.message;
    
    const errorDetails = process.env.NODE_ENV !== 'production' ? {
      stack: error.stack,
      cause: error.cause
    } : {};
    
    res.status(500).json({ error: errorMessage, ...errorDetails });
  }
});

app.post('/api/process-payment', async (req, res) => {
  try {
    console.log('🔄 Recebendo requisição para processar pagamento:', {
      payment_id: req.body.payment_id,
      transaction_amount: req.body.transaction_amount,
      payment_method_id: req.body.payment_method_id
    });
    
    const payment = await mercadopagoService.processPayment(req.body);
    
    console.log(`✅ Pagamento processado - Status: ${payment.status}, ID: ${payment.id}`);

    const responseData = {
      status: payment.status,
      order_status: payment.order_status || 'pending',
      status_detail: payment.status_detail,
      id: payment.id,
      payment_method: payment.payment_method_id,
      card_last_four: payment.card?.last_four_digits,
      installments: payment.installments
    };

    switch(payment.status) {
      case 'approved':
        responseData.message = 'Pagamento aprovado com sucesso!';
        responseData.user_message = 'Seu pagamento foi aprovado!';
        console.log(`✅ APROVADO - Pedido será salvo no banco`);
        break;
        
      case 'pending':
      case 'in_process':
      case 'in_mediation':
        responseData.message = 'Pagamento pendente de aprovação';
        responseData.user_message = 'Seu pagamento está sendo processado. Aguarde a confirmação.';
        console.log(`⏳ PENDENTE - Pedido será salvo no banco`);
        break;
        
      case 'rejected':
        responseData.message = 'Pagamento rejeitado';
        responseData.user_message = 'Pagamento recusado. Por favor, tente novamente com outro método.';
        console.log(`❌ REJEITADO - Pedido NÃO será salvo no banco`);
        break;
        
      default:
        responseData.message = `Status: ${payment.status}`;
        responseData.user_message = 'Status de pagamento indefinido. Entre em contato conosco.';
        console.log(`❓ STATUS DESCONHECIDO: ${payment.status}`);
    }

    console.log(`📤 Enviando resposta:`, {
      status: responseData.status,
      message: responseData.message
    });

    res.status(200).json(responseData);
    
  } catch (error) {
    console.error('💥 Erro ao processar pagamento:', error);
    
    let errorMessage = 'Erro ao processar pagamento';
    let statusCode = 500;
    
    if (error.status) statusCode = error.status;
    if (error.cause) {
      const mpErrors = Array.isArray(error.cause) ? error.cause : [error.cause];
      errorMessage = mpErrors[0]?.description || errorMessage;
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    res.status(statusCode).json({ 
      error: errorMessage,
      status: 'error',
      status_detail: error.cause?.[0]?.code,
      user_message: 'Ocorreu um erro ao processar seu pagamento. Por favor, tente novamente.'
    });
  }
});

app.get('/api/payment/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await mercadopagoService.getPaymentStatus(id);
    res.json(result);
  } catch (error) {
    console.error('Erro ao verificar status do pagamento:', error);
    res.status(error.message === 'Pagamento não encontrado' ? 404 : 500).json({ 
      error: error.message || 'Erro ao buscar status do pagamento' 
    });
  }
});

app.get('/api/admin/orders', async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar pedidos' });
  }
});

app.put('/api/admin/orders/:id', async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar pedido' });
  }
});

app.post('/api/webhook/mercadopago', async (req, res) => {
  try {
    console.log('Webhook recebido:', req.query, req.body);
    await mercadopagoService.handleWebhook(req.query);
    res.status(200).send('OK');
  } catch (error) {
    console.error('Erro ao processar webhook:', error);
    res.status(500).send('Error');
  }
});

app.post('/api/create-preference', async (req, res) => {
  console.log('Redirecionando /api/create-preference para /api/create-payment');
  req.url = '/api/create-payment';
  app._router.handle(req, res);
});

// REMOVA TAMBÉM ESTAS LINHAS - ELAS TENTAM SERVIR ARQUIVOS HTML QUE NÃO EXISTEM:
// app.get(['/', '/admin', '/carrinho', '/admin.html', '/checkout.html', '/sucess.html', '/error-confirmation.html', '/pending-confirmation.html'], (req, res) => {
//   res.sendFile(path.join(__dirname, '..', path.basename(req.path) || 'index.html'));
// });

// ADICIONE UMA ROTA SIMPLES PARA A RAIZ PARA TESTAR:
app.get('/', (req, res) => {
  res.json({ 
    message: 'Casa&Sabor API está funcionando!', 
    timestamp: new Date().toISOString(),
    endpoints: [
      'GET /api/products',
      'POST /api/create-payment',
      'POST /api/process-payment',
      'GET /api/admin/orders',
      'GET /health'
    ]
  });
});

app.use((err, req, res, next) => {
  console.error('Erro interno:', err);
  res.status(500).json({
    error: 'Erro interno do servidor',
    ...(process.env.NODE_ENV !== 'production' && { details: err.message, stack: err.stack })
  });
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP', timestamp: new Date().toISOString() });
});

const connectDB = async (retries = 5, delay = 5000) => {
  let attempt = 1;
  
  while (attempt <= retries) {
    try {
      await mongoose.connect(MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 5000
      });
      console.log('✅ Conectado ao MongoDB');
      return;
    } catch (err) {
      console.error(`❌ Tentativa ${attempt}/${retries} falhou: ${err.message}`);
      
      if (attempt === retries) {
        console.error('Todas as tentativas de conexão falharam. Saindo...');
        process.exit(1);
      }
      
      console.log(`Aguardando ${delay/1000} segundos antes da próxima tentativa...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      attempt++;
    }
  }
};

const startServer = async () => {
  await connectDB();

  const server = app.listen(PORT, () => {
    console.log(`
🚀 Servidor rodando em http://localhost:${PORT}
• Frontend: ${FRONTEND_URL}
• Backend: ${BACKEND_URL}
• MongoDB: ${MONGODB_URI.split('@')[1] || MONGODB_URI}
• Card Payment Brick: Ativo
    `);
  });

  setInterval(() => {
    mercadopagoService.cleanExpiredSessions();
  }, 60 * 60 * 1000);

  const gracefulShutdown = () => {
    console.log('Recebido sinal para encerrar o servidor...');
    server.close(() => {
      console.log('Fechando conexões HTTP...');
      mongoose.connection.close(false, () => {
        console.log('Conexão MongoDB fechada');
        process.exit(0);
      });
    });
    
    setTimeout(() => {
      console.error('Timeout ao encerrar o servidor, forçando saída');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', gracefulShutdown);
  process.on('SIGINT', gracefulShutdown);
};

startServer();