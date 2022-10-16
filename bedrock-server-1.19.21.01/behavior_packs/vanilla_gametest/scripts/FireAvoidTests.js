import * as GameTest from "mojang-gametest";
import { BlockLocation } from "mojang-minecraft";

const TicksPerSecond = 20;
const runWalkTestTicks = 5 * TicksPerSecond;

function runWalkTest(test, args) {
  const spawnPosition = args["spawnPosition"];
  const targetPosition = args["targetPosition"];
  const CanTakeDamage = args["CanTakeDamage"];
  const shouldReachTarget = args["shouldReachTarget"];

  const entityType = "minecraft:villager_v2";
  const villagerEntitySpawnType = "minecraft:villager_v2<minecraft:spawn_farmer>"; // Attempt to spawn the villagers as farmers

  let villager = test.spawnWithoutBehaviors(villagerEntitySpawnType, spawnPosition);
  test.walkTo(villager, targetPosition, 1);

  const startingHealth = villager.getComponent("minecraft:health").current;

  test.runAfterDelay(runWalkTestTicks - 1, () => {
    if (shouldReachTarget) {
      test.assertEntityPresent(entityType, targetPosition, true);
    } else {
      test.assertEntityPresent(entityType, targetPosition, false);
    }

    if (!CanTakeDamage && villager.getComponent("minecraft:health").current < startingHealth) {
      test.fail("The villager has taken damage");
    }

    test.succeed();
  });
}

GameTest.register("FireAvoidTests", "can_walk_around_lava", (test) => {
  runWalkTest(test, {
    spawnPosition: new BlockLocation(2, 3, 4),
    targetPosition: new BlockLocation(2, 3, 1),
    CanTakeDamage: false,
    shouldReachTarget: true,
  });
})
  .maxTicks(runWalkTestTicks)
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("FireAvoidTests", "dont_cut_corner_over_fire", (test) => {
  runWalkTest(test, {
    spawnPosition: new BlockLocation(1, 2, 1),
    targetPosition: new BlockLocation(2, 2, 2),
    CanTakeDamage: false,
    shouldReachTarget: true,
  });
})
  .maxTicks(runWalkTestTicks)
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("FireAvoidTests", "dont_cut_corner_over_fire_far", (test) => {
  runWalkTest(test, {
    spawnPosition: new BlockLocation(1, 2, 1),
    targetPosition: new BlockLocation(5, 2, 1),
    CanTakeDamage: false,
    shouldReachTarget: true,
  });
})
  .maxTicks(runWalkTestTicks)
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("FireAvoidTests", "dont_walk_into_magma", (test) => {
  runWalkTest(test, {
    spawnPosition: new BlockLocation(1, 2, 1),
    targetPosition: new BlockLocation(3, 2, 1),
    CanTakeDamage: false,
    shouldReachTarget: false,
  });
})
  .maxTicks(runWalkTestTicks)
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("FireAvoidTests", "dont_walk_into_magma_diagonal", (test) => {
  runWalkTest(test, {
    spawnPosition: new BlockLocation(1, 2, 1),
    targetPosition: new BlockLocation(2, 2, 2),
    CanTakeDamage: false,
    shouldReachTarget: false,
  });
})
  .maxTicks(runWalkTestTicks)
  .tag("suite:java_parity") // Java villagers don't cross diagonal magma blocks
  .tag(GameTest.Tags.suiteDisabled);

GameTest.register("FireAvoidTests", "fire_maze", (test) => {
  runWalkTest(test, {
    spawnPosition: new BlockLocation(1, 2, 1),
    targetPosition: new BlockLocation(8, 2, 4),
    CanTakeDamage: false,
    shouldReachTarget: true,
  });
})
  .maxTicks(runWalkTestTicks)
  .tag(GameTest.Tags.suiteDisabled); // villager gets caught on fire

GameTest.register("FireAvoidTests", "fire_maze_3d", (test) => {
  runWalkTest(test, {
    spawnPosition: new BlockLocation(1, 3, 1),
    targetPosition: new BlockLocation(7, 2, 11),
    CanTakeDamage: false,
    shouldReachTarget: true,
  });
})
  .maxTicks(TicksPerSecond * 10)
  .tag(GameTest.Tags.suiteDisabled); // villager gets caught on fire

