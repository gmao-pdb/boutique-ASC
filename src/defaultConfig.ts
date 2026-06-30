import type { Config, CatalogueItem, Gabarit } from "./types";

// Packs par catégorie (repris de l'appli existante)
const PK_JEUNE = ["VESTE JOGGING", "PANTALON JOGGING", "PULL", "SHORT DE MATCH", "MAILLOT MATCH", "BRAMA JAUNE", "CHAUSSETTES VERTES"];
const PK_U12 = ["VESTE JOGGING", "PANTALON JOGGING", "PULL", "SHORT DE MATCH", "POLO VERT MATCH", "BRAMA JAUNE", "CHAUSSETTES VERTES"];
const PK_GARDJ = ["VESTE JOGGING", "PANTALON JOGGING", "PULL", "SHORT NOIR", "TEE-SHIRT NOIR", "BRAMA NOIR", "CHAUSSETTES NOIRES"];
const PK_GARD12 = ["VESTE JOGGING", "PANTALON JOGGING", "PULL", "SHORT ROUGE", "TEE-SHIRT ROUGE", "BRAMA NOIR", "CHAUSSETTES ROUGES"];
const PK_GRAND = ["VESTE JOGGING", "PANTALON JOGGING", "PULL", "SHORT DE MATCH", "SHORT ENTRAINEMENT", "TEE-SHIRT ENTRAINEMENT", "SHORT DE SORTIE", "POLO VERT MATCH", "BRAMA JAUNE", "CHAUSSETTES VERTES"];
const PK_GARDG = ["VESTE JOGGING", "PANTALON JOGGING", "PULL", "SHORT ROUGE", "TEE-SHIRT ROUGE", "SHORT DE SORTIE", "POLO VERT", "BRAMA NOIR", "CHAUSSETTES ROUGES"];
const PK_FUTNET = ["VESTE JOGGING", "PANTALON JOGGING", "DOUDOUNE", "SHORT DE MATCH", "TEE-SHIRT ENTRAINEMENT", "SHORT DE SORTIE", "BRAMA JAUNE", "CHAUSSETTES COURTES"];
const PK_EDUC = ["JOGGING NOIR EDUC.", "SHORT NOIR JAUNE", "TEE-SHIRT NOIR", "TEE-SHIRT NOIR 2", "POLO NOIR", "CHAUSSETTES NOIRES"];

const A = ["4 ans", "6 ans", "8 ans", "10 ans", "12 ans", "XS", "S", "M", "L", "XL", "XXL"];
const B = ["4-6 ans", "8-10 ans", "12-14 ans", "S-M", "L-XL"];
const C = ["S", "M", "L"];
const MM = ["4-6 ans", "8 ans", "10 ans", "12 ans", "XS", "S", "M", "L", "XL"];
const P = ["XS", "S", "M", "L", "XL", "XXL"];
const D = ["S", "M", "L", "XL", "XXL"];

const catalogue: CatalogueItem[] = [
  { nom: "SAC", tailles: ["Taille unique"] },
  { nom: "VESTE JOGGING", tailles: A }, { nom: "PANTALON JOGGING", tailles: A }, { nom: "PULL", tailles: A },
  { nom: "SHORT DE MATCH", tailles: A }, { nom: "SHORT ENTRAINEMENT", tailles: A }, { nom: "SHORT DE SORTIE", tailles: A },
  { nom: "SHORT NOIR", tailles: A }, { nom: "SHORT ROUGE", tailles: A }, { nom: "SHORT NOIR JAUNE", tailles: A },
  { nom: "MAILLOT MATCH", tailles: MM },
  { nom: "POLO VERT MATCH", tailles: P }, { nom: "POLO VERT", tailles: P }, { nom: "POLO NOIR", tailles: P },
  { nom: "TEE-SHIRT ENTRAINEMENT", tailles: A }, { nom: "TEE-SHIRT NOIR", tailles: A }, { nom: "TEE-SHIRT NOIR 2", tailles: A }, { nom: "TEE-SHIRT ROUGE", tailles: A },
  { nom: "BRAMA JAUNE", tailles: B }, { nom: "BRAMA NOIR", tailles: B },
  { nom: "CHAUSSETTES VERTES", tailles: C }, { nom: "CHAUSSETTES NOIRES", tailles: C }, { nom: "CHAUSSETTES ROUGES", tailles: C }, { nom: "CHAUSSETTES COURTES", tailles: C },
  { nom: "DOUDOUNE", tailles: D }, { nom: "JOGGING NOIR EDUC.", tailles: A },
];

const SYSTEMES = ["Âge", "Tranche", "Lettre", "Combiné", "Unique"];
const g = (label: string, ageMax: number | null, age: string, tr: string, lt: string, cb: string): Gabarit => ({
  label, ageMax, valeurs: { "Âge": age, "Tranche": tr, "Lettre": lt, "Combiné": cb, "Unique": "Taille unique" },
});
const GABARITS: Gabarit[] = [
  g("4 ans", 5, "4 ans", "4-6 ans", "XS", "S-M"),
  g("6 ans", 7, "6 ans", "4-6 ans", "XS", "S-M"),
  g("8 ans", 9, "8 ans", "8-10 ans", "S", "S-M"),
  g("10 ans", 11, "10 ans", "8-10 ans", "S", "S-M"),
  g("12 ans", 13, "12 ans", "12-14 ans", "M", "L-XL"),
  g("Ado", 16, "12 ans", "12-14 ans", "M", "L-XL"),
  g("Adulte S", null, "", "", "S", "S-M"),
  g("Adulte M", null, "", "", "M", "L-XL"),
  g("Adulte L", null, "", "", "L", "L-XL"),
  g("Adulte XL", null, "", "", "XL", "L-XL"),
];

export const DEFAULT_CONFIG: Config = {
  saison: "2025-2026",
  tarifs: { NOUVEAU: 250, "RENOUV.": 120, LICENCE: 80 },
  sacSiNouvelle: true,
  remises: [
    { nom: "Passi Sporti", montant: 60 },
    { nom: "État", montant: 70 },
    { nom: "Fratrie", montant: 15 },
  ],
  categories: ["BABIES", "U6 - U7", "U8 - U9", "U10 - U11", "U12 - U13", "U14", "U16", "U18", "SENIORS", "FEMININES", "FUTNET", "VETERANS", "EDUCATEURS"],
  reglements: ["ESPECES", "1 CHEQUE", "3 CHEQUES", "4 CHEQUES", "5 CHEQUES", "CB", "VIREMENT", "AUTRE", "NON RÉGLÉ"],
  catalogue,
  packs: {
    BABIES: PK_JEUNE, "U6 - U7": PK_JEUNE, "U8 - U9": PK_JEUNE, "U10 - U11": PK_JEUNE,
    "U12 - U13": PK_U12, U14: PK_GRAND, U16: PK_GRAND, U18: PK_GRAND,
    SENIORS: PK_GRAND, FEMININES: PK_GRAND, FUTNET: PK_FUTNET, VETERANS: PK_GRAND, EDUCATEURS: PK_EDUC,
  },
  packsGardien: {
    "U8 - U9": PK_GARDJ, "U10 - U11": PK_GARDJ, "U12 - U13": PK_GARD12,
    U14: PK_GARDG, U16: PK_GARDG, U18: PK_GARDG, SENIORS: PK_GARDG, FEMININES: PK_GARDG, VETERANS: PK_GARDG,
  },
  systemes: SYSTEMES,
  gabarits: GABARITS,
};
