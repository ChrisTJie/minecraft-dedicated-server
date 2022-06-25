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
// SIG // MIInsQYJKoZIhvcNAQcCoIInojCCJ54CAQExDzANBglg
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
// SIG // SEXAQsmbdlsKgEhr/Xmfwb1tbWrJUnMTDXpQzTGCGYgw
// SIG // ghmEAgEBMIGVMH4xCzAJBgNVBAYTAlVTMRMwEQYDVQQI
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
// SIG // TOBumeBqv4q0ROSIilbYfqGCFwAwghb8BgorBgEEAYI3
// SIG // AwMBMYIW7DCCFugGCSqGSIb3DQEHAqCCFtkwghbVAgED
// SIG // MQ8wDQYJYIZIAWUDBAIBBQAwggFRBgsqhkiG9w0BCRAB
// SIG // BKCCAUAEggE8MIIBOAIBAQYKKwYBBAGEWQoDATAxMA0G
// SIG // CWCGSAFlAwQCAQUABCBSvZuq2hMTnAnH8apxUVb8/2P7
// SIG // eWUm2/iq2WCA+hFIDAIGYoIwqalbGBMyMDIyMDUyNzAw
// SIG // NTAyOS44MTFaMASAAgH0oIHQpIHNMIHKMQswCQYDVQQG
// SIG // EwJVUzETMBEGA1UECBMKV2FzaGluZ3RvbjEQMA4GA1UE
// SIG // BxMHUmVkbW9uZDEeMBwGA1UEChMVTWljcm9zb2Z0IENv
// SIG // cnBvcmF0aW9uMSUwIwYDVQQLExxNaWNyb3NvZnQgQW1l
// SIG // cmljYSBPcGVyYXRpb25zMSYwJAYDVQQLEx1UaGFsZXMg
// SIG // VFNTIEVTTjpERDhDLUUzMzctMkZBRTElMCMGA1UEAxMc
// SIG // TWljcm9zb2Z0IFRpbWUtU3RhbXAgU2VydmljZaCCEVcw
// SIG // ggcMMIIE9KADAgECAhMzAAABnA+mTWHSnksoAAEAAAGc
// SIG // MA0GCSqGSIb3DQEBCwUAMHwxCzAJBgNVBAYTAlVTMRMw
// SIG // EQYDVQQIEwpXYXNoaW5ndG9uMRAwDgYDVQQHEwdSZWRt
// SIG // b25kMR4wHAYDVQQKExVNaWNyb3NvZnQgQ29ycG9yYXRp
// SIG // b24xJjAkBgNVBAMTHU1pY3Jvc29mdCBUaW1lLVN0YW1w
// SIG // IFBDQSAyMDEwMB4XDTIxMTIwMjE5MDUxOVoXDTIzMDIy
// SIG // ODE5MDUxOVowgcoxCzAJBgNVBAYTAlVTMRMwEQYDVQQI
// SIG // EwpXYXNoaW5ndG9uMRAwDgYDVQQHEwdSZWRtb25kMR4w
// SIG // HAYDVQQKExVNaWNyb3NvZnQgQ29ycG9yYXRpb24xJTAj
// SIG // BgNVBAsTHE1pY3Jvc29mdCBBbWVyaWNhIE9wZXJhdGlv
// SIG // bnMxJjAkBgNVBAsTHVRoYWxlcyBUU1MgRVNOOkREOEMt
// SIG // RTMzNy0yRkFFMSUwIwYDVQQDExxNaWNyb3NvZnQgVGlt
// SIG // ZS1TdGFtcCBTZXJ2aWNlMIICIjANBgkqhkiG9w0BAQEF
// SIG // AAOCAg8AMIICCgKCAgEA21IqDBldSRY/rOtdrNNpirtt
// SIG // yj1DbO9Tow3iRrcZExfa0lk4rgPF4GJAAIv+fthX+wpO
// SIG // yXCkPR/1w9TisINf2x9xNajtc/F0ctD5aRoZsopYBOyr
// SIG // Dr1vDyGQn9uNynZXYDq8ay/ByokKHTsErck+ZS1mKTLL
// SIG // k9nx/JPKIoY3uE5aVohT2gii5xQ2gAdAnMuryHbR42Ad
// SIG // SHt4jmT4rKri/rzXQse4DoQfIok5k3bFPDklKQvLQU3k
// SIG // yGD85oWsUGXeJqDZOqngicou34luH8l3R62d6LZoMcWu
// SIG // aV8+aVFK/nBI1fnMCGATJGmOZBzPXOnRBpIB59GQyb3b
// SIG // f+eBTnUhutVsB4ePnr1IcL12geCwjGSHQreWnDnzb7Q4
// SIG // 1dwh8hTqeQFP6oAMBn7R1PW67+BFMHLrXhACh+OjbnxN
// SIG // tJf1o5TVIe4AL7dsyjIzuM10cQlE4f6awUMFyYlGXhUq
// SIG // xF4jn5Lr0pQZ4sgGGGaeZDp2sXwinRmI76+ECwPd70Ce
// SIG // qdjsdyB7znQj2gq/C7ClXBacqfDBIYSUzPtS8KhyahQx
// SIG // eTtWfZo22L5t0fbz4ZBvkQyyqE6a+5k4JGk5Y3fcb5ve
// SIG // Dm6fAQ/R5OJj4udZrYC4rjfP+mmVRElWV7b0rjZA+Q5y
// SIG // CUHqyMuY2kSlv1tqwnvZ4DQyWnUu0fehhkZeyCBN+5cC
// SIG // AwEAAaOCATYwggEyMB0GA1UdDgQWBBS7aQlnU12OXbXX
// SIG // ZLKcvqMYwgP6sjAfBgNVHSMEGDAWgBSfpxVdAF5iXYP0
// SIG // 5dJlpxtTNRnpcjBfBgNVHR8EWDBWMFSgUqBQhk5odHRw
// SIG // Oi8vd3d3Lm1pY3Jvc29mdC5jb20vcGtpb3BzL2NybC9N
// SIG // aWNyb3NvZnQlMjBUaW1lLVN0YW1wJTIwUENBJTIwMjAx
// SIG // MCgxKS5jcmwwbAYIKwYBBQUHAQEEYDBeMFwGCCsGAQUF
// SIG // BzAChlBodHRwOi8vd3d3Lm1pY3Jvc29mdC5jb20vcGtp
// SIG // b3BzL2NlcnRzL01pY3Jvc29mdCUyMFRpbWUtU3RhbXAl
// SIG // MjBQQ0ElMjAyMDEwKDEpLmNydDAMBgNVHRMBAf8EAjAA
// SIG // MBMGA1UdJQQMMAoGCCsGAQUFBwMIMA0GCSqGSIb3DQEB
// SIG // CwUAA4ICAQCnACqmIxhHM01jLPc9Ju2KNt7IKlRdy8iu
// SIG // oDjM+0whwCTfhb272ZEOd1ZL62VHdbBOmvU6BpXXCZzp
// SIG // gXOoroQZab3TdQSwUTvEEkw9eN91U4+FwkHe9+8DQ9fn
// SIG // qihtwXY682w5LBMHxuL+ez4Kzf0+7Oz5BI1Bl3yIBUEJ
// SIG // K/E0Ivvx2WfZEZTXHIHgAqpX2+Lhj8Z+bHYUD6MXTL5g
// SIG // t6hvQzjSeVLEvSrTvm3svqIVEw2vS7xE6HOEM8uX7h49
// SIG // h9SbJgmihu/J16X1qcASwcWWEqX5pdvaJzfI3Buyg/Jx
// SIG // kkv++jw5W9hjELL7/kWtCYC+hbRkRoGJhwqTOs1a3+Ff
// SIG // 2vkqB3AvrXHRmJNmilOSjpb/nxRN59NuFfs+eLQwCkfc
// SIG // +/K3o3QgVqn78uXAVEPXOft7pxw9PARKe6j9q4KaA/Oe
// SIG // rzQ4BMDu+5+xFk++p5fyMq2ytpI2xy81DKYRaVyp1dX2
// SIG // FiSNvhP9Cx71xRhqheDrzAUcW6yVZ9N09g8uXW+rOU8y
// SIG // c0mkLwq12KgOByr7LUFpKpKbwR01/DNPfv78kW1Vzcaz
// SIG // 3Xl8OqA9kOA5LMpAhX5/Ddo9i3YsRPcBuYopb+vXc7Lx
// SIG // yDf4PQPfrYZAEAlW/Q1Ejk2jCBoLDqg2BY4U+s3vZZIR
// SIG // xxr/xBCJMY/ZekuIalEMlnqxZGlFg13J2TCCB3EwggVZ
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
// SIG // czEmMCQGA1UECxMdVGhhbGVzIFRTUyBFU046REQ4Qy1F
// SIG // MzM3LTJGQUUxJTAjBgNVBAMTHE1pY3Jvc29mdCBUaW1l
// SIG // LVN0YW1wIFNlcnZpY2WiIwoBATAHBgUrDgMCGgMVAM3Z
// SIG // aerd8LP25xK25vXNDPvXb1NAoIGDMIGApH4wfDELMAkG
// SIG // A1UEBhMCVVMxEzARBgNVBAgTCldhc2hpbmd0b24xEDAO
// SIG // BgNVBAcTB1JlZG1vbmQxHjAcBgNVBAoTFU1pY3Jvc29m
// SIG // dCBDb3Jwb3JhdGlvbjEmMCQGA1UEAxMdTWljcm9zb2Z0
// SIG // IFRpbWUtU3RhbXAgUENBIDIwMTAwDQYJKoZIhvcNAQEF
// SIG // BQACBQDmOoaKMCIYDzIwMjIwNTI3MDcwNjUwWhgPMjAy
// SIG // MjA1MjgwNzA2NTBaMHcwPQYKKwYBBAGEWQoEATEvMC0w
// SIG // CgIFAOY6hooCAQAwCgIBAAICGWACAf8wBwIBAAICEjsw
// SIG // CgIFAOY72AoCAQAwNgYKKwYBBAGEWQoEAjEoMCYwDAYK
// SIG // KwYBBAGEWQoDAqAKMAgCAQACAwehIKEKMAgCAQACAwGG
// SIG // oDANBgkqhkiG9w0BAQUFAAOBgQBvsbNqMqL1epFaQzkh
// SIG // wDUVT0UfQv3BiQt6l9XRfRIq9lNMHpz5PU2smEz5X5DM
// SIG // dPLcjrYHhiGWVp+GCK7thXOravKuRurJdaxQhR/7r8j7
// SIG // x6YN6SaaWSm6QU3eVeUlLMB9kyXSP086eY1/h+H6X8XV
// SIG // Db2CEU/HNbh5gAIGSd7X6DGCBA0wggQJAgEBMIGTMHwx
// SIG // CzAJBgNVBAYTAlVTMRMwEQYDVQQIEwpXYXNoaW5ndG9u
// SIG // MRAwDgYDVQQHEwdSZWRtb25kMR4wHAYDVQQKExVNaWNy
// SIG // b3NvZnQgQ29ycG9yYXRpb24xJjAkBgNVBAMTHU1pY3Jv
// SIG // c29mdCBUaW1lLVN0YW1wIFBDQSAyMDEwAhMzAAABnA+m
// SIG // TWHSnksoAAEAAAGcMA0GCWCGSAFlAwQCAQUAoIIBSjAa
// SIG // BgkqhkiG9w0BCQMxDQYLKoZIhvcNAQkQAQQwLwYJKoZI
// SIG // hvcNAQkEMSIEIJCsxGNWzhPbywhmPlV9yRKy6doYhEbv
// SIG // uin6y6u9zV7WMIH6BgsqhkiG9w0BCRACLzGB6jCB5zCB
// SIG // 5DCBvQQgNw9FhSCNLMo6EXf13hCBtFlCCs87suj+oTka
// SIG // 29J6prwwgZgwgYCkfjB8MQswCQYDVQQGEwJVUzETMBEG
// SIG // A1UECBMKV2FzaGluZ3RvbjEQMA4GA1UEBxMHUmVkbW9u
// SIG // ZDEeMBwGA1UEChMVTWljcm9zb2Z0IENvcnBvcmF0aW9u
// SIG // MSYwJAYDVQQDEx1NaWNyb3NvZnQgVGltZS1TdGFtcCBQ
// SIG // Q0EgMjAxMAITMwAAAZwPpk1h0p5LKAABAAABnDAiBCAe
// SIG // J6BNm4R4H4UAdyJvy/HI+O+eOPjh1DkaxHJOasKAYTAN
// SIG // BgkqhkiG9w0BAQsFAASCAgBdEWvb/gDXbpAQBWteer/R
// SIG // 34VuaN5KurZOUtjFkLb8EEftNomXv8w/ctlZJeZ3zc7D
// SIG // YoMdBMy9Cpx4095/aXgqeu/313hEomIGEbkuyDWQe8ad
// SIG // ml5oq4pUOKiSbcS7T250tX1j1KvvioQE9kB4gh70ik9j
// SIG // 5bpR/OoZzING9CqZwV9Uk9y8tPIL+z8R0S3Sqm4njNLl
// SIG // A3CuU9RFW9OtAeO+3pIixxVR5z5FZmW31tbJFXmK9ODs
// SIG // diu9zLiJEgyyPKwvQAN/LiOm2zt0cI6cll8WkW/V2aaj
// SIG // AI4RHjl3ksDBErDfQCocomrwFbqMVsl+tCQLR+3tKb6Q
// SIG // GaXHnU4gPeSgZMacFoLgY83zsGhdkmTZIwZDR5AFrfT3
// SIG // J7Q/1vFRkvyHgdPahOmwFOq2fx6JXO/+fdithsXhpsA1
// SIG // CVe58Hy1x0mpCbhremu955zJ1ofSuNDIbhqrFYKqzWM3
// SIG // D0UmBAj+Zat+CIkjByf3fkeRl89+LBY/rkSm2whAzldP
// SIG // aWbYHPiyknmORXJ3hI7H2lI8yPJc8yL/is0gxer0AWkI
// SIG // f+fiPo3sj40kKhC4l8bVdbGrs8qwhCM/WnMQS6c+m4z3
// SIG // C7zngjaAGP0Ahf3n+r2LiJiL7RXK+j6NxCHumTzTFeDT
// SIG // 80NuxV+PQx+eHQcvVx+aQ+kyYrIIESnMUO1Th2K321JpIg==
// SIG // End signature block
