import * as GameTest from "mojang-gametest";
import { BlockLocation, Direction, ItemStack, Location, MinecraftBlockTypes, MinecraftItemTypes, TicksPerSecond } from "mojang-minecraft";
import GameTestExtensions from "./GameTestExtensions.js";

const SENSOR_ACTIVE_TICKS = 40;
const SENSOR_COOLDOWN_TICKS = 1;
const SENSOR_MAX_DELAY_TICKS = 8;
const REDSTONE_DELAY_TICKS = 2;

function succeedOnVibrationDetected(test, sensorPos, comparatorPos, expectedFrequency) {
    test.succeedWhen(() => {
        const testEx = new GameTestExtensions(test);
        testEx.assertBlockProperty("powered_bit", 1, sensorPos);
        test.assertRedstonePower(comparatorPos, expectedFrequency);
    });
}

function failOnVibrationDetected(test, sensorPos, duration, delay = 0) {
    test.startSequence().thenIdle(delay).thenExecuteFor(duration, () => {
        const testEx = new GameTestExtensions(test);
        testEx.assertBlockProperty("powered_bit", 0, sensorPos);
    }).thenSucceed();
}

// Tests that a Sculk Sensor does not detect Dirt being destroyed in a 9 blocks radius around it.
GameTest.register("VibrationTests", "detection_radius", (test) => {
    const sensorPos = new BlockLocation(9, 11, 9);

    const minDestroyPos = new BlockLocation(0, 2, 0);
    const maxDestroyPos = new BlockLocation(18, 20, 18);

    minDestroyPos.blocksBetween(maxDestroyPos).forEach((pos) => {
        if (test.getBlock(pos).id == "minecraft:dirt") {
            test.destroyBlock(pos);
        }
    });

    failOnVibrationDetected(test, sensorPos, SENSOR_MAX_DELAY_TICKS);
})
    .tag(GameTest.Tags.suiteDefault);

function destroyBlockAndTestComparatorOutput(test, sequence, sensorPos, destroyPos, expectedLitPos) {
    sequence.thenExecute(() => {
        test.destroyBlock(destroyPos);
    }).thenExecuteAfter(SENSOR_MAX_DELAY_TICKS + REDSTONE_DELAY_TICKS, () => {
        const testEx = new GameTestExtensions(test);
        testEx.assertBlockProperty("powered_bit", 1, sensorPos);
        test.assertBlockPresent(MinecraftBlockTypes.litRedstoneLamp, expectedLitPos);
    }).thenIdle(SENSOR_ACTIVE_TICKS + SENSOR_COOLDOWN_TICKS);
}

function spawnCreeperAndTestComparatorOutput(test, sequence, sensorPos, spawnPos, expectedLitPos) {
    sequence.thenExecute(() => {
        test.spawnWithoutBehaviorsAtLocation("minecraft:creeper", spawnPos);
    }).thenExecuteAfter(SENSOR_MAX_DELAY_TICKS + REDSTONE_DELAY_TICKS, () => {
        const testEx = new GameTestExtensions(test);
        testEx.assertBlockProperty("powered_bit", 1, sensorPos);
        test.assertBlockPresent(MinecraftBlockTypes.litRedstoneLamp, expectedLitPos);
    }).thenIdle(SENSOR_ACTIVE_TICKS + SENSOR_COOLDOWN_TICKS);
}

// Tests that the output strenght of a Sculk Sensor (verified by checking Redstone Lamps being powered) is correct for a vibration
// emitted at a certain distance (produced by destroying a block).
GameTest.register("VibrationTests", "output_distance", (test) => {
    const sensorPos = new BlockLocation(16, 2, 9);

    let sequence = test.startSequence();

    destroyBlockAndTestComparatorOutput(test, sequence, sensorPos, sensorPos.offset(0, 0, -8), sensorPos.offset(-1, -1, 1));
    destroyBlockAndTestComparatorOutput(test, sequence, sensorPos, sensorPos.offset(0, 0, -7), sensorPos.offset(-2, -1, 1));
    destroyBlockAndTestComparatorOutput(test, sequence, sensorPos, sensorPos.offset(3, 0, -6), sensorPos.offset(-3, -1, 1));
    destroyBlockAndTestComparatorOutput(test, sequence, sensorPos, sensorPos.offset(0, 0, -6), sensorPos.offset(-4, -1, 1));
    destroyBlockAndTestComparatorOutput(test, sequence, sensorPos, sensorPos.offset(3, 0, -5), sensorPos.offset(-5, -1, 1));
    destroyBlockAndTestComparatorOutput(test, sequence, sensorPos, sensorPos.offset(0, 0, -5), sensorPos.offset(-6, -1, 1));
    destroyBlockAndTestComparatorOutput(test, sequence, sensorPos, sensorPos.offset(2, 0, -4), sensorPos.offset(-7, -1, 1));
    destroyBlockAndTestComparatorOutput(test, sequence, sensorPos, sensorPos.offset(0, 0, -4), sensorPos.offset(-8, -1, 1));
    destroyBlockAndTestComparatorOutput(test, sequence, sensorPos, sensorPos.offset(2, 0, -3), sensorPos.offset(-9, -1, 1));
    destroyBlockAndTestComparatorOutput(test, sequence, sensorPos, sensorPos.offset(0, 0, -3), sensorPos.offset(-10, -1, 1));
    destroyBlockAndTestComparatorOutput(test, sequence, sensorPos, sensorPos.offset(1, 0, -2), sensorPos.offset(-11, -1, 1));
    destroyBlockAndTestComparatorOutput(test, sequence, sensorPos, sensorPos.offset(0, 0, -2), sensorPos.offset(-12, -1, 1));
    destroyBlockAndTestComparatorOutput(test, sequence, sensorPos, sensorPos.offset(1, 0, -1), sensorPos.offset(-13, -1, 1));
    destroyBlockAndTestComparatorOutput(test, sequence, sensorPos, sensorPos.offset(0, 0, -1), sensorPos.offset(-14, -1, 1));
    spawnCreeperAndTestComparatorOutput(test, sequence, sensorPos, new Location(16.5, 3, 9.5), sensorPos.offset(-15, -1, 1));

    sequence.thenSucceed();
})
    .maxTicks(TicksPerSecond * 60)
    .tag(GameTest.Tags.suiteDefault);

