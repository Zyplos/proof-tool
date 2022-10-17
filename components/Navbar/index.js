import { useState } from "react";
import styles from "./Navbar.module.css";
import Link from "next/link";
import { useRouter } from "next/router";

import SessionBox from "../SessionBox";

function NavLink({ href, children }) {
  return (
    <Link href={href} passHref>
      <a className={styles.navlink}>{children}</a>
    </Link>
  );
}

export default function Navbar() {
  // const { authUser, loading, signInWithGoogle } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  return (
    <div className={styles.navbar}>
      <span className={styles.navtitle}>
        <Link href="/">Proof Tool</Link>
      </span>

      <div className={styles["navbar-toggle"]} onClick={() => setOpen(!open)}>
        <svg data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white">
          <path d="M0 0h24v4.56H0zM0 9.72h24v4.56H0zM0 19.44h24V24H0z"></path>
        </svg>
      </div>

      <div className={`${styles["navlinks-section"]} ${open ? "" : styles["navlinks-section-toggle"]}`}>
        <NavLink href="/">Library</NavLink>

        <NavLink href="/proof/editor">Editor</NavLink>

        <SessionBox />
      </div>
    </div>
  );
}
