import * as GameTest from "mojang-gametest";
import { BlockLocation, MinecraftBlockTypes, MinecraftItemTypes, ItemStack } from "mojang-minecraft";
import GameTestExtensions from "./GameTestExtensions.js";

const armorSlotTorso = 1;
const pinkCarpet = 6;
const tameMountComponentName = "minecraft:tamemount";
const threeSecondsInTicks = 60;

GameTest.register("DispenserTests", "dispenser_shears_sheep", (test) => {
  const sheepId = "minecraft:sheep<minecraft:ageable_grow_up>";
  const entityLoc = new BlockLocation(1, 2, 1);
  test.spawn(sheepId, entityLoc);
  test.assertEntityPresent(sheepId, entityLoc, true);
  test.assertEntityHasComponent(sheepId, "minecraft:is_sheared", entityLoc, false);

  test.pressButton(new BlockLocation(0, 2, 0));

  test.assertEntityPresent(sheepId, entityLoc, true);
  test.succeedWhenEntityHasComponent(sheepId, "minecraft:is_sheared", entityLoc, true);
})
  .maxTicks(threeSecondsInTicks)
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("DispenserTests", "dispenser_shears_mooshroom", (test) => {
  const cowId = "minecraft:cow<minecraft:ageable_grow_up>";
  const mooshroomId = "minecraft:mooshroom<minecraft:ageable_grow_up>";
  const entityLoc = new BlockLocation(1, 2, 1);
  test.spawn(mooshroomId, entityLoc);
  test.assertEntityPresent(mooshroomId, entityLoc, true);
  test.assertEntityHasComponent(mooshroomId, "minecraft:is_sheared", entityLoc, false);
  test.pressButton(new BlockLocation(0, 2, 0));

  test.succeedWhenEntityPresent(cowId, entityLoc, true);
})
  .maxTicks(threeSecondsInTicks)
  .tag("suite:java_parity")
  .tag(GameTest.Tags.suiteDisabled);

GameTest.register("DispenserTests", "dispenser_shears_snowgolem", (test) => {
  const snowGolemId = "minecraft:snow_golem";
  const entityLoc = new BlockLocation(1, 2, 1);
  test.spawn(snowGolemId, entityLoc);
  test.assertEntityPresent(snowGolemId, entityLoc, true);
  test.assertEntityHasComponent(snowGolemId, "minecraft:is_sheared", entityLoc, false);

  test.pressButton(new BlockLocation(0, 2, 0));

  test.assertEntityPresent(snowGolemId, entityLoc, true);
  test.succeedWhenEntityHasComponent(snowGolemId, "minecraft:is_sheared", entityLoc, true);
})
  .maxTicks(threeSecondsInTicks)
  .tag("suite:java_parity")
  .tag(GameTest.Tags.suiteDisabled);

GameTest.register("DispenserTests", "dispenser_horsearmor_on_horse", (test) => {
  const horseId = "minecraft:horse<minecraft:ageable_grow_up>";
  const entityLoc = new BlockLocation(1, 2, 1);
  const horse = test.spawn(horseId, entityLoc);
  horse.getComponent(tameMountComponentName).setTamed(false);

  test.assertEntityHasArmor(horseId, armorSlotTorso, "", 0, entityLoc, false);

  test.pressButton(new BlockLocation(0, 2, 0));

  test.assertEntityPresent(horseId, entityLoc, true);
  test.succeedWhen(() => {
    test.assertContainerEmpty(new BlockLocation(0, 2, 1));
    test.assertEntityHasArmor(horseId, armorSlotTorso, "diamond_horse_armor", 0, entityLoc, true);
  });
})
  .maxTicks(threeSecondsInTicks)
  .tag("suite:java_parity")
  .tag(GameTest.Tags.suiteDisabled);

GameTest.register("DispenserTests", "dispenser_saddle_on_pig", (test) => {
  const pigId = "minecraft:pig<minecraft:ageable_grow_up>";
  const entityLoc = new BlockLocation(1, 2, 1);
  test.spawn(pigId, entityLoc);
  test.assertEntityHasComponent(pigId, "minecraft:is_saddled", entityLoc, false);

  test.pressButton(new BlockLocation(0, 2, 0));

  test.assertEntityPresent(pigId, entityLoc, true);
  test.succeedWhen(() => {
    test.assertContainerEmpty(new BlockLocation(0, 2, 1));
    test.assertEntityHasComponent(pigId, "minecraft:is_saddled", entityLoc, true);
  });
})
  .maxTicks(threeSecondsInTicks)
  .tag("suite:java_parity")
  .tag(GameTest.Tags.suiteDisabled);

