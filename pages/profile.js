import MainLayout from "../components/MainLayout";
import useSWR from "swr";
import { authFetcher } from "../internals/fetcher";
import { useAuth } from "../firebase/app/AuthUserContext";
import { useEffect, useState } from "react";
import Card from "../components/Card";
import { Button, LinkedButton } from "../components/Button";
import MarkdownRenderer from "../components/MarkdownRenderer";
import styles from "../styles/Library.module.css";
import Fullbox from "../components/Fullbox";
import Loader from "../components/Loader";
import Heading from "../components/Heading";

function proofplural(num) {
  return num === 1 ? "proof" : "proofs";
}

export default function YourProofs() {
  const { getIdToken, authUser, loading, signOut } = useAuth();
  const [idToken, setIdToken] = useState(null);

  const { data, error } = useSWR(idToken ? ["/api/user", idToken] : null, authFetcher);

  useEffect(() => {
    async function grabToken() {
      const token = await getIdToken();
      setIdToken(token);
    }

    grabToken();
  }, [getIdToken]);

  if (!loading && !authUser) {
    return (
      <MainLayout>
        <Fullbox>
          <p className={styles["display-text"]}>Oops!</p>
          <p>You must be signed in to see your profile.</p>
        </Fullbox>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <Fullbox>
          <p className={styles["display-text"]}>{error.status}</p>
          <p>{error.status == "404" ? "That proof wasn't found." : error.info.message}</p>
        </Fullbox>
      </MainLayout>
    );
  }

  if (!data) {
    return (
      <MainLayout>
        <Fullbox>
          <Loader width="128px" height="128px" />
          Loading proofs...
        </Fullbox>
      </MainLayout>
    );
  }

  console.log("YUOURPROOFS DATA", data, error);

  return (
    <MainLayout>
      <div className={styles["flex-header"]}>
        <Heading>Profile</Heading>
        <Button onClick={signOut}>Sign Out</Button>
      </div>
      {authUser && authUser.email && (
        <p>
          Signed in as <b>{authUser.email}</b>.
        </p>
      )}

      <h2>Your Proofs</h2>
      {data && (
        <p>
          Created {data.created.length} {proofplural(data.created.length)}.
        </p>
      )}

      <div className={styles["layout"]}>
        {data.created.map((proof) => {
          return (
            <Card key={proof.id} footer={<LinkedButton href={`/proof/editor?id=${proof.id}`}>Edit</LinkedButton>}>
              <MarkdownRenderer content={proof.first_entry.claim} />
            </Card>
          );
        })}
      </div>

      <h2>Solved Proofs</h2>
      {data && (
        <p>
          Solved {data.solved.length} {proofplural(data.solved.length)}.
        </p>
      )}
      <div className={styles["layout"]}>
        {data.solved.map((proof) => {
          return (
            <Card key={proof.id} footer={<LinkedButton href={`/proof/solve/${proof.id}`}>Solve Again</LinkedButton>}>
              <MarkdownRenderer content={proof.first_entry.claim} />
            </Card>
          );
        })}
      </div>
    </MainLayout>
  );
}
