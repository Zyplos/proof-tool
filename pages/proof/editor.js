import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import useSWRImmutable from "swr/immutable";
import { justificationReferenceNumbers, randomId } from "../../internals/utils";

import Fullbox from "../../components/Fullbox";
import Loader from "../../components/Loader";
import MainLayout from "../../components/MainLayout";
import Navbar from "../../components/Navbar";
import EditableMarkdown from "../../components/EditableMarkdown";
import styles from "../../styles/Proof.module.css";
import { fetcher } from "../../internals/fetcher";

import Heading from "../../components/Heading";
import { Button, LinkedButton } from "../../components/Button";
import JustificationDropdown from "../../components/JustificationDropdown";
import MarkdownRenderer from "../../components/MarkdownRenderer";

import { useSession, signIn, signOut } from "next-auth/react";
import { getProof } from "../../database";

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

function JustificationRow({ id, rowNum, initialClaimText, justification, references, editClaim, editJustification, editReference, deleteRow }) {
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

  return (
    <>
      <div className={styles["proof-index"]}>
        {rowNum + 1}{" "}
        <button
          onClick={() => {
            deleteRow(rowNum);
          }}
          className={`${styles["tool-button-mini"]} ${styles["button-red"]}`}
        >
          ×
        </button>
      </div>
      <div className={styles["proof-claim"]}>
        {/* <textarea ref={textRef} onChange={onChangeHandler} className="text-area" defaultValue={claim} /> */}
        {/* <MarkdownRenderer content={claim} /> */}
        <EditableMarkdown initialContent={initialClaimText} onChange={setClaimText} />
      </div>
      <div className={styles["proof-separator"]}>∵</div>
      <div>
        <JustificationDropdown initialValue={justification} onChange={setJustification} />
        <JustificationReferences justification={justification} references={references} onChange={setReference} />
      </div>
      <div className={styles["mobile-separator"]}></div>
    </>
  );
}

