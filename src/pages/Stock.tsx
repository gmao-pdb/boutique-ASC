import { useMemo, useState } from "react";
import { useConfig, useJoueurs, useStock, setStockItem, enregistrerInventaire, stockId, patchConfig } from "../data";
import { STATUT_LABEL, type ArticleStatut, type CatalogueItem, type Gabarit, type StockItem } from "../types";

const MANQ_STATUTS: ArticleStatut[] = ["acommander", "arecuperer", "alivrer"];

export default function Stock() {
  const cfg = useConfig();
  const joueurs = useJoueurs();
  const stock = useStock();
  const [vue, setVue] = useState<"manquants" | "articles" | "tailles">("articles");
  const [alertesSeules, setAlertesSeules] = useState(false);
  const [newSize, setNewSize] = useState<Record<string, string>>({});
  const [newArt, setNewArt] = useState("");
  const [artQ, setArtQ] = useState("");
  const [grid, setGrid] = useState<{ systemes: string[]; gabarits: Gabarit[] } | null>(null);
  const [newCol, setNewCol] = useState("");

  const stockMap = useMemo(() => {
    const m = new Map<string, StockItem>();
    (stock || []).forEach((s) => m.set(s.id, s));
    return m;
  }, [stock]);

  const manquants = useMemo(() => {
    const res: Record<ArticleStatut, Map<string, { article: string; taille: string; qte: number; qui: string[] }>> = {
      remis: new Map(), alivrer: new Map(), arecuperer: new Map(), acommander: new Map(),
    };
    (joueurs || []).forEach((j) => {
      (j.articles || []).forEach((a) => {
        if (a.statut === "remis") return;
        const key = a.article + "__" + (a.taille || "?");
        const e = res[a.statut].get(key) || { article: a.article, taille: a.taille || "?", qte: 0, qui: [] };
        e.qte++; e.qui.push(j.nom + (j.prenom ? " " + j.prenom : ""));
        res[a.statut].set(key, e);
      });
    });
    return res;
  }, [joueurs]);

  if (!cfg || !joueurs || !stock) return <div className="muted" style={{ padding: 20 }}>Chargement…</div>;

  if (vue === "tailles" && grid === null) setGrid({ systemes: [...cfg.systemes], gabarits: JSON.parse(JSON.stringify(cfg.gabarits)) });

  /* ----- grille des gabarits ----- */
  const saveGrid = () => { if (grid) void patchConfig({ systemes: grid.systemes, gabarits: grid.gabarits }).then(() => alert("Grille enregistrée ✔")); };
  const setCell = (i: number, sys: string, v: string) => grid && setGrid({ ...grid, gabarits: grid.gabarits.map((g, k) => (k === i ? { ...g, valeurs: { ...g.valeurs, [sys]: v } } : g)) });
  const setLabel = (i: number, v: string) => grid && setGrid({ ...grid, gabarits: grid.gabarits.map((g, k) => (k === i ? { ...g, label: v } : g)) });
  const setAge = (i: number, v: string) => grid && setGrid({ ...grid, gabarits: grid.gabarits.map((g, k) => (k === i ? { ...g, ageMax: v === "" ? null : Math.max(0, Math.round(+v || 0)) } : g)) });
  const addRow = () => grid && setGrid({ ...grid, gabarits: [...grid.gabarits, { label: "Nouveau", ageMax: null, valeurs: {} }] });
  const removeRow = (i: number) => grid && setGrid({ ...grid, gabarits: grid.gabarits.filter((_, k) => k !== i) });
  const addCol = () => { const c = newCol.trim(); if (!c || !grid || grid.systemes.includes(c)) return; setGrid({ ...grid, systemes: [...grid.systemes, c] }); setNewCol(""); };
  const removeCol = (c: string) => grid && setGrid({ ...grid, systemes: grid.systemes.filter((s) => s !== c), gabarits: grid.gabarits.map((g) => { const v = { ...g.valeurs }; delete v[c]; return { ...g, valeurs: v }; }) });

  /* ----- gestion du catalogue (articles + tailles) ----- */
  const saveCatalogue = (next: CatalogueItem[]) => void patchConfig({ catalogue: next });
  const ajouterArticle = () => {
    const nom = newArt.trim();
    if (!nom) return;
    if (cfg.catalogue.some((c) => c.nom.toLowerCase() === nom.toLowerCase())) { alert("Cet article existe déjà."); return; }
    saveCatalogue([...cfg.catalogue, { nom, tailles: [] }]);
    setNewArt("");
  };
  const supprimerArticle = (nom: string) => {
    if (confirm("Supprimer l'article « " + nom + " » ?")) saveCatalogue(cfg.catalogue.filter((c) => c.nom !== nom));
  };
  const ajouterTaille = (nom: string) => {
    const t = (newSize[nom] || "").trim();
    if (!t) return;
    saveCatalogue(cfg.catalogue.map((c) => (c.nom === nom && !c.tailles.includes(t) ? { ...c, tailles: [...c.tailles, t] } : c)));
    setNewSize({ ...newSize, [nom]: "" });
  };
  const supprimerTaille = (nom: string, t: string) =>
    saveCatalogue(cfg.catalogue.map((c) => (c.nom === nom ? { ...c, tailles: c.tailles.filter((x) => x !== t) } : c)));

  const faireInventaire = async () => {
    if (!confirm("Enregistrer un inventaire daté avec les quantités actuelles ?")) return;
    await enregistrerInventaire(stock.map((s) => ({ article: s.article, taille: s.taille, quantite: s.quantite })));
    alert("Inventaire enregistré ✔");
  };

  return (
    <>
      <div className="chips">
        <button className={"chip" + (vue === "articles" ? " on" : "")} onClick={() => setVue("articles")}>📦 Articles & stock</button>
        <button className={"chip" + (vue === "tailles" ? " on" : "")} onClick={() => setVue("tailles")}>📐 Tailles</button>
        <button className={"chip" + (vue === "manquants" ? " on" : "")} onClick={() => setVue("manquants")}>🛒 Manquants</button>
      </div>

      {vue === "manquants" && MANQ_STATUTS.map((st) => {
        const list = [...manquants[st].values()].sort((a, b) => a.article.localeCompare(b.article));
        return (
          <div key={st}>
            <h3 className="sec">{STATUT_LABEL[st]} ({list.reduce((s, e) => s + e.qte, 0)})</h3>
            {list.length === 0 && <div className="muted" style={{ fontSize: 13, marginBottom: 8 }}>Rien.</div>}
            {list.map((e) => (
              <div key={e.article + e.taille} className="manq">
                <div><b>{e.qte}×</b> {e.article} <span className="muted">({e.taille})</span></div>
                <div className="muted" style={{ fontSize: 12 }}>{e.qui.join(", ")}</div>
              </div>
            ))}
          </div>
        );
      })}

      {vue === "articles" && (() => {
        let refs = 0, rupt = 0, bas = 0;
        cfg.catalogue.forEach((a) => a.tailles.forEach((t) => {
          refs++;
          const s = stockMap.get(stockId(a.nom, t));
          if (s) { if (s.quantite <= 0) rupt++; else if (s.seuilMini > 0 && s.quantite <= s.seuilMini) bas++; }
        }));
        const liste = cfg.catalogue.filter((a) => a.nom.toLowerCase().includes(artQ.trim().toLowerCase()));
        return (
          <>
            <div className="totaux stock-kpi">
              <div className="t-item"><span>Références</span><b>{refs}</b></div>
              <div className="t-item due"><span>Ruptures</span><b>{rupt}</b></div>
              <div className="t-item hold"><span>Stock bas</span><b>{bas}</b></div>
            </div>

            <div className="stock-tools">
              <input className="search" type="search" placeholder="🔍 Article…" value={artQ} onChange={(e) => setArtQ(e.target.value)} />
              <button className="mini" onClick={() => void faireInventaire()}>🗒️ Inventaire</button>
            </div>
            <label className="check" style={{ marginBottom: 6 }}><input type="checkbox" checked={alertesSeules} onChange={(e) => setAlertesSeules(e.target.checked)} /> Seulement les alertes</label>

            {liste.map((art) => {
              const rows = art.tailles.map((t) => {
                const s = stockMap.get(stockId(art.nom, t));
                const tracked = !!s, q = s?.quantite ?? 0, seuil = s?.seuilMini ?? 0;
                return { t, q, seuil, tracked, rupture: tracked && q <= 0, bas: tracked && seuil > 0 && q > 0 && q <= seuil };
              });
              const shown = alertesSeules ? rows.filter((r) => r.rupture || r.bas) : rows;
              if (alertesSeules && shown.length === 0) return null;
              const dot = rows.some((r) => r.rupture) ? "🔴" : rows.some((r) => r.bas) ? "🟠" : "";
              return (
                <details key={art.nom} className="art-acc">
                  <summary>
                    <span className="aa-name">{art.nom}</span>
                    <span className="aa-meta">{dot} {art.tailles.length} taille{art.tailles.length > 1 ? "s" : ""}</span>
                  </summary>
                  <div className="aa-body">
                    <table className="stk">
                      <thead><tr><th>Taille</th><th>Quantité</th><th>Seuil</th><th>État</th><th></th></tr></thead>
                      <tbody>
                        {shown.map((r) => (
                          <tr key={r.t}>
                            <td className="stk-t">{r.t}</td>
                            <td>
                              <div className="stepper">
                                <button onClick={() => void setStockItem(art.nom, r.t, { quantite: Math.max(0, r.q - 1) })}>−</button>
                                <input type="number" value={r.q} onChange={(e) => void setStockItem(art.nom, r.t, { quantite: Math.max(0, Math.round(+e.target.value || 0)) })} />
                                <button onClick={() => void setStockItem(art.nom, r.t, { quantite: r.q + 1 })}>+</button>
                              </div>
                            </td>
                            <td><input className="seuil" type="number" value={r.seuil} onChange={(e) => void setStockItem(art.nom, r.t, { seuilMini: Math.max(0, Math.round(+e.target.value || 0)) })} /></td>
                            <td>{!r.tracked ? <span className="badge neutre">—</span> : r.rupture ? <span className="badge no">rupture</span> : r.bas ? <span className="badge part">bas</span> : <span className="badge ok">ok</span>}</td>
                            <td><button className="x" onClick={() => supprimerTaille(art.nom, r.t)}>✕</button></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <div className="aa-foot">
                      <div className="addrow" style={{ flex: 1 }}>
                        <input placeholder="ajouter une taille" value={newSize[art.nom] || ""} onChange={(e) => setNewSize({ ...newSize, [art.nom]: e.target.value })} onKeyDown={(e) => { if (e.key === "Enter") ajouterTaille(art.nom); }} />
                        <button className="mini" onClick={() => ajouterTaille(art.nom)}>+ taille</button>
                      </div>
                      <button className="lnk-danger" onClick={() => supprimerArticle(art.nom)}>Supprimer l'article</button>
                    </div>
                  </div>
                </details>
              );
            })}

            <div className="addrow" style={{ marginTop: 14 }}>
              <input placeholder="Nouvel article" value={newArt} onChange={(e) => setNewArt(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") ajouterArticle(); }} />
              <button className="btn-primary" style={{ width: "auto", marginTop: 0, padding: "11px 16px" }} onClick={ajouterArticle}>+ Ajouter</button>
            </div>
          </>
        );
      })()}

      {vue === "tailles" && grid && (
        <>
          <p className="muted" style={{ fontSize: 13 }}>Chaque ligne = un gabarit. Sur la fiche joueur, le gabarit remplit les tailles : pour chaque article, la 1ʳᵉ équivalence (dans l'ordre des colonnes) présente dans ses tailles.</p>
          <div className="grid-scroll">
            <table className="gtable">
              <thead>
                <tr>
                  <th>Gabarit</th><th>Âge max</th>
                  {grid.systemes.map((s) => <th key={s}>{s} <button className="x" onClick={() => removeCol(s)}>✕</button></th>)}
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {grid.gabarits.map((g, i) => (
                  <tr key={i}>
                    <td><input value={g.label} onChange={(e) => setLabel(i, e.target.value)} /></td>
                    <td><input className="w50" type="number" value={g.ageMax ?? ""} placeholder="—" onChange={(e) => setAge(i, e.target.value)} /></td>
                    {grid.systemes.map((s) => <td key={s}><input className="w70" value={g.valeurs[s] || ""} onChange={(e) => setCell(i, s, e.target.value)} /></td>)}
                    <td><button className="x" onClick={() => removeRow(i)}>🗑️</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="addrow">
            <input placeholder="nouvelle colonne" value={newCol} onChange={(e) => setNewCol(e.target.value)} />
            <button className="mini" onClick={addCol}>+ colonne</button>
            <button className="mini" onClick={addRow}>+ gabarit</button>
          </div>
          <button className="btn-primary" onClick={saveGrid}>💾 Enregistrer la grille</button>
        </>
      )}
    </>
  );
}
