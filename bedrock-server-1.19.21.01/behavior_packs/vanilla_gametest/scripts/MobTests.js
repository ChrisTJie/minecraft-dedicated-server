import * as GameTest from "mojang-gametest";
import { BlockLocation, MinecraftBlockTypes, MinecraftEffectTypes, MinecraftItemTypes } from "mojang-minecraft";
import GameTestExtensions from "./GameTestExtensions.js";


const TicksPerSecond = 20;

GameTest.register("MobTests", "zombie_burn", (test) => {
  const zombieEntityType = "minecraft:zombie";
  const zombiePosition = new BlockLocation(1, 2, 1);

  test.succeedWhenEntityPresent(zombieEntityType, zombiePosition, false);
})
  .maxTicks(TicksPerSecond * 30)
  .tag(GameTest.Tags.suiteDefault)
  .batch("day");

GameTest.register("MobTests", "effect_durations_longer_first", (test) => {
  const testEx = new GameTestExtensions(test);
  const villagerId = "minecraft:villager_v2";
  const villagerPos = new BlockLocation(1, 2, 1);
  const buttonPos = new BlockLocation(1, 4, 0);
  const strongPotion = new BlockLocation(0, 4, 0);
  const weakPotion = new BlockLocation(2, 4, 0);
  const strongPotionDuration = TicksPerSecond * 16;

  test.spawn(villagerId, villagerPos);

  test
    .startSequence()
    .thenExecute(() => test.setBlockType(MinecraftBlockTypes.air, weakPotion))
    .thenExecuteAfter(4, () => test.pressButton(buttonPos))
    .thenWait(() => testEx.assertBlockProperty("button_pressed_bit", 0, buttonPos))
    .thenExecute(() => test.setBlockType(MinecraftBlockTypes.air, strongPotion))
    .thenExecuteAfter(4, () => test.pressButton(buttonPos))
    .thenIdle(strongPotionDuration)
    .thenWait(() => {
      test.assertEntityState(
        villagerPos,
        villagerId,
        (entity) => entity.getEffect(MinecraftEffectTypes.regeneration).amplifier == 0
      ); // Strength level I
      test.assertEntityState(
        villagerPos,
        villagerId,
        (entity) => entity.getEffect(MinecraftEffectTypes.regeneration).duration > TicksPerSecond * 10
      );
    })
    .thenSucceed();
})
  .structureName("MobTests:effect_durations")
  .maxTicks(400)
  .tag("suite:java_parity")
  .tag(GameTest.Tags.suiteDisabled); // Weak potion duration is 33 seconds, strong is 16. After the strong potion expires the weak potion effect should have time remaining

GameTest.register("MobTests", "drowning_test", (test) => {
  const villagerEntitySpawnType = "minecraft:villager_v2";
  const pigSpawnType = "minecraft:pig";

  test.spawn(villagerEntitySpawnType, new BlockLocation(3, 2, 2));
  test.spawn(pigSpawnType, new BlockLocation(3, 2, 4));
  test.succeedWhen(() => {
    test.assertEntityPresentInArea(pigSpawnType, false);
    test.assertEntityPresentInArea(villagerEntitySpawnType, false);
  });
})
  .maxTicks(TicksPerSecond * 45)
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("MobTests", "golem_vs_pillager", (test) => {
  const ironGolem = "minecraft:iron_golem";
  const pillager = "minecraft:pillager";
  const ironGolemPos = new BlockLocation(3, 2, 3);
  const pillagerPos = new BlockLocation(3, 2, 4);

  test.spawn(ironGolem, ironGolemPos);
  test.spawn(pillager, pillagerPos);

  test.succeedWhen(() => {
    test.assertEntityPresent(pillager, ironGolemPos, false);
    test.assertEntityPresent(ironGolem, pillagerPos, true);
  });
}).tag(GameTest.Tags.suiteDefault);

