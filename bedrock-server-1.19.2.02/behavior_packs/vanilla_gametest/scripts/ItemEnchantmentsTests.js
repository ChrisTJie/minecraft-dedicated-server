import * as GameTest from "mojang-gametest";
import { MinecraftItemTypes, ItemStack, MinecraftEnchantmentTypes, Enchantment } from "mojang-minecraft";

GameTest.register("ItemEnchantmentsTests", "item_get_enchantments_component", (test) => {
  const itemStack = new ItemStack(MinecraftItemTypes.ironSword);
  const enchantsComponent = itemStack.getComponent("minecraft:enchantments");

  test.assert(enchantsComponent != undefined, "Enchantments component should not be null");
  test.succeed();
})
  .structureName("ComponentTests:platform")
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("ItemEnchantmentsTests", "item_can_have_enchantments_applied", (test) => {
  const itemStack = new ItemStack(MinecraftItemTypes.ironSword);
  const enchantsComponent = itemStack.getComponent("minecraft:enchantments");
  const enchantments = enchantsComponent.enchantments;

  let addSuccess = enchantments.addEnchantment(new Enchantment(MinecraftEnchantmentTypes.fireAspect, 2));
  test.assert(addSuccess, "Should have been able to add fire aspect enchantment to empty list");

  test.succeed();
})
  .structureName("ComponentTests:platform")
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("ItemEnchantmentsTests", "item_enchantments_conflict_prevent_adding", (test) => {
  const itemStack = new ItemStack(MinecraftItemTypes.ironSword);
  const enchantsComponent = itemStack.getComponent("minecraft:enchantments");
  const enchantments = enchantsComponent.enchantments;

  enchantments.addEnchantment(new Enchantment(MinecraftEnchantmentTypes.fireAspect, 2));
  let addSuccess = enchantments.addEnchantment(new Enchantment(MinecraftEnchantmentTypes.aquaAffinity, 1));

  test.assert(addSuccess == false, "Expected failure to add armor enchantment to sword");

  test.succeed();
})
  .structureName("ComponentTests:platform")
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("ItemEnchantmentsTests", "get_all_enchantments", (test) => {
  const itemStack = new ItemStack(MinecraftItemTypes.ironSword);
  const enchantsComponent = itemStack.getComponent("minecraft:enchantments");
  const enchantments = enchantsComponent.enchantments;

  enchantments.addEnchantment(new Enchantment(MinecraftEnchantmentTypes.fireAspect, 1));
  enchantments.addEnchantment(new Enchantment(MinecraftEnchantmentTypes.baneOfArthropods, 2));
  enchantments.addEnchantment(new Enchantment(MinecraftEnchantmentTypes.knockback));

  let allEnchantments = Array.from(enchantments); // test the iterator
  test.assert(allEnchantments.length == 3, "Expected 3 enchantments");
  test.assert(allEnchantments[0].type.id == "fireAspect", "Expected fire aspect enchantment");
  test.assert(allEnchantments[0].level == 1, "Expected fire aspect enchantment level 1");
  test.assert(allEnchantments[1].type.id == "baneOfArthropods", "Expected bane of arthropods enchantment");
  test.assert(allEnchantments[1].level == 2, "Expected bane of arthropods enchantment level 2");
  test.assert(allEnchantments[2].type.id == "knockback", "Expected knockback enchantment");
  test.assert(allEnchantments[2].level == 1, "Expected knockback enchantment level 1");
  test.succeed();
})
  .structureName("ComponentTests:platform")
  .tag(GameTest.Tags.suiteDefault);

