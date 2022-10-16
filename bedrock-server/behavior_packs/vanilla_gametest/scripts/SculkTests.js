import * as GameTest from "mojang-gametest";
import { BlockLocation, BlockProperties, MinecraftBlockTypes, TicksPerSecond } from "mojang-minecraft";
import GameTestExtensions from "./GameTestExtensions.js";

const TEST_PADDING = 5;

function spreadFromBlockOrAssert(test, sculkSpreader, spreaderPos, sculkBlockType, sculkBlockPos, charge) {
    test.assertBlockPresent(sculkBlockType, sculkBlockPos);
    const cursorOffset = new BlockLocation(
        sculkBlockPos.x - spreaderPos.x,
        sculkBlockPos.y - spreaderPos.y,
        sculkBlockPos.z - spreaderPos.z);
    sculkSpreader.addCursorsWithOffset(cursorOffset, charge);
}

function placeSculkAndSpread(test, sculkSpreader, spreaderPos, pos, charge) {
    test.setBlockType(MinecraftBlockTypes.sculk, pos);
    spreadFromBlockOrAssert(test, sculkSpreader, spreaderPos, MinecraftBlockTypes.sculk, pos, charge);
}

function placeSculkVeinAndSpread(test, sculkSpreader, spreaderPos, pos, faceMask, charge) {
    let downFacingSculkVeinBlock = MinecraftBlockTypes.sculkVein.createDefaultBlockPermutation();
    downFacingSculkVeinBlock.getProperty(BlockProperties.multiFaceDirectionBits).value = faceMask;
    test.setBlockPermutation(downFacingSculkVeinBlock, pos);
    spreadFromBlockOrAssert(test, sculkSpreader, spreaderPos, MinecraftBlockTypes.sculkVein, pos, charge);
}

GameTest.register("SculkTests", "spread", (test) => {
    const spawnPos = new BlockLocation(2, 5, 2);
    test.spawn("minecraft:creeper", spawnPos).kill();

    test.succeedWhen(() => {
        test.assertBlockPresent(MinecraftBlockTypes.sculk, new BlockLocation(2, 4, 2));
        test.assertBlockPresent(MinecraftBlockTypes.sculk, new BlockLocation(3, 4, 2));
        test.assertBlockPresent(MinecraftBlockTypes.sculk, new BlockLocation(2, 4, 3));
        test.assertBlockPresent(MinecraftBlockTypes.sculk, new BlockLocation(1, 4, 2));
        test.assertBlockPresent(MinecraftBlockTypes.sculk, new BlockLocation(2, 4, 1));
    });
})
    .maxTicks(TicksPerSecond * 10)
    .padding(TEST_PADDING)
    .tag(GameTest.Tags.suiteDefault);

GameTest.register("SculkTests", "spread_path", (test) => {
    const spawnPos = new BlockLocation(0, 5, 1);
    test.spawn("minecraft:guardian", spawnPos).kill();

    test.succeedWhen(() => {
        test.assertBlockPresent(MinecraftBlockTypes.sculkVein, new BlockLocation(4, 5, 1));
        test.assertBlockPresent(MinecraftBlockTypes.sculk, new BlockLocation(4, 4, 2));
        test.assertBlockPresent(MinecraftBlockTypes.stone, new BlockLocation(4, 4, 1));
    });
})
    .maxTicks(TicksPerSecond * 10)
    .padding(TEST_PADDING)
    .tag(GameTest.Tags.suiteDefault);

GameTest.register("SculkTests", "spread_path_restricted", (test) => {
    const spawnPos = new BlockLocation(1, 5, 1);
    test.spawn("minecraft:creeper", spawnPos).kill();

    test.succeedWhen(() => {
        test.assertBlockPresent(MinecraftBlockTypes.sculk, new BlockLocation(3, 4, 3));
    });
})
    .maxTicks(TicksPerSecond * 10)
    .padding(TEST_PADDING)
    .tag(GameTest.Tags.suiteDefault);

GameTest.register("SculkTests", "spread_uneven", (test) => {
    const MIN_CONSUMED_BLOCKS_COUNT = 25;
    const MAX_RESIDUAL_CHARGE = 5;
    const INITIAL_CHARGE_SMALL = 5;
    const INITIAL_CHARGE_BIG = 30;

    const sculkCatalystPos = new BlockLocation(2, 3, 2);
    const sculkSpreader = test.getSculkSpreader(sculkCatalystPos);
    test.assert(sculkSpreader !== undefined, "No Sculk Spreader has been retrieved!");

    const spreadStartPos1 = new BlockLocation(0, 4, 0);
    placeSculkVeinAndSpread(test, sculkSpreader, sculkCatalystPos, spreadStartPos1, /* faceMask (down) = */ 1, INITIAL_CHARGE_SMALL);
    const spreadStartPos2 = new BlockLocation(4, 4, 4);
    placeSculkVeinAndSpread(test, sculkSpreader, sculkCatalystPos, spreadStartPos2, /* faceMask (down) = */ 1, INITIAL_CHARGE_BIG);

    test.succeedWhen(() => {
        var sculkCount = 0;
        for (var x = 0; x < 5; ++x) {
            for (var y = 0; y < 5; ++y) {
                for (var z = 0; z < 5; ++z) {
                    if (test.getBlock(new BlockLocation(x, y, z)).id ===  "minecraft:sculk") {
                        ++sculkCount;
                    }
                }
            }
        };

        test.assert(sculkCount >= MIN_CONSUMED_BLOCKS_COUNT, "Spreading was not successful! Just " + sculkCount + " sculk blocks were placed!");
        test.assert(sculkSpreader.getTotalCharge() <= MAX_RESIDUAL_CHARGE, "Residual charge of " + sculkSpreader.getTotalCharge() + " is too high!");
    });
})
    .maxTicks(TicksPerSecond * 10)
    .maxAttempts(5)
    .padding(TEST_PADDING)
    .tag(GameTest.Tags.suiteDefault);

GameTest.register("SculkTests", "spread_uneven_overcharged", (test) => {
    const MIN_CONSUMED_BLOCKS_COUNT = 25;
    const MIN_RESIDUAL_CHARGE = 25;
    const INITIAL_CHARGE = 30;

    const sculkCatalystPos = new BlockLocation(2, 3, 2);
    const sculkSpreader = test.getSculkSpreader(sculkCatalystPos);
    test.assert(sculkSpreader !==  undefined, "No Sculk Spreader has been retrieved!");

    const spreadStartPos1 = new BlockLocation(0, 4, 0);
    placeSculkVeinAndSpread(test, sculkSpreader, sculkCatalystPos, spreadStartPos1, /* faceMask (down) = */ 1, INITIAL_CHARGE);
    const spreadStartPos2 = new BlockLocation(4, 4, 4);
    placeSculkVeinAndSpread(test, sculkSpreader, sculkCatalystPos, spreadStartPos2, /* faceMask (down) = */ 1, INITIAL_CHARGE);

    test.succeedWhen(() => {
        var sculkCount = 0;
        for (var x = 0; x < 5; ++x) {
            for (var y = 0; y < 5; ++y) {
                for (var z = 0; z < 5; ++z) {
                    if (test.getBlock(new BlockLocation(x, y, z)).id ===  "minecraft:sculk") {
                        ++sculkCount;
                    }
                }
            }
        };

        test.assert(sculkCount >= MIN_CONSUMED_BLOCKS_COUNT, "Spreading was not successful! Just " + sculkCount + " sculk blocks were placed!");
        test.assert(sculkSpreader.getTotalCharge() >= MIN_RESIDUAL_CHARGE, "Residual charge of " + sculkSpreader.getTotalCharge() + " is too low!");
    });
})
    .maxTicks(TicksPerSecond * 10)
    .maxAttempts(5)
    .padding(TEST_PADDING)
    .tag(GameTest.Tags.suiteDefault);