// Tests that a Sculk Sensor reacts to the closest vibration emitted in a tick.
GameTest.register("VibrationTests", "activation_multiple_vibrations", (test) => {
    const sensorPos = new BlockLocation(9, 2, 9);

    const testEx = new GameTestExtensions(test);

    const destroyPosFar = new BlockLocation(9, 2, 1);
    const destroyPosClose = new BlockLocation(9, 2, 10);

    test.startSequence().thenExecute(() => {
        // Executed at tick 0.
        test.destroyBlock(destroyPosFar);
        test.destroyBlock(destroyPosClose);
    }).thenExecuteAfter(1, () => {
        // Executed at tick 1. Sensor have been activated by second vibration.
        testEx.assertBlockProperty("powered_bit", 1, sensorPos);
    }).thenSucceed();
})
    .tag(GameTest.Tags.suiteDefault);

function destroyBlockAndTestVibrationDetected(test, sequence, sensorPos, destroyPos, delay) {
    sequence.thenExecute(() => {
        test.destroyBlock(destroyPos);
    }).thenExecuteAfter(delay, () => {
        const testEx = new GameTestExtensions(test);
        testEx.assertBlockProperty("powered_bit", 1, sensorPos);
    }).thenIdle(SENSOR_ACTIVE_TICKS + SENSOR_COOLDOWN_TICKS);
}

// Tests that a Sculk Sensor activates with a delay in ticks equal to the distance a vibration has been emitted at.
GameTest.register("VibrationTests", "activation_delay", (test) => {
    const sensorPos = new BlockLocation(9, 2, 9);

    let sequence = test.startSequence();

    destroyBlockAndTestVibrationDetected(test, sequence, sensorPos, sensorPos.offset(0, 0, -8), 8);
    destroyBlockAndTestVibrationDetected(test, sequence, sensorPos, sensorPos.offset(0, 0, -7), 7);
    destroyBlockAndTestVibrationDetected(test, sequence, sensorPos, sensorPos.offset(0, 0, -6), 6);
    destroyBlockAndTestVibrationDetected(test, sequence, sensorPos, sensorPos.offset(0, 0, -5), 5);
    destroyBlockAndTestVibrationDetected(test, sequence, sensorPos, sensorPos.offset(0, 0, -4), 4);
    destroyBlockAndTestVibrationDetected(test, sequence, sensorPos, sensorPos.offset(0, 0, -3), 3);
    destroyBlockAndTestVibrationDetected(test, sequence, sensorPos, sensorPos.offset(0, 0, -2), 2);
    destroyBlockAndTestVibrationDetected(test, sequence, sensorPos, sensorPos.offset(0, 0, -1), 1);

    sequence.thenSucceed();
})
    .maxTicks(TicksPerSecond * 60)
    .tag(GameTest.Tags.suiteDefault);

// Tests that a Sculk Sensor activates and stays active for the expected amount of time when receiving a vibration.
GameTest.register("VibrationTests", "activation_duration", (test) => {
    const sensorPos = new BlockLocation(9, 2, 9);

    const testEx = new GameTestExtensions(test);

    const destroyPos = new BlockLocation(8, 2, 9);

    test.startSequence().thenExecute(() => {
        test.destroyBlock(destroyPos);
    }).thenWaitAfter(1, () => {
        testEx.assertBlockProperty("powered_bit", 1, sensorPos);
    }).thenWaitAfter(SENSOR_ACTIVE_TICKS, () => {
        testEx.assertBlockProperty("powered_bit", 0, sensorPos);
    }).thenSucceed();
})
    .tag(GameTest.Tags.suiteDefault);

// Tests that a Sculk Sensor ignores vibrations while on cooldown.
GameTest.register("VibrationTests", "activation_cooldown", (test) => {
    const sensorPos = new BlockLocation(9, 2, 9);

    const testEx = new GameTestExtensions(test);

    const destroyPos1 = new BlockLocation(8, 2, 9);
    const destroyPos2 = new BlockLocation(10, 2, 9);

    test.startSequence().thenExecute(() => {
        test.destroyBlock(destroyPos1);
    }).thenWaitAfter(1, () => {
        testEx.assertBlockProperty("powered_bit", 1, sensorPos);
    }).thenWaitAfter(SENSOR_ACTIVE_TICKS, () => {
        testEx.assertBlockProperty("powered_bit", 0, sensorPos);
    }).thenExecute(() => {
        test.destroyBlock(destroyPos2);
    }).thenWaitAfter(SENSOR_COOLDOWN_TICKS, () => {
        testEx.assertBlockProperty("powered_bit", 0, sensorPos);
    }).thenSucceed();
})
    .tag(GameTest.Tags.suiteDefault);

// Tests that a Sculk Sensor can react to vibrations (emitted by destroying a block) only if they are not occluded by Wool.
GameTest.register("VibrationTests", "activation_wool_occlusion", (test) => {
    const sensorPos = new BlockLocation(9, 2, 9);

    const testEx = new GameTestExtensions(test);

    const occuledDestroyPos1 = new BlockLocation(5, 2, 9);
    const occuledDestroyPos2 = new BlockLocation(9, 2, 13);
    const occuledDestroyPos3 = new BlockLocation(13, 2, 9);
    const unocculedDestroyPos1 = new BlockLocation(9, 2, 5);
    const unocculedDestroyPos2 = new BlockLocation(9, 6, 9);

    test.startSequence().thenExecute(() => {
        test.destroyBlock(occuledDestroyPos1);
        test.destroyBlock(occuledDestroyPos2);
        test.destroyBlock(occuledDestroyPos3);
    }).thenExecuteAfter(SENSOR_MAX_DELAY_TICKS, () => {
        testEx.assertBlockProperty("powered_bit", 0, sensorPos);
    }).thenExecute(() => {
        test.destroyBlock(unocculedDestroyPos1);
    }).thenWait(() => {
        testEx.assertBlockProperty("powered_bit", 1, sensorPos);
    }).thenExecuteAfter(SENSOR_ACTIVE_TICKS + SENSOR_COOLDOWN_TICKS, () => {
        test.destroyBlock(unocculedDestroyPos2);
    }).thenWait(() => {
        testEx.assertBlockProperty("powered_bit", 1, sensorPos);
    }).thenSucceed();
})
    .tag(GameTest.Tags.suiteDefault);

