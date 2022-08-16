import * as GameTest from "mojang-gametest";
import { BlockLocation, Location, MinecraftItemTypes, ItemStack } from "mojang-minecraft";

function isNear(n1, n2) {
  return Math.abs(n1 - n2) < 0.01;
}

GameTest.register("ComponentTests", "color_component", (test) => {
  const sheep = test.spawn("minecraft:sheep", new BlockLocation(1, 2, 1));
  let counter = 0;
  test.succeedWhen(() => {
    const colorComponent = sheep.getComponent("minecraft:color");
    const color = colorComponent.value;
    if (++counter < 48) {
      colorComponent.value = (color + 1) % 16;
      throw "Disco sheep!";
    } else {
      colorComponent.value = 10;
      test.assert(colorComponent.value === 10, "Unexpected color value");
    }
  });
})
  .maxTicks(50)
  .structureName("ComponentTests:animal_pen")
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("ComponentTests", "get_component_on_dead_entity", (test) => {
  const horse = test.spawn("minecraft:horse", new BlockLocation(1, 2, 1));
  horse.kill();
  test.runAfterDelay(40, () => {
    try {
      // This should throw since the entity is dead
      horse.getComponent("minecraft:tamemount").setTamed();
      test.fail();
    } catch (e) {
      test.succeed();
    }
  });
})
  .structureName("ComponentTests:animal_pen")
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("ComponentTests", "is_saddled_component", (test) => {
  const pig = test.spawn("minecraft:pig<minecraft:ageable_grow_up>", new BlockLocation(1, 2, 1));
  // TODO: Give saddle to pig
  test.succeedWhen(() => {
    const isSaddled = pig.getComponent("minecraft:is_saddled") !== undefined;
    test.assert(isSaddled, "Expected pig to be saddled");
  });
}).tag(GameTest.Tags.suiteDisabled); // No API to give saddle to pig

GameTest.register("ComponentTests", "get_components", (test) => {
  const horse = test.spawn("minecraft:horse<minecraft:ageable_grow_up>", new BlockLocation(1, 2, 1));
  test.print("---Start Components---");
  for (const component of horse.getComponents()) {
    test.print(component.id);
  }
  test.print("---End Components---");
  test.succeed();
}).structureName("ComponentTests:animal_pen");

GameTest.register("ComponentTests", "leashable_component", (test) => {
  const pig1 = test.spawn("minecraft:pig<minecraft:ageable_grow_up>", new BlockLocation(1, 2, 1));
  const pig2 = test.spawn("minecraft:pig<minecraft:ageable_grow_up>", new BlockLocation(3, 2, 1));
  const leashableComp = pig1.getComponent("leashable");
  test.assert(leashableComp !== undefined, "Expected leashable component");
  test.assert(leashableComp.softDistance === 4, "Unexpected softDistance");
  leashableComp.leash(pig2);
  test.runAtTickTime(20, () => {
    leashableComp.unleash();
  });
  test.succeedWhen(() => {
    test.assertEntityPresentInArea("minecraft:item", true); // Make sure the lead dropped
  });
}).tag(GameTest.Tags.suiteDefault);

GameTest.register("ComponentTests", "health_component", (test) => {
  const sheepId = "minecraft:sheep<minecraft:ageable_grow_up>";
  const sheepPos = new BlockLocation(4, 2, 2);
  const sheep = test.spawn(sheepId, sheepPos);
  test.assertEntityInstancePresent(sheep, sheepPos);
  test.pullLever(new BlockLocation(2, 3, 2));

  const healthComponent = sheep.getComponent("minecraft:health");
  test.assert(healthComponent !== undefined, "Expected health component");

  test.succeedWhen(() => {
    test.assert(healthComponent.current === 0, "Unexpected health");
  });
})
  .maxTicks(200)
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("ComponentTests", "rideable_component", (test) => {
  const pig = test.spawn("minecraft:pig<minecraft:ageable_grow_up>", new BlockLocation(1, 2, 1));
  const boat = test.spawn("minecraft:boat", new BlockLocation(3, 2, 1));
  const skeletonHorse = test.spawn("minecraft:skeleton_horse<minecraft:ageable_grow_up>", new BlockLocation(5, 2, 1));

  const boatRideableComp = boat.getComponent("minecraft:rideable");
  test.assert(boatRideableComp !== undefined, "Expected rideable component");

  test.assert(boatRideableComp.seatCount === 2, "Unexpected seatCount");
  test.assert(boatRideableComp.crouchingSkipInteract, "Unexpected crouchingSkipInteract");
  test.assert(boatRideableComp.interactText === "action.interact.ride.boat", "Unexpected interactText");
  test.assert(boatRideableComp.familyTypes.length == 0, "Unexpected familyTypes");
  test.assert(boatRideableComp.controllingSeat === 0, "Unexpected controllingSeat");
  test.assert(boatRideableComp.pullInEntities, "Unexpected pullInEntities");
  test.assert(!boatRideableComp.riderCanInteract, "Unexpected riderCanInteract");

  test.assert(boatRideableComp.seats[0].minRiderCount === 0, "Unexpected minRiderCount");
  test.assert(boatRideableComp.seats[0].maxRiderCount === 1, "Unexpected maxRiderCount");
  test.assert(boatRideableComp.seats[0].lockRiderRotation === 90, "Unexpected lockRiderRotation");

  const skeletonHorseRideableComp = skeletonHorse.getComponent("minecraft:rideable");
  test.assert(skeletonHorseRideableComp !== undefined, "Expected rideable component");

  test
    .startSequence()
    .thenIdle(20)
    .thenExecute(() => boatRideableComp.addRider(pig))
    .thenIdle(20)
    .thenExecute(() => boatRideableComp.ejectRider(pig))
    .thenIdle(20)
    .thenExecute(() => boatRideableComp.addRider(skeletonHorse))
    .thenExecute(() => boatRideableComp.addRider(pig))
    .thenIdle(20)
    .thenExecute(() => boatRideableComp.ejectRiders())
    .thenSucceed();
}).tag(GameTest.Tags.suiteDefault);

