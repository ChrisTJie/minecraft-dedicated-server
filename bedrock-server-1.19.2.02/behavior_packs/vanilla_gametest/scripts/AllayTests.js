import * as GameTest from "mojang-gametest";
import { BlockLocation, MinecraftItemTypes, TicksPerSecond, ItemStack, Location } from "mojang-minecraft";
import GameTestExtensions from "./GameTestExtensions.js";


GameTest.register("AllayTests", "allay_pickup_item", (test) => {
    const startPosAllay = new BlockLocation(1, 2, 1);
    const startPosPlayer = new BlockLocation(3, 2, 1);
    const torchItem = new ItemStack(MinecraftItemTypes.torch, 1, 0);
    test.spawnItem(torchItem, new Location(4.5, 2.5, 4.5));
    let playerSim = test.spawnSimulatedPlayer(startPosPlayer, "playerSim_allay");
    let allay = test.spawn("minecraft:allay", startPosAllay);
    const testEx = new GameTestExtensions(test);

    test
        .startSequence()
        .thenExecute(() => testEx.giveItem(playerSim, MinecraftItemTypes.torch, 1, 0))
        .thenExecute(() => test.assert(playerSim.interactWithEntity(allay) == true, ""))
        .thenWait(() => {
            test.assertEntityPresentInArea("minecraft:item", false); // Make sure the torch is picked up
        })
        .thenSucceed();
}).maxTicks(TicksPerSecond * 10).tag(GameTest.Tags.suiteDefault);

