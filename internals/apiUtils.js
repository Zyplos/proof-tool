import { verifyUserToken } from "../firebase/admin/firestore";
import { validJustifications } from "./utils";

const adminUids = process.env.NEXT_PUBLIC_ADMINS ? process.env.NEXT_PUBLIC_ADMINS.split(" ") : [];

function isBlank(str) {
  return !str || /^\s*$/.test(str);
}

export async function reqIsAuthenticated(req, adminOnly = false) {
  const authHeader = req.headers.authorization;

  // check for auth header
  if (!authHeader) {
    return { failed: true, message: "Missing Authorization header" };
  }

  // check if auth header is not valid
  const authHeaderParts = authHeader.split(" ");
  if (authHeaderParts.length !== 2 || authHeaderParts[0] !== "Bearer") {
    return { failed: true, message: "Malformatted Authorization header" };
  }

  // auth header is valid, verify token from header
  const userRecord = await verifyUserToken(authHeaderParts[1]);
  console.log("FIREBASE | REQISAUTHENTICATED + USERRECORD", userRecord);
  if (userRecord.failed) {
    return { failed: true, message: userRecord.message };
  }

  // check if uid is in admin uids if request must be from an admin
  if (adminOnly && !adminUids.includes(userRecord.uid)) {
    return { failed: true, message: "Unauthorized to perform this action." };
  }

  return userRecord;
}

export function checkProofRowsFormat(proofRows) {
  if (!proofRows) {
    return { failed: true, message: "No proof rows provided." };
  }

  if (!Array.isArray(proofRows)) {
    return { failed: true, message: "Proof rows must be an array." };
  }

  if (proofRows.length < 2) {
    return { failed: true, message: "Proof needs at least two rows." };
  }

  // check that all rows have valid data
  for (let i = 0; i < proofRows.length; i++) {
    const currentRow = proofRows[i];

    // check if currentRow contains all required fields
    if (!currentRow.claim || !currentRow.justification || !currentRow.id) {
      return { failed: true, message: `Row ${i + 1} is missing required fields.` };
    }

    // check if claim is blank
    if (isBlank(currentRow.claim)) {
      return { failed: true, message: `Row ${i + 1} is empty or blank.` };
    }

    // check if justification is blank
    if (isBlank(currentRow.justification)) {
      return { failed: true, message: `Row ${i + 1} has a blank justification.` };
    }

    // check if justification is valid
    if (!Object.keys(validJustifications).includes(currentRow.justification)) {
      return { failed: true, message: `Row ${i + 1} has an invalid justification "${currentRow.justification}".` };
    }

    // check if id is blank
    if (isBlank(currentRow.id)) {
      return { failed: true, message: `Row ${i + 1} has a blank id.` };
    }
  }

  // check if all rows have a given justification by seeing if at least one row is not given
  const notGivenRows = proofRows.filter((row) => row.justification !== "given");
  if (notGivenRows.length === 0) {
    return { failed: true, message: "All rows cannot have a given justification." };
  }

  return { failed: false };
}
