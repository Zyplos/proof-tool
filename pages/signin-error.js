import MainLayout from "../components/MainLayout";
import Fullbox from "../components/Fullbox";
import { Button } from "../components/Button";
import { signIn } from "next-auth/react";

export default function MePage() {
  return (
    <MainLayout>
      <Fullbox>
        <h1>Signin Error</h1>
        <p>Please make sure to sign in with your UIC email.</p>
        <Button onClick={() => signIn("google", { callbackUrl: "/" })}>Sign In</Button>
      </Fullbox>
    </MainLayout>
  );
}
