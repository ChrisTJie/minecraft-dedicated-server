import * as GameTest from "mojang-gametest";
import { BlockLocation, BlockPermutation, BlockProperties, MinecraftBlockTypes, TicksPerSecond } from "mojang-minecraft";

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
    test.assert(sculkSpreader != undefined, "No Sculk Spreader has been retrieved!");

    const spreadStartPos1 = new BlockLocation(0, 4, 0);
    placeSculkVeinAndSpread(test, sculkSpreader, sculkCatalystPos, spreadStartPos1, /* faceMask (down) = */ 1, INITIAL_CHARGE_SMALL);
    const spreadStartPos2 = new BlockLocation(4, 4, 4);
    placeSculkVeinAndSpread(test, sculkSpreader, sculkCatalystPos, spreadStartPos2, /* faceMask (down) = */ 1, INITIAL_CHARGE_BIG);

    test.succeedWhen(() => {
        var sculkCount = 0;
        for (var x = 0; x < 5; ++x) {
            for (var y = 0; y < 5; ++y) {
                for (var z = 0; z < 5; ++z) {
                    if (test.getBlock(new BlockLocation(x, y, z)).id == "minecraft:sculk") {
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
    test.assert(sculkSpreader != undefined, "No Sculk Spreader has been retrieved!");

    const spreadStartPos1 = new BlockLocation(0, 4, 0);
    placeSculkVeinAndSpread(test, sculkSpreader, sculkCatalystPos, spreadStartPos1, /* faceMask (down) = */ 1, INITIAL_CHARGE);
    const spreadStartPos2 = new BlockLocation(4, 4, 4);
    placeSculkVeinAndSpread(test, sculkSpreader, sculkCatalystPos, spreadStartPos2, /* faceMask (down) = */ 1, INITIAL_CHARGE);

    test.succeedWhen(() => {
        var sculkCount = 0;
        for (var x = 0; x < 5; ++x) {
            for (var y = 0; y < 5; ++y) {
                for (var z = 0; z < 5; ++z) {
                    if (test.getBlock(new BlockLocation(x, y, z)).id == "minecraft:sculk") {
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
    test.assert(sculkSpreader != undefined, "No Sculk Spreader has been retrieved!");

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
    test.assert(sculkSpreader != undefined, "No Sculk Spreader has been retrieved!");

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
    test.assert(sculkSpreader != undefined, "No Sculk Spreader has been retrieved!");

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
    test.assert(sculkSpreader != undefined, "No Sculk Spreader has been retrieved!");

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
    test.assert(sculkSpreader != undefined, "No Sculk Spreader has been retrieved!");

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
                test.assert(blockID == "minecraft:sculk", blockID + " is expected to be consumed by sculk.");
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
                const isSculk = test.getBlock(new BlockLocation(x, 3, z)).id == "minecraft:sculk" || test.getBlock(new BlockLocation(x, 4, z)).id == "minecraft:sculk_vein";
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
                if (test.getBlock(new BlockLocation(x, 4, z)).id == "minecraft:sculk_vein") {
                    ++sculkVeinCount;
                }
            }
        };
        test.assert(sculkVeinCount == 4, "Only 4 veins where expected to be placed, one for each mob death position!");
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

GameTest.register("SculkTests", "spread_under_water", (test) => {
    const INITIAL_CHARGE = 30;

    const sculkCatalystPos = new BlockLocation(2, 7, 2);
    test.assertBlockPresent(MinecraftBlockTypes.sculkCatalyst, sculkCatalystPos);
    const sculkSpreader = test.getSculkSpreader(sculkCatalystPos);
    test.assert(sculkSpreader != undefined, "No Sculk Spreader has been retrieved!");

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
    test.assert(sculkSpreader != undefined, "No Sculk Spreader has been retrieved!");

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
                    test.assert(blockID != "minecraft:sculk", "Sculk should not have spread.");
                    test.assert(blockID != "minecraft:sculk_vein", "Sculk Vein should not have spread.");
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
    test.assert(sculkSpreader != undefined, "No Sculk Spreader has been retrieved!");

    const mobSpawnLocation = new BlockLocation(2, 4, 2);
    test.spawn("minecraft:creeper", mobSpawnLocation).kill();
    spreadFromBlockOrAssert(test, sculkSpreader, sculkCatalystPos, MinecraftBlockTypes.sculk, new BlockLocation(2, 3, 2), sculkSpreader.maxCharge - MERGEABLE_EXPERIENCE_AMOUNT);

    test.startSequence().thenExecuteAfter(2, () => {
        test.assert(sculkSpreader.getNumberOfCursors() == 1, "Charges should merge up to maximum.");
        test.spawn("minecraft:creeper", mobSpawnLocation).kill();
        test.spawn("minecraft:creeper", mobSpawnLocation).kill();
        test.spawn("minecraft:creeper", mobSpawnLocation).kill();
        test.spawn("minecraft:creeper", mobSpawnLocation).kill();
    }).thenExecuteAfter(2, () => {
        test.assert(sculkSpreader.getNumberOfCursors() == 1, "Charges should merge up to maximum.");
        test.spawn("minecraft:creeper", mobSpawnLocation).kill();
        test.spawn("minecraft:creeper", mobSpawnLocation).kill();
        test.spawn("minecraft:creeper", mobSpawnLocation).kill();
        test.spawn("minecraft:creeper", mobSpawnLocation).kill();
    }).thenExecuteAfter(2, () => {
        test.assert(sculkSpreader.getNumberOfCursors() == 2, "Charges should not merge above maximum.");
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

    catalystPositions.forEach(location => test.assert(test.getSculkSpreader(location) != undefined, "Failed to find sculk catalyst."));

    const closestCatalystPosition = catalystPositions[0];
    const mobSpawnLocation = closestCatalystPosition.offset(0, 2, 0);
    test.spawn("minecraft:creeper", mobSpawnLocation).kill();

    test.startSequence().thenExecuteAfter(2, () => {
        let numberOfCursors = 0;
        catalystPositions.forEach(position => numberOfCursors += test.getSculkSpreader(position).getNumberOfCursors());
        test.assert(numberOfCursors == 1, "Expected total number of cursors to be 1. Actual amount: " + numberOfCursors);
        const closestCatalystCursors = test.getSculkSpreader(closestCatalystPosition).getNumberOfCursors();
        test.assert(closestCatalystCursors == 1, "Expected the closest sculk catalyst to get the cursor.");
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
        test.assert(test.getSculkSpreader(location) != undefined, "Failed to find sculk catalyst.");
        test.spawn("minecraft:creeper", location.offset(0, 2, 0)).kill();
    });

    test.startSequence().thenExecuteAfter(2, () => {
        let numberOfCursors = 0;
        catalystPositions.forEach(position => numberOfCursors += test.getSculkSpreader(position).getNumberOfCursors());
        test.assert(numberOfCursors == 4, "Expected total number of cursors to be 4. Actual amount: " + numberOfCursors);
    }).thenSucceed();
})
    .padding(TEST_PADDING)
    .tag(GameTest.Tags.suiteDefault);

GameTest.register("SculkTests", "charge_decay_sculk", (test) => {
    const INITIAL_CHARGE = 20;
    const FINAL_CHARGE = 19;

    const sculkCatalystPos = new BlockLocation(2, 2, 2);
    const sculkSpreader = test.getSculkSpreader(sculkCatalystPos);
    test.assert(sculkSpreader != undefined, "No Sculk Spreader has been retrieved!");

    spreadFromBlockOrAssert(test, sculkSpreader, sculkCatalystPos, MinecraftBlockTypes.sculk, new BlockLocation(2, 4, 2), INITIAL_CHARGE);

    test.succeedWhen(() => {
        const totalCharge = sculkSpreader.getTotalCharge();
        test.assert(totalCharge == FINAL_CHARGE, "Charge should drop to " + FINAL_CHARGE + ". Total charge: " + totalCharge);
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
    test.assert(sculkSpreader != undefined, "No Sculk Spreader has been retrieved!");

    const spreadStartPos = new BlockLocation(2, 6, 2);
    placeSculkVeinAndSpread(test, sculkSpreader, sculkCatalystPos, spreadStartPos, /* faceMask (down) = */ 1, INITIAL_CHARGE);

    test.succeedWhen(() => {
        const totalCharge = sculkSpreader.getTotalCharge();
        test.assert(totalCharge == FINAL_CHARGE, "Charge should drop to " + FINAL_CHARGE + ". Total charge: " + totalCharge);
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
    test.assert(sculkSpreader != undefined, "No Sculk Spreader has been retrieved!");

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

        test.assert(nearGrowths == 0, "No growths should have spawned near the catalyst.");
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
    test.assert(sculkSpreader != undefined, "No Sculk Spreader has been retrieved!");

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
    test.assert(sculkSpreader != undefined, "No Sculk Spreader has been retrieved!");
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
    test.assert(sculkSpreader != undefined, "No Sculk Spreader has been retrieved!");

    spreadFromBlockOrAssert(test, sculkSpreader, sculkCatalystPos, MinecraftBlockTypes.sculk, new BlockLocation(2, 5, 0), INITIAL_CHARGE);
    spreadFromBlockOrAssert(test, sculkSpreader, sculkCatalystPos, MinecraftBlockTypes.sculk, new BlockLocation(2, 5, 4), INITIAL_CHARGE);
    spreadFromBlockOrAssert(test, sculkSpreader, sculkCatalystPos, MinecraftBlockTypes.sculk, new BlockLocation(4, 5, 2), INITIAL_CHARGE);
    spreadFromBlockOrAssert(test, sculkSpreader, sculkCatalystPos, MinecraftBlockTypes.sculk, new BlockLocation(0, 5, 2), INITIAL_CHARGE);

    test.succeedWhen(() => {
        const totalCharge = sculkSpreader.getTotalCharge();
        const numberOfCursors = sculkSpreader.getNumberOfCursors();
        test.assert(numberOfCursors == 1, "There are " + numberOfCursors + " cursors, should be only one");
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
    test.assert(sculkSpreader != undefined, "No Sculk Spreader has been retrieved!");

    spreadFromBlockOrAssert(test, sculkSpreader, sculkCatalystPos, MinecraftBlockTypes.sculk, new BlockLocation(2, 4, 2), INITIAL_CHARGE);

    const charge = sculkSpreader.getTotalCharge();
    test.assert(charge == INITIAL_CHARGE, "Total charge of " + INITIAL_CHARGE + " should be still present at this point.");

    test.setBlockType(MinecraftBlockTypes.air, new BlockLocation(2, 4, 2));

    test.startSequence().thenExecuteAfter(3, () => {
        const numberOfCursors = sculkSpreader.getNumberOfCursors();
        test.assert(numberOfCursors == 0, "The cursor did not disappear in 3 ticks despite having no substrate.");
    }).thenSucceed();
})
    .padding(TEST_PADDING)
    .tag(GameTest.Tags.suiteDefault);

GameTest.register("SculkTests", "charge_in_air_jump", (test) => {
    const INITIAL_CHARGE = 20;

    const sculkCatalystPos = new BlockLocation(2, 2, 2);
    const sculkSpreader = test.getSculkSpreader(sculkCatalystPos);
    test.assert(sculkSpreader != undefined, "No Sculk Spreader has been retrieved!");

    spreadFromBlockOrAssert(test, sculkSpreader, sculkCatalystPos, MinecraftBlockTypes.sculk, new BlockLocation(2, 4, 2), INITIAL_CHARGE);

    const charge = sculkSpreader.getTotalCharge();
    test.assert(charge == INITIAL_CHARGE, "Total charge of " + INITIAL_CHARGE + " should be still present at this point.");

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
                if (test.getBlock(new BlockLocation(x, 3, z)).id == "minecraft:sculk") {
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
    test.assert(sculkSpreader != undefined, "No Sculk Spreader has been retrieved!");

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
// SIG // MIInxwYJKoZIhvcNAQcCoIInuDCCJ7QCAQExDzANBglg
// SIG // hkgBZQMEAgEFADB3BgorBgEEAYI3AgEEoGkwZzAyBgor
// SIG // BgEEAYI3AgEeMCQCAQEEEBDgyQbOONQRoqMAEEvTUJAC
// SIG // AQACAQACAQACAQACAQAwMTANBglghkgBZQMEAgEFAAQg
// SIG // MQpf8/eQ6DFQafDjrxqH9uY7AnY4fhxgQzuCNy4h39Kg
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
// SIG // SEXAQsmbdlsKgEhr/Xmfwb1tbWrJUnMTDXpQzTGCGZ4w
// SIG // ghmaAgEBMIGVMH4xCzAJBgNVBAYTAlVTMRMwEQYDVQQI
// SIG // EwpXYXNoaW5ndG9uMRAwDgYDVQQHEwdSZWRtb25kMR4w
// SIG // HAYDVQQKExVNaWNyb3NvZnQgQ29ycG9yYXRpb24xKDAm
// SIG // BgNVBAMTH01pY3Jvc29mdCBDb2RlIFNpZ25pbmcgUENB
// SIG // IDIwMTECEzMAAAJSizOq+JXzOdsAAAAAAlIwDQYJYIZI
// SIG // AWUDBAIBBQCggcAwGQYJKoZIhvcNAQkDMQwGCisGAQQB
// SIG // gjcCAQQwHAYKKwYBBAGCNwIBCzEOMAwGCisGAQQBgjcC
// SIG // ARUwLwYJKoZIhvcNAQkEMSIEIOQrzOCbj2sEYEYZMjYf
// SIG // kVn6Y3xpnke0E6r2EST7xDCOMFQGCisGAQQBgjcCAQwx
// SIG // RjBEoCSAIgBNAGkAbgBlAGMAcgBhAGYAdAAgAEIAZQBk
// SIG // AHIAbwBjAGuhHIAaaHR0cHM6Ly93d3cubWluZWNyYWZ0
// SIG // Lm5ldC8wDQYJKoZIhvcNAQEBBQAEggEAX7sdFKcAHpUa
// SIG // TvXuZDCD1eKwpmkGisH1aB3LA5btUngGJmYzfCGrEK+B
// SIG // IGmgyUI9LgIJi28laTr92647t5DxOvLe1IyIAbHncWcz
// SIG // eGL75fVVYDrbkhUX19B9+YH0LMO1fmJPWXCrjvjPpbNb
// SIG // ed+Q8zQ4LRXyW029kP9vjrfZHsmnXSsY6B9uhQHX91Bi
// SIG // urZnc16rX0DpGNcEpyx2zR9yPYmkPMixeQ0RSMvlnmcU
// SIG // RmFUmQ4O+s+H5j4uYNEKTTMtsMdYxOBWdZgAvkRQnvpE
// SIG // +dbAPoAr0uuqGPhFpjQq4iFWfTj4rWN/8efxSAELh+eS
// SIG // OHmIBlxMeNo+YUIkvvLz06GCFxYwghcSBgorBgEEAYI3
// SIG // AwMBMYIXAjCCFv4GCSqGSIb3DQEHAqCCFu8wghbrAgED
// SIG // MQ8wDQYJYIZIAWUDBAIBBQAwggFZBgsqhkiG9w0BCRAB
// SIG // BKCCAUgEggFEMIIBQAIBAQYKKwYBBAGEWQoDATAxMA0G
// SIG // CWCGSAFlAwQCAQUABCCvdenEVuOTJF3WOD57BngerhTi
// SIG // KVaLmRekdbKnJT/9JQIGYrMqJeWqGBMyMDIyMDcwMjAw
// SIG // Mjg1MC41ODZaMASAAgH0oIHYpIHVMIHSMQswCQYDVQQG
// SIG // EwJVUzETMBEGA1UECBMKV2FzaGluZ3RvbjEQMA4GA1UE
// SIG // BxMHUmVkbW9uZDEeMBwGA1UEChMVTWljcm9zb2Z0IENv
// SIG // cnBvcmF0aW9uMS0wKwYDVQQLEyRNaWNyb3NvZnQgSXJl
// SIG // bGFuZCBPcGVyYXRpb25zIExpbWl0ZWQxJjAkBgNVBAsT
// SIG // HVRoYWxlcyBUU1MgRVNOOjE3OUUtNEJCMC04MjQ2MSUw
// SIG // IwYDVQQDExxNaWNyb3NvZnQgVGltZS1TdGFtcCBTZXJ2
// SIG // aWNloIIRZTCCBxQwggT8oAMCAQICEzMAAAGKPjiN0g4C
// SIG // +ugAAQAAAYowDQYJKoZIhvcNAQELBQAwfDELMAkGA1UE
// SIG // BhMCVVMxEzARBgNVBAgTCldhc2hpbmd0b24xEDAOBgNV
// SIG // BAcTB1JlZG1vbmQxHjAcBgNVBAoTFU1pY3Jvc29mdCBD
// SIG // b3Jwb3JhdGlvbjEmMCQGA1UEAxMdTWljcm9zb2Z0IFRp
// SIG // bWUtU3RhbXAgUENBIDIwMTAwHhcNMjExMDI4MTkyNzQy
// SIG // WhcNMjMwMTI2MTkyNzQyWjCB0jELMAkGA1UEBhMCVVMx
// SIG // EzARBgNVBAgTCldhc2hpbmd0b24xEDAOBgNVBAcTB1Jl
// SIG // ZG1vbmQxHjAcBgNVBAoTFU1pY3Jvc29mdCBDb3Jwb3Jh
// SIG // dGlvbjEtMCsGA1UECxMkTWljcm9zb2Z0IElyZWxhbmQg
// SIG // T3BlcmF0aW9ucyBMaW1pdGVkMSYwJAYDVQQLEx1UaGFs
// SIG // ZXMgVFNTIEVTTjoxNzlFLTRCQjAtODI0NjElMCMGA1UE
// SIG // AxMcTWljcm9zb2Z0IFRpbWUtU3RhbXAgU2VydmljZTCC
// SIG // AiIwDQYJKoZIhvcNAQEBBQADggIPADCCAgoCggIBALf/
// SIG // rrehgwMgGb3oAYWoFndBqKk/JRRzHqaFjTizzxBKC7sm
// SIG // uF95/iteBb5WcBZisKmqegfuhJCE0o5HnE0gekEQOJIr
// SIG // 3ScnZS7yq4PLnbQbuuyyso0KsEcw0E0YRAsaVN9LXQRP
// SIG // wHsj/eZO6p3YSLvzqU+EBshiVIjA5ZmQIgz2ORSZIrVI
// SIG // Br8DAR8KICc/BVRARZ1YgFEUyeJAQ4lOqaW7+DyPe/r0
// SIG // IabKQyvvN4GsmokQt4DUxst4jonuj7JdN3L2CIhXACUT
// SIG // +DtEZHhZb/0kKKJs9ybbDHfaKEv1ztL0jfYdg1SjjTI2
// SIG // hToJzeUZOYgqsJp+qrJnvoWqEf06wgUtM1417Fk4JJY1
// SIG // Abbde1AW1vES/vSzcN3IzyfBGEYJTDVwmCzOhswg1xLx
// SIG // PU//7AL/pNXPOLZqImQ2QagYK/0ry/oFbDs9xKA2UNuq
// SIG // k2tWxJ/56cTJl3LaGUnvEkQ6oCtCVFoYyl4J8mjgAxAf
// SIG // hbXyIvo3XFCW6T7QC+JFr1UkSoqVb/DBLmES3sVxAxAY
// SIG // vleLXygKWYROIGtKfkAomsBywWTaI91EDczOUFZhmotz
// SIG // J0BW2ZIam1A8qaPb2lhHlXjt+SX3S1o8EYLzF91SmS+e
// SIG // 3e45kY4lZZbl42RS8fq4SS+yWFabTj7RdTALTGJaejro
// SIG // JzqRvuFuDBh6o+2GHz9FAgMBAAGjggE2MIIBMjAdBgNV
// SIG // HQ4EFgQUI9pD2P1sGdSXrqdJR4Q+MZBpJAMwHwYDVR0j
// SIG // BBgwFoAUn6cVXQBeYl2D9OXSZacbUzUZ6XIwXwYDVR0f
// SIG // BFgwVjBUoFKgUIZOaHR0cDovL3d3dy5taWNyb3NvZnQu
// SIG // Y29tL3BraW9wcy9jcmwvTWljcm9zb2Z0JTIwVGltZS1T
// SIG // dGFtcCUyMFBDQSUyMDIwMTAoMSkuY3JsMGwGCCsGAQUF
// SIG // BwEBBGAwXjBcBggrBgEFBQcwAoZQaHR0cDovL3d3dy5t
// SIG // aWNyb3NvZnQuY29tL3BraW9wcy9jZXJ0cy9NaWNyb3Nv
// SIG // ZnQlMjBUaW1lLVN0YW1wJTIwUENBJTIwMjAxMCgxKS5j
// SIG // cnQwDAYDVR0TAQH/BAIwADATBgNVHSUEDDAKBggrBgEF
// SIG // BQcDCDANBgkqhkiG9w0BAQsFAAOCAgEAxfTBErD1w3kb
// SIG // XxaNX+e+Yj3xfQEVm3rrjXzOfNyH08X82X9nb/5ntwzY
// SIG // vynDTRJ0dUym2bRuy7INHMv6SiBEDiRtn2GlsCCCmMLs
// SIG // gySNkOJFYuZs21f9Aufr0ELEHAr37DPCuV9n34nyYu7a
// SIG // nhtK+fAo4MHu8QWL4Lj5o1DccE1rxI2SD36Y1VKGjwpe
// SIG // qqrNHhVG+23C4c0xBGAZwI/DBDYYj+SCXeD6eZRah07a
// SIG // XnOu2BZhrjv7iAP04zwX3LTOZFCPrs38of8iHbQzbZCM
// SIG // /nv8Zl0hYYkBEdLgY0aG0GVenPtEzbb0TS2slOLuxHpH
// SIG // ezmg180EdEblhmkosLTel3Pz6DT9K3sxujr3MqMNajKF
// SIG // JFBEO6qg9EKvEBcCtAygnWUibcgSjAaY1GApzVGW2L00
// SIG // 1puA1yuUWIH9t21QSVuF6OcOPdBx6OE41jas9ez6j8jA
// SIG // k5zPB3AKk5z3jBNHT2L23cMwzIG7psnWyWqv9OhSJpCe
// SIG // yl7PY8ag4hNj03mJ2o/Np+kP/z6mx7scSZsEDuH83ToF
// SIG // agBJBtVw5qaVSlv6ycQTdyMcla+kD/XIWNjGFWtG2wAi
// SIG // Nnb1PkdkCZROQI6DCsuvFiNaZhU9ySga62nKcuh1Ixq7
// SIG // Vfv9VOdm66xJQpVcuRW/PlGVmS6fNnLgs7STDEqlvpD+
// SIG // c8lQUryzPuAwggdxMIIFWaADAgECAhMzAAAAFcXna54C
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
// SIG // BAsTHVRoYWxlcyBUU1MgRVNOOjE3OUUtNEJCMC04MjQ2
// SIG // MSUwIwYDVQQDExxNaWNyb3NvZnQgVGltZS1TdGFtcCBT
// SIG // ZXJ2aWNloiMKAQEwBwYFKw4DAhoDFQCA8PNjrxtTBQQd
// SIG // p/+MHlaqc1fEoaCBgzCBgKR+MHwxCzAJBgNVBAYTAlVT
// SIG // MRMwEQYDVQQIEwpXYXNoaW5ndG9uMRAwDgYDVQQHEwdS
// SIG // ZWRtb25kMR4wHAYDVQQKExVNaWNyb3NvZnQgQ29ycG9y
// SIG // YXRpb24xJjAkBgNVBAMTHU1pY3Jvc29mdCBUaW1lLVN0
// SIG // YW1wIFBDQSAyMDEwMA0GCSqGSIb3DQEBBQUAAgUA5mmF
// SIG // zDAiGA8yMDIyMDcwMTIyNDAxMloYDzIwMjIwNzAyMjI0
// SIG // MDEyWjB0MDoGCisGAQQBhFkKBAExLDAqMAoCBQDmaYXM
// SIG // AgEAMAcCAQACAjTHMAcCAQACAhFlMAoCBQDmatdMAgEA
// SIG // MDYGCisGAQQBhFkKBAIxKDAmMAwGCisGAQQBhFkKAwKg
// SIG // CjAIAgEAAgMHoSChCjAIAgEAAgMBhqAwDQYJKoZIhvcN
// SIG // AQEFBQADgYEAV0H48Jpy+CgjSGUB7pPnvhrIfYGmsB3r
// SIG // 8zzPfH1IQIGBjxofhACB0oNjCl3SlciW/+ZgcdclcEcc
// SIG // eu7Hv1SiHBcDDmCsL235qiWH1s/THzCms+HtXAox7GZo
// SIG // 446hZSUkwUxgq6tGs6iEHsf3ViEj9Xf67aLphxPrkWCU
// SIG // 1SMdBowxggQNMIIECQIBATCBkzB8MQswCQYDVQQGEwJV
// SIG // UzETMBEGA1UECBMKV2FzaGluZ3RvbjEQMA4GA1UEBxMH
// SIG // UmVkbW9uZDEeMBwGA1UEChMVTWljcm9zb2Z0IENvcnBv
// SIG // cmF0aW9uMSYwJAYDVQQDEx1NaWNyb3NvZnQgVGltZS1T
// SIG // dGFtcCBQQ0EgMjAxMAITMwAAAYo+OI3SDgL66AABAAAB
// SIG // ijANBglghkgBZQMEAgEFAKCCAUowGgYJKoZIhvcNAQkD
// SIG // MQ0GCyqGSIb3DQEJEAEEMC8GCSqGSIb3DQEJBDEiBCD7
// SIG // apDVgofnQbBQ6+ar73eR3Ad/j+h0bT4lNfjXImzKdTCB
// SIG // +gYLKoZIhvcNAQkQAi8xgeowgecwgeQwgb0EIPS94Kt1
// SIG // 30q+fvO/fzD4MbWQhQaE7RHkOH6AkjlNVCm9MIGYMIGA
// SIG // pH4wfDELMAkGA1UEBhMCVVMxEzARBgNVBAgTCldhc2hp
// SIG // bmd0b24xEDAOBgNVBAcTB1JlZG1vbmQxHjAcBgNVBAoT
// SIG // FU1pY3Jvc29mdCBDb3Jwb3JhdGlvbjEmMCQGA1UEAxMd
// SIG // TWljcm9zb2Z0IFRpbWUtU3RhbXAgUENBIDIwMTACEzMA
// SIG // AAGKPjiN0g4C+ugAAQAAAYowIgQgti7SzfE9sOI06Cbh
// SIG // YZ3eo/3n6oLo5xCpNLWNO3O+NRowDQYJKoZIhvcNAQEL
// SIG // BQAEggIAaEV4vN7pT/rqKxmoOtIf40sU1XdRStMPn2jQ
// SIG // wx60pKUGwoPAaIFItICQ+3bH0GihnmeMdD0hQ2fhh4cP
// SIG // jnpgM3mppzXLK8mR4lPZX5sajfppxoCok4dAe6QcSKnm
// SIG // UV/YhkA5vASHBfuuECQpTyY5dRoUCFc5AS/M5ulXDGb8
// SIG // QeqUKyVRhxMcZTPB2jQW5rOKLJXgbTINHPuESfKa3nMO
// SIG // MNzLnaMT4XtxhMyZFW9z9oGKIlAX+L0OuFi/Zx6B3kQG
// SIG // aB7d5aMiS9KrtsmCB49iwRLVSXh2g8laqRviubaA8pT1
// SIG // mPb+yyHVn3TCzF6qCmIYDvsGGwZIk7mMB1ju6cYSh1Su
// SIG // 1r39exGPmkoNBJXsi6MrXBJYYSvADzu60+YPHIYKMPYk
// SIG // v9SG0vpAuKk7ILfbwpelJzDbwOFrWqoC98GRvbZ9Lq0d
// SIG // MPs1wyr42G4cYmda32kbtjDEm7xlpx0DL6Xbt8wdlzGF
// SIG // 83WCMvAxQpGfcKHdWObYVM4WKjThA9uOpF9Z8qlpaT9K
// SIG // S3dd+VGT149Db24I0D0lku8djLBVJcM12vGZH5jP2sCX
// SIG // pLKC5+4eNNi6dyqMEyaqHBislPskMihKQHTF6BwEh0e3
// SIG // 9MZoVnUfTVN+cBoboTCozxyeS9AV+fbruEb+o2xLutf2
// SIG // tD501e5+jzGCu/xZMJHZvDJXzrCblSw=
// SIG // End signature block
