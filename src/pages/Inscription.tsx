import { useState } from "react";
import { useConfig, addPreinscription } from "../data";
import { autoCategorie, ageDe, packPour, tailleAuto } from "../calc";
import Icon from "../Icon";

export default function Inscription() {
  const cfg = useConfig();
  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [date, setDate] = useState("");
  const [tel, setTel] = useState("");
  const [gardien, setGardien] = useState(false);
  const [articles, setArticles] = useState<{ article: string; taille: string }[]>([]);
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  if (!cfg) return <div className="full-center muted">Chargement…</div>;

  const y = parseInt(date, 10);
  const age = y >= 1930 && y <= 2099 ? ageDe(y, cfg) : null;
  const categorie = age != null ? autoCategorie(y, cfg) : "";

  const rebuild = (d: string, g: boolean) => {
    const yy = parseInt(d, 10);
    const a = yy >= 1930 && yy <= 2099 ? ageDe(yy, cfg) : null;
    const cat = a != null ? autoCategorie(yy, cfg) : "";
    const names = cat ? packPour(cfg, cat, g) : [];
    setArticles(names.map((n) => ({ article: n, taille: tailleAuto(cfg, n, a) || "" })));
  };
  const onDate = (v: string) => { setDate(v); rebuild(v, gardien); };
  const onGardien = (g: boolean) => { setGardien(g); rebuild(date, g); };
  const setTaille = (i: number, v: string) => setArticles(articles.map((a, k) => (k === i ? { ...a, taille: v } : a)));

  const envoyer = async () => {
    if (!nom.trim() || !date) { alert("Indique au moins ton nom et ta date de naissance."); return; }
    setBusy(true);
    try {
      await addPreinscription({ nom: nom.trim(), prenom: prenom.trim(), annee: date, tel: tel.trim(), gardien, categorie, articles });
      setSent(true);
    } catch {
      alert("Envoi impossible. Vérifie ta connexion et réessaie.");
    } finally { setBusy(false); }
  };

  if (sent) return (
    <div className="login-wrap">
      <div className="login-card">
        <div className="login-logo">ASC</div>
        <h1>Merci {prenom || nom} !</h1>
        <p className="muted">Ta demande est bien enregistrée. Le règlement, la validation et la récupération du pack se feront directement à la boutique — on a déjà toutes tes infos. Merci de nous aider à préparer la saison ! <Icon name="heart" size={15} className="ico-svg" style={{ color: "var(--jaune)" }} /><Icon name="heart" size={15} className="ico-svg" style={{ color: "var(--vert)" }} /></p>
      </div>
    </div>
  );

  return (
    <div className="inscription">
      <header className="app-header">
        <div className="logo">ASC</div>
        <div><h1>Pré-inscription boutique</h1><div className="sub">AS Casinca · saison {cfg.saison}</div></div>
      </header>
      <div className="app-main">
        <p className="muted" style={{ marginTop: 0 }}>Remplis tes infos et choisis tes tailles pour nous faire gagner du temps. Le règlement, la validation et la récupération du pack se font ensuite directement à la boutique.</p>

        <div className="grid2">
          <div><label>Nom</label><input value={nom} onChange={(e) => setNom(e.target.value)} /></div>
          <div><label>Prénom</label><input value={prenom} onChange={(e) => setPrenom(e.target.value)} /></div>
        </div>
        <label>Date de naissance</label>
        <input type="date" value={date} onChange={(e) => onDate(e.target.value)} />
        <label>Téléphone</label>
        <input type="tel" value={tel} onChange={(e) => setTel(e.target.value)} />
        <label className="check"><input type="checkbox" checked={gardien} onChange={(e) => onGardien(e.target.checked)} /> <Icon name="shield" size={15} className="ico-svg" /> Je suis gardien(ne)</label>

        {categorie && <div className="hint vert" style={{ marginTop: 10 }}>Catégorie : {categorie}{age != null ? " · " + age + " ans" : ""}</div>}

        {articles.length > 0 && (
          <>
            <h3 className="sec">Choisis tes tailles</h3>
            {articles.map((a, i) => {
              const cat = cfg.catalogue.find((c) => c.nom === a.article);
              return (
                <div className="ins-art" key={i}>
                  <span className="ins-name">{a.article}</span>
                  <select value={a.taille} onChange={(e) => setTaille(i, e.target.value)}>
                    <option value="">taille ?</option>
                    {(cat?.tailles || []).map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              );
            })}
          </>
        )}

        <button className="btn-primary" disabled={busy} onClick={() => void envoyer()}>{busy ? "Envoi…" : "Envoyer ma demande"}</button>
        <div style={{ height: 30 }} />
      </div>
    </div>
  );
}