// Tests that a Sculk Sensor cannot react to vibrations (emitted by destroying a block) occluded by Wool, no matter the relative position of the occluded source.
GameTest.register("VibrationTests", "activation_wool_occlusion_no_bias", (test) => {
    const sensorPos = new BlockLocation(9, 2, 9);

    const occuledDestroyPos1 = new BlockLocation(6, 2, 6);
    const occuledDestroyPos2 = new BlockLocation(6, 2, 12);
    const occuledDestroyPos3 = new BlockLocation(12, 2, 6);
    const occuledDestroyPos4 = new BlockLocation(12, 2, 12);

    test.destroyBlock(occuledDestroyPos1);
    test.destroyBlock(occuledDestroyPos2);
    test.destroyBlock(occuledDestroyPos3);
    test.destroyBlock(occuledDestroyPos4);

    failOnVibrationDetected(test, sensorPos, SENSOR_MAX_DELAY_TICKS);
})
    .tag(GameTest.Tags.suiteDefault);

// Tests that a moving entity produces vibrations of the expected frequency.
GameTest.register("VibrationTests", "event_entity_move", (test) => {
    const sensorPos = new BlockLocation(9, 2, 9);
    const comparatorPos = new BlockLocation(9, 2, 10);
    const expectedFrequency = 1;

    const spawnPos = new Location(16.5, 2, 7.5);
    const pig = test.spawnWithoutBehaviorsAtLocation("minecraft:pig", spawnPos);

    const targetPos = new BlockLocation(2, 2, 7);
    test.walkTo(pig, targetPos, 1);

    succeedOnVibrationDetected(test, sensorPos, comparatorPos, expectedFrequency);
})
    .tag(GameTest.Tags.suiteDefault);

// Tests that an entity moving through Cobwebs produces vibrations of the expected frequency.
GameTest.register("VibrationTests", "event_entity_move_cobweb", (test) => {
    const sensorPos = new BlockLocation(9, 2, 9);
    const comparatorPos = new BlockLocation(9, 2, 10);
    const expectedFrequency = 1;

    const spawnPos = new Location(11.5, 2, 7.5);
    const pig = test.spawnWithoutBehaviorsAtLocation("minecraft:pig", spawnPos);

    const targetPos = new BlockLocation(7, 2, 7);
    test.walkTo(pig, targetPos, 1);

    succeedOnVibrationDetected(test, sensorPos, comparatorPos, expectedFrequency);
})
    .tag(GameTest.Tags.suiteDefault);

// Tests that an entity moving through Pownder Snow produces vibrations of the expected frequency.
GameTest.register("VibrationTests", "event_entity_move_powder_snow", (test) => {
    const sensorPos = new BlockLocation(9, 2, 9);
    const comparatorPos = new BlockLocation(9, 2, 10);
    const expectedFrequency = 1;

    const spawnPos = new Location(11.5, 2, 7.5);
    const pig = test.spawnWithoutBehaviorsAtLocation("minecraft:pig", spawnPos);

    const targetPos = new BlockLocation(7, 2, 7);
    test.walkTo(pig, targetPos, 1);

    succeedOnVibrationDetected(test, sensorPos, comparatorPos, expectedFrequency);
})
    .tag(GameTest.Tags.suiteDefault);

// Tests that a moving entity does not produce vibrations while on Wool.
GameTest.register("VibrationTests", "event_entity_move_wool", (test) => {
    const sensorPos = new BlockLocation(9, 2, 9);

    const spawnPos = new Location(16.5, 2, 7.5);
    const pig = test.spawnWithoutBehaviorsAtLocation("minecraft:pig", spawnPos);

    const targetPos = new BlockLocation(2, 2, 7);
    test.walkTo(pig, targetPos, 1);

    failOnVibrationDetected(test, sensorPos, TicksPerSecond * 2);
})
    .tag(GameTest.Tags.suiteDefault);

// Tests that a moving entity does not produce vibrations while on Wool Carpet.
GameTest.register("VibrationTests", "event_entity_move_carpet", (test) => {
    const sensorPos = new BlockLocation(9, 2, 9);

    const spawnPos = new Location(16.5, 2.5, 7.5);
    const pig = test.spawnWithoutBehaviorsAtLocation("minecraft:pig", spawnPos);

    const targetPos = new BlockLocation(2, 2, 7);
    test.walkTo(pig, targetPos, 1);

    failOnVibrationDetected(test, sensorPos, TicksPerSecond * 2);
})
    .tag(GameTest.Tags.suiteDefault);

// Tests that a vibration dampening entity (Warden) does not produce vibrations when moving.
GameTest.register("VibrationTests", "event_entity_move_dampening", (test) => {
    const sensorPos = new BlockLocation(9, 2, 9);

    const spawnPos = new Location(16.5, 2, 7.5);
    const warden = test.spawnWithoutBehaviorsAtLocation("minecraft:warden", spawnPos);

    const targetPos = new BlockLocation(2, 2, 7);
    test.walkTo(warden, targetPos, 1);

    failOnVibrationDetected(test, sensorPos, TicksPerSecond * 2);
})
    .tag(GameTest.Tags.suiteDefault);

// Tests that an entity standing still in Scaffolding does not produce vibrations.
GameTest.register("VibrationTests", "event_entity_move_scaffolding", (test) => {
    const sensorPos = new BlockLocation(9, 2, 9);

    const spawnPos = new Location(9.5, 3, 7.5);
    const pig = test.spawnWithoutBehaviorsAtLocation("minecraft:pig", spawnPos);

    failOnVibrationDetected(test, sensorPos, TicksPerSecond * 2);
})
    .tag(GameTest.Tags.suiteDefault);

