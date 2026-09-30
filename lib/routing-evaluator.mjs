const CASE_HEADER = /^  - name: ([a-z0-9-]+)$/;
const PROPERTY = /^    ([a-z0-9_-]+):(?: (.*))?$/;

function parseScalar(raw) {
  const value = (raw ?? "").trim();
  if (value.startsWith('"') && value.endsWith('"')) {
    return JSON.parse(value);
  }
  return value;
}

function parseList(raw) {
  const value = (raw ?? "").trim();
  if (!value.startsWith("[") || !value.endsWith("]")) {
    throw new Error("routing case list must use [item, item] syntax");
  }

  const inner = value.slice(1, -1);
  if (!inner.trim()) return [];

  const items = [];
  let token = "";
  let quoted = false;
  let escaped = false;

  for (const char of inner) {
    if (escaped) {
      token += char;
      escaped = false;
      continue;
    }
    if (char === "\\") {
      token += char;
      escaped = true;
      continue;
    }
    if (char === '"') {
      token += char;
      quoted = !quoted;
      continue;
    }
    if (char === "," && !quoted) {
      items.push(parseScalar(token));
      token = "";
      continue;
    }
    token += char;
  }

  if (quoted) throw new Error("unterminated quoted routing case list item");
  items.push(parseScalar(token));

  return items;
}

function parsePropertyValue(raw) {
  const value = (raw ?? "").trim();
  if (value.startsWith("[") && value.endsWith("]")) return parseList(value);
  return parseScalar(value);
}

export function parseRoutingCases(source) {
  const lines = String(source).replace(/\r\n/g, "\n").split("\n");
  const cases = [];
  let current = null;

  for (const line of lines) {
    const header = line.match(CASE_HEADER);
    if (header) {
      current = { name: header[1] };
      cases.push(current);
      continue;
    }

    if (!current) continue;

    const property = line.match(PROPERTY);
    if (!property) continue;

    const [, key, rawValue] = property;
    current[key] = parsePropertyValue(rawValue);
  }

  if (!cases.length) throw new Error("routing evaluation corpus contains no cases");
  return cases;
}

function addError(errors, code) {
  if (!errors.includes(code)) errors.push(code);
}

function nonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function nonEmptyList(value) {
  return Array.isArray(value) && value.length > 0;
}

export function validateRoutingCorpus(
  cases,
  registeredSkills,
  registeredAdapters = new Set(),
  options = {},
) {
  const errors = [];
  const seen = new Set();
  const requireEvaluationMetadata = options.requireEvaluationMetadata === true;
  for (const caseDefinition of cases) {
    if (!caseDefinition?.name) {
      addError(errors, "CASE_NAME_MISSING");
      continue;
    }
    if (seen.has(caseDefinition.name)) addError(errors, "DUPLICATE_CASE");
    seen.add(caseDefinition.name);

    if (!caseDefinition.skill) addError(errors, "PRIMARY_SKILL_MISSING");
    else if (!registeredSkills.has(caseDefinition.skill)) addError(errors, "UNKNOWN_PRIMARY_SKILL");

    if (caseDefinition.secondary !== undefined) {
      if (!Array.isArray(caseDefinition.secondary)) addError(errors, "SECONDARY_MALFORMED");
      else if (caseDefinition.secondary.some((skill) => !registeredSkills.has(skill))) addError(errors, "UNKNOWN_SECONDARY_SKILL");
    }

    if (caseDefinition.must_not_select !== undefined) {
      if (!Array.isArray(caseDefinition.must_not_select)) addError(errors, "FORBIDDEN_MALFORMED");
      else if (caseDefinition.must_not_select.some((skill) => !registeredSkills.has(skill))) addError(errors, "UNKNOWN_FORBIDDEN_SKILL");
    }

    if (caseDefinition.adapter && !registeredAdapters.has(caseDefinition.adapter)) {
      addError(errors, "UNKNOWN_ADAPTER");
    }

    if (requireEvaluationMetadata) {
      if (!nonEmptyString(caseDefinition.prompt)) addError(errors, "PROMPT_MISSING");
      if (!nonEmptyList(caseDefinition.routing_signals)) addError(errors, "ROUTING_SIGNALS_MISSING");
      if (!nonEmptyList(caseDefinition.negative_signals)) addError(errors, "NEGATIVE_SIGNALS_MISSING");
      if (!nonEmptyList(caseDefinition.evidence)) addError(errors, "EVIDENCE_MISSING");
      if (!nonEmptyString(caseDefinition.disambiguation)) addError(errors, "DISAMBIGUATION_MISSING");
      if (!Array.isArray(caseDefinition.must_not_select)) addError(errors, "FORBIDDEN_MALFORMED");
      if (!Array.isArray(caseDefinition.expected_invariants) || caseDefinition.expected_invariants.length === 0) {
        addError(errors, "EXPECTED_INVARIANTS_MISSING");
      }
    }
  }
  return errors;
}

