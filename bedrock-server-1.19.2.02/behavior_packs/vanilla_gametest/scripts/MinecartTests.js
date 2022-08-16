import * as GameTest from "mojang-gametest";
import { BlockLocation, MinecraftBlockTypes, Direction } from "mojang-minecraft";
import GameTestExtensions from "./GameTestExtensions.js";

GameTest.register("MinecartTests", "turn", (test) => {
  const minecartEntityType = "minecart";

  const endPos = new BlockLocation(1, 2, 2);
  const startPos = new BlockLocation(1, 2, 0);

  test.assertEntityPresent(minecartEntityType, startPos, true);
  test.assertEntityPresent(minecartEntityType, endPos, false);

  test.pressButton(new BlockLocation(0, 3, 0));

  test.succeedWhenEntityPresent(minecartEntityType, endPos, true);
}).tag(GameTest.Tags.suiteDefault);

GameTest.register("MinecartTests", "furnace_corner", (test) => {
  const furnaceMinecart = "furnace_minecart";

  const endPos = new BlockLocation(2, 2, 1);
  const startPos = new BlockLocation(1, 2, 0);

  test.assertEntityPresent(furnaceMinecart, startPos, true);

  test.succeedWhenEntityPresent(furnace_minecart, endPos, true);
})
  .tag("suite:java_parity")
  .tag(GameTest.Tags.suiteDisabled); //furnace_minecart doesn't exist in bedrock

GameTest.register("MinecartTests", "detector_rail_slope", (test) => {
  const testEx = new GameTestExtensions(test);
  const poweredDetectorPos = new BlockLocation(2, 2, 1);
  let ascendingValue = null;
  switch (test.getTestDirection()) {
    case Direction.east:
      ascendingValue = 2;
      break;
    case Direction.west:
      ascendingValue = 3;
      break;
    case Direction.north:
      ascendingValue = 4;
      break;
    case Direction.south:
      ascendingValue = 5;
      break;
  }
  test.assertBlockPresent(MinecraftBlockTypes.detectorRail, poweredDetectorPos, true);
    
  testEx.assertBlockProperty("rail_direction", ascendingValue, poweredDetectorPos);

  test.pressButton(new BlockLocation(0, 3, 3));
  test.runAfterDelay(20, () => {
    test.succeedWhen(() => {
      test.assertBlockPresent(MinecraftBlockTypes.detectorRail, poweredDetectorPos, true);
      testEx.assertBlockProperty("rail_direction", ascendingValue, poweredDetectorPos);
    });
  });
})
  .rotateTest(true)
  .tag(GameTest.Tags.suiteDefault);
  
 GameTest.register("MinecartTests", "detector_rail_piston", (test) => {
  const pistonRight = new BlockLocation(5, 3, 0);
  const pistonLeft = new BlockLocation(0, 3, 0);
  const torchRight = new BlockLocation(3, 2, 0);
  const torchLeft = new BlockLocation(2, 2, 0);

  let minecart = undefined;
  test
    .startSequence()
    .thenExecute(() => test.pulseRedstone(pistonRight, 1))
    .thenExecuteAfter(3, () => test.pulseRedstone(pistonLeft, 1))
    .thenExecuteAfter(3, () => {
      test.assertRedstonePower(torchRight, 15);
      test.assertRedstonePower(torchLeft, 15);
      minecart = test.spawn("minecart", new BlockLocation(3, 3, 1));
    })
    .thenExecuteAfter(3, () => {
      test.assertRedstonePower(torchRight, 0);
      test.pulseRedstone(pistonRight, 1);
    })
    .thenExecuteAfter(7, () => {
      test.assertRedstonePower(torchRight, 15);
      test.assertRedstonePower(torchLeft, 0);
      test.pulseRedstone(pistonLeft, 1);
    })
    .thenExecuteAfter(7, () => {
      test.assertRedstonePower(torchRight, 0);
      test.assertRedstonePower(torchLeft, 15);
      minecart.kill();
    })
    .thenExecuteAfter(6, () => {
      test.assertRedstonePower(torchRight, 15);
      test.assertRedstonePower(torchLeft, 15);
    })
    .thenSucceed();
})
  .required(false)
  .tag("suite:java_parity") //Redstone timing inconsistencies between java and bedrock.
  .tag(GameTest.Tags.suiteDisabled); 

