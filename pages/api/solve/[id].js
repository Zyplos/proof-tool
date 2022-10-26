import { checkProofRowsFormat, getServerSession } from "../../../internals/apiUtils";
import { deleteProof, getProof, updateProof } from "../../../database";

export default async function proofObtainHandler(req, res) {
  const { id } = req.query;
  if (!id) return res.status(400).json({ message: "No id provided" });

  // GET
  if (req.method === "GET") {
    const session = await getServerSession(req, res);
    if (session.failed) {
      return res.status(500).json({ message: session.message });
    }

    console.log("PROOF OBTAIN GET", id);
    const proofData = await getProof(id);
    console.log("PROOF OBTAIN DATABASE", proofData);
    if (!proofData) {
      return res.status(404).json({ message: "Proof not found" });
    }

    ///////////

    let changecheck = false;
    proofData.rows.forEach((rowchange, i) => {
      rowchange.references = [];
      if (rowchange.justification === "given") return;
      // calculate a chance of changing the justification
      if (Math.random() < 0.35) {
        rowchange.justification = "unknown";
        changecheck = true;
      }
    });

    console.log("SOLVEPROOF INIT", proofData.rows);

    // somehow, no rows were randomly changed, so we manually change at least one
    if (!changecheck) {
      // get all rows without "given" justification
      const rows = proofData.rows.filter((row) => row.justification !== "given");
      if (rows.length > 0) {
        const idgrab = rows[Math.floor(Math.random() * rows.length)].id;
        for (let v = 0; v < proofData.rows.length; v++) {
          if (proofData.rows[v].id == idgrab) {
            proofData.rows[v].justification = "unknown";
            proofData.rows[v].references = [];
            break;
          }
        }
      }
    }

    console.log("SOLVEPROOF EDITED FINAL", proofData.rows);

    ////////

    res.status(200).json(proofData);

    // PUT
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}
