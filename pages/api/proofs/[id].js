import { checkProofRowsFormat, getServerSession } from "../../../internals/apiUtils";
import { deleteProof, getProof, updateProof } from "../../../database";

export default async function proofObtainHandler(req, res) {
  const { id } = req.query;
  if (!id) return res.status(400).json({ message: "No id provided" });

  // GET
  if (req.method === "GET") {
    const session = await getServerSession(req, res);
    if (session.failed) {
      return res.status(500).json({ message: session.message });
    }

    console.log("PROOF OBTAIN GET", id);
    const proofData = await getProof(id);
    console.log("PROOF OBTAIN DATABASE", proofData);
    if (!proofData) {
      return res.status(404).json({ message: "Proof not found" });
    }

    if (proofData.uid !== session.user._id && session.user.admin) {
      return { failed: true, message: "You cannot view proofs you did not make." };
    }

    res.status(200).json(proofData);

    // PUT
  } else if (req.method === "PUT") {
    // check if user is authenticated
    const session = await getServerSession(req, res);
    if (session.failed) {
      return res.status(500).json({ message: session.message });
    }

    // checking if request body is correctly formatted
    const proofData = req.body;
    const verifyRows = checkProofRowsFormat(proofData.rows, proofData.proofType);
    if (verifyRows.failed) {
      return res.status(400).json({ message: verifyRows.message });
    }

    const result = await updateProof(id, proofData.rows, proofData.proofType, session.user.id, session.user.admin);
    if (result.failed) {
      return res.status(400).json({ message: result.message });
    }

    console.log("PROOF UPDATED", result);
    res.status(200).json({ id, status: result });

    // DELETE
  } else if (req.method === "DELETE") {
    console.log("PROOF ID API GOT DELETE");

    const session = await getServerSession(req, res);
    if (session.failed) {
      return res.status(500).json({ message: session.message });
    }

    const result = await deleteProof(id, session.user.id, session.user.admin);
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
