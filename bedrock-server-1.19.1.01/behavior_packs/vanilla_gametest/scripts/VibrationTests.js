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

    const placeAtPos = new BlockLocation(9, 4, 4);
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
// SIG // MIInvQYJKoZIhvcNAQcCoIInrjCCJ6oCAQExDzANBglg
// SIG // hkgBZQMEAgEFADB3BgorBgEEAYI3AgEEoGkwZzAyBgor
// SIG // BgEEAYI3AgEeMCQCAQEEEBDgyQbOONQRoqMAEEvTUJAC
// SIG // AQACAQACAQACAQACAQAwMTANBglghkgBZQMEAgEFAAQg
// SIG // CB5pSQ8ITA+uUDqWag7DpxdvbbD+DPvYR4EC2fddE8+g
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
// SIG // SEXAQsmbdlsKgEhr/Xmfwb1tbWrJUnMTDXpQzTGCGZQw
// SIG // ghmQAgEBMIGVMH4xCzAJBgNVBAYTAlVTMRMwEQYDVQQI
// SIG // EwpXYXNoaW5ndG9uMRAwDgYDVQQHEwdSZWRtb25kMR4w
// SIG // HAYDVQQKExVNaWNyb3NvZnQgQ29ycG9yYXRpb24xKDAm
// SIG // BgNVBAMTH01pY3Jvc29mdCBDb2RlIFNpZ25pbmcgUENB
// SIG // IDIwMTECEzMAAAJSizOq+JXzOdsAAAAAAlIwDQYJYIZI
// SIG // AWUDBAIBBQCggcAwGQYJKoZIhvcNAQkDMQwGCisGAQQB
// SIG // gjcCAQQwHAYKKwYBBAGCNwIBCzEOMAwGCisGAQQBgjcC
// SIG // ARUwLwYJKoZIhvcNAQkEMSIEINOFI2DlPLNOHcItn1p3
// SIG // f9mFy1/fOO7p0QE+BpJLwQoAMFQGCisGAQQBgjcCAQwx
// SIG // RjBEoCSAIgBNAGkAbgBlAGMAcgBhAGYAdAAgAEIAZQBk
// SIG // AHIAbwBjAGuhHIAaaHR0cHM6Ly93d3cubWluZWNyYWZ0
// SIG // Lm5ldC8wDQYJKoZIhvcNAQEBBQAEggEAe+3o0eOZlk6n
// SIG // GjIucDMeNO6aUWmWVzRE5b7omBs1jUyT9mDSo4nrBMFB
// SIG // Bc804LCdoYRW3M+9aT4kX5/lZraX6+N886q882Gxz/XT
// SIG // ahmkTnjG+c5sXui5uERBN9b0IdMRd3ngC7+u5DheFe+J
// SIG // lqJZbvBYCqODFczaK0K41rIhDlgiskkR2aZiDn2UfBag
// SIG // K8KdbHjsOvEc+b82Bt2gQXHVjdMBErbU3F3SSIElgX7g
// SIG // qIRJxJzGYVPyzmlIHCe+FwxjZAXWTujxewmQZ+FZzNB6
// SIG // kPsdm3C2Q0xhhOiUzK0CBP+Rf/zipdXKL9pQlyEDVeMd
// SIG // 87Wgfym/fh2ZMOTdC9ngKaGCFwwwghcIBgorBgEEAYI3
// SIG // AwMBMYIW+DCCFvQGCSqGSIb3DQEHAqCCFuUwghbhAgED
// SIG // MQ8wDQYJYIZIAWUDBAIBBQAwggFVBgsqhkiG9w0BCRAB
// SIG // BKCCAUQEggFAMIIBPAIBAQYKKwYBBAGEWQoDATAxMA0G
// SIG // CWCGSAFlAwQCAQUABCB8VR4lcELZarEBRgTtxs1aNmaP
// SIG // fDgdroKlKEM8Wnv8qgIGYoTc4g0iGBMyMDIyMDUyNzAw
// SIG // NTAyOS4yOTZaMASAAgH0oIHUpIHRMIHOMQswCQYDVQQG
// SIG // EwJVUzETMBEGA1UECBMKV2FzaGluZ3RvbjEQMA4GA1UE
// SIG // BxMHUmVkbW9uZDEeMBwGA1UEChMVTWljcm9zb2Z0IENv
// SIG // cnBvcmF0aW9uMSkwJwYDVQQLEyBNaWNyb3NvZnQgT3Bl
// SIG // cmF0aW9ucyBQdWVydG8gUmljbzEmMCQGA1UECxMdVGhh
// SIG // bGVzIFRTUyBFU046Nzg4MC1FMzkwLTgwMTQxJTAjBgNV
// SIG // BAMTHE1pY3Jvc29mdCBUaW1lLVN0YW1wIFNlcnZpY2Wg
// SIG // ghFfMIIHEDCCBPigAwIBAgITMwAAAahV8GGpzDAYXAAB
// SIG // AAABqDANBgkqhkiG9w0BAQsFADB8MQswCQYDVQQGEwJV
// SIG // UzETMBEGA1UECBMKV2FzaGluZ3RvbjEQMA4GA1UEBxMH
// SIG // UmVkbW9uZDEeMBwGA1UEChMVTWljcm9zb2Z0IENvcnBv
// SIG // cmF0aW9uMSYwJAYDVQQDEx1NaWNyb3NvZnQgVGltZS1T
// SIG // dGFtcCBQQ0EgMjAxMDAeFw0yMjAzMDIxODUxMjNaFw0y
// SIG // MzA1MTExODUxMjNaMIHOMQswCQYDVQQGEwJVUzETMBEG
// SIG // A1UECBMKV2FzaGluZ3RvbjEQMA4GA1UEBxMHUmVkbW9u
// SIG // ZDEeMBwGA1UEChMVTWljcm9zb2Z0IENvcnBvcmF0aW9u
// SIG // MSkwJwYDVQQLEyBNaWNyb3NvZnQgT3BlcmF0aW9ucyBQ
// SIG // dWVydG8gUmljbzEmMCQGA1UECxMdVGhhbGVzIFRTUyBF
// SIG // U046Nzg4MC1FMzkwLTgwMTQxJTAjBgNVBAMTHE1pY3Jv
// SIG // c29mdCBUaW1lLVN0YW1wIFNlcnZpY2UwggIiMA0GCSqG
// SIG // SIb3DQEBAQUAA4ICDwAwggIKAoICAQCj2m3KwC4l1/KY
// SIG // 8l6XDDfPSk73JpQIg8OKVPh3o2YYm1HqPx1Mvj/VcVoQ
// SIG // l+6IHnijyeu+/i3lXT3RuYU7xg4ErqN8PgHJs3F2dkAh
// SIG // lIFEXi1Cm5q69OmwdMYb7WcKHpYcbT5IyRbG0xrUrfle
// SIG // xOFQoz3WKkGf4jdAK115oGxH1cgsEvodrqKAYTOVHGz6
// SIG // ILa+VaYHc21DOP61rqZhVYzwdWrJ9/sL+2gQivI/UFCa
// SIG // 6GOMtaZmUn9ErhjFmO3JtnL623Zu15XZY6kXR1vgkAAe
// SIG // BKojqoLpn0fmkqaOU++ShtPp7AZI5RkrFNQYteaeKz/P
// SIG // KWZ0qKe9xnpvRljthkS8D9eWBJyrHM8YRmPmfDRGtEMD
// SIG // DIlZZLHT1OyeaivYMQEIzic6iEic4SMEFrRC6oCaB8JK
// SIG // k8Xpt4K2Owewzs0E50KSlqC9B1kfSqiL2gu4vV5T7/rn
// SIG // vPY/Xu35geJ4dYbpcxCc1+kTFPUxyTJWzujqz9zTRCiV
// SIG // vI4qQp8vB9X7r0rhX7ge7fviivYNnNjSruRM0rNZyjar
// SIG // ZeCjt1M8ly1r00QzuA+T1UDnWtLao0vwFqFK8SguWT5Z
// SIG // CxPmD7EuRvhP1QoAmoIT8gWbBzSu8B5Un/9uroS5yqel
// SIG // 0QCK6IhGJf+cltJkoY75wET69BiJUptCq6ksAo0eXJFk
// SIG // 9bCmhG/MNwIDAQABo4IBNjCCATIwHQYDVR0OBBYEFDbH
// SIG // 2+Pi+FLrZTYfzMYxpI9JCyLVMB8GA1UdIwQYMBaAFJ+n
// SIG // FV0AXmJdg/Tl0mWnG1M1GelyMF8GA1UdHwRYMFYwVKBS
// SIG // oFCGTmh0dHA6Ly93d3cubWljcm9zb2Z0LmNvbS9wa2lv
// SIG // cHMvY3JsL01pY3Jvc29mdCUyMFRpbWUtU3RhbXAlMjBQ
// SIG // Q0ElMjAyMDEwKDEpLmNybDBsBggrBgEFBQcBAQRgMF4w
// SIG // XAYIKwYBBQUHMAKGUGh0dHA6Ly93d3cubWljcm9zb2Z0
// SIG // LmNvbS9wa2lvcHMvY2VydHMvTWljcm9zb2Z0JTIwVGlt
// SIG // ZS1TdGFtcCUyMFBDQSUyMDIwMTAoMSkuY3J0MAwGA1Ud
// SIG // EwEB/wQCMAAwEwYDVR0lBAwwCgYIKwYBBQUHAwgwDQYJ
// SIG // KoZIhvcNAQELBQADggIBAHE7gktkaqpn9pj6+jlMnYZl
// SIG // Mfpur6RD7M1oqCV257EW58utpxfWF0yrkjVh9UBX8nP9
// SIG // jd2ExKeIRPGLYWCoAzPx1IVERF91k8BrHmLrg3ksVkSV
// SIG // gqKwBxdZMEMyCoK1HNxvrlcAJhvxCNRC0RMQOH7cdBIa
// SIG // 3+fWiZuzp4J9JU0koilHrhgPjMuqAov1fBE8c/nm5b0A
// SIG // DWpbSYBn6abll2E+I4rEChE76CYwb+cfgQNKBBbu4Bmn
// SIG // jA5GY5zub3X+h3ip3iC7PWb8CFpIGEItmXqM28YJRuWM
// SIG // BMaIsXpMa0Uw2cDKJCGMV5nHLHENMV5ofiN76O4VfWTC
// SIG // k2vT2s+Z3uHHPDncNU/utuJgdFmlvRwBNYaIwegm37p3
// SIG // bVf48MZnSodeaZSV5zdcjOzi/duB6gIiYrB2p6ThCeFJ
// SIG // vW94RVFxNrhCS/WmLiIJLFWCKtT9va0eF+5c97hCR+gj
// SIG // pKBOvlHGrjeiWBYITfSPCUQVgIR1+BkB5Z4LHX7Viy4g
// SIG // 2TMp5YEQmc5GCNuDfXMfg9+u2MHJajWOgmbgIM8Mtdrk
// SIG // WBUGrGB2CtYac8k7biPwNgfHBvhzOl9Y39nfbgEcB+vo
// SIG // S5D7bd/+TQZS16TpeYmckZQYu4g15FjWt47hnywCdyEg
// SIG // 8jYe8rvh+MkGMkbPzFawpFlCbPRIryyrDSdgfyIza0rW
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
// SIG // f9lwY1NNje6CbaUFEMFxBmoQtB1VM1izoXBm8qGCAtIw
// SIG // ggI7AgEBMIH8oYHUpIHRMIHOMQswCQYDVQQGEwJVUzET
// SIG // MBEGA1UECBMKV2FzaGluZ3RvbjEQMA4GA1UEBxMHUmVk
// SIG // bW9uZDEeMBwGA1UEChMVTWljcm9zb2Z0IENvcnBvcmF0
// SIG // aW9uMSkwJwYDVQQLEyBNaWNyb3NvZnQgT3BlcmF0aW9u
// SIG // cyBQdWVydG8gUmljbzEmMCQGA1UECxMdVGhhbGVzIFRT
// SIG // UyBFU046Nzg4MC1FMzkwLTgwMTQxJTAjBgNVBAMTHE1p
// SIG // Y3Jvc29mdCBUaW1lLVN0YW1wIFNlcnZpY2WiIwoBATAH
// SIG // BgUrDgMCGgMVAGy6/MSfQQeKy+GIOfF9S2eYkHcsoIGD
// SIG // MIGApH4wfDELMAkGA1UEBhMCVVMxEzARBgNVBAgTCldh
// SIG // c2hpbmd0b24xEDAOBgNVBAcTB1JlZG1vbmQxHjAcBgNV
// SIG // BAoTFU1pY3Jvc29mdCBDb3Jwb3JhdGlvbjEmMCQGA1UE
// SIG // AxMdTWljcm9zb2Z0IFRpbWUtU3RhbXAgUENBIDIwMTAw
// SIG // DQYJKoZIhvcNAQEFBQACBQDmOo/MMCIYDzIwMjIwNTI3
// SIG // MDM0NjIwWhgPMjAyMjA1MjgwMzQ2MjBaMHcwPQYKKwYB
// SIG // BAGEWQoEATEvMC0wCgIFAOY6j8wCAQAwCgIBAAICEy8C
// SIG // Af8wBwIBAAICE1swCgIFAOY74UwCAQAwNgYKKwYBBAGE
// SIG // WQoEAjEoMCYwDAYKKwYBBAGEWQoDAqAKMAgCAQACAweh
// SIG // IKEKMAgCAQACAwGGoDANBgkqhkiG9w0BAQUFAAOBgQCH
// SIG // 4Qd7XQcRBM0FoKSGogxvwMm7NJqEYfuoNZv8fSY6UNER
// SIG // zg2H0ozXwfLMGuB6Giemv71BLcrMXBJw4D0VOmcnnLRA
// SIG // k2ohzs5CNKVxmfbhyV+/E48au7OneJ7873vgSiFZ5fX1
// SIG // 4lh1l/U5dDHm9A0+NOr8Z3tmoF6A7SQCItb9ujGCBA0w
// SIG // ggQJAgEBMIGTMHwxCzAJBgNVBAYTAlVTMRMwEQYDVQQI
// SIG // EwpXYXNoaW5ndG9uMRAwDgYDVQQHEwdSZWRtb25kMR4w
// SIG // HAYDVQQKExVNaWNyb3NvZnQgQ29ycG9yYXRpb24xJjAk
// SIG // BgNVBAMTHU1pY3Jvc29mdCBUaW1lLVN0YW1wIFBDQSAy
// SIG // MDEwAhMzAAABqFXwYanMMBhcAAEAAAGoMA0GCWCGSAFl
// SIG // AwQCAQUAoIIBSjAaBgkqhkiG9w0BCQMxDQYLKoZIhvcN
// SIG // AQkQAQQwLwYJKoZIhvcNAQkEMSIEIOvLex+AinbYI2M/
// SIG // uhwiYEe/+9nyKqyS0v+Q+zUVDy3IMIH6BgsqhkiG9w0B
// SIG // CRACLzGB6jCB5zCB5DCBvQQgdP7LHQDLB8JzcIXxQVz5
// SIG // RZ0b1oR6kl/WC1MQQ5dcZaYwgZgwgYCkfjB8MQswCQYD
// SIG // VQQGEwJVUzETMBEGA1UECBMKV2FzaGluZ3RvbjEQMA4G
// SIG // A1UEBxMHUmVkbW9uZDEeMBwGA1UEChMVTWljcm9zb2Z0
// SIG // IENvcnBvcmF0aW9uMSYwJAYDVQQDEx1NaWNyb3NvZnQg
// SIG // VGltZS1TdGFtcCBQQ0EgMjAxMAITMwAAAahV8GGpzDAY
// SIG // XAABAAABqDAiBCBsXcLKitO/vEvTsgqRG53ymnq+InS+
// SIG // eGPZ5e6lwpWhFDANBgkqhkiG9w0BAQsFAASCAgA9rW5s
// SIG // MqxoslAUfvfikjG28QOzGMcNapbrurV5vKGDEvoInX1K
// SIG // bYGKsmysgZkf0QesYzl86Cm7EAbGTQa+2TjtChVLoGp3
// SIG // gGcw3tHeVJZOCV37TK6+DfldbQbMPXYXSIIzNZMCAHbP
// SIG // 54Sd3IC7wXm9sB6kFxc8xKtqT6un0rg8r9kbU4rNohoa
// SIG // 1mWyfeex0l3gswU9H7ax4yF5LEoLRbJLHV9u2ZuVTVzz
// SIG // Au4S8/eUL4GWbrjubQ7wqupaNOa2EB7cAKWm1FQFzbtq
// SIG // 6O6j5pQKDA0RybYraDgwXs7Oz2Zs4PIMWh715qIqkKU3
// SIG // qHqXOtiGXO4Q4RDpIaWF2ue1yH8AEjIAx3y5Lubz1zZ9
// SIG // J6/7J828F9uwOFADuZp17V4LxyKVKja8FdwFbo8i1ZNc
// SIG // hNiJuvv5GXCbDbDz+jT1hYLwEaK/f4AGBT3GT6CHnV/h
// SIG // HKU8VTy6w8wQEElHgjkKR/FHQPWx1Ard5kNw10Zwdeyq
// SIG // UgafELx96nSvSBkZuE7/JfnK9bvqUrhA/yD43h1htW8s
// SIG // L7jZu7xFOsOVOTPG5UxHogsoyO33u0RAi5kKVKoE+dCI
// SIG // jy+c21qXGlW60mB8oVXGzZmaxgqrPzQHCBXhne3T3QEW
// SIG // BkCm0FH2zTQwK2UibnY/ViGULf11LU2gSR6/tpa6IVBi
// SIG // CVXMKbX12v8O97ADvA==
// SIG // End signature block
