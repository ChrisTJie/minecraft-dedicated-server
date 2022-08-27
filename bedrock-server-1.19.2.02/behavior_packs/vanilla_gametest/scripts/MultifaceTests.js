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
// SIG // MIInxwYJKoZIhvcNAQcCoIInuDCCJ7QCAQExDzANBglg
// SIG // hkgBZQMEAgEFADB3BgorBgEEAYI3AgEEoGkwZzAyBgor
// SIG // BgEEAYI3AgEeMCQCAQEEEBDgyQbOONQRoqMAEEvTUJAC
// SIG // AQACAQACAQACAQACAQAwMTANBglghkgBZQMEAgEFAAQg
// SIG // rhMPGC5mypTOH4VkxHrioNwoSNnfOfC8ivcWcBlGaTug
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
// SIG // SEXAQsmbdlsKgEhr/Xmfwb1tbWrJUnMTDXpQzTGCGZ4w
// SIG // ghmaAgEBMIGVMH4xCzAJBgNVBAYTAlVTMRMwEQYDVQQI
// SIG // EwpXYXNoaW5ndG9uMRAwDgYDVQQHEwdSZWRtb25kMR4w
// SIG // HAYDVQQKExVNaWNyb3NvZnQgQ29ycG9yYXRpb24xKDAm
// SIG // BgNVBAMTH01pY3Jvc29mdCBDb2RlIFNpZ25pbmcgUENB
// SIG // IDIwMTECEzMAAALMjrWWpr3RyU4AAAAAAswwDQYJYIZI
// SIG // AWUDBAIBBQCggcAwGQYJKoZIhvcNAQkDMQwGCisGAQQB
// SIG // gjcCAQQwHAYKKwYBBAGCNwIBCzEOMAwGCisGAQQBgjcC
// SIG // ARUwLwYJKoZIhvcNAQkEMSIEIHXbmsU60nW/+rd70BFD
// SIG // G6nmqLnHTKjjPEOMeaJOIkQNMFQGCisGAQQBgjcCAQwx
// SIG // RjBEoCSAIgBNAGkAbgBlAGMAcgBhAGYAdAAgAEIAZQBk
// SIG // AHIAbwBjAGuhHIAaaHR0cHM6Ly93d3cubWluZWNyYWZ0
// SIG // Lm5ldC8wDQYJKoZIhvcNAQEBBQAEggEAm85U8FkGpIDW
// SIG // tYxDXP4UoyheJe8+hgLbtRhKhXD693HFjC3eJ93MLkV7
// SIG // NvASfyxMrDib/+ToEt8VRGyxk/PJ3TXmPbWPU2QTCZ2N
// SIG // vU5B7mmUpASmoXLP1b0J33L+fdmF+Ucp++mKQQBYi1np
// SIG // 40LiVdbJWPapUfI4K4hCSKg+0npuN3QNnvgRLtx05Z89
// SIG // vGym/7rmjpM1Lr3UuQwITs4bGsEup/4Z+9l6Hy2eeunC
// SIG // EIg1lXOMMfwrPucBO6vC+LoL8ouJNeval6mk5cun58aA
// SIG // SC8QbKmgZ4k/MsWR6fkgjgZrOvg4YQRajogb9JzOpWT+
// SIG // Jiv/oyN1OG8CC0aB5IrDkaGCFxYwghcSBgorBgEEAYI3
// SIG // AwMBMYIXAjCCFv4GCSqGSIb3DQEHAqCCFu8wghbrAgED
// SIG // MQ8wDQYJYIZIAWUDBAIBBQAwggFZBgsqhkiG9w0BCRAB
// SIG // BKCCAUgEggFEMIIBQAIBAQYKKwYBBAGEWQoDATAxMA0G
// SIG // CWCGSAFlAwQCAQUABCCyO4Yoh3pByVGi2bVfH35hT/q1
// SIG // E4waP188zsGKqZBmZwIGYt52ZF6pGBMyMDIyMDgxODAw
// SIG // MTkzNi41MjFaMASAAgH0oIHYpIHVMIHSMQswCQYDVQQG
// SIG // EwJVUzETMBEGA1UECBMKV2FzaGluZ3RvbjEQMA4GA1UE
// SIG // BxMHUmVkbW9uZDEeMBwGA1UEChMVTWljcm9zb2Z0IENv
// SIG // cnBvcmF0aW9uMS0wKwYDVQQLEyRNaWNyb3NvZnQgSXJl
// SIG // bGFuZCBPcGVyYXRpb25zIExpbWl0ZWQxJjAkBgNVBAsT
// SIG // HVRoYWxlcyBUU1MgRVNOOkEyNDAtNEI4Mi0xMzBFMSUw
// SIG // IwYDVQQDExxNaWNyb3NvZnQgVGltZS1TdGFtcCBTZXJ2
// SIG // aWNloIIRZTCCBxQwggT8oAMCAQICEzMAAAGNelUueHSZ
// SIG // KrcAAQAAAY0wDQYJKoZIhvcNAQELBQAwfDELMAkGA1UE
// SIG // BhMCVVMxEzARBgNVBAgTCldhc2hpbmd0b24xEDAOBgNV
// SIG // BAcTB1JlZG1vbmQxHjAcBgNVBAoTFU1pY3Jvc29mdCBD
// SIG // b3Jwb3JhdGlvbjEmMCQGA1UEAxMdTWljcm9zb2Z0IFRp
// SIG // bWUtU3RhbXAgUENBIDIwMTAwHhcNMjExMDI4MTkyNzQ1
// SIG // WhcNMjMwMTI2MTkyNzQ1WjCB0jELMAkGA1UEBhMCVVMx
// SIG // EzARBgNVBAgTCldhc2hpbmd0b24xEDAOBgNVBAcTB1Jl
// SIG // ZG1vbmQxHjAcBgNVBAoTFU1pY3Jvc29mdCBDb3Jwb3Jh
// SIG // dGlvbjEtMCsGA1UECxMkTWljcm9zb2Z0IElyZWxhbmQg
// SIG // T3BlcmF0aW9ucyBMaW1pdGVkMSYwJAYDVQQLEx1UaGFs
// SIG // ZXMgVFNTIEVTTjpBMjQwLTRCODItMTMwRTElMCMGA1UE
// SIG // AxMcTWljcm9zb2Z0IFRpbWUtU3RhbXAgU2VydmljZTCC
// SIG // AiIwDQYJKoZIhvcNAQEBBQADggIPADCCAgoCggIBANo0
// SIG // SC2YPjulO3S3LsATzAftLSVM9MBy6ieX+yiV0LE81k6A
// SIG // A1DGFeMVWZ6fZj01qI1Cf5dzuF6noCwzXbhQDm3Iray8
// SIG // mORw7MQH1Btf9mIpXEpEj+gnDKln7EsFCxl+c5bFShye
// SIG // 7b8INusuni5JVHRTKYqtveE+LiUHV3eTu5hctL1ZGhjx
// SIG // sTVi22cSjc6irRZ1kO4zLWdOV72n5CFmazUxb/BhqQJR
// SIG // 7UbGdQPCg6OiA0hlTWWV20LPnzsDDhqfwc6HfH9WCPBm
// SIG // 9qDf5sdnHL3Rq/ZWueUGXlbDOy302hD0MW4AHC4Fg5SD
// SIG // 3Jk83AZLBMyzkLEqQc7Kj2liPcpFcOaH5q5BSjG6UE+R
// SIG // DJItrLiaFTOcRoHWVp7f7c9NMbmz0ihYuAeCDBVAfZnA
// SIG // DVKvXB2i7B2wyfgFLFTtKp1Y8M1z2CXkewvwfF9FJelJ
// SIG // CHaZWZp3EGUgSt8mUMvqBrLiSlxQKtwZcU+pA7oWGLzu
// SIG // 4rS6z3mNJJ7rdaypMaJvrourwnbYQn5wIspJ8kQtpZJ6
// SIG // s8/MdZg5EOUOjsfaev5XbhbqUiTLYLAjzfXyL636aTAx
// SIG // SL0aFC7BznSyY60ZYvHKOTPr2Zn9tKE8WLl8zNLW0bqx
// SIG // CcnAeWTG8M57BR8pjpIMsfDnhZ11d3Gq+ObnoyNQdYql
// SIG // A23kjcZ73M7joXKc8GnJAgMBAAGjggE2MIIBMjAdBgNV
// SIG // HQ4EFgQUeMyRboefRsKU7ko7uEk3H5YoZpMwHwYDVR0j
// SIG // BBgwFoAUn6cVXQBeYl2D9OXSZacbUzUZ6XIwXwYDVR0f
// SIG // BFgwVjBUoFKgUIZOaHR0cDovL3d3dy5taWNyb3NvZnQu
// SIG // Y29tL3BraW9wcy9jcmwvTWljcm9zb2Z0JTIwVGltZS1T
// SIG // dGFtcCUyMFBDQSUyMDIwMTAoMSkuY3JsMGwGCCsGAQUF
// SIG // BwEBBGAwXjBcBggrBgEFBQcwAoZQaHR0cDovL3d3dy5t
// SIG // aWNyb3NvZnQuY29tL3BraW9wcy9jZXJ0cy9NaWNyb3Nv
// SIG // ZnQlMjBUaW1lLVN0YW1wJTIwUENBJTIwMjAxMCgxKS5j
// SIG // cnQwDAYDVR0TAQH/BAIwADATBgNVHSUEDDAKBggrBgEF
// SIG // BQcDCDANBgkqhkiG9w0BAQsFAAOCAgEANa9zs9JRKt1b
// SIG // 6XRZYd2AcXOIZ2JAC8mDw2vRTuF4KsJAZvC7G/pSt7Wx
// SIG // hoKYukCWyt4jNwStDmwXMEWiVQsRixra+ic/YUbpkchf
// SIG // KOJ9st2Iir+KJQcTYxUoUhnPRNvSZlYwZi4Jn40aj3P9
// SIG // qw9uauKMOLgN63PXpImrn4BoXEgHXpP5fpAEm86ITrf+
// SIG // c9viJYE+Ht2rklM7dhgCnymQdNmQxliingmN6RC49bbo
// SIG // esn6ziTzyJzuGWS1t74Cmr7S/HuhSWciaAxTHsCefaBC
// SIG // /gCt3tjNiOCBRPZ+i1UvG0vVGzFDL6wJVzeWTNiPBnRw
// SIG // fU23yNe1pv/VH+KrufPDyTe7wiY/bPisWal3ObBknC4K
// SIG // oj6iG2zUxPvwBGf3k4sXPWC4E8jKmpGSOfcBqo6zjUEm
// SIG // O7tFRA5BBOopM/hUhUSis6ckm9Fk4DL1sbC725zfAApi
// SIG // Ej5wR2GaBrLDwC+36BhihS3QAU0Atj19fVo638q7IR3Y
// SIG // qkpQrKaiBgU8UWh7cjzK6Nwf9uoD3wpdzAt6wtzRquMR
// SIG // pyBw2Rkos1JhoPE5EAJaFXVOXSdb/ddII8WsWlK2hoT/
// SIG // CLbRNEVp1OV0af7BmjZg3DMG8h7kqWhbJ90NtTs4rT+A
// SIG // Zzebaax2p4AAu46HuM5i55kZwIlHPbEakNm5rDAL1KbD
// SIG // vJ5ThZojNS8wggdxMIIFWaADAgECAhMzAAAAFcXna54C
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
// SIG // BAsTHVRoYWxlcyBUU1MgRVNOOkEyNDAtNEI4Mi0xMzBF
// SIG // MSUwIwYDVQQDExxNaWNyb3NvZnQgVGltZS1TdGFtcCBT
// SIG // ZXJ2aWNloiMKAQEwBwYFKw4DAhoDFQCAc5WTPU0TQ+D4
// SIG // LaS1kGZEj2FXCaCBgzCBgKR+MHwxCzAJBgNVBAYTAlVT
// SIG // MRMwEQYDVQQIEwpXYXNoaW5ndG9uMRAwDgYDVQQHEwdS
// SIG // ZWRtb25kMR4wHAYDVQQKExVNaWNyb3NvZnQgQ29ycG9y
// SIG // YXRpb24xJjAkBgNVBAMTHU1pY3Jvc29mdCBUaW1lLVN0
// SIG // YW1wIFBDQSAyMDEwMA0GCSqGSIb3DQEBBQUAAgUA5qfu
// SIG // 6TAiGA8yMDIyMDgxODA2NDkxM1oYDzIwMjIwODE5MDY0
// SIG // OTEzWjB0MDoGCisGAQQBhFkKBAExLDAqMAoCBQDmp+7p
// SIG // AgEAMAcCAQACAiJXMAcCAQACAhFWMAoCBQDmqUBpAgEA
// SIG // MDYGCisGAQQBhFkKBAIxKDAmMAwGCisGAQQBhFkKAwKg
// SIG // CjAIAgEAAgMHoSChCjAIAgEAAgMBhqAwDQYJKoZIhvcN
// SIG // AQEFBQADgYEAHIvFdvGwFb9dwX+hPYOWMSRUT6vkLg5Q
// SIG // QINihEo7rEXQsh2s8LZxheDiNFrhY87MFaLep3vB4MqL
// SIG // k0pvneEivKyh89gmx3s7oMvUJd6vDelZWCcol1JNPg85
// SIG // ON4A2Nk4xdvVhIbSCu6eMg72cx7eiVejVb83FsAJlR/j
// SIG // Kt+BYBwxggQNMIIECQIBATCBkzB8MQswCQYDVQQGEwJV
// SIG // UzETMBEGA1UECBMKV2FzaGluZ3RvbjEQMA4GA1UEBxMH
// SIG // UmVkbW9uZDEeMBwGA1UEChMVTWljcm9zb2Z0IENvcnBv
// SIG // cmF0aW9uMSYwJAYDVQQDEx1NaWNyb3NvZnQgVGltZS1T
// SIG // dGFtcCBQQ0EgMjAxMAITMwAAAY16VS54dJkqtwABAAAB
// SIG // jTANBglghkgBZQMEAgEFAKCCAUowGgYJKoZIhvcNAQkD
// SIG // MQ0GCyqGSIb3DQEJEAEEMC8GCSqGSIb3DQEJBDEiBCB0
// SIG // A2BhrEeJL8S2VZLkcGAbcxAPQRa2RSWg+W7UI6hdFjCB
// SIG // +gYLKoZIhvcNAQkQAi8xgeowgecwgeQwgb0EIJ6WETP6
// SIG // HV5AwJ839rnS+evVvHHxk4MFbnp0PLbSGM1/MIGYMIGA
// SIG // pH4wfDELMAkGA1UEBhMCVVMxEzARBgNVBAgTCldhc2hp
// SIG // bmd0b24xEDAOBgNVBAcTB1JlZG1vbmQxHjAcBgNVBAoT
// SIG // FU1pY3Jvc29mdCBDb3Jwb3JhdGlvbjEmMCQGA1UEAxMd
// SIG // TWljcm9zb2Z0IFRpbWUtU3RhbXAgUENBIDIwMTACEzMA
// SIG // AAGNelUueHSZKrcAAQAAAY0wIgQg9V2NJ7CV5H5sbQh7
// SIG // P6NaS/6EiDHcGbcCD2SiLEwDZeAwDQYJKoZIhvcNAQEL
// SIG // BQAEggIAkbgnpLm91czj1GkQLhdYwTyLH/blREiz4Xqe
// SIG // 8yK2qcwQNGeQ6hCxinb8nWSMR049pO6C7AtRHBi8pgJx
// SIG // /CpLkftdMSbIAzdN47eqohG3tntkwVw8FI06EwmzwxFY
// SIG // 3i8iN2TuZz2IRc1Kn91VppEIcIhgZV76h2vDIdO6GNRU
// SIG // nUBkmaG61rgdsWrLSfzKlFww1NYMYNbh0Y515aYc2XjN
// SIG // sxrUOqUl683+oNinbvu3wT17IrfiDw+GRkM0OSvEeBPx
// SIG // 4AsoNXpIK85w2hwyb9DTEf4y5MbesCow6xef/78Hkfr3
// SIG // LyWKsyKUNg0XsDzYiccGZHJAUdoLYQF9oPKentfsGde/
// SIG // r7XAIrA07wMv9w9IBWh8mxrYkwDkBifuiXn9s5vzr6jQ
// SIG // mHiDTDz3u5uhhcWOq7b5Rx43bidLgpAaw/sAkJGfT4fR
// SIG // EZm0oWTXFT98cI/hR+SF9uQhGZGZ+N9mKfY1j2vj63yO
// SIG // 5az3hsyZvA0EsUrvz/+sQRPrfiVSdlut5JJPi4RXAC3w
// SIG // A0CcsJLoiVZUvfrApl5WGZ2JrHOwWnEGKfbXRnvyXF7k
// SIG // wnLS/3wz+HVpnrwtc4M9FDzyeqM2ZMjWdWwkuABshggM
// SIG // NXlBA9KALweAVVJyH2C8IuYufm3Zk9hChsjelJIki5Pg
// SIG // 17kH+pnBmTpvqz5GFoVHZtooOO6ZgcU=
// SIG // End signature block
