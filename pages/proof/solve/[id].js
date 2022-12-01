import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import useSWRImmutable from "swr/immutable";
import { isBlank, justificationReferenceNumbers, randomId, toTitleCase } from "../../../internals/utils";

import Fullbox from "../../../components/Fullbox";
import Loader from "../../../components/Loader";
import MainLayout from "../../../components/MainLayout";
import Navbar from "../../../components/Navbar";
import EditableMarkdown from "../../../components/EditableMarkdown";
import styles from "../../../styles/Proof.module.css";
import { fetcher } from "../../../internals/fetcher";

import "katex/dist/katex.min.css";
import MarkdownRenderer from "../../../components/MarkdownRenderer";
import { useSession, signIn, signOut } from "next-auth/react";

import Link from "next/link";
import JustificationDropdown from "../../../components/JustificationDropdown";
import Heading from "../../../components/Heading";

function JustificationReferences({ justification, references, onChange }) {
  function handleChange(e, index) {
    console.log("=======JUSTIFICATION REFERENCE CHANGE", e.target.value, index);
    if (onChange) onChange(parseInt(e.target.value), index);
  }

  const numInputs = justificationReferenceNumbers[justification];
  if (!numInputs) return null;
  return (
    <div
      style={{
        display: "grid",
        marginTop: "8px",
      }}
    >
      <label>Row References:</label>
      {[...Array(numInputs)].map((v, i) => {
        return (
          <input
            type="number"
            key={i}
            min={1}
            value={references[i]}
            onChange={(e) => {
              handleChange(e, i);
            }}
          />
        );
      })}
    </div>
  );
}

function JustificationRow({
  id,
  rowNum,
  initialClaimText,
  justification,
  references,
  editClaim,
  editJustification,
  editReference,
  deleteRow,
  isIncorrect,
  feedback,
  proofType,
  isClaimMissing,
  claimFeedback,
}) {
  function setClaimText(newClaim) {
    editClaim(id, newClaim);
  }

  function setJustification(newJustification) {
    // console.log("SETTING NEW JUSTIFICATION", id, initialClaimText, newJustification);
    editJustification(id, newJustification);
  }

  function setReference(newReference, index) {
    editReference(id, newReference, index);
  }

  console.log("====INITBLANKDEV", initialClaimText, isBlank(initialClaimText));

  return (
    <>
      <div
        className={styles["proof-index"]}
        style={{
          backgroundColor: proofType == "default" ? (isIncorrect ? "red" : "green") : "none",
          ...(proofType == "default" && { color: "white" }), // only add this property if proofType is default
          padding: "5px 5px",
        }}
      >
        {rowNum + 1}{" "}
      </div>
      <div className={styles["proof-claim"]}>
        {/* <textarea ref={textRef} onChange={onChangeHandler} className="text-area" defaultValue={claim} /> */}
        {/* <MarkdownRenderer content={claim} /> */}

        <div
          style={{
            ...(isClaimMissing && claimFeedback && { backgroundColor: "#111", padding: "12px" }),
          }}
        >
          {isClaimMissing && <p>Your answer:</p>}

          <div
            style={{
              ...(isClaimMissing && !claimFeedback && { border: "2px solid red" }),
            }}
          >
            {isClaimMissing ? (
              <EditableMarkdown initialContent={isBlank(initialClaimText) ? "???" : initialClaimText} onChange={setClaimText} />
            ) : (
              <MarkdownRenderer content={initialClaimText} />
            )}
          </div>
        </div>

        {claimFeedback && (
          <div style={{ backgroundColor: "green", marginTop: "16px", padding: "12px" }}>
            <p>Correct:</p>
            <MarkdownRenderer content={claimFeedback} />
          </div>
        )}
      </div>
      <div className={styles["proof-separator"]}>∵</div>
      <div className={justification === "unknown" ? styles["highlight-cell"] : ""}>
        <JustificationDropdown initialValue={justification} onChange={setJustification} includeUnknown={true} proofType={proofType} />
        <JustificationReferences justification={justification} references={references} onChange={setReference} />

        {feedback && <p style={{ backgroundColor: "red" }}>{feedback}</p>}
      </div>
    </>
  );
}

