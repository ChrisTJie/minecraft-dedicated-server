import * as GameTest from "mojang-gametest";
import { BlockLocation, MinecraftItemTypes, Location, TicksPerSecond, MinecraftBlockTypes } from "mojang-minecraft";
import GameTestExtensions from "./GameTestExtensions.js";

GameTest.register("FrogTests", "frog_jump", (test) => {
    const frogEntityType = "minecraft:frog";
    const startPos = new BlockLocation(0, 7, 0);
    const endPos = new BlockLocation(3, 7, 0);
    test.spawn(frogEntityType, startPos);

    test
        .startSequence()
        .thenWait(() => {
            test.assertEntityPresent(frogEntityType, endPos, true);
        })
        .thenSucceed();
}).maxTicks(TicksPerSecond * 20).tag(GameTest.Tags.suiteDefault);

GameTest.register("FrogTests", "frog_eat_slime_drop_slimeball", (test) => {
    const frogEntityType = "minecraft:frog";
    const startPos = new BlockLocation(1, 2, 1);
    test.spawn(frogEntityType, startPos);

    const slimeEntityType = "minecraft:slime<spawn_small>";
    const entityLoc = new Location(1, 2, 3);
    test.spawnWithoutBehaviorsAtLocation(slimeEntityType, entityLoc);

    test
        .startSequence()
        .thenWait(() => {
            test.assertItemEntityPresent(MinecraftItemTypes.slimeBall, startPos, 10.0, true);
        })
        .thenSucceed();
}).maxTicks(TicksPerSecond * 5).tag(GameTest.Tags.suiteDefault);

GameTest.register("FrogTests", "temperate_frog_magmacube_drop_ochre", (test) => {
    const frogEntityType = "minecraft:frog";
    const startPos = new BlockLocation(1, 2, 1);
    test.spawn(frogEntityType, startPos);

    const magmacubeEntityType = "minecraft:magma_cube<spawn_small>";
    const entityLoc = new Location(1, 2, 3);
    test.spawnWithoutBehaviorsAtLocation(magmacubeEntityType, entityLoc);

    test
        .startSequence()
        .thenWait(() => {
            test.assertItemEntityPresent(MinecraftItemTypes.ochreFroglight, startPos, 10.0, true);
        })
        .thenSucceed();
}).maxTicks(TicksPerSecond * 5).tag(GameTest.Tags.suiteDefault);

GameTest.register("FrogTests", "warm_frog_magmacube_drop_pearlescent", (test) => {
    const frogEntityType = "minecraft:frog<spawn_warm>";
    const startPos = new BlockLocation(1, 2, 1);
    test.spawn(frogEntityType, startPos);

    const magmacubeEntityType = "minecraft:magma_cube<spawn_small>";
    const entityLoc = new Location(1, 2, 3);
    test.spawnWithoutBehaviorsAtLocation(magmacubeEntityType, entityLoc);

    test
        .startSequence()
        .thenWait(() => {
            test.assertItemEntityPresent(MinecraftItemTypes.pearlescentFroglight, startPos, 10.0, true);
        })
        .thenSucceed();
}).maxTicks(TicksPerSecond * 5).tag(GameTest.Tags.suiteDefault);

GameTest.register("FrogTests", "cold_frog_magmacube_drop_verdant", (test) => {
    const frogEntityType = "minecraft:frog<spawn_cold>";
    const startPos = new BlockLocation(1, 2, 1);
    test.spawn(frogEntityType, startPos);

    const magmacubeEntityType = "minecraft:magma_cube<spawn_small>";
    const entityLoc = new Location(1, 2, 3);
    test.spawnWithoutBehaviorsAtLocation(magmacubeEntityType, entityLoc);

    test
        .startSequence()
        .thenWait(() => {
            test.assertItemEntityPresent(MinecraftItemTypes.verdantFroglight, startPos, 10.0, true);
        })
        .thenSucceed();
}).maxTicks(TicksPerSecond * 5).tag(GameTest.Tags.suiteDefault);