// Tests that a moving player does not produce vibrations when sneaking, but does otherwise.
GameTest.register("VibrationTests", "event_entity_move_sneaking", (test) => {
    const sensorPos = new BlockLocation(9, 2, 9);
    const comparatorPos = new BlockLocation(9, 2, 10);
    const expectedFrequency = 1;

    const spawnPos = new BlockLocation(11, 2, 7);
    const targetPos = new BlockLocation(7, 2, 7);
    const player = test.spawnSimulatedPlayer(spawnPos, "Gordon");

    test.startSequence().thenExecute(() => {
        player.isSneaking = true;
        player.moveToBlock(targetPos);
    }).thenExecuteFor(TicksPerSecond * 5, () => {
        const testEx = new GameTestExtensions(test);
        testEx.assertBlockProperty("powered_bit", 0, sensorPos);
    }).thenExecute(() => {
        player.isSneaking = false;
        player.moveToBlock(spawnPos);
    }).thenWait(() => {
        const testEx = new GameTestExtensions(test);
        testEx.assertBlockProperty("powered_bit", 1, sensorPos);
        test.assertRedstonePower(comparatorPos, expectedFrequency);
    }).thenSucceed();
})
    .maxTicks(TicksPerSecond * 30)
    .tag(GameTest.Tags.suiteDefault);

// Tests that a Sculk Sensor can receive vibrations from a sneaking entity only if the entity is moving on top of it.
GameTest.register("VibrationTests", "event_entity_move_sneaking_on_sensor", (test) => {
    const sneakOnSensorPos = new BlockLocation(9, 2, 9);
    const unaffectedSensorPos = new BlockLocation(9, 5, 9);

    const spawnPos = new Location(7.5, 2, 9.5);
    const targetPos = new BlockLocation(11, 2, 9);
    // Using a Pig as for some reason Simulated Players do not trigger onStandOn.
    const pig = test.spawnWithoutBehaviorsAtLocation("minecraft:pig", spawnPos);

    test.startSequence().thenExecute(() => {
        pig.isSneaking = true;
        test.walkTo(pig, targetPos, 1);
    }).thenWait(() => {
        const testEx = new GameTestExtensions(test);
        testEx.assertBlockProperty("powered_bit", 1, sneakOnSensorPos);
    }).thenExecuteFor(TicksPerSecond * 5, () => {
        const testEx = new GameTestExtensions(test);
        testEx.assertBlockProperty("powered_bit", 0, unaffectedSensorPos);
    }).thenSucceed();
})
    .maxTicks(TicksPerSecond * 30)
    .tag(GameTest.Tags.suiteDefault);

// Tests that a flying parrot produces vibrations of the expected frequency.
GameTest.register("VibrationTests", "event_flap_parrot", (test) => {
    const sensorPos = new BlockLocation(9, 2, 9);
    const comparatorPos = new BlockLocation(9, 2, 10);
    const expectedFrequency = 2;

    const spawnPos = new Location(11.5, 2, 9.5);
    const parrot = test.spawnWithoutBehaviorsAtLocation("minecraft:parrot", spawnPos);

    const targetPos = new BlockLocation(7, 2, 9);
    test.walkTo(parrot, targetPos, 1);

    succeedOnVibrationDetected(test, sensorPos, comparatorPos, expectedFrequency);
})
    .tag(GameTest.Tags.suiteDefault);

// Tests that a flying bee produces vibrations of the expected frequency.
GameTest.register("VibrationTests", "event_flap_bee", (test) => {
    const sensorPos = new BlockLocation(9, 2, 9);
    const comparatorPos = new BlockLocation(9, 2, 10);
    const expectedFrequency = 2;

    const spawnPos = new Location(11.5, 2, 9.5);
    const bee = test.spawnWithoutBehaviorsAtLocation("minecraft:bee", spawnPos);

    const targetPos = new BlockLocation(7, 2, 9);
    test.walkTo(bee, targetPos, 1);

    succeedOnVibrationDetected(test, sensorPos, comparatorPos, expectedFrequency);
})
    .tag(GameTest.Tags.suiteDefault);

// Tests that a falling chicken produces vibrations of the expected frequency.
GameTest.register("VibrationTests", "event_flap_chicken", (test) => {
    const sensorPos = new BlockLocation(9, 2, 9);
    const comparatorPos = new BlockLocation(9, 2, 10);
    const expectedFrequency = 2;

    const spawnPos = new Location(9.5, 5, 7.5);
    test.spawnWithoutBehaviorsAtLocation("minecraft:chicken", spawnPos);

    succeedOnVibrationDetected(test, sensorPos, comparatorPos, expectedFrequency);
})
    .tag(GameTest.Tags.suiteDefault);

// Tests that a swimming entity produces vibrations of the expected frequency.
GameTest.register("VibrationTests", "event_swim", (test) => {
    const sensorPos = new BlockLocation(9, 2, 9);
    const comparatorPos = new BlockLocation(9, 2, 10);
    const expectedFrequency = 3;

    const spawnPos = new Location(11.5, 2, 9.5);
    const fish = test.spawnWithoutBehaviorsAtLocation("minecraft:tropicalfish", spawnPos);

    const targetPos = new BlockLocation(7, 2, 9);
    test.walkTo(fish, targetPos, 1);

    succeedOnVibrationDetected(test, sensorPos, comparatorPos, expectedFrequency);
})
    .tag(GameTest.Tags.suiteDefault);

// Tests that a swimming entity staying still in water does not produce vibrations.
GameTest.register("VibrationTests", "event_swim_still", (test) => {
    const sensorPos = new BlockLocation(9, 2, 9);

    const spawnPos = new Location(9.5, 2, 7.5);
    test.spawnAtLocation("minecraft:tropicalfish", spawnPos);

    // When the fish is spawned, it emits a splash vibration, so we wait for the sensor to reset before checking for further ones.
    failOnVibrationDetected(test, sensorPos, TicksPerSecond * 1, SENSOR_MAX_DELAY_TICKS + SENSOR_ACTIVE_TICKS + SENSOR_COOLDOWN_TICKS);
})
    .tag(GameTest.Tags.suiteDefault);

