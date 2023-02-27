import * as GameTest from "mojang-gametest";
import { BlockLocation, MinecraftItemTypes, ItemStack } from "mojang-minecraft";

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

GameTest.register("ComponentTests", "item_component", async (test) => {
  const itemLoc = test.worldBlockLocation(new BlockLocation(1, 2, 1));
  test.pressButton(new BlockLocation(0, 2, 0));
  await test.idle(40);
  const entities = test.getDimension().getEntitiesAtBlockLocation(itemLoc);
  test.assert(entities.length === 1, "Expected 1 entity");
  const itemComp = entities[0].getComponent("item");
  test.assert(itemComp !== undefined, "Expected item component");
  test.assert(itemComp.itemStack.id === "minecraft:torch", "Unexpected item id");
  test.assert(itemComp.itemStack.amount === 1, "Unexpected item amount");
  test.succeed();
}).tag(GameTest.Tags.suiteDefault);

// SIG // Begin signature block
// SIG // MIInrgYJKoZIhvcNAQcCoIInnzCCJ5sCAQExDzANBglg
// SIG // hkgBZQMEAgEFADB3BgorBgEEAYI3AgEEoGkwZzAyBgor
// SIG // BgEEAYI3AgEeMCQCAQEEEBDgyQbOONQRoqMAEEvTUJAC
// SIG // AQACAQACAQACAQACAQAwMTANBglghkgBZQMEAgEFAAQg
// SIG // dHAILadn5FWc0PKJ1rZJavm5dWrPMZumNDAspJNnXb+g
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
// SIG // SEXAQsmbdlsKgEhr/Xmfwb1tbWrJUnMTDXpQzTGCGYUw
// SIG // ghmBAgEBMIGVMH4xCzAJBgNVBAYTAlVTMRMwEQYDVQQI
// SIG // EwpXYXNoaW5ndG9uMRAwDgYDVQQHEwdSZWRtb25kMR4w
// SIG // HAYDVQQKExVNaWNyb3NvZnQgQ29ycG9yYXRpb24xKDAm
// SIG // BgNVBAMTH01pY3Jvc29mdCBDb2RlIFNpZ25pbmcgUENB
// SIG // IDIwMTECEzMAAAJSizOq+JXzOdsAAAAAAlIwDQYJYIZI
// SIG // AWUDBAIBBQCggcAwGQYJKoZIhvcNAQkDMQwGCisGAQQB
// SIG // gjcCAQQwHAYKKwYBBAGCNwIBCzEOMAwGCisGAQQBgjcC
// SIG // ARUwLwYJKoZIhvcNAQkEMSIEILwnPsFdq3F5GAQf5go/
// SIG // cWdmCNopjFT7+9ccKm9tyhb6MFQGCisGAQQBgjcCAQwx
// SIG // RjBEoCSAIgBNAGkAbgBlAGMAcgBhAGYAdAAgAEIAZQBk
// SIG // AHIAbwBjAGuhHIAaaHR0cHM6Ly93d3cubWluZWNyYWZ0
// SIG // Lm5ldC8wDQYJKoZIhvcNAQEBBQAEggEAhnKadCfHGlof
// SIG // hmCPPTJmKm1f34DMalJ+n9zm8NE7+MKdTVvw9YvCKebo
// SIG // hjvfULiwgD+wADucokim1JHXjA/gbJf9mV806/zME1TA
// SIG // Ak/3zlOzkpj3Nr7JkWSoDpf87V1TTjPedqIAY/3IcbIS
// SIG // L0AvZMCb7fC4D3n4dNFbECUG+z36MncnEkjcws96260q
// SIG // ArRRulNrCisDXLa5XiZNY+aplyFhxufPdraQe3LFGwFy
// SIG // fe4Zzi15sv2pQmD/VpAKBPRcHR0WOeIJMZ/Psw8Y8YTP
// SIG // IxEN2a+pt5cjZ8ZewALe6WEKRXOKEzu8jM8wl1kxTAv1
// SIG // RMqcdJ+u9pSq6UBPRZjNs6GCFv0wghb5BgorBgEEAYI3
// SIG // AwMBMYIW6TCCFuUGCSqGSIb3DQEHAqCCFtYwghbSAgED
// SIG // MQ8wDQYJYIZIAWUDBAIBBQAwggFRBgsqhkiG9w0BCRAB
// SIG // BKCCAUAEggE8MIIBOAIBAQYKKwYBBAGEWQoDATAxMA0G
// SIG // CWCGSAFlAwQCAQUABCCtiL5GArRjFG6lce/1En6Q5jJ6
// SIG // gCnJYZeAYL8T7eahkgIGYoJRIHshGBMyMDIyMDUyNzAw
// SIG // NTAyOC42NzFaMASAAgH0oIHQpIHNMIHKMQswCQYDVQQG
// SIG // EwJVUzETMBEGA1UECBMKV2FzaGluZ3RvbjEQMA4GA1UE
// SIG // BxMHUmVkbW9uZDEeMBwGA1UEChMVTWljcm9zb2Z0IENv
// SIG // cnBvcmF0aW9uMSUwIwYDVQQLExxNaWNyb3NvZnQgQW1l
// SIG // cmljYSBPcGVyYXRpb25zMSYwJAYDVQQLEx1UaGFsZXMg
// SIG // VFNTIEVTTjo3QkYxLUUzRUEtQjgwODElMCMGA1UEAxMc
// SIG // TWljcm9zb2Z0IFRpbWUtU3RhbXAgU2VydmljZaCCEVQw
// SIG // ggcMMIIE9KADAgECAhMzAAABnytFNRUILktdAAEAAAGf
// SIG // MA0GCSqGSIb3DQEBCwUAMHwxCzAJBgNVBAYTAlVTMRMw
// SIG // EQYDVQQIEwpXYXNoaW5ndG9uMRAwDgYDVQQHEwdSZWRt
// SIG // b25kMR4wHAYDVQQKExVNaWNyb3NvZnQgQ29ycG9yYXRp
// SIG // b24xJjAkBgNVBAMTHU1pY3Jvc29mdCBUaW1lLVN0YW1w
// SIG // IFBDQSAyMDEwMB4XDTIxMTIwMjE5MDUyMloXDTIzMDIy
// SIG // ODE5MDUyMlowgcoxCzAJBgNVBAYTAlVTMRMwEQYDVQQI
// SIG // EwpXYXNoaW5ndG9uMRAwDgYDVQQHEwdSZWRtb25kMR4w
// SIG // HAYDVQQKExVNaWNyb3NvZnQgQ29ycG9yYXRpb24xJTAj
// SIG // BgNVBAsTHE1pY3Jvc29mdCBBbWVyaWNhIE9wZXJhdGlv
// SIG // bnMxJjAkBgNVBAsTHVRoYWxlcyBUU1MgRVNOOjdCRjEt
// SIG // RTNFQS1CODA4MSUwIwYDVQQDExxNaWNyb3NvZnQgVGlt
// SIG // ZS1TdGFtcCBTZXJ2aWNlMIICIjANBgkqhkiG9w0BAQEF
// SIG // AAOCAg8AMIICCgKCAgEApPV5fE1RsomQL85vLQeHyz9M
// SIG // 5y/PN2AyBtN47Nf1swmiAlw7NJF5Sd/TlGcHgRWv1fJd
// SIG // u5pQY8i2Q7U4N1vHUDkQ7p35+0s2RKBZpV2kmHEIcgzF
// SIG // eYIcYupYfMtzVdUzRxmC82qEJrQXrhUpRB/cKeqwv7ES
// SIG // uxj6zp9e1wBs6Pv8hcuw31oCEON19+brdtE0oVHmA67O
// SIG // RjlaR6e6LqkGEU6bvpQGgh36vLa/ixaiMo6ZL8cW9x3M
// SIG // elY7XtDTx+hpyAk/OD8VmCu3qGuQMW7E1KlkMolraxqM
// SIG // kMlz+MiCn01GD7bExQoteIriTa98kRo6OFNTh2VNshpl
// SIG // ngq3XHCYJG8upNjeQIUWLyh63jz4eaFh2NNYPE3JMVeI
// SIG // eIpaKr2mmBodxwz1j8OCqCshMu0BxrmStagJIXloil9q
// SIG // hNHjUVrppgij4XXBd3XFYlSPWil4bcuMzO+rbFI3HQrZ
// SIG // xuVSCOnlOnc3C+mBadLzJeyTyN8vSK8fbARIlZkooDNk
// SIG // w2VOEVCGxSLQ+tAyWMzR9Kxrtg79/T/9DsKMd+z92X7w
// SIG // eYwHoOgfkgUg9GsIvn+tSRa1XP1GfN1vubYCP9MXCxlh
// SIG // wTXRIm0hdTRX61dCjwin4vYg9gZEIDGItNgmPBN7rPlM
// SIG // mAODRWHFiaY2nASgAXgwXZGNQT3xoM7JGioSBoXaMfUC
// SIG // AwEAAaOCATYwggEyMB0GA1UdDgQWBBRiNPLVHhMWK0gO
// SIG // Lujf2WrH1h3IYTAfBgNVHSMEGDAWgBSfpxVdAF5iXYP0
// SIG // 5dJlpxtTNRnpcjBfBgNVHR8EWDBWMFSgUqBQhk5odHRw
// SIG // Oi8vd3d3Lm1pY3Jvc29mdC5jb20vcGtpb3BzL2NybC9N
// SIG // aWNyb3NvZnQlMjBUaW1lLVN0YW1wJTIwUENBJTIwMjAx
// SIG // MCgxKS5jcmwwbAYIKwYBBQUHAQEEYDBeMFwGCCsGAQUF
// SIG // BzAChlBodHRwOi8vd3d3Lm1pY3Jvc29mdC5jb20vcGtp
// SIG // b3BzL2NlcnRzL01pY3Jvc29mdCUyMFRpbWUtU3RhbXAl
// SIG // MjBQQ0ElMjAyMDEwKDEpLmNydDAMBgNVHRMBAf8EAjAA
// SIG // MBMGA1UdJQQMMAoGCCsGAQUFBwMIMA0GCSqGSIb3DQEB
// SIG // CwUAA4ICAQAdiigpPDvpGfPpvWz10CAJqPusWyg2ipDE
// SIG // d//NgPF1QDGvUaSLWCZHZLWvgumSFQbGRAESZCp1qWCY
// SIG // oshgVdz5j6CDD+cxW69AWCzKJQyWTLR9zIn1QQ/TZJ2D
// SIG // SoPhm1smgD7PFWelA9wkc46FWdj2x0R/lDpdmHP3JtSE
// SIG // dwZb45XDcMpKcwRlJ3QEXn7s430UnwfnQc5pRWPnTBPP
// SIG // idzr73jK2iHM50q5a+OhlzKFhibdIQSTX+BuSWasl3vJ
// SIG // /M9skeaaC9rojEc6iF19a8AiF4XCzxYEijf7yca8R4hf
// SIG // QclYqLn+IwnA/DtpjveLaAkqixEbqHUnvXUO6qylQaJw
// SIG // 6GFgMfltFxgF9qmqGZqhLp+0G/IZ8jclaydgtn2cAGNs
// SIG // ol92TICxlK6Q0aCVnT/rXOUkuimdX8MoS/ygII4jT71A
// SIG // YruzxeCx8eU0RVOx2V74KWQ5+cZLZF2YnQOEtujWbDEs
// SIG // oMdEdZ11d8m2NyXZTX0RE7ekiH0HQsUV+WFGyOTXb7lT
// SIG // IsuaAd25X4T4DScqNKnZpByhNqTeHPIsPUq2o51nDNG1
// SIG // BMaw5DanMGqtdQ88HNJQxl9eIJ4xkW4IZehy7A+48cdP
// SIG // m7syRymT8xnUyzBSqEnSXleKVP7d3T23VNtR0utBMdiK
// SIG // dk3Rn4LUvTzs1WkwOFLnLpJW42ZEIoX4NjCCB3EwggVZ
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
// SIG // gm2lBRDBcQZqELQdVTNYs6FwZvKhggLLMIICNAIBATCB
// SIG // +KGB0KSBzTCByjELMAkGA1UEBhMCVVMxEzARBgNVBAgT
// SIG // Cldhc2hpbmd0b24xEDAOBgNVBAcTB1JlZG1vbmQxHjAc
// SIG // BgNVBAoTFU1pY3Jvc29mdCBDb3Jwb3JhdGlvbjElMCMG
// SIG // A1UECxMcTWljcm9zb2Z0IEFtZXJpY2EgT3BlcmF0aW9u
// SIG // czEmMCQGA1UECxMdVGhhbGVzIFRTUyBFU046N0JGMS1F
// SIG // M0VBLUI4MDgxJTAjBgNVBAMTHE1pY3Jvc29mdCBUaW1l
// SIG // LVN0YW1wIFNlcnZpY2WiIwoBATAHBgUrDgMCGgMVAHRd
// SIG // rpgf8ssMRSxUwvKyfRb/XPa3oIGDMIGApH4wfDELMAkG
// SIG // A1UEBhMCVVMxEzARBgNVBAgTCldhc2hpbmd0b24xEDAO
// SIG // BgNVBAcTB1JlZG1vbmQxHjAcBgNVBAoTFU1pY3Jvc29m
// SIG // dCBDb3Jwb3JhdGlvbjEmMCQGA1UEAxMdTWljcm9zb2Z0
// SIG // IFRpbWUtU3RhbXAgUENBIDIwMTAwDQYJKoZIhvcNAQEF
// SIG // BQACBQDmOf3uMCIYDzIwMjIwNTI2MjEyMzU4WhgPMjAy
// SIG // MjA1MjcyMTIzNThaMHQwOgYKKwYBBAGEWQoEATEsMCow
// SIG // CgIFAOY5/e4CAQAwBwIBAAICCscwBwIBAAICEZswCgIF
// SIG // AOY7T24CAQAwNgYKKwYBBAGEWQoEAjEoMCYwDAYKKwYB
// SIG // BAGEWQoDAqAKMAgCAQACAwehIKEKMAgCAQACAwGGoDAN
// SIG // BgkqhkiG9w0BAQUFAAOBgQAsVTUmZwnOMvdVY6MrRx5H
// SIG // ZsOaxntkRqZnfAgw34ATo5U5dvcNhZdCaq8uMmY6Lz1G
// SIG // nnfmh64BCwxoNNx6hjjOqf5RHxBh/b7lwu1/UF0oWmwm
// SIG // tsUXqjZoY1jSuesOsMOVXslrBVb00ZPI+mMVzRWYCeVF
// SIG // Hp0JH1Wns8lZ4dRxEjGCBA0wggQJAgEBMIGTMHwxCzAJ
// SIG // BgNVBAYTAlVTMRMwEQYDVQQIEwpXYXNoaW5ndG9uMRAw
// SIG // DgYDVQQHEwdSZWRtb25kMR4wHAYDVQQKExVNaWNyb3Nv
// SIG // ZnQgQ29ycG9yYXRpb24xJjAkBgNVBAMTHU1pY3Jvc29m
// SIG // dCBUaW1lLVN0YW1wIFBDQSAyMDEwAhMzAAABnytFNRUI
// SIG // LktdAAEAAAGfMA0GCWCGSAFlAwQCAQUAoIIBSjAaBgkq
// SIG // hkiG9w0BCQMxDQYLKoZIhvcNAQkQAQQwLwYJKoZIhvcN
// SIG // AQkEMSIEIAYavGG25Ug6kqFKoiKX9AGxbneS6ooHaE5D
// SIG // yT/V3lUlMIH6BgsqhkiG9w0BCRACLzGB6jCB5zCB5DCB
// SIG // vQQghvFeKaIniZ6l51c8DVHo3ioCyXxB+z/o7KcsN0t8
// SIG // XNowgZgwgYCkfjB8MQswCQYDVQQGEwJVUzETMBEGA1UE
// SIG // CBMKV2FzaGluZ3RvbjEQMA4GA1UEBxMHUmVkbW9uZDEe
// SIG // MBwGA1UEChMVTWljcm9zb2Z0IENvcnBvcmF0aW9uMSYw
// SIG // JAYDVQQDEx1NaWNyb3NvZnQgVGltZS1TdGFtcCBQQ0Eg
// SIG // MjAxMAITMwAAAZ8rRTUVCC5LXQABAAABnzAiBCDWD8ME
// SIG // DSaIt9wpJOYIIi0smEzFtIJimSnXJw0Cuj0tTTANBgkq
// SIG // hkiG9w0BAQsFAASCAgB11mWTg8McFCseoYKMNkDrEai/
// SIG // lq7hMAkNKuEf02Lgy/7y3/o1DkOlQ/55Cci0g1EzaMXc
// SIG // 4X29FUPDJG7h1Jtis9bszxe9J9kJPpkxiWeQApii0Lih
// SIG // jaojrxPbz/LZvrVwR5BhrACr1x7jEMrVD1zcFbvgpQOE
// SIG // 9GIUgZbSYMXfDLE7TVJ/x1QbV34U2kmV6If1Zu/IdMq/
// SIG // UbGslfspE2x1nPAJEfyRWYdSIYne6UqhVhQ3s4Th49Zf
// SIG // pvpVwWPnWNgWe1BEmmLVDB5VG07Zpg8KiMOAvA+e561y
// SIG // qjeWbVsct4UdIG09ZypqUHDseiISzvX4SLmTfL8ht4cH
// SIG // VHzCgfVE1362yxTq3LESTkwqNmyUymYHCKfOuJqLoB5D
// SIG // dUQ6bYTwKPWcA+ush6rlv4KiAXvS1hg2c9KenG6cg+FV
// SIG // gacvahcvQnc04Jx3DVUxEmNhHpQNph9BSjalhFHXdVnf
// SIG // w7bLPU83N8njSeBhd9lTj1yDLBF9HCl1XTv9Hz5zU7q3
// SIG // 5Hhj7mt/TrAi3gckpEfW4e39KHiJDTK0FTTgMHGW1tlc
// SIG // dNymEuUcTXwUpHrokmvTe7CdoziA7KgaTR/ewJHajk83
// SIG // oJ6Vrw1ISChjxc0uDvHKYy9P7bLCSv35RuOi4i6kYRTl
// SIG // 3KUtbKga3wN5W6si5WaTScZbgULS+RyzF+Sy0ifRSQ==
// SIG // End signature block
