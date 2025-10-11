import ProductCard from "./ProductCard";
import type { Product } from "../../types/product";

const mockProducts: Product[] = [
  {
    id: "1",
    name: "Eco-Friendly Water Bottle",
    status: "pending",
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCFtkdLuZFQ4PzZKxfPrNHSMPn4_tbvZefEkc6CTUx-TKlm_P6GPKarLx3n-zGVwcqeDBVZ24kcX1GDYwDWbIG-npx-p4XrRwuvpsBQwHUgW-XYWIXLXM7HzzTPDqhXyg6Ccq848rb-BbOQ7oTFCZuHtnmxhuvbk57P7kOlmq6DGgKsTZA8JfHoGgApjyomaeF5FT_w4OjQ4KwBpSp4p-vWibnKGq1pcvJFL5OQNjTlGQt9BMh8tGiic8asu7cphK2Bp0aMMl6RstY",
  },
];

export default function ProductGrid() {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
        gap: 24,
      }}
    >
      {mockProducts.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}
