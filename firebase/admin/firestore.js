import { fs, db, auth } from "./index";

// firebase has a role solution known as custom claims
// but this project might move away from firebase so this will do for now
const adminUids = process.env.NEXT_PUBLIC_ADMINS ? process.env.NEXT_PUBLIC_ADMINS.split(" ") : [];

// Verify the user's jwt token and teturn their profile
export async function verifyUserToken(token) {
  try {
    console.log("FIREBASE | VERIFYUSERTOKEN + RUNNING", token);
    const usertoken = await auth.verifyIdToken(token);
    return usertoken;
  } catch (error) {
    console.log("FIREBASE | VERIFYUSERTOKEN x ERROR", error);
    if (error.errorInfo?.code === "auth/id-token-expired") return { failed: true, message: "You don't seem to be logged in. Please refresh the page." };
    if (error.errorInfo?.code === "auth/user-not-found") return { failed: true, message: "Student wasn't found." };
    if (error.errorInfo?.code === "auth/invalid-email") return { failed: true, message: "You entered an invalid email." };

    return { failed: true, message: "An uncaught error has occurred trying to verify your login." };
  }
}

// Given a proof id, return the proof data
// returns null if proof not found
export async function fetchProof(proofId) {
  const proofRef = fs.collection("proofs").doc(proofId);
  const doc = await proofRef.get();

  if (!doc.exists) {
    console.log("FIREBASE | FETCHPROOF + DOESNT EXIST");
    return null;
  }

  return doc.data();
}

// Takes a Firebase query result of proofs and returns an array of proof preview objects,
function formatProofPreview(queryResult) {
  return queryResult.docs.map((doc) => {
    return { id: doc.id, first_entry: doc.data().proof[0] };
  });
}

// Return all approved proofs in the database
export const getAllProofs = async () => {
  const queryResult = await fs.collection("proofs").where("approved", "==", true).get();

  if (queryResult.empty) {
    return null;
  }

  console.log("FIREBASE GETALLPROOFS", queryResult.docs.length);

  return {
    proofs: formatProofPreview(queryResult),
  };
};

// Return all proofs that have not been approved yet
export const getAllPendingProofs = async (uid) => {
  console.log("FIREBASE | GETALLPENDINGPROOFS + RUNNING", uid, adminUids);
  try {
    if (!adminUids.includes(uid)) return { failed: true, message: "Unauthorized to get all pending proofs." };

    const queryResult = await fs.collection("proofs").where("approved", "==", false).get();
    return {
      proofs: formatProofPreview(queryResult),
    };
  } catch (error) {
    console.error("FIREBASE PROOF DELETE ERROR", error);
    return { failed: true, message: "An uncaught error has occurred." };
  }
};

// Given proof rows, will return an object with each row's id with a counter set to zero
const generateAnalyticsMap = (proofRows) => {
  const analytics = {};
  proofRows.forEach((row) => {
    analytics[row.id] = 0;
  });
  return analytics;
};

export const insertNewProof = async (proofRows, uid) => {
  try {
    console.log("FIREBASE | INSERTNEWPROOF + working", { proof: proofRows });

    const collectionRef = fs.collection("proofs");
    const newDocRef = await collectionRef.add({ proof: proofRows, uid, created: new Date(), approved: false, analytics: generateAnalyticsMap(proofRows) });

    console.log("FIREBASE NEW REF ID FUN", newDocRef);

    return newDocRef.id;
  } catch (error) {
    console.error("Tried creating new proof document with malformated proof data", error);
    return { failed: true, message: "An unexpected error has occurred." };
  }
};

export const updateProof = async (id, proofRows, uid) => {
  try {
    console.log("FIREBASE | UPDATEPROOF + working", id, proofRows);

    const check = await fetchProof(id);
    console.log("FIREBASE | UPDATEPROOF + check", check);
    if (!check) {
      return { failed: true, message: "The proof you tried to update doesn't exist." };
    }
    if (check.uid !== uid) {
      if (!adminUids.includes(uid)) return { failed: true, message: "You do not have permission to edit this proof." };
    }

    const dbRef = fs.collection("proofs").doc(id);
    const result = await dbRef.update({ proof: proofRows, edited: new Date(), analytics: generateAnalyticsMap(proofRows) });

    return result;
  } catch (error) {
    console.error("FIREBASE UPDATEPROOF ERROR", error);
    if (error.message.includes("NOT_FOUND")) return { failed: true, message: "The proof you tried to update doesn't exist." };
    return { failed: true, message: "An uncaught error has occurred." };
  }
};

export const setProofStatus = async (id, approved, uid) => {
  try {
    if (!adminUids.includes(uid)) return { failed: true, message: "You do not have permission to edit the status of this proof." };

    const dbRef = fs.collection("proofs").doc(id);
    const result = await dbRef.update({ approved });

    return result;
  } catch (error) {
    console.error("FIREBASE SETPROOFSTATUS ERROR", error);
    if (error.message.includes("NOT_FOUND")) return { failed: true, message: "The proof you tried to set the status of does not exist." };
    return { failed: true, message: "An uncaught error has occurred." };
  }
};

