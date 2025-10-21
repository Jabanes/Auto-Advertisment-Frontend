import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "../store";
import {
    fetchBusiness,
    updateBusiness,
    selectCurrentBusiness,
    createBusiness,
    setCurrentBusiness,
} from "../store/slices/businessSlice";
import type { Business } from "../types/business";
import { useSocket } from "../hooks/useSocket";
import { theme } from "../styles/theme";

const styleOptions = [
    { value: "realistic", label: "ריאליסטי" },
    { value: "illustrated", label: "מצויר" },
    { value: "bw", label: "שחור-לבן" },
    { value: "colourful", label: "צבעוני" },
];

export default function BusinessProfile() {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const token = useAppSelector((s) => s.auth.serverToken);
    const user = useAppSelector((s) => s.auth.user);
    const business = useAppSelector(selectCurrentBusiness);

    useSocket();

    // Determine mode: 'create' or 'edit'
    const mode = searchParams.get("mode") === "create" ? "create" : "edit";
    const isCreateMode = mode === "create";

    const [form, setForm] = useState({
        name: "",
        logoUrl: "",
        address: "",
        contactPhone: "",
        businessEmail: "",
        websiteUrl: "",
        ownerName: "",
        ownerEmail: "",
        ownerPhone: "",
        preferredStyle: styleOptions[0].value,
        brandColors: "",
        description: "",
    });

    // Fetch existing business in edit mode
    useEffect(() => {
        if (!isCreateMode && token && business?.businessId) {
            dispatch(fetchBusiness({ token, businessId: business.businessId })).catch(console.error);
        }
    }, [isCreateMode, token, business?.businessId, dispatch]);

    // Populate form from business in edit mode
    useEffect(() => {
        if (!isCreateMode && business) {
            setForm({
                name: business.name || "",
                logoUrl: business.logoUrl || "",
                address: business.address?.street || "",
                contactPhone: business.contactPhone || "",
                businessEmail: business.businessEmail || "",
                websiteUrl: business.websiteUrl || "",
                ownerName: business.owner?.name || "",
                ownerEmail: business.owner?.email || "",
                ownerPhone: business.owner?.phone || "",
                preferredStyle: business.preferredStyle || styleOptions[0].value,
                brandColors: (business.brandColors || []).join(","),
                description: business.description || "",
            });
        }
    }, [isCreateMode, business]);

    // Auto-fill from auth user in create mode
    useEffect(() => {
        if (isCreateMode && user) {
            setForm((prev) => ({
                ...prev,
                ownerName: prev.ownerName || user?.displayName || "",
                ownerEmail: prev.ownerEmail || user?.email || "",
            }));
        }
    }, [isCreateMode, user]);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setForm((f) => ({ ...f, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!token) {
            alert("אין אסימון אימות. נא להתחבר מחדש.");
            return;
        }

        // Validation
        if (!form.name.trim()) {
            alert("נא למלא את שם העסק");
            return;
        }

        const payload: Partial<Business> = {
            name: form.name,
            logoUrl: form.logoUrl || undefined,
            contactPhone: form.contactPhone || undefined,
            businessEmail: form.businessEmail || undefined,
            websiteUrl: form.websiteUrl || undefined,
            preferredStyle: form.preferredStyle as Business["preferredStyle"],
            description: form.description || undefined,
            owner: {
                name: form.ownerName,
                email: form.ownerEmail,
                phone: form.ownerPhone,
            },
            ...(form.brandColors && { brandColors: form.brandColors.split(",").map((c) => c.trim()).filter(Boolean) }),
            ...(form.address && { address: { street: form.address } }),
        };

        try {
            let updatedBusiness;
            if (isCreateMode) {
                // 🆕 Create new
                console.log("Creating new business...");
                updatedBusiness = await dispatch(createBusiness({ token, data: payload })).unwrap();
                alert("עסק חדש נוצר בהצלחה!");
            } else {
                // ✅ Update existing
                if (!business?.businessId) {
                    alert("לא נמצא עסק לעדכון");
                    return;
                }
                console.log("Updating existing business...");
                updatedBusiness = await dispatch(
                    updateBusiness({ token, businessId: business.businessId, data: payload })
                ).unwrap();
                alert("פרטי העסק עודכנו בהצלחה!");
            }

            // Set as current business
            dispatch(setCurrentBusiness(updatedBusiness));
            
            // Navigate to dashboard
            navigate("/dashboard/products");
        } catch (err: any) {
            console.error("❌ Error saving business:", err);
            alert(`שגיאה בשמירת העסק: ${err?.message || "שגיאה לא ידועה"}`);
        }
    };


    // --- Styles ---
    const container: React.CSSProperties = {
        maxWidth: 960,
        margin: "0 auto",
        padding: `${theme.spacing.xl}px ${theme.spacing.lg}px`,
        direction: "rtl",
    };

    const card: React.CSSProperties = {
        background: theme.colors.surfaceLight,
        borderRadius: 16, // Modern rounded corners
        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
        padding: theme.spacing.xl,
        border: `1px solid ${theme.colors.borderLight}`,
    };

    const labelText: React.CSSProperties = {
        color: theme.colors.textDark,
        fontWeight: 600,
        fontSize: 14,
        marginBottom: 8,
        display: "block",
        fontFamily: theme.typography.fontFamily.display,
    };

    const inputBase: React.CSSProperties = {
        width: "100%",
        border: `1px solid ${theme.colors.borderLight}`,
        borderRadius: 12, // More rounded
        height: 48,
        padding: "0 16px",
        fontFamily: theme.typography.fontFamily.display,
        fontSize: 14,
        backgroundColor: theme.colors.backgroundLight,
        color: theme.colors.textDark,
        transition: "all 0.2s ease",
        outline: "none",
    };

    const inputFocusStyle: React.CSSProperties = {
        borderColor: theme.colors.primary,
        boxShadow: `0 0 0 3px ${theme.colors.primary}20`,
    };

    const sectionGrid: React.CSSProperties = {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: theme.spacing.lg,
    };

    return (
        <div style={container}>
            {/* Heading */}
            <div style={{ marginBottom: theme.spacing.xl }}>
                <h1
                    style={{
                        color: theme.colors.textDark,
                        fontSize: 32,
                        fontWeight: 900,
                        marginBottom: 4,
                    }}
                >
                    {isCreateMode ? "צור עסק חדש" : "עריכת פרופיל העסק"}
                </h1>
                <p style={{ color: theme.colors.textMuted }}>
                    {isCreateMode 
                        ? "מלא/י את פרטי העסק שלך כדי להתחיל."
                        : "עדכן/י את פרטי העסק שלך."
                    }
                </p>
            </div>

            {/* Card */}
            <div style={card}>
                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                    {/* Row 1 */}
                    <div style={sectionGrid}>
                        <label style={{ display: "flex", flexDirection: "column" }}>
                            <span style={labelText}>שם העסק *</span>
                            <input
                                name="name"
                                value={form.name}
                                onChange={handleChange}
                                placeholder="הזן את שם העסק"
                                style={inputBase}
                                required
                                onFocus={(e) => Object.assign(e.target.style, inputFocusStyle)}
                                onBlur={(e) => {
                                    e.target.style.borderColor = theme.colors.borderLight;
                                    e.target.style.boxShadow = "none";
                                }}
                            />
                        </label>

                        <label style={{ display: "flex", flexDirection: "column" }}>
                            <span style={labelText}>שם הבעלים</span>
                            <input
                                name="ownerName"
                                value={form.ownerName}
                                onChange={handleChange}
                                placeholder="שם הבעלים"
                                style={inputBase}
                                onFocus={(e) => Object.assign(e.target.style, inputFocusStyle)}
                                onBlur={(e) => {
                                    e.target.style.borderColor = theme.colors.borderLight;
                                    e.target.style.boxShadow = "none";
                                }}
                            />
                        </label>
                    </div>

                    {/* Row 2 */}
                    <div style={sectionGrid}>
                        <label style={{ display: "flex", flexDirection: "column" }}>
                            <span style={labelText}>טלפון ליצירת קשר</span>
                            <input
                                name="contactPhone"
                                value={form.contactPhone}
                                onChange={handleChange}
                                placeholder="+972501234567"
                                style={inputBase}
                                onFocus={(e) => Object.assign(e.target.style, inputFocusStyle)}
                                onBlur={(e) => {
                                    e.target.style.borderColor = theme.colors.borderLight;
                                    e.target.style.boxShadow = "none";
                                }}
                            />
                        </label>

                        <label style={{ display: "flex", flexDirection: "column" }}>
                            <span style={labelText}>אימייל עסקי</span>
                            <input
                                name="businessEmail"
                                type="email"
                                value={form.businessEmail}
                                onChange={handleChange}
                                placeholder="info@business.com"
                                style={inputBase}
                                onFocus={(e) => Object.assign(e.target.style, inputFocusStyle)}
                                onBlur={(e) => {
                                    e.target.style.borderColor = theme.colors.borderLight;
                                    e.target.style.boxShadow = "none";
                                }}
                            />
                        </label>
                    </div>

                    {/* Row 3 */}
                    <label style={{ display: "flex", flexDirection: "column" }}>
                        <span style={labelText}>כתובת</span>
                        <input
                            name="address"
                            value={form.address}
                            onChange={handleChange}
                            placeholder="רחוב X, עיר, מדינה"
                            style={inputBase}
                            onFocus={(e) => Object.assign(e.target.style, inputFocusStyle)}
                            onBlur={(e) => {
                                e.target.style.borderColor = theme.colors.borderLight;
                                e.target.style.boxShadow = "none";
                            }}
                        />
                    </label>

                    {/* Row 4 */}
                    <div style={sectionGrid}>
                        <label style={{ display: "flex", flexDirection: "column" }}>
                            <span style={labelText}>אתר אינטרנט</span>
                            <input
                                name="websiteUrl"
                                type="url"
                                value={form.websiteUrl}
                                onChange={handleChange}
                                placeholder="https://yourwebsite.com"
                                style={inputBase}
                                onFocus={(e) => Object.assign(e.target.style, inputFocusStyle)}
                                onBlur={(e) => {
                                    e.target.style.borderColor = theme.colors.borderLight;
                                    e.target.style.boxShadow = "none";
                                }}
                            />
                        </label>

                        <label style={{ display: "flex", flexDirection: "column" }}>
                            <span style={labelText}>צבעי מותג (HEX, מופרדים בפסיק)</span>
                            <input
                                name="brandColors"
                                value={form.brandColors}
                                onChange={handleChange}
                                placeholder="#FF0000,#00FF00"
                                style={inputBase}
                                onFocus={(e) => Object.assign(e.target.style, inputFocusStyle)}
                                onBlur={(e) => {
                                    e.target.style.borderColor = theme.colors.borderLight;
                                    e.target.style.boxShadow = "none";
                                }}
                            />
                        </label>
                    </div>

                    {/* Description */}
                    <label style={{ display: "flex", flexDirection: "column" }}>
                        <span style={labelText}>תיאור קצר של העסק</span>
                        <textarea
                            name="description"
                            value={form.description}
                            onChange={handleChange}
                            placeholder="ספר בקצרה על העסק שלך…"
                            rows={4}
                            style={{
                                ...inputBase,
                                height: "auto",
                                padding: "12px 16px",
                                resize: "vertical",
                                minHeight: 120,
                            }}
                            onFocus={(e) => Object.assign(e.target.style, inputFocusStyle)}
                            onBlur={(e) => {
                                e.target.style.borderColor = theme.colors.borderLight;
                                e.target.style.boxShadow = "none";
                            }}
                        />
                    </label>

                    {/* Buttons */}
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "flex-end",
                            gap: theme.spacing.md,
                            paddingTop: theme.spacing.lg,
                            borderTop: `1px solid ${theme.colors.borderLight}`,
                        }}
                    >
                        <button
                            type="button"
                            onClick={() => navigate("/dashboard/products")}
                            style={{
                                background: theme.colors.surfaceLight,
                                color: theme.colors.textDark,
                                fontWeight: 600,
                                borderRadius: 12,
                                padding: "12px 28px",
                                cursor: "pointer",
                                border: `1px solid ${theme.colors.borderLight}`,
                                fontFamily: theme.typography.fontFamily.display,
                                fontSize: 14,
                                transition: "all 0.2s ease",
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = theme.colors.overlayLight;
                                e.currentTarget.style.borderColor = theme.colors.textMuted;
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = theme.colors.surfaceLight;
                                e.currentTarget.style.borderColor = theme.colors.borderLight;
                            }}
                        >
                            ביטול
                        </button>
                        <button
                            type="submit"
                            style={{
                                background: theme.colors.primary,
                                color: theme.colors.textLight,
                                fontWeight: 600,
                                borderRadius: 12,
                                padding: "12px 32px",
                                border: "none",
                                cursor: "pointer",
                                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                                fontFamily: theme.typography.fontFamily.display,
                                fontSize: 14,
                                transition: "all 0.2s ease",
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = theme.colors.primaryLight;
                                e.currentTarget.style.transform = "translateY(-1px)";
                                e.currentTarget.style.boxShadow = "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)";
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = theme.colors.primary;
                                e.currentTarget.style.transform = "translateY(0)";
                                e.currentTarget.style.boxShadow = "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)";
                            }}
                        >
                            {isCreateMode ? "צור עסק" : "שמור פרטים"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
