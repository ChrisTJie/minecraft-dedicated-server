import * as GameTest from "mojang-gametest";
import {
  BlockLocation,
  MinecraftBlockTypes,
  BlockProperties,
  MinecraftItemTypes,
  Direction,
  world,
} from "mojang-minecraft";
import GameTestExtensions from "./GameTestExtensions.js";

const DOWN = Direction.down;
const UP = Direction.up;
const NORTH = Direction.north;
const SOUTH = Direction.south;
const WEST = Direction.west;
const EAST = Direction.east;
const DIRECTIONS = [DOWN, UP, NORTH, SOUTH, WEST, EAST];

function growLichen(test, lichenPos, faceToGrow, growDirection) {
  test.assertBlockPresent(MinecraftBlockTypes.glowLichen, lichenPos, true);
  // multiface directions used in actual spreadFromFaceTowardDirection - pass in unmapped directions
  test.spreadFromFaceTowardDirection(lichenPos, faceToGrow, growDirection);
}

function assertNoLichen(test, pos) {
  test.assertBlockPresent(MinecraftBlockTypes.glowLichen, pos, false);
}

function assertLichen(test, pos, waterlogged, ...faces) {
  const testEx = new GameTestExtensions(test);

  test.assertBlockPresent(MinecraftBlockTypes.glowLichen, pos, true);
  test.assertIsWaterlogged(pos, waterlogged);

  const glowLichenWorldPos = test.worldBlockLocation(pos);
  const glowLichenBlock = test.getDimension().getBlock(glowLichenWorldPos);
  const glowLichenPermutation = glowLichenBlock.permutation;
  const glowLichenmultiFaceDirectionBits = glowLichenPermutation.getProperty(
    BlockProperties.multiFaceDirectionBits
  ).value;

  for (const face of DIRECTIONS) {
    // No need to convert face because not comparing to mapped Multiface direction
    const expectFaceBit = faces.indexOf(face) != -1 ? 1 : 0;
    const actualFaceBit = (glowLichenmultiFaceDirectionBits & (1 << testEx.getMultiFaceDirection(face))) != 0 ? 1 : 0;
    test.assert(
      actualFaceBit == expectFaceBit,
      `Unexpected face bit in the direction: ${face}. Expected: ${expectFaceBit}. Actual: ${actualFaceBit}`
    );
  }
}

///
// Concrete Tests
///
GameTest.register("MultifaceTests", "spread_sideways_within_same_corner", (test) => {
  assertLichen(test, new BlockLocation(1, 3, 0), false, SOUTH);
  growLichen(test, new BlockLocation(1, 3, 0), SOUTH, WEST);
  assertLichen(test, new BlockLocation(1, 3, 0), false, SOUTH, WEST);

  assertLichen(test, new BlockLocation(4, 3, 0), false, UP, SOUTH);
  growLichen(test, new BlockLocation(4, 3, 0), SOUTH, WEST);
  assertLichen(test, new BlockLocation(4, 3, 0), false, UP, SOUTH, WEST);

  assertLichen(test, new BlockLocation(7, 3, 0), false, UP, EAST, SOUTH);
  growLichen(test, new BlockLocation(7, 3, 0), SOUTH, WEST);
  assertLichen(test, new BlockLocation(7, 3, 0), false, UP, EAST, SOUTH, WEST);

  assertLichen(test, new BlockLocation(11, 3, 0), false, UP, EAST, DOWN, SOUTH);
  growLichen(test, new BlockLocation(11, 3, 0), SOUTH, WEST);
  assertLichen(test, new BlockLocation(11, 3, 0), false, UP, EAST, DOWN, SOUTH, WEST);

  growLichen(test, new BlockLocation(15, 3, 0), SOUTH, WEST);
  assertLichen(test, new BlockLocation(15, 3, 0), false, UP);

  test.succeed();
}).tag(GameTest.Tags.suiteDefault);

GameTest.register("MultifaceTests", "spread_up_within_same_corner", (test) => {
  assertLichen(test, new BlockLocation(1, 3, 0), false, SOUTH);
  growLichen(test, new BlockLocation(1, 3, 0), SOUTH, UP);
  assertLichen(test, new BlockLocation(1, 3, 0), false, SOUTH, UP);

  assertLichen(test, new BlockLocation(4, 3, 0), false, WEST, SOUTH);
  growLichen(test, new BlockLocation(4, 3, 0), SOUTH, UP);
  assertLichen(test, new BlockLocation(4, 3, 0), false, WEST, SOUTH, UP);

  assertLichen(test, new BlockLocation(7, 3, 0), false, EAST, DOWN, SOUTH);
  growLichen(test, new BlockLocation(7, 3, 0), SOUTH, UP);
  assertLichen(test, new BlockLocation(7, 3, 0), false, EAST, DOWN, SOUTH, UP);

  test.succeed();
}).tag(GameTest.Tags.suiteDefault);