GameTest.register("DispenserTests", "dispenser_saddle_on_horse", (test) => {
  const horseId = "minecraft:horse<minecraft:ageable_grow_up>";
  const entityLoc = new BlockLocation(1, 2, 1);
  const horse = test.spawn(horseId, entityLoc);
  test.assertEntityInstancePresent(horse, entityLoc);
  horse.getComponent(tameMountComponentName).setTamed(false);
  test.assertEntityHasComponent(horseId, "minecraft:is_saddled", entityLoc, false);

  test.pressButton(new BlockLocation(0, 2, 0));

  test.assertEntityPresent(horseId, entityLoc, true);
  test.succeedWhen(() => {
    test.assertContainerEmpty(new BlockLocation(0, 2, 1));
    test.assertEntityHasComponent(horseId, "minecraft:is_saddled", entityLoc, true);
  });
})
  .maxTicks(threeSecondsInTicks)
  .tag("suite:java_parity")
  .tag(GameTest.Tags.suiteDisabled);

GameTest.register("DispenserTests", "dispenser_chest_on_llama", (test) => {
  const llamaId = "minecraft:llama<minecraft:ageable_grow_up>";
  const entityLoc = new BlockLocation(1, 2, 1);
  const llama = test.spawn(llamaId, entityLoc);
  llama.getComponent(tameMountComponentName).setTamed(false);
  test.assertEntityHasComponent(llamaId, "minecraft:is_chested", entityLoc, false);
  test.assertEntityHasArmor(llamaId, armorSlotTorso, "", 0, entityLoc, false);

  test.pressButton(new BlockLocation(0, 2, 0));

  test.assertEntityPresent(llamaId, entityLoc, true);
  test.succeedWhen(() => {
    test.assertContainerEmpty(new BlockLocation(0, 2, 1));
    test.assertEntityHasComponent(llamaId, "minecraft:is_chested", entityLoc, true);
  });
})
  .maxTicks(threeSecondsInTicks)
  .tag("suite:java_parity")
  .tag(GameTest.Tags.suiteDisabled);

GameTest.register("DispenserTests", "dispenser_carpet_on_llama", (test) => {
  const llamaId = "minecraft:llama<minecraft:ageable_grow_up>";
  const entityLoc = new BlockLocation(1, 2, 1);
  const llama = test.spawn(llamaId, entityLoc);
  llama.getComponent(tameMountComponentName).setTamed(false);
  test.assertEntityHasArmor(llamaId, armorSlotTorso, "", 0, entityLoc, false);

  test.pressButton(new BlockLocation(0, 2, 0));

  test.assertEntityPresent(llamaId, entityLoc, true);
  test.succeedWhen(() => {
    test.assertContainerEmpty(new BlockLocation(0, 2, 1));
    test.assertEntityHasArmor(llamaId, armorSlotTorso, "minecraft:carpet", pinkCarpet, entityLoc, true);
  });
})
  .maxTicks(threeSecondsInTicks)
  .tag("suite:java_parity")
  .tag(GameTest.Tags.suiteDisabled);

function dispenserMinecartTest(test, entityId) {
  const minecartPos = new BlockLocation(1, 2, 1);
  test.assertEntityPresent(entityId, minecartPos, false);

  test.pressButton(new BlockLocation(0, 2, 0));

  test.succeedWhen(() => {
    test.assertContainerEmpty(new BlockLocation(0, 2, 1));
    test.assertEntityPresent(entityId, minecartPos, true);
  });
}

