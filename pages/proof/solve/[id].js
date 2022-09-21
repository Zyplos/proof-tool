import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import useSWRImmutable from "swr/immutable";
import { randomId } from "../../../internals/utils";

import Fullbox from "../../../components/Fullbox";
import Loader from "../../../components/Loader";
import MainLayout from "../../../components/MainLayout";
import Navbar from "../../../components/Navbar";
import EditableMarkdown from "../../../components/EditableMarkdown";
import styles from "../../../styles/Proof.module.css";
import fetcher, { authFetcher } from "../../../internals/fetcher";

import "katex/dist/katex.min.css";
import MarkdownRenderer from "../../../components/MarkdownRenderer";
import { useAuth } from "../../../firebase/app/AuthUserContext";

import Link from "next/link";
import JustificationDropdown from "../../../components/JustificationDropdown";

function JustificationRow({ id, rowNum, initialClaimText, justification, editProof, deleteRow, isIncorrect }) {
  function setClaimText(newText) {
    editProof(id, newText, justification);
  }

  function setJustification(newJustification) {
    console.log("SETTING NEW JUSTIFICATION", id, initialClaimText, newJustification);
    editProof(id, initialClaimText, newJustification);
  }

  return (
    <>
      <div className={styles["proof-index"]} style={{ backgroundColor: isIncorrect ? "red" : "green", color: "white", padding: "5px 5px" }}>
        {rowNum + 1}{" "}
      </div>
      <div className={styles["proof-claim"]}>
        {/* <textarea ref={textRef} onChange={onChangeHandler} className="text-area" defaultValue={claim} /> */}
        {/* <MarkdownRenderer content={claim} /> */}
        <MarkdownRenderer content={initialClaimText} />
      </div>
      <div className={styles["proof-separator"]}>∵</div>
      <div className={justification === "unknown" ? styles["highlight-cell"] : ""}>
        <JustificationDropdown initialValue={justification} onChange={setJustification} includeUnknown={true} />
      </div>
    </>
  );
}

export default function Proof() {
  const { getIdToken } = useAuth();
  const router = useRouter();
  const { id } = router.query; // useSWR doesnt like it if you use router.id directly

  // using useSWRImmutable so proof doesn't change once you load the page
  const { data, error, mutate } = useSWRImmutable(id ? "/api/proofs/" + id : null);
  const [rows, setRows] = useState(null);
  const [formFeedback, setFormFeedback] = useState("");

  useEffect(() => {
    let changecheck = false;
    if (data) {
      data.proof.forEach((rowchange, i) => {
        if (rowchange.justification === "given") return;
        // calculate a chance of changing the justification
        if (Math.random() < 0.35) {
          rowchange.justification = "unknown";
          changecheck = true;
        }
      });

      // somehow, no rows were randomly changed, so we manually change at least one
      if (!changecheck) {
        // get all rows without "given" justification
        const rows = data.proof.filter((row) => row.justification !== "given");
        if (rows.length > 0) rows[Math.floor(Math.random() * rows.length)].justification = "unknown";
      }

      setRows(data.proof);
    }
  }, [data]);

  if (error) {
    return (
      <MainLayout>
        <Fullbox>
          <p className={styles["display-text"]}>{error.status}</p>
          <p>{error.status == "404" ? "That proof wasn't found." : "Sorry, got an error trying to grab a proof."}</p>
        </Fullbox>
      </MainLayout>
    );
  }

  if (!data) {
    return (
      <MainLayout>
        <Fullbox>
          <Loader width="128px" height="128px" />
          Grabbing proof...
        </Fullbox>
      </MainLayout>
    );
  }

  function addNewRow() {
    setRows((prevRows) => {
      return [...prevRows, { claim: "", justification: "", id: randomId() }];
    });
  }

  function editProof(id, claim, justification) {
    setRows((prevRows) => {
      // find the row with the given id
      const row = prevRows.find((row) => row.id === id);
      // replace the claim and justification
      row.claim = claim;
      row.justification = justification;
      // edit prevRows to include the new row
      return [...prevRows];
    });
  }

  function deleteRow(index) {
    setRows((prevRows) => {
      console.log("DELETEROW", index, prevRows);
      return [...prevRows.slice(0, index), ...prevRows.slice(index + 1)];
    });
  }

  async function submitEdits() {
    console.log("SUBMITTING DEV FORM");
    setFormFeedback("Submitting...");

    try {
      console.log("TRYING TO GET FTOKEN");
      const firebaseUserIdToken = await getIdToken();
      console.log("GOT FIREBASEUSERIDTOKEN", firebaseUserIdToken);
      if (!firebaseUserIdToken) {
        setFormFeedback("You must be logged in to submit a proof.");
        return;
      }

      console.log("GOT USER TOKEN", firebaseUserIdToken);
      const result = await authFetcher("/api/user/check", firebaseUserIdToken, {
        method: "POST",
        body: JSON.stringify({ id, rows }),
      });
      console.log("CHECKSUBMIT", result);
      if (result.incorrect.length > 0) {
        setFormFeedback(<span className="info">Some rows are wrong, recheck your answers.</span>);
      } else {
        setFormFeedback(<span className="info">Correctly solved!</span>);
      }

      const incorrectIds = result.incorrect;
      console.log("INCORRECTIDS", incorrectIds);

      setRows((prevRows) => {
        prevRows.forEach((row) => {
          row.incorrect = incorrectIds.includes(row.id);
        });

        return prevRows;
      });
    } catch (error) {
      console.log("ERROR SUBMITTING PROOF", error);
      setFormFeedback(<span className="error">Sorry, got an error. {error.info.message}</span>);
    }
  }

  if (!rows) {
    return (
      <MainLayout>
        <Fullbox>
          <Loader width="128px" height="128px" />
          Prepping editor...
        </Fullbox>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <h1>Solve</h1>

      <div className={styles["proof-box"]}>
        {rows.map((row, index) => {
          return (
            <JustificationRow
              key={row.id}
              id={row.id}
              rowNum={index}
              initialClaimText={row.claim}
              justification={row.justification}
              editProof={editProof}
              deleteRow={deleteRow}
              isIncorrect={row.incorrect}
            />
          );
        })}
      </div>

      <div className={styles["toolbox"]}>
        <button className={`${styles["tool-button"]} ${styles["button-green"]}`} onClick={submitEdits}>
          ∎ Check Answer
        </button>
      </div>
      <p>{formFeedback}</p>
    </MainLayout>
  );
}
