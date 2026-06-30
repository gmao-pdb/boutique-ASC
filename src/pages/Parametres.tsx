import { useState } from "react";
import { useConfig, saveConfig, addJoueur } from "../data";
import type { ArticleStatut, Config, Joueur } from "../types";

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

// Conversion ancienne catégorie gardien -> catégorie de champ
function champCat(cat: string, categories: string[]): string {
  if (/SENIOR/i.test(cat)) return categories.find((c) => /SENIOR/i.test(c)) || cat;
  if (/FEMININ/i.test(cat)) return categories.find((c) => /FEMININ/i.test(c)) || cat;
  const nums = [...cat.matchAll(/U\s*(\d+)/gi)].map((m) => +m[1]);
  if (nums.length) {
    const mx = Math.max(...nums);
    const cand = categories.map((c) => { const n = [...c.matchAll(/U\s*(\d+)/gi)].map((m) => +m[1]); return { name: c, max: n.length ? Math.max(...n) : null }; }).filter((x) => x.max != null) as { name: string; max: number }[];
    const up = cand.filter((x) => x.max >= mx).sort((a, b) => a.max - b.max)[0];
    if (up) return up.name;
  }
  return categories[0] || cat;
}

interface VieuxJoueur { categorie?: string; gardien?: boolean; licence?: string; nom?: string; prenom?: string; annee?: string; tel?: string; articles?: { article: string; taille?: string; statut?: string; motif?: string }[]; remises?: string[]; reglement?: string; cheques?: { montant?: number; datePrev?: string; date?: string; recup?: boolean; pris?: boolean; enc?: boolean }[]; regOk?: boolean; regDate?: string; commentaires?: string; }

function mapJoueur(o: VieuxJoueur, categories: string[]): Omit<Joueur, "id"> {
  let categorie = o.categorie || "";
  let gardien = !!o.gardien;
  if (/GARDIEN/i.test(categorie)) { gardien = true; categorie = champCat(categorie, categories); }
  return {
    categorie, gardien, licence: (o.licence as Joueur["licence"]) || "",
    nom: o.nom || "", prenom: o.prenom || "", annee: o.annee || "", tel: o.tel || "",
    articles: (o.articles || []).map((a) => ({ article: a.article, taille: a.taille || "", statut: (a.statut === "differe" ? "acommander" : a.statut || "remis") as ArticleStatut, motif: a.motif || "" })),
    remises: o.remises || [],
    reglement: o.reglement || "",
    cheques: (o.cheques || []).map((ch) => ({ montant: ch.montant, datePrev: ch.datePrev || ch.date || "", recup: !!(ch.recup ?? ch.pris), enc: !!ch.enc })),
    regOk: !!o.regOk, regDate: o.regDate || "", commentaires: o.commentaires || "",
  };
}

export default function Parametres() {
  const cfg = useConfig();
  const [draft, setDraft] = useState<Config | null>(null);
  const [txt, setTxt] = useState<Record<string, string>>({});
  const [importMsg, setImportMsg] = useState("");

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

  const importer = async (file: File) => {
    try {
      const o = JSON.parse(await file.text()) as { data?: VieuxJoueur[] };
      if (!Array.isArray(o.data)) { setImportMsg("Fichier invalide (pas de 'data')."); return; }
      if (!confirm("Importer " + o.data.length + " joueur(s) ? Ils s'ajoutent aux joueurs existants.")) return;
      let n = 0;
      for (const vj of o.data) { await addJoueur(mapJoueur(vj, cfg!.categories)); n++; }
      setImportMsg("✔ " + n + " joueur(s) importé(s).");
    } catch {
      setImportMsg("Erreur de lecture du fichier.");
    }
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

      <h3 className="sec">Importer l'ancienne appli</h3>
      <p className="muted" style={{ fontSize: 13, marginTop: 0 }}>Charge le fichier de sauvegarde <code>.json</code> de l'ancienne appli HTML. Les joueurs sont ajoutés (anciens gardiens et statuts convertis automatiquement).</p>
      <input type="file" accept=".json" onChange={(e) => { const f = e.target.files?.[0]; if (f) void importer(f); e.target.value = ""; }} />
      {importMsg && <div className="hint vert" style={{ marginTop: 8 }}>{importMsg}</div>}
    </div>
  );
}
