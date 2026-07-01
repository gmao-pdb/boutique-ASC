import { addJoueur } from "./data";
import { autoCategorie, packPour, tailleAuto, chequeCount, defaultChequeDates, splitAmount } from "./calc";
import type { Config, Joueur, PackArticle, Cheque } from "./types";

const PRENOMS = ["Lucas", "Léo", "Gabriel", "Louis", "Raphaël", "Jules", "Adam", "Maël", "Ethan", "Nathan", "Tom", "Hugo", "Arthur", "Noah", "Sacha", "Paul", "Enzo", "Théo", "Emma", "Jade", "Louise", "Alice", "Chloé", "Lina", "Mila", "Léa", "Manon", "Inès", "Sarah", "Zoé", "Anna", "Camille", "Eva", "Nina", "Antò", "Petru", "Ghjuvan"];
const NOMS = ["Martin", "Dubois", "Petit", "Durand", "Leroy", "Moreau", "Simon", "Laurent", "Michel", "Garcia", "Bertrand", "Roux", "Vincent", "Morel", "Girard", "Paoli", "Rossi", "Santini", "Colombani", "Luciani", "Mariani", "Giudicelli", "Casanova", "Franceschi", "Orsini", "Leca", "Poli", "Simeoni", "Grimaldi", "Ottavi"];

const pick = <T,>(a: T[]): T => a[Math.floor(Math.random() * a.length)];
const chance = (p: number) => Math.random() < p;
const pad = (n: number) => String(n).padStart(2, "0");
const today = () => { const d = new Date(); return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); };

export async function genererJoueursTest(cfg: Config, n: number, onProgress?: (i: number) => void) {
  const start = parseInt((cfg.saison.match(/\d{4}/) || [String(new Date().getFullYear())])[0], 10);
  const tasks: Promise<unknown>[] = [];
  for (let i = 0; i < n; i++) {
    const age = 4 + Math.floor(Math.random() * 42); // 4 à 45 ans
    const year = start - age;
    const annee = year + "-" + pad(1 + Math.floor(Math.random() * 12)) + "-" + pad(1 + Math.floor(Math.random() * 28));
    const categorie = autoCategorie(year, cfg) || pick(cfg.categories);
    const gardien = chance(0.12);
    const vetEduc = /VETERAN|EDUCATEUR/i.test(categorie);
    const licence: Joueur["licence"] = vetEduc && chance(0.5) ? "LICENCE" : chance(0.5) ? "NOUVEAU" : "RENOUV.";

    const names = packPour(cfg, categorie, gardien).slice();
    if (cfg.sacSiNouvelle && licence === "NOUVEAU") names.unshift("SAC");
    const articles: PackArticle[] = names.map((nom) => ({ article: nom, taille: tailleAuto(cfg, nom, age) || "", statut: chance(0.75) ? "remis" : "differe" }));

    const remises = cfg.remises.filter(() => chance(0.15)).map((r) => r.nom);
    const base = cfg.tarifs[licence] || 0;
    const remiseTot = remises.reduce((s, nm) => { const r = cfg.remises.find((x) => x.nom === nm); return s + (r ? r.montant : 0); }, 0);
    const total = Math.max(0, base - remiseTot);

    const reglement = pick(cfg.reglements);
    const nc = chequeCount(reglement);
    let cheques: Cheque[] = [], regOk = false, regDate = "";
    if (nc > 0) {
      const dates = defaultChequeDates(nc), mont = splitAmount(total, nc);
      cheques = Array.from({ length: nc }, (_, k) => { const recup = chance(0.8); const enc = recup && chance(0.6); return { montant: mont[k], datePrev: dates[k], dateRecup: recup ? dates[0] : "", recup, enc }; });
    } else if (reglement && reglement !== "NON RÉGLÉ") {
      regOk = chance(0.7); regDate = regOk ? today() : "";
    }

    const j: Omit<Joueur, "id"> = {
      categorie, gardien, licence, nom: pick(NOMS), prenom: pick(PRENOMS),
      annee, tel: "06" + (10000000 + Math.floor(Math.random() * 89999999)), articles, remises,
      reglement, cheques, regOk, regDate, commentaires: "", test: true,
      ...(chance(0.05) ? { supprDemandee: true, supprPar: "test", supprLe: Date.now() } : {}),
    };
    tasks.push(addJoueur(j));
    if (onProgress) onProgress(i + 1);
  }
  await Promise.all(tasks);
}
