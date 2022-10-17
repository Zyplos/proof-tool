import { getProof, saveSolvedProofToUser } from "../../../database";
import { getServerSession } from "../../../internals/apiUtils";
import { justificationReferenceNumbers } from "../../../internals/utils";

export default async function proofObtainHandler(req, res) {
  if (req.method === "POST") {
    const session = await getServerSession(req, res);
    if (session.failed) {
      return res.status(500).json({ message: session.message });
    }

    const checkData = req.body;

    if (!checkData.id) {
      return res.status(400).json({ message: "No id provided" });
    }
    if (!checkData.rows) {
      return res.status(400).json({ message: "No rows provided" });
    }

    console.log("API PROOFCHECK", checkData);

    const proofData = await getProof(checkData.id);
    console.log("API PROOFCHECK FETCHPROOF", proofData);

    if (!proofData) {
      console.log("API PROOFCHECK FETCHPROOF NOT FOUND");
      return res.status(404).json({ message: "Could not check your work against a proof that does not exist." });
    }

    const { rows } = proofData;

    console.log("API PROOFCHECK FETCHPROOF FOUND");
    const checkResult = {};
    for (let i = 0; i < rows.length; i++) {
      const correctRow = rows[i];
      const checkRow = checkData.rows[i];
      console.log("CHECKSTART----------------");
      console.log("CORRECT ROW", correctRow);
      console.log("CHECK ROW", checkRow);
      console.log("CHECKEND----------------");
      if (correctRow.justification !== checkRow.justification) {
        checkResult[checkRow.id] = { feedback: "Incorrect justification." };
        continue;
      }

      if (justificationReferenceNumbers[checkRow.justification]) {
        if (justificationReferenceNumbers[checkRow.justification] !== checkRow.references.length) {
          checkResult[checkRow.id] = { feedback: "Missing row references." };
          continue;
        }

        for (let ir = 0; ir < checkRow.references.length; ir++) {
          const currentReference = checkRow.references[ir];
          if (!currentReference) {
            checkResult[checkRow.id] = { feedback: `Reference ${ir + 1} references an invalid row.` };
            continue;
          }
          if (typeof currentReference !== "number") {
            checkResult[checkRow.id] = { feedback: `Reference ${ir + 1} is the wrong type. (submit bug report)` };
            continue;
          }
          if (currentReference < 1 || currentReference > correctRow.length) {
            checkResult[checkRow.id] = { feedback: `Reference ${ir + 1} references an invalid row.` };
            continue;
          }
          if (checkRow.references[ir] !== correctRow.references[ir]) {
            checkResult[checkRow.id] = { feedback: `Reference ${ir + 1} is incorrect.` };
            continue;
          }
        }
      }
    }

    let saveResult;
    if (Object.keys(checkResult).length === 0) {
      saveResult = await saveSolvedProofToUser(checkData.id, session.user.id);
      if (saveResult.failed) {
        return res.status(400).json({ message: "Proof solved correctly, but couldn't save to student profile." });
      }
    }

    //   setTimeout(() => {
    res.status(200).json({ incorrect: checkResult, saveResult });
    //   }, 2000);
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}