GameTest.register("MultifaceTests", "spread_around_partly_blocked_corner", (test) => {
  assertNoLichen(test, new BlockLocation(0, 3, 1));
  growLichen(test, new BlockLocation(1, 3, 0), SOUTH, WEST);
  assertLichen(test, new BlockLocation(1, 3, 0), false, SOUTH);
  assertNoLichen(test, new BlockLocation(0, 3, 0));
  assertLichen(test, new BlockLocation(0, 3, 1), false, EAST);

  test.succeed();
}).tag(GameTest.Tags.suiteDefault);

GameTest.register("MultifaceTests", "dont_spread_toward_opposite_face", (test) => {
  growLichen(test, new BlockLocation(1, 3, 1), EAST, WEST);
  assertLichen(test, new BlockLocation(1, 3, 1), false, EAST);
  assertNoLichen(test, new BlockLocation(0, 3, 1));

  test.succeed();
}).tag(GameTest.Tags.suiteDefault);

GameTest.register("MultifaceTests", "spread_on_flat_ceiling", (test) => {
  assertNoLichen(test, new BlockLocation(0, 3, 1));
  growLichen(test, new BlockLocation(1, 3, 1), UP, WEST);
  assertLichen(test, new BlockLocation(1, 3, 1), false, UP);
  assertLichen(test, new BlockLocation(0, 3, 1), false, UP);

  test.succeed();
}).tag(GameTest.Tags.suiteDefault);

GameTest.register("MultifaceTests", "spread_from_wall_around_corner", (test) => {
  assertNoLichen(test, new BlockLocation(0, 3, 1));
  growLichen(test, new BlockLocation(1, 3, 0), SOUTH, WEST);
  assertLichen(test, new BlockLocation(0, 3, 1), false, EAST);

  test.succeed();
}).tag(GameTest.Tags.suiteDefault);

GameTest.register("MultifaceTests", "spread_from_ceiling_around_corner", (test) => {
  assertNoLichen(test, new BlockLocation(0, 4, 1));
  growLichen(test, new BlockLocation(1, 3, 1), UP, WEST);
  assertLichen(test, new BlockLocation(0, 4, 1), false, EAST);

  test.succeed();
}).tag(GameTest.Tags.suiteDefault);

GameTest.register("MultifaceTests", "spread_from_floor_around_corner", (test) => {
  assertNoLichen(test, new BlockLocation(0, 3, 1));
  growLichen(test, new BlockLocation(1, 4, 1), DOWN, WEST);
  assertLichen(test, new BlockLocation(0, 3, 1), false, EAST);

  test.succeed();
}).tag(GameTest.Tags.suiteDefault);

GameTest.register("MultifaceTests", "spread_on_flat_floor", (test) => {
  assertNoLichen(test, new BlockLocation(0, 4, 1));
  growLichen(test, new BlockLocation(1, 4, 1), DOWN, WEST);
  assertLichen(test, new BlockLocation(0, 4, 1), false, DOWN);

  test.succeed();
}).tag(GameTest.Tags.suiteDefault);

GameTest.register("MultifaceTests", "dont_spread_toward_same_face", (test) => {
  growLichen(test, new BlockLocation(1, 3, 0), SOUTH, SOUTH);
  assertLichen(test, new BlockLocation(1, 3, 0), false, SOUTH);
  assertNoLichen(test, new BlockLocation(1, 3, 1));
  assertNoLichen(test, new BlockLocation(1, 3, 2));

  test.succeed();
}).tag(GameTest.Tags.suiteDefault);

GameTest.register("MultifaceTests", "spread_on_flat_wall", (test) => {
  assertNoLichen(test, new BlockLocation(0, 3, 0));
  growLichen(test, new BlockLocation(1, 3, 0), SOUTH, WEST);
  assertLichen(test, new BlockLocation(0, 3, 0), false, SOUTH);

  test.succeed();
}).tag(GameTest.Tags.suiteDefault);

GameTest.register("MultifaceTests", "spread_from_water_to_air", (test) => {
  assertNoLichen(test, new BlockLocation(1, 3, 1));
  growLichen(test, new BlockLocation(1, 2, 1), SOUTH, UP);
  assertLichen(test, new BlockLocation(1, 2, 1), true, SOUTH);
  assertLichen(test, new BlockLocation(1, 3, 1), false, SOUTH);

  test.succeed();
}).tag(GameTest.Tags.suiteDefault);

GameTest.register("MultifaceTests", "spread_from_air_to_water", (test) => {
  assertNoLichen(test, new BlockLocation(1, 2, 1));
  growLichen(test, new BlockLocation(1, 3, 1), SOUTH, DOWN);
  assertLichen(test, new BlockLocation(1, 3, 1), false, SOUTH);
  assertLichen(test, new BlockLocation(1, 2, 1), true, SOUTH);

  test.succeed();
}).tag(GameTest.Tags.suiteDefault);

