import * as GameTest from "mojang-gametest";
import {
	BlockLocation,
	Direction,
	ItemStack,
	Location,
	MinecraftBlockTypes,
	MinecraftItemTypes,
	world,
} from "mojang-minecraft";
import GameTestExtensions from "./GameTestExtensions.js";


const ticksPerSecond = 20;

GameTest.register("EnchantmentTests", "frostwalker_freezes_water", (test) => {
		
	const spawnLoc = new BlockLocation(5, 5, 2);
	const landLoc = new BlockLocation(5, 3, 2);
	const iceLoc = new BlockLocation(3, 2, 2);
	const playerName = "Test Player";
	const player = test.spawnSimulatedPlayer(spawnLoc, playerName);	

	test
    .startSequence()
	.thenIdle(10) //Frostwalker boots added here through a dispenser
	.thenExecute(() => {
		player.move(-1, 0);
	})
    .thenExecuteAfter(ticksPerSecond, () => {
		test.assertBlockPresent(MinecraftBlockTypes.frostedIce, iceLoc, true);
    })
    .thenSucceed();
})
	.structureName("EnchantmentTests:FrostWalkerFreezesWater")
	.maxTicks(ticksPerSecond * 3)
	.tag(GameTest.Tags.suiteDefault);

GameTest.register("EnchantmentTests", "spectator_with_frostwalker_doesnt_freeze_water", (test) => {
		
	const spawnLoc = new BlockLocation(5, 5, 2);
	const landLoc = new BlockLocation(5, 3, 2);
	const waterLoc = new BlockLocation(3, 2, 2);
	const playerName = "Test Player";
	const player = test.spawnSimulatedPlayer(spawnLoc, playerName);	

	test
    .startSequence()
	.thenIdle(60) //Frostwalker boots added here through a dispenser
	.thenExecute(() => {
		player.runCommand("gamemode spectator");
		player.move(-1, 0);
	})
	.thenIdle(10)
	.thenExecute(() => {
		player.setGameMode(1);
		player.stopMoving();
	})
    .thenExecuteAfter(ticksPerSecond, () => {
		test.assertBlockPresent(MinecraftBlockTypes.water, waterLoc, true);
    })
    .thenSucceed();
})
	.structureName("EnchantmentTests:SpecFrstWlkFreeze")
	.maxTicks(ticksPerSecond * 5)
	//remove this when deexperimentifying
	//.tag(GameTest.Tags.suiteDefault);


