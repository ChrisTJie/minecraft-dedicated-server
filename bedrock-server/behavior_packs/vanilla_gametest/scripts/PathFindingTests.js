import * as GameTest from "mojang-gametest";
import { MinecraftBlockTypes, BlockProperties, BlockLocation, Location } from "mojang-minecraft";

///
// Setup constants
///
const VERTICAL_TEST_TEMPLATE_NAME = "PathFindingTests:veritcal_template";
const VERTICAL_TEST_MAX_TICKS = 900; // This value may need to be increased if additional villager tests are added since village POI search is time sliced across all villagers
const VERTICAL_TEST_STARTUP_TICKS = 0;
const VERTICAL_TEST_PADDING = 100; // Space these tests apart so that villagers aren't assigned beds from nearby tests. Villages need to be kept separate.
const TEST_MAX_TICKS = 900; // This value is used for other four tests except vertical tests.
const TEST_PADDING = 100; // Space other four tests except vertical tests apart so that villagers aren't assigned beds from nearby tests.

// Here we can define small vertical obstacle courses. Villager moves from left to right.
const VERTICAL_TEST_PLACEMENT_MAP = [
  ["^^##  ", "  ^^  ", "    ^^", "######"],
  ["  ^^^^", "      ", "  ^^  ", "######"],
  ["  ####", "      ", "      ", "____##", "######"],
];

function placeBottomSlab(test, pos) {
  const blockPermutation = MinecraftBlockTypes.stoneSlab.createDefaultBlockPermutation();
  blockPermutation.getProperty(BlockProperties.stoneSlabType).value = "stone_brick";
  test.setBlockPermutation(blockPermutation, pos);
}

function placeTopSlab(test, pos) {
  const blockPermutation = MinecraftBlockTypes.stoneSlab.createDefaultBlockPermutation();
  blockPermutation.getProperty(BlockProperties.stoneSlabType).value = "stone_brick";
  blockPermutation.getProperty(BlockProperties.topSlotBit).value = true;
  test.setBlockPermutation(blockPermutation, pos);
}

function placeBlock(test, pos) {
  test.setBlockType(MinecraftBlockTypes.stonebrick, pos);
}

/*
  Places out blocks matching the given pattern (viewed from the side).
  The bottom row (last string in the array) will match the floor level in the structure.
  Sample blockMap:

  "######",
  "      ",
  "  __^^",
  "######"
*/
function placeBlocksFromMap(test, blockMap) {
  const floorY = 1;

  // We start where the villager spawns (left side of the block map)
  const spawnX = 5;
  const spawnZ = 4;

  let currentY = floorY;

  // We'll start from the bottom layer (last row in the blockMap), and work our way up
  for (let mapRowIndex = blockMap.length - 1; mapRowIndex >= 0; --mapRowIndex) {
    const mapRow = blockMap[mapRowIndex]; // one row, for example ##__##
    let currentX = spawnX;
    for (let mapColIndex = 0; mapColIndex < mapRow.length; mapColIndex += 2) {
      // One block, for example __ (2 chars wide)

      // Figure out which type of block to place (full block, bottom slab, or top slab)
      const mapChar = mapRow[mapColIndex];
      if (mapChar != " ") {
        const blockPerm = getBlockPermutationForMapChar(mapChar);

        // Place two next to each other
        for (let currentZ = spawnZ; currentZ >= spawnZ - 1; --currentZ) {
          test.setBlockPermutation(blockPerm, new BlockLocation(currentX, currentY, currentZ));
        }
      }
      --currentX;
    }
    ++currentY;
  }
}

/*
  Places blocks on the villager spawn position + the next position to the right.
  The first string (floor1) is about where the floor height should be in the start position.
  The next 3 strings define the next position's floor height, mid block, and ceiling height.
  Here's what the strings mean.

  block: ##
  top slab: ""
  bottom slab: __

  --------------------------------------------------------------------

            |         |__       |##
            |####     |####     |####
  floor1:    none      0.5       1
  --------------------------------------------------------------------

            |         |  __     |  ##
            |####     |####     |####
  floor2:    none      0.5       1
  --------------------------------------------------------------------

            |         |         |  __     |  ^^     |  ##
            |         |  ^^     |         |         |
            |####     |####     |####     |####     |####
  mid2:      none      0.5 slab  1 slab    1.5 slab  1 full
  --------------------------------------------------------------------

            |         |  ##     |  ##     |  ##     |  ##     |  ^^
            |         |  ##     |  ##     |  ^^     |         |
            |         |  ^^     |         |         |         |
            |####     |####     |####     |####     |####     |####
  ceiling:   none      0.5       1         1.5       2         2.5
  --------------------------------------------------------------------
*/
function placeBlocks(test, floor1, floor2, mid2, ceiling2) {
  const spawnPos = new BlockLocation(5, 2, 4);

  // We place two of each block, at z and z-1.
  for (let zOffset = 0; zOffset >= -1; --zOffset) {
    // floor1 defines how high the block is where the villager spawns
    if (floor1 == "0.5") {
      placeBottomSlab(test, spawnPos.offset(0, 0, zOffset));
    } else if (floor1 == "1") {
      placeBlock(test, spawnPos.offset(0, 0, zOffset));
    }

    // floor2 defines the height of the position to the right of the villager spawn
    if (floor2 == "0.5") {
      placeBottomSlab(test, spawnPos.offset(-1, 0, zOffset));
    } else if (floor2 == "1") {
      placeBlock(test, spawnPos.offset(-1, 0, zOffset));
    }

    // mid2 defines any mid-level block in the position to the right of the villager spawn
    if (mid2 == "0.5 slab") {
      placeTopSlab(test, spawnPos.offset(-1, 0, zOffset));
    } else if (mid2 == "1 slab") {
      placeBottomSlab(test, spawnPos.offset(-1, 1, zOffset));
    } else if (mid2 == "1.5 slab") {
      placeTopSlab(test, spawnPos.offset(-1, 1, zOffset));
    } else if (mid2 == "1 full") {
      placeBlock(test, spawnPos.offset(-1, 1, zOffset));
    }

    // ceiling2 defines the ceiling height in the position to the right of the villager spawn
    if (ceiling2 == "0.5") {
      placeBlock(test, spawnPos.offset(-1, 2, zOffset));
      placeBlock(test, spawnPos.offset(-1, 1, zOffset));
      placeTopSlab(test, spawnPos.offset(-1, 0, zOffset));
    } else if (ceiling2 == "1") {
      placeBlock(test, spawnPos.offset(-1, 2, zOffset));
      placeBlock(test, spawnPos.offset(-1, 1, zOffset));
    } else if (ceiling2 == "1.5") {
      placeBlock(test, spawnPos.offset(-1, 2, zOffset));
      placeTopSlab(test, spawnPos.offset(-1, 1, zOffset));
    } else if (ceiling2 == "2") {
      placeBlock(test, spawnPos.offset(-1, 2, zOffset));
    } else if (ceiling2 == "2.5") {
      placeTopSlab(test, spawnPos.offset(-1, 2, zOffset));
    }
  }
}

function getBlockPermutationForMapChar(mapChar) {
  if (mapChar == "#") {
    return MinecraftBlockTypes.stonebrick.createDefaultBlockPermutation();
  } else if (mapChar == "_") {
    let result = MinecraftBlockTypes.stoneSlab.createDefaultBlockPermutation();
    result.getProperty(BlockProperties.stoneSlabType).value = "stone_brick";
    return result;
  } else if (mapChar == "^") {
    let result = MinecraftBlockTypes.stoneSlab.createDefaultBlockPermutation();
    result.getProperty(BlockProperties.stoneSlabType).value = "stone_brick";
    result.getProperty(BlockProperties.topSlotBit).value = true;
    return result;
  } else {
    return MinecraftBlockTypes.air.createDefaultBlockPermutation();
  }
}

