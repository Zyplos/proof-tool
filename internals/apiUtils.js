import { validJustifications, justificationReferenceNumbers } from "./utils";

import { unstable_getServerSession } from "next-auth/next";
import { authOptions } from "../pages/api/auth/[...nextauth]";

function isBlank(str) {
  return !str || /^\s*$/.test(str);
}

export async function getServerSession(req, res) {
  try {
    const session = await unstable_getServerSession(req, res, authOptions);
    console.log("===APIUTILS GETTING UNSER SESSION | ", session);
    if (!session) return { failed: true, message: "You are not logged in." };
    return session;
  } catch (error) {
    console.error("APIUtils | getServerSession error", error);
    return { failed: true, message: "An uncaught error has occurred trying to verify your login session (try signing out and in again)." };
  }
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

  // check if all rows have a given justification by seeing if at least one row is not given
  const notGivenRows = proofRows.filter((row) => row.justification !== "given");
  if (notGivenRows.length === 0) {
    return { failed: true, message: 'All rows cannot have a "Given" justification.' };
  }

  // check that all rows have valid data
  for (let i = 0; i < proofRows.length; i++) {
    const currentRow = proofRows[i];

    // check if id is blank
    if (isBlank(currentRow.id)) {
      return { failed: true, message: `Row ${i + 1} has a blank internal id (submit bug report).` };
    }

    // check if currentRow contains all required fields
    if (!currentRow.claim || !currentRow.justification || !currentRow.id) {
      return {
        failed: true,
        message: `Row ${i + 1} is missing some stuff: ${!currentRow.claim ? "No claim was provided." : ""} ${
          !currentRow.justification ? "No justification was provided." : ""
        } ${!currentRow.id ? "Internal id is missing (submit bug report)." : ""}`,
      };
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

    console.log(
      currentRow,
      justificationReferenceNumbers[currentRow.justification],
      currentRow.references.length,
      justificationReferenceNumbers[currentRow.justification] !== currentRow.references.length
    );
    if (justificationReferenceNumbers[currentRow.justification] && justificationReferenceNumbers[currentRow.justification] !== currentRow.references.length) {
      return { failed: true, message: `Row ${i + 1} is missing some row references.` };
    }

    for (let ir = 0; ir < currentRow.references.length; ir++) {
      const currentReference = currentRow.references[ir];
      if (!currentReference) {
        return { failed: true, message: `Row ${i + 1} reference ${ir + 1} references an invalid row.` };
      }
      if (typeof currentReference !== "number") {
        return { failed: true, message: `Row ${i + 1} reference ${ir + 1} is the wrong type. (submit bug report)` };
      }
      if (currentReference < 1 || currentReference > proofRows.length) {
        return { failed: true, message: `Row ${i + 1} reference ${ir + 1} references an invalid row.` };
      }
    }
  }

  return { failed: false };
}