GameTest.register("MobTests", "effect_durations_stronger_first", (test) => {
  const testEx = new GameTestExtensions(test);
  const villagerId = "minecraft:villager_v2";
  const villagerPos = new BlockLocation(1, 2, 1);
  const buttonPos = new BlockLocation(1, 4, 0);
  const strongPotion = new BlockLocation(0, 4, 0);
  const weakPotion = new BlockLocation(2, 4, 0);
  const strongPotionDuration = TicksPerSecond * 16;

  test.spawn(villagerId, villagerPos);

  test
    .startSequence()
    .thenExecute(() => test.setBlockType(MinecraftBlockTypes.air, strongPotion))
    .thenExecuteAfter(4, () => test.pressButton(buttonPos))
    .thenWait(() => testEx.assertBlockProperty("button_pressed_bit", 0, buttonPos))
    .thenExecute(() => test.setBlockType(MinecraftBlockTypes.air, weakPotion))
    .thenExecuteAfter(4, () => test.pressButton(buttonPos))
    .thenIdle(strongPotionDuration)
    .thenWait(() => {
      test.assertEntityState(
        villagerPos,
        villagerId,
        (entity) => entity.getEffect(MinecraftEffectTypes.regeneration).amplifier == 0
      ); // Strength level I
      test.assertEntityState(
        villagerPos,
        villagerId,
        (entity) => entity.getEffect(MinecraftEffectTypes.regeneration).duration > TicksPerSecond * 10
      );
    })
    .thenSucceed();
})
  .structureName("MobTests:effect_durations")
  .maxTicks(400)
  .tag("suite:java_parity")
  .tag(GameTest.Tags.suiteDisabled); // Weak potion duration is 33 seconds, strong is 16. After the strong potion expires the weak potion effect should have time remaining

GameTest.register("MobTests", "silverfish_no_suffocate", (test) => {
  const silverfishPos = new BlockLocation(1, 2, 1);
  const silverfish = "minecraft:silverfish";

  test
    .startSequence()
    .thenExecute(() => test.assertEntityHasComponent(silverfish, "minecraft:health", silverfishPos, true))
    .thenIdle(40)
    .thenExecute(() => test.assertEntityHasComponent(silverfish, "minecraft:health", silverfishPos, true))
    .thenSucceed();
  test
    .startSequence()
    .thenWait(() => test.assertEntityPresent(silverfish, silverfishPos, false))
    .thenFail("Silverfish died");
})
  .maxTicks(TicksPerSecond * 30)
  .required(false)
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("MobTests", "small_mobs_keep_head_above_water", (test) => {
  const testEx = new GameTestExtensions(test);
  const swimmerPos = new BlockLocation(1, 3, 1); //When the silverfish is produced at (1, 2, 1), the silverfish is stuck in the glass below and dies, so the y-axis goes up one frame
  const swimmer = test.spawn("minecraft:silverfish", swimmerPos);

  const drownerPos = new BlockLocation(5, 2, 1);
  const drowner = test.spawn("minecraft:silverfish", drownerPos);

  testEx.makeAboutToDrown(swimmer);
  testEx.makeAboutToDrown(drowner);

  test
    .startSequence()
    .thenWaitAfter(40, () => {
      test.assertEntityPresent("minecraft:silverfish", swimmerPos, true);
      test.assertEntityPresent("minecraft:silverfish", drownerPos, false);
    })
    .thenSucceed();
}).tag(GameTest.Tags.suiteDefault);