GameTest.register("ComponentTests", "tameable_component", (test) => {
  const wolf = test.spawn("minecraft:wolf", new BlockLocation(1, 2, 1));
  const tameableComp = wolf.getComponent("minecraft:tameable");
  test.assert(tameableComp !== undefined, "Expected tameable component");
  test.assert(isNear(tameableComp.probability, 0.333), "Unexpected probability");
  test.assert(tameableComp.tameItems[0] === "minecraft:bone", "Unexpected tameItems");
  tameableComp.tame(/*player*/); // TODO: Provide an owner
  test.succeed();
})
  .structureName("ComponentTests:glass_cage")
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("ComponentTests", "healable_component", (test) => {
  const parrot = test.spawn("minecraft:parrot", new BlockLocation(1, 2, 1));
  const healableComp = parrot.getComponent("minecraft:healable");
  test.assert(healableComp !== undefined, "Expected healable component");
  test.assert(healableComp.forceUse, "Unexpected forceUse");
  test.assert(healableComp.filters !== undefined, "Expected filters");
  const feedItem = healableComp.items[0];
  test.assert(feedItem.item === "minecraft:cookie", "Unexpected feedItem item");
  test.assert(feedItem.healAmount === 0, "Unexpected feedItem healAmount");
  const effect = feedItem.effects[0];
  test.assert(effect.amplifier === 0, "Unexpected effect amplifier");
  test.assert(effect.chance === 1, "Unexpected effect chance");
  test.assert(effect.duration === 20000, "Unexpected effect duration");
  test.assert(effect.name === "potion.poison", "Unexpected effect name");
  test.succeed();
})
  .structureName("ComponentTests:glass_cage")
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("ComponentTests", "movement_component", (test) => {
  const pig = test.spawn("minecraft:pig<minecraft:ageable_grow_up>", new BlockLocation(1, 2, 1));
  const movementComp = pig.getComponent("minecraft:movement");
  test.assert(movementComp !== undefined, "Expected movement component");
  test.succeed();
})
  .structureName("ComponentTests:animal_pen")
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("ComponentTests", "flying_speed_component", (test) => {
  const bee = test.spawn("bee", new BlockLocation(1, 2, 1));
  const flyingSpeedComp = bee.getComponent("flying_speed");
  test.assert(flyingSpeedComp !== undefined, "Expected flying_speed component");
  test.assert(isNear(flyingSpeedComp.value, 0.15), "Unexpected value");
  test.succeed();
})
  .structureName("ComponentTests:glass_cage")
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("ComponentTests", "movement_amphibious_component", (test) => {
  const turtle = test.spawn("turtle", new BlockLocation(1, 2, 1));
  const amphibiousComp = turtle.getComponent("movement.amphibious");
  test.assert(amphibiousComp !== undefined, "Expected movement.amphibious component");
  test.assert(amphibiousComp.maxTurn === 5, "Unexpected maxTurn");
  test.succeed();
})
  .structureName("ComponentTests:animal_pen")
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("ComponentTests", "movement_basic_component", (test) => {
  const chicken = test.spawn("chicken", new BlockLocation(1, 2, 1));
  const movementBasicComp = chicken.getComponent("movement.basic");
  test.assert(movementBasicComp !== undefined, "Expected movement.basic component");
  test.assert(movementBasicComp.maxTurn === 30, "Unexpected maxTurn");
  test.succeed();
})
  .structureName("ComponentTests:animal_pen")
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("ComponentTests", "movement_fly_component", (test) => {
  const parrot = test.spawn("parrot", new BlockLocation(1, 2, 1));
  const movementFlyComp = parrot.getComponent("movement.fly");
  test.assert(movementFlyComp !== undefined, "Expected movement.fly component");
  test.assert(movementFlyComp.maxTurn === 30, "Unexpected maxTurn");
  test.succeed();
})
  .structureName("ComponentTests:glass_cage")
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("ComponentTests", "movement_generic_component", (test) => {
  const drowned = test.spawn("drowned", new BlockLocation(1, 2, 1));
  const movementGenericComp = drowned.getComponent("movement.generic");
  test.assert(movementGenericComp !== undefined, "Expected movement.generic component");
  test.assert(movementGenericComp.maxTurn === 30, "Unexpected maxTurn");
  test.succeed();
})
  .structureName("ComponentTests:animal_pen")
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("ComponentTests", "movement_glide_component", (test) => {
  const phantom = test.spawn("phantom", new BlockLocation(2, 2, 2));
  const movementGlideComp = phantom.getComponent("movement.glide");
  test.assert(movementGlideComp !== undefined, "Expected movement.glide component");
  test.assert(movementGlideComp.maxTurn === 30, "Unexpected maxTurn");
  test.assert(isNear(movementGlideComp.startSpeed, 0.1), "Unexpected startSpeed");
  test.assert(isNear(movementGlideComp.speedWhenTurning, 0.2), "Unexpected speedWhenTurning");
  test.succeed();
})
  .structureName("ComponentTests:large_glass_cage")
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("ComponentTests", "movement_hover_component", (test) => {
  const bee = test.spawn("bee", new BlockLocation(1, 2, 1));
  const movementHoverComp = bee.getComponent("movement.hover");
  test.assert(movementHoverComp !== undefined, "Expected movement.hover component");
  test.assert(movementHoverComp.maxTurn === 30, "Unexpected maxTurn");
  test.succeed();
})
  .structureName("ComponentTests:glass_cage")
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("ComponentTests", "movement_jump_component", (test) => {
  const slime = test.spawn("slime", new BlockLocation(2, 2, 2));
  const movementJumpComp = slime.getComponent("movement.jump");
  test.assert(movementJumpComp !== undefined, "Expected movement.jump component");
  test.assert(isNear(movementJumpComp.maxTurn, 0.42), "Unexpected maxTurn");
  test.succeed();
})
  .structureName("ComponentTests:large_glass_cage")
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("ComponentTests", "movement_skip_component", (test) => {
  const rabbit = test.spawn("rabbit", new BlockLocation(1, 2, 1));
  const movementSkipComp = rabbit.getComponent("movement.skip");
  test.assert(movementSkipComp !== undefined, "Expected movement.skip component");
  test.assert(movementSkipComp.maxTurn === 30, "Unexpected maxTurn");
  test.succeed();
})
  .structureName("ComponentTests:glass_cage")
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("ComponentTests", "movement_sway_component", (test) => {
  const salmon = test.spawn("salmon", new BlockLocation(1, 2, 1));
  const movementSwayComp = salmon.getComponent("movement.sway");
  test.assert(movementSwayComp !== undefined, "Expected movement.sway component");
  test.assert(movementSwayComp.maxTurn === 30, "Unexpected maxTurn");
  test.assert(isNear(movementSwayComp.swayFrequency, 0.5), "Unexpected swayFrequency");
  test.assert(movementSwayComp.swayAmplitude === 0, "Unexpected swayAmplitude");
  test.succeed();
})
  .structureName("ComponentTests:glass_cage")
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("ComponentTests", "ageable_component", (test) => {
  const horse = test.spawn("minecraft:horse<minecraft:entity_born>", new BlockLocation(1, 2, 1));
  const ageableComp = horse.getComponent("ageable");
  test.assert(ageableComp !== undefined, "Expected ageable component");
  test.assert(ageableComp.duration == 1200, "Unexpected duration");
  test.assert(ageableComp.feedItems[0].item == "minecraft:wheat", "Unexpected feedItem item");
  test.assert(isNear(ageableComp.feedItems[0].growth, "0.016"), "Unexpected feedItem growth");
  test.assert(ageableComp.growUp !== undefined, "Expected growUp");
  test.assert(ageableComp.dropItems.length === 0, "Expected empty dropItems array");
  test.succeed();
})
  .structureName("ComponentTests:animal_pen")
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("ComponentTests", "addrider_component", (test) => {
  const ravager = test.spawn(
    "minecraft:ravager<minecraft:spawn_for_raid_with_pillager_rider>",
    new BlockLocation(2, 2, 2)
  );
  const addRiderComp = ravager.getComponent("addrider");
  test.assert(addRiderComp !== undefined, "Expected addrider component");
  test.assert(addRiderComp.entityType === "minecraft:pillager<minecraft:spawn_for_raid>", "Unexpected entityType");
  test.assert(addRiderComp.spawnEvent === "minecraft:spawn_for_raid", "Unexpected spawnEvent");
  test.succeed();
})
  .structureName("ComponentTests:large_animal_pen")
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("ComponentTests", "breathable_component", (test) => {
  const pig = test.spawn("minecraft:pig<minecraft:ageable_grow_up>", new BlockLocation(1, 2, 1));
  const breathableComp = pig.getComponent("breathable");
  test.assert(breathableComp !== undefined, "Expected breathable component");
  test.assert(breathableComp.totalSupply === 15, "Unexpected totalSupply");
  test.assert(breathableComp.suffocateTime === 0, "Unexpected suffocateTime");
  test.assert(breathableComp.inhaleTime === 0, "Unexpected inhaleTime");
  test.assert(breathableComp.breathesAir, "Unexpected breathesAir");
  test.assert(!breathableComp.breathesWater, "Unexpected breathesWater");
  test.assert(breathableComp.breathesLava, "Unexpected breathesLava");
  test.assert(!breathableComp.breathesSolids, "Unexpected breathesSolids");
  test.assert(breathableComp.generatesBubbles, "Unexpected generatesBubbles");
  test.assert(breathableComp.breatheBlocks.length == 0, "Unexpected breatheBlocks");
  test.assert(breathableComp.nonBreatheBlocks.length == 0, "Unexpected nonBreatheBlocks");
  test.succeed();
})
  .structureName("ComponentTests:aquarium")
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("ComponentTests", "navigation_fly_component", (test) => {
  const parrot = test.spawn("parrot", new BlockLocation(1, 2, 1));
  const flyComp = parrot.getComponent("navigation.fly");
  test.assert(flyComp !== undefined, "Expected navigation.fly component");
  test.assert(!flyComp.isAmphibious, "Unexpected isAmphibious");
  test.assert(!flyComp.avoidSun, "Unexpected avoidSun");
  test.assert(flyComp.canPassDoors, "Unexpected canPassDoors");
  test.assert(!flyComp.canOpenDoors, "Unexpected canOpenDoors");
  test.assert(!flyComp.canOpenIronDoors, "Unexpected canOpenIronDoors");
  test.assert(!flyComp.canBreakDoors, "Unexpected canBreakDoors");
  test.assert(!flyComp.avoidWater, "Unexpected avoidWater");
  test.assert(!flyComp.avoidDamageBlocks, "Unexpected avoidDamageBlocks");
  test.assert(flyComp.canFloat, "Unexpected canFloat");
  test.assert(flyComp.canSink, "Unexpected canSink");
  test.assert(!flyComp.canPathOverLava, "Unexpected canPathOverLava");
  test.assert(!flyComp.canWalkInLava, "Unexpected canWalkInLava");
  test.assert(!flyComp.avoidPortals, "Unexpected avoidPortals");
  test.assert(flyComp.canWalk, "Unexpected canWalk");
  test.assert(!flyComp.canSwim, "Unexpected canSwim");
  test.assert(!flyComp.canBreach, "Unexpected canBreach");
  test.assert(flyComp.canJump, "Unexpected canJump");
  test.assert(flyComp.canPathFromAir, "Unexpected canPathFromAir");
  test.succeed();
})
  .structureName("ComponentTests:glass_cage")
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("ComponentTests", "navigation_climb_component", (test) => {
  const spider = test.spawn("spider", new BlockLocation(1, 2, 1));
  const climbComp = spider.getComponent("navigation.climb");
  test.assert(climbComp !== undefined, "Expected navigation.climb component");
  test.succeed();
})
  .structureName("ComponentTests:glass_cage")
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("ComponentTests", "navigation_float_component", (test) => {
  const bat = test.spawn("bat", new BlockLocation(1, 2, 1));
  const floatComp = bat.getComponent("navigation.float");
  test.assert(floatComp !== undefined, "Expected navigation.float component");
  test.succeed();
})
  .structureName("ComponentTests:glass_cage")
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("ComponentTests", "navigation_generic_component", (test) => {
  const dolphin = test.spawn("dolphin", new BlockLocation(2, 2, 2));
  const genericComp = dolphin.getComponent("navigation.generic");
  test.assert(genericComp !== undefined, "Expected navigation.generic component");
  test.succeed();
})
  .structureName("ComponentTests:aquarium")
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("ComponentTests", "navigation_hover_component", (test) => {
  const bee = test.spawn("bee", new BlockLocation(1, 2, 1));
  const hoverComp = bee.getComponent("navigation.hover");
  test.assert(hoverComp !== undefined, "Expected navigation.hover component");
  test.succeed();
})
  .structureName("ComponentTests:glass_cage")
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("ComponentTests", "navigation_walk_component", (test) => {
  const creeper = test.spawn("creeper", new BlockLocation(1, 2, 1));
  const walkComp = creeper.getComponent("navigation.walk");
  test.assert(walkComp !== undefined, "Expected navigation.walk component");
  test.succeed();
})
  .structureName("ComponentTests:glass_cage")
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("ComponentTests", "inventory_component", (test) => {
  const rightChestCart = test.spawn("chest_minecart", new BlockLocation(1, 3, 1));
  const leftChestCart = test.spawn("chest_minecart", new BlockLocation(2, 3, 1));

  const rightInventoryComp = rightChestCart.getComponent("inventory");
  test.assert(rightInventoryComp !== undefined, "Expected inventory component");

  const leftInventoryComp = leftChestCart.getComponent("inventory");
  test.assert(leftInventoryComp !== undefined, "Expected inventory component");
  test.assert(rightInventoryComp.additionalSlotsPerStrength === 0, "Unexpected additionalSlotsPerStrength");
  test.assert(rightInventoryComp.canBeSiphonedFrom, "Unexpected canBeSiphonedFrom");
  test.assert(rightInventoryComp.containerType === "minecart_chest", "Unexpected containerType");
  test.assert(rightInventoryComp.inventorySize === 27, "Unexpected inventorySize");
  test.assert(!rightInventoryComp.private, "Unexpected private");
  test.assert(!rightInventoryComp.restrictToOwner, "Unexpected restrictToOwner");

  const rightContainer = rightInventoryComp.container;
  test.assert(rightContainer !== undefined, "Expected container");

  const leftContainer = leftInventoryComp.container;
  test.assert(leftContainer !== undefined, "Expected container");

  rightContainer.setItem(0, new ItemStack(MinecraftItemTypes.apple, 10, 0));
  test.assert(rightContainer.getItem(0).id === "minecraft:apple", "Expected apple in right container slot index 0");

  rightContainer.setItem(1, new ItemStack(MinecraftItemTypes.emerald, 10, 0));
  test.assert(rightContainer.getItem(1).id === "minecraft:emerald", "Expected emerald in right container slot index 1");

  test.assert(rightContainer.size === 27, "Unexpected size");
  test.assert(rightContainer.emptySlotsCount === 25, "Unexpected emptySlotsCount");

  const itemStack = rightContainer.getItem(0);
  test.assert(itemStack.id === "minecraft:apple", "Expected apple");
  test.assert(itemStack.amount === 10, "Expected 10 apples");
  test.assert(itemStack.data === 0, "Expected 0 data");

  leftContainer.setItem(0, new ItemStack(MinecraftItemTypes.cake, 10, 0));

  test.assert(rightContainer.transferItem(0, 4, leftContainer), "Expected transferItem to succeed"); // transfer the apple from the right container to the left container
  test.assert(rightContainer.swapItems(1, 0, leftContainer), "Expected swapItems to succeed"); // swap the cake and emerald

  test.assert(leftContainer.getItem(4).id === "minecraft:apple", "Expected apple in left container slot index 4");
  test.assert(leftContainer.getItem(0).id === "minecraft:emerald", "Expected emerald in left container slot index 0");
  test.assert(rightContainer.getItem(1).id === "minecraft:cake", "Expected cake in right container slot index 1");

  test.succeed();
})
  .structureName("ComponentTests:platform")
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("ComponentTests", "inventory_component_transfer", (test) => {
  const chestCart = test.spawn("chest_minecart", new BlockLocation(1, 3, 1));
  const inventoryComp = chestCart.getComponent("inventory");
  test.assert(inventoryComp !== undefined, "Expected inventory component");
  const container = inventoryComp.container;
  test.assert(container !== undefined, "Expected container");

  container.addItem(new ItemStack(MinecraftItemTypes.emerald, 10));
  container.setItem(1, new ItemStack(MinecraftItemTypes.emerald, 60));

  test.assert(container.transferItem(0, 1, container), "Expected transferItem to succeed"); // Transfer 4 of the emeralds, filling the stack in slot 1
  test.assert(container.getItem(0).amount === 6, "Expected 6 remaining emeralds in slot 0");
  test.assert(container.getItem(1).amount === 64, "Expected 64 emeralds in slot 1");

  test.assert(!container.transferItem(0, 1, container), "Expected transferItem to fail");
  test.assert(container.getItem(0).amount === 6, "Expected 6 remaining emeralds in slot 0");
  test.assert(container.getItem(1).amount === 64, "Expected 64 emeralds in slot 1");

  test.assert(container.transferItem(0, 2, container), "Expected transferItem to succeed");
  test.assert(container.getItem(0) === undefined, "Expected 0 remaining emeralds in slot 0");
  test.assert(container.getItem(2).amount === 6, "Expected 6 emeralds in slot 2");

  test.succeed();
})
  .structureName("ComponentTests:platform")
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("ComponentTests", "lava_movement_component", (test) => {
  const strider = test.spawn("strider", new BlockLocation(1, 2, 1));
  const lavaMovementComp = strider.getComponent("lava_movement");
  test.assert(lavaMovementComp !== undefined, "Expected lava_movement component");
  test.assert(isNear(lavaMovementComp.value, 0.32), "Unexpected value");
  test.succeed();
})
  .structureName("ComponentTests:large_glass_cage")
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("ComponentTests", "strength_component", (test) => {
  const llama = test.spawn("llama", new BlockLocation(1, 2, 1));
  const strengthComp = llama.getComponent("strength");
  test.assert(strengthComp !== undefined, "Expected strength component");
  test.assert(strengthComp.value >= 0 && strengthComp.value <= 5, "Unexpected value");
  test.assert(strengthComp.max === 5, "Unexpected max");
  test.succeed();
})
  .structureName("ComponentTests:animal_pen")
  .tag(GameTest.Tags.suiteDefault);

