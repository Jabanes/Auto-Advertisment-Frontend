import React, { useState, useEffect } from "react";
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
    const token = useAppSelector((s) => s.auth.serverToken);
    const uid = useAppSelector((s) => s.auth.user?.uid);
    const user = useAppSelector((s) => s.auth.user);
    const business = useAppSelector(selectCurrentBusiness);

    useSocket();

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

    // Fetch existing business
    useEffect(() => {
        if (token && uid && business?.businessId) {
            dispatch(fetchBusiness({ token, businessId: business.businessId })).catch(console.error);
        }
    }, [token, uid, business?.businessId, dispatch]);

    // Populate form from business
    useEffect(() => {
        if (business) {
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
    }, [business]);

    // Auto-fill from auth user if empty
    useEffect(() => {
        setForm((prev) => ({
            ...prev,
            ownerName: prev.ownerName || user?.displayName || "",
            ownerEmail: prev.ownerEmail || user?.email || "",
        }));
    }, [user]);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setForm((f) => ({ ...f, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!token) return;

        const payload: Partial<Business> = {
            name: form.name,
            logoUrl: form.logoUrl,
            contactPhone: form.contactPhone,
            businessEmail: form.businessEmail,
            websiteUrl: form.websiteUrl,
            preferredStyle: form.preferredStyle as Business["preferredStyle"],
            description: form.description,
            owner: {
                name: form.ownerName,
                email: form.ownerEmail,
                phone: form.ownerPhone,
            },
            ...(form.brandColors && { brandColors: form.brandColors.split(",").map((c) => c.trim()) }),
            ...(form.address && { address: { street: form.address } }),
        };

        try {
            let updatedBusiness;
            if (business?.businessId) {
                // ✅ Update existing
                updatedBusiness = await dispatch(
                    updateBusiness({ token, businessId: business.businessId, data: payload })
                ).unwrap();
            } else {
                // 🆕 Create new
                updatedBusiness = await dispatch(createBusiness({ token, data: payload })).unwrap();
            }

            dispatch(setCurrentBusiness(updatedBusiness));
            alert("פרטי העסק נשמרו בהצלחה");
        } catch (err) {
            console.error("❌ Error saving business:", err);
            alert("שמירה נכשלה");
        }
    };


    // --- Styles ---
    const container: React.CSSProperties = {
        maxWidth: 960,
        margin: "0 auto",
        padding: theme.spacing.xl,
        direction: "rtl",
    };

    const card: React.CSSProperties = {
        background: theme.colors.surfaceLight,
        borderRadius: theme.radii.xl,
        boxShadow: theme.shadows.md,
        padding: theme.spacing.xl,
    };

    const labelText: React.CSSProperties = {
        color: theme.colors.textDark,
        fontWeight: 600,
        fontSize: 15,
        marginBottom: 6,
    };

    const inputBase: React.CSSProperties = {
        border: `1px solid ${theme.colors.borderLight}`,
        borderRadius: theme.radii.md,
        height: 48,
        padding: "0 14px",
        fontFamily: theme.typography.fontFamily.display,
        fontSize: 14,
        backgroundColor: theme.colors.surfaceLight,
        color: theme.colors.textDark,
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
                    פרופיל העסק
                </h1>
                <p style={{ color: theme.colors.textMuted }}>
                    מלא/י את פרטי העסק שלך כדי להתחיל.
                </p>
            </div>

            {/* Card */}
            <div style={card}>
                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                    {/* Row 1 */}
                    <div style={sectionGrid}>
                        <label style={{ display: "flex", flexDirection: "column" }}>
                            <span style={labelText}>שם העסק</span>
                            <input
                                name="name"
                                value={form.name}
                                onChange={handleChange}
                                placeholder="הזן את שם העסק"
                                style={inputBase}
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
                            />
                        </label>

                        <label style={{ display: "flex", flexDirection: "column" }}>
                            <span style={labelText}>אימייל עסקי</span>
                            <input
                                name="businessEmail"
                                value={form.businessEmail}
                                onChange={handleChange}
                                placeholder="info@business.com"
                                style={inputBase}
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
                        />
                    </label>

                    {/* Row 4 */}
                    <div style={sectionGrid}>
                        <label style={{ display: "flex", flexDirection: "column" }}>
                            <span style={labelText}>אתר אינטרנט</span>
                            <input
                                name="websiteUrl"
                                value={form.websiteUrl}
                                onChange={handleChange}
                                placeholder="https://yourwebsite.com"
                                style={inputBase}
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
                                padding: "10px 14px",
                                resize: "vertical",
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
                            onClick={() => window.history.back()}
                            style={{
                                background: "transparent",
                                color: theme.colors.textMuted,
                                fontWeight: 700,
                                borderRadius: theme.radii.md,
                                padding: "12px 28px",
                                cursor: "pointer",
                                border: `1px solid ${theme.colors.borderLight}`,
                            }}
                        >
                            ביטול
                        </button>
                        <button
                            type="submit"
                            style={{
                                background: theme.colors.primary,
                                color: theme.colors.textLight,
                                fontWeight: 700,
                                borderRadius: theme.radii.md,
                                padding: "12px 32px",
                                border: "none",
                                cursor: "pointer",
                                boxShadow: theme.shadows.sm,
                            }}
                            onMouseOver={(e) =>
                            ((e.currentTarget as HTMLButtonElement).style.background =
                                theme.colors.primaryLight)
                            }
                            onMouseOut={(e) =>
                            ((e.currentTarget as HTMLButtonElement).style.background =
                                theme.colors.primary)
                            }
                        >
                            שמור פרטים
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
