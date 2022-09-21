import { getAllUserProfiles } from "../../firebase/admin/firestore";

const TEST_ID = "cR8mubtdmrHmHMIpXNyX";
const TEST_UID_TEACHER = "ozCkTQ4EFHXu48NG0yA9lJEpdlu2";
const TEST_UID_STUDENT = "D7tXbPixfyZ3ccxaUE8prAGjQsp2";
const TEST_ROWS = [{ claim: "internaldevtest", justification: "given", id: "c45uind" }];

export default async function handler(req, res) {
  const { cursor } = req.query;

  const returned = await getAllUserProfiles(cursor);
  console.log("-------------NEWFIREBASE getAllUserProfiles", returned);
  // console.log("-------------DEVCALLER DEVSTFF", typeof req.body, req.body.rows);
  // const { rows } = req.body;
  // console.log("-------------DEVCALLER ROWS", rows);
  // const dat = JSON.parse(req.body);
  // console.log("-------------DEVCALLER DEVSTFF", dat);
  res.status(200).json({ name: "John Doe", returned });
}