function createVerticalTestFunctionWithPlacementMap(counter, placementMap, tag) {
  if (tag == null) {
    tag = GameTest.Tags.suiteDefault;
  }

  const testName = "Vertical" + counter;
  GameTest.register("PathFindingTests", testName, (test) => {
    const villagerEntityType = "minecraft:villager_v2";
    const villagerEntitySpawnType = villagerEntityType + "<minecraft:become_farmer>"; // Attempt to spawn the villagers as farmers

    // Prepare the map
    placeBlocksFromMap(test, placementMap);
    const bedPos = new BlockLocation(1, 2, 4);
    const doubleAboveBedPos = bedPos.above().above(); // Check 2 blocks above the bed because under rare circumstances the villager hit box may stick out above the bed block when lying down. (Shouldn't happen anymore)
    const singleAboveBedPos = bedPos.above(); // Villager hit box should be working in bed properly now
    const spawnPos = new BlockLocation(5, 3, 4);

    // Do the test
    test.assertEntityPresent(villagerEntityType, bedPos, false);
    test.spawn(villagerEntitySpawnType, spawnPos);

    test.succeedWhen(() => {
      test.assertEntityPresent(villagerEntityType, singleAboveBedPos, false);
      test.assertEntityPresent(villagerEntityType, doubleAboveBedPos, false);
      test.assertEntityPresent(villagerEntityType, bedPos, true);

      test.killAllEntities(); // Clean up villagers so the VillageManager doesn't waste time looking for points of interest (POIs)
    });
  })
    .structureName(VERTICAL_TEST_TEMPLATE_NAME)
    .maxTicks(VERTICAL_TEST_MAX_TICKS)
    .setupTicks(VERTICAL_TEST_STARTUP_TICKS)
    .padding(VERTICAL_TEST_PADDING)
    .batch("night")
    .tag(tag);
}

function createVerticalTestFunctionWithCustomBlocks(testName, floor1, floor2, mid2, ceiling2, tag) {
  if (tag == null) {
    tag = GameTest.Tags.suiteDefault;
  }

  GameTest.register("PathFindingTests", testName, (test) => {
    const villagerEntityType = "minecraft:villager_v2";
    const villagerEntitySpawnType = villagerEntityType + "<minecraft:become_farmer>"; // Attempt to spawn the villagers as farmers

    // Prepare the map
    placeBlocks(test, floor1, floor2, mid2, ceiling2);
    const bedPos = new BlockLocation(1, 2, 4);
    const doubleAboveBedPos = bedPos.above().above(); // Check 2 blocks above the bed because under rare circumstances the villager hit box may stick out above the bed block when lying down. (Shouldn't happen anymore)
    const singleAboveBedPos = bedPos.above(); // Villager hit box should be working in bed properly now
    const spawnPos = new BlockLocation(5, 3, 4);

    // Do the test
    test.assertEntityPresent(villagerEntityType, bedPos, false);
    test.spawn(villagerEntitySpawnType, spawnPos);
    test.succeedWhen(() => {
      test.assertEntityPresent(villagerEntityType, singleAboveBedPos, false);
      test.assertEntityPresent(villagerEntityType, doubleAboveBedPos, false);
      test.assertEntityPresent(villagerEntityType, bedPos, true);

      test.killAllEntities(); // Clean up villagers so the VillageManager doesn't waste time looking for points of interest (POIs)
    });
  })
    .structureName(VERTICAL_TEST_TEMPLATE_NAME)
    .maxTicks(VERTICAL_TEST_MAX_TICKS)
    .setupTicks(VERTICAL_TEST_STARTUP_TICKS)
    .padding(VERTICAL_TEST_PADDING)
    .batch("night")
    .tag(tag);
}

function addVerticalTest(counter, floor1, floor2, mid2, ceiling2, tag) {
  const testName = "Vertical" + counter;
  createVerticalTestFunctionWithCustomBlocks(testName, floor1, floor2, mid2, ceiling2, tag);
}

GameTest.register("PathFindingTests", "bottleneck", (test) => {
  const villagerEntitySpawnType = "minecraft:villager_v2<minecraft:spawn_farmer>";

  test.spawn(villagerEntitySpawnType, new BlockLocation(5, 2, 4));
  test.spawn(villagerEntitySpawnType, new BlockLocation(4, 2, 5));
  test.spawn(villagerEntitySpawnType, new BlockLocation(2, 2, 5));
  test.spawn(villagerEntitySpawnType, new BlockLocation(1, 2, 4));

  test.succeedWhen(() => {
    test.assertEntityPresent(villagerEntitySpawnType, new BlockLocation(5, 2, 2), true);
    test.assertEntityPresent(villagerEntitySpawnType, new BlockLocation(5, 2, 1), true);
    test.assertEntityPresent(villagerEntitySpawnType, new BlockLocation(1, 2, 2), true);
    test.assertEntityPresent(villagerEntitySpawnType, new BlockLocation(1, 2, 1), true);
  });
})
  .padding(TEST_PADDING) // Space out villager tests to stop them from confusing each other
  .batch("night")
  .maxTicks(TEST_MAX_TICKS)
  .tag("suite:java_parity")
  .tag(GameTest.Tags.suiteDisabled); // Villagers can get stuck on sleeping villagers sometimes

GameTest.register("PathFindingTests", "doorway", (test) => {
    const villagerEntitySpawnType = "minecraft:villager_v2<minecraft:spawn_farmer>";

    test.spawn(villagerEntitySpawnType, new BlockLocation(2, 2, 6));

    test.succeedWhen(() => {
        test.assertEntityPresent(villagerEntitySpawnType, new BlockLocation(2, 2, 2), true);
    });
})
    .padding(TEST_PADDING) // Space out villager tests to stop them from confusing each other
    .batch("night")
    .maxTicks(TEST_MAX_TICKS)
    .tag(GameTest.Tags.suiteDefault);

GameTest.register("PathFindingTests", "doorway_with_stairs", (test) => {
    const villagerEntitySpawnType = "minecraft:villager_v2<minecraft:spawn_farmer>";

    test.spawn(villagerEntitySpawnType, new BlockLocation(2, 2, 8));

    test.succeedWhen(() => {
        test.assertEntityPresent(villagerEntitySpawnType, new BlockLocation(2, 2, 2), true);
    });
})
    .padding(TEST_PADDING) // Space out villager tests to stop them from confusing each other
    .batch("night")
    .maxTicks(TEST_MAX_TICKS)
    .tag(GameTest.Tags.suiteDefault);

GameTest.register("PathFindingTests", "doorway_with_slabs", (test) => {
    const villagerEntitySpawnType = "minecraft:villager_v2<minecraft:spawn_farmer>";

    test.spawn(villagerEntitySpawnType, new BlockLocation(2, 2, 8));

    test.succeedWhen(() => {
        test.assertEntityPresent(villagerEntitySpawnType, new BlockLocation(2, 2, 2), true);
    });
})
    .padding(TEST_PADDING) // Space out villager tests to stop them from confusing each other
    .batch("night")
    .maxTicks(TEST_MAX_TICKS)
    .tag(GameTest.Tags.suiteDefault);

