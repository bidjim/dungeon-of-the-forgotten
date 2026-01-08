import { Context } from "../Context";
import { deriveWallFlags } from "./deriveWallFlags";
import { evaluateWallRules } from "./evaluateWallRules";
import { executeWallCommands } from "./executeWallCommands";
import { northWallRules } from "./rules/northWallRules";
import { southWallRules } from "./rules/southWallRules";
import { sideRightWallRules } from "./rules/sideRightWallRules";
import { northWallTopRules } from "./rules/northWallTopRules";
import { southWallTopRules } from "./rules/southWallTopRules";
import { northWallTopEdgeRules } from "./rules/northWallTopEdgeRules";
import { sideLeftWallRules } from "./rules/sideLeftWallRules";

/**
 * Generates all walls for a given tile context.
 * This replaces the previous generateNorthWalls, generateSouthWalls, and generateSideWalls.
 */
export function generateWalls(ctx: Context): void {
  // Derive flags once
  const flags = deriveWallFlags(ctx);

  // Evaluate each rule set
  const northCommands = evaluateWallRules(northWallRules, flags);
  const northTopCommands = evaluateWallRules(northWallTopRules, flags);
  const northTopEdgeCommands = evaluateWallRules(northWallTopEdgeRules, flags);
  const southCommands = evaluateWallRules(southWallRules, flags);
  const southTopCommands = evaluateWallRules(southWallTopRules, flags);
  const sideLeftCommands = evaluateWallRules(sideLeftWallRules, flags, false);
  const sideRightCommands = evaluateWallRules(sideRightWallRules, flags, false);

  // Combine all commands
  const allCommands = [
    ...northCommands,
    ...northTopCommands,
    ...northTopEdgeCommands,
    ...southCommands,
    ...southTopCommands,
    ...sideLeftCommands,
    ...sideRightCommands,
  ];

  // Execute once
  executeWallCommands(allCommands, ctx.tile, ctx.layers);
}