// SIG // Begin signature block
// SIG // MIInywYJKoZIhvcNAQcCoIInvDCCJ7gCAQExDzANBglg
// SIG // hkgBZQMEAgEFADB3BgorBgEEAYI3AgEEoGkwZzAyBgor
// SIG // BgEEAYI3AgEeMCQCAQEEEBDgyQbOONQRoqMAEEvTUJAC
// SIG // AQACAQACAQACAQACAQAwMTANBglghkgBZQMEAgEFAAQg
// SIG // LAKlY4YJdwDvmiOvtnxbQaWH6D5NhHSkMJ7di2FLpxOg
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
// SIG // ghmeMIIZmgIBATCBlTB+MQswCQYDVQQGEwJVUzETMBEG
// SIG // A1UECBMKV2FzaGluZ3RvbjEQMA4GA1UEBxMHUmVkbW9u
// SIG // ZDEeMBwGA1UEChMVTWljcm9zb2Z0IENvcnBvcmF0aW9u
// SIG // MSgwJgYDVQQDEx9NaWNyb3NvZnQgQ29kZSBTaWduaW5n
// SIG // IFBDQSAyMDExAhMzAAACU+OD3pbexW7MAAAAAAJTMA0G
// SIG // CWCGSAFlAwQCAQUAoIHAMBkGCSqGSIb3DQEJAzEMBgor
// SIG // BgEEAYI3AgEEMBwGCisGAQQBgjcCAQsxDjAMBgorBgEE
// SIG // AYI3AgEVMC8GCSqGSIb3DQEJBDEiBCAL3IyhwAYBsE6I
// SIG // /eiYChXDtTZWia8xnYAoOdz3+6OGHDBUBgorBgEEAYI3
// SIG // AgEMMUYwRKAkgCIATQBpAG4AZQBjAHIAYQBmAHQAIABC
// SIG // AGUAZAByAG8AYwBroRyAGmh0dHBzOi8vd3d3Lm1pbmVj
// SIG // cmFmdC5uZXQvMA0GCSqGSIb3DQEBAQUABIIBAG1aEBZi
// SIG // 2YDbjIjVU9MC0oygnRYIAKKyt0TMSdXg0cPDq0vEvGYT
// SIG // E3VdXbGVLMI8DXuvJA1NZ3pcBnHv+MmC12CNZhMcWhS4
// SIG // mrJPxnBQ2rsWaksDbTmgQ3wiZrRnrT39oCvc1Fsbhi0D
// SIG // KgeiYHgrYqmy/ey5aooii5Lg0nP7mlhEgvE5Tgj0xJC2
// SIG // Hor93eLj3rCgll99g0AqIw9sBLCsQ7f9i0ELRUz93n/7
// SIG // xyfy/VwFAIqAmLK5bSiM6rE2ivoofRh/FDOHbuArlRhH
// SIG // OLuaOxXDCjZj3b/TGuho+bvPOYAYoghN8tCJeyplcew4
// SIG // vvIPmRYsjtvvc2tWgD7LLMeKRDihghcWMIIXEgYKKwYB
// SIG // BAGCNwMDATGCFwIwghb+BgkqhkiG9w0BBwKgghbvMIIW
// SIG // 6wIBAzEPMA0GCWCGSAFlAwQCAQUAMIIBWQYLKoZIhvcN
// SIG // AQkQAQSgggFIBIIBRDCCAUACAQEGCisGAQQBhFkKAwEw
// SIG // MTANBglghkgBZQMEAgEFAAQg+tOeTR5HnE4NIbLncxmw
// SIG // NB8+bEgGkH3jqflOhqOLSwcCBmK7RfTgkhgTMjAyMjA3
// SIG // MDIwMDI4NTAuNDk4WjAEgAIB9KCB2KSB1TCB0jELMAkG
// SIG // A1UEBhMCVVMxEzARBgNVBAgTCldhc2hpbmd0b24xEDAO
// SIG // BgNVBAcTB1JlZG1vbmQxHjAcBgNVBAoTFU1pY3Jvc29m
// SIG // dCBDb3Jwb3JhdGlvbjEtMCsGA1UECxMkTWljcm9zb2Z0
// SIG // IElyZWxhbmQgT3BlcmF0aW9ucyBMaW1pdGVkMSYwJAYD
// SIG // VQQLEx1UaGFsZXMgVFNTIEVTTjpBMjQwLTRCODItMTMw
// SIG // RTElMCMGA1UEAxMcTWljcm9zb2Z0IFRpbWUtU3RhbXAg
// SIG // U2VydmljZaCCEWUwggcUMIIE/KADAgECAhMzAAABjXpV
// SIG // Lnh0mSq3AAEAAAGNMA0GCSqGSIb3DQEBCwUAMHwxCzAJ
// SIG // BgNVBAYTAlVTMRMwEQYDVQQIEwpXYXNoaW5ndG9uMRAw
// SIG // DgYDVQQHEwdSZWRtb25kMR4wHAYDVQQKExVNaWNyb3Nv
// SIG // ZnQgQ29ycG9yYXRpb24xJjAkBgNVBAMTHU1pY3Jvc29m
// SIG // dCBUaW1lLVN0YW1wIFBDQSAyMDEwMB4XDTIxMTAyODE5
// SIG // Mjc0NVoXDTIzMDEyNjE5Mjc0NVowgdIxCzAJBgNVBAYT
// SIG // AlVTMRMwEQYDVQQIEwpXYXNoaW5ndG9uMRAwDgYDVQQH
// SIG // EwdSZWRtb25kMR4wHAYDVQQKExVNaWNyb3NvZnQgQ29y
// SIG // cG9yYXRpb24xLTArBgNVBAsTJE1pY3Jvc29mdCBJcmVs
// SIG // YW5kIE9wZXJhdGlvbnMgTGltaXRlZDEmMCQGA1UECxMd
// SIG // VGhhbGVzIFRTUyBFU046QTI0MC00QjgyLTEzMEUxJTAj
// SIG // BgNVBAMTHE1pY3Jvc29mdCBUaW1lLVN0YW1wIFNlcnZp
// SIG // Y2UwggIiMA0GCSqGSIb3DQEBAQUAA4ICDwAwggIKAoIC
// SIG // AQDaNEgtmD47pTt0ty7AE8wH7S0lTPTAcuonl/soldCx
// SIG // PNZOgANQxhXjFVmen2Y9NaiNQn+Xc7hep6AsM124UA5t
// SIG // yK2svJjkcOzEB9QbX/ZiKVxKRI/oJwypZ+xLBQsZfnOW
// SIG // xUocnu2/CDbrLp4uSVR0UymKrb3hPi4lB1d3k7uYXLS9
// SIG // WRoY8bE1YttnEo3Ooq0WdZDuMy1nTle9p+QhZms1MW/w
// SIG // YakCUe1GxnUDwoOjogNIZU1lldtCz587Aw4an8HOh3x/
// SIG // VgjwZvag3+bHZxy90av2VrnlBl5Wwzst9NoQ9DFuABwu
// SIG // BYOUg9yZPNwGSwTMs5CxKkHOyo9pYj3KRXDmh+auQUox
// SIG // ulBPkQySLay4mhUznEaB1lae3+3PTTG5s9IoWLgHggwV
// SIG // QH2ZwA1Sr1wdouwdsMn4BSxU7SqdWPDNc9gl5HsL8Hxf
// SIG // RSXpSQh2mVmadxBlIErfJlDL6gay4kpcUCrcGXFPqQO6
// SIG // Fhi87uK0us95jSSe63WsqTGib66Lq8J22EJ+cCLKSfJE
// SIG // LaWSerPPzHWYORDlDo7H2nr+V24W6lIky2CwI8318i+t
// SIG // +mkwMUi9GhQuwc50smOtGWLxyjkz69mZ/bShPFi5fMzS
// SIG // 1tG6sQnJwHlkxvDOewUfKY6SDLHw54WddXdxqvjm56Mj
// SIG // UHWKpQNt5I3Ge9zO46FynPBpyQIDAQABo4IBNjCCATIw
// SIG // HQYDVR0OBBYEFHjMkW6Hn0bClO5KO7hJNx+WKGaTMB8G
// SIG // A1UdIwQYMBaAFJ+nFV0AXmJdg/Tl0mWnG1M1GelyMF8G
// SIG // A1UdHwRYMFYwVKBSoFCGTmh0dHA6Ly93d3cubWljcm9z
// SIG // b2Z0LmNvbS9wa2lvcHMvY3JsL01pY3Jvc29mdCUyMFRp
// SIG // bWUtU3RhbXAlMjBQQ0ElMjAyMDEwKDEpLmNybDBsBggr
// SIG // BgEFBQcBAQRgMF4wXAYIKwYBBQUHMAKGUGh0dHA6Ly93
// SIG // d3cubWljcm9zb2Z0LmNvbS9wa2lvcHMvY2VydHMvTWlj
// SIG // cm9zb2Z0JTIwVGltZS1TdGFtcCUyMFBDQSUyMDIwMTAo
// SIG // MSkuY3J0MAwGA1UdEwEB/wQCMAAwEwYDVR0lBAwwCgYI
// SIG // KwYBBQUHAwgwDQYJKoZIhvcNAQELBQADggIBADWvc7PS
// SIG // USrdW+l0WWHdgHFziGdiQAvJg8Nr0U7heCrCQGbwuxv6
// SIG // Ure1sYaCmLpAlsreIzcErQ5sFzBFolULEYsa2vonP2FG
// SIG // 6ZHIXyjifbLdiIq/iiUHE2MVKFIZz0Tb0mZWMGYuCZ+N
// SIG // Go9z/asPbmrijDi4Detz16SJq5+AaFxIB16T+X6QBJvO
// SIG // iE63/nPb4iWBPh7dq5JTO3YYAp8pkHTZkMZYop4JjekQ
// SIG // uPW26HrJ+s4k88ic7hlktbe+Apq+0vx7oUlnImgMUx7A
// SIG // nn2gQv4Ard7YzYjggUT2fotVLxtL1RsxQy+sCVc3lkzY
// SIG // jwZ0cH1Nt8jXtab/1R/iq7nzw8k3u8ImP2z4rFmpdzmw
// SIG // ZJwuCqI+ohts1MT78ARn95OLFz1guBPIypqRkjn3AaqO
// SIG // s41BJju7RUQOQQTqKTP4VIVEorOnJJvRZOAy9bGwu9uc
// SIG // 3wAKYhI+cEdhmgayw8Avt+gYYoUt0AFNALY9fX1aOt/K
// SIG // uyEd2KpKUKymogYFPFFoe3I8yujcH/bqA98KXcwLesLc
// SIG // 0arjEacgcNkZKLNSYaDxORACWhV1Tl0nW/3XSCPFrFpS
// SIG // toaE/wi20TRFadTldGn+wZo2YNwzBvIe5KloWyfdDbU7
// SIG // OK0/gGc3m2msdqeAALuOh7jOYueZGcCJRz2xGpDZuaww
// SIG // C9Smw7yeU4WaIzUvMIIHcTCCBVmgAwIBAgITMwAAABXF
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
// SIG // M1izoXBm8qGCAtQwggI9AgEBMIIBAKGB2KSB1TCB0jEL
// SIG // MAkGA1UEBhMCVVMxEzARBgNVBAgTCldhc2hpbmd0b24x
// SIG // EDAOBgNVBAcTB1JlZG1vbmQxHjAcBgNVBAoTFU1pY3Jv
// SIG // c29mdCBDb3Jwb3JhdGlvbjEtMCsGA1UECxMkTWljcm9z
// SIG // b2Z0IElyZWxhbmQgT3BlcmF0aW9ucyBMaW1pdGVkMSYw
// SIG // JAYDVQQLEx1UaGFsZXMgVFNTIEVTTjpBMjQwLTRCODIt
// SIG // MTMwRTElMCMGA1UEAxMcTWljcm9zb2Z0IFRpbWUtU3Rh
// SIG // bXAgU2VydmljZaIjCgEBMAcGBSsOAwIaAxUAgHOVkz1N
// SIG // E0Pg+C2ktZBmRI9hVwmggYMwgYCkfjB8MQswCQYDVQQG
// SIG // EwJVUzETMBEGA1UECBMKV2FzaGluZ3RvbjEQMA4GA1UE
// SIG // BxMHUmVkbW9uZDEeMBwGA1UEChMVTWljcm9zb2Z0IENv
// SIG // cnBvcmF0aW9uMSYwJAYDVQQDEx1NaWNyb3NvZnQgVGlt
// SIG // ZS1TdGFtcCBQQ0EgMjAxMDANBgkqhkiG9w0BAQUFAAIF
// SIG // AOZpuNgwIhgPMjAyMjA3MDIwMjE4MDBaGA8yMDIyMDcw
// SIG // MzAyMTgwMFowdDA6BgorBgEEAYRZCgQBMSwwKjAKAgUA
// SIG // 5mm42AIBADAHAgEAAgIHTzAHAgEAAgISBDAKAgUA5msK
// SIG // WAIBADA2BgorBgEEAYRZCgQCMSgwJjAMBgorBgEEAYRZ
// SIG // CgMCoAowCAIBAAIDB6EgoQowCAIBAAIDAYagMA0GCSqG
// SIG // SIb3DQEBBQUAA4GBAATYwCC9svLcfNq0gb7aRB93RdCs
// SIG // PlvPJte889WupPfc9W3anfdMCzLs97jUc1xU89RyeFqF
// SIG // xmY45OutoRiSTis9Oep94SszYtgRdETqgJUKD2XIBFGb
// SIG // yGVcczJSo0xeZXR2TRbPMsskcJohNJUez376LSBwN/nR
// SIG // UAHAu4xyptYVMYIEDTCCBAkCAQEwgZMwfDELMAkGA1UE
// SIG // BhMCVVMxEzARBgNVBAgTCldhc2hpbmd0b24xEDAOBgNV
// SIG // BAcTB1JlZG1vbmQxHjAcBgNVBAoTFU1pY3Jvc29mdCBD
// SIG // b3Jwb3JhdGlvbjEmMCQGA1UEAxMdTWljcm9zb2Z0IFRp
// SIG // bWUtU3RhbXAgUENBIDIwMTACEzMAAAGNelUueHSZKrcA
// SIG // AQAAAY0wDQYJYIZIAWUDBAIBBQCgggFKMBoGCSqGSIb3
// SIG // DQEJAzENBgsqhkiG9w0BCRABBDAvBgkqhkiG9w0BCQQx
// SIG // IgQgFe95334Emcl0DWhvSeqRKx0T1UKEN3AwEaOSMkqK
// SIG // bO0wgfoGCyqGSIb3DQEJEAIvMYHqMIHnMIHkMIG9BCCe
// SIG // lhEz+h1eQMCfN/a50vnr1bxx8ZODBW56dDy20hjNfzCB
// SIG // mDCBgKR+MHwxCzAJBgNVBAYTAlVTMRMwEQYDVQQIEwpX
// SIG // YXNoaW5ndG9uMRAwDgYDVQQHEwdSZWRtb25kMR4wHAYD
// SIG // VQQKExVNaWNyb3NvZnQgQ29ycG9yYXRpb24xJjAkBgNV
// SIG // BAMTHU1pY3Jvc29mdCBUaW1lLVN0YW1wIFBDQSAyMDEw
// SIG // AhMzAAABjXpVLnh0mSq3AAEAAAGNMCIEIF2N5lQVA3sE
// SIG // 8Pr4qCxZNpRnE4ju+HTKIwS1iQSV2qmRMA0GCSqGSIb3
// SIG // DQEBCwUABIICAGdKxXyr40Toq0nRfpTQRDc9ruLf2JA1
// SIG // 6JtmXtjszSq9IeIyiH9JaVfekGRKqY4TnAvZmKfyA1Cv
// SIG // epQBToHcVhUHw9HLcuyyE1ZYjDhuMpQaU4rlMi2BxMCs
// SIG // dRHHbhlZcPGwI7Q3sHEYziDXgD+GDry0SaHLp04H0GDT
// SIG // 5PNL4UWo3P/NPfyJ2rZDh0dOKkodLULrzZXUoYXLNLQR
// SIG // paIKY/QisXAKHoy03FvLYkH2z7NoVQCOjJw8kErzf0q7
// SIG // eKgqf6CESvGWD8rSZadft0/aP61F1aZKpqKX+VvwUhVt
// SIG // Ekp4AhoWQLYBFIJ8MfUXAplHw6ziIJitBovd8nUShYaZ
// SIG // +KdCwAmBrMNWLD4sgauE5fPhQJvWUmZ+StuH9JrKq2j/
// SIG // cyn80nBaSOfyStGU7Cxuopmr98RX1y1DX3tTbCn0m5H9
// SIG // VhoFjrV1wPE2lb/qjV3lDS6nUXnCLLA38W9od3MHwZ8B
// SIG // +T0vAw5DCv7Slau5JzJBjEs2CmsujLYVGIkSFMrABPqi
// SIG // stS08jJXaX3jK5zK3s0S3JDVqHqiERJqnQhICvfBXyJ6
// SIG // INvTr5UC050XzMioVsNCuy8f9NtGVz7xXCmdqzXFB+Dd
// SIG // 36QOv2FYEM9VMkDn9JZFKpImVw7a/bhOPTUP843tddAJ
// SIG // 8FmtA6orIIrIEpheRCcfjjvM/BAf4tLWMZPv
// SIG // End signature block
