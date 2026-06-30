import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useConfig, useJoueurs, deleteJoueur } from "../data";
import { calc, euro } from "../calc";
import type { Joueur } from "../types";

const PAY_FILTERS = [
  { v: "", label: "Tous" },
  { v: "arecup", label: "🔴 À récupérer" },
  { v: "aencaisser", label: "🟠 À encaisser" },
  { v: "solde", label: "🟢 Soldé" },
] as const;

export default function Joueurs() {
  const config = useConfig();
  const joueurs = useJoueurs();
  const nav = useNavigate();
  const [q, setQ] = useState("");
  const [selCats, setSelCats] = useState<Set<string>>(new Set());
  const [pay, setPay] = useState("");

  const toggleCat = (c: string) =>
    setSelCats((prev) => {
      const n = new Set(prev);
      if (n.has(c)) n.delete(c); else n.add(c);
      return n;
    });

  const { rows, tot } = useMemo(() => {
    const t = { total: 0, recup: 0, enc: 0, paye: 0 };
    if (!config || !joueurs) return { rows: [] as { p: Joueur; c: ReturnType<typeof calc> }[], tot: t };
    const ql = q.trim().toLowerCase();
    const list = joueurs
      .filter((p) => {
        if (selCats.size > 0 && !selCats.has(p.categorie)) return false;
        const c = calc(p, config);
        if (pay === "solde" && c.reste > 0) return false;
        if (pay === "arecup" && !(c.aRecuperer > 0)) return false;
        if (pay === "aencaisser" && !(c.aEncaisser > 0)) return false;
        if (ql && !(p.nom + " " + p.prenom + " " + (p.tel || "")).toLowerCase().includes(ql)) return false;
        return true;
      })
      .map((p) => ({ p, c: calc(p, config) }))
      .sort((a, b) => (a.p.nom || "").localeCompare(b.p.nom || ""));
    list.forEach(({ c }) => { t.total += c.total; t.recup += c.aRecuperer; t.enc += c.aEncaisser; t.paye += c.paye; });
    return { rows: list, tot: t };
  }, [config, joueurs, q, selCats, pay]);

  if (!config || !joueurs) return <div className="muted" style={{ padding: 20 }}>Chargement…</div>;

  return (
    <>
      <button className="btn-primary" style={{ marginBottom: 14 }} onClick={() => nav("/joueur/new")}>+ Nouveau joueur</button>

      <div className="totaux">
        <div className="t-item"><span>Total</span><b>{euro(tot.total)}</b></div>
        <div className="t-item due"><span>À récupérer</span><b>{euro(tot.recup)}</b></div>
        <div className="t-item hold"><span>À encaisser</span><b>{euro(tot.enc)}</b></div>
        <div className="t-item paid"><span>Encaissé</span><b>{euro(tot.paye)}</b></div>
      </div>

      <input className="search" type="search" placeholder="🔍 Nom, prénom…" value={q} onChange={(e) => setQ(e.target.value)} />

      <div className="chips">
        {PAY_FILTERS.map((f) => (
          <button key={f.v} className={"chip" + (pay === f.v ? " on" : "")} onClick={() => setPay(f.v)}>{f.label}</button>
        ))}
      </div>
      <div className="chips">
        <button className={"chip" + (selCats.size === 0 ? " on" : "")} onClick={() => setSelCats(new Set())}>Toutes</button>
        {config.categories.map((c) => (
          <button key={c} className={"chip" + (selCats.has(c) ? " on" : "")} onClick={() => toggleCat(c)}>{c}</button>
        ))}
      </div>

      <div className="muted" style={{ margin: "10px 0 6px", fontSize: 13 }}>{rows.length} joueur(s)</div>

      {rows.length === 0 && <div className="card muted">Aucun joueur. Ajoute-en un.</div>}

      {rows.map(({ p, c }) => (
        <div key={p.id} className={"joueur-card" + (c.aRecuperer > 0 ? " torecover" : "")} onClick={() => nav("/joueur/" + p.id)}>
          <div className="jc-main">
            <div className="jc-cat">{p.gardien ? "🧤 " : ""}{p.categorie}</div>
            <div className="jc-nom"><b>{p.nom}</b> {p.prenom}</div>
            <div className="jc-badges">
              {c.reste <= 0 ? <span className="badge ok">soldé</span> : c.paye > 0 ? <span className="badge part">partiel</span> : <span className="badge no">à payer</span>}
              {c.aRecuperer > 0 && <span className="badge no">à récup. {euro(c.aRecuperer)}</span>}
              {c.aEncaisser > 0 && <span className="badge part">à encaiss. {euro(c.aEncaisser)}</span>}
            </div>
          </div>
          <div className="jc-side">
            <div className="jc-reste" style={{ color: c.reste > 0 ? "var(--rouge)" : "var(--vert)" }}>{euro(c.reste)}</div>
            <button className="jc-del" onClick={(e) => { e.stopPropagation(); if (confirm("Supprimer " + p.nom + " ?")) void deleteJoueur(p.id); }}>🗑️</button>
          </div>
        </div>
      ))}
    </>
  );
}