GameTest.registerAsync("ComponentTests", "item_component", async (test) => {
  const itemAmount = 5;
  const torchItem = new ItemStack(MinecraftItemTypes.torch, itemAmount);
  const torch = test.spawnItem(torchItem, new Location(1.5, 2.5, 1.5));
  const itemComp = torch.getComponent("item");
  test.assert(itemComp !== undefined, "Expected item component");
  test.assert(itemComp.itemStack.id === "minecraft:torch", "Unexpected item id");
  test.assert(itemComp.itemStack.amount === itemAmount, "Unexpected item amount");
  test.succeed();
})
  .structureName("ComponentTests:platform")
  .tag(GameTest.Tags.suiteDefault);

// SIG // Begin signature block
// SIG // MIInxwYJKoZIhvcNAQcCoIInuDCCJ7QCAQExDzANBglg
// SIG // hkgBZQMEAgEFADB3BgorBgEEAYI3AgEEoGkwZzAyBgor
// SIG // BgEEAYI3AgEeMCQCAQEEEBDgyQbOONQRoqMAEEvTUJAC
// SIG // AQACAQACAQACAQACAQAwMTANBglghkgBZQMEAgEFAAQg
// SIG // 987NOIxjxU8XhBvhnAtlRW92Ais97UzAAnR+nyEFKS6g
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
// SIG // SEXAQsmbdlsKgEhr/Xmfwb1tbWrJUnMTDXpQzTGCGZ4w
// SIG // ghmaAgEBMIGVMH4xCzAJBgNVBAYTAlVTMRMwEQYDVQQI
// SIG // EwpXYXNoaW5ndG9uMRAwDgYDVQQHEwdSZWRtb25kMR4w
// SIG // HAYDVQQKExVNaWNyb3NvZnQgQ29ycG9yYXRpb24xKDAm
// SIG // BgNVBAMTH01pY3Jvc29mdCBDb2RlIFNpZ25pbmcgUENB
// SIG // IDIwMTECEzMAAAJSizOq+JXzOdsAAAAAAlIwDQYJYIZI
// SIG // AWUDBAIBBQCggcAwGQYJKoZIhvcNAQkDMQwGCisGAQQB
// SIG // gjcCAQQwHAYKKwYBBAGCNwIBCzEOMAwGCisGAQQBgjcC
// SIG // ARUwLwYJKoZIhvcNAQkEMSIEICHvlW/zY/0HRFNArH3Y
// SIG // uHHsohZDO32sJP9HCJtuN3yrMFQGCisGAQQBgjcCAQwx
// SIG // RjBEoCSAIgBNAGkAbgBlAGMAcgBhAGYAdAAgAEIAZQBk
// SIG // AHIAbwBjAGuhHIAaaHR0cHM6Ly93d3cubWluZWNyYWZ0
// SIG // Lm5ldC8wDQYJKoZIhvcNAQEBBQAEggEAnydDOSDpnIWH
// SIG // N5w2fZfsELuykAi7hcInjDcAcAAgP9lEwPSVLNB+m0HD
// SIG // rS3IkAKzh8bZUZm5GIxcta+Oa+4mKPTDTXaBs1i6+J42
// SIG // NHAJoe8AuhufcbP7QpdcvxlRcbD4ba8EfyZEHx72whmk
// SIG // o0KAnmWfJzt5KPI8pQVKr0djlxM9SRbAHxTMIAn0Goqe
// SIG // kOnezFCkV0Pe3kiP8Axzi84C2dUYdjleN6nLbH5LDIiQ
// SIG // 8mwZBRR12aLoBvwqJ39VC25fr57S7xKIp74jvEXXYSyx
// SIG // oHExsiFmEB0YCIY+IZjfsZu6sX0bTxv12ikfAhOs7vVE
// SIG // 0q68q9nxs0Kw64WZ8VbmBaGCFxYwghcSBgorBgEEAYI3
// SIG // AwMBMYIXAjCCFv4GCSqGSIb3DQEHAqCCFu8wghbrAgED
// SIG // MQ8wDQYJYIZIAWUDBAIBBQAwggFZBgsqhkiG9w0BCRAB
// SIG // BKCCAUgEggFEMIIBQAIBAQYKKwYBBAGEWQoDATAxMA0G
// SIG // CWCGSAFlAwQCAQUABCCjUy+1klE1UUWxHA2G2KDM3YO6
// SIG // JS83ieuNKcKwVdfEnAIGYrMqJeW3GBMyMDIyMDcwMjAw
// SIG // Mjg1MS45NjdaMASAAgH0oIHYpIHVMIHSMQswCQYDVQQG
// SIG // EwJVUzETMBEGA1UECBMKV2FzaGluZ3RvbjEQMA4GA1UE
// SIG // BxMHUmVkbW9uZDEeMBwGA1UEChMVTWljcm9zb2Z0IENv
// SIG // cnBvcmF0aW9uMS0wKwYDVQQLEyRNaWNyb3NvZnQgSXJl
// SIG // bGFuZCBPcGVyYXRpb25zIExpbWl0ZWQxJjAkBgNVBAsT
// SIG // HVRoYWxlcyBUU1MgRVNOOjE3OUUtNEJCMC04MjQ2MSUw
// SIG // IwYDVQQDExxNaWNyb3NvZnQgVGltZS1TdGFtcCBTZXJ2
// SIG // aWNloIIRZTCCBxQwggT8oAMCAQICEzMAAAGKPjiN0g4C
// SIG // +ugAAQAAAYowDQYJKoZIhvcNAQELBQAwfDELMAkGA1UE
// SIG // BhMCVVMxEzARBgNVBAgTCldhc2hpbmd0b24xEDAOBgNV
// SIG // BAcTB1JlZG1vbmQxHjAcBgNVBAoTFU1pY3Jvc29mdCBD
// SIG // b3Jwb3JhdGlvbjEmMCQGA1UEAxMdTWljcm9zb2Z0IFRp
// SIG // bWUtU3RhbXAgUENBIDIwMTAwHhcNMjExMDI4MTkyNzQy
// SIG // WhcNMjMwMTI2MTkyNzQyWjCB0jELMAkGA1UEBhMCVVMx
// SIG // EzARBgNVBAgTCldhc2hpbmd0b24xEDAOBgNVBAcTB1Jl
// SIG // ZG1vbmQxHjAcBgNVBAoTFU1pY3Jvc29mdCBDb3Jwb3Jh
// SIG // dGlvbjEtMCsGA1UECxMkTWljcm9zb2Z0IElyZWxhbmQg
// SIG // T3BlcmF0aW9ucyBMaW1pdGVkMSYwJAYDVQQLEx1UaGFs
// SIG // ZXMgVFNTIEVTTjoxNzlFLTRCQjAtODI0NjElMCMGA1UE
// SIG // AxMcTWljcm9zb2Z0IFRpbWUtU3RhbXAgU2VydmljZTCC
// SIG // AiIwDQYJKoZIhvcNAQEBBQADggIPADCCAgoCggIBALf/
// SIG // rrehgwMgGb3oAYWoFndBqKk/JRRzHqaFjTizzxBKC7sm
// SIG // uF95/iteBb5WcBZisKmqegfuhJCE0o5HnE0gekEQOJIr
// SIG // 3ScnZS7yq4PLnbQbuuyyso0KsEcw0E0YRAsaVN9LXQRP
// SIG // wHsj/eZO6p3YSLvzqU+EBshiVIjA5ZmQIgz2ORSZIrVI
// SIG // Br8DAR8KICc/BVRARZ1YgFEUyeJAQ4lOqaW7+DyPe/r0
// SIG // IabKQyvvN4GsmokQt4DUxst4jonuj7JdN3L2CIhXACUT
// SIG // +DtEZHhZb/0kKKJs9ybbDHfaKEv1ztL0jfYdg1SjjTI2
// SIG // hToJzeUZOYgqsJp+qrJnvoWqEf06wgUtM1417Fk4JJY1
// SIG // Abbde1AW1vES/vSzcN3IzyfBGEYJTDVwmCzOhswg1xLx
// SIG // PU//7AL/pNXPOLZqImQ2QagYK/0ry/oFbDs9xKA2UNuq
// SIG // k2tWxJ/56cTJl3LaGUnvEkQ6oCtCVFoYyl4J8mjgAxAf
// SIG // hbXyIvo3XFCW6T7QC+JFr1UkSoqVb/DBLmES3sVxAxAY
// SIG // vleLXygKWYROIGtKfkAomsBywWTaI91EDczOUFZhmotz
// SIG // J0BW2ZIam1A8qaPb2lhHlXjt+SX3S1o8EYLzF91SmS+e
// SIG // 3e45kY4lZZbl42RS8fq4SS+yWFabTj7RdTALTGJaejro
// SIG // JzqRvuFuDBh6o+2GHz9FAgMBAAGjggE2MIIBMjAdBgNV
// SIG // HQ4EFgQUI9pD2P1sGdSXrqdJR4Q+MZBpJAMwHwYDVR0j
// SIG // BBgwFoAUn6cVXQBeYl2D9OXSZacbUzUZ6XIwXwYDVR0f
// SIG // BFgwVjBUoFKgUIZOaHR0cDovL3d3dy5taWNyb3NvZnQu
// SIG // Y29tL3BraW9wcy9jcmwvTWljcm9zb2Z0JTIwVGltZS1T
// SIG // dGFtcCUyMFBDQSUyMDIwMTAoMSkuY3JsMGwGCCsGAQUF
// SIG // BwEBBGAwXjBcBggrBgEFBQcwAoZQaHR0cDovL3d3dy5t
// SIG // aWNyb3NvZnQuY29tL3BraW9wcy9jZXJ0cy9NaWNyb3Nv
// SIG // ZnQlMjBUaW1lLVN0YW1wJTIwUENBJTIwMjAxMCgxKS5j
// SIG // cnQwDAYDVR0TAQH/BAIwADATBgNVHSUEDDAKBggrBgEF
// SIG // BQcDCDANBgkqhkiG9w0BAQsFAAOCAgEAxfTBErD1w3kb
// SIG // XxaNX+e+Yj3xfQEVm3rrjXzOfNyH08X82X9nb/5ntwzY
// SIG // vynDTRJ0dUym2bRuy7INHMv6SiBEDiRtn2GlsCCCmMLs
// SIG // gySNkOJFYuZs21f9Aufr0ELEHAr37DPCuV9n34nyYu7a
// SIG // nhtK+fAo4MHu8QWL4Lj5o1DccE1rxI2SD36Y1VKGjwpe
// SIG // qqrNHhVG+23C4c0xBGAZwI/DBDYYj+SCXeD6eZRah07a
// SIG // XnOu2BZhrjv7iAP04zwX3LTOZFCPrs38of8iHbQzbZCM
// SIG // /nv8Zl0hYYkBEdLgY0aG0GVenPtEzbb0TS2slOLuxHpH
// SIG // ezmg180EdEblhmkosLTel3Pz6DT9K3sxujr3MqMNajKF
// SIG // JFBEO6qg9EKvEBcCtAygnWUibcgSjAaY1GApzVGW2L00
// SIG // 1puA1yuUWIH9t21QSVuF6OcOPdBx6OE41jas9ez6j8jA
// SIG // k5zPB3AKk5z3jBNHT2L23cMwzIG7psnWyWqv9OhSJpCe
// SIG // yl7PY8ag4hNj03mJ2o/Np+kP/z6mx7scSZsEDuH83ToF
// SIG // agBJBtVw5qaVSlv6ycQTdyMcla+kD/XIWNjGFWtG2wAi
// SIG // Nnb1PkdkCZROQI6DCsuvFiNaZhU9ySga62nKcuh1Ixq7
// SIG // Vfv9VOdm66xJQpVcuRW/PlGVmS6fNnLgs7STDEqlvpD+
// SIG // c8lQUryzPuAwggdxMIIFWaADAgECAhMzAAAAFcXna54C
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
// SIG // BAsTHVRoYWxlcyBUU1MgRVNOOjE3OUUtNEJCMC04MjQ2
// SIG // MSUwIwYDVQQDExxNaWNyb3NvZnQgVGltZS1TdGFtcCBT
// SIG // ZXJ2aWNloiMKAQEwBwYFKw4DAhoDFQCA8PNjrxtTBQQd
// SIG // p/+MHlaqc1fEoaCBgzCBgKR+MHwxCzAJBgNVBAYTAlVT
// SIG // MRMwEQYDVQQIEwpXYXNoaW5ndG9uMRAwDgYDVQQHEwdS
// SIG // ZWRtb25kMR4wHAYDVQQKExVNaWNyb3NvZnQgQ29ycG9y
// SIG // YXRpb24xJjAkBgNVBAMTHU1pY3Jvc29mdCBUaW1lLVN0
// SIG // YW1wIFBDQSAyMDEwMA0GCSqGSIb3DQEBBQUAAgUA5mmF
// SIG // zDAiGA8yMDIyMDcwMTIyNDAxMloYDzIwMjIwNzAyMjI0
// SIG // MDEyWjB0MDoGCisGAQQBhFkKBAExLDAqMAoCBQDmaYXM
// SIG // AgEAMAcCAQACAjTHMAcCAQACAhFlMAoCBQDmatdMAgEA
// SIG // MDYGCisGAQQBhFkKBAIxKDAmMAwGCisGAQQBhFkKAwKg
// SIG // CjAIAgEAAgMHoSChCjAIAgEAAgMBhqAwDQYJKoZIhvcN
// SIG // AQEFBQADgYEAV0H48Jpy+CgjSGUB7pPnvhrIfYGmsB3r
// SIG // 8zzPfH1IQIGBjxofhACB0oNjCl3SlciW/+ZgcdclcEcc
// SIG // eu7Hv1SiHBcDDmCsL235qiWH1s/THzCms+HtXAox7GZo
// SIG // 446hZSUkwUxgq6tGs6iEHsf3ViEj9Xf67aLphxPrkWCU
// SIG // 1SMdBowxggQNMIIECQIBATCBkzB8MQswCQYDVQQGEwJV
// SIG // UzETMBEGA1UECBMKV2FzaGluZ3RvbjEQMA4GA1UEBxMH
// SIG // UmVkbW9uZDEeMBwGA1UEChMVTWljcm9zb2Z0IENvcnBv
// SIG // cmF0aW9uMSYwJAYDVQQDEx1NaWNyb3NvZnQgVGltZS1T
// SIG // dGFtcCBQQ0EgMjAxMAITMwAAAYo+OI3SDgL66AABAAAB
// SIG // ijANBglghkgBZQMEAgEFAKCCAUowGgYJKoZIhvcNAQkD
// SIG // MQ0GCyqGSIb3DQEJEAEEMC8GCSqGSIb3DQEJBDEiBCA7
// SIG // y3AkV225M42MKtZcm/lE8sTm9WSp3/BM1YiOPFCr5TCB
// SIG // +gYLKoZIhvcNAQkQAi8xgeowgecwgeQwgb0EIPS94Kt1
// SIG // 30q+fvO/fzD4MbWQhQaE7RHkOH6AkjlNVCm9MIGYMIGA
// SIG // pH4wfDELMAkGA1UEBhMCVVMxEzARBgNVBAgTCldhc2hp
// SIG // bmd0b24xEDAOBgNVBAcTB1JlZG1vbmQxHjAcBgNVBAoT
// SIG // FU1pY3Jvc29mdCBDb3Jwb3JhdGlvbjEmMCQGA1UEAxMd
// SIG // TWljcm9zb2Z0IFRpbWUtU3RhbXAgUENBIDIwMTACEzMA
// SIG // AAGKPjiN0g4C+ugAAQAAAYowIgQgti7SzfE9sOI06Cbh
// SIG // YZ3eo/3n6oLo5xCpNLWNO3O+NRowDQYJKoZIhvcNAQEL
// SIG // BQAEggIAG4IU2Z6UCMTYrEQtFXYOvTz0Y/vZNeFcNad5
// SIG // WN2ssvZm76sdTgpjFfIMCOptM45EBqKtyCOxw7LwudAx
// SIG // /gja/171aYVwwGdE+YmCemjr478e/5WGp0wYBUaKcoxj
// SIG // A+PaYOYDM71rL2HrODsVbK+kA9Mvuc2+NwYiBpRPE99G
// SIG // PMWTqpvX2ik6tN9qd7XlmtAQMEgQJXxliG1ozBHiaBvF
// SIG // 1+kAVOh9D8G3ipu4xp0FeI5Ocwzu3IieBhHK5yEALPJ5
// SIG // Yvx9ydQmJwWijbuEc2ja7pPolH0hnnbAFGEpYhJSbBeC
// SIG // VUqK+KJMQUjQDanuC6oZ5o6nn/DUpMJvOgLpPCtE/J69
// SIG // GokCw9vI/o5PgnLWaBNG5C36Ie93whyc9Bhfd13iytKN
// SIG // E5y5n1bHBxsLuaSF1JWS1cmjLsa1zzYDtoVQoT3g3dkU
// SIG // yCrs41hd+zGueudPN/YUqV6KXrSksQX2Q1h5WINqid99
// SIG // qR8ROBwHvpD80IXchqs1dCgdiZ1UWkfq/3g0HvylZXy/
// SIG // wNi5Y0ZEJPIr2aIJClDMkO3UopXQ4wcxi03Dw13biQrm
// SIG // cOdUXrh7GeCvsIzmWN+rwgFAdo8SghOa+e598Otvp7c3
// SIG // PFKncdk2SAwYOF0Izxq9zgopqmo/QaT1ISQTxn0IEnLN
// SIG // 9CdGvrxliGgHXmxzajvnvZYwcTJhbbE=
// SIG // End signature block
