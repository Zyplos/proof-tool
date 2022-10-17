import { ObjectId } from "mongodb";
import { connectToDatabase } from "./mongodb";
import { BSONTypeError } from "bson";

// given a mongodb find cursor, formats proofs to preview objects
async function formatProofPreview(queryResult) {
  let output = [];
  await queryResult.forEach((doc) => {
    output.push({ id: doc._id, first_entry: doc.rows[0] });
  });
  return output;
}

export async function getAdminIds() {
  try {
    const database = await connectToDatabase();
    const collection = database.collection("users");

    const result = await collection
      .find({
        admin: true,
      })
      .project({ _id: 1 });

    return result.toArray();
  } catch (error) {
    console.error("MongoDB | getAdminIds error", error);
    return { failed: true, message: "An uncaught error has occurred trying to get a list of admins." };
  }
}

export async function isUserAdmin(uid) {
  try {
    const database = await connectToDatabase();
    const collection = database.collection("users");

    const result = await collection.findOne({
      _id: ObjectId(uid),
      admin: true,
    });

    if (!result) return false;

    return result.admin;
  } catch (error) {
    console.error("MongoDB | getAdminIds error", error);
    return { failed: true, message: "An uncaught error has occurred trying to get a list of admins." };
  }
}

// Given a proof id, return the proof data
// returns null if proof not found
export async function getProof(proofId) {
  try {
    const database = await connectToDatabase();
    const collection = database.collection("proofs");

    const result = await collection.findOne({
      _id: ObjectId(proofId),
    });

    return result;
  } catch (error) {
    console.error("MongoDB | getProof error", error);
    if (error instanceof BSONTypeError) {
      return { failed: true, message: "That proof doesn't seem to exist." };
    }
    return { failed: true, message: "An uncaught error has occurred trying to get a proof." };
  }
}

export async function getProofs(proofIds, ignoreUid) {
  try {
    const database = await connectToDatabase();
    const collection = database.collection("proofs");
    console.log({
      _id: {
        $in: proofIds,
      },
      ...(ignoreUid && {
        uid: {
          $ne: ignoreUid,
        },
      }),
    });

    const result = await collection.find({
      _id: {
        $in: proofIds,
      },
      ...(ignoreUid && {
        uid: {
          $ne: ignoreUid,
        },
      }),
    });

    const output = await formatProofPreview(result);
    return output;
  } catch (error) {
    console.error("MongoDB | getProof error", error);
    return { failed: true, message: "An uncaught error has occurred trying to get a list of proofs." };
  }
}

// Return all approved proofs in the database
export async function getAllApprovedProofs() {
  try {
    const database = await connectToDatabase();
    const collection = database.collection("proofs");

    const results = await collection.find({
      approved: true,
    });

    // console.log("REUSLTs", results);

    const output = await formatProofPreview(results);
    return output;
  } catch (error) {
    console.error("MongoDB | getAllApprovedProofs error", error);
    return { failed: true, message: "An uncaught error has occurred trying to get all proofs." };
  }
}

export async function getAllPendingProofs() {
  try {
    const database = await connectToDatabase();
    const collection = database.collection("proofs");

    const results = await collection.find({
      approved: false,
    });

    const output = await formatProofPreview(results);
    return output;
  } catch (error) {
    console.error("MongoDB | getAllPendingProofs error", error);
    return { failed: true, message: "An uncaught error has occurred trying to get all pending proofs." };
  }
}

export async function insertNewProof(proofRows, uid) {
  console.log("MONGODB | INSERTNEWPROOF + working", uid, proofRows);

  try {
    const database = await connectToDatabase();
    const collection = database.collection("proofs");

    const { insertedId } = await collection.insertOne({
      rows: proofRows,
      uid,
      created: new Date(),
      approved: false,
    });

    return insertedId;
  } catch (error) {
    console.error("MongoDB | insertNewProof error", error);
    return { failed: true, message: "An uncaught error has occurred trying to add a new proof." };
  }
}

export async function updateProof(id, proofRows, uid, isAdmin = false) {
  console.log("MONGODB | UPDATEPROOF + working", id, proofRows);

  try {
    const proofResult = await getProof(id);
    if (!proofResult) {
      return { failed: true, message: "The proof you're trying to update doesn't seem to exist." };
    }
    if (proofResult.failed) {
      return { failed: true, message: "Got an unexpected error trying to update a proof." };
    }
    if (proofResult.uid !== uid) {
      if (!isAdmin) return { failed: true, message: "You do not have permission to edit this proof." };
    }

    const database = await connectToDatabase();
    const collection = database.collection("proofs");

    const result = await collection.updateOne(
      {
        _id: ObjectId(id),
      },
      {
        $set: {
          rows: proofRows,
          updated: new Date(),
        },
      }
    );

    return result;
  } catch (error) {
    console.error("MongoDB | updateProof error", error);
    return { failed: true, message: "An uncaught error has occurred trying to update a proof." };
  }
}

