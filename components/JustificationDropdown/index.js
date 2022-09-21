import { useState } from "react";
import styles from "./JustificationDropdown.module.css";
import { validJustifications } from "../../internals/utils";

export default function JustificationDropdown({ initialValue, onChange, includeUnknown = false }) {
  const [value, setValue] = useState(initialValue ?? (includeUnknown ? "unknown" : "given"));

  function handleChange(e) {
    // setValue(e.target.value);
    console.log("JUSTIFICATION DROPDOWN CHANGE", e.target.value);
    if (onChange) onChange(e.target.value);
  }

  return (
    <>
      <label htmlFor="justification-select" className={styles["dropdown-label"]}>
        Justification:
      </label>

      <select name="justification-select" value={initialValue} className={styles.dropdown} onChange={handleChange}>
        {Object.keys(validJustifications).map((value) => {
          if (!includeUnknown && value === "unknown") return null;
          return (
            <option key={value} value={value}>
              {validJustifications[value]}
            </option>
          );
        })}
      </select>
    </>
  );
}