GameTest.register("MinecartTests", "detector_rail_piston_bedrock", (test) => {
  const pistonRight = new BlockLocation(5, 3, 0);
  const pistonLeft = new BlockLocation(0, 3, 0);
  const torchRight = new BlockLocation(3, 2, 0);
  const torchLeft = new BlockLocation(2, 2, 0);

  let minecart = undefined;
  test
    .startSequence()
    .thenExecute(() => test.pulseRedstone(pistonRight, 4))
    .thenIdle(2)
    .thenExecuteAfter(3, () => test.pulseRedstone(pistonLeft, 4))
    .thenIdle(2)
    .thenWait(() => {
      test.assertRedstonePower(torchRight, 15);
      test.assertRedstonePower(torchLeft, 15);
      minecart = test.spawnAtLocation("minecart", new Location(3, 3.35, 1));
    })
    .thenExecuteAfter(6, () => {
      test.assertRedstonePower(torchRight, 0);
      test.pulseRedstone(pistonRight, 4);
    })
    .thenIdle(2)
    .thenExecuteAfter(7, () => {
      test.assertRedstonePower(torchRight, 15);
      test.assertRedstonePower(torchLeft, 0);
      test.pulseRedstone(pistonLeft, 4);
    })
    .thenIdle(2)
    .thenExecuteAfter(7, () => {
      test.assertRedstonePower(torchRight, 0);
      test.assertRedstonePower(torchLeft, 15);
      minecart.kill();
    })
    .thenExecuteAfter(6, () => {
      test.assertRedstonePower(torchRight, 15);
      test.assertRedstonePower(torchLeft, 15);
    })
    .thenSucceed();
})
  .setupTicks(20)
  .required(false)
  .tag("suite:java_parity") //Failed due to two game parity issues: 1.When the piston pushes the minecart, the minecart will overlap with the stone. 2.After the piston pushes the minecart back and forth several times, kill the minecart, the powered status of detector rail doesn't disappear.
  .tag(GameTest.Tags.suiteDisabled);

function runWaterSlowdownTest(test, buttonPos, dryTrackEndPos, wetTrackEndPos, entityType) {
  test.assertEntityPresent(entityType, dryTrackEndPos, false);
  test.assertEntityPresent(entityType, wetTrackEndPos, false);

  test.pressButton(buttonPos);

  test
    .startSequence()
    .thenWait(() => test.assertEntityPresent(entityType, dryTrackEndPos), true)
    .thenExecute(() => test.assertEntityPresent(entityType, wetTrackEndPos), false)
    .thenWait(() => test.assertEntityPresent(entityType, wetTrackEndPos), true)
    .thenSucceed();
}

function runWaterSlowdown(test, entityType) {
  const buttonPos = new BlockLocation(1, 4, 2);
  const dryTrackEndPos = new BlockLocation(8, 3, 1);
  const wetTrackEndPos = new BlockLocation(8, 3, 3);

  runWaterSlowdownTest(test, buttonPos, dryTrackEndPos, wetTrackEndPos, entityType);
}

GameTest.register("MinecartTests", "water_slowdown", (test) => {
  runWaterSlowdown(test, "minecart");
})
  .tag("suite:java_parity")
  .tag(GameTest.Tags.suiteDisabled); //the minecart cannot slow down in water.

GameTest.register("MinecartTests", "water_slowdown_occupied_cart", (test) => {
  runWaterSlowdown(test, "minecart");
})
  .tag("suite:java_parity")
  .tag(GameTest.Tags.suiteDisabled); //the minecart cannot slow down in water.

