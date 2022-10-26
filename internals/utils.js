// https://levelup.gitconnected.com/generate-unique-id-in-the-browser-without-a-library-50618cdc3cb1
// good enough
export function randomId() {
  const uint32 = window.crypto.getRandomValues(new Uint32Array(1))[0];
  return uint32.toString(16);
}

export function isBlank(str) {
  return !str || /^\s*$/.test(str);
}

export const validJustifications = {
  unknown: "???",
  absorption: "Absorption",
  addition: "Addition",
  algebra: "Algebra",
  associativity: "Associativity",
  assumption: "Assumption",
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
  implication: "Implication",
  modusponens: "Modus ponens",
  modustollens: "Modus tollens",
  negation: "Negation",
  resolution: "Resolution",
  simplification: "Simplification",
  universalinstantiation: "Universal Instantiation",
  universalgeneralization: "Universal Generalization",
};

export const justificationReferenceNumbers = {
  absorption: 1,
  addition: 1,
  algebra: 1,
  associativity: 1,
  assumption: 1,
  commutativity: 1,
  conjunction: 2,
  definition: 1,
  demorgans: 1,
  directproofrule: 1,
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
  resolution: 2,
  simplification: 1,
  universalinstantiation: 1,
  universalgeneralization: 1,
};
