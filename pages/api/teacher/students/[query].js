import { getUserProfile, queryUser } from "../../../../firebase/admin/firestore";
import { reqIsAuthenticated } from "../../../../internals/apiUtils";

export default async function handler(req, res) {
  const { query } = req.query;
  if (!query) return res.status(400).json({ message: "No query provided" });

  if (req.method === "GET") {
    const verifyAuth = await reqIsAuthenticated(req, true);
    if (verifyAuth.failed) {
      return res.status(401).json({ message: verifyAuth.message });
    }

    const queryResult = await queryUser(query);
    if (queryResult.failed) {
      return res.status(400).json({ message: queryResult.message });
    }

    const studentInfo = await getUserProfile(queryResult.uid);
    if (studentInfo.failed) {
      return res.status(400).json({ message: studentInfo.message });
    }

    res.status(200).json(studentInfo);
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}
