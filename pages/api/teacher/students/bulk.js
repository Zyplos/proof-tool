import { getProofs, getUserCreatedProofs, getUserProfile, getUserProfilesBulk } from "../../../../database";
import { getServerSession } from "../../../../internals/apiUtils";

export default async function handler(req, res) {
  // query is the user's email

  if (req.method === "POST") {
    const session = await getServerSession(req, res);
    if (session.failed) {
      return res.status(500).json({ message: session.message });
    }
    if (!session.user.admin) {
      return res.status(500).json({ message: "Unauthorized to query users." });
    }

    const { query } = req.body;
    if (!Array.isArray(query)) return res.status(400).json({ message: "Invalid query" });

    const userProfiles = await getUserProfilesBulk(query);
    if (userProfiles.failed) {
      return res.status(400).json({ message: userProfiles.message });
    }

    res.status(200).json(userProfiles);
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}
