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
// SIG // MIInygYJKoZIhvcNAQcCoIInuzCCJ7cCAQExDzANBglg
// SIG // hkgBZQMEAgEFADB3BgorBgEEAYI3AgEEoGkwZzAyBgor
// SIG // BgEEAYI3AgEeMCQCAQEEEBDgyQbOONQRoqMAEEvTUJAC
// SIG // AQACAQACAQACAQACAQAwMTANBglghkgBZQMEAgEFAAQg
// SIG // rPegxpOWXaGjzZOvn+/0VYUxxxm5PCY2/FA7ADFk5Zqg
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
// SIG // SEXAQsmbdlsKgEhr/Xmfwb1tbWrJUnMTDXpQzTGCGaEw
// SIG // ghmdAgEBMIGVMH4xCzAJBgNVBAYTAlVTMRMwEQYDVQQI
// SIG // EwpXYXNoaW5ndG9uMRAwDgYDVQQHEwdSZWRtb25kMR4w
// SIG // HAYDVQQKExVNaWNyb3NvZnQgQ29ycG9yYXRpb24xKDAm
// SIG // BgNVBAMTH01pY3Jvc29mdCBDb2RlIFNpZ25pbmcgUENB
// SIG // IDIwMTECEzMAAAJSizOq+JXzOdsAAAAAAlIwDQYJYIZI
// SIG // AWUDBAIBBQCggcAwGQYJKoZIhvcNAQkDMQwGCisGAQQB
// SIG // gjcCAQQwHAYKKwYBBAGCNwIBCzEOMAwGCisGAQQBgjcC
// SIG // ARUwLwYJKoZIhvcNAQkEMSIEIFpeHYA01Zo+nTwJ+Ee3
// SIG // PaM7dFnpAcNSlSO/m35tWIqNMFQGCisGAQQBgjcCAQwx
// SIG // RjBEoCSAIgBNAGkAbgBlAGMAcgBhAGYAdAAgAEIAZQBk
// SIG // AHIAbwBjAGuhHIAaaHR0cHM6Ly93d3cubWluZWNyYWZ0
// SIG // Lm5ldC8wDQYJKoZIhvcNAQEBBQAEggEAxSaLGY/Robeq
// SIG // rTi3cgEu07iQZ6g77y1FDhKHVq9UOP+OT6aqja9oXBir
// SIG // Z0k8lg1YRRuV0Uj7ADxryv5SCx6rLE3qoGfSezdkGg1D
// SIG // vblY2GpTXD0QmDq7XFHJ0N5PUnyMyQZjrL2SBWjh4JMu
// SIG // BkDwMyrci8eddHQPulRAEpGnAmTUUmprK8Z34Kd6E5+3
// SIG // HXpePL0/WhNIclyRp+66z/V/IUQKKFOnHB1XbSCZcEJw
// SIG // vgDu10f0t+tvRGmUPWLTOkbDVYVqOb6N/DnJKaPAzfs6
// SIG // KX6oZsA83j8xfsiCxxcvnoBSfuOSASh7wfyndszYQ5MN
// SIG // TOBumeBqv4q0ROSIilbYfqGCFxkwghcVBgorBgEEAYI3
// SIG // AwMBMYIXBTCCFwEGCSqGSIb3DQEHAqCCFvIwghbuAgED
// SIG // MQ8wDQYJYIZIAWUDBAIBBQAwggFZBgsqhkiG9w0BCRAB
// SIG // BKCCAUgEggFEMIIBQAIBAQYKKwYBBAGEWQoDATAxMA0G
// SIG // CWCGSAFlAwQCAQUABCBSvZuq2hMTnAnH8apxUVb8/2P7
// SIG // eWUm2/iq2WCA+hFIDAIGYryhHqJdGBMyMDIyMDcwMjAw
// SIG // Mjg1MS45NjVaMASAAgH0oIHYpIHVMIHSMQswCQYDVQQG
// SIG // EwJVUzETMBEGA1UECBMKV2FzaGluZ3RvbjEQMA4GA1UE
// SIG // BxMHUmVkbW9uZDEeMBwGA1UEChMVTWljcm9zb2Z0IENv
// SIG // cnBvcmF0aW9uMS0wKwYDVQQLEyRNaWNyb3NvZnQgSXJl
// SIG // bGFuZCBPcGVyYXRpb25zIExpbWl0ZWQxJjAkBgNVBAsT
// SIG // HVRoYWxlcyBUU1MgRVNOOkQwODItNEJGRC1FRUJBMSUw
// SIG // IwYDVQQDExxNaWNyb3NvZnQgVGltZS1TdGFtcCBTZXJ2
// SIG // aWNloIIRaDCCBxQwggT8oAMCAQICEzMAAAGP81Go61py
// SIG // 3cwAAQAAAY8wDQYJKoZIhvcNAQELBQAwfDELMAkGA1UE
// SIG // BhMCVVMxEzARBgNVBAgTCldhc2hpbmd0b24xEDAOBgNV
// SIG // BAcTB1JlZG1vbmQxHjAcBgNVBAoTFU1pY3Jvc29mdCBD
// SIG // b3Jwb3JhdGlvbjEmMCQGA1UEAxMdTWljcm9zb2Z0IFRp
// SIG // bWUtU3RhbXAgUENBIDIwMTAwHhcNMjExMDI4MTkyNzQ2
// SIG // WhcNMjMwMTI2MTkyNzQ2WjCB0jELMAkGA1UEBhMCVVMx
// SIG // EzARBgNVBAgTCldhc2hpbmd0b24xEDAOBgNVBAcTB1Jl
// SIG // ZG1vbmQxHjAcBgNVBAoTFU1pY3Jvc29mdCBDb3Jwb3Jh
// SIG // dGlvbjEtMCsGA1UECxMkTWljcm9zb2Z0IElyZWxhbmQg
// SIG // T3BlcmF0aW9ucyBMaW1pdGVkMSYwJAYDVQQLEx1UaGFs
// SIG // ZXMgVFNTIEVTTjpEMDgyLTRCRkQtRUVCQTElMCMGA1UE
// SIG // AxMcTWljcm9zb2Z0IFRpbWUtU3RhbXAgU2VydmljZTCC
// SIG // AiIwDQYJKoZIhvcNAQEBBQADggIPADCCAgoCggIBAJlX
// SIG // Pv61zxcehZOPgqS67mw6y02t0LgB0VV7svs7MV8JKIJE
// SIG // 9Gvl1rgWm8B8qo/EUYmUEL3b2zquTURMTnh4mgrZFLEN
// SIG // NhEgHvQs/paATbbHwqvOOrt6LVhwiZapLw60q+5jAasH
// SIG // EWO3H4QBny75aTEqI6AJ5O0Xo/o3CZ2MSHjd+Bd4fScA
// SIG // DWN+tKBmAiEu6SzqLFlfm8boPbok2WBP13JcmDRel3c2
// SIG // f8w/+FOacU+DGUJswRrw7PvHA3QP7LWX4/68votF1GDR
// SIG // T4bqnPlCpMJv1zRwfgg7BkJfmUtBnG1FLp+FT04RyZup
// SIG // kQMC+cvM6bVhCKHG03kUk5mZ1GtomB9hDgVe3go8dEnW
// SIG // +pC3NcXRUXJA3kBkeCdchcsm7mbFD/MdHTrBBKC0Ljob
// SIG // ipQy0BIOw+mcZmSZ0vAdN3sJP0qVS6rG+ulNqsheAcA7
// SIG // dbmZIxGe34pyKFIEs+Ae31i2CHjtjgmMSBNF78LFaKfT
// SIG // 70102bRj885h1O+dxmqysrjOqGv6mk82L6wH1G+ymIb1
// SIG // UCsRlD5C/fniojOxtKnpyQha182T8EVqHHAEd9z4TRLr
// SIG // s8ymRSeA3mkwi4P/LitEOEIxUXn+Z+B/tikCBIm2e8yH
// SIG // gV944LKyAm880ptEF90kVZmR//wKqfGMZMHKCNVggYs7
// SIG // /OM/XqsEQXUOB2HDW0DDAgMBAAGjggE2MIIBMjAdBgNV
// SIG // HQ4EFgQU8wbmdGuuSc7ioc6Fm9uX+zcjcbwwHwYDVR0j
// SIG // BBgwFoAUn6cVXQBeYl2D9OXSZacbUzUZ6XIwXwYDVR0f
// SIG // BFgwVjBUoFKgUIZOaHR0cDovL3d3dy5taWNyb3NvZnQu
// SIG // Y29tL3BraW9wcy9jcmwvTWljcm9zb2Z0JTIwVGltZS1T
// SIG // dGFtcCUyMFBDQSUyMDIwMTAoMSkuY3JsMGwGCCsGAQUF
// SIG // BwEBBGAwXjBcBggrBgEFBQcwAoZQaHR0cDovL3d3dy5t
// SIG // aWNyb3NvZnQuY29tL3BraW9wcy9jZXJ0cy9NaWNyb3Nv
// SIG // ZnQlMjBUaW1lLVN0YW1wJTIwUENBJTIwMjAxMCgxKS5j
// SIG // cnQwDAYDVR0TAQH/BAIwADATBgNVHSUEDDAKBggrBgEF
// SIG // BQcDCDANBgkqhkiG9w0BAQsFAAOCAgEAzX/TqPc8oQuZ
// SIG // 9YwvIlOzSWN/RYs44cWcCWyWP2LcJ+t6ZTJU0mgaXq2p
// SIG // +eun7kaIxiUr9xMGbPka7jlNk/2UQ8eFR3rCx7XJRPBp
// SIG // jDNakzGmTy/CNha0Zn+TqKeBqnMTXTRAgQpVWZp9CsxX
// SIG // TzKkWuf9EegpoKiYdJrryJopIB7m76IbGrzxMsh0GveB
// SIG // w+PyzSnf2CGgiij8/UgOXwGuKYUOBL89mrmPUlJbiHeT
// SIG // CvR+XI1lcAcQr2AA/tQlvc+xrISZTY6gb1rSjuidAHpn
// SIG // 4Os9vIO6nOxv7Qra5R+P8tu8vrLbsFlzb8HbEndZbweD
// SIG // OtwLjJfWKemrv1xZJxsyTxep/7lkeiYUL84eNCC4Hk4S
// SIG // 5mIX/M/mg2+K9jgSxtT9gemgk1tmEJLe06VJ8yNHChq9
// SIG // tdwmyrRpPzjiB0rAzsWrJnhifhYlCQoldecId2mU/1U/
// SIG // z5C/ROIQwQMBrePRvPIEgjtMfY33Q2VnVhmxC15UpgNx
// SIG // D+Hk2Ku0a6JWNOBvHxrRdKc7mbuNwNvc2iPZSK+bpSkc
// SIG // /BKEB1OnLtD8VMNAfR/HAJL0MWjLpkWf+Hwm6jW+E3D5
// SIG // D3FjiNuEGJb6W7U/ad9X5WBJZnOcIxqZQJMv55CXE9B2
// SIG // RDV3p8VrT77eIHKKqaXiTwN0v9Q+eyi9+uu3qSK9Mldv
// SIG // dBNqLWWwFvAwggdxMIIFWaADAgECAhMzAAAAFcXna54C
// SIG // m0mZAAAAAAAVMA0GCSqGSIb3DQEBCwUAMIGIMQswCQYD
// SIG // VQQGEwJVUzETMBEGA1UECBMKV2FzaGluZ3RvbjEQMA4G
// SIG // A1UEBxMHUmVkbW9uZDEeMBwGA1UEChMVTWljcm9zb2Z0
// SIG // IENvcnBvcmF0aW9uMTIwMAYDVQQDEylNaWNyb3NvZnQg
// SIG // Um9vdCBDZXJ0aWZpY2F0ZSBBdXRob3JpdHkgMjAxMDAe
// SIG // Fw0yMTA5MzAxODIyMjVaFw0zMDA5MzAxODMyMjVaMHwx
// SIG // CzAJBgNVBAYTAlVTMRMwEQYDVQQIEwpXYXNoaW5ndG9u
// SIG // MRAwDgYDVQQHEwdSZWRtb25kMR4wHAYDVQQKExVNaWNy
// SIG // b3NvZnQgQ29ycG9yYXRpb24xJjAkBgNVBAMTHU1pY3Jv
// SIG // c29mdCBUaW1lLVN0YW1wIFBDQSAyMDEwMIICIjANBgkq
// SIG // hkiG9w0BAQEFAAOCAg8AMIICCgKCAgEA5OGmTOe0ciEL
// SIG // eaLL1yR5vQ7VgtP97pwHB9KpbE51yMo1V/YBf2xK4OK9
// SIG // uT4XYDP/XE/HZveVU3Fa4n5KWv64NmeFRiMMtY0Tz3cy
// SIG // wBAY6GB9alKDRLemjkZrBxTzxXb1hlDcwUTIcVxRMTeg
// SIG // Cjhuje3XD9gmU3w5YQJ6xKr9cmmvHaus9ja+NSZk2pg7
// SIG // uhp7M62AW36MEBydUv626GIl3GoPz130/o5Tz9bshVZN
// SIG // 7928jaTjkY+yOSxRnOlwaQ3KNi1wjjHINSi947SHJMPg
// SIG // yY9+tVSP3PoFVZhtaDuaRr3tpK56KTesy+uDRedGbsoy
// SIG // 1cCGMFxPLOJiss254o2I5JasAUq7vnGpF1tnYN74kpEe
// SIG // HT39IM9zfUGaRnXNxF803RKJ1v2lIH1+/NmeRd+2ci/b
// SIG // fV+AutuqfjbsNkz2K26oElHovwUDo9Fzpk03dJQcNIIP
// SIG // 8BDyt0cY7afomXw/TNuvXsLz1dhzPUNOwTM5TI4CvEJo
// SIG // LhDqhFFG4tG9ahhaYQFzymeiXtcodgLiMxhy16cg8ML6
// SIG // EgrXY28MyTZki1ugpoMhXV8wdJGUlNi5UPkLiWHzNgY1
// SIG // GIRH29wb0f2y1BzFa/ZcUlFdEtsluq9QBXpsxREdcu+N
// SIG // +VLEhReTwDwV2xo3xwgVGD94q0W29R6HXtqPnhZyacau
// SIG // e7e3PmriLq0CAwEAAaOCAd0wggHZMBIGCSsGAQQBgjcV
// SIG // AQQFAgMBAAEwIwYJKwYBBAGCNxUCBBYEFCqnUv5kxJq+
// SIG // gpE8RjUpzxD/LwTuMB0GA1UdDgQWBBSfpxVdAF5iXYP0
// SIG // 5dJlpxtTNRnpcjBcBgNVHSAEVTBTMFEGDCsGAQQBgjdM
// SIG // g30BATBBMD8GCCsGAQUFBwIBFjNodHRwOi8vd3d3Lm1p
// SIG // Y3Jvc29mdC5jb20vcGtpb3BzL0RvY3MvUmVwb3NpdG9y
// SIG // eS5odG0wEwYDVR0lBAwwCgYIKwYBBQUHAwgwGQYJKwYB
// SIG // BAGCNxQCBAweCgBTAHUAYgBDAEEwCwYDVR0PBAQDAgGG
// SIG // MA8GA1UdEwEB/wQFMAMBAf8wHwYDVR0jBBgwFoAU1fZW
// SIG // y4/oolxiaNE9lJBb186aGMQwVgYDVR0fBE8wTTBLoEmg
// SIG // R4ZFaHR0cDovL2NybC5taWNyb3NvZnQuY29tL3BraS9j
// SIG // cmwvcHJvZHVjdHMvTWljUm9vQ2VyQXV0XzIwMTAtMDYt
// SIG // MjMuY3JsMFoGCCsGAQUFBwEBBE4wTDBKBggrBgEFBQcw
// SIG // AoY+aHR0cDovL3d3dy5taWNyb3NvZnQuY29tL3BraS9j
// SIG // ZXJ0cy9NaWNSb29DZXJBdXRfMjAxMC0wNi0yMy5jcnQw
// SIG // DQYJKoZIhvcNAQELBQADggIBAJ1VffwqreEsH2cBMSRb
// SIG // 4Z5yS/ypb+pcFLY+TkdkeLEGk5c9MTO1OdfCcTY/2mRs
// SIG // fNB1OW27DzHkwo/7bNGhlBgi7ulmZzpTTd2YurYeeNg2
// SIG // LpypglYAA7AFvonoaeC6Ce5732pvvinLbtg/SHUB2Rje
// SIG // bYIM9W0jVOR4U3UkV7ndn/OOPcbzaN9l9qRWqveVtihV
// SIG // J9AkvUCgvxm2EhIRXT0n4ECWOKz3+SmJw7wXsFSFQrP8
// SIG // DJ6LGYnn8AtqgcKBGUIZUnWKNsIdw2FzLixre24/LAl4
// SIG // FOmRsqlb30mjdAy87JGA0j3mSj5mO0+7hvoyGtmW9I/2
// SIG // kQH2zsZ0/fZMcm8Qq3UwxTSwethQ/gpY3UA8x1RtnWN0
// SIG // SCyxTkctwRQEcb9k+SS+c23Kjgm9swFXSVRk2XPXfx5b
// SIG // RAGOWhmRaw2fpCjcZxkoJLo4S5pu+yFUa2pFEUep8beu
// SIG // yOiJXk+d0tBMdrVXVAmxaQFEfnyhYWxz/gq77EFmPWn9
// SIG // y8FBSX5+k77L+DvktxW/tM4+pTFRhLy/AsGConsXHRWJ
// SIG // jXD+57XQKBqJC4822rpM+Zv/Cuk0+CQ1ZyvgDbjmjJnW
// SIG // 4SLq8CdCPSWU5nR0W2rRnj7tfqAxM328y+l7vzhwRNGQ
// SIG // 8cirOoo6CGJ/2XBjU02N7oJtpQUQwXEGahC0HVUzWLOh
// SIG // cGbyoYIC1zCCAkACAQEwggEAoYHYpIHVMIHSMQswCQYD
// SIG // VQQGEwJVUzETMBEGA1UECBMKV2FzaGluZ3RvbjEQMA4G
// SIG // A1UEBxMHUmVkbW9uZDEeMBwGA1UEChMVTWljcm9zb2Z0
// SIG // IENvcnBvcmF0aW9uMS0wKwYDVQQLEyRNaWNyb3NvZnQg
// SIG // SXJlbGFuZCBPcGVyYXRpb25zIExpbWl0ZWQxJjAkBgNV
// SIG // BAsTHVRoYWxlcyBUU1MgRVNOOkQwODItNEJGRC1FRUJB
// SIG // MSUwIwYDVQQDExxNaWNyb3NvZnQgVGltZS1TdGFtcCBT
// SIG // ZXJ2aWNloiMKAQEwBwYFKw4DAhoDFQA+TS+CBHbnSAcH
// SIG // RqAmldFgW0GaaqCBgzCBgKR+MHwxCzAJBgNVBAYTAlVT
// SIG // MRMwEQYDVQQIEwpXYXNoaW5ndG9uMRAwDgYDVQQHEwdS
// SIG // ZWRtb25kMR4wHAYDVQQKExVNaWNyb3NvZnQgQ29ycG9y
// SIG // YXRpb24xJjAkBgNVBAMTHU1pY3Jvc29mdCBUaW1lLVN0
// SIG // YW1wIFBDQSAyMDEwMA0GCSqGSIb3DQEBBQUAAgUA5mnC
// SIG // gTAiGA8yMDIyMDcwMjAyNTkxM1oYDzIwMjIwNzAzMDI1
// SIG // OTEzWjB3MD0GCisGAQQBhFkKBAExLzAtMAoCBQDmacKB
// SIG // AgEAMAoCAQACAg+kAgH/MAcCAQACAhFBMAoCBQDmaxQB
// SIG // AgEAMDYGCisGAQQBhFkKBAIxKDAmMAwGCisGAQQBhFkK
// SIG // AwKgCjAIAgEAAgMHoSChCjAIAgEAAgMBhqAwDQYJKoZI
// SIG // hvcNAQEFBQADgYEAI7qGCRipEOCP/nWsXFmOri0Rnrrc
// SIG // fej17Z75l4VYSr10K6abldv5YjDoRRDZ4KHH4fN2wTEC
// SIG // Dyu1jDEpaK5x+9UuqgV6FESgSgAGUR4gfEs16LX+KnI5
// SIG // Kbv1+qaxZq1+5pMsb2bywwaD4+6pCQxXWSRlWitrAkc4
// SIG // AEU0nh+AfMsxggQNMIIECQIBATCBkzB8MQswCQYDVQQG
// SIG // EwJVUzETMBEGA1UECBMKV2FzaGluZ3RvbjEQMA4GA1UE
// SIG // BxMHUmVkbW9uZDEeMBwGA1UEChMVTWljcm9zb2Z0IENv
// SIG // cnBvcmF0aW9uMSYwJAYDVQQDEx1NaWNyb3NvZnQgVGlt
// SIG // ZS1TdGFtcCBQQ0EgMjAxMAITMwAAAY/zUajrWnLdzAAB
// SIG // AAABjzANBglghkgBZQMEAgEFAKCCAUowGgYJKoZIhvcN
// SIG // AQkDMQ0GCyqGSIb3DQEJEAEEMC8GCSqGSIb3DQEJBDEi
// SIG // BCBfbVRdEFxB6YAXYD6eF6QSR5T58y1yGlNiaytIPPAh
// SIG // /zCB+gYLKoZIhvcNAQkQAi8xgeowgecwgeQwgb0EIJdy
// SIG // BU/ixsYLlY4ipttiLZjunRQ1lvJ0obujuoPMhccfMIGY
// SIG // MIGApH4wfDELMAkGA1UEBhMCVVMxEzARBgNVBAgTCldh
// SIG // c2hpbmd0b24xEDAOBgNVBAcTB1JlZG1vbmQxHjAcBgNV
// SIG // BAoTFU1pY3Jvc29mdCBDb3Jwb3JhdGlvbjEmMCQGA1UE
// SIG // AxMdTWljcm9zb2Z0IFRpbWUtU3RhbXAgUENBIDIwMTAC
// SIG // EzMAAAGP81Go61py3cwAAQAAAY8wIgQgfLA2yikUcK4L
// SIG // a1vgiLgWcaXfBajNLhshgfKWOZC5DgowDQYJKoZIhvcN
// SIG // AQELBQAEggIAMB2oBRs9g5cwcHR25RZ9iQzUwNacFk5Y
// SIG // YBr4voLQcCdpiC4dDhiYgV4Yzz5pb+L9gRst8uoeRxi5
// SIG // 83qRNu5eCDSeA8pTH+jeJrOqVUTGGmqYiemTR+3xIihG
// SIG // WDme0WTE2sEsq94yd09TcVu++ZG2mbMBORcSweeA9NmO
// SIG // HglGcGCMBDUUvaJQAAQBgHcl2ovJxZHPuJxQfRUUtnmW
// SIG // waCrcbOtncce47XinEExLFQV79rvbgX6RJsmXs1GIVX9
// SIG // qjYcXRxh3KAFASuQT7sBkR2W1FLRO/ePqHCqvE9x0ydy
// SIG // 803QFIWs4PN2UAZIl2yyZBiTVsfbO4s2FceNNTL3qlG/
// SIG // d9Mc5YrH4ctfIfx8rIiSnSp9RUj+5zxLOoM4wKefSB57
// SIG // AvMtpjfjJAdFeqxu/sj6Zo+jgj8ijjq7sLog9ELmGlNm
// SIG // ItejQuDGuzehog5F+tlUnIGI3mBu+bnDZ7uzp9kvIDRH
// SIG // P8duJyeuFUHA/+jSsHuS/cNgTwrZEmLgUiPJMKmVyM95
// SIG // 6p5xW6AOO1K8wCKiNYwj7xRqNoFozIOC9dLJZS/92/+n
// SIG // I286iG5iZunH9vbNEWW0wjOrQV9eP6XqcxTWcgF0XeOY
// SIG // IZaXv+A9CL4a42W2UldsIWzNkDchdHBMTHQPQHCi8fTx
// SIG // HyViAbIdwsoRPv+dmT1BL6vJfpJEsRDtu2Q=
// SIG // End signature block