GameTest.register("MultifaceTests", "spread_within_water", (test) => {
  assertNoLichen(test, new BlockLocation(1, 2, 1));
  growLichen(test, new BlockLocation(2, 2, 1), SOUTH, WEST);
  assertLichen(test, new BlockLocation(2, 2, 1), true, SOUTH);
  assertLichen(test, new BlockLocation(1, 2, 1), true, SOUTH);

  assertLichen(test, new BlockLocation(2, 2, 1), true, SOUTH);
  growLichen(test, new BlockLocation(2, 2, 1), SOUTH, EAST);
  assertLichen(test, new BlockLocation(2, 2, 1), true, SOUTH, EAST);

  test.succeed();
}).tag(GameTest.Tags.suiteDefault);

GameTest.register("MultifaceTests", "dont_spread_into_flowing_water", (test) => {
  growLichen(test, new BlockLocation(2, 2, 1), SOUTH, WEST);
  assertLichen(test, new BlockLocation(2, 2, 1), true, SOUTH);
  assertNoLichen(test, new BlockLocation(1, 2, 1));
  test.assertBlockPresent(MinecraftBlockTypes.flowingWater, new BlockLocation(1, 2, 1), true);

  test.succeed();
}).tag(GameTest.Tags.suiteDefault);

GameTest.register("MultifaceTests", "dont_spread_into_lava", (test) => {
  growLichen(test, new BlockLocation(2, 2, 1), SOUTH, WEST);
  assertLichen(test, new BlockLocation(2, 2, 1), false, SOUTH);
  assertNoLichen(test, new BlockLocation(1, 2, 1));
  test.assertBlockPresent(MinecraftBlockTypes.flowingLava, new BlockLocation(1, 2, 1), true);

  test.succeed();
}).tag(GameTest.Tags.suiteDefault);

GameTest.register("MultifaceTests", "break_if_all_supporting_faces_destroyed", (test) => {
  const testEx = new GameTestExtensions(test);
  // break the supporting block behind the non-waterlogged lichen
  test.setBlockType(MinecraftBlockTypes.air, new BlockLocation(1, 2, 2)); //Use setBlockType(air) instead of breakBlock()

  // break the supporting block behind the waterlogged lichen
  test.setBlockType(MinecraftBlockTypes.air, new BlockLocation(4, 2, 2)); //Use setBlockType(air) instead of breakBlock()

  test.succeedWhen(() => {
    // check that the non-waterlogged lichen was replaced with air, and that no glow lichen was dropped
    test.assertBlockPresent(MinecraftBlockTypes.air, new BlockLocation(1, 2, 2), true);
    test.assertBlockPresent(MinecraftBlockTypes.air, new BlockLocation(1, 2, 1), true);
    test.assertItemEntityCountIs(MinecraftItemTypes.glowLichen, new BlockLocation(1, 2, 1), 1, 0);

    // check that the waterlogged lichen was replaced with water, and that no glow lichen was dropped
    test.assertBlockPresent(MinecraftBlockTypes.water, new BlockLocation(4, 2, 2), true);
    testEx.assertBlockProperty("liquid_depth", 1, new BlockLocation(4, 2, 2));
    test.assertBlockPresent(MinecraftBlockTypes.water, new BlockLocation(4, 2, 1), true);
    testEx.assertBlockProperty("liquid_depth", 0, new BlockLocation(4, 2, 1));
    test.assertItemEntityCountIs(MinecraftItemTypes.glowLichen, new BlockLocation(4, 2, 2), 1, 0);
  });
}).tag(GameTest.Tags.suiteDefault);

GameTest.register("MultifaceTests", "remove_face_if_support_destroyed", (test) => {
  test.setBlockType(MinecraftBlockTypes.air, new BlockLocation(1, 3, 1)); //Use setBlockType(air) instead of breakBlock()

  test
    .startSequence()
    .thenExecuteAfter(20, () => {
      test.assertBlockPresent(MinecraftBlockTypes.air, new BlockLocation(1, 3, 1), true);
      assertLichen(test, new BlockLocation(1, 3, 0), false, WEST);
      test.assertItemEntityCountIs(MinecraftItemTypes.glowLichen, new BlockLocation(1, 2, 0), 1, 0);
    })
    .thenSucceed();
}).tag(GameTest.Tags.suiteDefault);

GameTest.register("MultifaceTests", "remove_if_has_no_faces", (test) => {
  const pos = new BlockLocation(0, 2, 0);

  const glowLichenPermutation = MinecraftBlockTypes.glowLichen.createDefaultBlockPermutation();
  glowLichenPermutation.getProperty(BlockProperties.multiFaceDirectionBits).value = 0;
  test.setBlockPermutation(glowLichenPermutation, pos);

  // Make sure the glow lichen was placed
  test.assertBlockPresent(MinecraftBlockTypes.glowLichen, pos, true);

  // Update a neighbor
  test.setBlockType(MinecraftBlockTypes.blackstone, pos.offset(1, 0, 0));

  // Succeed if the glow lichen was removed
  test
    .startSequence()
    .thenExecuteAfter(2, () => {
      test.assertBlockPresent(MinecraftBlockTypes.air, pos, true);
    })
    .thenSucceed();
}).tag(GameTest.Tags.suiteDefault);