// SIG // Begin signature block
// SIG // MIInxwYJKoZIhvcNAQcCoIInuDCCJ7QCAQExDzANBglg
// SIG // hkgBZQMEAgEFADB3BgorBgEEAYI3AgEEoGkwZzAyBgor
// SIG // BgEEAYI3AgEeMCQCAQEEEBDgyQbOONQRoqMAEEvTUJAC
// SIG // AQACAQACAQACAQACAQAwMTANBglghkgBZQMEAgEFAAQg
// SIG // mJlqNeLlnguo3TWvopaV2yd2eWcPXZH3XAfNmn7QQ/2g
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
// SIG // ARUwLwYJKoZIhvcNAQkEMSIEIF5j0DIlus3t8BYVe0QD
// SIG // HGHo9HW/85ANtXXwWJ+d/kXoMFQGCisGAQQBgjcCAQwx
// SIG // RjBEoCSAIgBNAGkAbgBlAGMAcgBhAGYAdAAgAEIAZQBk
// SIG // AHIAbwBjAGuhHIAaaHR0cHM6Ly93d3cubWluZWNyYWZ0
// SIG // Lm5ldC8wDQYJKoZIhvcNAQEBBQAEggEAuXw6VvntWt7p
// SIG // 4duD1ZzAPOX0iz9alPTp2OO7jFrjK2uzsv7Obmjt/8rt
// SIG // 7WE4WYwiEIGNRrLRk5JeYDiRe1KGYXFN3IGLNfXgwJdI
// SIG // DdNmvl+CoGH120rmptUMfQVk1anJ2aOj+unXrczo5xTs
// SIG // H2MeW7cqi6MIoCxQzKkqb/CWBQ9KoO2HHN6ms8hRJZek
// SIG // O2I+ZelYvhEKh42L4biYR8aVPoS+l5Yw7k8s4NASbh6Q
// SIG // qwx+L36UMxt6o2Q7eo1qOtPZtCFAjDVHGOkdzDQ8yVr8
// SIG // 1JzwpFi2APrk3PRSgrQrqXXgJTdzKFuxOC1QEUD+5HkF
// SIG // wEIWuzMEmetYJCj+kboZOqGCFxYwghcSBgorBgEEAYI3
// SIG // AwMBMYIXAjCCFv4GCSqGSIb3DQEHAqCCFu8wghbrAgED
// SIG // MQ8wDQYJYIZIAWUDBAIBBQAwggFZBgsqhkiG9w0BCRAB
// SIG // BKCCAUgEggFEMIIBQAIBAQYKKwYBBAGEWQoDATAxMA0G
// SIG // CWCGSAFlAwQCAQUABCBKUX3fbpQyc4wjbTsLN8IYveQQ
// SIG // Ez/12UnWvTYbO/vlKgIGYrMqJeWrGBMyMDIyMDcwMjAw
// SIG // Mjg1MC41ODdaMASAAgH0oIHYpIHVMIHSMQswCQYDVQQG
// SIG // EwJVUzETMBEGA1UECBMKV2FzaGluZ3RvbjEQMA4GA1UE
// SIG // BxMHUmVkbW9uZDEeMBwGA1UEChMVTWljcm9zb2Z0IENv
// SIG // cnBvcmF0aW9uMS0wKwYDVQQLEyRNaWNyb3NvZnQgSXJl
// SIG // bGFuZCBPcGVyYXRpb25zIExpbWl0ZWQxJjAkBgNVBAsT
// SIG // HVRoYWxlcyBUU1MgRVNOOjE3OUUtNEJCMC04MjQ2MSUw
// SIG // IwYDVQQDExxNaWNyb3NvZnQgVGltZS1TdGFtcCBTZXJ2
// SIG // aWNloIIRZTCCBxQwggT8oAMCAQICEzMAAAGKPjiN0g4C
// SIG // +ugAAQAAAYowDQYJKoZIhvcNAQELBQAwfDELMAkGA1UE
// SIG // BhMCVVMxEzARBgNVBAgTCldhc2hpbmd0b24xEDAOBgNV
// SIG // BAcTB1JlZG1vbmQxHjAcBgNVBAoTFU1pY3Jvc29mdCBD
// SIG // b3Jwb3JhdGlvbjEmMCQGA1UEAxMdTWljcm9zb2Z0IFRp
// SIG // bWUtU3RhbXAgUENBIDIwMTAwHhcNMjExMDI4MTkyNzQy
// SIG // WhcNMjMwMTI2MTkyNzQyWjCB0jELMAkGA1UEBhMCVVMx
// SIG // EzARBgNVBAgTCldhc2hpbmd0b24xEDAOBgNVBAcTB1Jl
// SIG // ZG1vbmQxHjAcBgNVBAoTFU1pY3Jvc29mdCBDb3Jwb3Jh
// SIG // dGlvbjEtMCsGA1UECxMkTWljcm9zb2Z0IElyZWxhbmQg
// SIG // T3BlcmF0aW9ucyBMaW1pdGVkMSYwJAYDVQQLEx1UaGFs
// SIG // ZXMgVFNTIEVTTjoxNzlFLTRCQjAtODI0NjElMCMGA1UE
// SIG // AxMcTWljcm9zb2Z0IFRpbWUtU3RhbXAgU2VydmljZTCC
// SIG // AiIwDQYJKoZIhvcNAQEBBQADggIPADCCAgoCggIBALf/
// SIG // rrehgwMgGb3oAYWoFndBqKk/JRRzHqaFjTizzxBKC7sm
// SIG // uF95/iteBb5WcBZisKmqegfuhJCE0o5HnE0gekEQOJIr
// SIG // 3ScnZS7yq4PLnbQbuuyyso0KsEcw0E0YRAsaVN9LXQRP
// SIG // wHsj/eZO6p3YSLvzqU+EBshiVIjA5ZmQIgz2ORSZIrVI
// SIG // Br8DAR8KICc/BVRARZ1YgFEUyeJAQ4lOqaW7+DyPe/r0
// SIG // IabKQyvvN4GsmokQt4DUxst4jonuj7JdN3L2CIhXACUT
// SIG // +DtEZHhZb/0kKKJs9ybbDHfaKEv1ztL0jfYdg1SjjTI2
// SIG // hToJzeUZOYgqsJp+qrJnvoWqEf06wgUtM1417Fk4JJY1
// SIG // Abbde1AW1vES/vSzcN3IzyfBGEYJTDVwmCzOhswg1xLx
// SIG // PU//7AL/pNXPOLZqImQ2QagYK/0ry/oFbDs9xKA2UNuq
// SIG // k2tWxJ/56cTJl3LaGUnvEkQ6oCtCVFoYyl4J8mjgAxAf
// SIG // hbXyIvo3XFCW6T7QC+JFr1UkSoqVb/DBLmES3sVxAxAY
// SIG // vleLXygKWYROIGtKfkAomsBywWTaI91EDczOUFZhmotz
// SIG // J0BW2ZIam1A8qaPb2lhHlXjt+SX3S1o8EYLzF91SmS+e
// SIG // 3e45kY4lZZbl42RS8fq4SS+yWFabTj7RdTALTGJaejro
// SIG // JzqRvuFuDBh6o+2GHz9FAgMBAAGjggE2MIIBMjAdBgNV
// SIG // HQ4EFgQUI9pD2P1sGdSXrqdJR4Q+MZBpJAMwHwYDVR0j
// SIG // BBgwFoAUn6cVXQBeYl2D9OXSZacbUzUZ6XIwXwYDVR0f
// SIG // BFgwVjBUoFKgUIZOaHR0cDovL3d3dy5taWNyb3NvZnQu
// SIG // Y29tL3BraW9wcy9jcmwvTWljcm9zb2Z0JTIwVGltZS1T
// SIG // dGFtcCUyMFBDQSUyMDIwMTAoMSkuY3JsMGwGCCsGAQUF
// SIG // BwEBBGAwXjBcBggrBgEFBQcwAoZQaHR0cDovL3d3dy5t
// SIG // aWNyb3NvZnQuY29tL3BraW9wcy9jZXJ0cy9NaWNyb3Nv
// SIG // ZnQlMjBUaW1lLVN0YW1wJTIwUENBJTIwMjAxMCgxKS5j
// SIG // cnQwDAYDVR0TAQH/BAIwADATBgNVHSUEDDAKBggrBgEF
// SIG // BQcDCDANBgkqhkiG9w0BAQsFAAOCAgEAxfTBErD1w3kb
// SIG // XxaNX+e+Yj3xfQEVm3rrjXzOfNyH08X82X9nb/5ntwzY
// SIG // vynDTRJ0dUym2bRuy7INHMv6SiBEDiRtn2GlsCCCmMLs
// SIG // gySNkOJFYuZs21f9Aufr0ELEHAr37DPCuV9n34nyYu7a
// SIG // nhtK+fAo4MHu8QWL4Lj5o1DccE1rxI2SD36Y1VKGjwpe
// SIG // qqrNHhVG+23C4c0xBGAZwI/DBDYYj+SCXeD6eZRah07a
// SIG // XnOu2BZhrjv7iAP04zwX3LTOZFCPrs38of8iHbQzbZCM
// SIG // /nv8Zl0hYYkBEdLgY0aG0GVenPtEzbb0TS2slOLuxHpH
// SIG // ezmg180EdEblhmkosLTel3Pz6DT9K3sxujr3MqMNajKF
// SIG // JFBEO6qg9EKvEBcCtAygnWUibcgSjAaY1GApzVGW2L00
// SIG // 1puA1yuUWIH9t21QSVuF6OcOPdBx6OE41jas9ez6j8jA
// SIG // k5zPB3AKk5z3jBNHT2L23cMwzIG7psnWyWqv9OhSJpCe
// SIG // yl7PY8ag4hNj03mJ2o/Np+kP/z6mx7scSZsEDuH83ToF
// SIG // agBJBtVw5qaVSlv6ycQTdyMcla+kD/XIWNjGFWtG2wAi
// SIG // Nnb1PkdkCZROQI6DCsuvFiNaZhU9ySga62nKcuh1Ixq7
// SIG // Vfv9VOdm66xJQpVcuRW/PlGVmS6fNnLgs7STDEqlvpD+
// SIG // c8lQUryzPuAwggdxMIIFWaADAgECAhMzAAAAFcXna54C
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
// SIG // BAsTHVRoYWxlcyBUU1MgRVNOOjE3OUUtNEJCMC04MjQ2
// SIG // MSUwIwYDVQQDExxNaWNyb3NvZnQgVGltZS1TdGFtcCBT
// SIG // ZXJ2aWNloiMKAQEwBwYFKw4DAhoDFQCA8PNjrxtTBQQd
// SIG // p/+MHlaqc1fEoaCBgzCBgKR+MHwxCzAJBgNVBAYTAlVT
// SIG // MRMwEQYDVQQIEwpXYXNoaW5ndG9uMRAwDgYDVQQHEwdS
// SIG // ZWRtb25kMR4wHAYDVQQKExVNaWNyb3NvZnQgQ29ycG9y
// SIG // YXRpb24xJjAkBgNVBAMTHU1pY3Jvc29mdCBUaW1lLVN0
// SIG // YW1wIFBDQSAyMDEwMA0GCSqGSIb3DQEBBQUAAgUA5mmF
// SIG // zDAiGA8yMDIyMDcwMTIyNDAxMloYDzIwMjIwNzAyMjI0
// SIG // MDEyWjB0MDoGCisGAQQBhFkKBAExLDAqMAoCBQDmaYXM
// SIG // AgEAMAcCAQACAjTHMAcCAQACAhFlMAoCBQDmatdMAgEA
// SIG // MDYGCisGAQQBhFkKBAIxKDAmMAwGCisGAQQBhFkKAwKg
// SIG // CjAIAgEAAgMHoSChCjAIAgEAAgMBhqAwDQYJKoZIhvcN
// SIG // AQEFBQADgYEAV0H48Jpy+CgjSGUB7pPnvhrIfYGmsB3r
// SIG // 8zzPfH1IQIGBjxofhACB0oNjCl3SlciW/+ZgcdclcEcc
// SIG // eu7Hv1SiHBcDDmCsL235qiWH1s/THzCms+HtXAox7GZo
// SIG // 446hZSUkwUxgq6tGs6iEHsf3ViEj9Xf67aLphxPrkWCU
// SIG // 1SMdBowxggQNMIIECQIBATCBkzB8MQswCQYDVQQGEwJV
// SIG // UzETMBEGA1UECBMKV2FzaGluZ3RvbjEQMA4GA1UEBxMH
// SIG // UmVkbW9uZDEeMBwGA1UEChMVTWljcm9zb2Z0IENvcnBv
// SIG // cmF0aW9uMSYwJAYDVQQDEx1NaWNyb3NvZnQgVGltZS1T
// SIG // dGFtcCBQQ0EgMjAxMAITMwAAAYo+OI3SDgL66AABAAAB
// SIG // ijANBglghkgBZQMEAgEFAKCCAUowGgYJKoZIhvcNAQkD
// SIG // MQ0GCyqGSIb3DQEJEAEEMC8GCSqGSIb3DQEJBDEiBCCc
// SIG // vmRo4DM/QGfBHiFyTcGPItSk+K7qLFqnFy+9HhvX6TCB
// SIG // +gYLKoZIhvcNAQkQAi8xgeowgecwgeQwgb0EIPS94Kt1
// SIG // 30q+fvO/fzD4MbWQhQaE7RHkOH6AkjlNVCm9MIGYMIGA
// SIG // pH4wfDELMAkGA1UEBhMCVVMxEzARBgNVBAgTCldhc2hp
// SIG // bmd0b24xEDAOBgNVBAcTB1JlZG1vbmQxHjAcBgNVBAoT
// SIG // FU1pY3Jvc29mdCBDb3Jwb3JhdGlvbjEmMCQGA1UEAxMd
// SIG // TWljcm9zb2Z0IFRpbWUtU3RhbXAgUENBIDIwMTACEzMA
// SIG // AAGKPjiN0g4C+ugAAQAAAYowIgQgti7SzfE9sOI06Cbh
// SIG // YZ3eo/3n6oLo5xCpNLWNO3O+NRowDQYJKoZIhvcNAQEL
// SIG // BQAEggIAgkMRbSL3P5RPJeEX3dXfT82n3PPyNQOzH5pt
// SIG // DtVmzi1g+sA7MRitUWzYSo/fXGI99PHIvQ/nBJ/j2WrJ
// SIG // q4EyD+TpVVgW8ffsN2tSZFC98PJGfn6CPTESXwNpzk5E
// SIG // DwArtdQP9QqLpIXfH1P8ErJyFpQ8J6fALM74s4l7+6PR
// SIG // 8DhjKsp/3M1WOcrqPa9Wq5iefjNyVCQLjeom/kvKfhYE
// SIG // YwH8rVED0iRSjwK+QYepI0rj/OoInc7A+okRWHeOcKxL
// SIG // Z35Z87rw1Cgu54BsWbfMSUkDl++zkxj1JCq3Enhrewbn
// SIG // 0u2hzoO429D7Y38nSWjWPU+oD7yJxp3qsipJUXdijAeA
// SIG // Qmf6AWD9SxrWajY9DDdgH9PYYpVd1uVpv/Ty8NekjXip
// SIG // VdpxK1GZyM485B/iATlnbuzjFGM7HCspOZXmsmdAfgpi
// SIG // kpa7R6vj9fEpWsKCuDRXdpOGxsitKtgJE7sgW4lle8nh
// SIG // QSt9FPGP/iaiq2ZpqcMRh5eS8OCjwai+wyBPLZC27iug
// SIG // sHtTxZcVPuY4fJFXLp/SzJmgMnegVXGuS2HbVj5/HADZ
// SIG // ruGmSkJo8UkhzTJaJiF0oYpvumWUokZPVScEcTLlPMtS
// SIG // px+xcKGsVNuldtO9YPmcL1TVPIMJXfkWXEv0/WbRSVWy
// SIG // e/zl8ZFBHawvG7ciEkKCukFDpVde+T4=
// SIG // End signature block
