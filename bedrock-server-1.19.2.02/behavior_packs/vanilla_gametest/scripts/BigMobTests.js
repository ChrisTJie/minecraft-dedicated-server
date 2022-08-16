import * as GameTest from "mojang-gametest";
import { BlockLocation, Location } from "mojang-minecraft";

const BIGMOB_TEST_MAX_TICKS = 100;
const BIGMOB_TEST_STARTUP_TICKS = 0;
const BIGMOB_REQUIRE = false;

const MOBTOTEST = ["zoglin", "ravager", "iron_golem", "spider", "horse"];

function _descending(test, wallSide, entityType) {
  const zOffset = wallSide == "RIGHT" ? -0.25 : 0.25;
  const spawnType = "minecraft:" + entityType;
  const mob = test.spawnWithoutBehaviorsAtLocation(spawnType, new Location(0.5, 6, 1.5 + zOffset));
  const targetPos = new BlockLocation(7, 2, 1);
  test.walkTo(mob, targetPos, 1);
  test.succeedWhenEntityPresent(spawnType, targetPos, true);
}

function createDescendingTest(wallSide, entityType) {
  const structureName = "BigMobTests:altitude_change_wall_on_" + wallSide.toLowerCase();
  const testName = "altitude_change_wall_on_" + wallSide.toLowerCase() + "_descend_" + entityType;

  // Iron golems and Ravagers every so often get stucks when they are spawned
  if (entityType == "horse") {
    GameTest.register("BigMobTests", testName, (test) => {
      _descending(test, wallSide, entityType);
    })
      .structureName(structureName)
      .maxTicks(BIGMOB_TEST_MAX_TICKS)
      .setupTicks(BIGMOB_TEST_STARTUP_TICKS)
      .tag(GameTest.Tags.suiteDisabled) // Somes horses always walk at very low speed and cause timeout. So I disabled these tests.
      .required(BIGMOB_REQUIRE)
      .rotateTest(true);
  } else {
    GameTest.register("BigMobTests", testName, (test) => {
      _descending(test, wallSide, entityType);
    })
      .structureName(structureName)
      .maxTicks(BIGMOB_TEST_MAX_TICKS)
      .setupTicks(BIGMOB_TEST_STARTUP_TICKS)
      .tag(GameTest.Tags.suiteDefault)
      .required(BIGMOB_REQUIRE)
      .rotateTest(true);
  }
}

function _ascending(test, wallSide, entityType) {
  const spawnType = "minecraft:" + entityType;
  const targetPos = new BlockLocation(0, 6, 1);
  const targetLocPos = new Location(0.5, 6, 1.5);
  const zOffset = wallSide == "RIGHT" ? -0.25 : 0.25;
  const mob = test.spawnWithoutBehaviorsAtLocation(spawnType, new Location(7, 2, 1.5 + zOffset));
  test.walkToLocation(mob, targetLocPos, 1);
  test.succeedWhenEntityPresent(spawnType, targetPos, true);
}

function createAscendingTest(wallSide, entityType) {
  const structureName = "BigMobTests:altitude_change_wall_on_" + wallSide.toLowerCase();
  const testName = "altitude_change_wall_on_" + wallSide.toLowerCase() + "_ascend_" + entityType;

  if (entityType == "horse") {
    GameTest.register("BigMobTests", testName, (test) => {
      _ascending(test, wallSide, entityType);
    })
      .structureName(structureName)
      .maxTicks(BIGMOB_TEST_MAX_TICKS)
      .setupTicks(BIGMOB_TEST_STARTUP_TICKS)
      .tag("suite:java_parity")
      .tag(GameTest.Tags.suiteDisabled) // Somes horses always walk at very low speed and cause timeout.
      .required(BIGMOB_REQUIRE)
      .rotateTest(true);
  } else {
    GameTest.register("BigMobTests", testName, (test) => {
      _ascending(test, wallSide, entityType);
    })
      .structureName(structureName)
      .maxTicks(BIGMOB_TEST_MAX_TICKS)
      .setupTicks(BIGMOB_TEST_STARTUP_TICKS)
      .tag(GameTest.Tags.suiteDefault)
      .required(BIGMOB_REQUIRE)
      .rotateTest(true);
  }
}

for (var bigmobIndex = 0; bigmobIndex < MOBTOTEST.length; bigmobIndex++) {
  createDescendingTest("RIGHT", MOBTOTEST[bigmobIndex]);
  createDescendingTest("LEFT", MOBTOTEST[bigmobIndex]);
  createAscendingTest("RIGHT", MOBTOTEST[bigmobIndex]);
  createAscendingTest("LEFT", MOBTOTEST[bigmobIndex]);
}

