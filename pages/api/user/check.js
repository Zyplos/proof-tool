import { fetchProof, saveSolvedIdToUser } from "../../../firebase/admin/firestore";
import { reqIsAuthenticated } from "../../../internals/apiUtils";

export default async function proofObtainHandler(req, res) {
  if (req.method === "POST") {
    const verifyAuth = await reqIsAuthenticated(req);
    if (verifyAuth.failed) {
      return res.status(401).json({ message: verifyAuth.message });
    }

    const checkData = req.body;

    if (!checkData.id) {
      return res.status(400).json({ message: "No id provided" });
    }
    if (!checkData.rows) {
      return res.status(400).json({ message: "No rows provided" });
    }

    console.log("API PROOFCHECK", checkData);

    const proofData = await fetchProof(checkData.id);
    console.log("API PROOFCHECK FETCHPROOF", proofData);

    if (!proofData) {
      console.log("API PROOFCHECK FETCHPROOF NOT FOUND");
      return res.status(404).json({ message: "Could not check your work against a proof that does not exist." });
    }

    const { proof } = proofData;

    console.log("API PROOFCHECK FETCHPROOF FOUND");
    const checkResult = [];
    for (let i = 0; i < proof.length; i++) {
      const correctRow = proof[i];
      const checkRow = checkData.rows[i];
      console.log("CHECKSTART----------------");
      console.log("CORRECT ROW", correctRow);
      console.log("CHECK ROW", checkRow);
      console.log("CHECKEND----------------");
      if (correctRow.justification !== checkRow.justification) {
        checkResult.push(checkRow.id);
      }
    }

    let saveResult;
    if (checkResult.length === 0) {
      saveResult = await saveSolvedIdToUser(checkData.id, verifyAuth.uid);
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
