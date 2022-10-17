import useSWR from "swr";
import styles from "../styles/Library.module.css";

import MainLayout from "../components/MainLayout";
import Fullbox from "../components/Fullbox";
import Loader from "../components/Loader";
import Card from "../components/Card";
import { LinkedButton } from "../components/Button";
import MarkdownRenderer from "../components/MarkdownRenderer";
import Head from "next/head";
import { useSession } from "next-auth/react";

function CardFooter({ proofId, authUser }) {
  return (
    <>
      <LinkedButton href={`/proof/solve/${proofId}`}>Solve</LinkedButton>
      {authUser && authUser.user.admin && <LinkedButton href={`/proof/editor?id=${proofId}`}>Edit</LinkedButton>}
    </>
  );
}

export default function Library() {
  const { data: session, status } = useSession();
  const { data: proofsData, error: proofsError } = useSWR("/api/proofs");
  const { data: solvedIdsData, error: solvedIdsError } = useSWR(session ? "/api/user/solved" : null);

  console.log("========SESSIONIDNEX", session);

  if (proofsError) {
    return (
      <MainLayout>
        <Fullbox>
          <p className={styles["display-text"]}>{error.status == "404" ? "Oops!" : error.status}</p>
          <p>{error.info.message}</p>
        </Fullbox>
      </MainLayout>
    );
  }

  if (!proofsData) {
    return (
      <MainLayout>
        <Fullbox>
          <Loader width="128px" height="128px" />
          Grabbing Proofs...
        </Fullbox>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Head>
        <title>Proof Tool</title>
        <meta name="description" content="indev" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <h1>Library</h1>
      {proofsData.length === 0 && <p>Seems no proofs are in The Library at the moment. Check back later!</p>}
      <div className={styles["layout"]}>
        {proofsData.map((proof) => {
          console.log("MAPPING ID", proof);
          return (
            <Card
              key={proof.id}
              footer={<CardFooter authUser={session ?? null} proofId={proof.id} />}
              className={solvedIdsData?.solvedIds?.includes(proof.id) ? styles["green-border"] : ""}
            >
              <MarkdownRenderer content={proof.first_entry.claim} />
            </Card>
          );
        })}
      </div>
    </MainLayout>
  );
}
