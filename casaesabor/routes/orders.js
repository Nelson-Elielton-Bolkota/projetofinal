const express = require('express');
const router = express.Router();
const Order = require('../models/Orders');


router.get('/:id', async (req, res) => {
  console.log('Recebida requisição para pedido ID:', req.params.id);
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Pedido não encontrado' });
    }
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.delete('/:id', async (req, res) => {
  try {
    const deletedOrder = await Order.findByIdAndDelete(req.params.id);
    if (!deletedOrder) {
      return res.status(404).json({ error: 'Pedido não encontrado' });
    }
    res.json({ message: 'Pedido excluído com sucesso' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



router.put('/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        
        const updatedOrder = await Order.findByIdAndUpdate(
            req.params.id,
            { 
                status,
                updatedAt: Date.now()
            },
            { new: true }
        );
        
        if (!updatedOrder) {
            return res.status(404).json({ error: 'Pedido não encontrado' });
        }
        
        res.json(updatedOrder);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;