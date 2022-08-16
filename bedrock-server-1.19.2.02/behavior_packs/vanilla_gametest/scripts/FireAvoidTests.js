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
// SIG // MIInywYJKoZIhvcNAQcCoIInvDCCJ7gCAQExDzANBglg
// SIG // hkgBZQMEAgEFADB3BgorBgEEAYI3AgEEoGkwZzAyBgor
// SIG // BgEEAYI3AgEeMCQCAQEEEBDgyQbOONQRoqMAEEvTUJAC
// SIG // AQACAQACAQACAQACAQAwMTANBglghkgBZQMEAgEFAAQg
// SIG // /bKR1FM6si82qIZ0Lzo2sJVhLmrOPiyIcRp81trGQl6g
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
// SIG // AYI3AgEVMC8GCSqGSIb3DQEJBDEiBCBR5ai1twgWNs5I
// SIG // BGaIrmjC+l9hiCjLyKflt1fLQqLUeTBUBgorBgEEAYI3
// SIG // AgEMMUYwRKAkgCIATQBpAG4AZQBjAHIAYQBmAHQAIABC
// SIG // AGUAZAByAG8AYwBroRyAGmh0dHBzOi8vd3d3Lm1pbmVj
// SIG // cmFmdC5uZXQvMA0GCSqGSIb3DQEBAQUABIIBAHy/XwaL
// SIG // wIRGIrqCIle/mSPFuHJC7IiyVFr4N3X1Mljat0P3qd+A
// SIG // kUC3jQRJF8zHJyrl4bIBx2GV23HMvRDkYAq6R6aDxk4i
// SIG // McVU4O2bZBdopkkQULvMMwIxPcNeudumEojDDjjl3TUz
// SIG // s+8jRSGvAdMLvFbikGSmZPk50wlfGOxJ3n5Lg/7eys3X
// SIG // AyA3h4eeHkkvA60XJsrsxWE56RmzLpPlN4wJBcgLvUAW
// SIG // 2w8qiF5ePTHHHK4Xe5wvFX3DQ4lfZbWFUPNy47F1BjM0
// SIG // Y26Iz8L76ZjFTMvIEZ3+SliVHVOIz3qY63aSLWKDhOSx
// SIG // 7IymZSUNUcqxA7GHbLFHn6fMCVahghcWMIIXEgYKKwYB
// SIG // BAGCNwMDATGCFwIwghb+BgkqhkiG9w0BBwKgghbvMIIW
// SIG // 6wIBAzEPMA0GCWCGSAFlAwQCAQUAMIIBWQYLKoZIhvcN
// SIG // AQkQAQSgggFIBIIBRDCCAUACAQEGCisGAQQBhFkKAwEw
// SIG // MTANBglghkgBZQMEAgEFAAQgMmldg4D/BNw1NAkG5/7t
// SIG // h70akZuAG8WuP6WwxfCt3ZUCBmK7RfTgpBgTMjAyMjA3
// SIG // MDIwMDI4NTAuODM2WjAEgAIB9KCB2KSB1TCB0jELMAkG
// SIG // A1UEBhMCVVMxEzARBgNVBAgTCldhc2hpbmd0b24xEDAO
// SIG // BgNVBAcTB1JlZG1vbmQxHjAcBgNVBAoTFU1pY3Jvc29m
// SIG // dCBDb3Jwb3JhdGlvbjEtMCsGA1UECxMkTWljcm9zb2Z0
// SIG // IElyZWxhbmQgT3BlcmF0aW9ucyBMaW1pdGVkMSYwJAYD
// SIG // VQQLEx1UaGFsZXMgVFNTIEVTTjpBMjQwLTRCODItMTMw
// SIG // RTElMCMGA1UEAxMcTWljcm9zb2Z0IFRpbWUtU3RhbXAg
// SIG // U2VydmljZaCCEWUwggcUMIIE/KADAgECAhMzAAABjXpV
// SIG // Lnh0mSq3AAEAAAGNMA0GCSqGSIb3DQEBCwUAMHwxCzAJ
// SIG // BgNVBAYTAlVTMRMwEQYDVQQIEwpXYXNoaW5ndG9uMRAw
// SIG // DgYDVQQHEwdSZWRtb25kMR4wHAYDVQQKExVNaWNyb3Nv
// SIG // ZnQgQ29ycG9yYXRpb24xJjAkBgNVBAMTHU1pY3Jvc29m
// SIG // dCBUaW1lLVN0YW1wIFBDQSAyMDEwMB4XDTIxMTAyODE5
// SIG // Mjc0NVoXDTIzMDEyNjE5Mjc0NVowgdIxCzAJBgNVBAYT
// SIG // AlVTMRMwEQYDVQQIEwpXYXNoaW5ndG9uMRAwDgYDVQQH
// SIG // EwdSZWRtb25kMR4wHAYDVQQKExVNaWNyb3NvZnQgQ29y
// SIG // cG9yYXRpb24xLTArBgNVBAsTJE1pY3Jvc29mdCBJcmVs
// SIG // YW5kIE9wZXJhdGlvbnMgTGltaXRlZDEmMCQGA1UECxMd
// SIG // VGhhbGVzIFRTUyBFU046QTI0MC00QjgyLTEzMEUxJTAj
// SIG // BgNVBAMTHE1pY3Jvc29mdCBUaW1lLVN0YW1wIFNlcnZp
// SIG // Y2UwggIiMA0GCSqGSIb3DQEBAQUAA4ICDwAwggIKAoIC
// SIG // AQDaNEgtmD47pTt0ty7AE8wH7S0lTPTAcuonl/soldCx
// SIG // PNZOgANQxhXjFVmen2Y9NaiNQn+Xc7hep6AsM124UA5t
// SIG // yK2svJjkcOzEB9QbX/ZiKVxKRI/oJwypZ+xLBQsZfnOW
// SIG // xUocnu2/CDbrLp4uSVR0UymKrb3hPi4lB1d3k7uYXLS9
// SIG // WRoY8bE1YttnEo3Ooq0WdZDuMy1nTle9p+QhZms1MW/w
// SIG // YakCUe1GxnUDwoOjogNIZU1lldtCz587Aw4an8HOh3x/
// SIG // VgjwZvag3+bHZxy90av2VrnlBl5Wwzst9NoQ9DFuABwu
// SIG // BYOUg9yZPNwGSwTMs5CxKkHOyo9pYj3KRXDmh+auQUox
// SIG // ulBPkQySLay4mhUznEaB1lae3+3PTTG5s9IoWLgHggwV
// SIG // QH2ZwA1Sr1wdouwdsMn4BSxU7SqdWPDNc9gl5HsL8Hxf
// SIG // RSXpSQh2mVmadxBlIErfJlDL6gay4kpcUCrcGXFPqQO6
// SIG // Fhi87uK0us95jSSe63WsqTGib66Lq8J22EJ+cCLKSfJE
// SIG // LaWSerPPzHWYORDlDo7H2nr+V24W6lIky2CwI8318i+t
// SIG // +mkwMUi9GhQuwc50smOtGWLxyjkz69mZ/bShPFi5fMzS
// SIG // 1tG6sQnJwHlkxvDOewUfKY6SDLHw54WddXdxqvjm56Mj
// SIG // UHWKpQNt5I3Ge9zO46FynPBpyQIDAQABo4IBNjCCATIw
// SIG // HQYDVR0OBBYEFHjMkW6Hn0bClO5KO7hJNx+WKGaTMB8G
// SIG // A1UdIwQYMBaAFJ+nFV0AXmJdg/Tl0mWnG1M1GelyMF8G
// SIG // A1UdHwRYMFYwVKBSoFCGTmh0dHA6Ly93d3cubWljcm9z
// SIG // b2Z0LmNvbS9wa2lvcHMvY3JsL01pY3Jvc29mdCUyMFRp
// SIG // bWUtU3RhbXAlMjBQQ0ElMjAyMDEwKDEpLmNybDBsBggr
// SIG // BgEFBQcBAQRgMF4wXAYIKwYBBQUHMAKGUGh0dHA6Ly93
// SIG // d3cubWljcm9zb2Z0LmNvbS9wa2lvcHMvY2VydHMvTWlj
// SIG // cm9zb2Z0JTIwVGltZS1TdGFtcCUyMFBDQSUyMDIwMTAo
// SIG // MSkuY3J0MAwGA1UdEwEB/wQCMAAwEwYDVR0lBAwwCgYI
// SIG // KwYBBQUHAwgwDQYJKoZIhvcNAQELBQADggIBADWvc7PS
// SIG // USrdW+l0WWHdgHFziGdiQAvJg8Nr0U7heCrCQGbwuxv6
// SIG // Ure1sYaCmLpAlsreIzcErQ5sFzBFolULEYsa2vonP2FG
// SIG // 6ZHIXyjifbLdiIq/iiUHE2MVKFIZz0Tb0mZWMGYuCZ+N
// SIG // Go9z/asPbmrijDi4Detz16SJq5+AaFxIB16T+X6QBJvO
// SIG // iE63/nPb4iWBPh7dq5JTO3YYAp8pkHTZkMZYop4JjekQ
// SIG // uPW26HrJ+s4k88ic7hlktbe+Apq+0vx7oUlnImgMUx7A
// SIG // nn2gQv4Ard7YzYjggUT2fotVLxtL1RsxQy+sCVc3lkzY
// SIG // jwZ0cH1Nt8jXtab/1R/iq7nzw8k3u8ImP2z4rFmpdzmw
// SIG // ZJwuCqI+ohts1MT78ARn95OLFz1guBPIypqRkjn3AaqO
// SIG // s41BJju7RUQOQQTqKTP4VIVEorOnJJvRZOAy9bGwu9uc
// SIG // 3wAKYhI+cEdhmgayw8Avt+gYYoUt0AFNALY9fX1aOt/K
// SIG // uyEd2KpKUKymogYFPFFoe3I8yujcH/bqA98KXcwLesLc
// SIG // 0arjEacgcNkZKLNSYaDxORACWhV1Tl0nW/3XSCPFrFpS
// SIG // toaE/wi20TRFadTldGn+wZo2YNwzBvIe5KloWyfdDbU7
// SIG // OK0/gGc3m2msdqeAALuOh7jOYueZGcCJRz2xGpDZuaww
// SIG // C9Smw7yeU4WaIzUvMIIHcTCCBVmgAwIBAgITMwAAABXF
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
// SIG // JAYDVQQLEx1UaGFsZXMgVFNTIEVTTjpBMjQwLTRCODIt
// SIG // MTMwRTElMCMGA1UEAxMcTWljcm9zb2Z0IFRpbWUtU3Rh
// SIG // bXAgU2VydmljZaIjCgEBMAcGBSsOAwIaAxUAgHOVkz1N
// SIG // E0Pg+C2ktZBmRI9hVwmggYMwgYCkfjB8MQswCQYDVQQG
// SIG // EwJVUzETMBEGA1UECBMKV2FzaGluZ3RvbjEQMA4GA1UE
// SIG // BxMHUmVkbW9uZDEeMBwGA1UEChMVTWljcm9zb2Z0IENv
// SIG // cnBvcmF0aW9uMSYwJAYDVQQDEx1NaWNyb3NvZnQgVGlt
// SIG // ZS1TdGFtcCBQQ0EgMjAxMDANBgkqhkiG9w0BAQUFAAIF
// SIG // AOZpuNgwIhgPMjAyMjA3MDIwMjE4MDBaGA8yMDIyMDcw
// SIG // MzAyMTgwMFowdDA6BgorBgEEAYRZCgQBMSwwKjAKAgUA
// SIG // 5mm42AIBADAHAgEAAgIHTzAHAgEAAgISBDAKAgUA5msK
// SIG // WAIBADA2BgorBgEEAYRZCgQCMSgwJjAMBgorBgEEAYRZ
// SIG // CgMCoAowCAIBAAIDB6EgoQowCAIBAAIDAYagMA0GCSqG
// SIG // SIb3DQEBBQUAA4GBAATYwCC9svLcfNq0gb7aRB93RdCs
// SIG // PlvPJte889WupPfc9W3anfdMCzLs97jUc1xU89RyeFqF
// SIG // xmY45OutoRiSTis9Oep94SszYtgRdETqgJUKD2XIBFGb
// SIG // yGVcczJSo0xeZXR2TRbPMsskcJohNJUez376LSBwN/nR
// SIG // UAHAu4xyptYVMYIEDTCCBAkCAQEwgZMwfDELMAkGA1UE
// SIG // BhMCVVMxEzARBgNVBAgTCldhc2hpbmd0b24xEDAOBgNV
// SIG // BAcTB1JlZG1vbmQxHjAcBgNVBAoTFU1pY3Jvc29mdCBD
// SIG // b3Jwb3JhdGlvbjEmMCQGA1UEAxMdTWljcm9zb2Z0IFRp
// SIG // bWUtU3RhbXAgUENBIDIwMTACEzMAAAGNelUueHSZKrcA
// SIG // AQAAAY0wDQYJYIZIAWUDBAIBBQCgggFKMBoGCSqGSIb3
// SIG // DQEJAzENBgsqhkiG9w0BCRABBDAvBgkqhkiG9w0BCQQx
// SIG // IgQgB28HmY/SpvHfAm9CjIrQaeHOlBke96iOOHrHNJ9n
// SIG // wq8wgfoGCyqGSIb3DQEJEAIvMYHqMIHnMIHkMIG9BCCe
// SIG // lhEz+h1eQMCfN/a50vnr1bxx8ZODBW56dDy20hjNfzCB
// SIG // mDCBgKR+MHwxCzAJBgNVBAYTAlVTMRMwEQYDVQQIEwpX
// SIG // YXNoaW5ndG9uMRAwDgYDVQQHEwdSZWRtb25kMR4wHAYD
// SIG // VQQKExVNaWNyb3NvZnQgQ29ycG9yYXRpb24xJjAkBgNV
// SIG // BAMTHU1pY3Jvc29mdCBUaW1lLVN0YW1wIFBDQSAyMDEw
// SIG // AhMzAAABjXpVLnh0mSq3AAEAAAGNMCIEIF2N5lQVA3sE
// SIG // 8Pr4qCxZNpRnE4ju+HTKIwS1iQSV2qmRMA0GCSqGSIb3
// SIG // DQEBCwUABIICAMbCJYWoA4kxuZVWW1bOl4IGsjt7pGBU
// SIG // bKUAVJuJ/ehvHFrvmx9ziPNL+gsoslVFxMCyg98YO+tI
// SIG // 615Dsht7nBEpo7UQ5JNRTAK8KoN6HVZr8/Lme55dfTq3
// SIG // gwT6QbdtlhGUYML7DcQDiZ8O8iUcMAxnsETKYtEo5kH+
// SIG // SFwo/fGV6T3UKzZYuUDkKMRIsRaVv8qrHqoAT6pjfnbR
// SIG // i+h/FbI2kxHgC+/6N3XSGPVTf6QUp5WbtvOP4feKSjx/
// SIG // zf8rnaOX+nS+7jIQ8R+7P0Hjfur4iK0UI7s3OHOzzsw4
// SIG // DlaRFnSPpevrM6yJ60nk9tNpwfpcl+vx/3fT9Z3cXQqo
// SIG // FWdw5fL6JCTZEcWT0IJbEI7icQcpRvI/7H1te5uwoyQN
// SIG // ODcY5Sv8a/W7WQaSpgoRJVLvLHF78vXw45jGW4EcLb06
// SIG // yyYH3y+LXgoeeQtdwVywfoSEtN8dwZGY5L4rujuaA1PB
// SIG // M2LfNtBJGybHkzdhr3vmldaILH0qsGWezhGUrRL5Npmt
// SIG // KnboyDTTPfgoMxc9N/JC6tlkGl3fM8Z4AqTb+JMnuGjd
// SIG // KbUu6vbmxyQ+nd9VOmVlf642Rq8lTNbRXwHUoah+VlqG
// SIG // Q9OtwCOkbcJMs7tnfrL6O9MnJirRZ7PhShQlmYLvmWKi
// SIG // f8N2Ww39KjyCa/A32fGpVV2tm8AoCFsTe3nN
// SIG // End signature block
