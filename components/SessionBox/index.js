import { useSession, signIn, signOut } from "next-auth/react";
import { Button, NavButton } from "../Button";
import Loader from "../Loader";
import NavLink from "../NavLink";
export default function SessionBox() {
  const { data: session, status } = useSession();
  console.log("SESSIONBOX,", status);
  if (status == "loading") {
    return <Loader />;
  }
  if (session) {
    return (
      <>
        {session.user.admin && (
          <>
            <NavLink href="/teacher/approvals">Approvals</NavLink>
            <NavLink href="/teacher/students">Students</NavLink>
          </>
        )}
        <NavLink href="/profile">Profile</NavLink>

        {/* <NavButton onClick={() => signOut()}>Sign Out</NavButton> */}
      </>
    );
  }
  return <NavButton onClick={() => signIn("google")}>Sign in</NavButton>;
}
