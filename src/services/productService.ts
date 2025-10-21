import axios from "axios";
import type { Product } from "../types/product";

const API_URL = import.meta.env.VITE_API_URL;

export const productService = {
    /**
     * 🧩 Fetch all products for the authenticated user (or for a specific business)
     */
    async getAll(accessToken: string, businessId?: string): Promise<Product[]> {
        const params = businessId ? { businessId } : {};
        const { data } = await axios.get<{ products: Product[] }>(`${API_URL}/products`,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
                params,
            }
        );
        return data.products;
    },

    /**
     * ✏️ Update product fields
     */
    async update(accessToken: string, product: Product): Promise<Product> {
        const { data } = await axios.patch<{ product: Product }>(`${API_URL}/products/update/${product.businessId}/${product.id}`,
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
    async create(accessToken: string, payload: Partial<Product> & { businessId: string }): Promise<Product> {
        const { businessId, ...productData } = payload;

        const { data } = await axios.post<{ success: boolean; product: Product }>(`${API_URL}/products/${businessId}`,
            productData,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "application/json",
                },
            }
        );

        if (!data.success || !data.product) {
            throw new Error("Product creation failed — invalid response");
        }

        return data.product;
    },


    /**
     * ❌ Delete product fully (Firestore + Storage)
     */
    async remove(
        accessToken: string,
        businessId: string,
        productId: string
    ): Promise<{ success: boolean }> {
        const { data } = await axios.delete<{ success: boolean }>(`${API_URL}/products/${businessId}/${productId}`,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            }
        );
        return data;
    },

    /**
    * 📸 Upload or replace product image
    * Uploads to Firebase Storage and updates product imageUrl automatically.
    */
    async uploadImage(
        accessToken: string,
        businessId: string,
        productId: string,
        file: File
    ): Promise<string> {
        const formData = new FormData();
        formData.append("file", file);

        const { data } = await axios.post<{ success: boolean; url: string }>(`${API_URL}/products/upload/${businessId}/${productId}`,
            formData,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "multipart/form-data",
                },
            }
        );

        if (!data.success || !data.url) {
            throw new Error("Image upload failed — no URL returned from backend");
        }

        return data.url;
    },
};
