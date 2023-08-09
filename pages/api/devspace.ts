import dbConnect from "@/lib/mongoose";
import Proof, { IProof, ProofDocument } from "@/models/Proof";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  await dbConnect();

  switch (method) {
    case "GET":
      try {
        const proofs = await Proof.find({}); /* find all the data in our database */
        console.log("====PROOFS");
        console.log(proofs);
        res.status(200).json({ success: true, proofs: proofs });
      } catch (error) {
        console.error(error);
        res.status(400).json({ success: false });
      }
      break;
    case "POST":
      try {
        const proof = await Proof.create({
          user_id: "reallyrealperson",
          created_at: new Date(),
          approved: false,
          type: "english",
          claims: [
            {
              claim: "I am a real person",
            },
          ],
        }); /* create a new model in the database */
        console.log("====CREATE PROOF");
        console.log(proof);
        res.status(201).json({ success: true, proofs: proof });
      } catch (error) {
        console.error(error);
        res.status(400).json({ success: false });
      }
      break;
    default:
      res.status(400).json({ success: false });
      break;
  }
}
