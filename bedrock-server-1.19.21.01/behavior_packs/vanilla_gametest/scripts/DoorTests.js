import * as GameTest from "mojang-gametest";
import { BlockLocation } from "mojang-minecraft";
import GameTestExtensions from "./GameTestExtensions.js";

const DOOR_TEST_PADDING = 100; // The padding for the door tests will need to be increased some more to prevent the interference

GameTest.register("DoorTests", "four_villagers_one_door", (test) => {
  const villagerEntityType = "minecraft:villager_v2";
  const villagerEntitySpawnType = "minecraft:villager_v2<minecraft:spawn_farmer>"; // Attempt to spawn the villagers as farmers

  test.spawn(villagerEntitySpawnType, new BlockLocation(5, 2, 4));
  test.spawn(villagerEntitySpawnType, new BlockLocation(4, 2, 5));
  test.spawn(villagerEntitySpawnType, new BlockLocation(2, 2, 5));
  test.spawn(villagerEntitySpawnType, new BlockLocation(1, 2, 4));

  test.succeedWhen(() => {
    test.assertEntityPresent(villagerEntityType, new BlockLocation(5, 2, 2), true);
    test.assertEntityPresent(villagerEntityType, new BlockLocation(5, 2, 1), true);
    test.assertEntityPresent(villagerEntityType, new BlockLocation(1, 2, 2), true);
    test.assertEntityPresent(villagerEntityType, new BlockLocation(1, 2, 1), true);
  });
})
  .tag(GameTest.Tags.suiteDisabled) // Villagers can get stuck on the door or on sleeping villagers
  .padding(DOOR_TEST_PADDING) // Space out villager tests to stop them from confusing each other
  .batch("night") // This should be a constant at some point
  .maxTicks(600);

GameTest.register("DoorTests", "villagers_can_pass_open_iron_door", (test) => {
  const villagerActor = "minecraft:villager_v2<minecraft:spawn_farmer>";

  test.spawn(villagerActor, new BlockLocation(2, 2, 5));

  test.succeedWhenEntityPresent(villagerActor, new BlockLocation(1, 2, 1), true);
})
  .maxTicks(900) //Increase max ticks from 200 to 900 (same value as in PathFindingTests), to make sure villager can find and go to bed
  .batch("night")
  .required(false)
  .padding(DOOR_TEST_PADDING)
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("DoorTests", "villagers_cant_pass_closed_iron_door", (test) => {
  const villagerActor = "minecraft:villager_v2<minecraft:spawn_farmer>";

  test.spawn(villagerActor, new BlockLocation(2, 2, 5));

  test
    .startSequence()
    .thenExecute(() => {
      test.assertEntityPresent(villagerActor, new BlockLocation(1, 2, 1), false);
    })
    .thenIdle(200)
    .thenSucceed();
})
  .maxTicks(220)
  .padding(DOOR_TEST_PADDING)
  .batch("night")
  .required(false)
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("DoorTests", "door_maze", (test) => {
  const villagerActor = "minecraft:villager_v2";

  test.spawn(villagerActor, new BlockLocation(1, 2, 1));

  test.succeedWhenEntityPresent(villagerActor, new BlockLocation(7, 2, 7), true);
})
  .maxTicks(400)
  .padding(DOOR_TEST_PADDING)
  .batch("night")
  .required(false)
  .tag(GameTest.Tags.suiteDisabled); // Both of Java and Bedrock are failed villager is stuck and doesn't find the good way.

GameTest.register("DoorTests", "door_maze_3d", (test) => {
  const villagerActor = "minecraft:villager_v2<minecraft:spawn_farmer>";

  test.spawn(villagerActor, new BlockLocation(1, 2, 1));

  test.succeedWhenEntityPresent(villagerActor, new BlockLocation(7, 2, 7), true);
})
  .maxTicks(400)
  .padding(DOOR_TEST_PADDING)
  .batch("night")
  .required(false)
  .tag(GameTest.Tags.suiteDisabled); //Both of Java and Bedrock are failed looks like he doesn't cross obstacle and doesn't find the good way.

