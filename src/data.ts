import { useEffect, useState } from "react";
import { collection, doc, onSnapshot, setDoc, addDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "./firebase";
import { DEFAULT_CONFIG } from "./defaultConfig";
import type { Config, Joueur } from "./types";

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
