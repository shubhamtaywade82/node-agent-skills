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

export function validateRoutingCorpus(cases, registeredSkills, registeredAdapters = new Set()) {
  const errors = [];
  const seen = new Set();
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
  }
  return errors;
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

  if (!Array.isArray(secondary)) {
    addError(errors, "SECONDARY_MALFORMED");
  } else {
    for (const skill of secondary) {
      if (typeof skill !== "string" || !skill) {
        addError(errors, "UNKNOWN_SKILL");
        continue;
      }
      if (!registeredSkills.has(skill)) addError(errors, "UNKNOWN_SKILL");
      if (forbidden.includes(skill)) addError(errors, "FORBIDDEN_SECONDARY");
    }
  }

  return {
    case: caseDefinition?.name,
    pass: errors.length === 0,
    errors,
    primary,
    adapter,
  };
}

export function summarizeRoutingResults(results) {
  const total = results.length;
  const passed = results.filter((result) => result.pass).length;
  const failed = total - passed;
  const primaryMatches = results.filter(
    (result) => !result.errors.includes("PRIMARY_MISMATCH") && !result.errors.includes("PRIMARY_MISSING")
  ).length;

  return {
    total,
    passed,
    failed,
    primary_accuracy: total === 0 ? 0 : primaryMatches / total,
    failures: results
      .filter((result) => !result.pass)
      .map((result) => ({
        case: result.case,
        errors: result.errors,
        primary: result.primary,
      })),
  };
}
