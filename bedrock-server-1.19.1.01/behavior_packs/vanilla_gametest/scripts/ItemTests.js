import * as GameTest from "mojang-gametest";
import {
  BlockLocation,
  MinecraftBlockTypes,
  Direction,
  MinecraftItemTypes,
  ItemStack,
  Location,
  world,
} from "mojang-minecraft";
import GameTestExtensions from "./GameTestExtensions.js";

function giveItem(player, itemType, amount, slot) {
  const inventoryContainer = player.getComponent("inventory").container;
  inventoryContainer.addItem(new ItemStack(itemType, amount ?? 1));
  player.selectedSlot = slot ?? 0;
}

GameTest.register("ItemTests", "item_use_event", (test) => {
  const player = test.spawnSimulatedPlayer(new BlockLocation(1, 2, 1));

  const blaze = test.spawn("blaze", new BlockLocation(1, 2, 3));
  test.assert(blaze != undefined, "Failed to initialize Blaze");
  const blazeHealth = blaze.getComponent("health");
  let initialHealth = blazeHealth.current;

  const snowball = new ItemStack(MinecraftItemTypes.snowball, 1);

  let eventReceived = false;
  const eventSubscription = world.events.itemUse.subscribe((eventData) => {
    if (eventData.source != player) {
      return;
    }
    eventReceived = true;
  });

  test
    .startSequence()
    .thenExecuteAfter(5, () => {
      player.useItem(snowball);
    })
    .thenExecuteAfter(5, () => {
      world.events.itemUse.unsubscribe(eventSubscription);

      let afterUseHealth = blazeHealth.current;
      blaze.kill();

      test.assert(eventReceived, "Should have received itemUse event");

      test.assert(
        afterUseHealth < initialHealth,
        `Blaze was not hurt after snowball throw should have been cancelled: before-> ${initialHealth} after-> ${afterUseHealth}`
      );
    })
    .thenSucceed();
})
  .structureName("SimulatedPlayerTests:use_item")
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("ItemTests", "item_use_event_cancelled", (test) => {
  const player = test.spawnSimulatedPlayer(new BlockLocation(0, 2, 0));

  const snowball = new ItemStack(MinecraftItemTypes.snowball, 1);

  let eventReceived = false;
  let beforeEventReceived = false;

  const beforeEventSubscription = world.events.beforeItemUse.subscribe((eventData) => {
    if (eventData.source != player) {
      return;
    }
    beforeEventReceived = true;
    eventData.cancel = true;
  });

  const eventSubscription = world.events.itemUse.subscribe((eventData) => {
    if (eventData.source != player) {
      return;
    }
    eventReceived = true;
  });

  test
    .startSequence()
    .thenIdle(5)
    .thenExecute(() => {
      player.useItem(snowball);
    })
    .thenExecuteAfter(5, () => {
      world.events.beforeItemUse.unsubscribe(beforeEventSubscription);
      world.events.itemUse.unsubscribe(eventSubscription);

      test.assert(beforeEventReceived, "Should have received beforeItemUse event");
      test.assert(eventReceived == false, "Should not have received itemUse event");
    })
    .thenSucceed();
})
  .structureName("ComponentTests:platform")
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("ItemTests", "item_use_event_cancelled_stops_action", (test) => {
  const player = test.spawnSimulatedPlayer(new BlockLocation(1, 2, 1));

  const blaze = test.spawn("blaze", new BlockLocation(1, 2, 3));
  test.assert(blaze != undefined, "Failed to initialize Blaze");
  const blazeHealth = blaze.getComponent("health");
  let initialHealth = blazeHealth.current;

  const slot = 0;
  const snowballCount = 10;
  const inventoryContainer = player.getComponent("inventory").container;

  giveItem(player, MinecraftItemTypes.snowball, snowballCount, slot);

  let eventReceived = false;
  let beforeEventReceived = false;

  const beforeEventSubscription = world.events.beforeItemUse.subscribe((eventData) => {
    if (eventData.source != player) {
      return;
    }
    beforeEventReceived = true;
    eventData.cancel = true;
  });

  const eventSubscription = world.events.itemUse.subscribe((eventData) => {
    if (eventData.source != player) {
      return;
    }
    eventReceived = true;
  });

  test
    .startSequence()
    .thenIdle(5)
    .thenExecute(() => {
      player.useItemInSlot(slot);
    })
    .thenExecuteAfter(5, () => {
      world.events.beforeItemUse.unsubscribe(beforeEventSubscription);
      world.events.itemUse.unsubscribe(eventSubscription);

      let afterUseHealth = blazeHealth.current;
      blaze.kill();

      test.assert(beforeEventReceived, "Should have received beforeItemUse event");
      test.assert(eventReceived == false, "Should not have received itemUse event");

      let actualAmount = inventoryContainer.getItem(slot).amount;
      test.assert(
        actualAmount === snowballCount,
        `Player should have ${snowballCount} snowballs but has ${actualAmount}`
      );

      test.assert(
        afterUseHealth === initialHealth,
        `Blaze was hurt after snowball throw should have been cancelled: before-> ${initialHealth} after-> ${afterUseHealth}`
      );
    })
    .thenSucceed();
})
  .structureName("SimulatedPlayerTests:use_item")
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("ItemTests", "item_use_on_event", (test) => {
  const player = test.spawnSimulatedPlayer(new BlockLocation(0, 2, 0));
  const dirtLoc = new BlockLocation(2, 1, 1);
  const dirt = new ItemStack(MinecraftItemTypes.dirt);

  let eventReceived = false;
  const eventSubscription = world.events.itemUseOn.subscribe((eventData) => {
    if (eventData.source != player) {
      return;
    }
    eventReceived = true;
  });

  test
    .startSequence()
    .thenExecuteAfter(5, () => {
      player.useItemOnBlock(dirt, dirtLoc, Direction.up);
    })
    .thenExecuteAfter(5, () => {
      world.events.itemUseOn.unsubscribe(eventSubscription);
      test.assert(eventReceived, "Should have received itemUseOn event");
    })
    .thenSucceed();
})
  .structureName("ComponentTests:platform")
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("ItemTests", "item_use_on_event_cancelled_stops_action", (test) => {
  const player = test.spawnSimulatedPlayer(new BlockLocation(0, 2, 0));
  const dirtLoc = new BlockLocation(2, 1, 1);
  const dirt = new ItemStack(MinecraftItemTypes.dirt);

  const beforeEventSubscription = world.events.beforeItemUseOn.subscribe((eventData) => {
    if (eventData.source != player) {
      return;
    }
    eventData.cancel = true;
  });

  test
    .startSequence()
    .thenExecuteAfter(5, () => {
      player.useItemOnBlock(dirt, dirtLoc, Direction.up);
    })
    .thenExecuteAfter(5, () => {
      world.events.beforeItemUseOn.unsubscribe(beforeEventSubscription);
      test.assertBlockPresent(MinecraftBlockTypes.dirt, dirtLoc.above(), false);
    })
    .thenSucceed();
})
  .structureName("ComponentTests:platform")
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("ItemTests", "item_cooldown_component_is_not_null", (test) => {
  const appleItem = new ItemStack(MinecraftItemTypes.apple);
  const itemCooldownComponent = appleItem.getComponent("minecraft:cooldown");
  test.assert(itemCooldownComponent !== undefined, "ItemCooldownComponent should never be null");
  test.succeed();
})
  .structureName("ComponentTests:platform")
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("ItemTests", "item_cooldown_component_apple_has_default_values", (test) => {
  const appleItem = new ItemStack(MinecraftItemTypes.apple);
  const itemCooldownComponent = appleItem.getComponent("minecraft:cooldown");
  test.assert(itemCooldownComponent.cooldownCategory === "", "Apple should have empty cooldown category");
  test.assert(itemCooldownComponent.cooldownTicks === 0, "Apple should have no cooldown");
  test.succeed();
})
  .structureName("ComponentTests:platform")
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("ItemTests", "item_cooldown_component_enderpearl_has_cooldown_values", (test) => {
  const enderPearlItem = new ItemStack(MinecraftItemTypes.enderPearl);
  const itemCooldownComponent = enderPearlItem.getComponent("minecraft:cooldown");
  test.assert(
    itemCooldownComponent.cooldownCategory === "ender_pearl",
    "Ender Pearl should have ender_pearl cooldown category"
  );
  test.assert(itemCooldownComponent.cooldownTicks === 20, "Ender Pearl should have cooldown of 20 ticks");
  test.succeed();
})
  .structureName("ComponentTests:platform")
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("ItemTests", "item_cooldown_component_start_cooldown", (test) => {
  const player = test.spawnSimulatedPlayer(new BlockLocation(0, 2, 0));
  const enderPearlItem = new ItemStack(MinecraftItemTypes.enderPearl);
  const itemCooldownComponent = enderPearlItem.getComponent("minecraft:cooldown");

  itemCooldownComponent.startCooldown(player);

  test.assert(player.getItemCooldown("ender_pearl") === 20, "Player should have ender_pearl cooldown of 20 ticks");
  test.succeed();
})
  .structureName("ComponentTests:platform")
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("ItemTests", "player_startitemcooldown_has_enderpearl_cooldown", (test) => {
  const player = test.spawnSimulatedPlayer(new BlockLocation(0, 2, 0));

  player.startItemCooldown("ender_pearl", 20);

  test.assert(player.getItemCooldown("ender_pearl") === 20, "Player should have ender_pearl cooldown of 20 ticks");
  test.succeed();
})
  .structureName("ComponentTests:platform")
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("ItemTests", "before_item_use_event_modifies_inventory_item", (test) => {
  const testEx = new GameTestExtensions(test);
  const player = test.spawnSimulatedPlayer(new BlockLocation(1, 2, 1));

  const beforeItemUseCallback = world.events.beforeItemUse.subscribe((itemUseEvent) => {
    itemUseEvent.item.setLore(["Lore"]);
  });

  testEx.giveItem(player, MinecraftItemTypes.diamondSword);
  player.useItemInSlot(0);
  const sword = player.getComponent("inventory").container.getItem(0);
  test.assert(sword.getLore()[0] === "Lore", "Lore should have been added to sword");

  world.events.beforeItemUse.unsubscribe(beforeItemUseCallback);
  test.succeed();
})
  .structureName("ComponentTests:platform")
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("ItemTests", "before_item_use_on_event_modifies_inventory_item", (test) => {
  const testEx = new GameTestExtensions(test);
  const player = test.spawnSimulatedPlayer(new BlockLocation(1, 2, 1));

  const beforeItemUseOnCallback = world.events.beforeItemUseOn.subscribe((itemUseEvent) => {
    itemUseEvent.item.setLore(["Lore"]);
  });

  testEx.giveItem(player, MinecraftItemTypes.planks, 16);
  player.useItemInSlotOnBlock(0, new BlockLocation(1, 2, 2));
  const planks = player.getComponent("inventory").container.getItem(0);
  test.assert(planks.getLore()[0] === "Lore", "Lore should have been added to planks");

  world.events.beforeItemUse.unsubscribe(beforeItemUseOnCallback);
  test.succeed();
})
  .structureName("ComponentTests:platform")
  .tag(GameTest.Tags.suiteDefault);

