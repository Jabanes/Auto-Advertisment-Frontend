import axios from "axios";
import type { Product } from "../types/product";

const BASE_URL = import.meta.env.VITE_BACKEND_URL;

export const productService = {
  /**
   * 🧩 Fetch all products for the authenticated user
   */
  async getAll(accessToken: string): Promise<Product[]> {
    const { data } = await axios.get<{ products: Product[] }>(
      `${BASE_URL}/products`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    return data.products;
  },

  /**
   * ✏️ Update product fields
   */
  async update(accessToken: string, product: Product): Promise<Product> {
    const { data } = await axios.put<{ product: Product }>(
      `${BASE_URL}/products/${product.id}`,
      product,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );
    return data.product;
  },

  /**
   * ➕ Create new product
   */
  async create(
    accessToken: string,
    payload: Partial<Product>
  ): Promise<Product> {
    const { data } = await axios.post<{ product: Product }>(
      `${BASE_URL}/products`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );
    return data.product;
  },

  /**
   * ❌ Delete product by ID
   */
  async remove(accessToken: string, id: string): Promise<{ success: boolean }> {
    const { data } = await axios.delete<{ success: boolean }>(
      `${BASE_URL}/products/${id}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    return data;
  },
};
