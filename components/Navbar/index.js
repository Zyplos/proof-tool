import { useEffect, useState } from "react";
import styles from "./Navbar.module.css";
import Link from "next/link";
import { useAuth } from "../../firebase/app/AuthUserContext";
import { useRouter } from "next/router";
import Image from "next/image";
import Loader from "../Loader";
import { Button } from "../Button";

function NavLink({ href, children }) {
  return (
    <Link href={href} passHref>
      <a className={styles.navlink}>{children}</a>
    </Link>
  );
}

export default function Navbar() {
  const { authUser, loading, signInWithGoogle } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  return (
    <div className={styles.navbar}>
      <span className={styles.navtitle}>
        <Link href="/">Proof Study</Link>
      </span>

      <div className={styles["navbar-toggle"]} onClick={() => setOpen(!open)}>
        <svg data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white">
          <path d="M0 0h24v4.56H0zM0 9.72h24v4.56H0zM0 19.44h24V24H0z"></path>
        </svg>
      </div>

      <div className={`${styles["navlinks-section"]} ${open ? "" : styles["navlinks-section-toggle"]}`}>
        <NavLink href="/">Library</NavLink>

        <NavLink href="/proof/editor">Editor</NavLink>

        {authUser && authUser.admin && (
          <>
            <NavLink href="/teacher/approvals">Approvals</NavLink>
            <NavLink href="/teacher/students">Students</NavLink>
          </>
        )}
        {loading ? (
          <div>
            <Loader />
          </div>
        ) : (
          <>
            {authUser ? (
              <NavLink href="/profile">Profile</NavLink>
            ) : (
              <Button
                className={styles.navlink}
                onClick={() => {
                  signInWithGoogle()
                    .then((result) => {
                      console.log("Success. The user is created in firebase", result);
                    })
                    .catch((error) => {
                      console.log("---------USERNAVBAR ERROR", error);
                    });
                }}
              >
                Sign In
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  );
}

/* <NavLink href="/profile">
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                  <div style={{ marginRight: "15px" }}>
                    <Image src={authUser?.photoURL} style={{ borderRadius: "100%" }} alt="Profile Picture" layout="fixed" width={42} height={42} />
                  </div>
                  Profile
                </div>
              </NavLink> */
