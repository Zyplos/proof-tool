import styles from "./Card.module.css";

export default function Card({ style, children, footer, className = "", ...props }) {
  return (
    <div className={`${styles["card"]} ${className}`} style={style}>
      {children}
      {footer && <div className={styles["card-footer"]}>{footer}</div>}
    </div>
  );
}
