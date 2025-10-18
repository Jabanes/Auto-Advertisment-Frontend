import { useState } from "react";
import { useAppSelector } from "../../store/hooks";
import ProductCard from "./ProductCard";
import ProductEditModal from "../ProductEditModal";
import DisplayEnrichedProductModal from "../DisplayEnrichedProductModal";
import { theme } from "../../styles/theme";

export default function ProductGrid() {
  const { items: products } = useAppSelector((state) => state.products);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [showDisplayModal, setShowDisplayModal] = useState(false);

  const handleProductClick = (product: any, e: React.MouseEvent) => {
    if (e.button !== 0) return; // only left click
    if (product.status === "enriched") {
      setSelectedProduct(product);
      setShowDisplayModal(true);
    } else {
      setSelectedProduct(product);
      setShowDisplayModal(false);
    }
  };

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
              onClick={(e) => handleProductClick(product, e)}
              onContextMenu={(e) => e.preventDefault()}
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

      {selectedProduct &&
        (showDisplayModal ? (
          <DisplayEnrichedProductModal
            product={selectedProduct}
            onClose={() => setSelectedProduct(null)}
          />
        ) : (
          <ProductEditModal
            mode="edit"
            product={selectedProduct}
            onClose={() => setSelectedProduct(null)}
          />
        ))}
    </>
  );
}
