import Link from "next/link";
import styles from "./Button.module.css";

export function Button({ type = "gray", children, className = "", mini, ...props }) {
  return (
    <button className={`${mini ? styles["tool-button-mini"] : styles["tool-button"]} ${styles["button-" + type]} ${className}`} {...props}>
      {children}
    </button>
  );
}

export function LinkedButton({ type = "gray", children, className, mini, ...props }) {
  return (
    <Link {...props} passHref>
      <a className={`${mini ? styles["tool-button-mini"] : styles["tool-button"]} ${styles["button-" + type]} ${className}`}> {children}</a>
    </Link>
  );
}