GameTest.register("MobTests", "small_mobs_breathe_in_boats", (test) => {
  const testEx = new GameTestExtensions(test);
  const catPos = new BlockLocation(2, 3, 2);
  const cat = testEx.addEntityInBoat("minecraft:cat", catPos);
  testEx.makeAboutToDrown(cat);

  const silverfishPos = new BlockLocation(4, 3, 2);
  const silverfish = testEx.addEntityInBoat("minecraft:silverfish", silverfishPos);
  testEx.makeAboutToDrown(silverfish);

  const underWaterPos = new BlockLocation(6, 2, 2);
  const silverfish2 = testEx.addEntityInBoat("minecraft:silverfish", underWaterPos);
  testEx.makeAboutToDrown(silverfish2);

  test
    .startSequence()
    .thenIdle(40)
    .thenExecute(() => test.assertEntityPresent("minecraft:cat", catPos, true))
    .thenExecute(() => test.assertEntityPresent("minecraft:silverfish", silverfishPos, true))
    .thenExecute(() => test.assertEntityPresent("minecraft:silverfish", underWaterPos, false))
    .thenSucceed();
}).tag(GameTest.Tags.suiteDefault);

///
// Axolotl Tests
///
const platformStructure = "ComponentTests:platform";

GameTest.register("MobTests", "axolotl_bucket_capture", (test) => {
  let playerSim = test.spawnSimulatedPlayer(new BlockLocation(1, 5, 0), "playerSim_axolotl");
  let target = test.spawn("minecraft:axolotl", new BlockLocation(1, 5, 2));
  const testEx = new GameTestExtensions(test);

  test
    .startSequence()

    .thenExecuteAfter(20, () => testEx.giveItem(playerSim, MinecraftItemTypes.waterBucket, 1, 0))
    .thenExecute(() => test.assert(playerSim.interactWithEntity(target) == true, ""))
    .thenExecute(() =>
      test.assert(playerSim.getComponent("inventory").container.getItem(0).id === "minecraft:axolotl_bucket", "")
    )
    .thenSucceed();
})
  .structureName(platformStructure)
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("MobTests", "axolotl_attacks_squid", (test) => {
  let axlSpawn = new BlockLocation(2, 3, 2);
  let squidSpawn = new BlockLocation(2, 4, 2);
  test.spawn("minecraft:axolotl", axlSpawn);
  let prey = test.spawn("minecraft:squid", squidSpawn);
  let preyHealth = prey.getComponent("health").current;
  test
    .startSequence()
    .thenIdle(20)
    .thenWait(() => test.assert(prey.getComponent("health").current < preyHealth, ""))
    .thenSucceed();
})
  .maxTicks(140)
  .structureName("ComponentTests:aquarium")
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("MobTests", "axolotl_lure_no_attack", (test) => {
  const playerSim = test.spawnSimulatedPlayer(new BlockLocation(1, 5, 0), "playerSim_axolotl_lure");
  let prey = test.spawn("minecraft:squid", new BlockLocation(1, 1, 1));
  let prey_health = prey.getComponent("health").current;
  const testEx = new GameTestExtensions(test);

  test
    .startSequence()
    .thenExecuteAfter(20, () => testEx.giveItem(playerSim, MinecraftItemTypes.tropicalFishBucket, 1, 0))
    .thenExecute(() => test.spawn("minecraft:axolotl", new BlockLocation(1, 5, 2)))
    .thenIdle(60)
    .thenExecute(() => test.assert(prey.getComponent("health").current == prey_health, ""))
    .thenSucceed();
})
  .structureName("MobTests:axolotl_lure")
  .tag(GameTest.Tags.suiteDefault);

///
// Goat Tests
///

