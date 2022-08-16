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

function failOnVibrationDetected(test, sensorPos, duration) {
    test.startSequence().thenExecuteFor(duration, () => {
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
    destroyBlockAndTestComparatorOutput(test, sequence, sensorPos, sensorPos.offset(0, 0, -6), sensorPos.offset(-4, -1, 1));
    destroyBlockAndTestComparatorOutput(test, sequence, sensorPos, sensorPos.offset(0, 0, -5), sensorPos.offset(-6, -1, 1));
    destroyBlockAndTestComparatorOutput(test, sequence, sensorPos, sensorPos.offset(0, 0, -4), sensorPos.offset(-8, -1, 1));
    destroyBlockAndTestComparatorOutput(test, sequence, sensorPos, sensorPos.offset(0, 0, -3), sensorPos.offset(-10, -1, 1));
    destroyBlockAndTestComparatorOutput(test, sequence, sensorPos, sensorPos.offset(0, 0, -2), sensorPos.offset(-12, -1, 1));
    destroyBlockAndTestComparatorOutput(test, sequence, sensorPos, sensorPos.offset(0, 0, -1), sensorPos.offset(-14, -1, 1));
    spawnCreeperAndTestComparatorOutput(test, sequence, sensorPos, new Location(16.5, 3, 9.5), sensorPos.offset(-15, -1, 1));

    sequence.thenSucceed();
})
    .maxTicks(TicksPerSecond * 60)
    .tag(GameTest.Tags.suiteDefault);

// Tests that a Sculk Sensor reacts to an in-range vibration and ignores closer ones emitted after it.
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
        // Executed at tick 1. Sensor shouldn't have been activated by second vibration.
        testEx.assertBlockProperty("powered_bit", 0, sensorPos);
    }).thenExecuteAfter(6, () => {
        // Executed at tick 7. Sensor shouldn't have been activated yet by first vibration.
        testEx.assertBlockProperty("powered_bit", 0, sensorPos);
    }).thenExecuteAfter(3, () => {
        // Executed at tick 8. Sensor should have been activated by first vibration already.
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

// Tests that a vibration dampering entity (Warden) does not produce vibrations when moving.
GameTest.register("VibrationTests", "event_entity_move_dampering", (test) => {
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

// Tests that a flying entity produces vibrations of the expected frequency.
GameTest.register("VibrationTests", "event_flap", (test) => {
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

// [Bug 734008] Tests that a vibration dampering item (a Wool block, ejected by powering a Dispenser containing it) does not produce vibrations when hitting ground.
GameTest.register("VibrationTests", "event_hit_ground_dampering", (test) => {
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
// SIG // MIInygYJKoZIhvcNAQcCoIInuzCCJ7cCAQExDzANBglg
// SIG // hkgBZQMEAgEFADB3BgorBgEEAYI3AgEEoGkwZzAyBgor
// SIG // BgEEAYI3AgEeMCQCAQEEEBDgyQbOONQRoqMAEEvTUJAC
// SIG // AQACAQACAQACAQACAQAwMTANBglghkgBZQMEAgEFAAQg
// SIG // jONhlTERZHSUruAhdPPHxFSnIIG1qYP2rwNWLK4iwhag
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
// SIG // SEXAQsmbdlsKgEhr/Xmfwb1tbWrJUnMTDXpQzTGCGaEw
// SIG // ghmdAgEBMIGVMH4xCzAJBgNVBAYTAlVTMRMwEQYDVQQI
// SIG // EwpXYXNoaW5ndG9uMRAwDgYDVQQHEwdSZWRtb25kMR4w
// SIG // HAYDVQQKExVNaWNyb3NvZnQgQ29ycG9yYXRpb24xKDAm
// SIG // BgNVBAMTH01pY3Jvc29mdCBDb2RlIFNpZ25pbmcgUENB
// SIG // IDIwMTECEzMAAAJSizOq+JXzOdsAAAAAAlIwDQYJYIZI
// SIG // AWUDBAIBBQCggcAwGQYJKoZIhvcNAQkDMQwGCisGAQQB
// SIG // gjcCAQQwHAYKKwYBBAGCNwIBCzEOMAwGCisGAQQBgjcC
// SIG // ARUwLwYJKoZIhvcNAQkEMSIEIGeFBJPc4GHnRJk5/pes
// SIG // p9vouIlsLAnGE7xMbq9oM2cQMFQGCisGAQQBgjcCAQwx
// SIG // RjBEoCSAIgBNAGkAbgBlAGMAcgBhAGYAdAAgAEIAZQBk
// SIG // AHIAbwBjAGuhHIAaaHR0cHM6Ly93d3cubWluZWNyYWZ0
// SIG // Lm5ldC8wDQYJKoZIhvcNAQEBBQAEggEACfEzrslenxOt
// SIG // /jilwtZfPmYZh1tEwgkuFE30VWaIoSomyw1S8rIdXWxT
// SIG // RnSobaZV1L5ibob+P2S9uVMpsSzvM2JNTRj9GUzWwnj8
// SIG // oaeixB8uvRjv3mbyFP/kmNOWsjeGXWIVXtKr0gSrnXl+
// SIG // wS35QBMr2OljOdGqqgkYkz9C/9rKL922uz6XOPVuKLWF
// SIG // XUi6nv1lFUIKUalgvOpFP2E/1Iu5KOWThuEnYlDhhA23
// SIG // XHPMU7LIFxy7VBk0UdtW1CR6Lw4/VAD4Kqy531c2Sa5v
// SIG // RhtAs8b+EzhTi3wAwKgVEBSnpMy/gmEiW+xqTQE/56NO
// SIG // ZAarXLS90rKZIzhbCRskvaGCFxkwghcVBgorBgEEAYI3
// SIG // AwMBMYIXBTCCFwEGCSqGSIb3DQEHAqCCFvIwghbuAgED
// SIG // MQ8wDQYJYIZIAWUDBAIBBQAwggFZBgsqhkiG9w0BCRAB
// SIG // BKCCAUgEggFEMIIBQAIBAQYKKwYBBAGEWQoDATAxMA0G
// SIG // CWCGSAFlAwQCAQUABCD7AyEIWLW43YYFNS1ShBNTUYVq
// SIG // XdIGE9bIniCf6A9hugIGYryhHqJkGBMyMDIyMDcwMjAw
// SIG // Mjg1Mi4xMjVaMASAAgH0oIHYpIHVMIHSMQswCQYDVQQG
// SIG // EwJVUzETMBEGA1UECBMKV2FzaGluZ3RvbjEQMA4GA1UE
// SIG // BxMHUmVkbW9uZDEeMBwGA1UEChMVTWljcm9zb2Z0IENv
// SIG // cnBvcmF0aW9uMS0wKwYDVQQLEyRNaWNyb3NvZnQgSXJl
// SIG // bGFuZCBPcGVyYXRpb25zIExpbWl0ZWQxJjAkBgNVBAsT
// SIG // HVRoYWxlcyBUU1MgRVNOOkQwODItNEJGRC1FRUJBMSUw
// SIG // IwYDVQQDExxNaWNyb3NvZnQgVGltZS1TdGFtcCBTZXJ2
// SIG // aWNloIIRaDCCBxQwggT8oAMCAQICEzMAAAGP81Go61py
// SIG // 3cwAAQAAAY8wDQYJKoZIhvcNAQELBQAwfDELMAkGA1UE
// SIG // BhMCVVMxEzARBgNVBAgTCldhc2hpbmd0b24xEDAOBgNV
// SIG // BAcTB1JlZG1vbmQxHjAcBgNVBAoTFU1pY3Jvc29mdCBD
// SIG // b3Jwb3JhdGlvbjEmMCQGA1UEAxMdTWljcm9zb2Z0IFRp
// SIG // bWUtU3RhbXAgUENBIDIwMTAwHhcNMjExMDI4MTkyNzQ2
// SIG // WhcNMjMwMTI2MTkyNzQ2WjCB0jELMAkGA1UEBhMCVVMx
// SIG // EzARBgNVBAgTCldhc2hpbmd0b24xEDAOBgNVBAcTB1Jl
// SIG // ZG1vbmQxHjAcBgNVBAoTFU1pY3Jvc29mdCBDb3Jwb3Jh
// SIG // dGlvbjEtMCsGA1UECxMkTWljcm9zb2Z0IElyZWxhbmQg
// SIG // T3BlcmF0aW9ucyBMaW1pdGVkMSYwJAYDVQQLEx1UaGFs
// SIG // ZXMgVFNTIEVTTjpEMDgyLTRCRkQtRUVCQTElMCMGA1UE
// SIG // AxMcTWljcm9zb2Z0IFRpbWUtU3RhbXAgU2VydmljZTCC
// SIG // AiIwDQYJKoZIhvcNAQEBBQADggIPADCCAgoCggIBAJlX
// SIG // Pv61zxcehZOPgqS67mw6y02t0LgB0VV7svs7MV8JKIJE
// SIG // 9Gvl1rgWm8B8qo/EUYmUEL3b2zquTURMTnh4mgrZFLEN
// SIG // NhEgHvQs/paATbbHwqvOOrt6LVhwiZapLw60q+5jAasH
// SIG // EWO3H4QBny75aTEqI6AJ5O0Xo/o3CZ2MSHjd+Bd4fScA
// SIG // DWN+tKBmAiEu6SzqLFlfm8boPbok2WBP13JcmDRel3c2
// SIG // f8w/+FOacU+DGUJswRrw7PvHA3QP7LWX4/68votF1GDR
// SIG // T4bqnPlCpMJv1zRwfgg7BkJfmUtBnG1FLp+FT04RyZup
// SIG // kQMC+cvM6bVhCKHG03kUk5mZ1GtomB9hDgVe3go8dEnW
// SIG // +pC3NcXRUXJA3kBkeCdchcsm7mbFD/MdHTrBBKC0Ljob
// SIG // ipQy0BIOw+mcZmSZ0vAdN3sJP0qVS6rG+ulNqsheAcA7
// SIG // dbmZIxGe34pyKFIEs+Ae31i2CHjtjgmMSBNF78LFaKfT
// SIG // 70102bRj885h1O+dxmqysrjOqGv6mk82L6wH1G+ymIb1
// SIG // UCsRlD5C/fniojOxtKnpyQha182T8EVqHHAEd9z4TRLr
// SIG // s8ymRSeA3mkwi4P/LitEOEIxUXn+Z+B/tikCBIm2e8yH
// SIG // gV944LKyAm880ptEF90kVZmR//wKqfGMZMHKCNVggYs7
// SIG // /OM/XqsEQXUOB2HDW0DDAgMBAAGjggE2MIIBMjAdBgNV
// SIG // HQ4EFgQU8wbmdGuuSc7ioc6Fm9uX+zcjcbwwHwYDVR0j
// SIG // BBgwFoAUn6cVXQBeYl2D9OXSZacbUzUZ6XIwXwYDVR0f
// SIG // BFgwVjBUoFKgUIZOaHR0cDovL3d3dy5taWNyb3NvZnQu
// SIG // Y29tL3BraW9wcy9jcmwvTWljcm9zb2Z0JTIwVGltZS1T
// SIG // dGFtcCUyMFBDQSUyMDIwMTAoMSkuY3JsMGwGCCsGAQUF
// SIG // BwEBBGAwXjBcBggrBgEFBQcwAoZQaHR0cDovL3d3dy5t
// SIG // aWNyb3NvZnQuY29tL3BraW9wcy9jZXJ0cy9NaWNyb3Nv
// SIG // ZnQlMjBUaW1lLVN0YW1wJTIwUENBJTIwMjAxMCgxKS5j
// SIG // cnQwDAYDVR0TAQH/BAIwADATBgNVHSUEDDAKBggrBgEF
// SIG // BQcDCDANBgkqhkiG9w0BAQsFAAOCAgEAzX/TqPc8oQuZ
// SIG // 9YwvIlOzSWN/RYs44cWcCWyWP2LcJ+t6ZTJU0mgaXq2p
// SIG // +eun7kaIxiUr9xMGbPka7jlNk/2UQ8eFR3rCx7XJRPBp
// SIG // jDNakzGmTy/CNha0Zn+TqKeBqnMTXTRAgQpVWZp9CsxX
// SIG // TzKkWuf9EegpoKiYdJrryJopIB7m76IbGrzxMsh0GveB
// SIG // w+PyzSnf2CGgiij8/UgOXwGuKYUOBL89mrmPUlJbiHeT
// SIG // CvR+XI1lcAcQr2AA/tQlvc+xrISZTY6gb1rSjuidAHpn
// SIG // 4Os9vIO6nOxv7Qra5R+P8tu8vrLbsFlzb8HbEndZbweD
// SIG // OtwLjJfWKemrv1xZJxsyTxep/7lkeiYUL84eNCC4Hk4S
// SIG // 5mIX/M/mg2+K9jgSxtT9gemgk1tmEJLe06VJ8yNHChq9
// SIG // tdwmyrRpPzjiB0rAzsWrJnhifhYlCQoldecId2mU/1U/
// SIG // z5C/ROIQwQMBrePRvPIEgjtMfY33Q2VnVhmxC15UpgNx
// SIG // D+Hk2Ku0a6JWNOBvHxrRdKc7mbuNwNvc2iPZSK+bpSkc
// SIG // /BKEB1OnLtD8VMNAfR/HAJL0MWjLpkWf+Hwm6jW+E3D5
// SIG // D3FjiNuEGJb6W7U/ad9X5WBJZnOcIxqZQJMv55CXE9B2
// SIG // RDV3p8VrT77eIHKKqaXiTwN0v9Q+eyi9+uu3qSK9Mldv
// SIG // dBNqLWWwFvAwggdxMIIFWaADAgECAhMzAAAAFcXna54C
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
// SIG // cGbyoYIC1zCCAkACAQEwggEAoYHYpIHVMIHSMQswCQYD
// SIG // VQQGEwJVUzETMBEGA1UECBMKV2FzaGluZ3RvbjEQMA4G
// SIG // A1UEBxMHUmVkbW9uZDEeMBwGA1UEChMVTWljcm9zb2Z0
// SIG // IENvcnBvcmF0aW9uMS0wKwYDVQQLEyRNaWNyb3NvZnQg
// SIG // SXJlbGFuZCBPcGVyYXRpb25zIExpbWl0ZWQxJjAkBgNV
// SIG // BAsTHVRoYWxlcyBUU1MgRVNOOkQwODItNEJGRC1FRUJB
// SIG // MSUwIwYDVQQDExxNaWNyb3NvZnQgVGltZS1TdGFtcCBT
// SIG // ZXJ2aWNloiMKAQEwBwYFKw4DAhoDFQA+TS+CBHbnSAcH
// SIG // RqAmldFgW0GaaqCBgzCBgKR+MHwxCzAJBgNVBAYTAlVT
// SIG // MRMwEQYDVQQIEwpXYXNoaW5ndG9uMRAwDgYDVQQHEwdS
// SIG // ZWRtb25kMR4wHAYDVQQKExVNaWNyb3NvZnQgQ29ycG9y
// SIG // YXRpb24xJjAkBgNVBAMTHU1pY3Jvc29mdCBUaW1lLVN0
// SIG // YW1wIFBDQSAyMDEwMA0GCSqGSIb3DQEBBQUAAgUA5mnC
// SIG // gTAiGA8yMDIyMDcwMjAyNTkxM1oYDzIwMjIwNzAzMDI1
// SIG // OTEzWjB3MD0GCisGAQQBhFkKBAExLzAtMAoCBQDmacKB
// SIG // AgEAMAoCAQACAg+kAgH/MAcCAQACAhFBMAoCBQDmaxQB
// SIG // AgEAMDYGCisGAQQBhFkKBAIxKDAmMAwGCisGAQQBhFkK
// SIG // AwKgCjAIAgEAAgMHoSChCjAIAgEAAgMBhqAwDQYJKoZI
// SIG // hvcNAQEFBQADgYEAI7qGCRipEOCP/nWsXFmOri0Rnrrc
// SIG // fej17Z75l4VYSr10K6abldv5YjDoRRDZ4KHH4fN2wTEC
// SIG // Dyu1jDEpaK5x+9UuqgV6FESgSgAGUR4gfEs16LX+KnI5
// SIG // Kbv1+qaxZq1+5pMsb2bywwaD4+6pCQxXWSRlWitrAkc4
// SIG // AEU0nh+AfMsxggQNMIIECQIBATCBkzB8MQswCQYDVQQG
// SIG // EwJVUzETMBEGA1UECBMKV2FzaGluZ3RvbjEQMA4GA1UE
// SIG // BxMHUmVkbW9uZDEeMBwGA1UEChMVTWljcm9zb2Z0IENv
// SIG // cnBvcmF0aW9uMSYwJAYDVQQDEx1NaWNyb3NvZnQgVGlt
// SIG // ZS1TdGFtcCBQQ0EgMjAxMAITMwAAAY/zUajrWnLdzAAB
// SIG // AAABjzANBglghkgBZQMEAgEFAKCCAUowGgYJKoZIhvcN
// SIG // AQkDMQ0GCyqGSIb3DQEJEAEEMC8GCSqGSIb3DQEJBDEi
// SIG // BCC8fXaIK2vLQ4lUJhC9lTTKIPVJDcA8Ien7qRoGLBaY
// SIG // XzCB+gYLKoZIhvcNAQkQAi8xgeowgecwgeQwgb0EIJdy
// SIG // BU/ixsYLlY4ipttiLZjunRQ1lvJ0obujuoPMhccfMIGY
// SIG // MIGApH4wfDELMAkGA1UEBhMCVVMxEzARBgNVBAgTCldh
// SIG // c2hpbmd0b24xEDAOBgNVBAcTB1JlZG1vbmQxHjAcBgNV
// SIG // BAoTFU1pY3Jvc29mdCBDb3Jwb3JhdGlvbjEmMCQGA1UE
// SIG // AxMdTWljcm9zb2Z0IFRpbWUtU3RhbXAgUENBIDIwMTAC
// SIG // EzMAAAGP81Go61py3cwAAQAAAY8wIgQgfLA2yikUcK4L
// SIG // a1vgiLgWcaXfBajNLhshgfKWOZC5DgowDQYJKoZIhvcN
// SIG // AQELBQAEggIAflEonIdog5Fluj5zWQyXMCHwWo7ZIrXS
// SIG // 2+EWGJjzmliZjx/k0FMAo09OHNwyi5DCd3cY08WNfmSk
// SIG // Q9ezm0s5a2qUJj+NI36keweFjb10hQup4gD0mbDYi04R
// SIG // TAhdUSkdKph+ooPpoO68E4RM5pBjUG7KF3VMeQi/9XnB
// SIG // 0/NKoFuI3iYIwhy36y+LtZFSOEwCXQzWpptXUHeFrC4X
// SIG // pK/z4bSdIxWM2eNEhX/LrZD1xAgCfJ+Zesq2mzN3RdzM
// SIG // m8vOYZyNo1baqfWhjBhH4INXFO+7nSFH3nFXcHNpTNHO
// SIG // vc8duEeRgGjbHKsOi7+Js9W2QzuiQWxV6wiBxZG38LeU
// SIG // N86QOFegk2Az+rwetKMlDbSzkuUbkEXi8kXE1vTVa3jI
// SIG // IN3sJLWpa8Kg0XFIEArYzJx9wN7KoAB5hwPA4dEgCyKO
// SIG // M7pQjJ5bBFrCqjoiJCzum5I3zD8IC39Dp4d2cpgZgmka
// SIG // 1VKpVJoibdBLWl5jM58J4F3HCKT7XQgobxQsk7FhqJBt
// SIG // /Ay3+fho32OXaJYTsHq0RFjZVBB4BJsaEGSVhDgHK4xM
// SIG // PPGTovQlMHhVjbYiAgYCuIa8oRJLvYQGppUZ9+ayR7tc
// SIG // i7nXHVe9ou6Et6RdawmKXcyGbO70z71k+DUmDO9XeJjC
// SIG // jR49dmn9IJvNtri1l7ji7X8i7oCdKc1GuAg=
// SIG // End signature block
