import { getUserProfile } from "../../../firebase/admin/firestore";
import { reqIsAuthenticated } from "../../../internals/apiUtils";

export default async function handler(req, res) {
  if (req.method === "GET") {
    const verifyAuth = await reqIsAuthenticated(req);
    if (verifyAuth.failed) {
      return res.status(401).json({ message: verifyAuth.message });
    }

    const studentProfile = await getUserProfile(verifyAuth.uid);
    if (studentProfile.failed) {
      return res.status(400).json({ message: studentProfile.message });
    }

    res.status(200).json(studentProfile);
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}
