import { getUserSolvedProofs } from "../../../firebase/admin/firestore";
import { reqIsAuthenticated } from "../../../internals/apiUtils";

export default async function proofObtainHandler(req, res) {
  if (req.method === "GET") {
    const verifyAuth = await reqIsAuthenticated(req);
    if (verifyAuth.failed) {
      return res.status(401).json({ message: verifyAuth.message });
    }

    const solvedProofs = await getUserSolvedProofs(verifyAuth.uid);
    if (solvedProofs.failed) {
      return res.status(500).json({ message: "Could not get solved proofs." });
    }

    console.log("API GET USER SOLVED PROOFS", solvedProofs);
    res.status(200).json({ proofs: solvedProofs });
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}