GameTest.register("DispenserTests", "dispenser_minecart_track", (test) => {
  dispenserMinecartTest(test, "minecraft:minecart");
})
  .maxTicks(threeSecondsInTicks)
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("DispenserTests", "dispenser_minecart", (test) => {
  dispenserMinecartTest(test, "minecraft:item");
})
  .maxTicks(threeSecondsInTicks)
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("DispenserTests", "dispenser_water", (test) => {
  const waterPos = new BlockLocation(1, 2, 1);
  const dispenserPos = new BlockLocation(0, 2, 1);
  test.assertBlockPresent(MinecraftBlockTypes.water, waterPos, false);
  test.assertContainerContains(new ItemStack(MinecraftItemTypes.waterBucket, 1, 0), dispenserPos);

  test.pressButton(new BlockLocation(0, 2, 0));

  test.succeedWhen(() => {
    test.assertContainerContains(new ItemStack(MinecraftItemTypes.bucket, 1, 0), dispenserPos);
    test.assertBlockPresent(MinecraftBlockTypes.water, waterPos, true);
  });
})
  .maxTicks(threeSecondsInTicks)
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("DispenserTests", "dispenser_arrow_trap", (test) => {
  const sheepId = "minecraft:sheep<minecraft:ageable_grow_up>";
  const sheepPos = new BlockLocation(4, 2, 2);
  test.spawn(sheepId, sheepPos);
  test.assertEntityPresent(sheepId, sheepPos, true);
  test.pullLever(new BlockLocation(2, 3, 2));
  test.succeedWhenEntityPresent(sheepId, sheepPos, false);
})
  .maxTicks(200)
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("DispenserTests", "dispenser_charge_respawn_anchor", (test) => {
  const testEx = new GameTestExtensions(test);
  test.pressButton(new BlockLocation(0, 2, 0));
  const respawnAnchorPos = new BlockLocation(1, 2, 1);
  const dispenserPos = new BlockLocation(0, 2, 1);
  test.assertContainerContains(new ItemStack(MinecraftItemTypes.glowstone, 1, 0), dispenserPos);

  testEx.assertBlockProperty("respawn_anchor_charge", 0, respawnAnchorPos);
  test.succeedWhen(() => {
    testEx.assertBlockProperty("respawn_anchor_charge", 1, respawnAnchorPos);
    test.assertContainerEmpty(dispenserPos);
  });
})
  .maxTicks(threeSecondsInTicks)
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("DispenserTests", "dispenser_fire", (test) => {
  test.pullLever(new BlockLocation(2, 5, 1));
  const firePositions = [
    new BlockLocation(2, 2, 1),
    new BlockLocation(2, 4, 0),
    new BlockLocation(4, 5, 1),
    new BlockLocation(0, 5, 1),
    new BlockLocation(2, 5, 3),
    new BlockLocation(2, 7, 1),
  ];

  test.succeedWhen(() => {
    for (const pos of firePositions) {
      test.assertBlockPresent(MinecraftBlockTypes.fire, pos, true);
    }
  });
})
  .maxTicks(threeSecondsInTicks)
  .tag(GameTest.Tags.suiteDefault);

// Regression test for crash when dispensing fire MC-210622
GameTest.register("DispenserTests", "dispenser_fire_crash", (test) => {
  test.pullLever(new BlockLocation(0, 2, 0));
  test.succeedOnTick(50);
})
  .maxTicks(threeSecondsInTicks)
  .tag(GameTest.Tags.suiteDefault);

