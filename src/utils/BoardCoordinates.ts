
// Board Constants

// Base Positions (Center of the 4 spawn points)
export const BASE_POSITIONS = {
    yellow: { x: 5.5, z: 5.5 },
    red: { x: 5.5, z: -5.5 },
    green: { x: -5.5, z: -5.5 },
    blue: { x: -5.5, z: 5.5 }
};

// Spawn Offsets relative to Base Position
export const SPAWN_OFFSETS = [
    { x: -1.2, z: -1.2 },
    { x: 1.2, z: -1.2 },
    { x: -1.2, z: 1.2 },
    { x: 1.2, z: 1.2 }
];

// Helper to generate path segment
const createSegment = (startX: number, startZ: number, endX: number, endZ: number, count: number) => {
    const segment = [];
    for (let i = 0; i < count; i++) {
        const t = i / (count - 1);
        segment.push({
            x: startX + (endX - startX) * t,
            y: 0.2,
            z: startZ + (endZ - startZ) * t
        });
    }
    return segment;
};

// Generate Global Path (52 Steps)
// Flow: Yellow Right (In) -> Red Left (Out) -> Red Right (In) -> Green Left (Out) -> ...
// Counter-Clockwise: Yellow -> Red -> Green -> Blue
const generatePath = () => {
    const path: { x: number, y: number, z: number }[] = [];

    // --- Segment 1: Yellow Area (Bottom) -> Red Area (Right) ---
    // Yellow Right (In): (1, 6.5) -> (1, 1.5)
    path.push(...createSegment(1, 6.5, 1, 1.5, 6));
    // Center Corner 1
    path.push({ x: 1, y: 0.2, z: 1 });
    // Red Left (Out): (1.5, 1) -> (6.5, 1)
    path.push(...createSegment(1.5, 1, 6.5, 1, 6));

    // --- Segment 2: Red Area (Right) -> Green Area (Top) ---
    // Red Right (In): (6.5, -1) -> (1.5, -1)
    path.push(...createSegment(6.5, -1, 1.5, -1, 6));
    // Center Corner 2
    path.push({ x: 1, y: 0.2, z: -1 });
    // Green Left (Out): (1, -1.5) -> (1, -6.5)
    path.push(...createSegment(1, -1.5, 1, -6.5, 6));

    // --- Segment 3: Green Area (Top) -> Blue Area (Left) ---
    // Green Right (In): (-1, -6.5) -> (-1, -1.5)
    path.push(...createSegment(-1, -6.5, -1, -1.5, 6));
    // Center Corner 3
    path.push({ x: -1, y: 0.2, z: -1 });
    // Blue Left (Out): (-1.5, -1) -> (-6.5, -1)
    path.push(...createSegment(-1.5, -1, -6.5, -1, 6));

    // --- Segment 4: Blue Area (Left) -> Yellow Area (Bottom) ---
    // Blue Right (In): (-6.5, 1) -> (-1.5, 1)
    path.push(...createSegment(-6.5, 1, -1.5, 1, 6));
    // Center Corner 4
    path.push({ x: -1, y: 0.2, z: 1 });
    // Yellow Left (Out): (-1, 1.5) -> (-1, 6.5)
    path.push(...createSegment(-1, 1.5, -1, 6.5, 6));

    return path;
};

export const GLOBAL_PATH = generatePath();

// Home Paths (5 steps into center)
// Entered from the end of the "Out" row of the previous color? 
// No, entered from the Start of the "In" row of your own color.
// Yellow Home Path starts after completing the loop.
// Loop ends at Yellow Left (Out) -> Jump to Yellow Right (In).
// But if you are Yellow, you don't jump. You go to Home.
// From (1, 6.5) (Start of Yellow Right In) -> Go to Home Path.
// Home Path: (0, 6.5) -> (0, 1.5).
export const HOME_PATHS = {
    yellow: createSegment(0, 5.5, 0, 1.5, 5),
    red: createSegment(5.5, 0, 1.5, 0, 5),
    green: createSegment(0, -5.5, 0, -1.5, 5),
    blue: createSegment(-5.5, 0, -1.5, 0, 5)
};

// Start Indices in Global Path
// Start is usually the 2nd tile of the "In" track (Right Row).
// Segment starts at index 0. 2nd tile is index 1.
export const START_INDICES = {
    yellow: 1,  // Yellow Right (In) 2nd tile
    red: 14,    // Red Right (In) 2nd tile (13 + 1)
    green: 27,  // Green Right (In) 2nd tile (26 + 1)
    blue: 40    // Blue Right (In) 2nd tile (39 + 1)
};

// Safe Indices (Global)
// Start Points + Star Points (2nd tile of Out track)
// Out track starts at index 7 (6 In + 1 Corner).
// 2nd tile of Out track is index 7 + 1 = 8.
export const SAFE_INDICES = [
    1, 8,       // Yellow Start, Yellow Star
    14, 21,     // Red Start, Red Star
    27, 34,     // Green Start, Green Star
    40, 47      // Blue Start, Blue Star
];

export const getPositionVector = (color: string, position: number, tokenId: string): { x: number, y: number, z: number } => {
    let pos = { x: 0, y: 0, z: 0 };

    if (position === -1) {
        // In Base
        // @ts-ignore
        const basePos = BASE_POSITIONS[color];
        const offsetIndex = parseInt(tokenId.split('-')[1]);
        const offset = SPAWN_OFFSETS[offsetIndex];
        pos = { x: basePos.x + offset.x, y: 1.7, z: basePos.z + offset.z };
    } else if (position === 56) {
        // Finished (Goal)
        pos = { x: 0, y: 2, z: 0 };
    } else if (position >= 51) {
        // Home Stretch (Indices 0-5)
        const homeIndex = position - 51;
        // @ts-ignore
        const homePath = HOME_PATHS[color];
        if (homePath && homePath[homeIndex]) {
            const p = homePath[homeIndex];
            pos = { x: p.x, y: 1.7, z: p.z };
        }
    } else {
        // On Global Path
        // @ts-ignore
        const startIndex = START_INDICES[color];
        const globalIndex = (startIndex + position) % 52;
        const p = GLOBAL_PATH[globalIndex];
        if (p) {
            pos = { x: p.x, y: 1.7, z: p.z };
        }
    }
    return pos;
};
