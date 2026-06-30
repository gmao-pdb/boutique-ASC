import { useState } from "react";
import { useConfig, saveConfig } from "../data";
import type { Config } from "../types";

const lines = (s: string) => s.split("\n").map((x) => x.trim()).filter(Boolean);
const parsePacks = (s: string) => {
  const o: Record<string, string[]> = {};
  lines(s).forEach((l) => {
    const i = l.indexOf("=");
    if (i < 0) return;
    const cat = l.slice(0, i).trim();
    const arr = l.slice(i + 1).split(",").map((x) => x.trim()).filter(Boolean);
    if (cat && arr.length) o[cat] = arr;
  });
  return o;
};
const packsToText = (cfg: Config, p: Record<string, string[]>) =>
  cfg.categories.map((c) => c + " = " + ((p && p[c]) || []).join(", ")).join("\n");

export default function Parametres() {
  const cfg = useConfig();
  const [draft, setDraft] = useState<Config | null>(null);
  const [txt, setTxt] = useState<Record<string, string>>({});

  if (cfg && draft === null) {
    setDraft(JSON.parse(JSON.stringify(cfg)));
    setTxt({
      remises: cfg.remises.map((r) => r.nom + " = " + r.montant).join("\n"),
      categories: cfg.categories.join("\n"),
      reglements: cfg.reglements.join("\n"),
      catalogue: cfg.catalogue.map((c) => c.nom + " = " + c.tailles.join(", ")).join("\n"),
      packs: packsToText(cfg, cfg.packs),
      packsGardien: packsToText(cfg, cfg.packsGardien),
    });
  }
  if (!cfg || !draft) return <div className="muted" style={{ padding: 20 }}>Chargement…</div>;

  const setT = (k: string, v: string) => setTxt({ ...txt, [k]: v });

  const enregistrer = async () => {
    const next: Config = {
      ...draft,
      remises: lines(txt.remises).map((l) => { const [n, m] = l.split("="); return { nom: (n || "").trim(), montant: Number((m || "").trim()) || 0 }; }).filter((r) => r.nom),
      categories: lines(txt.categories),
      reglements: lines(txt.reglements),
      catalogue: lines(txt.catalogue).map((l) => { const [n, t] = l.split("="); return { nom: (n || "").trim(), tailles: (t || "").split(",").map((x) => x.trim()).filter(Boolean) }; }).filter((c) => c.nom),
      packs: parsePacks(txt.packs),
      packsGardien: parsePacks(txt.packsGardien),
    };
    await saveConfig(next);
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

      <h3 className="sec">Remises (nom = montant)</h3>
      <textarea rows={3} value={txt.remises} onChange={(e) => setT("remises", e.target.value)} />

      <h3 className="sec">Catégories (une par ligne)</h3>
      <textarea rows={6} value={txt.categories} onChange={(e) => setT("categories", e.target.value)} />

      <h3 className="sec">Modes de règlement</h3>
      <textarea rows={5} value={txt.reglements} onChange={(e) => setT("reglements", e.target.value)} />

      <h3 className="sec">Catalogue (article = tailles)</h3>
      <textarea rows={8} value={txt.catalogue} onChange={(e) => setT("catalogue", e.target.value)} />

      <h3 className="sec">Packs par catégorie (catégorie = articles)</h3>
      <textarea rows={8} value={txt.packs} onChange={(e) => setT("packs", e.target.value)} />

      <h3 className="sec">Packs GARDIEN par catégorie</h3>
      <textarea rows={8} value={txt.packsGardien} onChange={(e) => setT("packsGardien", e.target.value)} />

      <button className="btn-primary" onClick={() => void enregistrer()}>💾 Enregistrer les paramètres</button>
    </div>
  );
}