// Tests that a Boat moving on water produces vibrations of the expected frequency.
GameTest.register("VibrationTests", "event_swim_boat", (test) => {
    const sensorPos = new BlockLocation(9, 2, 9);
    const comparatorPos = new BlockLocation(9, 2, 10);
    const expectedFrequency = 3;

    const spawnPos = new Location(11.5, 3, 6.5);
    const boat = test.spawnAtLocation("minecraft:boat", spawnPos);

    const targetPos = new BlockLocation(6, 3, 7);
    test.walkTo(boat, targetPos, 1);

    succeedOnVibrationDetected(test, sensorPos, comparatorPos, expectedFrequency);
})
    .tag(GameTest.Tags.suiteDefault);

// Tests that a Boat staying still on water does not produce vibrations.
GameTest.register("VibrationTests", "event_swim_boat_still", (test) => {
    const sensorPos = new BlockLocation(9, 2, 9);

    const spawnPos = new Location(9.5, 3, 6.5);
    test.spawnAtLocation("minecraft:boat", spawnPos);

    // When the Boat is spawned, it emits a splash vibration, so we wait for the sensor to reset before checking for further ones.
    failOnVibrationDetected(test, sensorPos, TicksPerSecond * 4, SENSOR_MAX_DELAY_TICKS + SENSOR_ACTIVE_TICKS + SENSOR_COOLDOWN_TICKS);
})
    .tag(GameTest.Tags.suiteDefault)
    .maxTicks(TicksPerSecond * 5 + SENSOR_MAX_DELAY_TICKS + SENSOR_ACTIVE_TICKS + SENSOR_COOLDOWN_TICKS);

// Tests that an entity hitting ground produces vibrations of the expected frequency.
GameTest.register("VibrationTests", "event_hit_ground", (test) => {
    const sensorPos = new BlockLocation(9, 2, 9);
    const comparatorPos = new BlockLocation(9, 2, 10);
    const expectedFrequency = 5;

    const spawnPos = new Location(9.5, 5, 7.5);
    test.spawnWithoutBehaviorsAtLocation("minecraft:creeper", spawnPos);

    succeedOnVibrationDetected(test, sensorPos, comparatorPos, expectedFrequency);
})
    .tag(GameTest.Tags.suiteDefault);

// [Bug 734008] Tests that a vibration dampening item (a Wool block, ejected by powering a Dispenser containing it) does not produce vibrations when hitting ground.
GameTest.register("VibrationTests", "event_hit_ground_dampening", (test) => {
    const sensorPos = new BlockLocation(9, 2, 9);

    const placeAtPos = new BlockLocation(9, 6, 6);
    test.setBlockType(MinecraftBlockTypes.redstoneBlock, placeAtPos);

    failOnVibrationDetected(test, sensorPos, TicksPerSecond * 2);
})
    .tag(GameTest.Tags.suiteDefault);

// Tests that an entity falling on Wool does not produce vibrations.
GameTest.register("VibrationTests", "event_hit_ground_wool", (test) => {
    const sensorPos = new BlockLocation(9, 2, 9);

    const spawnPos = new Location(9.5, 5, 7.5);
    test.spawnWithoutBehaviorsAtLocation("minecraft:creeper", spawnPos);

    failOnVibrationDetected(test, sensorPos, TicksPerSecond * 2);
})
    .tag(GameTest.Tags.suiteDefault);

// Tests that a Sculk Sensor detects Wool in item form (retrieved from the .mcstructure) lying on top of it.
GameTest.register("VibrationTests", "event_sculk_touch_wool", (test) => {
    const sensorPos = new BlockLocation(9, 2, 9);
    const comparatorPos = new BlockLocation(9, 2, 10);
    const expectedFrequency = 1;

    succeedOnVibrationDetected(test, sensorPos, comparatorPos, expectedFrequency);
})
    .tag(GameTest.Tags.suiteDefault);

// Tests that an entity falling in Water produces vibrations of the expected frequency.
GameTest.register("VibrationTests", "event_splash", (test) => {
    const sensorPos = new BlockLocation(9, 2, 9);
    const comparatorPos = new BlockLocation(9, 2, 10);
    const expectedFrequency = 6;

    const spawnPos = new Location(9.5, 5, 7.5);
    test.spawnWithoutBehaviorsAtLocation("minecraft:creeper", spawnPos);

    succeedOnVibrationDetected(test, sensorPos, comparatorPos, expectedFrequency);
})
    .tag(GameTest.Tags.suiteDefault);

// Tests that a Boat (retrieved from the .mcstructure) on top of a Bubble Column produces vibrations of the expected frequency.
GameTest.register("VibrationTests", "event_splash_boat_on_bubble_column", (test) => {
    const sensorPos = new BlockLocation(9, 2, 9);
    const comparatorPos = new BlockLocation(9, 2, 10);
    const expectedFrequency = 6;

    succeedOnVibrationDetected(test, sensorPos, comparatorPos, expectedFrequency);
})
    .maxTicks(TicksPerSecond * 15)
    .tag(GameTest.Tags.suiteDefault);

// Tests that a projectile being shot (by powering a Dispenser) produces vibrations of the expected frequency.
GameTest.register("VibrationTests", "event_projectile_shoot", (test) => {
    const sensorPos = new BlockLocation(9, 2, 9);
    const comparatorPos = new BlockLocation(9, 2, 8);
    const expectedFrequency = 7;

    const placeAtPos = new BlockLocation(9, 4, 4);
    test.setBlockType(MinecraftBlockTypes.redstoneBlock, placeAtPos);

    succeedOnVibrationDetected(test, sensorPos, comparatorPos, expectedFrequency);
})
    .tag(GameTest.Tags.suiteDefault);

// Tests that a landing projectile (shot by powering a Dispenser) produces vibrations of the expected frequency.
GameTest.register("VibrationTests", "event_projectile_land", (test) => {
    const sensorPos = new BlockLocation(9, 2, 9);
    const comparatorPos = new BlockLocation(9, 2, 10);
    const expectedFrequency = 8;

    const placeAtPos = new BlockLocation(9, 4, 4);
    test.setBlockType(MinecraftBlockTypes.redstoneBlock, placeAtPos);

    succeedOnVibrationDetected(test, sensorPos, comparatorPos, expectedFrequency);
})
    .tag(GameTest.Tags.suiteDefault);

