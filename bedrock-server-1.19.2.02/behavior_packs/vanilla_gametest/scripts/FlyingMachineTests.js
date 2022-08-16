import * as GameTest from "mojang-gametest";
import { BlockLocation, MinecraftBlockTypes } from "mojang-minecraft";

GameTest.register("FlyingMachineTests", "machine_a", (test) => {
  const triggerPos = new BlockLocation(1, 5, 1);
  const farPos = new BlockLocation(2, 3, 5);
  const nearPos = new BlockLocation(2, 3, 1);

  test
    .startSequence()
    .thenExecute(() => {
      test.setBlockType(MinecraftBlockTypes.fire, triggerPos);
    })
    .thenExecuteAfter(20, () => {
      test.assertBlockPresent(MinecraftBlockTypes.slime, farPos, true);
    })
    .thenExecuteAfter(20, () => {
      test.assertBlockPresent(MinecraftBlockTypes.slime, nearPos, true);
    })
    .thenSucceed();
})
  .tag("suite:java_parity") // The behavior is different between Java and Bedrock.In Java the flying machine move forward to the end and then returns to its original position, but in Bedrock it returns before it reaches the end.That cause the far point or near point been judged fail.
  .tag(GameTest.Tags.suiteDisabled); // Unstable, about 50% pass rate.

GameTest.register("FlyingMachineTests", "machine_b", (test) => {
  const triggerPos = new BlockLocation(5, 4, 1);
  const farPos = new BlockLocation(3, 3, 4);
  const nearPos = new BlockLocation(4, 3, 1);

  test
    .startSequence()
    .thenExecute(() => {
      test.pulseRedstone(triggerPos, 2);
    })
    .thenExecuteAfter(20, () => {
      test.assertBlockPresent(MinecraftBlockTypes.slime, farPos, true);
    })
    .thenExecuteAfter(20, () => {
      test.assertBlockPresent(MinecraftBlockTypes.slime, nearPos, true);
    })
    .thenSucceed();
})
  .tag("suite:java_parity")
  .tag(GameTest.Tags.suiteDisabled); // After I use redstone instead of set fire block to active the observer, I can see this machine use 2 reverse sticky-piston for flying forward and back in Java. It didn't work well in bedrock.

GameTest.register("FlyingMachineTests", "machine_c", (test) => {
  const triggerPos = new BlockLocation(4, 4, 0);
  const farPos = new BlockLocation(4, 3, 5);
  const nearPos = new BlockLocation(4, 3, 2);
  const stopBlock = new BlockLocation(4, 3, 4);

  test
    .startSequence()
    .thenExecute(() => {
      test.pulseRedstone(triggerPos, 2);
    })
    .thenExecuteAfter(20, () => {
      test.assertBlockPresent(MinecraftBlockTypes.slime, farPos, true);
    })
    .thenExecuteAfter(20, () => {
      test.setBlockType(MinecraftBlockTypes.obsidian, stopBlock);
    })
    .thenExecuteAfter(2, () => {
      test.assertBlockPresent(MinecraftBlockTypes.stickyPiston, nearPos, true);
    })
    .thenSucceed();
})
  .tag("suite:java_parity")
  .tag(GameTest.Tags.suiteDisabled); // Could not set fire block in the air even I use pulseRedstone() the machine didn't move.

GameTest.register("FlyingMachineTests", "machine_d", (test) => {
  const triggerPos = new BlockLocation(3, 7, 3);
  const dropPos = new BlockLocation(5, 5, 2);
  const farPos = new BlockLocation(2, 5, 8);
  const nearPos = new BlockLocation(3, 5, 1);

  test
    .startSequence()
    .thenExecute(() => {
      test.setBlockType(MinecraftBlockTypes.fire, triggerPos);
    })
    .thenExecuteAfter(16, () => {
      test.assertBlockPresent(MinecraftBlockTypes.slime, dropPos, true);
      test.assertBlockPresent(MinecraftBlockTypes.slime, farPos, true);
    })
    .thenSucceed();
})
  .tag("suite:java_parity")
  .tag(GameTest.Tags.suiteDisabled); // Can't fly as a whole thing as expectation

