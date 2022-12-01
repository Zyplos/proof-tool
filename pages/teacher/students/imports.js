import { signIn, useSession } from "next-auth/react";
import { useState } from "react";
import { useRef } from "react";
import { Button, LinkedButton } from "../../../components/Button";
import Card from "../../../components/Card";
import Heading from "../../../components/Heading";
import MainLayout from "../../../components/MainLayout";
import MarkdownRenderer from "../../../components/MarkdownRenderer";
import { fetcher } from "../../../internals/fetcher";
import { isBlank, randomId, validListFromString } from "../../../internals/utils";
import styles from "../../../styles/Library.module.css";

function UserCard(user) {
  if (user.failed) {
    return (
      <Card style={{ backgroundColor: "#333333", padding: "32px", marginBottom: "32px" }}>
        <p>
          {user.displayName} ({user.email})
        </p>
        <p></p>
      </Card>
    );
  }

  return (
    <details style={{ backgroundColor: "#333333", padding: "32px", marginBottom: "32px" }}>
      <summary style={{ marginTop: "0px" }}>
        {user.displayName} ({user.email}) • {user.created.failed ? <span>Error getting created proofs</span> : <span>Created proofs: {user.created.length}</span>} •{" "}
        {user.solved.failed ? <span>Error getting solved proofs</span> : <span>Solved proofs: {user.solved.length}</span>}
      </summary>

      <h2 style={{ marginTop: "32px" }}>Created Proofs</h2>
      {user.created.length >= 0 && (
        <>
          <p>Total {user.created.length} created proofs.</p>
          <div className={styles["layout"]}>
            {user.created?.map((proof) => {
              console.log("MAPPING ID", proof);
              return (
                <Card key={proof.id} footer={<LinkedButton href={`/proof/editor?id=${proof.id}`}>Edit</LinkedButton>}>
                  <MarkdownRenderer content={proof.first_entry} />
                </Card>
              );
            })}
          </div>
        </>
      )}

      <h2>Solved Proofs</h2>

      {user.solved.length >= 0 && (
        <>
          <p>Total {user.solved.length} solved proofs.</p>
          <div className={styles["layout"]}>
            {user.solved?.map((proof) => {
              console.log("MAPPING ID", proof);
              return (
                <Card key={proof.id} footer={<LinkedButton href={`/proof/editor?id=${proof.id}`}>Edit</LinkedButton>}>
                  <MarkdownRenderer content={proof.first_entry} />
                </Card>
              );
            })}
          </div>
        </>
      )}
    </details>
  );
}

export default function ImportStudents() {
  const { data: session, status: sessionStatus } = useSession({
    required: true,
    onUnauthenticated() {
      signIn("google");
    },
  });

  const [isUpdating, setIsUpdating] = useState(false);
  const [semester, setSemester] = useState("spring");
  const [year, setYear] = useState(new Date().getFullYear());
  const [studentList, setStudentList] = useState("");
  const dialogBox = useRef(null);

  const [queriedData, setQueriedData] = useState({ users: [] });

  function showConfirmModal() {
    dialogBox.current.showModal();
    dialogBox.current.scrollTop = 0;
  }

  async function queryData() {
    console.log("SUBMITTING DEV FORM");
    // setFormFeedback("Submitting...");

    try {
      const result = await fetcher("/api/teacher/students/bulk", {
        method: "POST",
        body: JSON.stringify({ query: validListFromString(studentList) }),
      });
      console.log("CHECKSUBMIT", result);
      dialogBox.current.close();
      setQueriedData(result);
    } catch (error) {
      console.log("ERROR SUBMITTING PROOF", error);
      // setFormFeedback(<span className="error">Sorry, got an error. {error.info.message}</span>);
    }
  }

  return (
    <MainLayout>
      <Heading>Import Students</Heading>
      <p>Import students to make them searchable by semester. Separate students with commas. (ex: acarba4, emccarty, etc...)</p>

      <textarea
        style={{ width: "100%", height: "300px", backgroundColor: "#111", color: "#fff" }}
        value={studentList}
        onChange={(e) => setStudentList(e.target.value)}
        required
      ></textarea>

      <div style={{ display: "flex", marginBottom: "16px" }}>
        <Button variant="green" onClick={showConfirmModal}>
          Submit
        </Button>
      </div>

      {queriedData.users.map((user) => {
        return UserCard(user);
      })}

      <dialog ref={dialogBox} style={{ backgroundColor: "#111", color: "white", border: "none" }}>
        <p>Looking for profiles from the following students:</p>
        {validListFromString(studentList).map((student, index) => {
          return (
            <p key={randomId()}>
              {index + 1}. {student}
            </p>
          );
        })}
        <div style={{ display: "flex", gap: "16px" }}>
          <Button variant="green" onClick={queryData} disabled={isUpdating}>
            Okay
          </Button>
          <Button variant="gray" onClick={() => dialogBox.current.close()} disabled={isUpdating}>
            Cancel
          </Button>
        </div>
      </dialog>
    </MainLayout>
  );
}