// Tests that a projectile (shot by powering a Dispenser) does not produce vibrations when landing on wool.
GameTest.register("VibrationTests", "event_projectile_land_wool", (test) => {
    const sensorPos = new BlockLocation(9, 2, 9);

    const placeAtPos = new BlockLocation(9, 7, 4);
    test.setBlockType(MinecraftBlockTypes.redstoneBlock, placeAtPos);

    failOnVibrationDetected(test, sensorPos, TicksPerSecond * 2);
})
    .tag(GameTest.Tags.suiteDefault);

// Tests that an entity being damaged (by standing on Magma) produces vibrations of the expected frequency.
GameTest.register("VibrationTests", "event_entity_damage", (test) => {
    const sensorPos = new BlockLocation(9, 2, 9);
    const comparatorPos = new BlockLocation(9, 2, 10);
    const expectedFrequency = 8;

    const spawnPos = new Location(9.5, 2, 7.5);
    test.spawnWithoutBehaviorsAtLocation("minecraft:creeper", spawnPos);

    succeedOnVibrationDetected(test, sensorPos, comparatorPos, expectedFrequency);
})
    .tag(GameTest.Tags.suiteDefault);

// Tests that an emtpy Dispenser trying to dispense produces vibrations of the expected frequency.
GameTest.register("VibrationTests", "event_dispense_fail", (test) => {
    const sensorPos = new BlockLocation(9, 2, 9);
    const comparatorPos = new BlockLocation(9, 2, 10);
    const expectedFrequency = 10;

    const placeAtPos = new BlockLocation(9, 2, 3);
    test.setBlockType(MinecraftBlockTypes.redstoneBlock, placeAtPos);

    succeedOnVibrationDetected(test, sensorPos, comparatorPos, expectedFrequency);
})
    .tag(GameTest.Tags.suiteDefault);

// Tests that a Fence Gate being closed (by removing the Redstone Block powering it) produces vibrations of the expected frequency.
GameTest.register("VibrationTests", "event_block_close", (test) => {
    const sensorPos = new BlockLocation(9, 2, 9);
    const comparatorPos = new BlockLocation(9, 2, 10);
    const expectedFrequency = 10;

    const placeAtPos = new BlockLocation(12, 2, 5);
    test.setBlockType(MinecraftBlockTypes.air, placeAtPos);

    succeedOnVibrationDetected(test, sensorPos, comparatorPos, expectedFrequency);
})
    .tag(GameTest.Tags.suiteDefault);

// Tests that a Fence Gate being opened (by placing a Redstone Block to power it) produces vibrations of the expected frequency.
GameTest.register("VibrationTests", "event_block_open", (test) => {
    const sensorPos = new BlockLocation(9, 2, 9);
    const comparatorPos = new BlockLocation(9, 2, 10);
    const expectedFrequency = 11;

    const placeAtPos = new BlockLocation(12, 2, 5);
    test.setBlockType(MinecraftBlockTypes.redstoneBlock, placeAtPos);

    succeedOnVibrationDetected(test, sensorPos, comparatorPos, expectedFrequency);
})
    .tag(GameTest.Tags.suiteDefault);

// Tests that picking-up Water (by powering a Dispenser with an Empty Bucket in it) produces vibrations of the expected frequency.
GameTest.register("VibrationTests", "event_fluid_pickup", (test) => {
    const sensorPos = new BlockLocation(9, 2, 9);
    const comparatorPos = new BlockLocation(9, 2, 10);
    const expectedFrequency = 13;

    const placeAtPos = new BlockLocation(9, 2, 3);
    test.setBlockType(MinecraftBlockTypes.redstoneBlock, placeAtPos);

    succeedOnVibrationDetected(test, sensorPos, comparatorPos, expectedFrequency);
})
    .tag(GameTest.Tags.suiteDefault);

// Tests that placing Water (by powering a Dispenser with a Water Bucket in it) produces vibrations of the expected frequency.
GameTest.register("VibrationTests", "event_fluid_place", (test) => {
    const sensorPos = new BlockLocation(9, 2, 9);
    const comparatorPos = new BlockLocation(9, 2, 10);
    const expectedFrequency = 12;

    const placeAtPos = new BlockLocation(9, 2, 3);
    test.setBlockType(MinecraftBlockTypes.redstoneBlock, placeAtPos);

    succeedOnVibrationDetected(test, sensorPos, comparatorPos, expectedFrequency);
})
    .tag(GameTest.Tags.suiteDefault);

// Tests that a player destroying a block produces vibrations of the expected frequency.
GameTest.register("VibrationTests", "event_block_destroy", (test) => {
    const sensorPos = new BlockLocation(9, 2, 9);
    const comparatorPos = new BlockLocation(9, 2, 10);
    const expectedFrequency = 13;

    const spawnPos = new BlockLocation(9, 2, 6);
    const player = test.spawnSimulatedPlayer(spawnPos, "Ralph");

    const breakPos = new BlockLocation(9, 2, 7);
    player.lookAtBlock(breakPos);
    player.breakBlock(breakPos);

    succeedOnVibrationDetected(test, sensorPos, comparatorPos, expectedFrequency);
})
    .tag(GameTest.Tags.suiteDefault);

// Tests that a player closing a Chest produces vibrations of the expected frequency.
GameTest.register("VibrationTests", "event_container_close", (test) => {
    const sensorPos = new BlockLocation(9, 2, 9);
    const comparatorPos = new BlockLocation(9, 2, 10);
    const expectedFrequency = 14;

    const spawnPos = new BlockLocation(9, 2, 5);
    const chestPos = new BlockLocation(9, 2, 7);
    const player = test.spawnSimulatedPlayer(spawnPos, "Corvo");

    test.startSequence().thenExecuteAfter(20, () => {
        player.interactWithBlock(chestPos);
    }).thenExecuteAfter(SENSOR_MAX_DELAY_TICKS + SENSOR_ACTIVE_TICKS + SENSOR_COOLDOWN_TICKS, () => {
        player.stopInteracting();
    }).thenWait(() => {
        const testEx = new GameTestExtensions(test);
        testEx.assertBlockProperty("powered_bit", 1, sensorPos);
        test.assertRedstonePower(comparatorPos, expectedFrequency);
    }).thenSucceed();

    succeedOnVibrationDetected(test, sensorPos, comparatorPos, expectedFrequency);
})
    .tag(GameTest.Tags.suiteDefault);

