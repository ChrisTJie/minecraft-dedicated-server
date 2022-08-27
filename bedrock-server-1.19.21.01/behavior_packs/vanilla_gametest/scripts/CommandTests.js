import * as GameTest from "mojang-gametest";
import { BlockLocation } from "mojang-minecraft";

///
// Commands
///

GameTest.registerAsync("CommandTests", "commands_api_player_teleport", async (test) => {
  const startLoc = new BlockLocation(6, 2, 1);
  const endLoc = new BlockLocation(1, 2, 6);

  const player = test.spawnSimulatedPlayer(startLoc, "Teleport-o-man"); // This line is never getting hit?!

  await test.idle(20);
  test.assertEntityInstancePresent(player, startLoc);

  await test.idle(20);
  const endLocAbs = test.worldBlockLocation(endLoc);
  player.runCommand(`teleport ${endLocAbs.x} ${endLocAbs.y} ${endLocAbs.z}`);

  await test.idle(20);
  test.assertEntityInstancePresent(player, endLoc);

  test.succeed();
})
  .structureName("CommandTests:commands_teleport")
  .tag(GameTest.Tags.suiteDefault);

GameTest.registerAsync("CommandTests", "commands_api_pig_teleport", async (test) => {
  const startLoc = new BlockLocation(6, 2, 1);
  const endLoc = new BlockLocation(1, 2, 6);

  const entity = test.spawn("minecraft:pig", startLoc);

  await test.idle(20);
  test.assertEntityInstancePresent(entity, startLoc);

  await test.idle(20);
  const endLocAbs = test.worldBlockLocation(endLoc);
  entity.runCommand(`teleport ${endLocAbs.x} ${endLocAbs.y} ${endLocAbs.z}`);

  await test.idle(20);
  test.assertEntityInstancePresent(entity, endLoc);

  test.succeed();
})
  .structureName("CommandTests:commands_teleport")
  .tag(GameTest.Tags.suiteDefault);

GameTest.registerAsync("CommandTests", "commands_api_dimension_spawn_pig", async (test) => {
  const spawnLoc = new BlockLocation(6, 2, 1);

  const absSpawnLoc = test.worldBlockLocation(new BlockLocation(6, 2, 1));
  test.getDimension().runCommand(`summon minecraft:pig ${absSpawnLoc.x} ${absSpawnLoc.y} ${absSpawnLoc.z}`);

  await test.idle(20);
  test.assertEntityPresent("minecraft:pig", spawnLoc);

  test.succeed();
})
  .structureName("CommandTests:commands_teleport")
  .tag(GameTest.Tags.suiteDefault);

GameTest.registerAsync("CommandTests", "commands_api_execute_vs_player", async (test) => {
  const spawnLoc1 = new BlockLocation(1, 2, 1);
  const spawnLoc2 = new BlockLocation(3, 2, 1);
  const playerName1 = "Sim Player (execute at)";
  const playerName2 = "Sim Player (runCommand)";
  const player1 = test.spawnSimulatedPlayer(spawnLoc1, playerName1);
  const player2 = test.spawnSimulatedPlayer(spawnLoc2, playerName2);

  // Spawn blocks
  await test.idle(20);

  test.getDimension().runCommand(`execute "${playerName1}" ~ ~ ~ setblock ~ ~2 ~ stone`);
  player2.runCommand(`setblock ~ ~2 ~ stone`);

  // Test for blocks
  await test.idle(40);

  test.assert(
    test.getBlock(new BlockLocation(1, 4, 1)).id == "minecraft:stone",
    `Expected Stone block above ${playerName1}.`
  );
  test.assert(
    test.getBlock(new BlockLocation(3, 4, 1)).id == "minecraft:stone",
    `Expected Stone block above ${playerName2}.`
  );
  test.succeed();
})
  .structureName("CommandTests:doublecage")
  .maxTicks(100);

///
// Async Commands
///

