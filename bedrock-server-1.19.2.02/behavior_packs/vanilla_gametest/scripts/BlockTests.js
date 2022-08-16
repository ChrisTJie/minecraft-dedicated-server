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
// SIG // MIInywYJKoZIhvcNAQcCoIInvDCCJ7gCAQExDzANBglg
// SIG // hkgBZQMEAgEFADB3BgorBgEEAYI3AgEEoGkwZzAyBgor
// SIG // BgEEAYI3AgEeMCQCAQEEEBDgyQbOONQRoqMAEEvTUJAC
// SIG // AQACAQACAQACAQACAQAwMTANBglghkgBZQMEAgEFAAQg
// SIG // HCNsNy+pa1TC6NCvExDjQyjkjTfgSZWHZ6g8BzZxI6Og
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
// SIG // ghmeMIIZmgIBATCBlTB+MQswCQYDVQQGEwJVUzETMBEG
// SIG // A1UECBMKV2FzaGluZ3RvbjEQMA4GA1UEBxMHUmVkbW9u
// SIG // ZDEeMBwGA1UEChMVTWljcm9zb2Z0IENvcnBvcmF0aW9u
// SIG // MSgwJgYDVQQDEx9NaWNyb3NvZnQgQ29kZSBTaWduaW5n
// SIG // IFBDQSAyMDExAhMzAAACU+OD3pbexW7MAAAAAAJTMA0G
// SIG // CWCGSAFlAwQCAQUAoIHAMBkGCSqGSIb3DQEJAzEMBgor
// SIG // BgEEAYI3AgEEMBwGCisGAQQBgjcCAQsxDjAMBgorBgEE
// SIG // AYI3AgEVMC8GCSqGSIb3DQEJBDEiBCDVvQDOz0iH4v3Q
// SIG // HWls5RG5MbHIm4UmoB/tbqdJbrBdOjBUBgorBgEEAYI3
// SIG // AgEMMUYwRKAkgCIATQBpAG4AZQBjAHIAYQBmAHQAIABC
// SIG // AGUAZAByAG8AYwBroRyAGmh0dHBzOi8vd3d3Lm1pbmVj
// SIG // cmFmdC5uZXQvMA0GCSqGSIb3DQEBAQUABIIBAG4+ljQ9
// SIG // ijdDWE+FSUI9i+ccUq6wZq0y8WxYB/n8+S6/5yI53+mE
// SIG // qXLNF9VTEKbu7p7TRVkXas6lbxXcQY5+jMC8s8FsYp7Q
// SIG // cSwNqGmVUb+gtZSquhtQYVrmGE4LhDCidKvfPWqyz7hu
// SIG // TCc1xNnBGVizJH1wr+nUmGyp64DIIOoEfsrZKm1uaxwD
// SIG // nPXRIgbQQkrOcR27fvwFVghdAxQZA+awaE0mdLdZiEuq
// SIG // SwAtNIj3NPhGTbGIrE10ndj4UEDDdeD0kVWULb9WsLDv
// SIG // LLnRTApWougiFcb65JHFr1Q9mHDjBVPcTSabX6SAmqLJ
// SIG // tzXlXd1p6ZDg/E+qLVZCeazw/HChghcWMIIXEgYKKwYB
// SIG // BAGCNwMDATGCFwIwghb+BgkqhkiG9w0BBwKgghbvMIIW
// SIG // 6wIBAzEPMA0GCWCGSAFlAwQCAQUAMIIBWQYLKoZIhvcN
// SIG // AQkQAQSgggFIBIIBRDCCAUACAQEGCisGAQQBhFkKAwEw
// SIG // MTANBglghkgBZQMEAgEFAAQgmgpg8hMPGmMgyfWDxWqb
// SIG // U+mJVlHbwVI25+2gaBWGt1ACBmKy+TomrhgTMjAyMjA3
// SIG // MDIwMDI4NTEuMTUyWjAEgAIB9KCB2KSB1TCB0jELMAkG
// SIG // A1UEBhMCVVMxEzARBgNVBAgTCldhc2hpbmd0b24xEDAO
// SIG // BgNVBAcTB1JlZG1vbmQxHjAcBgNVBAoTFU1pY3Jvc29m
// SIG // dCBDb3Jwb3JhdGlvbjEtMCsGA1UECxMkTWljcm9zb2Z0
// SIG // IElyZWxhbmQgT3BlcmF0aW9ucyBMaW1pdGVkMSYwJAYD
// SIG // VQQLEx1UaGFsZXMgVFNTIEVTTjoyQUQ0LTRCOTItRkEw
// SIG // MTElMCMGA1UEAxMcTWljcm9zb2Z0IFRpbWUtU3RhbXAg
// SIG // U2VydmljZaCCEWUwggcUMIIE/KADAgECAhMzAAABhnjl
// SIG // GYn4JEvMAAEAAAGGMA0GCSqGSIb3DQEBCwUAMHwxCzAJ
// SIG // BgNVBAYTAlVTMRMwEQYDVQQIEwpXYXNoaW5ndG9uMRAw
// SIG // DgYDVQQHEwdSZWRtb25kMR4wHAYDVQQKExVNaWNyb3Nv
// SIG // ZnQgQ29ycG9yYXRpb24xJjAkBgNVBAMTHU1pY3Jvc29m
// SIG // dCBUaW1lLVN0YW1wIFBDQSAyMDEwMB4XDTIxMTAyODE5
// SIG // MjczOVoXDTIzMDEyNjE5MjczOVowgdIxCzAJBgNVBAYT
// SIG // AlVTMRMwEQYDVQQIEwpXYXNoaW5ndG9uMRAwDgYDVQQH
// SIG // EwdSZWRtb25kMR4wHAYDVQQKExVNaWNyb3NvZnQgQ29y
// SIG // cG9yYXRpb24xLTArBgNVBAsTJE1pY3Jvc29mdCBJcmVs
// SIG // YW5kIE9wZXJhdGlvbnMgTGltaXRlZDEmMCQGA1UECxMd
// SIG // VGhhbGVzIFRTUyBFU046MkFENC00QjkyLUZBMDExJTAj
// SIG // BgNVBAMTHE1pY3Jvc29mdCBUaW1lLVN0YW1wIFNlcnZp
// SIG // Y2UwggIiMA0GCSqGSIb3DQEBAQUAA4ICDwAwggIKAoIC
// SIG // AQDAjcbZam/oHgiMB+uB8mmd0849g7Vh3z6+V+gjExbe
// SIG // B0INP7Mhtp+DXik67S3R6RRDHrSns9p0fg6Oeo0gTWrq
// SIG // V0f2e2PWAh2Xgerit0QdNnokV0TbgNJtWiqpH5HgjDjD
// SIG // cY9t9zZDeR/LIXKP4M6GYJbD8VmJNVOVPht16PIBbqv8
// SIG // mfh+vfEuNu+EhNq2vfpXLLOBDRjhavvcfeBRwuNi7SqI
// SIG // e60MNvr6n7IMEaYoXOc5bzBW3sP67ZUQmgTomUrQSlUt
// SIG // m6x1LOF5y5TAlfFva7KABleWxr98eXBb1ieUGowcn6Kb
// SIG // 0e4rlfjHz/kHl2S4ihfmVYaMUxsPYDou78+ZQHiErQIX
// SIG // kbVhpS0GswTvcMAqTKmTtISbcGUlfBj8atWhdZhQYQfJ
// SIG // +uQuTCzRGgQymggSB5tk0qqNHKdEmBHh88IqsSHASJNM
// SIG // BzgNcZyLgcc6brgRDWD9IMcwWogpVLGhRuQZt0o0oeGZ
// SIG // qG4isDLjB72zutkmyS95lhmIOa0C0G3+BCiPFtnW870L
// SIG // XVK2GSuaSRMwtB/1wPOVUQF67oqYdfZLN7qCCd7cjhzL
// SIG // /khQucdneszhmklzSzYqkYsdpWsRDLjH+YCfjJph+B4f
// SIG // cwQBaRWPL+pMOHpwMIX+DLPdNpAO28WcArvQuq1sS8E9
// SIG // 0Gl4Ib+GT2XSVpjPCLLIZj8eowIDAQABo4IBNjCCATIw
// SIG // HQYDVR0OBBYEFBm2o0UD72Z0S7+HfdSEcw3rCFwuMB8G
// SIG // A1UdIwQYMBaAFJ+nFV0AXmJdg/Tl0mWnG1M1GelyMF8G
// SIG // A1UdHwRYMFYwVKBSoFCGTmh0dHA6Ly93d3cubWljcm9z
// SIG // b2Z0LmNvbS9wa2lvcHMvY3JsL01pY3Jvc29mdCUyMFRp
// SIG // bWUtU3RhbXAlMjBQQ0ElMjAyMDEwKDEpLmNybDBsBggr
// SIG // BgEFBQcBAQRgMF4wXAYIKwYBBQUHMAKGUGh0dHA6Ly93
// SIG // d3cubWljcm9zb2Z0LmNvbS9wa2lvcHMvY2VydHMvTWlj
// SIG // cm9zb2Z0JTIwVGltZS1TdGFtcCUyMFBDQSUyMDIwMTAo
// SIG // MSkuY3J0MAwGA1UdEwEB/wQCMAAwEwYDVR0lBAwwCgYI
// SIG // KwYBBQUHAwgwDQYJKoZIhvcNAQELBQADggIBAMPuZ6El
// SIG // jd9McoLiGP7AFYHznji5omIwwgeeEr041MztWtpNjPHR
// SIG // T9NwsnqDHDW1HMzm67ySzAk2Uc2ntF52wCLC+JVBlX0A
// SIG // vwhtlEslPA16ELCT4FVxjaCHdkZmbHy5q09mtG57KGFN
// SIG // MPY+8VUut/CHaWIMb90Q80gdMqPv0OURw8hag4JSnunQ
// SIG // 5EzBD3mRVqJulfz2m+OE+XYWbQIE7eldcmDRvJ2lDl0M
// SIG // NO/+pvT5ZgX+81URT8ygwRCqVRZa5cQJOrHpNrIm4snq
// SIG // 5TsrlDJORD+XbgiEaMPN/kARk6sg1jORZXI19Q6kjGcq
// SIG // xZME3aKOln9O6fmquaj280gNPSWhuCe6Vp7Xs1oQ72iI
// SIG // QkkfW1Dfnd2G5GL4DTQ9HvzWJiXMXklTUOsR8TI3HwJa
// SIG // ARGL3QsqxiCFkEIONDcOImN9Rkuo414esl9yaHPn9t+b
// SIG // z5oBpQ+lkV4/SDQiid3pc2ThiJhtY8Wih9zQvBypIAu2
// SIG // 4gDLPp/d35RplmynjVTiEIigaPqGgMi5Tzf1uj+Zn8CA
// SIG // RLAbEhezSBlToD7aohR7rRB0D3r3BZLO5wo6KyeD0cJJ
// SIG // ksXV2pzdBRrCvQLRTjXvzgqj29yQAbdqTBi5UZyzqEz9
// SIG // KoSGh72MfB7henzUKtMHWX34Qh26QJs/STLPHRZnO156
// SIG // IM3mt2KJBH2YEm6WMIIHcTCCBVmgAwIBAgITMwAAABXF
// SIG // 52ueAptJmQAAAAAAFTANBgkqhkiG9w0BAQsFADCBiDEL
// SIG // MAkGA1UEBhMCVVMxEzARBgNVBAgTCldhc2hpbmd0b24x
// SIG // EDAOBgNVBAcTB1JlZG1vbmQxHjAcBgNVBAoTFU1pY3Jv
// SIG // c29mdCBDb3Jwb3JhdGlvbjEyMDAGA1UEAxMpTWljcm9z
// SIG // b2Z0IFJvb3QgQ2VydGlmaWNhdGUgQXV0aG9yaXR5IDIw
// SIG // MTAwHhcNMjEwOTMwMTgyMjI1WhcNMzAwOTMwMTgzMjI1
// SIG // WjB8MQswCQYDVQQGEwJVUzETMBEGA1UECBMKV2FzaGlu
// SIG // Z3RvbjEQMA4GA1UEBxMHUmVkbW9uZDEeMBwGA1UEChMV
// SIG // TWljcm9zb2Z0IENvcnBvcmF0aW9uMSYwJAYDVQQDEx1N
// SIG // aWNyb3NvZnQgVGltZS1TdGFtcCBQQ0EgMjAxMDCCAiIw
// SIG // DQYJKoZIhvcNAQEBBQADggIPADCCAgoCggIBAOThpkzn
// SIG // tHIhC3miy9ckeb0O1YLT/e6cBwfSqWxOdcjKNVf2AX9s
// SIG // SuDivbk+F2Az/1xPx2b3lVNxWuJ+Slr+uDZnhUYjDLWN
// SIG // E893MsAQGOhgfWpSg0S3po5GawcU88V29YZQ3MFEyHFc
// SIG // UTE3oAo4bo3t1w/YJlN8OWECesSq/XJprx2rrPY2vjUm
// SIG // ZNqYO7oaezOtgFt+jBAcnVL+tuhiJdxqD89d9P6OU8/W
// SIG // 7IVWTe/dvI2k45GPsjksUZzpcGkNyjYtcI4xyDUoveO0
// SIG // hyTD4MmPfrVUj9z6BVWYbWg7mka97aSueik3rMvrg0Xn
// SIG // Rm7KMtXAhjBcTyziYrLNueKNiOSWrAFKu75xqRdbZ2De
// SIG // +JKRHh09/SDPc31BmkZ1zcRfNN0Sidb9pSB9fvzZnkXf
// SIG // tnIv231fgLrbqn427DZM9ituqBJR6L8FA6PRc6ZNN3SU
// SIG // HDSCD/AQ8rdHGO2n6Jl8P0zbr17C89XYcz1DTsEzOUyO
// SIG // ArxCaC4Q6oRRRuLRvWoYWmEBc8pnol7XKHYC4jMYcten
// SIG // IPDC+hIK12NvDMk2ZItboKaDIV1fMHSRlJTYuVD5C4lh
// SIG // 8zYGNRiER9vcG9H9stQcxWv2XFJRXRLbJbqvUAV6bMUR
// SIG // HXLvjflSxIUXk8A8FdsaN8cIFRg/eKtFtvUeh17aj54W
// SIG // cmnGrnu3tz5q4i6tAgMBAAGjggHdMIIB2TASBgkrBgEE
// SIG // AYI3FQEEBQIDAQABMCMGCSsGAQQBgjcVAgQWBBQqp1L+
// SIG // ZMSavoKRPEY1Kc8Q/y8E7jAdBgNVHQ4EFgQUn6cVXQBe
// SIG // Yl2D9OXSZacbUzUZ6XIwXAYDVR0gBFUwUzBRBgwrBgEE
// SIG // AYI3TIN9AQEwQTA/BggrBgEFBQcCARYzaHR0cDovL3d3
// SIG // dy5taWNyb3NvZnQuY29tL3BraW9wcy9Eb2NzL1JlcG9z
// SIG // aXRvcnkuaHRtMBMGA1UdJQQMMAoGCCsGAQUFBwMIMBkG
// SIG // CSsGAQQBgjcUAgQMHgoAUwB1AGIAQwBBMAsGA1UdDwQE
// SIG // AwIBhjAPBgNVHRMBAf8EBTADAQH/MB8GA1UdIwQYMBaA
// SIG // FNX2VsuP6KJcYmjRPZSQW9fOmhjEMFYGA1UdHwRPME0w
// SIG // S6BJoEeGRWh0dHA6Ly9jcmwubWljcm9zb2Z0LmNvbS9w
// SIG // a2kvY3JsL3Byb2R1Y3RzL01pY1Jvb0NlckF1dF8yMDEw
// SIG // LTA2LTIzLmNybDBaBggrBgEFBQcBAQROMEwwSgYIKwYB
// SIG // BQUHMAKGPmh0dHA6Ly93d3cubWljcm9zb2Z0LmNvbS9w
// SIG // a2kvY2VydHMvTWljUm9vQ2VyQXV0XzIwMTAtMDYtMjMu
// SIG // Y3J0MA0GCSqGSIb3DQEBCwUAA4ICAQCdVX38Kq3hLB9n
// SIG // ATEkW+Geckv8qW/qXBS2Pk5HZHixBpOXPTEztTnXwnE2
// SIG // P9pkbHzQdTltuw8x5MKP+2zRoZQYIu7pZmc6U03dmLq2
// SIG // HnjYNi6cqYJWAAOwBb6J6Gngugnue99qb74py27YP0h1
// SIG // AdkY3m2CDPVtI1TkeFN1JFe53Z/zjj3G82jfZfakVqr3
// SIG // lbYoVSfQJL1AoL8ZthISEV09J+BAljis9/kpicO8F7BU
// SIG // hUKz/AyeixmJ5/ALaoHCgRlCGVJ1ijbCHcNhcy4sa3tu
// SIG // PywJeBTpkbKpW99Jo3QMvOyRgNI95ko+ZjtPu4b6MhrZ
// SIG // lvSP9pEB9s7GdP32THJvEKt1MMU0sHrYUP4KWN1APMdU
// SIG // bZ1jdEgssU5HLcEUBHG/ZPkkvnNtyo4JvbMBV0lUZNlz
// SIG // 138eW0QBjloZkWsNn6Qo3GcZKCS6OEuabvshVGtqRRFH
// SIG // qfG3rsjoiV5PndLQTHa1V1QJsWkBRH58oWFsc/4Ku+xB
// SIG // Zj1p/cvBQUl+fpO+y/g75LcVv7TOPqUxUYS8vwLBgqJ7
// SIG // Fx0ViY1w/ue10CgaiQuPNtq6TPmb/wrpNPgkNWcr4A24
// SIG // 5oyZ1uEi6vAnQj0llOZ0dFtq0Z4+7X6gMTN9vMvpe784
// SIG // cETRkPHIqzqKOghif9lwY1NNje6CbaUFEMFxBmoQtB1V
// SIG // M1izoXBm8qGCAtQwggI9AgEBMIIBAKGB2KSB1TCB0jEL
// SIG // MAkGA1UEBhMCVVMxEzARBgNVBAgTCldhc2hpbmd0b24x
// SIG // EDAOBgNVBAcTB1JlZG1vbmQxHjAcBgNVBAoTFU1pY3Jv
// SIG // c29mdCBDb3Jwb3JhdGlvbjEtMCsGA1UECxMkTWljcm9z
// SIG // b2Z0IElyZWxhbmQgT3BlcmF0aW9ucyBMaW1pdGVkMSYw
// SIG // JAYDVQQLEx1UaGFsZXMgVFNTIEVTTjoyQUQ0LTRCOTIt
// SIG // RkEwMTElMCMGA1UEAxMcTWljcm9zb2Z0IFRpbWUtU3Rh
// SIG // bXAgU2VydmljZaIjCgEBMAcGBSsOAwIaAxUAAa7YNHNa
// SIG // QqWOZfJJfWSiscvh8yeggYMwgYCkfjB8MQswCQYDVQQG
// SIG // EwJVUzETMBEGA1UECBMKV2FzaGluZ3RvbjEQMA4GA1UE
// SIG // BxMHUmVkbW9uZDEeMBwGA1UEChMVTWljcm9zb2Z0IENv
// SIG // cnBvcmF0aW9uMSYwJAYDVQQDEx1NaWNyb3NvZnQgVGlt
// SIG // ZS1TdGFtcCBQQ0EgMjAxMDANBgkqhkiG9w0BAQUFAAIF
// SIG // AOZp/ZswIhgPMjAyMjA3MDIwNzExMjNaGA8yMDIyMDcw
// SIG // MzA3MTEyM1owdDA6BgorBgEEAYRZCgQBMSwwKjAKAgUA
// SIG // 5mn9mwIBADAHAgEAAgIbYDAHAgEAAgIRbzAKAgUA5mtP
// SIG // GwIBADA2BgorBgEEAYRZCgQCMSgwJjAMBgorBgEEAYRZ
// SIG // CgMCoAowCAIBAAIDB6EgoQowCAIBAAIDAYagMA0GCSqG
// SIG // SIb3DQEBBQUAA4GBAJUgDnd86QQn8TdfgOJ6JUsF80Br
// SIG // 9aDBSdE9FmGRYvaPPierQyfPMXBtEMthlOPZZvMZEWAV
// SIG // emu9K6wSKLT1V52jIl1ujTI4Du2vn7m48/4bAGChe/9s
// SIG // XZoKj33Am5VAVBAOM8PZJzqRBj05nfpfZ52qlOjdm+NQ
// SIG // +64KA9lZob1GMYIEDTCCBAkCAQEwgZMwfDELMAkGA1UE
// SIG // BhMCVVMxEzARBgNVBAgTCldhc2hpbmd0b24xEDAOBgNV
// SIG // BAcTB1JlZG1vbmQxHjAcBgNVBAoTFU1pY3Jvc29mdCBD
// SIG // b3Jwb3JhdGlvbjEmMCQGA1UEAxMdTWljcm9zb2Z0IFRp
// SIG // bWUtU3RhbXAgUENBIDIwMTACEzMAAAGGeOUZifgkS8wA
// SIG // AQAAAYYwDQYJYIZIAWUDBAIBBQCgggFKMBoGCSqGSIb3
// SIG // DQEJAzENBgsqhkiG9w0BCRABBDAvBgkqhkiG9w0BCQQx
// SIG // IgQgxKTNUkaZORYmzC85ODvk0DRxLsowqaiEnsYTkNar
// SIG // q44wgfoGCyqGSIb3DQEJEAIvMYHqMIHnMIHkMIG9BCAa
// SIG // mYjgsiwIVMaJjJ9EBHubsVraC7FU0jDXuZwCKrxCfjCB
// SIG // mDCBgKR+MHwxCzAJBgNVBAYTAlVTMRMwEQYDVQQIEwpX
// SIG // YXNoaW5ndG9uMRAwDgYDVQQHEwdSZWRtb25kMR4wHAYD
// SIG // VQQKExVNaWNyb3NvZnQgQ29ycG9yYXRpb24xJjAkBgNV
// SIG // BAMTHU1pY3Jvc29mdCBUaW1lLVN0YW1wIFBDQSAyMDEw
// SIG // AhMzAAABhnjlGYn4JEvMAAEAAAGGMCIEII47y6cPBCxi
// SIG // w+wnFjM17WV2/DwSA7VorfSDmoVspFqKMA0GCSqGSIb3
// SIG // DQEBCwUABIICAIzslOj4dQ2YVocrALK3NHQqS8y8hQQf
// SIG // Du32/lu5o+ZBVrKw2QTR0MiMX2QbqkKzPBqqfXh80BRp
// SIG // luMacXgAY840LalWplqb6r9u9l12pvl5Y8lq1Gj52dco
// SIG // eodlZwWYTn5p/zLohJBmJAvdtnXf7M3tu8VxozP1UPjp
// SIG // UPS3YrnvG4wlZ5GRXmKH4cMu1R9t5FV+bfHUUSxP+BPr
// SIG // j/D+ISts2dalYWStNuBkIZ5m6dqNuFX9QfZnwens/AuO
// SIG // tPws/n3pqM8CL0aw8cNNRJAaIqjVOanDkWrBtmOPZPKq
// SIG // mc9intRX4NoiaUF+aaY5MBNp4MVB9uCrz+jmtaLiuJUH
// SIG // AIWJjScRm25wcq/alH8a0yZHCIqIlHON2TQj4eupfZvU
// SIG // YGXSlbP6S2aN/i0sGLQUB5Cf7rIvOsFcUtkR3v2h9xFG
// SIG // VRVGIyTKh/IJLw4OKhKyuqxPz5Z9WA03KUgSVzHNPSQk
// SIG // a6wETTTx0PPfsRVvgWaGF6N0ZQgK51hek9jLG8mMApDg
// SIG // fpqgUqQf3loMD7lD0W+PsRGj94fOt/e/Ef+P0D5U0zc7
// SIG // 9UazX4CRNtfCUF2vVzYlgn348SScR0pbVzrA8iG9JZdY
// SIG // 75rpufyX9cyBuPqNzvHUUcxop5lAtCtnU5AW5CuGy5Zs
// SIG // 6JNAiUCQozNxJKi74saPuSLQ20GJ3q6p7ewx
// SIG // End signature block
