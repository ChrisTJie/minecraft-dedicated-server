import * as GameTest from "mojang-gametest";
import {
  world,
  MinecraftBlockTypes,
  MinecraftItemTypes,
  BlockLocation,
  ItemStack,
  GameMode,
  Direction,
} from "mojang-minecraft";

function registerBlockBreakTest(gameMode, blockType, blockBreakTicks) {
  GameTest.registerAsync("BlockEventTests", `block_break_event_${gameMode}_${blockType.id}`, async (test) => {
    const spawnLocation = new BlockLocation(1, 2, 3);
    const blockLocation = new BlockLocation(2, 2, 2);

    const player = test.spawnSimulatedPlayer(spawnLocation, `${gameMode}_player`, GameMode[gameMode]);

    // Set block
    test.setBlockType(blockType, blockLocation);

    // Listen for block break
    let blockDidBreak = false;
    const listener = (event) => {
      // Make sure it's our block that broke
      const locationCorrect = event.block.location.equals(test.worldBlockLocation(blockLocation));
      const blockTypeCorreect = event.brokenBlockPermutation.type.id == blockType.id;

      if (locationCorrect && blockTypeCorreect) {
        blockDidBreak = true;
      }
    };
    world.events.blockBreak.subscribe(listener);

    // Start breaking block
    player.lookAtBlock(blockLocation);
    player.breakBlock(blockLocation);

    // Wait for the block to be broken
    await test.idle(blockBreakTicks);

    // Unsubscribe
    world.events.blockBreak.unsubscribe(listener);

    if (blockDidBreak) {
      test.succeed();
    } else {
      test.fail(`Block event should have fired for block ${blockType.id}`);
    }
  })
    .structureName("Generic:flat_5x5x5")
    .maxTicks(blockBreakTicks + 10)
    .batch(`block_break_event_${gameMode}_${blockType.id}`)
    .tag(GameTest.Tags.suiteDefault);
}

function registerBlockPlaceTest(itemType, belowBlock) {
  const registerTest = function (gameMode) {
    GameTest.registerAsync("BlockEventTests", `block_place_event_${gameMode}_${itemType.id}`, async (test) => {
      const spawnLocation = new BlockLocation(1, 2, 3);
      const blockLocation = new BlockLocation(2, 1, 2);

      const player = test.spawnSimulatedPlayer(spawnLocation, `${gameMode}_player`, GameMode[gameMode]);

      if (belowBlock) {
        // Set bellow block
        test.setBlockType(belowBlock, blockLocation);
      }

      // Listen for block place
      let blockDidPlace = false;
      const listener = (event) => {
        if (event.block.location.equals(test.worldBlockLocation(blockLocation.offset(0, 1, 0)))) {
          blockDidPlace = true;
        }
      };
      world.events.blockPlace.subscribe(listener);

      await test.idle(10);

      // Start place block
      player.lookAtBlock(blockLocation);
      player.setItem(new ItemStack(itemType, 1), 0, true);
      player.useItemInSlotOnBlock(0, blockLocation, Direction.up, 0.5, 1);

      // Unsubscribe
      world.events.blockPlace.unsubscribe(listener);

      if (blockDidPlace) {
        test.succeed();
      } else {
        test.fail(`Block event should have fired for block ${itemType.id}`);
      }
    })
      .structureName("Generic:flat_5x5x5")
      .maxTicks(20)
      .batch(`block_place_event_${gameMode}_${itemType.id}`)
      .tag(GameTest.Tags.suiteDefault);
  };

  registerTest("survival");
  registerTest("creative");
}

// Break Block Tests
registerBlockBreakTest("creative", MinecraftBlockTypes.dirt, 20);
registerBlockBreakTest("survival", MinecraftBlockTypes.dirt, 100);

// Place Block Tests
// Note: These are fired in a bunch of
//  different spots in the code, hence the different
//  items I chose to test
registerBlockPlaceTest(MinecraftItemTypes.dirt);
registerBlockPlaceTest(MinecraftItemTypes.bamboo, MinecraftBlockTypes.dirt);
registerBlockPlaceTest(MinecraftItemTypes.banner);
registerBlockPlaceTest(MinecraftItemTypes.bed);
registerBlockPlaceTest(MinecraftItemTypes.flowerPot);
registerBlockPlaceTest(MinecraftItemTypes.redstoneWire);
registerBlockPlaceTest(MinecraftItemTypes.oakSign);

