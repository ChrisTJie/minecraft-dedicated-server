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
// SIG // MIIntQYJKoZIhvcNAQcCoIInpjCCJ6ICAQExDzANBglg
// SIG // hkgBZQMEAgEFADB3BgorBgEEAYI3AgEEoGkwZzAyBgor
// SIG // BgEEAYI3AgEeMCQCAQEEEBDgyQbOONQRoqMAEEvTUJAC
// SIG // AQACAQACAQACAQACAQAwMTANBglghkgBZQMEAgEFAAQg
// SIG // 4zbh0+TPJU9+syWdYXTcxDYFABa10iOjbqHlJhV2fZqg
// SIG // gg2FMIIGAzCCA+ugAwIBAgITMwAAAlPjg96W3sVuzAAA
// SIG // AAACUzANBgkqhkiG9w0BAQsFADB+MQswCQYDVQQGEwJV
// SIG // UzETMBEGA1UECBMKV2FzaGluZ3RvbjEQMA4GA1UEBxMH
// SIG // UmVkbW9uZDEeMBwGA1UEChMVTWljcm9zb2Z0IENvcnBv
// SIG // cmF0aW9uMSgwJgYDVQQDEx9NaWNyb3NvZnQgQ29kZSBT
// SIG // aWduaW5nIFBDQSAyMDExMB4XDTIxMDkwMjE4MzMwMFoX
// SIG // DTIyMDkwMTE4MzMwMFowdDELMAkGA1UEBhMCVVMxEzAR
// SIG // BgNVBAgTCldhc2hpbmd0b24xEDAOBgNVBAcTB1JlZG1v
// SIG // bmQxHjAcBgNVBAoTFU1pY3Jvc29mdCBDb3Jwb3JhdGlv
// SIG // bjEeMBwGA1UEAxMVTWljcm9zb2Z0IENvcnBvcmF0aW9u
// SIG // MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA
// SIG // y4cR8KtzoR/uCfkl+Kkv1UBvB8m3HB+7ZxvgVKq17m3x
// SIG // rgxWD2dvbgrh30JTtZcoC4DKSeBnoev+qaEOVZAyn1bL
// SIG // J+mgNTwsyIfIjjzEPTI7t7CxfUp/j87monuATa6dDLmS
// SIG // wxF4FWMdljY5s6nMQu3WPUgt85zoealMtr55lsoAu2/Z
// SIG // I9HdyaxrY3OaudFn1d1i1wEB5HkUTrCRQWX1xRqEr0ZY
// SIG // xRVAI1P83YT/dj/tSYkUUYpFcv7KiITA2Pu7VXc5RNn8
// SIG // Jyjr/S0oYCnshHr4DJdAdRauxNmHgWSheipYZmIvQhNd
// SIG // +dHJ01KFOGKUEp2aNGAJ2np0RAy3xRik3QIDAQABo4IB
// SIG // gjCCAX4wHwYDVR0lBBgwFgYKKwYBBAGCN0wIAQYIKwYB
// SIG // BQUHAwMwHQYDVR0OBBYEFJWaS1iHHF6MXrLAPw0W3tuo
// SIG // JYRDMFQGA1UdEQRNMEukSTBHMS0wKwYDVQQLEyRNaWNy
// SIG // b3NvZnQgSXJlbGFuZCBPcGVyYXRpb25zIExpbWl0ZWQx
// SIG // FjAUBgNVBAUTDTIzMDAxMis0Njc1OTgwHwYDVR0jBBgw
// SIG // FoAUSG5k5VAF04KqFzc3IrVtqMp1ApUwVAYDVR0fBE0w
// SIG // SzBJoEegRYZDaHR0cDovL3d3dy5taWNyb3NvZnQuY29t
// SIG // L3BraW9wcy9jcmwvTWljQ29kU2lnUENBMjAxMV8yMDEx
// SIG // LTA3LTA4LmNybDBhBggrBgEFBQcBAQRVMFMwUQYIKwYB
// SIG // BQUHMAKGRWh0dHA6Ly93d3cubWljcm9zb2Z0LmNvbS9w
// SIG // a2lvcHMvY2VydHMvTWljQ29kU2lnUENBMjAxMV8yMDEx
// SIG // LTA3LTA4LmNydDAMBgNVHRMBAf8EAjAAMA0GCSqGSIb3
// SIG // DQEBCwUAA4ICAQClWPsinCVVcX/VtrzZC+bn4zqanL1T
// SIG // jjnVco8tXZrDuDvJIVoaq3nHVWadPWnTmfJHDLUNFPqC
// SIG // sePOCYNdXHOApNBcjgZ6fmCBWzsWAqs2qjHGkQIMuPJ9
// SIG // bW8/xBWIhcyZjIhp5YFhQkrTjT70DgQ9svxI96gUZxsv
// SIG // RGUtRA5UTf/JeUbNx19pWYXfVrrpEW1JPN1PfUzycqNd
// SIG // nFNDG959Ryb/yWacEsqm9ztKOBxMVSUpMDdZuNn0lSFb
// SIG // V1VUmmGYlab99hqA/3cgEv4MqZX0ehSN0ZwjqJs5cnEq
// SIG // qM9MwQjxYgjIVYUOqp/idBoYEQSbxios8PuZU35wRaKi
// SIG // mSQ0Ts/rhg5fbcOib51agGShq1r/wrGGnoGj3jxawFUs
// SIG // QMlMDhU5AKrTQvLgHnvq79lecS8PBX6SieciojCpwiqy
// SIG // GhUA6+QGe39noxhg3/vE8zoitQIAbzlt4kxBGv2rfGeP
// SIG // rNQppxAJAItHC4we9giXnVNSwLMHTgljNjAyGVaPY9E+
// SIG // +DpCS04z3d1jRMsNKwV08oZW2ELGLexJU9pdk05ReRJq
// SIG // VYsRrY+AoTY1qCq/ckwKrWnXdmJuRTQe/dhs8DcGut9Q
// SIG // TwoASZnEaRSl7dFREKu1F1TWAYgUXfseMr46quWhe1wu
// SIG // Z1woI2wpOyF8JjqYTbjQzYkavNxI453O5sayRjCCB3ow
// SIG // ggVioAMCAQICCmEOkNIAAAAAAAMwDQYJKoZIhvcNAQEL
// SIG // BQAwgYgxCzAJBgNVBAYTAlVTMRMwEQYDVQQIEwpXYXNo
// SIG // aW5ndG9uMRAwDgYDVQQHEwdSZWRtb25kMR4wHAYDVQQK
// SIG // ExVNaWNyb3NvZnQgQ29ycG9yYXRpb24xMjAwBgNVBAMT
// SIG // KU1pY3Jvc29mdCBSb290IENlcnRpZmljYXRlIEF1dGhv
// SIG // cml0eSAyMDExMB4XDTExMDcwODIwNTkwOVoXDTI2MDcw
// SIG // ODIxMDkwOVowfjELMAkGA1UEBhMCVVMxEzARBgNVBAgT
// SIG // Cldhc2hpbmd0b24xEDAOBgNVBAcTB1JlZG1vbmQxHjAc
// SIG // BgNVBAoTFU1pY3Jvc29mdCBDb3Jwb3JhdGlvbjEoMCYG
// SIG // A1UEAxMfTWljcm9zb2Z0IENvZGUgU2lnbmluZyBQQ0Eg
// SIG // MjAxMTCCAiIwDQYJKoZIhvcNAQEBBQADggIPADCCAgoC
// SIG // ggIBAKvw+nIQHC6t2G6qghBNNLrytlghn0IbKmvpWlCq
// SIG // uAY4GgRJun/DDB7dN2vGEtgL8DjCmQawyDnVARQxQtOJ
// SIG // DXlkh36UYCRsr55JnOloXtLfm1OyCizDr9mpK656Ca/X
// SIG // llnKYBoF6WZ26DJSJhIv56sIUM+zRLdd2MQuA3WraPPL
// SIG // bfM6XKEW9Ea64DhkrG5kNXimoGMPLdNAk/jj3gcN1Vx5
// SIG // pUkp5w2+oBN3vpQ97/vjK1oQH01WKKJ6cuASOrdJXtjt
// SIG // 7UORg9l7snuGG9k+sYxd6IlPhBryoS9Z5JA7La4zWMW3
// SIG // Pv4y07MDPbGyr5I4ftKdgCz1TlaRITUlwzluZH9TupwP
// SIG // rRkjhMv0ugOGjfdf8NBSv4yUh7zAIXQlXxgotswnKDgl
// SIG // mDlKNs98sZKuHCOnqWbsYR9q4ShJnV+I4iVd0yFLPlLE
// SIG // tVc/JAPw0XpbL9Uj43BdD1FGd7P4AOG8rAKCX9vAFbO9
// SIG // G9RVS+c5oQ/pI0m8GLhEfEXkwcNyeuBy5yTfv0aZxe/C
// SIG // HFfbg43sTUkwp6uO3+xbn6/83bBm4sGXgXvt1u1L50kp
// SIG // pxMopqd9Z4DmimJ4X7IvhNdXnFy/dygo8e1twyiPLI9A
// SIG // N0/B4YVEicQJTMXUpUMvdJX3bvh4IFgsE11glZo+TzOE
// SIG // 2rCIF96eTvSWsLxGoGyY0uDWiIwLAgMBAAGjggHtMIIB
// SIG // 6TAQBgkrBgEEAYI3FQEEAwIBADAdBgNVHQ4EFgQUSG5k
// SIG // 5VAF04KqFzc3IrVtqMp1ApUwGQYJKwYBBAGCNxQCBAwe
// SIG // CgBTAHUAYgBDAEEwCwYDVR0PBAQDAgGGMA8GA1UdEwEB
// SIG // /wQFMAMBAf8wHwYDVR0jBBgwFoAUci06AjGQQ7kUBU7h
// SIG // 6qfHMdEjiTQwWgYDVR0fBFMwUTBPoE2gS4ZJaHR0cDov
// SIG // L2NybC5taWNyb3NvZnQuY29tL3BraS9jcmwvcHJvZHVj
// SIG // dHMvTWljUm9vQ2VyQXV0MjAxMV8yMDExXzAzXzIyLmNy
// SIG // bDBeBggrBgEFBQcBAQRSMFAwTgYIKwYBBQUHMAKGQmh0
// SIG // dHA6Ly93d3cubWljcm9zb2Z0LmNvbS9wa2kvY2VydHMv
// SIG // TWljUm9vQ2VyQXV0MjAxMV8yMDExXzAzXzIyLmNydDCB
// SIG // nwYDVR0gBIGXMIGUMIGRBgkrBgEEAYI3LgMwgYMwPwYI
// SIG // KwYBBQUHAgEWM2h0dHA6Ly93d3cubWljcm9zb2Z0LmNv
// SIG // bS9wa2lvcHMvZG9jcy9wcmltYXJ5Y3BzLmh0bTBABggr
// SIG // BgEFBQcCAjA0HjIgHQBMAGUAZwBhAGwAXwBwAG8AbABp
// SIG // AGMAeQBfAHMAdABhAHQAZQBtAGUAbgB0AC4gHTANBgkq
// SIG // hkiG9w0BAQsFAAOCAgEAZ/KGpZjgVHkaLtPYdGcimwuW
// SIG // EeFjkplCln3SeQyQwWVfLiw++MNy0W2D/r4/6ArKO79H
// SIG // qaPzadtjvyI1pZddZYSQfYtGUFXYDJJ80hpLHPM8QotS
// SIG // 0LD9a+M+By4pm+Y9G6XUtR13lDni6WTJRD14eiPzE32m
// SIG // kHSDjfTLJgJGKsKKELukqQUMm+1o+mgulaAqPyprWElj
// SIG // HwlpblqYluSD9MCP80Yr3vw70L01724lruWvJ+3Q3fMO
// SIG // r5kol5hNDj0L8giJ1h/DMhji8MUtzluetEk5CsYKwsat
// SIG // ruWy2dsViFFFWDgycScaf7H0J/jeLDogaZiyWYlobm+n
// SIG // t3TDQAUGpgEqKD6CPxNNZgvAs0314Y9/HG8VfUWnduVA
// SIG // KmWjw11SYobDHWM2l4bf2vP48hahmifhzaWX0O5dY0Hj
// SIG // Wwechz4GdwbRBrF1HxS+YWG18NzGGwS+30HHDiju3mUv
// SIG // 7Jf2oVyW2ADWoUa9WfOXpQlLSBCZgB/QACnFsZulP0V3
// SIG // HjXG0qKin3p6IvpIlR+r+0cjgPWe+L9rt0uX4ut1eBrs
// SIG // 6jeZeRhL/9azI2h15q/6/IvrC4DqaTuv/DDtBEyO3991
// SIG // bWORPdGdVk5Pv4BXIqF4ETIheu9BCrE/+6jMpF3BoYib
// SIG // V3FWTkhFwELJm3ZbCoBIa/15n8G9bW1qyVJzEw16UM0x
// SIG // ghmIMIIZhAIBATCBlTB+MQswCQYDVQQGEwJVUzETMBEG
// SIG // A1UECBMKV2FzaGluZ3RvbjEQMA4GA1UEBxMHUmVkbW9u
// SIG // ZDEeMBwGA1UEChMVTWljcm9zb2Z0IENvcnBvcmF0aW9u
// SIG // MSgwJgYDVQQDEx9NaWNyb3NvZnQgQ29kZSBTaWduaW5n
// SIG // IFBDQSAyMDExAhMzAAACU+OD3pbexW7MAAAAAAJTMA0G
// SIG // CWCGSAFlAwQCAQUAoIHAMBkGCSqGSIb3DQEJAzEMBgor
// SIG // BgEEAYI3AgEEMBwGCisGAQQBgjcCAQsxDjAMBgorBgEE
// SIG // AYI3AgEVMC8GCSqGSIb3DQEJBDEiBCCsSFH0NqMuDlYz
// SIG // faOjPz9FOpXksW9fDz7tYvuzMwkoIDBUBgorBgEEAYI3
// SIG // AgEMMUYwRKAkgCIATQBpAG4AZQBjAHIAYQBmAHQAIABC
// SIG // AGUAZAByAG8AYwBroRyAGmh0dHBzOi8vd3d3Lm1pbmVj
// SIG // cmFmdC5uZXQvMA0GCSqGSIb3DQEBAQUABIIBAA/5Z4JS
// SIG // I25G/8t/M4XC9uQDjh++qwxXUsV0brYqj/TQ1KhTs0Pe
// SIG // hw7ZkAyV/u/6VHjbQlS00z1WVyyh/4X66TqkEzSFxD7q
// SIG // jonxYk8tVeiAan0CLvKoluEhD32Rjcy1ls6BaqsATUWl
// SIG // rehKJvFZ5kJbipfWanLOJV/rQ3cvqzJaGnQ2tqyq2r94
// SIG // KO4goaMDphvmtNyYi8FOVOfAgL3rr/jUgU9JEO8Q/Rrj
// SIG // 1mgyqhpNcOCHbPbebj/Fds5nqEuN0MO3zwZ86zyJvvq3
// SIG // IaHkmpH7ncSnBZ6YaS53mp69EmOejSJo1XeJIO5I/nfc
// SIG // Bp6TJ65aw9ZbXonhjVRgA/lizqWhghcAMIIW/AYKKwYB
// SIG // BAGCNwMDATGCFuwwghboBgkqhkiG9w0BBwKgghbZMIIW
// SIG // 1QIBAzEPMA0GCWCGSAFlAwQCAQUAMIIBUQYLKoZIhvcN
// SIG // AQkQAQSgggFABIIBPDCCATgCAQEGCisGAQQBhFkKAwEw
// SIG // MTANBglghkgBZQMEAgEFAAQg0MujvhSz2IeIRW7rNjrg
// SIG // yjwmpT+XLzVW6JnGcUH/35ICBmK0R+nuexgTMjAyMjA3
// SIG // MDIwMDI4NTAuNTg5WjAEgAIB9KCB0KSBzTCByjELMAkG
// SIG // A1UEBhMCVVMxEzARBgNVBAgTCldhc2hpbmd0b24xEDAO
// SIG // BgNVBAcTB1JlZG1vbmQxHjAcBgNVBAoTFU1pY3Jvc29m
// SIG // dCBDb3Jwb3JhdGlvbjElMCMGA1UECxMcTWljcm9zb2Z0
// SIG // IEFtZXJpY2EgT3BlcmF0aW9uczEmMCQGA1UECxMdVGhh
// SIG // bGVzIFRTUyBFU046REQ4Qy1FMzM3LTJGQUUxJTAjBgNV
// SIG // BAMTHE1pY3Jvc29mdCBUaW1lLVN0YW1wIFNlcnZpY2Wg
// SIG // ghFXMIIHDDCCBPSgAwIBAgITMwAAAZwPpk1h0p5LKAAB
// SIG // AAABnDANBgkqhkiG9w0BAQsFADB8MQswCQYDVQQGEwJV
// SIG // UzETMBEGA1UECBMKV2FzaGluZ3RvbjEQMA4GA1UEBxMH
// SIG // UmVkbW9uZDEeMBwGA1UEChMVTWljcm9zb2Z0IENvcnBv
// SIG // cmF0aW9uMSYwJAYDVQQDEx1NaWNyb3NvZnQgVGltZS1T
// SIG // dGFtcCBQQ0EgMjAxMDAeFw0yMTEyMDIxOTA1MTlaFw0y
// SIG // MzAyMjgxOTA1MTlaMIHKMQswCQYDVQQGEwJVUzETMBEG
// SIG // A1UECBMKV2FzaGluZ3RvbjEQMA4GA1UEBxMHUmVkbW9u
// SIG // ZDEeMBwGA1UEChMVTWljcm9zb2Z0IENvcnBvcmF0aW9u
// SIG // MSUwIwYDVQQLExxNaWNyb3NvZnQgQW1lcmljYSBPcGVy
// SIG // YXRpb25zMSYwJAYDVQQLEx1UaGFsZXMgVFNTIEVTTjpE
// SIG // RDhDLUUzMzctMkZBRTElMCMGA1UEAxMcTWljcm9zb2Z0
// SIG // IFRpbWUtU3RhbXAgU2VydmljZTCCAiIwDQYJKoZIhvcN
// SIG // AQEBBQADggIPADCCAgoCggIBANtSKgwZXUkWP6zrXazT
// SIG // aYq7bco9Q2zvU6MN4ka3GRMX2tJZOK4DxeBiQACL/n7Y
// SIG // V/sKTslwpD0f9cPU4rCDX9sfcTWo7XPxdHLQ+WkaGbKK
// SIG // WATsqw69bw8hkJ/bjcp2V2A6vGsvwcqJCh07BK3JPmUt
// SIG // Zikyy5PZ8fyTyiKGN7hOWlaIU9oIoucUNoAHQJzLq8h2
// SIG // 0eNgHUh7eI5k+Kyq4v6810LHuA6EHyKJOZN2xTw5JSkL
// SIG // y0FN5Mhg/OaFrFBl3iag2Tqp4InKLt+Jbh/Jd0etnei2
// SIG // aDHFrmlfPmlRSv5wSNX5zAhgEyRpjmQcz1zp0QaSAefR
// SIG // kMm923/ngU51IbrVbAeHj569SHC9doHgsIxkh0K3lpw5
// SIG // 82+0ONXcIfIU6nkBT+qADAZ+0dT1uu/gRTBy614QAofj
// SIG // o258TbSX9aOU1SHuAC+3bMoyM7jNdHEJROH+msFDBcmJ
// SIG // Rl4VKsReI5+S69KUGeLIBhhmnmQ6drF8Ip0ZiO+vhAsD
// SIG // 3e9AnqnY7Hcge850I9oKvwuwpVwWnKnwwSGElMz7UvCo
// SIG // cmoUMXk7Vn2aNti+bdH28+GQb5EMsqhOmvuZOCRpOWN3
// SIG // 3G+b3g5unwEP0eTiY+LnWa2AuK43z/pplURJVle29K42
// SIG // QPkOcglB6sjLmNpEpb9basJ72eA0Mlp1LtH3oYZGXsgg
// SIG // TfuXAgMBAAGjggE2MIIBMjAdBgNVHQ4EFgQUu2kJZ1Nd
// SIG // jl2112SynL6jGMID+rIwHwYDVR0jBBgwFoAUn6cVXQBe
// SIG // Yl2D9OXSZacbUzUZ6XIwXwYDVR0fBFgwVjBUoFKgUIZO
// SIG // aHR0cDovL3d3dy5taWNyb3NvZnQuY29tL3BraW9wcy9j
// SIG // cmwvTWljcm9zb2Z0JTIwVGltZS1TdGFtcCUyMFBDQSUy
// SIG // MDIwMTAoMSkuY3JsMGwGCCsGAQUFBwEBBGAwXjBcBggr
// SIG // BgEFBQcwAoZQaHR0cDovL3d3dy5taWNyb3NvZnQuY29t
// SIG // L3BraW9wcy9jZXJ0cy9NaWNyb3NvZnQlMjBUaW1lLVN0
// SIG // YW1wJTIwUENBJTIwMjAxMCgxKS5jcnQwDAYDVR0TAQH/
// SIG // BAIwADATBgNVHSUEDDAKBggrBgEFBQcDCDANBgkqhkiG
// SIG // 9w0BAQsFAAOCAgEApwAqpiMYRzNNYyz3PSbtijbeyCpU
// SIG // XcvIrqA4zPtMIcAk34W9u9mRDndWS+tlR3WwTpr1OgaV
// SIG // 1wmc6YFzqK6EGWm903UEsFE7xBJMPXjfdVOPhcJB3vfv
// SIG // A0PX56oobcF2OvNsOSwTB8bi/ns+Cs39Puzs+QSNQZd8
// SIG // iAVBCSvxNCL78dln2RGU1xyB4AKqV9vi4Y/Gfmx2FA+j
// SIG // F0y+YLeob0M40nlSxL0q075t7L6iFRMNr0u8ROhzhDPL
// SIG // l+4ePYfUmyYJoobvydel9anAEsHFlhKl+aXb2ic3yNwb
// SIG // soPycZJL/vo8OVvYYxCy+/5FrQmAvoW0ZEaBiYcKkzrN
// SIG // Wt/hX9r5KgdwL61x0ZiTZopTko6W/58UTefTbhX7Pni0
// SIG // MApH3Pvyt6N0IFap+/LlwFRD1zn7e6ccPTwESnuo/auC
// SIG // mgPznq80OATA7vufsRZPvqeX8jKtsraSNscvNQymEWlc
// SIG // qdXV9hYkjb4T/Qse9cUYaoXg68wFHFuslWfTdPYPLl1v
// SIG // qzlPMnNJpC8KtdioDgcq+y1BaSqSm8EdNfwzT37+/JFt
// SIG // Vc3Gs915fDqgPZDgOSzKQIV+fw3aPYt2LET3AbmKKW/r
// SIG // 13Oy8cg3+D0D362GQBAJVv0NRI5NowgaCw6oNgWOFPrN
// SIG // 72WSEcca/8QQiTGP2XpLiGpRDJZ6sWRpRYNdydkwggdx
// SIG // MIIFWaADAgECAhMzAAAAFcXna54Cm0mZAAAAAAAVMA0G
// SIG // CSqGSIb3DQEBCwUAMIGIMQswCQYDVQQGEwJVUzETMBEG
// SIG // A1UECBMKV2FzaGluZ3RvbjEQMA4GA1UEBxMHUmVkbW9u
// SIG // ZDEeMBwGA1UEChMVTWljcm9zb2Z0IENvcnBvcmF0aW9u
// SIG // MTIwMAYDVQQDEylNaWNyb3NvZnQgUm9vdCBDZXJ0aWZp
// SIG // Y2F0ZSBBdXRob3JpdHkgMjAxMDAeFw0yMTA5MzAxODIy
// SIG // MjVaFw0zMDA5MzAxODMyMjVaMHwxCzAJBgNVBAYTAlVT
// SIG // MRMwEQYDVQQIEwpXYXNoaW5ndG9uMRAwDgYDVQQHEwdS
// SIG // ZWRtb25kMR4wHAYDVQQKExVNaWNyb3NvZnQgQ29ycG9y
// SIG // YXRpb24xJjAkBgNVBAMTHU1pY3Jvc29mdCBUaW1lLVN0
// SIG // YW1wIFBDQSAyMDEwMIICIjANBgkqhkiG9w0BAQEFAAOC
// SIG // Ag8AMIICCgKCAgEA5OGmTOe0ciELeaLL1yR5vQ7VgtP9
// SIG // 7pwHB9KpbE51yMo1V/YBf2xK4OK9uT4XYDP/XE/HZveV
// SIG // U3Fa4n5KWv64NmeFRiMMtY0Tz3cywBAY6GB9alKDRLem
// SIG // jkZrBxTzxXb1hlDcwUTIcVxRMTegCjhuje3XD9gmU3w5
// SIG // YQJ6xKr9cmmvHaus9ja+NSZk2pg7uhp7M62AW36MEByd
// SIG // Uv626GIl3GoPz130/o5Tz9bshVZN7928jaTjkY+yOSxR
// SIG // nOlwaQ3KNi1wjjHINSi947SHJMPgyY9+tVSP3PoFVZht
// SIG // aDuaRr3tpK56KTesy+uDRedGbsoy1cCGMFxPLOJiss25
// SIG // 4o2I5JasAUq7vnGpF1tnYN74kpEeHT39IM9zfUGaRnXN
// SIG // xF803RKJ1v2lIH1+/NmeRd+2ci/bfV+AutuqfjbsNkz2
// SIG // K26oElHovwUDo9Fzpk03dJQcNIIP8BDyt0cY7afomXw/
// SIG // TNuvXsLz1dhzPUNOwTM5TI4CvEJoLhDqhFFG4tG9ahha
// SIG // YQFzymeiXtcodgLiMxhy16cg8ML6EgrXY28MyTZki1ug
// SIG // poMhXV8wdJGUlNi5UPkLiWHzNgY1GIRH29wb0f2y1BzF
// SIG // a/ZcUlFdEtsluq9QBXpsxREdcu+N+VLEhReTwDwV2xo3
// SIG // xwgVGD94q0W29R6HXtqPnhZyacaue7e3PmriLq0CAwEA
// SIG // AaOCAd0wggHZMBIGCSsGAQQBgjcVAQQFAgMBAAEwIwYJ
// SIG // KwYBBAGCNxUCBBYEFCqnUv5kxJq+gpE8RjUpzxD/LwTu
// SIG // MB0GA1UdDgQWBBSfpxVdAF5iXYP05dJlpxtTNRnpcjBc
// SIG // BgNVHSAEVTBTMFEGDCsGAQQBgjdMg30BATBBMD8GCCsG
// SIG // AQUFBwIBFjNodHRwOi8vd3d3Lm1pY3Jvc29mdC5jb20v
// SIG // cGtpb3BzL0RvY3MvUmVwb3NpdG9yeS5odG0wEwYDVR0l
// SIG // BAwwCgYIKwYBBQUHAwgwGQYJKwYBBAGCNxQCBAweCgBT
// SIG // AHUAYgBDAEEwCwYDVR0PBAQDAgGGMA8GA1UdEwEB/wQF
// SIG // MAMBAf8wHwYDVR0jBBgwFoAU1fZWy4/oolxiaNE9lJBb
// SIG // 186aGMQwVgYDVR0fBE8wTTBLoEmgR4ZFaHR0cDovL2Ny
// SIG // bC5taWNyb3NvZnQuY29tL3BraS9jcmwvcHJvZHVjdHMv
// SIG // TWljUm9vQ2VyQXV0XzIwMTAtMDYtMjMuY3JsMFoGCCsG
// SIG // AQUFBwEBBE4wTDBKBggrBgEFBQcwAoY+aHR0cDovL3d3
// SIG // dy5taWNyb3NvZnQuY29tL3BraS9jZXJ0cy9NaWNSb29D
// SIG // ZXJBdXRfMjAxMC0wNi0yMy5jcnQwDQYJKoZIhvcNAQEL
// SIG // BQADggIBAJ1VffwqreEsH2cBMSRb4Z5yS/ypb+pcFLY+
// SIG // TkdkeLEGk5c9MTO1OdfCcTY/2mRsfNB1OW27DzHkwo/7
// SIG // bNGhlBgi7ulmZzpTTd2YurYeeNg2LpypglYAA7AFvono
// SIG // aeC6Ce5732pvvinLbtg/SHUB2RjebYIM9W0jVOR4U3Uk
// SIG // V7ndn/OOPcbzaN9l9qRWqveVtihVJ9AkvUCgvxm2EhIR
// SIG // XT0n4ECWOKz3+SmJw7wXsFSFQrP8DJ6LGYnn8AtqgcKB
// SIG // GUIZUnWKNsIdw2FzLixre24/LAl4FOmRsqlb30mjdAy8
// SIG // 7JGA0j3mSj5mO0+7hvoyGtmW9I/2kQH2zsZ0/fZMcm8Q
// SIG // q3UwxTSwethQ/gpY3UA8x1RtnWN0SCyxTkctwRQEcb9k
// SIG // +SS+c23Kjgm9swFXSVRk2XPXfx5bRAGOWhmRaw2fpCjc
// SIG // ZxkoJLo4S5pu+yFUa2pFEUep8beuyOiJXk+d0tBMdrVX
// SIG // VAmxaQFEfnyhYWxz/gq77EFmPWn9y8FBSX5+k77L+Dvk
// SIG // txW/tM4+pTFRhLy/AsGConsXHRWJjXD+57XQKBqJC482
// SIG // 2rpM+Zv/Cuk0+CQ1ZyvgDbjmjJnW4SLq8CdCPSWU5nR0
// SIG // W2rRnj7tfqAxM328y+l7vzhwRNGQ8cirOoo6CGJ/2XBj
// SIG // U02N7oJtpQUQwXEGahC0HVUzWLOhcGbyoYICzjCCAjcC
// SIG // AQEwgfihgdCkgc0wgcoxCzAJBgNVBAYTAlVTMRMwEQYD
// SIG // VQQIEwpXYXNoaW5ndG9uMRAwDgYDVQQHEwdSZWRtb25k
// SIG // MR4wHAYDVQQKExVNaWNyb3NvZnQgQ29ycG9yYXRpb24x
// SIG // JTAjBgNVBAsTHE1pY3Jvc29mdCBBbWVyaWNhIE9wZXJh
// SIG // dGlvbnMxJjAkBgNVBAsTHVRoYWxlcyBUU1MgRVNOOkRE
// SIG // OEMtRTMzNy0yRkFFMSUwIwYDVQQDExxNaWNyb3NvZnQg
// SIG // VGltZS1TdGFtcCBTZXJ2aWNloiMKAQEwBwYFKw4DAhoD
// SIG // FQDN2Wnq3fCz9ucStub1zQz7129TQKCBgzCBgKR+MHwx
// SIG // CzAJBgNVBAYTAlVTMRMwEQYDVQQIEwpXYXNoaW5ndG9u
// SIG // MRAwDgYDVQQHEwdSZWRtb25kMR4wHAYDVQQKExVNaWNy
// SIG // b3NvZnQgQ29ycG9yYXRpb24xJjAkBgNVBAMTHU1pY3Jv
// SIG // c29mdCBUaW1lLVN0YW1wIFBDQSAyMDEwMA0GCSqGSIb3
// SIG // DQEBBQUAAgUA5mn66DAiGA8yMDIyMDcwMjA2NTk1MloY
// SIG // DzIwMjIwNzAzMDY1OTUyWjB3MD0GCisGAQQBhFkKBAEx
// SIG // LzAtMAoCBQDmafroAgEAMAoCAQACAiCRAgH/MAcCAQAC
// SIG // AhHUMAoCBQDma0xoAgEAMDYGCisGAQQBhFkKBAIxKDAm
// SIG // MAwGCisGAQQBhFkKAwKgCjAIAgEAAgMHoSChCjAIAgEA
// SIG // AgMBhqAwDQYJKoZIhvcNAQEFBQADgYEADlTAKtmADDNs
// SIG // tnH2+s9epWydKfnxjk4n0vP/gTThRpiUt5qwZ5XwPihf
// SIG // ewwaOHKIIvcQ3ONmZp4/oc9ETHVS7iJ/eofElTjtxKNX
// SIG // jDJQ42NVS7ePMgLz18FMQ2CRBOV5lju8KN/UDhxgEWfi
// SIG // Sybo2lvfizXBfEAdQAuJdmWdqjQxggQNMIIECQIBATCB
// SIG // kzB8MQswCQYDVQQGEwJVUzETMBEGA1UECBMKV2FzaGlu
// SIG // Z3RvbjEQMA4GA1UEBxMHUmVkbW9uZDEeMBwGA1UEChMV
// SIG // TWljcm9zb2Z0IENvcnBvcmF0aW9uMSYwJAYDVQQDEx1N
// SIG // aWNyb3NvZnQgVGltZS1TdGFtcCBQQ0EgMjAxMAITMwAA
// SIG // AZwPpk1h0p5LKAABAAABnDANBglghkgBZQMEAgEFAKCC
// SIG // AUowGgYJKoZIhvcNAQkDMQ0GCyqGSIb3DQEJEAEEMC8G
// SIG // CSqGSIb3DQEJBDEiBCDiXO3mF6SKh7oUSVHAcGtuWmDp
// SIG // mqi5QSZcFdVdn8xPwjCB+gYLKoZIhvcNAQkQAi8xgeow
// SIG // gecwgeQwgb0EIDcPRYUgjSzKOhF39d4QgbRZQgrPO7Lo
// SIG // /qE5GtvSeqa8MIGYMIGApH4wfDELMAkGA1UEBhMCVVMx
// SIG // EzARBgNVBAgTCldhc2hpbmd0b24xEDAOBgNVBAcTB1Jl
// SIG // ZG1vbmQxHjAcBgNVBAoTFU1pY3Jvc29mdCBDb3Jwb3Jh
// SIG // dGlvbjEmMCQGA1UEAxMdTWljcm9zb2Z0IFRpbWUtU3Rh
// SIG // bXAgUENBIDIwMTACEzMAAAGcD6ZNYdKeSygAAQAAAZww
// SIG // IgQgwRmH0vU6tKVNguq7zRHWzp8ASl1RFo1fqvgirU38
// SIG // cVYwDQYJKoZIhvcNAQELBQAEggIAIqVIb6rpCfMnDM+O
// SIG // WyecLi+ngA91jvbKrmWq2uJM4EiygusoWaombwsbtMWj
// SIG // c365AM/+65PqAMSK0bv7AbxE1WFehJymJTQGy8rDThBL
// SIG // UAs1LXO5sr6j/NuJW3gbxYR0ClbQp+NJZ+KetYVIZV/E
// SIG // 3GRTOUpWEytZ1oNUFb/jeXJ0TnNDUJEme5EaBU+I4mn7
// SIG // S/XJihAuG9P0YfOMbKYq7a+iz0LFf90i+POxke16n1N3
// SIG // CvSGt9qGgtgXoqhfC5Ukm7GjQjedCCHpQnY+DgphAdeb
// SIG // VV6PyjFt/wZCdllWliHDvC2z7F089OEk+IBANyVYkxff
// SIG // Rvhmo2MicQafc69LpXok74fN76g9bKjzQ1I3zP0R9x2x
// SIG // Z73qE3o+NUST2n2Ya2CzIh0VBpmCnq2hvG8Nj1YhrMvZ
// SIG // wh6BIP6FmrRRb48kRJsF/Stgaa3Xr+mTfZ2oKxBX1EgW
// SIG // 6R0Y1BWGf/hfVa8SsDThyI7RiKYhAPp18cbYAe9LLJQz
// SIG // CiWwQ8vhzd+ApvEb+CCd2I/HDemJu6CpvtfplbHD7kuG
// SIG // mgdcp7YdS35/op5XNGMEI6dDllWrQUvRrJrlSmhnbLUj
// SIG // 3T/0Q5/Nc1EjycFbs4zl0blpdcQDgarIep/w/j+LDH1O
// SIG // ZzCVudb4qKpiyB1GnRCPGl7RjZ7W4AAtWTwNTfSlwbKB
// SIG // CEyaJCM=
// SIG // End signature block
