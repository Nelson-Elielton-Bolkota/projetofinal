const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  paymentId: { type: String, required: true },
  mercadoPagoId: { type: String },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'approved', 'in_process', 'rejected', 'refunded', 'cancelled'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'approved', 'in_process', 'rejected', 'refunded', 'cancelled'],
    default: 'pending'
  },
  items: [{
    productId: { type: String, required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
    image: { type: String }
  }],
  customer: {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String },
    address: {
      street: { type: String, required: true },
      number: { type: String, required: true },
      neighborhood: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      zipCode: { type: String, required: true }
    }
  },
  total: { type: Number, required: true },
  paymentMethod: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', orderSchema);