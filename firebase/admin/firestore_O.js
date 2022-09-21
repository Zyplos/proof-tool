import { fs, db } from "./index";
import { getAuth } from "firebase-admin/auth";

// firebase has a role solution known as custom claims
// but this project might move away from firebase so this will do for now
const adminUids = process.env.NEXT_PUBLIC_ADMINS ? process.env.NEXT_PUBLIC_ADMINS.split(" ") : [];

export const fetchProof = async (proofId) => {
  const proofRef = fs.collection("proofs").doc(proofId);
  const doc = await proofRef.get();

  if (!doc.exists) {
    return null;
  }

  return doc.data();
};

const generateAnalyticsMap = (proofRows) => {
  const analytics = {};
  proofRows.forEach((row) => {
    analytics[row.id] = 0;
  });
  return analytics;
};

export const insertNewProof = async (proofData, token) => {
  try {
    const user = await verifyUserToken(token);
    console.log("FRIEBASE INSERTTING NEW PROOF", { proof: proofData });

    const dbRef = fs.collection("proofs");
    const newIdRef = await dbRef.add({ proof: proofData, uid: user.uid, created: new Date(), approved: false, analytics: generateAnalyticsMap(proofData) });

    console.log("FIREBASE NEW REF ID FUN", newIdRef);

    return newIdRef.id;
  } catch (error) {
    throw error;
  }
};

export const getStudentInfo = async (query, token) => {
  try {
    const user = await verifyUserToken(token);
    console.log("FRIEBASE GETTING NEW STUDNET INFO", query);

    if (!adminUids.includes(user.uid)) return { failed: true, error: "Unauthorized to get student info." };

    const userRecord = await getAuth().getUserByEmail(query);

    if (!userRecord) return null;
    console.log("FIREBASE USER RECORD", userRecord);

    let parsedSolvedProofs = [];
    let parsedCreatedProofs = [];

    // get student's solved proofs
    let solvedProofIds = [];
    const userRef = db.ref("users").child(userRecord.uid).child("solved");
    const result = await userRef.once("value");
    if (result.exists()) {
      console.log("FIREBASE GET USER SOLVED PROOFS NO DATA");
      const solved = result.val();
      console.log("FIREBASE GET USER SOLVEDPROOFS", solved);
      solvedProofIds = Object.keys(solved);
    }

    if (!result.exists() || solvedProofIds.length === 0) {
      parsedSolvedProofs = [];
    } else {
      const solvedProofRefs = solvedProofIds.map((id) => fs.collection("proofs").doc(id));

      const solvedProofs = await fs.getAll(...solvedProofRefs);

      solvedProofs.forEach((doc) => {
        console.log("------FRIEBASE STUDENTPROL SOLVEDPORRF ID", doc.id);
        if (doc.data() && doc.data().uid === userRecord.uid) return;
        if (doc.data()) {
          parsedSolvedProofs.push({ id: doc.id, first_entry: doc.data().proof[0] });
        }
      });
    }

    // // get student's created proofs
    // let createdProofIds = [];
    const createdProofs = await fs.collection("proofs").where("uid", "==", userRecord.uid).get();

    console.log("FIREBASE GETALLPROOFS", createdProofs.length);

    parsedCreatedProofs = createdProofs.docs.map((doc) => {
      return { id: doc.id, first_entry: doc.data().proof[0] };
    });

    console.log("--------FIREBASE TSUTNET PROFILE FINAL", parsedCreatedProofs, parsedSolvedProofs);

    return { solved: parsedSolvedProofs, created: parsedCreatedProofs };
  } catch (error) {
    console.error("FIREBASE TSUTNET PROFILE ERROR", error, error?.errorInfo?.code);
    if (error.errorInfo?.code === "auth/id-token-expired") return { failed: true, error: "Please refresh the page." };
    if (error.errorInfo?.code === "auth/user-not-found") return { failed: true, error: "Student wasn't found." };
    if (error.errorInfo?.code === "auth/invalid-email") return { failed: true, error: "You entered an invalid email." };
    return { failed: true, error: "An uncaught error has occurred." };
  }
};

