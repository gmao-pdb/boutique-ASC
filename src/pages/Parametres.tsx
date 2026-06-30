import { useState } from "react";
import { useConfig, patchConfig } from "../data";
import type { Config } from "../types";

export default function Parametres() {
  const cfg = useConfig();
  const [draft, setDraft] = useState<Config | null>(null);
  const [packCat, setPackCat] = useState("");

  if (cfg && draft === null) {
    setDraft(JSON.parse(JSON.stringify(cfg)));
    setPackCat(cfg.categories[0] || "");
  }
  if (!cfg || !draft) return <div className="muted" style={{ padding: 20 }}>Chargement…</div>;

  const upd = (patch: Partial<Config>) => setDraft({ ...draft, ...patch });
  const cat = packCat && draft.categories.includes(packCat) ? packCat : draft.categories[0] || "";
  const articles = draft.catalogue.map((c) => c.nom).filter((n) => n !== "SAC");

  const togglePack = (which: "packs" | "packsGardien", art: string) => {
    const map = which === "packs" ? draft.packs : draft.packsGardien;
    const set = new Set(map[cat] || []);
    set.has(art) ? set.delete(art) : set.add(art);
    const ordered = draft.catalogue.map((c) => c.nom).filter((n) => set.has(n));
    upd({ [which]: { ...map, [cat]: ordered } } as Partial<Config>);
  };

  // remises
  const setRemise = (i: number, k: "nom" | "montant", v: string) =>
    upd({ remises: draft.remises.map((r, j) => (j === i ? { ...r, [k]: k === "montant" ? (Number(v) || 0) : v } : r)) });
  const addRemise = () => upd({ remises: [...draft.remises, { nom: "", montant: 0 }] });
  const delRemise = (i: number) => upd({ remises: draft.remises.filter((_, j) => j !== i) });

  // catégories
  const setCat = (i: number, v: string) => upd({ categories: draft.categories.map((c, j) => (j === i ? v : c)) });
  const addCat = () => upd({ categories: [...draft.categories, ""] });
  const delCat = (i: number) => upd({ categories: draft.categories.filter((_, j) => j !== i) });

  // règlements
  const setReg = (i: number, v: string) => upd({ reglements: draft.reglements.map((c, j) => (j === i ? v : c)) });
  const addReg = () => upd({ reglements: [...draft.reglements, ""] });
  const delReg = (i: number) => upd({ reglements: draft.reglements.filter((_, j) => j !== i) });

  const enregistrer = async () => {
    await patchConfig({
      saison: draft.saison,
      tarifs: draft.tarifs,
      sacSiNouvelle: draft.sacSiNouvelle,
      remises: draft.remises.filter((r) => r.nom.trim()),
      categories: draft.categories.map((c) => c.trim()).filter(Boolean),
      reglements: draft.reglements.map((c) => c.trim()).filter(Boolean),
      packs: draft.packs,
      packsGardien: draft.packsGardien,
    });
    alert("Paramètres enregistrés ✔");
  };

  return (
    <div className="fiche">
      <h3 className="sec">Saison</h3>
      <input value={draft.saison} onChange={(e) => upd({ saison: e.target.value })} />

      <h3 className="sec">Tarifs selon la licence (€)</h3>
      <div className="grid2">
        <div><label>NOUVEAU</label><input type="number" value={draft.tarifs.NOUVEAU} onChange={(e) => upd({ tarifs: { ...draft.tarifs, NOUVEAU: +e.target.value } })} /></div>
        <div><label>RENOUV.</label><input type="number" value={draft.tarifs["RENOUV."]} onChange={(e) => upd({ tarifs: { ...draft.tarifs, "RENOUV.": +e.target.value } })} /></div>
      </div>
      <label>LICENCE seule</label>
      <input type="number" value={draft.tarifs.LICENCE} onChange={(e) => upd({ tarifs: { ...draft.tarifs, LICENCE: +e.target.value } })} />
      <label className="check"><input type="checkbox" checked={draft.sacSiNouvelle} onChange={(e) => upd({ sacSiNouvelle: e.target.checked })} /> 🎒 Sac ajouté pour les nouvelles licences</label>

      <h3 className="sec">Remises</h3>
      {draft.remises.map((r, i) => (
        <div className="editrow" key={i}>
          <input placeholder="Nom (ex. Fratrie)" value={r.nom} onChange={(e) => setRemise(i, "nom", e.target.value)} />
          <input className="w90" type="number" value={r.montant} onChange={(e) => setRemise(i, "montant", e.target.value)} />
          <span className="unit">€</span>
          <button className="x" onClick={() => delRemise(i)}>✕</button>
        </div>
      ))}
      <button className="mini" onClick={addRemise}>+ Ajouter une remise</button>

      <h3 className="sec">Composition des packs</h3>
      <p className="muted" style={{ fontSize: 13, marginTop: 0 }}>Choisis une catégorie, coche les articles du pack joueur / gardien. (Articles & tailles → onglet Stock.)</p>
      <select value={cat} onChange={(e) => setPackCat(e.target.value)}>
        {draft.categories.map((c) => <option key={c} value={c}>{c}</option>)}
      </select>
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

      <h3 className="sec">Catégories</h3>
      {draft.categories.map((c, i) => (
        <div className="editrow" key={i}>
          <input value={c} onChange={(e) => setCat(i, e.target.value)} />
          <button className="x" onClick={() => delCat(i)}>✕</button>
        </div>
      ))}
      <button className="mini" onClick={addCat}>+ Ajouter une catégorie</button>

      <h3 className="sec">Modes de règlement</h3>
      {draft.reglements.map((c, i) => (
        <div className="editrow" key={i}>
          <input value={c} onChange={(e) => setReg(i, e.target.value)} />
          <button className="x" onClick={() => delReg(i)}>✕</button>
        </div>
      ))}
      <button className="mini" onClick={addReg}>+ Ajouter un mode</button>

      <div style={{ height: 18 }} />
      <button className="btn-primary" onClick={() => void enregistrer()}>💾 Enregistrer les paramètres</button>
    </div>
  );
}