GameTest.register("SculkTests", "spread_stairway_up", (test) => {
    const CONSUMABLE_BLOCKS_COUNT = 15;
    const INITIAL_CHARGE = CONSUMABLE_BLOCKS_COUNT;

    const sculkCatalystPos = new BlockLocation(2, 2, 2);
    const sculkSpreader = test.getSculkSpreader(sculkCatalystPos);
    test.assert(sculkSpreader !==  undefined, "No Sculk Spreader has been retrieved!");

    const spreadStartPos = new BlockLocation(0, 3, -1);
    placeSculkVeinAndSpread(test, sculkSpreader, sculkCatalystPos, spreadStartPos, /* faceMask (south) = */ 1 << 2, INITIAL_CHARGE);

    test.succeedWhen(() => {
        test.assertBlockPresent(MinecraftBlockTypes.dirt, new BlockLocation(1, 4, 3));
        test.assertBlockPresent(MinecraftBlockTypes.dirt, new BlockLocation(1, 10, 3));
        test.assertBlockPresent(MinecraftBlockTypes.dirt, new BlockLocation(3, 14, 1));
        test.assertBlockPresent(MinecraftBlockTypes.sculk, new BlockLocation(0, 17, 0));
    });
})
    .maxTicks(TicksPerSecond * 10)
    .padding(TEST_PADDING)
    .tag(GameTest.Tags.suiteDefault);

GameTest.register("SculkTests", "spread_stairway_up_unsupported", (test) => {
    const CONSUMABLE_BLOCKS_COUNT = 15;
    const INITIAL_CHARGE = CONSUMABLE_BLOCKS_COUNT;

    const sculkCatalystPos = new BlockLocation(2, 2, 2);
    const sculkSpreader = test.getSculkSpreader(sculkCatalystPos);
    test.assert(sculkSpreader !==  undefined, "No Sculk Spreader has been retrieved!");

    const spreadStartPos = new BlockLocation(0, 3, -1);
    placeSculkVeinAndSpread(test, sculkSpreader, sculkCatalystPos, spreadStartPos, /* faceMask (south) = */ 1 << 2, INITIAL_CHARGE);

    test.succeedWhen(() => {
        test.assertBlockPresent(MinecraftBlockTypes.dirt, new BlockLocation(1, 4, 3));
        test.assertBlockPresent(MinecraftBlockTypes.dirt, new BlockLocation(1, 10, 3));
        test.assertBlockPresent(MinecraftBlockTypes.dirt, new BlockLocation(3, 14, 1));
        test.assertBlockPresent(MinecraftBlockTypes.sculk, new BlockLocation(0, 17, 0));
    });
})
    .maxTicks(TicksPerSecond * 10)
    .padding(TEST_PADDING)
    .tag(GameTest.Tags.suiteDefault);

GameTest.register("SculkTests", "spread_stairway_down", (test) => {
    const CONSUMABLE_BLOCKS_COUNT = 15;
    const INITIAL_CHARGE = CONSUMABLE_BLOCKS_COUNT;

    const sculkCatalystPos = new BlockLocation(2, 17, 2);
    const sculkSpreader = test.getSculkSpreader(sculkCatalystPos);
    test.assert(sculkSpreader !==  undefined, "No Sculk Spreader has been retrieved!");

    const spreadStartPos = new BlockLocation(0, 17, -1);
    placeSculkVeinAndSpread(test, sculkSpreader, sculkCatalystPos, spreadStartPos, /* faceMask (south) = */ 1 << 2, INITIAL_CHARGE);

    test.succeedWhen(() => {
        test.assertBlockPresent(MinecraftBlockTypes.dirt, new BlockLocation(1, 4, 3));
        test.assertBlockPresent(MinecraftBlockTypes.dirt, new BlockLocation(1, 10, 3));
        test.assertBlockPresent(MinecraftBlockTypes.dirt, new BlockLocation(3, 14, 1));
        test.assertBlockPresent(MinecraftBlockTypes.sculk, new BlockLocation(0, 3, 0));
    });
})
    .maxTicks(TicksPerSecond * 10)
    .padding(TEST_PADDING)
    .tag(GameTest.Tags.suiteDefault);

GameTest.register("SculkTests", "spread_pillar_up", (test) => {
    const CONSUMABLE_BLOCKS_COUNT = 12;
    const INITIAL_CHARGE = CONSUMABLE_BLOCKS_COUNT - 1;

    const sculkCatalystPos = new BlockLocation(2, 2, 2);
    const sculkSpreader = test.getSculkSpreader(sculkCatalystPos);
    test.assert(sculkSpreader !==  undefined, "No Sculk Spreader has been retrieved!");

    const spreadStartPos = new BlockLocation(2, 4, 1);
    placeSculkVeinAndSpread(test, sculkSpreader, sculkCatalystPos, spreadStartPos, /* faceMask (south) = */ 1 << 2, INITIAL_CHARGE);

    test.succeedWhen(() => {
        test.assertBlockPresent(MinecraftBlockTypes.sculk, new BlockLocation(2, 14, 2));
        test.assertBlockPresent(MinecraftBlockTypes.dirt, new BlockLocation(2, 15, 2));
    });
})
    .maxTicks(TicksPerSecond * 10)
    .padding(TEST_PADDING)
    .tag(GameTest.Tags.suiteDefault);

GameTest.register("SculkTests", "vein_consume_blocks", (test) => {
    const TEST_AREA_SIZE_X = 10;
    const TEST_AREA_SIZE_Z = 5;
    const CONSUME_ROW_DELAY = TEST_AREA_SIZE_X * 2;
    const CONSUME_ROW_CHARGE = TEST_AREA_SIZE_X;

    const sculkCatalystPos = new BlockLocation(4, 2, 2);
    test.assertBlockPresent(MinecraftBlockTypes.sculkCatalyst, sculkCatalystPos);
    const sculkSpreader = test.getSculkSpreader(sculkCatalystPos);
    test.assert(sculkSpreader !==  undefined, "No Sculk Spreader has been retrieved!");

    placeSculkVeinAndSpread(test, sculkSpreader, sculkCatalystPos, new BlockLocation(0, 4, 0), /* faceMask (down) = */ 1, CONSUME_ROW_CHARGE);
    placeSculkVeinAndSpread(test, sculkSpreader, sculkCatalystPos, new BlockLocation(0, 2, 1), /* faceMask (up) = */ 1 << 1, CONSUME_ROW_CHARGE);
    placeSculkVeinAndSpread(test, sculkSpreader, sculkCatalystPos, new BlockLocation(0, 4, 2), /* faceMask (down) = */ 1, CONSUME_ROW_CHARGE);
    placeSculkVeinAndSpread(test, sculkSpreader, sculkCatalystPos, new BlockLocation(0, 2, 3), /* faceMask (up) = */ 1 << 1, CONSUME_ROW_CHARGE);
    placeSculkVeinAndSpread(test, sculkSpreader, sculkCatalystPos, new BlockLocation(0, 4, 4), /* faceMask (down) = */ 1, CONSUME_ROW_CHARGE);

    test.startSequence().thenExecuteAfter(CONSUME_ROW_DELAY, () => {
        for (var x = 0; x < TEST_AREA_SIZE_X; x++) {
            for (var z = 0; z < TEST_AREA_SIZE_Z; z++) {
                const testPos = new BlockLocation(x, 3, z);
                var blockID = test.getBlock(testPos).type.id.valueOf();
                test.assert(blockID ===  "minecraft:sculk", blockID + " is expected to be consumed by sculk.");
            }
        }
    }).thenSucceed();
})
    .padding(TEST_PADDING)
    .tag(GameTest.Tags.suiteDefault);