export const getUserProfile = async (token) => {
  try {
    const user = await verifyUserToken(token);

    console.log("FIREBASE USER RECORD", user);
    let parsedSolvedProofs = [];
    let parsedCreatedProofs = [];

    // get student's solved proofs
    let solvedProofIds = [];
    const userRef = db.ref("users").child(user.uid).child("solved");
    const result = await userRef.once("value");
    if (result.exists()) {
      console.log("FIREBASE GET USER SOLVED PROOFS NO DATA");
      const solved = result.val();
      console.log("FIREBASE GET USER SOLVEDPROOFS", solved);
      solvedProofIds = Object.keys(solved);
    }

    if (!result.exists() || solvedProofIds.length === 0) {
      parsedSolvedProofs = [];
    } else {
      const solvedProofRefs = solvedProofIds.map((id) => fs.collection("proofs").doc(id));

      const solvedProofs = await fs.getAll(...solvedProofRefs);

      solvedProofs.forEach((doc) => {
        console.log("------FRIEBASE STUDENTPROL SOLVEDPORRF ID", doc.id);
        if (doc.data() && doc.data().uid === user.uid) return;
        if (doc.data()) {
          parsedSolvedProofs.push({ id: doc.id, first_entry: doc.data().proof[0] });
        }
      });
    }
    // // get student's created proofs
    // let createdProofIds = [];
    const createdProofs = await fs.collection("proofs").where("uid", "==", user.uid).get();

    console.log("FIREBASE GETALLPROOFS", createdProofs.length);

    parsedCreatedProofs = createdProofs.docs.map((doc) => {
      return { id: doc.id, first_entry: doc.data().proof[0] };
    });

    console.log("--------FIREBASE TSUTNET PROFILE FINAL", parsedCreatedProofs, parsedSolvedProofs);

    return { solved: parsedSolvedProofs, created: parsedCreatedProofs };
  } catch (error) {
    console.error("FIREBASE TSUTNET PROFILE ERROR", error, error?.errorInfo?.code);
    if (error.errorInfo?.code === "auth/id-token-expired") return { failed: true, error: "Please refresh the page." };
    if (error.errorInfo?.code === "auth/user-not-found") return { failed: true, error: "Student wasn't found." };
    return { failed: true, error: "An uncaught error has occurred." };
  }
};

export const updateProof = async (id, proofData, token) => {
  try {
    const user = await verifyUserToken(token);

    console.log("FIREBASE FILE UPDATEPROOF", id, proofData);
    const dbRef = fs.collection("proofs").doc(id);

    const check = await dbRef.get();

    if (!check.exists) {
      return { check: false, error: "Seems you're editing a proof that doesn't exist." };
    }

    if (check.data().uid !== user.uid) {
      if (!adminUids.includes(user.uid)) return { check: false, error: "You do not have permission to edit this proof." };
    }

    const result = await dbRef.update({ proof: proofData, edited: new Date(), analytics: generateAnalyticsMap(proofData) });

    console.log("PROOF UPDATED", result);

    return { check: true, ...result };
  } catch (error) {
    console.error("FIREBASE UPDATEPROOF ERROR", error);
    return { check: false, error: "An uncaught error has occurred." };
  }
};

export const setProofStatus = async (id, approved, token) => {
  try {
    const user = await verifyUserToken(token);
    if (!adminUids.includes(user.uid)) return { check: false, error: "You do not have permission to edit this proof." };

    console.log("FIREBASE FILE UPDATEPROOF", id, approved);
    const dbRef = fs.collection("proofs").doc(id);

    const check = await dbRef.get();

    if (!check.exists) {
      return { check: false, error: "Seems you're editing a proof that doesn't exist." };
    }

    const result = await dbRef.update({ approved });

    console.log("PROOF STATUS UPDATED", result);

    return { check: true, ...result };
  } catch (error) {
    console.error("FIREBASE SETPROOFSTATUS ERROR", error);
    return { check: false, error: "An uncaught error has occurred." };
  }
};

