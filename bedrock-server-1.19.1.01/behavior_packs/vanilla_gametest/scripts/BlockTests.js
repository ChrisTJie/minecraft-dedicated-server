import * as GameTest from "mojang-gametest";
import {
  BlockLocation,
  MinecraftBlockTypes,
  MinecraftItemTypes,
  BlockProperties,
  Direction,
  world,
  Location,
} from "mojang-minecraft";
import GameTestExtensions from "./GameTestExtensions.js";

const TicksPerSecond = 20;
const FiveSecondsInTicks = 5 * TicksPerSecond;

const FALLING_SAND_TEMPLATE_NAME = "BlockTests:falling_sand_template";
const FALLING_SAND_STARTUP_TICKS = 1;
const FALLING_SAND_TIMEOUT_TICKS = 20;

const BLOCKS_THAT_POP_SAND = [
  [MinecraftBlockTypes.woodenSlab, MinecraftBlockTypes.air], //replace missing oakSlab() with woodenSlab()
  [MinecraftBlockTypes.chest, MinecraftBlockTypes.stone],
  [MinecraftBlockTypes.rail, MinecraftBlockTypes.stone],
  [MinecraftBlockTypes.stoneButton, MinecraftBlockTypes.stone],
  [MinecraftBlockTypes.woodenPressurePlate, MinecraftBlockTypes.stone], //replace missing OakPressurePlate() with woodenPressurePlate()
  [MinecraftBlockTypes.torch, MinecraftBlockTypes.stone],
  [MinecraftBlockTypes.soulSand, MinecraftBlockTypes.air],
];

const BLOCKS_REPLACED_BY_SAND = [
  MinecraftBlockTypes.water,
  MinecraftBlockTypes.air,
  MinecraftBlockTypes.tallgrass, //replace grass() with tallgrass(). It needs grass, not grass block, MinecraftBlockTypes.grass is actually grass block.
];

const BLOCKS_THAT_SUPPORT_SAND = [
  MinecraftBlockTypes.stone,
  MinecraftBlockTypes.fence, //replace missing oakFence() with fence()
  MinecraftBlockTypes.oakStairs,
  MinecraftBlockTypes.scaffolding,
];

function testThatFallingSandPopsIntoItem(test) {
  test.setBlockType(MinecraftBlockTypes.sand, new BlockLocation(1, 4, 1));
  const targetPos = new BlockLocation(1, 2, 1);

  test.succeedWhen(() => {
    test.assertEntityPresentInArea("minecraft:item", true);
    test.assertEntityPresent("minecraft:falling_block", targetPos, false);
  });
}

function testThatFallingSandReplaces(test) {
  test.setBlockType(MinecraftBlockTypes.sand, new BlockLocation(1, 4, 1));
  test.succeedWhenBlockPresent(MinecraftBlockTypes.sand, new BlockLocation(1, 2, 1), true);
}

function testThatFallingSandLandsOnTop(test) {
  test.setBlockType(MinecraftBlockTypes.sand, new BlockLocation(1, 4, 1));
  test.succeedWhenBlockPresent(MinecraftBlockTypes.sand, new BlockLocation(1, 3, 1), true);
}

///
// Concrete Tests
///
for (let i = 0; i < BLOCKS_THAT_POP_SAND.length; i++) {
  const topBlock = BLOCKS_THAT_POP_SAND[i][0];
  const bottomBlock = BLOCKS_THAT_POP_SAND[i][1];
  const testName = "blocktests.falling_sand_pops_on_" + topBlock.id;
  let tag = null;

  GameTest.register("BlockTests", testName, (test) => {
    if (topBlock.id == "minecraft:stone_button") {
      const buttonPermutation = MinecraftBlockTypes.stoneButton.createDefaultBlockPermutation();
      buttonPermutation.getProperty(BlockProperties.facingDirection).value = Direction.north;
      test.setBlockPermutation(buttonPermutation, new BlockLocation(1, 2, 1));
    } else {
      test.setBlockType(topBlock, new BlockLocation(1, 2, 1));
    }
    test.setBlockType(bottomBlock, new BlockLocation(1, 1, 1));
    testThatFallingSandPopsIntoItem(test);
  })
    .batch("day")
    .structureName(FALLING_SAND_TEMPLATE_NAME)
    .maxTicks(FALLING_SAND_TIMEOUT_TICKS)
    .setupTicks(FALLING_SAND_STARTUP_TICKS)
    .required(true)
    .tag(GameTest.Tags.suiteDefault);
}

