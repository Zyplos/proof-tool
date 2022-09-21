import { useState, useEffect } from "react";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";

const provider = new GoogleAuthProvider();
provider.setCustomParameters({
  login_hint: "user@uic.edu",
});

const formatAuthUser = (user) => {
  return {
    uid: user.uid,
    email: user.email,
    photoURL: user.photoURL,
    displayName: user.displayName,
    admin: process.env.NEXT_PUBLIC_ADMINS.includes(user.uid),
  };
};

export default function useFirebaseAuth() {
  const [authUser, setAuthUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const clear = () => {
    setAuthUser(null);
    setLoading(false);
  };

  const signInWithGoogle = () => signInWithPopup(getAuth(), provider);

  const signOut = () => {
    getAuth().signOut().then(clear);
  };

  const getIdToken = () => {
    return getAuth()?.currentUser ? getAuth().currentUser.getIdToken(true) : null;
  };

  useEffect(() => {
    const unsubscribe = getAuth().onAuthStateChanged((authState) => {
      if (!authState) {
        setLoading(false);
        return;
      }
      setLoading(true);

      const formattedUser = formatAuthUser(authState);
      setAuthUser(formattedUser);

      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return {
    authUser,
    loading,
    signInWithGoogle,
    signOut,
    getIdToken,
  };
}
