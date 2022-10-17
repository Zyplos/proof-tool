import { setProofStatus } from "../../../../database";
import { getServerSession } from "../../../../internals/apiUtils";

export default async function handler(req, res) {
  const { id } = req.query;
  if (!id) return res.status(400).json({ message: "No id provided" });

  if (req.method === "POST") {
    const session = await getServerSession(req, res);
    if (session.failed) {
      return res.status(500).json({ message: session.message });
    }
    if (!session.user.admin) {
      return res.status(500).json({ message: "Unauthorized to set proof status." });
    }

    const { approved } = req.body;
    if (typeof approved !== "boolean") return res.status(400).json({ message: "Invalid approved status" });

    const result = await setProofStatus(id, approved);
    if (result.failed) {
      return res.status(400).json({ message: result.message });
    }

    res.status(200).json({ message: `Proof ${approved ? "approved" : "withdrawn"}.` });
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}