for (const block of BLOCKS_REPLACED_BY_SAND) {
  const testName = "blocktests.falling_sand_replaces_" + block.id;

  GameTest.register("BlockTests", testName, (test) => {
    //SetBlock will fail if set a block to what it already is. Skip to call setblock() for test falling_sand_replaces_air because it's just air block in initial structure.
    if (block.id != "minecraft:air") {
      test.setBlockType(block, new BlockLocation(1, 2, 1));
    }
    testThatFallingSandReplaces(test);
  })
    .batch("day")
    .structureName(FALLING_SAND_TEMPLATE_NAME)
    .maxTicks(FALLING_SAND_TIMEOUT_TICKS)
    .setupTicks(FALLING_SAND_STARTUP_TICKS)
    .required(true)
    .tag(GameTest.Tags.suiteDefault);
}

for (const block of BLOCKS_THAT_SUPPORT_SAND) {
  const testName = "blocktests.falling_sand_lands_on_" + block.id;
  let tag = null;

  GameTest.register("BlockTests", testName, (test) => {
    test.setBlockType(block, new BlockLocation(1, 2, 1));
    testThatFallingSandLandsOnTop(test);
  })
    .batch("day")
    .structureName(FALLING_SAND_TEMPLATE_NAME)
    .maxTicks(FALLING_SAND_TIMEOUT_TICKS)
    .setupTicks(FALLING_SAND_STARTUP_TICKS)
    .required(true)
    .tag(GameTest.Tags.suiteDefault);
}

GameTest.register("BlockTests", "concrete_solidifies_in_shallow_water", (test) => {
  test.setBlockType(MinecraftBlockTypes.concretePowder, new BlockLocation(1, 3, 1));

  test.succeedWhen(() => {
    test.assertBlockPresent(MinecraftBlockTypes.concrete, new BlockLocation(1, 2, 1), true);
  });
})
  .maxTicks(FiveSecondsInTicks)
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("BlockTests", "concrete_solidifies_in_deep_water", (test) => {
  test.setBlockType(MinecraftBlockTypes.concretePowder, new BlockLocation(1, 4, 1));

  test.succeedWhen(() => {
    test.assertBlockPresent(MinecraftBlockTypes.concrete, new BlockLocation(1, 2, 1), true);
  });
})
  .maxTicks(FiveSecondsInTicks)
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("BlockTests", "concrete_solidifies_next_to_water", (test) => {
  test.setBlockType(MinecraftBlockTypes.concretePowder, new BlockLocation(1, 3, 1));

  test.succeedWhen(() => {
    test.assertBlockPresent(MinecraftBlockTypes.concrete, new BlockLocation(1, 2, 1), true);
  });
})
  .maxTicks(FiveSecondsInTicks)
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("BlockTests", "sand_fall_boats", (test) => {
  test.setBlockType(MinecraftBlockTypes.sand, new BlockLocation(1, 4, 1));

  test.succeedWhen(() => {
    test.assertBlockPresent(MinecraftBlockTypes.sand, new BlockLocation(1, 2, 1), true);
  });
})
  .maxTicks(FiveSecondsInTicks)
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("BlockTests", "sand_fall_shulker", (test) => {
  const EntitySpawnType = "minecraft:shulker";
  const spawnPos = new BlockLocation(1, 2, 1);

  test.spawn(EntitySpawnType, spawnPos);
  testThatFallingSandPopsIntoItem(test);
})
  .maxTicks(FiveSecondsInTicks)
  .tag(GameTest.Tags.suiteDefault);

///
// Turtle Egg Tests
///

