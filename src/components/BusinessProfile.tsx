import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "../store";
import {
  fetchBusiness,
  updateBusiness,
  selectCurrentBusiness,
  createBusiness,
  setCurrentBusiness,
  uploadBusinessLogo,
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

  const mode = searchParams.get("mode") === "create" ? "create" : "edit";
  const isCreateMode = mode === "create";

  const [form, setForm] = useState({
    name: "",
    slogan: "",
    category: "",
    logoUrl: "",
    address: "",
    contactPhone: "",
    businessEmail: "",
    websiteUrl: "",
    instagram: "",
    facebook: "",
    tiktok: "",
    ownerName: "",
    ownerEmail: "",
    ownerPhone: "",
    preferredStyle: styleOptions[0].value,
    brandColors: "",
    description: "",
  });

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  // Fetch existing business
  useEffect(() => {
    if (!isCreateMode && token && business?.businessId) {
      dispatch(fetchBusiness({ token, businessId: business.businessId })).catch(console.error);
    }
  }, [isCreateMode, token, business?.businessId, dispatch]);

  // Populate form
  useEffect(() => {
    if (!isCreateMode && business) {
      setForm({
        name: business.name || "",
        slogan: business.slogan || "",
        category: business.category || "",
        logoUrl: business.logoUrl || "",
        address: business.address?.street || "",
        contactPhone: business.contactPhone || "",
        businessEmail: business.businessEmail || "",
        websiteUrl: business.websiteUrl || "",
        instagram: business.instagram || "",
        facebook: business.facebook || "",
        tiktok: business.tiktok || "",
        ownerName: business.owner?.name || "",
        ownerEmail: business.owner?.email || "",
        ownerPhone: business.owner?.phone || "",
        preferredStyle: business.preferredStyle || styleOptions[0].value,
        brandColors: (business.brandColors || []).join(","),
        description: business.description || "",
      });
    }
  }, [isCreateMode, business]);

  // Auto-fill from user
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

  const handleLogoClick = () => fileInputRef.current?.click();

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0] || !token || !business?.businessId) return;
    const file = e.target.files[0];
    setUploadingLogo(true);
    try {
      const result = await dispatch(
        uploadBusinessLogo({ token, businessId: business.businessId, file })
      ).unwrap();
      setForm((f) => ({ ...f, logoUrl: result.url }));
    } catch (err) {
      console.error("Logo upload failed:", err);
      alert("העלאת הלוגו נכשלה. נסה שוב.");
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return alert("אין אסימון אימות. נא להתחבר מחדש.");

    if (!form.name.trim()) return alert("נא למלא את שם העסק");

    const payload: Partial<Business> = {
      name: form.name,
      slogan: form.slogan || null,
      category: form.category || null,
      logoUrl: form.logoUrl || null,
      contactPhone: form.contactPhone || null,
      businessEmail: form.businessEmail || null,
      websiteUrl: form.websiteUrl || null,
      instagram: form.instagram || null,
      facebook: form.facebook || null,
      tiktok: form.tiktok || null,
      preferredStyle: form.preferredStyle as Business["preferredStyle"],
      description: form.description || null,
      owner: {
        name: form.ownerName,
        email: form.ownerEmail,
        phone: form.ownerPhone,
      },
      ...(form.brandColors && {
        brandColors: form.brandColors.split(",").map((c) => c.trim()).filter(Boolean),
      }),
      ...(form.address && { address: { street: form.address } }),
    };

    try {
      let updatedBusiness;
      if (isCreateMode) {
        updatedBusiness = await dispatch(createBusiness({ token, data: payload })).unwrap();
        alert("✅ עסק חדש נוצר בהצלחה!");
      } else {
        updatedBusiness = await dispatch(
          updateBusiness({ token, businessId: business!.businessId, data: payload })
        ).unwrap();
        alert("✅ פרטי העסק עודכנו בהצלחה!");
      }

      dispatch(setCurrentBusiness(updatedBusiness));
      navigate("/dashboard/products");
    } catch (err: any) {
      console.error("❌ Error saving business:", err);
      alert(`שגיאה בשמירת העסק: ${err?.message || "שגיאה לא ידועה"}`);
    }
  };

  // UI styles
  const container: React.CSSProperties = {
    maxWidth: 960,
    margin: "0 auto",
    padding: `${theme.spacing.xl}px ${theme.spacing.lg}px`,
    direction: "rtl",
  };

  const card: React.CSSProperties = {
    background: theme.colors.surfaceLight,
    borderRadius: 16,
    boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
    padding: theme.spacing.xl,
    border: `1px solid ${theme.colors.borderLight}`,
  };

  const sectionGrid: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: theme.spacing.lg,
  };

  const labelText: React.CSSProperties = {
    color: theme.colors.textDark,
    fontWeight: 600,
    fontSize: 14,
    marginBottom: 8,
  };

  const inputBase: React.CSSProperties = {
    width: "100%",
    border: `1px solid ${theme.colors.borderLight}`,
    borderRadius: 12,
    height: 48,
    padding: "0 16px",
    fontFamily: theme.typography.fontFamily.display,
    fontSize: 14,
    backgroundColor: theme.colors.backgroundLight,
    color: theme.colors.textDark,
    outline: "none",
  };

