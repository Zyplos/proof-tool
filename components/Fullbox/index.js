import styles from "./Fullbox.module.css";

export default function Fullbox({ children }) {
  return <div className={styles.fullbox}>{children}</div>;
}
