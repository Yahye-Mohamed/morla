import { connectMongo } from "@/lib/mongo";
import Product from "@/lib/models/Product";
import { fallbackProducts } from "@/data/products";

export const runtime = "nodejs";

export async function GET() {
  try {
    await connectMongo();

    const products = await Product.find({})
      .sort({ featured: -1, createdAt: -1, name: 1 })
      .lean();

    if (!products.length) {
      return Response.json({ products: fallbackProducts });
    }

    return Response.json({ products });
  } catch (error) {
    return Response.json({ products: fallbackProducts });
  }
}
