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
// SIG // MIInsQYJKoZIhvcNAQcCoIInojCCJ54CAQExDzANBglg
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
// SIG // SEXAQsmbdlsKgEhr/Xmfwb1tbWrJUnMTDXpQzTGCGYgw
// SIG // ghmEAgEBMIGVMH4xCzAJBgNVBAYTAlVTMRMwEQYDVQQI
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
// SIG // nX8QoT0RebttjiQ1pVNAbqGCFwAwghb8BgorBgEEAYI3
// SIG // AwMBMYIW7DCCFugGCSqGSIb3DQEHAqCCFtkwghbVAgED
// SIG // MQ8wDQYJYIZIAWUDBAIBBQAwggFRBgsqhkiG9w0BCRAB
// SIG // BKCCAUAEggE8MIIBOAIBAQYKKwYBBAGEWQoDATAxMA0G
// SIG // CWCGSAFlAwQCAQUABCB9GIdnJ78GHU/sBZwiLjN8ftUY
// SIG // ZrDeS9cOp5U629+k4gIGYoJdkFDfGBMyMDIyMDYxNjIz
// SIG // MTYxOS4wNDZaMASAAgH0oIHQpIHNMIHKMQswCQYDVQQG
// SIG // EwJVUzETMBEGA1UECBMKV2FzaGluZ3RvbjEQMA4GA1UE
// SIG // BxMHUmVkbW9uZDEeMBwGA1UEChMVTWljcm9zb2Z0IENv
// SIG // cnBvcmF0aW9uMSUwIwYDVQQLExxNaWNyb3NvZnQgQW1l
// SIG // cmljYSBPcGVyYXRpb25zMSYwJAYDVQQLEx1UaGFsZXMg
// SIG // VFNTIEVTTjozRTdBLUUzNTktQTI1RDElMCMGA1UEAxMc
// SIG // TWljcm9zb2Z0IFRpbWUtU3RhbXAgU2VydmljZaCCEVcw
// SIG // ggcMMIIE9KADAgECAhMzAAABoOm7jLsOotF6AAEAAAGg
// SIG // MA0GCSqGSIb3DQEBCwUAMHwxCzAJBgNVBAYTAlVTMRMw
// SIG // EQYDVQQIEwpXYXNoaW5ndG9uMRAwDgYDVQQHEwdSZWRt
// SIG // b25kMR4wHAYDVQQKExVNaWNyb3NvZnQgQ29ycG9yYXRp
// SIG // b24xJjAkBgNVBAMTHU1pY3Jvc29mdCBUaW1lLVN0YW1w
// SIG // IFBDQSAyMDEwMB4XDTIxMTIwMjE5MDUyM1oXDTIzMDIy
// SIG // ODE5MDUyM1owgcoxCzAJBgNVBAYTAlVTMRMwEQYDVQQI
// SIG // EwpXYXNoaW5ndG9uMRAwDgYDVQQHEwdSZWRtb25kMR4w
// SIG // HAYDVQQKExVNaWNyb3NvZnQgQ29ycG9yYXRpb24xJTAj
// SIG // BgNVBAsTHE1pY3Jvc29mdCBBbWVyaWNhIE9wZXJhdGlv
// SIG // bnMxJjAkBgNVBAsTHVRoYWxlcyBUU1MgRVNOOjNFN0Et
// SIG // RTM1OS1BMjVEMSUwIwYDVQQDExxNaWNyb3NvZnQgVGlt
// SIG // ZS1TdGFtcCBTZXJ2aWNlMIICIjANBgkqhkiG9w0BAQEF
// SIG // AAOCAg8AMIICCgKCAgEAv9riDmhxnQDo9mL4YSOgvIhQ
// SIG // Ku8K5f+VqT449HxBwouiL8fyNNibLPx1YZHxkzBrbUeY
// SIG // 0YYayV8nVg5zps0VNweBuduU+6cJBTRQV7pjP/fJeZNF
// SIG // Nl4mmfm7pVx3ueMero/+r+VRhb/tB4dXcoxlEz2kRMEu
// SIG // 8ffE3ubRRxIpj2vgLBtpjPp/TcH0EY3dS4hAm3AmRZIM
// SIG // G5YkP2pIjK9bWZo5A28bbtmkHF4xHw52vCR/sGZn3btF
// SIG // +5OnSeVhkRcM2YiziVuEIQBKXodnNZpm7QHwZ4UjzfhO
// SIG // clC36X009sF/EWx+l3wIOrGcfPPesatPoFA/Zh8vGbaX
// SIG // RHhNWQNB4Acg1tqyQm0wCQIbe9Qe0c9qT0JoOUd/r0gq
// SIG // 4vAXnEgfmfJsGC97jkt0em3lASe4hOKz0vVgtcNX2Uey
// SIG // uOGUpntnSPjvf54YG9zC2IJus8dx4bS6BoRlTy/lqA5D
// SIG // J7fdyBqDupDQQjNl/grNtqpdrT45CEcscMRekbF4f0B5
// SIG // 4SiYAc3zvnvOCN02GyNItvcwEy+shzr+bBLNc2jTIodu
// SIG // yMH1oOEO/uNC+3uvLgusg/BFBKWg9rNk+fTYUmrk8whJ
// SIG // wKeWK0rHHPTEFSIu4PuRgHQvKQr/tIkWu0CL2pVPvZVo
// SIG // JMgAVP54hR1j48hqAeMdys6N7Vwemgt8mf3U0V6SZ2kC
// SIG // AwEAAaOCATYwggEyMB0GA1UdDgQWBBRyuS5Q2ClOkbiR
// SIG // bBQvRM8LYYzQ6DAfBgNVHSMEGDAWgBSfpxVdAF5iXYP0
// SIG // 5dJlpxtTNRnpcjBfBgNVHR8EWDBWMFSgUqBQhk5odHRw
// SIG // Oi8vd3d3Lm1pY3Jvc29mdC5jb20vcGtpb3BzL2NybC9N
// SIG // aWNyb3NvZnQlMjBUaW1lLVN0YW1wJTIwUENBJTIwMjAx
// SIG // MCgxKS5jcmwwbAYIKwYBBQUHAQEEYDBeMFwGCCsGAQUF
// SIG // BzAChlBodHRwOi8vd3d3Lm1pY3Jvc29mdC5jb20vcGtp
// SIG // b3BzL2NlcnRzL01pY3Jvc29mdCUyMFRpbWUtU3RhbXAl
// SIG // MjBQQ0ElMjAyMDEwKDEpLmNydDAMBgNVHRMBAf8EAjAA
// SIG // MBMGA1UdJQQMMAoGCCsGAQUFBwMIMA0GCSqGSIb3DQEB
// SIG // CwUAA4ICAQAxfcYCq/jfrJQJpW3BKkAZaS+T3wTKnC5E
// SIG // usknhiYxviyl91qL+acoK4Sn7V2fdDWFlH7SGac3WLOH
// SIG // oUeUZWhN3mLm1pXDZcLCpHKxkgySmsG2wxn7zuIf9S9d
// SIG // 7IOuoT4m+u5hveggKkVRdHOTANcIio45f+YH623TSx4L
// SIG // UREPMwqWyuPuupdRXdLqfZsXDhBKYYSa/FN8IcBcKCvk
// SIG // Cf5MVqIBrXw4mqukcqBVoT/Liki1Q1fjExEx2W96djsJ
// SIG // wVhNVutO9VwyncUZDf6QBGdeRNSyTb/YmKNZdT/0XRfi
// SIG // M6TCxgwH/z5Vb01MN1ax/bmqm2K/q0cbYvmzN2m9cL/b
// SIG // 98US3PsD6J4ksVtqevQzeFqPeiAxWSJC0fh3Fgoqh1cB
// SIG // V54JAlH3THt8ZrziF2EZEytD+sDy3wvjrO6HlUXjI9kw
// SIG // NUDDJIGfq4TztO4luzee8wAbzIhyUHR0THitxQYEeH2h
// SIG // L041AHSkUJChVfNrhO8NFDJ7HiX1+xCw2PU+GlsdqsBK
// SIG // mpvZexh1+ANmZtJ59aGmv2MXMye4CFREUhkjli8BDMXB
// SIG // agRj5vUEkO6IDAZ+Vh8JHU05JmpwW/2dnA6cQcXdbzo8
// SIG // iJuAThZS4weKYrwpTtmZLFih+6gWJaGGtO1NTtwvI7W8
// SIG // xlHR8iwmlRgVfA3w+YfHjp8o62gRuzzTWTCCB3EwggVZ
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
// SIG // czEmMCQGA1UECxMdVGhhbGVzIFRTUyBFU046M0U3QS1F
// SIG // MzU5LUEyNUQxJTAjBgNVBAMTHE1pY3Jvc29mdCBUaW1l
// SIG // LVN0YW1wIFNlcnZpY2WiIwoBATAHBgUrDgMCGgMVABMG
// SIG // uI1o2nGzmFPvvecnSe4UgouYoIGDMIGApH4wfDELMAkG
// SIG // A1UEBhMCVVMxEzARBgNVBAgTCldhc2hpbmd0b24xEDAO
// SIG // BgNVBAcTB1JlZG1vbmQxHjAcBgNVBAoTFU1pY3Jvc29m
// SIG // dCBDb3Jwb3JhdGlvbjEmMCQGA1UEAxMdTWljcm9zb2Z0
// SIG // IFRpbWUtU3RhbXAgUENBIDIwMTAwDQYJKoZIhvcNAQEF
// SIG // BQACBQDmVbhrMCIYDzIwMjIwNjE2MjIxMDUxWhgPMjAy
// SIG // MjA2MTcyMjEwNTFaMHcwPQYKKwYBBAGEWQoEATEvMC0w
// SIG // CgIFAOZVuGsCAQAwCgIBAAICIzQCAf8wBwIBAAICEdow
// SIG // CgIFAOZXCesCAQAwNgYKKwYBBAGEWQoEAjEoMCYwDAYK
// SIG // KwYBBAGEWQoDAqAKMAgCAQACAwehIKEKMAgCAQACAwGG
// SIG // oDANBgkqhkiG9w0BAQUFAAOBgQAlV7yWHtHmEZBoPEE9
// SIG // zDp4KiFB8aCwM1TyohpTF+eCrUxEI9svnuV6mzBiFvYv
// SIG // Ls6sNPX5vUh2Xe9PV6eVXVygz6mL/l3up6PWPXorESdp
// SIG // Gs5gL2jOuTSw5HR0YCaWNbdAJaehFiHTfPWcwYOGmBeh
// SIG // odrZVHQiWy+21etDfpUb2TGCBA0wggQJAgEBMIGTMHwx
// SIG // CzAJBgNVBAYTAlVTMRMwEQYDVQQIEwpXYXNoaW5ndG9u
// SIG // MRAwDgYDVQQHEwdSZWRtb25kMR4wHAYDVQQKExVNaWNy
// SIG // b3NvZnQgQ29ycG9yYXRpb24xJjAkBgNVBAMTHU1pY3Jv
// SIG // c29mdCBUaW1lLVN0YW1wIFBDQSAyMDEwAhMzAAABoOm7
// SIG // jLsOotF6AAEAAAGgMA0GCWCGSAFlAwQCAQUAoIIBSjAa
// SIG // BgkqhkiG9w0BCQMxDQYLKoZIhvcNAQkQAQQwLwYJKoZI
// SIG // hvcNAQkEMSIEIIFKoOBjGwDYK6JsYls7KMI/PzfO7nkl
// SIG // l+jX2kpic5Q2MIH6BgsqhkiG9w0BCRACLzGB6jCB5zCB
// SIG // 5DCBvQQgL0eKPGhlBCISLd0RL7MdPrL5zOlomoGuUj2i
// SIG // uIOvtNMwgZgwgYCkfjB8MQswCQYDVQQGEwJVUzETMBEG
// SIG // A1UECBMKV2FzaGluZ3RvbjEQMA4GA1UEBxMHUmVkbW9u
// SIG // ZDEeMBwGA1UEChMVTWljcm9zb2Z0IENvcnBvcmF0aW9u
// SIG // MSYwJAYDVQQDEx1NaWNyb3NvZnQgVGltZS1TdGFtcCBQ
// SIG // Q0EgMjAxMAITMwAAAaDpu4y7DqLRegABAAABoDAiBCAI
// SIG // FJHHZnFDrc5/f0iHTFRiM0BbYq0EyMFeOU0WcUuVPjAN
// SIG // BgkqhkiG9w0BAQsFAASCAgBCMKYGZ63aO/aS0yxnqitf
// SIG // MZQSs1/AXcOLOhmxPZiPGiLAwwvbtJS8pRaIHcvzqLcX
// SIG // cqe8IzxM/7SHl+iLFYosKVvrpKjipjsPJBbiDW4c6k+6
// SIG // yCRpzvfU2+jtj4H8lLbCSF81ktYDUYgZJPnCmK/C7Mwb
// SIG // Xdkzo5m6yDfe6zGVf4jny4yH547zCnaA8ifIAbs9TTaO
// SIG // 0nZntvuITvY07BLvDHCVqYreuaMXZaqN/E52DaoOV6K/
// SIG // U5YEu2mC7rUyiVun2EIYkZ/gyElF72gKOACM1x2stPJO
// SIG // DMdVT1PxwHlaQfszuOTbqwOdw6SQAIC3YG/kV/Rv557o
// SIG // S6fKM13SN7+OmKc/njryCpI24qgRaqKEw5ILpuxoHDnm
// SIG // Hs2SSq2b56czQd/ab5n7/LFOtxsNprEE5gXSVuJvp5gK
// SIG // spa1ylISMT4CDODYPoTOBjmd4tTb+7DOoiS/ut5D/2lO
// SIG // mAPnSKVufBXKN098sXxtGL42q6pK153/+GhjMwicLTAs
// SIG // mXX+7eqTv+S+EcWefwy3SxZxNrPG0FGCA/24DjmedX9p
// SIG // C09Xd0Jsb9FK0DVMVFNmpbMQv6XTecRWlG/+/T9IlBAl
// SIG // Wy2I713gQhnwRFra29Z/D8XtGgirUw/WKWU/F3PFv8rG
// SIG // R4+BNhEZMAHxrWsEq2OMItLUPXFqqx2BJAmiGJftsvT0Sg==
// SIG // End signature block
