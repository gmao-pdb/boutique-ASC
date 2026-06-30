import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useConfig, useJoueurs, useStock, addJoueur, updateJoueur, deleteJoueur, stockId } from "../data";
import {
  calc, euro, autoCategorie, ageDe, packPour, defaultSize,
  chequeCount, defaultChequeDates, splitAmount, chequeAmt,
} from "../calc";
import { STATUT_LABEL, type ArticleStatut, type Cheque, type Joueur, type Licence, type PackArticle, type Config } from "../types";

const STATUTS: ArticleStatut[] = ["remis", "alivrer", "arecuperer", "acommander"];

function blankJoueur(cfg: Config): Joueur {
  return {
    id: "", categorie: cfg.categories[0] || "", gardien: false, licence: "",
    nom: "", prenom: "", annee: "", tel: "",
    articles: [], remises: [], reglement: "", cheques: [], regOk: false, regDate: "", commentaires: "",
  };
}

function buildPack(cfg: Config, cat: string, gardien: boolean, licence: Licence, age: number | null, horsStock?: (a: string, t: string) => boolean): PackArticle[] {
  const names = packPour(cfg, cat, gardien).slice();
  if (cfg.sacSiNouvelle && licence === "NOUVEAU") names.unshift("SAC");
  return names.map((nom) => {
    const taille = defaultSize(cfg, nom, age) || "";
    const statut: ArticleStatut = horsStock && horsStock(nom, taille) ? "acommander" : "remis";
    return { article: nom, taille, statut };
  });
}