GameTest.register("PathFindingTests", "big_obstacle_course", (test) => {
  const bedPos = new BlockLocation(4, 3, 6);
  const spawnPos = new BlockLocation(5, 3, 4);
  const villagerEntitySpawnType = "minecraft:villager_v2<minecraft:spawn_farmer>";

  test.assertEntityPresent(villagerEntitySpawnType, bedPos, false);
  test.spawn(villagerEntitySpawnType, spawnPos);

  test.succeedWhenEntityPresent(villagerEntitySpawnType, bedPos, true);
})
  .padding(TEST_PADDING)
  .maxTicks(TEST_MAX_TICKS)
  .batch("night")
  .required(false)
  .tag("suite:java_parity") // Test fails both on Java and Bedrock sometimes.
  .tag(GameTest.Tags.suiteDisabled); // Village couldn't cross the polished granite most times, so fail to find a path to bed.

GameTest.register("PathFindingTests", "simple", (test) => {
  const bedPos = new BlockLocation(1, 2, 4);
  const spawnPos = new BlockLocation(5, 3, 4);
  const villagerEntitySpawnType = "minecraft:villager_v2<minecraft:spawn_farmer>";

  test.assertEntityPresent(villagerEntitySpawnType, bedPos, false);
  test.spawn(villagerEntitySpawnType, spawnPos);

  test.succeedWhenEntityPresent(villagerEntitySpawnType, bedPos, true);
})
  .maxTicks(TEST_MAX_TICKS)
  .batch("night")
  .required(false)
  .padding(TEST_PADDING)
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("PathFindingTests", "carpet_walk_around", (test) => {
  const bedPos = new BlockLocation(1, 2, 4);
  const spawnPos = new BlockLocation(5, 3, 4);
  const villagerEntitySpawnType = "minecraft:villager_v2<minecraft:spawn_farmer>";

  test.assertEntityPresent(villagerEntitySpawnType, bedPos, false);
  test.spawn(villagerEntitySpawnType, spawnPos);

  test.succeedWhenEntityPresent(villagerEntitySpawnType, bedPos, true);
})
  .padding(TEST_PADDING)
  .maxTicks(TEST_MAX_TICKS)
  .batch("night")
  .required(false)
  .tag("suite:java_parity") // Test fails both on Java and Bedrock sometimes.
  .tag(GameTest.Tags.suiteDisabled); // Village couldn't walk around the carpet sometimes.

// Tests for a two blocks tall mob to properly pathfind around and over trapdoors. Does not require padding.
GameTest.register("PathFindingTests", "trapdoors", (test) => {
    const villagerEntitySpawnType = "minecraft:villager_v2<minecraft:spawn_farmer>";

    const spawnPos = new Location(3.5, 2, 10.5);
    const villager = test.spawnWithoutBehaviorsAtLocation(villagerEntitySpawnType, spawnPos);

    const targetPos = new BlockLocation(3, 2, 2);
    test.walkTo(villager, targetPos, 1);

    test.succeedWhen(() => {
        test.assertEntityPresent(villagerEntitySpawnType, targetPos, true);
    });
})
    .maxTicks(TEST_MAX_TICKS)
    .tag(GameTest.Tags.suiteDefault);

// Tests for a one block tall mob to properly pathfind around and over trapdoors. Does not require padding.
GameTest.register("PathFindingTests", "trapdoors_short_mob", (test) => {
    const pigSpawnType = "minecraft:pig";

    const spawnPos = new Location(3.5, 2, 10.5);
    const pig = test.spawnWithoutBehaviorsAtLocation(pigSpawnType, spawnPos);

    const targetPos = new BlockLocation(3, 2, 2);
    test.walkTo(pig, targetPos, 1);

    test.succeedWhen(() => {
        test.assertEntityPresent(pigSpawnType, targetPos, true);
    });
})
    .maxTicks(TEST_MAX_TICKS)
    .tag(GameTest.Tags.suiteDefault);

///
// Register tests
///
createVerticalTestFunctionWithPlacementMap(0, VERTICAL_TEST_PLACEMENT_MAP[0]);
createVerticalTestFunctionWithPlacementMap(1, VERTICAL_TEST_PLACEMENT_MAP[1]);
createVerticalTestFunctionWithPlacementMap(2, VERTICAL_TEST_PLACEMENT_MAP[2]);

addVerticalTest(3, "0", "0", "0.5 slab", "1.5");
addVerticalTest(4, "0", "0", "0.5 slab", "2");
addVerticalTest(5, "0", "0", "1 slab", "2");
addVerticalTest(6, "0", "0", "1 slab", "2.5");
addVerticalTest(7, "0", "0", "1.5 slab", "2.5");
addVerticalTest(8, "0", "0", "1 full", "2.5");
addVerticalTest(9, "0", "0", "none", "0.5");
addVerticalTest(10, "0", "0", "none", "1");
addVerticalTest(11, "0", "0", "none", "1.5");
addVerticalTest(12, "0", "0.5", "1 slab", "2");
addVerticalTest(13, "0", "0.5", "1 slab", "2.5");
addVerticalTest(14, "0", "0.5", "1.5 slab", "2.5");
addVerticalTest(15, "0", "0.5", "1 full", "2.5");
addVerticalTest(16, "0", "0.5", "none", "1");
addVerticalTest(17, "0", "0.5", "none", "1.5");
addVerticalTest(18, "0", "0.5", "none", "2", GameTest.Tags.suiteDisabled); // Villager attempts to jump over slab with single block gap above it
addVerticalTest(19, "0", "0.5", "none", "2.5");
addVerticalTest(20, "0", "1", "1.5 slab", "2.5");
addVerticalTest(21, "0", "1", "none", "1.5");
addVerticalTest(22, "0", "1", "none", "2");
addVerticalTest(23, "0", "1", "none", "2.5");
addVerticalTest(24, "0.5", "0", "0.5 slab", "1.5");
addVerticalTest(25, "0.5", "0", "0.5 slab", "2");
addVerticalTest(26, "0.5", "0", "0.5 slab", "2.5");
addVerticalTest(27, "0.5", "0", "1 slab", "2");
addVerticalTest(28, "0.5", "0", "1 slab", "2.5");
addVerticalTest(29, "0.5", "0", "1 slab", "none", GameTest.Tags.suiteDisabled); // Villager attempts to walk through floating slab while standing on slab
addVerticalTest(30, "0.5", "0", "1.5 slab", "2.5");
addVerticalTest(31, "0.5", "0", "1.5 slab", "none");
addVerticalTest(32, "0.5", "0", "1 full", "2.5");
addVerticalTest(33, "0.5", "0", "1 full", "none");
addVerticalTest(34, "0.5", "0", "none", "1.5");
addVerticalTest(35, "0.5", "0", "none", "2", GameTest.Tags.suiteDisabled); // Villager attempts to jump down from a slab to a 1.5 block gap but hits head on block
addVerticalTest(36, "0.5", "0", "none", "2.5");
addVerticalTest(37, "0.5", "0.5", "1 slab", "2");
addVerticalTest(38, "0.5", "0.5", "1 slab", "2.5");
addVerticalTest(39, "0.5", "0.5", "1 slab", "none");
addVerticalTest(40, "0.5", "0.5", "1.5 slab", "2.5");
addVerticalTest(41, "0.5", "0.5", "1.5 slab", "none");
addVerticalTest(42, "0.5", "0.5", "1 full", "2.5");
addVerticalTest(43, "0.5", "0.5", "1 full", "none");
addVerticalTest(44, "0.5", "0.5", "none", "1.5");
addVerticalTest(45, "0.5", "0.5", "none", "2", GameTest.Tags.suiteDisabled); // Villager attempts to walk through 1 block gap while standing on slab
addVerticalTest(46, "0.5", "0.5", "none", "2.5");
addVerticalTest(47, "0.5", "1", "1.5 slab", "2.5");
addVerticalTest(48, "0.5", "1", "1.5 slab", "none");
addVerticalTest(49, "0.5", "1", "none", "1.5");
addVerticalTest(50, "0.5", "1", "none", "2");
addVerticalTest(51, "0.5", "1", "none", "2.5");
addVerticalTest(52, "0.5", "1", "none", "none");
addVerticalTest(53, "1", "0", "none", "1.5");
addVerticalTest(54, "1", "0", "none", "2"); // Flaky
addVerticalTest(55, "1", "0", "none", "2.5"); // Flaky
addVerticalTest(56, "1", "0", "none", "none");
addVerticalTest(57, "1", "0.5", "none", "1.5");
addVerticalTest(58, "1", "0.5", "none", "2", GameTest.Tags.suiteDisabled); // Villager constantly attempts to jump into 1 block gap
addVerticalTest(59, "1", "0.5", "none", "2.5");
addVerticalTest(60, "1", "0.5", "none", "none");