GameTest.register("DoorTests", "door_maze_crowded", (test) => {
  const villagerActor = "minecraft:villager_v2<minecraft:spawn_farmer>";

  test.spawn(villagerActor, new BlockLocation(1, 2, 1));
  test.spawn(villagerActor, new BlockLocation(3, 2, 2));
  test.spawn(villagerActor, new BlockLocation(5, 2, 1));
  test.spawn(villagerActor, new BlockLocation(1, 2, 1));

  test.succeedWhen(() => {
    test.assertEntityPresent(villagerActor, new BlockLocation(7, 2, 7), true);
    test.assertEntityPresent(villagerActor, new BlockLocation(4, 2, 8), true);
    test.assertEntityPresent(villagerActor, new BlockLocation(2, 2, 7), true);
    test.assertEntityPresent(villagerActor, new BlockLocation(1, 2, 8), true);
  });
})
  .maxTicks(400)
  .padding(DOOR_TEST_PADDING)
  .batch("night")
  .required(false)
  .tag(GameTest.Tags.suiteDisabled); //Both of Java and Bedrock are failed, some villiages are stuck behind the door and doesn't find the path.

GameTest.register("DoorTests", "inverted_door", (test) => {
  const villagerActor = "minecraft:villager_v2<minecraft:spawn_farmer>";

  test.spawn(villagerActor, new BlockLocation(3, 2, 1));

  test.succeedWhenEntityPresent(villagerActor, new BlockLocation(3, 2, 5), true);
})
  .maxTicks(200)
  .padding(DOOR_TEST_PADDING)
  .batch("night")
  .required(false)
  .tag(GameTest.Tags.suiteDisabled); //Both of Java and Bedrock are failed, village is stuck behind the door, at there all time.

GameTest.register("DoorTests", "close_door_after_passing_through", (test) => {
  const testEx = new GameTestExtensions(test);
  const villagerActor = "minecraft:villager_v2<minecraft:spawn_farmer>";

  test.spawn(villagerActor, new BlockLocation(1, 2, 1));
  test.spawn(villagerActor, new BlockLocation(4, 2, 1));
  test.spawn(villagerActor, new BlockLocation(5, 2, 1));
  test.spawn(villagerActor, new BlockLocation(7, 2, 1));
  test.spawn(villagerActor, new BlockLocation(9, 2, 1));

  test.succeedWhen(() => {
    test.assertEntityPresent(villagerActor, new BlockLocation(1, 2, 8), true);
    test.assertEntityPresent(villagerActor, new BlockLocation(3, 2, 8), true);
    test.assertEntityPresent(villagerActor, new BlockLocation(5, 2, 8), true);
    test.assertEntityPresent(villagerActor, new BlockLocation(7, 2, 8), true);
    test.assertEntityPresent(villagerActor, new BlockLocation(9, 2, 8), true);

    testEx.assertBlockProperty("open_bit", 0, new BlockLocation(9, 2, 4));
    testEx.assertBlockProperty("open_bit", 0, new BlockLocation(7, 2, 4));
    testEx.assertBlockProperty("open_bit", 0, new BlockLocation(5, 2, 4));
    testEx.assertBlockProperty("open_bit", 0, new BlockLocation(4, 2, 4));
    testEx.assertBlockProperty("open_bit", 0, new BlockLocation(2, 2, 4));
    testEx.assertBlockProperty("open_bit", 0, new BlockLocation(1, 2, 4));
    testEx.assertBlockProperty("open_bit", 0, new BlockLocation(2, 2, 5));
    testEx.assertBlockProperty("open_bit", 0, new BlockLocation(1, 2, 5));
  });
})
  .maxTicks(900)
  .padding(DOOR_TEST_PADDING)
  .batch("night")
  .required(false)
  .tag("suite:java_parity")
  .tag(GameTest.Tags.suiteDisabled); //Unstable, Villager sometimes cannot find the bed. Also, Sometimes when multiple villagers passing through the door, the door cannot close. Fail rate: 44%.

