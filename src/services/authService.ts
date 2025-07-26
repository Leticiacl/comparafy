import { auth, googleProvider } from './firebase';
import {
  signInWithEmailAndPassword,
  signInAnonymously,
  signInWithPopup,
  createUserWithEmailAndPassword,
} from 'firebase/auth';

export const loginWithEmail = (email: string, password: string) => {
  return signInWithEmailAndPassword(auth, email, password);
};

export const loginAsGuest = () => {
  return signInAnonymously(auth);
};

export const loginWithGoogle = () => {
  return signInWithPopup(auth, googleProvider);
};

export const registerWithEmail = (email: string, password: string) => {
  return createUserWithEmailAndPassword(auth, email, password);
};