GameTest.register("SculkTests", "vein_spread_blocks", (test) => {
    test.spawn("minecraft:creeper", new BlockLocation(2, 4, 2)).kill();
    test.spawn("minecraft:creeper", new BlockLocation(0, 4, 0)).kill();
    test.spawn("minecraft:creeper", new BlockLocation(0, 4, 4)).kill();
    test.spawn("minecraft:creeper", new BlockLocation(4, 4, 0)).kill();
    test.spawn("minecraft:creeper", new BlockLocation(4, 4, 4)).kill();
    test.spawn("minecraft:creeper", new BlockLocation(2, 4, 0)).kill();
    test.spawn("minecraft:creeper", new BlockLocation(0, 4, 2)).kill();
    test.spawn("minecraft:creeper", new BlockLocation(4, 4, 2)).kill();
    test.spawn("minecraft:creeper", new BlockLocation(2, 4, 4)).kill();

    test.succeedWhen(() => {
        for (var x = 0; x < 5; ++x) {
            for (var z = 0; z < 5; ++z) {
                const isSculk = test.getBlock(new BlockLocation(x, 3, z)).id ===  "minecraft:sculk" || test.getBlock(new BlockLocation(x, 4, z)).id ===  "minecraft:sculk_vein";
                test.assert(isSculk, "Sculk failed to spread to [" + x + ", " + z + "]!");
            }
        };
    });
})
    .maxTicks(TicksPerSecond * 10)
    .padding(TEST_PADDING)
    .tag(GameTest.Tags.suiteDefault);

GameTest.register("SculkTests", "vein_spread_blocks_replaceable", (test) => {
    test.spawn("minecraft:creeper", new BlockLocation(1, 3, 1)).kill();
    test.spawn("minecraft:creeper", new BlockLocation(1, 3, 3)).kill();
    test.spawn("minecraft:creeper", new BlockLocation(4, 3, 1)).kill();
    test.spawn("minecraft:creeper", new BlockLocation(4, 3, 3)).kill();
    test.spawn("minecraft:creeper", new BlockLocation(6, 3, 1)).kill();
    test.spawn("minecraft:creeper", new BlockLocation(6, 3, 3)).kill();
    test.spawn("minecraft:creeper", new BlockLocation(9, 3, 1)).kill();
    test.spawn("minecraft:creeper", new BlockLocation(9, 3, 3)).kill();

    test.succeedWhen(() => {
        test.assertBlockPresent(MinecraftBlockTypes.sculk, new BlockLocation(1, 2, 1));
        test.assertBlockPresent(MinecraftBlockTypes.sculk, new BlockLocation(1, 2, 3));
        test.assertBlockPresent(MinecraftBlockTypes.sculk, new BlockLocation(3, 2, 1));
        test.assertBlockPresent(MinecraftBlockTypes.sculk, new BlockLocation(3, 2, 3));
        test.assertBlockPresent(MinecraftBlockTypes.sculk, new BlockLocation(7, 2, 1));
        test.assertBlockPresent(MinecraftBlockTypes.sculk, new BlockLocation(7, 2, 3));
        test.assertBlockPresent(MinecraftBlockTypes.sculk, new BlockLocation(9, 2, 1));
        test.assertBlockPresent(MinecraftBlockTypes.sculk, new BlockLocation(9, 2, 3));
    });
})
    .padding(TEST_PADDING)
    .tag(GameTest.Tags.suiteDefault);

GameTest.register("SculkTests", "vein_non_spread_blocks", (test) => {
    test.spawn("minecraft:creeper", new BlockLocation(1, 4, 1)).kill();
    test.spawn("minecraft:creeper", new BlockLocation(1, 4, 3)).kill();
    test.spawn("minecraft:creeper", new BlockLocation(3, 4, 1)).kill();
    test.spawn("minecraft:creeper", new BlockLocation(3, 4, 3)).kill();

    // We need a delay to check if veins spread more then expected, otherwise the
    // test will succeed the moment the expected amount of veins has been placed.
    test.succeedOnTickWhen(TicksPerSecond * 2, () => {
        var sculkVeinCount = 0;
        for (var x = 0; x < 5; ++x) {
            for (var z = 0; z < 5; ++z) {
                if (test.getBlock(new BlockLocation(x, 4, z)).id ===  "minecraft:sculk_vein") {
                    ++sculkVeinCount;
                }
            }
        };
        test.assert(sculkVeinCount ===  4, "Only 4 veins where expected to be placed, one for each mob death position!");
    });
})
    .padding(TEST_PADDING)
    .tag(GameTest.Tags.suiteDefault);

GameTest.register("SculkTests", "vein_non_spread_fire", (test) => {
    test.spawn("minecraft:creeper", new BlockLocation(1, 3, 1)).kill();
    test.spawn("minecraft:creeper", new BlockLocation(1, 3, 3)).kill();
    test.spawn("minecraft:creeper", new BlockLocation(3, 3, 1)).kill();
    test.spawn("minecraft:creeper", new BlockLocation(3, 3, 3)).kill();

    test.startSequence().thenExecuteFor(TicksPerSecond * 2, () => {
        test.assertBlockPresent(MinecraftBlockTypes.fire, new BlockLocation(1, 3, 3));
        test.assertBlockPresent(MinecraftBlockTypes.fire, new BlockLocation(4, 3, 3));
        test.assertBlockPresent(MinecraftBlockTypes.soulFire, new BlockLocation(1, 3, 1));
        test.assertBlockPresent(MinecraftBlockTypes.soulFire, new BlockLocation(4, 3, 1));
    }).thenSucceed();
})
    .padding(TEST_PADDING)
    .tag(GameTest.Tags.suiteDefault);

// Tests that no sculk vein is placed on a catalyst if a mob dies on top of it.
GameTest.register("SculkTests", "vein_non_spread_catalyst", (test) => {
    const spawnPos = new BlockLocation(2, 3, 2);
    test.spawn("minecraft:creeper", spawnPos).kill();

    test.startSequence().thenExecuteFor(TicksPerSecond * 2, () => {
        test.assertBlockPresent(MinecraftBlockTypes.air, spawnPos);
    }).thenSucceed();
})
    .padding(TEST_PADDING)
    .tag(GameTest.Tags.suiteDefault);

GameTest.register("SculkTests", "spread_under_water", (test) => {
    const INITIAL_CHARGE = 30;

    const sculkCatalystPos = new BlockLocation(2, 7, 2);
    test.assertBlockPresent(MinecraftBlockTypes.sculkCatalyst, sculkCatalystPos);
    const sculkSpreader = test.getSculkSpreader(sculkCatalystPos);
    test.assert(sculkSpreader !==  undefined, "No Sculk Spreader has been retrieved!");

    const spreadStartPos = new BlockLocation(3, 6, 3);
    placeSculkVeinAndSpread(test, sculkSpreader, sculkCatalystPos, spreadStartPos, /* faceMask (down) = */ 1, INITIAL_CHARGE);

    test.succeedWhen(() => {
        test.assertBlockPresent(MinecraftBlockTypes.sculk, new BlockLocation(2, 4, 2));
    })
})
    .maxTicks(TicksPerSecond * 10)
    .padding(TEST_PADDING)
    .tag(GameTest.Tags.suiteDefault);

GameTest.register("SculkTests", "vein_non_place_blocks", (test) => {
    const sculkCatalystPos = new BlockLocation(2, 2, 2);
    test.assertBlockPresent(MinecraftBlockTypes.sculkCatalyst, sculkCatalystPos);
    const sculkSpreader = test.getSculkSpreader(sculkCatalystPos);
    test.assert(sculkSpreader !==  undefined, "No Sculk Spreader has been retrieved!");

    test.spawn("minecraft:creeper", new BlockLocation(1, 30, 2));
    test.spawn("minecraft:creeper", new BlockLocation(2, 30, 1));
    test.spawn("minecraft:creeper", new BlockLocation(2, 30, 3));
    test.spawn("minecraft:creeper", new BlockLocation(3, 30, 2));

    test.startSequence().thenExecuteAfter(TicksPerSecond * 4, () => {
        var testPos = new BlockLocation(0, 0, 0);
        for (var y = 2; y < 5; y++) {
            for (var x = 0; x < 5; x++) {
                for (var z = 0; z < 5; z++) {
                    testPos = new BlockLocation(x, y, z);
                    var blockID = test.getBlock(testPos).type.id.valueOf();
                    test.assert(blockID !==  "minecraft:sculk", "Sculk should not have spread.");
                    test.assert(blockID !==  "minecraft:sculk_vein", "Sculk Vein should not have spread.");
                }
            }
        }
    }).thenSucceed();
})
    .maxTicks(TicksPerSecond * 10)
    .padding(TEST_PADDING)
    .tag(GameTest.Tags.suiteDefault);

