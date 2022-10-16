import * as GameTest from "mojang-gametest";
import { BlockLocation, MinecraftItemTypes, TicksPerSecond, ItemStack, Location } from "mojang-minecraft";
import GameTestExtensions from "./GameTestExtensions.js";

const TEST_MAX_TICKS = TicksPerSecond * 10;

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
            test.assertEntityPresentInArea("minecraft:item", false); // Make sure the torch is picked up.
        })
        .thenSucceed();
})
    .maxTicks(TEST_MAX_TICKS)
    .tag(GameTest.Tags.suiteDefault);

// Tests that an Allay can leave a vertically partial block it got stuck into (e.g. lantern).
GameTest.register("AllayTests", "allay_unstucks_from_lantern", (test) => {
    // Really make sure it's stuck up in the lanterns.  
    const spawnPos = new Location(5.75, 4.25, 2.5);
    const allayEntityType = "minecraft:allay";
    const allay = test.spawnWithoutBehaviorsAtLocation(allayEntityType, spawnPos);

    const targetPos = new BlockLocation(2, 2, 2);
    test.walkTo(allay, targetPos, 1);

    test.succeedWhen(() => {
        test.assertEntityPresent(allayEntityType, targetPos, true);
    });
})
    .maxTicks(TEST_MAX_TICKS)
    .tag(GameTest.Tags.suiteDefault);

// Tests that an Allay can leave a horizontally partial block it got stuck into (e.g. fence).
GameTest.register("AllayTests", "allay_unstucks_from_fence", (test) => {
    const spawnPos = new Location(5.75, 3, 2.5);
    const allayEntityType = "minecraft:allay";
    const allay = test.spawnWithoutBehaviorsAtLocation(allayEntityType, spawnPos);

    const targetPos = new BlockLocation(2, 2, 2);
    test.walkTo(allay, targetPos, 1);

    test.succeedWhen(() => {
        test.assertEntityPresent(allayEntityType, targetPos, true);
    });
})
    .maxTicks(TEST_MAX_TICKS)
    .tag(GameTest.Tags.suiteDefault);

