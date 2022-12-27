import { justificationReferenceNumbers, validNumberLineJustifications, validEnglishJustifications } from "./utils";

import { unstable_getServerSession } from "next-auth/next";
import { authOptions } from "../pages/api/auth/[...nextauth]";

import { isBlank } from "./utils";

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

export function checkProofRowsFormat(proofRows, proofType) {
  const usingTheseJustifications = proofType === "default" ? validNumberLineJustifications : validEnglishJustifications;

  console.log("====APIUTILS PROOFTYPE CHECK", proofType);
  if (!["default", "english", "induction"].includes(proofType)) {
    return { failed: true, message: "Proof type is invalid. (report bug)" };
  }

  if (!proofRows) {
    return { failed: true, message: "No proof rows provided." };
  }

  if (!Array.isArray(proofRows)) {
    return { failed: true, message: "Proof rows must be an array." };
  }

  if (proofRows.length < 3) {
    return { failed: true, message: "Proof needs at least three rows." };
  }

  // check if all rows have a given justification by seeing if at least one row is not given
  const notGivenRows = proofRows.filter((row) => row.justification !== "given");
  if (notGivenRows.length === 0) {
    return { failed: true, message: 'All rows cannot have a "Given" justification.' };
  }

  // english proof solver works by removing at least one claim
  // however the last row and all given rows are ignored
  // so at least 2 rows must not be "given" for english proof solver to work
  if (proofType == "english" && notGivenRows.length == 1) {
    return { failed: true, message: 'English proofs cannot have just a single row that isn\'t "Given".' };
  }

  console.log("checkProofFormat PASSED BASIC CHECKS");

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
    // "unknown" is internally a right justification but reject it here
    // shnould be fine as this validation isnt done for the solver
    if (!Object.keys(usingTheseJustifications).includes(currentRow.justification) || currentRow.justification == "unknown") {
      return { failed: true, message: `Row ${i + 1} has an invalid justification "${currentRow.justification}".` };
    }

    if (!justificationReferenceNumbers.hasOwnProperty(currentRow.justification)) {
      return {
        failed: true,
        message: `Row ${i + 1}'s justification isn't configured correctly. (${
          currentRow.justification
        } isn't defined in justificationReferenceNumbers, submit bug report)`,
      };
    }
    if (justificationReferenceNumbers[currentRow.justification] !== currentRow.references.length) {
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