// SIG // Begin signature block
// SIG // MIInxgYJKoZIhvcNAQcCoIIntzCCJ7MCAQExDzANBglg
// SIG // hkgBZQMEAgEFADB3BgorBgEEAYI3AgEEoGkwZzAyBgor
// SIG // BgEEAYI3AgEeMCQCAQEEEBDgyQbOONQRoqMAEEvTUJAC
// SIG // AQACAQACAQACAQACAQAwMTANBglghkgBZQMEAgEFAAQg
// SIG // 4CImtRU/A+xum75p6Z88eL/n//QoA0RU236IHt0rfPmg
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
// SIG // SEXAQsmbdlsKgEhr/Xmfwb1tbWrJUnMTDXpQzTGCGZ0w
// SIG // ghmZAgEBMIGVMH4xCzAJBgNVBAYTAlVTMRMwEQYDVQQI
// SIG // EwpXYXNoaW5ndG9uMRAwDgYDVQQHEwdSZWRtb25kMR4w
// SIG // HAYDVQQKExVNaWNyb3NvZnQgQ29ycG9yYXRpb24xKDAm
// SIG // BgNVBAMTH01pY3Jvc29mdCBDb2RlIFNpZ25pbmcgUENB
// SIG // IDIwMTECEzMAAAJSizOq+JXzOdsAAAAAAlIwDQYJYIZI
// SIG // AWUDBAIBBQCggcAwGQYJKoZIhvcNAQkDMQwGCisGAQQB
// SIG // gjcCAQQwHAYKKwYBBAGCNwIBCzEOMAwGCisGAQQBgjcC
// SIG // ARUwLwYJKoZIhvcNAQkEMSIEIGcROAfkuvOBgdcpx1R7
// SIG // xzlDeT+NYFLI2cVq2heckH0sMFQGCisGAQQBgjcCAQwx
// SIG // RjBEoCSAIgBNAGkAbgBlAGMAcgBhAGYAdAAgAEIAZQBk
// SIG // AHIAbwBjAGuhHIAaaHR0cHM6Ly93d3cubWluZWNyYWZ0
// SIG // Lm5ldC8wDQYJKoZIhvcNAQEBBQAEggEARz5BgRzmoDnN
// SIG // 09/pH89MXw9mS4kLPXZjNeuw8yBsLlGSE7IRXWK0ndkW
// SIG // t/rcdJtzM9pAVhCHWYgc26F0XQEHfJEfNGH4aJhvd06Q
// SIG // yNJp49G+3Vjo3IqoW8bH8SPMgNRhuxtbJ1c3JynfTrzy
// SIG // gMbgXhJBUz5ztRQO+rMaSJ3LvpXmp8g+YZ2BiHq17Ewp
// SIG // GVVqZIv5eLNiXAVgwOWtCMeGkfv9RrtZ6xrpT5PGHbJL
// SIG // 7Vz+WTemR2jJ1EdkHoTFJ7+SGogPeBvQTMB15ZPEulkP
// SIG // Svo+SCwhChpX/zkaT6Mr7PG6FBEoSAkBllhXMe05LI8h
// SIG // LeI/bVgoJnwyt7NDP48NQKGCFxUwghcRBgorBgEEAYI3
// SIG // AwMBMYIXATCCFv0GCSqGSIb3DQEHAqCCFu4wghbqAgED
// SIG // MQ8wDQYJYIZIAWUDBAIBBQAwggFYBgsqhkiG9w0BCRAB
// SIG // BKCCAUcEggFDMIIBPwIBAQYKKwYBBAGEWQoDATAxMA0G
// SIG // CWCGSAFlAwQCAQUABCAwkQJ6DWQ2bULafHAuLOjGnyK1
// SIG // BeaQjrfJieYkKpRC0wIGYrtF9OCzGBIyMDIyMDcwMjAw
// SIG // Mjg1Mi4xMlowBIACAfSggdikgdUwgdIxCzAJBgNVBAYT
// SIG // AlVTMRMwEQYDVQQIEwpXYXNoaW5ndG9uMRAwDgYDVQQH
// SIG // EwdSZWRtb25kMR4wHAYDVQQKExVNaWNyb3NvZnQgQ29y
// SIG // cG9yYXRpb24xLTArBgNVBAsTJE1pY3Jvc29mdCBJcmVs
// SIG // YW5kIE9wZXJhdGlvbnMgTGltaXRlZDEmMCQGA1UECxMd
// SIG // VGhhbGVzIFRTUyBFU046QTI0MC00QjgyLTEzMEUxJTAj
// SIG // BgNVBAMTHE1pY3Jvc29mdCBUaW1lLVN0YW1wIFNlcnZp
// SIG // Y2WgghFlMIIHFDCCBPygAwIBAgITMwAAAY16VS54dJkq
// SIG // twABAAABjTANBgkqhkiG9w0BAQsFADB8MQswCQYDVQQG
// SIG // EwJVUzETMBEGA1UECBMKV2FzaGluZ3RvbjEQMA4GA1UE
// SIG // BxMHUmVkbW9uZDEeMBwGA1UEChMVTWljcm9zb2Z0IENv
// SIG // cnBvcmF0aW9uMSYwJAYDVQQDEx1NaWNyb3NvZnQgVGlt
// SIG // ZS1TdGFtcCBQQ0EgMjAxMDAeFw0yMTEwMjgxOTI3NDVa
// SIG // Fw0yMzAxMjYxOTI3NDVaMIHSMQswCQYDVQQGEwJVUzET
// SIG // MBEGA1UECBMKV2FzaGluZ3RvbjEQMA4GA1UEBxMHUmVk
// SIG // bW9uZDEeMBwGA1UEChMVTWljcm9zb2Z0IENvcnBvcmF0
// SIG // aW9uMS0wKwYDVQQLEyRNaWNyb3NvZnQgSXJlbGFuZCBP
// SIG // cGVyYXRpb25zIExpbWl0ZWQxJjAkBgNVBAsTHVRoYWxl
// SIG // cyBUU1MgRVNOOkEyNDAtNEI4Mi0xMzBFMSUwIwYDVQQD
// SIG // ExxNaWNyb3NvZnQgVGltZS1TdGFtcCBTZXJ2aWNlMIIC
// SIG // IjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKCAgEA2jRI
// SIG // LZg+O6U7dLcuwBPMB+0tJUz0wHLqJ5f7KJXQsTzWToAD
// SIG // UMYV4xVZnp9mPTWojUJ/l3O4XqegLDNduFAObcitrLyY
// SIG // 5HDsxAfUG1/2YilcSkSP6CcMqWfsSwULGX5zlsVKHJ7t
// SIG // vwg26y6eLklUdFMpiq294T4uJQdXd5O7mFy0vVkaGPGx
// SIG // NWLbZxKNzqKtFnWQ7jMtZ05XvafkIWZrNTFv8GGpAlHt
// SIG // RsZ1A8KDo6IDSGVNZZXbQs+fOwMOGp/Bzod8f1YI8Gb2
// SIG // oN/mx2ccvdGr9la55QZeVsM7LfTaEPQxbgAcLgWDlIPc
// SIG // mTzcBksEzLOQsSpBzsqPaWI9ykVw5ofmrkFKMbpQT5EM
// SIG // ki2suJoVM5xGgdZWnt/tz00xubPSKFi4B4IMFUB9mcAN
// SIG // Uq9cHaLsHbDJ+AUsVO0qnVjwzXPYJeR7C/B8X0Ul6UkI
// SIG // dplZmncQZSBK3yZQy+oGsuJKXFAq3BlxT6kDuhYYvO7i
// SIG // tLrPeY0knut1rKkxom+ui6vCdthCfnAiyknyRC2lknqz
// SIG // z8x1mDkQ5Q6Ox9p6/lduFupSJMtgsCPN9fIvrfppMDFI
// SIG // vRoULsHOdLJjrRli8co5M+vZmf20oTxYuXzM0tbRurEJ
// SIG // ycB5ZMbwznsFHymOkgyx8OeFnXV3car45uejI1B1iqUD
// SIG // beSNxnvczuOhcpzwackCAwEAAaOCATYwggEyMB0GA1Ud
// SIG // DgQWBBR4zJFuh59GwpTuSju4STcflihmkzAfBgNVHSME
// SIG // GDAWgBSfpxVdAF5iXYP05dJlpxtTNRnpcjBfBgNVHR8E
// SIG // WDBWMFSgUqBQhk5odHRwOi8vd3d3Lm1pY3Jvc29mdC5j
// SIG // b20vcGtpb3BzL2NybC9NaWNyb3NvZnQlMjBUaW1lLVN0
// SIG // YW1wJTIwUENBJTIwMjAxMCgxKS5jcmwwbAYIKwYBBQUH
// SIG // AQEEYDBeMFwGCCsGAQUFBzAChlBodHRwOi8vd3d3Lm1p
// SIG // Y3Jvc29mdC5jb20vcGtpb3BzL2NlcnRzL01pY3Jvc29m
// SIG // dCUyMFRpbWUtU3RhbXAlMjBQQ0ElMjAyMDEwKDEpLmNy
// SIG // dDAMBgNVHRMBAf8EAjAAMBMGA1UdJQQMMAoGCCsGAQUF
// SIG // BwMIMA0GCSqGSIb3DQEBCwUAA4ICAQA1r3Oz0lEq3Vvp
// SIG // dFlh3YBxc4hnYkALyYPDa9FO4XgqwkBm8Lsb+lK3tbGG
// SIG // gpi6QJbK3iM3BK0ObBcwRaJVCxGLGtr6Jz9hRumRyF8o
// SIG // 4n2y3YiKv4olBxNjFShSGc9E29JmVjBmLgmfjRqPc/2r
// SIG // D25q4ow4uA3rc9ekiaufgGhcSAdek/l+kASbzohOt/5z
// SIG // 2+IlgT4e3auSUzt2GAKfKZB02ZDGWKKeCY3pELj1tuh6
// SIG // yfrOJPPInO4ZZLW3vgKavtL8e6FJZyJoDFMewJ59oEL+
// SIG // AK3e2M2I4IFE9n6LVS8bS9UbMUMvrAlXN5ZM2I8GdHB9
// SIG // TbfI17Wm/9Uf4qu588PJN7vCJj9s+KxZqXc5sGScLgqi
// SIG // PqIbbNTE+/AEZ/eTixc9YLgTyMqakZI59wGqjrONQSY7
// SIG // u0VEDkEE6ikz+FSFRKKzpySb0WTgMvWxsLvbnN8ACmIS
// SIG // PnBHYZoGssPAL7foGGKFLdABTQC2PX19WjrfyrshHdiq
// SIG // SlCspqIGBTxRaHtyPMro3B/26gPfCl3MC3rC3NGq4xGn
// SIG // IHDZGSizUmGg8TkQAloVdU5dJ1v910gjxaxaUraGhP8I
// SIG // ttE0RWnU5XRp/sGaNmDcMwbyHuSpaFsn3Q21OzitP4Bn
// SIG // N5tprHangAC7joe4zmLnmRnAiUc9sRqQ2bmsMAvUpsO8
// SIG // nlOFmiM1LzCCB3EwggVZoAMCAQICEzMAAAAVxedrngKb
// SIG // SZkAAAAAABUwDQYJKoZIhvcNAQELBQAwgYgxCzAJBgNV
// SIG // BAYTAlVTMRMwEQYDVQQIEwpXYXNoaW5ndG9uMRAwDgYD
// SIG // VQQHEwdSZWRtb25kMR4wHAYDVQQKExVNaWNyb3NvZnQg
// SIG // Q29ycG9yYXRpb24xMjAwBgNVBAMTKU1pY3Jvc29mdCBS
// SIG // b290IENlcnRpZmljYXRlIEF1dGhvcml0eSAyMDEwMB4X
// SIG // DTIxMDkzMDE4MjIyNVoXDTMwMDkzMDE4MzIyNVowfDEL
// SIG // MAkGA1UEBhMCVVMxEzARBgNVBAgTCldhc2hpbmd0b24x
// SIG // EDAOBgNVBAcTB1JlZG1vbmQxHjAcBgNVBAoTFU1pY3Jv
// SIG // c29mdCBDb3Jwb3JhdGlvbjEmMCQGA1UEAxMdTWljcm9z
// SIG // b2Z0IFRpbWUtU3RhbXAgUENBIDIwMTAwggIiMA0GCSqG
// SIG // SIb3DQEBAQUAA4ICDwAwggIKAoICAQDk4aZM57RyIQt5
// SIG // osvXJHm9DtWC0/3unAcH0qlsTnXIyjVX9gF/bErg4r25
// SIG // PhdgM/9cT8dm95VTcVrifkpa/rg2Z4VGIwy1jRPPdzLA
// SIG // EBjoYH1qUoNEt6aORmsHFPPFdvWGUNzBRMhxXFExN6AK
// SIG // OG6N7dcP2CZTfDlhAnrEqv1yaa8dq6z2Nr41JmTamDu6
// SIG // GnszrYBbfowQHJ1S/rboYiXcag/PXfT+jlPP1uyFVk3v
// SIG // 3byNpOORj7I5LFGc6XBpDco2LXCOMcg1KL3jtIckw+DJ
// SIG // j361VI/c+gVVmG1oO5pGve2krnopN6zL64NF50ZuyjLV
// SIG // wIYwXE8s4mKyzbnijYjklqwBSru+cakXW2dg3viSkR4d
// SIG // Pf0gz3N9QZpGdc3EXzTdEonW/aUgfX782Z5F37ZyL9t9
// SIG // X4C626p+Nuw2TPYrbqgSUei/BQOj0XOmTTd0lBw0gg/w
// SIG // EPK3Rxjtp+iZfD9M269ewvPV2HM9Q07BMzlMjgK8Qmgu
// SIG // EOqEUUbi0b1qGFphAXPKZ6Je1yh2AuIzGHLXpyDwwvoS
// SIG // CtdjbwzJNmSLW6CmgyFdXzB0kZSU2LlQ+QuJYfM2BjUY
// SIG // hEfb3BvR/bLUHMVr9lxSUV0S2yW6r1AFemzFER1y7435
// SIG // UsSFF5PAPBXbGjfHCBUYP3irRbb1Hode2o+eFnJpxq57
// SIG // t7c+auIurQIDAQABo4IB3TCCAdkwEgYJKwYBBAGCNxUB
// SIG // BAUCAwEAATAjBgkrBgEEAYI3FQIEFgQUKqdS/mTEmr6C
// SIG // kTxGNSnPEP8vBO4wHQYDVR0OBBYEFJ+nFV0AXmJdg/Tl
// SIG // 0mWnG1M1GelyMFwGA1UdIARVMFMwUQYMKwYBBAGCN0yD
// SIG // fQEBMEEwPwYIKwYBBQUHAgEWM2h0dHA6Ly93d3cubWlj
// SIG // cm9zb2Z0LmNvbS9wa2lvcHMvRG9jcy9SZXBvc2l0b3J5
// SIG // Lmh0bTATBgNVHSUEDDAKBggrBgEFBQcDCDAZBgkrBgEE
// SIG // AYI3FAIEDB4KAFMAdQBiAEMAQTALBgNVHQ8EBAMCAYYw
// SIG // DwYDVR0TAQH/BAUwAwEB/zAfBgNVHSMEGDAWgBTV9lbL
// SIG // j+iiXGJo0T2UkFvXzpoYxDBWBgNVHR8ETzBNMEugSaBH
// SIG // hkVodHRwOi8vY3JsLm1pY3Jvc29mdC5jb20vcGtpL2Ny
// SIG // bC9wcm9kdWN0cy9NaWNSb29DZXJBdXRfMjAxMC0wNi0y
// SIG // My5jcmwwWgYIKwYBBQUHAQEETjBMMEoGCCsGAQUFBzAC
// SIG // hj5odHRwOi8vd3d3Lm1pY3Jvc29mdC5jb20vcGtpL2Nl
// SIG // cnRzL01pY1Jvb0NlckF1dF8yMDEwLTA2LTIzLmNydDAN
// SIG // BgkqhkiG9w0BAQsFAAOCAgEAnVV9/Cqt4SwfZwExJFvh
// SIG // nnJL/Klv6lwUtj5OR2R4sQaTlz0xM7U518JxNj/aZGx8
// SIG // 0HU5bbsPMeTCj/ts0aGUGCLu6WZnOlNN3Zi6th542DYu
// SIG // nKmCVgADsAW+iehp4LoJ7nvfam++Kctu2D9IdQHZGN5t
// SIG // ggz1bSNU5HhTdSRXud2f8449xvNo32X2pFaq95W2KFUn
// SIG // 0CS9QKC/GbYSEhFdPSfgQJY4rPf5KYnDvBewVIVCs/wM
// SIG // nosZiefwC2qBwoEZQhlSdYo2wh3DYXMuLGt7bj8sCXgU
// SIG // 6ZGyqVvfSaN0DLzskYDSPeZKPmY7T7uG+jIa2Zb0j/aR
// SIG // AfbOxnT99kxybxCrdTDFNLB62FD+CljdQDzHVG2dY3RI
// SIG // LLFORy3BFARxv2T5JL5zbcqOCb2zAVdJVGTZc9d/HltE
// SIG // AY5aGZFrDZ+kKNxnGSgkujhLmm77IVRrakURR6nxt67I
// SIG // 6IleT53S0Ex2tVdUCbFpAUR+fKFhbHP+CrvsQWY9af3L
// SIG // wUFJfn6Tvsv4O+S3Fb+0zj6lMVGEvL8CwYKiexcdFYmN
// SIG // cP7ntdAoGokLjzbaukz5m/8K6TT4JDVnK+ANuOaMmdbh
// SIG // IurwJ0I9JZTmdHRbatGePu1+oDEzfbzL6Xu/OHBE0ZDx
// SIG // yKs6ijoIYn/ZcGNTTY3ugm2lBRDBcQZqELQdVTNYs6Fw
// SIG // ZvKhggLUMIICPQIBATCCAQChgdikgdUwgdIxCzAJBgNV
// SIG // BAYTAlVTMRMwEQYDVQQIEwpXYXNoaW5ndG9uMRAwDgYD
// SIG // VQQHEwdSZWRtb25kMR4wHAYDVQQKExVNaWNyb3NvZnQg
// SIG // Q29ycG9yYXRpb24xLTArBgNVBAsTJE1pY3Jvc29mdCBJ
// SIG // cmVsYW5kIE9wZXJhdGlvbnMgTGltaXRlZDEmMCQGA1UE
// SIG // CxMdVGhhbGVzIFRTUyBFU046QTI0MC00QjgyLTEzMEUx
// SIG // JTAjBgNVBAMTHE1pY3Jvc29mdCBUaW1lLVN0YW1wIFNl
// SIG // cnZpY2WiIwoBATAHBgUrDgMCGgMVAIBzlZM9TRND4Pgt
// SIG // pLWQZkSPYVcJoIGDMIGApH4wfDELMAkGA1UEBhMCVVMx
// SIG // EzARBgNVBAgTCldhc2hpbmd0b24xEDAOBgNVBAcTB1Jl
// SIG // ZG1vbmQxHjAcBgNVBAoTFU1pY3Jvc29mdCBDb3Jwb3Jh
// SIG // dGlvbjEmMCQGA1UEAxMdTWljcm9zb2Z0IFRpbWUtU3Rh
// SIG // bXAgUENBIDIwMTAwDQYJKoZIhvcNAQEFBQACBQDmabjY
// SIG // MCIYDzIwMjIwNzAyMDIxODAwWhgPMjAyMjA3MDMwMjE4
// SIG // MDBaMHQwOgYKKwYBBAGEWQoEATEsMCowCgIFAOZpuNgC
// SIG // AQAwBwIBAAICB08wBwIBAAICEgQwCgIFAOZrClgCAQAw
// SIG // NgYKKwYBBAGEWQoEAjEoMCYwDAYKKwYBBAGEWQoDAqAK
// SIG // MAgCAQACAwehIKEKMAgCAQACAwGGoDANBgkqhkiG9w0B
// SIG // AQUFAAOBgQAE2MAgvbLy3HzatIG+2kQfd0XQrD5bzybX
// SIG // vPPVrqT33PVt2p33TAsy7Pe41HNcVPPUcnhahcZmOOTr
// SIG // raEYkk4rPTnqfeErM2LYEXRE6oCVCg9lyARRm8hlXHMy
// SIG // UqNMXmV0dk0WzzLLJHCaITSVHs9++i0gcDf50VABwLuM
// SIG // cqbWFTGCBA0wggQJAgEBMIGTMHwxCzAJBgNVBAYTAlVT
// SIG // MRMwEQYDVQQIEwpXYXNoaW5ndG9uMRAwDgYDVQQHEwdS
// SIG // ZWRtb25kMR4wHAYDVQQKExVNaWNyb3NvZnQgQ29ycG9y
// SIG // YXRpb24xJjAkBgNVBAMTHU1pY3Jvc29mdCBUaW1lLVN0
// SIG // YW1wIFBDQSAyMDEwAhMzAAABjXpVLnh0mSq3AAEAAAGN
// SIG // MA0GCWCGSAFlAwQCAQUAoIIBSjAaBgkqhkiG9w0BCQMx
// SIG // DQYLKoZIhvcNAQkQAQQwLwYJKoZIhvcNAQkEMSIEIOZE
// SIG // wgANQvB1MDzM0YmEetuhfAZfMBbxJSSLNrOIynLUMIH6
// SIG // BgsqhkiG9w0BCRACLzGB6jCB5zCB5DCBvQQgnpYRM/od
// SIG // XkDAnzf2udL569W8cfGTgwVuenQ8ttIYzX8wgZgwgYCk
// SIG // fjB8MQswCQYDVQQGEwJVUzETMBEGA1UECBMKV2FzaGlu
// SIG // Z3RvbjEQMA4GA1UEBxMHUmVkbW9uZDEeMBwGA1UEChMV
// SIG // TWljcm9zb2Z0IENvcnBvcmF0aW9uMSYwJAYDVQQDEx1N
// SIG // aWNyb3NvZnQgVGltZS1TdGFtcCBQQ0EgMjAxMAITMwAA
// SIG // AY16VS54dJkqtwABAAABjTAiBCBdjeZUFQN7BPD6+Kgs
// SIG // WTaUZxOI7vh0yiMEtYkEldqpkTANBgkqhkiG9w0BAQsF
// SIG // AASCAgAtdYabjylc2C97/4fi7q+xqwSzNrmWtC1REhR0
// SIG // gkO8MJV3q44j2uddy1ROlJolGIlwHttYBcYDoLymvKXk
// SIG // PU///phCcmP5Y1HYpoBLqIPnuIym6ZU45gpY4K+bW9M1
// SIG // 5gM5MG5B9Z1rkBGUmm1enQ2inD3ainP4HpaCVoc1/7r1
// SIG // dHDYuQ01rzx+oZHLMxGvzxqef7E6CEiM4asAtwc6zHXa
// SIG // RYCNfQcf3R4nrAxn47wLP6M5FNGgrLS/GH24QDRwEtai
// SIG // dnfuIuVWgapA2E+zlVaavU3jZ1LSed/CtSn026OPn1ml
// SIG // 9mwtuYcGnfi31eMUeoEsYvEsSQJazk7yRRdmSheMRy2f
// SIG // HJEsp4DmHD1T2XUb9RPcP114qmPMTJaWEZJoGM3n674i
// SIG // VZIrLeidi2ZuLNJ6DcPCVIbGIiZg0mEJN41A8DoN7Agi
// SIG // 4vMmUHEFbp9boFaIzyu7I05Grbmlz5o9TTIV9HzsO/XF
// SIG // bfWZyb5EvuzCZck4fQ8roAxxBkY5uqVXhF1blF9OyMyn
// SIG // HPuyU1pp8AZ9kinQ0LLKYjSoVadNupAXGkpzqPcXPDOZ
// SIG // ZvH3W2cuMm8ZHDLRUtkl6E1MJdzo2pnsbtOoMRrfn5EJ
// SIG // 9zUQD5R7JhofegoEqVrMXX/anqa48OZzZ2u71dxyHHqt
// SIG // 9cEnZ5Wo+rxcw6sXmpuic7Xn9L2LVg==
// SIG // End signature block
