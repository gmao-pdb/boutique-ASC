// Modèle de données — Boutique AS Casinca

export type Licence = "" | "NOUVEAU" | "RENOUV." | "LICENCE";

// Cycle d'un article du pack
export type ArticleStatut = "remis" | "alivrer" | "arecuperer" | "acommander";
export const STATUT_LABEL: Record<ArticleStatut, string> = {
  remis: "✅ Remis",
  alivrer: "📦 À livrer",
  arecuperer: "🚚 À récupérer",
  acommander: "🛒 À commander",
};

export interface PackArticle {
  article: string;
  taille: string;
  statut: ArticleStatut;
  motif?: string;
}

export interface Cheque {
  montant?: number;
  datePrev: string;
  recup: boolean;
  enc: boolean;
}

export interface Joueur {
  id: string;
  categorie: string;
  gardien: boolean;
  licence: Licence;
  nom: string;
  prenom: string;
  annee: string;
  tel: string;
  articles: PackArticle[];
  remises: string[];
  reglement: string;
  cheques: Cheque[];
  regOk: boolean;
  regDate: string;
  commentaires: string;
  gabarit?: string; // gabarit de taille choisi
  createdAt?: number;
  updatedAt?: number;
}

export interface Remise { nom: string; montant: number; }
export interface CatalogueItem { nom: string; tailles: string[]; }

// Gabarit = une ligne de la grille de correspondance des tailles.
// valeurs : pour chaque système (colonne), la taille équivalente.
export interface Gabarit {
  label: string;
  ageMax: number | null; // âge max pour l'auto-sélection (null = adulte / pas d'âge)
  valeurs: Record<string, string>;
}

export interface Config {
  saison: string;
  tarifs: Record<string, number>; // NOUVEAU / RENOUV. / LICENCE
  sacSiNouvelle: boolean;
  remises: Remise[];
  categories: string[];
  reglements: string[];
  catalogue: CatalogueItem[];
  packs: Record<string, string[]>;
  packsGardien: Record<string, string[]>;
  systemes: string[]; // colonnes de la grille, ex. Âge / Tranche / Lettre / Combiné / Unique
  gabarits: Gabarit[];
}

// Pré-inscription déposée par la personne via le QR (formulaire public)
export interface Preinscription {
  id: string;
  nom: string;
  prenom: string;
  annee: string; // date de naissance (ISO)
  tel: string;
  gardien: boolean;
  categorie: string;
  articles: { article: string; taille: string }[];
  createdAt?: number;
}

// Stock : une entrée par article + taille
export interface StockItem {
  id: string; // `${article}__${taille}`
  article: string;
  taille: string;
  quantite: number;
  seuilMini: number;
}
