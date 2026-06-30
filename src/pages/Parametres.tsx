import { useState } from "react";
import { useConfig, patchConfig } from "../data";
import type { Config } from "../types";

const lines = (s: string) => s.split("\n").map((x) => x.trim()).filter(Boolean);

export default function Parametres() {
  const cfg = useConfig();
  const [draft, setDraft] = useState<Config | null>(null);
  const [txt, setTxt] = useState<Record<string, string>>({});
  const [packCat, setPackCat] = useState("");

  if (cfg && draft === null) {
    setDraft(JSON.parse(JSON.stringify(cfg)));
    setTxt({
      remises: cfg.remises.map((r) => r.nom + " = " + r.montant).join("\n"),
      categories: cfg.categories.join("\n"),
      reglements: cfg.reglements.join("\n"),
    });
    setPackCat(cfg.categories[0] || "");
  }
  if (!cfg || !draft) return <div className="muted" style={{ padding: 20 }}>Chargement…</div>;

  const setT = (k: string, v: string) => setTxt({ ...txt, [k]: v });
  const cat = packCat && draft.categories.includes(packCat) ? packCat : draft.categories[0] || "";
  const articles = draft.catalogue.map((c) => c.nom).filter((n) => n !== "SAC");

  const togglePack = (which: "packs" | "packsGardien", art: string) => {
    const map = which === "packs" ? draft.packs : draft.packsGardien;
    const set = new Set(map[cat] || []);
    set.has(art) ? set.delete(art) : set.add(art);
    const ordered = draft.catalogue.map((c) => c.nom).filter((n) => set.has(n));
    setDraft({ ...draft, [which]: { ...map, [cat]: ordered } });
  };

  const enregistrer = async () => {
    await patchConfig({
      saison: draft.saison,
      tarifs: draft.tarifs,
      sacSiNouvelle: draft.sacSiNouvelle,
      remises: lines(txt.remises).map((l) => { const [n, m] = l.split("="); return { nom: (n || "").trim(), montant: Number((m || "").trim()) || 0 }; }).filter((r) => r.nom),
      categories: lines(txt.categories),
      reglements: lines(txt.reglements),
      packs: draft.packs,
      packsGardien: draft.packsGardien,
    });
    alert("Paramètres enregistrés ✔");
  };

  return (
    <div className="fiche">
      <h3 className="sec">Saison</h3>
      <input value={draft.saison} onChange={(e) => setDraft({ ...draft, saison: e.target.value })} />

      <h3 className="sec">Tarifs selon la licence (€)</h3>
      <div className="grid2">
        <div><label>NOUVEAU</label><input type="number" value={draft.tarifs.NOUVEAU} onChange={(e) => setDraft({ ...draft, tarifs: { ...draft.tarifs, NOUVEAU: +e.target.value } })} /></div>
        <div><label>RENOUV.</label><input type="number" value={draft.tarifs["RENOUV."]} onChange={(e) => setDraft({ ...draft, tarifs: { ...draft.tarifs, "RENOUV.": +e.target.value } })} /></div>
      </div>
      <label>LICENCE seule</label>
      <input type="number" value={draft.tarifs.LICENCE} onChange={(e) => setDraft({ ...draft, tarifs: { ...draft.tarifs, LICENCE: +e.target.value } })} />
      <label className="check"><input type="checkbox" checked={draft.sacSiNouvelle} onChange={(e) => setDraft({ ...draft, sacSiNouvelle: e.target.checked })} /> 🎒 Sac ajouté pour les nouvelles licences</label>

      {/* COMPOSITION DES PACKS */}
      <h3 className="sec">Composition des packs</h3>
      <p className="muted" style={{ fontSize: 13, marginTop: 0 }}>Choisis une catégorie, puis coche les articles du pack joueur et du pack gardien. (Les articles et tailles se gèrent dans l'onglet <b>Stock</b>.)</p>
      <select value={cat} onChange={(e) => setPackCat(e.target.value)}>
        {draft.categories.map((c) => <option key={c} value={c}>{c}</option>)}
      </select>
      {articles.length === 0 && <p className="muted" style={{ fontSize: 13 }}>Aucun article. Ajoute-en dans l'onglet Stock.</p>}
      {articles.length > 0 && (
        <div className="pktable">
          <div className="pkhead"><span>Article</span><span>Joueur</span><span>Gardien</span></div>
          {articles.map((art) => (
            <div className="pkrow" key={art}>
              <span className="pkname">{art}</span>
              <input type="checkbox" checked={(draft.packs[cat] || []).includes(art)} onChange={() => togglePack("packs", art)} />
              <input type="checkbox" checked={(draft.packsGardien[cat] || []).includes(art)} onChange={() => togglePack("packsGardien", art)} />
            </div>
          ))}
        </div>
      )}

      <h3 className="sec">Remises (nom = montant)</h3>
      <textarea rows={3} value={txt.remises} onChange={(e) => setT("remises", e.target.value)} />

      <h3 className="sec">Catégories (une par ligne)</h3>
      <textarea rows={6} value={txt.categories} onChange={(e) => setT("categories", e.target.value)} />

      <h3 className="sec">Modes de règlement</h3>
      <textarea rows={5} value={txt.reglements} onChange={(e) => setT("reglements", e.target.value)} />

      <button className="btn-primary" onClick={() => void enregistrer()}>💾 Enregistrer les paramètres</button>
    </div>
  );
}