// Tests that a player opening a Chest produces vibrations of the expected frequency.
GameTest.register("VibrationTests", "event_container_open", (test) => {
    const sensorPos = new BlockLocation(9, 2, 9);
    const comparatorPos = new BlockLocation(9, 2, 10);
    const expectedFrequency = 15;

    const spawnPos = new BlockLocation(9, 2, 5);
    const chestPos = new BlockLocation(9, 2, 7);
    const player = test.spawnSimulatedPlayer(spawnPos, "John");

    test.startSequence().thenExecuteAfter(20, () => {
        player.interactWithBlock(chestPos);
    }).thenWait(() => {
        const testEx = new GameTestExtensions(test);
        testEx.assertBlockProperty("powered_bit", 1, sensorPos);
        test.assertRedstonePower(comparatorPos, expectedFrequency);
    }).thenSucceed();
})
    .tag(GameTest.Tags.suiteDefault);

// Tests that spawning a Pillager (by powering a Dispenser with a Spawn Egg in it) produces vibrations of the expected frequency.
GameTest.register("VibrationTests", "event_entity_place", (test) => {
    const sensorPos = new BlockLocation(9, 2, 9);
    const comparatorPos = new BlockLocation(9, 2, 10);
    const expectedFrequency = 12;

    const placeAtPos = new BlockLocation(9, 2, 4);
    test.setBlockType(MinecraftBlockTypes.redstoneBlock, placeAtPos);

    succeedOnVibrationDetected(test, sensorPos, comparatorPos, expectedFrequency);
})
    .tag(GameTest.Tags.suiteDefault);

// Tests that equipping an Armor Stand (by powering a Dispenser with equipment in it) produces vibrations of the expected frequency.
GameTest.register("VibrationTests", "event_equip", (test) => {
    const sensorPos = new BlockLocation(9, 2, 9);
    const comparatorPos = new BlockLocation(9, 2, 10);
    const expectedFrequency = 9;

    const placeAtToDispenseSwordPos = new BlockLocation(7, 2, 6);
    const placeAtToDispenseHelmetPos = new BlockLocation(11, 2, 6);

    const testEx = new GameTestExtensions(test);

    test.startSequence().thenExecute(() => {
        test.setBlockType(MinecraftBlockTypes.redstoneBlock, placeAtToDispenseSwordPos);
    }).thenWait(() => {
        testEx.assertBlockProperty("powered_bit", 1, sensorPos);
        test.assertRedstonePower(comparatorPos, expectedFrequency);
    }).thenExecuteAfter(SENSOR_MAX_DELAY_TICKS + SENSOR_ACTIVE_TICKS + SENSOR_COOLDOWN_TICKS, () => {
        test.setBlockType(MinecraftBlockTypes.redstoneBlock, placeAtToDispenseHelmetPos);
    }).thenWait(() => {
        testEx.assertBlockProperty("powered_bit", 1, sensorPos);
        test.assertRedstonePower(comparatorPos, expectedFrequency);
    }).thenSucceed();
})
    .tag(GameTest.Tags.suiteDefault);

// Tests that exploding TNT (ignited by placing a Redstone Block) produces vibrations of the expected frequency.
GameTest.register("VibrationTests", "event_explode", (test) => {
    const sensorPos = new BlockLocation(9, 2, 9);
    const comparatorPos = new BlockLocation(9, 2, 10);
    const expectedFrequency = 15;

    const placeAtPos = new BlockLocation(9, 3, 6);
    test.setBlockType(MinecraftBlockTypes.redstoneBlock, placeAtPos);

    succeedOnVibrationDetected(test, sensorPos, comparatorPos, expectedFrequency);
})
    .tag(GameTest.Tags.suiteDefault);

// Tests that a piston being contracted (by removing the Redstone Block powering it) produces vibrations of the expected frequency.
GameTest.register("VibrationTests", "event_piston_contract", (test) => {
    const sensorPos = new BlockLocation(9, 2, 9);
    const comparatorPos = new BlockLocation(9, 2, 10);
    const expectedFrequency = 14;

    const placeAtPos = new BlockLocation(9, 2, 5);
    test.setBlockType(MinecraftBlockTypes.air, placeAtPos);

    succeedOnVibrationDetected(test, sensorPos, comparatorPos, expectedFrequency);
})
    .tag(GameTest.Tags.suiteDefault);

// Tests that a piston being extened (by placing a Redstone Block to power it) produces vibrations of the expected frequency.
GameTest.register("VibrationTests", "event_piston_extend", (test) => {
    const sensorPos = new BlockLocation(9, 2, 9);
    const comparatorPos = new BlockLocation(9, 2, 10);
    const expectedFrequency = 15;

    const placeAtPos = new BlockLocation(9, 2, 5);
    test.setBlockType(MinecraftBlockTypes.redstoneBlock, placeAtPos);

    succeedOnVibrationDetected(test, sensorPos, comparatorPos, expectedFrequency);
})
    .tag(GameTest.Tags.suiteDefault);

// Tests that a Cake with Candle being ignited (by powering a Dispenser with a Flint and Steel in it) produces vibrations of the expected frequency.
GameTest.register("VibrationTests", "event_block_change", (test) => {
    const sensorPos = new BlockLocation(9, 2, 9);
    const comparatorPos = new BlockLocation(9, 2, 10);
    const expectedFrequency = 6;

    const placeAtPos = new BlockLocation(9, 2, 5);
    test.setBlockType(MinecraftBlockTypes.redstoneBlock, placeAtPos);

    succeedOnVibrationDetected(test, sensorPos, comparatorPos, expectedFrequency);
})
    .tag(GameTest.Tags.suiteDefault);

// Tests that a lightning produces vibrations of the expected frequency.
GameTest.register("VibrationTests", "event_lightning_strike", (test) => {
    const sensorPos = new BlockLocation(9, 2, 9);
    const comparatorPos = new BlockLocation(9, 2, 10);
    const expectedFrequency = 15;

    const spawnPos = new Location(9.5, 2, 5.5);
    test.spawnAtLocation("minecraft:lightning_bolt", spawnPos);

    succeedOnVibrationDetected(test, sensorPos, comparatorPos, expectedFrequency);
})
    .tag(GameTest.Tags.suiteDefault);

