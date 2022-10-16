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
// SIG // MIInrgYJKoZIhvcNAQcCoIInnzCCJ5sCAQExDzANBglg
// SIG // hkgBZQMEAgEFADB3BgorBgEEAYI3AgEEoGkwZzAyBgor
// SIG // BgEEAYI3AgEeMCQCAQEEEBDgyQbOONQRoqMAEEvTUJAC
// SIG // AQACAQACAQACAQACAQAwMTANBglghkgBZQMEAgEFAAQg
// SIG // HCNsNy+pa1TC6NCvExDjQyjkjTfgSZWHZ6g8BzZxI6Og
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
// SIG // ARUwLwYJKoZIhvcNAQkEMSIEINW9AM7PSIfi/dAdaWzl
// SIG // EbkxscibhSagH+1up0lusF06MFQGCisGAQQBgjcCAQwx
// SIG // RjBEoCSAIgBNAGkAbgBlAGMAcgBhAGYAdAAgAEIAZQBk
// SIG // AHIAbwBjAGuhHIAaaHR0cHM6Ly93d3cubWluZWNyYWZ0
// SIG // Lm5ldC8wDQYJKoZIhvcNAQEBBQAEggEAEh6+Dm9xM/xM
// SIG // yCVu2Rwl9lAvY4CC19rKuqjg2GKjOrrGnEu1zofh/AeI
// SIG // ODxiXGWidKNJBa8J5R0u34nmpYgRQLClp8evfAjkNpz4
// SIG // Xck/hIxXVbzBqumUHDPHcqSPMw5N4+TC4B2Jdvwvu7jw
// SIG // 4QA7RNaf8u4fYD8cSDvl2EM6a3hHxWHwJ7rje6igEJ4A
// SIG // pc3ShV+815NeG5p3QQRTYH4BGB9zF79DP0kdkMkiy/6n
// SIG // 04TAANgjuj0eG/HQcrcyTn3iZte0nebEOblcfa+NFbh7
// SIG // 6zF4qNI7K5PPLB+5Yrh/QW3kpTf79LpypD0bWKFtPJI+
// SIG // 8wjm6AzHf7Imqv+MWg4J06GCFv0wghb5BgorBgEEAYI3
// SIG // AwMBMYIW6TCCFuUGCSqGSIb3DQEHAqCCFtYwghbSAgED
// SIG // MQ8wDQYJYIZIAWUDBAIBBQAwggFRBgsqhkiG9w0BCRAB
// SIG // BKCCAUAEggE8MIIBOAIBAQYKKwYBBAGEWQoDATAxMA0G
// SIG // CWCGSAFlAwQCAQUABCDML22XftE7j7wysBk2TRH3k33f
// SIG // RkMboFo8Gn7NnYUyEAIGYyNdiZ9JGBMyMDIyMDkyODIz
// SIG // NTEyNC43NjVaMASAAgH0oIHQpIHNMIHKMQswCQYDVQQG
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
// SIG // AQkEMSIEII4rnM7vfE1DjNqFz1QIRRjQuMbNruMTmupT
// SIG // f0pz5b02MIH6BgsqhkiG9w0BCRACLzGB6jCB5zCB5DCB
// SIG // vQQgW3vaGxCVejj+BAzFSfMxfHQ+bxxkqCw8LkMY/QZ4
// SIG // pr8wgZgwgYCkfjB8MQswCQYDVQQGEwJVUzETMBEGA1UE
// SIG // CBMKV2FzaGluZ3RvbjEQMA4GA1UEBxMHUmVkbW9uZDEe
// SIG // MBwGA1UEChMVTWljcm9zb2Z0IENvcnBvcmF0aW9uMSYw
// SIG // JAYDVQQDEx1NaWNyb3NvZnQgVGltZS1TdGFtcCBQQ0Eg
// SIG // MjAxMAITMwAAAZcDz1mca4l4PwABAAABlzAiBCBAf9ZZ
// SIG // Lx9sFAbCr6+M/MoM4mKBom2IPNMMSQ5FxRYL9DANBgkq
// SIG // hkiG9w0BAQsFAASCAgBUp7RAokfubsIcC8H9c1xRbKGe
// SIG // ApSGDC2XIae3GwmuJm4Z/WybGQAzTBHEsEmxIwsgpEou
// SIG // nn6+2jzFXip8tcB2zAcPdjStSu/P+NPlO+6GTgGlpuSb
// SIG // Nr4l6DegnujhANSkbny1u3RCwCgu1SIPg6bypD7ec55F
// SIG // yRx/D//lcy7opfD2Rv/ai+8p3MdkeWXKM4Yw8vTP5thT
// SIG // tLP7Be9+ahJB4q9UJU8ukBlswvx4JBPdmnDBiog+K/lB
// SIG // EcIObXeHd2zwl8HhTV9krO6b2719hpItcq2y7Io6j2QR
// SIG // QfJxdG/xvf5SZ9Vi7qKSVY5TsxIfYIbKamjqnEpXm3ni
// SIG // Kyg0/43cPDozpBZalmNyTrUtUuRTPLCU1cNr9xmrB0UO
// SIG // /Iz2QDbfglErfkxS4RWJd48b1njzBOLLvafWVu4KssUk
// SIG // gCeLi+WcVRv+9mcmviysvVGmPkPWXoBuk2nWdIW6oapc
// SIG // wrEW0Dhz7ACWrw4XWki8ZXp47u4y6TwrdEJlQe3uPf0p
// SIG // wObYVEDINVZJwYowu7/rp3FF7F494CcPPdT90Pg6vJYm
// SIG // NHMKZx5G+ibTH0U8n77e8nHY6rFC0jhVQv3X18qKV4Wb
// SIG // 7Ff+nrrVP4gBWXg2sX5U5ka6p9Fl2945WDnoLc8EnVO7
// SIG // OFmycWyzX/odll8386EoxowsFABfeL1+OmZ8TNBxHQ==
// SIG // End signature block
