import Order from "../models/Order.js";
import { asyncHandler } from "../utils/asyncHandler.js";

function coerceNumber(value, fallback = 0) {
  if (value === "" || value === null || value === undefined) {
    return fallback;
  }

  const parsed = Number(value);
  return Number.isNaN(parsed) ? fallback : parsed;
}

function normalizeOrderItem(item) {
  return {
    productName: item?.productName?.trim(),
    qty: Math.max(1, coerceNumber(item?.qty, 1)),
    price: coerceNumber(item?.price),
    image: item?.image?.trim(),
    category: item?.category?.trim() || "Coffee",
  };
}

export const listOrders = asyncHandler(async (request, response) => {
  const query = {};

  if (request.query.status) {
    query.status = request.query.status;
  }

  const orders = await Order.find(query).sort({ createdAt: -1 }).lean();

  return response.json({ orders });
});

export const listPublicOrders = asyncHandler(async (request, response) => {
  const email = request.query.email?.trim();

  if (!email) {
    return response.json({ orders: [] });
  }

  const orders = await Order.find({
    customerEmail: new RegExp(`^${email.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i"),
  })
    .sort({ createdAt: -1 })
    .limit(10)
    .lean();

  return response.json({ orders });
});

export const createOrder = asyncHandler(async (request, response) => {
  const body = request.body ?? {};
  const items = Array.isArray(body.items) ? body.items.map(normalizeOrderItem).filter((item) => item.productName) : [];

  if (!body.customerName?.trim()) {
    return response.status(400).json({ message: "Customer name is required." });
  }

  if (items.length === 0) {
    return response.status(400).json({ message: "At least one order item is required." });
  }

  const computedTotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);

  const order = await Order.create({
    customerName: body.customerName.trim(),
    customerEmail: body.customerEmail?.trim() || "",
    phone: body.phone?.trim() || "",
    tableNumber: body.tableNumber?.trim() || "",
    note: body.note?.trim() || "",
    paymentMethod: body.paymentMethod || "cash",
    status: body.status || "pending",
    barista: body.barista?.trim() || "",
    items,
    total: coerceNumber(body.total, computedTotal),
  });

  return response.status(201).json({ order });
});

export const updateOrder = asyncHandler(async (request, response) => {
  const order = await Order.findById(request.params.id);

  if (!order) {
    return response.status(404).json({ message: "Order not found." });
  }

  const body = request.body ?? {};
  const fields = ["customerName", "phone", "tableNumber", "note", "paymentMethod", "status", "barista"];

  fields.forEach((field) => {
    if (typeof body[field] === "string") {
      order[field] = body[field].trim();
    }
  });

  if (Array.isArray(body.items)) {
    order.items = body.items.map(normalizeOrderItem).filter((item) => item.productName);
  }

  if (body.total !== undefined) {
    order.total = coerceNumber(body.total, order.total);
  }

  await order.save();

  return response.json({ order });
});

export const deleteOrder = asyncHandler(async (request, response) => {
  const order = await Order.findByIdAndDelete(request.params.id);

  if (!order) {
    return response.status(404).json({ message: "Order not found." });
  }

  return response.json({ message: "Order deleted.", id: request.params.id });
});
