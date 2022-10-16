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
// SIG // MIInrgYJKoZIhvcNAQcCoIInnzCCJ5sCAQExDzANBglg
// SIG // hkgBZQMEAgEFADB3BgorBgEEAYI3AgEEoGkwZzAyBgor
// SIG // BgEEAYI3AgEeMCQCAQEEEBDgyQbOONQRoqMAEEvTUJAC
// SIG // AQACAQACAQACAQACAQAwMTANBglghkgBZQMEAgEFAAQg
// SIG // 4CImtRU/A+xum75p6Z88eL/n//QoA0RU236IHt0rfPmg
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
// SIG // ARUwLwYJKoZIhvcNAQkEMSIEIGcROAfkuvOBgdcpx1R7
// SIG // xzlDeT+NYFLI2cVq2heckH0sMFQGCisGAQQBgjcCAQwx
// SIG // RjBEoCSAIgBNAGkAbgBlAGMAcgBhAGYAdAAgAEIAZQBk
// SIG // AHIAbwBjAGuhHIAaaHR0cHM6Ly93d3cubWluZWNyYWZ0
// SIG // Lm5ldC8wDQYJKoZIhvcNAQEBBQAEggEAiteTVOuf4DiP
// SIG // dlBLjAtszUDHQOKsgD9LxRa7/enNcKSkVck9u7y0mOzK
// SIG // O2rdKKhAatG72dPckgZ331pF8Sx/dCkycf2U0SirQ/d9
// SIG // 5Bu0rNrsozUov00S+Jiut+JWsCjbEGDrUSwejLw+znhJ
// SIG // BNfSlwCAIN1OLzxqpM8JGfeZeBuLY9YTdjTPTdK8ZQl1
// SIG // /+SnGjoA0uVtjSxw9z+rb4clD2lxdmLTBylSagmsd30S
// SIG // TwXRgavGT4+o++eV1zjE2c6wKrm0ChBxk/cEp/d1goto
// SIG // YOq+iHSrCNX63f3JrXGEhldkH2Ud3dgWzkNBe8vLFwsv
// SIG // k7x4F9LbbysGQ8XpafnEXqGCFv0wghb5BgorBgEEAYI3
// SIG // AwMBMYIW6TCCFuUGCSqGSIb3DQEHAqCCFtYwghbSAgED
// SIG // MQ8wDQYJYIZIAWUDBAIBBQAwggFRBgsqhkiG9w0BCRAB
// SIG // BKCCAUAEggE8MIIBOAIBAQYKKwYBBAGEWQoDATAxMA0G
// SIG // CWCGSAFlAwQCAQUABCBBWS0MrLSDD1Urnu4RPDGYd82E
// SIG // M9KFDH4rann2BxVM+QIGYyNdiZ85GBMyMDIyMDkyODIz
// SIG // NTEyNC40OTVaMASAAgH0oIHQpIHNMIHKMQswCQYDVQQG
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
// SIG // AQkEMSIEIEsJDJNQ4C6RZCFR306kx67nxwMJ0oOMQluu
// SIG // /Wz6NKuZMIH6BgsqhkiG9w0BCRACLzGB6jCB5zCB5DCB
// SIG // vQQgW3vaGxCVejj+BAzFSfMxfHQ+bxxkqCw8LkMY/QZ4
// SIG // pr8wgZgwgYCkfjB8MQswCQYDVQQGEwJVUzETMBEGA1UE
// SIG // CBMKV2FzaGluZ3RvbjEQMA4GA1UEBxMHUmVkbW9uZDEe
// SIG // MBwGA1UEChMVTWljcm9zb2Z0IENvcnBvcmF0aW9uMSYw
// SIG // JAYDVQQDEx1NaWNyb3NvZnQgVGltZS1TdGFtcCBQQ0Eg
// SIG // MjAxMAITMwAAAZcDz1mca4l4PwABAAABlzAiBCBAf9ZZ
// SIG // Lx9sFAbCr6+M/MoM4mKBom2IPNMMSQ5FxRYL9DANBgkq
// SIG // hkiG9w0BAQsFAASCAgAhyCGteapxXojQbmLSgPMzSsnY
// SIG // m7FvLFJ+ke+LlTE0IFZMRskSQNeEZS3UogLHIcRu0T7Z
// SIG // UBNjlS91L7ueuVX73ois0F9vAGY2EhZFWrzTX6+YS+3o
// SIG // UWMaoqdzfjZavllrEljLr+bjF5jYNujifKwCtWjj9R+7
// SIG // WDe1Abq58gBFRhDUExBcQe2YU9Tp+nb9Bi4H6KD4mU65
// SIG // ctTcNYQNY/2pH4s2UbjzScgxoGvxUxLdUzfU6xW1ktOH
// SIG // U5kpHMb+H9u0v+3oWDvNXzRfsxL2HdLzZW18nI+L++Lp
// SIG // nOokxBONX00yEaH24VavqVVfc7vA1ZGUu0dHDPK2/YnI
// SIG // B752/9WbqiZu/7yWqyVpOj+wRrHtPLEADHQAsA4U0ado
// SIG // QIEVN42NoesN4soZp2Ob9ZNAVqoWCxraXMPHmong0+IK
// SIG // PyVLZeu7S6AyfEkgk4/M6DjDN8o/kB6+8Q56YiCMf/qV
// SIG // 0MLlSPxUNmT8W0SBkZ83mp71jnfplkjXU+qVXW9YBXR0
// SIG // tKbXhzbqDQygakqnv9URkX1Y2lnnsXr1WHfRY8HpJQXp
// SIG // 6GpH64BC/CAUi3jDpDiro1txvb0E0ajzIOKRzvr4CmPH
// SIG // X3faHi11z8Y6g5lsFgVb+QN2/Jjwu3v3J5h0HP0rvUwb
// SIG // O+e/djXlme0unBC1jJ+RccMYcQFEEPuUPsWKQHFTnA==
// SIG // End signature block