// SIG // Begin signature block
// SIG // MIInrgYJKoZIhvcNAQcCoIInnzCCJ5sCAQExDzANBglg
// SIG // hkgBZQMEAgEFADB3BgorBgEEAYI3AgEEoGkwZzAyBgor
// SIG // BgEEAYI3AgEeMCQCAQEEEBDgyQbOONQRoqMAEEvTUJAC
// SIG // AQACAQACAQACAQACAQAwMTANBglghkgBZQMEAgEFAAQg
// SIG // RLIjoKONadZUB89VVsmGRD8yJt1DmdKiRNzRpkWntzeg
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
// SIG // ARUwLwYJKoZIhvcNAQkEMSIEIJyKIZRK47nfUp2xkoiM
// SIG // x797oIJG6qlXGK6dOF2uNpyOMFQGCisGAQQBgjcCAQwx
// SIG // RjBEoCSAIgBNAGkAbgBlAGMAcgBhAGYAdAAgAEIAZQBk
// SIG // AHIAbwBjAGuhHIAaaHR0cHM6Ly93d3cubWluZWNyYWZ0
// SIG // Lm5ldC8wDQYJKoZIhvcNAQEBBQAEggEAfxGom++nKDnB
// SIG // gnDyLy3rkgUQyfkk1FSRxt4NP3B/T3l290w8S0+FE9uc
// SIG // jXkcpFIzQ5qL3HZYUExtTHrOV7H5RyLBTnReC2yq8+hM
// SIG // 6fBmdIDaPMGU5Huj03mx7dPhcoy08kSpxDzE5ROQdO9h
// SIG // V21ogDzg4VXi0oaQueGMrPYq1QZ6gjxOqpEZjhMmQNES
// SIG // N+Ot62CrQ3aa99c2ALlzyA5NDSCHUvICmg/ZgXqnZIna
// SIG // L26UuWNM/2hIOi828CMyp0gPlUxXW7+bNuF314iXL2pn
// SIG // IgpRsQN3eQN/eYofGKWtUS0vAbbIJ/qhKJBuFjPkVAmU
// SIG // h6e9xaRyIjX8R9G3v5BhGKGCFv0wghb5BgorBgEEAYI3
// SIG // AwMBMYIW6TCCFuUGCSqGSIb3DQEHAqCCFtYwghbSAgED
// SIG // MQ8wDQYJYIZIAWUDBAIBBQAwggFRBgsqhkiG9w0BCRAB
// SIG // BKCCAUAEggE8MIIBOAIBAQYKKwYBBAGEWQoDATAxMA0G
// SIG // CWCGSAFlAwQCAQUABCAfTUYV/g20PPqRbLU0mkbUv3jZ
// SIG // X2YF4Zm5c3X1jufkBAIGYyNdiZ8sGBMyMDIyMDkyODIz
// SIG // NTEyNC4zMDdaMASAAgH0oIHQpIHNMIHKMQswCQYDVQQG
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
// SIG // AQkEMSIEIHXJvmejhq3cstH5fyzn+4lIvVfPQ1h5LFCD
// SIG // FxdTBSaoMIH6BgsqhkiG9w0BCRACLzGB6jCB5zCB5DCB
// SIG // vQQgW3vaGxCVejj+BAzFSfMxfHQ+bxxkqCw8LkMY/QZ4
// SIG // pr8wgZgwgYCkfjB8MQswCQYDVQQGEwJVUzETMBEGA1UE
// SIG // CBMKV2FzaGluZ3RvbjEQMA4GA1UEBxMHUmVkbW9uZDEe
// SIG // MBwGA1UEChMVTWljcm9zb2Z0IENvcnBvcmF0aW9uMSYw
// SIG // JAYDVQQDEx1NaWNyb3NvZnQgVGltZS1TdGFtcCBQQ0Eg
// SIG // MjAxMAITMwAAAZcDz1mca4l4PwABAAABlzAiBCBAf9ZZ
// SIG // Lx9sFAbCr6+M/MoM4mKBom2IPNMMSQ5FxRYL9DANBgkq
// SIG // hkiG9w0BAQsFAASCAgBF0ajEbWB3z4dX8uSR8ovQk0Cf
// SIG // YTRIRhLxV9LMa1YV27UXrO919oukSPjBXE6seiATFnZ4
// SIG // S7CPMwWQ062G1e5SxbwJ+74D3ov8NEOyWsFR+/wiuJkT
// SIG // LstChpTymTtBvBN1NVk7lKNrZ+sbyUZM4zoAco/fXtMw
// SIG // P+vUUfOIrs4r30X/2LJX3CX/BsI5t9c79W1syYNHVobv
// SIG // snK+PmLcwNYaqg007OpldL3TR62ZZbtGMuduqp8O6U0S
// SIG // xRtUIT7gpkf8M8Y9CPEc6D/8bhe1/Qkc41t3VHWX1oUK
// SIG // ZEA+2hZjNJiPT08dhsEV8z+FBJmH7SBudvml8QtIPFLE
// SIG // sZT4EwvFQAwYNvm0GsKTzdyBtJC1wqKKxsdth9wv75ti
// SIG // Fh0eBISrpLDVBTOB7CMwQflJzPKHxDV3uVygpWau+jBD
// SIG // N9oXtYI6RAIcpn3NJikTDdDVs9hPynQpQ7A4xML1Z+ZF
// SIG // Knt/osB8GIkSsLuH1sHcWjLZM94EzWRNYDnyN82ADYNO
// SIG // 7bb8Ee3JEl3iMIZq7PIeO8tBxE7ZvxQwigLZEKaOr9jw
// SIG // vsp4oydDTEFDEE8PD9CNU9tgDHSxczWeD1QKrgKzkXPs
// SIG // m5rHHpwDFYdgiHzB6cuWJyXr/vp6SEkJ1jZvmImNg1gl
// SIG // njmbromS3OK2teq3nYnxm+mUJKRJpSofPXNB1PG67Q==
// SIG // End signature block
