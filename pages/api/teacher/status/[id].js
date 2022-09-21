import { setProofStatus } from "../../../../firebase/admin/firestore";
import { reqIsAuthenticated } from "../../../../internals/apiUtils";

export default async function handler(req, res) {
  const { id } = req.query;
  if (!id) return res.status(400).json({ message: "No id provided" });

  if (req.method === "POST") {
    const verifyAuth = await reqIsAuthenticated(req, true);
    if (verifyAuth.failed) {
      return res.status(401).json({ message: verifyAuth.message });
    }

    const { approved } = req.body;
    if (typeof approved !== "boolean") return res.status(400).json({ message: "Invalid approved status" });

    const result = await setProofStatus(id, approved, verifyAuth.uid);
    if (result.failed) {
      return res.status(400).json({ message: result.message });
    }

    res.status(200).json({ message: `Proof ${approved ? "approved" : "withdrawn"}.` });
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}
