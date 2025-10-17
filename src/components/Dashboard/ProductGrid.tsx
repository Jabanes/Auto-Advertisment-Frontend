import { useState } from "react";
import { useAppSelector } from "../../store/hooks";
import ProductCard from "./ProductCard";
import ProductEditModal from "../ProductEditModal";
import { theme } from "../../styles/theme";

export default function ProductGrid() {
  const { items: products } = useAppSelector((state) => state.products);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  return (
    <>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
          gap: theme.spacing.lg,
        }}
      >
        {products.length > 0 ? (
          products.map((product) => (
            <div
              key={product.id}
              onClick={(e) => {
                // 🧠 open modal only on left click
                if (e.button === 0) setSelectedProduct(product);
              }}
              onContextMenu={(e) => e.preventDefault()} // disable context-triggered click
            >
              <ProductCard product={product} />
            </div>
          ))
        ) : (
          <p
            style={{
              color: theme.colors.textMuted,
              textAlign: "center",
              marginTop: theme.spacing.xl,
            }}
          >
            No products yet.
          </p>
        )}
      </div>

      {selectedProduct && (
        <ProductEditModal
          mode="edit"
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </>
  );
}
