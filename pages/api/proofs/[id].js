import { fetchProof, updateProof, deleteProof } from "../../../firebase/admin/firestore";
import { checkProofRowsFormat, reqIsAuthenticated } from "../../../internals/apiUtils";

export default async function proofObtainHandler(req, res) {
  const { id } = req.query;
  if (!id) return res.status(400).json({ message: "No id provided" });

  // GET
  if (req.method === "GET") {
    console.log("PROOF OBTAIN GET", id);
    const proofData = await fetchProof(id);
    console.log("PROOF OBTAIN FIREBASE", proofData);
    if (!proofData) {
      return res.status(404).json({ message: "Proof not found" });
    }
    res.status(200).json({ _gotcha: "naughty naughty. ill fix this soon", ...proofData });

    // PUT
  } else if (req.method === "PUT") {
    // check if user is authenticated
    const verifyAuth = await reqIsAuthenticated(req);
    if (verifyAuth.failed) {
      return res.status(401).json({ message: verifyAuth.message });
    }

    // checking if request body is correctly formatted
    const proofData = req.body;
    const verifyRows = checkProofRowsFormat(proofData.rows);
    if (verifyRows.failed) {
      return res.status(400).json({ message: verifyRows.message });
    }

    const result = await updateProof(id, proofData.rows, verifyAuth.uid);
    if (result.failed) {
      return res.status(400).json({ message: result.message });
    }

    console.log("PROOF UPDATED", result);
    res.status(200).json({ id, status: result });

    // DELETE
  } else if (req.method === "DELETE") {
    console.log("PROOF ID API GOT DELETE");

    const verifyAuth = await reqIsAuthenticated(req);
    if (verifyAuth.failed) {
      return res.status(401).json({ message: verifyAuth.message });
    }

    const result = await deleteProof(id, verifyAuth.uid);
    if (result.failed) {
      return res.status(400).json({ message: result.message });
    }

    console.log("PROOF DELETED", result);
    res.status(200).json({ id, status: result });

    // ELSE
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}
