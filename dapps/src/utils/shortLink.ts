// Returns a 6-character prefix of the rule ID (excluding "0x")
export function encodeRuleId(ruleId: string): string {
  const cleanId = ruleId.startsWith('0x') ? ruleId.slice(2) : ruleId;
  return cleanId.slice(0, 6);
}

// In a real backend this would resolve from a DB.
// Since this is a demo, we will resolve it dynamically via RPC in the component or hook.
export function decodeRuleId(shortCode: string): string {
  return shortCode;
}
