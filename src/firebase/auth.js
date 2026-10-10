import { getAuth, signInAnonymously, onAuthStateChanged, signOut } from "firebase/auth";

const auth = getAuth();

let anonymousUser = null;

signInAnonymously(auth)
  .then(() => {
    anonymousUser = auth.currentUser;
    console.log("Anonymous auth signed in:", anonymousUser?.uid);
  })
  .catch((error) => {
    console.warn("Anonymous auth failed:", error);
 );

export { auth, anonymousUser, signInAnonymously, onAuthStateChanged, signOut };