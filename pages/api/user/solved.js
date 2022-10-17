import { getUserSolvedProofs } from "../../../database";
import { getServerSession } from "../../../internals/apiUtils";

export default async function proofObtainHandler(req, res) {
  if (req.method === "GET") {
    const session = await getServerSession(req, res);
    if (session.failed) {
      return res.status(500).json({ message: session.message });
    }

    const solvedProofs = await getUserSolvedProofs(session.user.id);
    if (solvedProofs.failed) {
      return res.status(500).json({ message: "Could not get solved proofs." });
    }

    console.log("API GET USER SOLVED PROOFS", solvedProofs);
    res.status(200).json({ solvedIds: solvedProofs });
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}
