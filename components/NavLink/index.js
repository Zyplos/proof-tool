import styles from "./NavLink.module.css";
import Link from "next/link";
export default function NavLink({ href, children, style, target }) {
  return (
    <Link href={href} passHref>
      <a className={styles.navlink} style={style} target={target}>
        {children}
      </a>
    </Link>
  );
}
