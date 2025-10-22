import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "../../store";
import {
  selectCurrentBusiness,
  selectBusinesses,
  setCurrentBusinessId,
  selectCurrentBusinessId,
} from "../../store/slices/businessSlice";
import { theme } from "../../styles/theme";

export default function BusinessSwitcher() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const currentBusiness = useAppSelector(selectCurrentBusiness);
  const currentBusinessId = useAppSelector(selectCurrentBusinessId);
  const businesses = useAppSelector(selectBusinesses);
  const [isOpen, setIsOpen] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleBusinessSelect = async (businessId: string) => {
    if (businessId === currentBusinessId) {
      setIsOpen(false);
      return;
    }

    setIsSwitching(true);
    // Switch business - listener middleware will automatically refetch products
    dispatch(setCurrentBusinessId(businessId));
    
    // Small delay to show loading state before closing dropdown
    setTimeout(() => {
      setIsOpen(false);
      setIsSwitching(false);
    }, 500);
  };

  const handleAddBusiness = () => {
    setIsOpen(false);
    navigate("/dashboard/business?mode=create");
  };

  // Always show the button - even if no businesses exist (they can add one)
  // if (!currentBusiness && businesses.length === 0) {
  //   return null;
  // }

  const iconContainerStyle: React.CSSProperties = {
    width: 48,
    height: 48,
    borderRadius: theme.radii.md,
    backgroundColor: `${theme.colors.primary}20`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    transition: "all 0.2s ease",
    position: "relative",
  };

  const dropdownStyle: React.CSSProperties = {
    position: "fixed", // Changed to fixed for better positioning
    left: 88, // Adjusted for sidebar width + padding
    bottom: 120, // Position above the button with more space
    backgroundColor: theme.colors.surfaceLight,
    borderRadius: theme.radii.lg,
    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)", // Enhanced shadow
    width: 280,
    maxHeight: 400,
    overflowY: "auto",
    zIndex: 10000, // Maximum z-index to ensure it's above everything
    border: `1px solid ${theme.colors.borderLight}`,
    animation: "slideIn 0.2s ease-out",
  };

  const businessItemStyle: React.CSSProperties = {
    padding: theme.spacing.md,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: theme.spacing.sm,
    borderBottom: `1px solid ${theme.colors.borderLight}`,
    transition: "background 0.2s ease",
  };

  const addButtonStyle: React.CSSProperties = {
    padding: theme.spacing.md,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: theme.spacing.sm,
    color: theme.colors.primary,
    fontWeight: 600,
    transition: "background 0.2s ease",
  };

  return (
    <>
      {/* CSS Animation Keyframes */}
      <style>
        {`
          @keyframes slideIn {
            from {
              opacity: 0;
              transform: translateY(10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          @keyframes spin {
            to {
              transform: rotate(360deg);
            }
          }
        `}
      </style>

      <div ref={dropdownRef} style={{ position: "relative" }}>
        {/* Current Business Icon */}
        <div
          style={{
            ...iconContainerStyle,
            opacity: isSwitching ? 0.6 : 1,
            pointerEvents: isSwitching ? "none" : "auto",
          }}
          onClick={() => !isSwitching && setIsOpen(!isOpen)}
          onMouseEnter={(e) => {
            if (!isSwitching) {
              e.currentTarget.style.backgroundColor = `${theme.colors.primary}30`;
            }
          }}
          onMouseLeave={(e) => {
            if (!isSwitching) {
              e.currentTarget.style.backgroundColor = `${theme.colors.primary}20`;
            }
          }}
        >
          {isSwitching ? (
            <span
              className="material-symbols-outlined"
              style={{
                fontSize: 24,
                color: theme.colors.primary,
                animation: "spin 1s linear infinite",
              }}
            >
              progress_activity
            </span>
          ) : currentBusiness?.logoUrl ? (
            <img
              src={currentBusiness.logoUrl}
              alt={currentBusiness.name}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                borderRadius: theme.radii.md,
              }}
            />
          ) : (
            <span
              className="material-symbols-outlined"
              style={{
                fontSize: 24,
                color: theme.colors.primary,
              }}
            >
              business
            </span>
          )}
        
        {/* Dropdown indicator */}
        <span
          className="material-symbols-outlined"
          style={{
            position: "absolute",
            bottom: -2,
            right: -2,
            fontSize: 16,
            color: theme.colors.primary,
            backgroundColor: theme.colors.surfaceLight,
            borderRadius: theme.radii.full,
            padding: 2,
          }}
        >
          {isOpen ? "expand_less" : "expand_more"}
        </span>
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div style={dropdownStyle}>
          {/* Header */}
          <div
            style={{
              padding: theme.spacing.md,
              borderBottom: `2px solid ${theme.colors.borderLight}`,
              fontWeight: 700,
              color: theme.colors.textDark,
              fontSize: 14,
            }}
          >
            עסקים שלי
          </div>

          {/* Business List */}
          {businesses.map((business) => {
            const isActive = currentBusiness?.businessId === business.businessId;
            return (
              <div
                key={business.businessId}
                style={{
                  ...businessItemStyle,
                  backgroundColor: isActive
                    ? `${theme.colors.primary}10`
                    : "transparent",
                }}
                onClick={() => handleBusinessSelect(business.businessId)}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    (e.currentTarget as HTMLElement).style.backgroundColor =
                      theme.colors.overlayLight;
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    (e.currentTarget as HTMLElement).style.backgroundColor = "transparent";
                  }
                }}
              >
                {/* Business Logo */}
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: theme.radii.md,
                    backgroundColor: `${theme.colors.primary}20`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  {business.logoUrl ? (
                    <img
                      src={business.logoUrl}
                      alt={business.name}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        borderRadius: theme.radii.md,
                      }}
                    />
                  ) : (
                    <span
                      className="material-symbols-outlined"
                      style={{
                        fontSize: 20,
                        color: theme.colors.primary,
                      }}
                    >
                      business
                    </span>
                  )}
                </div>

                {/* Business Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontWeight: 600,
                      color: theme.colors.textDark,
                      fontSize: 14,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {business.name}
                  </div>
                  {business.description && (
                    <div
                      style={{
                        fontSize: 12,
                        color: theme.colors.textMuted,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {business.description}
                    </div>
                  )}
                </div>

                {/* Active Indicator */}
                {isActive && (
                  <span
                    className="material-symbols-outlined"
                    style={{
                      fontSize: 20,
                      color: theme.colors.primary,
                    }}
                  >
                    check_circle
                  </span>
                )}
              </div>
            );
          })}

          {/* Add Business Button */}
          <div
            style={addButtonStyle}
            onClick={handleAddBusiness}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.backgroundColor =
                `${theme.colors.primary}10`;
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.backgroundColor = "transparent";
            }}
          >
            <span
              className="material-symbols-outlined"
              style={{
                fontSize: 24,
              }}
            >
              add_circle
            </span>
            <span>הוסף עסק חדש</span>
          </div>
        </div>
      )}
      </div>
    </>
  );
}

