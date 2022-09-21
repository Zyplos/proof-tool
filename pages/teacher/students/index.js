import MainLayout from "../../../components/MainLayout";
import useSWR from "swr";
import { authFetcher } from "../../../internals/fetcher";
import { useAuth } from "../../../firebase/app/AuthUserContext";
import { useEffect, useState, useRef } from "react";
import Card from "../../../components/Card";
import { Button, LinkedButton } from "../../../components/Button";
import MarkdownRenderer from "../../../components/MarkdownRenderer";
import styles from "../../../styles/Library.module.css";
import Fullbox from "../../../components/Fullbox";
import Loader from "../../../components/Loader";
import Heading from "../../../components/Heading";

export default function ApprovalsIndex() {
  const { getIdToken, authUser, loading } = useAuth();
  const [idToken, setIdToken] = useState(null);
  const [searchUid, setSearchUid] = useState(null);

  const searchRef = useRef();

  const { data, error } = useSWR(idToken && searchUid ? ["/api/teacher/students/" + searchUid, idToken] : null, authFetcher);

  // useEffect to asyncronously getIdToken
  useEffect(() => {
    async function grabToken() {
      const token = await getIdToken();
      setIdToken(token);
    }

    grabToken();
  }, [getIdToken]);

  if (loading) {
    return (
      <MainLayout>
        <Fullbox>
          <Loader width="128px" height="128px" />
          Loading user...
        </Fullbox>
      </MainLayout>
    );
  }

  if (!loading && !authUser) {
    return (
      <MainLayout>
        <Fullbox>Not logged in.</Fullbox>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <Fullbox>
          <p className={styles["display-text"]}>{error.status}</p>
          <p>{error.status == "404" ? "That user wasn't found." : error.info.message}</p>
        </Fullbox>
      </MainLayout>
    );
  }

  function handleSubmit(event) {
    event.preventDefault();
    const searchString = searchRef.current.value;
    console.log("AHNDLINGSUBIT", searchString);
    setSearchUid(searchString);
  }

  console.log("----------STUDENT PAGE DATA", data);

  return (
    <MainLayout>
      <div className={styles["flex-header"]}>
        <Heading>Student Search</Heading>
        <LinkedButton href="/teacher/students/all">View All</LinkedButton>
      </div>

      <form onSubmit={handleSubmit} style={{ marginBottom: "32px" }}>
        <label>
          Email
          <input type="text" name="name" ref={searchRef} style={{ margin: "0 16px" }} />
        </label>
        <input
          type="submit"
          value="Submit"
          style={{ padding: "10px 20px", border: "none", color: "inherit", cursor: "pointer", backgroundColor: "#08a850", color: "#fff" }}
        />
      </form>

      {error && <p>{error.info.message}</p>}

      <h2>Created Proofs</h2>
      {data && data.created.failed && <p>{data.created.message || "Error trying to get created proofs for student."}</p>}

      {data && data.created.length >= 0 && (
        <>
          <p>Total {data.created.length} created proofs.</p>
          <div className={styles["layout"]}>
            {data &&
              data.created?.map((proof) => {
                console.log("MAPPING ID", proof);
                return (
                  <Card key={proof.id} footer={<LinkedButton href={`/proof/editor?id=${proof.id}`}>Edit</LinkedButton>}>
                    <MarkdownRenderer content={proof.first_entry.claim} />
                  </Card>
                );
              })}
          </div>
        </>
      )}

      <h2>Solved Proofs</h2>
      {data && data.solved.failed && <p>{data.solved.message || "Error trying to get created proofs for student."}</p>}

      {data && data.solved.length >= 0 && (
        <>
          <p>Total {data.solved.length} solved proofs.</p>
          <div className={styles["layout"]}>
            {data &&
              data.solved?.map((proof) => {
                console.log("MAPPING ID", proof);
                return (
                  <Card key={proof.id} footer={<LinkedButton href={`/proof/editor?id=${proof.id}`}>Edit</LinkedButton>}>
                    <MarkdownRenderer content={proof.first_entry.claim} />
                  </Card>
                );
              })}
          </div>
        </>
      )}
    </MainLayout>
  );
}