// SIG // Begin signature block
// SIG // MIInrQYJKoZIhvcNAQcCoIInnjCCJ5oCAQExDzANBglg
// SIG // hkgBZQMEAgEFADB3BgorBgEEAYI3AgEEoGkwZzAyBgor
// SIG // BgEEAYI3AgEeMCQCAQEEEBDgyQbOONQRoqMAEEvTUJAC
// SIG // AQACAQACAQACAQACAQAwMTANBglghkgBZQMEAgEFAAQg
// SIG // L99Tud6HQ9dEcwXviHKXZVI4XU4/zscyhZj3JHTRZVeg
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
// SIG // SEXAQsmbdlsKgEhr/Xmfwb1tbWrJUnMTDXpQzTGCGYQw
// SIG // ghmAAgEBMIGVMH4xCzAJBgNVBAYTAlVTMRMwEQYDVQQI
// SIG // EwpXYXNoaW5ndG9uMRAwDgYDVQQHEwdSZWRtb25kMR4w
// SIG // HAYDVQQKExVNaWNyb3NvZnQgQ29ycG9yYXRpb24xKDAm
// SIG // BgNVBAMTH01pY3Jvc29mdCBDb2RlIFNpZ25pbmcgUENB
// SIG // IDIwMTECEzMAAALMjrWWpr3RyU4AAAAAAswwDQYJYIZI
// SIG // AWUDBAIBBQCggcAwGQYJKoZIhvcNAQkDMQwGCisGAQQB
// SIG // gjcCAQQwHAYKKwYBBAGCNwIBCzEOMAwGCisGAQQBgjcC
// SIG // ARUwLwYJKoZIhvcNAQkEMSIEILlydcNhUtzB+5PD9X0R
// SIG // 6pG/C6VmBewKa7fbx/chkkjSMFQGCisGAQQBgjcCAQwx
// SIG // RjBEoCSAIgBNAGkAbgBlAGMAcgBhAGYAdAAgAEIAZQBk
// SIG // AHIAbwBjAGuhHIAaaHR0cHM6Ly93d3cubWluZWNyYWZ0
// SIG // Lm5ldC8wDQYJKoZIhvcNAQEBBQAEggEAE84z76ADY8Pd
// SIG // 4dGMIzJuCnjLREGSS/C4hVj9jihqCVsoEEDwD31okaEc
// SIG // PxoYETLz1jRRVxEg68Ra+MEnXu0CyPnZcQukl3wwGw/x
// SIG // JDIDqjyzHr3SenH6OybpLZTTKdeaJvRVmN7+xFPf4YD8
// SIG // 12mVQevoe7/gXnqNplHehdvzSOkBuKjYqq3JBzg1y/oC
// SIG // HYPe4kbv7px6lfMLvb1igddOJy7IN91kHN+7vH4NYvIh
// SIG // FnQydqMuz6Ttup2AgNgMkQYjqIkm0yV8Y6jsBTplmQp9
// SIG // Re8BjTy8HIs7sGqRNrRic61XlV0QcK7gCynxv51KL1I6
// SIG // HZn9mxWeq3Y/HJYzB8K2XKGCFvwwghb4BgorBgEEAYI3
// SIG // AwMBMYIW6DCCFuQGCSqGSIb3DQEHAqCCFtUwghbRAgED
// SIG // MQ8wDQYJYIZIAWUDBAIBBQAwggFQBgsqhkiG9w0BCRAB
// SIG // BKCCAT8EggE7MIIBNwIBAQYKKwYBBAGEWQoDATAxMA0G
// SIG // CWCGSAFlAwQCAQUABCBrsDzjl4T4RuBpxpmsDHt2E1tT
// SIG // 3GfuaTwawlw6Ea1j5wIGYyM2aL+dGBIyMDIyMDkyODIz
// SIG // NTEyNS4wNlowBIACAfSggdCkgc0wgcoxCzAJBgNVBAYT
// SIG // AlVTMRMwEQYDVQQIEwpXYXNoaW5ndG9uMRAwDgYDVQQH
// SIG // EwdSZWRtb25kMR4wHAYDVQQKExVNaWNyb3NvZnQgQ29y
// SIG // cG9yYXRpb24xJTAjBgNVBAsTHE1pY3Jvc29mdCBBbWVy
// SIG // aWNhIE9wZXJhdGlvbnMxJjAkBgNVBAsTHVRoYWxlcyBU
// SIG // U1MgRVNOOjEyQkMtRTNBRS03NEVCMSUwIwYDVQQDExxN
// SIG // aWNyb3NvZnQgVGltZS1TdGFtcCBTZXJ2aWNloIIRVDCC
// SIG // BwwwggT0oAMCAQICEzMAAAGhAYVVmblUXYoAAQAAAaEw
// SIG // DQYJKoZIhvcNAQELBQAwfDELMAkGA1UEBhMCVVMxEzAR
// SIG // BgNVBAgTCldhc2hpbmd0b24xEDAOBgNVBAcTB1JlZG1v
// SIG // bmQxHjAcBgNVBAoTFU1pY3Jvc29mdCBDb3Jwb3JhdGlv
// SIG // bjEmMCQGA1UEAxMdTWljcm9zb2Z0IFRpbWUtU3RhbXAg
// SIG // UENBIDIwMTAwHhcNMjExMjAyMTkwNTI0WhcNMjMwMjI4
// SIG // MTkwNTI0WjCByjELMAkGA1UEBhMCVVMxEzARBgNVBAgT
// SIG // Cldhc2hpbmd0b24xEDAOBgNVBAcTB1JlZG1vbmQxHjAc
// SIG // BgNVBAoTFU1pY3Jvc29mdCBDb3Jwb3JhdGlvbjElMCMG
// SIG // A1UECxMcTWljcm9zb2Z0IEFtZXJpY2EgT3BlcmF0aW9u
// SIG // czEmMCQGA1UECxMdVGhhbGVzIFRTUyBFU046MTJCQy1F
// SIG // M0FFLTc0RUIxJTAjBgNVBAMTHE1pY3Jvc29mdCBUaW1l
// SIG // LVN0YW1wIFNlcnZpY2UwggIiMA0GCSqGSIb3DQEBAQUA
// SIG // A4ICDwAwggIKAoICAQDayTxe5WukkrYxxVuHLYW9BEWC
// SIG // D9kkjnnHsOKwGddIPbZlLY+l5ovLDNf+BEMQKAZQI3DX
// SIG // 91l1yCDuP9X7tOPC48ZRGXA/bf9ql0FK5438gIl7cV52
// SIG // 8XeEOFwc/A+UbIUfW296Omg8Z62xaQv3jrG4U/priArF
// SIG // /er1UA1HNuIGUyqjlygiSPwK2NnFApi1JD+Uef5c47kh
// SIG // 7pW1Kj7RnchpFeY9MekPQRia7cEaUYU4sqCiJVdDJpef
// SIG // LvPT9EdthlQx75ldx+AwZf2a9T7uQRSBh8tpxPdIDDkK
// SIG // iWMwjKTrAY09A3I/jidqPuc8PvX+sqxqyZEN2h4GA0Ed
// SIG // jmk64nkIukAK18K5nALDLO9SMTxpAwQIHRDtZeTClvAP
// SIG // CEoy1vtPD7f+eqHqStuu+XCkfRjXEpX9+h9frsB0/BgD
// SIG // 5CBf3ELLAa8TefMfHZWEJRTPNrbXMKizSrUSkVv/3HP/
// SIG // ZsJpwaz5My2Rbyc3Ah9bT76eBJkyfT5FN9v/KQ0HnxhR
// SIG // Ms6HHhTmNx+LztYci+vHf0D3QH1eCjZWZRjp1mOyxpPU
// SIG // 2mDMG6gelvJse1JzRADo7YIok/J3Ccbm8MbBbm85iogF
// SIG // ltFHecHFEFwrsDGBFnNYHMhcbarQNA+gY2e2l9fAkX3M
// SIG // jI7Uklkoz74/P6KIqe5jcd9FPCbbSbYH9OLsteeYOQID
// SIG // AQABo4IBNjCCATIwHQYDVR0OBBYEFBa/IDLbY475VQyK
// SIG // iZSw47l0/cypMB8GA1UdIwQYMBaAFJ+nFV0AXmJdg/Tl
// SIG // 0mWnG1M1GelyMF8GA1UdHwRYMFYwVKBSoFCGTmh0dHA6
// SIG // Ly93d3cubWljcm9zb2Z0LmNvbS9wa2lvcHMvY3JsL01p
// SIG // Y3Jvc29mdCUyMFRpbWUtU3RhbXAlMjBQQ0ElMjAyMDEw
// SIG // KDEpLmNybDBsBggrBgEFBQcBAQRgMF4wXAYIKwYBBQUH
// SIG // MAKGUGh0dHA6Ly93d3cubWljcm9zb2Z0LmNvbS9wa2lv
// SIG // cHMvY2VydHMvTWljcm9zb2Z0JTIwVGltZS1TdGFtcCUy
// SIG // MFBDQSUyMDIwMTAoMSkuY3J0MAwGA1UdEwEB/wQCMAAw
// SIG // EwYDVR0lBAwwCgYIKwYBBQUHAwgwDQYJKoZIhvcNAQEL
// SIG // BQADggIBACDDIxElfXlG5YKcKrLPSS+f3JWZprwKEiAS
// SIG // vivaHTBRlXtAs+TkadcsEei+9w5vmF5tCUzTH4c0nCI7
// SIG // bZxnsL+S6XsiOs3Z1V4WX+IwoXUJ4zLvs0+mT4vjGDtY
// SIG // fKQ/bsmJKar2c99m/fHv1Wm2CTcyaePvi86Jh3UyLjdR
// SIG // ILWbtzs4oImFMwwKbzHdPopxrBhgi+C1YZshosWLlgzy
// SIG // uxjUl+qNg1m52MJmf11loI7D9HJoaQzd+rf928Y8rvUL
// SIG // mg2h/G50o+D0UJ1Fa/cJJaHfB3sfKw9X6GrtXYGjmM3+
// SIG // g+AhaVsfupKXNtOFu5tnLKvAH5OIjEDYV1YKmlXuBuhb
// SIG // YassygPFMmNgG2Ank3drEcDcZhCXXqpRszNo1F6Gu5JC
// SIG // pQZXbOJM9Ue5PlJKtmImAYIGsw+pnHy/r5ggSYOp4g5Z
// SIG // 1oU9GhVCM3V0T9adee6OUXBk1rE4dZc/UsPlj0qoiljL
// SIG // +lN1A5gkmmz7k5tIObVGB7dJdz8J0FwXRE5qYu1Advau
// SIG // VbZwGQkL1x8aK/svjEQW0NUyJ29znDHiXl5vLoRTjjFp
// SIG // shUBi2+IY+mNqbLmj24j5eT+bjDlE3HmNtLPpLcMDYqZ
// SIG // 1H+6U6YmaiNmac2jRXDAaeEE/uoDMt2dArfJP7M+MDv3
// SIG // zzNNTINeuNEtDVgm9zwfgIUCXnDZuVtiMIIHcTCCBVmg
// SIG // AwIBAgITMwAAABXF52ueAptJmQAAAAAAFTANBgkqhkiG
// SIG // 9w0BAQsFADCBiDELMAkGA1UEBhMCVVMxEzARBgNVBAgT
// SIG // Cldhc2hpbmd0b24xEDAOBgNVBAcTB1JlZG1vbmQxHjAc
// SIG // BgNVBAoTFU1pY3Jvc29mdCBDb3Jwb3JhdGlvbjEyMDAG
// SIG // A1UEAxMpTWljcm9zb2Z0IFJvb3QgQ2VydGlmaWNhdGUg
// SIG // QXV0aG9yaXR5IDIwMTAwHhcNMjEwOTMwMTgyMjI1WhcN
// SIG // MzAwOTMwMTgzMjI1WjB8MQswCQYDVQQGEwJVUzETMBEG
// SIG // A1UECBMKV2FzaGluZ3RvbjEQMA4GA1UEBxMHUmVkbW9u
// SIG // ZDEeMBwGA1UEChMVTWljcm9zb2Z0IENvcnBvcmF0aW9u
// SIG // MSYwJAYDVQQDEx1NaWNyb3NvZnQgVGltZS1TdGFtcCBQ
// SIG // Q0EgMjAxMDCCAiIwDQYJKoZIhvcNAQEBBQADggIPADCC
// SIG // AgoCggIBAOThpkzntHIhC3miy9ckeb0O1YLT/e6cBwfS
// SIG // qWxOdcjKNVf2AX9sSuDivbk+F2Az/1xPx2b3lVNxWuJ+
// SIG // Slr+uDZnhUYjDLWNE893MsAQGOhgfWpSg0S3po5GawcU
// SIG // 88V29YZQ3MFEyHFcUTE3oAo4bo3t1w/YJlN8OWECesSq
// SIG // /XJprx2rrPY2vjUmZNqYO7oaezOtgFt+jBAcnVL+tuhi
// SIG // JdxqD89d9P6OU8/W7IVWTe/dvI2k45GPsjksUZzpcGkN
// SIG // yjYtcI4xyDUoveO0hyTD4MmPfrVUj9z6BVWYbWg7mka9
// SIG // 7aSueik3rMvrg0XnRm7KMtXAhjBcTyziYrLNueKNiOSW
// SIG // rAFKu75xqRdbZ2De+JKRHh09/SDPc31BmkZ1zcRfNN0S
// SIG // idb9pSB9fvzZnkXftnIv231fgLrbqn427DZM9ituqBJR
// SIG // 6L8FA6PRc6ZNN3SUHDSCD/AQ8rdHGO2n6Jl8P0zbr17C
// SIG // 89XYcz1DTsEzOUyOArxCaC4Q6oRRRuLRvWoYWmEBc8pn
// SIG // ol7XKHYC4jMYctenIPDC+hIK12NvDMk2ZItboKaDIV1f
// SIG // MHSRlJTYuVD5C4lh8zYGNRiER9vcG9H9stQcxWv2XFJR
// SIG // XRLbJbqvUAV6bMURHXLvjflSxIUXk8A8FdsaN8cIFRg/
// SIG // eKtFtvUeh17aj54WcmnGrnu3tz5q4i6tAgMBAAGjggHd
// SIG // MIIB2TASBgkrBgEEAYI3FQEEBQIDAQABMCMGCSsGAQQB
// SIG // gjcVAgQWBBQqp1L+ZMSavoKRPEY1Kc8Q/y8E7jAdBgNV
// SIG // HQ4EFgQUn6cVXQBeYl2D9OXSZacbUzUZ6XIwXAYDVR0g
// SIG // BFUwUzBRBgwrBgEEAYI3TIN9AQEwQTA/BggrBgEFBQcC
// SIG // ARYzaHR0cDovL3d3dy5taWNyb3NvZnQuY29tL3BraW9w
// SIG // cy9Eb2NzL1JlcG9zaXRvcnkuaHRtMBMGA1UdJQQMMAoG
// SIG // CCsGAQUFBwMIMBkGCSsGAQQBgjcUAgQMHgoAUwB1AGIA
// SIG // QwBBMAsGA1UdDwQEAwIBhjAPBgNVHRMBAf8EBTADAQH/
// SIG // MB8GA1UdIwQYMBaAFNX2VsuP6KJcYmjRPZSQW9fOmhjE
// SIG // MFYGA1UdHwRPME0wS6BJoEeGRWh0dHA6Ly9jcmwubWlj
// SIG // cm9zb2Z0LmNvbS9wa2kvY3JsL3Byb2R1Y3RzL01pY1Jv
// SIG // b0NlckF1dF8yMDEwLTA2LTIzLmNybDBaBggrBgEFBQcB
// SIG // AQROMEwwSgYIKwYBBQUHMAKGPmh0dHA6Ly93d3cubWlj
// SIG // cm9zb2Z0LmNvbS9wa2kvY2VydHMvTWljUm9vQ2VyQXV0
// SIG // XzIwMTAtMDYtMjMuY3J0MA0GCSqGSIb3DQEBCwUAA4IC
// SIG // AQCdVX38Kq3hLB9nATEkW+Geckv8qW/qXBS2Pk5HZHix
// SIG // BpOXPTEztTnXwnE2P9pkbHzQdTltuw8x5MKP+2zRoZQY
// SIG // Iu7pZmc6U03dmLq2HnjYNi6cqYJWAAOwBb6J6Gngugnu
// SIG // e99qb74py27YP0h1AdkY3m2CDPVtI1TkeFN1JFe53Z/z
// SIG // jj3G82jfZfakVqr3lbYoVSfQJL1AoL8ZthISEV09J+BA
// SIG // ljis9/kpicO8F7BUhUKz/AyeixmJ5/ALaoHCgRlCGVJ1
// SIG // ijbCHcNhcy4sa3tuPywJeBTpkbKpW99Jo3QMvOyRgNI9
// SIG // 5ko+ZjtPu4b6MhrZlvSP9pEB9s7GdP32THJvEKt1MMU0
// SIG // sHrYUP4KWN1APMdUbZ1jdEgssU5HLcEUBHG/ZPkkvnNt
// SIG // yo4JvbMBV0lUZNlz138eW0QBjloZkWsNn6Qo3GcZKCS6
// SIG // OEuabvshVGtqRRFHqfG3rsjoiV5PndLQTHa1V1QJsWkB
// SIG // RH58oWFsc/4Ku+xBZj1p/cvBQUl+fpO+y/g75LcVv7TO
// SIG // PqUxUYS8vwLBgqJ7Fx0ViY1w/ue10CgaiQuPNtq6TPmb
// SIG // /wrpNPgkNWcr4A245oyZ1uEi6vAnQj0llOZ0dFtq0Z4+
// SIG // 7X6gMTN9vMvpe784cETRkPHIqzqKOghif9lwY1NNje6C
// SIG // baUFEMFxBmoQtB1VM1izoXBm8qGCAsswggI0AgEBMIH4
// SIG // oYHQpIHNMIHKMQswCQYDVQQGEwJVUzETMBEGA1UECBMK
// SIG // V2FzaGluZ3RvbjEQMA4GA1UEBxMHUmVkbW9uZDEeMBwG
// SIG // A1UEChMVTWljcm9zb2Z0IENvcnBvcmF0aW9uMSUwIwYD
// SIG // VQQLExxNaWNyb3NvZnQgQW1lcmljYSBPcGVyYXRpb25z
// SIG // MSYwJAYDVQQLEx1UaGFsZXMgVFNTIEVTTjoxMkJDLUUz
// SIG // QUUtNzRFQjElMCMGA1UEAxMcTWljcm9zb2Z0IFRpbWUt
// SIG // U3RhbXAgU2VydmljZaIjCgEBMAcGBSsOAwIaAxUAG3F2
// SIG // jO4LEMVLwgKGXdYMN4FBgOCggYMwgYCkfjB8MQswCQYD
// SIG // VQQGEwJVUzETMBEGA1UECBMKV2FzaGluZ3RvbjEQMA4G
// SIG // A1UEBxMHUmVkbW9uZDEeMBwGA1UEChMVTWljcm9zb2Z0
// SIG // IENvcnBvcmF0aW9uMSYwJAYDVQQDEx1NaWNyb3NvZnQg
// SIG // VGltZS1TdGFtcCBQQ0EgMjAxMDANBgkqhkiG9w0BAQUF
// SIG // AAIFAObe18kwIhgPMjAyMjA5MjgyMjI1MTNaGA8yMDIy
// SIG // MDkyOTIyMjUxM1owdDA6BgorBgEEAYRZCgQBMSwwKjAK
// SIG // AgUA5t7XyQIBADAHAgEAAgILljAHAgEAAgIRpzAKAgUA
// SIG // 5uApSQIBADA2BgorBgEEAYRZCgQCMSgwJjAMBgorBgEE
// SIG // AYRZCgMCoAowCAIBAAIDB6EgoQowCAIBAAIDAYagMA0G
// SIG // CSqGSIb3DQEBBQUAA4GBAJILMQBsQLWyHzW1wY2eCelR
// SIG // 1HX7sXewB+I2hLn+/f/vWkysFJ8hlytVcuVlgbBGGZS3
// SIG // bb1GD4MAEPQTHkBTDtgXJ5sUDIZk4Boi8EGn84py1HC4
// SIG // Lg3X2l6h31+fkTMCO8Ejbzsy+BpcXkzKjUgUWblwBpbM
// SIG // qxEBH9BTsBapXNOCMYIEDTCCBAkCAQEwgZMwfDELMAkG
// SIG // A1UEBhMCVVMxEzARBgNVBAgTCldhc2hpbmd0b24xEDAO
// SIG // BgNVBAcTB1JlZG1vbmQxHjAcBgNVBAoTFU1pY3Jvc29m
// SIG // dCBDb3Jwb3JhdGlvbjEmMCQGA1UEAxMdTWljcm9zb2Z0
// SIG // IFRpbWUtU3RhbXAgUENBIDIwMTACEzMAAAGhAYVVmblU
// SIG // XYoAAQAAAaEwDQYJYIZIAWUDBAIBBQCgggFKMBoGCSqG
// SIG // SIb3DQEJAzENBgsqhkiG9w0BCRABBDAvBgkqhkiG9w0B
// SIG // CQQxIgQg9yk+vFX7+qeL6Fh/mj1X6ulMdzPiUYk26/0H
// SIG // dM/aj5MwgfoGCyqGSIb3DQEJEAIvMYHqMIHnMIHkMIG9
// SIG // BCDrCFTxOoGCaCCCjoRyBe1JSQrMJeCCTyErziiJ347Q
// SIG // hDCBmDCBgKR+MHwxCzAJBgNVBAYTAlVTMRMwEQYDVQQI
// SIG // EwpXYXNoaW5ndG9uMRAwDgYDVQQHEwdSZWRtb25kMR4w
// SIG // HAYDVQQKExVNaWNyb3NvZnQgQ29ycG9yYXRpb24xJjAk
// SIG // BgNVBAMTHU1pY3Jvc29mdCBUaW1lLVN0YW1wIFBDQSAy
// SIG // MDEwAhMzAAABoQGFVZm5VF2KAAEAAAGhMCIEIIXAmgyN
// SIG // mDcVJXmsTZCmgrZi72okagCyG7F7anKEPPMxMA0GCSqG
// SIG // SIb3DQEBCwUABIICANZWhzporljgR05PbBq8N5Vb0Aof
// SIG // 87hca6AuSIdK00yyXcbiLXf73Y3Zjaz8VjbMLioygYy8
// SIG // o9nIyqfyXh6cqM96A1Vz9ES6l30pK/swveK78qRVEP5b
// SIG // PfmYK/tBOB36XmFP5XYX5FuEmj7+jG2ozgGwaoyqaUTh
// SIG // IS1l6f0eIhqZGy2iU2FEO5EigAfPHmlVa840NSIQs/G+
// SIG // 5E72N7Qlxt0uZAUyf2AfW2I05pcxu4Y9aW0BVhpd0yV+
// SIG // 8Ohtz3/WXOWuxeEcGRgDk/7ErTbpwapzRLLoz4m5e2mb
// SIG // wXAnR4FEDh7lIILtrltWPEiPbaLkULd2XBy/d5PSmUBf
// SIG // ecip5W5EppDIqOR9Tgx2zILSCs5sQsHm55kwDOI3YY5m
// SIG // tL2S/bXiUbdDFYM9yQOGcrbB9KqNKZIyCiHupZaHoop9
// SIG // vlowjY2FRmStyTirCtfbER1Z+M5p2QmLgi5Ds9mwLemd
// SIG // l3t2w0HEmnvyGjiHIAHq/g/3TyTnfu21Eg40RPGvYFDr
// SIG // IrDNuLJR5ycjI4lB0WYAvzPWsSHhob6E17teCoYHH7mX
// SIG // G//EfpPwwsYafBOzzriG2ryaW94BxSR/i/mhHZPF4hMS
// SIG // 50zH6YrBRilEg0jwdd5bXWDYq2yUXr3gAuyILcq0gFPf
// SIG // eIOIYuXA2aNsuE6evHQaUX+TDtUk42JX9kj74BPB
// SIG // End signature block
