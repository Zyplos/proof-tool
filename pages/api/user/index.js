import { getUserProfile } from "../../../database";
import { getServerSession } from "../../../internals/apiUtils";

export default async function handler(req, res) {
  if (req.method === "GET") {
    const session = await getServerSession(req, res);
    if (session.failed) {
      return res.status(500).json({ message: session.message });
    }

    const studentProfile = await getUserProfile(session.user.email);
    if (studentProfile.failed) {
      return res.status(400).json({ message: studentProfile.message });
    }

    res.status(200).json(studentProfile);
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}
