import MainLayout from "../../components/MainLayout";
import useSWR from "swr";
import fetcher, { authFetcher } from "../../internals/fetcher";
import { useAuth } from "../../firebase/app/AuthUserContext";
import { useEffect, useState } from "react";
import Card from "../../components/Card";
import { LinkedButton } from "../../components/Button";
import MarkdownRenderer from "../../components/MarkdownRenderer";
import styles from "../../styles/Library.module.css";
import Fullbox from "../../components/Fullbox";

export default function ApprovalsIndex() {
  const { getIdToken, authUser, loading } = useAuth();
  const [idToken, setIdToken] = useState(null);

  const { data, error } = useSWR(idToken ? ["/api/teacher/proofs", idToken] : null, authFetcher);

  // useEffect to asyncronously getIdToken
  useEffect(() => {
    async function grabToken() {
      const token = await getIdToken();
      setIdToken(token);
    }

    grabToken();
  }, [getIdToken]);

  if (error) {
    return (
      <MainLayout>
        <Fullbox>{error.info.message}</Fullbox>
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

  if (!data) {
    return (
      <MainLayout>
        <Fullbox>Loading...</Fullbox>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <h1>Pending Approval</h1>

      {data.proofs.length === 0 && <p>No proofs pending approval.</p>}

      <div className={styles["layout"]}>
        {data.proofs.map((proof) => {
          return (
            <Card key={proof.id} footer={<LinkedButton href={`/proof/editor?id=${proof.id}`}>View</LinkedButton>}>
              <MarkdownRenderer content={proof.first_entry.claim} />
            </Card>
          );
        })}
      </div>
    </MainLayout>
  );
}
