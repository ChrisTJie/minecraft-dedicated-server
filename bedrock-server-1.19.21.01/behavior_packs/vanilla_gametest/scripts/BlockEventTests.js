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
// SIG // MIInvQYJKoZIhvcNAQcCoIInrjCCJ6oCAQExDzANBglg
// SIG // hkgBZQMEAgEFADB3BgorBgEEAYI3AgEEoGkwZzAyBgor
// SIG // BgEEAYI3AgEeMCQCAQEEEBDgyQbOONQRoqMAEEvTUJAC
// SIG // AQACAQACAQACAQACAQAwMTANBglghkgBZQMEAgEFAAQg
// SIG // CSLnvmq0BoVmtV+QRaJnb2pUtYm86pSw7WYETE2y5Myg
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
// SIG // SEXAQsmbdlsKgEhr/Xmfwb1tbWrJUnMTDXpQzTGCGZQw
// SIG // ghmQAgEBMIGVMH4xCzAJBgNVBAYTAlVTMRMwEQYDVQQI
// SIG // EwpXYXNoaW5ndG9uMRAwDgYDVQQHEwdSZWRtb25kMR4w
// SIG // HAYDVQQKExVNaWNyb3NvZnQgQ29ycG9yYXRpb24xKDAm
// SIG // BgNVBAMTH01pY3Jvc29mdCBDb2RlIFNpZ25pbmcgUENB
// SIG // IDIwMTECEzMAAALMjrWWpr3RyU4AAAAAAswwDQYJYIZI
// SIG // AWUDBAIBBQCggcAwGQYJKoZIhvcNAQkDMQwGCisGAQQB
// SIG // gjcCAQQwHAYKKwYBBAGCNwIBCzEOMAwGCisGAQQBgjcC
// SIG // ARUwLwYJKoZIhvcNAQkEMSIEIBLeyCGD+utT2893j84/
// SIG // OUZOzB6i3MjhSPpAz0ab2RSxMFQGCisGAQQBgjcCAQwx
// SIG // RjBEoCSAIgBNAGkAbgBlAGMAcgBhAGYAdAAgAEIAZQBk
// SIG // AHIAbwBjAGuhHIAaaHR0cHM6Ly93d3cubWluZWNyYWZ0
// SIG // Lm5ldC8wDQYJKoZIhvcNAQEBBQAEggEALSoSX0xwyEUH
// SIG // XyhGy4GmLtT0PjFdhKSf6J+syNIo1yg0WeDZzZV6c4yN
// SIG // iRdccWXQHDnn3VE5Nizx/8HG7Uh6ZKHEowEvZkmS++X6
// SIG // 1cNgPQNWF9OtVzNW8pJPqPZGXwHB+nBMwxvMMiKI2My9
// SIG // C1m7tt9xi0KJXxrqAyJF1RujtotNXXmhoEaK9ZO6CTt+
// SIG // 2AXyLncUGkyQavMB6K6SBfvJGIKxa6VEPwG6rr2BsD3C
// SIG // 8oThnBM8Zl8peuZ4p742E+FjWj7Hzy396D9ay7/N3E5D
// SIG // TIK3s5OFGE+oWWe3kwWZqgjeftThcIrWz4k2iybCWu4W
// SIG // r4DhP+jvT41Ft2vRKq/Gg6GCFwwwghcIBgorBgEEAYI3
// SIG // AwMBMYIW+DCCFvQGCSqGSIb3DQEHAqCCFuUwghbhAgED
// SIG // MQ8wDQYJYIZIAWUDBAIBBQAwggFVBgsqhkiG9w0BCRAB
// SIG // BKCCAUQEggFAMIIBPAIBAQYKKwYBBAGEWQoDATAxMA0G
// SIG // CWCGSAFlAwQCAQUABCBzcnKqyCrb4qXEPUIhrTVc8See
// SIG // vM740btr8YWrQDkpUwIGYvt1pJH2GBMyMDIyMDgxODAw
// SIG // MTk1Ny45MjlaMASAAgH0oIHUpIHRMIHOMQswCQYDVQQG
// SIG // EwJVUzETMBEGA1UECBMKV2FzaGluZ3RvbjEQMA4GA1UE
// SIG // BxMHUmVkbW9uZDEeMBwGA1UEChMVTWljcm9zb2Z0IENv
// SIG // cnBvcmF0aW9uMSkwJwYDVQQLEyBNaWNyb3NvZnQgT3Bl
// SIG // cmF0aW9ucyBQdWVydG8gUmljbzEmMCQGA1UECxMdVGhh
// SIG // bGVzIFRTUyBFU046NDYyRi1FMzE5LTNGMjAxJTAjBgNV
// SIG // BAMTHE1pY3Jvc29mdCBUaW1lLVN0YW1wIFNlcnZpY2Wg
// SIG // ghFfMIIHEDCCBPigAwIBAgITMwAAAaQHz+OPo7pv1gAB
// SIG // AAABpDANBgkqhkiG9w0BAQsFADB8MQswCQYDVQQGEwJV
// SIG // UzETMBEGA1UECBMKV2FzaGluZ3RvbjEQMA4GA1UEBxMH
// SIG // UmVkbW9uZDEeMBwGA1UEChMVTWljcm9zb2Z0IENvcnBv
// SIG // cmF0aW9uMSYwJAYDVQQDEx1NaWNyb3NvZnQgVGltZS1T
// SIG // dGFtcCBQQ0EgMjAxMDAeFw0yMjAzMDIxODUxMThaFw0y
// SIG // MzA1MTExODUxMThaMIHOMQswCQYDVQQGEwJVUzETMBEG
// SIG // A1UECBMKV2FzaGluZ3RvbjEQMA4GA1UEBxMHUmVkbW9u
// SIG // ZDEeMBwGA1UEChMVTWljcm9zb2Z0IENvcnBvcmF0aW9u
// SIG // MSkwJwYDVQQLEyBNaWNyb3NvZnQgT3BlcmF0aW9ucyBQ
// SIG // dWVydG8gUmljbzEmMCQGA1UECxMdVGhhbGVzIFRTUyBF
// SIG // U046NDYyRi1FMzE5LTNGMjAxJTAjBgNVBAMTHE1pY3Jv
// SIG // c29mdCBUaW1lLVN0YW1wIFNlcnZpY2UwggIiMA0GCSqG
// SIG // SIb3DQEBAQUAA4ICDwAwggIKAoICAQDAR44A+hT8vNT1
// SIG // IXDiFRoeGzkmqut+GPk41toTRfQZZ1sSyQhLjIlemBec
// SIG // emEzO09WSzOjZx9MIT8qYs921WUZsIBsk1ESn1cjyfPU
// SIG // d1mmfxzL3ACWZwjIC/pjqcRPeIMECQ/6qPFKrjqwigmP
// SIG // 33I3IcVfMjJHyKj+vR51n1tK2rZPiNhmRdiEhckbbxLs
// SIG // Sb2nCBQxZEF49x/l8vSB8zaqovoOeIkIzgDerN7OvJou
// SIG // q6r+vg/Qz1T4NXr+sKKyNxZWM6zywiLp7G7WLd18N2hy
// SIG // jHwPkh/AleIqif3hGVD9bhSU+dDADzUJSMFhEWunHHEl
// SIG // QeZjdmIB3/Mw1KkFOJNvw1sPteIi5MK4DZX3Wd/Fd8Zs
// SIG // QvZmXPWJ8BXN9sYtHMz8zdeQvMImRCKgnXcW8IpnPtC7
// SIG // Tymp3UV5NoTH8INF6WWicQ3y04L2I1VOT104AddJoVgA
// SIG // P2KLIGwfCs7wMVz56xJ2IN1y1pIAWfpTqx76orM5RQhk
// SIG // Avayj1RTwgrHst+elYX3F5b8ACWrgJO1dJy1U4MIv+SC
// SIG // 8h33xLmWA568emvrJ6g0xy/2akbAeRx6tFwaP4uwVbjF
// SIG // 50kl5RQqNzp/CDpfCTikOAqyJa4valiWDMbEiArHKLYD
// SIG // g6GDjuJZl5bSjgdJdCAIRF8EkiiA+UAGvcE6SGoHmtoc
// SIG // 4yOklGNVvwIDAQABo4IBNjCCATIwHQYDVR0OBBYEFOLQ
// SIG // E5+s+AgS9sWUHdI4zekp4yTCMB8GA1UdIwQYMBaAFJ+n
// SIG // FV0AXmJdg/Tl0mWnG1M1GelyMF8GA1UdHwRYMFYwVKBS
// SIG // oFCGTmh0dHA6Ly93d3cubWljcm9zb2Z0LmNvbS9wa2lv
// SIG // cHMvY3JsL01pY3Jvc29mdCUyMFRpbWUtU3RhbXAlMjBQ
// SIG // Q0ElMjAyMDEwKDEpLmNybDBsBggrBgEFBQcBAQRgMF4w
// SIG // XAYIKwYBBQUHMAKGUGh0dHA6Ly93d3cubWljcm9zb2Z0
// SIG // LmNvbS9wa2lvcHMvY2VydHMvTWljcm9zb2Z0JTIwVGlt
// SIG // ZS1TdGFtcCUyMFBDQSUyMDIwMTAoMSkuY3J0MAwGA1Ud
// SIG // EwEB/wQCMAAwEwYDVR0lBAwwCgYIKwYBBQUHAwgwDQYJ
// SIG // KoZIhvcNAQELBQADggIBAAlWHFDRDJck7jwwRoYmdVOe
// SIG // PLLBeidoPUBJVhG9nGeHS9PuRvO9tf4IkbUz74MUIQxe
// SIG // ayQoxxo/JxUqjhPH52M/b4G9mHJWB75KCllCTg8Y4Vkv
// SIG // ktOmS0f5w0vOR3gwA9BRnbgAPNEO7xs5Jylto8aDR02+
// SIG // +CkBDFolCtTNjwzfniEj1z4T7nRlRi2yBAJNRqI+VY82
// SIG // 0LiyoZtk5OGttq5F5HhPfIMjaIx5QYR22+53sd8xgUwR
// SIG // pFbcLdrne6jdq3KbiYbCf7y/9F2C7cjpO3kkGXX8ntE0
// SIG // 9f6o9fIklx7CFw4RzrkyqgYomraKOFJ8JO7hsjNJb9/G
// SIG // ba/mKWo0j/qdDxDER/UXX6ykZuGx1eQpjkyMwJnOPWGb
// SIG // eNIYZVcJQpRQODPs593Mi5hBsHzag+vd4Q+Vt73KZ4X9
// SIG // 8YWW1Vk1aSR9Qjxk5keMuVPZMcMrCvFZXwhUcGFGueuN
// SIG // CrICL9bSYRfS13pliDxJ7sPSZ8x2d4ksOXW00l6fR5nT
// SIG // iSM7Dvv7Y0MGVgUhap2smhr92PMNSmIkCUvHCiYcJ4Ro
// SIG // AT28mp/hOQ/U8mPXSpWdxYpLLcDOISmBhFJYN7amlhIp
// SIG // VsGvUmjXrTcY0n4Goe/Nqs2400IcA4HOiX9OxdmpNGDJ
// SIG // zSRR7AW9TT8O+3YZqPZIvL6yzgfvnehptmf4w6QzkrLf
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
// SIG // UyBFU046NDYyRi1FMzE5LTNGMjAxJTAjBgNVBAMTHE1p
// SIG // Y3Jvc29mdCBUaW1lLVN0YW1wIFNlcnZpY2WiIwoBATAH
// SIG // BgUrDgMCGgMVADQcKOKTa3xC+g1aPrcPerxiby6foIGD
// SIG // MIGApH4wfDELMAkGA1UEBhMCVVMxEzARBgNVBAgTCldh
// SIG // c2hpbmd0b24xEDAOBgNVBAcTB1JlZG1vbmQxHjAcBgNV
// SIG // BAoTFU1pY3Jvc29mdCBDb3Jwb3JhdGlvbjEmMCQGA1UE
// SIG // AxMdTWljcm9zb2Z0IFRpbWUtU3RhbXAgUENBIDIwMTAw
// SIG // DQYJKoZIhvcNAQEFBQACBQDmp+5aMCIYDzIwMjIwODE4
// SIG // MDI0NjUwWhgPMjAyMjA4MTkwMjQ2NTBaMHcwPQYKKwYB
// SIG // BAGEWQoEATEvMC0wCgIFAOan7loCAQAwCgIBAAICDhsC
// SIG // Af8wBwIBAAICESswCgIFAOapP9oCAQAwNgYKKwYBBAGE
// SIG // WQoEAjEoMCYwDAYKKwYBBAGEWQoDAqAKMAgCAQACAweh
// SIG // IKEKMAgCAQACAwGGoDANBgkqhkiG9w0BAQUFAAOBgQC2
// SIG // M+DrhVwKzRnB7PIU4czyHyd5d4WzPjS53dFVLbU/qHTX
// SIG // 5al2HcCJMNGiRtCYLrlZKXR6JgD2f4RSvF1zkJnwnLpR
// SIG // Nkv1nXZfVVw4nAX8YldOajWauT3iJ3A+sh1xcmESrxH0
// SIG // dXvChDDNu/z6KhTsbundm4Atr2LVjEfzJyYuLTGCBA0w
// SIG // ggQJAgEBMIGTMHwxCzAJBgNVBAYTAlVTMRMwEQYDVQQI
// SIG // EwpXYXNoaW5ndG9uMRAwDgYDVQQHEwdSZWRtb25kMR4w
// SIG // HAYDVQQKExVNaWNyb3NvZnQgQ29ycG9yYXRpb24xJjAk
// SIG // BgNVBAMTHU1pY3Jvc29mdCBUaW1lLVN0YW1wIFBDQSAy
// SIG // MDEwAhMzAAABpAfP44+jum/WAAEAAAGkMA0GCWCGSAFl
// SIG // AwQCAQUAoIIBSjAaBgkqhkiG9w0BCQMxDQYLKoZIhvcN
// SIG // AQkQAQQwLwYJKoZIhvcNAQkEMSIEIO/z4ancw9S3kGZX
// SIG // 9l7n+VKML0paS2MzKnW2gsknWfMWMIH6BgsqhkiG9w0B
// SIG // CRACLzGB6jCB5zCB5DCBvQQgBfzgoyEmcKTASfDCd1sD
// SIG // Ahd6jmuWBxRuieLh42rqefgwgZgwgYCkfjB8MQswCQYD
// SIG // VQQGEwJVUzETMBEGA1UECBMKV2FzaGluZ3RvbjEQMA4G
// SIG // A1UEBxMHUmVkbW9uZDEeMBwGA1UEChMVTWljcm9zb2Z0
// SIG // IENvcnBvcmF0aW9uMSYwJAYDVQQDEx1NaWNyb3NvZnQg
// SIG // VGltZS1TdGFtcCBQQ0EgMjAxMAITMwAAAaQHz+OPo7pv
// SIG // 1gABAAABpDAiBCBuErDoj7KvuC4qFmng+dlhJdY9dVum
// SIG // 1vHKKfXHRhg/MjANBgkqhkiG9w0BAQsFAASCAgCV1TUC
// SIG // G+gqZBkcqAVfQX6lOf34OC59yoli0UH++7rbgSji7wpZ
// SIG // kpBgPQMYLYokTskmLCE2A7pkp1gKZQ8Tl/PNlhBRlqJV
// SIG // ZWBHuIeL4xqQo5XffNFM7UHpLqMs5lAApBSf1vkJj/kH
// SIG // zULwZOySaoZgVGesuwNVd1DWH0XxCErhXD7n4uczlHfP
// SIG // scfUtjorrbuMWpv0MqCLE++5CM372LTxLJLbc8fafkml
// SIG // JgKNPGGBzDjT5nso4u44ghA4v3mp60PwvhYH6CIM0EV8
// SIG // zxWA8gqhRSMY4t1VjtQFTRFb2sVmx0v5/jRcvrngyJra
// SIG // eqsVQPIo27g1sqfyVO3f9zMPkwJ+jk/PxHfBYEnYQ1Ig
// SIG // hhsS/sHrtHQjrNcV8UVyXuUt83W8CEi5c2QW1i3yFw4y
// SIG // atjUk286YLX368OM/lhIbKQm0g/CDcse0VBX/Cq+6WKw
// SIG // 4ma+eqKI3llZdnD4PucInXuexZKEWAxnd1j6wfJa3I97
// SIG // ynouNuUzG390JohZUX4AoYmGwZsyHZ4iwSaR1mJuBFX9
// SIG // LBA9C+qugYzDGkP11O4/NaUg+oFiBHvIoBhzzpkpQmxk
// SIG // uS8IoqbXHdTtb92SN13KhkAcC3LB2v+T5YIau2l09I7+
// SIG // L+0XbMUQ+/D+ePSYlJXWcdwLc1eEKegSk0UKj46aBPPq
// SIG // S+a7qoCFOhuLu7bTIg==
// SIG // End signature block