GameTest.register("MultifaceTests", "default_multiface_block_has_all_sides", (test) => {
  const pos = new BlockLocation(0, 1, 0);

  const glowLichenPermutation = MinecraftBlockTypes.glowLichen.createDefaultBlockPermutation();
  test.setBlockPermutation(glowLichenPermutation, pos);

  // Make sure the glow lichen was placed
  assertLichen(test, pos, false, DOWN, UP, NORTH, SOUTH, WEST, EAST);

  test.succeed();
}).tag(GameTest.Tags.suiteDefault);

// SIG // Begin signature block
// SIG // MIInzgYJKoZIhvcNAQcCoIInvzCCJ7sCAQExDzANBglg
// SIG // hkgBZQMEAgEFADB3BgorBgEEAYI3AgEEoGkwZzAyBgor
// SIG // BgEEAYI3AgEeMCQCAQEEEBDgyQbOONQRoqMAEEvTUJAC
// SIG // AQACAQACAQACAQACAQAwMTANBglghkgBZQMEAgEFAAQg
// SIG // rhMPGC5mypTOH4VkxHrioNwoSNnfOfC8ivcWcBlGaTug
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
// SIG // ghmhMIIZnQIBATCBlTB+MQswCQYDVQQGEwJVUzETMBEG
// SIG // A1UECBMKV2FzaGluZ3RvbjEQMA4GA1UEBxMHUmVkbW9u
// SIG // ZDEeMBwGA1UEChMVTWljcm9zb2Z0IENvcnBvcmF0aW9u
// SIG // MSgwJgYDVQQDEx9NaWNyb3NvZnQgQ29kZSBTaWduaW5n
// SIG // IFBDQSAyMDExAhMzAAACU+OD3pbexW7MAAAAAAJTMA0G
// SIG // CWCGSAFlAwQCAQUAoIHAMBkGCSqGSIb3DQEJAzEMBgor
// SIG // BgEEAYI3AgEEMBwGCisGAQQBgjcCAQsxDjAMBgorBgEE
// SIG // AYI3AgEVMC8GCSqGSIb3DQEJBDEiBCB125rFOtJ1v/q3
// SIG // e9ARQxup5qi5x0yo4zxDjHmiTiJEDTBUBgorBgEEAYI3
// SIG // AgEMMUYwRKAkgCIATQBpAG4AZQBjAHIAYQBmAHQAIABC
// SIG // AGUAZAByAG8AYwBroRyAGmh0dHBzOi8vd3d3Lm1pbmVj
// SIG // cmFmdC5uZXQvMA0GCSqGSIb3DQEBAQUABIIBAH1xqIyz
// SIG // +eRpjezZOdzUJNJtVOSjSrJcBDvEKHr1xtAsUstL0Vxn
// SIG // gS7uy8EXzR3wWyh+Wpg3yLsp+PoCCOJZg1fyGpz4EmfI
// SIG // ohHBizx0IUVAOT6cbNUhb1xiMjRG3jEO7t7jusU6mhrN
// SIG // x+OXO6ntUslqbEotLWlLPyX0UtNE3WTWgqXtHQuiH/lL
// SIG // 3SN+5F9cnh+YY8Wu9zRrqYZJv8+Vnab6c9RnPT59C91s
// SIG // MKHaSE48Ldb5vaRr2buVaMQOyNXIG2xG6C2ShYp6Xi6L
// SIG // iWlxNSRBDT+CKZJkZWteFL+LVSDyiNg6kvn2g3QLQS1X
// SIG // aIMY+L/UuoTmH+hIrIGpEJ5yiVWhghcZMIIXFQYKKwYB
// SIG // BAGCNwMDATGCFwUwghcBBgkqhkiG9w0BBwKgghbyMIIW
// SIG // 7gIBAzEPMA0GCWCGSAFlAwQCAQUAMIIBWQYLKoZIhvcN
// SIG // AQkQAQSgggFIBIIBRDCCAUACAQEGCisGAQQBhFkKAwEw
// SIG // MTANBglghkgBZQMEAgEFAAQgXEGGzzyM55l0K0WzyDv8
// SIG // xgrHIEALEtiDEc9r3iXHm8kCBmKzEhmauBgTMjAyMjA3
// SIG // MDIwMDI4NTAuNTU4WjAEgAIB9KCB2KSB1TCB0jELMAkG
// SIG // A1UEBhMCVVMxEzARBgNVBAgTCldhc2hpbmd0b24xEDAO
// SIG // BgNVBAcTB1JlZG1vbmQxHjAcBgNVBAoTFU1pY3Jvc29m
// SIG // dCBDb3Jwb3JhdGlvbjEtMCsGA1UECxMkTWljcm9zb2Z0
// SIG // IElyZWxhbmQgT3BlcmF0aW9ucyBMaW1pdGVkMSYwJAYD
// SIG // VQQLEx1UaGFsZXMgVFNTIEVTTjo4RDQxLTRCRjctQjNC
// SIG // NzElMCMGA1UEAxMcTWljcm9zb2Z0IFRpbWUtU3RhbXAg
// SIG // U2VydmljZaCCEWgwggcUMIIE/KADAgECAhMzAAABiC7N
// SIG // xoFB4bwqAAEAAAGIMA0GCSqGSIb3DQEBCwUAMHwxCzAJ
// SIG // BgNVBAYTAlVTMRMwEQYDVQQIEwpXYXNoaW5ndG9uMRAw
// SIG // DgYDVQQHEwdSZWRtb25kMR4wHAYDVQQKExVNaWNyb3Nv
// SIG // ZnQgQ29ycG9yYXRpb24xJjAkBgNVBAMTHU1pY3Jvc29m
// SIG // dCBUaW1lLVN0YW1wIFBDQSAyMDEwMB4XDTIxMTAyODE5
// SIG // Mjc0MFoXDTIzMDEyNjE5Mjc0MFowgdIxCzAJBgNVBAYT
// SIG // AlVTMRMwEQYDVQQIEwpXYXNoaW5ndG9uMRAwDgYDVQQH
// SIG // EwdSZWRtb25kMR4wHAYDVQQKExVNaWNyb3NvZnQgQ29y
// SIG // cG9yYXRpb24xLTArBgNVBAsTJE1pY3Jvc29mdCBJcmVs
// SIG // YW5kIE9wZXJhdGlvbnMgTGltaXRlZDEmMCQGA1UECxMd
// SIG // VGhhbGVzIFRTUyBFU046OEQ0MS00QkY3LUIzQjcxJTAj
// SIG // BgNVBAMTHE1pY3Jvc29mdCBUaW1lLVN0YW1wIFNlcnZp
// SIG // Y2UwggIiMA0GCSqGSIb3DQEBAQUAA4ICDwAwggIKAoIC
// SIG // AQCa5xAIBCaRxcfIOtXhLzxV4mDZcao0pxamytqlEoVZ
// SIG // yGGMux/8z1c31uDOcs3jwFc8C06XCh50HaQ3htl08/cp
// SIG // 1E1tirW00VSHxSeaMIKv4KMuWuKAdyZLRH6uw3aAExeU
// SIG // sRmHZb8I64P1U4uxvY/aMOnjfdXitQABRbzYzuuDzV3c
// SIG // 5xy077VdbWHcS1tC1LpASTDoNgi699fsDDyNcdmewy6A
// SIG // /xkDWi2mulM1SH/NFYLsInIHPKZAgNIJ1aFV8PiyHF75
// SIG // GzrVrF/bttODkf9X9KQ132HMzo2r/LY6MMqsu2432FLn
// SIG // fnr26FM1B4CEBUN94ekTOUy+1c7JfoxOZ7eOcd0c+PoY
// SIG // tP0AxEisB/3qE9g6I8QG8e2uDoymIjf6Xo2VtI6zXr8V
// SIG // N6WNPX6x2xYa0VNm95r2kCpXVoHv3loOSZnqxGbmO12d
// SIG // VrN+hasd3e8N6HflZXTy9bhOU58RxXb4ptqKs/FoWQnj
// SIG // 62Wwn4x+xU6JOv9mcOBoxoefPOiB6UjcCh8NT0hNsyRO
// SIG // 1PGss/KBNtF21um2ucvMGfaPNHhMl+RCj6HNa5oy7k60
// SIG // xmIpXYjkw7SbWYq5QCCir7jjYvDwJC6P0QLYXydNslvY
// SIG // 1xQOD7vh2AmKz8/wFr86uXFb5OuBzpM8bEI61Pvf1Sp6
// SIG // yW9YPqs1DpQQ71/u9YOSF3a+2wIDAQABo4IBNjCCATIw
// SIG // HQYDVR0OBBYEFGR5tVDEo7vOu736jbsaM+WMyUpKMB8G
// SIG // A1UdIwQYMBaAFJ+nFV0AXmJdg/Tl0mWnG1M1GelyMF8G
// SIG // A1UdHwRYMFYwVKBSoFCGTmh0dHA6Ly93d3cubWljcm9z
// SIG // b2Z0LmNvbS9wa2lvcHMvY3JsL01pY3Jvc29mdCUyMFRp
// SIG // bWUtU3RhbXAlMjBQQ0ElMjAyMDEwKDEpLmNybDBsBggr
// SIG // BgEFBQcBAQRgMF4wXAYIKwYBBQUHMAKGUGh0dHA6Ly93
// SIG // d3cubWljcm9zb2Z0LmNvbS9wa2lvcHMvY2VydHMvTWlj
// SIG // cm9zb2Z0JTIwVGltZS1TdGFtcCUyMFBDQSUyMDIwMTAo
// SIG // MSkuY3J0MAwGA1UdEwEB/wQCMAAwEwYDVR0lBAwwCgYI
// SIG // KwYBBQUHAwgwDQYJKoZIhvcNAQELBQADggIBAEAQWtv7
// SIG // WAgmy/8YotLbNq+bZ6TXvuaTjK7oG5LpWIi4vR7bRg3Z
// SIG // 11d6JSER2GTcVG2j8YP3eTlIjI0npf6ny5Aw7Ejbdg5J
// SIG // 3ITMsnCHv5+27Qh/zLfHoAnRLV3XY5nt+xiqWMdR5xyd
// SIG // 5L0NaqKkeTy4zybZlsGFGdQ3wziKqDiugkaZkpn0Vzxn
// SIG // tkcmAz3uLt8jID2EkfTXvPblasMmXFqkPl2YzI3LPN8B
// SIG // WpoHJ6YKgGfhWREIY0hLHTFGVxv3dboQ2EkXU0GMyXdw
// SIG // pUQdbh3xjQ1mGl1cO14uT0eBsnJ4IjZ830YGsJLUHVqT
// SIG // 7X3g8aJkovz6C0rs2isCgAxC8WRiCsetYJh+NXo+i4Lc
// SIG // 34DrA4GtyRU4dP09QgMrkAMIfhmtpCJ15L0sP+KYoczc
// SIG // jiJrM+ShwdwUcH3Kjl32Uwln6mcABaCVBCMxaFSqcT+W
// SIG // UD4SqNs7SUDGWZS1WKhVSzCFPekroOMVFcz8tTHBO225
// SIG // /PXMGMQuREhny4LLViQzF8EXASiz9AUiUNoVK9SfgiJZ
// SIG // kDdUt8ASPLnWInAraNIgfD7VuMIj4UEdwJNEfak/f6Hk
// SIG // OVDkBn929x82sBM/XDDPbkivwqAo5sdEIhgfhUjZWuY5
// SIG // uhIcUbv0lsd2Q9VKN8vFO5OyiHkXOhTW3m6sbSvC6Whl
// SIG // kVnFOSvF/JOSG+aMMIIHcTCCBVmgAwIBAgITMwAAABXF
// SIG // 52ueAptJmQAAAAAAFTANBgkqhkiG9w0BAQsFADCBiDEL
// SIG // MAkGA1UEBhMCVVMxEzARBgNVBAgTCldhc2hpbmd0b24x
// SIG // EDAOBgNVBAcTB1JlZG1vbmQxHjAcBgNVBAoTFU1pY3Jv
// SIG // c29mdCBDb3Jwb3JhdGlvbjEyMDAGA1UEAxMpTWljcm9z
// SIG // b2Z0IFJvb3QgQ2VydGlmaWNhdGUgQXV0aG9yaXR5IDIw
// SIG // MTAwHhcNMjEwOTMwMTgyMjI1WhcNMzAwOTMwMTgzMjI1
// SIG // WjB8MQswCQYDVQQGEwJVUzETMBEGA1UECBMKV2FzaGlu
// SIG // Z3RvbjEQMA4GA1UEBxMHUmVkbW9uZDEeMBwGA1UEChMV
// SIG // TWljcm9zb2Z0IENvcnBvcmF0aW9uMSYwJAYDVQQDEx1N
// SIG // aWNyb3NvZnQgVGltZS1TdGFtcCBQQ0EgMjAxMDCCAiIw
// SIG // DQYJKoZIhvcNAQEBBQADggIPADCCAgoCggIBAOThpkzn
// SIG // tHIhC3miy9ckeb0O1YLT/e6cBwfSqWxOdcjKNVf2AX9s
// SIG // SuDivbk+F2Az/1xPx2b3lVNxWuJ+Slr+uDZnhUYjDLWN
// SIG // E893MsAQGOhgfWpSg0S3po5GawcU88V29YZQ3MFEyHFc
// SIG // UTE3oAo4bo3t1w/YJlN8OWECesSq/XJprx2rrPY2vjUm
// SIG // ZNqYO7oaezOtgFt+jBAcnVL+tuhiJdxqD89d9P6OU8/W
// SIG // 7IVWTe/dvI2k45GPsjksUZzpcGkNyjYtcI4xyDUoveO0
// SIG // hyTD4MmPfrVUj9z6BVWYbWg7mka97aSueik3rMvrg0Xn
// SIG // Rm7KMtXAhjBcTyziYrLNueKNiOSWrAFKu75xqRdbZ2De
// SIG // +JKRHh09/SDPc31BmkZ1zcRfNN0Sidb9pSB9fvzZnkXf
// SIG // tnIv231fgLrbqn427DZM9ituqBJR6L8FA6PRc6ZNN3SU
// SIG // HDSCD/AQ8rdHGO2n6Jl8P0zbr17C89XYcz1DTsEzOUyO
// SIG // ArxCaC4Q6oRRRuLRvWoYWmEBc8pnol7XKHYC4jMYcten
// SIG // IPDC+hIK12NvDMk2ZItboKaDIV1fMHSRlJTYuVD5C4lh
// SIG // 8zYGNRiER9vcG9H9stQcxWv2XFJRXRLbJbqvUAV6bMUR
// SIG // HXLvjflSxIUXk8A8FdsaN8cIFRg/eKtFtvUeh17aj54W
// SIG // cmnGrnu3tz5q4i6tAgMBAAGjggHdMIIB2TASBgkrBgEE
// SIG // AYI3FQEEBQIDAQABMCMGCSsGAQQBgjcVAgQWBBQqp1L+
// SIG // ZMSavoKRPEY1Kc8Q/y8E7jAdBgNVHQ4EFgQUn6cVXQBe
// SIG // Yl2D9OXSZacbUzUZ6XIwXAYDVR0gBFUwUzBRBgwrBgEE
// SIG // AYI3TIN9AQEwQTA/BggrBgEFBQcCARYzaHR0cDovL3d3
// SIG // dy5taWNyb3NvZnQuY29tL3BraW9wcy9Eb2NzL1JlcG9z
// SIG // aXRvcnkuaHRtMBMGA1UdJQQMMAoGCCsGAQUFBwMIMBkG
// SIG // CSsGAQQBgjcUAgQMHgoAUwB1AGIAQwBBMAsGA1UdDwQE
// SIG // AwIBhjAPBgNVHRMBAf8EBTADAQH/MB8GA1UdIwQYMBaA
// SIG // FNX2VsuP6KJcYmjRPZSQW9fOmhjEMFYGA1UdHwRPME0w
// SIG // S6BJoEeGRWh0dHA6Ly9jcmwubWljcm9zb2Z0LmNvbS9w
// SIG // a2kvY3JsL3Byb2R1Y3RzL01pY1Jvb0NlckF1dF8yMDEw
// SIG // LTA2LTIzLmNybDBaBggrBgEFBQcBAQROMEwwSgYIKwYB
// SIG // BQUHMAKGPmh0dHA6Ly93d3cubWljcm9zb2Z0LmNvbS9w
// SIG // a2kvY2VydHMvTWljUm9vQ2VyQXV0XzIwMTAtMDYtMjMu
// SIG // Y3J0MA0GCSqGSIb3DQEBCwUAA4ICAQCdVX38Kq3hLB9n
// SIG // ATEkW+Geckv8qW/qXBS2Pk5HZHixBpOXPTEztTnXwnE2
// SIG // P9pkbHzQdTltuw8x5MKP+2zRoZQYIu7pZmc6U03dmLq2
// SIG // HnjYNi6cqYJWAAOwBb6J6Gngugnue99qb74py27YP0h1
// SIG // AdkY3m2CDPVtI1TkeFN1JFe53Z/zjj3G82jfZfakVqr3
// SIG // lbYoVSfQJL1AoL8ZthISEV09J+BAljis9/kpicO8F7BU
// SIG // hUKz/AyeixmJ5/ALaoHCgRlCGVJ1ijbCHcNhcy4sa3tu
// SIG // PywJeBTpkbKpW99Jo3QMvOyRgNI95ko+ZjtPu4b6MhrZ
// SIG // lvSP9pEB9s7GdP32THJvEKt1MMU0sHrYUP4KWN1APMdU
// SIG // bZ1jdEgssU5HLcEUBHG/ZPkkvnNtyo4JvbMBV0lUZNlz
// SIG // 138eW0QBjloZkWsNn6Qo3GcZKCS6OEuabvshVGtqRRFH
// SIG // qfG3rsjoiV5PndLQTHa1V1QJsWkBRH58oWFsc/4Ku+xB
// SIG // Zj1p/cvBQUl+fpO+y/g75LcVv7TOPqUxUYS8vwLBgqJ7
// SIG // Fx0ViY1w/ue10CgaiQuPNtq6TPmb/wrpNPgkNWcr4A24
// SIG // 5oyZ1uEi6vAnQj0llOZ0dFtq0Z4+7X6gMTN9vMvpe784
// SIG // cETRkPHIqzqKOghif9lwY1NNje6CbaUFEMFxBmoQtB1V
// SIG // M1izoXBm8qGCAtcwggJAAgEBMIIBAKGB2KSB1TCB0jEL
// SIG // MAkGA1UEBhMCVVMxEzARBgNVBAgTCldhc2hpbmd0b24x
// SIG // EDAOBgNVBAcTB1JlZG1vbmQxHjAcBgNVBAoTFU1pY3Jv
// SIG // c29mdCBDb3Jwb3JhdGlvbjEtMCsGA1UECxMkTWljcm9z
// SIG // b2Z0IElyZWxhbmQgT3BlcmF0aW9ucyBMaW1pdGVkMSYw
// SIG // JAYDVQQLEx1UaGFsZXMgVFNTIEVTTjo4RDQxLTRCRjct
// SIG // QjNCNzElMCMGA1UEAxMcTWljcm9zb2Z0IFRpbWUtU3Rh
// SIG // bXAgU2VydmljZaIjCgEBMAcGBSsOAwIaAxUA4TyKzHwg
// SIG // F5U9LB4PzTmXlB16DkKggYMwgYCkfjB8MQswCQYDVQQG
// SIG // EwJVUzETMBEGA1UECBMKV2FzaGluZ3RvbjEQMA4GA1UE
// SIG // BxMHUmVkbW9uZDEeMBwGA1UEChMVTWljcm9zb2Z0IENv
// SIG // cnBvcmF0aW9uMSYwJAYDVQQDEx1NaWNyb3NvZnQgVGlt
// SIG // ZS1TdGFtcCBQQ0EgMjAxMDANBgkqhkiG9w0BAQUFAAIF
// SIG // AOZpbbAwIhgPMjAyMjA3MDEyMDU3MjBaGA8yMDIyMDcw
// SIG // MjIwNTcyMFowdzA9BgorBgEEAYRZCgQBMS8wLTAKAgUA
// SIG // 5mltsAIBADAKAgEAAgIUegIB/zAHAgEAAgIR6zAKAgUA
// SIG // 5mq/MAIBADA2BgorBgEEAYRZCgQCMSgwJjAMBgorBgEE
// SIG // AYRZCgMCoAowCAIBAAIDB6EgoQowCAIBAAIDAYagMA0G
// SIG // CSqGSIb3DQEBBQUAA4GBADqI8wWtcnqmCCVDPC5sjKRk
// SIG // nINOtzaNzcSoj4DuOhMdMh3k+9+t31u3Eoq6TOasOebe
// SIG // nE2cZH4Q5JUnDWixUtl7VJTduMpI7rCU89WFSxiO1yRG
// SIG // GylQIPLmj2rOt5C4Mo4R0rcLaVwgj144HwMtcMYp1juv
// SIG // wWO/vFvaxAsp0VbkMYIEDTCCBAkCAQEwgZMwfDELMAkG
// SIG // A1UEBhMCVVMxEzARBgNVBAgTCldhc2hpbmd0b24xEDAO
// SIG // BgNVBAcTB1JlZG1vbmQxHjAcBgNVBAoTFU1pY3Jvc29m
// SIG // dCBDb3Jwb3JhdGlvbjEmMCQGA1UEAxMdTWljcm9zb2Z0
// SIG // IFRpbWUtU3RhbXAgUENBIDIwMTACEzMAAAGILs3GgUHh
// SIG // vCoAAQAAAYgwDQYJYIZIAWUDBAIBBQCgggFKMBoGCSqG
// SIG // SIb3DQEJAzENBgsqhkiG9w0BCRABBDAvBgkqhkiG9w0B
// SIG // CQQxIgQgZx4+jb7URF/SyqahwiRHCXF5ZNaKjvomZ3o5
// SIG // SjEMJLIwgfoGCyqGSIb3DQEJEAIvMYHqMIHnMIHkMIG9
// SIG // BCBm6d7trAY3RoSC+M/snI7c0qXuGy1fwKGGsqZe0klA
// SIG // pTCBmDCBgKR+MHwxCzAJBgNVBAYTAlVTMRMwEQYDVQQI
// SIG // EwpXYXNoaW5ndG9uMRAwDgYDVQQHEwdSZWRtb25kMR4w
// SIG // HAYDVQQKExVNaWNyb3NvZnQgQ29ycG9yYXRpb24xJjAk
// SIG // BgNVBAMTHU1pY3Jvc29mdCBUaW1lLVN0YW1wIFBDQSAy
// SIG // MDEwAhMzAAABiC7NxoFB4bwqAAEAAAGIMCIEIMh2TTwV
// SIG // SWQDjvNx8K7LQWZbZisvE5Mk7c1Z7KjSf+UZMA0GCSqG
// SIG // SIb3DQEBCwUABIICAFOwYeWpupi0o1Mc8l9fCW2tGxOY
// SIG // dR187GCGgUHARdWLG5RxYYSS9Na7E/u7VoFa8vbFkCGJ
// SIG // IaXvFq88M9k0Z+pgJ/nnZuDIduFNVNRa3Hv62xE+Wp6z
// SIG // oGIpgVwpfe8pWYE7GtVntpdouOC/Ee4avy0upfUe2aHy
// SIG // aL3ZHZyH5gwceeZBBqkFxwUf98rLsdxAoST9rw9ff8ND
// SIG // DANuvfvfzSgHYw9ymORzapsJGNkY/beaTkJEN0bNvEN4
// SIG // Q7HEQx9zHDpL60MzYWmZpbpzQ9ey3MRxyFhunP1AymD4
// SIG // pQVL36jSYZZWb9F8vMlp29Iy4q+abu0ebDqTjqy5OkC+
// SIG // CGkqu2aEDeD+p5i4RIZc0gQai1fXgKMSTEie3LADEl57
// SIG // GYB3Hv2uPn/UMAYZgdQig/KfsfCHEuClUvbua2fhEgGh
// SIG // Gktd5Qf43Vnl+UsJGJI9T3AGa+yAHVDieLDAZSFxFDCH
// SIG // Ef+5Ljd/M9dfrBbaV3sgXP1siXabhLZ3mbkdN4J8mlmX
// SIG // q/7ZsSspf0BfqxFsTjSt+przAHTgWDw4Gs58XonBul5Z
// SIG // RPN9mKuhXHVrrqSr6wjmcm2Z9yY4/YkYkglh7mjznHSD
// SIG // rOLZMKsNYurUt5zVgvxHgbVuRT/0RFqPvCoCUslVFL67
// SIG // +WH8HOQGDjJ2rYULXYPAaT3LWrwhblOl5KkMuimJ
// SIG // End signature block
