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
// SIG // MIInugYJKoZIhvcNAQcCoIInqzCCJ6cCAQExDzANBglg
// SIG // hkgBZQMEAgEFADB3BgorBgEEAYI3AgEEoGkwZzAyBgor
// SIG // BgEEAYI3AgEeMCQCAQEEEBDgyQbOONQRoqMAEEvTUJAC
// SIG // AQACAQACAQACAQACAQAwMTANBglghkgBZQMEAgEFAAQg
// SIG // nB83QpFxda7j16mF06uHlZDfU5jIC8hiQSa+bhuQL+mg
// SIG // gg2BMIIF/zCCA+egAwIBAgITMwAAAlKLM6r4lfM52wAA
// SIG // AAACUjANBgkqhkiG9w0BAQsFADB+MQswCQYDVQQGEwJV
// SIG // UzETMBEGA1UECBMKV2FzaGluZ3RvbjEQMA4GA1UEBxMH
// SIG // UmVkbW9uZDEeMBwGA1UEChMVTWljcm9zb2Z0IENvcnBv
// SIG // cmF0aW9uMSgwJgYDVQQDEx9NaWNyb3NvZnQgQ29kZSBT
// SIG // aWduaW5nIFBDQSAyMDExMB4XDTIxMDkwMjE4MzI1OVoX
// SIG // DTIyMDkwMTE4MzI1OVowdDELMAkGA1UEBhMCVVMxEzAR
// SIG // BgNVBAgTCldhc2hpbmd0b24xEDAOBgNVBAcTB1JlZG1v
// SIG // bmQxHjAcBgNVBAoTFU1pY3Jvc29mdCBDb3Jwb3JhdGlv
// SIG // bjEeMBwGA1UEAxMVTWljcm9zb2Z0IENvcnBvcmF0aW9u
// SIG // MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA
// SIG // 0OTPj7P1+wTbr+Qf9COrqA8I9DSTqNSq1UKju4IEV3HJ
// SIG // Jck61i+MTEoYyKLtiLG2Jxeu8F81QKuTpuKHvi380gzs
// SIG // 43G+prNNIAaNDkGqsENQYo8iezbw3/NCNX1vTi++irdF
// SIG // qXNs6xoc3B3W+7qT678b0jTVL8St7IMO2E7d9eNdL6RK
// SIG // fMnwRJf4XfGcwL+OwwoCeY9c5tvebNUVWRzaejKIkBVT
// SIG // hApuAMCtpdvIvmBEdSTuCKZUx+OLr81/aEZyR2jL1s2R
// SIG // KaMz8uIzTtgw6m3DbOM4ewFjIRNT1hVQPghyPxJ+ZwEr
// SIG // wry5rkf7fKuG3PF0fECGSUEqftlOptpXTQIDAQABo4IB
// SIG // fjCCAXowHwYDVR0lBBgwFgYKKwYBBAGCN0wIAQYIKwYB
// SIG // BQUHAwMwHQYDVR0OBBYEFDWSWhFBi9hrsLe2TgLuHnxG
// SIG // F3nRMFAGA1UdEQRJMEekRTBDMSkwJwYDVQQLEyBNaWNy
// SIG // b3NvZnQgT3BlcmF0aW9ucyBQdWVydG8gUmljbzEWMBQG
// SIG // A1UEBRMNMjMwMDEyKzQ2NzU5NzAfBgNVHSMEGDAWgBRI
// SIG // bmTlUAXTgqoXNzcitW2oynUClTBUBgNVHR8ETTBLMEmg
// SIG // R6BFhkNodHRwOi8vd3d3Lm1pY3Jvc29mdC5jb20vcGtp
// SIG // b3BzL2NybC9NaWNDb2RTaWdQQ0EyMDExXzIwMTEtMDct
// SIG // MDguY3JsMGEGCCsGAQUFBwEBBFUwUzBRBggrBgEFBQcw
// SIG // AoZFaHR0cDovL3d3dy5taWNyb3NvZnQuY29tL3BraW9w
// SIG // cy9jZXJ0cy9NaWNDb2RTaWdQQ0EyMDExXzIwMTEtMDct
// SIG // MDguY3J0MAwGA1UdEwEB/wQCMAAwDQYJKoZIhvcNAQEL
// SIG // BQADggIBABZJN7ksZExAYdTbQJewYryBLAFnYF9amfhH
// SIG // WTGG0CmrGOiIUi10TMRdQdzinUfSv5HHKZLzXBpfA+2M
// SIG // mEuJoQlDAUflS64N3/D1I9/APVeWomNvyaJO1mRTgJoz
// SIG // 0TTRp8noO5dJU4k4RahPtmjrOvoXnoKgHXpRoDSSkRy1
// SIG // kboRiriyMOZZIMfSsvkL2a5/w3YvLkyIFiqfjBhvMWOj
// SIG // wb744LfY0EoZZz62d1GPAb8Muq8p4VwWldFdE0y9IBMe
// SIG // 3ofytaPDImq7urP+xcqji3lEuL0x4fU4AS+Q7cQmLq12
// SIG // 0gVbS9RY+OPjnf+nJgvZpr67Yshu9PWN0Xd2HSY9n9xi
// SIG // au2OynVqtEGIWrSoQXoOH8Y4YNMrrdoOmjNZsYzT6xOP
// SIG // M+h1gjRrvYDCuWbnZXUcOGuOWdOgKJLaH9AqjskxK76t
// SIG // GI6BOF6WtPvO0/z1VFzan+2PqklO/vS7S0LjGEeMN3Ej
// SIG // 47jbrLy3/YAZ3IeUajO5Gg7WFg4C8geNhH7MXjKsClsA
// SIG // Pk1YtB61kan0sdqJWxOeoSXBJDIzkis97EbrqRQl91K6
// SIG // MmH+di/tolU63WvF1nrDxutjJ590/ALi383iRbgG3zkh
// SIG // EceyBWTvdlD6FxNbhIy+bJJdck2QdzLm4DgOBfCqETYb
// SIG // 4hQBEk/pxvHPLiLG2Xm9PEnmEDKo1RJpMIIHejCCBWKg
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
// SIG // SEXAQsmbdlsKgEhr/Xmfwb1tbWrJUnMTDXpQzTGCGZEw
// SIG // ghmNAgEBMIGVMH4xCzAJBgNVBAYTAlVTMRMwEQYDVQQI
// SIG // EwpXYXNoaW5ndG9uMRAwDgYDVQQHEwdSZWRtb25kMR4w
// SIG // HAYDVQQKExVNaWNyb3NvZnQgQ29ycG9yYXRpb24xKDAm
// SIG // BgNVBAMTH01pY3Jvc29mdCBDb2RlIFNpZ25pbmcgUENB
// SIG // IDIwMTECEzMAAAJSizOq+JXzOdsAAAAAAlIwDQYJYIZI
// SIG // AWUDBAIBBQCggcAwGQYJKoZIhvcNAQkDMQwGCisGAQQB
// SIG // gjcCAQQwHAYKKwYBBAGCNwIBCzEOMAwGCisGAQQBgjcC
// SIG // ARUwLwYJKoZIhvcNAQkEMSIEIE5YfD2gOlQJbDJ3FYuK
// SIG // A8i1oqOPwGCiimYLYQN40+4IMFQGCisGAQQBgjcCAQwx
// SIG // RjBEoCSAIgBNAGkAbgBlAGMAcgBhAGYAdAAgAEIAZQBk
// SIG // AHIAbwBjAGuhHIAaaHR0cHM6Ly93d3cubWluZWNyYWZ0
// SIG // Lm5ldC8wDQYJKoZIhvcNAQEBBQAEggEAUItaFokkakNm
// SIG // s4N9fl19Vs6CqXsqLpwICji5tvanomEd2JGvSp5IS3dP
// SIG // rcdhycvg0G1SjzCoPIb5cjaT/uMWJCpOXFcozuabYPIs
// SIG // LwdXRH6PDB8X4Ye+x35UcOMRdFUcbNFE7pzRXP/dos9p
// SIG // rxJmg/WLx3aderCg1g5s5kL6hMa+o1JtruH8ww1RIIkg
// SIG // kPfpvrYkQERVQkBZ9sHgtCMDtdITsT3Oom0iwV3bDooF
// SIG // J7hsGR/s+pL9Egzr/rbwRDFlsNz/DCwT7NfdFTpE0iRs
// SIG // Ljn6ZKEPVstCjCQuiokMsGW72AhTCAg5VZyvk6KnokEZ
// SIG // 90uhzqf3WqkifQoD/0zYMaGCFwkwghcFBgorBgEEAYI3
// SIG // AwMBMYIW9TCCFvEGCSqGSIb3DQEHAqCCFuIwghbeAgED
// SIG // MQ8wDQYJYIZIAWUDBAIBBQAwggFVBgsqhkiG9w0BCRAB
// SIG // BKCCAUQEggFAMIIBPAIBAQYKKwYBBAGEWQoDATAxMA0G
// SIG // CWCGSAFlAwQCAQUABCDNxVQOKN72GnV6GBnC6wQBzeKS
// SIG // iznburizFYmR8lN3KAIGYoSvPeOJGBMyMDIyMDUyNzAw
// SIG // NTAyOS4xNDdaMASAAgH0oIHUpIHRMIHOMQswCQYDVQQG
// SIG // EwJVUzETMBEGA1UECBMKV2FzaGluZ3RvbjEQMA4GA1UE
// SIG // BxMHUmVkbW9uZDEeMBwGA1UEChMVTWljcm9zb2Z0IENv
// SIG // cnBvcmF0aW9uMSkwJwYDVQQLEyBNaWNyb3NvZnQgT3Bl
// SIG // cmF0aW9ucyBQdWVydG8gUmljbzEmMCQGA1UECxMdVGhh
// SIG // bGVzIFRTUyBFU046ODk3QS1FMzU2LTE3MDExJTAjBgNV
// SIG // BAMTHE1pY3Jvc29mdCBUaW1lLVN0YW1wIFNlcnZpY2Wg
// SIG // ghFcMIIHEDCCBPigAwIBAgITMwAAAasJCe+rY9ToqQAB
// SIG // AAABqzANBgkqhkiG9w0BAQsFADB8MQswCQYDVQQGEwJV
// SIG // UzETMBEGA1UECBMKV2FzaGluZ3RvbjEQMA4GA1UEBxMH
// SIG // UmVkbW9uZDEeMBwGA1UEChMVTWljcm9zb2Z0IENvcnBv
// SIG // cmF0aW9uMSYwJAYDVQQDEx1NaWNyb3NvZnQgVGltZS1T
// SIG // dGFtcCBQQ0EgMjAxMDAeFw0yMjAzMDIxODUxMjhaFw0y
// SIG // MzA1MTExODUxMjhaMIHOMQswCQYDVQQGEwJVUzETMBEG
// SIG // A1UECBMKV2FzaGluZ3RvbjEQMA4GA1UEBxMHUmVkbW9u
// SIG // ZDEeMBwGA1UEChMVTWljcm9zb2Z0IENvcnBvcmF0aW9u
// SIG // MSkwJwYDVQQLEyBNaWNyb3NvZnQgT3BlcmF0aW9ucyBQ
// SIG // dWVydG8gUmljbzEmMCQGA1UECxMdVGhhbGVzIFRTUyBF
// SIG // U046ODk3QS1FMzU2LTE3MDExJTAjBgNVBAMTHE1pY3Jv
// SIG // c29mdCBUaW1lLVN0YW1wIFNlcnZpY2UwggIiMA0GCSqG
// SIG // SIb3DQEBAQUAA4ICDwAwggIKAoICAQDJnUtaOXXoQElL
// SIG // LHC6ssdsJv1oqzVH6pBgcpgyLWMxJ6CrZIa3e8DbCbOI
// SIG // PgbjN7gV/NVpztu9JZKwtHtZpg6kLeNtE5m/JcLI0CjO
// SIG // phGjUCH1w66J61Td2sNZcfWwH+1WRAN5BxapemADt5I0
// SIG // Oj37QOIlR19yVb/fJ7Y5G7asyniTGjVnfHQWgA90QpYj
// SIG // KGo0wxm8mDSk78QYViC8ifFmHSfzQQ6aj80JfqcZumWV
// SIG // UngUACDrm2Y1NL36RAsRwubyNRK66mqRvtKAYYTjfoJZ
// SIG // VZJTwFmb9or9JoIwk4+2DSl+8i9sdk767x1auRjzWuXz
// SIG // W6ct/beXL4omKjH9UWVWXHHa/trwKZOYm+WuDvEogID0
// SIG // lMGBqDsG2RtaJx4o9AEzy5IClH4Gj8xX3eSWUm0Zdl4N
// SIG // +O/y41kC0fiowMgAhW9Om6ls7x7UCUzQ/GNI+WNkgZ0g
// SIG // qldszR0lbbOPmlH5FIbCkvhgF0t4+V1IGAO0jDaIO+jZ
// SIG // 7LOZdNZxF+7Bw3WMpGIc7kCha0+9F1U2Xl9ubUgX8t1W
// SIG // nM2HdSUiP/cDhqmxVOdjcq5bANaopsTobLnbOz8aPozt
// SIG // 0Y1f5AvgBDqFWlw3Zop7HNz7ZQQlYf7IGJ6PQFMpm5Uk
// SIG // ZnntYMJZ5WSdLohyiPathxYGVjNdMjxuYFbdKa15yRYt
// SIG // VsZpoPgR/wIDAQABo4IBNjCCATIwHQYDVR0OBBYEFBRb
// SIG // zvKNXjXEgiEGTL6hn3TS/qaqMB8GA1UdIwQYMBaAFJ+n
// SIG // FV0AXmJdg/Tl0mWnG1M1GelyMF8GA1UdHwRYMFYwVKBS
// SIG // oFCGTmh0dHA6Ly93d3cubWljcm9zb2Z0LmNvbS9wa2lv
// SIG // cHMvY3JsL01pY3Jvc29mdCUyMFRpbWUtU3RhbXAlMjBQ
// SIG // Q0ElMjAyMDEwKDEpLmNybDBsBggrBgEFBQcBAQRgMF4w
// SIG // XAYIKwYBBQUHMAKGUGh0dHA6Ly93d3cubWljcm9zb2Z0
// SIG // LmNvbS9wa2lvcHMvY2VydHMvTWljcm9zb2Z0JTIwVGlt
// SIG // ZS1TdGFtcCUyMFBDQSUyMDIwMTAoMSkuY3J0MAwGA1Ud
// SIG // EwEB/wQCMAAwEwYDVR0lBAwwCgYIKwYBBQUHAwgwDQYJ
// SIG // KoZIhvcNAQELBQADggIBAMpLlIE3NSjLMzILB24YI4BB
// SIG // r/3QhxX9G8vfQuOUke+9P7nQjTXqpU+tdBIc9d8RhVOh
// SIG // 3Ivky1D1J4b1J0rs+8ZIlka7uUY2WZkqJxFb/J6Wt89U
// SIG // L3lH54LcotCXeqpUspKBFSerQ7kdSsPcVPcr7YWVoULP
// SIG // 8psjsIfpsbdAvcG3iyfdnq9r3PZctdqRcWwjQyfpkO7+
// SIG // dtIQL63lqmdNhjiYcNEeHNYj9/YjQcxzqM/g7DtLGI8I
// SIG // Ws/R672DBMzg9TCXSz1n1BbGf/4k3d48xMpJNNlo52Tc
// SIG // yHthDX5kPym5Rlx3knvCWKopkxcZeZHjHy1BC4wIdJoU
// SIG // NbywiWdtAcAuDuexIO8jv2LgZ6PuEa1dAg9oKeATtdCh
// SIG // VtkkPzIb0Viux24Eugc7e9K5CHklLaO6UZBzKq54bmyE
// SIG // 3F3XZMuhrWbJsDN4b6l7krTHlNVuTTdxwPMqYzy3f26J
// SIG // nxsfeh7sPDq37XEL5O7YXTbuCYQMilF1D+3SjAiX6zna
// SIG // ZYNI9bRNGohPqQ00kFZj8xnswi+NrJcjyVV6buMcRNIa
// SIG // QAq9rmtCx7/ywekVeQuAjuDLP6X2pf/xdzvoSWXuYsXr
// SIG // 8yjZF128TzmtUfkiK1v6x2TOkSAy0ycUxhQzNYUA8mnx
// SIG // rvUv2u7ppL4pYARzcWX5NCGBO0UViXBu6ImPhRncdXLN
// SIG // MIIHcTCCBVmgAwIBAgITMwAAABXF52ueAptJmQAAAAAA
// SIG // FTANBgkqhkiG9w0BAQsFADCBiDELMAkGA1UEBhMCVVMx
// SIG // EzARBgNVBAgTCldhc2hpbmd0b24xEDAOBgNVBAcTB1Jl
// SIG // ZG1vbmQxHjAcBgNVBAoTFU1pY3Jvc29mdCBDb3Jwb3Jh
// SIG // dGlvbjEyMDAGA1UEAxMpTWljcm9zb2Z0IFJvb3QgQ2Vy
// SIG // dGlmaWNhdGUgQXV0aG9yaXR5IDIwMTAwHhcNMjEwOTMw
// SIG // MTgyMjI1WhcNMzAwOTMwMTgzMjI1WjB8MQswCQYDVQQG
// SIG // EwJVUzETMBEGA1UECBMKV2FzaGluZ3RvbjEQMA4GA1UE
// SIG // BxMHUmVkbW9uZDEeMBwGA1UEChMVTWljcm9zb2Z0IENv
// SIG // cnBvcmF0aW9uMSYwJAYDVQQDEx1NaWNyb3NvZnQgVGlt
// SIG // ZS1TdGFtcCBQQ0EgMjAxMDCCAiIwDQYJKoZIhvcNAQEB
// SIG // BQADggIPADCCAgoCggIBAOThpkzntHIhC3miy9ckeb0O
// SIG // 1YLT/e6cBwfSqWxOdcjKNVf2AX9sSuDivbk+F2Az/1xP
// SIG // x2b3lVNxWuJ+Slr+uDZnhUYjDLWNE893MsAQGOhgfWpS
// SIG // g0S3po5GawcU88V29YZQ3MFEyHFcUTE3oAo4bo3t1w/Y
// SIG // JlN8OWECesSq/XJprx2rrPY2vjUmZNqYO7oaezOtgFt+
// SIG // jBAcnVL+tuhiJdxqD89d9P6OU8/W7IVWTe/dvI2k45GP
// SIG // sjksUZzpcGkNyjYtcI4xyDUoveO0hyTD4MmPfrVUj9z6
// SIG // BVWYbWg7mka97aSueik3rMvrg0XnRm7KMtXAhjBcTyzi
// SIG // YrLNueKNiOSWrAFKu75xqRdbZ2De+JKRHh09/SDPc31B
// SIG // mkZ1zcRfNN0Sidb9pSB9fvzZnkXftnIv231fgLrbqn42
// SIG // 7DZM9ituqBJR6L8FA6PRc6ZNN3SUHDSCD/AQ8rdHGO2n
// SIG // 6Jl8P0zbr17C89XYcz1DTsEzOUyOArxCaC4Q6oRRRuLR
// SIG // vWoYWmEBc8pnol7XKHYC4jMYctenIPDC+hIK12NvDMk2
// SIG // ZItboKaDIV1fMHSRlJTYuVD5C4lh8zYGNRiER9vcG9H9
// SIG // stQcxWv2XFJRXRLbJbqvUAV6bMURHXLvjflSxIUXk8A8
// SIG // FdsaN8cIFRg/eKtFtvUeh17aj54WcmnGrnu3tz5q4i6t
// SIG // AgMBAAGjggHdMIIB2TASBgkrBgEEAYI3FQEEBQIDAQAB
// SIG // MCMGCSsGAQQBgjcVAgQWBBQqp1L+ZMSavoKRPEY1Kc8Q
// SIG // /y8E7jAdBgNVHQ4EFgQUn6cVXQBeYl2D9OXSZacbUzUZ
// SIG // 6XIwXAYDVR0gBFUwUzBRBgwrBgEEAYI3TIN9AQEwQTA/
// SIG // BggrBgEFBQcCARYzaHR0cDovL3d3dy5taWNyb3NvZnQu
// SIG // Y29tL3BraW9wcy9Eb2NzL1JlcG9zaXRvcnkuaHRtMBMG
// SIG // A1UdJQQMMAoGCCsGAQUFBwMIMBkGCSsGAQQBgjcUAgQM
// SIG // HgoAUwB1AGIAQwBBMAsGA1UdDwQEAwIBhjAPBgNVHRMB
// SIG // Af8EBTADAQH/MB8GA1UdIwQYMBaAFNX2VsuP6KJcYmjR
// SIG // PZSQW9fOmhjEMFYGA1UdHwRPME0wS6BJoEeGRWh0dHA6
// SIG // Ly9jcmwubWljcm9zb2Z0LmNvbS9wa2kvY3JsL3Byb2R1
// SIG // Y3RzL01pY1Jvb0NlckF1dF8yMDEwLTA2LTIzLmNybDBa
// SIG // BggrBgEFBQcBAQROMEwwSgYIKwYBBQUHMAKGPmh0dHA6
// SIG // Ly93d3cubWljcm9zb2Z0LmNvbS9wa2kvY2VydHMvTWlj
// SIG // Um9vQ2VyQXV0XzIwMTAtMDYtMjMuY3J0MA0GCSqGSIb3
// SIG // DQEBCwUAA4ICAQCdVX38Kq3hLB9nATEkW+Geckv8qW/q
// SIG // XBS2Pk5HZHixBpOXPTEztTnXwnE2P9pkbHzQdTltuw8x
// SIG // 5MKP+2zRoZQYIu7pZmc6U03dmLq2HnjYNi6cqYJWAAOw
// SIG // Bb6J6Gngugnue99qb74py27YP0h1AdkY3m2CDPVtI1Tk
// SIG // eFN1JFe53Z/zjj3G82jfZfakVqr3lbYoVSfQJL1AoL8Z
// SIG // thISEV09J+BAljis9/kpicO8F7BUhUKz/AyeixmJ5/AL
// SIG // aoHCgRlCGVJ1ijbCHcNhcy4sa3tuPywJeBTpkbKpW99J
// SIG // o3QMvOyRgNI95ko+ZjtPu4b6MhrZlvSP9pEB9s7GdP32
// SIG // THJvEKt1MMU0sHrYUP4KWN1APMdUbZ1jdEgssU5HLcEU
// SIG // BHG/ZPkkvnNtyo4JvbMBV0lUZNlz138eW0QBjloZkWsN
// SIG // n6Qo3GcZKCS6OEuabvshVGtqRRFHqfG3rsjoiV5PndLQ
// SIG // THa1V1QJsWkBRH58oWFsc/4Ku+xBZj1p/cvBQUl+fpO+
// SIG // y/g75LcVv7TOPqUxUYS8vwLBgqJ7Fx0ViY1w/ue10Cga
// SIG // iQuPNtq6TPmb/wrpNPgkNWcr4A245oyZ1uEi6vAnQj0l
// SIG // lOZ0dFtq0Z4+7X6gMTN9vMvpe784cETRkPHIqzqKOghi
// SIG // f9lwY1NNje6CbaUFEMFxBmoQtB1VM1izoXBm8qGCAs8w
// SIG // ggI4AgEBMIH8oYHUpIHRMIHOMQswCQYDVQQGEwJVUzET
// SIG // MBEGA1UECBMKV2FzaGluZ3RvbjEQMA4GA1UEBxMHUmVk
// SIG // bW9uZDEeMBwGA1UEChMVTWljcm9zb2Z0IENvcnBvcmF0
// SIG // aW9uMSkwJwYDVQQLEyBNaWNyb3NvZnQgT3BlcmF0aW9u
// SIG // cyBQdWVydG8gUmljbzEmMCQGA1UECxMdVGhhbGVzIFRT
// SIG // UyBFU046ODk3QS1FMzU2LTE3MDExJTAjBgNVBAMTHE1p
// SIG // Y3Jvc29mdCBUaW1lLVN0YW1wIFNlcnZpY2WiIwoBATAH
// SIG // BgUrDgMCGgMVAFuoev9uFgqO1mc+ghFQHi87XJg+oIGD
// SIG // MIGApH4wfDELMAkGA1UEBhMCVVMxEzARBgNVBAgTCldh
// SIG // c2hpbmd0b24xEDAOBgNVBAcTB1JlZG1vbmQxHjAcBgNV
// SIG // BAoTFU1pY3Jvc29mdCBDb3Jwb3JhdGlvbjEmMCQGA1UE
// SIG // AxMdTWljcm9zb2Z0IFRpbWUtU3RhbXAgUENBIDIwMTAw
// SIG // DQYJKoZIhvcNAQEFBQACBQDmOmIyMCIYDzIwMjIwNTI3
// SIG // MDAzMTQ2WhgPMjAyMjA1MjgwMDMxNDZaMHQwOgYKKwYB
// SIG // BAGEWQoEATEsMCowCgIFAOY6YjICAQAwBwIBAAICDd4w
// SIG // BwIBAAICEj0wCgIFAOY7s7ICAQAwNgYKKwYBBAGEWQoE
// SIG // AjEoMCYwDAYKKwYBBAGEWQoDAqAKMAgCAQACAwehIKEK
// SIG // MAgCAQACAwGGoDANBgkqhkiG9w0BAQUFAAOBgQBEVjw9
// SIG // VyuuRlbrEVsfgZ2lAgtQJfLmB+Iqfff+FSqnMxSIgMi6
// SIG // bQkOAujZVQ0GalaFzy+wmS0qsuK8dQjd5p4m9UbqwlWs
// SIG // YYfyb8JXVtKbz2jINxezfj4TOux0JPhd05YWobyxGE2O
// SIG // aKuM3qL0zVXT/YydWX0WhwvKxJi6d2mxoDGCBA0wggQJ
// SIG // AgEBMIGTMHwxCzAJBgNVBAYTAlVTMRMwEQYDVQQIEwpX
// SIG // YXNoaW5ndG9uMRAwDgYDVQQHEwdSZWRtb25kMR4wHAYD
// SIG // VQQKExVNaWNyb3NvZnQgQ29ycG9yYXRpb24xJjAkBgNV
// SIG // BAMTHU1pY3Jvc29mdCBUaW1lLVN0YW1wIFBDQSAyMDEw
// SIG // AhMzAAABqwkJ76tj1OipAAEAAAGrMA0GCWCGSAFlAwQC
// SIG // AQUAoIIBSjAaBgkqhkiG9w0BCQMxDQYLKoZIhvcNAQkQ
// SIG // AQQwLwYJKoZIhvcNAQkEMSIEINZ3zKo45cGzWjD1uALM
// SIG // un+oDMJ4cumMQmAk0YF+QXBWMIH6BgsqhkiG9w0BCRAC
// SIG // LzGB6jCB5zCB5DCBvQQgDhyv+rCFYBFUlQ9wK75OjskC
// SIG // r0cRRysq2lM2zdfwClcwgZgwgYCkfjB8MQswCQYDVQQG
// SIG // EwJVUzETMBEGA1UECBMKV2FzaGluZ3RvbjEQMA4GA1UE
// SIG // BxMHUmVkbW9uZDEeMBwGA1UEChMVTWljcm9zb2Z0IENv
// SIG // cnBvcmF0aW9uMSYwJAYDVQQDEx1NaWNyb3NvZnQgVGlt
// SIG // ZS1TdGFtcCBQQ0EgMjAxMAITMwAAAasJCe+rY9ToqQAB
// SIG // AAABqzAiBCCQwoh7D6UWLEhXxUrE2xczvVqnPji6NIjR
// SIG // a1cUnb/IvjANBgkqhkiG9w0BAQsFAASCAgCNYWSmgwrg
// SIG // t7ND3d8d79gUJ72VBfBfEKcCnzAbW4nHXsmCqz0OzpoL
// SIG // RTcZBQ0H+xeYteELbSbJ5PMVZA9pORuxYW6lmFwK2es7
// SIG // n6Rkar01nNn5rBFydsq11iZdsZJX1yTfHXmCNxic82I0
// SIG // e4xhQH/P98z/R8AnoTOlg144x1n9+/EgiDKlF238hv6h
// SIG // n/uaOdm1iqJ2+v43qTVrKu8yJOe3jwJJLwspc58bxcs4
// SIG // ehImj8u3ORz+G3tqDYXgX73OTuGMhWDRbuo5NVteCeMG
// SIG // PsIV2HRvtQ1EIzUqcosC8bQi+yOyLURzW/12ucX3GVWG
// SIG // wL1f8OG5Q/pAL05CBFlkHQES6JTsiqOsVs6VirCosqMv
// SIG // kGQOBR4H+r3PbEc/RG2Ydo7udfdffrJtcCub8xOmhLON
// SIG // UbyK0Uxb8n8FBPNthrRWqO7qwcWO7RmOGiVA2NK4C9KW
// SIG // cDy70vAReTeiFsB3oQazXIKRmZ2gzD8ywzlvjXU5pZl+
// SIG // cYvgjKtSRCmv3IecpcUl6ZD8jfROUkOQ4UrFP5JSwOkT
// SIG // jEAfe0edMSASNLXWmeMkWaxM1iqagpq13k2fll4QPWAP
// SIG // FP+NtajJ1ez0DsNoPXV9RwaXXnm2ebISYZkKMft6FMk1
// SIG // 4Vdc1nkcPdUIakZ73C/t63gGZvesKStlC1Rfsq6IyRwK
// SIG // zmCEM85VzniwAw==
// SIG // End signature block