// SIG // Begin signature block
// SIG // MIInsAYJKoZIhvcNAQcCoIInoTCCJ50CAQExDzANBglg
// SIG // hkgBZQMEAgEFADB3BgorBgEEAYI3AgEEoGkwZzAyBgor
// SIG // BgEEAYI3AgEeMCQCAQEEEBDgyQbOONQRoqMAEEvTUJAC
// SIG // AQACAQACAQACAQACAQAwMTANBglghkgBZQMEAgEFAAQg
// SIG // JILF1jg4QSse2LQoh38glD8vyb1YpUQns50m5RabANKg
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
// SIG // SEXAQsmbdlsKgEhr/Xmfwb1tbWrJUnMTDXpQzTGCGYcw
// SIG // ghmDAgEBMIGVMH4xCzAJBgNVBAYTAlVTMRMwEQYDVQQI
// SIG // EwpXYXNoaW5ndG9uMRAwDgYDVQQHEwdSZWRtb25kMR4w
// SIG // HAYDVQQKExVNaWNyb3NvZnQgQ29ycG9yYXRpb24xKDAm
// SIG // BgNVBAMTH01pY3Jvc29mdCBDb2RlIFNpZ25pbmcgUENB
// SIG // IDIwMTECEzMAAALMjrWWpr3RyU4AAAAAAswwDQYJYIZI
// SIG // AWUDBAIBBQCggcAwGQYJKoZIhvcNAQkDMQwGCisGAQQB
// SIG // gjcCAQQwHAYKKwYBBAGCNwIBCzEOMAwGCisGAQQBgjcC
// SIG // ARUwLwYJKoZIhvcNAQkEMSIEIH8PvFzpYiW4EFZsArad
// SIG // vgTEadRx4UGK3j/RIwrOslhmMFQGCisGAQQBgjcCAQwx
// SIG // RjBEoCSAIgBNAGkAbgBlAGMAcgBhAGYAdAAgAEIAZQBk
// SIG // AHIAbwBjAGuhHIAaaHR0cHM6Ly93d3cubWluZWNyYWZ0
// SIG // Lm5ldC8wDQYJKoZIhvcNAQEBBQAEggEAgx9dns3ifD0j
// SIG // 0cpG5mSLu2a7G/75twslRSmsXw3EcIMz8HE4CgdYIb/P
// SIG // u1aktgjcp2XqGPOALwwXnDSldJqe4xoiET0ma1g9KiUz
// SIG // 0S1Wg5HeX16hKRuPnX0hW7nUPCN2Pgf4B19KZ7f8Fu5h
// SIG // 9I1rVpcm6Lc5Ov8ne8OoNX8tLmHTAXL24nFMBnhgRe6a
// SIG // CJIZa1gdgCZWfsPpwYbnTL+DEnarW7wa6UYwe02mOJ7I
// SIG // Il0w9TPK9znfCPiIHeo7aPhC371d2Y30GRdJLYMYYdu2
// SIG // lf8AHN4lVCemmRpru9j1v1VqxnwJ0eaBbY99PhGO6RpW
// SIG // LKvjXyz5QCa0Dubnzdbk7KGCFv8wghb7BgorBgEEAYI3
// SIG // AwMBMYIW6zCCFucGCSqGSIb3DQEHAqCCFtgwghbUAgED
// SIG // MQ8wDQYJYIZIAWUDBAIBBQAwggFQBgsqhkiG9w0BCRAB
// SIG // BKCCAT8EggE7MIIBNwIBAQYKKwYBBAGEWQoDATAxMA0G
// SIG // CWCGSAFlAwQCAQUABCDEPC8VAvD+ZggIYEEDgL0nb1I7
// SIG // PHsP0feFvGbWQf+JiAIGYyNLC6goGBIyMDIyMDkyODIz
// SIG // NTEyMi4xOVowBIACAfSggdCkgc0wgcoxCzAJBgNVBAYT
// SIG // AlVTMRMwEQYDVQQIEwpXYXNoaW5ndG9uMRAwDgYDVQQH
// SIG // EwdSZWRtb25kMR4wHAYDVQQKExVNaWNyb3NvZnQgQ29y
// SIG // cG9yYXRpb24xJTAjBgNVBAsTHE1pY3Jvc29mdCBBbWVy
// SIG // aWNhIE9wZXJhdGlvbnMxJjAkBgNVBAsTHVRoYWxlcyBU
// SIG // U1MgRVNOOkU1QTYtRTI3Qy01OTJFMSUwIwYDVQQDExxN
// SIG // aWNyb3NvZnQgVGltZS1TdGFtcCBTZXJ2aWNloIIRVzCC
// SIG // BwwwggT0oAMCAQICEzMAAAGVt/wN1uM3MSUAAQAAAZUw
// SIG // DQYJKoZIhvcNAQELBQAwfDELMAkGA1UEBhMCVVMxEzAR
// SIG // BgNVBAgTCldhc2hpbmd0b24xEDAOBgNVBAcTB1JlZG1v
// SIG // bmQxHjAcBgNVBAoTFU1pY3Jvc29mdCBDb3Jwb3JhdGlv
// SIG // bjEmMCQGA1UEAxMdTWljcm9zb2Z0IFRpbWUtU3RhbXAg
// SIG // UENBIDIwMTAwHhcNMjExMjAyMTkwNTEyWhcNMjMwMjI4
// SIG // MTkwNTEyWjCByjELMAkGA1UEBhMCVVMxEzARBgNVBAgT
// SIG // Cldhc2hpbmd0b24xEDAOBgNVBAcTB1JlZG1vbmQxHjAc
// SIG // BgNVBAoTFU1pY3Jvc29mdCBDb3Jwb3JhdGlvbjElMCMG
// SIG // A1UECxMcTWljcm9zb2Z0IEFtZXJpY2EgT3BlcmF0aW9u
// SIG // czEmMCQGA1UECxMdVGhhbGVzIFRTUyBFU046RTVBNi1F
// SIG // MjdDLTU5MkUxJTAjBgNVBAMTHE1pY3Jvc29mdCBUaW1l
// SIG // LVN0YW1wIFNlcnZpY2UwggIiMA0GCSqGSIb3DQEBAQUA
// SIG // A4ICDwAwggIKAoICAQCfbUEMZ7ZLOz9aoRCeJL4hhT9Q
// SIG // 8JZB2xaVlMNCt3bwhcTI5GLPrt2e93DAsmlqOzw1cFiP
// SIG // Pg6S5sLCXz7LbbUQpLha8S4v2qccMtTokEaDQS+QJErn
// SIG // Asl6VSmRvAy0nlj+C/PaZuLb3OzY0ARw7UeCZLpyWPPH
// SIG // +k5MdYj6NUDTNoXqbzQHCuPs+fgIoro5y3DHoO077g6I
// SIG // r2THIx1yfVFEt5zDcFPOYMg4yBi4A6Xc3hm9tZ6w849n
// SIG // BvVKwm5YALfH3y/f3n4LnN61b1wzAx3ZCZjf13UKbpE7
// SIG // p6DYJrHRB/+pwFjG99TwHH6uXzDeZT6/r6qH7AABwn8f
// SIG // pYc1TmleFY8YRuVzzjp9VkPHV8VzvzLL7QK2kteeXLL/
// SIG // Y4lvjL6hzyOmE+1LVD3lEbYho1zCt+F7bU+FpjyBfTC4
// SIG // i/wHsptb218YlbkQt1i1B6llmJwVFwCLX7gxQ48QIGUa
// SIG // cMy8kp1+zczY+SxlpaEgNmQkfc1raPh9y5sMa6X48+x0
// SIG // K7B8OqDoXcTiECIjJetxwtuBlQseJ05HRfisfgFm09kG
// SIG // 7vdHEo3NbUuMMBFikc4boN9Ufm0iUhq/JtqV0Kwrv9Cv
// SIG // 3ayDgdNwEWiL2a65InEWSpRTYfsCQ03eqEh5A3rwV/Kf
// SIG // UFcit+DrP+9VcDpjWRsCokZv4tgn5qAXNMtHa8NiqQID
// SIG // AQABo4IBNjCCATIwHQYDVR0OBBYEFKuX02ICFFdXgrcC
// SIG // BmDJfH5v/KkXMB8GA1UdIwQYMBaAFJ+nFV0AXmJdg/Tl
// SIG // 0mWnG1M1GelyMF8GA1UdHwRYMFYwVKBSoFCGTmh0dHA6
// SIG // Ly93d3cubWljcm9zb2Z0LmNvbS9wa2lvcHMvY3JsL01p
// SIG // Y3Jvc29mdCUyMFRpbWUtU3RhbXAlMjBQQ0ElMjAyMDEw
// SIG // KDEpLmNybDBsBggrBgEFBQcBAQRgMF4wXAYIKwYBBQUH
// SIG // MAKGUGh0dHA6Ly93d3cubWljcm9zb2Z0LmNvbS9wa2lv
// SIG // cHMvY2VydHMvTWljcm9zb2Z0JTIwVGltZS1TdGFtcCUy
// SIG // MFBDQSUyMDIwMTAoMSkuY3J0MAwGA1UdEwEB/wQCMAAw
// SIG // EwYDVR0lBAwwCgYIKwYBBQUHAwgwDQYJKoZIhvcNAQEL
// SIG // BQADggIBAOCzNt4fJ+jOvQuq0Itn37IZrYNBGswAi+IA
// SIG // FM3YGK/wGQlEncgjmNBuac95W2fAL6xtFVfMfkeqSLML
// SIG // qoidVsU9Bm4DEBjaWNOT9uX/tcYiJSfFQM0rDbrl8V4n
// SIG // M88RZF56G/qJW9g5dIqOSoimzKUt/Q7WH6VByW0sar5w
// SIG // GvgovK3qFadwKShzRYcEqTkHH2zip5e73jezPHx2+taY
// SIG // qJG5xJzdDErZ1nMixRjaHs3KpcsmZYuxsIRfBYOJvAFG
// SIG // ymTGRv5PuwsNps9Ech1Aasq84H/Y/8xN3GQj4P3MiDn8
// SIG // izUBDCuXIfHYk39bqnaAmFbUiCby+WWpuzdk4oDKz/sW
// SIG // wrnsoQ72uEGVEN7+kyw9+HSo5i8l8Zg1Ymj9tUgDpVUG
// SIG // jAduoLyHQ7XqknKmS9kJSBKk4okEDg0Id6LeKLQwH1e4
// SIG // aVeTyUYwcBX3wg7pLJQWvR7na2SGrtl/23YGQTudmWOr
// SIG // yhx9lnU7KBGV/aNvz0tTpcsucsK+cZFKDEkWB/oUFVrt
// SIG // yun6ND5pYZNj0CgRup5grVACq/Agb+EOGLCD+zEtGNop
// SIG // 4tfKvsYb64257NJ9XrMHgpCib76WT34RPmCBByxLUkHx
// SIG // Hq5zCyYNu0IFXAt1AVicw14M+czLYIVM7NOyVpFdcB1B
// SIG // 9MiJik7peSii0XTRdl5/V/KscTaCBFz3MIIHcTCCBVmg
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
// SIG // baUFEMFxBmoQtB1VM1izoXBm8qGCAs4wggI3AgEBMIH4
// SIG // oYHQpIHNMIHKMQswCQYDVQQGEwJVUzETMBEGA1UECBMK
// SIG // V2FzaGluZ3RvbjEQMA4GA1UEBxMHUmVkbW9uZDEeMBwG
// SIG // A1UEChMVTWljcm9zb2Z0IENvcnBvcmF0aW9uMSUwIwYD
// SIG // VQQLExxNaWNyb3NvZnQgQW1lcmljYSBPcGVyYXRpb25z
// SIG // MSYwJAYDVQQLEx1UaGFsZXMgVFNTIEVTTjpFNUE2LUUy
// SIG // N0MtNTkyRTElMCMGA1UEAxMcTWljcm9zb2Z0IFRpbWUt
// SIG // U3RhbXAgU2VydmljZaIjCgEBMAcGBSsOAwIaAxUA0Y+C
// SIG // yLezGgVHWFNmKI1LuE/hY6uggYMwgYCkfjB8MQswCQYD
// SIG // VQQGEwJVUzETMBEGA1UECBMKV2FzaGluZ3RvbjEQMA4G
// SIG // A1UEBxMHUmVkbW9uZDEeMBwGA1UEChMVTWljcm9zb2Z0
// SIG // IENvcnBvcmF0aW9uMSYwJAYDVQQDEx1NaWNyb3NvZnQg
// SIG // VGltZS1TdGFtcCBQQ0EgMjAxMDANBgkqhkiG9w0BAQUF
// SIG // AAIFAObe7IUwIhgPMjAyMjA5MjgyMzUzNDFaGA8yMDIy
// SIG // MDkyOTIzNTM0MVowdzA9BgorBgEEAYRZCgQBMS8wLTAK
// SIG // AgUA5t7shQIBADAKAgEAAgIStgIB/zAHAgEAAgIRyzAK
// SIG // AgUA5uA+BQIBADA2BgorBgEEAYRZCgQCMSgwJjAMBgor
// SIG // BgEEAYRZCgMCoAowCAIBAAIDB6EgoQowCAIBAAIDAYag
// SIG // MA0GCSqGSIb3DQEBBQUAA4GBABFxgIKKW+LL5XiKz/Gd
// SIG // NiRZQ3vbfWm/0MCS4G2B1pj7ildGODJC80cB8dozJaLv
// SIG // cUdcKQhRFPwjnwO7AmAVsqB2ODUwg+m9LucmOyVsLfYR
// SIG // kz2IXsRykY/DFiasv6THBwqZoKrBLV6i0IqselOTGZol
// SIG // kkNkx3UIGwftZX0aBqtcMYIEDTCCBAkCAQEwgZMwfDEL
// SIG // MAkGA1UEBhMCVVMxEzARBgNVBAgTCldhc2hpbmd0b24x
// SIG // EDAOBgNVBAcTB1JlZG1vbmQxHjAcBgNVBAoTFU1pY3Jv
// SIG // c29mdCBDb3Jwb3JhdGlvbjEmMCQGA1UEAxMdTWljcm9z
// SIG // b2Z0IFRpbWUtU3RhbXAgUENBIDIwMTACEzMAAAGVt/wN
// SIG // 1uM3MSUAAQAAAZUwDQYJYIZIAWUDBAIBBQCgggFKMBoG
// SIG // CSqGSIb3DQEJAzENBgsqhkiG9w0BCRABBDAvBgkqhkiG
// SIG // 9w0BCQQxIgQgj72KJQzyqIUsI5IwYpBMgaVIcxD+664e
// SIG // FIGLIJ0Muu8wgfoGCyqGSIb3DQEJEAIvMYHqMIHnMIHk
// SIG // MIG9BCBc5kvhjZALe2mhIz/Qd7keVOmA/cC1dzKZT4yb
// SIG // LEkCxzCBmDCBgKR+MHwxCzAJBgNVBAYTAlVTMRMwEQYD
// SIG // VQQIEwpXYXNoaW5ndG9uMRAwDgYDVQQHEwdSZWRtb25k
// SIG // MR4wHAYDVQQKExVNaWNyb3NvZnQgQ29ycG9yYXRpb24x
// SIG // JjAkBgNVBAMTHU1pY3Jvc29mdCBUaW1lLVN0YW1wIFBD
// SIG // QSAyMDEwAhMzAAABlbf8DdbjNzElAAEAAAGVMCIEIPgI
// SIG // DETgm5dMjN6qrk/qeGJBGkTwzmsKo+q0ohYNdofTMA0G
// SIG // CSqGSIb3DQEBCwUABIICAGhbyeHfSuK+kWwgEnVHvrhv
// SIG // A0tped3x1YJys01uatOZJMQIcDGFWetgW8ILkxN0mJBe
// SIG // wIw7JFwNj/8yhRZldn8Q9yJawF/msvYWk2DShrcrVBtj
// SIG // msq7KKd488DbldsEYk94sm/DDdU5WOgst7e/JlMXBjmo
// SIG // LrUOfVmdc7Uu41pUe0N0OW9l5XmQUvAC7cEw9lPtJcLJ
// SIG // 8lFj5zfvLhRobQi/OzHmlZ5kmrtXJfTGgYx7Z4XFF8ki
// SIG // ggj73XHPHtJmSSUH9J9UKn7HnHxXtM/qpqSYroKcH8oG
// SIG // HvPWzE8cWIB0R4jo5Q70ftldjDJjJ1n6DsGnNe7f94EY
// SIG // 8H3KdCfrN34qJuxhgjzPLcuWdTro45wfGA8nfRUWSrB+
// SIG // 3StWhfQ4kKbO/gx3thJ5LrwP0+5lKGLAQ6WuA8mt1cMF
// SIG // JL/WD98Vdp1N99rv7hRgcZaXd8RNVrOX5RuzernihzTL
// SIG // hZ1CskRgKMoCjcwMUbStOqls7iw/qONYFSPXVqvijvi8
// SIG // XYX+VYDMII4e/wsDm0WAlbNiIuOR8n3ftRqq+OLHMDOS
// SIG // SOt5TD02tpFI6RSid8CKEZ98iDvfChQXIXaf6QQYMgOT
// SIG // Tdo9OdbN+CSJEhLmsKKZLxUWAe/ZP+x6xlkWwKe/9hLL
// SIG // pLmzxzSsrsBfzhE0QROSOn4LFUT/R1u/TN8/Gamh54Xb
// SIG // End signature block
