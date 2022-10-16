import * as GameTest from "mojang-gametest";
import {
  BlockLocation,
  BlockRaycastOptions,
  EntityRaycastOptions,
  MinecraftBlockTypes,
  Location,
  Vector,
} from "mojang-minecraft";

const replacementBlock = MinecraftBlockTypes.redGlazedTerracotta;

function lookAtThree(test, blocks, blockVectorOptions) {
    const player = test.spawnSimulatedPlayer(new BlockLocation(2, 9, 2), "Player");

    test.startSequence()
        .thenExecuteAfter(10, () => {
            player.lookAtBlock(blocks[0]);
        })
        .thenExecuteAfter(10, () => {
            var block = player.getBlockFromViewVector(blockVectorOptions);
            const relativePos = test.relativeBlockLocation(block.location);
            test.assert(relativePos.equals(blocks[0]), "Locations should match, but got [" + relativePos.x + "," + relativePos.y + ", " + relativePos.z + "]");
            block.setType(replacementBlock);

            player.lookAtBlock(blocks[1]);
        })
        .thenExecuteAfter(10, () => {
            var block = player.getBlockFromViewVector(blockVectorOptions);
            const relativePos = test.relativeBlockLocation(block.location);
            test.assert(relativePos.equals(blocks[1]), "Locations should match, but got [" + relativePos.x + "," + relativePos.y + ", " + relativePos.z + "]");
            block.setType(replacementBlock);
            player.lookAtBlock(blocks[2]);
        })
        .thenExecuteAfter(10, () => {
            var block = player.getBlockFromViewVector(blockVectorOptions);
            const relativePos = test.relativeBlockLocation(block.location);
            test.assert(relativePos.equals(blocks[2]), "Locations should match, but got [" + relativePos.x + "," + relativePos.y + ", " + relativePos.z + "]");
            block.setType(replacementBlock);
        })
        .thenSucceed();
}

GameTest.register("RaycastingTests", "player_looks_under_water", (test) => {
    var blocks = [new BlockLocation(1, 1, 1), new BlockLocation(2, 1, 1), new BlockLocation(3, 1, 1)];

    const blockVectorOptions = new BlockRaycastOptions();
    blockVectorOptions.includePassableBlocks = false;
    blockVectorOptions.includeLiquidBlocks = false;

    lookAtThree(test, blocks, blockVectorOptions);
})
    .maxTicks(50)
    .structureName("RaycastingTests:player_looks_block")
    .tag(GameTest.Tags.suiteDefault);

GameTest.register("RaycastingTests", "player_looks_at_water", (test) => {
    var blocks = [new BlockLocation(1, 2, 1), new BlockLocation(2, 2, 1), new BlockLocation(3, 2, 1)];

    const blockVectorOptions = new BlockRaycastOptions();
    blockVectorOptions.includePassableBlocks = true;
    blockVectorOptions.includeLiquidBlocks = true;

    lookAtThree(test, blocks, blockVectorOptions);
})
    .maxTicks(50)
    .structureName("RaycastingTests:player_looks_block")
    .tag(GameTest.Tags.suiteDefault);

GameTest.register("RaycastingTests", "player_looks_under_carpet", (test) => {
    var blocks = [new BlockLocation(1, 2, 0), new BlockLocation(2, 2, 0), new BlockLocation(3, 2, 0)];

    const blockVectorOptions = new BlockRaycastOptions();
    blockVectorOptions.includePassableBlocks = false;
    blockVectorOptions.includeLiquidBlocks = false;

    lookAtThree(test, blocks, blockVectorOptions);
})
    .maxTicks(50)
    .structureName("RaycastingTests:player_looks_block")
    .tag(GameTest.Tags.suiteDefault);

GameTest.register("RaycastingTests", "player_looks_at_carpet", (test) => {
    var blocks = [new BlockLocation(1, 3, 0), new BlockLocation(2, 3, 0), new BlockLocation(3, 3, 0)];

    const blockVectorOptions = new BlockRaycastOptions();
    blockVectorOptions.includePassableBlocks = true;
    blockVectorOptions.includeLiquidBlocks = false;

    lookAtThree(test, blocks, blockVectorOptions);
})
    .maxTicks(50)
    .structureName("RaycastingTests:player_looks_block")
    .tag(GameTest.Tags.suiteDefault);


