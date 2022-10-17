import MainLayout from "../../components/MainLayout";
import useSWR from "swr";
import Card from "../../components/Card";
import { LinkedButton } from "../../components/Button";
import MarkdownRenderer from "../../components/MarkdownRenderer";
import styles from "../../styles/Library.module.css";
import Fullbox from "../../components/Fullbox";
import { useSession, signIn } from "next-auth/react";
import Loader from "../../components/Loader";

export default function ApprovalsIndex() {
  const { data: session, status: sessionStatus } = useSession({
    required: true,
    onUnauthenticated() {
      signIn("google");
    },
  });

  const { data, error } = useSWR("/api/teacher/proofs");

  if (error) {
    return (
      <MainLayout>
        <Fullbox>{error.info.message}</Fullbox>
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

      {data.length === 0 && <p>No proofs pending approval.</p>}

      <div className={styles["layout"]}>
        {data.map((proof) => {
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
