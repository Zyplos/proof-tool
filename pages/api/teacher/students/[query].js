import { getProofs, getUserCreatedProofs, getUserProfile } from "../../../../database";
import { getServerSession } from "../../../../internals/apiUtils";

export default async function handler(req, res) {
  const { query } = req.query;
  if (!query) return res.status(400).json({ message: "No query provided" });

  if (req.method === "GET") {
    const session = await getServerSession(req, res);
    if (session.failed) {
      return res.status(500).json({ message: session.message });
    }
    if (!session.user.admin) {
      return res.status(500).json({ message: "Unauthorized to query users." });
    }

    const userProfile = await getUserProfile(query);
    if (userProfile.failed) {
      return res.status(400).json({ message: userProfile.message });
    }
    // console.log("=======QUERYDEV", userProfile);
    // const solvedProofs = await getProofs(userProfile.solvedIds.map((e) => ObjectId(e)));
    // if (solvedProofs.failed) {
    //   return res.status(400).json({ message: solvedProofs.message });
    // }

    // const createdProofs = await getUserCreatedProofs(userProfile._id.toString());
    // if (createdProofs.failed) {
    //   return res.status(400).json({ message: createdProofs.message });
    // }

    res.status(200).json(userProfile);
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}
