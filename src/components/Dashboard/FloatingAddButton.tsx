import { useState } from "react";
import { theme } from "../../styles/theme";
import ProductEditModal from "../ProductEditModal";

export default function FloatingAddButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        style={{
          position: "fixed",
          bottom: 32,
          right: 32,
          backgroundColor: theme.colors.primary,
          color: "#fff",
          border: "none",
          borderRadius: "50%",
          width: 56,
          height: 56,
          fontSize: 32,
          fontWeight: 500,
          boxShadow: "0 4px 16px rgba(0,0,0,0.25)",
          cursor: "pointer",
          zIndex: 50,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          lineHeight: 0, // Helps to perfectly center the '+' sign
          transition: "transform 0.2s ease, box-shadow 0.2s ease",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.transform = "scale(1.08)";
          (e.currentTarget as HTMLButtonElement).style.boxShadow =
            "0 6px 20px rgba(0,0,0,0.3)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)";
          (e.currentTarget as HTMLButtonElement).style.boxShadow =
            "0 4px 16px rgba(0,0,0,0.25)";
        }}
        title="הוסף מוצר חדש"
      >
        +
      </button>

      {open && <ProductEditModal mode="create" onClose={() => setOpen(false)} />}
    </>
  );
}