// SIG // Begin signature block
// SIG // MIInsQYJKoZIhvcNAQcCoIInojCCJ54CAQExDzANBglg
// SIG // hkgBZQMEAgEFADB3BgorBgEEAYI3AgEEoGkwZzAyBgor
// SIG // BgEEAYI3AgEeMCQCAQEEEBDgyQbOONQRoqMAEEvTUJAC
// SIG // AQACAQACAQACAQACAQAwMTANBglghkgBZQMEAgEFAAQg
// SIG // po46/bIR2u4xD3Zt5z3xOX8x9TgtFoy8palP/t3z1Qyg
// SIG // gg2BMIIF/zCCA+egAwIBAgITMwAAAsyOtZamvdHJTgAA
// SIG // AAACzDANBgkqhkiG9w0BAQsFADB+MQswCQYDVQQGEwJV
// SIG // UzETMBEGA1UECBMKV2FzaGluZ3RvbjEQMA4GA1UEBxMH
// SIG // UmVkbW9uZDEeMBwGA1UEChMVTWljcm9zb2Z0IENvcnBv
// SIG // cmF0aW9uMSgwJgYDVQQDEx9NaWNyb3NvZnQgQ29kZSBT
// SIG // aWduaW5nIFBDQSAyMDExMB4XDTIyMDUxMjIwNDYwMVoX
// SIG // DTIzMDUxMTIwNDYwMVowdDELMAkGA1UEBhMCVVMxEzAR
// SIG // BgNVBAgTCldhc2hpbmd0b24xEDAOBgNVBAcTB1JlZG1v
// SIG // bmQxHjAcBgNVBAoTFU1pY3Jvc29mdCBDb3Jwb3JhdGlv
// SIG // bjEeMBwGA1UEAxMVTWljcm9zb2Z0IENvcnBvcmF0aW9u
// SIG // MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA
// SIG // ok2x7OvGwA7zbnfezc3HT9M4dJka+FaQ7+vCqG40Bcm1
// SIG // QLlYIiDX/Whts0LVijaOvtl9iMeuShnAV7mchItKAVAA
// SIG // BpyHuTuav2NCI9FsA8jFmlWndk3uK9RInNx1h1H4ojYx
// SIG // dBExyoN6muwwslKsLEfauUml7h5WAsDPpufTZd4yp2Jy
// SIG // iy384Zdd8CJlfQxfDe+gDZEciugWKHPSOoRxdjAk0GFm
// SIG // 0OH14MyoYM4+M3mm1oH7vmSQohS5KIL3NEVW9Mdw7csT
// SIG // G5f93uORLvrJ/8ehFcGyWVb7UGHJnRhdcgGIbfiZzZls
// SIG // AMS/DIBzM8RHKGNUNSbbLYmN/rt7pRjL4QIDAQABo4IB
// SIG // fjCCAXowHwYDVR0lBBgwFgYKKwYBBAGCN0wIAQYIKwYB
// SIG // BQUHAwMwHQYDVR0OBBYEFIi4R40ylsyKlSKfrDNqzhx9
// SIG // da30MFAGA1UdEQRJMEekRTBDMSkwJwYDVQQLEyBNaWNy
// SIG // b3NvZnQgT3BlcmF0aW9ucyBQdWVydG8gUmljbzEWMBQG
// SIG // A1UEBRMNMjMwMDEyKzQ3MDUyOTAfBgNVHSMEGDAWgBRI
// SIG // bmTlUAXTgqoXNzcitW2oynUClTBUBgNVHR8ETTBLMEmg
// SIG // R6BFhkNodHRwOi8vd3d3Lm1pY3Jvc29mdC5jb20vcGtp
// SIG // b3BzL2NybC9NaWNDb2RTaWdQQ0EyMDExXzIwMTEtMDct
// SIG // MDguY3JsMGEGCCsGAQUFBwEBBFUwUzBRBggrBgEFBQcw
// SIG // AoZFaHR0cDovL3d3dy5taWNyb3NvZnQuY29tL3BraW9w
// SIG // cy9jZXJ0cy9NaWNDb2RTaWdQQ0EyMDExXzIwMTEtMDct
// SIG // MDguY3J0MAwGA1UdEwEB/wQCMAAwDQYJKoZIhvcNAQEL
// SIG // BQADggIBAHgPA7DgB0udzEyB2LvG216zuskLUQ+iX8jF
// SIG // nl2i7tzXPDw5xXNXn2KvxdzBsf2osDW3LCdjFOwSjVkz
// SIG // +SUFQQNhjSHkd5knF6pzrL9V6lz72XiEg1Vi2gUM3HiL
// SIG // XSMIKOgdd78ZZJEmDLwdA692MO/1vVOFpOSv0QzpyBr5
// SIG // iqiotwMMsZVdZqXn8u9vRSmlk+3nQXdyOPoZXTGPLHXw
// SIG // z41kbSc4zI12bONTlDsLR3HD2s44wuyp3c72R8f9FVi/
// SIG // J9DU/+NOL37Z1yonzGZEuKdrAd6CvupAnLMlrIEv93mB
// SIG // sNRXuDDp4p9UYYK1taxzzgyUxgFDpluMHN0Oiiq9s73u
// SIG // 7DA2XvbX8paJz8IZPe9a1/KhsOi5Kxhb99SCXiUnv2lG
// SIG // xnVAz5G6wAW1bzxJYKI+Xj90RKseY3X5EMO7TnVpIZ9I
// SIG // w1IdrkHp/QLY90ZCch7kdBlLCVTFhSXZCDv4BcM6DhpR
// SIG // zbJsb6QDVfOv9aoG9aGV3a1EacyaedzLA2gWP6cTnCdA
// SIG // r4OrlrN5EFoCpOWgc77F/eQc3SLR06VTLVT1uKuNVxL2
// SIG // xZlD9Z+qC+a3TXa0zI/x1zEZNSgpLGsdVcaN6r/td3Ar
// SIG // GQGkDWiAL7eS75LIWZA2SD//9B56uzZ1nmEd8+KBYsPT
// SIG // dp922/W2kFrlj7MBtA6vWE/ZG/grOKiCMIIHejCCBWKg
// SIG // AwIBAgIKYQ6Q0gAAAAAAAzANBgkqhkiG9w0BAQsFADCB
// SIG // iDELMAkGA1UEBhMCVVMxEzARBgNVBAgTCldhc2hpbmd0
// SIG // b24xEDAOBgNVBAcTB1JlZG1vbmQxHjAcBgNVBAoTFU1p
// SIG // Y3Jvc29mdCBDb3Jwb3JhdGlvbjEyMDAGA1UEAxMpTWlj
// SIG // cm9zb2Z0IFJvb3QgQ2VydGlmaWNhdGUgQXV0aG9yaXR5
// SIG // IDIwMTEwHhcNMTEwNzA4MjA1OTA5WhcNMjYwNzA4MjEw
// SIG // OTA5WjB+MQswCQYDVQQGEwJVUzETMBEGA1UECBMKV2Fz
// SIG // aGluZ3RvbjEQMA4GA1UEBxMHUmVkbW9uZDEeMBwGA1UE
// SIG // ChMVTWljcm9zb2Z0IENvcnBvcmF0aW9uMSgwJgYDVQQD
// SIG // Ex9NaWNyb3NvZnQgQ29kZSBTaWduaW5nIFBDQSAyMDEx
// SIG // MIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKCAgEA
// SIG // q/D6chAcLq3YbqqCEE00uvK2WCGfQhsqa+laUKq4Bjga
// SIG // BEm6f8MMHt03a8YS2AvwOMKZBrDIOdUBFDFC04kNeWSH
// SIG // fpRgJGyvnkmc6Whe0t+bU7IKLMOv2akrrnoJr9eWWcpg
// SIG // GgXpZnboMlImEi/nqwhQz7NEt13YxC4Ddato88tt8zpc
// SIG // oRb0RrrgOGSsbmQ1eKagYw8t00CT+OPeBw3VXHmlSSnn
// SIG // Db6gE3e+lD3v++MrWhAfTVYoonpy4BI6t0le2O3tQ5GD
// SIG // 2Xuye4Yb2T6xjF3oiU+EGvKhL1nkkDstrjNYxbc+/jLT
// SIG // swM9sbKvkjh+0p2ALPVOVpEhNSXDOW5kf1O6nA+tGSOE
// SIG // y/S6A4aN91/w0FK/jJSHvMAhdCVfGCi2zCcoOCWYOUo2
// SIG // z3yxkq4cI6epZuxhH2rhKEmdX4jiJV3TIUs+UsS1Vz8k
// SIG // A/DRelsv1SPjcF0PUUZ3s/gA4bysAoJf28AVs70b1FVL
// SIG // 5zmhD+kjSbwYuER8ReTBw3J64HLnJN+/RpnF78IcV9uD
// SIG // jexNSTCnq47f7Fufr/zdsGbiwZeBe+3W7UvnSSmnEyim
// SIG // p31ngOaKYnhfsi+E11ecXL93KCjx7W3DKI8sj0A3T8Hh
// SIG // hUSJxAlMxdSlQy90lfdu+HggWCwTXWCVmj5PM4TasIgX
// SIG // 3p5O9JawvEagbJjS4NaIjAsCAwEAAaOCAe0wggHpMBAG
// SIG // CSsGAQQBgjcVAQQDAgEAMB0GA1UdDgQWBBRIbmTlUAXT
// SIG // gqoXNzcitW2oynUClTAZBgkrBgEEAYI3FAIEDB4KAFMA
// SIG // dQBiAEMAQTALBgNVHQ8EBAMCAYYwDwYDVR0TAQH/BAUw
// SIG // AwEB/zAfBgNVHSMEGDAWgBRyLToCMZBDuRQFTuHqp8cx
// SIG // 0SOJNDBaBgNVHR8EUzBRME+gTaBLhklodHRwOi8vY3Js
// SIG // Lm1pY3Jvc29mdC5jb20vcGtpL2NybC9wcm9kdWN0cy9N
// SIG // aWNSb29DZXJBdXQyMDExXzIwMTFfMDNfMjIuY3JsMF4G
// SIG // CCsGAQUFBwEBBFIwUDBOBggrBgEFBQcwAoZCaHR0cDov
// SIG // L3d3dy5taWNyb3NvZnQuY29tL3BraS9jZXJ0cy9NaWNS
// SIG // b29DZXJBdXQyMDExXzIwMTFfMDNfMjIuY3J0MIGfBgNV
// SIG // HSAEgZcwgZQwgZEGCSsGAQQBgjcuAzCBgzA/BggrBgEF
// SIG // BQcCARYzaHR0cDovL3d3dy5taWNyb3NvZnQuY29tL3Br
// SIG // aW9wcy9kb2NzL3ByaW1hcnljcHMuaHRtMEAGCCsGAQUF
// SIG // BwICMDQeMiAdAEwAZQBnAGEAbABfAHAAbwBsAGkAYwB5
// SIG // AF8AcwB0AGEAdABlAG0AZQBuAHQALiAdMA0GCSqGSIb3
// SIG // DQEBCwUAA4ICAQBn8oalmOBUeRou09h0ZyKbC5YR4WOS
// SIG // mUKWfdJ5DJDBZV8uLD74w3LRbYP+vj/oCso7v0epo/Np
// SIG // 22O/IjWll11lhJB9i0ZQVdgMknzSGksc8zxCi1LQsP1r
// SIG // 4z4HLimb5j0bpdS1HXeUOeLpZMlEPXh6I/MTfaaQdION
// SIG // 9MsmAkYqwooQu6SpBQyb7Wj6aC6VoCo/KmtYSWMfCWlu
// SIG // WpiW5IP0wI/zRive/DvQvTXvbiWu5a8n7dDd8w6vmSiX
// SIG // mE0OPQvyCInWH8MyGOLwxS3OW560STkKxgrCxq2u5bLZ
// SIG // 2xWIUUVYODJxJxp/sfQn+N4sOiBpmLJZiWhub6e3dMNA
// SIG // BQamASooPoI/E01mC8CzTfXhj38cbxV9Rad25UAqZaPD
// SIG // XVJihsMdYzaXht/a8/jyFqGaJ+HNpZfQ7l1jQeNbB5yH
// SIG // PgZ3BtEGsXUfFL5hYbXw3MYbBL7fQccOKO7eZS/sl/ah
// SIG // XJbYANahRr1Z85elCUtIEJmAH9AAKcWxm6U/RXceNcbS
// SIG // oqKfenoi+kiVH6v7RyOA9Z74v2u3S5fi63V4GuzqN5l5
// SIG // GEv/1rMjaHXmr/r8i+sLgOppO6/8MO0ETI7f33VtY5E9
// SIG // 0Z1WTk+/gFcioXgRMiF670EKsT/7qMykXcGhiJtXcVZO
// SIG // SEXAQsmbdlsKgEhr/Xmfwb1tbWrJUnMTDXpQzTGCGYgw
// SIG // ghmEAgEBMIGVMH4xCzAJBgNVBAYTAlVTMRMwEQYDVQQI
// SIG // EwpXYXNoaW5ndG9uMRAwDgYDVQQHEwdSZWRtb25kMR4w
// SIG // HAYDVQQKExVNaWNyb3NvZnQgQ29ycG9yYXRpb24xKDAm
// SIG // BgNVBAMTH01pY3Jvc29mdCBDb2RlIFNpZ25pbmcgUENB
// SIG // IDIwMTECEzMAAALMjrWWpr3RyU4AAAAAAswwDQYJYIZI
// SIG // AWUDBAIBBQCggcAwGQYJKoZIhvcNAQkDMQwGCisGAQQB
// SIG // gjcCAQQwHAYKKwYBBAGCNwIBCzEOMAwGCisGAQQBgjcC
// SIG // ARUwLwYJKoZIhvcNAQkEMSIEICzqzsOJhSHx/IdvL2LT
// SIG // DRLZc3OOf0ZQx4kztsYccoomMFQGCisGAQQBgjcCAQwx
// SIG // RjBEoCSAIgBNAGkAbgBlAGMAcgBhAGYAdAAgAEIAZQBk
// SIG // AHIAbwBjAGuhHIAaaHR0cHM6Ly93d3cubWluZWNyYWZ0
// SIG // Lm5ldC8wDQYJKoZIhvcNAQEBBQAEggEAfqM2g/3ZS6n1
// SIG // k/nw7SkkRBI1OhkXnqt9EVUYFDjM+AOZP/JOd9G6NDzn
// SIG // WGIp3v6ug2J40OtQH3nSe8y2pBtKw8Ny0tURcl3qPDh2
// SIG // FeOA9LVQPI3JcPldbzVBuRZKSbB8xJljkBG8S1mrCoJq
// SIG // V3VWIQC0eMeXZuteM1dZz6oDqDvEN3rRknG9NOk6aH4V
// SIG // Y1S6NusF3rKKjnfFRayGHiuvsxQDfHIs0dwu0AxqHhhN
// SIG // La6iJA4qbz7XnhX6irhbvJFak3J8oOHjn6qJM5WLQPE/
// SIG // Bmu9QdH5jwBMniVAXOIEqOw8ovnx+jqNydHZiT0cLGUm
// SIG // 7DDGnpgAi58LRCysXI0TLaGCFwAwghb8BgorBgEEAYI3
// SIG // AwMBMYIW7DCCFugGCSqGSIb3DQEHAqCCFtkwghbVAgED
// SIG // MQ8wDQYJYIZIAWUDBAIBBQAwggFRBgsqhkiG9w0BCRAB
// SIG // BKCCAUAEggE8MIIBOAIBAQYKKwYBBAGEWQoDATAxMA0G
// SIG // CWCGSAFlAwQCAQUABCCbbmqm+LUbtmZeyHeaVUG4XAxp
// SIG // kJhEmaQ0NBeQuyib6AIGYyNLC6hnGBMyMDIyMDkyODIz
// SIG // NTEyNS4wNTFaMASAAgH0oIHQpIHNMIHKMQswCQYDVQQG
// SIG // EwJVUzETMBEGA1UECBMKV2FzaGluZ3RvbjEQMA4GA1UE
// SIG // BxMHUmVkbW9uZDEeMBwGA1UEChMVTWljcm9zb2Z0IENv
// SIG // cnBvcmF0aW9uMSUwIwYDVQQLExxNaWNyb3NvZnQgQW1l
// SIG // cmljYSBPcGVyYXRpb25zMSYwJAYDVQQLEx1UaGFsZXMg
// SIG // VFNTIEVTTjpFNUE2LUUyN0MtNTkyRTElMCMGA1UEAxMc
// SIG // TWljcm9zb2Z0IFRpbWUtU3RhbXAgU2VydmljZaCCEVcw
// SIG // ggcMMIIE9KADAgECAhMzAAABlbf8DdbjNzElAAEAAAGV
// SIG // MA0GCSqGSIb3DQEBCwUAMHwxCzAJBgNVBAYTAlVTMRMw
// SIG // EQYDVQQIEwpXYXNoaW5ndG9uMRAwDgYDVQQHEwdSZWRt
// SIG // b25kMR4wHAYDVQQKExVNaWNyb3NvZnQgQ29ycG9yYXRp
// SIG // b24xJjAkBgNVBAMTHU1pY3Jvc29mdCBUaW1lLVN0YW1w
// SIG // IFBDQSAyMDEwMB4XDTIxMTIwMjE5MDUxMloXDTIzMDIy
// SIG // ODE5MDUxMlowgcoxCzAJBgNVBAYTAlVTMRMwEQYDVQQI
// SIG // EwpXYXNoaW5ndG9uMRAwDgYDVQQHEwdSZWRtb25kMR4w
// SIG // HAYDVQQKExVNaWNyb3NvZnQgQ29ycG9yYXRpb24xJTAj
// SIG // BgNVBAsTHE1pY3Jvc29mdCBBbWVyaWNhIE9wZXJhdGlv
// SIG // bnMxJjAkBgNVBAsTHVRoYWxlcyBUU1MgRVNOOkU1QTYt
// SIG // RTI3Qy01OTJFMSUwIwYDVQQDExxNaWNyb3NvZnQgVGlt
// SIG // ZS1TdGFtcCBTZXJ2aWNlMIICIjANBgkqhkiG9w0BAQEF
// SIG // AAOCAg8AMIICCgKCAgEAn21BDGe2Szs/WqEQniS+IYU/
// SIG // UPCWQdsWlZTDQrd28IXEyORiz67dnvdwwLJpajs8NXBY
// SIG // jz4OkubCwl8+y221EKS4WvEuL9qnHDLU6JBGg0EvkCRK
// SIG // 5wLJelUpkbwMtJ5Y/gvz2mbi29zs2NAEcO1HgmS6cljz
// SIG // x/pOTHWI+jVA0zaF6m80Bwrj7Pn4CKK6Octwx6DtO+4O
// SIG // iK9kxyMdcn1RRLecw3BTzmDIOMgYuAOl3N4ZvbWesPOP
// SIG // Zwb1SsJuWAC3x98v395+C5zetW9cMwMd2QmY39d1Cm6R
// SIG // O6eg2Cax0Qf/qcBYxvfU8Bx+rl8w3mU+v6+qh+wAAcJ/
// SIG // H6WHNU5pXhWPGEblc846fVZDx1fFc78yy+0CtpLXnlyy
// SIG // /2OJb4y+oc8jphPtS1Q95RG2IaNcwrfhe21PhaY8gX0w
// SIG // uIv8B7KbW9tfGJW5ELdYtQepZZicFRcAi1+4MUOPECBl
// SIG // GnDMvJKdfs3M2PksZaWhIDZkJH3Na2j4fcubDGul+PPs
// SIG // dCuwfDqg6F3E4hAiIyXrccLbgZULHidOR0X4rH4BZtPZ
// SIG // Bu73RxKNzW1LjDARYpHOG6DfVH5tIlIavybaldCsK7/Q
// SIG // r92sg4HTcBFoi9muuSJxFkqUU2H7AkNN3qhIeQN68Ffy
// SIG // n1BXIrfg6z/vVXA6Y1kbAqJGb+LYJ+agFzTLR2vDYqkC
// SIG // AwEAAaOCATYwggEyMB0GA1UdDgQWBBSrl9NiAhRXV4K3
// SIG // AgZgyXx+b/ypFzAfBgNVHSMEGDAWgBSfpxVdAF5iXYP0
// SIG // 5dJlpxtTNRnpcjBfBgNVHR8EWDBWMFSgUqBQhk5odHRw
// SIG // Oi8vd3d3Lm1pY3Jvc29mdC5jb20vcGtpb3BzL2NybC9N
// SIG // aWNyb3NvZnQlMjBUaW1lLVN0YW1wJTIwUENBJTIwMjAx
// SIG // MCgxKS5jcmwwbAYIKwYBBQUHAQEEYDBeMFwGCCsGAQUF
// SIG // BzAChlBodHRwOi8vd3d3Lm1pY3Jvc29mdC5jb20vcGtp
// SIG // b3BzL2NlcnRzL01pY3Jvc29mdCUyMFRpbWUtU3RhbXAl
// SIG // MjBQQ0ElMjAyMDEwKDEpLmNydDAMBgNVHRMBAf8EAjAA
// SIG // MBMGA1UdJQQMMAoGCCsGAQUFBwMIMA0GCSqGSIb3DQEB
// SIG // CwUAA4ICAQDgszbeHyfozr0LqtCLZ9+yGa2DQRrMAIvi
// SIG // ABTN2Biv8BkJRJ3II5jQbmnPeVtnwC+sbRVXzH5Hqkiz
// SIG // C6qInVbFPQZuAxAY2ljTk/bl/7XGIiUnxUDNKw265fFe
// SIG // JzPPEWReehv6iVvYOXSKjkqIpsylLf0O1h+lQcltLGq+
// SIG // cBr4KLyt6hWncCkoc0WHBKk5Bx9s4qeXu943szx8dvrW
// SIG // mKiRucSc3QxK2dZzIsUY2h7NyqXLJmWLsbCEXwWDibwB
// SIG // Rspkxkb+T7sLDabPRHIdQGrKvOB/2P/MTdxkI+D9zIg5
// SIG // /Is1AQwrlyHx2JN/W6p2gJhW1Igm8vllqbs3ZOKAys/7
// SIG // FsK57KEO9rhBlRDe/pMsPfh0qOYvJfGYNWJo/bVIA6VV
// SIG // BowHbqC8h0O16pJypkvZCUgSpOKJBA4NCHei3ii0MB9X
// SIG // uGlXk8lGMHAV98IO6SyUFr0e52tkhq7Zf9t2BkE7nZlj
// SIG // q8ocfZZ1OygRlf2jb89LU6XLLnLCvnGRSgxJFgf6FBVa
// SIG // 7crp+jQ+aWGTY9AoEbqeYK1QAqvwIG/hDhiwg/sxLRja
// SIG // KeLXyr7GG+uNuezSfV6zB4KQom++lk9+ET5ggQcsS1JB
// SIG // 8R6ucwsmDbtCBVwLdQFYnMNeDPnMy2CFTOzTslaRXXAd
// SIG // QfTIiYpO6XkootF00XZef1fyrHE2ggRc9zCCB3EwggVZ
// SIG // oAMCAQICEzMAAAAVxedrngKbSZkAAAAAABUwDQYJKoZI
// SIG // hvcNAQELBQAwgYgxCzAJBgNVBAYTAlVTMRMwEQYDVQQI
// SIG // EwpXYXNoaW5ndG9uMRAwDgYDVQQHEwdSZWRtb25kMR4w
// SIG // HAYDVQQKExVNaWNyb3NvZnQgQ29ycG9yYXRpb24xMjAw
// SIG // BgNVBAMTKU1pY3Jvc29mdCBSb290IENlcnRpZmljYXRl
// SIG // IEF1dGhvcml0eSAyMDEwMB4XDTIxMDkzMDE4MjIyNVoX
// SIG // DTMwMDkzMDE4MzIyNVowfDELMAkGA1UEBhMCVVMxEzAR
// SIG // BgNVBAgTCldhc2hpbmd0b24xEDAOBgNVBAcTB1JlZG1v
// SIG // bmQxHjAcBgNVBAoTFU1pY3Jvc29mdCBDb3Jwb3JhdGlv
// SIG // bjEmMCQGA1UEAxMdTWljcm9zb2Z0IFRpbWUtU3RhbXAg
// SIG // UENBIDIwMTAwggIiMA0GCSqGSIb3DQEBAQUAA4ICDwAw
// SIG // ggIKAoICAQDk4aZM57RyIQt5osvXJHm9DtWC0/3unAcH
// SIG // 0qlsTnXIyjVX9gF/bErg4r25PhdgM/9cT8dm95VTcVri
// SIG // fkpa/rg2Z4VGIwy1jRPPdzLAEBjoYH1qUoNEt6aORmsH
// SIG // FPPFdvWGUNzBRMhxXFExN6AKOG6N7dcP2CZTfDlhAnrE
// SIG // qv1yaa8dq6z2Nr41JmTamDu6GnszrYBbfowQHJ1S/rbo
// SIG // YiXcag/PXfT+jlPP1uyFVk3v3byNpOORj7I5LFGc6XBp
// SIG // Dco2LXCOMcg1KL3jtIckw+DJj361VI/c+gVVmG1oO5pG
// SIG // ve2krnopN6zL64NF50ZuyjLVwIYwXE8s4mKyzbnijYjk
// SIG // lqwBSru+cakXW2dg3viSkR4dPf0gz3N9QZpGdc3EXzTd
// SIG // EonW/aUgfX782Z5F37ZyL9t9X4C626p+Nuw2TPYrbqgS
// SIG // Uei/BQOj0XOmTTd0lBw0gg/wEPK3Rxjtp+iZfD9M269e
// SIG // wvPV2HM9Q07BMzlMjgK8QmguEOqEUUbi0b1qGFphAXPK
// SIG // Z6Je1yh2AuIzGHLXpyDwwvoSCtdjbwzJNmSLW6CmgyFd
// SIG // XzB0kZSU2LlQ+QuJYfM2BjUYhEfb3BvR/bLUHMVr9lxS
// SIG // UV0S2yW6r1AFemzFER1y7435UsSFF5PAPBXbGjfHCBUY
// SIG // P3irRbb1Hode2o+eFnJpxq57t7c+auIurQIDAQABo4IB
// SIG // 3TCCAdkwEgYJKwYBBAGCNxUBBAUCAwEAATAjBgkrBgEE
// SIG // AYI3FQIEFgQUKqdS/mTEmr6CkTxGNSnPEP8vBO4wHQYD
// SIG // VR0OBBYEFJ+nFV0AXmJdg/Tl0mWnG1M1GelyMFwGA1Ud
// SIG // IARVMFMwUQYMKwYBBAGCN0yDfQEBMEEwPwYIKwYBBQUH
// SIG // AgEWM2h0dHA6Ly93d3cubWljcm9zb2Z0LmNvbS9wa2lv
// SIG // cHMvRG9jcy9SZXBvc2l0b3J5Lmh0bTATBgNVHSUEDDAK
// SIG // BggrBgEFBQcDCDAZBgkrBgEEAYI3FAIEDB4KAFMAdQBi
// SIG // AEMAQTALBgNVHQ8EBAMCAYYwDwYDVR0TAQH/BAUwAwEB
// SIG // /zAfBgNVHSMEGDAWgBTV9lbLj+iiXGJo0T2UkFvXzpoY
// SIG // xDBWBgNVHR8ETzBNMEugSaBHhkVodHRwOi8vY3JsLm1p
// SIG // Y3Jvc29mdC5jb20vcGtpL2NybC9wcm9kdWN0cy9NaWNS
// SIG // b29DZXJBdXRfMjAxMC0wNi0yMy5jcmwwWgYIKwYBBQUH
// SIG // AQEETjBMMEoGCCsGAQUFBzAChj5odHRwOi8vd3d3Lm1p
// SIG // Y3Jvc29mdC5jb20vcGtpL2NlcnRzL01pY1Jvb0NlckF1
// SIG // dF8yMDEwLTA2LTIzLmNydDANBgkqhkiG9w0BAQsFAAOC
// SIG // AgEAnVV9/Cqt4SwfZwExJFvhnnJL/Klv6lwUtj5OR2R4
// SIG // sQaTlz0xM7U518JxNj/aZGx80HU5bbsPMeTCj/ts0aGU
// SIG // GCLu6WZnOlNN3Zi6th542DYunKmCVgADsAW+iehp4LoJ
// SIG // 7nvfam++Kctu2D9IdQHZGN5tggz1bSNU5HhTdSRXud2f
// SIG // 8449xvNo32X2pFaq95W2KFUn0CS9QKC/GbYSEhFdPSfg
// SIG // QJY4rPf5KYnDvBewVIVCs/wMnosZiefwC2qBwoEZQhlS
// SIG // dYo2wh3DYXMuLGt7bj8sCXgU6ZGyqVvfSaN0DLzskYDS
// SIG // PeZKPmY7T7uG+jIa2Zb0j/aRAfbOxnT99kxybxCrdTDF
// SIG // NLB62FD+CljdQDzHVG2dY3RILLFORy3BFARxv2T5JL5z
// SIG // bcqOCb2zAVdJVGTZc9d/HltEAY5aGZFrDZ+kKNxnGSgk
// SIG // ujhLmm77IVRrakURR6nxt67I6IleT53S0Ex2tVdUCbFp
// SIG // AUR+fKFhbHP+CrvsQWY9af3LwUFJfn6Tvsv4O+S3Fb+0
// SIG // zj6lMVGEvL8CwYKiexcdFYmNcP7ntdAoGokLjzbaukz5
// SIG // m/8K6TT4JDVnK+ANuOaMmdbhIurwJ0I9JZTmdHRbatGe
// SIG // Pu1+oDEzfbzL6Xu/OHBE0ZDxyKs6ijoIYn/ZcGNTTY3u
// SIG // gm2lBRDBcQZqELQdVTNYs6FwZvKhggLOMIICNwIBATCB
// SIG // +KGB0KSBzTCByjELMAkGA1UEBhMCVVMxEzARBgNVBAgT
// SIG // Cldhc2hpbmd0b24xEDAOBgNVBAcTB1JlZG1vbmQxHjAc
// SIG // BgNVBAoTFU1pY3Jvc29mdCBDb3Jwb3JhdGlvbjElMCMG
// SIG // A1UECxMcTWljcm9zb2Z0IEFtZXJpY2EgT3BlcmF0aW9u
// SIG // czEmMCQGA1UECxMdVGhhbGVzIFRTUyBFU046RTVBNi1F
// SIG // MjdDLTU5MkUxJTAjBgNVBAMTHE1pY3Jvc29mdCBUaW1l
// SIG // LVN0YW1wIFNlcnZpY2WiIwoBATAHBgUrDgMCGgMVANGP
// SIG // gsi3sxoFR1hTZiiNS7hP4WOroIGDMIGApH4wfDELMAkG
// SIG // A1UEBhMCVVMxEzARBgNVBAgTCldhc2hpbmd0b24xEDAO
// SIG // BgNVBAcTB1JlZG1vbmQxHjAcBgNVBAoTFU1pY3Jvc29m
// SIG // dCBDb3Jwb3JhdGlvbjEmMCQGA1UEAxMdTWljcm9zb2Z0
// SIG // IFRpbWUtU3RhbXAgUENBIDIwMTAwDQYJKoZIhvcNAQEF
// SIG // BQACBQDm3uyFMCIYDzIwMjIwOTI4MjM1MzQxWhgPMjAy
// SIG // MjA5MjkyMzUzNDFaMHcwPQYKKwYBBAGEWQoEATEvMC0w
// SIG // CgIFAObe7IUCAQAwCgIBAAICErYCAf8wBwIBAAICEcsw
// SIG // CgIFAObgPgUCAQAwNgYKKwYBBAGEWQoEAjEoMCYwDAYK
// SIG // KwYBBAGEWQoDAqAKMAgCAQACAwehIKEKMAgCAQACAwGG
// SIG // oDANBgkqhkiG9w0BAQUFAAOBgQARcYCCilviy+V4is/x
// SIG // nTYkWUN7231pv9DAkuBtgdaY+4pXRjgyQvNHAfHaMyWi
// SIG // 73FHXCkIURT8I58DuwJgFbKgdjg1MIPpvS7nJjslbC32
// SIG // EZM9iF7EcpGPwxYmrL+kxwcKmaCqwS1eotCKrHpTkxma
// SIG // JZJDZMd1CBsH7WV9GgarXDGCBA0wggQJAgEBMIGTMHwx
// SIG // CzAJBgNVBAYTAlVTMRMwEQYDVQQIEwpXYXNoaW5ndG9u
// SIG // MRAwDgYDVQQHEwdSZWRtb25kMR4wHAYDVQQKExVNaWNy
// SIG // b3NvZnQgQ29ycG9yYXRpb24xJjAkBgNVBAMTHU1pY3Jv
// SIG // c29mdCBUaW1lLVN0YW1wIFBDQSAyMDEwAhMzAAABlbf8
// SIG // DdbjNzElAAEAAAGVMA0GCWCGSAFlAwQCAQUAoIIBSjAa
// SIG // BgkqhkiG9w0BCQMxDQYLKoZIhvcNAQkQAQQwLwYJKoZI
// SIG // hvcNAQkEMSIEIBOKGrN7R1U+0ZVloKYoyuiNuNO7DF3c
// SIG // 3OxDZd5yjwXUMIH6BgsqhkiG9w0BCRACLzGB6jCB5zCB
// SIG // 5DCBvQQgXOZL4Y2QC3tpoSM/0He5HlTpgP3AtXcymU+M
// SIG // myxJAscwgZgwgYCkfjB8MQswCQYDVQQGEwJVUzETMBEG
// SIG // A1UECBMKV2FzaGluZ3RvbjEQMA4GA1UEBxMHUmVkbW9u
// SIG // ZDEeMBwGA1UEChMVTWljcm9zb2Z0IENvcnBvcmF0aW9u
// SIG // MSYwJAYDVQQDEx1NaWNyb3NvZnQgVGltZS1TdGFtcCBQ
// SIG // Q0EgMjAxMAITMwAAAZW3/A3W4zcxJQABAAABlTAiBCD4
// SIG // CAxE4JuXTIzeqq5P6nhiQRpE8M5rCqPqtKIWDXaH0zAN
// SIG // BgkqhkiG9w0BAQsFAASCAgBMxeQ70tYdRqn87uh8tm5H
// SIG // kG93oVnDUKZfv7PNDZeUJzALNCpo2ilTSSYaBxwgqeZn
// SIG // S/XNeup06lxmzPE7MERcMFL2XaYh05NWkutAwIB4Rnqm
// SIG // O5sKpo28RlsoJ9E6MSCTIczPVwOB6cLHx1mDJvyYZo1I
// SIG // SjrvMjXFO1KHbE8Dd9F5LyHBlGi/Ss0iqgDCctYGyOx8
// SIG // GYQYdlO2qRxe55vQNqGoPOt21lfpeFyBPtcAsfOic47t
// SIG // aJDPtJ7VXRnUuLDszAXk/DPaQwXR6+I35OxLoGBj4o1j
// SIG // tsCENz3ycxpB7xtJUuYXLDCP4WHtt7yZ3+COmyXg3DCc
// SIG // sQXARhh1Pv3jtcdRtr9Z3rTlD1XEsVQB/iIYDwIEn38C
// SIG // U5zBFAU6NekZKnJkKIYTW4YneSCA5C/oGEoSNP7FHhGf
// SIG // TyV/BtQoaFsYUIeFn8bzd6b9Jntl2hacaF/pLgMeosQJ
// SIG // h9MT/pjfAr1KZ3WINJd2aJZ8k0OveZXR6Lnsin2eLwXy
// SIG // CuGHIL8eqELx0cIc2Zn2sd+Q+LVVhqJYWVzXfkCd85Qx
// SIG // iTR067oAW+wV6OLMR5U0K10TKHy6h5V6q5ctoJYtpKpp
// SIG // s/0m2FPlg4uBpJ6y1yRSU+Mp/1y0qPu+a+XQQ20kUAgh
// SIG // MIbR0QI/jsHNIMITNTBia0fUCtKkLUqKSmN66UrEO17Uog==
// SIG // End signature block