export function parseRoutingDecisions(source) {
  const decisions = new Map();
  for (const line of String(source).split(/\r?\n/)) {
    if (!line.trim()) continue;
    let decision;
    try {
      decision = JSON.parse(line);
    } catch {
      return { errors: ["DECISION_JSON_INVALID"] };
    }
    if (!decision || typeof decision !== "object" || Array.isArray(decision)) {
      return { errors: ["DECISION_JSON_INVALID"] };
    }
    if (!decision.case) return { errors: ["DECISION_CASE_MISSING"] };
    if (decisions.has(decision.case)) return { errors: ["DUPLICATE_DECISION"] };
    decisions.set(decision.case, decision);
  }
  return decisions;
}

export function evaluateRoutingCase(caseDefinition, decision, registeredSkills) {
  const errors = [];
  const expectedPrimary = caseDefinition?.skill;
  const primary = decision?.primary;
  const secondary = decision?.secondary ?? [];
  const expectedAdapter = caseDefinition?.adapter;
  const adapter = decision?.adapter;
  const forbidden = Array.isArray(caseDefinition?.must_not_select)
    ? caseDefinition.must_not_select
    : [];

  if (!expectedPrimary) addError(errors, "CASE_PRIMARY_MISSING");
  if (typeof primary !== "string" || !primary) {
    addError(errors, "PRIMARY_MISSING");
  } else {
    if (!registeredSkills.has(primary)) addError(errors, "UNKNOWN_SKILL");
    if (expectedPrimary && primary !== expectedPrimary) addError(errors, "PRIMARY_MISMATCH");
    if (forbidden.includes(primary)) addError(errors, "FORBIDDEN_PRIMARY");
  }

  if (expectedAdapter) {
    if (typeof adapter !== "string" || !adapter) {
      addError(errors, "ADAPTER_MISSING");
    } else if (adapter !== expectedAdapter) {
      addError(errors, "ADAPTER_MISMATCH");
    }
  } else if (adapter !== undefined && adapter !== null && adapter !== "") {
    addError(errors, "UNEXPECTED_ADAPTER");
  }

  let secondaryViolation = false;

  if (!Array.isArray(secondary)) {
    addError(errors, "SECONDARY_MALFORMED");
    secondaryViolation = true;
  } else {
    const seenSecondary = new Set();

    for (const skill of secondary) {
      if (seenSecondary.has(skill)) {
        addError(errors, "DUPLICATE_SECONDARY");
        secondaryViolation = true;
      }
      seenSecondary.add(skill);

      if (typeof skill !== "string" || !skill) {
        addError(errors, "UNKNOWN_SKILL");
        secondaryViolation = true;
        continue;
      }

      if (!registeredSkills.has(skill)) {
        addError(errors, "UNKNOWN_SKILL");
        secondaryViolation = true;
      }

      if (forbidden.includes(skill)) {
        addError(errors, "FORBIDDEN_SECONDARY");
        secondaryViolation = true;
      }

      if (primary && skill === primary) {
        addError(errors, "PRIMARY_IN_SECONDARY");
        secondaryViolation = true;
      }
    }
  }

  return {
    case: caseDefinition?.name,
    pass: errors.length === 0,
    errors,
    primary,
    adapter,
    expectedAdapter,
    secondaryViolation,
  };
}

export function summarizeRoutingResults(results) {
  const total = results.length;
  const passed = results.filter((result) => result.pass).length;
  const failed = total - passed;
  const scored = results.filter(
    (result) => !result.errors.includes("DECISION_MISSING") && !result.errors.includes("UNKNOWN_CASE")
  );
  const primaryMatches = scored.filter(
    (result) => !result.errors.includes("PRIMARY_MISMATCH") && !result.errors.includes("PRIMARY_MISSING")
  ).length;

  const adapterCases = scored.filter((result) => nonEmptyString(result.expectedAdapter));
  const adapterMatches = adapterCases.filter(
    (result) =>
      !result.errors.includes("ADAPTER_MISSING") &&
      !result.errors.includes("ADAPTER_MISMATCH")
  ).length;

  const secondaryViolations = scored.filter(
    (result) =>
      result.secondaryViolation === true ||
      result.errors.some((error) =>
        ["SECONDARY_MALFORMED", "DUPLICATE_SECONDARY", "PRIMARY_IN_SECONDARY", "FORBIDDEN_SECONDARY"].includes(error)
      )
  ).length;

  return {
    total,
    passed,
    failed,
    primary_accuracy: scored.length === 0 ? 0 : primaryMatches / scored.length,
    adapter_accuracy: adapterCases.length === 0 ? null : adapterMatches / adapterCases.length,
    secondary_violation_rate: scored.length === 0 ? 0 : secondaryViolations / scored.length,
    failures: results
      .filter((result) => !result.pass)
      .map((result) => ({
        case: result.case,
        errors: result.errors,
        primary: result.primary,
      })),
  };
}