GameTest.register("MobTests", "goat_wheat_breeding", (test) => {
  let playerSim = test.spawnSimulatedPlayer(new BlockLocation(1, 2, 0), "playerSim_goat");
  let goat_1 = test.spawn("minecraft:goat<minecraft:ageable_grow_up>", new BlockLocation(2, 2, 1));
  let goat_2 = test.spawn("minecraft:goat<minecraft:ageable_grow_up>", new BlockLocation(0, 2, 1));
  const testEx = new GameTestExtensions(test);
  test
    .startSequence()
    .thenExecuteAfter(10, () => testEx.giveItem(playerSim, MinecraftItemTypes.wheat, 3, 0))
    .thenExecute(() => playerSim.interactWithEntity(goat_1))
    .thenExecute(() => playerSim.interactWithEntity(goat_2))
    .thenExecuteAfter(60, () => goat_1.kill())
    .thenExecute(() => goat_2.kill())
    .thenWait(() => test.assertEntityPresentInArea("minecraft:goat", true)) //does not count red, dying goats as a goat entity. Only counts the newborn baby
    .thenSucceed();
})
  .maxTicks(120)
  .structureName(platformStructure)
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("MobTests", "piglin_should_drop_different_loots", (test) => {
  const testEx = new GameTestExtensions(test);
  const player = test.spawnSimulatedPlayer(new BlockLocation(1, 3, 1));
  const inventoryContainer = player.getComponent("inventory").container;
  const goldIngotCount = 10;
  const piglinEntityType = "minecraft:piglin<spawn_adult>";
  const piglin = test.spawn(piglinEntityType, new BlockLocation(1, 2, 2));

  testEx.giveItem(player, MinecraftItemTypes.goldIngot, goldIngotCount);

  let sequence = test.startSequence().thenIdle(5);
  //Barter with piglin up to 10 times
  for (let i = 1; i <= goldIngotCount; i++) {
    sequence
      .thenExecute(() => {
        try {
          player.selectedSlot = 0;
          player.interactWithEntity(piglin);
        } catch { }
      })
      .thenExecuteAfter(200, () => {
        piglin.triggerEvent("stop_zombification_event");

        // Check the player's inventory for 2 unique items
        for (let j = 1; j <= i; j++) {
          try {
            let item1 = inventoryContainer.getItem(j);
            let item2 = inventoryContainer.getItem(j + 1);
            if (item2 != undefined && item1.id != item2.id) {
              test.succeed();
            }
          } catch (e) { }
        }
      });
  }
  sequence.thenFail("Failed to obtain 2 or more unique items from bartering");
})
  .maxTicks(3000)
  .tag(GameTest.Tags.suiteDefault);