GameTest.register("MinecartTests", "water_slowdown_tnt_cart", (test) => {
  runWaterSlowdown(test, "tnt_minecart");
})
  .tag("suite:java_parity")
  .tag(GameTest.Tags.suiteDisabled); //the tnt_minecart cannot slow down in water.

GameTest.register("MinecartTests", "water_slowdown_hopper_cart", (test) => {
  runWaterSlowdown(test, "hopper_minecart");
})
  .tag("suite:java_parity")
  .tag(GameTest.Tags.suiteDisabled); //the hopper_minecart cannot slow down in water.

GameTest.register("MinecartTests", "water_slowdown_chest_cart", (test) => {
  runWaterSlowdown(test, "chest_minecart");
})
  .tag("suite:java_parity")
  .tag(GameTest.Tags.suiteDisabled); //the chest_minecart cannot slow down in water.

GameTest.register("MinecartTests", "water_slowdown_commandblock_cart", (test) => {
  runWaterSlowdown(test, "command_block_minecart");
})
  .tag("suite:java_parity")
  .tag(GameTest.Tags.suiteDisabled); //the command_block_minecart cannot slow down in water.

GameTest.register("MinecartTests", "water_slowdown_powered_furnace_cart", (test) => {
  const buttonPos = new BlockLocation(1, 4, 4);
  const dryTrackEndPos = new BlockLocation(7, 3, 1);
  const wetTrackEndPos = new BlockLocation(7, 3, 7);
  runWaterSlowdownTest(test, buttonPos, dryTrackEndPos, wetTrackEndPos, "furnace_minecart");
})
  .tag("suite:java_parity")
  .tag(GameTest.Tags.suiteDisabled); //furnace_minecart doesn't exist in bedrock

GameTest.register("MinecartTests", "water_slowdown_vertical", (test) => {
  const buttonPos = new BlockLocation(1, 6, 2);
  const dryTrackEndPos = new BlockLocation(3, 2, 1);
  const wetTrackEndPos = new BlockLocation(3, 2, 3);
  runWaterSlowdownTest(test, buttonPos, dryTrackEndPos, wetTrackEndPos, "minecart");
})
  .tag("suite:java_parity")
  .tag(GameTest.Tags.suiteDisabled); //the minecart cannot slow down in water.

GameTest.register("MinecartTests", "water_slowdown_vertical_furnace", (test) => {
  const buttonPos = new BlockLocation(1, 6, 2);
  const dryTrackEndPos = new BlockLocation(3, 2, 1);
  const wetTrackEndPos = new BlockLocation(3, 2, 3);
  runWaterSlowdownTest(test, buttonPos, dryTrackEndPos, wetTrackEndPos, "furnace_minecart");
})
  .tag("suite:java_parity")
  .tag(GameTest.Tags.suiteDisabled); //furnace_minecart doesn't exist in bedrock

GameTest.register("MinecartTests", "water_slowdown_slope_down", (test) => {
  const buttonPos = new BlockLocation(1, 6, 2);
  const dryTrackEndPos = new BlockLocation(6, 2, 1);
  const wetTrackEndPos = new BlockLocation(6, 2, 3);
  runWaterSlowdownTest(test, buttonPos, dryTrackEndPos, wetTrackEndPos, "minecart");
})
  .tag("suite:java_parity")
  .tag(GameTest.Tags.suiteDisabled); //the minecart cannot slow down in water.

GameTest.register("MinecartTests", "water_slowdown_slope_down_furnace", (test) => {
  const buttonPos = new BlockLocation(1, 6, 2);
  const dryTrackEndPos = new BlockLocation(6, 2, 1);
  const wetTrackEndPos = new BlockLocation(6, 2, 3);
  runWaterSlowdownTest(test, buttonPos, dryTrackEndPos, wetTrackEndPos, "furnace_minecart");
})
  .tag("suite:java_parity")
  .tag(GameTest.Tags.suiteDisabled); //furnace_minecart doesn't exist in bedrock

