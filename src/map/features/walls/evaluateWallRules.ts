import { WallFlags, WallRule, WallCommand } from "./types";

/**
 * Evaluates a set of rules against flags and returns all matching commands.
 *
 * Rules are evaluated in order. If a rule's condition matches and it returns
 * an empty command array, no further rules are evaluated (early exit).
 * This allows "skip" rules to prevent wall generation.
 */
export function evaluateWallRules(
  rules: WallRule[],
  flags: WallFlags,
  isExclusive: boolean = true
): WallCommand[] {
  const commands: WallCommand[] = [];

  for (const rule of rules) {
    if (rule.condition(flags)) {
      // If rule matches but has no commands, it's a "skip" rule
      if (rule.commands.length === 0) {
        return []; // Early exit - no wall should be generated
      }

      commands.push(...rule.commands);
      if (isExclusive) break;
    }
  }

  return commands;
}
