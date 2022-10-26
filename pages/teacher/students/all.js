import MainLayout from "../../../components/MainLayout";
import useSWRInfinite from "swr/infinite";
import { fetcher } from "../../../internals/fetcher";
import { useEffect, useState, useRef } from "react";
import Card from "../../../components/Card";
import { Button, LinkedButton } from "../../../components/Button";
import MarkdownRenderer from "../../../components/MarkdownRenderer";
import styles from "../../../styles/Library.module.css";
import Fullbox from "../../../components/Fullbox";
import Loader from "../../../components/Loader";
import Heading from "../../../components/Heading";
import { useSession, signIn, signOut } from "next-auth/react";
import useSWR from "swr";

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

export default function ApprovalsIndex() {
  const { data: session, status: sessionStatus } = useSession({
    required: true,
    onUnauthenticated() {
      signIn("google");
    },
  });

  const { data, error } = useSWR("/api/teacher/students");

  if (error) {
    return (
      <MainLayout>
        <Fullbox>
          <p className={styles["display-text"]}>{error.status}</p>
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
          Loading data...
        </Fullbox>
      </MainLayout>
    );
  }

  console.log("----------STUDENT PAGE DATA", data);

  return (
    <MainLayout>
      <div className={styles["flex-header"]}>
        <Heading>All Students</Heading>
        {/* <Button disabled={isValidating} onClick={() => mutate()}>
          {isValidating ? "Refreshing..." : "Refresh"}
        </Button> */}
      </div>

      {/* {data.map((page, index) => {
        console.log("----------PAGE", page);
        return page.users.map((user) => {
          return UserCard(user);
        });
      })} */}
      {data.users.map((user) => {
        return UserCard(user);
      })}

      {/* <Button disabled={noMoreUsers} onClick={() => setSize(size + 1)}>
        {noMoreUsers ? "No more students" : "Load more students"}
      </Button> */}
    </MainLayout>
  );
}
