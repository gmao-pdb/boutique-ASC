import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth";
import { useConfig, useJoueurs, deleteJoueur, demanderSuppression, annulerSuppression, usePreinscriptions } from "../data";
import { calc } from "../calc";
import type { Joueur, Role } from "../types";

function packInfo(p: Joueur) {
  const arts = p.articles || [];
  const total = arts.length;
  const remis = arts.filter((a) => a.statut === "remis").length;
  const differe = total - remis;
  return { total, remis, differe, complet: total > 0 && differe === 0, partiel: differe > 0 };
}

const EQP_FILTERS = [
  { v: "", label: "Tous" },
  { v: "apreparer", label: "⏳ À préparer" },
  { v: "complet", label: "✅ Pack complet" },
  { v: "acompleter", label: "⚠️ À compléter" },
] as const;

// fiche incomplète : sans licence ou sans règlement, le total vaut 0 € et le joueur passerait pour « soldé »
const ficheIncomplete = (p: Joueur) => !p.licence || !p.reglement;

export default function Joueurs({ role }: { role: Role }) {
  const showMoney = role !== "user";
  const email = useAuth().user?.email || "";
  const config = useConfig();
  const joueurs = useJoueurs();
  const preinsc = usePreinscriptions();
  const nav = useNavigate();
  const [q, setQ] = useState("");
  const [selCats, setSelCats] = useState<Set<string>>(new Set());
  const [eqp, setEqp] = useState("");
  const [supprOnly, setSupprOnly] = useState(false);
  const pending = (joueurs || []).filter((p) => p.supprDemandee).length;

  const toggleCat = (c: string) =>
    setSelCats((prev) => { const n = new Set(prev); n.has(c) ? n.delete(c) : n.add(c); return n; });

  const { rows, kpi } = useMemo(() => {
    const k = { complets: 0, apreparer: 0, articles: 0 };
    if (!config || !joueurs) return { rows: [] as { p: Joueur; pk: ReturnType<typeof packInfo> }[], kpi: k };
    const ql = q.trim().toLowerCase();
    const list = joueurs
      .filter((p) => {
        if (supprOnly && !p.supprDemandee) return false;
        if (selCats.size > 0 && !selCats.has(p.categorie)) return false;
        const pk = packInfo(p);
        if (eqp === "apreparer" && !pk.partiel) return false;
        if (eqp === "complet" && !pk.complet) return false;
        if (eqp === "acompleter" && !ficheIncomplete(p)) return false;
        if (ql && !(p.nom + " " + p.prenom + " " + (p.tel || "")).toLowerCase().includes(ql)) return false;
        return true;
      })
      .map((p) => ({ p, pk: packInfo(p) }))
      .sort((a, b) => (a.p.nom || "").localeCompare(b.p.nom || ""));
    list.forEach(({ pk }) => { if (pk.complet) k.complets++; if (pk.partiel) { k.apreparer++; k.articles += pk.differe; } });
    return { rows: list, kpi: k };
  }, [config, joueurs, q, selCats, eqp, supprOnly]);

  if (!config || !joueurs) return <div className="muted" style={{ padding: 20 }}>Chargement…</div>;

  const finBadge = (p: Joueur) => {
    // fiche incomplète : visible par tous (sinon total = 0 € et le joueur passe pour soldé)
    if (ficheIncomplete(p)) return <span className="badge no">⚠️ à compléter</span>;
    if (!showMoney) return null;
    const c = calc(p, config);
    if (c.reste <= 0) return <span className="badge ok">soldé</span>;
    if (c.aRecuperer > 0) return <span className="badge no">à récupérer</span>;
    return <span className="badge part">à encaisser</span>;
  };

  return (
    <>
      {preinsc && preinsc.length > 0 && (
        <button className="preinsc-banner" onClick={() => nav("/preinscriptions")}>
          📥 {preinsc.length} pré-inscription{preinsc.length > 1 ? "s" : ""} à valider →
        </button>
      )}
      {showMoney && pending > 0 && (
        <button className={"preinsc-banner suppr" + (supprOnly ? " on" : "")} onClick={() => setSupprOnly(!supprOnly)}>
          🗑️ {pending} suppression{pending > 1 ? "s" : ""} à valider {supprOnly ? "— tout afficher" : "→"}
        </button>
      )}

      {/* Indicateurs équipements (tous rôles) */}
      <div className="totaux stock-kpi">
        <div className="t-item paid"><span>Packs complets</span><b>{kpi.complets}</b></div>
        <div className="t-item hold"><span>À préparer</span><b>{kpi.apreparer}</b></div>
        <div className="t-item due"><span>Articles à préparer</span><b>{kpi.articles}</b></div>
      </div>

      <button className="btn-primary" style={{ margin: "12px 0" }} onClick={() => nav("/joueur/new")}>+ Nouveau joueur</button>

      <input className="search" type="search" placeholder="🔍 Nom, prénom…" value={q} onChange={(e) => setQ(e.target.value)} />

      <div className="chips">
        {EQP_FILTERS.map((f) => (
          <button key={f.v} className={"chip" + (eqp === f.v ? " on" : "")} onClick={() => setEqp(f.v)}>{f.label}</button>
        ))}
      </div>
      <div className="chips">
        <button className={"chip" + (selCats.size === 0 ? " on" : "")} onClick={() => setSelCats(new Set())}>Toutes</button>
        {config.categories.map((c) => (
          <button key={c} className={"chip" + (selCats.has(c) ? " on" : "")} onClick={() => toggleCat(c)}>{c}</button>
        ))}
      </div>

      <div className="muted" style={{ margin: "10px 0 6px", fontSize: 13 }}>{rows.length} joueur(s)</div>
      {rows.length === 0 && <div className="card muted">Aucun joueur.</div>}

      {rows.map(({ p, pk }) => (
        <div key={p.id} className={"joueur-card" + (pk.partiel ? " toprep" : "") + (p.supprDemandee ? " supprime" : "")} onClick={() => nav("/joueur/" + p.id)}>
          <div className="jc-main">
            <div className="jc-cat">{p.gardien ? "🧤 " : ""}{p.categorie}</div>
            <div className="jc-nom"><b>{p.nom}</b> {p.prenom}</div>
            <div className="jc-badges">
              {p.supprDemandee && <span className="badge no">🗑️ suppression demandée</span>}
              {pk.total === 0 ? <span className="badge neutre">pas de pack</span>
                : pk.complet ? <span className="badge ok">✅ pack remis</span>
                : <span className="badge part">⏳ {pk.differe} à préparer</span>}
              {finBadge(p)}
            </div>
          </div>
          <div className="jc-side" onClick={(e) => e.stopPropagation()}>
            {p.supprDemandee ? (
              <>
                {showMoney && <button className="jc-del" title="Effacer définitivement" onClick={() => { if (confirm("Effacer DÉFINITIVEMENT " + p.nom + " ? (irréversible)")) void deleteJoueur(p.id); }}>🗑️</button>}
                <button className="jc-annul" title="Annuler la demande" onClick={() => void annulerSuppression(p.id)}>↩️</button>
              </>
            ) : (
              <button className="jc-del" onClick={() => {
                if (showMoney) { if (confirm("Supprimer " + p.nom + " ?")) void deleteJoueur(p.id); }
                else { if (confirm("Demander la suppression de " + p.nom + " ?\n(à valider par un responsable)")) void demanderSuppression(p.id, email); }
              }}>🗑️</button>
            )}
          </div>
        </div>
      ))}
    </>
  );
}
