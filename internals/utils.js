// https://levelup.gitconnected.com/generate-unique-id-in-the-browser-without-a-library-50618cdc3cb1
// good enough
export function randomId() {
  const uint32 = window.crypto.getRandomValues(new Uint32Array(1))[0];
  return uint32.toString(16);
}

// returns true if a a string only contains whitespace (blanks)
// https://stackoverflow.com/a/3261380
export function isBlank(str) {
  return !str || /^\s*$/.test(str);
}

// given a string with comma separated values, returns an array without any blank entries
export function validListFromString(str) {
  return str
    .replace(/\s/g, "")
    .split(",")
    .filter((v) => {
      return !isBlank(v);
    });
}

export const validJustifications = {
  unknown: "???",
  absorption: "Absorption",
  addition: "Addition",
  algebra: "Algebra",
  antireflexive: "Anti-reflexive",
  antisymmetric: "Anti-symmetric",
  associativity: "Associativity",
  assumption: "Assumption",
  cartesianproduct: "Cartesian Product",
  commutativity: "Commutativity",
  conjunction: "Conjunction",
  definition: "Definition",
  demorgans: "DeMorgan's",
  directproofrule: "Direct Proof Rule",
  disjunctivesyllogism: "Disjunctive syllogism",
  distributivity: "Distributivity",
  domination: "Domination",
  doublenegation: "Double negation",
  existentialinstantiation: "Existential Instantiation",
  existentialgeneralization: "Existential Generalization",
  given: "Given",
  hypotheticalsyllogism: "Hypothetical syllogism",
  idempotency: "Idempotency",
  identity: "Identity",
  injective: "Injective",
  implication: "Implication",
  modusponens: "Modus ponens",
  modustollens: "Modus tollens",
  negation: "Negation",
  powerset: "Powerset",
  reflexive: "Reflexive",
  resolution: "Resolution",
  simplification: "Simplification",
  subjective: "Subjective",
  subset: "Subset",
  symmetric: "Symmetric",
  transitive: "Transitive",
  universalinstantiation: "Universal Instantiation",
  universalgeneralization: "Universal Generalization",
};

export const justificationReferenceNumbers = {
  absorption: 1,
  addition: 1,
  algebra: 0,
  antireflexive: 1,
  antisymmetric: 1,
  associativity: 1,
  assumption: 0,
  cartesianproduct: 1,
  commutativity: 1,
  conjunction: 2,
  definition: 0,
  demorgans: 1,
  directproofrule: 0,
  disjunctivesyllogism: 2,
  distributivity: 1,
  domination: 1,
  doublenegation: 1,
  existentialinstantiation: 1,
  existentialgeneralization: 1,
  given: 0,
  hypotheticalsyllogism: 2,
  idempotency: 1,
  identity: 1,
  implication: 1,
  modusponens: 2,
  modustollens: 2,
  negation: 1,
  powerset: 1,
  resolution: 2,
  simplification: 1,
  subset: 1,
  symmetric: 1,
  transitive: 1,
  reflexive: 1,
  injective: 1,
  subjective: 1,
  universalinstantiation: 1,
  universalgeneralization: 1,
};
