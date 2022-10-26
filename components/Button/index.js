import Link from "next/link";
import styles from "./Button.module.css";

export function Button({ variant = "gray", children, className = "", mini, ...props }) {
  return (
    <button className={`${mini ? styles["tool-button-mini"] : styles["tool-button"]} ${styles["button-" + variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}

export function LinkedButton({ variant = "gray", children, className, mini, ...props }) {
  return (
    <Link {...props} passHref>
      <a className={`${mini ? styles["tool-button-mini"] : styles["tool-button"]} ${styles["button-" + variant]} ${className}`}> {children}</a>
    </Link>
  );
}

export function NavButton({ variant = "gray", children, className = "", mini, ...props }) {
  return (
    <button className={`${mini ? styles["tool-button-mini"] : styles["tool-button"]} ${styles.navlink} ${className}`} {...props}>
      {children}
    </button>
  );
}