GameTest.register("BlockTests", "turtle_eggs_survive_xp", (test) => {
  const xpOrb = "minecraft:xp_orb";
  const spawnPos = new BlockLocation(1, 3, 1);

  for (let i = 0; i < 8; i++) {
    test.spawn(xpOrb, spawnPos);
  }

  // Fail if the turtle egg dies
  test.failIf(() => {
    test.assertBlockPresent(MinecraftBlockTypes.air, new BlockLocation(1, 2, 1), true);
  });

  // Succeed after 4 seconds
  test.startSequence().thenIdle(80).thenSucceed();
})
  .maxTicks(FiveSecondsInTicks)
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("BlockTests", "turtle_eggs_survive_item", (test) => {
  test.pressButton(new BlockLocation(2, 4, 0));

  // Fail if the turtle egg dies
  test.failIf(() => {
    test.assertBlockPresent(MinecraftBlockTypes.air, new BlockLocation(1, 2, 1), true);
  });

  // Succeed after 4 seconds
  test.startSequence().thenIdle(80).thenSucceed();
})
  .maxTicks(FiveSecondsInTicks)
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("BlockTests", "turtle_eggs_squished_by_mob", (test) => {
  const zombieEntityType = "minecraft:husk";
  const zombiePosition = new BlockLocation(1, 5, 1);
  test.spawn(zombieEntityType, zombiePosition);
  test.succeedWhenBlockPresent(MinecraftBlockTypes.air, new BlockLocation(1, 2, 1), true);
})
  .required(false)
  .maxTicks(TicksPerSecond * 20)
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("BlockTests", "explosion_drop_location", (test) => {
  test.pressButton(new BlockLocation(4, 3, 4));

  test.succeedWhen(() => {
    const redSandstonePos = new BlockLocation(6, 2, 4);
    const sandstonePos = new BlockLocation(2, 2, 4);

    test.assertBlockPresent(MinecraftBlockTypes.redSandstone, redSandstonePos, false);
    test.assertBlockPresent(MinecraftBlockTypes.sandstone, sandstonePos, false);
    test.assertItemEntityPresent(MinecraftItemTypes.redSandstone, redSandstonePos, 2.0, true);
    test.assertItemEntityPresent(MinecraftItemTypes.sandstone, sandstonePos, 2.0, true);
  });
})
  .maxTicks(TicksPerSecond * 10)
  .tag("suite:java_parity")
  .tag(GameTest.Tags.suiteDisabled) //redSandstone and sandstone items should be present.
  .maxAttempts(3);

GameTest.register("BlockTests", "concrete_pops_off_waterlogged_chest", (test) => {
  test.setBlockType(MinecraftBlockTypes.concretePowder, new BlockLocation(1, 4, 1));
  test.succeedWhen(() => {
    const chestPos = new BlockLocation(1, 2, 1);
    test.assertBlockPresent(MinecraftBlockTypes.chest, chestPos, true);
    test.assertItemEntityPresent(MinecraftItemTypes.concretePowder, chestPos, 2, true);
    test.assertEntityPresentInArea("falling_block", false);
  });
})
  .maxTicks(TicksPerSecond * 5)
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("BlockTests", "waterlogged_slab", (test) => {
  const slabPos = new BlockLocation(1, 1, 1);
  test.assertIsWaterlogged(slabPos, false);
  test.succeedWhen(() => {
    test.assertIsWaterlogged(slabPos, true);
  });
})
  .tag("suite:java_parity")
  .tag(GameTest.Tags.suiteDisabled) // Slab should be waterlogged
  .maxTicks(TicksPerSecond * 2);

GameTest.register("BlockTests", "dispenser_light_candles", (test) => {
  const testEx = new GameTestExtensions(test);
  test.pressButton(new BlockLocation(1, 3, 0));
  test.pressButton(new BlockLocation(1, 3, 2));

  test.succeedWhen(() => {
    testEx.assertBlockProperty("lit", 1, new BlockLocation(0, 2, 0));
    testEx.assertBlockProperty("lit", 1, new BlockLocation(0, 2, 2));
  });
}).tag(GameTest.Tags.suiteDefault);

GameTest.register("BlockTests", "put_out_candles", (test) => {
  const player = test.spawnSimulatedPlayer(new BlockLocation(0, 2, 0));
  const testEx = new GameTestExtensions(test);
  const candlePos = new BlockLocation(0, 2, 0);

  test
    .startSequence()
    .thenExecuteAfter(5, () => {
      player.interactWithBlock(candlePos);
    })
    .thenWait(() => {
      testEx.assertBlockProperty("lit", 0, candlePos);
    })
    .thenSucceed();
}).tag(GameTest.Tags.suiteDefault);

///
// Big Dripleaf Tests
///
const platformStructure = "ComponentTests:platform";

