import { useMemo, useState } from "react";
import { useConfig, useJoueurs, useStock, setStockItem, enregistrerInventaire, stockId } from "../data";
import { STATUT_LABEL, type ArticleStatut, type StockItem } from "../types";

const MANQ_STATUTS: ArticleStatut[] = ["acommander", "arecuperer", "alivrer"];

export default function Stock() {
  const cfg = useConfig();
  const joueurs = useJoueurs();
  const stock = useStock();
  const [vue, setVue] = useState<"manquants" | "stock">("manquants");
  const [alertesSeules, setAlertesSeules] = useState(false);

  const stockMap = useMemo(() => {
    const m = new Map<string, StockItem>();
    (stock || []).forEach((s) => m.set(s.id, s));
    return m;
  }, [stock]);

  // Agrégation des manquants (articles non remis), par statut > article+taille
  const manquants = useMemo(() => {
    const res: Record<ArticleStatut, Map<string, { article: string; taille: string; qte: number; qui: string[] }>> = {
      remis: new Map(), alivrer: new Map(), arecuperer: new Map(), acommander: new Map(),
    };
    (joueurs || []).forEach((j) => {
      (j.articles || []).forEach((a) => {
        if (a.statut === "remis") return;
        const key = a.article + "__" + (a.taille || "?");
        const map = res[a.statut];
        const e = map.get(key) || { article: a.article, taille: a.taille || "?", qte: 0, qui: [] };
        e.qte++; e.qui.push(j.nom + (j.prenom ? " " + j.prenom : ""));
        map.set(key, e);
      });
    });
    return res;
  }, [joueurs]);

  if (!cfg || !joueurs || !stock) return <div className="muted" style={{ padding: 20 }}>Chargement…</div>;

  const faireInventaire = async () => {
    if (!confirm("Enregistrer un inventaire daté avec les quantités actuelles ?")) return;
    await enregistrerInventaire((stock || []).map((s) => ({ article: s.article, taille: s.taille, quantite: s.quantite })));
    alert("Inventaire enregistré ✔");
  };

  return (
    <>
      <div className="chips">
        <button className={"chip" + (vue === "manquants" ? " on" : "")} onClick={() => setVue("manquants")}>🛒 Manquants</button>
        <button className={"chip" + (vue === "stock" ? " on" : "")} onClick={() => setVue("stock")}>📦 Stock / Inventaire</button>
      </div>

      {vue === "manquants" && (
        <>
          {MANQ_STATUTS.map((st) => {
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
        </>
      )}

      {vue === "stock" && (
        <>
          <label className="check"><input type="checkbox" checked={alertesSeules} onChange={(e) => setAlertesSeules(e.target.checked)} /> Afficher seulement les alertes (rupture / stock bas)</label>
          <button className="mini" style={{ margin: "10px 0" }} onClick={() => void faireInventaire()}>🗒️ Enregistrer l'inventaire</button>

          {cfg.catalogue.map((cat) => {
            const rows = cat.tailles.map((t) => {
              const s = stockMap.get(stockId(cat.nom, t));
              const q = s?.quantite ?? 0, seuil = s?.seuilMini ?? 0;
              const rupture = q <= 0, bas = q > 0 && q <= seuil;
              return { t, q, seuil, rupture, bas };
            }).filter((r) => !alertesSeules || r.rupture || r.bas);
            if (alertesSeules && rows.length === 0) return null;
            return (
              <details key={cat.nom} className="stock-cat">
                <summary>{cat.nom}{rows.some((r) => r.rupture) ? " 🔴" : rows.some((r) => r.bas) ? " 🟠" : ""}</summary>
                {rows.map((r) => (
                  <div key={r.t} className="stock-row">
                    <span className="st-t">{r.t}</span>
                    <label className="st-lab">Qté</label>
                    <input type="number" value={r.q} onChange={(e) => void setStockItem(cat.nom, r.t, { quantite: Math.max(0, Math.round(+e.target.value || 0)) })} />
                    <label className="st-lab">Mini</label>
                    <input type="number" value={r.seuil} onChange={(e) => void setStockItem(cat.nom, r.t, { seuilMini: Math.max(0, Math.round(+e.target.value || 0)) })} />
                    {r.rupture ? <span className="badge no">rupture</span> : r.bas ? <span className="badge part">bas</span> : <span className="badge ok">ok</span>}
                  </div>
                ))}
              </details>
            );
          })}
        </>
      )}
    </>
  );
}
