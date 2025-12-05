export const MIN_LEAF_SIZE = 10; // Minimum size of a partition
export const MAX_LEAF_SIZE = 20; // If a partition is larger than this, it MUST split
export const MIN_ROOM_SIZE = 6; // Minimum actual room size inside a partition
export const SPLIT_CHANCE_RATIO = 0.25; // Chance for a leaf to split even if not exceeding MAX_LEAF_SIZE
