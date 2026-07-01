import { useEffect, useState } from "react";
import { collection, doc, onSnapshot, setDoc, addDoc, updateDoc, deleteDoc, getDoc, getDocs } from "firebase/firestore";
import { db } from "./firebase";
import { DEFAULT_CONFIG } from "./defaultConfig";
import type { Config, Joueur, StockItem, Preinscription, Role } from "./types";

const configRef = doc(db, "config", "main");

export function useConfig(): Config | null {
  const [config, setConfig] = useState<Config | null>(null);
  useEffect(() => {
    return onSnapshot(configRef, (snap) => {
      if (snap.exists()) {
        const c = snap.data() as Config;
        // complète les champs ajoutés après coup (config déjà en base)
        if (!c.systemes || !c.systemes.length) c.systemes = DEFAULT_CONFIG.systemes;
        if (!c.gabarits || !c.gabarits.length) c.gabarits = DEFAULT_CONFIG.gabarits;
        // assure la présence du mode "2 CHEQUES" (ajouté après coup)
        if (c.reglements && !c.reglements.includes("2 CHEQUES")) {
          const i = c.reglements.indexOf("1 CHEQUE");
          c.reglements = i >= 0
            ? [...c.reglements.slice(0, i + 1), "2 CHEQUES", ...c.reglements.slice(i + 1)]
            : [...c.reglements, "2 CHEQUES"];
        }
        setConfig(c);
      } else void setDoc(configRef, DEFAULT_CONFIG); // 1ère fois : on sème la config par défaut
    });
  }, []);
  return config;
}
export async function saveConfig(cfg: Config) {
  await setDoc(configRef, cfg);
}
// Met à jour seulement certains champs de la config (évite d'écraser le reste)
export async function patchConfig(partial: Partial<Config>) {
  await updateDoc(configRef, partial as Record<string, unknown>);
}

export function useJoueurs(): Joueur[] | null {
  const [joueurs, setJoueurs] = useState<Joueur[] | null>(null);
  useEffect(() => {
    return onSnapshot(collection(db, "joueurs"), (snap) => {
      setJoueurs(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Joueur, "id">) })));
    });
  }, []);
  return joueurs;
}
export async function addJoueur(j: Omit<Joueur, "id">) {
  return addDoc(collection(db, "joueurs"), { ...j, createdAt: Date.now(), updatedAt: Date.now() });
}
export async function updateJoueur(id: string, j: Partial<Joueur>) {
  await updateDoc(doc(db, "joueurs", id), { ...j, updatedAt: Date.now() });
}
export async function deleteJoueur(id: string) {
  await deleteDoc(doc(db, "joueurs", id));
}

/* ---------- Stock ---------- */
export const stockId = (article: string, taille: string) => (article + "__" + taille).replace(/\//g, "-");

export function useStock(): StockItem[] | null {
  const [stock, setStock] = useState<StockItem[] | null>(null);
  useEffect(() => {
    return onSnapshot(collection(db, "stock"), (snap) => {
      setStock(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<StockItem, "id">) })));
    });
  }, []);
  return stock;
}
export async function setStockItem(article: string, taille: string, patch: Partial<StockItem>) {
  const id = stockId(article, taille);
  await setDoc(doc(db, "stock", id), { article, taille, quantite: 0, seuilMini: 0, ...patch, id }, { merge: true });
}
export async function enregistrerInventaire(lignes: { article: string; taille: string; quantite: number }[]) {
  await addDoc(collection(db, "inventaires"), { date: new Date().toISOString(), lignes });
}

/* ---------- Pré-inscriptions (formulaire public via QR) ---------- */
export function usePreinscriptions(): Preinscription[] | null {
  const [list, setList] = useState<Preinscription[] | null>(null);
  useEffect(() => {
    return onSnapshot(collection(db, "preinscriptions"), (snap) => {
      setList(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Preinscription, "id">) })));
    });
  }, []);
  return list;
}
export async function addPreinscription(p: Omit<Preinscription, "id">) {
  return addDoc(collection(db, "preinscriptions"), { ...p, createdAt: Date.now() });
}
export async function deletePreinscription(id: string) {
  await deleteDoc(doc(db, "preinscriptions", id));
}

/* ---------- Rôles utilisateurs ---------- */
export function useRole(email: string | null | undefined): Role | null {
  const [role, setRole] = useState<Role | null>(null);
  useEffect(() => {
    if (!email) { setRole(null); return; }
    const e = email.toLowerCase();
    const ref = doc(db, "roles", e);
    return onSnapshot(ref, async (snap) => {
      if (snap.exists()) { setRole(((snap.data().role as Role) || "user")); return; }
      // pas de rôle pour cet e-mail : si AUCUN rôle n'existe encore, le 1er connecté devient admin
      const all = await getDocs(collection(db, "roles"));
      if (all.empty) { await setDoc(ref, { role: "admin" }); setRole("admin"); }
      else setRole("user");
    });
  }, [email]);
  return role;
}
export function useRoles(): { email: string; role: Role }[] | null {
  const [list, setList] = useState<{ email: string; role: Role }[] | null>(null);
  useEffect(() => {
    return onSnapshot(collection(db, "roles"), (snap) => {
      setList(snap.docs.map((d) => ({ email: d.id, role: (d.data().role as Role) || "user" })));
    });
  }, []);
  return list;
}
export async function setUserRole(email: string, role: Role) {
  await setDoc(doc(db, "roles", email.toLowerCase().trim()), { role });
}
export async function removeUserRole(email: string) {
  await deleteDoc(doc(db, "roles", email.toLowerCase().trim()));
}

/* ---------- Ajustement du stock (à la remise) ---------- */
export async function adjustStock(article: string, taille: string, delta: number) {
  const id = stockId(article, taille);
  const ref = doc(db, "stock", id);
  const snap = await getDoc(ref);
  const cur = snap.exists() ? Number(snap.data().quantite) || 0 : 0;
  const seuil = snap.exists() ? Number(snap.data().seuilMini) || 0 : 0;
  await setDoc(ref, { article, taille, quantite: Math.max(0, cur + delta), seuilMini: seuil, id }, { merge: true });
}