GameTest.register("SculkTests", "charge_cap", (test) => {
    const MERGEABLE_EXPERIENCE_AMOUNT = 25;

    const sculkCatalystPos = new BlockLocation(2, 2, 2);
    test.assertBlockPresent(MinecraftBlockTypes.sculkCatalyst, sculkCatalystPos);
    const sculkSpreader = test.getSculkSpreader(sculkCatalystPos);
    test.assert(sculkSpreader !==  undefined, "No Sculk Spreader has been retrieved!");

    const mobSpawnLocation = new BlockLocation(2, 4, 2);
    test.spawn("minecraft:creeper", mobSpawnLocation).kill();
    spreadFromBlockOrAssert(test, sculkSpreader, sculkCatalystPos, MinecraftBlockTypes.sculk, new BlockLocation(2, 3, 2), sculkSpreader.maxCharge - MERGEABLE_EXPERIENCE_AMOUNT);

    test.startSequence().thenExecuteAfter(2, () => {
        test.assert(sculkSpreader.getNumberOfCursors() ===  1, "Charges should merge up to maximum.");
        test.spawn("minecraft:creeper", mobSpawnLocation).kill();
        test.spawn("minecraft:creeper", mobSpawnLocation).kill();
        test.spawn("minecraft:creeper", mobSpawnLocation).kill();
        test.spawn("minecraft:creeper", mobSpawnLocation).kill();
    }).thenExecuteAfter(2, () => {
        test.assert(sculkSpreader.getNumberOfCursors() ===  1, "Charges should merge up to maximum.");
        test.spawn("minecraft:creeper", mobSpawnLocation).kill();
        test.spawn("minecraft:creeper", mobSpawnLocation).kill();
        test.spawn("minecraft:creeper", mobSpawnLocation).kill();
        test.spawn("minecraft:creeper", mobSpawnLocation).kill();
    }).thenExecuteAfter(2, () => {
        test.assert(sculkSpreader.getNumberOfCursors() ===  2, "Charges should not merge above maximum.");
    }).thenSucceed();

})
    .padding(TEST_PADDING)
    .tag(GameTest.Tags.suiteDefault);

// Tests that on an experienceless mob death, a catalyst blooms but does not get a cursor.
GameTest.register("SculkTests", "catalyst_no_xp_death", (test) => {
    const sculkCatalystPos = new BlockLocation(2, 2, 2);
    test.assertBlockPresent(MinecraftBlockTypes.sculkCatalyst, sculkCatalystPos);
    const sculkSpreader = test.getSculkSpreader(sculkCatalystPos);
    test.assert(sculkSpreader !==  undefined, "No Sculk Spreader has been retrieved!");

    const mobSpawnLocation = sculkCatalystPos.offset(0, 1, 0);
    test.spawn("minecraft:villager_v2<minecraft:spawn_farmer>", mobSpawnLocation).kill();

    test.startSequence().thenExecuteAfter(2, () => {
        const numberOfCursors = sculkSpreader.getNumberOfCursors();
        test.assert(numberOfCursors ===  0, "Expected total number of cursors to be 0. Actual amount: " + numberOfCursors);
        const testEx = new GameTestExtensions(test);
        testEx.assertBlockProperty("bloom", 1, sculkCatalystPos);
    }).thenSucceed();
})
    .padding(TEST_PADDING)
    .tag(GameTest.Tags.suiteDefault);

// Tests that on mob death, only the closest catalyst gets a cursor.
GameTest.register("SculkTests", "multiple_catalysts_one_death", (test) => {
    const catalystPositions = [
        new BlockLocation(0, 2, 0),
        new BlockLocation(4, 2, 0),
        new BlockLocation(4, 2, 4),
        new BlockLocation(0, 2, 4)];

    catalystPositions.forEach(location => test.assert(test.getSculkSpreader(location) !==  undefined, "Failed to find sculk catalyst."));

    const closestCatalystPosition = catalystPositions[0];
    const mobSpawnLocation = closestCatalystPosition.offset(0, 2, 0);
    test.spawn("minecraft:creeper", mobSpawnLocation).kill();

    test.startSequence().thenExecuteAfter(2, () => {
        let numberOfCursors = 0;
        catalystPositions.forEach(position => numberOfCursors += test.getSculkSpreader(position).getNumberOfCursors());
        test.assert(numberOfCursors ===  1, "Expected total number of cursors to be 1. Actual amount: " + numberOfCursors);
        const closestCatalystCursors = test.getSculkSpreader(closestCatalystPosition).getNumberOfCursors();
        test.assert(closestCatalystCursors ===  1, "Expected the closest sculk catalyst to get the cursor.");
    }).thenSucceed();
})
    .padding(TEST_PADDING)
    .tag(GameTest.Tags.suiteDefault);

// Tests that on mob death, only the closest catalyst gets a cursor. In this case, a mob dies on top
// of each one of the four catalysts, resulting in four cursors being created, one per catalyst.
GameTest.register("SculkTests", "multiple_catalysts_multiple_deaths", (test) => {
    const catalystPositions = [
        new BlockLocation(0, 2, 0),
        new BlockLocation(4, 2, 0),
        new BlockLocation(4, 2, 4),
        new BlockLocation(0, 2, 4)];

    catalystPositions.forEach(location => {
        test.assert(test.getSculkSpreader(location) !==  undefined, "Failed to find sculk catalyst.");
        test.spawn("minecraft:creeper", location.offset(0, 2, 0)).kill();
    });

    test.startSequence().thenExecuteAfter(2, () => {
        let numberOfCursors = 0;
        catalystPositions.forEach(position => numberOfCursors += test.getSculkSpreader(position).getNumberOfCursors());
        test.assert(numberOfCursors ===  4, "Expected total number of cursors to be 4. Actual amount: " + numberOfCursors);
    }).thenSucceed();
})
    .padding(TEST_PADDING)
    .tag(GameTest.Tags.suiteDefault);

GameTest.register("SculkTests", "charge_decay_sculk", (test) => {
    const INITIAL_CHARGE = 20;
    const FINAL_CHARGE = 19;

    const sculkCatalystPos = new BlockLocation(2, 2, 2);
    const sculkSpreader = test.getSculkSpreader(sculkCatalystPos);
    test.assert(sculkSpreader !==  undefined, "No Sculk Spreader has been retrieved!");

    spreadFromBlockOrAssert(test, sculkSpreader, sculkCatalystPos, MinecraftBlockTypes.sculk, new BlockLocation(2, 4, 2), INITIAL_CHARGE);

    test.succeedWhen(() => {
        const totalCharge = sculkSpreader.getTotalCharge();
        test.assert(totalCharge ===  FINAL_CHARGE, "Charge should drop to " + FINAL_CHARGE + ". Total charge: " + totalCharge);
    });
})
    .maxAttempts(5)
    .maxTicks(TicksPerSecond * 20)
    .padding(TEST_PADDING)
    .tag(GameTest.Tags.suiteDefault);

GameTest.register("SculkTests", "charge_decay_sculk_vein", (test) => {
    const INITIAL_CHARGE = 20;
    const FINAL_CHARGE = 0;

    const sculkCatalystPos = new BlockLocation(2, 2, 2);
    const sculkSpreader = test.getSculkSpreader(sculkCatalystPos);
    test.assert(sculkSpreader !==  undefined, "No Sculk Spreader has been retrieved!");

    const spreadStartPos = new BlockLocation(2, 6, 2);
    placeSculkVeinAndSpread(test, sculkSpreader, sculkCatalystPos, spreadStartPos, /* faceMask (down) = */ 1, INITIAL_CHARGE);

    test.succeedWhen(() => {
        const totalCharge = sculkSpreader.getTotalCharge();
        test.assert(totalCharge ===  FINAL_CHARGE, "Charge should drop to " + FINAL_CHARGE + ". Total charge: " + totalCharge);
    });
})
    .maxAttempts(5)
    .maxTicks(TicksPerSecond * 20)
    .padding(TEST_PADDING)
    .tag(GameTest.Tags.suiteDefault);