export const deleteProof = async (id, token) => {
  try {
    const user = await verifyUserToken(token);

    console.log("FIREBASE FILE UPDATEPROOF", id);
    const dbRef = fs.collection("proofs").doc(id);

    const check = await dbRef.get();

    if (!check.exists) {
      return { check: false, error: "Seems you're editing a proof that doesn't exist." };
    }

    if (check.data().uid !== user.uid) {
      if (!adminUids.includes(user.uid)) return { check: false, error: "You do not have permission to edit this proof." };
    }

    const result = await dbRef.delete();

    console.log("FIREBASE PROOF DELETED", result);

    return { check: true, ...result };
  } catch (error) {
    console.error("FIREBASE PROOF DELETE ERROR", error);
    return { check: false, error: "An uncaught error has occurred." };
  }
};

export const getAllProofs = async () => {
  const snapshot = await fs.collection("proofs").where("approved", "==", true).get();

  if (snapshot.empty) {
    return null;
  }

  console.log("FIREBASE GETALLPROOFS", snapshot.docs.length);

  return {
    proofs: snapshot.docs.map((doc) => {
      return { id: doc.id, first_entry: doc.data().proof[0] };
    }),
  };
};

export const getAllPendingProofs = async (token) => {
  try {
    const user = await verifyUserToken(token);
    if (!adminUids.includes(user.uid)) return { failed: true, error: "Unauthorized to get all pending proofs." };

    const snapshot = await fs.collection("proofs").where("approved", "==", false).get();

    return {
      proofs: snapshot.docs.map((doc) => {
        return { id: doc.id, first_entry: doc.data().proof[0] };
      }),
    };
  } catch (error) {
    console.error("FIREBASE PROOF DELETE ERROR", error);
    return { failed: true, error: "An uncaught error has occurred." };
  }
};

export async function verifyUserToken(token) {
  console.log("VERIFY USER TOKEN RUNNING", token);
  try {
    const usertoken = await getAuth().verifyIdToken(token);
    return usertoken;
  } catch (error) {
    console.log("FIREBASE VERIFY USER TOKEN ERROR", error);
    throw error;
  }
}

export async function getUserSolvedProofs(token) {
  try {
    const user = await verifyUserToken(token);
    const userRef = db.ref("users").child(user.uid).child("solved");
    const result = await userRef.once("value");

    if (!result.exists()) {
      console.log("FIREBASE GET USER SOLVED PROOFS NO DATA");
      return [];
    }

    const solved = result.val();
    console.log("FIREBASE GET USER SOLVEDPROOFS", solved);
    return Object.keys(solved);
  } catch (error) {
    console.log("FIREBASE GET USERSOLVEDPROOFS ERROR", error);
    return [];
  }
}

export async function getUserCreatedProofs(uid) {
  try {
    const userRef = fs.collection("proofs").where("uid", "==", uid);
    const result = await userRef.get();

    if (result.empty) {
      console.log("FIREBASE GET USERCREATEDPROOFS NO DATA");
      return [];
    }

    // const created = result.data();
    console.log("FIREBASE GET USERCREATEDPROOFS", result.docs);
    return result.docs.map((doc) => {
      return { id: doc.id, first_entry: doc.data().proof[0] };
    });
  } catch (error) {
    console.log("FIREBASE GET USERCREATEDPROOFS ERROR", error);
    return [];
  }
}

export async function saveSolvedIdToUser(proofId, token) {
  try {
    const user = await verifyUserToken(token);
    const userRef = db.ref("users").child(user.uid).child("solved");
    const result = await userRef.update({ [proofId]: true });
    console.log("FIREBASE USER UPDATED", result);
    return true;
  } catch (error) {
    console.log("FIREBASE USER UPDATED ERROR", error);
    return false;
  }
}