GameTest.registerAsync("ItemTests", "item_using_events_fire_correctly", async (test) => {
  const player = test.spawnSimulatedPlayer(new BlockLocation(1, 2, 1));

  let startedCharge = false, completedCharge = false, stoppedCharge = false;

  let itemStartCharge = world.events.itemStartCharge.subscribe((eventData) => {
    if(eventData.source !== player) {
      return;
    }
    if(startedCharge) {
      test.fail("world.events.itemStartCharge should only have been invoked once");
    }
    if(stoppedCharge || completedCharge) {
      test.fail("world.events.itemStartCharge called out of order");
    }
    startedCharge = true;
  });
  
  let itemCompleteCharge = world.events.itemCompleteCharge.subscribe((eventData) => {
    if(eventData.source !== player) {
      return;
    }
    if(completedCharge) {
      test.fail("world.events.itemCompleteCharge should only have been invoked once");
    }
    if(startedCharge == false || stoppedCharge) {
      test.fail("world.events.itemCompleteCharge called out of order");
    }
    completedCharge = true;
  });
    
  let itemStopCharge = world.events.itemStopCharge.subscribe((eventData) => {
    if(eventData.source !== player) {
      return;
    }
    if(stoppedCharge) {
      test.fail("world.events.itemStopCharge should only have been invoked once");
    }
    if(startedCharge == false || completedCharge == false) {
      test.fail("world.events.itemStopCharge called out of order");
    }
    stoppedCharge = true;
  });

  player.giveItem(new ItemStack(MinecraftItemTypes.potion, 1), true);

  await test.idle(5);

  player.useItemInSlot(player.selectedSlot);

  await test.idle(20 * 5); //5 seconds

  test.assert(startedCharge, "Item should have fired started charge event");
  test.assert(completedCharge, "Item should have fired completed charge event");
  test.assert(stoppedCharge, "Item should have fired stopped charge event");

  world.events.itemStartCharge.unsubscribe(itemStartCharge);
  world.events.itemCompleteCharge.unsubscribe(itemCompleteCharge);
  world.events.itemStopCharge.unsubscribe(itemStopCharge);

  test.succeed();
})
  .maxTicks(300)
  .structureName("ComponentTests:platform")
  .tag(GameTest.Tags.suiteDefault);