GameTest.register("SculkTests", "sculk_growth_spawning", (test) => {
    const INITIAL_CHARGE = 100;

    const sculkCatalystPos = new BlockLocation(4, 4, 2);
    test.assertBlockPresent(MinecraftBlockTypes.sculkCatalyst, sculkCatalystPos);
    const sculkSpreader = test.getSculkSpreader(sculkCatalystPos);
    test.assert(sculkSpreader !==  undefined, "No Sculk Spreader has been retrieved!");

    for (var z = 1; z < 4; z++) {
        const spreadStartPos = new BlockLocation(1, 4, z);
        placeSculkAndSpread(test, sculkSpreader, sculkCatalystPos, spreadStartPos, INITIAL_CHARGE);
    }

    test.succeedOnTickWhen(TicksPerSecond * 20, () => {
        var position = new BlockLocation(0, 0, 0);

        var farGrowths = 0;
        for (var x = 8; x < 14; x++) {
            for (var z = 1; z < 4; z++) {
                position = new BlockLocation(x, 5, z);
                var blockID = test.getBlock(position).type.id.valueOf();
                var worldBlockLocation = test.worldBlockLocation(position);
                if (blockID === "minecraft:sculk_sensor" || blockID === "minecraft:sculk_shrieker") {
                    farGrowths++;
                }
            }
        }

        test.assert(farGrowths > 1, "At least 2 growths should have spawned from the catalyst. Number spawned: " + farGrowths);

        var nearGrowths = 0;
        for (var x = 1; x < 8; x++) {
            for (var z = 1; z < 4; z++) {
                position = new BlockLocation(x, 5, z);
                var blockID = test.getBlock(position).type.id.valueOf();
                if (blockID === "minecraft:sculk_sensor" || blockID === "minecraft:sculk_shrieker") {
                    nearGrowths++;
                }
            }
        }

        test.assert(nearGrowths ===  0, "No growths should have spawned near the catalyst.");
    });
})
    .maxTicks(TicksPerSecond * 40)
    .maxAttempts(5)
    .padding(TEST_PADDING)
    .tag(GameTest.Tags.suiteDefault);

GameTest.register("SculkTests", "charge_forced_direction", (test) => {
    const INITIAL_CHARGE = 25;

    const sculkCatalystPos = new BlockLocation(2, 2, 2);
    const sculkSpreader = test.getSculkSpreader(sculkCatalystPos);
    test.assert(sculkSpreader !==  undefined, "No Sculk Spreader has been retrieved!");

    spreadFromBlockOrAssert(test, sculkSpreader, sculkCatalystPos, MinecraftBlockTypes.sculk, new BlockLocation(1, 3, 2), INITIAL_CHARGE);
    spreadFromBlockOrAssert(test, sculkSpreader, sculkCatalystPos, MinecraftBlockTypes.sculk, new BlockLocation(1, 13, 2), INITIAL_CHARGE);

    test.startSequence().thenExecuteAfter(TicksPerSecond * 1, () => {
        const expected = [
            new BlockLocation(1, 7, 2),
            new BlockLocation(1, 9, 2)];
        const actual = [
            test.relativeBlockLocation(sculkSpreader.getCursorPosition(0)),
            test.relativeBlockLocation(sculkSpreader.getCursorPosition(1))];

        test.assert(expected[0].equals(actual[0]),
            "Expected charge ends up on on (" + expected[0].x + ", " + expected[0].y + ", " + expected[0].z + "), not (" + actual[0].x + ", " + actual[0].y + ", " + actual[0].z + ").");
        test.assert(expected[1].equals(actual[1]),
            "Expected charge ends up on on (" + expected[1].x + ", " + expected[1].y + ", " + expected[1].z + "), not (" + actual[1].x + ", " + actual[1].y + ", " + actual[1].z + ").");
    }).thenSucceed();
})
    .padding(TEST_PADDING)
    .tag(GameTest.Tags.suiteDefault);

GameTest.register("SculkTests", "charge_redirection", (test) => {
    const INITIAL_CHARGE = 100;

    const sculkCatalystPos = new BlockLocation(5, 2, 2);
    const sculkSpreader = test.getSculkSpreader(sculkCatalystPos);
    test.assert(sculkSpreader !==  undefined, "No Sculk Spreader has been retrieved!");
    spreadFromBlockOrAssert(test, sculkSpreader, sculkCatalystPos, MinecraftBlockTypes.sculk, new BlockLocation(4, 5, 2), INITIAL_CHARGE);

    test.startSequence().thenExecuteAfter(TicksPerSecond * 2, () => {
        const expectedPos = new BlockLocation(6, 5, 2);
        const cursorPosition = sculkSpreader.getCursorPosition(0);
        const existingPos = test.relativeBlockLocation(cursorPosition);
        test.assert(expectedPos.equals(existingPos),
            "Expected charge on (" + expectedPos.x + ", " + expectedPos.y + ", " + expectedPos.z + "), not (" + existingPos.x + ", " + existingPos.y + ", " + existingPos.z + ").");

        test.setBlockType(MinecraftBlockTypes.redstoneBlock, new BlockLocation(5, 6, 3));
    }).thenExecuteAfter(TicksPerSecond * 2, () => {
        const expectedPos = new BlockLocation(4, 5, 2);
        const cursorPosition = sculkSpreader.getCursorPosition(0);
        const existingPos = test.relativeBlockLocation(cursorPosition);
        test.assert(expectedPos.equals(existingPos),
            "Expected charge on (" + expectedPos.x + ", " + expectedPos.y + ", " + expectedPos.z + "), not (" + existingPos.x + ", " + existingPos.y + ", " + existingPos.z + ").");
    }).thenSucceed();
})
    .padding(TEST_PADDING)
    .tag(GameTest.Tags.suiteDefault);

GameTest.register("SculkTests", "charge_merging", (test) => {
    const INITIAL_CHARGE = 5;
    const MIN_RESIDUAL_CHARGE = 12;

    const sculkCatalystPos = new BlockLocation(2, 2, 2);
    const sculkSpreader = test.getSculkSpreader(sculkCatalystPos);
    test.assert(sculkSpreader !==  undefined, "No Sculk Spreader has been retrieved!");

    spreadFromBlockOrAssert(test, sculkSpreader, sculkCatalystPos, MinecraftBlockTypes.sculk, new BlockLocation(2, 5, 0), INITIAL_CHARGE);
    spreadFromBlockOrAssert(test, sculkSpreader, sculkCatalystPos, MinecraftBlockTypes.sculk, new BlockLocation(2, 5, 4), INITIAL_CHARGE);
    spreadFromBlockOrAssert(test, sculkSpreader, sculkCatalystPos, MinecraftBlockTypes.sculk, new BlockLocation(4, 5, 2), INITIAL_CHARGE);
    spreadFromBlockOrAssert(test, sculkSpreader, sculkCatalystPos, MinecraftBlockTypes.sculk, new BlockLocation(0, 5, 2), INITIAL_CHARGE);

    test.succeedWhen(() => {
        const totalCharge = sculkSpreader.getTotalCharge();
        const numberOfCursors = sculkSpreader.getNumberOfCursors();
        test.assert(numberOfCursors ===  1, "There are " + numberOfCursors + " cursors, should be only one");
        test.assert(totalCharge >= MIN_RESIDUAL_CHARGE, "Total charge of + " + INITIAL_CHARGE * 4 + " + should be roughly preserved, current charge: " + totalCharge);
    });
})
    .maxTicks(TicksPerSecond * 5)
    .padding(TEST_PADDING)
    .tag(GameTest.Tags.suiteDefault);

