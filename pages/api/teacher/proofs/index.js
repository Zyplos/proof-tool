import { getAllPendingProofs } from "../../../../firebase/admin/firestore";
import { reqIsAuthenticated } from "../../../../internals/apiUtils";

export default async function handler(req, res) {
  if (req.method === "GET") {
    const verifyAuth = await reqIsAuthenticated(req, true);
    if (verifyAuth.failed) {
      return res.status(401).json({ message: verifyAuth.message });
    }

    const allPendingProofs = await getAllPendingProofs(verifyAuth.uid);
    if (allPendingProofs.failed) {
      return res.status(400).json({ message: allPendingProofs.message });
    }

    res.status(200).json(allPendingProofs);
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}
