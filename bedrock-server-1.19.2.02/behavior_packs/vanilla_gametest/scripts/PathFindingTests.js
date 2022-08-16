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
// SIG // MIInygYJKoZIhvcNAQcCoIInuzCCJ7cCAQExDzANBglg
// SIG // hkgBZQMEAgEFADB3BgorBgEEAYI3AgEEoGkwZzAyBgor
// SIG // BgEEAYI3AgEeMCQCAQEEEBDgyQbOONQRoqMAEEvTUJAC
// SIG // AQACAQACAQACAQACAQAwMTANBglghkgBZQMEAgEFAAQg
// SIG // nB83QpFxda7j16mF06uHlZDfU5jIC8hiQSa+bhuQL+mg
// SIG // gg2FMIIGAzCCA+ugAwIBAgITMwAAAlPjg96W3sVuzAAA
// SIG // AAACUzANBgkqhkiG9w0BAQsFADB+MQswCQYDVQQGEwJV
// SIG // UzETMBEGA1UECBMKV2FzaGluZ3RvbjEQMA4GA1UEBxMH
// SIG // UmVkbW9uZDEeMBwGA1UEChMVTWljcm9zb2Z0IENvcnBv
// SIG // cmF0aW9uMSgwJgYDVQQDEx9NaWNyb3NvZnQgQ29kZSBT
// SIG // aWduaW5nIFBDQSAyMDExMB4XDTIxMDkwMjE4MzMwMFoX
// SIG // DTIyMDkwMTE4MzMwMFowdDELMAkGA1UEBhMCVVMxEzAR
// SIG // BgNVBAgTCldhc2hpbmd0b24xEDAOBgNVBAcTB1JlZG1v
// SIG // bmQxHjAcBgNVBAoTFU1pY3Jvc29mdCBDb3Jwb3JhdGlv
// SIG // bjEeMBwGA1UEAxMVTWljcm9zb2Z0IENvcnBvcmF0aW9u
// SIG // MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA
// SIG // y4cR8KtzoR/uCfkl+Kkv1UBvB8m3HB+7ZxvgVKq17m3x
// SIG // rgxWD2dvbgrh30JTtZcoC4DKSeBnoev+qaEOVZAyn1bL
// SIG // J+mgNTwsyIfIjjzEPTI7t7CxfUp/j87monuATa6dDLmS
// SIG // wxF4FWMdljY5s6nMQu3WPUgt85zoealMtr55lsoAu2/Z
// SIG // I9HdyaxrY3OaudFn1d1i1wEB5HkUTrCRQWX1xRqEr0ZY
// SIG // xRVAI1P83YT/dj/tSYkUUYpFcv7KiITA2Pu7VXc5RNn8
// SIG // Jyjr/S0oYCnshHr4DJdAdRauxNmHgWSheipYZmIvQhNd
// SIG // +dHJ01KFOGKUEp2aNGAJ2np0RAy3xRik3QIDAQABo4IB
// SIG // gjCCAX4wHwYDVR0lBBgwFgYKKwYBBAGCN0wIAQYIKwYB
// SIG // BQUHAwMwHQYDVR0OBBYEFJWaS1iHHF6MXrLAPw0W3tuo
// SIG // JYRDMFQGA1UdEQRNMEukSTBHMS0wKwYDVQQLEyRNaWNy
// SIG // b3NvZnQgSXJlbGFuZCBPcGVyYXRpb25zIExpbWl0ZWQx
// SIG // FjAUBgNVBAUTDTIzMDAxMis0Njc1OTgwHwYDVR0jBBgw
// SIG // FoAUSG5k5VAF04KqFzc3IrVtqMp1ApUwVAYDVR0fBE0w
// SIG // SzBJoEegRYZDaHR0cDovL3d3dy5taWNyb3NvZnQuY29t
// SIG // L3BraW9wcy9jcmwvTWljQ29kU2lnUENBMjAxMV8yMDEx
// SIG // LTA3LTA4LmNybDBhBggrBgEFBQcBAQRVMFMwUQYIKwYB
// SIG // BQUHMAKGRWh0dHA6Ly93d3cubWljcm9zb2Z0LmNvbS9w
// SIG // a2lvcHMvY2VydHMvTWljQ29kU2lnUENBMjAxMV8yMDEx
// SIG // LTA3LTA4LmNydDAMBgNVHRMBAf8EAjAAMA0GCSqGSIb3
// SIG // DQEBCwUAA4ICAQClWPsinCVVcX/VtrzZC+bn4zqanL1T
// SIG // jjnVco8tXZrDuDvJIVoaq3nHVWadPWnTmfJHDLUNFPqC
// SIG // sePOCYNdXHOApNBcjgZ6fmCBWzsWAqs2qjHGkQIMuPJ9
// SIG // bW8/xBWIhcyZjIhp5YFhQkrTjT70DgQ9svxI96gUZxsv
// SIG // RGUtRA5UTf/JeUbNx19pWYXfVrrpEW1JPN1PfUzycqNd
// SIG // nFNDG959Ryb/yWacEsqm9ztKOBxMVSUpMDdZuNn0lSFb
// SIG // V1VUmmGYlab99hqA/3cgEv4MqZX0ehSN0ZwjqJs5cnEq
// SIG // qM9MwQjxYgjIVYUOqp/idBoYEQSbxios8PuZU35wRaKi
// SIG // mSQ0Ts/rhg5fbcOib51agGShq1r/wrGGnoGj3jxawFUs
// SIG // QMlMDhU5AKrTQvLgHnvq79lecS8PBX6SieciojCpwiqy
// SIG // GhUA6+QGe39noxhg3/vE8zoitQIAbzlt4kxBGv2rfGeP
// SIG // rNQppxAJAItHC4we9giXnVNSwLMHTgljNjAyGVaPY9E+
// SIG // +DpCS04z3d1jRMsNKwV08oZW2ELGLexJU9pdk05ReRJq
// SIG // VYsRrY+AoTY1qCq/ckwKrWnXdmJuRTQe/dhs8DcGut9Q
// SIG // TwoASZnEaRSl7dFREKu1F1TWAYgUXfseMr46quWhe1wu
// SIG // Z1woI2wpOyF8JjqYTbjQzYkavNxI453O5sayRjCCB3ow
// SIG // ggVioAMCAQICCmEOkNIAAAAAAAMwDQYJKoZIhvcNAQEL
// SIG // BQAwgYgxCzAJBgNVBAYTAlVTMRMwEQYDVQQIEwpXYXNo
// SIG // aW5ndG9uMRAwDgYDVQQHEwdSZWRtb25kMR4wHAYDVQQK
// SIG // ExVNaWNyb3NvZnQgQ29ycG9yYXRpb24xMjAwBgNVBAMT
// SIG // KU1pY3Jvc29mdCBSb290IENlcnRpZmljYXRlIEF1dGhv
// SIG // cml0eSAyMDExMB4XDTExMDcwODIwNTkwOVoXDTI2MDcw
// SIG // ODIxMDkwOVowfjELMAkGA1UEBhMCVVMxEzARBgNVBAgT
// SIG // Cldhc2hpbmd0b24xEDAOBgNVBAcTB1JlZG1vbmQxHjAc
// SIG // BgNVBAoTFU1pY3Jvc29mdCBDb3Jwb3JhdGlvbjEoMCYG
// SIG // A1UEAxMfTWljcm9zb2Z0IENvZGUgU2lnbmluZyBQQ0Eg
// SIG // MjAxMTCCAiIwDQYJKoZIhvcNAQEBBQADggIPADCCAgoC
// SIG // ggIBAKvw+nIQHC6t2G6qghBNNLrytlghn0IbKmvpWlCq
// SIG // uAY4GgRJun/DDB7dN2vGEtgL8DjCmQawyDnVARQxQtOJ
// SIG // DXlkh36UYCRsr55JnOloXtLfm1OyCizDr9mpK656Ca/X
// SIG // llnKYBoF6WZ26DJSJhIv56sIUM+zRLdd2MQuA3WraPPL
// SIG // bfM6XKEW9Ea64DhkrG5kNXimoGMPLdNAk/jj3gcN1Vx5
// SIG // pUkp5w2+oBN3vpQ97/vjK1oQH01WKKJ6cuASOrdJXtjt
// SIG // 7UORg9l7snuGG9k+sYxd6IlPhBryoS9Z5JA7La4zWMW3
// SIG // Pv4y07MDPbGyr5I4ftKdgCz1TlaRITUlwzluZH9TupwP
// SIG // rRkjhMv0ugOGjfdf8NBSv4yUh7zAIXQlXxgotswnKDgl
// SIG // mDlKNs98sZKuHCOnqWbsYR9q4ShJnV+I4iVd0yFLPlLE
// SIG // tVc/JAPw0XpbL9Uj43BdD1FGd7P4AOG8rAKCX9vAFbO9
// SIG // G9RVS+c5oQ/pI0m8GLhEfEXkwcNyeuBy5yTfv0aZxe/C
// SIG // HFfbg43sTUkwp6uO3+xbn6/83bBm4sGXgXvt1u1L50kp
// SIG // pxMopqd9Z4DmimJ4X7IvhNdXnFy/dygo8e1twyiPLI9A
// SIG // N0/B4YVEicQJTMXUpUMvdJX3bvh4IFgsE11glZo+TzOE
// SIG // 2rCIF96eTvSWsLxGoGyY0uDWiIwLAgMBAAGjggHtMIIB
// SIG // 6TAQBgkrBgEEAYI3FQEEAwIBADAdBgNVHQ4EFgQUSG5k
// SIG // 5VAF04KqFzc3IrVtqMp1ApUwGQYJKwYBBAGCNxQCBAwe
// SIG // CgBTAHUAYgBDAEEwCwYDVR0PBAQDAgGGMA8GA1UdEwEB
// SIG // /wQFMAMBAf8wHwYDVR0jBBgwFoAUci06AjGQQ7kUBU7h
// SIG // 6qfHMdEjiTQwWgYDVR0fBFMwUTBPoE2gS4ZJaHR0cDov
// SIG // L2NybC5taWNyb3NvZnQuY29tL3BraS9jcmwvcHJvZHVj
// SIG // dHMvTWljUm9vQ2VyQXV0MjAxMV8yMDExXzAzXzIyLmNy
// SIG // bDBeBggrBgEFBQcBAQRSMFAwTgYIKwYBBQUHMAKGQmh0
// SIG // dHA6Ly93d3cubWljcm9zb2Z0LmNvbS9wa2kvY2VydHMv
// SIG // TWljUm9vQ2VyQXV0MjAxMV8yMDExXzAzXzIyLmNydDCB
// SIG // nwYDVR0gBIGXMIGUMIGRBgkrBgEEAYI3LgMwgYMwPwYI
// SIG // KwYBBQUHAgEWM2h0dHA6Ly93d3cubWljcm9zb2Z0LmNv
// SIG // bS9wa2lvcHMvZG9jcy9wcmltYXJ5Y3BzLmh0bTBABggr
// SIG // BgEFBQcCAjA0HjIgHQBMAGUAZwBhAGwAXwBwAG8AbABp
// SIG // AGMAeQBfAHMAdABhAHQAZQBtAGUAbgB0AC4gHTANBgkq
// SIG // hkiG9w0BAQsFAAOCAgEAZ/KGpZjgVHkaLtPYdGcimwuW
// SIG // EeFjkplCln3SeQyQwWVfLiw++MNy0W2D/r4/6ArKO79H
// SIG // qaPzadtjvyI1pZddZYSQfYtGUFXYDJJ80hpLHPM8QotS
// SIG // 0LD9a+M+By4pm+Y9G6XUtR13lDni6WTJRD14eiPzE32m
// SIG // kHSDjfTLJgJGKsKKELukqQUMm+1o+mgulaAqPyprWElj
// SIG // HwlpblqYluSD9MCP80Yr3vw70L01724lruWvJ+3Q3fMO
// SIG // r5kol5hNDj0L8giJ1h/DMhji8MUtzluetEk5CsYKwsat
// SIG // ruWy2dsViFFFWDgycScaf7H0J/jeLDogaZiyWYlobm+n
// SIG // t3TDQAUGpgEqKD6CPxNNZgvAs0314Y9/HG8VfUWnduVA
// SIG // KmWjw11SYobDHWM2l4bf2vP48hahmifhzaWX0O5dY0Hj
// SIG // Wwechz4GdwbRBrF1HxS+YWG18NzGGwS+30HHDiju3mUv
// SIG // 7Jf2oVyW2ADWoUa9WfOXpQlLSBCZgB/QACnFsZulP0V3
// SIG // HjXG0qKin3p6IvpIlR+r+0cjgPWe+L9rt0uX4ut1eBrs
// SIG // 6jeZeRhL/9azI2h15q/6/IvrC4DqaTuv/DDtBEyO3991
// SIG // bWORPdGdVk5Pv4BXIqF4ETIheu9BCrE/+6jMpF3BoYib
// SIG // V3FWTkhFwELJm3ZbCoBIa/15n8G9bW1qyVJzEw16UM0x
// SIG // ghmdMIIZmQIBATCBlTB+MQswCQYDVQQGEwJVUzETMBEG
// SIG // A1UECBMKV2FzaGluZ3RvbjEQMA4GA1UEBxMHUmVkbW9u
// SIG // ZDEeMBwGA1UEChMVTWljcm9zb2Z0IENvcnBvcmF0aW9u
// SIG // MSgwJgYDVQQDEx9NaWNyb3NvZnQgQ29kZSBTaWduaW5n
// SIG // IFBDQSAyMDExAhMzAAACU+OD3pbexW7MAAAAAAJTMA0G
// SIG // CWCGSAFlAwQCAQUAoIHAMBkGCSqGSIb3DQEJAzEMBgor
// SIG // BgEEAYI3AgEEMBwGCisGAQQBgjcCAQsxDjAMBgorBgEE
// SIG // AYI3AgEVMC8GCSqGSIb3DQEJBDEiBCBOWHw9oDpUCWwy
// SIG // dxWLigPItaKjj8BgoopmC2EDeNPuCDBUBgorBgEEAYI3
// SIG // AgEMMUYwRKAkgCIATQBpAG4AZQBjAHIAYQBmAHQAIABC
// SIG // AGUAZAByAG8AYwBroRyAGmh0dHBzOi8vd3d3Lm1pbmVj
// SIG // cmFmdC5uZXQvMA0GCSqGSIb3DQEBAQUABIIBAJO6U/gO
// SIG // QttPtZOTLlWnbSAOdtHRGshUEtfh+/jaPnKm6Wla7AXS
// SIG // QETU6jQGVZgvku+onXUC0BWs+1AQNOaoD67Ho4pLEsYJ
// SIG // CD5TPQhebttix37XTsGCntnvdsYiKT/tX35rtLdEaunA
// SIG // P7i1tdt/QxHZSY3/nTEkmALiFpiwl9kVEBBcbrBbD1jo
// SIG // cIwrgjKNE2eiS3o2UjkEFCt2iToGKlQxRWS60FMasmZl
// SIG // 9vjbfHxMbtreXiSRzo1P7VFhdnsbwgXpIfVh7H0MpT3T
// SIG // dNdD0aePLSrlVySZEFqefluESd0a9xFiSbI7yEuuDSlm
// SIG // xjuxmC3ZL4RQXE6bidwIRE1nJdmhghcVMIIXEQYKKwYB
// SIG // BAGCNwMDATGCFwEwghb9BgkqhkiG9w0BBwKgghbuMIIW
// SIG // 6gIBAzEPMA0GCWCGSAFlAwQCAQUAMIIBWAYLKoZIhvcN
// SIG // AQkQAQSgggFHBIIBQzCCAT8CAQEGCisGAQQBhFkKAwEw
// SIG // MTANBglghkgBZQMEAgEFAAQgdqNTl+5dUuJZVs3u4dVw
// SIG // iYwWmqHeaAnmWq3G2WrlHfMCBmK7UPTQURgSMjAyMjA3
// SIG // MDIwMDI4NTAuOTdaMASAAgH0oIHYpIHVMIHSMQswCQYD
// SIG // VQQGEwJVUzETMBEGA1UECBMKV2FzaGluZ3RvbjEQMA4G
// SIG // A1UEBxMHUmVkbW9uZDEeMBwGA1UEChMVTWljcm9zb2Z0
// SIG // IENvcnBvcmF0aW9uMS0wKwYDVQQLEyRNaWNyb3NvZnQg
// SIG // SXJlbGFuZCBPcGVyYXRpb25zIExpbWl0ZWQxJjAkBgNV
// SIG // BAsTHVRoYWxlcyBUU1MgRVNOOkZDNDEtNEJENC1EMjIw
// SIG // MSUwIwYDVQQDExxNaWNyb3NvZnQgVGltZS1TdGFtcCBT
// SIG // ZXJ2aWNloIIRZTCCBxQwggT8oAMCAQICEzMAAAGOWdtG
// SIG // AKgQlMwAAQAAAY4wDQYJKoZIhvcNAQELBQAwfDELMAkG
// SIG // A1UEBhMCVVMxEzARBgNVBAgTCldhc2hpbmd0b24xEDAO
// SIG // BgNVBAcTB1JlZG1vbmQxHjAcBgNVBAoTFU1pY3Jvc29m
// SIG // dCBDb3Jwb3JhdGlvbjEmMCQGA1UEAxMdTWljcm9zb2Z0
// SIG // IFRpbWUtU3RhbXAgUENBIDIwMTAwHhcNMjExMDI4MTky
// SIG // NzQ1WhcNMjMwMTI2MTkyNzQ1WjCB0jELMAkGA1UEBhMC
// SIG // VVMxEzARBgNVBAgTCldhc2hpbmd0b24xEDAOBgNVBAcT
// SIG // B1JlZG1vbmQxHjAcBgNVBAoTFU1pY3Jvc29mdCBDb3Jw
// SIG // b3JhdGlvbjEtMCsGA1UECxMkTWljcm9zb2Z0IElyZWxh
// SIG // bmQgT3BlcmF0aW9ucyBMaW1pdGVkMSYwJAYDVQQLEx1U
// SIG // aGFsZXMgVFNTIEVTTjpGQzQxLTRCRDQtRDIyMDElMCMG
// SIG // A1UEAxMcTWljcm9zb2Z0IFRpbWUtU3RhbXAgU2Vydmlj
// SIG // ZTCCAiIwDQYJKoZIhvcNAQEBBQADggIPADCCAgoCggIB
// SIG // AKojAqujjMy2ucK7XH+wX/X9Vl1vZKamzgc4Dyb2hi62
// SIG // Ru7cIMKk0Vn9RZI6SSgThuUDyEcu2uiBVQMtFvrQWhV+
// SIG // CJ+A2wX9rRrm8mPfoUVPoUXsDyR+QmDr6T4e+xXxjOt/
// SIG // jpcEV6eWBEerQtFkSp95q8lqbeAsAA7hr9Cw9kI54YYL
// SIG // UVYnbIg55/fmi4zLjWqVIbLRqgq+yXEGbdGaz1B1v06k
// SIG // ycpnlNXqoDaKxG03nelEMi2k1QJoVzUFwwoX2udup1u0
// SIG // UOy+LV1/S3NKILogkpD5buXazQOjTPM/lF0DgB8VXyEF
// SIG // 5ovmN0ldoa9nXMW8vZ5U82L3+GQ6+VqXMLe7U3USCYm1
// SIG // x7F1jCq5js4pYhg06C8d+Gv3LWRODTi55aykFjfWRvjs
// SIG // ec0WqytRIUoWoTNLkDYW+gSY6d/nNHjczBSdqi2ag6dv
// SIG // 92JeUPuJPjAxy04qT+lQXcXHVX3eJoK1U8d2nzuSjX4D
// SIG // J4Bhn4UmsBq2kVtvBIayzrKZiMYovdhO7453CdrXI4Sw
// SIG // owQK1aT4d3GRuYN2VcuYogGqA2rMKTYJzBQCuVJ9a3iv
// SIG // jBYT4vYjJ71D8LUwwybeWBA+QwE95gVMaeUB97e0YWcA
// SIG // CTS1i7aU3hhe7m/NbEimL9mq3WswHvVy0tdLVdqDj63J
// SIG // 4hic5V1u1T78akDcXvJQgwNtAgMBAAGjggE2MIIBMjAd
// SIG // BgNVHQ4EFgQU7EH5M/YE+ODf+RvLzR2snqfmleQwHwYD
// SIG // VR0jBBgwFoAUn6cVXQBeYl2D9OXSZacbUzUZ6XIwXwYD
// SIG // VR0fBFgwVjBUoFKgUIZOaHR0cDovL3d3dy5taWNyb3Nv
// SIG // ZnQuY29tL3BraW9wcy9jcmwvTWljcm9zb2Z0JTIwVGlt
// SIG // ZS1TdGFtcCUyMFBDQSUyMDIwMTAoMSkuY3JsMGwGCCsG
// SIG // AQUFBwEBBGAwXjBcBggrBgEFBQcwAoZQaHR0cDovL3d3
// SIG // dy5taWNyb3NvZnQuY29tL3BraW9wcy9jZXJ0cy9NaWNy
// SIG // b3NvZnQlMjBUaW1lLVN0YW1wJTIwUENBJTIwMjAxMCgx
// SIG // KS5jcnQwDAYDVR0TAQH/BAIwADATBgNVHSUEDDAKBggr
// SIG // BgEFBQcDCDANBgkqhkiG9w0BAQsFAAOCAgEANVCvccyH
// SIG // k5SoUmy59G3pEeYGIemwdV0KZbgqggNebJGd+1IpWhSc
// SIG // PPhpJQy85TYUj9pjojs1cgqvJJKap31HNNWWgXs0MYO+
// SIG // 6nr49ojMoN/WCX3ogiIcWDhboMHqWKzzvDJQf6Lnv1YS
// SIG // Ig29XjWE5T0pr96WpbILZK29KKNBdLlpl+BEFRikaNFB
// SIG // DbWXrVSMWtCfQ6VHY0Fj3hIfXBDPkYBNuucOVgFW/ljc
// SIG // dIloheIk2wpq1mlRDl/dnTagZvW09VO5xsDeQsoKTQIB
// SIG // GmJ60zMdTeAI8TmwAgzeQ3bxpbvztA3zFlXOqpOoigxQ
// SIG // ulqV0EpDJa5VyCPzYaftPp6FOrXxKRyi7e32JvaH+Yv0
// SIG // KJnAsKP3pIjgo2JLad/d6L6AtTtri7Wy5zFZROa2gSwT
// SIG // UmyDWekC8YgONZV51VSyMw4oVC/DFPQjLxuLHW4ZNhV/
// SIG // M767D+T3gSMNX2npzGbs9Fd1FwrVOTpMeX5oqFooi2Ug
// SIG // otZY2sV/gRMEIopwovrxOfW02CORW7kfLQ7hi4lbvyUq
// SIG // VRV681jD9ip9dbAiwBhI6iWFJjtbUWNvSnex3CI9p4kg
// SIG // dD0Dgo2JZwp8sJw4p6ktQl70bIrI1ZUtUaeE5rpLPqRs
// SIG // YjBsxefM3G/oaBSsjjbi92/rYMUwM97BdwVV/bpPTORf
// SIG // jhKHsi8hny3pDQIwggdxMIIFWaADAgECAhMzAAAAFcXn
// SIG // a54Cm0mZAAAAAAAVMA0GCSqGSIb3DQEBCwUAMIGIMQsw
// SIG // CQYDVQQGEwJVUzETMBEGA1UECBMKV2FzaGluZ3RvbjEQ
// SIG // MA4GA1UEBxMHUmVkbW9uZDEeMBwGA1UEChMVTWljcm9z
// SIG // b2Z0IENvcnBvcmF0aW9uMTIwMAYDVQQDEylNaWNyb3Nv
// SIG // ZnQgUm9vdCBDZXJ0aWZpY2F0ZSBBdXRob3JpdHkgMjAx
// SIG // MDAeFw0yMTA5MzAxODIyMjVaFw0zMDA5MzAxODMyMjVa
// SIG // MHwxCzAJBgNVBAYTAlVTMRMwEQYDVQQIEwpXYXNoaW5n
// SIG // dG9uMRAwDgYDVQQHEwdSZWRtb25kMR4wHAYDVQQKExVN
// SIG // aWNyb3NvZnQgQ29ycG9yYXRpb24xJjAkBgNVBAMTHU1p
// SIG // Y3Jvc29mdCBUaW1lLVN0YW1wIFBDQSAyMDEwMIICIjAN
// SIG // BgkqhkiG9w0BAQEFAAOCAg8AMIICCgKCAgEA5OGmTOe0
// SIG // ciELeaLL1yR5vQ7VgtP97pwHB9KpbE51yMo1V/YBf2xK
// SIG // 4OK9uT4XYDP/XE/HZveVU3Fa4n5KWv64NmeFRiMMtY0T
// SIG // z3cywBAY6GB9alKDRLemjkZrBxTzxXb1hlDcwUTIcVxR
// SIG // MTegCjhuje3XD9gmU3w5YQJ6xKr9cmmvHaus9ja+NSZk
// SIG // 2pg7uhp7M62AW36MEBydUv626GIl3GoPz130/o5Tz9bs
// SIG // hVZN7928jaTjkY+yOSxRnOlwaQ3KNi1wjjHINSi947SH
// SIG // JMPgyY9+tVSP3PoFVZhtaDuaRr3tpK56KTesy+uDRedG
// SIG // bsoy1cCGMFxPLOJiss254o2I5JasAUq7vnGpF1tnYN74
// SIG // kpEeHT39IM9zfUGaRnXNxF803RKJ1v2lIH1+/NmeRd+2
// SIG // ci/bfV+AutuqfjbsNkz2K26oElHovwUDo9Fzpk03dJQc
// SIG // NIIP8BDyt0cY7afomXw/TNuvXsLz1dhzPUNOwTM5TI4C
// SIG // vEJoLhDqhFFG4tG9ahhaYQFzymeiXtcodgLiMxhy16cg
// SIG // 8ML6EgrXY28MyTZki1ugpoMhXV8wdJGUlNi5UPkLiWHz
// SIG // NgY1GIRH29wb0f2y1BzFa/ZcUlFdEtsluq9QBXpsxREd
// SIG // cu+N+VLEhReTwDwV2xo3xwgVGD94q0W29R6HXtqPnhZy
// SIG // acaue7e3PmriLq0CAwEAAaOCAd0wggHZMBIGCSsGAQQB
// SIG // gjcVAQQFAgMBAAEwIwYJKwYBBAGCNxUCBBYEFCqnUv5k
// SIG // xJq+gpE8RjUpzxD/LwTuMB0GA1UdDgQWBBSfpxVdAF5i
// SIG // XYP05dJlpxtTNRnpcjBcBgNVHSAEVTBTMFEGDCsGAQQB
// SIG // gjdMg30BATBBMD8GCCsGAQUFBwIBFjNodHRwOi8vd3d3
// SIG // Lm1pY3Jvc29mdC5jb20vcGtpb3BzL0RvY3MvUmVwb3Np
// SIG // dG9yeS5odG0wEwYDVR0lBAwwCgYIKwYBBQUHAwgwGQYJ
// SIG // KwYBBAGCNxQCBAweCgBTAHUAYgBDAEEwCwYDVR0PBAQD
// SIG // AgGGMA8GA1UdEwEB/wQFMAMBAf8wHwYDVR0jBBgwFoAU
// SIG // 1fZWy4/oolxiaNE9lJBb186aGMQwVgYDVR0fBE8wTTBL
// SIG // oEmgR4ZFaHR0cDovL2NybC5taWNyb3NvZnQuY29tL3Br
// SIG // aS9jcmwvcHJvZHVjdHMvTWljUm9vQ2VyQXV0XzIwMTAt
// SIG // MDYtMjMuY3JsMFoGCCsGAQUFBwEBBE4wTDBKBggrBgEF
// SIG // BQcwAoY+aHR0cDovL3d3dy5taWNyb3NvZnQuY29tL3Br
// SIG // aS9jZXJ0cy9NaWNSb29DZXJBdXRfMjAxMC0wNi0yMy5j
// SIG // cnQwDQYJKoZIhvcNAQELBQADggIBAJ1VffwqreEsH2cB
// SIG // MSRb4Z5yS/ypb+pcFLY+TkdkeLEGk5c9MTO1OdfCcTY/
// SIG // 2mRsfNB1OW27DzHkwo/7bNGhlBgi7ulmZzpTTd2YurYe
// SIG // eNg2LpypglYAA7AFvonoaeC6Ce5732pvvinLbtg/SHUB
// SIG // 2RjebYIM9W0jVOR4U3UkV7ndn/OOPcbzaN9l9qRWqveV
// SIG // tihVJ9AkvUCgvxm2EhIRXT0n4ECWOKz3+SmJw7wXsFSF
// SIG // QrP8DJ6LGYnn8AtqgcKBGUIZUnWKNsIdw2FzLixre24/
// SIG // LAl4FOmRsqlb30mjdAy87JGA0j3mSj5mO0+7hvoyGtmW
// SIG // 9I/2kQH2zsZ0/fZMcm8Qq3UwxTSwethQ/gpY3UA8x1Rt
// SIG // nWN0SCyxTkctwRQEcb9k+SS+c23Kjgm9swFXSVRk2XPX
// SIG // fx5bRAGOWhmRaw2fpCjcZxkoJLo4S5pu+yFUa2pFEUep
// SIG // 8beuyOiJXk+d0tBMdrVXVAmxaQFEfnyhYWxz/gq77EFm
// SIG // PWn9y8FBSX5+k77L+DvktxW/tM4+pTFRhLy/AsGConsX
// SIG // HRWJjXD+57XQKBqJC4822rpM+Zv/Cuk0+CQ1ZyvgDbjm
// SIG // jJnW4SLq8CdCPSWU5nR0W2rRnj7tfqAxM328y+l7vzhw
// SIG // RNGQ8cirOoo6CGJ/2XBjU02N7oJtpQUQwXEGahC0HVUz
// SIG // WLOhcGbyoYIC1DCCAj0CAQEwggEAoYHYpIHVMIHSMQsw
// SIG // CQYDVQQGEwJVUzETMBEGA1UECBMKV2FzaGluZ3RvbjEQ
// SIG // MA4GA1UEBxMHUmVkbW9uZDEeMBwGA1UEChMVTWljcm9z
// SIG // b2Z0IENvcnBvcmF0aW9uMS0wKwYDVQQLEyRNaWNyb3Nv
// SIG // ZnQgSXJlbGFuZCBPcGVyYXRpb25zIExpbWl0ZWQxJjAk
// SIG // BgNVBAsTHVRoYWxlcyBUU1MgRVNOOkZDNDEtNEJENC1E
// SIG // MjIwMSUwIwYDVQQDExxNaWNyb3NvZnQgVGltZS1TdGFt
// SIG // cCBTZXJ2aWNloiMKAQEwBwYFKw4DAhoDFQA9YivqT04R
// SIG // 6oKWucbD5omK7llbjKCBgzCBgKR+MHwxCzAJBgNVBAYT
// SIG // AlVTMRMwEQYDVQQIEwpXYXNoaW5ndG9uMRAwDgYDVQQH
// SIG // EwdSZWRtb25kMR4wHAYDVQQKExVNaWNyb3NvZnQgQ29y
// SIG // cG9yYXRpb24xJjAkBgNVBAMTHU1pY3Jvc29mdCBUaW1l
// SIG // LVN0YW1wIFBDQSAyMDEwMA0GCSqGSIb3DQEBBQUAAgUA
// SIG // 5mnD3zAiGA8yMDIyMDcwMjAzMDUwM1oYDzIwMjIwNzAz
// SIG // MDMwNTAzWjB0MDoGCisGAQQBhFkKBAExLDAqMAoCBQDm
// SIG // acPfAgEAMAcCAQACAh9DMAcCAQACAhFgMAoCBQDmaxVf
// SIG // AgEAMDYGCisGAQQBhFkKBAIxKDAmMAwGCisGAQQBhFkK
// SIG // AwKgCjAIAgEAAgMHoSChCjAIAgEAAgMBhqAwDQYJKoZI
// SIG // hvcNAQEFBQADgYEAN8c3vr3IbD+BmPUMG2C7eUJOfEx0
// SIG // uVE95eL3m1lph5YL3ZmcTva7afJxz9Yq20ftPOwT2Q6r
// SIG // dFpuNAEnJma7XL/gWYYuA/sccTJrW9Uo6FgQDQxFPBQy
// SIG // 7VLPqSpvIEToFTXg0fYvxP/Teg8EA7+XXB/eBxBeU7n/
// SIG // FyLt+uilcf4xggQNMIIECQIBATCBkzB8MQswCQYDVQQG
// SIG // EwJVUzETMBEGA1UECBMKV2FzaGluZ3RvbjEQMA4GA1UE
// SIG // BxMHUmVkbW9uZDEeMBwGA1UEChMVTWljcm9zb2Z0IENv
// SIG // cnBvcmF0aW9uMSYwJAYDVQQDEx1NaWNyb3NvZnQgVGlt
// SIG // ZS1TdGFtcCBQQ0EgMjAxMAITMwAAAY5Z20YAqBCUzAAB
// SIG // AAABjjANBglghkgBZQMEAgEFAKCCAUowGgYJKoZIhvcN
// SIG // AQkDMQ0GCyqGSIb3DQEJEAEEMC8GCSqGSIb3DQEJBDEi
// SIG // BCBKs95wWh2XTRIhhmKtngWGQZbDBdFpR21weZFLiymn
// SIG // 0DCB+gYLKoZIhvcNAQkQAi8xgeowgecwgeQwgb0EIL0F
// SIG // jyE74oGlLlefn/5VrNwV2cCf5dZn/snpbuZ15sQlMIGY
// SIG // MIGApH4wfDELMAkGA1UEBhMCVVMxEzARBgNVBAgTCldh
// SIG // c2hpbmd0b24xEDAOBgNVBAcTB1JlZG1vbmQxHjAcBgNV
// SIG // BAoTFU1pY3Jvc29mdCBDb3Jwb3JhdGlvbjEmMCQGA1UE
// SIG // AxMdTWljcm9zb2Z0IFRpbWUtU3RhbXAgUENBIDIwMTAC
// SIG // EzMAAAGOWdtGAKgQlMwAAQAAAY4wIgQgADx19PamWeIv
// SIG // KW/PoFV+JDan4vg5cVXTkN97XyTtllYwDQYJKoZIhvcN
// SIG // AQELBQAEggIAHrQWzyAO3kEf7BGNhT88+hylmSWh5Me0
// SIG // 0DJn1QDh5luDiKbM1o0tafUucthP+Yz/G265VGi0By9N
// SIG // 2C6VXcfNFDuOcfkhqaFXetpx85b1I7WarMCJmiZgTCkE
// SIG // oVV4KWBNDI5WMJ7+xry6Ws79WwClvgGjWcuRd9IDr9D/
// SIG // JWRjboknrcz8iDHnQmGgB4a+oUE7+fTpHoR+ocH3+9HG
// SIG // OZ5FJekrCyv7FeePoh3WNG9iUz+bYs3PdG63a38rw0Jj
// SIG // uX1n1hdjvI+jI+Ak5RO0/KeCStKLbsjRf5guhl3G3kpc
// SIG // J9TWhQRSjtvEPj/5Eit7g5vNsI/E6Lp+HxvfsmuKATIf
// SIG // jU/EZK0BFgKFPVtMyB9KOTMqiWPHEhxuxfhxQbyRCme3
// SIG // 9i3v0R5SvH+NCd/SCMJ7/S3Y73C7iEINLDpZvYKlAuce
// SIG // eJ8kS2JLkVa9oGTqfwe3MV6R5d1nr4mRmP7T/c4HeB6L
// SIG // pO9eEgGGwVsJUq2IxHe1SD70gYMBNfaxR/4BkJ+E0wY9
// SIG // 0JAqZoqyDrkIMalMf/q1a0qnKDRcLqaBRYHIG6knIgOI
// SIG // B0TmetF4gfGGX+UGVs96RNVjm7NGdIvFsuwMenr040sI
// SIG // ie1/zzSWbJE2AIrxW1ELiz6vHYyKYtQKSx04r0v5SoLw
// SIG // U62LuhVpsX2UvmGVrFx1k1hoPEeEVoY663s=
// SIG // End signature block
