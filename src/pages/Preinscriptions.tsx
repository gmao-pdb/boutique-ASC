import { useNavigate } from "react-router-dom";
import { usePreinscriptions, deletePreinscription, addJoueur } from "../data";
import type { Joueur, PackArticle, Preinscription } from "../types";

export default function Preinscriptions() {
  const list = usePreinscriptions();
  const nav = useNavigate();
  if (!list) return <div className="muted" style={{ padding: 20 }}>Chargement…</div>;

  const valider = async (p: Preinscription) => {
    const articles: PackArticle[] = (p.articles || []).map((a) => ({ article: a.article, taille: a.taille, statut: "remis" }));
    const joueur: Omit<Joueur, "id"> = {
      categorie: p.categorie, gardien: p.gardien, licence: "",
      nom: p.nom, prenom: p.prenom, annee: p.annee, tel: p.tel,
      articles, remises: [], reglement: "", cheques: [], regOk: false, regDate: "", commentaires: "",
    };
    const ref = await addJoueur(joueur);
    await deletePreinscription(p.id);
    nav("/joueur/" + ref.id);
  };

  return (
    <>
      <h2 style={{ margin: "4px 0 12px" }}>Pré-inscriptions à valider</h2>
      {list.length === 0 && <div className="card muted">Aucune pré-inscription en attente.</div>}
      {list
        .slice()
        .sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0))
        .map((p) => (
          <div key={p.id} className="card">
            <div style={{ fontSize: 16 }}><b>{p.nom}</b> {p.prenom} {p.gardien ? "🧤" : ""}</div>
            <div className="muted" style={{ fontSize: 13, margin: "2px 0 8px" }}>
              {p.categorie || "—"} · né(e) {p.annee || "?"} · {p.tel || "sans tél."} · {(p.articles || []).length} article(s)
            </div>
            <div className="muted" style={{ fontSize: 12 }}>{(p.articles || []).map((a) => a.article + (a.taille ? " (" + a.taille + ")" : "")).join(", ")}</div>
            <div className="aa-foot" style={{ marginTop: 10 }}>
              <button className="btn-primary" style={{ width: "auto", marginTop: 0, padding: "10px 16px", flex: 1 }} onClick={() => void valider(p)}>✓ Valider</button>
              <button className="lnk-danger" onClick={() => { if (confirm("Ignorer cette demande ?")) void deletePreinscription(p.id); }}>Supprimer</button>
            </div>
          </div>
        ))}
    </>
  );
}
