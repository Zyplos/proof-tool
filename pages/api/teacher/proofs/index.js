import { getAllPendingProofs } from "../../../../database";
import { getServerSession } from "../../../../internals/apiUtils";

export default async function handler(req, res) {
  if (req.method === "GET") {
    const session = await getServerSession(req, res);
    if (session.failed) {
      return res.status(500).json({ message: session.message });
    }
    if (!session.user.admin) {
      return res.status(500).json({ message: "Unauthorized to get pending proofs." });
    }

    const allPendingProofs = await getAllPendingProofs();
    if (allPendingProofs.failed) {
      return res.status(400).json({ message: allPendingProofs.message });
    }

    res.status(200).json(allPendingProofs);
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}
