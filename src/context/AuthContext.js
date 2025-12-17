import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  updateProfile 
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Lytt til autentiseringstilstand
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Hent brukerdata fra Firestore
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUser({
              id: firebaseUser.uid,
              email: firebaseUser.email,
              name: userData.name || firebaseUser.displayName || 'Bruker',
              role: userData.role || 'staff',
              phone: userData.phone || '',
              avatar: (userData.name || firebaseUser.displayName || 'B')
                .split(' ')
                .map((n) => n[0])
                .join('')
                .toUpperCase()
                .slice(0, 2),
            });
          } else {
            // Opprett brukerdata hvis den ikke finnes
            const newUserData = {
              name: firebaseUser.displayName || 'Bruker',
              email: firebaseUser.email,
              role: 'staff',
              phone: '',
              createdAt: new Date().toISOString(),
            };
            
            await setDoc(doc(db, 'users', firebaseUser.uid), newUserData);
            
            setUser({
              id: firebaseUser.uid,
              email: firebaseUser.email,
              name: newUserData.name,
              role: newUserData.role,
              phone: newUserData.phone,
              avatar: newUserData.name
                .split(' ')
                .map((n) => n[0])
                .join('')
                .toUpperCase()
                .slice(0, 2),
            });
          }
        } catch (error) {
          console.error('Feil ved henting av brukerdata:', error);
          // Fallback til grunnleggende brukerinfo
          setUser({
            id: firebaseUser.uid,
            email: firebaseUser.email,
            name: firebaseUser.displayName || 'Bruker',
            role: 'staff',
            avatar: 'BR',
          });
        }
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log('✅ Innlogging vellykket:', email);
      return { success: true };
    } catch (error) {
      console.error('❌ Feil ved innlogging:', error.code, error.message);
      
      // Returner spesifikk feilmelding basert på feilkode
      let errorMessage = 'Feil ved innlogging. Prøv igjen.';
      
      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = 'Bruker ikke funnet';
          break;
        case 'auth/wrong-password':
          errorMessage = 'Feil passord';
          break;
        case 'auth/invalid-credential':
          errorMessage = 'Feil e-post eller passord';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Ugyldig e-postadresse';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'For mange forsøk. Prøv igjen senere.';
          break;
        case 'auth/network-request-failed':
          errorMessage = 'Nettverksfeil. Sjekk internettforbindelsen.';
          break;
      }
      
      return { success: false, error: errorMessage };
    }
  };

  const register = async (email, password, name) => {
    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Oppdater displayName
      await updateProfile(userCredential.user, { displayName: name });
      
      // Opprett brukerdata i Firestore
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        name: name,
        email: email,
        role: 'staff',
        phone: '',
        createdAt: new Date().toISOString(),
      });

      return true;
    } catch (error) {
      console.error('Feil ved registrering:', error);
      
      switch (error.code) {
        case 'auth/email-already-in-use':
          throw new Error('E-postadressen er allerede i bruk');
        case 'auth/invalid-email':
          throw new Error('Ugyldig e-postadresse');
        case 'auth/weak-password':
          throw new Error('Passordet er for svakt (minst 6 tegn)');
        default:
          throw new Error('Feil ved registrering. Prøv igjen.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
    } catch (error) {
      console.error('Feil ved utlogging:', error);
    }
  };

  const updateUserData = async (updates) => {
    try {
      if (!user?.id) throw new Error('Ingen bruker innlogget');

      // Oppdater i Firestore
      await setDoc(doc(db, 'users', user.id), updates, { merge: true });

      // Oppdater lokal state
      const updatedUser = { ...user, ...updates };
      if (updates.name) {
        updatedUser.avatar = updates.name
          .split(' ')
          .map((n) => n[0])
          .join('')
          .toUpperCase()
          .slice(0, 2);
      }
      
      setUser(updatedUser);
      return updatedUser;
    } catch (error) {
      console.error('Feil ved oppdatering av bruker:', error);
      throw error;
    }
  };

  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    register,
    updateUserData,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth må brukes innenfor AuthProvider');
  }
  return context;
}
