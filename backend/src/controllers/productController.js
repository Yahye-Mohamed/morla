import Product from "../models/Product.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { createUniqueSlug } from "../utils/createUniqueSlug.js";

function coerceBoolean(value) {
  return value === true || value === "true" || value === 1 || value === "1" || value === "on";
}

function coerceNumber(value, fallback = 0) {
  if (value === "" || value === null || value === undefined) {
    return fallback;
  }

  const parsed = Number(value);
  return Number.isNaN(parsed) ? fallback : parsed;
}

function normalizeProductPayload(body) {
  return {
    name: body?.name?.trim(),
    category: body?.category?.trim(),
    price: coerceNumber(body?.price),
    image: body?.image?.trim(),
    description: body?.description?.trim(),
    featured: coerceBoolean(body?.featured),
    inStock: coerceBoolean(body?.inStock),
    stock: coerceNumber(body?.stock),
    rating: coerceNumber(body?.rating, 4.5),
    prepTime: coerceNumber(body?.prepTime, 5),
  };
}

export const listProducts = asyncHandler(async (request, response) => {
  const query = {};

  if (request.query.featured === "true") {
    query.featured = true;
  }

  const products = await Product.find(query).sort({ featured: -1, updatedAt: -1 }).lean();

  return response.json({ products });
});

export const createProduct = asyncHandler(async (request, response) => {
  const payload = normalizeProductPayload(request.body);

  if (!payload.name || !payload.category || !payload.image || !payload.description) {
    return response.status(400).json({
      message: "Name, category, image, and description are required.",
    });
  }

  const slug = await createUniqueSlug(Product, payload.name);

  const product = await Product.create({
    ...payload,
    slug,
  });

  return response.status(201).json({ product });
});

export const updateProduct = asyncHandler(async (request, response) => {
  const product = await Product.findById(request.params.id);

  if (!product) {
    return response.status(404).json({ message: "Product not found." });
  }

  const payload = normalizeProductPayload(request.body);

  if (payload.name && payload.name !== product.name) {
    product.slug = await createUniqueSlug(Product, payload.name, product._id);
  }

  Object.entries(payload).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      product[key] = value;
    }
  });

  await product.save();

  return response.json({ product });
});

export const deleteProduct = asyncHandler(async (request, response) => {
  const product = await Product.findByIdAndDelete(request.params.id);

  if (!product) {
    return response.status(404).json({ message: "Product not found." });
  }

  return response.json({ message: "Product deleted.", id: request.params.id });
});
