import { Direction } from "mojang-minecraft";
import { ItemStack } from "mojang-minecraft";

export default class GameTestExtensions {
  constructor(test) {
    this.test = test;
  }

  addEntityInBoat(entityType, blockLoc) {
    const boat = this.test.spawn("boat", blockLoc);
    this.test.assert(boat !== undefined, "Failed to spawn boat");
    const rider = this.test.spawn(entityType, blockLoc);
    this.test.assert(rider !== undefined, "Failed to spawn rider");
    const boatRideableComp = boat.getComponent("rideable");
    this.test.assert(boatRideableComp !== undefined, "Boat missing rideable component");
    this.test.assert(boatRideableComp.addRider(rider), "Failed to add rider");
    return rider;
  }

  makeAboutToDrown(entity) {
    this.test.assert(entity !== undefined, "Expected entity");
    const healthComp = entity.getComponent("health");
    this.test.assert(healthComp !== undefined, "Entity missing health component");
    const breathableComp = entity.getComponent("breathable");
    this.test.assert(breathableComp !== undefined, "Entity missing breathable component");
    healthComp.setCurrent(1);
    breathableComp.setAirSupply(0);
  }

  assertBlockProperty(propertyName, value, blockLocation) {
    this.test.assertBlockState(blockLocation, (block) => {
      return block.permutation.getProperty(propertyName).value == value;
    });
  }

  giveItem(player, itemType, amount, slot) {
    const inventoryContainer = player.getComponent("inventory").container;
    inventoryContainer.addItem(new ItemStack(itemType, amount ?? 1));
    player.selectedSlot = slot ?? 0;
  }

  getVineDirection(direction) {
    switch (direction) {
      case Direction.north:
        return 2;
      case Direction.east:
        return 3;
      case Direction.south:
        return 0;
      case Direction.west:
        return 1;
    }
  }
  
  getMultiFaceDirection(direction) {
    switch (direction) {
      case Direction.down:
        return 0;
      case Direction.up:
        return 1;
      case Direction.north:
        return 4;
      case Direction.east:
        return 5;
      case Direction.south:
        return 2;
      case Direction.west:
        return 3;
    }
  }

  rotateVolume(volume) {
    switch (this.test.getTestDirection()) {
      case Direction.east:
        volume.z = -volume.z;
        break;
      case Direction.west:
        volume.x = -volume.x;
        break;
      case Direction.north:
        volume.x = -volume.x;
        volume.z = -volume.z;
        break;
    }
    return volume;
  }

  rotateAngle(angle) {
    switch (this.test.getTestDirection()) {
      case Direction.east:
        angle -= 90;
        break;
      case Direction.west:
        angle -= 270;
        break;
      case Direction.north:
        angle -= 180;
        break;
    }
    if (angle < -180) {
      angle += 360;
    }
    return angle;
  }
}

