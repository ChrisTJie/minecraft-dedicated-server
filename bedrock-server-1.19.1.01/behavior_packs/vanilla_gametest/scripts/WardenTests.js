import * as GameTest from "mojang-gametest";
import { BlockLocation, TicksPerSecond, Location } from "mojang-minecraft";
const WARDEN_TESTS_PADDING = 16; // The paddings is there to make sure vibrations don't interefere with the warden 


GameTest.register("WardenTests", "warden_despawn", (test) => {
    const wardenEntityType = "minecraft:warden";
    const startPos = new BlockLocation(3, 1, 3);
    test.spawn(wardenEntityType, startPos.above());

    test
        .startSequence()
        .thenWait(() => {
            test.assertEntityPresentInArea(wardenEntityType, false);
        })
        .thenSucceed();
}).maxTicks(TicksPerSecond * 100).tag(GameTest.Tags.suiteDefault).padding(WARDEN_TESTS_PADDING); //timeout after 100 seconds

GameTest.register("WardenTests", "warden_kill_moving_entity", (test) => {
    const wardenEntityType = "minecraft:warden";
    const pigEntityType = "minecraft:pig";
    const startPosWarden = new BlockLocation(1, 1, 1);
    const startPosPig = new Location(6, 2, 6);
    const walkPosPig = new Location(6, 2, 1);
    test.spawn(wardenEntityType, startPosWarden.above());
    const pig = test.spawnWithoutBehaviorsAtLocation(pigEntityType, startPosPig);

    let sequence = test.startSequence().thenIdle(1);

    for (let i = 1; i <= 10; i++) {
        sequence
            .thenExecute(() => {
                test.walkToLocation(pig, walkPosPig, 1);
            })
            .thenIdle(TicksPerSecond * 3)
            .thenExecute(() => {
                test.walkToLocation(pig, startPosPig, 1);
            })
            .thenIdle(TicksPerSecond * 3)
    }
    sequence
        .thenWait(() => {
            test.assertEntityPresentInArea(pigEntityType, false);
        })
        .thenSucceed();
}).maxTicks(TicksPerSecond * 90).tag(GameTest.Tags.suiteDefault).padding(WARDEN_TESTS_PADDING); //timeout after 90 seconds

GameTest.register("WardenTests", "warden_sniff_and_kill_static_entity", (test) => {
    const wardenEntityType = "minecraft:warden";
    const pigEntityType = "minecraft:pig";
    const startPosWarden = new BlockLocation(1, 1, 1);
    const startPosPig = new Location(7, 2, 7);
    test.spawn(wardenEntityType, startPosWarden.above());
    test.spawnWithoutBehaviorsAtLocation(pigEntityType, startPosPig);

    test
        .startSequence()
        .thenWait(() => {
            test.assertEntityPresentInArea(pigEntityType, false);
        })
        .thenSucceed();
}).maxTicks(TicksPerSecond * 60).tag(GameTest.Tags.suiteDefault).padding(WARDEN_TESTS_PADDING); //timeout after 60 seconds

GameTest.register("WardenTests", "warden_sniff_and_kill_player_before_mob", (test) => {
    const wardenEntityType = "minecraft:warden";
    const pigEntityType = "minecraft:pig";
    const startPosWarden = new BlockLocation(1, 1, 1);
    const startPosPlayer = new BlockLocation(1, 2, 6);
    const startPosPig = new Location(6, 2, 6);
    test.spawn(wardenEntityType, startPosWarden.above());
    test.spawnWithoutBehaviorsAtLocation(pigEntityType, startPosPig);
    test.spawnSimulatedPlayer(startPosPlayer, "playerSim_warden");

    test
        .startSequence()
        .thenWait(() => {
            test.assertEntityPresentInArea("minecraft:player", false);
        })
        .thenWait(() => {
            test.assertEntityPresentInArea("minecraft:pig", true);
        })
        .thenSucceed();
}).maxTicks(TicksPerSecond * 60).tag(GameTest.Tags.suiteDefault).padding(WARDEN_TESTS_PADDING); //timeout after 60 seconds