GameTest.register("FrogTests", "frog_lay_egg", (test) => {
    const startPosFrogOne = new BlockLocation(0, 4, 1);
    const startPosFrogTwo = new BlockLocation(4, 4, 1);
    const startPosPlayer = new BlockLocation(2, 4, 0);
    const spawnPos = new BlockLocation(2, 4, 3);

    let playerSim = test.spawnSimulatedPlayer(startPosPlayer, "playerSim_frog");
    let frogOne = test.spawn("minecraft:frog", startPosFrogOne);
    let frogTwo = test.spawn("minecraft:frog", startPosFrogTwo);
    const testEx = new GameTestExtensions(test);

    test
        .startSequence()
        .thenExecute(() => testEx.giveItem(playerSim, MinecraftItemTypes.slimeBall, 2, 0))
        .thenExecute(() => test.assert(playerSim.interactWithEntity(frogOne) == true, ""))
        .thenExecute(() => test.assert(playerSim.interactWithEntity(frogTwo) == true, ""))
        .thenWait(() => {
            test.assertBlockPresent(MinecraftBlockTypes.frogSpawn, spawnPos, true);
        })
        .thenSucceed();
}).maxTicks(TicksPerSecond * 90).tag(GameTest.Tags.suiteDefault);

// SIG // Begin signature block
// SIG // MIInvQYJKoZIhvcNAQcCoIInrjCCJ6oCAQExDzANBglg
// SIG // hkgBZQMEAgEFADB3BgorBgEEAYI3AgEEoGkwZzAyBgor
// SIG // BgEEAYI3AgEeMCQCAQEEEBDgyQbOONQRoqMAEEvTUJAC
// SIG // AQACAQACAQACAQACAQAwMTANBglghkgBZQMEAgEFAAQg
// SIG // iHdURkAWV7ALp6tKVAOxMdGk2v5laKI8AIciTjkpqS6g
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
// SIG // ARUwLwYJKoZIhvcNAQkEMSIEIEB5d516A73KgQ0lYuSE
// SIG // 5iiuFnQnq3BKHFhbKgke68NOMFQGCisGAQQBgjcCAQwx
// SIG // RjBEoCSAIgBNAGkAbgBlAGMAcgBhAGYAdAAgAEIAZQBk
// SIG // AHIAbwBjAGuhHIAaaHR0cHM6Ly93d3cubWluZWNyYWZ0
// SIG // Lm5ldC8wDQYJKoZIhvcNAQEBBQAEggEARSmpbDJXUgJr
// SIG // Jrinz8bBJcnDTuOJ7uMTIlf6j6Yikx4dlYQAggu9hgoK
// SIG // 1aAUvwMu8TO54TbKw7bT7RYITvPNL5xW+oufSJVLVfd6
// SIG // sfiuMjpFuK62WS4f9CcvmYff6gsMZYtCEfCt/Oxc0+fv
// SIG // mkFQvnHjLPIwDJpYZq+mFZrqeG6mxLlCzv+lER4wu3yj
// SIG // l905SdGG+An7LyrB2sN+nnzUoHdPEQfHg9WmFqG5Tt6n
// SIG // RE94MO9N2FBai3pLmgVDdX9eQzbdmtZbM7U5fH/wTLXi
// SIG // f38ZA9BezTvPhV53hCCFWDZ/lqXGFXz0dq+5Z7bH0NHn
// SIG // 2X/xHg19tCbYylXFCbxVBKGCFwwwghcIBgorBgEEAYI3
// SIG // AwMBMYIW+DCCFvQGCSqGSIb3DQEHAqCCFuUwghbhAgED
// SIG // MQ8wDQYJYIZIAWUDBAIBBQAwggFVBgsqhkiG9w0BCRAB
// SIG // BKCCAUQEggFAMIIBPAIBAQYKKwYBBAGEWQoDATAxMA0G
// SIG // CWCGSAFlAwQCAQUABCDit3wMeFlZn0Gyyf0rDwskQfql
// SIG // xrthbwFteoVcNQ9iFgIGYoS/bPChGBMyMDIyMDUyNzAw
// SIG // NTAyOC40ODdaMASAAgH0oIHUpIHRMIHOMQswCQYDVQQG
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
// SIG // DQYJKoZIhvcNAQEFBQACBQDmOnJ1MCIYDzIwMjIwNTI3
// SIG // MDE0MTA5WhgPMjAyMjA1MjgwMTQxMDlaMHcwPQYKKwYB
// SIG // BAGEWQoEATEvMC0wCgIFAOY6cnUCAQAwCgIBAAICEHcC
// SIG // Af8wBwIBAAICH2swCgIFAOY7w/UCAQAwNgYKKwYBBAGE
// SIG // WQoEAjEoMCYwDAYKKwYBBAGEWQoDAqAKMAgCAQACAweh
// SIG // IKEKMAgCAQACAwGGoDANBgkqhkiG9w0BAQUFAAOBgQBT
// SIG // ptq47JikSOlEkkuZSYW8MhIAQDWwUPS0gtTxzTzxHaEQ
// SIG // r2I/7LDG99r03VA5H/wqRWE2IQPsOYqKcKJjrXOoTHsB
// SIG // edJ5qbWhyJyMY5+QcmyI5L7h3UZPcN8BVz/J5wOdYc+8
// SIG // IZs4ufX1G9xgaRI3bU9l+09fTUj6ivBDQefsdjGCBA0w
// SIG // ggQJAgEBMIGTMHwxCzAJBgNVBAYTAlVTMRMwEQYDVQQI
// SIG // EwpXYXNoaW5ndG9uMRAwDgYDVQQHEwdSZWRtb25kMR4w
// SIG // HAYDVQQKExVNaWNyb3NvZnQgQ29ycG9yYXRpb24xJjAk
// SIG // BgNVBAMTHU1pY3Jvc29mdCBUaW1lLVN0YW1wIFBDQSAy
// SIG // MDEwAhMzAAABpzW7LsJkhVApAAEAAAGnMA0GCWCGSAFl
// SIG // AwQCAQUAoIIBSjAaBgkqhkiG9w0BCQMxDQYLKoZIhvcN
// SIG // AQkQAQQwLwYJKoZIhvcNAQkEMSIEINKpUTXto+8BF7Rp
// SIG // EuD8uC/vuylZ8jhkHOGwjmq9CRLWMIH6BgsqhkiG9w0B
// SIG // CRACLzGB6jCB5zCB5DCBvQQgR/B/5wmVAuC9GKm897B9
// SIG // 8OZM4cCeEagpF1ysTT7ajhswgZgwgYCkfjB8MQswCQYD
// SIG // VQQGEwJVUzETMBEGA1UECBMKV2FzaGluZ3RvbjEQMA4G
// SIG // A1UEBxMHUmVkbW9uZDEeMBwGA1UEChMVTWljcm9zb2Z0
// SIG // IENvcnBvcmF0aW9uMSYwJAYDVQQDEx1NaWNyb3NvZnQg
// SIG // VGltZS1TdGFtcCBQQ0EgMjAxMAITMwAAAac1uy7CZIVQ
// SIG // KQABAAABpzAiBCCo3uXUAL7Sq/+upj/5EgHdzs0qC7eO
// SIG // dpLglHCy+UpGMjANBgkqhkiG9w0BAQsFAASCAgBFP1MW
// SIG // BzTavW0PFbMVZiLRlZeWLpVrOmk2MoX6oUidZPrn+9Nn
// SIG // QQTfnEhjiRPSjFl0sRG06FvHUDeusnFIEuKdiWHpAFqP
// SIG // 4lsB+2VczKLp0qD5br+ugf+7ON9EzZT7kenaNBpkGRkf
// SIG // AnftqeQX1wP1/CwtrFRGN0CHbzue2oUjBKUsyUc+erWt
// SIG // Tegx0OHyTIg6NV9TyaeiXOOxCxCf6pEFnKf1oBadmmNu
// SIG // NR7PTtKjPH9TCmMhc4NgPPMyUoWGW6rvSRvQQBSOSTiD
// SIG // WmIbh17nmuGl7kPvi788oyY4sT9spW1nMCMsXkS/jcXi
// SIG // xB8NEWsXKZ3AdD7r1dz2VF3dTkSmzVVMrqO4y5thiFkF
// SIG // P9nPFc8z5Dmy0vI2c4CKtB7Tn9ckX0REBQwJbT2/Tbyd
// SIG // Wu8RqGsb/kBDaklfB3Cetz/Ty6SHTRERPPrmSB7Q9Ays
// SIG // LDYDcMk0SH/kgTGnRRJf8Y5myWmWfFAYi9A1gv1+z3UF
// SIG // jj5pigwbjWMYRpmF4qMFGuqAEjT7IU1n6mIC6ge0CsHX
// SIG // rx83AVvswRNBSm91mJzwdRf2HZB5G6sDlliaeloSVF5y
// SIG // 9ANmyE4U+rQnXtZ4t6AN9MuSGW630O8uhdwrLI7n1x2/
// SIG // YqWn0428PEClu+p2buVWHmh3oEp5l6Esv8/ivlA0SVex
// SIG // 5QF/4yc6HUf28N06wA==
// SIG // End signature block
