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
  createdAt?: number;
  updatedAt?: number;
}

export interface Remise { nom: string; montant: number; }
export interface CatalogueItem { nom: string; tailles: string[]; }

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
}

// Stock : une entrée par article + taille
export interface StockItem {
  id: string; // `${article}__${taille}`
  article: string;
  taille: string;
  quantite: number;
  seuilMini: number;
}
