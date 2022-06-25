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
// SIG // MIInugYJKoZIhvcNAQcCoIInqzCCJ6cCAQExDzANBglg
// SIG // hkgBZQMEAgEFADB3BgorBgEEAYI3AgEEoGkwZzAyBgor
// SIG // BgEEAYI3AgEeMCQCAQEEEBDgyQbOONQRoqMAEEvTUJAC
// SIG // AQACAQACAQACAQACAQAwMTANBglghkgBZQMEAgEFAAQg
// SIG // DNFIEGWw7cOQ9RV7RIxMujghf56dNZFMf37CrAWa46Og
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
// SIG // ARUwLwYJKoZIhvcNAQkEMSIEIHv+d6H3CRxl/RvU6mCA
// SIG // 6dpmvVE+yxcXDXUIIw+PTQvnMFQGCisGAQQBgjcCAQwx
// SIG // RjBEoCSAIgBNAGkAbgBlAGMAcgBhAGYAdAAgAEIAZQBk
// SIG // AHIAbwBjAGuhHIAaaHR0cHM6Ly93d3cubWluZWNyYWZ0
// SIG // Lm5ldC8wDQYJKoZIhvcNAQEBBQAEggEAjhG+Ui95TZtx
// SIG // ce5KXPG90v4m6M6DVz+Fw1l8MouhuSntlEDjivb4FrwA
// SIG // y8QoLA+odTUCjSXKmzpjgPbjWTcDDPuRBg+f0DBNrn4W
// SIG // mzl+8MUfSXRZT3qZ7nQnJV67E0o2JTbQm0t1gCGCQ8LT
// SIG // auLnzHtGNg5JKio01giiA6jRh4ZxhgZ3k0yU1WzsHGOW
// SIG // fRza/ScT5Xb2/fN6qq6fGbY796D2JL1aQEa3YkzpHdTg
// SIG // fMKGd6zw2GoLxW48O9lGzuk2xmuD3kYH2YnYoknv9Ypd
// SIG // yfqfjYCpUojY6FjunWwkt2MYoaa4H0kc5Yceh6Cj7ZVT
// SIG // lB3i1xlw6HD80ESTBvyaQqGCFwkwghcFBgorBgEEAYI3
// SIG // AwMBMYIW9TCCFvEGCSqGSIb3DQEHAqCCFuIwghbeAgED
// SIG // MQ8wDQYJYIZIAWUDBAIBBQAwggFVBgsqhkiG9w0BCRAB
// SIG // BKCCAUQEggFAMIIBPAIBAQYKKwYBBAGEWQoDATAxMA0G
// SIG // CWCGSAFlAwQCAQUABCDjykVV/WgwTa6Xrn+uJvT8ntqn
// SIG // KD228otVjZhSZzEX0QIGYoSvPeOIGBMyMDIyMDUyNzAw
// SIG // NTAyOS4wNTRaMASAAgH0oIHUpIHRMIHOMQswCQYDVQQG
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
// SIG // AQQwLwYJKoZIhvcNAQkEMSIEIEPISHimHB2AZO+GDQvP
// SIG // q0xPdizAHilGBxAC9eIoGRiyMIH6BgsqhkiG9w0BCRAC
// SIG // LzGB6jCB5zCB5DCBvQQgDhyv+rCFYBFUlQ9wK75OjskC
// SIG // r0cRRysq2lM2zdfwClcwgZgwgYCkfjB8MQswCQYDVQQG
// SIG // EwJVUzETMBEGA1UECBMKV2FzaGluZ3RvbjEQMA4GA1UE
// SIG // BxMHUmVkbW9uZDEeMBwGA1UEChMVTWljcm9zb2Z0IENv
// SIG // cnBvcmF0aW9uMSYwJAYDVQQDEx1NaWNyb3NvZnQgVGlt
// SIG // ZS1TdGFtcCBQQ0EgMjAxMAITMwAAAasJCe+rY9ToqQAB
// SIG // AAABqzAiBCCQwoh7D6UWLEhXxUrE2xczvVqnPji6NIjR
// SIG // a1cUnb/IvjANBgkqhkiG9w0BAQsFAASCAgCKfbLMQzl5
// SIG // ypACt0mHH9hCee633yhBTrnoLPa+bFuN055d4kFA7EaC
// SIG // xsqKZmUYb4YAvj14mKAp5u/ZWHHZpjE0OElEOuDzeQXb
// SIG // j0Nxlo5WfCvNk8kOZquwsl6AqPYhYKwR0OoIhlfUSzIJ
// SIG // 2boeHaAwmiEz/RFApZMZDLV5asgFtpmmUEAHCxijDlHJ
// SIG // FLPEifpfVVdQCwjq4B1o/lkRhjmLZXkxfoaKsaB3noA2
// SIG // iuJVtFG9xfY11Lg/jJxKwWgwjtd62mdUtILrQ3YlJfSh
// SIG // rQzigk5oGY/zQmHTGrdFAKSiA/WYE6VXjBHgY6JXhQ1T
// SIG // jxw1X542VHifnUhpkryVT7TXz/27II+7M6cqXbmWdmiS
// SIG // Za8oaaraLYYUAFJ80GzsH7ot3UoBklQEzjy4kVn7egm2
// SIG // 3kKORda7ej3SoLhutsnJ14u8AGRkEEy9hOjIMkDiYSMM
// SIG // IwiV1RrC1qgK+/WHSHBM0Cvwnqxpt/uJqUcv9KKmjiV3
// SIG // OiDDPR8m1d/X5k+HVPSAfVA/eHDGCPyB6npz/GpDL7lG
// SIG // +fiNAGIyfHrtY+USrrMCyi3ijwmWx5WzIc0fWytz9Vb5
// SIG // ci4NqWe6t4LVen92qBwDfR4z5fAfH5Gmtn7SUB2RKWak
// SIG // RnY4U8G0QXoY4e859hYsvkjpSHO/A3wS/W7eb6UxEFYp
// SIG // 95axRyq2KydXrg==
// SIG // End signature block
