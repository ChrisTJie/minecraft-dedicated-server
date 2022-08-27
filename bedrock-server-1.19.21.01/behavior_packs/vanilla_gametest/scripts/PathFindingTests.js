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
    const aboveBedPos = bedPos.above().above(); // Check 2 blocks above the bed because under rare circumstances the villager hit box may stick out above the bed block when lying down.
    const spawnPos = new BlockLocation(5, 3, 4);

    // Do the test
    test.assertEntityPresent(villagerEntityType, bedPos, false);
    test.spawn(villagerEntitySpawnType, spawnPos);

    test.succeedWhen(() => {
      test.assertEntityPresent(villagerEntityType, aboveBedPos, false);
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
    const aboveBedPos = bedPos.above().above(); // Check 2 blocks above the bed because under rare circumstances the villager hit box may stick out above the bed block when lying down.
    const spawnPos = new BlockLocation(5, 3, 4);

    // Do the test
    test.assertEntityPresent(villagerEntityType, bedPos, false);
    test.spawn(villagerEntitySpawnType, spawnPos);
    test.succeedWhen(() => {
      test.assertEntityPresent(villagerEntityType, aboveBedPos, false);
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
// SIG // MIInxwYJKoZIhvcNAQcCoIInuDCCJ7QCAQExDzANBglg
// SIG // hkgBZQMEAgEFADB3BgorBgEEAYI3AgEEoGkwZzAyBgor
// SIG // BgEEAYI3AgEeMCQCAQEEEBDgyQbOONQRoqMAEEvTUJAC
// SIG // AQACAQACAQACAQACAQAwMTANBglghkgBZQMEAgEFAAQg
// SIG // WpUEP2qE784ALE9niXRA+WcMRQlc0avSH/UMlCJKVqmg
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
// SIG // SEXAQsmbdlsKgEhr/Xmfwb1tbWrJUnMTDXpQzTGCGZ4w
// SIG // ghmaAgEBMIGVMH4xCzAJBgNVBAYTAlVTMRMwEQYDVQQI
// SIG // EwpXYXNoaW5ndG9uMRAwDgYDVQQHEwdSZWRtb25kMR4w
// SIG // HAYDVQQKExVNaWNyb3NvZnQgQ29ycG9yYXRpb24xKDAm
// SIG // BgNVBAMTH01pY3Jvc29mdCBDb2RlIFNpZ25pbmcgUENB
// SIG // IDIwMTECEzMAAALMjrWWpr3RyU4AAAAAAswwDQYJYIZI
// SIG // AWUDBAIBBQCggcAwGQYJKoZIhvcNAQkDMQwGCisGAQQB
// SIG // gjcCAQQwHAYKKwYBBAGCNwIBCzEOMAwGCisGAQQBgjcC
// SIG // ARUwLwYJKoZIhvcNAQkEMSIEIBy6ley6Wt0kjgU/gleJ
// SIG // sACdM3g36fhseAAIsgpeiticMFQGCisGAQQBgjcCAQwx
// SIG // RjBEoCSAIgBNAGkAbgBlAGMAcgBhAGYAdAAgAEIAZQBk
// SIG // AHIAbwBjAGuhHIAaaHR0cHM6Ly93d3cubWluZWNyYWZ0
// SIG // Lm5ldC8wDQYJKoZIhvcNAQEBBQAEggEAVxmI/EP5DIvG
// SIG // LlsvYv9M8IZMB+tc2hj7b+eg9KWe0wmpETsvh8wK6lRg
// SIG // 8VU8Qed4Oa4YwP4Vf0/gmVzRT60EiFX/BEkFySqqRpDY
// SIG // IkaaqJIkC6wfx6EInuaqljZbRcv+QnXdpk1sB6gs5uC/
// SIG // NPX7kzPaQ0F6PicIV4OKr3F0lq49Gt5mo4LLkhK/kYM+
// SIG // 0bcRAkQVNcMakGmh1jfzVL4f/5HLBYHUBM9+WYTejIhs
// SIG // O4G2JlhxkENVlwb4AG/4NJ3HpbH5akUC6UD1eOgpZZKl
// SIG // MUlWcjUXdW9Sc6dRoATtPd/sVrOg1yaMlGF4kv5qGlTW
// SIG // j1N8ZqEW/SWFWlqTorXbZ6GCFxYwghcSBgorBgEEAYI3
// SIG // AwMBMYIXAjCCFv4GCSqGSIb3DQEHAqCCFu8wghbrAgED
// SIG // MQ8wDQYJYIZIAWUDBAIBBQAwggFZBgsqhkiG9w0BCRAB
// SIG // BKCCAUgEggFEMIIBQAIBAQYKKwYBBAGEWQoDATAxMA0G
// SIG // CWCGSAFlAwQCAQUABCCFSnSwkwjuCMu9o7H7Vn7bjZ0s
// SIG // BY4hraxU4i2N8HIUxQIGYt52ZF3rGBMyMDIyMDgxODAw
// SIG // MTkzMC4wMzhaMASAAgH0oIHYpIHVMIHSMQswCQYDVQQG
// SIG // EwJVUzETMBEGA1UECBMKV2FzaGluZ3RvbjEQMA4GA1UE
// SIG // BxMHUmVkbW9uZDEeMBwGA1UEChMVTWljcm9zb2Z0IENv
// SIG // cnBvcmF0aW9uMS0wKwYDVQQLEyRNaWNyb3NvZnQgSXJl
// SIG // bGFuZCBPcGVyYXRpb25zIExpbWl0ZWQxJjAkBgNVBAsT
// SIG // HVRoYWxlcyBUU1MgRVNOOkEyNDAtNEI4Mi0xMzBFMSUw
// SIG // IwYDVQQDExxNaWNyb3NvZnQgVGltZS1TdGFtcCBTZXJ2
// SIG // aWNloIIRZTCCBxQwggT8oAMCAQICEzMAAAGNelUueHSZ
// SIG // KrcAAQAAAY0wDQYJKoZIhvcNAQELBQAwfDELMAkGA1UE
// SIG // BhMCVVMxEzARBgNVBAgTCldhc2hpbmd0b24xEDAOBgNV
// SIG // BAcTB1JlZG1vbmQxHjAcBgNVBAoTFU1pY3Jvc29mdCBD
// SIG // b3Jwb3JhdGlvbjEmMCQGA1UEAxMdTWljcm9zb2Z0IFRp
// SIG // bWUtU3RhbXAgUENBIDIwMTAwHhcNMjExMDI4MTkyNzQ1
// SIG // WhcNMjMwMTI2MTkyNzQ1WjCB0jELMAkGA1UEBhMCVVMx
// SIG // EzARBgNVBAgTCldhc2hpbmd0b24xEDAOBgNVBAcTB1Jl
// SIG // ZG1vbmQxHjAcBgNVBAoTFU1pY3Jvc29mdCBDb3Jwb3Jh
// SIG // dGlvbjEtMCsGA1UECxMkTWljcm9zb2Z0IElyZWxhbmQg
// SIG // T3BlcmF0aW9ucyBMaW1pdGVkMSYwJAYDVQQLEx1UaGFs
// SIG // ZXMgVFNTIEVTTjpBMjQwLTRCODItMTMwRTElMCMGA1UE
// SIG // AxMcTWljcm9zb2Z0IFRpbWUtU3RhbXAgU2VydmljZTCC
// SIG // AiIwDQYJKoZIhvcNAQEBBQADggIPADCCAgoCggIBANo0
// SIG // SC2YPjulO3S3LsATzAftLSVM9MBy6ieX+yiV0LE81k6A
// SIG // A1DGFeMVWZ6fZj01qI1Cf5dzuF6noCwzXbhQDm3Iray8
// SIG // mORw7MQH1Btf9mIpXEpEj+gnDKln7EsFCxl+c5bFShye
// SIG // 7b8INusuni5JVHRTKYqtveE+LiUHV3eTu5hctL1ZGhjx
// SIG // sTVi22cSjc6irRZ1kO4zLWdOV72n5CFmazUxb/BhqQJR
// SIG // 7UbGdQPCg6OiA0hlTWWV20LPnzsDDhqfwc6HfH9WCPBm
// SIG // 9qDf5sdnHL3Rq/ZWueUGXlbDOy302hD0MW4AHC4Fg5SD
// SIG // 3Jk83AZLBMyzkLEqQc7Kj2liPcpFcOaH5q5BSjG6UE+R
// SIG // DJItrLiaFTOcRoHWVp7f7c9NMbmz0ihYuAeCDBVAfZnA
// SIG // DVKvXB2i7B2wyfgFLFTtKp1Y8M1z2CXkewvwfF9FJelJ
// SIG // CHaZWZp3EGUgSt8mUMvqBrLiSlxQKtwZcU+pA7oWGLzu
// SIG // 4rS6z3mNJJ7rdaypMaJvrourwnbYQn5wIspJ8kQtpZJ6
// SIG // s8/MdZg5EOUOjsfaev5XbhbqUiTLYLAjzfXyL636aTAx
// SIG // SL0aFC7BznSyY60ZYvHKOTPr2Zn9tKE8WLl8zNLW0bqx
// SIG // CcnAeWTG8M57BR8pjpIMsfDnhZ11d3Gq+ObnoyNQdYql
// SIG // A23kjcZ73M7joXKc8GnJAgMBAAGjggE2MIIBMjAdBgNV
// SIG // HQ4EFgQUeMyRboefRsKU7ko7uEk3H5YoZpMwHwYDVR0j
// SIG // BBgwFoAUn6cVXQBeYl2D9OXSZacbUzUZ6XIwXwYDVR0f
// SIG // BFgwVjBUoFKgUIZOaHR0cDovL3d3dy5taWNyb3NvZnQu
// SIG // Y29tL3BraW9wcy9jcmwvTWljcm9zb2Z0JTIwVGltZS1T
// SIG // dGFtcCUyMFBDQSUyMDIwMTAoMSkuY3JsMGwGCCsGAQUF
// SIG // BwEBBGAwXjBcBggrBgEFBQcwAoZQaHR0cDovL3d3dy5t
// SIG // aWNyb3NvZnQuY29tL3BraW9wcy9jZXJ0cy9NaWNyb3Nv
// SIG // ZnQlMjBUaW1lLVN0YW1wJTIwUENBJTIwMjAxMCgxKS5j
// SIG // cnQwDAYDVR0TAQH/BAIwADATBgNVHSUEDDAKBggrBgEF
// SIG // BQcDCDANBgkqhkiG9w0BAQsFAAOCAgEANa9zs9JRKt1b
// SIG // 6XRZYd2AcXOIZ2JAC8mDw2vRTuF4KsJAZvC7G/pSt7Wx
// SIG // hoKYukCWyt4jNwStDmwXMEWiVQsRixra+ic/YUbpkchf
// SIG // KOJ9st2Iir+KJQcTYxUoUhnPRNvSZlYwZi4Jn40aj3P9
// SIG // qw9uauKMOLgN63PXpImrn4BoXEgHXpP5fpAEm86ITrf+
// SIG // c9viJYE+Ht2rklM7dhgCnymQdNmQxliingmN6RC49bbo
// SIG // esn6ziTzyJzuGWS1t74Cmr7S/HuhSWciaAxTHsCefaBC
// SIG // /gCt3tjNiOCBRPZ+i1UvG0vVGzFDL6wJVzeWTNiPBnRw
// SIG // fU23yNe1pv/VH+KrufPDyTe7wiY/bPisWal3ObBknC4K
// SIG // oj6iG2zUxPvwBGf3k4sXPWC4E8jKmpGSOfcBqo6zjUEm
// SIG // O7tFRA5BBOopM/hUhUSis6ckm9Fk4DL1sbC725zfAApi
// SIG // Ej5wR2GaBrLDwC+36BhihS3QAU0Atj19fVo638q7IR3Y
// SIG // qkpQrKaiBgU8UWh7cjzK6Nwf9uoD3wpdzAt6wtzRquMR
// SIG // pyBw2Rkos1JhoPE5EAJaFXVOXSdb/ddII8WsWlK2hoT/
// SIG // CLbRNEVp1OV0af7BmjZg3DMG8h7kqWhbJ90NtTs4rT+A
// SIG // Zzebaax2p4AAu46HuM5i55kZwIlHPbEakNm5rDAL1KbD
// SIG // vJ5ThZojNS8wggdxMIIFWaADAgECAhMzAAAAFcXna54C
// SIG // m0mZAAAAAAAVMA0GCSqGSIb3DQEBCwUAMIGIMQswCQYD
// SIG // VQQGEwJVUzETMBEGA1UECBMKV2FzaGluZ3RvbjEQMA4G
// SIG // A1UEBxMHUmVkbW9uZDEeMBwGA1UEChMVTWljcm9zb2Z0
// SIG // IENvcnBvcmF0aW9uMTIwMAYDVQQDEylNaWNyb3NvZnQg
// SIG // Um9vdCBDZXJ0aWZpY2F0ZSBBdXRob3JpdHkgMjAxMDAe
// SIG // Fw0yMTA5MzAxODIyMjVaFw0zMDA5MzAxODMyMjVaMHwx
// SIG // CzAJBgNVBAYTAlVTMRMwEQYDVQQIEwpXYXNoaW5ndG9u
// SIG // MRAwDgYDVQQHEwdSZWRtb25kMR4wHAYDVQQKExVNaWNy
// SIG // b3NvZnQgQ29ycG9yYXRpb24xJjAkBgNVBAMTHU1pY3Jv
// SIG // c29mdCBUaW1lLVN0YW1wIFBDQSAyMDEwMIICIjANBgkq
// SIG // hkiG9w0BAQEFAAOCAg8AMIICCgKCAgEA5OGmTOe0ciEL
// SIG // eaLL1yR5vQ7VgtP97pwHB9KpbE51yMo1V/YBf2xK4OK9
// SIG // uT4XYDP/XE/HZveVU3Fa4n5KWv64NmeFRiMMtY0Tz3cy
// SIG // wBAY6GB9alKDRLemjkZrBxTzxXb1hlDcwUTIcVxRMTeg
// SIG // Cjhuje3XD9gmU3w5YQJ6xKr9cmmvHaus9ja+NSZk2pg7
// SIG // uhp7M62AW36MEBydUv626GIl3GoPz130/o5Tz9bshVZN
// SIG // 7928jaTjkY+yOSxRnOlwaQ3KNi1wjjHINSi947SHJMPg
// SIG // yY9+tVSP3PoFVZhtaDuaRr3tpK56KTesy+uDRedGbsoy
// SIG // 1cCGMFxPLOJiss254o2I5JasAUq7vnGpF1tnYN74kpEe
// SIG // HT39IM9zfUGaRnXNxF803RKJ1v2lIH1+/NmeRd+2ci/b
// SIG // fV+AutuqfjbsNkz2K26oElHovwUDo9Fzpk03dJQcNIIP
// SIG // 8BDyt0cY7afomXw/TNuvXsLz1dhzPUNOwTM5TI4CvEJo
// SIG // LhDqhFFG4tG9ahhaYQFzymeiXtcodgLiMxhy16cg8ML6
// SIG // EgrXY28MyTZki1ugpoMhXV8wdJGUlNi5UPkLiWHzNgY1
// SIG // GIRH29wb0f2y1BzFa/ZcUlFdEtsluq9QBXpsxREdcu+N
// SIG // +VLEhReTwDwV2xo3xwgVGD94q0W29R6HXtqPnhZyacau
// SIG // e7e3PmriLq0CAwEAAaOCAd0wggHZMBIGCSsGAQQBgjcV
// SIG // AQQFAgMBAAEwIwYJKwYBBAGCNxUCBBYEFCqnUv5kxJq+
// SIG // gpE8RjUpzxD/LwTuMB0GA1UdDgQWBBSfpxVdAF5iXYP0
// SIG // 5dJlpxtTNRnpcjBcBgNVHSAEVTBTMFEGDCsGAQQBgjdM
// SIG // g30BATBBMD8GCCsGAQUFBwIBFjNodHRwOi8vd3d3Lm1p
// SIG // Y3Jvc29mdC5jb20vcGtpb3BzL0RvY3MvUmVwb3NpdG9y
// SIG // eS5odG0wEwYDVR0lBAwwCgYIKwYBBQUHAwgwGQYJKwYB
// SIG // BAGCNxQCBAweCgBTAHUAYgBDAEEwCwYDVR0PBAQDAgGG
// SIG // MA8GA1UdEwEB/wQFMAMBAf8wHwYDVR0jBBgwFoAU1fZW
// SIG // y4/oolxiaNE9lJBb186aGMQwVgYDVR0fBE8wTTBLoEmg
// SIG // R4ZFaHR0cDovL2NybC5taWNyb3NvZnQuY29tL3BraS9j
// SIG // cmwvcHJvZHVjdHMvTWljUm9vQ2VyQXV0XzIwMTAtMDYt
// SIG // MjMuY3JsMFoGCCsGAQUFBwEBBE4wTDBKBggrBgEFBQcw
// SIG // AoY+aHR0cDovL3d3dy5taWNyb3NvZnQuY29tL3BraS9j
// SIG // ZXJ0cy9NaWNSb29DZXJBdXRfMjAxMC0wNi0yMy5jcnQw
// SIG // DQYJKoZIhvcNAQELBQADggIBAJ1VffwqreEsH2cBMSRb
// SIG // 4Z5yS/ypb+pcFLY+TkdkeLEGk5c9MTO1OdfCcTY/2mRs
// SIG // fNB1OW27DzHkwo/7bNGhlBgi7ulmZzpTTd2YurYeeNg2
// SIG // LpypglYAA7AFvonoaeC6Ce5732pvvinLbtg/SHUB2Rje
// SIG // bYIM9W0jVOR4U3UkV7ndn/OOPcbzaN9l9qRWqveVtihV
// SIG // J9AkvUCgvxm2EhIRXT0n4ECWOKz3+SmJw7wXsFSFQrP8
// SIG // DJ6LGYnn8AtqgcKBGUIZUnWKNsIdw2FzLixre24/LAl4
// SIG // FOmRsqlb30mjdAy87JGA0j3mSj5mO0+7hvoyGtmW9I/2
// SIG // kQH2zsZ0/fZMcm8Qq3UwxTSwethQ/gpY3UA8x1RtnWN0
// SIG // SCyxTkctwRQEcb9k+SS+c23Kjgm9swFXSVRk2XPXfx5b
// SIG // RAGOWhmRaw2fpCjcZxkoJLo4S5pu+yFUa2pFEUep8beu
// SIG // yOiJXk+d0tBMdrVXVAmxaQFEfnyhYWxz/gq77EFmPWn9
// SIG // y8FBSX5+k77L+DvktxW/tM4+pTFRhLy/AsGConsXHRWJ
// SIG // jXD+57XQKBqJC4822rpM+Zv/Cuk0+CQ1ZyvgDbjmjJnW
// SIG // 4SLq8CdCPSWU5nR0W2rRnj7tfqAxM328y+l7vzhwRNGQ
// SIG // 8cirOoo6CGJ/2XBjU02N7oJtpQUQwXEGahC0HVUzWLOh
// SIG // cGbyoYIC1DCCAj0CAQEwggEAoYHYpIHVMIHSMQswCQYD
// SIG // VQQGEwJVUzETMBEGA1UECBMKV2FzaGluZ3RvbjEQMA4G
// SIG // A1UEBxMHUmVkbW9uZDEeMBwGA1UEChMVTWljcm9zb2Z0
// SIG // IENvcnBvcmF0aW9uMS0wKwYDVQQLEyRNaWNyb3NvZnQg
// SIG // SXJlbGFuZCBPcGVyYXRpb25zIExpbWl0ZWQxJjAkBgNV
// SIG // BAsTHVRoYWxlcyBUU1MgRVNOOkEyNDAtNEI4Mi0xMzBF
// SIG // MSUwIwYDVQQDExxNaWNyb3NvZnQgVGltZS1TdGFtcCBT
// SIG // ZXJ2aWNloiMKAQEwBwYFKw4DAhoDFQCAc5WTPU0TQ+D4
// SIG // LaS1kGZEj2FXCaCBgzCBgKR+MHwxCzAJBgNVBAYTAlVT
// SIG // MRMwEQYDVQQIEwpXYXNoaW5ndG9uMRAwDgYDVQQHEwdS
// SIG // ZWRtb25kMR4wHAYDVQQKExVNaWNyb3NvZnQgQ29ycG9y
// SIG // YXRpb24xJjAkBgNVBAMTHU1pY3Jvc29mdCBUaW1lLVN0
// SIG // YW1wIFBDQSAyMDEwMA0GCSqGSIb3DQEBBQUAAgUA5qfu
// SIG // 6TAiGA8yMDIyMDgxODA2NDkxM1oYDzIwMjIwODE5MDY0
// SIG // OTEzWjB0MDoGCisGAQQBhFkKBAExLDAqMAoCBQDmp+7p
// SIG // AgEAMAcCAQACAiJXMAcCAQACAhFWMAoCBQDmqUBpAgEA
// SIG // MDYGCisGAQQBhFkKBAIxKDAmMAwGCisGAQQBhFkKAwKg
// SIG // CjAIAgEAAgMHoSChCjAIAgEAAgMBhqAwDQYJKoZIhvcN
// SIG // AQEFBQADgYEAHIvFdvGwFb9dwX+hPYOWMSRUT6vkLg5Q
// SIG // QINihEo7rEXQsh2s8LZxheDiNFrhY87MFaLep3vB4MqL
// SIG // k0pvneEivKyh89gmx3s7oMvUJd6vDelZWCcol1JNPg85
// SIG // ON4A2Nk4xdvVhIbSCu6eMg72cx7eiVejVb83FsAJlR/j
// SIG // Kt+BYBwxggQNMIIECQIBATCBkzB8MQswCQYDVQQGEwJV
// SIG // UzETMBEGA1UECBMKV2FzaGluZ3RvbjEQMA4GA1UEBxMH
// SIG // UmVkbW9uZDEeMBwGA1UEChMVTWljcm9zb2Z0IENvcnBv
// SIG // cmF0aW9uMSYwJAYDVQQDEx1NaWNyb3NvZnQgVGltZS1T
// SIG // dGFtcCBQQ0EgMjAxMAITMwAAAY16VS54dJkqtwABAAAB
// SIG // jTANBglghkgBZQMEAgEFAKCCAUowGgYJKoZIhvcNAQkD
// SIG // MQ0GCyqGSIb3DQEJEAEEMC8GCSqGSIb3DQEJBDEiBCAe
// SIG // ymXoR4t6mHDoNW/zVJwK/zqiZccAnKCUqL1ry9TfmTCB
// SIG // +gYLKoZIhvcNAQkQAi8xgeowgecwgeQwgb0EIJ6WETP6
// SIG // HV5AwJ839rnS+evVvHHxk4MFbnp0PLbSGM1/MIGYMIGA
// SIG // pH4wfDELMAkGA1UEBhMCVVMxEzARBgNVBAgTCldhc2hp
// SIG // bmd0b24xEDAOBgNVBAcTB1JlZG1vbmQxHjAcBgNVBAoT
// SIG // FU1pY3Jvc29mdCBDb3Jwb3JhdGlvbjEmMCQGA1UEAxMd
// SIG // TWljcm9zb2Z0IFRpbWUtU3RhbXAgUENBIDIwMTACEzMA
// SIG // AAGNelUueHSZKrcAAQAAAY0wIgQg9V2NJ7CV5H5sbQh7
// SIG // P6NaS/6EiDHcGbcCD2SiLEwDZeAwDQYJKoZIhvcNAQEL
// SIG // BQAEggIApUh5Az6ASZ523Htry9VeeFAVUKYLGi9ShfY6
// SIG // k+S2RRWDUIYakhjqgDBAx+G/3z+1E8jfMsj4+K0r2+Rq
// SIG // lYus+9iMyWwav9F++2Vowu/48iZ05TsS2o1bKnWE8fTa
// SIG // srLsipxaWH8F181s5Z+yAqnUBtep3WKl1tctcyYCRs9o
// SIG // EJfXvf5PPABRBuaMfD7p6d1KDEWyuO+sxk2SJyJlqwoz
// SIG // xvlRTxuS+sctNSfxPFgBVrF8TtTX9UAPZoJVH1ExyrM+
// SIG // ysFdMIhPU8sr3IV7tgAaGV6yJkCWgXBOC8Qrn+7zUZqJ
// SIG // gtGcGq5UWQLvBcyfR1z/P7zIPIORnsMVSVXYjJ1D1ZRx
// SIG // ZONXGkBbChRYwdWIv99Qg0p8EwrSxuX4/NHfiZo2930s
// SIG // NocJVpKLrJCm7irJi46SsTUjSIq03rU2UDOriTxzxSbb
// SIG // Y7DLPEdBHQEmvm597kpqMe/PKBxypBP5OqN5sehnZlyG
// SIG // s+MAjtpxx2xuOLJlbSNU2me/eiYc9gdsXPAY8OCXK2ee
// SIG // pV1O6EN63SxqUgi4TnMJH19aSfpmoEjiS5/fxyRHxlHL
// SIG // X4HHhMScyXv9ZZmiViF42mVUY1yzU75KZ62Z2+3kkMdZ
// SIG // 6Z5ZqcZaZnNChZhubsz0cDrM528FpWA50OCErtpWyZ9a
// SIG // FHtvoFI8iOOGPagboY/i5JldFTdZR9g=
// SIG // End signature block