GameTest.register("FireAvoidTests", "golem_chase_zombie_over_fire", (test) => {
  const zombieLocation = new BlockLocation(7, 2, 1);
  const zombieType = "minecraft:zombie";
  test.spawnWithoutBehaviors(zombieType, zombieLocation);

  test.spawn("minecraft:iron_golem", new BlockLocation(1, 2, 2));

  // change the success condition because it would happen during the wandering behavior
  // The golem was not actually chasing the zombie
  test.succeedWhenEntityPresent(zombieType, zombieLocation, false);
})
  .maxTicks(TicksPerSecond * 10)
  .batch("night")
  .padding(10) // golem sends the zombie flying far so I added padding
  .tag("suite:java_parity") // golem does not run over the fire
  .tag(GameTest.Tags.suiteDisabled);

GameTest.register("FireAvoidTests", "villager_dont_flee_over_fire", (test) => {
  test.spawnWithoutBehaviors("minecraft:zombie", new BlockLocation(5, 2, 1));
  const villager = test.spawn("minecraft:villager_v2", new BlockLocation(4, 2, 1));

  const startingHealth = villager.getComponent("minecraft:health").current;

  test.runAfterDelay(runWalkTestTicks - 1, () => {
    if (villager.getComponent("minecraft:health").current < startingHealth) {
      test.fail("The villager has taken damage");
    }

    test.succeed();
  });
})
  .maxTicks(TicksPerSecond * 5)
  .batch("night")
  .tag("suite:java_parity") // villager runs into the fire, but in Java does not
  .tag(GameTest.Tags.suiteDisabled);

GameTest.register("FireAvoidTests", "walk_far_out_of_magma", (test) => {
  runWalkTest(test, {
    spawnPosition: new BlockLocation(1, 2, 1),
    targetPosition: new BlockLocation(4, 2, 1),
    CanTakeDamage: true,
    shouldReachTarget: true,
  });
})
  .maxTicks(runWalkTestTicks)
  .tag("suite:java_parity") // villager gets stuck in the magma
  .tag(GameTest.Tags.suiteDisabled);

GameTest.register("FireAvoidTests", "walk_far_out_of_magma_diagonal", (test) => {
  runWalkTest(test, {
    spawnPosition: new BlockLocation(1, 2, 1),
    targetPosition: new BlockLocation(3, 2, 3),
    CanTakeDamage: true,
    shouldReachTarget: true,
  });
})
  .maxTicks(runWalkTestTicks)
  .tag("suite:java_parity") // villager gets stuck in the magma
  .tag(GameTest.Tags.suiteDisabled);

GameTest.register("FireAvoidTests", "walk_out_of_magma", (test) => {
  runWalkTest(test, {
    spawnPosition: new BlockLocation(1, 2, 1),
    targetPosition: new BlockLocation(3, 2, 1),
    CanTakeDamage: true,
    shouldReachTarget: true,
  });
})
  .maxTicks(runWalkTestTicks)
  .tag("suite:java_parity") // villager gets stuck in the magma
  .tag(GameTest.Tags.suiteDisabled);

GameTest.register("FireAvoidTests", "walk_out_of_magma_diagonal", (test) => {
  runWalkTest(test, {
    spawnPosition: new BlockLocation(1, 2, 1),
    targetPosition: new BlockLocation(2, 2, 2),
    CanTakeDamage: true,
    shouldReachTarget: true,
  });
})
  .maxTicks(runWalkTestTicks)
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("FireAvoidTests", "zombie_chase_villager_over_fire", (test) => {
  test.spawnWithoutBehaviors("minecraft:villager_v2", new BlockLocation(5, 2, 1));
  const zombie = test.spawn("minecraft:zombie", new BlockLocation(1, 2, 1));

  test.succeedWhenEntityPresent("minecraft:zombie", new BlockLocation(4, 2, 1), true);
})
  .maxTicks(TicksPerSecond * 10)
  .batch("night")
  .tag(GameTest.Tags.suiteDefault);

