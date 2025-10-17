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
          fontSize: 24,
          fontWeight: 400,
          boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
          cursor: "pointer",
          zIndex: 5,
        }}
      >
        +
      </button>

      {open && (
        <ProductEditModal
          mode="create"
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}