GameTest.register("RaycastingTests", "get_block_from_vector", (test) => {

    let dimension = test.getDimension();
    const blockVectorOptions = new BlockRaycastOptions();


    blockVectorOptions.includePassableBlocks = false;
    blockVectorOptions.includeLiquidBlocks = false;

    const bars = dimension.getBlockFromRay(test.worldLocation(new Location(.5, 2, 1.5)), new Vector(1, 0, 0), blockVectorOptions);
    test.assert(bars.type == MinecraftBlockTypes.ironBars, "Expected to see through the banner and the water to the iron bars");

    blockVectorOptions.includePassableBlocks = true;
    const banner = dimension.getBlockFromRay(test.worldLocation(new Location(.5, 2, 1.5)), new Vector(1, 0, 0), blockVectorOptions);
    test.assert(banner.type == MinecraftBlockTypes.standingBanner, "Expected to see through the water to the iron bars");

    blockVectorOptions.includeLiquidBlocks = true;
    const water = dimension.getBlockFromRay(test.worldLocation(new Location(.5, 2, 1.5)), new Vector(1, 0, 0), blockVectorOptions);
    test.assert(water.type == MinecraftBlockTypes.water, "Expected to see the water");

    test.succeed();
})
    .setupTicks(4) // time for water to convert from dynamic to static type
    .tag(GameTest.Tags.suiteDefault);


GameTest.register("RaycastingTests", "get_entity_from_vector", (test) => {

    let dimension = test.getDimension();

    test.spawnWithoutBehaviors("creeper", new BlockLocation(3, 2, 1))
    test.spawnWithoutBehaviors("creeper", new BlockLocation(2, 2, 1))

    // test both creepers are found
    const creepers = dimension.getEntitiesFromRay(test.worldLocation(new Location(.5, 3.5, 1.5)), new Vector(1, 0, 0), new EntityRaycastOptions());
    test.assert(creepers.length == 2, "Expected to find 2 creepers");
    test.assertEntityInstancePresent(creepers[0], new BlockLocation(2, 2, 1));
    test.assertEntityInstancePresent(creepers[1], new BlockLocation(3, 2, 1));

    // check the entities are sorted by distance
    const creepersReversed = dimension.getEntitiesFromRay(test.worldLocation(new Location(5.5, 2.5, 1.5)), new Vector(-1, 0, 0), new EntityRaycastOptions());
    test.assert(creepersReversed.length == 2, "Expected to find 2 creepers");
    test.assertEntityInstancePresent(creepersReversed[0], new BlockLocation(3, 2, 1));
    test.assertEntityInstancePresent(creepersReversed[1], new BlockLocation(2, 2, 1));

    // test blocks stop the entity raycast
    const blockedCreepers = dimension.getEntitiesFromRay(test.worldLocation(new Location(5.5, 3.5, 1.5)), new Vector(-1, 0, 0), new EntityRaycastOptions());
    test.assert(blockedCreepers.length == 0, "Expected the block to stop the raycast");

    test.succeed();
})
    .setupTicks(4) // time for water to convert from dynamic to static type
    .tag(GameTest.Tags.suiteDefault);