GameTest.register("FlyingMachineTests", "machine_e", (test) => {
  const triggerPos = new BlockLocation(1, 2, 1);
  const farPos = new BlockLocation(1, 11, 1);
  const nearPos = new BlockLocation(1, 3, 1);

  test
    .startSequence()
    .thenExecute(() => {
      test.setBlockType(MinecraftBlockTypes.dirt, triggerPos);
    })
    .thenExecuteAfter(16, () => {
      test.assertBlockPresent(MinecraftBlockTypes.honeyBlock, farPos, true);
    })
    .thenExecuteAfter(20, () => {
      test.assertBlockPresent(MinecraftBlockTypes.observer, nearPos, true);
    })
    .thenSucceed();
})
  .tag("suite:java_parity") // The behavior is different between Java and Bedrock. In Java the flying machine move forward to the end and then returns to its original position, but in Bedrock it returns before it reaches the end. That cause the far point or near point been judged fail.
  .tag(GameTest.Tags.suiteDisabled); // Unstable

GameTest.register("FlyingMachineTests", "machine_f", (test) => {
  const triggerPos = new BlockLocation(4, 6, 1);
  const farPos = new BlockLocation(3, 4, 8);
  const dropPos = new BlockLocation(3, 4, 6);
  const nearPos = new BlockLocation(3, 4, 1);

  test
    .startSequence()
    .thenExecute(() => {
      test.setBlockType(MinecraftBlockTypes.fire, triggerPos);
    })
    .thenExecuteAfter(18, () => {
      test.assertBlockPresent(MinecraftBlockTypes.slime, farPos, true);
    })
    .thenExecuteAfter(40, () => {
      test.assertBlockPresent(MinecraftBlockTypes.slime, dropPos, true);
      test.assertBlockPresent(MinecraftBlockTypes.slime, nearPos, true);
    })
    .thenSucceed();
})
  .tag("suite:java_parity")
  .tag(GameTest.Tags.suiteDisabled); // Unstable, when noFinishingSequence appears, it failed.

GameTest.register("FlyingMachineTests", "machine_g", (test) => {
  const triggerPos = new BlockLocation(1, 3, 0);
  const farPos = new BlockLocation(2, 3, 6);
  const nearPos = new BlockLocation(1, 3, 1);

  test
    .startSequence()
    .thenExecute(() => {
      test.pulseRedstone(triggerPos, 2);
    })
    .thenExecuteAfter(16, () => {
      test.assertBlockPresent(MinecraftBlockTypes.slime, farPos, true);
    })
    .thenExecuteAfter(20, () => {
      test.assertBlockPresent(MinecraftBlockTypes.observer, nearPos, true);
    })
    .thenSucceed();
})
  .tag("suite:java_parity")
  .tag(GameTest.Tags.suiteDisabled); // Could not set fire in the air, so I use pulseRedstone to active the observer. It's 50% pass rate.

GameTest.register("FlyingMachineTests", "machine_h", (test) => {
  const triggerPos = new BlockLocation(1, 4, 0);
  const farPos = new BlockLocation(1, 3, 8);
  const dropPos = new BlockLocation(1, 3, 7);
  const nearPos = new BlockLocation(1, 4, 1);

  test
    .startSequence()
    .thenExecute(() => {
      test.pulseRedstone(triggerPos, 2);
    })
    .thenExecuteAfter(20, () => {
      test.assertBlockPresent(MinecraftBlockTypes.slime, farPos, true);
    })
    .thenExecuteAfter(20, () => {
      test.assertBlockPresent(MinecraftBlockTypes.slime, dropPos, true);
      test.assertBlockPresent(MinecraftBlockTypes.observer, nearPos, true);
    })
    .thenSucceed();
})
  .tag("suite:java_parity")
  .tag(GameTest.Tags.suiteDisabled); // Could not set fire in the air, so I use pulseRedstone to active the observer, pass rate is less than 10%, the sticky-piston always unstick.

GameTest.register("FlyingMachineTests", "machine_i", (test) => {
  const triggerPos = new BlockLocation(4, 2, 1);
  const farPos = new BlockLocation(3, 8, 1);
  const nearPos = new BlockLocation(4, 3, 1);

  test
    .startSequence()
    .thenExecute(() => {
      test.setBlockType(MinecraftBlockTypes.dirt, triggerPos);
    })
    .thenExecuteAfter(18, () => {
      test.assertBlockPresent(MinecraftBlockTypes.honeyBlock, farPos, true);
    })
    .thenExecuteAfter(18, () => {
      test.assertBlockPresent(MinecraftBlockTypes.observer, nearPos, true);
    })
    .thenSucceed();
})
  .tag("suite:java_parity") // The behavior is different between Java and Bedrock. In Java the flying machine move forward to the end and then returns to its original position, but in Bedrock it returns before it reaches the end. That cause the far point or near point been judged fail.
  .tag(GameTest.Tags.suiteDisabled); // Unstable.