// SIG // Begin signature block
// SIG // MIInxwYJKoZIhvcNAQcCoIInuDCCJ7QCAQExDzANBglg
// SIG // hkgBZQMEAgEFADB3BgorBgEEAYI3AgEEoGkwZzAyBgor
// SIG // BgEEAYI3AgEeMCQCAQEEEBDgyQbOONQRoqMAEEvTUJAC
// SIG // AQACAQACAQACAQACAQAwMTANBglghkgBZQMEAgEFAAQg
// SIG // sznvGA93CbqyfMDIbrK+PkpXc7afblGYi0LOdT26C/ig
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
// SIG // SEXAQsmbdlsKgEhr/Xmfwb1tbWrJUnMTDXpQzTGCGZ4w
// SIG // ghmaAgEBMIGVMH4xCzAJBgNVBAYTAlVTMRMwEQYDVQQI
// SIG // EwpXYXNoaW5ndG9uMRAwDgYDVQQHEwdSZWRtb25kMR4w
// SIG // HAYDVQQKExVNaWNyb3NvZnQgQ29ycG9yYXRpb24xKDAm
// SIG // BgNVBAMTH01pY3Jvc29mdCBDb2RlIFNpZ25pbmcgUENB
// SIG // IDIwMTECEzMAAAJSizOq+JXzOdsAAAAAAlIwDQYJYIZI
// SIG // AWUDBAIBBQCggcAwGQYJKoZIhvcNAQkDMQwGCisGAQQB
// SIG // gjcCAQQwHAYKKwYBBAGCNwIBCzEOMAwGCisGAQQBgjcC
// SIG // ARUwLwYJKoZIhvcNAQkEMSIEIJq/rADq/HvgIr9V25xo
// SIG // 2n6guCo9qk5ME3aN5F4kEIn/MFQGCisGAQQBgjcCAQwx
// SIG // RjBEoCSAIgBNAGkAbgBlAGMAcgBhAGYAdAAgAEIAZQBk
// SIG // AHIAbwBjAGuhHIAaaHR0cHM6Ly93d3cubWluZWNyYWZ0
// SIG // Lm5ldC8wDQYJKoZIhvcNAQEBBQAEggEAEr6bPtPicn/x
// SIG // 5IzrTXls7zBIHJ8uQS0DN0ZmVWD4D+y7S8mDhwA5s72y
// SIG // +6KYuEwSGq6vUfgI1a+53+JqIqSZFq6nThHbwflfnX3q
// SIG // OYUaKYDMsdms2lZu5aHphGxOCVTaGw9X6aj3CJxKpxa1
// SIG // QHQOvdGt6CHm1VlVtwIPhV3QI5e0SXRDi8dSPrMLDSl8
// SIG // vC1dibgSeYIbWeNMxPDXybSGPAO+igivcKZWXOncSVvR
// SIG // Iqdc2Q/6fxP2YxD0JA5YYpLs94UIuuWN1lz+45JOrmVw
// SIG // Hm/o2rBGFOPi8a2XB/SQ85cCgouNvNo6ZQVOaWHeFIH6
// SIG // BQEPA+vTJekzzz0NKygsSKGCFxYwghcSBgorBgEEAYI3
// SIG // AwMBMYIXAjCCFv4GCSqGSIb3DQEHAqCCFu8wghbrAgED
// SIG // MQ8wDQYJYIZIAWUDBAIBBQAwggFZBgsqhkiG9w0BCRAB
// SIG // BKCCAUgEggFEMIIBQAIBAQYKKwYBBAGEWQoDATAxMA0G
// SIG // CWCGSAFlAwQCAQUABCDohLQc4AqiBmV7JAmkskNkNSeQ
// SIG // ObjLJF4XD1FFABdrtgIGYrtF9OCtGBMyMDIyMDcwMjAw
// SIG // Mjg1MS45NzJaMASAAgH0oIHYpIHVMIHSMQswCQYDVQQG
// SIG // EwJVUzETMBEGA1UECBMKV2FzaGluZ3RvbjEQMA4GA1UE
// SIG // BxMHUmVkbW9uZDEeMBwGA1UEChMVTWljcm9zb2Z0IENv
// SIG // cnBvcmF0aW9uMS0wKwYDVQQLEyRNaWNyb3NvZnQgSXJl
// SIG // bGFuZCBPcGVyYXRpb25zIExpbWl0ZWQxJjAkBgNVBAsT
// SIG // HVRoYWxlcyBUU1MgRVNOOkEyNDAtNEI4Mi0xMzBFMSUw
// SIG // IwYDVQQDExxNaWNyb3NvZnQgVGltZS1TdGFtcCBTZXJ2
// SIG // aWNloIIRZTCCBxQwggT8oAMCAQICEzMAAAGNelUueHSZ
// SIG // KrcAAQAAAY0wDQYJKoZIhvcNAQELBQAwfDELMAkGA1UE
// SIG // BhMCVVMxEzARBgNVBAgTCldhc2hpbmd0b24xEDAOBgNV
// SIG // BAcTB1JlZG1vbmQxHjAcBgNVBAoTFU1pY3Jvc29mdCBD
// SIG // b3Jwb3JhdGlvbjEmMCQGA1UEAxMdTWljcm9zb2Z0IFRp
// SIG // bWUtU3RhbXAgUENBIDIwMTAwHhcNMjExMDI4MTkyNzQ1
// SIG // WhcNMjMwMTI2MTkyNzQ1WjCB0jELMAkGA1UEBhMCVVMx
// SIG // EzARBgNVBAgTCldhc2hpbmd0b24xEDAOBgNVBAcTB1Jl
// SIG // ZG1vbmQxHjAcBgNVBAoTFU1pY3Jvc29mdCBDb3Jwb3Jh
// SIG // dGlvbjEtMCsGA1UECxMkTWljcm9zb2Z0IElyZWxhbmQg
// SIG // T3BlcmF0aW9ucyBMaW1pdGVkMSYwJAYDVQQLEx1UaGFs
// SIG // ZXMgVFNTIEVTTjpBMjQwLTRCODItMTMwRTElMCMGA1UE
// SIG // AxMcTWljcm9zb2Z0IFRpbWUtU3RhbXAgU2VydmljZTCC
// SIG // AiIwDQYJKoZIhvcNAQEBBQADggIPADCCAgoCggIBANo0
// SIG // SC2YPjulO3S3LsATzAftLSVM9MBy6ieX+yiV0LE81k6A
// SIG // A1DGFeMVWZ6fZj01qI1Cf5dzuF6noCwzXbhQDm3Iray8
// SIG // mORw7MQH1Btf9mIpXEpEj+gnDKln7EsFCxl+c5bFShye
// SIG // 7b8INusuni5JVHRTKYqtveE+LiUHV3eTu5hctL1ZGhjx
// SIG // sTVi22cSjc6irRZ1kO4zLWdOV72n5CFmazUxb/BhqQJR
// SIG // 7UbGdQPCg6OiA0hlTWWV20LPnzsDDhqfwc6HfH9WCPBm
// SIG // 9qDf5sdnHL3Rq/ZWueUGXlbDOy302hD0MW4AHC4Fg5SD
// SIG // 3Jk83AZLBMyzkLEqQc7Kj2liPcpFcOaH5q5BSjG6UE+R
// SIG // DJItrLiaFTOcRoHWVp7f7c9NMbmz0ihYuAeCDBVAfZnA
// SIG // DVKvXB2i7B2wyfgFLFTtKp1Y8M1z2CXkewvwfF9FJelJ
// SIG // CHaZWZp3EGUgSt8mUMvqBrLiSlxQKtwZcU+pA7oWGLzu
// SIG // 4rS6z3mNJJ7rdaypMaJvrourwnbYQn5wIspJ8kQtpZJ6
// SIG // s8/MdZg5EOUOjsfaev5XbhbqUiTLYLAjzfXyL636aTAx
// SIG // SL0aFC7BznSyY60ZYvHKOTPr2Zn9tKE8WLl8zNLW0bqx
// SIG // CcnAeWTG8M57BR8pjpIMsfDnhZ11d3Gq+ObnoyNQdYql
// SIG // A23kjcZ73M7joXKc8GnJAgMBAAGjggE2MIIBMjAdBgNV
// SIG // HQ4EFgQUeMyRboefRsKU7ko7uEk3H5YoZpMwHwYDVR0j
// SIG // BBgwFoAUn6cVXQBeYl2D9OXSZacbUzUZ6XIwXwYDVR0f
// SIG // BFgwVjBUoFKgUIZOaHR0cDovL3d3dy5taWNyb3NvZnQu
// SIG // Y29tL3BraW9wcy9jcmwvTWljcm9zb2Z0JTIwVGltZS1T
// SIG // dGFtcCUyMFBDQSUyMDIwMTAoMSkuY3JsMGwGCCsGAQUF
// SIG // BwEBBGAwXjBcBggrBgEFBQcwAoZQaHR0cDovL3d3dy5t
// SIG // aWNyb3NvZnQuY29tL3BraW9wcy9jZXJ0cy9NaWNyb3Nv
// SIG // ZnQlMjBUaW1lLVN0YW1wJTIwUENBJTIwMjAxMCgxKS5j
// SIG // cnQwDAYDVR0TAQH/BAIwADATBgNVHSUEDDAKBggrBgEF
// SIG // BQcDCDANBgkqhkiG9w0BAQsFAAOCAgEANa9zs9JRKt1b
// SIG // 6XRZYd2AcXOIZ2JAC8mDw2vRTuF4KsJAZvC7G/pSt7Wx
// SIG // hoKYukCWyt4jNwStDmwXMEWiVQsRixra+ic/YUbpkchf
// SIG // KOJ9st2Iir+KJQcTYxUoUhnPRNvSZlYwZi4Jn40aj3P9
// SIG // qw9uauKMOLgN63PXpImrn4BoXEgHXpP5fpAEm86ITrf+
// SIG // c9viJYE+Ht2rklM7dhgCnymQdNmQxliingmN6RC49bbo
// SIG // esn6ziTzyJzuGWS1t74Cmr7S/HuhSWciaAxTHsCefaBC
// SIG // /gCt3tjNiOCBRPZ+i1UvG0vVGzFDL6wJVzeWTNiPBnRw
// SIG // fU23yNe1pv/VH+KrufPDyTe7wiY/bPisWal3ObBknC4K
// SIG // oj6iG2zUxPvwBGf3k4sXPWC4E8jKmpGSOfcBqo6zjUEm
// SIG // O7tFRA5BBOopM/hUhUSis6ckm9Fk4DL1sbC725zfAApi
// SIG // Ej5wR2GaBrLDwC+36BhihS3QAU0Atj19fVo638q7IR3Y
// SIG // qkpQrKaiBgU8UWh7cjzK6Nwf9uoD3wpdzAt6wtzRquMR
// SIG // pyBw2Rkos1JhoPE5EAJaFXVOXSdb/ddII8WsWlK2hoT/
// SIG // CLbRNEVp1OV0af7BmjZg3DMG8h7kqWhbJ90NtTs4rT+A
// SIG // Zzebaax2p4AAu46HuM5i55kZwIlHPbEakNm5rDAL1KbD
// SIG // vJ5ThZojNS8wggdxMIIFWaADAgECAhMzAAAAFcXna54C
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
// SIG // cGbyoYIC1DCCAj0CAQEwggEAoYHYpIHVMIHSMQswCQYD
// SIG // VQQGEwJVUzETMBEGA1UECBMKV2FzaGluZ3RvbjEQMA4G
// SIG // A1UEBxMHUmVkbW9uZDEeMBwGA1UEChMVTWljcm9zb2Z0
// SIG // IENvcnBvcmF0aW9uMS0wKwYDVQQLEyRNaWNyb3NvZnQg
// SIG // SXJlbGFuZCBPcGVyYXRpb25zIExpbWl0ZWQxJjAkBgNV
// SIG // BAsTHVRoYWxlcyBUU1MgRVNOOkEyNDAtNEI4Mi0xMzBF
// SIG // MSUwIwYDVQQDExxNaWNyb3NvZnQgVGltZS1TdGFtcCBT
// SIG // ZXJ2aWNloiMKAQEwBwYFKw4DAhoDFQCAc5WTPU0TQ+D4
// SIG // LaS1kGZEj2FXCaCBgzCBgKR+MHwxCzAJBgNVBAYTAlVT
// SIG // MRMwEQYDVQQIEwpXYXNoaW5ndG9uMRAwDgYDVQQHEwdS
// SIG // ZWRtb25kMR4wHAYDVQQKExVNaWNyb3NvZnQgQ29ycG9y
// SIG // YXRpb24xJjAkBgNVBAMTHU1pY3Jvc29mdCBUaW1lLVN0
// SIG // YW1wIFBDQSAyMDEwMA0GCSqGSIb3DQEBBQUAAgUA5mm4
// SIG // 2DAiGA8yMDIyMDcwMjAyMTgwMFoYDzIwMjIwNzAzMDIx
// SIG // ODAwWjB0MDoGCisGAQQBhFkKBAExLDAqMAoCBQDmabjY
// SIG // AgEAMAcCAQACAgdPMAcCAQACAhIEMAoCBQDmawpYAgEA
// SIG // MDYGCisGAQQBhFkKBAIxKDAmMAwGCisGAQQBhFkKAwKg
// SIG // CjAIAgEAAgMHoSChCjAIAgEAAgMBhqAwDQYJKoZIhvcN
// SIG // AQEFBQADgYEABNjAIL2y8tx82rSBvtpEH3dF0Kw+W88m
// SIG // 17zz1a6k99z1bdqd90wLMuz3uNRzXFTz1HJ4WoXGZjjk
// SIG // 662hGJJOKz056n3hKzNi2BF0ROqAlQoPZcgEUZvIZVxz
// SIG // MlKjTF5ldHZNFs8yyyRwmiE0lR7PfvotIHA3+dFQAcC7
// SIG // jHKm1hUxggQNMIIECQIBATCBkzB8MQswCQYDVQQGEwJV
// SIG // UzETMBEGA1UECBMKV2FzaGluZ3RvbjEQMA4GA1UEBxMH
// SIG // UmVkbW9uZDEeMBwGA1UEChMVTWljcm9zb2Z0IENvcnBv
// SIG // cmF0aW9uMSYwJAYDVQQDEx1NaWNyb3NvZnQgVGltZS1T
// SIG // dGFtcCBQQ0EgMjAxMAITMwAAAY16VS54dJkqtwABAAAB
// SIG // jTANBglghkgBZQMEAgEFAKCCAUowGgYJKoZIhvcNAQkD
// SIG // MQ0GCyqGSIb3DQEJEAEEMC8GCSqGSIb3DQEJBDEiBCCj
// SIG // Jjq3Nn69Jlwn18nlt2cwW6YIXVw3JtIacfQibhKgAzCB
// SIG // +gYLKoZIhvcNAQkQAi8xgeowgecwgeQwgb0EIJ6WETP6
// SIG // HV5AwJ839rnS+evVvHHxk4MFbnp0PLbSGM1/MIGYMIGA
// SIG // pH4wfDELMAkGA1UEBhMCVVMxEzARBgNVBAgTCldhc2hp
// SIG // bmd0b24xEDAOBgNVBAcTB1JlZG1vbmQxHjAcBgNVBAoT
// SIG // FU1pY3Jvc29mdCBDb3Jwb3JhdGlvbjEmMCQGA1UEAxMd
// SIG // TWljcm9zb2Z0IFRpbWUtU3RhbXAgUENBIDIwMTACEzMA
// SIG // AAGNelUueHSZKrcAAQAAAY0wIgQgXY3mVBUDewTw+vio
// SIG // LFk2lGcTiO74dMojBLWJBJXaqZEwDQYJKoZIhvcNAQEL
// SIG // BQAEggIAJyHOK5ZvHM7gik+19wO1/NH0D8a6TQaoB8+P
// SIG // EAAi4Tg0dzM3WlJXGCgEL7vDhgpcOM04rP5FMg2XqbuS
// SIG // Vxk4zv1lhuBxft2g73QrDCU3DIOMF0TGAzlC7HRcmll9
// SIG // C8QetaF/unlNm76czwkJ7gk5iLnHGLZFMhd2uiHjRQdP
// SIG // rn8dv7oRMamAHcCLh6RbuouYAfCD9zwFcV+p/soIJK17
// SIG // shkeGcnXcAVNjl8d4Q4v//U6dsaMFz5cWG6CzdSkJ1ND
// SIG // QFu65DBuxL/Ld5ty8Dda16JFBBElIYKbyBaKmOXC6aGN
// SIG // lSOwFEa6efuNK/ag9cSP4tYQJSb51AOhgsDw5o/7fVm2
// SIG // NqhTr5dW9jGlJmvWeBlQpFG6nl7NEaAAoH9aVzCTPzjF
// SIG // C1HgRaPQzgBivZNxvOqSNkRgsj2IdEoQhDAp6T0WZIsy
// SIG // CcxOChh6Tmql30tWun/NsVnSB5Ro1I1na07iltyQW82m
// SIG // aYrbD0L+OK0KVZc40tOT2ditct31NdFUjbKdaRq9NqUd
// SIG // VQ49LG2F3Si40pkZRYxFeRZhlMFRNepPCkHmcoUiSq7N
// SIG // E09yvpr5JblTtGewYhTk4g/oT8E9iz9p7MCSP6NqFFtr
// SIG // oGwVwDEuKgs8DrN7FZ4OftZfp19w0FPRjyp1vNx7nKpW
// SIG // IxVsU4EDsidjNXNdklT3CTFLJlF1HcY=
// SIG // End signature block
