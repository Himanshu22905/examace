export const legalCss = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800&display=swap');
  body{background:#030508;color:#EEF2FF;font-family:'Outfit',sans-serif;}
`;

export function LegalLayout({ title, children }) {
  return (
    <>
      <style>{legalCss}</style>
      <div style={{ minHeight: "100vh", background: "#030508", color: "#EEF2FF", padding: "28px 16px" }}>
        <div style={{ maxWidth: 920, margin: "0 auto" }}>
          <button onClick={() => (window.location.href = "/")} style={{ marginBottom: 16, background: "transparent", border: "1px solid #1B2E47", color: "#7090B0", borderRadius: 8, padding: "8px 12px", cursor: "pointer", fontFamily: "'Outfit',sans-serif" }}>
            ← Back to Home
          </button>
          <div style={{ background: "#090E18", border: "1px solid #0F1C2E", borderRadius: 16, padding: 22 }}>
            <h1 style={{ fontSize: 30, fontWeight: 800, marginBottom: 12 }}>{title}</h1>
            <div style={{ color: "#7090B0", fontSize: 13, marginBottom: 18 }}>Last updated: April 13, 2026</div>
            <div style={{ lineHeight: 1.8, color: "#D6E6FF", fontSize: 14 }}>{children}</div>
          </div>
        </div>
      </div>
    </>
  );
}
