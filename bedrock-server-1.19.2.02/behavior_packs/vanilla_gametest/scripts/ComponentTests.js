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
// SIG // MIInxgYJKoZIhvcNAQcCoIIntzCCJ7MCAQExDzANBglg
// SIG // hkgBZQMEAgEFADB3BgorBgEEAYI3AgEEoGkwZzAyBgor
// SIG // BgEEAYI3AgEeMCQCAQEEEBDgyQbOONQRoqMAEEvTUJAC
// SIG // AQACAQACAQACAQACAQAwMTANBglghkgBZQMEAgEFAAQg
// SIG // 987NOIxjxU8XhBvhnAtlRW92Ais97UzAAnR+nyEFKS6g
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
// SIG // ARUwLwYJKoZIhvcNAQkEMSIEICHvlW/zY/0HRFNArH3Y
// SIG // uHHsohZDO32sJP9HCJtuN3yrMFQGCisGAQQBgjcCAQwx
// SIG // RjBEoCSAIgBNAGkAbgBlAGMAcgBhAGYAdAAgAEIAZQBk
// SIG // AHIAbwBjAGuhHIAaaHR0cHM6Ly93d3cubWluZWNyYWZ0
// SIG // Lm5ldC8wDQYJKoZIhvcNAQEBBQAEggEABkuhDGdN4W3l
// SIG // hSXKVOONquNRW4Um6OXSxCU/maz6jNH3QW8hexPuGF2R
// SIG // c2FhfbaAC+/yjKmGosQba6qD+fWxB791/wTw32Ta8/3A
// SIG // KTUumeZpRgVaNX0FRMYkE9mygis3I+LwceOhNddU1l0T
// SIG // qOKFllf+K97xZqmw+oHozIHsaX+Ei3DAlfshJPwOmFRd
// SIG // PUlJDz0rp0BzHeyM48NliDaNHvuJS5LOhk9DbvPGhZNT
// SIG // QA7NbCtMuF5RULj7J/VJZDY0PVR7P0gdkTj2OgCVWpDU
// SIG // uihs1U5aeEH7KtDdTPg1ZGHSUHZyThODybrVHEM+nN3q
// SIG // FWi5asyIHHIjKveqBDp1T6GCFxUwghcRBgorBgEEAYI3
// SIG // AwMBMYIXATCCFv0GCSqGSIb3DQEHAqCCFu4wghbqAgED
// SIG // MQ8wDQYJYIZIAWUDBAIBBQAwggFYBgsqhkiG9w0BCRAB
// SIG // BKCCAUcEggFDMIIBPwIBAQYKKwYBBAGEWQoDATAxMA0G
// SIG // CWCGSAFlAwQCAQUABCDqIM7vGvENXcJelf9JrhbQ2eqx
// SIG // OkFOEp9H/M+Mdp61ewIGYt52ZF37GBIyMDIyMDgxODAw
// SIG // MTkzMC40OVowBIACAfSggdikgdUwgdIxCzAJBgNVBAYT
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
// SIG // DQYLKoZIhvcNAQkQAQQwLwYJKoZIhvcNAQkEMSIEIIp6
// SIG // QfOM+FH7GJCyo/cAA7F05Uo2p030OBLbiJKemXrSMIH6
// SIG // BgsqhkiG9w0BCRACLzGB6jCB5zCB5DCBvQQgnpYRM/od
// SIG // XkDAnzf2udL569W8cfGTgwVuenQ8ttIYzX8wgZgwgYCk
// SIG // fjB8MQswCQYDVQQGEwJVUzETMBEGA1UECBMKV2FzaGlu
// SIG // Z3RvbjEQMA4GA1UEBxMHUmVkbW9uZDEeMBwGA1UEChMV
// SIG // TWljcm9zb2Z0IENvcnBvcmF0aW9uMSYwJAYDVQQDEx1N
// SIG // aWNyb3NvZnQgVGltZS1TdGFtcCBQQ0EgMjAxMAITMwAA
// SIG // AY16VS54dJkqtwABAAABjTAiBCD1XY0nsJXkfmxtCHs/
// SIG // o1pL/oSIMdwZtwIPZKIsTANl4DANBgkqhkiG9w0BAQsF
// SIG // AASCAgCCeHlVDv0UZLBLBOx6w/aRa/o7/mrLly6+MNZs
// SIG // ZpZSAYuAbuv9m0xJqZnwVWRqRt7XXRMNfqRtykqdRMk8
// SIG // 0/PTzLvhg/X03O9YUos3Ijbs37CZQj2np5WcdEsWSgQE
// SIG // 7baqcitc5hsjkT5iopPbO4fBc4bltE3XSoofhkYGLbtR
// SIG // sgBuffILW/XKtuCjFRRdn9CPrbne0Rzzs8pV9iLK1Jby
// SIG // ITFNcTFFG6Hve+0funoZzdCGs3fFgzhEh2rqyyHY97uf
// SIG // 0Kag1CG5aDuMfFdBh5G3Y+Ae/65Ek/yudaB9gv7puEGB
// SIG // 4gUkoEHjx57RSlKD7Td7LQHSSc4UdhLP5FZx1RAWorOS
// SIG // AMiy6JPixBV9Va9R2eWqVzD5g6sGIxS9z9Y408luiegP
// SIG // NNlZNPjI/gHvkRE1gIOtrAjX/n28Id8exyrx047KPOWn
// SIG // LHUSYgl20PncjAhe1wXgAJbrHPc1Kfockw3RGgLS/iXW
// SIG // BC1MTlvJ9DxUL+t6nsCGJSLeRynzCJxxepv/gGF00CPn
// SIG // PWQ9qoGnPO7NYYS2xyHQXjklnUObf1fBRKpYaYaN/N5z
// SIG // ap8KzkVSphLg8LF7iPyl4RKQvdPeislgkL0W40Rp5GXJ
// SIG // Jqc6N2TVeoA/MmdTCc7ZEKSbEC3sIAbj/CmNq5QnAj6m
// SIG // g/Uv/i04+NbAYOG6RZh9llyjcZENWw==
// SIG // End signature block
