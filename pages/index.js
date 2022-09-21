import { useEffect, useRef, useState } from "react";
import useSWR from "swr";
import styles from "../styles/Library.module.css";

import MainLayout from "../components/MainLayout";
import Fullbox from "../components/Fullbox";
import Loader from "../components/Loader";
import Card from "../components/Card";
import { LinkedButton } from "../components/Button";
import MarkdownRenderer from "../components/MarkdownRenderer";
import { useAuth } from "../firebase/app/AuthUserContext";
import { fetcher, authFetcher } from "../internals/fetcher";
import Head from "next/head";

function CardFooter({ proofId, authUser }) {
  return (
    <>
      <LinkedButton href={`/proof/solve/${proofId}`}>Solve</LinkedButton>
      {authUser && authUser.admin && <LinkedButton href={`/proof/editor?id=${proofId}`}>Edit</LinkedButton>}
    </>
  );
}

export default function Library() {
  const { getIdToken, authUser } = useAuth();
  const { data, error } = useSWR("/api/proofs");
  const [solvedProofs, setSolvedProofs] = useState([]);

  useEffect(() => {
    if (!getIdToken) return;

    const fetchSolvedProofs = async () => {
      const firebaseUserIdToken = await getIdToken();
      if (!firebaseUserIdToken) {
        setSolvedProofs([]);
        return;
      }

      const solved = await authFetcher("/api/user/solved", firebaseUserIdToken);
      setSolvedProofs(solved.proofs);
    };

    fetchSolvedProofs().catch(console.error);
  }, [getIdToken]);

  if (error) {
    return (
      <MainLayout>
        <Fullbox>
          <p className={styles["display-text"]}>{error.status == "404" ? "Oops!" : error.status}</p>
          <p>{error.info.message}</p>
        </Fullbox>
      </MainLayout>
    );
  }

  if (!data) {
    return (
      <MainLayout>
        <Fullbox>
          <Loader width="128px" height="128px" />
          Grabbing Proofs...
        </Fullbox>
      </MainLayout>
    );
  }

  if (!solvedProofs) {
    return (
      <MainLayout>
        <Fullbox>
          <Loader width="128px" height="128px" />
          Fetching solved proofs...
        </Fullbox>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Head>
        <title>Proof Study</title>
        <meta name="description" content="indev" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <h1>Library</h1>
      <div className={styles["layout"]}>
        {data.proofs.map((proof) => {
          console.log("MAPPING ID", proof);
          return (
            <Card
              key={proof.id}
              footer={<CardFooter authUser={authUser ?? null} proofId={proof.id} />}
              className={solvedProofs.includes(proof.id) ? styles["green-border"] : ""}
            >
              <MarkdownRenderer content={proof.first_entry.claim} />
            </Card>
          );
        })}
      </div>
    </MainLayout>
  );
}
