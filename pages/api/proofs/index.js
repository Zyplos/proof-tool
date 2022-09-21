import { insertNewProof, getAllProofs } from "../../../firebase/admin/firestore";
import { checkProofRowsFormat, reqIsAuthenticated } from "../../../internals/apiUtils";

export default async function handler(req, res) {
  // POST
  if (req.method === "POST") {
    const verifyAuth = await reqIsAuthenticated(req);
    if (verifyAuth.failed) {
      return res.status(401).json({ message: verifyAuth.message });
    }

    const { rows } = req.body;
    const verifyRows = checkProofRowsFormat(rows);
    if (verifyRows.failed) {
      return res.status(400).json({ message: verifyRows.message });
    }

    const result = await insertNewProof(rows, verifyAuth.uid);
    if (result.failed) {
      return res.status(400).json({ message: result.message });
    }

    res.status(200).json({ message: "Added new proof", id: result });

    // GET
  } else if (req.method === "GET") {
    const allProofs = await getAllProofs();
    if (!allProofs) {
      return res.status(404).json({ message: "The Library has no proofs at the moment. Check back later." });
    }
    res.status(200).json(allProofs);
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}