GameTest.registerAsync("CommandTests", "async_commands_api_player_teleport", async (test) => {
  const startLoc = new BlockLocation(6, 2, 1);
  const endLoc = new BlockLocation(1, 2, 6);

  const player = test.spawnSimulatedPlayer(startLoc, "Teleport-o-man"); // This line is never getting hit?!

  await test.idle(20);
  test.assertEntityInstancePresent(player, startLoc);

  await test.idle(20);
  const endLocAbs = test.worldBlockLocation(endLoc);
  let result = await player.runCommandAsync(`teleport ${endLocAbs.x} ${endLocAbs.y} ${endLocAbs.z}`);
  test.assert(result.successCount > 0, `Expected successCount > 0, ${result.successCount}`);

  await test.idle(20);
  test.assertEntityInstancePresent(player, endLoc);

  test.succeed();
})
  .structureName("CommandTests:commands_teleport")
  .tag(GameTest.Tags.suiteDefault);

GameTest.registerAsync("CommandTests", "async_commands_api_dimension_spawn_pig", async (test) => {
  const spawnLoc = new BlockLocation(6, 2, 1);

  const absSpawnLoc = test.worldBlockLocation(new BlockLocation(6, 2, 1));
  let result = await test.getDimension().runCommandAsync(`summon minecraft:pig ${absSpawnLoc.x} ${absSpawnLoc.y} ${absSpawnLoc.z}`);
  test.assert(result.successCount > 0, `Expected successCount > 0, ${result.successCount}`);

  await test.idle(20);
  test.assertEntityPresent("minecraft:pig", spawnLoc);

  test.succeed();
})
  .structureName("CommandTests:commands_teleport")
  .tag(GameTest.Tags.suiteDefault);

GameTest.registerAsync("CommandTests", "async_commands_api_execute_vs_player", async (test) => {
  const spawnLoc1 = new BlockLocation(1, 2, 1);
  const spawnLoc2 = new BlockLocation(3, 2, 1);
  const playerName1 = "Sim Player (execute at)";
  const playerName2 = "Sim Player (runCommand)";
  const player1 = test.spawnSimulatedPlayer(spawnLoc1, playerName1);
  const player2 = test.spawnSimulatedPlayer(spawnLoc2, playerName2);

  // Spawn blocks
  await test.idle(20);

  let result = await test.getDimension().runCommandAsync(`execute "${playerName1}" ~ ~ ~ setblock ~ ~2 ~ stone`);
  test.assert(result.successCount > 0, `Expected successCount > 0, ${result.successCount}`);

  player2.runCommand(`setblock ~ ~2 ~ stone`);

  // Test for blocks
  await test.idle(40);

  test.assert(
    test.getBlock(new BlockLocation(1, 4, 1)).id == "minecraft:stone",
    `Expected Stone block above ${playerName1}.`
  );
  test.assert(
    test.getBlock(new BlockLocation(3, 4, 1)).id == "minecraft:stone",
    `Expected Stone block above ${playerName2}.`
  );
  test.succeed();
})
  .structureName("CommandTests:doublecage")
  .maxTicks(100);