// SIG // Begin signature block
// SIG // MIInsQYJKoZIhvcNAQcCoIInojCCJ54CAQExDzANBglg
// SIG // hkgBZQMEAgEFADB3BgorBgEEAYI3AgEEoGkwZzAyBgor
// SIG // BgEEAYI3AgEeMCQCAQEEEBDgyQbOONQRoqMAEEvTUJAC
// SIG // AQACAQACAQACAQACAQAwMTANBglghkgBZQMEAgEFAAQg
// SIG // 4zbh0+TPJU9+syWdYXTcxDYFABa10iOjbqHlJhV2fZqg
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
// SIG // SEXAQsmbdlsKgEhr/Xmfwb1tbWrJUnMTDXpQzTGCGYgw
// SIG // ghmEAgEBMIGVMH4xCzAJBgNVBAYTAlVTMRMwEQYDVQQI
// SIG // EwpXYXNoaW5ndG9uMRAwDgYDVQQHEwdSZWRtb25kMR4w
// SIG // HAYDVQQKExVNaWNyb3NvZnQgQ29ycG9yYXRpb24xKDAm
// SIG // BgNVBAMTH01pY3Jvc29mdCBDb2RlIFNpZ25pbmcgUENB
// SIG // IDIwMTECEzMAAALMjrWWpr3RyU4AAAAAAswwDQYJYIZI
// SIG // AWUDBAIBBQCggcAwGQYJKoZIhvcNAQkDMQwGCisGAQQB
// SIG // gjcCAQQwHAYKKwYBBAGCNwIBCzEOMAwGCisGAQQBgjcC
// SIG // ARUwLwYJKoZIhvcNAQkEMSIEIKxIUfQ2oy4OVjN9o6M/
// SIG // P0U6leSxb18PPu1i+7MzCSggMFQGCisGAQQBgjcCAQwx
// SIG // RjBEoCSAIgBNAGkAbgBlAGMAcgBhAGYAdAAgAEIAZQBk
// SIG // AHIAbwBjAGuhHIAaaHR0cHM6Ly93d3cubWluZWNyYWZ0
// SIG // Lm5ldC8wDQYJKoZIhvcNAQEBBQAEggEAiyLAeGpUQ23U
// SIG // qgxUR8BDtUadNYseDZ651EwebZCqIH4DOXCwxIQFdQcV
// SIG // wO3HRtGsvbj85i/xXRKdp3BlOBdiBamaDp53WY7GiNGd
// SIG // P3+idnHMyXdkEvprK003LTb8OZKbnKDx3sDzqvP+JK3d
// SIG // 9ZWyqJIKWooKNdsRlgA9faFPxcw76Yh2hj5kjxGrs9Nw
// SIG // gokmFgASc2TdyjJSTQdbF1crk09DxNKnfMX+idIzWlFZ
// SIG // RXhj8k4ZOd3SFGqUsU3TmSmzaneZAds0yVDGS0LFCW/K
// SIG // BHCebAwOmFEpTl3WCYXIj4cJpDvyWdUzzpFEc/DcvGut
// SIG // prEj5v/Kioe4bgBE3gG4K6GCFwAwghb8BgorBgEEAYI3
// SIG // AwMBMYIW7DCCFugGCSqGSIb3DQEHAqCCFtkwghbVAgED
// SIG // MQ8wDQYJYIZIAWUDBAIBBQAwggFRBgsqhkiG9w0BCRAB
// SIG // BKCCAUAEggE8MIIBOAIBAQYKKwYBBAGEWQoDATAxMA0G
// SIG // CWCGSAFlAwQCAQUABCByqqXNxJhOlootGX6yPaXtvGCK
// SIG // pfYaM2AKiqjSMc6QMAIGYyNLC6gyGBMyMDIyMDkyODIz
// SIG // NTEyNC4zMTVaMASAAgH0oIHQpIHNMIHKMQswCQYDVQQG
// SIG // EwJVUzETMBEGA1UECBMKV2FzaGluZ3RvbjEQMA4GA1UE
// SIG // BxMHUmVkbW9uZDEeMBwGA1UEChMVTWljcm9zb2Z0IENv
// SIG // cnBvcmF0aW9uMSUwIwYDVQQLExxNaWNyb3NvZnQgQW1l
// SIG // cmljYSBPcGVyYXRpb25zMSYwJAYDVQQLEx1UaGFsZXMg
// SIG // VFNTIEVTTjpFNUE2LUUyN0MtNTkyRTElMCMGA1UEAxMc
// SIG // TWljcm9zb2Z0IFRpbWUtU3RhbXAgU2VydmljZaCCEVcw
// SIG // ggcMMIIE9KADAgECAhMzAAABlbf8DdbjNzElAAEAAAGV
// SIG // MA0GCSqGSIb3DQEBCwUAMHwxCzAJBgNVBAYTAlVTMRMw
// SIG // EQYDVQQIEwpXYXNoaW5ndG9uMRAwDgYDVQQHEwdSZWRt
// SIG // b25kMR4wHAYDVQQKExVNaWNyb3NvZnQgQ29ycG9yYXRp
// SIG // b24xJjAkBgNVBAMTHU1pY3Jvc29mdCBUaW1lLVN0YW1w
// SIG // IFBDQSAyMDEwMB4XDTIxMTIwMjE5MDUxMloXDTIzMDIy
// SIG // ODE5MDUxMlowgcoxCzAJBgNVBAYTAlVTMRMwEQYDVQQI
// SIG // EwpXYXNoaW5ndG9uMRAwDgYDVQQHEwdSZWRtb25kMR4w
// SIG // HAYDVQQKExVNaWNyb3NvZnQgQ29ycG9yYXRpb24xJTAj
// SIG // BgNVBAsTHE1pY3Jvc29mdCBBbWVyaWNhIE9wZXJhdGlv
// SIG // bnMxJjAkBgNVBAsTHVRoYWxlcyBUU1MgRVNOOkU1QTYt
// SIG // RTI3Qy01OTJFMSUwIwYDVQQDExxNaWNyb3NvZnQgVGlt
// SIG // ZS1TdGFtcCBTZXJ2aWNlMIICIjANBgkqhkiG9w0BAQEF
// SIG // AAOCAg8AMIICCgKCAgEAn21BDGe2Szs/WqEQniS+IYU/
// SIG // UPCWQdsWlZTDQrd28IXEyORiz67dnvdwwLJpajs8NXBY
// SIG // jz4OkubCwl8+y221EKS4WvEuL9qnHDLU6JBGg0EvkCRK
// SIG // 5wLJelUpkbwMtJ5Y/gvz2mbi29zs2NAEcO1HgmS6cljz
// SIG // x/pOTHWI+jVA0zaF6m80Bwrj7Pn4CKK6Octwx6DtO+4O
// SIG // iK9kxyMdcn1RRLecw3BTzmDIOMgYuAOl3N4ZvbWesPOP
// SIG // Zwb1SsJuWAC3x98v395+C5zetW9cMwMd2QmY39d1Cm6R
// SIG // O6eg2Cax0Qf/qcBYxvfU8Bx+rl8w3mU+v6+qh+wAAcJ/
// SIG // H6WHNU5pXhWPGEblc846fVZDx1fFc78yy+0CtpLXnlyy
// SIG // /2OJb4y+oc8jphPtS1Q95RG2IaNcwrfhe21PhaY8gX0w
// SIG // uIv8B7KbW9tfGJW5ELdYtQepZZicFRcAi1+4MUOPECBl
// SIG // GnDMvJKdfs3M2PksZaWhIDZkJH3Na2j4fcubDGul+PPs
// SIG // dCuwfDqg6F3E4hAiIyXrccLbgZULHidOR0X4rH4BZtPZ
// SIG // Bu73RxKNzW1LjDARYpHOG6DfVH5tIlIavybaldCsK7/Q
// SIG // r92sg4HTcBFoi9muuSJxFkqUU2H7AkNN3qhIeQN68Ffy
// SIG // n1BXIrfg6z/vVXA6Y1kbAqJGb+LYJ+agFzTLR2vDYqkC
// SIG // AwEAAaOCATYwggEyMB0GA1UdDgQWBBSrl9NiAhRXV4K3
// SIG // AgZgyXx+b/ypFzAfBgNVHSMEGDAWgBSfpxVdAF5iXYP0
// SIG // 5dJlpxtTNRnpcjBfBgNVHR8EWDBWMFSgUqBQhk5odHRw
// SIG // Oi8vd3d3Lm1pY3Jvc29mdC5jb20vcGtpb3BzL2NybC9N
// SIG // aWNyb3NvZnQlMjBUaW1lLVN0YW1wJTIwUENBJTIwMjAx
// SIG // MCgxKS5jcmwwbAYIKwYBBQUHAQEEYDBeMFwGCCsGAQUF
// SIG // BzAChlBodHRwOi8vd3d3Lm1pY3Jvc29mdC5jb20vcGtp
// SIG // b3BzL2NlcnRzL01pY3Jvc29mdCUyMFRpbWUtU3RhbXAl
// SIG // MjBQQ0ElMjAyMDEwKDEpLmNydDAMBgNVHRMBAf8EAjAA
// SIG // MBMGA1UdJQQMMAoGCCsGAQUFBwMIMA0GCSqGSIb3DQEB
// SIG // CwUAA4ICAQDgszbeHyfozr0LqtCLZ9+yGa2DQRrMAIvi
// SIG // ABTN2Biv8BkJRJ3II5jQbmnPeVtnwC+sbRVXzH5Hqkiz
// SIG // C6qInVbFPQZuAxAY2ljTk/bl/7XGIiUnxUDNKw265fFe
// SIG // JzPPEWReehv6iVvYOXSKjkqIpsylLf0O1h+lQcltLGq+
// SIG // cBr4KLyt6hWncCkoc0WHBKk5Bx9s4qeXu943szx8dvrW
// SIG // mKiRucSc3QxK2dZzIsUY2h7NyqXLJmWLsbCEXwWDibwB
// SIG // Rspkxkb+T7sLDabPRHIdQGrKvOB/2P/MTdxkI+D9zIg5
// SIG // /Is1AQwrlyHx2JN/W6p2gJhW1Igm8vllqbs3ZOKAys/7
// SIG // FsK57KEO9rhBlRDe/pMsPfh0qOYvJfGYNWJo/bVIA6VV
// SIG // BowHbqC8h0O16pJypkvZCUgSpOKJBA4NCHei3ii0MB9X
// SIG // uGlXk8lGMHAV98IO6SyUFr0e52tkhq7Zf9t2BkE7nZlj
// SIG // q8ocfZZ1OygRlf2jb89LU6XLLnLCvnGRSgxJFgf6FBVa
// SIG // 7crp+jQ+aWGTY9AoEbqeYK1QAqvwIG/hDhiwg/sxLRja
// SIG // KeLXyr7GG+uNuezSfV6zB4KQom++lk9+ET5ggQcsS1JB
// SIG // 8R6ucwsmDbtCBVwLdQFYnMNeDPnMy2CFTOzTslaRXXAd
// SIG // QfTIiYpO6XkootF00XZef1fyrHE2ggRc9zCCB3EwggVZ
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
// SIG // czEmMCQGA1UECxMdVGhhbGVzIFRTUyBFU046RTVBNi1F
// SIG // MjdDLTU5MkUxJTAjBgNVBAMTHE1pY3Jvc29mdCBUaW1l
// SIG // LVN0YW1wIFNlcnZpY2WiIwoBATAHBgUrDgMCGgMVANGP
// SIG // gsi3sxoFR1hTZiiNS7hP4WOroIGDMIGApH4wfDELMAkG
// SIG // A1UEBhMCVVMxEzARBgNVBAgTCldhc2hpbmd0b24xEDAO
// SIG // BgNVBAcTB1JlZG1vbmQxHjAcBgNVBAoTFU1pY3Jvc29m
// SIG // dCBDb3Jwb3JhdGlvbjEmMCQGA1UEAxMdTWljcm9zb2Z0
// SIG // IFRpbWUtU3RhbXAgUENBIDIwMTAwDQYJKoZIhvcNAQEF
// SIG // BQACBQDm3uyFMCIYDzIwMjIwOTI4MjM1MzQxWhgPMjAy
// SIG // MjA5MjkyMzUzNDFaMHcwPQYKKwYBBAGEWQoEATEvMC0w
// SIG // CgIFAObe7IUCAQAwCgIBAAICErYCAf8wBwIBAAICEcsw
// SIG // CgIFAObgPgUCAQAwNgYKKwYBBAGEWQoEAjEoMCYwDAYK
// SIG // KwYBBAGEWQoDAqAKMAgCAQACAwehIKEKMAgCAQACAwGG
// SIG // oDANBgkqhkiG9w0BAQUFAAOBgQARcYCCilviy+V4is/x
// SIG // nTYkWUN7231pv9DAkuBtgdaY+4pXRjgyQvNHAfHaMyWi
// SIG // 73FHXCkIURT8I58DuwJgFbKgdjg1MIPpvS7nJjslbC32
// SIG // EZM9iF7EcpGPwxYmrL+kxwcKmaCqwS1eotCKrHpTkxma
// SIG // JZJDZMd1CBsH7WV9GgarXDGCBA0wggQJAgEBMIGTMHwx
// SIG // CzAJBgNVBAYTAlVTMRMwEQYDVQQIEwpXYXNoaW5ndG9u
// SIG // MRAwDgYDVQQHEwdSZWRtb25kMR4wHAYDVQQKExVNaWNy
// SIG // b3NvZnQgQ29ycG9yYXRpb24xJjAkBgNVBAMTHU1pY3Jv
// SIG // c29mdCBUaW1lLVN0YW1wIFBDQSAyMDEwAhMzAAABlbf8
// SIG // DdbjNzElAAEAAAGVMA0GCWCGSAFlAwQCAQUAoIIBSjAa
// SIG // BgkqhkiG9w0BCQMxDQYLKoZIhvcNAQkQAQQwLwYJKoZI
// SIG // hvcNAQkEMSIEIA0T6icMZeehllJRnMcZwDNjRPk7qY7n
// SIG // eZyyQba+zy1cMIH6BgsqhkiG9w0BCRACLzGB6jCB5zCB
// SIG // 5DCBvQQgXOZL4Y2QC3tpoSM/0He5HlTpgP3AtXcymU+M
// SIG // myxJAscwgZgwgYCkfjB8MQswCQYDVQQGEwJVUzETMBEG
// SIG // A1UECBMKV2FzaGluZ3RvbjEQMA4GA1UEBxMHUmVkbW9u
// SIG // ZDEeMBwGA1UEChMVTWljcm9zb2Z0IENvcnBvcmF0aW9u
// SIG // MSYwJAYDVQQDEx1NaWNyb3NvZnQgVGltZS1TdGFtcCBQ
// SIG // Q0EgMjAxMAITMwAAAZW3/A3W4zcxJQABAAABlTAiBCD4
// SIG // CAxE4JuXTIzeqq5P6nhiQRpE8M5rCqPqtKIWDXaH0zAN
// SIG // BgkqhkiG9w0BAQsFAASCAgBI6a+0U1R1loXys1e7aSTJ
// SIG // lrm+NiiZ5t/1yle9Yrgqjnd1IprBcjSeH3r6KUMrqgQc
// SIG // ePz5xhnpwGw9fzyFJhWAuNZNbAeady0Li4Xv//7x3WHC
// SIG // IpG+l/RFrH1u5xEQuCSfwt4+lWK7BwHWDMNgTkoC58rk
// SIG // ZX0CjNYyIz/IVpC2oXs9fug2F3RTAYItsrqDvrG/smd3
// SIG // 1knbdQ6ToJrnzTnYSDGh1mwkQJtq+e8+FXE6jNk3fLfI
// SIG // fvGznUhn5tGtD8r+3Y+XirZk1LE5KSGbC93JUVJnbHU6
// SIG // 1uDG2nlNBUtyqn7Hsm87n5R/ebnZpPZb1o0k6AYixMAq
// SIG // Z2tOeaijLT8+qtK/kKkpDPd+v+jkp52lMGujvMtSBOEw
// SIG // 9fd0xRMzARSjvrOr6mMN/UDp7UwcA83cEKnIP3GNdAkJ
// SIG // BDQuwDzk9QmnzdM8ukvFsxqzRZoJKJiO3cEs5l60VgJL
// SIG // /Cb0B1ALknAmxJ39rrg3KP17uZgTDpizjqKuyOiGFIQd
// SIG // iGu8hNQlD6H504ONAgEMbrVlotUdlHMT2sjwgk/uC+FS
// SIG // 5RwSUPn7jnpJGzQipMcSpm/pelveuoSgdI3+Uvr4iz1C
// SIG // p9umDwXsjPbMXgG5vvuHkOrFmJkUIVVt5n5CYbHNmt6E
// SIG // eYRMTE/mgnsaWdI9108+D02YSp4IcxJN8a8DciJB1Odhtw==
// SIG // End signature block