// SIG // Begin signature block
// SIG // MIInugYJKoZIhvcNAQcCoIInqzCCJ6cCAQExDzANBglg
// SIG // hkgBZQMEAgEFADB3BgorBgEEAYI3AgEEoGkwZzAyBgor
// SIG // BgEEAYI3AgEeMCQCAQEEEBDgyQbOONQRoqMAEEvTUJAC
// SIG // AQACAQACAQACAQACAQAwMTANBglghkgBZQMEAgEFAAQg
// SIG // BhiFSmOhb8nuFq2IV8ybKqVTh1lgcRCEF+VHkaC4L5Wg
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
// SIG // ARUwLwYJKoZIhvcNAQkEMSIEIFccGjw/QN0fl9Ic12Rg
// SIG // AWJbTOEyQ11n+rIzt1OXR1I5MFQGCisGAQQBgjcCAQwx
// SIG // RjBEoCSAIgBNAGkAbgBlAGMAcgBhAGYAdAAgAEIAZQBk
// SIG // AHIAbwBjAGuhHIAaaHR0cHM6Ly93d3cubWluZWNyYWZ0
// SIG // Lm5ldC8wDQYJKoZIhvcNAQEBBQAEggEAImBU/xjsCy9f
// SIG // N/iwYspnvaynd72uUQAk6N6jd/AetfmQ3bAamyANLDH3
// SIG // QRKdNZ6MKC1MdSzIGPONYRuiwxrKjAR+TPxZiinM9tqI
// SIG // PqnYZLYgdz231fW7qocGQBlJsg5qdiYBpIYvFYQRtCCj
// SIG // 7j41DpM6wI3SkKKDmErPwmO7IwdQHBZ3RauqpSz2h2Ue
// SIG // HNeSOJEZ2HkBIGzty6miEDRgRBkdDwou6rHSt1JZQDjP
// SIG // dLhyUPKce7NyFZWbEZBnJtn7nP86ciL5KaRvodCvVI/J
// SIG // Rst9PNENbjHTfm+b/LDPBcO0c51bH8QuqC7PlDEviQkw
// SIG // JIDP74evVOpg4EtP1NY35aGCFwkwghcFBgorBgEEAYI3
// SIG // AwMBMYIW9TCCFvEGCSqGSIb3DQEHAqCCFuIwghbeAgED
// SIG // MQ8wDQYJYIZIAWUDBAIBBQAwggFVBgsqhkiG9w0BCRAB
// SIG // BKCCAUQEggFAMIIBPAIBAQYKKwYBBAGEWQoDATAxMA0G
// SIG // CWCGSAFlAwQCAQUABCBFqVnfxA1YP+cMX8ESHGwzgToZ
// SIG // JIjYOf2yXIj7YbZJfAIGYoTJfozkGBMyMDIyMDUyNzAw
// SIG // NTAyOC44MzZaMASAAgH0oIHUpIHRMIHOMQswCQYDVQQG
// SIG // EwJVUzETMBEGA1UECBMKV2FzaGluZ3RvbjEQMA4GA1UE
// SIG // BxMHUmVkbW9uZDEeMBwGA1UEChMVTWljcm9zb2Z0IENv
// SIG // cnBvcmF0aW9uMSkwJwYDVQQLEyBNaWNyb3NvZnQgT3Bl
// SIG // cmF0aW9ucyBQdWVydG8gUmljbzEmMCQGA1UECxMdVGhh
// SIG // bGVzIFRTUyBFU046RjdBNi1FMjUxLTE1MEExJTAjBgNV
// SIG // BAMTHE1pY3Jvc29mdCBUaW1lLVN0YW1wIFNlcnZpY2Wg
// SIG // ghFcMIIHEDCCBPigAwIBAgITMwAAAaUA3gjEQAdxTgAB
// SIG // AAABpTANBgkqhkiG9w0BAQsFADB8MQswCQYDVQQGEwJV
// SIG // UzETMBEGA1UECBMKV2FzaGluZ3RvbjEQMA4GA1UEBxMH
// SIG // UmVkbW9uZDEeMBwGA1UEChMVTWljcm9zb2Z0IENvcnBv
// SIG // cmF0aW9uMSYwJAYDVQQDEx1NaWNyb3NvZnQgVGltZS1T
// SIG // dGFtcCBQQ0EgMjAxMDAeFw0yMjAzMDIxODUxMTlaFw0y
// SIG // MzA1MTExODUxMTlaMIHOMQswCQYDVQQGEwJVUzETMBEG
// SIG // A1UECBMKV2FzaGluZ3RvbjEQMA4GA1UEBxMHUmVkbW9u
// SIG // ZDEeMBwGA1UEChMVTWljcm9zb2Z0IENvcnBvcmF0aW9u
// SIG // MSkwJwYDVQQLEyBNaWNyb3NvZnQgT3BlcmF0aW9ucyBQ
// SIG // dWVydG8gUmljbzEmMCQGA1UECxMdVGhhbGVzIFRTUyBF
// SIG // U046RjdBNi1FMjUxLTE1MEExJTAjBgNVBAMTHE1pY3Jv
// SIG // c29mdCBUaW1lLVN0YW1wIFNlcnZpY2UwggIiMA0GCSqG
// SIG // SIb3DQEBAQUAA4ICDwAwggIKAoICAQC6sYboIGpIvMLq
// SIG // DjDHe67BEJ5gIbVfIlNWNIrbB6t9E3QlyQ5r2Y2mfMrz
// SIG // h2BVYU8g9W+SRibcGY1s9X4JQqrMeagcT9VsdQmZ7ENb
// SIG // YkbEVkHNdlZBE5pGPMeOjIB7BsgJoTz6bIEZ5JRmoux6
// SIG // kBQd9cf0I5Me62wJa+j25QeLTpmkdZysZeFSILLQ8H53
// SIG // imqBBMOIjf8U3c7WY8MhomOYTaem3nrZHIs4CRTt/8kR
// SIG // 2IdILZPm0RIa5iIG2q664G8+zLJwO7ZSrxnDvYh3Ovtr
// SIG // MpqwFctws0OCDDTxXE08fME2fpKb+pRbNXhvMZX7LtjQ
// SIG // 1irIazJSh9iaWM1gFtXwjg+Yq17BOCzr4sWUL253kBOv
// SIG // ohnyEMGm4/n0XaLgFNgIhPomjbCA2qXSmm/Fi8c+lT0W
// SIG // xC/jOjBZHLKIrihx6LIQqeyYZmfYjNMqxMdl3mzoWv10
// SIG // N+NirERrNodNoKV+sAcsk/Hg9zCVSMUkZuDCyIpb1nKX
// SIG // fTd66KGsGy1OoHZO4KClkuvfsNo7aLlwhGLeiD32avJX
// SIG // YtC/wsGG7b+5mx5iGfTnNCRCXOm/YHFQ36D4npjCnM9e
// SIG // QS3qcse56UNjIgyiLHDqioV7mSPj2XqzTh4Yv77MtvxY
// SIG // /ZQepCazGEn1dBdn67wUgVzAe8Y7/KYKl+UF1HvJ08W+
// SIG // FHydHAwLwQIDAQABo4IBNjCCATIwHQYDVR0OBBYEFF+m
// SIG // jwMAl66urXDu+9xZF0toqRrfMB8GA1UdIwQYMBaAFJ+n
// SIG // FV0AXmJdg/Tl0mWnG1M1GelyMF8GA1UdHwRYMFYwVKBS
// SIG // oFCGTmh0dHA6Ly93d3cubWljcm9zb2Z0LmNvbS9wa2lv
// SIG // cHMvY3JsL01pY3Jvc29mdCUyMFRpbWUtU3RhbXAlMjBQ
// SIG // Q0ElMjAyMDEwKDEpLmNybDBsBggrBgEFBQcBAQRgMF4w
// SIG // XAYIKwYBBQUHMAKGUGh0dHA6Ly93d3cubWljcm9zb2Z0
// SIG // LmNvbS9wa2lvcHMvY2VydHMvTWljcm9zb2Z0JTIwVGlt
// SIG // ZS1TdGFtcCUyMFBDQSUyMDIwMTAoMSkuY3J0MAwGA1Ud
// SIG // EwEB/wQCMAAwEwYDVR0lBAwwCgYIKwYBBQUHAwgwDQYJ
// SIG // KoZIhvcNAQELBQADggIBAJabCxflMDCihEdqdFiZ6OBu
// SIG // hhhp34N6ow3Wh3Obr12LRuiph66gH/2Kh5JjaLUq+mRB
// SIG // J5RgiWEe1t7ifuW6b49N8Bahnn70LCiEdvquk686M7z+
// SIG // DbKHVk0+UlafwukxAxriwvZjkCgOLci+NB01u7cW9HAH
// SIG // X4J8hxaCPwbGaPxWl3s0PITuMVI4Q6cjTXielmL1+TQv
// SIG // h7/Z5k8s46shIPy9nFwDpsRFr3zwENZX8b67VMBu+Yxn
// SIG // lGnsJIcLc2pwpz95emI8CRSgep+/017a34pNcWNZIHr9
// SIG // ScEOWlHT8cEnQ5hhOF0zdrOqTzovCDtffTn+gBL4eNXg
// SIG // 8Uc/tdVVHKbhp+7SVHkk1Eh7L80PBAjo+cO+zL+efxfI
// SIG // VrtO3oJxvEq1o+fkxcTTwqcfwBTb88/qHU0U2XeC1rqJ
// SIG // nDB1JixYlBjgHXrRekqHxxuRHBZ9A0w9WqQWcwj/MbBk
// SIG // HGYMFaqO6L9t/7iCZTAiwMk2GVfSEwj9PXIlCWygVQkD
// SIG // axhJ0P1yxTvZsrMsg0a7x4VObhj3V8+Cbdv2TeyUGEbl
// SIG // TUrgqTcKCtCa9bOnIg7xxHi8onM8aCHvRh90sn2x8er/
// SIG // 6YSPohNw1qNUwiu+RC+qbepOYt+v5J9rklV3Ux+OGVZI
// SIG // d/4oVd7xMLO/Lhpb7IjHKygYKaNx3XIwx4h6FrFH+BiM
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
// SIG // UyBFU046RjdBNi1FMjUxLTE1MEExJTAjBgNVBAMTHE1p
// SIG // Y3Jvc29mdCBUaW1lLVN0YW1wIFNlcnZpY2WiIwoBATAH
// SIG // BgUrDgMCGgMVALPJcNtFs5sQyojdS4Ye5mVl7rSooIGD
// SIG // MIGApH4wfDELMAkGA1UEBhMCVVMxEzARBgNVBAgTCldh
// SIG // c2hpbmd0b24xEDAOBgNVBAcTB1JlZG1vbmQxHjAcBgNV
// SIG // BAoTFU1pY3Jvc29mdCBDb3Jwb3JhdGlvbjEmMCQGA1UE
// SIG // AxMdTWljcm9zb2Z0IFRpbWUtU3RhbXAgUENBIDIwMTAw
// SIG // DQYJKoZIhvcNAQEFBQACBQDmOnxzMCIYDzIwMjIwNTI3
// SIG // MDIyMzQ3WhgPMjAyMjA1MjgwMjIzNDdaMHQwOgYKKwYB
// SIG // BAGEWQoEATEsMCowCgIFAOY6fHMCAQAwBwIBAAICCV8w
// SIG // BwIBAAICEaswCgIFAOY7zfMCAQAwNgYKKwYBBAGEWQoE
// SIG // AjEoMCYwDAYKKwYBBAGEWQoDAqAKMAgCAQACAwehIKEK
// SIG // MAgCAQACAwGGoDANBgkqhkiG9w0BAQUFAAOBgQBLzyjm
// SIG // nFuA5X/Sp6MaQxm7LbeHbEIy3SSpQ51jHpUDKjsYjJ1+
// SIG // R/IJyG/PloOfM7Det9DyLrmJWBWkRh88ZbNnvLTlvDm6
// SIG // tMhFxUnl2ATqJrjpnY781AmE7JtveewgBDF6VZkAUrN1
// SIG // lMi0WQcHbeTJjCPUbd3cKVYQPv0TsB8F/zGCBA0wggQJ
// SIG // AgEBMIGTMHwxCzAJBgNVBAYTAlVTMRMwEQYDVQQIEwpX
// SIG // YXNoaW5ndG9uMRAwDgYDVQQHEwdSZWRtb25kMR4wHAYD
// SIG // VQQKExVNaWNyb3NvZnQgQ29ycG9yYXRpb24xJjAkBgNV
// SIG // BAMTHU1pY3Jvc29mdCBUaW1lLVN0YW1wIFBDQSAyMDEw
// SIG // AhMzAAABpQDeCMRAB3FOAAEAAAGlMA0GCWCGSAFlAwQC
// SIG // AQUAoIIBSjAaBgkqhkiG9w0BCQMxDQYLKoZIhvcNAQkQ
// SIG // AQQwLwYJKoZIhvcNAQkEMSIEILaldXZRe2pDanByBg8l
// SIG // looM3iKL1cE8iTVVQAvJpB+1MIH6BgsqhkiG9w0BCRAC
// SIG // LzGB6jCB5zCB5DCBvQQguAo4cX5mBLGgrdgFPNyoYfui
// SIG // R5cpNwe9L3zBzJQS3FwwgZgwgYCkfjB8MQswCQYDVQQG
// SIG // EwJVUzETMBEGA1UECBMKV2FzaGluZ3RvbjEQMA4GA1UE
// SIG // BxMHUmVkbW9uZDEeMBwGA1UEChMVTWljcm9zb2Z0IENv
// SIG // cnBvcmF0aW9uMSYwJAYDVQQDEx1NaWNyb3NvZnQgVGlt
// SIG // ZS1TdGFtcCBQQ0EgMjAxMAITMwAAAaUA3gjEQAdxTgAB
// SIG // AAABpTAiBCCtHVEcCGSR7y72PPDVrjo2vccyNA1Hm5VS
// SIG // ooxEBkOPJzANBgkqhkiG9w0BAQsFAASCAgCgNrZG3y32
// SIG // bGhDHkAQwdXLdnZS2I7T7zbIP0ml+pVlKfSmIUEEGWC/
// SIG // vvDHmTz1p/hXVwIamScSewtnSuMqnfgPTxu5S3BmnpMo
// SIG // DmoCRoVWkwrNR4nluKTfGU4PJd/16SrARwZy3lDkuoPP
// SIG // tgVa4c3fGjSTwDcWu+0NAVPfXKz5jbSnx8e3CPtb1IZc
// SIG // tZ1gP1HoGl7dJhyBYZ/1BDRINgClp9W5273KD1d21R4G
// SIG // bcGigcWk0s2XquRFcRgZU+BoShxvYF53Ie+2oB02XDo2
// SIG // Q+WM/RKS7ADboi0jWUTB1n8yycWuOZDxQGJSm8HLm1Ra
// SIG // HkM0p94zGDJ2K5gGUr1MaJWOQGgDPUQh5JUIvD9BGM7r
// SIG // wqsQxn6lQsKlKqkxu8ZW3qoTnOAx06F/cwDjOHJkWqVe
// SIG // p9cVOQtq4WusUXwySfyP8sf64q5fN/KYj0zEe12+YBZb
// SIG // 8MjAGmLmmpqrjyMDuzob3Eei0R6u+mGNPeHrwX1zIs5z
// SIG // a6EMQr2OMT0oivfnAAJTF0ZRMsdR1Ajb7rTMPo39iYJv
// SIG // YNIM8JkHrjbiGRXW7qP+iAC5+JOGfXJBzJjntDrdt5yV
// SIG // FswMWsabDfWoKn+NXgQaNy/DpWat/LM+ZQe0UKQfgBoq
// SIG // BuIIm/ElJzzpi+gstpzVzBXPQfac92rJUYDEHp/knt5R
// SIG // ymQLi7aP37/peg==
// SIG // End signature block
