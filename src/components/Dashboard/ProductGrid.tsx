/**
 * 🎴 PRODUCT GRID - Container for Product Cards
 * 
 * DEBUG: Traces Redux → React data flow
 * - Reads products directly from Redux via useAppSelector
 * - Should re-render when Redux state.products.items changes
 * - Passes fresh product references to ProductCard components
 */

import { useState, useEffect, useRef } from "react";
import { useAppSelector } from "../../store/hooks";
import ProductCard from "./ProductCard";
import ProductEditModal from "../ProductEditModal";
import DisplayEnrichedProductModal from "../DisplayEnrichedProductModal";
import { theme } from "../../styles/theme";

export default function ProductGrid() {
  const { items: products } = useAppSelector((state) => state.products);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [showDisplayModal, setShowDisplayModal] = useState(false);
  
  // Track previous products to detect changes
  const prevProductsRef = useRef(products);
  const renderCountRef = useRef(0);
  
  renderCountRef.current++;
  
  // Log render and changes
  console.log(
    `📦 [GRID] Rendering ProductGrid (render #${renderCountRef.current}) | ` +
    `Products count: ${products.length} | ` +
    `Products array reference changed: ${prevProductsRef.current !== products}`
  );
  
  // Detect which products changed
  useEffect(() => {
    if (prevProductsRef.current === products) {
      console.log(`  └─ Same products array reference (no Redux update)`);
      return;
    }
    
    // Find products with status changes
    const changedProducts = products.filter((newProd) => {
      const oldProd = prevProductsRef.current.find((p) => p.id === newProd.id);
      return oldProd && oldProd.status !== newProd.status;
    });
    
    if (changedProducts.length > 0) {
      changedProducts.forEach((prod) => {
        const oldProd = prevProductsRef.current.find((p) => p.id === prod.id);
        console.log(
          `  └─ ✅ Product ${prod.id} status changed: ${oldProd?.status} → ${prod.status}`
        );
      });
    } else {
      console.log(`  └─ Products array changed but no status changes detected`);
    }
    
    prevProductsRef.current = products;
  }, [products]);

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
