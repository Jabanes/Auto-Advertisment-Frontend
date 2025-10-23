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
import { theme } from "../styles/theme";
import config from "../config/businessConfig.json"; // ✅ dynamic field options

export default function BusinessProfile() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = useAppSelector((s) => s.auth.serverToken);
  const user = useAppSelector((s) => s.auth.user);
  const business = useAppSelector(selectCurrentBusiness);

  const mode = searchParams.get("mode") === "create" ? "create" : "edit";
  const isCreateMode = mode === "create";

  // 🧾 Local form state
  const [form, setForm] = useState({
    name: "",
    slogan: "",
    category: "",
    toneOfVoice: "",
    businessType: "",
    businessPersona: "",
    businessGoal: "",
    preferredStyle: "",
    preserveOriginalProduct: false,
    logoUrl: "",
    // Contact & Address
    address: "",
    contactPhone: "",
    businessEmail: "",
    websiteUrl: "",
    // Socials
    instagram: "",
    facebook: "",
    tiktok: "",
    // Owner Info
    ownerName: business.owner?.name || user?.displayName || "",
    ownerPhone: business.owner?.phone || "",
    ownerEmail: business.owner?.email || user?.email || "",
    // Visuals
    brandColors: "",
    description: "",
  });

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  // 🔄 Fetch business data
  useEffect(() => {
    if (!isCreateMode && token && business?.businessId) {
      dispatch(fetchBusiness({ token, businessId: business.businessId })).catch(console.error);
    }
  }, [isCreateMode, token, business?.businessId, dispatch]);

  useEffect(() => {
    // ✅ Protect against null
    if (!business || !token) return;

    if (!isCreateMode) {
      setForm({
        name: business.name || "",
        slogan: business.slogan || "",
        category: business.category || "",
        toneOfVoice: business.toneOfVoice || "",
        businessType: business.businessType || "",
        businessPersona: business.businessPersona?.type || "",
        businessGoal: business.businessGoal || "",
        preferredStyle: business.preferredStyle || "realistic",
        preserveOriginalProduct: business.preserveOriginalProduct || false,
        logoUrl: business.logoUrl || "",
        address: business.address?.street || "",
        contactPhone: business.contactPhone || "",
        businessEmail: business.businessEmail || "",
        websiteUrl: business.websiteUrl || "",
        instagram: business.instagram || "",
        facebook: business.facebook || "",
        tiktok: business.tiktok || "",
        // ✅ Safe optional chaining for owner
        ownerName: business?.owner?.name || user?.displayName || "",
        ownerEmail: business?.owner?.email || user?.email || "",
        ownerPhone: business?.owner?.phone || "",
        brandColors: (business.brandColors || []).join(","),
        description: business.description || "",
      });
    }
  }, [isCreateMode, business, user, token]);

  // 🧠 Autofill owner info from user (create mode)
  useEffect(() => {
    if (isCreateMode && user) {
      setForm((prev) => ({
        ...prev,
        ownerName: prev.ownerName || user?.displayName || "",
        ownerEmail: prev.ownerEmail || user?.email || "",
      }));
    }
  }, [isCreateMode, user]);

  // 🖋️ Generic input handler
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const target = e.target;
    if (target instanceof HTMLInputElement && target.type === "checkbox") {
      setForm((f) => ({ ...f, [target.name]: target.checked }));
    } else {
      setForm((f) => ({ ...f, [target.name]: target.value }));
    }
  };

  // 🖼️ Logo upload logic
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

  // 💾 Save business
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return alert("אין אסימון אימות. נא להתחבר מחדש.");
    if (!form.name.trim()) return alert("נא למלא את שם העסק");

    const payload: Partial<Business> = {
      name: form.name,
      slogan: form.slogan || null,
      category: form.category || null,
      toneOfVoice: form.toneOfVoice || null,
      businessType: form.businessType || null,
      businessPersona: { type: form.businessPersona || null },
      businessGoal: form.businessGoal || null,
      preferredStyle: form.preferredStyle || null,
      preserveOriginalProduct: !!form.preserveOriginalProduct,
      logoUrl: form.logoUrl || null,
      contactPhone: form.contactPhone || null,
      businessEmail: form.businessEmail || null,
      websiteUrl: form.websiteUrl || null,
      instagram: form.instagram || null,
      facebook: form.facebook || null,
      tiktok: form.tiktok || null,
      description: form.description || null,

      owner: {
        name: form.ownerName || user?.displayName || null,
        email: form.ownerEmail || user?.email || null,
        phone: form.ownerPhone || null,
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

  // === Shared Styles ===
  const container: React.CSSProperties = {
    maxWidth: 960,
    margin: "0 auto",
    padding: `${theme.spacing.xl}px ${theme.spacing.lg}px`,
    direction: "rtl" as "rtl",
  };
  const card = {
    background: theme.colors.surfaceLight,
    borderRadius: 16,
    boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
    padding: 32,
    border: `1px solid ${theme.colors.borderLight}`,
  };
  const sectionGrid = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 };
  const labelText = { color: theme.colors.textDark, fontWeight: 600, fontSize: 14, marginBottom: 8 };
  const inputBase = {
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

  // === UI ===
  return (
    <div style={container}>
      <h1 style={{ fontSize: 28, fontWeight: 900, color: theme.colors.textDark }}>
        {isCreateMode ? "צור עסק חדש" : "עריכת פרופיל העסק"}
      </h1>

      <div style={{ ...card, maxHeight: "calc(100vh - 180px)", overflowY: "auto" }}>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 40 }}>

          {/* 🖼️ Logo Section */}
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
                <img src={form.logoUrl} alt="Logo" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <span style={{ color: theme.colors.textMuted }}>
                  {uploadingLogo ? "מעלה..." : "העלה לוגו"}
                </span>
              )}
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleLogoUpload} />
          </section>

          {/* 📋 General Information */}
          <section>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>מידע כללי</h3>
            <div style={sectionGrid}>
              <label>
                <span style={labelText}>שם העסק *</span>
                <input name="name" value={form.name} onChange={handleChange} style={inputBase} required />
              </label>

              <label>
                <span style={labelText}>קטגוריה</span>
                <select name="category" value={form.category} onChange={handleChange} style={inputBase}>
                  <option value="">בחר...</option>
                  {Object.entries(config.category.options).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </label>
            </div>

            <label>
              <span style={labelText}>תיאור העסק</span>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="ספר על העסק שלך, השירותים שאתה מספק או המוצרים שאתה מוכר..."
                style={{ ...inputBase, height: 120, padding: "12px 16px", resize: "vertical" }}
              />
            </label>
          </section>

          {/* 🧠 Business Attributes */}
          <section>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>מאפייני עסק</h3>
            <div style={sectionGrid}>
              <label>
                <span style={labelText}>סוג העסק</span>
                <select name="businessType" value={form.businessType} onChange={handleChange} style={inputBase}>
                  <option value="">בחר...</option>
                  {Object.entries(config.businessType.options).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </label>

              <label>
                <span style={labelText}>אישיות העסק</span>
                <select name="businessPersona" value={form.businessPersona} onChange={handleChange} style={inputBase}>
                  <option value="">בחר...</option>
                  {Object.entries(config.businessPersona.options).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </label>
            </div>

            <div style={sectionGrid}>
              <label>
                <span style={labelText}>מטרה שיווקית</span>
                <select name="businessGoal" value={form.businessGoal} onChange={handleChange} style={inputBase}>
                  <option value="">בחר...</option>
                  {Object.entries(config.businessGoal.options).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </label>

              <label>
                <span style={labelText}>טון דיבור</span>
                <select name="toneOfVoice" value={form.toneOfVoice} onChange={handleChange} style={inputBase}>
                  <option value="">בחר...</option>
                  {Object.entries(config.toneOfVoice.options).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </label>
            </div>
          </section>

          {/* 📍 Address & Contact */}
          <section>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>כתובת ופרטי יצירת קשר</h3>
            <div style={sectionGrid}>
              <label>
                <span style={labelText}>כתובת</span>
                <input name="address" value={form.address} onChange={handleChange} style={inputBase} />
              </label>

              <label>
                <span style={labelText}>טלפון ליצירת קשר</span>
                <input name="contactPhone" value={form.contactPhone} onChange={handleChange} style={inputBase} />
              </label>
            </div>

            <div style={sectionGrid}>
              <label>
                <span style={labelText}>אימייל עסקי</span>
                <input name="businessEmail" value={form.businessEmail} onChange={handleChange} style={inputBase} />
              </label>

              <label>
                <span style={labelText}>אתר אינטרנט</span>
                <input name="websiteUrl" value={form.websiteUrl} onChange={handleChange} style={inputBase} />
              </label>
            </div>
          </section>

          {/* 🎨 Design & Branding */}
          <section>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>עיצוב וזהות מותג</h3>
            <div style={sectionGrid}>
              <label>
                <span style={labelText}>סגנון מועדף</span>
                <select name="preferredStyle" value={form.preferredStyle} onChange={handleChange} style={inputBase}>
                  {Object.entries(config.preferredStyle.options).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </label>

              <label>
                <span style={labelText}>צבעי מותג (מופרדים בפסיק)</span>
                <input name="brandColors" value={form.brandColors} onChange={handleChange} style={inputBase} />
              </label>
            </div>
          </section>

          {/* 👤 Owner & Social Links */}
          <section>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>פרטי בעל העסק ורשתות חברתיות</h3>
            <div style={sectionGrid}>
              <label>
                <span style={labelText}>שם בעל העסק</span>
                <input name="ownerName" value={form.ownerName} onChange={handleChange} style={inputBase} />
              </label>

              <label>
                <span style={labelText}>אימייל בעל העסק</span>
                <input name="ownerEmail" value={form.ownerEmail} onChange={handleChange} style={inputBase} />
              </label>
            </div>

            <div style={sectionGrid}>
              <label>
                <span style={labelText}>טלפון בעל העסק</span>
                <input name="ownerPhone" value={form.ownerPhone} onChange={handleChange} style={inputBase} />
              </label>

              <label>
                <span style={labelText}>Instagram</span>
                <input name="instagram" value={form.instagram} onChange={handleChange} style={inputBase} />
              </label>
            </div>

            <div style={sectionGrid}>
              <label>
                <span style={labelText}>Facebook</span>
                <input name="facebook" value={form.facebook} onChange={handleChange} style={inputBase} />
              </label>

              <label>
                <span style={labelText}>TikTok</span>
                <input name="tiktok" value={form.tiktok} onChange={handleChange} style={inputBase} />
              </label>
            </div>
          </section>

          {/* ✅ Actions */}
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
