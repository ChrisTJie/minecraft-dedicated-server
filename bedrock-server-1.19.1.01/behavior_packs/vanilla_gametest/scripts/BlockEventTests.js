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
// SIG // MIInrgYJKoZIhvcNAQcCoIInnzCCJ5sCAQExDzANBglg
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
// SIG // SEXAQsmbdlsKgEhr/Xmfwb1tbWrJUnMTDXpQzTGCGYUw
// SIG // ghmBAgEBMIGVMH4xCzAJBgNVBAYTAlVTMRMwEQYDVQQI
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
// SIG // EgO9DNB9hp8q7J7dlEtZXaGCFv0wghb5BgorBgEEAYI3
// SIG // AwMBMYIW6TCCFuUGCSqGSIb3DQEHAqCCFtYwghbSAgED
// SIG // MQ8wDQYJYIZIAWUDBAIBBQAwggFRBgsqhkiG9w0BCRAB
// SIG // BKCCAUAEggE8MIIBOAIBAQYKKwYBBAGEWQoDATAxMA0G
// SIG // CWCGSAFlAwQCAQUABCAh/On9j3dEoqFKme1/6XNlvN1A
// SIG // jpJtfjT8CYGG6hkyUQIGYoJRIHslGBMyMDIyMDUyNzAw
// SIG // NTAyOC44NjRaMASAAgH0oIHQpIHNMIHKMQswCQYDVQQG
// SIG // EwJVUzETMBEGA1UECBMKV2FzaGluZ3RvbjEQMA4GA1UE
// SIG // BxMHUmVkbW9uZDEeMBwGA1UEChMVTWljcm9zb2Z0IENv
// SIG // cnBvcmF0aW9uMSUwIwYDVQQLExxNaWNyb3NvZnQgQW1l
// SIG // cmljYSBPcGVyYXRpb25zMSYwJAYDVQQLEx1UaGFsZXMg
// SIG // VFNTIEVTTjo3QkYxLUUzRUEtQjgwODElMCMGA1UEAxMc
// SIG // TWljcm9zb2Z0IFRpbWUtU3RhbXAgU2VydmljZaCCEVQw
// SIG // ggcMMIIE9KADAgECAhMzAAABnytFNRUILktdAAEAAAGf
// SIG // MA0GCSqGSIb3DQEBCwUAMHwxCzAJBgNVBAYTAlVTMRMw
// SIG // EQYDVQQIEwpXYXNoaW5ndG9uMRAwDgYDVQQHEwdSZWRt
// SIG // b25kMR4wHAYDVQQKExVNaWNyb3NvZnQgQ29ycG9yYXRp
// SIG // b24xJjAkBgNVBAMTHU1pY3Jvc29mdCBUaW1lLVN0YW1w
// SIG // IFBDQSAyMDEwMB4XDTIxMTIwMjE5MDUyMloXDTIzMDIy
// SIG // ODE5MDUyMlowgcoxCzAJBgNVBAYTAlVTMRMwEQYDVQQI
// SIG // EwpXYXNoaW5ndG9uMRAwDgYDVQQHEwdSZWRtb25kMR4w
// SIG // HAYDVQQKExVNaWNyb3NvZnQgQ29ycG9yYXRpb24xJTAj
// SIG // BgNVBAsTHE1pY3Jvc29mdCBBbWVyaWNhIE9wZXJhdGlv
// SIG // bnMxJjAkBgNVBAsTHVRoYWxlcyBUU1MgRVNOOjdCRjEt
// SIG // RTNFQS1CODA4MSUwIwYDVQQDExxNaWNyb3NvZnQgVGlt
// SIG // ZS1TdGFtcCBTZXJ2aWNlMIICIjANBgkqhkiG9w0BAQEF
// SIG // AAOCAg8AMIICCgKCAgEApPV5fE1RsomQL85vLQeHyz9M
// SIG // 5y/PN2AyBtN47Nf1swmiAlw7NJF5Sd/TlGcHgRWv1fJd
// SIG // u5pQY8i2Q7U4N1vHUDkQ7p35+0s2RKBZpV2kmHEIcgzF
// SIG // eYIcYupYfMtzVdUzRxmC82qEJrQXrhUpRB/cKeqwv7ES
// SIG // uxj6zp9e1wBs6Pv8hcuw31oCEON19+brdtE0oVHmA67O
// SIG // RjlaR6e6LqkGEU6bvpQGgh36vLa/ixaiMo6ZL8cW9x3M
// SIG // elY7XtDTx+hpyAk/OD8VmCu3qGuQMW7E1KlkMolraxqM
// SIG // kMlz+MiCn01GD7bExQoteIriTa98kRo6OFNTh2VNshpl
// SIG // ngq3XHCYJG8upNjeQIUWLyh63jz4eaFh2NNYPE3JMVeI
// SIG // eIpaKr2mmBodxwz1j8OCqCshMu0BxrmStagJIXloil9q
// SIG // hNHjUVrppgij4XXBd3XFYlSPWil4bcuMzO+rbFI3HQrZ
// SIG // xuVSCOnlOnc3C+mBadLzJeyTyN8vSK8fbARIlZkooDNk
// SIG // w2VOEVCGxSLQ+tAyWMzR9Kxrtg79/T/9DsKMd+z92X7w
// SIG // eYwHoOgfkgUg9GsIvn+tSRa1XP1GfN1vubYCP9MXCxlh
// SIG // wTXRIm0hdTRX61dCjwin4vYg9gZEIDGItNgmPBN7rPlM
// SIG // mAODRWHFiaY2nASgAXgwXZGNQT3xoM7JGioSBoXaMfUC
// SIG // AwEAAaOCATYwggEyMB0GA1UdDgQWBBRiNPLVHhMWK0gO
// SIG // Lujf2WrH1h3IYTAfBgNVHSMEGDAWgBSfpxVdAF5iXYP0
// SIG // 5dJlpxtTNRnpcjBfBgNVHR8EWDBWMFSgUqBQhk5odHRw
// SIG // Oi8vd3d3Lm1pY3Jvc29mdC5jb20vcGtpb3BzL2NybC9N
// SIG // aWNyb3NvZnQlMjBUaW1lLVN0YW1wJTIwUENBJTIwMjAx
// SIG // MCgxKS5jcmwwbAYIKwYBBQUHAQEEYDBeMFwGCCsGAQUF
// SIG // BzAChlBodHRwOi8vd3d3Lm1pY3Jvc29mdC5jb20vcGtp
// SIG // b3BzL2NlcnRzL01pY3Jvc29mdCUyMFRpbWUtU3RhbXAl
// SIG // MjBQQ0ElMjAyMDEwKDEpLmNydDAMBgNVHRMBAf8EAjAA
// SIG // MBMGA1UdJQQMMAoGCCsGAQUFBwMIMA0GCSqGSIb3DQEB
// SIG // CwUAA4ICAQAdiigpPDvpGfPpvWz10CAJqPusWyg2ipDE
// SIG // d//NgPF1QDGvUaSLWCZHZLWvgumSFQbGRAESZCp1qWCY
// SIG // oshgVdz5j6CDD+cxW69AWCzKJQyWTLR9zIn1QQ/TZJ2D
// SIG // SoPhm1smgD7PFWelA9wkc46FWdj2x0R/lDpdmHP3JtSE
// SIG // dwZb45XDcMpKcwRlJ3QEXn7s430UnwfnQc5pRWPnTBPP
// SIG // idzr73jK2iHM50q5a+OhlzKFhibdIQSTX+BuSWasl3vJ
// SIG // /M9skeaaC9rojEc6iF19a8AiF4XCzxYEijf7yca8R4hf
// SIG // QclYqLn+IwnA/DtpjveLaAkqixEbqHUnvXUO6qylQaJw
// SIG // 6GFgMfltFxgF9qmqGZqhLp+0G/IZ8jclaydgtn2cAGNs
// SIG // ol92TICxlK6Q0aCVnT/rXOUkuimdX8MoS/ygII4jT71A
// SIG // YruzxeCx8eU0RVOx2V74KWQ5+cZLZF2YnQOEtujWbDEs
// SIG // oMdEdZ11d8m2NyXZTX0RE7ekiH0HQsUV+WFGyOTXb7lT
// SIG // IsuaAd25X4T4DScqNKnZpByhNqTeHPIsPUq2o51nDNG1
// SIG // BMaw5DanMGqtdQ88HNJQxl9eIJ4xkW4IZehy7A+48cdP
// SIG // m7syRymT8xnUyzBSqEnSXleKVP7d3T23VNtR0utBMdiK
// SIG // dk3Rn4LUvTzs1WkwOFLnLpJW42ZEIoX4NjCCB3EwggVZ
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
// SIG // gm2lBRDBcQZqELQdVTNYs6FwZvKhggLLMIICNAIBATCB
// SIG // +KGB0KSBzTCByjELMAkGA1UEBhMCVVMxEzARBgNVBAgT
// SIG // Cldhc2hpbmd0b24xEDAOBgNVBAcTB1JlZG1vbmQxHjAc
// SIG // BgNVBAoTFU1pY3Jvc29mdCBDb3Jwb3JhdGlvbjElMCMG
// SIG // A1UECxMcTWljcm9zb2Z0IEFtZXJpY2EgT3BlcmF0aW9u
// SIG // czEmMCQGA1UECxMdVGhhbGVzIFRTUyBFU046N0JGMS1F
// SIG // M0VBLUI4MDgxJTAjBgNVBAMTHE1pY3Jvc29mdCBUaW1l
// SIG // LVN0YW1wIFNlcnZpY2WiIwoBATAHBgUrDgMCGgMVAHRd
// SIG // rpgf8ssMRSxUwvKyfRb/XPa3oIGDMIGApH4wfDELMAkG
// SIG // A1UEBhMCVVMxEzARBgNVBAgTCldhc2hpbmd0b24xEDAO
// SIG // BgNVBAcTB1JlZG1vbmQxHjAcBgNVBAoTFU1pY3Jvc29m
// SIG // dCBDb3Jwb3JhdGlvbjEmMCQGA1UEAxMdTWljcm9zb2Z0
// SIG // IFRpbWUtU3RhbXAgUENBIDIwMTAwDQYJKoZIhvcNAQEF
// SIG // BQACBQDmOf3uMCIYDzIwMjIwNTI2MjEyMzU4WhgPMjAy
// SIG // MjA1MjcyMTIzNThaMHQwOgYKKwYBBAGEWQoEATEsMCow
// SIG // CgIFAOY5/e4CAQAwBwIBAAICCscwBwIBAAICEZswCgIF
// SIG // AOY7T24CAQAwNgYKKwYBBAGEWQoEAjEoMCYwDAYKKwYB
// SIG // BAGEWQoDAqAKMAgCAQACAwehIKEKMAgCAQACAwGGoDAN
// SIG // BgkqhkiG9w0BAQUFAAOBgQAsVTUmZwnOMvdVY6MrRx5H
// SIG // ZsOaxntkRqZnfAgw34ATo5U5dvcNhZdCaq8uMmY6Lz1G
// SIG // nnfmh64BCwxoNNx6hjjOqf5RHxBh/b7lwu1/UF0oWmwm
// SIG // tsUXqjZoY1jSuesOsMOVXslrBVb00ZPI+mMVzRWYCeVF
// SIG // Hp0JH1Wns8lZ4dRxEjGCBA0wggQJAgEBMIGTMHwxCzAJ
// SIG // BgNVBAYTAlVTMRMwEQYDVQQIEwpXYXNoaW5ndG9uMRAw
// SIG // DgYDVQQHEwdSZWRtb25kMR4wHAYDVQQKExVNaWNyb3Nv
// SIG // ZnQgQ29ycG9yYXRpb24xJjAkBgNVBAMTHU1pY3Jvc29m
// SIG // dCBUaW1lLVN0YW1wIFBDQSAyMDEwAhMzAAABnytFNRUI
// SIG // LktdAAEAAAGfMA0GCWCGSAFlAwQCAQUAoIIBSjAaBgkq
// SIG // hkiG9w0BCQMxDQYLKoZIhvcNAQkQAQQwLwYJKoZIhvcN
// SIG // AQkEMSIEIJJZ++AmgPjmrRDuVhJ8FWANrwMvau7yrCWA
// SIG // okJQsb5fMIH6BgsqhkiG9w0BCRACLzGB6jCB5zCB5DCB
// SIG // vQQghvFeKaIniZ6l51c8DVHo3ioCyXxB+z/o7KcsN0t8
// SIG // XNowgZgwgYCkfjB8MQswCQYDVQQGEwJVUzETMBEGA1UE
// SIG // CBMKV2FzaGluZ3RvbjEQMA4GA1UEBxMHUmVkbW9uZDEe
// SIG // MBwGA1UEChMVTWljcm9zb2Z0IENvcnBvcmF0aW9uMSYw
// SIG // JAYDVQQDEx1NaWNyb3NvZnQgVGltZS1TdGFtcCBQQ0Eg
// SIG // MjAxMAITMwAAAZ8rRTUVCC5LXQABAAABnzAiBCDWD8ME
// SIG // DSaIt9wpJOYIIi0smEzFtIJimSnXJw0Cuj0tTTANBgkq
// SIG // hkiG9w0BAQsFAASCAgAs0BG34Uz7vol5O5GKQm6y1J28
// SIG // l5O34zDjhSuA/SiggsUJ2KmuIAc6jPT5pBbbaOXhMN2/
// SIG // Ht7pyuCrbHNNN01ijA3/icak2GXzjPl9OAB3KMqgxk4E
// SIG // qR/GyfawOdozt6uER18SBbeioILJRc9JxX0NvgdiFk4u
// SIG // hCnT6EpMMThHjIf/AvWhBRjA+BpS3jS6mDvVSYCYosT3
// SIG // hu1XOl9Qxx3vUOBRCUelg/8mIYOO7+UFxliVj6/OHTDL
// SIG // n1aZE9ZpeocsJEo+xhINCixePwy0LZdsEjswXl1A0cPK
// SIG // khC6Fa7fJq6djktnM66MP6bfV1hK9dHm7ag1t1afw7bx
// SIG // 6XKIArzabAnKut9rqslKAApG7NK8cMGzecjHMcthbPZg
// SIG // rYXv1QTbyrWbG1P7A9kBCyppZceNA0yxaFJ/Mk1LSNY1
// SIG // T8X8+ei9Me6Kh960BTmhA9zN26gbBTXom0Ic4ubintNJ
// SIG // fabdyPeq8FhQ9qKtC/zXBTW5a5wM26TsnfsVp/oLqm0D
// SIG // EeVj5ZNVZvLxjd6dvnLOjL2N6xPdw+6NIg7Olshu+iXD
// SIG // hKnWqsq9vJLFt7HerHsmtKR3lPluPNK47HOzcke2/7Jp
// SIG // LHoqvQ9S94clmQx7w/ZBoBstDg+BmgjjQJ3IEFsIawxz
// SIG // Tork4oQyXmHnJXWKXmTRcbUy+m+mEcsymmuFOCsiBw==
// SIG // End signature block
