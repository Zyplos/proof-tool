import { getServerSession } from "../../../internals/apiUtils";
import { deleteProof, getProof } from "../../../database";

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
    let changecheckEnglish = false;
    proofData.rows.forEach((rowchange, i) => {
      rowchange.references = [];
      if (rowchange.justification === "given") return;
      // calculate a chance of changing the justification
      if (Math.random() < 0.35) {
        rowchange.justification = "unknown";
        changecheck = true;
      }

      // english proofs have a chance of removing the claim as well
      if (proofData.proofType == "english") {
        // DONT remove the initial claim or the final claim for english proofs
        if (i == 0 || i == proofData.rows.length - 1) return;
        if (Math.random() < 0.35) {
          rowchange.claim = "";
          rowchange.claimMissing = true;
          changecheckEnglish = true;
        }
      }
    });

    console.log("SOLVEPROOF INIT", proofData.rows);

    // TODO this could be better written
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

    if (proofData.proofType == "english" && !changecheckEnglish) {
      // get all rows without "given" justification
      // slice the rows array so that we dont take the last claim into consideration (it shouldnt change)
      const rows = proofData.rows.slice(0, proofData.rows.length - 1).filter((row) => row.justification !== "given");
      if (rows.length > 0) {
        const idgrab = rows[Math.floor(Math.random() * rows.length)].id;
        for (let v = 0; v < proofData.rows.length; v++) {
          if (proofData.rows[v].id == idgrab) {
            proofData.rows[v].claim = "";
            proofData.rows[v].claimMissing = true;
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
