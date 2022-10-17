import { getAllUserProfiles } from "../../../../database";
import { getServerSession } from "../../../../internals/apiUtils";

export default async function handler(req, res) {
  if (req.method === "GET") {
    const session = await getServerSession(req, res);
    if (session.failed) {
      return res.status(500).json({ message: session.message });
    }
    if (!session.user.admin) {
      return res.status(500).json({ message: "Unauthorized to query users." });
    }

    const usersResult = await getAllUserProfiles();
    if (usersResult.failed) {
      return res.status(400).json({ message: usersResult.message });
    }

    res.status(200).json(usersResult);
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}