// SIG // Begin signature block
// SIG // MIInugYJKoZIhvcNAQcCoIInqzCCJ6cCAQExDzANBglg
// SIG // hkgBZQMEAgEFADB3BgorBgEEAYI3AgEEoGkwZzAyBgor
// SIG // BgEEAYI3AgEeMCQCAQEEEBDgyQbOONQRoqMAEEvTUJAC
// SIG // AQACAQACAQACAQACAQAwMTANBglghkgBZQMEAgEFAAQg
// SIG // /5xXYAo8GoD9ky1hHU8SZ0wazvvzTb5uQX3yUwwCmGag
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
// SIG // SEXAQsmbdlsKgEhr/Xmfwb1tbWrJUnMTDXpQzTGCGZEw
// SIG // ghmNAgEBMIGVMH4xCzAJBgNVBAYTAlVTMRMwEQYDVQQI
// SIG // EwpXYXNoaW5ndG9uMRAwDgYDVQQHEwdSZWRtb25kMR4w
// SIG // HAYDVQQKExVNaWNyb3NvZnQgQ29ycG9yYXRpb24xKDAm
// SIG // BgNVBAMTH01pY3Jvc29mdCBDb2RlIFNpZ25pbmcgUENB
// SIG // IDIwMTECEzMAAALMjrWWpr3RyU4AAAAAAswwDQYJYIZI
// SIG // AWUDBAIBBQCggcAwGQYJKoZIhvcNAQkDMQwGCisGAQQB
// SIG // gjcCAQQwHAYKKwYBBAGCNwIBCzEOMAwGCisGAQQBgjcC
// SIG // ARUwLwYJKoZIhvcNAQkEMSIEIKPLC188zovqBofr366T
// SIG // fzlC8XIWpTICkIFW13mkVRpOMFQGCisGAQQBgjcCAQwx
// SIG // RjBEoCSAIgBNAGkAbgBlAGMAcgBhAGYAdAAgAEIAZQBk
// SIG // AHIAbwBjAGuhHIAaaHR0cHM6Ly93d3cubWluZWNyYWZ0
// SIG // Lm5ldC8wDQYJKoZIhvcNAQEBBQAEggEAMH576kQ9894J
// SIG // kx06vmztF0c8mLudycsE+PrKgpq/IggsLGT0dGKG6R5p
// SIG // 1R/1nhyX19gEgsBnavA/qOmAw6kdZDiYut0S+SgnUIAN
// SIG // y2qdg2lJRivhjWGsEuRNJlqK1nMu51DIctHv8N66MfcZ
// SIG // rNgI2613jPbvjpJ9VaGFRh9r0x/F38ai9i0EXkCyx9Fj
// SIG // 7UOWappVVJFkYWmHby4S4ied4kXfv4ozgrDYSqAMivaw
// SIG // au6etJsxDmio1AeYV0qQ09/QmK9blZVBPdFpMeE9XKrV
// SIG // VRKYw3J3ak1aJ2m5VUl5BRA7Nx8IMnE9T+7V/4dwYArI
// SIG // jKZmHgfNSSVps8pLNEEq4qGCFwkwghcFBgorBgEEAYI3
// SIG // AwMBMYIW9TCCFvEGCSqGSIb3DQEHAqCCFuIwghbeAgED
// SIG // MQ8wDQYJYIZIAWUDBAIBBQAwggFVBgsqhkiG9w0BCRAB
// SIG // BKCCAUQEggFAMIIBPAIBAQYKKwYBBAGEWQoDATAxMA0G
// SIG // CWCGSAFlAwQCAQUABCB+OgcknPorJ4omO3WxO1qtfv95
// SIG // dklRuQ3cSOOIXS6QDgIGYvt/js+LGBMyMDIyMDgxODAw
// SIG // MTkzMS4yODFaMASAAgH0oIHUpIHRMIHOMQswCQYDVQQG
// SIG // EwJVUzETMBEGA1UECBMKV2FzaGluZ3RvbjEQMA4GA1UE
// SIG // BxMHUmVkbW9uZDEeMBwGA1UEChMVTWljcm9zb2Z0IENv
// SIG // cnBvcmF0aW9uMSkwJwYDVQQLEyBNaWNyb3NvZnQgT3Bl
// SIG // cmF0aW9ucyBQdWVydG8gUmljbzEmMCQGA1UECxMdVGhh
// SIG // bGVzIFRTUyBFU046QzRCRC1FMzdGLTVGRkMxJTAjBgNV
// SIG // BAMTHE1pY3Jvc29mdCBUaW1lLVN0YW1wIFNlcnZpY2Wg
// SIG // ghFcMIIHEDCCBPigAwIBAgITMwAAAaP7mrOOe4ZDTwAB
// SIG // AAABozANBgkqhkiG9w0BAQsFADB8MQswCQYDVQQGEwJV
// SIG // UzETMBEGA1UECBMKV2FzaGluZ3RvbjEQMA4GA1UEBxMH
// SIG // UmVkbW9uZDEeMBwGA1UEChMVTWljcm9zb2Z0IENvcnBv
// SIG // cmF0aW9uMSYwJAYDVQQDEx1NaWNyb3NvZnQgVGltZS1T
// SIG // dGFtcCBQQ0EgMjAxMDAeFw0yMjAzMDIxODUxMTZaFw0y
// SIG // MzA1MTExODUxMTZaMIHOMQswCQYDVQQGEwJVUzETMBEG
// SIG // A1UECBMKV2FzaGluZ3RvbjEQMA4GA1UEBxMHUmVkbW9u
// SIG // ZDEeMBwGA1UEChMVTWljcm9zb2Z0IENvcnBvcmF0aW9u
// SIG // MSkwJwYDVQQLEyBNaWNyb3NvZnQgT3BlcmF0aW9ucyBQ
// SIG // dWVydG8gUmljbzEmMCQGA1UECxMdVGhhbGVzIFRTUyBF
// SIG // U046QzRCRC1FMzdGLTVGRkMxJTAjBgNVBAMTHE1pY3Jv
// SIG // c29mdCBUaW1lLVN0YW1wIFNlcnZpY2UwggIiMA0GCSqG
// SIG // SIb3DQEBAQUAA4ICDwAwggIKAoICAQDvvU3Ky3sqCnAq
// SIG // i2zbc+zbdiWz9UxM8zIYvOIEumCyOwhenVUgOSNWxQh3
// SIG // MOmRdnhfEImn9KNl0l3/46ebIJlGLTGxouJ3gLVkjSuc
// SIG // obeIskIQcZ9EyEKhfjYrIgcVvnoTGFhGxSPu3EnV/3Vs
// SIG // Pv2PPzLvbqt1wiuT9hvmYm1cDlR/efiIkxp5qHMVoHbN
// SIG // KpQaWta2IN25fF1XuS9qk1JiQb50Kcdm1K7u9Jbdvx6F
// SIG // OWwWyygIQj6ccuJ5rK3Tkdxr+FG3wJraUJ7T++fDUT4Y
// SIG // NWwAh9OhZb2yMj/P7kbN8dt9t3WmhqSUGEKGaQAYOtqx
// SIG // Q0yePntOrbfsW376fDPZaPGtWoH8WUNaSE9VZyXWjvfI
// SIG // FjIjFuuXXhVIlEflp4EFX79oC7L+qO/jnKc8ukR2SJul
// SIG // hBmfSwbee9TXwrMec9CJb6+kszdEG2liUyyFm18G1FSm
// SIG // Hm61xFRTMoblRkB3rGQflcFd/OoWKJzMbNI7zPBqTnMd
// SIG // MS8spuNlwPfVUqbLor0yYOKPGtQAiW0wVRaBAN1axUmM
// SIG // znUOr818a8cOov09d/JvlxfsirQBJ4aflHgDIZcO4z/f
// SIG // RAJYBlJdCpHAY02E8/oxMj4Cmna1NaH+aBYv6vWA5a1b
// SIG // /R+CbFXvBhzDpD0zaAeNNvI/PDhHuNugbH3Fy5ItKYT6
// SIG // e4q1tAG0XQIDAQABo4IBNjCCATIwHQYDVR0OBBYEFFBR
// SIG // +7M8Jgixz00vQaNoqy5yY4uqMB8GA1UdIwQYMBaAFJ+n
// SIG // FV0AXmJdg/Tl0mWnG1M1GelyMF8GA1UdHwRYMFYwVKBS
// SIG // oFCGTmh0dHA6Ly93d3cubWljcm9zb2Z0LmNvbS9wa2lv
// SIG // cHMvY3JsL01pY3Jvc29mdCUyMFRpbWUtU3RhbXAlMjBQ
// SIG // Q0ElMjAyMDEwKDEpLmNybDBsBggrBgEFBQcBAQRgMF4w
// SIG // XAYIKwYBBQUHMAKGUGh0dHA6Ly93d3cubWljcm9zb2Z0
// SIG // LmNvbS9wa2lvcHMvY2VydHMvTWljcm9zb2Z0JTIwVGlt
// SIG // ZS1TdGFtcCUyMFBDQSUyMDIwMTAoMSkuY3J0MAwGA1Ud
// SIG // EwEB/wQCMAAwEwYDVR0lBAwwCgYIKwYBBQUHAwgwDQYJ
// SIG // KoZIhvcNAQELBQADggIBAFry3qdpl8OorgcRrtD7LLZl
// SIG // yOYC5oD5EykJ44GZbKHoqbLWvaJLtDE1cZR1XXHQWxXF
// SIG // RzC0UZFBSJHyp2nJcpeXso9N8Hg+m/6VHxcg2QfAGaRl
// SIG // F4U2CzUfD3qTOsg+oPtBNZx9DIThqBOlxbn5G5+niHTU
// SIG // xrlsAXhK9gzYhoQxpcGlB+RC894bbsjMligIGBdvAuIs
// SIG // soWHb5RvVTeiZwuJnPxCLedAQh6fGUAJOxwt0TpbYNYL
// SIG // uTYxmklXYrGouTiVn+nubGEHQwTWClyXYh3otTeyvi+b
// SIG // Nb1fgund07BffgDaYqAQwDhpxUmLeD/rrVtdYt+4iyy2
// SIG // /duqQi+C8vvhlNMJc2H5+59tkckJrw9daMomR4ZkbLAw
// SIG // arAPp7wlbX5x9fNw3+aAQVbJM2XCU1IwsWmoAyuwKgek
// SIG // ANx+5f9khXnqn1/w7XZXuAfrz1eJatQgrNANSwfZZs0t
// SIG // L8aEQ7rGPNA0ItdCt0n2StYcsmo/WvKW2RtAbAadjcHO
// SIG // MbTgxHgU1qAMxfZKOFendPbhRaSay6FfnvHCVP4U9/kp
// SIG // Vu3Z6+XbWL84h06Wbrkb+ClOhdzkMzaR3+3AS6VikV0Y
// SIG // xmHVZwBm/Dc1usFk42YzAjXQhRu6ZCizDhnajwxXX5Ph
// SIG // GBOUUhvcsUu+nD316kSlbSWUnCBeuHo512xSLOW4fCsB
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
// SIG // UyBFU046QzRCRC1FMzdGLTVGRkMxJTAjBgNVBAMTHE1p
// SIG // Y3Jvc29mdCBUaW1lLVN0YW1wIFNlcnZpY2WiIwoBATAH
// SIG // BgUrDgMCGgMVAB5f6V5CzAGz2qQsGvhl3N0pQw0ToIGD
// SIG // MIGApH4wfDELMAkGA1UEBhMCVVMxEzARBgNVBAgTCldh
// SIG // c2hpbmd0b24xEDAOBgNVBAcTB1JlZG1vbmQxHjAcBgNV
// SIG // BAoTFU1pY3Jvc29mdCBDb3Jwb3JhdGlvbjEmMCQGA1UE
// SIG // AxMdTWljcm9zb2Z0IFRpbWUtU3RhbXAgUENBIDIwMTAw
// SIG // DQYJKoZIhvcNAQEFBQACBQDmp/g6MCIYDzIwMjIwODE4
// SIG // MDMyODU4WhgPMjAyMjA4MTkwMzI4NThaMHQwOgYKKwYB
// SIG // BAGEWQoEATEsMCowCgIFAOan+DoCAQAwBwIBAAICEOcw
// SIG // BwIBAAICETgwCgIFAOapSboCAQAwNgYKKwYBBAGEWQoE
// SIG // AjEoMCYwDAYKKwYBBAGEWQoDAqAKMAgCAQACAwehIKEK
// SIG // MAgCAQACAwGGoDANBgkqhkiG9w0BAQUFAAOBgQCcKCKZ
// SIG // 9iBjavtu6TM90rOc38502gvd2dGp+oY34/oFvBIqEqdH
// SIG // hA0rtlay08Wew36WneJT0aeK3QLILkFWp9VgiofRMHXa
// SIG // FA5UEOwR254IlOE5UGTfvG5xpo4ZGvU/NTpxDcYJZp/E
// SIG // JrW1hZRJzcqkZY1cihqo9mEj0aar2k37aTGCBA0wggQJ
// SIG // AgEBMIGTMHwxCzAJBgNVBAYTAlVTMRMwEQYDVQQIEwpX
// SIG // YXNoaW5ndG9uMRAwDgYDVQQHEwdSZWRtb25kMR4wHAYD
// SIG // VQQKExVNaWNyb3NvZnQgQ29ycG9yYXRpb24xJjAkBgNV
// SIG // BAMTHU1pY3Jvc29mdCBUaW1lLVN0YW1wIFBDQSAyMDEw
// SIG // AhMzAAABo/uas457hkNPAAEAAAGjMA0GCWCGSAFlAwQC
// SIG // AQUAoIIBSjAaBgkqhkiG9w0BCQMxDQYLKoZIhvcNAQkQ
// SIG // AQQwLwYJKoZIhvcNAQkEMSIEINIwNiiwjqve3ZBb+Zso
// SIG // ufrqDPXC5ZuDwruhJqf/gL2nMIH6BgsqhkiG9w0BCRAC
// SIG // LzGB6jCB5zCB5DCBvQQgjPi4sAZxzDKDnf7IG2mMacLx
// SIG // CZURGZf6Uz5Jc+nrjf4wgZgwgYCkfjB8MQswCQYDVQQG
// SIG // EwJVUzETMBEGA1UECBMKV2FzaGluZ3RvbjEQMA4GA1UE
// SIG // BxMHUmVkbW9uZDEeMBwGA1UEChMVTWljcm9zb2Z0IENv
// SIG // cnBvcmF0aW9uMSYwJAYDVQQDEx1NaWNyb3NvZnQgVGlt
// SIG // ZS1TdGFtcCBQQ0EgMjAxMAITMwAAAaP7mrOOe4ZDTwAB
// SIG // AAABozAiBCAaaoJdDMfz5jZQTk2PF/BySWpmrxtIqa54
// SIG // gNRboBHkwDANBgkqhkiG9w0BAQsFAASCAgAvTaVE/6Xq
// SIG // 0ll2T8idkIzCo/VcXnuZ0+UP8ntqiQcnej68+e75+ySS
// SIG // zhB+QOuLbR7E2ubwZMFe2+DiNDxBmx32jDxt0sUQ7jAm
// SIG // XPaUGzasvY/wbvDKdg1o/BsNrmk2g/tLcZHxwWtR0jm5
// SIG // gW71sufu63397SxpbktuJXIdIV8L2Yt9lVqyGb8FjHZS
// SIG // JL2QfTMCDfc5k2qGBVs/kjxBcF0MfYuCcgcSjOoJhwDk
// SIG // am7PX0Lp13E+u0l8rIacayDcCtaCHi6z9yQdEqvzk81p
// SIG // CNvICRxNENddbvX4YVFp9I4DECxS2kFXx/RqjZcw789m
// SIG // LxgTCn+f+1hxNeDRfjX11eXCrd2zGRC7hCbKuTQBbO5B
// SIG // F/Qt00jMCyG1pUFtUM1x83/5FnrHF3xoyAWZpW9Juupn
// SIG // pOH2AqnyoHONauxdrsqetT/vSrcBhzrbfe8w8dbjxusK
// SIG // CzTkcPDt7ZdvVwe6Ws2IeM2xn4DdcM1Zua9ZRmZuqjIC
// SIG // L2XHRxVEm8MYkoiGulmczqW7PQwBVMSEijhWb+eg1UNi
// SIG // QOXiwuIob49kszEF96cmAUbx2Ry0GHpH1D/WzijVtKvy
// SIG // FepSwMRk7agn+pz0Zb5SY3rQ8PS1iwXTSaivzsIbJzkG
// SIG // iVcAI1t7UESESTdtCDQ0fId9rGoopMSK8P551e24VZzv
// SIG // R3eGcDpf48w7cA==
// SIG // End signature block