GameTest.register("BlockTests", "dripleaf_player_fall", (test) => {
  test.setBlockType(MinecraftBlockTypes.bigDripleaf, new BlockLocation(1, 2, 1));
  let playerSim = test.spawnSimulatedPlayer(new BlockLocation(1, 4, 1));
  test
    .startSequence()
    .thenExecuteAfter(40, () => test.assertEntityPresent("player", new BlockLocation(1, 2, 1), true))
    .thenSucceed();
})
  .structureName(platformStructure)
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("BlockTests", "dripleaf_walk_across", (test) => {
  test.setBlockType(MinecraftBlockTypes.bigDripleaf, new BlockLocation(1, 2, 0));
  test.setBlockType(MinecraftBlockTypes.bigDripleaf, new BlockLocation(1, 2, 1));
  test.setBlockType(MinecraftBlockTypes.smoothStone, new BlockLocation(1, 2, 2));
  let playerSim = test.spawnSimulatedPlayer(new BlockLocation(1, 4, 0));
  test
    .startSequence()
    .thenExecuteAfter(10, () => test.assertEntityPresent("player", new BlockLocation(1, 3, 2), false))
    .thenExecute(() => playerSim.moveToLocation(new Location(1, 3, 2.5)))
    .thenExecuteAfter(40, () => test.assertEntityPresent("player", new BlockLocation(1, 3, 2)))
    .thenSucceed();
})
  .structureName(platformStructure)
  .tag(GameTest.Tags.suiteDefault);

///
// Powder snow tests
///

GameTest.register("BlockTests", "powder_snow_player_sink_and_freeze", (test) => {
  test.setBlockType(MinecraftBlockTypes.powderSnow, new BlockLocation(1, 2, 1));
  let playerSim = test.spawnSimulatedPlayer(new BlockLocation(1, 3, 1));
  let healthComp = playerSim.getComponent("health");
  test
    .startSequence()
    .thenExecuteAfter(180, () => test.assert(healthComp.current < healthComp.value, "no damage"))
    .thenExecute(() => test.assertEntityInstancePresent(playerSim, new BlockLocation(1, 2, 1)))
    .thenSucceed();
})
  .maxTicks(200)
  .structureName(platformStructure)
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("BlockTests", "powder_snow_leather_boots_walk", (test) => {
  test.setBlockType(MinecraftBlockTypes.powderSnow, new BlockLocation(1, 2, 0));
  test.setBlockType(MinecraftBlockTypes.powderSnow, new BlockLocation(1, 2, 1));
  test.setBlockType(MinecraftBlockTypes.powderSnow, new BlockLocation(1, 2, 2));
  let playerSim = test.spawnSimulatedPlayer(new BlockLocation(1, 5, 0), "playerSim_snow");
  test
    .startSequence()
    .thenExecuteAfter(5, () => {
      playerSim.dimension.runCommand("replaceitem entity playerSim_snow slot.armor.feet 0 leather_boots");
    })
    .thenExecuteAfter(10, () => playerSim.moveToLocation(new Location(1, 3, 2.5)))
    .thenExecuteAfter(40, () => test.assertEntityPresent("player", new BlockLocation(1, 4, 2)))
    .thenSucceed();
})
  .structureName(platformStructure)
  .tag(GameTest.Tags.suiteDefault);

///
// Candle cake tests
///

GameTest.register("BlockTests", "player_light_birthday_cake_candle", (test) => {
  let playerSim = test.spawnSimulatedPlayer(new BlockLocation(1, 2, 0), "playerSim_cake");
  test.setBlockType(MinecraftBlockTypes.cake, new BlockLocation(1, 2, 1));
  const testEx = new GameTestExtensions(test);

  test
    .startSequence()
    .thenExecuteAfter(20, () => testEx.giveItem(playerSim, MinecraftItemTypes.candle, 1, 0))
    .thenExecute(() => test.assert(playerSim.interactWithBlock(new BlockLocation(1, 2, 1), Direction.up), ""))
    .thenExecute(() => testEx.giveItem(playerSim, MinecraftItemTypes.flintAndSteel, 1, 0))
    .thenExecute(() => test.assert(playerSim.interactWithBlock(new BlockLocation(1, 2, 1), Direction.up), ""))
    .thenExecute(() => testEx.assertBlockProperty("lit", 1, new BlockLocation(1, 2, 1)))
    .thenSucceed();
})
  .structureName(platformStructure)
  .tag(GameTest.Tags.suiteDefault);

