import { Schema, model, Types, models, Model } from "mongoose";

export interface IClaim {
  claim: string;
  justification: string;
  // id: string;
  references: [number];
}

export interface IProof {
  user_id: string;
  created_at: Date;
  updated_at?: Date;
  approved: boolean;
  type: "default" | "english";
  claims: [IClaim];
}

export interface ProofDocument extends IProof, Document {}

const claimSchema = new Schema<IClaim>({
  claim: { type: String, required: true },
  justification: { type: String, required: true },
  // id: { type: String, required: true },
  references: [{ type: Number }],
});

const proofSchema = new Schema<IProof>({
  user_id: { type: String, required: true },
  created_at: { type: Date, required: true },
  updated_at: { type: Date },
  approved: { type: Boolean, required: true },
  type: { type: String, enum: ["default", "english"], required: true },
  claims: { type: [claimSchema], required: true, validate: (v: [IClaim]) => Array.isArray(v) && v.length >= 1 },
});

const exisitingModel = models.Proof as Model<IProof> | undefined;

export default exisitingModel || model<IProof>("Proof", proofSchema);
