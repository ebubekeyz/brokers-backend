
const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
          },
    userId: { type: String, required: true },
    id: { type: String, required: true }, // external order ID
    amountPaid: { type: Number, required: true },
    cryptoCurrency: { type: String, required: true },
    fiatCurrency: { type: String, required: true },
    isBuyOrSell: { type: String, enum: ["BUY", "SELL"], required: true },
    paymentOption: { type: String, required: true },
    conversionPrice: { type: Number, required: true },
    cryptoAmount: { type: Number, required: true },
    status: { type: String, enum: ["PENDING", "COMPLETED"], required: true },
    createdAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

module.exports  = mongoose.model("Order", OrderSchema);

