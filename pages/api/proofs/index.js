import { getAllApprovedProofs, insertNewProof } from "../../../database";
import { checkProofRowsFormat, getServerSession } from "../../../internals/apiUtils";

export default async function handler(req, res) {
  // POST
  if (req.method === "POST") {
    const session = await getServerSession(req, res);
    if (session.failed) {
      return res.status(500).json({ message: session.message });
    }

    const { rows, proofType } = req.body;
    const verifyRows = checkProofRowsFormat(rows, proofType);
    if (verifyRows.failed) {
      return res.status(400).json({ message: verifyRows.message });
    }

    const result = await insertNewProof(rows, proofType, session.user.id);
    if (result.failed) {
      return res.status(400).json({ message: result.message });
    }

    res.status(200).json({ message: "Added new proof", id: result });

    // GET
  } else if (req.method === "GET") {
    const allProofs = await getAllApprovedProofs();
    if (!allProofs) {
      return res.status(404).json({ message: "The Library has no proofs at the moment. Check back later." });
    }
    if (allProofs.failed) {
      return res.status(500).json({ message: allProofs.message });
    }
    res.status(200).json(allProofs);
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}