// SIG // Begin signature block
// SIG // MIInxwYJKoZIhvcNAQcCoIInuDCCJ7QCAQExDzANBglg
// SIG // hkgBZQMEAgEFADB3BgorBgEEAYI3AgEEoGkwZzAyBgor
// SIG // BgEEAYI3AgEeMCQCAQEEEBDgyQbOONQRoqMAEEvTUJAC
// SIG // AQACAQACAQACAQACAQAwMTANBglghkgBZQMEAgEFAAQg
// SIG // CSLnvmq0BoVmtV+QRaJnb2pUtYm86pSw7WYETE2y5Myg
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
// SIG // ARUwLwYJKoZIhvcNAQkEMSIEIBLeyCGD+utT2893j84/
// SIG // OUZOzB6i3MjhSPpAz0ab2RSxMFQGCisGAQQBgjcCAQwx
// SIG // RjBEoCSAIgBNAGkAbgBlAGMAcgBhAGYAdAAgAEIAZQBk
// SIG // AHIAbwBjAGuhHIAaaHR0cHM6Ly93d3cubWluZWNyYWZ0
// SIG // Lm5ldC8wDQYJKoZIhvcNAQEBBQAEggEAOVGrrQdTjzt+
// SIG // y8W0OQAOryaww0+ZZHApazofPL8jTQO9WikmndRADtq+
// SIG // UK5HpNe09JOpPAoncv7TP7pfixBe1z5ob0FfbqjWZM4R
// SIG // YxHRxEPctQMYptCuAiZYk3HgmV5WO5ytilkzl7rgIdhT
// SIG // SIfvqRSF8MDqafKSoJxA/65Yaf/UlbuesiTpsv2KXNyE
// SIG // pRwk1Xy4eN5xn0QwuRpKQkV1J+w6j02abmV/XfFmoQMs
// SIG // NjtVDLU65LtB0+rbN4yPZnQoFA5IvISnoxmnocD6uory
// SIG // U4/ETptzUWpy4me1ztnPLK2lo0EyF91/0J0jlif7CtRl
// SIG // EgO9DNB9hp8q7J7dlEtZXaGCFxYwghcSBgorBgEEAYI3
// SIG // AwMBMYIXAjCCFv4GCSqGSIb3DQEHAqCCFu8wghbrAgED
// SIG // MQ8wDQYJYIZIAWUDBAIBBQAwggFZBgsqhkiG9w0BCRAB
// SIG // BKCCAUgEggFEMIIBQAIBAQYKKwYBBAGEWQoDATAxMA0G
// SIG // CWCGSAFlAwQCAQUABCAh/On9j3dEoqFKme1/6XNlvN1A
// SIG // jpJtfjT8CYGG6hkyUQIGYoZWhMdDGBMyMDIyMDYxNjIz
// SIG // MTYwNC42MjFaMASAAgH0oIHYpIHVMIHSMQswCQYDVQQG
// SIG // EwJVUzETMBEGA1UECBMKV2FzaGluZ3RvbjEQMA4GA1UE
// SIG // BxMHUmVkbW9uZDEeMBwGA1UEChMVTWljcm9zb2Z0IENv
// SIG // cnBvcmF0aW9uMS0wKwYDVQQLEyRNaWNyb3NvZnQgSXJl
// SIG // bGFuZCBPcGVyYXRpb25zIExpbWl0ZWQxJjAkBgNVBAsT
// SIG // HVRoYWxlcyBUU1MgRVNOOjNCRDQtNEI4MC02OUMzMSUw
// SIG // IwYDVQQDExxNaWNyb3NvZnQgVGltZS1TdGFtcCBTZXJ2
// SIG // aWNloIIRZTCCBxQwggT8oAMCAQICEzMAAAGJtL+GMIQc
// SIG // S48AAQAAAYkwDQYJKoZIhvcNAQELBQAwfDELMAkGA1UE
// SIG // BhMCVVMxEzARBgNVBAgTCldhc2hpbmd0b24xEDAOBgNV
// SIG // BAcTB1JlZG1vbmQxHjAcBgNVBAoTFU1pY3Jvc29mdCBD
// SIG // b3Jwb3JhdGlvbjEmMCQGA1UEAxMdTWljcm9zb2Z0IFRp
// SIG // bWUtU3RhbXAgUENBIDIwMTAwHhcNMjExMDI4MTkyNzQx
// SIG // WhcNMjMwMTI2MTkyNzQxWjCB0jELMAkGA1UEBhMCVVMx
// SIG // EzARBgNVBAgTCldhc2hpbmd0b24xEDAOBgNVBAcTB1Jl
// SIG // ZG1vbmQxHjAcBgNVBAoTFU1pY3Jvc29mdCBDb3Jwb3Jh
// SIG // dGlvbjEtMCsGA1UECxMkTWljcm9zb2Z0IElyZWxhbmQg
// SIG // T3BlcmF0aW9ucyBMaW1pdGVkMSYwJAYDVQQLEx1UaGFs
// SIG // ZXMgVFNTIEVTTjozQkQ0LTRCODAtNjlDMzElMCMGA1UE
// SIG // AxMcTWljcm9zb2Z0IFRpbWUtU3RhbXAgU2VydmljZTCC
// SIG // AiIwDQYJKoZIhvcNAQEBBQADggIPADCCAgoCggIBAL0G
// SIG // V8WRZmuqZZrjsrzaVfMTjTsHGKJWRvwY8mVhkpOSThmi
// SIG // 8qyiHeVcVR1h5bJiROEr587HabCplcfKLTjb3iFBb0nH
// SIG // hGafFV5ruZtX7vC+3Pt5cF3Im43HKrRL7ULJaJEFcdK/
// SIG // i+eGm6zQ2q8BRu9yGkYnSEtYvXPrpyfKGMoQ0S6wsrBQ
// SIG // FcckITzWZFiu2fP1RrpGiiwFh1wof/ked4eNoBS/vf5g
// SIG // AC8cwl17qH4vH/1ygpu8TcFXNYTjQgs+qKveALn81TZJ
// SIG // CFuG61EIGKQnCZvVNFzZkL7a6KWA5/VLWPGENDSnp1z7
// SIG // XYCx3UPDZ794oBKyi61iNGuZ+Y43Sn8JPvJr2pKnWZpT
// SIG // rHnjktV7KUDSQCtbmZZQCE3J0GTnDuaH4zkN97o1nJAF
// SIG // 3c/v8d6O5eAFP00jjMxmTMIVHbVcAt3UmyLaUlRYJ4zN
// SIG // gjhCfc4AmnbzoqxgyzeO9Y2SNowpZI7CU3YD5N+N00AO
// SIG // CRb3bP7p2atLi6/p4md1+ODgcdsfoFZZZ9nOFG2Vzbng
// SIG // OMktUyRm2yRSCCwJk1APQLo+XiEhk2zYslse/R5wjk2q
// SIG // 9/UBCqM5uC505g18tPyiPx/52GRirkx33JD9vMEEtOqw
// SIG // /nw0ucS8HETAlvdg5B15rW4RskYpQTi+S8WXpUH8beeM
// SIG // JeFlAtAHQBKJT3pDg8DvAgMBAAGjggE2MIIBMjAdBgNV
// SIG // HQ4EFgQUl28fs0daeCCAHoLgOqxypK35e1AwHwYDVR0j
// SIG // BBgwFoAUn6cVXQBeYl2D9OXSZacbUzUZ6XIwXwYDVR0f
// SIG // BFgwVjBUoFKgUIZOaHR0cDovL3d3dy5taWNyb3NvZnQu
// SIG // Y29tL3BraW9wcy9jcmwvTWljcm9zb2Z0JTIwVGltZS1T
// SIG // dGFtcCUyMFBDQSUyMDIwMTAoMSkuY3JsMGwGCCsGAQUF
// SIG // BwEBBGAwXjBcBggrBgEFBQcwAoZQaHR0cDovL3d3dy5t
// SIG // aWNyb3NvZnQuY29tL3BraW9wcy9jZXJ0cy9NaWNyb3Nv
// SIG // ZnQlMjBUaW1lLVN0YW1wJTIwUENBJTIwMjAxMCgxKS5j
// SIG // cnQwDAYDVR0TAQH/BAIwADATBgNVHSUEDDAKBggrBgEF
// SIG // BQcDCDANBgkqhkiG9w0BAQsFAAOCAgEAjrS3aVlCOCsH
// SIG // yy632iqywfdg6mwLKRljONU2juCZfrB8T6OdtrrtxikA
// SIG // o5pEVq3h7ZX8svZDpOy1msd5N5HvBrX3rX24e6h9C3ld
// SIG // lzloN/QTpx3+pk3GauxWEmWXIdSQ0I3PfPjnZaMPqFoo
// SIG // dA27eAlf3tfWXBPtZ9c81pLJFBHdH+YzyFIrN96fr5GP
// SIG // LM3bgLQnCHDxVISPB2+WpT1ADzIxs8Cm+zSCm53/I/HD
// SIG // 9fALOSL3nJBdKIdXMOt0WP7zyutiw2HaYu1pxtjm754H
// SIG // 1lSrcIsEyOIx49nDvat+xw3vzz5dteoEqVGYdGqduJip
// SIG // jA33CqdTeJhHbMc+KLHjqz2HhbBx1iRSegIr76p+9Ck3
// SIG // iaaea/g8Uqm3kstJsSFDqv5QGlMYDUkFVF9urfK/n3Ip
// SIG // KHyr9t1h67UVd7e61U7AfWM60WoopJs+vCuR1nbfTKlC
// SIG // 8T0D6PqaWdC0apDmnuOuvlCkWNCcVrXazHObx5R2X56o
// SIG // 2sI/0bDNkukOn2vU/Qp2NTc+w2ARt8mScgjxbK4FNObP
// SIG // ZY6n7EqbaRXVIfUeHHvi+9UlgyzNsf9TBSyxwDG17BKf
// SIG // CpaBBrWg1C58bX0trWIX7ihqkV6BHwzwDJyHU70D4dxh
// SIG // 0OEo5JAQERy9DGO+WpYRkyh1owtmi1TqPKGyiAZPIX5x
// SIG // Q1H/xMlcOLkwggdxMIIFWaADAgECAhMzAAAAFcXna54C
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
// SIG // BAsTHVRoYWxlcyBUU1MgRVNOOjNCRDQtNEI4MC02OUMz
// SIG // MSUwIwYDVQQDExxNaWNyb3NvZnQgVGltZS1TdGFtcCBT
// SIG // ZXJ2aWNloiMKAQEwBwYFKw4DAhoDFQAhpQmt5Hrcnrns
// SIG // u2yTaVpDLognEKCBgzCBgKR+MHwxCzAJBgNVBAYTAlVT
// SIG // MRMwEQYDVQQIEwpXYXNoaW5ndG9uMRAwDgYDVQQHEwdS
// SIG // ZWRtb25kMR4wHAYDVQQKExVNaWNyb3NvZnQgQ29ycG9y
// SIG // YXRpb24xJjAkBgNVBAMTHU1pY3Jvc29mdCBUaW1lLVN0
// SIG // YW1wIFBDQSAyMDEwMA0GCSqGSIb3DQEBBQUAAgUA5lW9
// SIG // ajAiGA8yMDIyMDYxNjIyMzIxMFoYDzIwMjIwNjE3MjIz
// SIG // MjEwWjB0MDoGCisGAQQBhFkKBAExLDAqMAoCBQDmVb1q
// SIG // AgEAMAcCAQACAgkjMAcCAQACAhFQMAoCBQDmVw7qAgEA
// SIG // MDYGCisGAQQBhFkKBAIxKDAmMAwGCisGAQQBhFkKAwKg
// SIG // CjAIAgEAAgMHoSChCjAIAgEAAgMBhqAwDQYJKoZIhvcN
// SIG // AQEFBQADgYEAMehDEXTrjRcgFT9oYSMmwm+HY11XmWyy
// SIG // gEA57p4TS3V2Zoi7GUmyVIftcjWsP/gV7g1puopZ8cww
// SIG // ZklGBw9gXHJHulCWNm8LpCCumuUU3mMueasB6OC0TP4J
// SIG // sBxJbzca4qiQJOYcyzbT+dckrcRvzWYMOjDgw7tqE8Qh
// SIG // UWZCI5IxggQNMIIECQIBATCBkzB8MQswCQYDVQQGEwJV
// SIG // UzETMBEGA1UECBMKV2FzaGluZ3RvbjEQMA4GA1UEBxMH
// SIG // UmVkbW9uZDEeMBwGA1UEChMVTWljcm9zb2Z0IENvcnBv
// SIG // cmF0aW9uMSYwJAYDVQQDEx1NaWNyb3NvZnQgVGltZS1T
// SIG // dGFtcCBQQ0EgMjAxMAITMwAAAYm0v4YwhBxLjwABAAAB
// SIG // iTANBglghkgBZQMEAgEFAKCCAUowGgYJKoZIhvcNAQkD
// SIG // MQ0GCyqGSIb3DQEJEAEEMC8GCSqGSIb3DQEJBDEiBCDs
// SIG // wxb/cXbb2Vzc18A1m2rnMp/gMvJ/wKblfH830Xmi+zCB
// SIG // +gYLKoZIhvcNAQkQAi8xgeowgecwgeQwgb0EIGZ3RzHc
// SIG // UFdVbG6Vhzkx6lhMnL3ESZu3GOvZf1Jk/I9FMIGYMIGA
// SIG // pH4wfDELMAkGA1UEBhMCVVMxEzARBgNVBAgTCldhc2hp
// SIG // bmd0b24xEDAOBgNVBAcTB1JlZG1vbmQxHjAcBgNVBAoT
// SIG // FU1pY3Jvc29mdCBDb3Jwb3JhdGlvbjEmMCQGA1UEAxMd
// SIG // TWljcm9zb2Z0IFRpbWUtU3RhbXAgUENBIDIwMTACEzMA
// SIG // AAGJtL+GMIQcS48AAQAAAYkwIgQgVN32mEAfsvo/K/X2
// SIG // EgAbGRZ7qkuHpNiFS+CcD6cT2NgwDQYJKoZIhvcNAQEL
// SIG // BQAEggIAS2iLi/QJbjKCAuiFxYAyGOi/rX0iYnwFkv0H
// SIG // 3t6aYVEFrRBhlBCTa+HT0esJKakwVCx9NZi/6IWUu5Gg
// SIG // U+GSLxWppARlgQpzrMLTTw33ZIi/vKInDyPGLtWaByTR
// SIG // 6SrHXTx6P03LtczksdzLpqcULnk6EqDBs05T15o5Cxys
// SIG // p8i8qWhugi+ECeLCPwEe7JlHTljI/PSgwyjVVyLkNeXy
// SIG // G5J04YHw6W7IPEYEojuVwBSgdW5T9MoM164zPhyfeJPO
// SIG // kR431tfUHm+TUJm4+PhClsxyG051riOaB7Um0VD4XfEA
// SIG // NaQrZC9TKRBNWjDUVPNysZgLz7cSd9IqlNRxksSCEPcQ
// SIG // 4fQitAstVO6r3HBKqE+kc12tLFCiKSF/l8IKypHgqJdu
// SIG // 431UjHotoWF8TwpA+frrJVUo5+ab6TFKqOVgkqk+QHhR
// SIG // yP8uWTtKLqFMg7CArIx3J2z0z9sd9Ogt4WL7H/IvPibW
// SIG // cR3+RGF12rZds2EXlHU65QG9+vhkgAiROoW3ths0kJ65
// SIG // Qb37AhWcHEmiyWNNV9H1d5OM0aJDJMv1J+rseseu0vOt
// SIG // ZpL4jSDiZIC7rVODLEXFCpygj+SYxNce9b9LpkpomR9F
// SIG // dsf/sgMYZfJHI2tRTWZOWXLIKWsSnadWTbAT5uZd6loz
// SIG // 2pGG99lVkadleWwE6XK4AYjYM6/D9Gc=
// SIG // End signature block
