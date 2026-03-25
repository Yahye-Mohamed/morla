import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
  {
    productName: {
      type: String,
      required: true,
      trim: true,
    },
    qty: {
      type: Number,
      required: true,
      min: 1,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    image: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { _id: false },
);

const orderSchema = new mongoose.Schema(
  {
    customerName: {
      type: String,
      required: true,
      trim: true,
    },
    customerEmail: {
      type: String,
      default: "",
      trim: true,
    },
    phone: {
      type: String,
      default: "",
      trim: true,
    },
    tableNumber: {
      type: String,
      default: "",
      trim: true,
    },
    note: {
      type: String,
      default: "",
      trim: true,
    },
    paymentMethod: {
      type: String,
      enum: ["cash", "card", "mobile", "online"],
      default: "cash",
    },
    status: {
      type: String,
      enum: ["pending", "brewing", "ready", "served", "cancelled"],
      default: "pending",
    },
    barista: {
      type: String,
      default: "",
      trim: true,
    },
    items: {
      type: [orderItemSchema],
      default: [],
    },
    total: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    timestamps: true,
  },
);

const Order = mongoose.model("Order", orderSchema);

export default Order;
