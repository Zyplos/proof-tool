import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import useSWRImmutable from "swr/immutable";
import { randomId } from "../../internals/utils";

import Fullbox from "../../components/Fullbox";
import Loader from "../../components/Loader";
import MainLayout from "../../components/MainLayout";
import Navbar from "../../components/Navbar";
import EditableMarkdown from "../../components/EditableMarkdown";
import styles from "../../styles/Proof.module.css";
import { authFetcher, fetcher } from "../../internals/fetcher";

import { useAuth } from "../../firebase/app/AuthUserContext";
import Heading from "../../components/Heading";
import { Button, LinkedButton } from "../../components/Button";
import JustificationDropdown from "../../components/JustificationDropdown";
import MarkdownRenderer from "../../components/MarkdownRenderer";

function JustificationRow({ id, rowNum, initialClaimText, justification, editProof, deleteRow }) {
  function setClaimText(newText) {
    editProof(id, newText, justification);
  }

  function setJustification(newJustification) {
    // console.log("SETTING NEW JUSTIFICATION", id, initialClaimText, newJustification);
    editProof(id, initialClaimText, newJustification);
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
      </div>
      <div className={styles["mobile-separator"]}></div>
    </>
  );
}

export default function Proof({ data, id }) {
  const { loading, authUser, getIdToken } = useAuth();
  const router = useRouter();

  console.log("PROOFPAGE", data, id, authUser);

  const [rows, setRows] = useState(data.proof);
  const [proofStatus, setProofStatus] = useState(data.approved);
  const [formFeedback, setFormFeedback] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  const dialogBox = useRef(null);

  useEffect(() => {
    if (!id) {
      setRows([
        {
          claim:
            "Welcome to the Editor!\nMath goes in double dollar signs, like this: \n$$ \\sqrt{5} \\not\\in C $$\nEdit this row to see how that math is formatted, or take a look at the Editor Help below.",
          justification: "given",
          id: randomId(),
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

  if (loading) {
    return (
      <MainLayout>
        <Fullbox>
          <Loader width="128px" height="128px" />
          Checking user...
        </Fullbox>
      </MainLayout>
    );
  }

  if (!loading && !authUser) {
    return (
      <MainLayout>
        <Fullbox>
          <p className={styles["display-text"]}>Oops</p>
          <p>You must be signed in to use the editor.</p>
        </Fullbox>
      </MainLayout>
    );
  }

  // if (id && data.uid !== authUser.uid) {
  //   if (!process.env.NEXT_PUBLIC_ADMINS.includes(authUser.uid)) {
  //     return (
  //       <MainLayout>
  //         <Fullbox>
  //           <p className={styles["display-text"]}>Oops!</p>
  //           <p>You cannot view proofs you did not make.</p>
  //         </Fullbox>
  //       </MainLayout>
  //     );
  //   }
  // }

  const editMode = data.proof.length > 0;

  function addNewRow() {
    setRows((prevRows) => {
      return [...prevRows, { claim: "", justification: "given", id: randomId() }];
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

  async function submitNewProof() {
    setIsUpdating(true);

    if (rows.length < 2) {
      setIsUpdating(false);
      setFormFeedback("You must have at least two rows in your proof.");
      return;
    }

    setFormFeedback("Submitting new proof...");
    const firebaseToken = await getIdToken();
    if (!firebaseToken) {
      setIsUpdating(false);
      setFormFeedback("You must be logged in to submit a proof.");
      return;
    }

    authFetcher("/api/proofs", firebaseToken, {
      method: "POST",
      body: JSON.stringify({ rows }),
    })
      .then((newData) => {
        // console.log(newData);
        // mutate({ ...data, proof: rows });
        setFormFeedback(<span className="info">Proof submitted. It must be approved before it shows up in the library.</span>);
        router.push("/proof/editor?id=" + newData.id).then(() => {
          setIsUpdating(false);
        });
      })
      .catch((err) => {
        setIsUpdating(false);

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
    const firebaseToken = await getIdToken();
    if (!firebaseToken) {
      setIsUpdating(false);
      setFormFeedback("You must be logged in to submit a proof.");
      return;
    }
    console.log("SUBMITING EDITED PROOF", rows, firebaseToken);
    authFetcher("/api/proofs/" + id, firebaseToken, {
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
    const firebaseToken = await getIdToken();
    if (!firebaseToken) {
      setIsUpdating(false);
      setFormFeedback("You must be logged in to submit a proof.");
      return;
    }
    authFetcher("/api/proofs/" + id, firebaseToken, {
      method: "DELETE",
    })
      .then(() => {
        // mutate({ ...data, proof: rows });
        setFormFeedback(<span className="info">Proof deleted.</span>);
        router.push("/profile").then(() => {
          setIsUpdating(false);
        });
      })
      .catch((err) => {
        setIsUpdating(false);
        setFormFeedback(<span className="error">Sorry, could not delete this proof. {err.info.message}</span>);
      });
  }

  async function postProofStatus(bool) {
    setIsUpdating(true);
    const firebaseToken = await getIdToken();
    if (!firebaseToken) {
      setIsUpdating(false);
      setFormFeedback("You must be logged in to submit a proof.");
      return;
    }
    authFetcher("/api/teacher/status/" + id, firebaseToken, {
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
        setFormFeedback(<span className="error">Sorry, got an error trying to set peoof status. {err.info.message}</span>);
      });
  }

  // if (!router.query.id) {
  //   return <div>No proof id</div>;
  // }

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
              editProof={editProof}
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
            <Button type="red" onClick={confirmDeleteProof} disabled={isUpdating}>
              Delete Proof
            </Button>
            <dialog ref={dialogBox} style={{ backgroundColor: "#111", color: "white", border: "none" }}>
              <p>Are you sure you want to delete this proof?</p>
              <div style={{ display: "flex", gap: "16px" }}>
                <Button type="red" onClick={deleteProof} disabled={isUpdating}>
                  Delete Proof
                </Button>
                <Button type="gray" onClick={() => dialogBox.current.close()} disabled={isUpdating}>
                  Cancel
                </Button>
              </div>
            </dialog>
          </>
        )}
        {id && authUser.admin && !proofStatus && (
          <Button type="green" onClick={() => postProofStatus(true)} disabled={isUpdating}>
            Approve
          </Button>
        )}
        {id && authUser.admin && proofStatus && (
          <Button type="red" onClick={() => postProofStatus(false)} disabled={isUpdating}>
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
      return { props: { data: { proof: [] } } };
    }

    const { req } = context;

    const protocol = req.headers["x-forwarded-proto"] || "http";
    const baseUrl = req ? `${protocol}://${req.headers.host}` : "";
    // Fetch data from external API
    const data = await fetcher(baseUrl + "/api/proofs/" + context.query.id);
    // const data = context.query.id ?? null;

    // Pass data to the page via props
    return { props: { data, id: context.query.id } };
  } catch (error) {
    console.log(error);
    return { props: { data: { error: { message: error?.info?.error ?? error.message, status: error.status } } } };
  }
}
