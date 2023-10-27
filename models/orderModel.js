const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true,
  },
  products: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'product',
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
      },
      isCancelled: {
        type: Number,
        default: false,
      },
      returnRequested: {
        type: String,
        enum: ['Nil', 'Pending', 'Approved', 'Rejected', 'Completed'],
        default: 'Nil',
      },
    },
  ],
  totalAmount: {
    type: Number,
    required: true,
  },
  orderDate: {
    type: Date,
    default: Date.now,
  },
  deliveryDate: {
    type: Date,
  },
  paymentMethod: {
    type: String,
    required: true,
  },
  deliveryAddress: {
    type: {
      _id: mongoose.Schema.Types.ObjectId,
      user: mongoose.Schema.Types.ObjectId,
      pincode: Number,
      state: String,
      city: String,
      building: String,
      area: String,
      default: Boolean,
      softdeleted: Boolean,
      __v: Number,
    },
    ref: 'Address',
  },
  status: {
    type: String,
    enum: ['Processing', 'Shipped', 'Deleivered', 'Pending', 'Cancelled'],
    default: 'Processing',
  },
  transactionId: {
    type: String,
  },
});

// add a pre-save hook to calculate the delivery date 

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;