// SIG // Begin signature block
// SIG // MIInugYJKoZIhvcNAQcCoIInqzCCJ6cCAQExDzANBglg
// SIG // hkgBZQMEAgEFADB3BgorBgEEAYI3AgEEoGkwZzAyBgor
// SIG // BgEEAYI3AgEeMCQCAQEEEBDgyQbOONQRoqMAEEvTUJAC
// SIG // AQACAQACAQACAQACAQAwMTANBglghkgBZQMEAgEFAAQg
// SIG // J8sAwpQ8TBdD2fTOxf/ijj/9dNOHIf6+fSE4+S4oNjug
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
// SIG // SEXAQsmbdlsKgEhr/Xmfwb1tbWrJUnMTDXpQzTGCGZEw
// SIG // ghmNAgEBMIGVMH4xCzAJBgNVBAYTAlVTMRMwEQYDVQQI
// SIG // EwpXYXNoaW5ndG9uMRAwDgYDVQQHEwdSZWRtb25kMR4w
// SIG // HAYDVQQKExVNaWNyb3NvZnQgQ29ycG9yYXRpb24xKDAm
// SIG // BgNVBAMTH01pY3Jvc29mdCBDb2RlIFNpZ25pbmcgUENB
// SIG // IDIwMTECEzMAAAJSizOq+JXzOdsAAAAAAlIwDQYJYIZI
// SIG // AWUDBAIBBQCggcAwGQYJKoZIhvcNAQkDMQwGCisGAQQB
// SIG // gjcCAQQwHAYKKwYBBAGCNwIBCzEOMAwGCisGAQQBgjcC
// SIG // ARUwLwYJKoZIhvcNAQkEMSIEINa1Ms8NcrUF/pYrbuB8
// SIG // pcWU5rOpVG/oKw6cM6Qx7jV4MFQGCisGAQQBgjcCAQwx
// SIG // RjBEoCSAIgBNAGkAbgBlAGMAcgBhAGYAdAAgAEIAZQBk
// SIG // AHIAbwBjAGuhHIAaaHR0cHM6Ly93d3cubWluZWNyYWZ0
// SIG // Lm5ldC8wDQYJKoZIhvcNAQEBBQAEggEAYYKKuA0jXc2j
// SIG // JUCzjh24TrI+9ez1c8hU65CE+mc7U7Y62sxMsQu/sOp8
// SIG // 8ySLbfKMenURCSgEmuYXRsalGUERllwO9cRg2imX0cGw
// SIG // Mb4Co3p3XPNDcDqdVwLH3E91hM7Wt67gJ4BCTv/tbaYA
// SIG // tudE8BN8bnOd/BcgzN0AuBa6dDDqE7gIrROnnuvbDi/1
// SIG // 0cDiJUFc2L8WevCZTzHRULmx2Ez0vchPUQpm1l5sioRv
// SIG // tR53KREIRrmOyn73/aAWffpaKP69BnudL0tRsdw77MHF
// SIG // VS1m/fWID51Rzt4KJH34iXDXaeXSJDHSUJqh03waBOrG
// SIG // tCzbvEJlnzgU1F/sncuz2aGCFwkwghcFBgorBgEEAYI3
// SIG // AwMBMYIW9TCCFvEGCSqGSIb3DQEHAqCCFuIwghbeAgED
// SIG // MQ8wDQYJYIZIAWUDBAIBBQAwggFVBgsqhkiG9w0BCRAB
// SIG // BKCCAUQEggFAMIIBPAIBAQYKKwYBBAGEWQoDATAxMA0G
// SIG // CWCGSAFlAwQCAQUABCAFscOabFY7S4qWuHb3ZLkxeXtZ
// SIG // mCjBSQP2JQbaUhXHlAIGYoTwQW8MGBMyMDIyMDUyNzAw
// SIG // NTAyOS4xNDVaMASAAgH0oIHUpIHRMIHOMQswCQYDVQQG
// SIG // EwJVUzETMBEGA1UECBMKV2FzaGluZ3RvbjEQMA4GA1UE
// SIG // BxMHUmVkbW9uZDEeMBwGA1UEChMVTWljcm9zb2Z0IENv
// SIG // cnBvcmF0aW9uMSkwJwYDVQQLEyBNaWNyb3NvZnQgT3Bl
// SIG // cmF0aW9ucyBQdWVydG8gUmljbzEmMCQGA1UECxMdVGhh
// SIG // bGVzIFRTUyBFU046Rjc3Ri1FMzU2LTVCQUUxJTAjBgNV
// SIG // BAMTHE1pY3Jvc29mdCBUaW1lLVN0YW1wIFNlcnZpY2Wg
// SIG // ghFcMIIHEDCCBPigAwIBAgITMwAAAaqlMZsLy7IIDgAB
// SIG // AAABqjANBgkqhkiG9w0BAQsFADB8MQswCQYDVQQGEwJV
// SIG // UzETMBEGA1UECBMKV2FzaGluZ3RvbjEQMA4GA1UEBxMH
// SIG // UmVkbW9uZDEeMBwGA1UEChMVTWljcm9zb2Z0IENvcnBv
// SIG // cmF0aW9uMSYwJAYDVQQDEx1NaWNyb3NvZnQgVGltZS1T
// SIG // dGFtcCBQQ0EgMjAxMDAeFw0yMjAzMDIxODUxMjZaFw0y
// SIG // MzA1MTExODUxMjZaMIHOMQswCQYDVQQGEwJVUzETMBEG
// SIG // A1UECBMKV2FzaGluZ3RvbjEQMA4GA1UEBxMHUmVkbW9u
// SIG // ZDEeMBwGA1UEChMVTWljcm9zb2Z0IENvcnBvcmF0aW9u
// SIG // MSkwJwYDVQQLEyBNaWNyb3NvZnQgT3BlcmF0aW9ucyBQ
// SIG // dWVydG8gUmljbzEmMCQGA1UECxMdVGhhbGVzIFRTUyBF
// SIG // U046Rjc3Ri1FMzU2LTVCQUUxJTAjBgNVBAMTHE1pY3Jv
// SIG // c29mdCBUaW1lLVN0YW1wIFNlcnZpY2UwggIiMA0GCSqG
// SIG // SIb3DQEBAQUAA4ICDwAwggIKAoICAQCgT+xyudW1h3/h
// SIG // Q0ofTu2Mq0LZDTL3R8x4ms7znSPTzho8iSGK7NVjjJkg
// SIG // qd6P5r7Lj5xUj+XNHQngblKuruid9DPNWWjTj/2m2a08
// SIG // GK2DfjeZ0razhnQrUQbpu+ocu069wGQ1AKy8L4bBpV4S
// SIG // 5Q1NcIqGsTPgVcAjSOy5k2mCqo5ufIRILGLSiB5OfS8z
// SIG // pyOGnp2zywT/1WGIyOmuCiHLp9BGRKwLpLeTwv5ilGjq
// SIG // YVDBmJtD8X6WPQZBubD33MxciHwNdyy0UuLBoW1K3DOe
// SIG // BLxNhZVgUGiaO36yluwlYyEyxF+BNpccEBvzLmftcA2I
// SIG // PTjhK0+Yfus3nI+u3np8MXlKGjhGyrYlMWiVGJ8kCsQl
// SIG // k5DXVkV0ykpiMcdLW7D+Yq1o6l70+rf83iSsNOTWPIT0
// SIG // +er1ttKtA2CtjbXjggw9FA+mTQBS1fOxjpJdHgal3E6B
// SIG // VXXicMDkxOmgOEamKDa9kFDwSFOiRIlBgbPXOKguZgR0
// SIG // 2OOlWkf6HWhQy3MUCODj5J+WpfyD7HfP62g5jHyopOus
// SIG // XDYdqjeMsrWDN7og3p1+anhXcd6XYuN6WABTf0tf91UT
// SIG // ZPvxkVVFGFmAYw2UqsbJYnRPIbMQuyvKi35jaGkNmgLL
// SIG // td4dX2kzEmSBFcaLM9W/ciHl5rTOjZa41d3rcEuyV2MB
// SIG // oRzHVWBC9QIDAQABo4IBNjCCATIwHQYDVR0OBBYEFD+a
// SIG // FLxThy7YX3dFs94RrZ0FRqSeMB8GA1UdIwQYMBaAFJ+n
// SIG // FV0AXmJdg/Tl0mWnG1M1GelyMF8GA1UdHwRYMFYwVKBS
// SIG // oFCGTmh0dHA6Ly93d3cubWljcm9zb2Z0LmNvbS9wa2lv
// SIG // cHMvY3JsL01pY3Jvc29mdCUyMFRpbWUtU3RhbXAlMjBQ
// SIG // Q0ElMjAyMDEwKDEpLmNybDBsBggrBgEFBQcBAQRgMF4w
// SIG // XAYIKwYBBQUHMAKGUGh0dHA6Ly93d3cubWljcm9zb2Z0
// SIG // LmNvbS9wa2lvcHMvY2VydHMvTWljcm9zb2Z0JTIwVGlt
// SIG // ZS1TdGFtcCUyMFBDQSUyMDIwMTAoMSkuY3J0MAwGA1Ud
// SIG // EwEB/wQCMAAwEwYDVR0lBAwwCgYIKwYBBQUHAwgwDQYJ
// SIG // KoZIhvcNAQELBQADggIBAN8MgE2QRRAaIK3MB7OMyO6l
// SIG // 9stI2ygiOmYnhgCEfekYjK42b1ht/WDwPxS9r4RkgrTu
// SIG // 3mt4gZcIYU8iRD3sS7oE+IweFtK5XTiz+WxHNM8MbPTb
// SIG // UxUvFJds2ye48+VsUp4Uh7H2lRVKe0ugdmtW4ypliKP0
// SIG // r3d1tVd5nCGM4W6SyFFZT9wm0yRBPnAt4V/iYIJ0mERE
// SIG // 8qPpiOx8/yjFhWkVgVGCOINAa8IldpWKisnpIzaeq4+2
// SIG // /JejoW4F/yT9G8zcb+oqNGOIjZSM8/z3SIfxNqY96Vz4
// SIG // kCT0ZRJDJLEXnBPFZxcqoUeH2/xenOcsGOPphKbISAIN
// SIG // mFF7MBaqmyvRb/lPGGHJWD74Sv8EWbPv+WriuBTPkE48
// SIG // sI9Aua5q/DM4qplBoALsGUGMh0QqKZ1XZWjv8cUmQn2m
// SIG // Ue8OwdzgRJfI/laKH7NSn6vQJpkAFmTo7eA5zZOTZ8U4
// SIG // T740FbjlP8vh0xK8Kg/8CkQpdACd1D0yfDz2Kfo2xF5C
// SIG // pqBYVOCRnq+Xmo9tp19fabozWSqqmq7eMi4zVDpKlo1Z
// SIG // OCh6XWERnCTFV5CpEAIpY1J/XB0cDbj8/07u2Jn4EV1j
// SIG // eB7wnE9ptUAA4pzmT7Dub+Y/2xMcNFpha1tgrQxAKZwp
// SIG // ZogCnIRa9MUihORE/gMrmy2qXoxDa/b7e0Fzaumj9V1n
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
// SIG // f9lwY1NNje6CbaUFEMFxBmoQtB1VM1izoXBm8qGCAs8w
// SIG // ggI4AgEBMIH8oYHUpIHRMIHOMQswCQYDVQQGEwJVUzET
// SIG // MBEGA1UECBMKV2FzaGluZ3RvbjEQMA4GA1UEBxMHUmVk
// SIG // bW9uZDEeMBwGA1UEChMVTWljcm9zb2Z0IENvcnBvcmF0
// SIG // aW9uMSkwJwYDVQQLEyBNaWNyb3NvZnQgT3BlcmF0aW9u
// SIG // cyBQdWVydG8gUmljbzEmMCQGA1UECxMdVGhhbGVzIFRT
// SIG // UyBFU046Rjc3Ri1FMzU2LTVCQUUxJTAjBgNVBAMTHE1p
// SIG // Y3Jvc29mdCBUaW1lLVN0YW1wIFNlcnZpY2WiIwoBATAH
// SIG // BgUrDgMCGgMVAOBtJtCeHgJZY3D/47zr/f6Zv+vGoIGD
// SIG // MIGApH4wfDELMAkGA1UEBhMCVVMxEzARBgNVBAgTCldh
// SIG // c2hpbmd0b24xEDAOBgNVBAcTB1JlZG1vbmQxHjAcBgNV
// SIG // BAoTFU1pY3Jvc29mdCBDb3Jwb3JhdGlvbjEmMCQGA1UE
// SIG // AxMdTWljcm9zb2Z0IFRpbWUtU3RhbXAgUENBIDIwMTAw
// SIG // DQYJKoZIhvcNAQEFBQACBQDmOfp4MCIYDzIwMjIwNTI2
// SIG // MTcwOTEyWhgPMjAyMjA1MjcxNzA5MTJaMHQwOgYKKwYB
// SIG // BAGEWQoEATEsMCowCgIFAOY5+ngCAQAwBwIBAAICHgMw
// SIG // BwIBAAICEUMwCgIFAOY7S/gCAQAwNgYKKwYBBAGEWQoE
// SIG // AjEoMCYwDAYKKwYBBAGEWQoDAqAKMAgCAQACAwehIKEK
// SIG // MAgCAQACAwGGoDANBgkqhkiG9w0BAQUFAAOBgQAlU+79
// SIG // 5i0hi2bv7mIiI7iK7fDLw3DMZXT5Jhj6IWbpbVYdKs+V
// SIG // 9NUB3yO21YtE/+ziLgjCa6bVN2uQnMoMQpLHjneyyv9Q
// SIG // 3DsKDqSZsja5TJvSnTeZYpGvDxGn2IJ828ZMenW58uXf
// SIG // KXfs4US9HHWxamUMrkEBvknfA+cFzbXMMTGCBA0wggQJ
// SIG // AgEBMIGTMHwxCzAJBgNVBAYTAlVTMRMwEQYDVQQIEwpX
// SIG // YXNoaW5ndG9uMRAwDgYDVQQHEwdSZWRtb25kMR4wHAYD
// SIG // VQQKExVNaWNyb3NvZnQgQ29ycG9yYXRpb24xJjAkBgNV
// SIG // BAMTHU1pY3Jvc29mdCBUaW1lLVN0YW1wIFBDQSAyMDEw
// SIG // AhMzAAABqqUxmwvLsggOAAEAAAGqMA0GCWCGSAFlAwQC
// SIG // AQUAoIIBSjAaBgkqhkiG9w0BCQMxDQYLKoZIhvcNAQkQ
// SIG // AQQwLwYJKoZIhvcNAQkEMSIEIOuXC9I11ApSWdxFARgE
// SIG // 5rRr4oEpLDEjE0avRTn7KejZMIH6BgsqhkiG9w0BCRAC
// SIG // LzGB6jCB5zCB5DCBvQQgVrUCQxxavBHgc9017oAqkYUi
// SIG // PyQmWwE2BCMExvGzHsAwgZgwgYCkfjB8MQswCQYDVQQG
// SIG // EwJVUzETMBEGA1UECBMKV2FzaGluZ3RvbjEQMA4GA1UE
// SIG // BxMHUmVkbW9uZDEeMBwGA1UEChMVTWljcm9zb2Z0IENv
// SIG // cnBvcmF0aW9uMSYwJAYDVQQDEx1NaWNyb3NvZnQgVGlt
// SIG // ZS1TdGFtcCBQQ0EgMjAxMAITMwAAAaqlMZsLy7IIDgAB
// SIG // AAABqjAiBCCCda3v/2iIu4/L9VEpfTqWZjWuVA/VMl0f
// SIG // Zlb2rDUI7jANBgkqhkiG9w0BAQsFAASCAgACrGUByZJ4
// SIG // IuLHBbANKdWd+G/nQhZ8Erau4C/XJTq9q7z6Oaa/SDvQ
// SIG // hI8boRhyGnydEzB5a8hrUO/kj8PvbjCdU0ajQiNb6wO8
// SIG // xXTndxl0QDgp6ssDVbiHh8kxVf6NyRwsx2vghHnDl5/g
// SIG // HmZNVJ/1775xiLDy4MnqBAK6aJeqkINPZgp9ltsZ3GjI
// SIG // L8AVJ9bamfuvrHxYO3GHZl6Aq/mrnspD9VecasRhdhJN
// SIG // BA2D+zrWxLiMUQySj3cXfY/0XjzpeexEy7W7G0mjMonJ
// SIG // uOPdRLK1izzOCQMCmLJBn3fN9oQsHiH8rdeaTmR3yDle
// SIG // usRBhfiQO/EsF3Q91WIzkA1wxyDq7yLQiXOvACJJWU4y
// SIG // l+sXHLJlY54KXfHaBwrsmwvWHgrVFMjpERZGEMiIZ6oI
// SIG // TxYlKrFvYWlsEXNI0aWib0usu+zEy+2385aEb2uHGQJq
// SIG // ei6lLoX+mCKxATBmBd09ZCrcirsW+7VMfFW4bNjzwQvl
// SIG // f/db6NQLszLk2b2txPcqTvNa8ETqNvmXPZ+LT+l/P9GI
// SIG // t4Vz0Fmx607KNV7Bk1zmK4UKDQ54DxVQpIQARRrTN8+G
// SIG // PM6AKpS6aE/Fy+/XkI25E2Mn7SPFe/uWaX5Qyw2x3dM3
// SIG // cnPWdc1Xe6iUyFHX8y2lDe4M98sUq3/Byo382+QWtSio
// SIG // HZoDM4qbau5qpw==
// SIG // End signature block