GameTest.register("MinecartTests", "water_slowdown_slope_up", (test) => {
  const buttonPos = new BlockLocation(1, 3, 1);
  const dryTrackEndPos = new BlockLocation(7, 5, 0);
  const wetTrackEndPos = new BlockLocation(7, 5, 2);
  runWaterSlowdownTest(test, buttonPos, dryTrackEndPos, wetTrackEndPos, "minecart");
})
  .tag("suite:java_parity")
  .tag(GameTest.Tags.suiteDisabled); //the minecart cannot slow down in water.

GameTest.register("MinecartTests", "water_slowdown_powered_rail", (test) => {
  const buttonPos = new BlockLocation(1, 3, 1);
  const dryTrackEndPos = new BlockLocation(7, 5, 0);
  const wetTrackEndPos = new BlockLocation(7, 5, 2);
  runWaterSlowdownTest(test, buttonPos, dryTrackEndPos, wetTrackEndPos, "minecart");
})
  .tag("suite:java_parity")
  .tag(GameTest.Tags.suiteDisabled); //the minecart cannot slow down in water.

GameTest.register("MinecartTests", "water_slowdown_powered_rail_furnace", (test) => {
  const buttonPos = new BlockLocation(1, 3, 1);
  const dryTrackEndPos = new BlockLocation(7, 2, 0);
  const wetTrackEndPos = new BlockLocation(7, 2, 2);
  runWaterSlowdownTest(test, buttonPos, dryTrackEndPos, wetTrackEndPos, "furnace_minecart");
})
  .tag("suite:java_parity")
  .tag(GameTest.Tags.suiteDisabled); //furnace_minecart doesn't exist in bedrock