GameTest.register("FlyingMachineTests", "m_bedrock", (test) => {
  // For bedrock. Follow the simple engine 1
  const triggerPos = new BlockLocation(0, 3, 0);
  const sourcePos = new BlockLocation(1, 3, 0);
  const targetPos = new BlockLocation(8, 3, 1);

  test
    .startSequence()
    .thenExecute(() => {
      test.assertBlockPresent(MinecraftBlockTypes.slime, sourcePos, true);
      test.assertBlockPresent(MinecraftBlockTypes.slime, targetPos, false);
      test.setBlockType(MinecraftBlockTypes.redstoneBlock, triggerPos);
    })
    .thenWait(() => {
      test.assertBlockPresent(MinecraftBlockTypes.slime, sourcePos, false);
      test.assertBlockPresent(MinecraftBlockTypes.slime, targetPos, true);
    })
    .thenSucceed();
}).tag(GameTest.Tags.suiteDefault);

GameTest.register("FlyingMachineTests", "m2_bedrock", (test) => {
  // For bedrock. Follow the simple engine 2
  const triggerPos = new BlockLocation(0, 3, 1);
  const sourcePos = new BlockLocation(2, 3, 0);
  const targetPos = new BlockLocation(6, 3, 1);

  test
    .startSequence()
    .thenExecute(() => {
      test.assertBlockPresent(MinecraftBlockTypes.slime, sourcePos, true);
      test.assertBlockPresent(MinecraftBlockTypes.slime, targetPos, false);
      test.setBlockType(MinecraftBlockTypes.redstoneBlock, triggerPos);
    })
    .thenWait(() => {
      test.assertBlockPresent(MinecraftBlockTypes.slime, sourcePos, false);
      test.assertBlockPresent(MinecraftBlockTypes.slime, targetPos, true);
    })
    .thenSucceed();
}).tag(GameTest.Tags.suiteDefault);

GameTest.register("FlyingMachineTests", "m3_bedrock", (test) => {
  // for bedrock. Follow the simple engine 2 with trailer
  const triggerPos = new BlockLocation(1, 3, 2);
  const sourcePos = new BlockLocation(4, 3, 2);
  const targetPos = new BlockLocation(7, 3, 2);

  test
    .startSequence()
    .thenExecute(() => {
      test.assertBlockPresent(MinecraftBlockTypes.slime, sourcePos, true);
      test.assertBlockPresent(MinecraftBlockTypes.slime, targetPos, false);
      test.setBlockType(MinecraftBlockTypes.redstoneBlock, triggerPos);
    })
    .thenWait(() => {
      test.assertBlockPresent(MinecraftBlockTypes.slime, sourcePos, false);
      test.assertBlockPresent(MinecraftBlockTypes.slime, targetPos, true);
    })
    .thenSucceed();
}).tag(GameTest.Tags.suiteDefault);