export default function Proof({ data, id }) {
  // const { loading, authUser, getIdToken } = useAuth();
  const { data: session, status: sessionStatus } = useSession({
    required: true,
    onUnauthenticated() {
      signIn("google");
    },
  });
  const router = useRouter();

  console.log("PROOFPAGE", data, id, session, sessionStatus);

  const [rows, setRows] = useState(data.rows);
  const [proofStatus, setProofStatus] = useState(data.approved);
  const [formFeedback, setFormFeedback] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  // https://stackoverflow.com/a/73977517
  // quick way to prevent the user from leaving without saving
  const [unsavedChanges, setUnsavedChanges] = useState(true);
  const warningText = "Are you sure you want to leave this page? Make sure you've saved your proof!";

  useEffect(() => {
    const handleWindowClose = (e) => {
      if (!unsavedChanges) return;
      e.preventDefault();
      return (e.returnValue = warningText);
    };
    const handleBrowseAway = () => {
      if (!unsavedChanges) return;
      if (window.confirm(warningText)) return;
      router.events.emit("routeChangeError");
      throw "routeChange aborted.";
    };
    window.addEventListener("beforeunload", handleWindowClose);
    router.events.on("routeChangeStart", handleBrowseAway);
    return () => {
      window.removeEventListener("beforeunload", handleWindowClose);
      router.events.off("routeChangeStart", handleBrowseAway);
    };

    // cry about it
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unsavedChanges]);

  //////////
  const dialogBox = useRef(null);

  useEffect(() => {
    if (!id) {
      setRows([
        {
          claim:
            "Welcome to the Editor!\nMath goes in double dollar signs, like this: \n$$ \\sqrt{5} \\not\\in C $$\nEdit this row to see how that math is formatted, or take a look at the Editor Help below.",
          justification: "given",
          id: randomId(),
          references: [],
        },
      ]);
      setFormFeedback("");
    }
  }, [id]);

  if (data.error) {
    return (
      <MainLayout>
        <Fullbox>
          <p className={styles["display-text"]}>{data.error.status}</p>
          <p>{data.error.status == "404" ? "That proof wasn't found." : data.error.message}</p>
        </Fullbox>
      </MainLayout>
    );
  }

  if (sessionStatus === "loading") {
    return (
      <MainLayout>
        <Fullbox>
          <Loader width="128px" height="128px" />
          Checking user...
        </Fullbox>
      </MainLayout>
    );
  }

  if (id && data.uid !== session.user.id) {
    if (!session.user.admin) {
      return (
        <MainLayout>
          <Fullbox>
            <p className={styles["display-text"]}>Oops!</p>
            <p>You cannot view proofs you did not make.</p>
          </Fullbox>
        </MainLayout>
      );
    }
  }

  const editMode = data.rows.length > 0;

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

  async function submitNewProof() {
    setIsUpdating(true);
    setUnsavedChanges(false);

    if (rows.length < 2) {
      setIsUpdating(false);
      setFormFeedback("You must have at least two rows in your proof.");
      return;
    }

    setFormFeedback("Submitting new proof...");

    fetcher("/api/proofs", {
      method: "POST",
      body: JSON.stringify({ rows }),
    })
      .then((newData) => {
        // console.log(newData);
        // mutate({ ...data, proof: rows });
        setFormFeedback(<span className="info">Proof submitted. It must be approved before it shows up in the library.</span>);
        router.push("/proof/editor?id=" + newData.id).then(() => {
          setIsUpdating(false);
          setUnsavedChanges(true);
        });
      })
      .catch((err) => {
        setIsUpdating(false);
        setUnsavedChanges(true);

        setFormFeedback(<span className="error">Sorry, could not submit new proof. {err.info.message}</span>);
      });
  }

  async function submitEditedProof() {
    setIsUpdating(true);
    // console.log(data);

    if (rows.length < 2) {
      setIsUpdating(false);
      setFormFeedback("You must have at least two rows in your proof.");
      return;
    }

    setFormFeedback("Submitting edited proof...");

    console.log("SUBMITING EDITED PROOF", rows);
    fetcher("/api/proofs/" + id, {
      method: "PUT",
      body: JSON.stringify({ rows }),
    })
      .then(() => {
        // mutate({ ...data, proof: rows });
        setIsUpdating(false);
        setFormFeedback(<span className="info">Proof updated.</span>);
      })
      .catch((err) => {
        setIsUpdating(false);
        setFormFeedback(<span className="error">Sorry, could not submit your edits. {err.info.message}</span>);
      });
  }

  function confirmDeleteProof() {
    dialogBox.current.showModal();
  }

  async function deleteProof() {
    setIsUpdating(true);
    setUnsavedChanges(false);

    fetcher("/api/proofs/" + id, {
      method: "DELETE",
    })
      .then(() => {
        // mutate({ ...data, proof: rows });
        setFormFeedback(<span className="info">Proof deleted.</span>);
        router.push("/profile").then(() => {
          setIsUpdating(false);
          setUnsavedChanges(true);
        });
      })
      .catch((err) => {
        setIsUpdating(false);
        setUnsavedChanges(true);
        setFormFeedback(<span className="error">Sorry, could not delete this proof. {err.info.message}</span>);
      });
  }

  async function postProofStatus(bool) {
    setIsUpdating(true);

    fetcher("/api/teacher/status/" + id, {
      method: "POST",
      body: JSON.stringify({ approved: bool }),
    })
      .then(() => {
        setProofStatus(bool);
        setIsUpdating(false);
        // mutate({ ...data, proof: rows });
        if (bool) {
          setFormFeedback(<span className="info">Proof approved! It will now appear in the library.</span>);
        } else {
          setFormFeedback(<span className="info">Proof withdrawn. It will no longer appear in the library.</span>);
        }
      })
      .catch((err) => {
        setIsUpdating(false);
        setFormFeedback(<span className="error">Sorry, got an error trying to set proof status. {err.info.message}</span>);
      });
  }

  return (
    <MainLayout>
      <div className={styles["flex-header"]}>
        <Heading subtitle={editMode ? "Editing existing proof." : "Creating new proof."}>Editor</Heading>
        {editMode ? <LinkedButton href="/proof/editor">Create New Proof</LinkedButton> : <LinkedButton href="/profile">Edit Existing Proof</LinkedButton>}
      </div>
      <div className={styles["proof-box"]}>
        {rows.map((row, index) => {
          return (
            <JustificationRow
              key={row.id}
              id={row.id}
              rowNum={index}
              initialClaimText={row.claim}
              justification={row.justification}
              references={row.references}
              editJustification={editJustification}
              editClaim={editClaim}
              editReference={editReference}
              deleteRow={deleteRow}
            />
          );
        })}
      </div>

      <div className={styles["toolbox"]}>
        <button className={`${styles["tool-button"]} ${styles["button-gray"]}`} onClick={addNewRow} disabled={isUpdating}>
          + New Row
        </button>
        {id && editMode && (
          <>
            <Button variant="red" onClick={confirmDeleteProof} disabled={isUpdating}>
              Delete Proof
            </Button>
            <dialog ref={dialogBox} style={{ backgroundColor: "#111", color: "white", border: "none" }}>
              <p>Are you sure you want to delete this proof?</p>
              <div style={{ display: "flex", gap: "16px" }}>
                <Button variant="red" onClick={deleteProof} disabled={isUpdating}>
                  Delete Proof
                </Button>
                <Button variant="gray" onClick={() => dialogBox.current.close()} disabled={isUpdating}>
                  Cancel
                </Button>
              </div>
            </dialog>
          </>
        )}
        {id && session.user.admin && !proofStatus && (
          <Button variant="green" onClick={() => postProofStatus(true)} disabled={isUpdating}>
            Approve
          </Button>
        )}
        {id && session.user.admin && proofStatus && (
          <Button variant="red" onClick={() => postProofStatus(false)} disabled={isUpdating}>
            Withdraw
          </Button>
        )}
        {id && !proofStatus && <span>Pending professor approval.</span>}
        {/* <span className={styles["end-of-proof"]}>∎</span> */}
        <button className={`${styles["tool-button"]} ${styles["button-green"]}`} onClick={editMode ? submitEditedProof : submitNewProof} disabled={isUpdating}>
          ∎ Submit
        </button>
      </div>
      <p>{formFeedback}</p>
      <details style={{ backgroundColor: "#111", padding: "32px" }}>
        <summary style={{ marginTop: "0px" }}>Editor Help</summary>
        <p>Welcome to the Proof Editor! To get started with a new proof, click the &quot;+ New Row&quot; button.</p>

        <p>Edit the text of a row by clicking the &quot;Edit&quot; button.</p>
        <p>Any math you write should be incased in double dollar signs. For example:</p>

        <MarkdownRenderer content="`$$\sqrt{2} \not \in C$$` will render as: $$\sqrt{2} \not \in C$$" />

        <p>
          You can use the Character Buttons below the textbox to insert some common math characters used in proofs. LaTeX Math Keywords are also supported if put between
          the double dollar sign statement.
        </p>

        <p>Here are some LaTeX shortcuts that might be useful to you while you create your proofs:</p>

        <MarkdownRenderer content={"`\\neg` -> $$\\neg$$"} />
        <MarkdownRenderer content={"`\\in` -> $$\\in$$"} />
        <MarkdownRenderer content={"`\\not\\in` -> $$\\not\\in$$"} />
        <MarkdownRenderer content={"`\\subseteq` -> $$\\subseteq$$"} />
        <MarkdownRenderer content={"`\\forall` -> $$\\forall$$"} />
        <MarkdownRenderer content={"`\\exists` -> $$\\exists$$"} />
        <MarkdownRenderer content={"`\\wedge` -> $$\\wedge$$"} />
        <MarkdownRenderer content={"`\\vee` -> $$\\vee$$"} />
      </details>
    </MainLayout>
  );
}

export async function getServerSideProps(context) {
  try {
    if (!context.query.id) {
      return { props: { data: { rows: [] } } };
    }

    const { req } = context;

    const protocol = req.headers["x-forwarded-proto"] || "http";
    const baseUrl = req ? `${protocol}://${req.headers.host}` : "";
    // Fetch data from external API
    let data = await getProof(context.query.id);
    if (!data) {
      throw new Error("That proof does not exist.");
    }
    if (data.failed) {
      throw new Error(data.message);
    }
    data = JSON.parse(JSON.stringify(data));
    // const data = context.query.id ?? null;

    // Pass data to the page via props
    return { props: { data, id: context.query.id } };
  } catch (error) {
    console.log("====EDITORSERVERR", error);
    return { props: { data: { error: { message: error.message } } } };
  }
}
