import Order from "../models/Order.js";
import Product from "../models/Product.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const ACTIVE_STATUSES = new Set(["pending", "brewing", "ready"]);
const COMPLETED_STATUSES = new Set(["served"]);

export const getDashboardSummary = asyncHandler(async (request, response) => {
  const [products, orders] = await Promise.all([
    Product.find().sort({ featured: -1, updatedAt: -1 }).lean(),
    Order.find().sort({ createdAt: -1 }).lean(),
  ]);

  const now = new Date();
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);

  const todayOrders = orders.filter((order) => new Date(order.createdAt) >= startOfToday);
  const revenueToday = todayOrders
    .filter((order) => order.status !== "cancelled")
    .reduce((sum, order) => sum + order.total, 0);

  const statusCounts = ["pending", "brewing", "ready", "served", "cancelled"].map((status) => ({
    status,
    count: orders.filter((order) => order.status === status).length,
  }));

  const salesMap = new Map();
  orders.forEach((order) => {
    order.items?.forEach((item) => {
      const current = salesMap.get(item.productName) || {
        productName: item.productName,
        units: 0,
        revenue: 0,
        image: item.image,
        category: item.category,
      };

      current.units += item.qty;
      current.revenue += item.qty * item.price;
      salesMap.set(item.productName, current);
    });
  });

  const topProducts = [...salesMap.values()]
    .sort((left, right) => right.units - left.units)
    .slice(0, 4);

  const metrics = {
    products: products.length,
    featuredProducts: products.filter((product) => product.featured).length,
    lowStock: products.filter((product) => product.stock <= 5).length,
    activeOrders: orders.filter((order) => ACTIVE_STATUSES.has(order.status)).length,
    completedOrders: orders.filter((order) => COMPLETED_STATUSES.has(order.status)).length,
    revenueToday,
  };

  const recentOrders = orders.slice(0, 5);

  return response.json({
    summary: {
      metrics,
      statusCounts,
      topProducts,
      recentOrders,
    },
  });
});
