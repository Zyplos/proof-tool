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

// https://stackoverflow.com/questions/196972/convert-string-to-title-case-with-javascript
export function toTitleCase(str) {
  return str.replace(/\w\S*/g, function (txt) {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
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

export const validNumberLineJustifications = {
  given: "Given",
  unknown: "???",
  absorption: "Absorption",
  addition: "Addition",
  associativity: "Associativity",
  assumption: "Assumption",
  commutativity: "Commutativity",
  conjunction: "Conjunction",
  demorgans: "DeMorgan's",
  directproofrule: "Direct Proof Rule",
  disjunctivesyllogism: "Disjunctive Syllogism",
  distributivity: "Distributivity",
  domination: "Domination",
  doublenegation: "Double Negation",
  hypotheticalsyllogism: "Hypothetical Syllogism",
  idempotency: "Idempotency",
  identity: "Identity",
  implication: "Implication",
  modusponens: "Modus ponens",
  modustollens: "Modus tollens",
  negation: "Negation",
  resolution: "Resolution",
  simplification: "Simplification",
};

export const validEnglishJustifications = {
  given: "Given",
  unknown: "???",
  antireflexive: "Anti-reflexive",
  antisymmetric: "Anti-symmetric",
  bijective: "Bijective",
  complement: "Complement",
  evenodd: "Even/Odd",
  injective: "Injective",
  intersection: "Intersection",
  reflexive: "Reflexive",
  setdiffererence: "Set Difference",
  subset: "Subset",
  surjective: "Surjective",
  symmetric: "Symmetric",
  transitive: "Transitive",
  union: "Union",
};

export const justificationReferenceNumbers = {
  unknown: 0,
  absorption: 1,
  addition: 1,
  associativity: 1,
  assumption: 0,
  commutativity: 1,
  conjunction: 2,
  demorgans: 1,
  directproofrule: 0,
  disjunctivesyllogism: 2,
  distributivity: 1,
  domination: 1,
  doublenegation: 1,
  given: 0,
  hypotheticalsyllogism: 2,
  idempotency: 1,
  identity: 1,
  implication: 1,
  modusponens: 2,
  modustollens: 2,
  negation: 1,
  resolution: 1,
  simplification: 1,
  __SEP: 0,
  antireflexive: 0,
  antisymmetric: 0,
  bijective: 0,
  complement: 0,
  evenodd: 0,
  injective: 0,
  intersection: 0,
  reflexive: 0,
  setdiffererence: 0,
  subset: 0,
  surjective: 0,
  symmetric: 0,
  transitive: 0,
  union: 0,
};