return (
  <div style={container}>
    <h1 style={{ fontSize: 28, fontWeight: 900, color: theme.colors.textDark }}>
      {isCreateMode ? "צור עסק חדש" : "עריכת פרופיל העסק"}
    </h1>

    <div
      style={{
        ...card,
        maxHeight: "calc(100vh - 180px)",
        overflowY: "auto",
        scrollbarWidth: "thin",
        scrollbarColor: `${theme.colors.borderLight} transparent`,
      }}
    >
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 40 }}>
        {/* 📸 Logo Upload */}
        <section style={{ textAlign: "center" }}>
          <div
            onClick={handleLogoClick}
            style={{
              width: 120,
              height: 120,
              borderRadius: "50%",
              overflow: "hidden",
              border: `2px dashed ${theme.colors.borderLight}`,
              cursor: "pointer",
              margin: "0 auto",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: theme.colors.backgroundLight,
            }}
          >
            {form.logoUrl ? (
              <img
                src={form.logoUrl}
                alt="Logo"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              <span style={{ color: theme.colors.textMuted }}>
                {uploadingLogo ? "מעלה..." : "העלה לוגו"}
              </span>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={handleLogoUpload}
          />
        </section>

        {/* 🧱 מידע כללי */}
        <section>
          <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12, color: theme.colors.textDark }}>
            מידע כללי
          </h3>
          <div style={sectionGrid}>
            <label>
              <span style={labelText}>שם העסק *</span>
              <input name="name" value={form.name} onChange={handleChange} style={inputBase} required />
            </label>
            <label>
              <span style={labelText}>סלוגן</span>
              <input name="slogan" value={form.slogan} onChange={handleChange} style={inputBase} />
            </label>
          </div>

          <div style={sectionGrid}>
            <label>
              <span style={labelText}>קטגוריה</span>
              <input name="category" value={form.category} onChange={handleChange} style={inputBase} />
            </label>
            <label>
              <span style={labelText}>תיאור</span>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                style={{ ...inputBase, height: 80, padding: 12 }}
              />
            </label>
          </div>
        </section>

        {/* 🧑‍💼 פרטי בעל העסק */}
        <section>
          <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12, color: theme.colors.textDark }}>
            פרטי בעל העסק
          </h3>
          <div style={sectionGrid}>
            <label>
              <span style={labelText}>שם הבעלים</span>
              <input name="ownerName" value={form.ownerName} onChange={handleChange} style={inputBase} />
            </label>
            <label>
              <span style={labelText}>טלפון</span>
              <input name="ownerPhone" value={form.ownerPhone} onChange={handleChange} style={inputBase} />
            </label>
          </div>
          <label>
            <span style={labelText}>אימייל</span>
            <input name="ownerEmail" type="email" value={form.ownerEmail} onChange={handleChange} style={inputBase} />
          </label>
        </section>

        {/* 🌐 פרטי תקשורת ורשתות חברתיות */}
        <section>
          <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12, color: theme.colors.textDark }}>
            תקשורת ורשתות חברתיות
          </h3>
          <div style={sectionGrid}>
            <label>
              <span style={labelText}>טלפון ליצירת קשר</span>
              <input name="contactPhone" value={form.contactPhone} onChange={handleChange} style={inputBase} />
            </label>
            <label>
              <span style={labelText}>אימייל עסקי</span>
              <input name="businessEmail" type="email" value={form.businessEmail} onChange={handleChange} style={inputBase} />
            </label>
          </div>

          <div style={sectionGrid}>
            <label>
              <span style={labelText}>אתר אינטרנט</span>
              <input name="websiteUrl" value={form.websiteUrl} onChange={handleChange} style={inputBase} />
            </label>
            <label>
              <span style={labelText}>אינסטגרם</span>
              <input name="instagram" value={form.instagram} onChange={handleChange} style={inputBase} />
            </label>
          </div>

          <div style={sectionGrid}>
            <label>
              <span style={labelText}>פייסבוק</span>
              <input name="facebook" value={form.facebook} onChange={handleChange} style={inputBase} />
            </label>
            <label>
              <span style={labelText}>טיקטוק</span>
              <input name="tiktok" value={form.tiktok} onChange={handleChange} style={inputBase} />
            </label>
          </div>
        </section>

        {/* 🎨 עיצוב וזהות מותג */}
        <section>
          <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12, color: theme.colors.textDark }}>
            עיצוב וזהות מותג
          </h3>
          <div style={sectionGrid}>
            <label>
              <span style={labelText}>סגנון מועדף</span>
              <select
                name="preferredStyle"
                value={form.preferredStyle}
                onChange={handleChange}
                style={{ ...inputBase, height: 48 }}
              >
                {styleOptions.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <span style={labelText}>צבעי מותג (מופרדים בפסיק)</span>
              <input name="brandColors" value={form.brandColors} onChange={handleChange} style={inputBase} />
            </label>
          </div>
        </section>

        {/* Buttons */}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
          <button
            type="button"
            onClick={() => navigate("/dashboard/products")}
            style={{
              background: theme.colors.surfaceLight,
              border: `1px solid ${theme.colors.borderLight}`,
              borderRadius: 12,
              padding: "10px 24px",
              cursor: "pointer",
            }}
          >
            ביטול
          </button>
          <button
            type="submit"
            style={{
              background: theme.colors.primary,
              color: "#fff",
              border: "none",
              borderRadius: 12,
              padding: "10px 32px",
              cursor: "pointer",
            }}
          >
            {isCreateMode ? "צור עסק" : "שמור שינויים"}
          </button>
        </div>
      </form>
    </div>
  </div>
);

}
