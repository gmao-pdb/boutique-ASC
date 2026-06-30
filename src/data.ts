import { useEffect, useState } from "react";
import { collection, doc, onSnapshot, setDoc, addDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "./firebase";
import { DEFAULT_CONFIG } from "./defaultConfig";
import type { Config, Joueur, StockItem } from "./types";

const configRef = doc(db, "config", "main");

export function useConfig(): Config | null {
  const [config, setConfig] = useState<Config | null>(null);
  useEffect(() => {
    return onSnapshot(configRef, (snap) => {
      if (snap.exists()) setConfig(snap.data() as Config);
      else void setDoc(configRef, DEFAULT_CONFIG); // 1ère fois : on sème la config par défaut
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
