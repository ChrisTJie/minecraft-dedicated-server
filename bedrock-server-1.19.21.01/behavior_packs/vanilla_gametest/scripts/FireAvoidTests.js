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
// SIG // MIInvAYJKoZIhvcNAQcCoIInrTCCJ6kCAQExDzANBglg
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
// SIG // SEXAQsmbdlsKgEhr/Xmfwb1tbWrJUnMTDXpQzTGCGZMw
// SIG // ghmPAgEBMIGVMH4xCzAJBgNVBAYTAlVTMRMwEQYDVQQI
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
// SIG // Zn4pUrm3L14hqaEh6/KjDaGCFwswghcHBgorBgEEAYI3
// SIG // AwMBMYIW9zCCFvMGCSqGSIb3DQEHAqCCFuQwghbgAgED
// SIG // MQ8wDQYJYIZIAWUDBAIBBQAwggFUBgsqhkiG9w0BCRAB
// SIG // BKCCAUMEggE/MIIBOwIBAQYKKwYBBAGEWQoDATAxMA0G
// SIG // CWCGSAFlAwQCAQUABCCds4AwRBVh43yv2aoWCsy4yalk
// SIG // yWMpr0Bw0XM36bSyawIGYvuLrxGhGBIyMDIyMDgxODAw
// SIG // MTkzMy4xM1owBIACAfSggdSkgdEwgc4xCzAJBgNVBAYT
// SIG // AlVTMRMwEQYDVQQIEwpXYXNoaW5ndG9uMRAwDgYDVQQH
// SIG // EwdSZWRtb25kMR4wHAYDVQQKExVNaWNyb3NvZnQgQ29y
// SIG // cG9yYXRpb24xKTAnBgNVBAsTIE1pY3Jvc29mdCBPcGVy
// SIG // YXRpb25zIFB1ZXJ0byBSaWNvMSYwJAYDVQQLEx1UaGFs
// SIG // ZXMgVFNTIEVTTjowQTU2LUUzMjktNEQ0RDElMCMGA1UE
// SIG // AxMcTWljcm9zb2Z0IFRpbWUtU3RhbXAgU2VydmljZaCC
// SIG // EV8wggcQMIIE+KADAgECAhMzAAABpzW7LsJkhVApAAEA
// SIG // AAGnMA0GCSqGSIb3DQEBCwUAMHwxCzAJBgNVBAYTAlVT
// SIG // MRMwEQYDVQQIEwpXYXNoaW5ndG9uMRAwDgYDVQQHEwdS
// SIG // ZWRtb25kMR4wHAYDVQQKExVNaWNyb3NvZnQgQ29ycG9y
// SIG // YXRpb24xJjAkBgNVBAMTHU1pY3Jvc29mdCBUaW1lLVN0
// SIG // YW1wIFBDQSAyMDEwMB4XDTIyMDMwMjE4NTEyMloXDTIz
// SIG // MDUxMTE4NTEyMlowgc4xCzAJBgNVBAYTAlVTMRMwEQYD
// SIG // VQQIEwpXYXNoaW5ndG9uMRAwDgYDVQQHEwdSZWRtb25k
// SIG // MR4wHAYDVQQKExVNaWNyb3NvZnQgQ29ycG9yYXRpb24x
// SIG // KTAnBgNVBAsTIE1pY3Jvc29mdCBPcGVyYXRpb25zIFB1
// SIG // ZXJ0byBSaWNvMSYwJAYDVQQLEx1UaGFsZXMgVFNTIEVT
// SIG // TjowQTU2LUUzMjktNEQ0RDElMCMGA1UEAxMcTWljcm9z
// SIG // b2Z0IFRpbWUtU3RhbXAgU2VydmljZTCCAiIwDQYJKoZI
// SIG // hvcNAQEBBQADggIPADCCAgoCggIBAO0jOMYdUAXecCWm
// SIG // 5V6TRoQZ4hsPLe0Vp6CwxFiTA5l867fAbDyxnKzdfBsf
// SIG // /0XJVXzIkcvzCESXoklvMDBDa97SEv+CuLEIooMbFBH1
// SIG // WeYgmLVO9TbbLStJilNITmQQQ4FB5qzMEsDfpmaZZMWW
// SIG // gdOjoSQed9UrjjmcuWsSskntiaUD/VQdQcLMnpeUGc7C
// SIG // QsAYo9HcIMb1H8DTcZ7yAe3aOYf766P2OT553/4hdnJ9
// SIG // Kbp/FfDeUAVYuEc1wZlmbPdRa/uCx4iKXpt80/5woAGS
// SIG // Dl8vSNFxi4umXKCkwWHm8GeDZ3tOKzMIcIY/64Ftpdqp
// SIG // NwbqGa3GkJToEFPR6D6XJ0WyqebZvOZjMQEeLCJIrSnF
// SIG // 4LbkkfkX4D4scjKz92lI9LRurhMPTBEQ6pw3iGsEPY+J
// SIG // rcx/DJmyQWqbpN3FskWu9xhgzYoYsRuisCb5FIMShial
// SIG // lzEzum5xLE4U5fuxEbwk0uY9ZVDNVfEhgiQedcSAd3GW
// SIG // vVM36gtYy6QJfixD7ltwjSm5sVa1voBf2WZgCC3r4RE7
// SIG // VnovlqbCd3nHyXv5+8UGTLq7qRdRQQaBQXekT9UjUubc
// SIG // NS8ZYeZwK8d2etD98mSI4MqXcMySRKUJ9OZVQNWzI3Ly
// SIG // S5+CjIssBHdv19aM6CjXQuZkkmlZOtMqkLRg1tmhgI61
// SIG // yFC+jxB3AgMBAAGjggE2MIIBMjAdBgNVHQ4EFgQUH2y4
// SIG // fwWYLjCFb+EOQgPz9PpaRYMwHwYDVR0jBBgwFoAUn6cV
// SIG // XQBeYl2D9OXSZacbUzUZ6XIwXwYDVR0fBFgwVjBUoFKg
// SIG // UIZOaHR0cDovL3d3dy5taWNyb3NvZnQuY29tL3BraW9w
// SIG // cy9jcmwvTWljcm9zb2Z0JTIwVGltZS1TdGFtcCUyMFBD
// SIG // QSUyMDIwMTAoMSkuY3JsMGwGCCsGAQUFBwEBBGAwXjBc
// SIG // BggrBgEFBQcwAoZQaHR0cDovL3d3dy5taWNyb3NvZnQu
// SIG // Y29tL3BraW9wcy9jZXJ0cy9NaWNyb3NvZnQlMjBUaW1l
// SIG // LVN0YW1wJTIwUENBJTIwMjAxMCgxKS5jcnQwDAYDVR0T
// SIG // AQH/BAIwADATBgNVHSUEDDAKBggrBgEFBQcDCDANBgkq
// SIG // hkiG9w0BAQsFAAOCAgEATxL6MfPZOhR91DHShlzal7B8
// SIG // vOCUvzlvbVha0UzhZfvIcZA/bT3XTXbQPLnIDWlRdjQX
// SIG // 7PGkORhX/mpjZCC5J7fD3TJMn9ZQQ8MXnJ0sx3/QJIlN
// SIG // gPVaOpk9Yk1YEqyItOyPHr3Om3v/q9h5f5qDk0IMV2ta
// SIG // osze0JGlM3M5z7bGkDly+TfhH9lI03D/FzLjjzW8Etvc
// SIG // qmmH68QHdTsl84NWGkd2dUlVF2aBWMUprb8H9EhPUQcB
// SIG // cpf11IAj+f04yB3ncQLh+P+PSS2kxNLLeRg9CWbmsugp
// SIG // lYP1D5wW+aH2mdyBlPXZMIaERJFvZUZyD8RfJ8AsE3uU
// SIG // 3JSd408QBDaXDUf94Ki3wEXTtl8JQItGc3ixRYWNIghr
// SIG // aI4h3d/+266OB6d0UM2iBXSqwz8tdj+xSST6G7ZYqxat
// SIG // Ezt806T1BBHe9tZ/mr2S52UjJgAVQBgCQiiiixNO27g5
// SIG // Qy4CDS94vT4nfC2lXwLlhrAcNqnAJKmRqK8ehI50TTIZ
// SIG // GONhdhGcM5xUVeHmeRy9G6ufU6B6Ob0rW6LXY2qTLXvg
// SIG // t9/x/XEh1CrnuWeBWa9E307AbePaBopu8+WnXjXy6N01
// SIG // j/AVBq1TyKnQX1nSMjU9gZ3EaG8oS/zNM59HK/IhnAzW
// SIG // eVcdBYrq/hsu9JMvBpF+ZEQY2ZWpbEJm7ELl/CuRIPAw
// SIG // ggdxMIIFWaADAgECAhMzAAAAFcXna54Cm0mZAAAAAAAV
// SIG // MA0GCSqGSIb3DQEBCwUAMIGIMQswCQYDVQQGEwJVUzET
// SIG // MBEGA1UECBMKV2FzaGluZ3RvbjEQMA4GA1UEBxMHUmVk
// SIG // bW9uZDEeMBwGA1UEChMVTWljcm9zb2Z0IENvcnBvcmF0
// SIG // aW9uMTIwMAYDVQQDEylNaWNyb3NvZnQgUm9vdCBDZXJ0
// SIG // aWZpY2F0ZSBBdXRob3JpdHkgMjAxMDAeFw0yMTA5MzAx
// SIG // ODIyMjVaFw0zMDA5MzAxODMyMjVaMHwxCzAJBgNVBAYT
// SIG // AlVTMRMwEQYDVQQIEwpXYXNoaW5ndG9uMRAwDgYDVQQH
// SIG // EwdSZWRtb25kMR4wHAYDVQQKExVNaWNyb3NvZnQgQ29y
// SIG // cG9yYXRpb24xJjAkBgNVBAMTHU1pY3Jvc29mdCBUaW1l
// SIG // LVN0YW1wIFBDQSAyMDEwMIICIjANBgkqhkiG9w0BAQEF
// SIG // AAOCAg8AMIICCgKCAgEA5OGmTOe0ciELeaLL1yR5vQ7V
// SIG // gtP97pwHB9KpbE51yMo1V/YBf2xK4OK9uT4XYDP/XE/H
// SIG // ZveVU3Fa4n5KWv64NmeFRiMMtY0Tz3cywBAY6GB9alKD
// SIG // RLemjkZrBxTzxXb1hlDcwUTIcVxRMTegCjhuje3XD9gm
// SIG // U3w5YQJ6xKr9cmmvHaus9ja+NSZk2pg7uhp7M62AW36M
// SIG // EBydUv626GIl3GoPz130/o5Tz9bshVZN7928jaTjkY+y
// SIG // OSxRnOlwaQ3KNi1wjjHINSi947SHJMPgyY9+tVSP3PoF
// SIG // VZhtaDuaRr3tpK56KTesy+uDRedGbsoy1cCGMFxPLOJi
// SIG // ss254o2I5JasAUq7vnGpF1tnYN74kpEeHT39IM9zfUGa
// SIG // RnXNxF803RKJ1v2lIH1+/NmeRd+2ci/bfV+Autuqfjbs
// SIG // Nkz2K26oElHovwUDo9Fzpk03dJQcNIIP8BDyt0cY7afo
// SIG // mXw/TNuvXsLz1dhzPUNOwTM5TI4CvEJoLhDqhFFG4tG9
// SIG // ahhaYQFzymeiXtcodgLiMxhy16cg8ML6EgrXY28MyTZk
// SIG // i1ugpoMhXV8wdJGUlNi5UPkLiWHzNgY1GIRH29wb0f2y
// SIG // 1BzFa/ZcUlFdEtsluq9QBXpsxREdcu+N+VLEhReTwDwV
// SIG // 2xo3xwgVGD94q0W29R6HXtqPnhZyacaue7e3PmriLq0C
// SIG // AwEAAaOCAd0wggHZMBIGCSsGAQQBgjcVAQQFAgMBAAEw
// SIG // IwYJKwYBBAGCNxUCBBYEFCqnUv5kxJq+gpE8RjUpzxD/
// SIG // LwTuMB0GA1UdDgQWBBSfpxVdAF5iXYP05dJlpxtTNRnp
// SIG // cjBcBgNVHSAEVTBTMFEGDCsGAQQBgjdMg30BATBBMD8G
// SIG // CCsGAQUFBwIBFjNodHRwOi8vd3d3Lm1pY3Jvc29mdC5j
// SIG // b20vcGtpb3BzL0RvY3MvUmVwb3NpdG9yeS5odG0wEwYD
// SIG // VR0lBAwwCgYIKwYBBQUHAwgwGQYJKwYBBAGCNxQCBAwe
// SIG // CgBTAHUAYgBDAEEwCwYDVR0PBAQDAgGGMA8GA1UdEwEB
// SIG // /wQFMAMBAf8wHwYDVR0jBBgwFoAU1fZWy4/oolxiaNE9
// SIG // lJBb186aGMQwVgYDVR0fBE8wTTBLoEmgR4ZFaHR0cDov
// SIG // L2NybC5taWNyb3NvZnQuY29tL3BraS9jcmwvcHJvZHVj
// SIG // dHMvTWljUm9vQ2VyQXV0XzIwMTAtMDYtMjMuY3JsMFoG
// SIG // CCsGAQUFBwEBBE4wTDBKBggrBgEFBQcwAoY+aHR0cDov
// SIG // L3d3dy5taWNyb3NvZnQuY29tL3BraS9jZXJ0cy9NaWNS
// SIG // b29DZXJBdXRfMjAxMC0wNi0yMy5jcnQwDQYJKoZIhvcN
// SIG // AQELBQADggIBAJ1VffwqreEsH2cBMSRb4Z5yS/ypb+pc
// SIG // FLY+TkdkeLEGk5c9MTO1OdfCcTY/2mRsfNB1OW27DzHk
// SIG // wo/7bNGhlBgi7ulmZzpTTd2YurYeeNg2LpypglYAA7AF
// SIG // vonoaeC6Ce5732pvvinLbtg/SHUB2RjebYIM9W0jVOR4
// SIG // U3UkV7ndn/OOPcbzaN9l9qRWqveVtihVJ9AkvUCgvxm2
// SIG // EhIRXT0n4ECWOKz3+SmJw7wXsFSFQrP8DJ6LGYnn8Atq
// SIG // gcKBGUIZUnWKNsIdw2FzLixre24/LAl4FOmRsqlb30mj
// SIG // dAy87JGA0j3mSj5mO0+7hvoyGtmW9I/2kQH2zsZ0/fZM
// SIG // cm8Qq3UwxTSwethQ/gpY3UA8x1RtnWN0SCyxTkctwRQE
// SIG // cb9k+SS+c23Kjgm9swFXSVRk2XPXfx5bRAGOWhmRaw2f
// SIG // pCjcZxkoJLo4S5pu+yFUa2pFEUep8beuyOiJXk+d0tBM
// SIG // drVXVAmxaQFEfnyhYWxz/gq77EFmPWn9y8FBSX5+k77L
// SIG // +DvktxW/tM4+pTFRhLy/AsGConsXHRWJjXD+57XQKBqJ
// SIG // C4822rpM+Zv/Cuk0+CQ1ZyvgDbjmjJnW4SLq8CdCPSWU
// SIG // 5nR0W2rRnj7tfqAxM328y+l7vzhwRNGQ8cirOoo6CGJ/
// SIG // 2XBjU02N7oJtpQUQwXEGahC0HVUzWLOhcGbyoYIC0jCC
// SIG // AjsCAQEwgfyhgdSkgdEwgc4xCzAJBgNVBAYTAlVTMRMw
// SIG // EQYDVQQIEwpXYXNoaW5ndG9uMRAwDgYDVQQHEwdSZWRt
// SIG // b25kMR4wHAYDVQQKExVNaWNyb3NvZnQgQ29ycG9yYXRp
// SIG // b24xKTAnBgNVBAsTIE1pY3Jvc29mdCBPcGVyYXRpb25z
// SIG // IFB1ZXJ0byBSaWNvMSYwJAYDVQQLEx1UaGFsZXMgVFNT
// SIG // IEVTTjowQTU2LUUzMjktNEQ0RDElMCMGA1UEAxMcTWlj
// SIG // cm9zb2Z0IFRpbWUtU3RhbXAgU2VydmljZaIjCgEBMAcG
// SIG // BSsOAwIaAxUAwH7vHimSAzeDLN0qzWNb2p2vRH+ggYMw
// SIG // gYCkfjB8MQswCQYDVQQGEwJVUzETMBEGA1UECBMKV2Fz
// SIG // aGluZ3RvbjEQMA4GA1UEBxMHUmVkbW9uZDEeMBwGA1UE
// SIG // ChMVTWljcm9zb2Z0IENvcnBvcmF0aW9uMSYwJAYDVQQD
// SIG // Ex1NaWNyb3NvZnQgVGltZS1TdGFtcCBQQ0EgMjAxMDAN
// SIG // BgkqhkiG9w0BAQUFAAIFAOanW6QwIhgPMjAyMjA4MTcx
// SIG // NjIwNTJaGA8yMDIyMDgxODE2MjA1MlowdzA9BgorBgEE
// SIG // AYRZCgQBMS8wLTAKAgUA5qdbpAIBADAKAgEAAgIWXgIB
// SIG // /zAHAgEAAgIRtTAKAgUA5qitJAIBADA2BgorBgEEAYRZ
// SIG // CgQCMSgwJjAMBgorBgEEAYRZCgMCoAowCAIBAAIDB6Eg
// SIG // oQowCAIBAAIDAYagMA0GCSqGSIb3DQEBBQUAA4GBAJqx
// SIG // KN68X3NT8PwVH/XeGJjgfj+kgfhoxxFsSbRHRRsdkqv5
// SIG // Gt/qvwANtNuDFaQOuja+2wLMyRzOXC5zloZHW53kqXYv
// SIG // CDegS4zvQcjznBbeLLUe7gfb6pQSXBUZL9imXAimDYdq
// SIG // QgOkYu1g7pRaD2Ezy828o396azUYJ+LcjvGdMYIEDTCC
// SIG // BAkCAQEwgZMwfDELMAkGA1UEBhMCVVMxEzARBgNVBAgT
// SIG // Cldhc2hpbmd0b24xEDAOBgNVBAcTB1JlZG1vbmQxHjAc
// SIG // BgNVBAoTFU1pY3Jvc29mdCBDb3Jwb3JhdGlvbjEmMCQG
// SIG // A1UEAxMdTWljcm9zb2Z0IFRpbWUtU3RhbXAgUENBIDIw
// SIG // MTACEzMAAAGnNbsuwmSFUCkAAQAAAacwDQYJYIZIAWUD
// SIG // BAIBBQCgggFKMBoGCSqGSIb3DQEJAzENBgsqhkiG9w0B
// SIG // CRABBDAvBgkqhkiG9w0BCQQxIgQgn87Z47wyOwWeysfn
// SIG // 0dY7EPhLns9yySQ/cdy8Ac2AF6gwgfoGCyqGSIb3DQEJ
// SIG // EAIvMYHqMIHnMIHkMIG9BCBH8H/nCZUC4L0Yqbz3sH3w
// SIG // 5kzhwJ4RqCkXXKxNPtqOGzCBmDCBgKR+MHwxCzAJBgNV
// SIG // BAYTAlVTMRMwEQYDVQQIEwpXYXNoaW5ndG9uMRAwDgYD
// SIG // VQQHEwdSZWRtb25kMR4wHAYDVQQKExVNaWNyb3NvZnQg
// SIG // Q29ycG9yYXRpb24xJjAkBgNVBAMTHU1pY3Jvc29mdCBU
// SIG // aW1lLVN0YW1wIFBDQSAyMDEwAhMzAAABpzW7LsJkhVAp
// SIG // AAEAAAGnMCIEIErFQsT+9OfXdP0Fu3/RXZrZxtho2O/T
// SIG // L3/wE5emv49ZMA0GCSqGSIb3DQEBCwUABIICACE/oQvb
// SIG // wcQjGoS0pduuguV5VX3cm7vy0PVJ20J2n3vUDMkQjZi0
// SIG // 2YAjADxmjuDAMDOWewj62H0AZkLhREOmOj/Vqepiwnos
// SIG // 9rLHgO89ZHRZXnbP3KwMGtWleJ0BIrdiUYrTSvNvp6/P
// SIG // HV4pzim1a/x2Av8s02p/jlsZ+x5YFDhqbSStZMjaWDiM
// SIG // 2hIXKyYzbKJIfxA0HFWHedGuTYeC322aIgeoR7KMKxNP
// SIG // +S1Cxpt2KfN2gywcOGsCMjaXEHvMl1Kw9d1pkL+8C9lx
// SIG // W22NBXKXDyX949+LtlqnTC1fbZf+HhI4YRHT2Wp9OVYG
// SIG // m7VGKgpfoGVZQjY3EqYkQU7ofKSof7pxcE5aIrkhy2gf
// SIG // mfagDuqDmVObNwc4Nr5HplUrlspTJMfotysWOMrDqYsP
// SIG // nxU8QK9BXihj0rEZDuhJ9K8HUaGU3GEa2LlEyibdHPBb
// SIG // g5UxGe5WO0jPAE1iKqkdcaNHW+MNUTRwiu+qZ+T1mAM0
// SIG // yt67RZYkVjuvp4N2QmTxbQTpJwfJZO0Q+W7yc+K18CQG
// SIG // mWYTeLk4OFAu+MU4YRBZMpwmaeJdPbgUfyS+GkRmve7W
// SIG // qFcK9leRoV/+554iv9gU/wARWnroOaS5Esqpern87kYB
// SIG // 2oUnr87pJCExEMCXnxXPewjzrpg+Yv54bMMI4Q5B+z45
// SIG // lafKEu558WrXOI4m
// SIG // End signature block