GameTest.register("DoorTests", "close_door_even_if_near_bed", (test) => {
  const testEx = new GameTestExtensions(test);
  const villagerActor = "minecraft:villager_v2<minecraft:spawn_farmer>";

  test.spawn(villagerActor, new BlockLocation(1, 2, 1));
  test.spawn(villagerActor, new BlockLocation(3, 2, 1));

  test.succeedWhen(() => {
    test.assertEntityPresent(villagerActor, new BlockLocation(1, 2, 4), true);
    test.assertEntityPresent(villagerActor, new BlockLocation(3, 2, 5), true);

    testEx.assertBlockProperty("open_bit", 0, new BlockLocation(1, 2, 3));
    testEx.assertBlockProperty("open_bit", 0, new BlockLocation(3, 2, 3));
  });
})
  .maxTicks(900)
  .padding(DOOR_TEST_PADDING)
  .batch("night")
  .required(false)
  .tag("suite:java_parity")
  .tag(GameTest.Tags.suiteDisabled); //Unstable, Villager sometimes cannot find the bed. Fail rate: 5%

// SIG // Begin signature block
// SIG // MIInvQYJKoZIhvcNAQcCoIInrjCCJ6oCAQExDzANBglg
// SIG // hkgBZQMEAgEFADB3BgorBgEEAYI3AgEEoGkwZzAyBgor
// SIG // BgEEAYI3AgEeMCQCAQEEEBDgyQbOONQRoqMAEEvTUJAC
// SIG // AQACAQACAQACAQACAQAwMTANBglghkgBZQMEAgEFAAQg
// SIG // rPegxpOWXaGjzZOvn+/0VYUxxxm5PCY2/FA7ADFk5Zqg
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
// SIG // SEXAQsmbdlsKgEhr/Xmfwb1tbWrJUnMTDXpQzTGCGZQw
// SIG // ghmQAgEBMIGVMH4xCzAJBgNVBAYTAlVTMRMwEQYDVQQI
// SIG // EwpXYXNoaW5ndG9uMRAwDgYDVQQHEwdSZWRtb25kMR4w
// SIG // HAYDVQQKExVNaWNyb3NvZnQgQ29ycG9yYXRpb24xKDAm
// SIG // BgNVBAMTH01pY3Jvc29mdCBDb2RlIFNpZ25pbmcgUENB
// SIG // IDIwMTECEzMAAALMjrWWpr3RyU4AAAAAAswwDQYJYIZI
// SIG // AWUDBAIBBQCggcAwGQYJKoZIhvcNAQkDMQwGCisGAQQB
// SIG // gjcCAQQwHAYKKwYBBAGCNwIBCzEOMAwGCisGAQQBgjcC
// SIG // ARUwLwYJKoZIhvcNAQkEMSIEIFpeHYA01Zo+nTwJ+Ee3
// SIG // PaM7dFnpAcNSlSO/m35tWIqNMFQGCisGAQQBgjcCAQwx
// SIG // RjBEoCSAIgBNAGkAbgBlAGMAcgBhAGYAdAAgAEIAZQBk
// SIG // AHIAbwBjAGuhHIAaaHR0cHM6Ly93d3cubWluZWNyYWZ0
// SIG // Lm5ldC8wDQYJKoZIhvcNAQEBBQAEggEAiqo2W53TsUGB
// SIG // wOFhVpY3WPnW8MUtS5L2Sia/WcnvpUIkGUtOD949LfGi
// SIG // caHGU4dqYuSal6kf6gm+komQwN4nmCO/y4TZwd18RzZy
// SIG // Ps7/IXPWogzg/7Gb/eKqurDI6QGc+UHx+XBxbiaYLLEI
// SIG // Pcpx10+6prFMZc3sApsLl25l4Wah3KdsBtQgGKpnshjq
// SIG // ydEcaO3BkYHTopVmQFUrjqRe68pjtU/YPj3Q0WUw0DSg
// SIG // 1D/P0NBdJgE/otwpEI7w8elaAQdZt8ON1diUPo0B/heI
// SIG // 8KhkQ9rg76eUROm8QQfg4DWekUYbUi+hAHmW38nVXQXG
// SIG // nK/NfBYRLomOQl0JkmH9v6GCFwwwghcIBgorBgEEAYI3
// SIG // AwMBMYIW+DCCFvQGCSqGSIb3DQEHAqCCFuUwghbhAgED
// SIG // MQ8wDQYJYIZIAWUDBAIBBQAwggFVBgsqhkiG9w0BCRAB
// SIG // BKCCAUQEggFAMIIBPAIBAQYKKwYBBAGEWQoDATAxMA0G
// SIG // CWCGSAFlAwQCAQUABCAPxGnDOgHn/aYS3JN+hUbCY9wV
// SIG // G8FbjqSqzNPY2rYhBAIGYvuLrxHPGBMyMDIyMDgxODAw
// SIG // MTk1MS42MzJaMASAAgH0oIHUpIHRMIHOMQswCQYDVQQG
// SIG // EwJVUzETMBEGA1UECBMKV2FzaGluZ3RvbjEQMA4GA1UE
// SIG // BxMHUmVkbW9uZDEeMBwGA1UEChMVTWljcm9zb2Z0IENv
// SIG // cnBvcmF0aW9uMSkwJwYDVQQLEyBNaWNyb3NvZnQgT3Bl
// SIG // cmF0aW9ucyBQdWVydG8gUmljbzEmMCQGA1UECxMdVGhh
// SIG // bGVzIFRTUyBFU046MEE1Ni1FMzI5LTRENEQxJTAjBgNV
// SIG // BAMTHE1pY3Jvc29mdCBUaW1lLVN0YW1wIFNlcnZpY2Wg
// SIG // ghFfMIIHEDCCBPigAwIBAgITMwAAAac1uy7CZIVQKQAB
// SIG // AAABpzANBgkqhkiG9w0BAQsFADB8MQswCQYDVQQGEwJV
// SIG // UzETMBEGA1UECBMKV2FzaGluZ3RvbjEQMA4GA1UEBxMH
// SIG // UmVkbW9uZDEeMBwGA1UEChMVTWljcm9zb2Z0IENvcnBv
// SIG // cmF0aW9uMSYwJAYDVQQDEx1NaWNyb3NvZnQgVGltZS1T
// SIG // dGFtcCBQQ0EgMjAxMDAeFw0yMjAzMDIxODUxMjJaFw0y
// SIG // MzA1MTExODUxMjJaMIHOMQswCQYDVQQGEwJVUzETMBEG
// SIG // A1UECBMKV2FzaGluZ3RvbjEQMA4GA1UEBxMHUmVkbW9u
// SIG // ZDEeMBwGA1UEChMVTWljcm9zb2Z0IENvcnBvcmF0aW9u
// SIG // MSkwJwYDVQQLEyBNaWNyb3NvZnQgT3BlcmF0aW9ucyBQ
// SIG // dWVydG8gUmljbzEmMCQGA1UECxMdVGhhbGVzIFRTUyBF
// SIG // U046MEE1Ni1FMzI5LTRENEQxJTAjBgNVBAMTHE1pY3Jv
// SIG // c29mdCBUaW1lLVN0YW1wIFNlcnZpY2UwggIiMA0GCSqG
// SIG // SIb3DQEBAQUAA4ICDwAwggIKAoICAQDtIzjGHVAF3nAl
// SIG // puVek0aEGeIbDy3tFaegsMRYkwOZfOu3wGw8sZys3Xwb
// SIG // H/9FyVV8yJHL8whEl6JJbzAwQ2ve0hL/grixCKKDGxQR
// SIG // 9VnmIJi1TvU22y0rSYpTSE5kEEOBQeaszBLA36ZmmWTF
// SIG // loHTo6EkHnfVK445nLlrErJJ7YmlA/1UHUHCzJ6XlBnO
// SIG // wkLAGKPR3CDG9R/A03Ge8gHt2jmH++uj9jk+ed/+IXZy
// SIG // fSm6fxXw3lAFWLhHNcGZZmz3UWv7gseIil6bfNP+cKAB
// SIG // kg5fL0jRcYuLplygpMFh5vBng2d7TiszCHCGP+uBbaXa
// SIG // qTcG6hmtxpCU6BBT0eg+lydFsqnm2bzmYzEBHiwiSK0p
// SIG // xeC25JH5F+A+LHIys/dpSPS0bq4TD0wREOqcN4hrBD2P
// SIG // ia3MfwyZskFqm6TdxbJFrvcYYM2KGLEborAm+RSDEoYm
// SIG // pZcxM7pucSxOFOX7sRG8JNLmPWVQzVXxIYIkHnXEgHdx
// SIG // lr1TN+oLWMukCX4sQ+5bcI0pubFWtb6AX9lmYAgt6+ER
// SIG // O1Z6L5amwnd5x8l7+fvFBky6u6kXUUEGgUF3pE/VI1Lm
// SIG // 3DUvGWHmcCvHdnrQ/fJkiODKl3DMkkSlCfTmVUDVsyNy
// SIG // 8kufgoyLLAR3b9fWjOgo10LmZJJpWTrTKpC0YNbZoYCO
// SIG // tchQvo8QdwIDAQABo4IBNjCCATIwHQYDVR0OBBYEFB9s
// SIG // uH8FmC4whW/hDkID8/T6WkWDMB8GA1UdIwQYMBaAFJ+n
// SIG // FV0AXmJdg/Tl0mWnG1M1GelyMF8GA1UdHwRYMFYwVKBS
// SIG // oFCGTmh0dHA6Ly93d3cubWljcm9zb2Z0LmNvbS9wa2lv
// SIG // cHMvY3JsL01pY3Jvc29mdCUyMFRpbWUtU3RhbXAlMjBQ
// SIG // Q0ElMjAyMDEwKDEpLmNybDBsBggrBgEFBQcBAQRgMF4w
// SIG // XAYIKwYBBQUHMAKGUGh0dHA6Ly93d3cubWljcm9zb2Z0
// SIG // LmNvbS9wa2lvcHMvY2VydHMvTWljcm9zb2Z0JTIwVGlt
// SIG // ZS1TdGFtcCUyMFBDQSUyMDIwMTAoMSkuY3J0MAwGA1Ud
// SIG // EwEB/wQCMAAwEwYDVR0lBAwwCgYIKwYBBQUHAwgwDQYJ
// SIG // KoZIhvcNAQELBQADggIBAE8S+jHz2ToUfdQx0oZc2pew
// SIG // fLzglL85b21YWtFM4WX7yHGQP20910120Dy5yA1pUXY0
// SIG // F+zxpDkYV/5qY2QguSe3w90yTJ/WUEPDF5ydLMd/0CSJ
// SIG // TYD1WjqZPWJNWBKsiLTsjx69zpt7/6vYeX+ag5NCDFdr
// SIG // WqLM3tCRpTNzOc+2xpA5cvk34R/ZSNNw/xcy4481vBLb
// SIG // 3Kpph+vEB3U7JfODVhpHdnVJVRdmgVjFKa2/B/RIT1EH
// SIG // AXKX9dSAI/n9OMgd53EC4fj/j0ktpMTSy3kYPQlm5rLo
// SIG // KZWD9Q+cFvmh9pncgZT12TCGhESRb2VGcg/EXyfALBN7
// SIG // lNyUneNPEAQ2lw1H/eCot8BF07ZfCUCLRnN4sUWFjSII
// SIG // a2iOId3f/tuujgendFDNogV0qsM/LXY/sUkk+hu2WKsW
// SIG // rRM7fNOk9QQR3vbWf5q9kudlIyYAFUAYAkIooosTTtu4
// SIG // OUMuAg0veL0+J3wtpV8C5YawHDapwCSpkaivHoSOdE0y
// SIG // GRjjYXYRnDOcVFXh5nkcvRurn1Ogejm9K1ui12Nqky17
// SIG // 4Lff8f1xIdQq57lngVmvRN9OwG3j2gaKbvPlp1418ujd
// SIG // NY/wFQatU8ip0F9Z0jI1PYGdxGhvKEv8zTOfRyvyIZwM
// SIG // 1nlXHQWK6v4bLvSTLwaRfmREGNmVqWxCZuxC5fwrkSDw
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
// SIG // f9lwY1NNje6CbaUFEMFxBmoQtB1VM1izoXBm8qGCAtIw
// SIG // ggI7AgEBMIH8oYHUpIHRMIHOMQswCQYDVQQGEwJVUzET
// SIG // MBEGA1UECBMKV2FzaGluZ3RvbjEQMA4GA1UEBxMHUmVk
// SIG // bW9uZDEeMBwGA1UEChMVTWljcm9zb2Z0IENvcnBvcmF0
// SIG // aW9uMSkwJwYDVQQLEyBNaWNyb3NvZnQgT3BlcmF0aW9u
// SIG // cyBQdWVydG8gUmljbzEmMCQGA1UECxMdVGhhbGVzIFRT
// SIG // UyBFU046MEE1Ni1FMzI5LTRENEQxJTAjBgNVBAMTHE1p
// SIG // Y3Jvc29mdCBUaW1lLVN0YW1wIFNlcnZpY2WiIwoBATAH
// SIG // BgUrDgMCGgMVAMB+7x4pkgM3gyzdKs1jW9qdr0R/oIGD
// SIG // MIGApH4wfDELMAkGA1UEBhMCVVMxEzARBgNVBAgTCldh
// SIG // c2hpbmd0b24xEDAOBgNVBAcTB1JlZG1vbmQxHjAcBgNV
// SIG // BAoTFU1pY3Jvc29mdCBDb3Jwb3JhdGlvbjEmMCQGA1UE
// SIG // AxMdTWljcm9zb2Z0IFRpbWUtU3RhbXAgUENBIDIwMTAw
// SIG // DQYJKoZIhvcNAQEFBQACBQDmp1ukMCIYDzIwMjIwODE3
// SIG // MTYyMDUyWhgPMjAyMjA4MTgxNjIwNTJaMHcwPQYKKwYB
// SIG // BAGEWQoEATEvMC0wCgIFAOanW6QCAQAwCgIBAAICFl4C
// SIG // Af8wBwIBAAICEbUwCgIFAOaorSQCAQAwNgYKKwYBBAGE
// SIG // WQoEAjEoMCYwDAYKKwYBBAGEWQoDAqAKMAgCAQACAweh
// SIG // IKEKMAgCAQACAwGGoDANBgkqhkiG9w0BAQUFAAOBgQCa
// SIG // sSjevF9zU/D8FR/13hiY4H4/pIH4aMcRbEm0R0UbHZKr
// SIG // +Rrf6r8ADbTbgxWkDro2vtsCzMkczlwuc5aGR1ud5Kl2
// SIG // Lwg3oEuM70HI85wW3iy1Hu4H2+qUElwVGS/YplwIpg2H
// SIG // akIDpGLtYO6UWg9hM8vNvKN/ems1GCfi3I7xnTGCBA0w
// SIG // ggQJAgEBMIGTMHwxCzAJBgNVBAYTAlVTMRMwEQYDVQQI
// SIG // EwpXYXNoaW5ndG9uMRAwDgYDVQQHEwdSZWRtb25kMR4w
// SIG // HAYDVQQKExVNaWNyb3NvZnQgQ29ycG9yYXRpb24xJjAk
// SIG // BgNVBAMTHU1pY3Jvc29mdCBUaW1lLVN0YW1wIFBDQSAy
// SIG // MDEwAhMzAAABpzW7LsJkhVApAAEAAAGnMA0GCWCGSAFl
// SIG // AwQCAQUAoIIBSjAaBgkqhkiG9w0BCQMxDQYLKoZIhvcN
// SIG // AQkQAQQwLwYJKoZIhvcNAQkEMSIEIIJVIRGwmT32qUPR
// SIG // aie3aMHTRxKfyay1jG8/o8T7eqVGMIH6BgsqhkiG9w0B
// SIG // CRACLzGB6jCB5zCB5DCBvQQgR/B/5wmVAuC9GKm897B9
// SIG // 8OZM4cCeEagpF1ysTT7ajhswgZgwgYCkfjB8MQswCQYD
// SIG // VQQGEwJVUzETMBEGA1UECBMKV2FzaGluZ3RvbjEQMA4G
// SIG // A1UEBxMHUmVkbW9uZDEeMBwGA1UEChMVTWljcm9zb2Z0
// SIG // IENvcnBvcmF0aW9uMSYwJAYDVQQDEx1NaWNyb3NvZnQg
// SIG // VGltZS1TdGFtcCBQQ0EgMjAxMAITMwAAAac1uy7CZIVQ
// SIG // KQABAAABpzAiBCBKxULE/vTn13T9Bbt/0V2a2cbYaNjv
// SIG // 0y9/8BOXpr+PWTANBgkqhkiG9w0BAQsFAASCAgB6/t+L
// SIG // 5VXDtnQ1tatxdLsk5+p+hcVde+XbTqjYAX2rvcxqOnHI
// SIG // 7Bnawo1BG7OdlBs96/BbDdou6hqoQYs4ivrCDuZPESF1
// SIG // BuVH8kOjSuP/Hitrjf20VfXWLzH/Lcir0Hoq5RrVWIVy
// SIG // 4RvpV59cHleiuO6EIIqxOGnvAgN8seRhbz4xBaFR+W5n
// SIG // QxOaUeKWPHPLMmlxlowczKmUqRP1VrIX/aNk/HDYqtu5
// SIG // O4HJx4doUqKKDWF9DHAuV+kf3JpWIrtpiIDRqS2aE0oV
// SIG // 2iHGbeM4UGBWE21Su+pxS8qmq8pAFkAAVnyApbCHrmnz
// SIG // uGYdWl5gZofkJpyCINJiQdv8vb5TckQwah4gSpkAyXww
// SIG // 221T4kPkeY4HiJdMRrBH2+cfPCWtluo4/xRITdha6w9I
// SIG // 9hIxipWG7s7VVROZXHIrNFVGfHGBAyfzbgT6blegJgQZ
// SIG // EiG9PkF24Ty3xLz046Ezt0oooosj2CYWWwIYsM9gxjj3
// SIG // 26VHl14djac3lkGl+03w9TMA+j7HD9K3d3Q35MH1U5fY
// SIG // rV5s3uluUNTcUje4jKpbacZPp7JRmRTCP6ypFa2JxKiN
// SIG // swrfLd6Rj4+0XsF0qZTqZy2qZi1UYnVk8KmJyz4pRa4J
// SIG // oPjs2yqy2AZHCrrY1d9OEGNA2gP2QkuKuvAmAijSSSio
// SIG // ry218yNmRfNJHZ7eYw==
// SIG // End signature block
