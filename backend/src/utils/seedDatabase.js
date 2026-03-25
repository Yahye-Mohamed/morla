import Order from "../models/Order.js";
import Product from "../models/Product.js";
import { seedOrders, seedProducts } from "./seedData.js";

export async function seedDatabase() {
  const [productCount, orderCount] = await Promise.all([
    Product.countDocuments(),
    Order.countDocuments(),
  ]);

  if (productCount === 0) {
    await Product.insertMany(seedProducts);
    console.log("Seeded Morla products");
  }

  if (orderCount === 0) {
    await Order.insertMany(seedOrders);
    console.log("Seeded Morla orders");
  }
}
