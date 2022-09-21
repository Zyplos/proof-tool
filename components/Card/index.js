import styles from "./Card.module.css";

export default function Card({ children, footer, className = "", ...props }) {
  return (
    <div className={`${styles["card"]} ${className}`}>
      {children}
      <div className={styles["card-footer"]}>{footer}</div>
    </div>
  );
}