export default function Proof() {
  const { data: session, status: sessionStatus } = useSession({
    required: true,
    onUnauthenticated() {
      signIn("google");
    },
  });

  // const { getIdToken } = useAuth();
  const router = useRouter();
  const { id } = router.query; // useSWR doesnt like it if you use router.id directly

  // using useSWRImmutable so proof doesn't change once you load the page
  const { data, error, mutate } = useSWRImmutable(id ? "/api/solve/" + id : null);
  const [rows, setRows] = useState(null);
  const [formFeedback, setFormFeedback] = useState("");

  useEffect(() => {
    let changecheck = false;
    if (data) {
      // data.rows.forEach((rowchange, i) => {
      //   if (rowchange.justification === "given") return;
      //   // calculate a chance of changing the justification
      //   if (Math.random() < 0.35) {
      //     rowchange.justification = "unknown";
      //     changecheck = true;
      //   }
      // });

      // // somehow, no rows were randomly changed, so we manually change at least one
      // if (!changecheck) {
      //   // get all rows without "given" justification
      //   const rows = data.rows.filter((row) => row.justification !== "given");
      //   if (rows.length > 0) rows[Math.floor(Math.random() * rows.length)].justification = "unknown";
      // }

      // setRows(data.rows);
      // TODO remove this leftover bit from when random solve logic was clientside
      setRows(data.rows);
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
      return [...prevRows, { claim: "", justification: "given", id: randomId(), references: [] }];
    });
  }

  function editClaim(id, claim) {
    setRows((prevRows) => {
      // find the row with the given id
      const row = prevRows.find((row) => row.id === id);
      // replace the claim
      row.claim = claim;
      // edit prevRows to include the new row
      return [...prevRows];
    });
  }

  function editJustification(id, justification) {
    setRows((prevRows) => {
      // find the row with the given id
      const row = prevRows.find((row) => row.id === id);
      // replace the justification
      row.justification = justification;
      row.references = [];
      row.feedback = null;
      // edit prevRows to include the new row
      return [...prevRows];
    });
  }

  function editReference(id, reference, index) {
    setRows((prevRows) => {
      // find the row with the given id
      const row = prevRows.find((row) => row.id === id);
      // replace the justification
      row.references[index] = reference;
      row.feedback = null;
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
      const result = await fetcher("/api/solve/check", {
        method: "POST",
        body: JSON.stringify({ id, rows }),
      });
      console.log("CHECKSUBMIT", result);
      if (Object.keys(result.incorrect).length > 0) {
        setFormFeedback(
          <span className="info">
            Some rows are wrong, recheck your answers. Make sure to include row references for justifications that require you to reference a row.
          </span>
        );
      } else {
        setFormFeedback(<span className="info">Correctly solved!</span>);
      }

      const incorrectIds = Object.keys(result.incorrect);
      console.log("INCORRECTIDS", incorrectIds);

      setRows((prevRows) => {
        prevRows.forEach((row, i) => {
          row.incorrect = incorrectIds.includes(row.id);
          row.feedback = result.incorrect[row.id]?.feedback;
          if (row.claimMissing) {
            row.claimFeedback = result.englishCheck.rows[i].claim;
          }
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
          Prepping solver...
        </Fullbox>
      </MainLayout>
    );
  }

  const rowsHasEmptyClaims = rows.some((row) => isBlank(row.claim));

  return (
    <MainLayout>
      <Heading subtitle={data.proofType == "default" ? null : toTitleCase(data.proofType) + " proof."}>Solve</Heading>

      <div className={styles["proof-box"]}>
        {rows.map((row, index) => {
          return (
            <JustificationRow
              key={row.id}
              id={row.id}
              feedback={row.feedback}
              rowNum={index}
              initialClaimText={row.claim}
              isClaimMissing={row.claimMissing}
              justification={row.justification}
              references={row.references}
              editJustification={editJustification}
              editClaim={editClaim}
              editReference={editReference}
              deleteRow={deleteRow}
              isIncorrect={row.incorrect}
              proofType={data.proofType}
              claimFeedback={row.claimFeedback}
            />
          );
        })}
      </div>

      <div className={styles["toolbox"]}>
        <button className={`${styles["tool-button"]} ${styles["button-green"]}`} onClick={submitEdits} disabled={rowsHasEmptyClaims}>
          ∎ Check Answer
        </button>
      </div>
      <p>{formFeedback}</p>
    </MainLayout>
  );
}
