import styles from "./Toggle.module.css";

export default function Toggle({ isChecked, handleToggle, labelText = "Toggle", ...props }) {
  return (
    <label className={styles.toggle}>
      <input className={styles["toggle-checkbox"]} type="checkbox" checked={isChecked} onChange={handleToggle} />
      <div className={styles["toggle-switch"]}></div>
      <span className={styles["toggle-label"]}>{labelText}</span>
    </label>
  );
}