export const deleteProof = async (id, uid) => {
  try {
    console.log("FIREBASE | DELETEPROOF + working", id);

    const check = await fetchProof(id);
    console.log("FIREBASE | deleteProof + check", check);
    if (!check) {
      return { failed: true, message: "The proof you tried to update doesn't exist." };
    }
    if (check.uid !== uid) {
      if (!adminUids.includes(uid)) return { failed: true, message: "You do not have permission to delete this proof." };
    }

    const dbRef = fs.collection("proofs").doc(id);
    const result = await dbRef.delete();

    return result;
  } catch (error) {
    console.error("FIREBASE PROOF DELETE ERROR", error);
    return { failed: true, message: "An uncaught error has occurred." };
  }
};

export async function getUserSolvedProofs(uid) {
  try {
    const userRef = db.ref("users").child(uid).child("solved");
    const result = await userRef.get();

    if (!result.exists()) {
      return [];
    }

    const solved = result.val();
    return Object.keys(solved);
  } catch (error) {
    console.log("FIREBASE GET USERSOLVEDPROOFS ERROR", error);
    return { failed: true, message: "An uncaught error has occurred." };
  }
}

export async function getUserCreatedProofs(uid) {
  try {
    const userRef = fs.collection("proofs").where("uid", "==", uid);
    const queryResult = await userRef.get();

    if (queryResult.empty) {
      console.log("FIREBASE GET USERCREATEDPROOFS NO DATA");
      return [];
    }

    // const created = result.data();
    console.log("FIREBASE GET USERCREATEDPROOFS", queryResult.docs);
    return formatProofPreview(queryResult);
  } catch (error) {
    console.log("FIREBASE | GETUSERCREATEDPROOFS x ERROR", error);
    return { failed: true, message: "An uncaught error has occurred." };
  }
}

export async function saveSolvedIdToUser(proofId, uid) {
  try {
    const userRef = db.ref("users").child(uid).child("solved");
    const result = await userRef.update({ [proofId]: true });
    console.log("FIREBASE USER UPDATED", result);
    return true;
  } catch (error) {
    console.log("FIREBASE USER UPDATED ERROR", error);
    return { failed: true, message: "An uncaught error has occurred." };
  }
}

export async function getUserProfile(uid) {
  try {
    const [created, solved] = await Promise.all([getUserCreatedProofs(uid), getUserSolvedProofs(uid)]);

    if (!solved.failed && solved.length > 0) {
      console.log("FIREBASE | GET USERPROFILE + ", created, solved, solved.length > 0);
      const solvedProofRefs = solved.map((id) => fs.collection("proofs").doc(id));

      console.log("FIREBASE | GET USERPROFILE + solvedProofRefs", solvedProofRefs.length);

      const solvedProofs = await fs.getAll(...solvedProofRefs);

      let parsedSolvedProofs = [];

      solvedProofs.forEach((doc) => {
        if (doc.data() && doc.data().uid === uid) return;
        if (doc.data()) {
          parsedSolvedProofs.push({ id: doc.id, first_entry: doc.data().proof[0] });
        }
      });

      return { created, solved: parsedSolvedProofs };
    }

    return { created, solved };
  } catch (error) {
    console.log("FIREBASE USER PROFILE ERROR", error);
    return { failed: true, message: "An uncaught error has occurred." };
  }
}

export async function queryUser(query) {
  try {
    const userRecord = await auth.getUserByEmail(query);
    // if (!userRecord) return { failed: true, message: "Student not found." };
    return userRecord;
  } catch (error) {
    console.log("FIREBASE QUERY USER ERROR", error);
    if (error.errorInfo?.code === "auth/invalid-email") return { failed: true, message: "You entered an invalid email." };
    if (error.errorInfo?.code === "auth/user-not-found") return { failed: true, message: "Student wasn't found in the database." };
    return { failed: true, message: "An uncaught error has occurred." };
  }
}

export async function getAllUserProfiles(cursor) {
  try {
    const { users, pageToken } = await auth.listUsers(30, cursor);
    console.log("FIREBASE | GETALLUSERPROFILES", users);

    const promises = users.map(async (user) => {
      const { uid } = user;
      return getUserProfile(uid);
    });

    const results = await Promise.all(promises);

    // merge results and users into one object
    const merged = results.map((result, i) => {
      const { email, displayName } = users[i];
      if (result.failed) return { ...result, email, displayName };
      const { created, solved } = result;
      return { created, solved, email, displayName };
    });

    return { users: merged, pageToken };
  } catch (error) {
    console.log("FIREBASE QUERY USER ERROR", error);
    return { failed: true, message: "An uncaught error has occurred." };
  }
}