export async function setProofStatus(id, approved) {
  try {
    const database = await connectToDatabase();
    const collection = database.collection("proofs");

    const result = await collection.updateOne(
      {
        _id: ObjectId(id),
      },
      {
        $set: {
          approved,
        },
      }
    );

    return result;
  } catch (error) {
    console.error("MongoDB | setProofStatus error", error);
    return { failed: true, message: "An uncaught error has occurred trying to set approval status of a proof." };
  }
}

export async function deleteProof(id, uid, isAdmin = false) {
  try {
    const proofResult = await getProof(id);
    if (!proofResult) {
      return { failed: true, message: "The proof you're trying to delete doesn't seem to exist." };
    }
    if (proofResult.failed) {
      return { failed: true, message: "Got an unexpected error trying to get a proof to delete it." };
    }
    if (proofResult.uid !== uid) {
      if (!isAdmin) return { failed: true, message: "You do not have permission to delete this proof." };
    }

    const database = await connectToDatabase();
    const collection = database.collection("proofs");

    const result = await collection.deleteOne({
      _id: ObjectId(id),
    });

    return result;
  } catch (error) {
    console.error("MongoDB | deleteProof error", error);
    return { failed: true, message: "An uncaught error has occurred trying to delete a proof." };
  }
}

export async function getUserSolvedProofs(uid) {
  try {
    const database = await connectToDatabase();
    const collection = database.collection("users");

    const result = await collection.findOne({
      _id: ObjectId(uid),
    });

    if (!result) {
      return { failed: true, message: "Could not get profile for a user that does not exist." };
    }

    console.log("getUserSolvedProofs", result.solvedIds);

    if (!result.solvedIds) return [];

    return result.solvedIds;
  } catch (error) {
    console.error("MongoDB | getUserSolvedProofs error", error);
    return { failed: true, message: "An uncaught error has occurred trying to get a user's solved proofs." };
  }
}

export async function saveSolvedProofToUser(proofId, uid) {
  try {
    const database = await connectToDatabase();
    const collection = database.collection("users");

    const result = collection.updateOne(
      {
        _id: ObjectId(uid),
      },
      {
        $addToSet: {
          solvedIds: proofId,
        },
      }
    );

    return result;
  } catch (error) {
    console.error("MongoDB | saveSolvedIdToUser error", error);
    return { failed: true, message: "An uncaught error has occurred trying to save a solved proof to a user's profile." };
  }
}

export async function getUserCreatedProofs(uid) {
  try {
    const database = await connectToDatabase();
    const collection = database.collection("proofs");

    const result = await collection.find({
      uid,
    });

    const output = await formatProofPreview(result);
    return output;
  } catch (error) {
    console.error("MongoDB | getUserCreatedProofs error", error);
    return { failed: true, message: "An uncaught error has occurred trying to get a user's created proofs." };
  }
}

export async function getUserProfile(email) {
  try {
    const database = await connectToDatabase();
    const collection = database.collection("users");

    const result = await collection.findOne({
      email,
    });

    if (!result) {
      return { failed: true, message: "Could not get profile for a user that does not exist." };
    }
    let solvedProofs;
    if (result.solvedIds) {
      solvedProofs = getProofs(
        result.solvedIds.map((e) => ObjectId(e)),
        result._id.toString()
      );
    } else {
      solvedProofs = [];
    }

    const createdProofs = getUserCreatedProofs(result._id.toString());

    const [created, solved] = await Promise.all([createdProofs, solvedProofs]);

    return { created, solved };
  } catch (error) {
    console.error("MongoDB | getUserProfileComplete error", error);
    return { failed: true, message: "An uncaught error has occurred trying to get a user's complete profile." };
  }
}

// TODO this seems wildly inefficient
// read all users, solved, and created all at once here instead of making other db connections in each call
// refer to https://stackoverflow.com/questions/36094865/how-to-do-promise-all-for-array-of-array-of-promises
export async function getAllUserProfiles() {
  try {
    const database = await connectToDatabase();
    const collection = database.collection("users");

    const dbresult = await collection.find();

    let users = [];
    let promises = [];
    await dbresult.forEach((user) => {
      console.log("DBRESULT FOREACH", user, user.email);
      users.push(user);
      promises.push(getUserProfile(user.email));
    });

    const results = await Promise.all(promises);

    // merge results and users into one object
    const merged = results.map((result, i) => {
      const { email, name } = users[i];
      if (result.failed) return { ...result, email, name };
      const { created, solved } = result;
      return { created, solved, email, name };
    });

    return { users: merged };
  } catch (error) {
    console.error("MongoDB | getAllUserProfiles error", error);
    return { failed: true, message: "An uncaught error has occurred trying to get a list of all users." };
  }
}