// SIG // Begin signature block
// SIG // MIInrgYJKoZIhvcNAQcCoIInnzCCJ5sCAQExDzANBglg
// SIG // hkgBZQMEAgEFADB3BgorBgEEAYI3AgEEoGkwZzAyBgor
// SIG // BgEEAYI3AgEeMCQCAQEEEBDgyQbOONQRoqMAEEvTUJAC
// SIG // AQACAQACAQACAQACAQAwMTANBglghkgBZQMEAgEFAAQg
// SIG // /bKR1FM6si82qIZ0Lzo2sJVhLmrOPiyIcRp81trGQl6g
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
// SIG // ARUwLwYJKoZIhvcNAQkEMSIEIFHlqLW3CBY2zkgEZoiu
// SIG // aML6X2GIKMvIp+W3V8tCotR5MFQGCisGAQQBgjcCAQwx
// SIG // RjBEoCSAIgBNAGkAbgBlAGMAcgBhAGYAdAAgAEIAZQBk
// SIG // AHIAbwBjAGuhHIAaaHR0cHM6Ly93d3cubWluZWNyYWZ0
// SIG // Lm5ldC8wDQYJKoZIhvcNAQEBBQAEggEAKEs3dd2z0xzI
// SIG // ekO7Q5LaIVBJiUTphPHL8giG82/trE1FgYW7lZIYUm2K
// SIG // 6aPWQ52YBUQbCV4oteGU12Z6WIE51cQ7A8HwhPHQudGM
// SIG // Uy6uwdJmUDkliPupzyVBWz5lJLk/ME0yZ809cjLoA0WK
// SIG // m2vQKdKc47S6KFqMQIsu10bM2XsP7A95tEduPwIXdTDs
// SIG // wOa65ttgwYMwgNQq/jx2j55pExnAzjqCcwXTB90j8QIX
// SIG // DQNisFDFA+jXEjV6YvxdvNStPN5TCubt/scSU3I99cl/
// SIG // h2ufVbQgT2hhOf4m7tcliiEBHpAo+eWjrO8UBk768PFq
// SIG // Zn4pUrm3L14hqaEh6/KjDaGCFv0wghb5BgorBgEEAYI3
// SIG // AwMBMYIW6TCCFuUGCSqGSIb3DQEHAqCCFtYwghbSAgED
// SIG // MQ8wDQYJYIZIAWUDBAIBBQAwggFRBgsqhkiG9w0BCRAB
// SIG // BKCCAUAEggE8MIIBOAIBAQYKKwYBBAGEWQoDATAxMA0G
// SIG // CWCGSAFlAwQCAQUABCCds4AwRBVh43yv2aoWCsy4yalk
// SIG // yWMpr0Bw0XM36bSyawIGYyM2aL+VGBMyMDIyMDkyODIz
// SIG // NTEyNC45NDVaMASAAgH0oIHQpIHNMIHKMQswCQYDVQQG
// SIG // EwJVUzETMBEGA1UECBMKV2FzaGluZ3RvbjEQMA4GA1UE
// SIG // BxMHUmVkbW9uZDEeMBwGA1UEChMVTWljcm9zb2Z0IENv
// SIG // cnBvcmF0aW9uMSUwIwYDVQQLExxNaWNyb3NvZnQgQW1l
// SIG // cmljYSBPcGVyYXRpb25zMSYwJAYDVQQLEx1UaGFsZXMg
// SIG // VFNTIEVTTjoxMkJDLUUzQUUtNzRFQjElMCMGA1UEAxMc
// SIG // TWljcm9zb2Z0IFRpbWUtU3RhbXAgU2VydmljZaCCEVQw
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
// SIG // gm2lBRDBcQZqELQdVTNYs6FwZvKhggLLMIICNAIBATCB
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
// SIG // BQACBQDm3tfJMCIYDzIwMjIwOTI4MjIyNTEzWhgPMjAy
// SIG // MjA5MjkyMjI1MTNaMHQwOgYKKwYBBAGEWQoEATEsMCow
// SIG // CgIFAObe18kCAQAwBwIBAAICC5YwBwIBAAICEacwCgIF
// SIG // AObgKUkCAQAwNgYKKwYBBAGEWQoEAjEoMCYwDAYKKwYB
// SIG // BAGEWQoDAqAKMAgCAQACAwehIKEKMAgCAQACAwGGoDAN
// SIG // BgkqhkiG9w0BAQUFAAOBgQCSCzEAbEC1sh81tcGNngnp
// SIG // UdR1+7F3sAfiNoS5/v3/71pMrBSfIZcrVXLlZYGwRhmU
// SIG // t229Rg+DABD0Ex5AUw7YFyebFAyGZOAaIvBBp/OKctRw
// SIG // uC4N19peod9fn5EzAjvBI287MvgaXF5Myo1IFFm5cAaW
// SIG // zKsRAR/QU7AWqVzTgjGCBA0wggQJAgEBMIGTMHwxCzAJ
// SIG // BgNVBAYTAlVTMRMwEQYDVQQIEwpXYXNoaW5ndG9uMRAw
// SIG // DgYDVQQHEwdSZWRtb25kMR4wHAYDVQQKExVNaWNyb3Nv
// SIG // ZnQgQ29ycG9yYXRpb24xJjAkBgNVBAMTHU1pY3Jvc29m
// SIG // dCBUaW1lLVN0YW1wIFBDQSAyMDEwAhMzAAABoQGFVZm5
// SIG // VF2KAAEAAAGhMA0GCWCGSAFlAwQCAQUAoIIBSjAaBgkq
// SIG // hkiG9w0BCQMxDQYLKoZIhvcNAQkQAQQwLwYJKoZIhvcN
// SIG // AQkEMSIEIMF2KWRqERbsM8fPZwxV72mO7CaohGuGUrrY
// SIG // qrr8yiZMMIH6BgsqhkiG9w0BCRACLzGB6jCB5zCB5DCB
// SIG // vQQg6whU8TqBgmgggo6EcgXtSUkKzCXggk8hK84oid+O
// SIG // 0IQwgZgwgYCkfjB8MQswCQYDVQQGEwJVUzETMBEGA1UE
// SIG // CBMKV2FzaGluZ3RvbjEQMA4GA1UEBxMHUmVkbW9uZDEe
// SIG // MBwGA1UEChMVTWljcm9zb2Z0IENvcnBvcmF0aW9uMSYw
// SIG // JAYDVQQDEx1NaWNyb3NvZnQgVGltZS1TdGFtcCBQQ0Eg
// SIG // MjAxMAITMwAAAaEBhVWZuVRdigABAAABoTAiBCCFwJoM
// SIG // jZg3FSV5rE2QpoK2Yu9qJGoAshuxe2pyhDzzMTANBgkq
// SIG // hkiG9w0BAQsFAASCAgDOVfiL2znZjRBzBxRRfMekrdEb
// SIG // UvPDJsWD/9PKOWFBv/KdR0zs/b101a/NmjrV5pmQ2iqE
// SIG // FYZBVKrf6O+PsSCeeyvu4MizZzYoCqgFS/0h8r7JiE9c
// SIG // CtAgxaOQacA5HPqYB/Pk5foB3Q+RbzQq+ZoM5thnbzFm
// SIG // MPZoO8Zci85JQnMr8mrF/7h8JouiKdbTuiaP4yQMlWgI
// SIG // htTKJsvgi0PgkgfXoaVxVxRdeVlE8LfaY6LmsGljrgT7
// SIG // YcJmP5Zm0HigV+IIhJYbyfB2hyEiLJTJWC4hx5QDtuJG
// SIG // Ensdpe/YsAmImlsFgmA5DpICqhniKW1vus2CIT2brvk6
// SIG // j0Ko3uzf/nwbwdUcB4QR6OlTdBLrXDk9PYo7mLRXNUiz
// SIG // uNdHAiL19fyoomS6yPGzAZbJLFmOaabnzntjf0VxGmGQ
// SIG // PJMH316WVocf1lQ7bv5HbfNBssYzW9sbVohoviP9pfsI
// SIG // XvMnYcXH7D9zaVNXObgY0DEibjmb2JACX78E13WIy3hY
// SIG // ocZrbw8JSNiuzZVs8j7raAgdRm7Rkzi2OBfWmMbj0KHZ
// SIG // oYaYvO9NPZYUd5LN5zgbegzM5j++UXcLDMEaLFAcyjvC
// SIG // 43XiMaapLjA4CbNW5OUJywQ5RGR0vO6xy8rWMOgLvTjD
// SIG // I+SvKatybd//Q4+nTO02umni2ExKQngTA9iW9B9ogA==
// SIG // End signature block
