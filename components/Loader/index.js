import styles from "./Loader.module.css";

export default function Loader({ width = "24px", height = "24px", fill }) {
  return (
    <svg className={styles.loader} width={width} height={height} fill={fill} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <circle cx="4" cy="12" r="3">
        <animate id="a" begin="0;b.end-0.25s" attributeName="r" dur="0.75s" values="3;.2;3" />
      </circle>
      <circle cx="12" cy="12" r="3">
        <animate begin="a.end-0.6s" attributeName="r" dur="0.75s" values="3;.2;3" />
      </circle>
      <circle cx="20" cy="12" r="3">
        <animate id="b" begin="a.end-0.45s" attributeName="r" dur="0.75s" values="3;.2;3" />
      </circle>
    </svg>
  );
}