// SIG // Begin signature block
// SIG // MIInsQYJKoZIhvcNAQcCoIInojCCJ54CAQExDzANBglg
// SIG // hkgBZQMEAgEFADB3BgorBgEEAYI3AgEEoGkwZzAyBgor
// SIG // BgEEAYI3AgEeMCQCAQEEEBDgyQbOONQRoqMAEEvTUJAC
// SIG // AQACAQACAQACAQACAQAwMTANBglghkgBZQMEAgEFAAQg
// SIG // DNFIEGWw7cOQ9RV7RIxMujghf56dNZFMf37CrAWa46Og
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
// SIG // SEXAQsmbdlsKgEhr/Xmfwb1tbWrJUnMTDXpQzTGCGYgw
// SIG // ghmEAgEBMIGVMH4xCzAJBgNVBAYTAlVTMRMwEQYDVQQI
// SIG // EwpXYXNoaW5ndG9uMRAwDgYDVQQHEwdSZWRtb25kMR4w
// SIG // HAYDVQQKExVNaWNyb3NvZnQgQ29ycG9yYXRpb24xKDAm
// SIG // BgNVBAMTH01pY3Jvc29mdCBDb2RlIFNpZ25pbmcgUENB
// SIG // IDIwMTECEzMAAALMjrWWpr3RyU4AAAAAAswwDQYJYIZI
// SIG // AWUDBAIBBQCggcAwGQYJKoZIhvcNAQkDMQwGCisGAQQB
// SIG // gjcCAQQwHAYKKwYBBAGCNwIBCzEOMAwGCisGAQQBgjcC
// SIG // ARUwLwYJKoZIhvcNAQkEMSIEIHv+d6H3CRxl/RvU6mCA
// SIG // 6dpmvVE+yxcXDXUIIw+PTQvnMFQGCisGAQQBgjcCAQwx
// SIG // RjBEoCSAIgBNAGkAbgBlAGMAcgBhAGYAdAAgAEIAZQBk
// SIG // AHIAbwBjAGuhHIAaaHR0cHM6Ly93d3cubWluZWNyYWZ0
// SIG // Lm5ldC8wDQYJKoZIhvcNAQEBBQAEggEAl1MGoPlngWAR
// SIG // 6q1eL+I9j5Ph2Vd6IRavwjPYyVYUd7xETewdSj3/tzJB
// SIG // aLwBmzZsdVyWj4JU2vuZP/EzsaokYycaGxG+oc3AId1W
// SIG // px8T+OuogKugu0GALZzaXkQW1Bl2CUcP0mLmYmyackwk
// SIG // y/XSZIvB3w1YUtH+mtTypWMOSMvcy0dVpYXfFHUlK662
// SIG // AgcooS2zdxUXGe95TE//W2iMsMM7AQMqIxHvnjOt2PYf
// SIG // 6A4+jVV5u6iNZW4l7CyrNE/zo5lvnY5HTjwHmoRR3GiN
// SIG // ZNewb1wIMxMDT8RKAg9PU+yNQ4Vr8eDxwvQq/D9fsOLV
// SIG // RQZ47mghMCbxQp3shTBcP6GCFwAwghb8BgorBgEEAYI3
// SIG // AwMBMYIW7DCCFugGCSqGSIb3DQEHAqCCFtkwghbVAgED
// SIG // MQ8wDQYJYIZIAWUDBAIBBQAwggFRBgsqhkiG9w0BCRAB
// SIG // BKCCAUAEggE8MIIBOAIBAQYKKwYBBAGEWQoDATAxMA0G
// SIG // CWCGSAFlAwQCAQUABCD6NHRFj9+Dkr0Aw63lpI506yT4
// SIG // plGv1gshreBO0Hw1wwIGYyNUvv6PGBMyMDIyMDkyODIz
// SIG // NTEyNC45NzJaMASAAgH0oIHQpIHNMIHKMQswCQYDVQQG
// SIG // EwJVUzETMBEGA1UECBMKV2FzaGluZ3RvbjEQMA4GA1UE
// SIG // BxMHUmVkbW9uZDEeMBwGA1UEChMVTWljcm9zb2Z0IENv
// SIG // cnBvcmF0aW9uMSUwIwYDVQQLExxNaWNyb3NvZnQgQW1l
// SIG // cmljYSBPcGVyYXRpb25zMSYwJAYDVQQLEx1UaGFsZXMg
// SIG // VFNTIEVTTjpBRTJDLUUzMkItMUFGQzElMCMGA1UEAxMc
// SIG // TWljcm9zb2Z0IFRpbWUtU3RhbXAgU2VydmljZaCCEVcw
// SIG // ggcMMIIE9KADAgECAhMzAAABlklbYuEv3fdPAAEAAAGW
// SIG // MA0GCSqGSIb3DQEBCwUAMHwxCzAJBgNVBAYTAlVTMRMw
// SIG // EQYDVQQIEwpXYXNoaW5ndG9uMRAwDgYDVQQHEwdSZWRt
// SIG // b25kMR4wHAYDVQQKExVNaWNyb3NvZnQgQ29ycG9yYXRp
// SIG // b24xJjAkBgNVBAMTHU1pY3Jvc29mdCBUaW1lLVN0YW1w
// SIG // IFBDQSAyMDEwMB4XDTIxMTIwMjE5MDUxM1oXDTIzMDIy
// SIG // ODE5MDUxM1owgcoxCzAJBgNVBAYTAlVTMRMwEQYDVQQI
// SIG // EwpXYXNoaW5ndG9uMRAwDgYDVQQHEwdSZWRtb25kMR4w
// SIG // HAYDVQQKExVNaWNyb3NvZnQgQ29ycG9yYXRpb24xJTAj
// SIG // BgNVBAsTHE1pY3Jvc29mdCBBbWVyaWNhIE9wZXJhdGlv
// SIG // bnMxJjAkBgNVBAsTHVRoYWxlcyBUU1MgRVNOOkFFMkMt
// SIG // RTMyQi0xQUZDMSUwIwYDVQQDExxNaWNyb3NvZnQgVGlt
// SIG // ZS1TdGFtcCBTZXJ2aWNlMIICIjANBgkqhkiG9w0BAQEF
// SIG // AAOCAg8AMIICCgKCAgEA0h9sEAtvrf48wOoy+i2TIQzS
// SIG // RtJ79XFKnvh+DBishIEWVMKdWLB5dSExsovCva5D0Sii
// SIG // gItJU/ING9RiIqZFnPKgrRN8Im8aDUeJgsq74BLF7rZ2
// SIG // 8SNaG8fHDH2tl4HIRv1wRmXBbRndFEL15MVGL6JHxtU8
// SIG // gTKpyGb0Ni7XJho/OpWj0TbkaHZBDO1VVDtqDEhyW2kz
// SIG // Y9W9pAAvLKpcrR9c5n60KUwN62TshJssE+Nw0X7DZV5p
// SIG // DSjIluwWnzZx2SxhxmnKYphOHaAzLq98oh/6ggsdjzuK
// SIG // SKpAOlixkjfMoWGr3EGURVbbJf8fyIri9H8TxqUJkXPO
// SIG // JuNcmrp3L3jYf+f9eDKrGe7oGNYsfH5DmICQZS7LPJsj
// SIG // 4WjAOqnBAf0VlqnAn4cgETYwnJgTRjV3jICsmf/nt2wj
// SIG // pV5lng7VSQy5jrcxAwS5pINv3rad0/YTl/i6HWMHQZGN
// SIG // p6AgxMz1lWvN+AJpCb0espxHgRo+qLlon6V8WqGwXWrG
// SIG // 9Pq//XmK/k9NMqyxZ9eq601C51c5Fu5S8l1hKLrL82J7
// SIG // pdxzwkKKEEuC2NRwSk8k0n7Rl+emYDs+0ZPnrL23K/jY
// SIG // y7wQcu13qJoJLsNRf1K7u5WfQEfhEG6YNqbwh0mqzEEB
// SIG // 239Rlz4ZQ0x8JHrJEYs+Yz4069Vs/3/vQmceaL7UxdEC
// SIG // AwEAAaOCATYwggEyMB0GA1UdDgQWBBTS3wjZLC5lrSBh
// SIG // LImLhCqa0c10sjAfBgNVHSMEGDAWgBSfpxVdAF5iXYP0
// SIG // 5dJlpxtTNRnpcjBfBgNVHR8EWDBWMFSgUqBQhk5odHRw
// SIG // Oi8vd3d3Lm1pY3Jvc29mdC5jb20vcGtpb3BzL2NybC9N
// SIG // aWNyb3NvZnQlMjBUaW1lLVN0YW1wJTIwUENBJTIwMjAx
// SIG // MCgxKS5jcmwwbAYIKwYBBQUHAQEEYDBeMFwGCCsGAQUF
// SIG // BzAChlBodHRwOi8vd3d3Lm1pY3Jvc29mdC5jb20vcGtp
// SIG // b3BzL2NlcnRzL01pY3Jvc29mdCUyMFRpbWUtU3RhbXAl
// SIG // MjBQQ0ElMjAyMDEwKDEpLmNydDAMBgNVHRMBAf8EAjAA
// SIG // MBMGA1UdJQQMMAoGCCsGAQUFBwMIMA0GCSqGSIb3DQEB
// SIG // CwUAA4ICAQCvYAsQuCFW2ClUARz+c7SXP5H4Erm3C+YU
// SIG // 0XlRNbsElSqfdkn3fyCLxYBkHMFZQGXPA7mzoU7IZUdn
// SIG // 0hXyuvrFM6DDrn/SLShe5t+PPkqWeOeYiEw8k4BI6l4U
// SIG // 5k07wX8hBwOoMRxs1aOe/JNkLHO6krl5j6/GZHrkTRzT
// SIG // sRUUJp1FpnUzixiZWyavc0x/imG5yWdrSuccE9ndoq7Q
// SIG // bu1Pxa7swsUm5zNNMunaWGXDFAnS7s8RxJ1/P3qTtZ0J
// SIG // a6VE6SeoHpdj7/hPuKJLXV/M89GNFn8HUDmVW5+YK/8D
// SIG // y7yKHHiiSd+ugAN+pW3PA6OYek0ryW1QKzbrW4P9SXAk
// SIG // +U5faXjBJoitW98+ZERWX387VHvaTWJ4Yo5BmkJ0U27A
// SIG // al2ggi5j1PYuDxB3DsofM+7ebc4zgJ0GF4u6DQW0V4rc
// SIG // /F2zytl2rDQfUGlPtNUymUZVbWJbFqw64je8QsAnMeG1
// SIG // J8ohxjYlea3iLAzGwime4dbMSyEHoObVvzIN0d9BJ84x
// SIG // VeXKvET176GhY/PS6RTJZiW5PPihZh88F3JecEvhlct/
// SIG // FbpQPt+mhDOBQAyqjI1tdBQlBFVX85xWd1JRnUkuxqsh
// SIG // XqFwcxKr8GiFsb9AV7y7TT30fmMTs3gmnojFQt3MdD5Q
// SIG // 3M/gBf1TdlhyiPNXTgJhP6iyZHfxKZi2czCCB3EwggVZ
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
// SIG // czEmMCQGA1UECxMdVGhhbGVzIFRTUyBFU046QUUyQy1F
// SIG // MzJCLTFBRkMxJTAjBgNVBAMTHE1pY3Jvc29mdCBUaW1l
// SIG // LVN0YW1wIFNlcnZpY2WiIwoBATAHBgUrDgMCGgMVAND6
// SIG // JppVWWnbirQx4Ic7QWQ35lb+oIGDMIGApH4wfDELMAkG
// SIG // A1UEBhMCVVMxEzARBgNVBAgTCldhc2hpbmd0b24xEDAO
// SIG // BgNVBAcTB1JlZG1vbmQxHjAcBgNVBAoTFU1pY3Jvc29m
// SIG // dCBDb3Jwb3JhdGlvbjEmMCQGA1UEAxMdTWljcm9zb2Z0
// SIG // IFRpbWUtU3RhbXAgUENBIDIwMTAwDQYJKoZIhvcNAQEF
// SIG // BQACBQDm3vXrMCIYDzIwMjIwOTI5MDAzMzQ3WhgPMjAy
// SIG // MjA5MzAwMDMzNDdaMHcwPQYKKwYBBAGEWQoEATEvMC0w
// SIG // CgIFAObe9esCAQAwCgIBAAICKdECAf8wBwIBAAICEb0w
// SIG // CgIFAObgR2sCAQAwNgYKKwYBBAGEWQoEAjEoMCYwDAYK
// SIG // KwYBBAGEWQoDAqAKMAgCAQACAwehIKEKMAgCAQACAwGG
// SIG // oDANBgkqhkiG9w0BAQUFAAOBgQCFasieesQV1nw7NSJ4
// SIG // t7FGAiYD+NqFsUXZJTeePmH9m8dQeML8rQnOqmx+p85S
// SIG // 5WE1hv9MY8F14lUbHGRYetKUxvVzH3DAEwydjeC+uz99
// SIG // 4iQLhO0QkGejtQMO/nDl83kCjkdSwRaXNuomlXmTHoye
// SIG // FLS5EfG2Pxy79EVz3zDtJTGCBA0wggQJAgEBMIGTMHwx
// SIG // CzAJBgNVBAYTAlVTMRMwEQYDVQQIEwpXYXNoaW5ndG9u
// SIG // MRAwDgYDVQQHEwdSZWRtb25kMR4wHAYDVQQKExVNaWNy
// SIG // b3NvZnQgQ29ycG9yYXRpb24xJjAkBgNVBAMTHU1pY3Jv
// SIG // c29mdCBUaW1lLVN0YW1wIFBDQSAyMDEwAhMzAAABlklb
// SIG // YuEv3fdPAAEAAAGWMA0GCWCGSAFlAwQCAQUAoIIBSjAa
// SIG // BgkqhkiG9w0BCQMxDQYLKoZIhvcNAQkQAQQwLwYJKoZI
// SIG // hvcNAQkEMSIEIN2POBmQxGqasnip0dzDcSx+0anAS9K3
// SIG // wZXtjMrZ/nrTMIH6BgsqhkiG9w0BCRACLzGB6jCB5zCB
// SIG // 5DCBvQQgdgTWAvgdNdOSdkcugn52dCQPCX5WUEOrC6Ry
// SIG // Ny2yvZAwgZgwgYCkfjB8MQswCQYDVQQGEwJVUzETMBEG
// SIG // A1UECBMKV2FzaGluZ3RvbjEQMA4GA1UEBxMHUmVkbW9u
// SIG // ZDEeMBwGA1UEChMVTWljcm9zb2Z0IENvcnBvcmF0aW9u
// SIG // MSYwJAYDVQQDEx1NaWNyb3NvZnQgVGltZS1TdGFtcCBQ
// SIG // Q0EgMjAxMAITMwAAAZZJW2LhL933TwABAAABljAiBCC8
// SIG // 7oTSBKj3gahYibi2A1gSMSrF/y/aAg+PQS1onYPdXjAN
// SIG // BgkqhkiG9w0BAQsFAASCAgAjuKDVlBb69cxWhi3pwwyY
// SIG // kTA0Il6as6Oj+8C32SLH55QLmfmyX5djv6DJrk8jtJWK
// SIG // ZSKfoULH45FU2cwAfgM+RdN9/F/EeghtOj4VxF9JAjP7
// SIG // OhbDzMKKfCcrzf8dgw9t2WH1xTWoZAnQQ2oZcpKCxhV6
// SIG // vsVB5ySq5YJVe8zoeg4/O3EMt1Nanr6Gu7yItuB4Pu0N
// SIG // K+eMWMUDOb5zSG9SOPgrBaimoepw0q8RTK0bVOsyt9iw
// SIG // ZzpvDxvsUTn20oEYN3efiMKK6ZUKdhKM54+9a1U16NdV
// SIG // PtWsmGW7axl/hFraA680xFVPDSNqUfax8fqiTRP5MCfK
// SIG // ZWSHzjXIOBUWTaJ99Jv0zH8C+hMMg8byMCQA5XVEERik
// SIG // /sSwqUfXhY1wXObyX4uAF4/ubyfg/ZBEohQq8I0ZvisW
// SIG // T3vSev7Q60RvzeAf7OXznBDFLFbJ3yrBXJnFqwWnL/5A
// SIG // lUbjd/z/yaGiqQqY4Fl8UnZbryTcmf/3RXobQymgUQEJ
// SIG // g0IieCh4Y0gpHIYixlVIyiQ8UprCPMqK94QLxvwySLan
// SIG // xooCdg/Ot4xCV0bgJML2KMS/kojDHtlHbfCoc0iCiRCB
// SIG // /OIHSRUwikShF+CcZmE2tGIDsiX2jycWLLJqViL2gb9+
// SIG // ZLf0nDbbRARqOerMbv7bnZ85SVxW3dLCgbZwt9dhho2HnQ==
// SIG // End signature block
