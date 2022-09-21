import styles from "./Heading.module.css";

export default function Heading({ subtitle, children }) {
  return (
    <h1 className={styles["header"]}>
      {children} {subtitle && <span className={styles["subtitle"]}>• {subtitle}</span>}
    </h1>
  );
}
