import { createContext, useContext } from "react";
import useFirebaseAuth from "./useFirebaseAuth";
import Fullbox from "../../components/Fullbox";
import { Button } from "../../components/Button";

const AuthUserContext = createContext({
  authUser: null,
  loading: true,

  // these functions are provided by the useFirebaseAuth hook when passed to the context
  signInWithGoogle: async () => {},
  getIdToken: async () => {},
  signOut: async () => {},
});

export function AuthUserProvider({ children }) {
  const auth = useFirebaseAuth();
  // console.log("AUTHUSERPROVIDER", auth);
  if (!auth.loading && auth.authUser && !auth.authUser.email.includes("@uic.edu")) {
    return (
      <Fullbox>
        <h1>Oops!</h1>
        <p>Please log in with your UIC account.</p>
        <Button onClick={auth.signOut}>Sign Out</Button>
      </Fullbox>
    );
  }
  return <AuthUserContext.Provider value={auth}>{children}</AuthUserContext.Provider>;
}

export const useAuth = () => useContext(AuthUserContext);