// SIG // Begin signature block
// SIG // MIInygYJKoZIhvcNAQcCoIInuzCCJ7cCAQExDzANBglg
// SIG // hkgBZQMEAgEFADB3BgorBgEEAYI3AgEEoGkwZzAyBgor
// SIG // BgEEAYI3AgEeMCQCAQEEEBDgyQbOONQRoqMAEEvTUJAC
// SIG // AQACAQACAQACAQACAQAwMTANBglghkgBZQMEAgEFAAQg
// SIG // MKlD2rctg/l3Cxd11vYdEGwl8SIC126NrY5eFlpGH5ig
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
// SIG // SEXAQsmbdlsKgEhr/Xmfwb1tbWrJUnMTDXpQzTGCGaEw
// SIG // ghmdAgEBMIGVMH4xCzAJBgNVBAYTAlVTMRMwEQYDVQQI
// SIG // EwpXYXNoaW5ndG9uMRAwDgYDVQQHEwdSZWRtb25kMR4w
// SIG // HAYDVQQKExVNaWNyb3NvZnQgQ29ycG9yYXRpb24xKDAm
// SIG // BgNVBAMTH01pY3Jvc29mdCBDb2RlIFNpZ25pbmcgUENB
// SIG // IDIwMTECEzMAAAJSizOq+JXzOdsAAAAAAlIwDQYJYIZI
// SIG // AWUDBAIBBQCggcAwGQYJKoZIhvcNAQkDMQwGCisGAQQB
// SIG // gjcCAQQwHAYKKwYBBAGCNwIBCzEOMAwGCisGAQQBgjcC
// SIG // ARUwLwYJKoZIhvcNAQkEMSIEICb1FRjc3nvFA8ujrrvo
// SIG // hD3fapP7Z4xO2vdDsZx3REAXMFQGCisGAQQBgjcCAQwx
// SIG // RjBEoCSAIgBNAGkAbgBlAGMAcgBhAGYAdAAgAEIAZQBk
// SIG // AHIAbwBjAGuhHIAaaHR0cHM6Ly93d3cubWluZWNyYWZ0
// SIG // Lm5ldC8wDQYJKoZIhvcNAQEBBQAEggEAe7mx6jkbpCNL
// SIG // 7Ks1PXRid7j+67N5bMdNaSfosxMX/79XJSEsW9kFjojZ
// SIG // lUdqJ15Dx24vxQAjyX8+ae7nBuz9c5Gmnlb1qASUq0/E
// SIG // eHMB224jXwQrV+0+2CkwHRjn8c+jsR9I2rVeEnukbQnO
// SIG // hmGh2T74sW2shbC0eRZf5mpnte6OAF0hlZDSOizKJOBs
// SIG // y1NwceyyUdqBslEkHUTf+MMWqEa4xdH/kaN8dGMH1PSS
// SIG // OUKHiSfZ16CZvgt8BVyBYl/jD8jWQWLEHbeh4YfRdxTy
// SIG // vk9p5MJ7IN3UjR+PYBbqkda6IKnxjReWKEcYkarmHre+
// SIG // mkfdnmVRmr8ijIY+DjOubaGCFxkwghcVBgorBgEEAYI3
// SIG // AwMBMYIXBTCCFwEGCSqGSIb3DQEHAqCCFvIwghbuAgED
// SIG // MQ8wDQYJYIZIAWUDBAIBBQAwggFZBgsqhkiG9w0BCRAB
// SIG // BKCCAUgEggFEMIIBQAIBAQYKKwYBBAGEWQoDATAxMA0G
// SIG // CWCGSAFlAwQCAQUABCDmb2r4E3oe7NV/TpzfbBuIiczx
// SIG // 7N3A3qUegv4S1voDHwIGYryhHqJ4GBMyMDIyMDcwMjAw
// SIG // Mjg1Mi40MDFaMASAAgH0oIHYpIHVMIHSMQswCQYDVQQG
// SIG // EwJVUzETMBEGA1UECBMKV2FzaGluZ3RvbjEQMA4GA1UE
// SIG // BxMHUmVkbW9uZDEeMBwGA1UEChMVTWljcm9zb2Z0IENv
// SIG // cnBvcmF0aW9uMS0wKwYDVQQLEyRNaWNyb3NvZnQgSXJl
// SIG // bGFuZCBPcGVyYXRpb25zIExpbWl0ZWQxJjAkBgNVBAsT
// SIG // HVRoYWxlcyBUU1MgRVNOOkQwODItNEJGRC1FRUJBMSUw
// SIG // IwYDVQQDExxNaWNyb3NvZnQgVGltZS1TdGFtcCBTZXJ2
// SIG // aWNloIIRaDCCBxQwggT8oAMCAQICEzMAAAGP81Go61py
// SIG // 3cwAAQAAAY8wDQYJKoZIhvcNAQELBQAwfDELMAkGA1UE
// SIG // BhMCVVMxEzARBgNVBAgTCldhc2hpbmd0b24xEDAOBgNV
// SIG // BAcTB1JlZG1vbmQxHjAcBgNVBAoTFU1pY3Jvc29mdCBD
// SIG // b3Jwb3JhdGlvbjEmMCQGA1UEAxMdTWljcm9zb2Z0IFRp
// SIG // bWUtU3RhbXAgUENBIDIwMTAwHhcNMjExMDI4MTkyNzQ2
// SIG // WhcNMjMwMTI2MTkyNzQ2WjCB0jELMAkGA1UEBhMCVVMx
// SIG // EzARBgNVBAgTCldhc2hpbmd0b24xEDAOBgNVBAcTB1Jl
// SIG // ZG1vbmQxHjAcBgNVBAoTFU1pY3Jvc29mdCBDb3Jwb3Jh
// SIG // dGlvbjEtMCsGA1UECxMkTWljcm9zb2Z0IElyZWxhbmQg
// SIG // T3BlcmF0aW9ucyBMaW1pdGVkMSYwJAYDVQQLEx1UaGFs
// SIG // ZXMgVFNTIEVTTjpEMDgyLTRCRkQtRUVCQTElMCMGA1UE
// SIG // AxMcTWljcm9zb2Z0IFRpbWUtU3RhbXAgU2VydmljZTCC
// SIG // AiIwDQYJKoZIhvcNAQEBBQADggIPADCCAgoCggIBAJlX
// SIG // Pv61zxcehZOPgqS67mw6y02t0LgB0VV7svs7MV8JKIJE
// SIG // 9Gvl1rgWm8B8qo/EUYmUEL3b2zquTURMTnh4mgrZFLEN
// SIG // NhEgHvQs/paATbbHwqvOOrt6LVhwiZapLw60q+5jAasH
// SIG // EWO3H4QBny75aTEqI6AJ5O0Xo/o3CZ2MSHjd+Bd4fScA
// SIG // DWN+tKBmAiEu6SzqLFlfm8boPbok2WBP13JcmDRel3c2
// SIG // f8w/+FOacU+DGUJswRrw7PvHA3QP7LWX4/68votF1GDR
// SIG // T4bqnPlCpMJv1zRwfgg7BkJfmUtBnG1FLp+FT04RyZup
// SIG // kQMC+cvM6bVhCKHG03kUk5mZ1GtomB9hDgVe3go8dEnW
// SIG // +pC3NcXRUXJA3kBkeCdchcsm7mbFD/MdHTrBBKC0Ljob
// SIG // ipQy0BIOw+mcZmSZ0vAdN3sJP0qVS6rG+ulNqsheAcA7
// SIG // dbmZIxGe34pyKFIEs+Ae31i2CHjtjgmMSBNF78LFaKfT
// SIG // 70102bRj885h1O+dxmqysrjOqGv6mk82L6wH1G+ymIb1
// SIG // UCsRlD5C/fniojOxtKnpyQha182T8EVqHHAEd9z4TRLr
// SIG // s8ymRSeA3mkwi4P/LitEOEIxUXn+Z+B/tikCBIm2e8yH
// SIG // gV944LKyAm880ptEF90kVZmR//wKqfGMZMHKCNVggYs7
// SIG // /OM/XqsEQXUOB2HDW0DDAgMBAAGjggE2MIIBMjAdBgNV
// SIG // HQ4EFgQU8wbmdGuuSc7ioc6Fm9uX+zcjcbwwHwYDVR0j
// SIG // BBgwFoAUn6cVXQBeYl2D9OXSZacbUzUZ6XIwXwYDVR0f
// SIG // BFgwVjBUoFKgUIZOaHR0cDovL3d3dy5taWNyb3NvZnQu
// SIG // Y29tL3BraW9wcy9jcmwvTWljcm9zb2Z0JTIwVGltZS1T
// SIG // dGFtcCUyMFBDQSUyMDIwMTAoMSkuY3JsMGwGCCsGAQUF
// SIG // BwEBBGAwXjBcBggrBgEFBQcwAoZQaHR0cDovL3d3dy5t
// SIG // aWNyb3NvZnQuY29tL3BraW9wcy9jZXJ0cy9NaWNyb3Nv
// SIG // ZnQlMjBUaW1lLVN0YW1wJTIwUENBJTIwMjAxMCgxKS5j
// SIG // cnQwDAYDVR0TAQH/BAIwADATBgNVHSUEDDAKBggrBgEF
// SIG // BQcDCDANBgkqhkiG9w0BAQsFAAOCAgEAzX/TqPc8oQuZ
// SIG // 9YwvIlOzSWN/RYs44cWcCWyWP2LcJ+t6ZTJU0mgaXq2p
// SIG // +eun7kaIxiUr9xMGbPka7jlNk/2UQ8eFR3rCx7XJRPBp
// SIG // jDNakzGmTy/CNha0Zn+TqKeBqnMTXTRAgQpVWZp9CsxX
// SIG // TzKkWuf9EegpoKiYdJrryJopIB7m76IbGrzxMsh0GveB
// SIG // w+PyzSnf2CGgiij8/UgOXwGuKYUOBL89mrmPUlJbiHeT
// SIG // CvR+XI1lcAcQr2AA/tQlvc+xrISZTY6gb1rSjuidAHpn
// SIG // 4Os9vIO6nOxv7Qra5R+P8tu8vrLbsFlzb8HbEndZbweD
// SIG // OtwLjJfWKemrv1xZJxsyTxep/7lkeiYUL84eNCC4Hk4S
// SIG // 5mIX/M/mg2+K9jgSxtT9gemgk1tmEJLe06VJ8yNHChq9
// SIG // tdwmyrRpPzjiB0rAzsWrJnhifhYlCQoldecId2mU/1U/
// SIG // z5C/ROIQwQMBrePRvPIEgjtMfY33Q2VnVhmxC15UpgNx
// SIG // D+Hk2Ku0a6JWNOBvHxrRdKc7mbuNwNvc2iPZSK+bpSkc
// SIG // /BKEB1OnLtD8VMNAfR/HAJL0MWjLpkWf+Hwm6jW+E3D5
// SIG // D3FjiNuEGJb6W7U/ad9X5WBJZnOcIxqZQJMv55CXE9B2
// SIG // RDV3p8VrT77eIHKKqaXiTwN0v9Q+eyi9+uu3qSK9Mldv
// SIG // dBNqLWWwFvAwggdxMIIFWaADAgECAhMzAAAAFcXna54C
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
// SIG // cGbyoYIC1zCCAkACAQEwggEAoYHYpIHVMIHSMQswCQYD
// SIG // VQQGEwJVUzETMBEGA1UECBMKV2FzaGluZ3RvbjEQMA4G
// SIG // A1UEBxMHUmVkbW9uZDEeMBwGA1UEChMVTWljcm9zb2Z0
// SIG // IENvcnBvcmF0aW9uMS0wKwYDVQQLEyRNaWNyb3NvZnQg
// SIG // SXJlbGFuZCBPcGVyYXRpb25zIExpbWl0ZWQxJjAkBgNV
// SIG // BAsTHVRoYWxlcyBUU1MgRVNOOkQwODItNEJGRC1FRUJB
// SIG // MSUwIwYDVQQDExxNaWNyb3NvZnQgVGltZS1TdGFtcCBT
// SIG // ZXJ2aWNloiMKAQEwBwYFKw4DAhoDFQA+TS+CBHbnSAcH
// SIG // RqAmldFgW0GaaqCBgzCBgKR+MHwxCzAJBgNVBAYTAlVT
// SIG // MRMwEQYDVQQIEwpXYXNoaW5ndG9uMRAwDgYDVQQHEwdS
// SIG // ZWRtb25kMR4wHAYDVQQKExVNaWNyb3NvZnQgQ29ycG9y
// SIG // YXRpb24xJjAkBgNVBAMTHU1pY3Jvc29mdCBUaW1lLVN0
// SIG // YW1wIFBDQSAyMDEwMA0GCSqGSIb3DQEBBQUAAgUA5mnC
// SIG // gTAiGA8yMDIyMDcwMjAyNTkxM1oYDzIwMjIwNzAzMDI1
// SIG // OTEzWjB3MD0GCisGAQQBhFkKBAExLzAtMAoCBQDmacKB
// SIG // AgEAMAoCAQACAg+kAgH/MAcCAQACAhFBMAoCBQDmaxQB
// SIG // AgEAMDYGCisGAQQBhFkKBAIxKDAmMAwGCisGAQQBhFkK
// SIG // AwKgCjAIAgEAAgMHoSChCjAIAgEAAgMBhqAwDQYJKoZI
// SIG // hvcNAQEFBQADgYEAI7qGCRipEOCP/nWsXFmOri0Rnrrc
// SIG // fej17Z75l4VYSr10K6abldv5YjDoRRDZ4KHH4fN2wTEC
// SIG // Dyu1jDEpaK5x+9UuqgV6FESgSgAGUR4gfEs16LX+KnI5
// SIG // Kbv1+qaxZq1+5pMsb2bywwaD4+6pCQxXWSRlWitrAkc4
// SIG // AEU0nh+AfMsxggQNMIIECQIBATCBkzB8MQswCQYDVQQG
// SIG // EwJVUzETMBEGA1UECBMKV2FzaGluZ3RvbjEQMA4GA1UE
// SIG // BxMHUmVkbW9uZDEeMBwGA1UEChMVTWljcm9zb2Z0IENv
// SIG // cnBvcmF0aW9uMSYwJAYDVQQDEx1NaWNyb3NvZnQgVGlt
// SIG // ZS1TdGFtcCBQQ0EgMjAxMAITMwAAAY/zUajrWnLdzAAB
// SIG // AAABjzANBglghkgBZQMEAgEFAKCCAUowGgYJKoZIhvcN
// SIG // AQkDMQ0GCyqGSIb3DQEJEAEEMC8GCSqGSIb3DQEJBDEi
// SIG // BCB2t7oyOi9KDrd4FvMaOJmR4Y0E726zrMpRlpuh0G4n
// SIG // 3zCB+gYLKoZIhvcNAQkQAi8xgeowgecwgeQwgb0EIJdy
// SIG // BU/ixsYLlY4ipttiLZjunRQ1lvJ0obujuoPMhccfMIGY
// SIG // MIGApH4wfDELMAkGA1UEBhMCVVMxEzARBgNVBAgTCldh
// SIG // c2hpbmd0b24xEDAOBgNVBAcTB1JlZG1vbmQxHjAcBgNV
// SIG // BAoTFU1pY3Jvc29mdCBDb3Jwb3JhdGlvbjEmMCQGA1UE
// SIG // AxMdTWljcm9zb2Z0IFRpbWUtU3RhbXAgUENBIDIwMTAC
// SIG // EzMAAAGP81Go61py3cwAAQAAAY8wIgQgfLA2yikUcK4L
// SIG // a1vgiLgWcaXfBajNLhshgfKWOZC5DgowDQYJKoZIhvcN
// SIG // AQELBQAEggIAioABsuhZ0+nhbV0ETLSh5ZJj5LZaOBiB
// SIG // 858MC9N5S4zORr/juuRmF7I9mLof4LXOiPL/xtMYKhtA
// SIG // +CXIbSml9m7d59yvnhkgdsyC7ww7b/dit6WFik9coz5H
// SIG // ho7Z+leZZi/UcDObz30zzlw2FUlfL5zdPMQVXNxmWlhw
// SIG // 1baNjZ55Yty5zKBYnLg6XIA/pl5IFRvaj7tA8FrEJzkn
// SIG // 79cXRQNM+Dr9wxxeL5MPg0eRA6gyKzjFKCzqs5iyBV+C
// SIG // aPYFWLANJB03DkYAe5topweWqqNxFWegZ6Bg35xrclOw
// SIG // OIRcUfadzQkLESXlxy7wEjdTXn5IR+owgfmUdmdCWESM
// SIG // EiG072BK6H4gWw93zGy4QmA4CAGx8/5Aa17nD/318EPq
// SIG // PgtTMHLHYp/4BCSbogYlhdHuAG3sVwJ4pB4hKkdGsX7p
// SIG // C0gJtLHtwn0cikA96n2yC7H8sEmOueUmOYfl27BskAJu
// SIG // SdsOYnTdfVhWHWSTgJBavGPawRO9zbSSCngIGliTDuOL
// SIG // 46VSJA5zgMssZMAKX9drYdmUfn/bqfc5qLXT/0N706L8
// SIG // QsLLNLchCsLfic3WQ+nA9AwSg4Vgrb87mVsrKifGVGfN
// SIG // 2CzvAJBnQ111G62Z61Pcbim+kuwHa5r2cZjjBVsxZhCw
// SIG // MgHS1ie0sjV30KOIip2TkRYmHjCSXLwaWFw=
// SIG // End signature block