GameTest.register("SculkTests", "charge_in_air_disappear", (test) => {
    const INITIAL_CHARGE = 20;

    const sculkCatalystPos = new BlockLocation(2, 2, 2);
    const sculkSpreader = test.getSculkSpreader(sculkCatalystPos);
    test.assert(sculkSpreader !==  undefined, "No Sculk Spreader has been retrieved!");

    spreadFromBlockOrAssert(test, sculkSpreader, sculkCatalystPos, MinecraftBlockTypes.sculk, new BlockLocation(2, 4, 2), INITIAL_CHARGE);

    const charge = sculkSpreader.getTotalCharge();
    test.assert(charge ===  INITIAL_CHARGE, "Total charge of " + INITIAL_CHARGE + " should be still present at this point.");

    test.setBlockType(MinecraftBlockTypes.air, new BlockLocation(2, 4, 2));

    test.startSequence().thenExecuteAfter(3, () => {
        const numberOfCursors = sculkSpreader.getNumberOfCursors();
        test.assert(numberOfCursors ===  0, "The cursor did not disappear in 3 ticks despite having no substrate.");
    }).thenSucceed();
})
    .padding(TEST_PADDING)
    .tag(GameTest.Tags.suiteDefault);

GameTest.register("SculkTests", "charge_in_air_jump", (test) => {
    const INITIAL_CHARGE = 20;

    const sculkCatalystPos = new BlockLocation(2, 2, 2);
    const sculkSpreader = test.getSculkSpreader(sculkCatalystPos);
    test.assert(sculkSpreader !==  undefined, "No Sculk Spreader has been retrieved!");

    spreadFromBlockOrAssert(test, sculkSpreader, sculkCatalystPos, MinecraftBlockTypes.sculk, new BlockLocation(2, 4, 2), INITIAL_CHARGE);

    const charge = sculkSpreader.getTotalCharge();
    test.assert(charge ===  INITIAL_CHARGE, "Total charge of " + INITIAL_CHARGE + " should be still present at this point.");

    test.setBlockType(MinecraftBlockTypes.air, new BlockLocation(2, 4, 2));
    test.setBlockType(MinecraftBlockTypes.sculk, new BlockLocation(2, 5, 2));

    test.startSequence().thenExecuteAfter(3, () => {
        const expectedPos = new BlockLocation(2, 5, 2);
        const cursorPos = sculkSpreader.getCursorPosition(0);
        const currentPos = test.relativeBlockLocation(cursorPos);
        test.assert(expectedPos.equals(currentPos),
            "Expected charge on (" + expectedPos.x + ", " + expectedPos.y + ", " + expectedPos.z + "), not (" + currentPos.x + ", " + currentPos.y + ", " + currentPos.z + ")");
    }).thenSucceed();
})
    .padding(TEST_PADDING)
    .tag(GameTest.Tags.suiteDefault);

GameTest.register("SculkTests", "spread_from_moving_blocks", (test) => {
    test.setBlockType(MinecraftBlockTypes.redstoneBlock, new BlockLocation(8, 9, 2));

    test.startSequence().thenExecuteAfter(TicksPerSecond * 10, () => {
        test.setBlockType(MinecraftBlockTypes.air, new BlockLocation(8, 9, 2));

        for (var x = 1; x < 8; x++) {
            for (var z = 1; z < 4; z++) {
                test.assertBlockPresent(MinecraftBlockTypes.sculk, new BlockLocation(x, 0, z), /* isPresent = */ false)
            }
        }
    }).thenSucceed();
})
    .maxTicks(TicksPerSecond * 15)
    .padding(TEST_PADDING)
    .tag(GameTest.Tags.suiteDefault);

GameTest.register("SculkTests", "spread_to_moving_blocks", (test) => {
    test.setBlockType(MinecraftBlockTypes.redstoneBlock, new BlockLocation(8, 9, 2));

    test.startSequence().thenExecuteAfter(TicksPerSecond * 10, () => {
        // Deactivate the contraption to prevent detection of moving blocks.
        test.setBlockType(MinecraftBlockTypes.air, new BlockLocation(8, 9, 2));
    }).thenExecuteAfter(TicksPerSecond * 1, () => {
        var sculkCount = 0;
        for (var x = 1; x < 8; x++) {
            for (var z = 1; z < 4; z++) {
                if (test.getBlock(new BlockLocation(x, 3, z)).id ===  "minecraft:sculk") {
                    ++sculkCount;
                }
            }
        }

        test.assert(sculkCount >= 5, "Sculk is expected to spread on slow enough moving blocks!");
    }).thenSucceed();
})
    .maxTicks(TicksPerSecond * 15)
    .padding(TEST_PADDING)
    .tag(GameTest.Tags.suiteDefault);

GameTest.register("SculkTests", "spread_on_player_death", (test) => {
    const DIE_BY_FALL_DAMAGE_HEIGHT = 25;
    const DIE_BY_FALL_DAMAGE_TIME = TicksPerSecond * 2;

    const sculkCatalystPos = new BlockLocation(2, 2, 2);
    const sculkSpreader = test.getSculkSpreader(sculkCatalystPos);
    test.assert(sculkSpreader !==  undefined, "No Sculk Spreader has been retrieved!");

    const grassPos = new BlockLocation(1, 4, 2);
    const grassWithTallGrassPos = new BlockLocation(3, 4, 2);

    test.startSequence().thenExecute(() => {
        const player1 = test.spawnSimulatedPlayer(grassPos.offset(0, DIE_BY_FALL_DAMAGE_HEIGHT, 0), "Giovanni");
        player1.addExperience(10);
    }).thenExecuteAfter(DIE_BY_FALL_DAMAGE_TIME, () => {
        test.assertBlockPresent(MinecraftBlockTypes.sculk, grassPos);
    }).thenExecute(() => {
        const player2 = test.spawnSimulatedPlayer(grassWithTallGrassPos.offset(0, DIE_BY_FALL_DAMAGE_HEIGHT, 0), "Giorgio");
        player2.addExperience(10);
    }).thenExecuteAfter(DIE_BY_FALL_DAMAGE_TIME, () => {
        test.assertBlockPresent(MinecraftBlockTypes.sculk, grassWithTallGrassPos);
    }).thenSucceed();
})
    .padding(TEST_PADDING)
    .tag(GameTest.Tags.suiteDefault);