// SIG // Begin signature block
// SIG // MIInyQYJKoZIhvcNAQcCoIInujCCJ7YCAQExDzANBglg
// SIG // hkgBZQMEAgEFADB3BgorBgEEAYI3AgEEoGkwZzAyBgor
// SIG // BgEEAYI3AgEeMCQCAQEEEBDgyQbOONQRoqMAEEvTUJAC
// SIG // AQACAQACAQACAQACAQAwMTANBglghkgBZQMEAgEFAAQg
// SIG // GX0b4A6DXx7sruXjmvdW4Q1YzMjsrjRRYtg61QHTe5Cg
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
// SIG // SEXAQsmbdlsKgEhr/Xmfwb1tbWrJUnMTDXpQzTGCGaAw
// SIG // ghmcAgEBMIGVMH4xCzAJBgNVBAYTAlVTMRMwEQYDVQQI
// SIG // EwpXYXNoaW5ndG9uMRAwDgYDVQQHEwdSZWRtb25kMR4w
// SIG // HAYDVQQKExVNaWNyb3NvZnQgQ29ycG9yYXRpb24xKDAm
// SIG // BgNVBAMTH01pY3Jvc29mdCBDb2RlIFNpZ25pbmcgUENB
// SIG // IDIwMTECEzMAAAJSizOq+JXzOdsAAAAAAlIwDQYJYIZI
// SIG // AWUDBAIBBQCggcAwGQYJKoZIhvcNAQkDMQwGCisGAQQB
// SIG // gjcCAQQwHAYKKwYBBAGCNwIBCzEOMAwGCisGAQQBgjcC
// SIG // ARUwLwYJKoZIhvcNAQkEMSIEIKS2f8zjm2EY6fOShp2Y
// SIG // E5kZV+BjNFbcZ5tNJJcrgI+gMFQGCisGAQQBgjcCAQwx
// SIG // RjBEoCSAIgBNAGkAbgBlAGMAcgBhAGYAdAAgAEIAZQBk
// SIG // AHIAbwBjAGuhHIAaaHR0cHM6Ly93d3cubWluZWNyYWZ0
// SIG // Lm5ldC8wDQYJKoZIhvcNAQEBBQAEggEAn72DDyhbBuqi
// SIG // V7ZmS6B1EFDpFR90xK3tcSJNSS783DOtyQDgRPUOMqBI
// SIG // Jup93tExyVc64sJILzPHT9LBn4NFJ4en7t9mC2yYu30v
// SIG // 3gbMPhMm+iLau/tnhlFhMoZizSjBAeIiTvTje/TKvoJz
// SIG // hsCMsMwdeYdjAfliGw3aDdWNtpxdKxiegHxzj8HDI6eC
// SIG // 1eb72wx32U8ye85/n/rB+/3nzI6egUnBOcTQ/+E9oeOd
// SIG // TMMV1cNrzNrYMF4o28ehutJ2Lh4oTYhK7i0uwm/97/UC
// SIG // +ZTWRzSXNJgzAGxUnFgTcC0lTmNLZOqhcXduP6oP/EYx
// SIG // nX8QoT0RebttjiQ1pVNAbqGCFxgwghcUBgorBgEEAYI3
// SIG // AwMBMYIXBDCCFwAGCSqGSIb3DQEHAqCCFvEwghbtAgED
// SIG // MQ8wDQYJYIZIAWUDBAIBBQAwggFYBgsqhkiG9w0BCRAB
// SIG // BKCCAUcEggFDMIIBPwIBAQYKKwYBBAGEWQoDATAxMA0G
// SIG // CWCGSAFlAwQCAQUABCB9GIdnJ78GHU/sBZwiLjN8ftUY
// SIG // ZrDeS9cOp5U629+k4gIGYryhHqJlGBIyMDIyMDcwMjAw
// SIG // Mjg1Mi4xNFowBIACAfSggdikgdUwgdIxCzAJBgNVBAYT
// SIG // AlVTMRMwEQYDVQQIEwpXYXNoaW5ndG9uMRAwDgYDVQQH
// SIG // EwdSZWRtb25kMR4wHAYDVQQKExVNaWNyb3NvZnQgQ29y
// SIG // cG9yYXRpb24xLTArBgNVBAsTJE1pY3Jvc29mdCBJcmVs
// SIG // YW5kIE9wZXJhdGlvbnMgTGltaXRlZDEmMCQGA1UECxMd
// SIG // VGhhbGVzIFRTUyBFU046RDA4Mi00QkZELUVFQkExJTAj
// SIG // BgNVBAMTHE1pY3Jvc29mdCBUaW1lLVN0YW1wIFNlcnZp
// SIG // Y2WgghFoMIIHFDCCBPygAwIBAgITMwAAAY/zUajrWnLd
// SIG // zAABAAABjzANBgkqhkiG9w0BAQsFADB8MQswCQYDVQQG
// SIG // EwJVUzETMBEGA1UECBMKV2FzaGluZ3RvbjEQMA4GA1UE
// SIG // BxMHUmVkbW9uZDEeMBwGA1UEChMVTWljcm9zb2Z0IENv
// SIG // cnBvcmF0aW9uMSYwJAYDVQQDEx1NaWNyb3NvZnQgVGlt
// SIG // ZS1TdGFtcCBQQ0EgMjAxMDAeFw0yMTEwMjgxOTI3NDZa
// SIG // Fw0yMzAxMjYxOTI3NDZaMIHSMQswCQYDVQQGEwJVUzET
// SIG // MBEGA1UECBMKV2FzaGluZ3RvbjEQMA4GA1UEBxMHUmVk
// SIG // bW9uZDEeMBwGA1UEChMVTWljcm9zb2Z0IENvcnBvcmF0
// SIG // aW9uMS0wKwYDVQQLEyRNaWNyb3NvZnQgSXJlbGFuZCBP
// SIG // cGVyYXRpb25zIExpbWl0ZWQxJjAkBgNVBAsTHVRoYWxl
// SIG // cyBUU1MgRVNOOkQwODItNEJGRC1FRUJBMSUwIwYDVQQD
// SIG // ExxNaWNyb3NvZnQgVGltZS1TdGFtcCBTZXJ2aWNlMIIC
// SIG // IjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKCAgEAmVc+
// SIG // /rXPFx6Fk4+CpLrubDrLTa3QuAHRVXuy+zsxXwkogkT0
// SIG // a+XWuBabwHyqj8RRiZQQvdvbOq5NRExOeHiaCtkUsQ02
// SIG // ESAe9Cz+loBNtsfCq846u3otWHCJlqkvDrSr7mMBqwcR
// SIG // Y7cfhAGfLvlpMSojoAnk7Rej+jcJnYxIeN34F3h9JwAN
// SIG // Y360oGYCIS7pLOosWV+bxug9uiTZYE/XclyYNF6XdzZ/
// SIG // zD/4U5pxT4MZQmzBGvDs+8cDdA/stZfj/ry+i0XUYNFP
// SIG // huqc+UKkwm/XNHB+CDsGQl+ZS0GcbUUun4VPThHJm6mR
// SIG // AwL5y8zptWEIocbTeRSTmZnUa2iYH2EOBV7eCjx0Sdb6
// SIG // kLc1xdFRckDeQGR4J1yFyybuZsUP8x0dOsEEoLQuOhuK
// SIG // lDLQEg7D6ZxmZJnS8B03ewk/SpVLqsb66U2qyF4BwDt1
// SIG // uZkjEZ7finIoUgSz4B7fWLYIeO2OCYxIE0XvwsVop9Pv
// SIG // TXTZtGPzzmHU753GarKyuM6oa/qaTzYvrAfUb7KYhvVQ
// SIG // KxGUPkL9+eKiM7G0qenJCFrXzZPwRWoccAR33PhNEuuz
// SIG // zKZFJ4DeaTCLg/8uK0Q4QjFRef5n4H+2KQIEibZ7zIeB
// SIG // X3jgsrICbzzSm0QX3SRVmZH//Aqp8YxkwcoI1WCBizv8
// SIG // 4z9eqwRBdQ4HYcNbQMMCAwEAAaOCATYwggEyMB0GA1Ud
// SIG // DgQWBBTzBuZ0a65JzuKhzoWb25f7NyNxvDAfBgNVHSME
// SIG // GDAWgBSfpxVdAF5iXYP05dJlpxtTNRnpcjBfBgNVHR8E
// SIG // WDBWMFSgUqBQhk5odHRwOi8vd3d3Lm1pY3Jvc29mdC5j
// SIG // b20vcGtpb3BzL2NybC9NaWNyb3NvZnQlMjBUaW1lLVN0
// SIG // YW1wJTIwUENBJTIwMjAxMCgxKS5jcmwwbAYIKwYBBQUH
// SIG // AQEEYDBeMFwGCCsGAQUFBzAChlBodHRwOi8vd3d3Lm1p
// SIG // Y3Jvc29mdC5jb20vcGtpb3BzL2NlcnRzL01pY3Jvc29m
// SIG // dCUyMFRpbWUtU3RhbXAlMjBQQ0ElMjAyMDEwKDEpLmNy
// SIG // dDAMBgNVHRMBAf8EAjAAMBMGA1UdJQQMMAoGCCsGAQUF
// SIG // BwMIMA0GCSqGSIb3DQEBCwUAA4ICAQDNf9Oo9zyhC5n1
// SIG // jC8iU7NJY39FizjhxZwJbJY/Ytwn63plMlTSaBperan5
// SIG // 66fuRojGJSv3EwZs+RruOU2T/ZRDx4VHesLHtclE8GmM
// SIG // M1qTMaZPL8I2FrRmf5Oop4GqcxNdNECBClVZmn0KzFdP
// SIG // MqRa5/0R6CmgqJh0muvImikgHubvohsavPEyyHQa94HD
// SIG // 4/LNKd/YIaCKKPz9SA5fAa4phQ4Evz2auY9SUluId5MK
// SIG // 9H5cjWVwBxCvYAD+1CW9z7GshJlNjqBvWtKO6J0Aemfg
// SIG // 6z28g7qc7G/tCtrlH4/y27y+stuwWXNvwdsSd1lvB4M6
// SIG // 3AuMl9Yp6au/XFknGzJPF6n/uWR6JhQvzh40ILgeThLm
// SIG // Yhf8z+aDb4r2OBLG1P2B6aCTW2YQkt7TpUnzI0cKGr21
// SIG // 3CbKtGk/OOIHSsDOxasmeGJ+FiUJCiV15wh3aZT/VT/P
// SIG // kL9E4hDBAwGt49G88gSCO0x9jfdDZWdWGbELXlSmA3EP
// SIG // 4eTYq7RrolY04G8fGtF0pzuZu43A29zaI9lIr5ulKRz8
// SIG // EoQHU6cu0PxUw0B9H8cAkvQxaMumRZ/4fCbqNb4TcPkP
// SIG // cWOI24QYlvpbtT9p31flYElmc5wjGplAky/nkJcT0HZE
// SIG // NXenxWtPvt4gcoqppeJPA3S/1D57KL3667epIr0yV290
// SIG // E2otZbAW8DCCB3EwggVZoAMCAQICEzMAAAAVxedrngKb
// SIG // SZkAAAAAABUwDQYJKoZIhvcNAQELBQAwgYgxCzAJBgNV
// SIG // BAYTAlVTMRMwEQYDVQQIEwpXYXNoaW5ndG9uMRAwDgYD
// SIG // VQQHEwdSZWRtb25kMR4wHAYDVQQKExVNaWNyb3NvZnQg
// SIG // Q29ycG9yYXRpb24xMjAwBgNVBAMTKU1pY3Jvc29mdCBS
// SIG // b290IENlcnRpZmljYXRlIEF1dGhvcml0eSAyMDEwMB4X
// SIG // DTIxMDkzMDE4MjIyNVoXDTMwMDkzMDE4MzIyNVowfDEL
// SIG // MAkGA1UEBhMCVVMxEzARBgNVBAgTCldhc2hpbmd0b24x
// SIG // EDAOBgNVBAcTB1JlZG1vbmQxHjAcBgNVBAoTFU1pY3Jv
// SIG // c29mdCBDb3Jwb3JhdGlvbjEmMCQGA1UEAxMdTWljcm9z
// SIG // b2Z0IFRpbWUtU3RhbXAgUENBIDIwMTAwggIiMA0GCSqG
// SIG // SIb3DQEBAQUAA4ICDwAwggIKAoICAQDk4aZM57RyIQt5
// SIG // osvXJHm9DtWC0/3unAcH0qlsTnXIyjVX9gF/bErg4r25
// SIG // PhdgM/9cT8dm95VTcVrifkpa/rg2Z4VGIwy1jRPPdzLA
// SIG // EBjoYH1qUoNEt6aORmsHFPPFdvWGUNzBRMhxXFExN6AK
// SIG // OG6N7dcP2CZTfDlhAnrEqv1yaa8dq6z2Nr41JmTamDu6
// SIG // GnszrYBbfowQHJ1S/rboYiXcag/PXfT+jlPP1uyFVk3v
// SIG // 3byNpOORj7I5LFGc6XBpDco2LXCOMcg1KL3jtIckw+DJ
// SIG // j361VI/c+gVVmG1oO5pGve2krnopN6zL64NF50ZuyjLV
// SIG // wIYwXE8s4mKyzbnijYjklqwBSru+cakXW2dg3viSkR4d
// SIG // Pf0gz3N9QZpGdc3EXzTdEonW/aUgfX782Z5F37ZyL9t9
// SIG // X4C626p+Nuw2TPYrbqgSUei/BQOj0XOmTTd0lBw0gg/w
// SIG // EPK3Rxjtp+iZfD9M269ewvPV2HM9Q07BMzlMjgK8Qmgu
// SIG // EOqEUUbi0b1qGFphAXPKZ6Je1yh2AuIzGHLXpyDwwvoS
// SIG // CtdjbwzJNmSLW6CmgyFdXzB0kZSU2LlQ+QuJYfM2BjUY
// SIG // hEfb3BvR/bLUHMVr9lxSUV0S2yW6r1AFemzFER1y7435
// SIG // UsSFF5PAPBXbGjfHCBUYP3irRbb1Hode2o+eFnJpxq57
// SIG // t7c+auIurQIDAQABo4IB3TCCAdkwEgYJKwYBBAGCNxUB
// SIG // BAUCAwEAATAjBgkrBgEEAYI3FQIEFgQUKqdS/mTEmr6C
// SIG // kTxGNSnPEP8vBO4wHQYDVR0OBBYEFJ+nFV0AXmJdg/Tl
// SIG // 0mWnG1M1GelyMFwGA1UdIARVMFMwUQYMKwYBBAGCN0yD
// SIG // fQEBMEEwPwYIKwYBBQUHAgEWM2h0dHA6Ly93d3cubWlj
// SIG // cm9zb2Z0LmNvbS9wa2lvcHMvRG9jcy9SZXBvc2l0b3J5
// SIG // Lmh0bTATBgNVHSUEDDAKBggrBgEFBQcDCDAZBgkrBgEE
// SIG // AYI3FAIEDB4KAFMAdQBiAEMAQTALBgNVHQ8EBAMCAYYw
// SIG // DwYDVR0TAQH/BAUwAwEB/zAfBgNVHSMEGDAWgBTV9lbL
// SIG // j+iiXGJo0T2UkFvXzpoYxDBWBgNVHR8ETzBNMEugSaBH
// SIG // hkVodHRwOi8vY3JsLm1pY3Jvc29mdC5jb20vcGtpL2Ny
// SIG // bC9wcm9kdWN0cy9NaWNSb29DZXJBdXRfMjAxMC0wNi0y
// SIG // My5jcmwwWgYIKwYBBQUHAQEETjBMMEoGCCsGAQUFBzAC
// SIG // hj5odHRwOi8vd3d3Lm1pY3Jvc29mdC5jb20vcGtpL2Nl
// SIG // cnRzL01pY1Jvb0NlckF1dF8yMDEwLTA2LTIzLmNydDAN
// SIG // BgkqhkiG9w0BAQsFAAOCAgEAnVV9/Cqt4SwfZwExJFvh
// SIG // nnJL/Klv6lwUtj5OR2R4sQaTlz0xM7U518JxNj/aZGx8
// SIG // 0HU5bbsPMeTCj/ts0aGUGCLu6WZnOlNN3Zi6th542DYu
// SIG // nKmCVgADsAW+iehp4LoJ7nvfam++Kctu2D9IdQHZGN5t
// SIG // ggz1bSNU5HhTdSRXud2f8449xvNo32X2pFaq95W2KFUn
// SIG // 0CS9QKC/GbYSEhFdPSfgQJY4rPf5KYnDvBewVIVCs/wM
// SIG // nosZiefwC2qBwoEZQhlSdYo2wh3DYXMuLGt7bj8sCXgU
// SIG // 6ZGyqVvfSaN0DLzskYDSPeZKPmY7T7uG+jIa2Zb0j/aR
// SIG // AfbOxnT99kxybxCrdTDFNLB62FD+CljdQDzHVG2dY3RI
// SIG // LLFORy3BFARxv2T5JL5zbcqOCb2zAVdJVGTZc9d/HltE
// SIG // AY5aGZFrDZ+kKNxnGSgkujhLmm77IVRrakURR6nxt67I
// SIG // 6IleT53S0Ex2tVdUCbFpAUR+fKFhbHP+CrvsQWY9af3L
// SIG // wUFJfn6Tvsv4O+S3Fb+0zj6lMVGEvL8CwYKiexcdFYmN
// SIG // cP7ntdAoGokLjzbaukz5m/8K6TT4JDVnK+ANuOaMmdbh
// SIG // IurwJ0I9JZTmdHRbatGePu1+oDEzfbzL6Xu/OHBE0ZDx
// SIG // yKs6ijoIYn/ZcGNTTY3ugm2lBRDBcQZqELQdVTNYs6Fw
// SIG // ZvKhggLXMIICQAIBATCCAQChgdikgdUwgdIxCzAJBgNV
// SIG // BAYTAlVTMRMwEQYDVQQIEwpXYXNoaW5ndG9uMRAwDgYD
// SIG // VQQHEwdSZWRtb25kMR4wHAYDVQQKExVNaWNyb3NvZnQg
// SIG // Q29ycG9yYXRpb24xLTArBgNVBAsTJE1pY3Jvc29mdCBJ
// SIG // cmVsYW5kIE9wZXJhdGlvbnMgTGltaXRlZDEmMCQGA1UE
// SIG // CxMdVGhhbGVzIFRTUyBFU046RDA4Mi00QkZELUVFQkEx
// SIG // JTAjBgNVBAMTHE1pY3Jvc29mdCBUaW1lLVN0YW1wIFNl
// SIG // cnZpY2WiIwoBATAHBgUrDgMCGgMVAD5NL4IEdudIBwdG
// SIG // oCaV0WBbQZpqoIGDMIGApH4wfDELMAkGA1UEBhMCVVMx
// SIG // EzARBgNVBAgTCldhc2hpbmd0b24xEDAOBgNVBAcTB1Jl
// SIG // ZG1vbmQxHjAcBgNVBAoTFU1pY3Jvc29mdCBDb3Jwb3Jh
// SIG // dGlvbjEmMCQGA1UEAxMdTWljcm9zb2Z0IFRpbWUtU3Rh
// SIG // bXAgUENBIDIwMTAwDQYJKoZIhvcNAQEFBQACBQDmacKB
// SIG // MCIYDzIwMjIwNzAyMDI1OTEzWhgPMjAyMjA3MDMwMjU5
// SIG // MTNaMHcwPQYKKwYBBAGEWQoEATEvMC0wCgIFAOZpwoEC
// SIG // AQAwCgIBAAICD6QCAf8wBwIBAAICEUEwCgIFAOZrFAEC
// SIG // AQAwNgYKKwYBBAGEWQoEAjEoMCYwDAYKKwYBBAGEWQoD
// SIG // AqAKMAgCAQACAwehIKEKMAgCAQACAwGGoDANBgkqhkiG
// SIG // 9w0BAQUFAAOBgQAjuoYJGKkQ4I/+daxcWY6uLRGeutx9
// SIG // 6PXtnvmXhVhKvXQrppuV2/liMOhFENngocfh83bBMQIP
// SIG // K7WMMSlornH71S6qBXoURKBKAAZRHiB8SzXotf4qcjkp
// SIG // u/X6prFmrX7mkyxvZvLDBoPj7qkJDFdZJGVaK2sCRzgA
// SIG // RTSeH4B8yzGCBA0wggQJAgEBMIGTMHwxCzAJBgNVBAYT
// SIG // AlVTMRMwEQYDVQQIEwpXYXNoaW5ndG9uMRAwDgYDVQQH
// SIG // EwdSZWRtb25kMR4wHAYDVQQKExVNaWNyb3NvZnQgQ29y
// SIG // cG9yYXRpb24xJjAkBgNVBAMTHU1pY3Jvc29mdCBUaW1l
// SIG // LVN0YW1wIFBDQSAyMDEwAhMzAAABj/NRqOtact3MAAEA
// SIG // AAGPMA0GCWCGSAFlAwQCAQUAoIIBSjAaBgkqhkiG9w0B
// SIG // CQMxDQYLKoZIhvcNAQkQAQQwLwYJKoZIhvcNAQkEMSIE
// SIG // IDw83aPiO02mJp51XDARV1k8HVB3dKwqtZYFEu9X/NGy
// SIG // MIH6BgsqhkiG9w0BCRACLzGB6jCB5zCB5DCBvQQgl3IF
// SIG // T+LGxguVjiKm22ItmO6dFDWW8nShu6O6g8yFxx8wgZgw
// SIG // gYCkfjB8MQswCQYDVQQGEwJVUzETMBEGA1UECBMKV2Fz
// SIG // aGluZ3RvbjEQMA4GA1UEBxMHUmVkbW9uZDEeMBwGA1UE
// SIG // ChMVTWljcm9zb2Z0IENvcnBvcmF0aW9uMSYwJAYDVQQD
// SIG // Ex1NaWNyb3NvZnQgVGltZS1TdGFtcCBQQ0EgMjAxMAIT
// SIG // MwAAAY/zUajrWnLdzAABAAABjzAiBCB8sDbKKRRwrgtr
// SIG // W+CIuBZxpd8FqM0uGyGB8pY5kLkOCjANBgkqhkiG9w0B
// SIG // AQsFAASCAgB47izlTW10WPggSaKMl9ouNZR/oa7Vy20p
// SIG // nUWLt1nn0mWlR4MEHzQXi5DGJcvBkrmjh0VCJDQvtvvo
// SIG // OGm9w6MMJimd/TqfdjNrPSPvgg91vGN5Tdk7gtWhSh79
// SIG // ZsC3v2VMzW80LI67Ts49hxRI42TSVaP/mHFqZEUwSPUw
// SIG // jr1J5etzXmHpUWr+519P6YbWaXb20C0Bfz5QJBCz8oTV
// SIG // 48dUCrJjkON9mFUxgpI8v4EIPNTTfxlbRktcDCp5auXH
// SIG // E3AQHqjx7U+8jN6gllL1LIp+eckYKZ9qo/LM0rNPG8Wr
// SIG // CMETThOPlCTw3eC5PvDqJ7s96xn+UuygccXqWuygu0Cp
// SIG // G4nPVuoyBZIzZbPL5UKZp4ttVdndgYIVuxJ4T0cDJ7eb
// SIG // ito509/HB/+qzU9oB/unn1dDx56ct3/6YpbZKpZI+To0
// SIG // ovCWwRLIitHaaElzf1tpXSqeq3NXWtZ/JIfEB5vK7WN9
// SIG // D0SNHMhcjyv7gk1GbNCTKOjr+fqLQeHNkoDB3zc6NvZt
// SIG // k6AFxDi752vqlJz4mBMUaywFpUl3Zxo5mOIU2DLl0F0F
// SIG // XPsCe4KHWmOol1geRto3XwKsw2YUusQ65Bn9UxHB1bQz
// SIG // LWOZxN97xQh85SJoauUPXaQRWH91BhRGhxlW5UdDc4VA
// SIG // TQfj59llESqt6grqYPEcHIuGktAEZqZHXg==
// SIG // End signature block
