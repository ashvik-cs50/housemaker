import { doc, getDoc, setDoc, onSnapshot } from "firebase/firestore";
import { db } from "./firebase.js";

export const playerCollection = "players";

// Save current player data to Firestore
export async function savePlayerData(uid, data) {
  try {
    const playerRef = doc(db, playerCollection, uid);
    await setDoc(playerRef, data, { merge: true });
    console.log("Player data saved:", data);
  } catch (error) {
    console.error("Failed to save player data:", error);
  }
}

// Load player data from Firestore
export function loadPlayerData(uid, onUpdate) {
  const playerRef = doc(db, playerCollection, uid);
  return onSnapshot(playerRef, (doc) => {
    if (doc.exists()) {
      onUpdate && onUpdate(doc.data());
    }
  }, (error) => {
    console.error("Error loading player data:", error);
  });
}