GameTest.register("WardenTests", "warden_go_to_projectile", (test) => {
    const wardenEntityType = "minecraft:warden";
    const startPosWarden = new BlockLocation(1, 1, 1);
    const snowballEntityType = "minecraft:snowball";
    // spawns snowball above the ground so that it falls down and breaks
    const startPosSnowball = new BlockLocation(7, 4, 7);
    test.spawn(wardenEntityType, startPosWarden.above());
    test.spawn(snowballEntityType, startPosSnowball);

    test
        .startSequence()
        .thenWait(() => {
            test.assertEntityPresent(wardenEntityType, startPosSnowball, true);
        })
        .thenSucceed();
}).maxTicks(TicksPerSecond * 10).padding(WARDEN_TESTS_PADDING); //timeout after 10 seconds

// SIG // Begin signature block
// SIG // MIInvQYJKoZIhvcNAQcCoIInrjCCJ6oCAQExDzANBglg
// SIG // hkgBZQMEAgEFADB3BgorBgEEAYI3AgEEoGkwZzAyBgor
// SIG // BgEEAYI3AgEeMCQCAQEEEBDgyQbOONQRoqMAEEvTUJAC
// SIG // AQACAQACAQACAQACAQAwMTANBglghkgBZQMEAgEFAAQg
// SIG // XBhYRIjlwxFT/PWf77HZGT37FRKYTKxEYu0Dp4Hw0cOg
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
// SIG // SEXAQsmbdlsKgEhr/Xmfwb1tbWrJUnMTDXpQzTGCGZQw
// SIG // ghmQAgEBMIGVMH4xCzAJBgNVBAYTAlVTMRMwEQYDVQQI
// SIG // EwpXYXNoaW5ndG9uMRAwDgYDVQQHEwdSZWRtb25kMR4w
// SIG // HAYDVQQKExVNaWNyb3NvZnQgQ29ycG9yYXRpb24xKDAm
// SIG // BgNVBAMTH01pY3Jvc29mdCBDb2RlIFNpZ25pbmcgUENB
// SIG // IDIwMTECEzMAAAJSizOq+JXzOdsAAAAAAlIwDQYJYIZI
// SIG // AWUDBAIBBQCggcAwGQYJKoZIhvcNAQkDMQwGCisGAQQB
// SIG // gjcCAQQwHAYKKwYBBAGCNwIBCzEOMAwGCisGAQQBgjcC
// SIG // ARUwLwYJKoZIhvcNAQkEMSIEIJRuaS2MM8ZVYFidTUpk
// SIG // 20xWuQRMG1j7VYTyd8NUFfFKMFQGCisGAQQBgjcCAQwx
// SIG // RjBEoCSAIgBNAGkAbgBlAGMAcgBhAGYAdAAgAEIAZQBk
// SIG // AHIAbwBjAGuhHIAaaHR0cHM6Ly93d3cubWluZWNyYWZ0
// SIG // Lm5ldC8wDQYJKoZIhvcNAQEBBQAEggEARnADa7kH1Or6
// SIG // o0SXH3ZKuuuB325xlhhM4lxg36OIXfFZruCtRwbIzhQD
// SIG // Q+VZBp2hwPEkQCO75q0QZmyInIgPyyLopOQGiKmgIUYz
// SIG // ZBUdjprX8hd6/zpxLMyFR1hTQ1i89uY8CBEoYH97t7c8
// SIG // ccOrPMTQ92PL+Ujl1IZ0XvfAMyBGf5Xfvyvz7n+U3k45
// SIG // dErRXK4c1S3qVu9sn7sIS7JokLwM4c4S2ccWzXZXbp6w
// SIG // omqmwkyxHWhpf0bX8zp7sbkv+X9BfO0N39Yk7OhPY6mH
// SIG // fNCdE+4Ng1XtNJ1ObFgQijSjx7QgT/jBoN0AeDfDjeZr
// SIG // G1r366baXNBW+agOccgp8aGCFwwwghcIBgorBgEEAYI3
// SIG // AwMBMYIW+DCCFvQGCSqGSIb3DQEHAqCCFuUwghbhAgED
// SIG // MQ8wDQYJYIZIAWUDBAIBBQAwggFVBgsqhkiG9w0BCRAB
// SIG // BKCCAUQEggFAMIIBPAIBAQYKKwYBBAGEWQoDATAxMA0G
// SIG // CWCGSAFlAwQCAQUABCDfpDai9wvtsiGNKWx9mEtPH9Th
// SIG // 6d+5rckkpm7BbZdFtgIGYnwsoLvWGBMyMDIyMDUyNzAw
// SIG // NTAzMi4zNjlaMASAAgH0oIHUpIHRMIHOMQswCQYDVQQG
// SIG // EwJVUzETMBEGA1UECBMKV2FzaGluZ3RvbjEQMA4GA1UE
// SIG // BxMHUmVkbW9uZDEeMBwGA1UEChMVTWljcm9zb2Z0IENv
// SIG // cnBvcmF0aW9uMSkwJwYDVQQLEyBNaWNyb3NvZnQgT3Bl
// SIG // cmF0aW9ucyBQdWVydG8gUmljbzEmMCQGA1UECxMdVGhh
// SIG // bGVzIFRTUyBFU046NEQyRi1FM0RELUJFRUYxJTAjBgNV
// SIG // BAMTHE1pY3Jvc29mdCBUaW1lLVN0YW1wIFNlcnZpY2Wg
// SIG // ghFfMIIHEDCCBPigAwIBAgITMwAAAbCh44My6I07wAAB
// SIG // AAABsDANBgkqhkiG9w0BAQsFADB8MQswCQYDVQQGEwJV
// SIG // UzETMBEGA1UECBMKV2FzaGluZ3RvbjEQMA4GA1UEBxMH
// SIG // UmVkbW9uZDEeMBwGA1UEChMVTWljcm9zb2Z0IENvcnBv
// SIG // cmF0aW9uMSYwJAYDVQQDEx1NaWNyb3NvZnQgVGltZS1T
// SIG // dGFtcCBQQ0EgMjAxMDAeFw0yMjAzMDIxODUxNDJaFw0y
// SIG // MzA1MTExODUxNDJaMIHOMQswCQYDVQQGEwJVUzETMBEG
// SIG // A1UECBMKV2FzaGluZ3RvbjEQMA4GA1UEBxMHUmVkbW9u
// SIG // ZDEeMBwGA1UEChMVTWljcm9zb2Z0IENvcnBvcmF0aW9u
// SIG // MSkwJwYDVQQLEyBNaWNyb3NvZnQgT3BlcmF0aW9ucyBQ
// SIG // dWVydG8gUmljbzEmMCQGA1UECxMdVGhhbGVzIFRTUyBF
// SIG // U046NEQyRi1FM0RELUJFRUYxJTAjBgNVBAMTHE1pY3Jv
// SIG // c29mdCBUaW1lLVN0YW1wIFNlcnZpY2UwggIiMA0GCSqG
// SIG // SIb3DQEBAQUAA4ICDwAwggIKAoICAQCcxm07DNfSgp0H
// SIG // OUQu1aIJcklzCi7rf8llj0Fg+lQJSYAXsVSsdp9c4F96
// SIG // P8QNmYGfzRRnIDQ0Qie5iYjnlu8Xh56DVz5YOxI2FrpX
// SIG // 5N6DgI+muzteRr3JKWLLy3MfqPEnvAq3yG+NBCfFtEMe
// SIG // EyF39Mg8ACeP6jveHSf4Rmm3iWIOBqdBtLkJocBaLwFk
// SIG // x5Q9XIvrKd+gMU/cCIR6sP+9LczL65wxe45kI2lVD54z
// SIG // oDzshVmYla+3uq5EpeGp09bS79t0loV6jLNeMKJb+GXk
// SIG // HFj/OK1dha69Sm8JCGtL5R45b+MRvWup5U0X6NAmFEA3
// SIG // 62TjFwiOSnADdgWen1W9ParQnbFnTTcQdMuJcDI57jZs
// SIG // fORTX8z3DGY5sABfWkVFDCx7+tuiOu7dfnWaFT6Sqn0j
// SIG // ZhrVbfQxE1pJg4qZxoOPgXU6Zb4BlavRdymTwxR2m8Wy
// SIG // 6Uln11vdDGVzrhR/MgjMwyTVM3sgKsrRRci2Yq94+E9R
// SIG // se5UXgjlD8Nablc21irKVezKHWY7TfyFFnVSHZNxz6eE
// SIG // DdcMHVb3VzrGHYRvJIIxsgGSA+aK+wv++YcikG+RdGfh
// SIG // HtOLmPSvrA2d5d8/E0GVgH2Lq22QjFlp5iVbLuVeD0eT
// SIG // zvlOg+7QLTLzFCzWIm0/frMVWSv1kHq9iSfat2e5YxbO
// SIG // JYKZn3OgFQIDAQABo4IBNjCCATIwHQYDVR0OBBYEFDrf
// SIG // ASQ3ASZuHcugEmR61yBH1jY/MB8GA1UdIwQYMBaAFJ+n
// SIG // FV0AXmJdg/Tl0mWnG1M1GelyMF8GA1UdHwRYMFYwVKBS
// SIG // oFCGTmh0dHA6Ly93d3cubWljcm9zb2Z0LmNvbS9wa2lv
// SIG // cHMvY3JsL01pY3Jvc29mdCUyMFRpbWUtU3RhbXAlMjBQ
// SIG // Q0ElMjAyMDEwKDEpLmNybDBsBggrBgEFBQcBAQRgMF4w
// SIG // XAYIKwYBBQUHMAKGUGh0dHA6Ly93d3cubWljcm9zb2Z0
// SIG // LmNvbS9wa2lvcHMvY2VydHMvTWljcm9zb2Z0JTIwVGlt
// SIG // ZS1TdGFtcCUyMFBDQSUyMDIwMTAoMSkuY3J0MAwGA1Ud
// SIG // EwEB/wQCMAAwEwYDVR0lBAwwCgYIKwYBBQUHAwgwDQYJ
// SIG // KoZIhvcNAQELBQADggIBAN1z4oebDbVHwMi55V6ujGUq
// SIG // QodExfrhvp4SCeOP/3DHEBhFYmdjdutzcL60IwhTp4v/
// SIG // qMX++o3JlIXCli15PYYXe73xQYWWc3BeWjbNO1JYoLNu
// SIG // Kb3mrBboZieMvNjmJtRtTkWLBZ3WXbxf/za2BsWl6lDZ
// SIG // UR0JbJFf6ZnHKjtzousCx3Dwdf1kUyybWGyIosBP7kxR
// SIG // BRC+OcFg/9ZkwjxJBV94ZYlxMqcV83WdZOl6hk8rBgLS
// SIG // 11AeyAugh9umMoCkLlxvEI3CQQFBv/Rd8jWTnWxb5+xY
// SIG // p2cjXCFS8ZXe4dGxC30M4SI3pY/ubASoS3GhVNL2425n
// SIG // 9FhDYBZp8iTYjKy+/9hWDi7IIkA2yceg6ctRH77kRrHS
// SIG // +X/o1VXbOaDGiq4cYFe6BKG6wOmeep51mDeO7MMKLrnB
// SIG // 39MptQ0Fh8tgxzhUUTe8r/vs3rNBkgjo0UWDyu669UHP
// SIG // jt57HetODoJuZ0fUKoTjnNjkE677UoFwUrbubxelvAz3
// SIG // LJ7Od3EOIHXEdWPTYOSGBMMQmc82LKvaGpcZR/mR/wOi
// SIG // e2THkjSjZK1z8eqaRV1MR7gt5OJs1cmTRlj/2YHFDotq
// SIG // ldN5uiJsrb4tZHxnumHQod9jzoFnjR/ZXyrfndTPquCI
// SIG // SS5l9BNmWSAmBG/UNK6JnjF/BmfnG4bjbBYpiYGv3447
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
// SIG // UyBFU046NEQyRi1FM0RELUJFRUYxJTAjBgNVBAMTHE1p
// SIG // Y3Jvc29mdCBUaW1lLVN0YW1wIFNlcnZpY2WiIwoBATAH
// SIG // BgUrDgMCGgMVAAKeL5Dd3w+RTQVWGZJWXkvyRTwYoIGD
// SIG // MIGApH4wfDELMAkGA1UEBhMCVVMxEzARBgNVBAgTCldh
// SIG // c2hpbmd0b24xEDAOBgNVBAcTB1JlZG1vbmQxHjAcBgNV
// SIG // BAoTFU1pY3Jvc29mdCBDb3Jwb3JhdGlvbjEmMCQGA1UE
// SIG // AxMdTWljcm9zb2Z0IFRpbWUtU3RhbXAgUENBIDIwMTAw
// SIG // DQYJKoZIhvcNAQEFBQACBQDmOnDrMCIYDzIwMjIwNTI3
// SIG // MDEzNDM1WhgPMjAyMjA1MjgwMTM0MzVaMHcwPQYKKwYB
// SIG // BAGEWQoEATEvMC0wCgIFAOY6cOsCAQAwCgIBAAICFQwC
// SIG // Af8wBwIBAAICEWUwCgIFAOY7wmsCAQAwNgYKKwYBBAGE
// SIG // WQoEAjEoMCYwDAYKKwYBBAGEWQoDAqAKMAgCAQACAweh
// SIG // IKEKMAgCAQACAwGGoDANBgkqhkiG9w0BAQUFAAOBgQAq
// SIG // AbwbI4ccKhVh7oeJQUM86XUg/qBS8e/8Ybrz6ww2jAYW
// SIG // R84FPl33zJGjlIWvvLF/SVyZffuxRkQ4fc2QbkMNRG75
// SIG // A6EBFJbCkkRK7QDBY+rd+BjGa9hFS+ZEp2i5l6v6SSxM
// SIG // rkSZsc1QqhHGQkTYLXmCIlxRQh4qt4T3LElDHDGCBA0w
// SIG // ggQJAgEBMIGTMHwxCzAJBgNVBAYTAlVTMRMwEQYDVQQI
// SIG // EwpXYXNoaW5ndG9uMRAwDgYDVQQHEwdSZWRtb25kMR4w
// SIG // HAYDVQQKExVNaWNyb3NvZnQgQ29ycG9yYXRpb24xJjAk
// SIG // BgNVBAMTHU1pY3Jvc29mdCBUaW1lLVN0YW1wIFBDQSAy
// SIG // MDEwAhMzAAABsKHjgzLojTvAAAEAAAGwMA0GCWCGSAFl
// SIG // AwQCAQUAoIIBSjAaBgkqhkiG9w0BCQMxDQYLKoZIhvcN
// SIG // AQkQAQQwLwYJKoZIhvcNAQkEMSIEIJ41gICn43EC10zt
// SIG // 0OnZMfGWfMbsL8IN0W7xHwNb1PW6MIH6BgsqhkiG9w0B
// SIG // CRACLzGB6jCB5zCB5DCBvQQgzQYLQ3fLn/Sk4xn9Ruuy
// SIG // HypnDRSZnlk3eopQMucVhKAwgZgwgYCkfjB8MQswCQYD
// SIG // VQQGEwJVUzETMBEGA1UECBMKV2FzaGluZ3RvbjEQMA4G
// SIG // A1UEBxMHUmVkbW9uZDEeMBwGA1UEChMVTWljcm9zb2Z0
// SIG // IENvcnBvcmF0aW9uMSYwJAYDVQQDEx1NaWNyb3NvZnQg
// SIG // VGltZS1TdGFtcCBQQ0EgMjAxMAITMwAAAbCh44My6I07
// SIG // wAABAAABsDAiBCBlfzgFhEvmD+ND+NqTRvdvb2XJmKpK
// SIG // Wza1uxMTfjV6NTANBgkqhkiG9w0BAQsFAASCAgByGksc
// SIG // +iJfXXPrYORbImlhtRJsUU72/Mjq41y0U7U4dupFiV8V
// SIG // PsXSiXQgToNWbeWv8a+RqBRhxYcr/5DGjZqFP+ATw3zV
// SIG // mIZI/AvotolnAoYTSgABuX34nOL2HdV14feTFtAyoR5F
// SIG // LW06dWhbcX71f77+F+E4kA4WwDffF7kEcYV5Uo0oyWLX
// SIG // 6FK6ry2rP0XUia3K4klGak08qn7bpHMcaqgq98Nkl5CB
// SIG // FgAaMN4HTxf/3RU1+z/0GBA65bSp/f/VoN0hV7WQdN9d
// SIG // j4VHjWdwpVkDv1FphkxCzuV98tVl1+Xp0okcMjOsIRZI
// SIG // UHg0JISIYjIm+XjT+sV+Oy+yhlET2hBxgrOMHYoGnnBn
// SIG // WZxy41MLlJ/HU7Crtrzf6NZwu1fjlGXnBgnPgZ1vq/6p
// SIG // os6/yBIbN+IZeBxBwr674fmHZ3s3zUmriP6FFx6kbxrM
// SIG // L0DXWrWV6JM5/XaqUedyKKUV9+svomw3YrfYNE12EzCB
// SIG // v7YqlM5SRXtyvVceS3Om4Dvk+PjN6Vj3clMweHBxG2dE
// SIG // ORFO7xouiWBsWiu0OHzb4TA+NXR7fEAgmME4sYLXrRMm
// SIG // NvGQBMiGFTLwgjmBi1VY4W1ZtyO3TO0m+rBskPmLIfuh
// SIG // xdJ1SQmy+RE8kM1mhz0kE+MUCUYPqOWV7WYiXlH/JFnb
// SIG // QB78PEXWy71ukjO8bQ==
// SIG // End signature block
