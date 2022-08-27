import * as GameTest from "mojang-gametest";
import {
  BlockLocation,
  MinecraftBlockTypes,
  Direction,
  MinecraftItemTypes,
  ItemStack,
  world
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
// SIG // MIInxgYJKoZIhvcNAQcCoIIntzCCJ7MCAQExDzANBglg
// SIG // hkgBZQMEAgEFADB3BgorBgEEAYI3AgEEoGkwZzAyBgor
// SIG // BgEEAYI3AgEeMCQCAQEEEBDgyQbOONQRoqMAEEvTUJAC
// SIG // AQACAQACAQACAQACAQAwMTANBglghkgBZQMEAgEFAAQg
// SIG // 23/GTUvUx4q9SizxGs4bQ+P67yL3XGvgWG0q17ByQMCg
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
// SIG // SEXAQsmbdlsKgEhr/Xmfwb1tbWrJUnMTDXpQzTGCGZ0w
// SIG // ghmZAgEBMIGVMH4xCzAJBgNVBAYTAlVTMRMwEQYDVQQI
// SIG // EwpXYXNoaW5ndG9uMRAwDgYDVQQHEwdSZWRtb25kMR4w
// SIG // HAYDVQQKExVNaWNyb3NvZnQgQ29ycG9yYXRpb24xKDAm
// SIG // BgNVBAMTH01pY3Jvc29mdCBDb2RlIFNpZ25pbmcgUENB
// SIG // IDIwMTECEzMAAALMjrWWpr3RyU4AAAAAAswwDQYJYIZI
// SIG // AWUDBAIBBQCggcAwGQYJKoZIhvcNAQkDMQwGCisGAQQB
// SIG // gjcCAQQwHAYKKwYBBAGCNwIBCzEOMAwGCisGAQQBgjcC
// SIG // ARUwLwYJKoZIhvcNAQkEMSIEIKZhekSmRpYEeF7Y1j8o
// SIG // cB9skmICTX8VsP0ztNxAANaFMFQGCisGAQQBgjcCAQwx
// SIG // RjBEoCSAIgBNAGkAbgBlAGMAcgBhAGYAdAAgAEIAZQBk
// SIG // AHIAbwBjAGuhHIAaaHR0cHM6Ly93d3cubWluZWNyYWZ0
// SIG // Lm5ldC8wDQYJKoZIhvcNAQEBBQAEggEAfvlBbiZiq4L9
// SIG // vNZYCUFrk2zMrKTt1YRuThWlZ+iOTZhTld/DerA1irVf
// SIG // RgtTaAl8TI8jxJ2dj6O8wLVZ5wa5ff9Ozu3iRW0W2i4K
// SIG // z+INlFSA91YMAOZLoD6e95m0kZgABFsXZ2cThEkhkJ0g
// SIG // emE3Tk3+qNAbASPUfTQe/8abA7KO9Li+10vWkSykX+F5
// SIG // Zb7mlJWWHNrCwJOR8R9d8UNc4wIubkOuZjyTiO3IidoA
// SIG // O5GBh//kqMNvUUhQe15QhjnfSuK4oI5P/935LPqOT9Z2
// SIG // GKIaPo4a9zRqV1LW67HXW2z8wA02GDDQp4SoKMphsQaG
// SIG // URHR+mQ0wdUCEb7NlAB/7qGCFxUwghcRBgorBgEEAYI3
// SIG // AwMBMYIXATCCFv0GCSqGSIb3DQEHAqCCFu4wghbqAgED
// SIG // MQ8wDQYJYIZIAWUDBAIBBQAwggFYBgsqhkiG9w0BCRAB
// SIG // BKCCAUcEggFDMIIBPwIBAQYKKwYBBAGEWQoDATAxMA0G
// SIG // CWCGSAFlAwQCAQUABCBMbNYSucQyZFdjiu/zZqoxLodj
// SIG // Oa+lQXGoLhi2LyIyUAIGYt52ZF6tGBIyMDIyMDgxODAw
// SIG // MTkzNi42M1owBIACAfSggdikgdUwgdIxCzAJBgNVBAYT
// SIG // AlVTMRMwEQYDVQQIEwpXYXNoaW5ndG9uMRAwDgYDVQQH
// SIG // EwdSZWRtb25kMR4wHAYDVQQKExVNaWNyb3NvZnQgQ29y
// SIG // cG9yYXRpb24xLTArBgNVBAsTJE1pY3Jvc29mdCBJcmVs
// SIG // YW5kIE9wZXJhdGlvbnMgTGltaXRlZDEmMCQGA1UECxMd
// SIG // VGhhbGVzIFRTUyBFU046QTI0MC00QjgyLTEzMEUxJTAj
// SIG // BgNVBAMTHE1pY3Jvc29mdCBUaW1lLVN0YW1wIFNlcnZp
// SIG // Y2WgghFlMIIHFDCCBPygAwIBAgITMwAAAY16VS54dJkq
// SIG // twABAAABjTANBgkqhkiG9w0BAQsFADB8MQswCQYDVQQG
// SIG // EwJVUzETMBEGA1UECBMKV2FzaGluZ3RvbjEQMA4GA1UE
// SIG // BxMHUmVkbW9uZDEeMBwGA1UEChMVTWljcm9zb2Z0IENv
// SIG // cnBvcmF0aW9uMSYwJAYDVQQDEx1NaWNyb3NvZnQgVGlt
// SIG // ZS1TdGFtcCBQQ0EgMjAxMDAeFw0yMTEwMjgxOTI3NDVa
// SIG // Fw0yMzAxMjYxOTI3NDVaMIHSMQswCQYDVQQGEwJVUzET
// SIG // MBEGA1UECBMKV2FzaGluZ3RvbjEQMA4GA1UEBxMHUmVk
// SIG // bW9uZDEeMBwGA1UEChMVTWljcm9zb2Z0IENvcnBvcmF0
// SIG // aW9uMS0wKwYDVQQLEyRNaWNyb3NvZnQgSXJlbGFuZCBP
// SIG // cGVyYXRpb25zIExpbWl0ZWQxJjAkBgNVBAsTHVRoYWxl
// SIG // cyBUU1MgRVNOOkEyNDAtNEI4Mi0xMzBFMSUwIwYDVQQD
// SIG // ExxNaWNyb3NvZnQgVGltZS1TdGFtcCBTZXJ2aWNlMIIC
// SIG // IjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKCAgEA2jRI
// SIG // LZg+O6U7dLcuwBPMB+0tJUz0wHLqJ5f7KJXQsTzWToAD
// SIG // UMYV4xVZnp9mPTWojUJ/l3O4XqegLDNduFAObcitrLyY
// SIG // 5HDsxAfUG1/2YilcSkSP6CcMqWfsSwULGX5zlsVKHJ7t
// SIG // vwg26y6eLklUdFMpiq294T4uJQdXd5O7mFy0vVkaGPGx
// SIG // NWLbZxKNzqKtFnWQ7jMtZ05XvafkIWZrNTFv8GGpAlHt
// SIG // RsZ1A8KDo6IDSGVNZZXbQs+fOwMOGp/Bzod8f1YI8Gb2
// SIG // oN/mx2ccvdGr9la55QZeVsM7LfTaEPQxbgAcLgWDlIPc
// SIG // mTzcBksEzLOQsSpBzsqPaWI9ykVw5ofmrkFKMbpQT5EM
// SIG // ki2suJoVM5xGgdZWnt/tz00xubPSKFi4B4IMFUB9mcAN
// SIG // Uq9cHaLsHbDJ+AUsVO0qnVjwzXPYJeR7C/B8X0Ul6UkI
// SIG // dplZmncQZSBK3yZQy+oGsuJKXFAq3BlxT6kDuhYYvO7i
// SIG // tLrPeY0knut1rKkxom+ui6vCdthCfnAiyknyRC2lknqz
// SIG // z8x1mDkQ5Q6Ox9p6/lduFupSJMtgsCPN9fIvrfppMDFI
// SIG // vRoULsHOdLJjrRli8co5M+vZmf20oTxYuXzM0tbRurEJ
// SIG // ycB5ZMbwznsFHymOkgyx8OeFnXV3car45uejI1B1iqUD
// SIG // beSNxnvczuOhcpzwackCAwEAAaOCATYwggEyMB0GA1Ud
// SIG // DgQWBBR4zJFuh59GwpTuSju4STcflihmkzAfBgNVHSME
// SIG // GDAWgBSfpxVdAF5iXYP05dJlpxtTNRnpcjBfBgNVHR8E
// SIG // WDBWMFSgUqBQhk5odHRwOi8vd3d3Lm1pY3Jvc29mdC5j
// SIG // b20vcGtpb3BzL2NybC9NaWNyb3NvZnQlMjBUaW1lLVN0
// SIG // YW1wJTIwUENBJTIwMjAxMCgxKS5jcmwwbAYIKwYBBQUH
// SIG // AQEEYDBeMFwGCCsGAQUFBzAChlBodHRwOi8vd3d3Lm1p
// SIG // Y3Jvc29mdC5jb20vcGtpb3BzL2NlcnRzL01pY3Jvc29m
// SIG // dCUyMFRpbWUtU3RhbXAlMjBQQ0ElMjAyMDEwKDEpLmNy
// SIG // dDAMBgNVHRMBAf8EAjAAMBMGA1UdJQQMMAoGCCsGAQUF
// SIG // BwMIMA0GCSqGSIb3DQEBCwUAA4ICAQA1r3Oz0lEq3Vvp
// SIG // dFlh3YBxc4hnYkALyYPDa9FO4XgqwkBm8Lsb+lK3tbGG
// SIG // gpi6QJbK3iM3BK0ObBcwRaJVCxGLGtr6Jz9hRumRyF8o
// SIG // 4n2y3YiKv4olBxNjFShSGc9E29JmVjBmLgmfjRqPc/2r
// SIG // D25q4ow4uA3rc9ekiaufgGhcSAdek/l+kASbzohOt/5z
// SIG // 2+IlgT4e3auSUzt2GAKfKZB02ZDGWKKeCY3pELj1tuh6
// SIG // yfrOJPPInO4ZZLW3vgKavtL8e6FJZyJoDFMewJ59oEL+
// SIG // AK3e2M2I4IFE9n6LVS8bS9UbMUMvrAlXN5ZM2I8GdHB9
// SIG // TbfI17Wm/9Uf4qu588PJN7vCJj9s+KxZqXc5sGScLgqi
// SIG // PqIbbNTE+/AEZ/eTixc9YLgTyMqakZI59wGqjrONQSY7
// SIG // u0VEDkEE6ikz+FSFRKKzpySb0WTgMvWxsLvbnN8ACmIS
// SIG // PnBHYZoGssPAL7foGGKFLdABTQC2PX19WjrfyrshHdiq
// SIG // SlCspqIGBTxRaHtyPMro3B/26gPfCl3MC3rC3NGq4xGn
// SIG // IHDZGSizUmGg8TkQAloVdU5dJ1v910gjxaxaUraGhP8I
// SIG // ttE0RWnU5XRp/sGaNmDcMwbyHuSpaFsn3Q21OzitP4Bn
// SIG // N5tprHangAC7joe4zmLnmRnAiUc9sRqQ2bmsMAvUpsO8
// SIG // nlOFmiM1LzCCB3EwggVZoAMCAQICEzMAAAAVxedrngKb
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
// SIG // ZvKhggLUMIICPQIBATCCAQChgdikgdUwgdIxCzAJBgNV
// SIG // BAYTAlVTMRMwEQYDVQQIEwpXYXNoaW5ndG9uMRAwDgYD
// SIG // VQQHEwdSZWRtb25kMR4wHAYDVQQKExVNaWNyb3NvZnQg
// SIG // Q29ycG9yYXRpb24xLTArBgNVBAsTJE1pY3Jvc29mdCBJ
// SIG // cmVsYW5kIE9wZXJhdGlvbnMgTGltaXRlZDEmMCQGA1UE
// SIG // CxMdVGhhbGVzIFRTUyBFU046QTI0MC00QjgyLTEzMEUx
// SIG // JTAjBgNVBAMTHE1pY3Jvc29mdCBUaW1lLVN0YW1wIFNl
// SIG // cnZpY2WiIwoBATAHBgUrDgMCGgMVAIBzlZM9TRND4Pgt
// SIG // pLWQZkSPYVcJoIGDMIGApH4wfDELMAkGA1UEBhMCVVMx
// SIG // EzARBgNVBAgTCldhc2hpbmd0b24xEDAOBgNVBAcTB1Jl
// SIG // ZG1vbmQxHjAcBgNVBAoTFU1pY3Jvc29mdCBDb3Jwb3Jh
// SIG // dGlvbjEmMCQGA1UEAxMdTWljcm9zb2Z0IFRpbWUtU3Rh
// SIG // bXAgUENBIDIwMTAwDQYJKoZIhvcNAQEFBQACBQDmp+7p
// SIG // MCIYDzIwMjIwODE4MDY0OTEzWhgPMjAyMjA4MTkwNjQ5
// SIG // MTNaMHQwOgYKKwYBBAGEWQoEATEsMCowCgIFAOan7ukC
// SIG // AQAwBwIBAAICIlcwBwIBAAICEVYwCgIFAOapQGkCAQAw
// SIG // NgYKKwYBBAGEWQoEAjEoMCYwDAYKKwYBBAGEWQoDAqAK
// SIG // MAgCAQACAwehIKEKMAgCAQACAwGGoDANBgkqhkiG9w0B
// SIG // AQUFAAOBgQAci8V28bAVv13Bf6E9g5YxJFRPq+QuDlBA
// SIG // g2KESjusRdCyHazwtnGF4OI0WuFjzswVot6ne8HgyouT
// SIG // Sm+d4SK8rKHz2CbHezugy9Ql3q8N6VlYJyiXUk0+Dzk4
// SIG // 3gDY2TjF29WEhtIK7p4yDvZzHt6JV6NVvzcWwAmVH+Mq
// SIG // 34FgHDGCBA0wggQJAgEBMIGTMHwxCzAJBgNVBAYTAlVT
// SIG // MRMwEQYDVQQIEwpXYXNoaW5ndG9uMRAwDgYDVQQHEwdS
// SIG // ZWRtb25kMR4wHAYDVQQKExVNaWNyb3NvZnQgQ29ycG9y
// SIG // YXRpb24xJjAkBgNVBAMTHU1pY3Jvc29mdCBUaW1lLVN0
// SIG // YW1wIFBDQSAyMDEwAhMzAAABjXpVLnh0mSq3AAEAAAGN
// SIG // MA0GCWCGSAFlAwQCAQUAoIIBSjAaBgkqhkiG9w0BCQMx
// SIG // DQYLKoZIhvcNAQkQAQQwLwYJKoZIhvcNAQkEMSIEIPLW
// SIG // jillYjMZusTTrw6gOg9JydVik6X3/2YxYwGkZ3JYMIH6
// SIG // BgsqhkiG9w0BCRACLzGB6jCB5zCB5DCBvQQgnpYRM/od
// SIG // XkDAnzf2udL569W8cfGTgwVuenQ8ttIYzX8wgZgwgYCk
// SIG // fjB8MQswCQYDVQQGEwJVUzETMBEGA1UECBMKV2FzaGlu
// SIG // Z3RvbjEQMA4GA1UEBxMHUmVkbW9uZDEeMBwGA1UEChMV
// SIG // TWljcm9zb2Z0IENvcnBvcmF0aW9uMSYwJAYDVQQDEx1N
// SIG // aWNyb3NvZnQgVGltZS1TdGFtcCBQQ0EgMjAxMAITMwAA
// SIG // AY16VS54dJkqtwABAAABjTAiBCD1XY0nsJXkfmxtCHs/
// SIG // o1pL/oSIMdwZtwIPZKIsTANl4DANBgkqhkiG9w0BAQsF
// SIG // AASCAgDRLsMhOuFLcHQFeBVqs5S6xAh+N/vVMvdRLCUU
// SIG // b1uzKffk9izu23BVt+effHYerzzotxjwi3Q6pMl4HqUh
// SIG // 4+15czRz+BmDXF0EMNVNt8J14atHer+IEcODggN3NVof
// SIG // vqd6uH9dt1Yy+yL78t0JgF/Y+gs6wE539TJzmfPJw7Sz
// SIG // oXzmbwRHJt+7X56/pMYGTkd9penvtqrLxTLBnjpWPio+
// SIG // Lkf882IjhGp+BUoPzSJdNVZT5pYV5JVuE97c9AO6592G
// SIG // sEvjIvgViVLGUtelL0dm/+qnhi1iqkFaanpJRCQ2oadi
// SIG // LVbNU8PzthchJMNlCTl9jrYefjAnaEboessG7ou+egmO
// SIG // Xy8w5u4OvOynvd554pjEbNDADl2MGsaeqNAvLm+KarHj
// SIG // sWd2qZx6hC5Z3WpTj0PM0sz6mlM6uH+QlMOIE9ZLX60S
// SIG // qD8PZ6K+YNgZcUAGV7jS92SZLL67vdLiRs3cO3y/kk6+
// SIG // U8RXyFWvhBEpQSDjTOxWHHC71VNZ3Y1niAGHz3dgxlvb
// SIG // LmLHJCF1o+oNXaE4NyaN9TRvQpgoclr5I7pTVGkF0vw/
// SIG // IAhlKQTzDn8J8AA6COFRpoze+N4mnmGCQxkknkDYmloh
// SIG // wGzeHTubG6DCgh7cQ+ThG2q8PneCaK/jXtjlQbbF2VR/
// SIG // /qPAXyS5epn2dAldb+Sup5EOTOWwAw==
// SIG // End signature block