// SIG // Begin signature block
// SIG // MIInsQYJKoZIhvcNAQcCoIInojCCJ54CAQExDzANBglg
// SIG // hkgBZQMEAgEFADB3BgorBgEEAYI3AgEEoGkwZzAyBgor
// SIG // BgEEAYI3AgEeMCQCAQEEEBDgyQbOONQRoqMAEEvTUJAC
// SIG // AQACAQACAQACAQACAQAwMTANBglghkgBZQMEAgEFAAQg
// SIG // HCNsNy+pa1TC6NCvExDjQyjkjTfgSZWHZ6g8BzZxI6Og
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
// SIG // SEXAQsmbdlsKgEhr/Xmfwb1tbWrJUnMTDXpQzTGCGYgw
// SIG // ghmEAgEBMIGVMH4xCzAJBgNVBAYTAlVTMRMwEQYDVQQI
// SIG // EwpXYXNoaW5ndG9uMRAwDgYDVQQHEwdSZWRtb25kMR4w
// SIG // HAYDVQQKExVNaWNyb3NvZnQgQ29ycG9yYXRpb24xKDAm
// SIG // BgNVBAMTH01pY3Jvc29mdCBDb2RlIFNpZ25pbmcgUENB
// SIG // IDIwMTECEzMAAAJSizOq+JXzOdsAAAAAAlIwDQYJYIZI
// SIG // AWUDBAIBBQCggcAwGQYJKoZIhvcNAQkDMQwGCisGAQQB
// SIG // gjcCAQQwHAYKKwYBBAGCNwIBCzEOMAwGCisGAQQBgjcC
// SIG // ARUwLwYJKoZIhvcNAQkEMSIEINW9AM7PSIfi/dAdaWzl
// SIG // EbkxscibhSagH+1up0lusF06MFQGCisGAQQBgjcCAQwx
// SIG // RjBEoCSAIgBNAGkAbgBlAGMAcgBhAGYAdAAgAEIAZQBk
// SIG // AHIAbwBjAGuhHIAaaHR0cHM6Ly93d3cubWluZWNyYWZ0
// SIG // Lm5ldC8wDQYJKoZIhvcNAQEBBQAEggEAiJgNATKmNIQJ
// SIG // OMgfmfnMFAqbBWyNUlqtZ3fkHmqxoxm0eFLEt3LttkgO
// SIG // 1HGO9wFZg9guVZp0sCL3AsYhKVzpXjUx1L4cU8JMVcWi
// SIG // A25bu0DA+KIyQ7nY72+22TUjM/U17QYfdIvmdm3YDV0d
// SIG // d7DrFXg9X3FsZpd9t8dQYgRW8LFttQ3s8Y/J+NStXlD8
// SIG // uvs5N0eGe/BNhJl17loUwSQ5NMmkiKvBA6v2NmlPTWPc
// SIG // UEFGUL8y35P/3xnJjt1j4bjHeh8WHsUGaKiWcv4o2VDP
// SIG // Bn/yODQ0J9MNtM3soCzcYKD5bwUDCW6xZoTFRkp35Ic5
// SIG // 1WUFVqi1mRIHruxXtAQQUKGCFwAwghb8BgorBgEEAYI3
// SIG // AwMBMYIW7DCCFugGCSqGSIb3DQEHAqCCFtkwghbVAgED
// SIG // MQ8wDQYJYIZIAWUDBAIBBQAwggFRBgsqhkiG9w0BCRAB
// SIG // BKCCAUAEggE8MIIBOAIBAQYKKwYBBAGEWQoDATAxMA0G
// SIG // CWCGSAFlAwQCAQUABCDk5IQ3YZIRX8ApdT8fLAwV3X7H
// SIG // N4bGROxqW3RMjCJdcAIGYoJo4aSXGBMyMDIyMDYxNjIz
// SIG // MTYwNy45OTNaMASAAgH0oIHQpIHNMIHKMQswCQYDVQQG
// SIG // EwJVUzETMBEGA1UECBMKV2FzaGluZ3RvbjEQMA4GA1UE
// SIG // BxMHUmVkbW9uZDEeMBwGA1UEChMVTWljcm9zb2Z0IENv
// SIG // cnBvcmF0aW9uMSUwIwYDVQQLExxNaWNyb3NvZnQgQW1l
// SIG // cmljYSBPcGVyYXRpb25zMSYwJAYDVQQLEx1UaGFsZXMg
// SIG // VFNTIEVTTjoxMkJDLUUzQUUtNzRFQjElMCMGA1UEAxMc
// SIG // TWljcm9zb2Z0IFRpbWUtU3RhbXAgU2VydmljZaCCEVcw
// SIG // ggcMMIIE9KADAgECAhMzAAABoQGFVZm5VF2KAAEAAAGh
// SIG // MA0GCSqGSIb3DQEBCwUAMHwxCzAJBgNVBAYTAlVTMRMw
// SIG // EQYDVQQIEwpXYXNoaW5ndG9uMRAwDgYDVQQHEwdSZWRt
// SIG // b25kMR4wHAYDVQQKExVNaWNyb3NvZnQgQ29ycG9yYXRp
// SIG // b24xJjAkBgNVBAMTHU1pY3Jvc29mdCBUaW1lLVN0YW1w
// SIG // IFBDQSAyMDEwMB4XDTIxMTIwMjE5MDUyNFoXDTIzMDIy
// SIG // ODE5MDUyNFowgcoxCzAJBgNVBAYTAlVTMRMwEQYDVQQI
// SIG // EwpXYXNoaW5ndG9uMRAwDgYDVQQHEwdSZWRtb25kMR4w
// SIG // HAYDVQQKExVNaWNyb3NvZnQgQ29ycG9yYXRpb24xJTAj
// SIG // BgNVBAsTHE1pY3Jvc29mdCBBbWVyaWNhIE9wZXJhdGlv
// SIG // bnMxJjAkBgNVBAsTHVRoYWxlcyBUU1MgRVNOOjEyQkMt
// SIG // RTNBRS03NEVCMSUwIwYDVQQDExxNaWNyb3NvZnQgVGlt
// SIG // ZS1TdGFtcCBTZXJ2aWNlMIICIjANBgkqhkiG9w0BAQEF
// SIG // AAOCAg8AMIICCgKCAgEA2sk8XuVrpJK2McVbhy2FvQRF
// SIG // gg/ZJI55x7DisBnXSD22ZS2PpeaLywzX/gRDECgGUCNw
// SIG // 1/dZdcgg7j/V+7TjwuPGURlwP23/apdBSueN/ICJe3Fe
// SIG // dvF3hDhcHPwPlGyFH1tvejpoPGetsWkL946xuFP6a4gK
// SIG // xf3q9VANRzbiBlMqo5coIkj8CtjZxQKYtSQ/lHn+XOO5
// SIG // Ie6VtSo+0Z3IaRXmPTHpD0EYmu3BGlGFOLKgoiVXQyaX
// SIG // ny7z0/RHbYZUMe+ZXcfgMGX9mvU+7kEUgYfLacT3SAw5
// SIG // ColjMIyk6wGNPQNyP44naj7nPD71/rKsasmRDdoeBgNB
// SIG // HY5pOuJ5CLpACtfCuZwCwyzvUjE8aQMECB0Q7WXkwpbw
// SIG // DwhKMtb7Tw+3/nqh6krbrvlwpH0Y1xKV/fofX67AdPwY
// SIG // A+QgX9xCywGvE3nzHx2VhCUUzza21zCos0q1EpFb/9xz
// SIG // /2bCacGs+TMtkW8nNwIfW0++ngSZMn0+RTfb/ykNB58Y
// SIG // UTLOhx4U5jcfi87WHIvrx39A90B9Xgo2VmUY6dZjssaT
// SIG // 1NpgzBuoHpbybHtSc0QA6O2CKJPydwnG5vDGwW5vOYqI
// SIG // BZbRR3nBxRBcK7AxgRZzWBzIXG2q0DQPoGNntpfXwJF9
// SIG // zIyO1JJZKM++Pz+iiKnuY3HfRTwm20m2B/Ti7LXnmDkC
// SIG // AwEAAaOCATYwggEyMB0GA1UdDgQWBBQWvyAy22OO+VUM
// SIG // iomUsOO5dP3MqTAfBgNVHSMEGDAWgBSfpxVdAF5iXYP0
// SIG // 5dJlpxtTNRnpcjBfBgNVHR8EWDBWMFSgUqBQhk5odHRw
// SIG // Oi8vd3d3Lm1pY3Jvc29mdC5jb20vcGtpb3BzL2NybC9N
// SIG // aWNyb3NvZnQlMjBUaW1lLVN0YW1wJTIwUENBJTIwMjAx
// SIG // MCgxKS5jcmwwbAYIKwYBBQUHAQEEYDBeMFwGCCsGAQUF
// SIG // BzAChlBodHRwOi8vd3d3Lm1pY3Jvc29mdC5jb20vcGtp
// SIG // b3BzL2NlcnRzL01pY3Jvc29mdCUyMFRpbWUtU3RhbXAl
// SIG // MjBQQ0ElMjAyMDEwKDEpLmNydDAMBgNVHRMBAf8EAjAA
// SIG // MBMGA1UdJQQMMAoGCCsGAQUFBwMIMA0GCSqGSIb3DQEB
// SIG // CwUAA4ICAQAgwyMRJX15RuWCnCqyz0kvn9yVmaa8ChIg
// SIG // Er4r2h0wUZV7QLPk5GnXLBHovvcOb5hebQlM0x+HNJwi
// SIG // O22cZ7C/kul7IjrN2dVeFl/iMKF1CeMy77NPpk+L4xg7
// SIG // WHykP27JiSmq9nPfZv3x79Vptgk3Mmnj74vOiYd1Mi43
// SIG // USC1m7c7OKCJhTMMCm8x3T6KcawYYIvgtWGbIaLFi5YM
// SIG // 8rsY1JfqjYNZudjCZn9dZaCOw/RyaGkM3fq3/dvGPK71
// SIG // C5oNofxudKPg9FCdRWv3CSWh3wd7HysPV+hq7V2Bo5jN
// SIG // /oPgIWlbH7qSlzbThbubZyyrwB+TiIxA2FdWCppV7gbo
// SIG // W2GrLMoDxTJjYBtgJ5N3axHA3GYQl16qUbMzaNRehruS
// SIG // QqUGV2ziTPVHuT5SSrZiJgGCBrMPqZx8v6+YIEmDqeIO
// SIG // WdaFPRoVQjN1dE/WnXnujlFwZNaxOHWXP1LD5Y9KqIpY
// SIG // y/pTdQOYJJps+5ObSDm1Rge3SXc/CdBcF0ROamLtQHb2
// SIG // rlW2cBkJC9cfGiv7L4xEFtDVMidvc5wx4l5eby6EU44x
// SIG // abIVAYtviGPpjamy5o9uI+Xk/m4w5RNx5jbSz6S3DA2K
// SIG // mdR/ulOmJmojZmnNo0VwwGnhBP7qAzLdnQK3yT+zPjA7
// SIG // 988zTUyDXrjRLQ1YJvc8H4CFAl5w2blbYjCCB3EwggVZ
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
// SIG // czEmMCQGA1UECxMdVGhhbGVzIFRTUyBFU046MTJCQy1F
// SIG // M0FFLTc0RUIxJTAjBgNVBAMTHE1pY3Jvc29mdCBUaW1l
// SIG // LVN0YW1wIFNlcnZpY2WiIwoBATAHBgUrDgMCGgMVABtx
// SIG // dozuCxDFS8IChl3WDDeBQYDgoIGDMIGApH4wfDELMAkG
// SIG // A1UEBhMCVVMxEzARBgNVBAgTCldhc2hpbmd0b24xEDAO
// SIG // BgNVBAcTB1JlZG1vbmQxHjAcBgNVBAoTFU1pY3Jvc29m
// SIG // dCBDb3Jwb3JhdGlvbjEmMCQGA1UEAxMdTWljcm9zb2Z0
// SIG // IFRpbWUtU3RhbXAgUENBIDIwMTAwDQYJKoZIhvcNAQEF
// SIG // BQACBQDmVRuNMCIYDzIwMjIwNjE2MTEwMTMzWhgPMjAy
// SIG // MjA2MTcxMTAxMzNaMHcwPQYKKwYBBAGEWQoEATEvMC0w
// SIG // CgIFAOZVG40CAQAwCgIBAAICFiICAf8wBwIBAAICE5sw
// SIG // CgIFAOZWbQ0CAQAwNgYKKwYBBAGEWQoEAjEoMCYwDAYK
// SIG // KwYBBAGEWQoDAqAKMAgCAQACAwehIKEKMAgCAQACAwGG
// SIG // oDANBgkqhkiG9w0BAQUFAAOBgQCnEYEZS91YUuFytsiY
// SIG // +uUMA3RxNk0BwhNtT6YPfDG3MmqUvj+jur0tDgJ0Ydew
// SIG // dEPwNuT7U4hirL7tv5kWRLclalJcgopjbiEhAj0Gyuly
// SIG // alwC4He3NCrICAwvJbWu1FCXSMuQU3QDHbXrylGRc0K5
// SIG // eOKS2Gh++S1V9x/K0o3/mzGCBA0wggQJAgEBMIGTMHwx
// SIG // CzAJBgNVBAYTAlVTMRMwEQYDVQQIEwpXYXNoaW5ndG9u
// SIG // MRAwDgYDVQQHEwdSZWRtb25kMR4wHAYDVQQKExVNaWNy
// SIG // b3NvZnQgQ29ycG9yYXRpb24xJjAkBgNVBAMTHU1pY3Jv
// SIG // c29mdCBUaW1lLVN0YW1wIFBDQSAyMDEwAhMzAAABoQGF
// SIG // VZm5VF2KAAEAAAGhMA0GCWCGSAFlAwQCAQUAoIIBSjAa
// SIG // BgkqhkiG9w0BCQMxDQYLKoZIhvcNAQkQAQQwLwYJKoZI
// SIG // hvcNAQkEMSIEIMQdV4PstsK2J8xHoTK35EcbtDleY3fA
// SIG // SsEVA0GG0uJaMIH6BgsqhkiG9w0BCRACLzGB6jCB5zCB
// SIG // 5DCBvQQg6whU8TqBgmgggo6EcgXtSUkKzCXggk8hK84o
// SIG // id+O0IQwgZgwgYCkfjB8MQswCQYDVQQGEwJVUzETMBEG
// SIG // A1UECBMKV2FzaGluZ3RvbjEQMA4GA1UEBxMHUmVkbW9u
// SIG // ZDEeMBwGA1UEChMVTWljcm9zb2Z0IENvcnBvcmF0aW9u
// SIG // MSYwJAYDVQQDEx1NaWNyb3NvZnQgVGltZS1TdGFtcCBQ
// SIG // Q0EgMjAxMAITMwAAAaEBhVWZuVRdigABAAABoTAiBCCq
// SIG // 3vk2qW5GCAd2LyPY1g1/OmSo+c+oe24gc+CntKofTjAN
// SIG // BgkqhkiG9w0BAQsFAASCAgCnOOU966zoBQ3Zz/CR9P6p
// SIG // XkhIg/WwqmS9U2hgYOYY5UCvwGqsSFZu/rOY9MHdlGun
// SIG // k4H6ReOQJVp441fN7DSIZaXeHDA5yp4UB7BbDwdH7GeZ
// SIG // EThj2uy9aLyWC3CT6e7NlIOvjEeaL3JWKEsutyMe4pFB
// SIG // nWlWIInaTncoN/6OkIbSKB40GlnzGfTs6fsRUjJ7B8Xh
// SIG // dz5San+c/eZvsoAtFI4NZayuofzARtIW12yYvE1Ubp1o
// SIG // /qYwk6LpwRKr+4XcBzB3J1ZUJvJoWizExP/TD181le3M
// SIG // MX2FtLjyt1ycql12n7yWbh0golNfwtrSWLkLkOivdeXr
// SIG // 102dDJhujEBE4XPfB1gesktZHxhg+g+lYClH8S4PnGoD
// SIG // /pWD6vCcouETPGU7qT564UyEWNUxVPtJ7G3YyhXbnGJe
// SIG // o/RpQrUWVdDFzHfVc8GOHaV0WyLzUQoY3SRpUdEpbeJx
// SIG // H8roB/gXSJGldXuDL39q11Z7R4MBVmhG/Ur/M18btoZj
// SIG // yS3/4bcnGKKJ5Wzac+p8T0vhJN7+G5ZyfF5ROTkwGWwP
// SIG // YVTIeE2Soios5f1hrL8DdoHXtYr9+HjJ7Cr9Hi7PrAad
// SIG // Pe/XyzA4qzeH4Ioj8puc4ovimRCqtnpSeODbBnuXKGPC
// SIG // 4a+gTirvPosM9cvMfKkM2zq3CMEMZZjRwZgXLYxh1ZkYAA==
// SIG // End signature block
