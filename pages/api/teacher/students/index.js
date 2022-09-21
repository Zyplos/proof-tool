import { getAllUserProfiles } from "../../../../firebase/admin/firestore";
import { reqIsAuthenticated } from "../../../../internals/apiUtils";

export default async function handler(req, res) {
  const { cursor } = req.query;

  if (req.method === "GET") {
    const verifyAuth = await reqIsAuthenticated(req, true);
    if (verifyAuth.failed) {
      return res.status(401).json({ message: verifyAuth.message });
    }

    const usersResult = await getAllUserProfiles(cursor);
    if (usersResult.failed) {
      return res.status(400).json({ message: usersResult.message });
    }

    res.status(200).json(usersResult);
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}
