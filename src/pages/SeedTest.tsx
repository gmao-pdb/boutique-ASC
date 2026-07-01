import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useConfig } from "../data";
import { genererJoueursTest } from "../seed";

export default function SeedTest() {
  const cfg = useConfig();
  const nav = useNavigate();
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  if (!cfg) return <div className="muted" style={{ padding: 20 }}>Chargement…</div>;
  const go = async (n: number) => {
    setBusy(true); setMsg("Génération…");
    await genererJoueursTest(cfg, n, (i) => setMsg("Créé " + i + " / " + n + "…"));
    setBusy(false); setMsg("✔ " + n + " joueurs de test créés.");
  };
  return (
    <div className="fiche">
      <h2 style={{ margin: "4px 0 10px" }}>🧪 Générer des joueurs de test</h2>
      <p className="muted" style={{ marginTop: 0 }}>Crée des joueurs variés (catégories, gardiens, packs complets/partiels, moyens de paiement, états financiers). À vider ensuite via « Nouvelle saison ».</p>
      <button className="btn-primary" disabled={busy} onClick={() => void go(100)}>Générer 100 joueurs de test</button>
      <button className="mini" style={{ marginTop: 8 }} disabled={busy} onClick={() => void go(20)}>Générer 20 (test rapide)</button>
      {msg && <div className="hint vert" style={{ marginTop: 12 }}>{msg}</div>}
      <div style={{ marginTop: 18 }}><button className="mini" onClick={() => nav("/")}>← Retour</button></div>
    </div>
  );
}