// SIG // Begin signature block
// SIG // MIInrgYJKoZIhvcNAQcCoIInnzCCJ5sCAQExDzANBglg
// SIG // hkgBZQMEAgEFADB3BgorBgEEAYI3AgEEoGkwZzAyBgor
// SIG // BgEEAYI3AgEeMCQCAQEEEBDgyQbOONQRoqMAEEvTUJAC
// SIG // AQACAQACAQACAQACAQAwMTANBglghkgBZQMEAgEFAAQg
// SIG // DQyuL1iprkXmQbEhOEEd6mM7jbkzgJAHb4Mx43BQo4ig
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
// SIG // SEXAQsmbdlsKgEhr/Xmfwb1tbWrJUnMTDXpQzTGCGYUw
// SIG // ghmBAgEBMIGVMH4xCzAJBgNVBAYTAlVTMRMwEQYDVQQI
// SIG // EwpXYXNoaW5ndG9uMRAwDgYDVQQHEwdSZWRtb25kMR4w
// SIG // HAYDVQQKExVNaWNyb3NvZnQgQ29ycG9yYXRpb24xKDAm
// SIG // BgNVBAMTH01pY3Jvc29mdCBDb2RlIFNpZ25pbmcgUENB
// SIG // IDIwMTECEzMAAALMjrWWpr3RyU4AAAAAAswwDQYJYIZI
// SIG // AWUDBAIBBQCggcAwGQYJKoZIhvcNAQkDMQwGCisGAQQB
// SIG // gjcCAQQwHAYKKwYBBAGCNwIBCzEOMAwGCisGAQQBgjcC
// SIG // ARUwLwYJKoZIhvcNAQkEMSIEIG1e4OPzo5aH0X4ZV3Ln
// SIG // e1ggMEc2Vyu2pkZS8Q3+1tH+MFQGCisGAQQBgjcCAQwx
// SIG // RjBEoCSAIgBNAGkAbgBlAGMAcgBhAGYAdAAgAEIAZQBk
// SIG // AHIAbwBjAGuhHIAaaHR0cHM6Ly93d3cubWluZWNyYWZ0
// SIG // Lm5ldC8wDQYJKoZIhvcNAQEBBQAEggEAm5vol/VTjStU
// SIG // CaOzI4y1xsV4ZzyAM4nWzhAHRF5OiNs4jUpHT9YxdqVg
// SIG // D32DZS0Cnq5Q8wrjl4DvOuNw+/5KQWtx8MT1FUgFnbNc
// SIG // /5ivwlho2IDQDUKR72JYBHYMG5BIEMm7kjubW3eOyU4/
// SIG // AEUOxGE29LfX74oRMpfIPUQ1XcSVG9F3bxWVnaiJV3cx
// SIG // wGPto2DrvsNpVOuyZkRjg9k/h6v9Xz0jobHKqh/+b+6k
// SIG // AwIRwI5mQeOKET+30tZmm8TMAKvsfQRtmPfbBcL/ppuX
// SIG // AvjapRtszNWGdcMocVRaZpff84W1vvFeBddxiM3KLYkC
// SIG // YcNINA9E5PcWZ+YAqMtsw6GCFv0wghb5BgorBgEEAYI3
// SIG // AwMBMYIW6TCCFuUGCSqGSIb3DQEHAqCCFtYwghbSAgED
// SIG // MQ8wDQYJYIZIAWUDBAIBBQAwggFRBgsqhkiG9w0BCRAB
// SIG // BKCCAUAEggE8MIIBOAIBAQYKKwYBBAGEWQoDATAxMA0G
// SIG // CWCGSAFlAwQCAQUABCCdZhqBal8XEIYIvO+4J3PqFzx2
// SIG // hOMsp4hKAycumYQVLgIGYyNdiZ9VGBMyMDIyMDkyODIz
// SIG // NTEyNC45MjdaMASAAgH0oIHQpIHNMIHKMQswCQYDVQQG
// SIG // EwJVUzETMBEGA1UECBMKV2FzaGluZ3RvbjEQMA4GA1UE
// SIG // BxMHUmVkbW9uZDEeMBwGA1UEChMVTWljcm9zb2Z0IENv
// SIG // cnBvcmF0aW9uMSUwIwYDVQQLExxNaWNyb3NvZnQgQW1l
// SIG // cmljYSBPcGVyYXRpb25zMSYwJAYDVQQLEx1UaGFsZXMg
// SIG // VFNTIEVTTjo0OUJDLUUzN0EtMjMzQzElMCMGA1UEAxMc
// SIG // TWljcm9zb2Z0IFRpbWUtU3RhbXAgU2VydmljZaCCEVQw
// SIG // ggcMMIIE9KADAgECAhMzAAABlwPPWZxriXg/AAEAAAGX
// SIG // MA0GCSqGSIb3DQEBCwUAMHwxCzAJBgNVBAYTAlVTMRMw
// SIG // EQYDVQQIEwpXYXNoaW5ndG9uMRAwDgYDVQQHEwdSZWRt
// SIG // b25kMR4wHAYDVQQKExVNaWNyb3NvZnQgQ29ycG9yYXRp
// SIG // b24xJjAkBgNVBAMTHU1pY3Jvc29mdCBUaW1lLVN0YW1w
// SIG // IFBDQSAyMDEwMB4XDTIxMTIwMjE5MDUxNFoXDTIzMDIy
// SIG // ODE5MDUxNFowgcoxCzAJBgNVBAYTAlVTMRMwEQYDVQQI
// SIG // EwpXYXNoaW5ndG9uMRAwDgYDVQQHEwdSZWRtb25kMR4w
// SIG // HAYDVQQKExVNaWNyb3NvZnQgQ29ycG9yYXRpb24xJTAj
// SIG // BgNVBAsTHE1pY3Jvc29mdCBBbWVyaWNhIE9wZXJhdGlv
// SIG // bnMxJjAkBgNVBAsTHVRoYWxlcyBUU1MgRVNOOjQ5QkMt
// SIG // RTM3QS0yMzNDMSUwIwYDVQQDExxNaWNyb3NvZnQgVGlt
// SIG // ZS1TdGFtcCBTZXJ2aWNlMIICIjANBgkqhkiG9w0BAQEF
// SIG // AAOCAg8AMIICCgKCAgEA7QBK6kpBTfPwnv3LKx1VnL9Y
// SIG // kozUwKzyhDKij1E6WCV/EwWZfPCza6cOGxKT4pjvhLXJ
// SIG // YuUQaGRInqPks2FJ29PpyhFmhGILm4Kfh0xWYg/OS5Xe
// SIG // 5pNl4PdSjAxNsjHjiB9gx6U7J+adC39Ag5XzxORzsKT+
// SIG // f77FMTXg1jFus7ErilOvWi+znMpN+lTMgioxzTC+u1Zm
// SIG // TCQTu219b2FUoTr0KmVJMQqQkd7M5sR09PbOp4cC3jQs
// SIG // +5zJ1OzxIjRlcUmLvldBE6aRaSu0x3BmADGt0mGY0MRs
// SIG // gznOydtJBLnerc+QK0kcxuO6rHA3z2Kr9fmpHsfNcN/e
// SIG // RPtZHOLrpH59AnirQA7puz6ka20TA+8MhZ19hb8msrRo
// SIG // 9LmirjFxSbGfsH3ZNEbLj3lh7Vc+DEQhMH2K9XPiU5Jk
// SIG // t5/6bx6/2/Od3aNvC6Dx3s5N3UsW54kKI1twU2CS5q1H
// SIG // ov5+ARyuZk0/DbsRus6D97fB1ZoQlv/4trBcMVRz7MkO
// SIG // rHa8bP4WqbD0ebLYtiExvx4HuEnh+0p3veNjh3gP0+7D
// SIG // kiVwIYcfVclIhFFGsfnSiFexruu646uUla+VTUuG3bjq
// SIG // S7FhI3hh6THov/98XfHcWeNhvxA5K+fi+1BcSLgQKvq/
// SIG // HYj/w/Mkf3bu73OERisNaacaaOCR/TJ2H3fs1A7lIHEC
// SIG // AwEAAaOCATYwggEyMB0GA1UdDgQWBBRtzwHPKOswbpZV
// SIG // C9Gxvt1+vRUAYDAfBgNVHSMEGDAWgBSfpxVdAF5iXYP0
// SIG // 5dJlpxtTNRnpcjBfBgNVHR8EWDBWMFSgUqBQhk5odHRw
// SIG // Oi8vd3d3Lm1pY3Jvc29mdC5jb20vcGtpb3BzL2NybC9N
// SIG // aWNyb3NvZnQlMjBUaW1lLVN0YW1wJTIwUENBJTIwMjAx
// SIG // MCgxKS5jcmwwbAYIKwYBBQUHAQEEYDBeMFwGCCsGAQUF
// SIG // BzAChlBodHRwOi8vd3d3Lm1pY3Jvc29mdC5jb20vcGtp
// SIG // b3BzL2NlcnRzL01pY3Jvc29mdCUyMFRpbWUtU3RhbXAl
// SIG // MjBQQ0ElMjAyMDEwKDEpLmNydDAMBgNVHRMBAf8EAjAA
// SIG // MBMGA1UdJQQMMAoGCCsGAQUFBwMIMA0GCSqGSIb3DQEB
// SIG // CwUAA4ICAQAESNhh0iTtMx57IXLfh4LuHbD1NG9MlLA1
// SIG // wYQHQBnR9U/rg3qt3Nx6e7+QuEKMEhKqdLf3g5RR4R/o
// SIG // ZL5vEJVWUfISH/oSWdzqrShqcmT4Oxzc2CBs0UtnyopV
// SIG // Dm4W2Cumo3quykYPpBoGdeirvDdd153AwsJkIMgm/8sx
// SIG // JKbIBeT82tnrUngNmNo8u7l1uE0hsMAq1bivQ63fQInr
// SIG // +VqYJvYT0W/0PW7pA3qh4ocNjiX6Z8d9kjx8L7uBPI/H
// SIG // sxifCj/8mFRvpVBYOyqP7Y5di5ZAnjTDSHMZNUFPHt+n
// SIG // hFXUcHjXPRRHCMqqJg4D63X6b0V0R87Q93ipwGIXBMzO
// SIG // MQNItJORekHtHlLi3bg6Lnpjs0aCo5/RlHCjNkSDg+xV
// SIG // 7qYea37L/OKTNjqmH3pNAa3BvP/rDQiGEYvgAbVHEIQz
// SIG // 7WMWSYsWeUPFZI36mCjgUY6V538CkQtDwM8BDiAcy+qu
// SIG // O8epykiP0H32yqwDh852BeWm1etF+Pkw/t8XO3Q+diFu
// SIG // 7Ggiqjdemj4VfpRsm2tTN9HnAewrrb0XwY8QE2tp0hRd
// SIG // N2b0UiSxMmB4hNyKKXVaDLOFCdiLnsfpD0rjOH8jbECZ
// SIG // ObaWWLn9eEvDr+QNQPvS4r47L9Aa8Lr1Hr47VwJ5E2gC
// SIG // EnvYwIRDzpJhMRi0KijYN43yT6XSGR4N9jCCB3EwggVZ
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
// SIG // gm2lBRDBcQZqELQdVTNYs6FwZvKhggLLMIICNAIBATCB
// SIG // +KGB0KSBzTCByjELMAkGA1UEBhMCVVMxEzARBgNVBAgT
// SIG // Cldhc2hpbmd0b24xEDAOBgNVBAcTB1JlZG1vbmQxHjAc
// SIG // BgNVBAoTFU1pY3Jvc29mdCBDb3Jwb3JhdGlvbjElMCMG
// SIG // A1UECxMcTWljcm9zb2Z0IEFtZXJpY2EgT3BlcmF0aW9u
// SIG // czEmMCQGA1UECxMdVGhhbGVzIFRTUyBFU046NDlCQy1F
// SIG // MzdBLTIzM0MxJTAjBgNVBAMTHE1pY3Jvc29mdCBUaW1l
// SIG // LVN0YW1wIFNlcnZpY2WiIwoBATAHBgUrDgMCGgMVAGFA
// SIG // 0rCNmEk0zU12DYNGMU3B1mPRoIGDMIGApH4wfDELMAkG
// SIG // A1UEBhMCVVMxEzARBgNVBAgTCldhc2hpbmd0b24xEDAO
// SIG // BgNVBAcTB1JlZG1vbmQxHjAcBgNVBAoTFU1pY3Jvc29m
// SIG // dCBDb3Jwb3JhdGlvbjEmMCQGA1UEAxMdTWljcm9zb2Z0
// SIG // IFRpbWUtU3RhbXAgUENBIDIwMTAwDQYJKoZIhvcNAQEF
// SIG // BQACBQDm3v9EMCIYDzIwMjIwOTI5MDExMzQwWhgPMjAy
// SIG // MjA5MzAwMTEzNDBaMHQwOgYKKwYBBAGEWQoEATEsMCow
// SIG // CgIFAObe/0QCAQAwBwIBAAICBhcwBwIBAAICEb8wCgIF
// SIG // AObgUMQCAQAwNgYKKwYBBAGEWQoEAjEoMCYwDAYKKwYB
// SIG // BAGEWQoDAqAKMAgCAQACAwehIKEKMAgCAQACAwGGoDAN
// SIG // BgkqhkiG9w0BAQUFAAOBgQCTftcinqDwFjiMxS9wciaw
// SIG // n1zLlfkM7EQz2DuSGU0pxyiJGGVuAspm4Yf45/LdClK9
// SIG // HNdXUsjslhRDFKew2gyLgVx3hwwxYm2nngvsGHj5qcLR
// SIG // YGlUOg8v11Z+80Y9NE/VOpEiNemk6WNojygvlszmSjUR
// SIG // Kfsro7vnSeedGClQvjGCBA0wggQJAgEBMIGTMHwxCzAJ
// SIG // BgNVBAYTAlVTMRMwEQYDVQQIEwpXYXNoaW5ndG9uMRAw
// SIG // DgYDVQQHEwdSZWRtb25kMR4wHAYDVQQKExVNaWNyb3Nv
// SIG // ZnQgQ29ycG9yYXRpb24xJjAkBgNVBAMTHU1pY3Jvc29m
// SIG // dCBUaW1lLVN0YW1wIFBDQSAyMDEwAhMzAAABlwPPWZxr
// SIG // iXg/AAEAAAGXMA0GCWCGSAFlAwQCAQUAoIIBSjAaBgkq
// SIG // hkiG9w0BCQMxDQYLKoZIhvcNAQkQAQQwLwYJKoZIhvcN
// SIG // AQkEMSIEINgLzXBgC3ErbFJUys+IyzQVwkZqZUkcVtdy
// SIG // hJkAU8dDMIH6BgsqhkiG9w0BCRACLzGB6jCB5zCB5DCB
// SIG // vQQgW3vaGxCVejj+BAzFSfMxfHQ+bxxkqCw8LkMY/QZ4
// SIG // pr8wgZgwgYCkfjB8MQswCQYDVQQGEwJVUzETMBEGA1UE
// SIG // CBMKV2FzaGluZ3RvbjEQMA4GA1UEBxMHUmVkbW9uZDEe
// SIG // MBwGA1UEChMVTWljcm9zb2Z0IENvcnBvcmF0aW9uMSYw
// SIG // JAYDVQQDEx1NaWNyb3NvZnQgVGltZS1TdGFtcCBQQ0Eg
// SIG // MjAxMAITMwAAAZcDz1mca4l4PwABAAABlzAiBCBAf9ZZ
// SIG // Lx9sFAbCr6+M/MoM4mKBom2IPNMMSQ5FxRYL9DANBgkq
// SIG // hkiG9w0BAQsFAASCAgDhGaTCbsAh895WkbNy7qG/yjeB
// SIG // 3W7ySOFKepq/kCfSNc32e+cQLEvSYKNNP723A1otjnAj
// SIG // 47/LVDBM6N1dcy87kLTB4psf8WNtr6SjVKH5gQTK/1gf
// SIG // IQOCRPajWo4AtE3RpS/GNFcdf703UlaIU59oMO7HcLqo
// SIG // t0kQ5hBsabqGXa8SA+hXq+94Ngxzz0yKHcRsaj7RQcBM
// SIG // poY/b3oLyy0nH2oQK3bJGcGmxHF8DvdXrpi+92jBGvgA
// SIG // +Kz7JeB7LUSZvWsFR1TtWjxLt6APoWJO9R/4KIA/192p
// SIG // 6Ho4gQVdjpbIbetpm03hTV0DLCn7dbLSGmN2L+Y/zkqT
// SIG // y3KsqRGUKwzFuZEBTrktJEWTd2+3cFQZFWvvc/jLaiqP
// SIG // Y0VQly1mCdh2+R5Lg18noRskYqws5hWkqlitIw8NQr6G
// SIG // 9kcT8FaonYWsOHjzCYUGh3ns46uzXXkEgPPvz88M5q9l
// SIG // DAkuBhEY6p2sh+z1enSG96NVWhDum1Ygga2ZYTlGRhZO
// SIG // BvO9OkhxJ+BwtR0eVcXAb7ZvFqMsNXyi0DErlGXGzSRO
// SIG // cuyBUdJHg8Zd6sFfHPsn8XT2LukjHKCboouMv284BAaA
// SIG // icU9YtsLE8OBL+QRDZ9wMCvCWO9vTwWqGHmAnDVIKy/J
// SIG // SojRJsmuYEGp12ob9iUbiAmAvigBIlQot2ZqcOciXQ==
// SIG // End signature block