export default function FicheJoueur() {
  const cfg = useConfig();
  const joueurs = useJoueurs();
  const stock = useStock();
  const nav = useNavigate();
  const { id } = useParams();
  const isNew = id === "new";

  const existing = !isNew && joueurs ? joueurs.find((j) => j.id === id) : null;
  const [draft, setDraft] = useState<Joueur | null>(null);

  // initialise le brouillon une fois config + joueur chargés
  const ready = !!cfg && (isNew || !!existing);
  if (cfg && draft === null) {
    if (isNew) setDraft(blankJoueur(cfg));
    else if (existing) setDraft(JSON.parse(JSON.stringify(existing)));
  }

  const age = useMemo(() => {
    if (!cfg || !draft) return null;
    const y = parseInt(draft.annee, 10);
    return !y || y < 1930 || y > 2099 ? null : ageDe(y, cfg);
  }, [cfg, draft]);

  if (!ready || !cfg || !draft) return <div className="muted" style={{ padding: 20 }}>Chargement…</div>;

  const set = (patch: Partial<Joueur>) => setDraft({ ...draft, ...patch });
  const c = calc(draft, cfg);
  const horsStock = (a: string, t: string) => {
    const s = (stock || []).find((x) => x.id === stockId(a, t));
    return !!s && s.quantite <= 0;
  };
  const buildPackG = (cat: string, gardien: boolean) =>
    buildPack(cfg, cat, gardien, draft.licence, age, horsStock);

  /* ---- catégorie / pack ---- */
  const onAnnee = (v: string) => {
    const y = parseInt(v, 10);
    const next: Partial<Joueur> = { annee: v };
    if (y && y >= 1930 && y <= 2099) {
      const a = ageDe(y, cfg);
      const cat = autoCategorie(y, cfg);
      if (cat) next.categorie = cat;
      if (isNew || draft.articles.length === 0) {
        next.articles = buildPack(cfg, next.categorie ?? draft.categorie, draft.gardien, draft.licence, a, horsStock);
      }
    }
    setDraft({ ...draft, ...next });
  };
  const rechargerPack = () => set({ articles: buildPackG(draft.categorie, draft.gardien) });
  const onGardien = (g: boolean) => {
    const arts = draft.articles.length === 0 || confirm("Recharger le pack (version " + (g ? "gardien" : "joueur") + ") ? Les articles seront remplacés.")
      ? buildPackG(draft.categorie, g) : draft.articles;
    setDraft({ ...draft, gardien: g, articles: arts });
  };
  const onCategorie = (cat: string) => {
    const arts = draft.articles.length === 0 || confirm("Recharger le pack de « " + cat + " » ? Les articles seront remplacés.")
      ? buildPackG(cat, draft.gardien) : draft.articles;
    setDraft({ ...draft, categorie: cat, articles: arts });
  };

  /* ---- licence / sac ---- */
  const onLicence = (lic: Licence) => {
    let arts = draft.articles.slice();
    const wantSac = cfg.sacSiNouvelle && lic === "NOUVEAU";
    const hasSac = arts.some((a) => a.article === "SAC");
    if (wantSac && !hasSac) arts = [{ article: "SAC", taille: "Taille unique", statut: "remis" }, ...arts];
    if (!wantSac && hasSac) arts = arts.filter((a) => a.article !== "SAC");
    setDraft({ ...draft, licence: lic, articles: arts });
  };

  /* ---- articles ---- */
  const setArt = (i: number, patch: Partial<PackArticle>) => {
    const arts = draft.articles.map((a, k) => (k === i ? { ...a, ...patch } : a));
    set({ articles: arts });
  };
  const bumpTaille = (i: number, dir: number) => {
    const cat = cfg.catalogue.find((x) => x.nom === draft.articles[i].article);
    if (!cat || !cat.tailles.length) return;
    let idx = cat.tailles.indexOf(draft.articles[i].taille);
    if (idx < 0) idx = dir > 0 ? -1 : cat.tailles.length;
    idx = Math.max(0, Math.min(cat.tailles.length - 1, idx + dir));
    setArt(i, { taille: cat.tailles[idx] });
  };
  const bumpAll = (dir: number) => set({ articles: draft.articles.map((a) => {
    const cat = cfg.catalogue.find((x) => x.nom === a.article);
    if (!cat || !cat.tailles.length) return a;
    let idx = cat.tailles.indexOf(a.taille); if (idx < 0) idx = dir > 0 ? -1 : cat.tailles.length;
    idx = Math.max(0, Math.min(cat.tailles.length - 1, idx + dir));
    return { ...a, taille: cat.tailles[idx] };
  }) });
  const tousStatut = (s: ArticleStatut) => set({ articles: draft.articles.map((a) => ({ ...a, statut: s })) });

  /* ---- remises ---- */
  const toggleRemise = (nom: string) => {
    const has = draft.remises.includes(nom);
    set({ remises: has ? draft.remises.filter((r) => r !== nom) : [...draft.remises, nom] });
  };

  /* ---- règlement ---- */
  const onReglement = (m: string) => {
    const n = chequeCount(m);
    if (n > 0) {
      const dates = defaultChequeDates(n);
      const montants = splitAmount(c.total, n);
      const cheques: Cheque[] = Array.from({ length: n }, (_, i) => ({ datePrev: dates[i], montant: montants[i], recup: false, enc: false }));
      setDraft({ ...draft, reglement: m, cheques, regOk: false });
    } else {
      setDraft({ ...draft, reglement: m, cheques: [], regOk: false });
    }
  };
  const setCheque = (i: number, patch: Partial<Cheque>) =>
    set({ cheques: draft.cheques.map((ch, k) => (k === i ? { ...ch, ...patch } : ch)) });
  const equilibrer = (i: number) => {
    const n = chequeCount(draft.reglement);
    let autres = 0;
    draft.cheques.forEach((ch, k) => { if (k !== i) autres += chequeAmt(ch, c.total, n); });
    setCheque(i, { montant: Math.max(0, c.total - autres) });
  };
  const sommeCheques = draft.cheques.reduce((s, ch) => s + chequeAmt(ch, c.total, chequeCount(draft.reglement)), 0);

  /* ---- enregistrer ---- */
  const enregistrer = async () => {
    if (!draft.nom.trim()) { alert("Le nom est obligatoire."); return; }
    const payload: Partial<Joueur> = { ...draft, nom: draft.nom.trim(), prenom: draft.prenom.trim() };
    delete payload.id;
    if (isNew) await addJoueur(payload as Omit<Joueur, "id">);
    else await updateJoueur(draft.id, payload);
    nav("/");
  };
  const supprimer = async () => {
    if (confirm("Supprimer ce joueur ?")) { await deleteJoueur(draft.id); nav("/"); }
  };

  const n = chequeCount(draft.reglement);

  return (
    <div className="fiche">
      <div className="fiche-top">
        <button className="lnk" onClick={() => nav(-1)}>← Retour</button>
        <b>{isNew ? "Nouveau joueur" : draft.nom + " " + draft.prenom}</b>
      </div>

      <label>Date de naissance</label>
      <input type="date" value={draft.annee} onChange={(e) => onAnnee(e.target.value)} />
      {age != null && <div className="hint vert">🎂 {age} ans → {draft.categorie}{draft.gardien ? " · 🧤 pack gardien" : ""}</div>}

      <label>Catégorie</label>
      <select value={draft.categorie} onChange={(e) => onCategorie(e.target.value)}>
        {cfg.categories.map((c2) => <option key={c2} value={c2}>{c2}</option>)}
      </select>
      <label className="check"><input type="checkbox" checked={draft.gardien} onChange={(e) => onGardien(e.target.checked)} /> 🧤 Gardien (pack spécial)</label>

      <label>Type de licence</label>
      <select value={draft.licence} onChange={(e) => onLicence(e.target.value as Licence)}>
        <option value="">—</option>
        <option value="NOUVEAU">NOUVEAU</option>
        <option value="RENOUV.">RENOUV.</option>
        <option value="LICENCE">LICENCE seule (vétérans)</option>
      </select>

      <div className="grid2">
        <div><label>Nom</label><input value={draft.nom} onChange={(e) => set({ nom: e.target.value })} /></div>
        <div><label>Prénom</label><input value={draft.prenom} onChange={(e) => set({ prenom: e.target.value })} /></div>
      </div>
      <label>Téléphone</label>
      <input type="tel" value={draft.tel} onChange={(e) => set({ tel: e.target.value })} />

      {/* PACK */}
      <h3 className="sec">Pack à remettre</h3>
      {draft.articles.map((a, i) => (
        <div key={i} className={"art" + (a.statut !== "remis" ? " off" : "")}>
          <div className="art-l1">
            <select className="art-name" value={a.article} onChange={(e) => setArt(i, { article: e.target.value, taille: defaultSize(cfg, e.target.value, age) || "" })}>
              {cfg.catalogue.map((cat) => <option key={cat.nom} value={cat.nom}>{cat.nom}</option>)}
            </select>
            <button className="szb" onClick={() => bumpTaille(i, -1)}>−</button>
            <select className="art-size" value={a.taille} onChange={(e) => setArt(i, { taille: e.target.value })}>
              <option value="">taille ?</option>
              {(cfg.catalogue.find((cat) => cat.nom === a.article)?.tailles || []).map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
            <button className="szb" onClick={() => bumpTaille(i, 1)}>+</button>
          </div>
          <div className="art-l2">
            <select className="art-stat" value={a.statut} onChange={(e) => setArt(i, { statut: e.target.value as ArticleStatut })}>
              {STATUTS.map((s) => <option key={s} value={s}>{STATUT_LABEL[s]}</option>)}
            </select>
            <input className="art-motif" placeholder="commentaire…" value={a.motif || ""} onChange={(e) => setArt(i, { motif: e.target.value })} />
          </div>
        </div>
      ))}
      <div className="row-btns">
        <button className="mini" onClick={() => bumpAll(-1)}>▾ Tailles −</button>
        <button className="mini" onClick={() => bumpAll(1)}>▴ Tailles +</button>
        <button className="mini" onClick={() => tousStatut("remis")}>✅ Tout remis</button>
        <button className="mini" onClick={rechargerPack}>↻ Recharger</button>
      </div>

      {/* REMISES */}
      <h3 className="sec">Remises</h3>
      <div className="checks-row">
        {cfg.remises.map((r) => (
          <label key={r.nom} className="check"><input type="checkbox" checked={draft.remises.includes(r.nom)} onChange={() => toggleRemise(r.nom)} /> {r.nom} (−{r.montant} €)</label>
        ))}
      </div>

      {/* REGLEMENT */}
      <h3 className="sec">Règlement</h3>
      <select value={draft.reglement} onChange={(e) => onReglement(e.target.value)}>
        <option value="">— mode —</option>
        {cfg.reglements.map((r) => <option key={r} value={r}>{r}</option>)}
      </select>

      {n > 0 && (
        <div className="paybox">
          {draft.cheques.map((ch, i) => (
            <div key={i} className="chq">
              <label className="check"><input type="checkbox" checked={ch.recup} onChange={(e) => setCheque(i, { recup: e.target.checked })} /> Chèque {i + 1} récupéré</label>
              <div className="chq-l2">
                <span className="dt">Prévu <input type="date" value={ch.datePrev} onChange={(e) => setCheque(i, { datePrev: e.target.value })} /></span>
                <span className="mt"><input type="number" value={chequeAmt(ch, c.total, n)} onChange={(e) => setCheque(i, { montant: Math.max(0, Math.round(+e.target.value || 0)) })} /> €</span>
                <button className="mini" onClick={() => equilibrer(i)}>=</button>
                <label className="check"><input type="checkbox" checked={ch.enc} onChange={(e) => setCheque(i, { enc: e.target.checked })} /> encaissé</label>
              </div>
            </div>
          ))}
          <div className={"somme " + (sommeCheques === c.total ? "ok" : "ko")}>
            Somme chèques : {euro(sommeCheques)} / {euro(c.total)} {sommeCheques === c.total ? "✅" : "⚠️ écart " + euro(c.total - sommeCheques)}
          </div>
        </div>
      )}
      {n === 0 && draft.reglement && draft.reglement !== "NON RÉGLÉ" && (
        <div className="paybox">
          <label className="check"><input type="checkbox" checked={draft.regOk} onChange={(e) => set({ regOk: e.target.checked })} /> Paiement effectué / encaissé</label>
          <span className="dt">le <input type="date" value={draft.regDate} onChange={(e) => set({ regDate: e.target.value })} /></span>
        </div>
      )}

      <label>Commentaires</label>
      <textarea rows={2} value={draft.commentaires} onChange={(e) => set({ commentaires: e.target.value })} />

      <div className="recap">Total : <b>{euro(c.total)}</b> · Reste dû : <b style={{ color: c.reste > 0 ? "var(--rouge)" : "var(--vert)" }}>{euro(c.reste)}</b></div>

      <button className="btn-primary" onClick={() => void enregistrer()}>Enregistrer</button>
      {!isNew && <button className="btn-danger" onClick={() => void supprimer()}>Supprimer ce joueur</button>}
    </div>
  );
}
