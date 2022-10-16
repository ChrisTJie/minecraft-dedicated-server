import GameTestExtensions from "./GameTestExtensions.js";
import * as GameTest from "mojang-gametest";
import {
  BlockLocation,
  BlockProperties,
  MinecraftBlockTypes,
  Color,
  Direction,
  ExplosionOptions,
  EntityDamageCause,
  EntityEventOptions,
  EntityDataDrivenTriggerEventOptions,
  FluidContainer,
  FluidType,
  MinecraftEffectTypes,
  MinecraftItemTypes,
  ItemStack,
  Location,
  Vector,
  world,
} from "mojang-minecraft";

GameTest.register("APITests", "on_entity_created", (test) => {
  const entityCreatedCallback = world.events.entityCreate.subscribe((entity) => {
    if (entity) {
      test.succeed();
    } else {
      test.fail("Expected entity");
    }
  });
  test.spawn("minecraft:horse<minecraft:ageable_grow_up>", new BlockLocation(1, 2, 1));
  world.events.entityCreate.unsubscribe(entityCreatedCallback);
})
  .structureName("ComponentTests:animal_pen")
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("APITests", "assert_is_waterlogged", (test) => {
  const waterChestLoc = new BlockLocation(5, 2, 1);
  const waterLoc = new BlockLocation(4, 2, 1);
  const chestLoc = new BlockLocation(2, 2, 1);
  const airLoc = new BlockLocation(1, 2, 1);

  test.assertIsWaterlogged(waterChestLoc, true);
  test.assertIsWaterlogged(waterLoc, false);
  test.assertIsWaterlogged(chestLoc, false);
  test.assertIsWaterlogged(airLoc, false);
  test.succeed();
}).tag(GameTest.Tags.suiteDefault);

GameTest.register("APITests", "assert_redstone_power", (test) => {
  const redstoneBlockLoc = new BlockLocation(3, 2, 1);
  const redstoneTorchLoc = new BlockLocation(2, 2, 1);
  const poweredLampLoc = new BlockLocation(1, 2, 1);
  const unpoweredLampLoc = new BlockLocation(0, 2, 1);
  const airLoc = new BlockLocation(3, 2, 0);
  const redstoneWireLoc = new BlockLocation(0, 1, 0);

  test.succeedWhen(() => {
    test.assertRedstonePower(redstoneBlockLoc, 15);
    test.assertRedstonePower(redstoneTorchLoc, 15);
    test.assertRedstonePower(poweredLampLoc, 15);
    test.assertRedstonePower(unpoweredLampLoc, 0);
    test.assertRedstonePower(airLoc, -1);
    test.assertRedstonePower(redstoneWireLoc, 13); // 3 length wire
  });
})
  .maxTicks(20)
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("APITests", "spawn_item", (test) => {
  const featherItem = new ItemStack(MinecraftItemTypes.feather, 1, 0);
  test.spawnItem(featherItem, new Location(1.5, 3.5, 1.5));
  test.succeedWhen(() => {
    test.assertEntityPresent("minecraft:item", new BlockLocation(1, 2, 1), true);
  });
}).tag(GameTest.Tags.suiteDefault);

GameTest.register("APITests", "assert_entity_data", (test) => {
  const pigId = "minecraft:pig<minecraft:ageable_grow_up>";
  const pigLoc = new BlockLocation(1, 2, 1);
  test.spawn(pigId, pigLoc);
  test.succeedWhen(() => {
    test.assertEntityState(pigLoc, pigId, (entity) => entity.id !== undefined);
  });
})
  .structureName("ComponentTests:animal_pen")
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("APITests", "add_effect", (test) => {
  const villagerId = "minecraft:villager_v2<minecraft:ageable_grow_up>";
  const villagerLoc = new BlockLocation(1, 2, 1);
  const villager = test.spawn(villagerId, villagerLoc);
  const duration = 20;
  villager.addEffect(MinecraftEffectTypes.poison, duration, 1);

  test.assertEntityState(
    villagerLoc,
    villagerId,
    (entity) => entity.getEffect(MinecraftEffectTypes.poison).duration == duration
  );
  test.assertEntityState(
    villagerLoc,
    villagerId,
    (entity) => entity.getEffect(MinecraftEffectTypes.poison).amplifier == 1
  );

  test.runAfterDelay(duration, () => {
    test.assertEntityState(
      villagerLoc,
      villagerId,
      (entity) => entity.getEffect(MinecraftEffectTypes.poison) === undefined
    );
    test.succeed();
  });
})
  .structureName("ComponentTests:animal_pen")
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("APITests", "assert_entity_present", (test) => {
  const villagerId = "minecraft:villager_v2";
  const villagerLoc = new BlockLocation(1, 2, 3);
  const emeraldItem = new ItemStack(MinecraftItemTypes.emerald, 1, 0);
  const emeraldItemLoc = new BlockLocation(3, 2, 3);
  const minecartId = "minecraft:minecart";
  const minecartLoc = new BlockLocation(3, 2, 1);
  const armorStandId = "minecraft:armor_stand";
  const armorStandLoc = new BlockLocation(1, 2, 1);

  test.spawn(villagerId, villagerLoc);
  test.spawnItem(emeraldItem, new Location(3.5, 4.5, 3.5));

  test.succeedWhen(() => {
    test.assertEntityPresent(villagerId, villagerLoc, true);
    test.assertItemEntityPresent(MinecraftItemTypes.emerald, emeraldItemLoc, 0, true);
    test.assertEntityPresent(armorStandId, armorStandLoc, true);

    // Check all blocks surrounding the minecart
    for (let x = -1; x <= 1; x++) {
      for (let z = -1; z <= 1; z++) {
        let offsetLoc = new BlockLocation(minecartLoc.x + x, minecartLoc.y, minecartLoc.z + z);
        if (x == 0 && z == 0) {
          test.assertEntityPresent(minecartId, offsetLoc, true);
        } else {
          test.assertEntityPresent(minecartId, offsetLoc, false);
        }
      }
    }
  });
}).tag(GameTest.Tags.suiteDefault);

GameTest.register("APITests", "assert_entity_not_present", (test) => {
  const armorStandId = "minecraft:armor_stand";
  const pigId = "minecraft:pig";
  const armorStandLoc = new BlockLocation(1, 2, 1);
  const airLoc = new BlockLocation(0, 2, 1);

  try {
    test.assertEntityPresentInArea(armorStandId, false);
    test.fail(); // this assert should throw
  } catch (e) {}

  try {
    test.assertEntityPresent(armorStandId, armorStandLoc, false);
    test.fail(); // this assert should throw
  } catch (e) {}

  test.assertEntityPresent(armorStandId, airLoc, false);
  test.assertEntityPresentInArea(pigId, false);

  test.succeed();
})
  .structureName("APITests:armor_stand")
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("APITests", "assert_item_entity_count_is", (test) => {
  let oneItemLoc = new BlockLocation(3, 2, 1);
  let fiveItemsLoc = new BlockLocation(1, 2, 1);
  let noItemsLoc = new BlockLocation(2, 2, 1);
  let diamondPickaxeLoc = new BlockLocation(2, 2, 4);

  const oneEmerald = new ItemStack(MinecraftItemTypes.emerald, 1, 0);
  const onePickaxe = new ItemStack(MinecraftItemTypes.diamondPickaxe, 1, 0);
  const fiveEmeralds = new ItemStack(MinecraftItemTypes.emerald, 5, 0);

  test.spawnItem(oneEmerald, new Location(3.5, 3, 1.5));
  test.spawnItem(fiveEmeralds, new Location(1.5, 3, 1.5));

  // spawn 9 pickaxes in a 3x3 grid
  for (let x = 1.5; x <= 3.5; x++) {
    for (let z = 3.5; z <= 5.5; z++) {
      test.spawnItem(onePickaxe, new Location(x, 3, z));
    }
  }

  test.assertItemEntityCountIs(MinecraftItemTypes.emerald, noItemsLoc, 0, 0);

  test.succeedWhen(() => {
    test.assertItemEntityCountIs(MinecraftItemTypes.feather, oneItemLoc, 0, 0);
    test.assertItemEntityCountIs(MinecraftItemTypes.emerald, oneItemLoc, 0, 1);
    test.assertItemEntityCountIs(MinecraftItemTypes.feather, fiveItemsLoc, 0, 0);
    test.assertItemEntityCountIs(MinecraftItemTypes.emerald, fiveItemsLoc, 0, 5);
    test.assertItemEntityCountIs(MinecraftItemTypes.emerald, fiveItemsLoc, 0, 5);
    test.assertItemEntityCountIs(MinecraftItemTypes.diamondPickaxe, diamondPickaxeLoc, 1, 9);
    test.assertItemEntityCountIs(MinecraftItemTypes.diamondPickaxe, diamondPickaxeLoc, 0, 1);
  });
}).tag(GameTest.Tags.suiteDefault);

GameTest.register("APITests", "assert_entity_touching", (test) => {
  const armorStandId = "minecraft:armor_stand";

  test.assertEntityTouching(armorStandId, new Location(1.5, 2.5, 1.5), true);
  test.assertEntityTouching(armorStandId, new Location(1.5, 3.5, 1.5), true);
  test.assertEntityTouching(armorStandId, new Location(1.0, 2.5, 1.5), false);
  test.assertEntityTouching(armorStandId, new Location(2.0, 2.5, 1.5), false);
  test.assertEntityTouching(armorStandId, new Location(1.5, 2.5, 1.0), false);
  test.assertEntityTouching(armorStandId, new Location(1.5, 2.5, 2.0), false);

  test.succeed();
})
  .structureName("APITests:armor_stand")
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("APITests", "pulse_redstone", (test) => {
  const pulseLoc = new BlockLocation(1, 2, 2);
  const lampLoc = new BlockLocation(1, 2, 1);
  test.assertRedstonePower(lampLoc, 0);
  test.pulseRedstone(pulseLoc, 2);

  test
    .startSequence()
    .thenIdle(2)
    .thenExecute(() => test.assertRedstonePower(lampLoc, 15))
    .thenIdle(2)
    .thenExecute(() => test.assertRedstonePower(lampLoc, 0))
    .thenSucceed();
}).tag(GameTest.Tags.suiteDefault);

GameTest.register("APITests", "block_location", (test) => {
  let testLoc = new BlockLocation(1, 1, 1);
  let worldLoc = test.worldBlockLocation(testLoc);
  let relativeLoc = test.relativeBlockLocation(worldLoc);
  test.assert(!relativeLoc.equals(worldLoc), "Expected relativeLoc and worldLoc to be different");
  test.assert(relativeLoc.equals(testLoc), "Expected relativeLoc to match testLoc");
  test.succeed();
})
  .structureName("ComponentTests:platform")
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("APITests", "location", (test) => {
  let testLoc = new Location(1.2, 1.2, 1.2);
  let worldLoc = test.worldLocation(testLoc);
  let relativeLoc = test.relativeLocation(worldLoc);
  test.assert(!relativeLoc.isNear(worldLoc, 0.01), "Expected relativeLoc and worldLoc to be different");
  test.assert(relativeLoc.isNear(testLoc, 0.01), "Expected relativeLoc to match testLoc");
  test.succeed();
})
  .structureName("ComponentTests:platform")
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("APITests", "create_explosion_basic", (test) => {
  const center = new BlockLocation(2, 3, 2);

  test.assertBlockPresent(MinecraftBlockTypes.cobblestone, center, true);

  const loc = test.worldBlockLocation(center);
  const explosionLoc = new Location(loc.x + 0.5, loc.y + 0.5, loc.z + 0.5);
  test.getDimension().createExplosion(explosionLoc, 10, new ExplosionOptions());

  for (let x = 1; x <= 3; x++) {
    for (let y = 2; y <= 4; y++) {
      for (let z = 1; z <= 3; z++) {
        test.assertBlockPresent(MinecraftBlockTypes.cobblestone, new BlockLocation(x, y, z), false);
      }
    }
  }

  test.succeed();
})
  .padding(10) // The blast can destroy nearby items and mobs
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("APITests", "create_explosion_advanced", (test) => {
  const dimension = test.getDimension();
  const center = new BlockLocation(3, 3, 3);

  const pigId = "minecraft:pig<minecraft:ageable_grow_up>";
  const pigLoc = new BlockLocation(3, 4, 3);
  test.spawn(pigId, pigLoc);

  const loc = test.worldBlockLocation(center);
  const explosionLoc = new Location(loc.x + 0.5, loc.y + 0.5, loc.z + 0.5);
  let explosionOptions = new ExplosionOptions();

  test.assertBlockPresent(MinecraftBlockTypes.cobblestone, center, true);

  // Start by exploding without breaking blocks
  explosionOptions.breaksBlocks = false;
  const creeper = test.spawn("minecraft:creeper", new BlockLocation(1, 2, 1));
  explosionOptions.source = creeper;
  test.assertEntityPresent(pigId, pigLoc, true);
  dimension.createExplosion(explosionLoc, 10, explosionOptions);
  creeper.kill();
  test.assertEntityPresent(pigId, pigLoc, false);
  test.assertBlockPresent(MinecraftBlockTypes.cobblestone, center, true);

  // Next, explode with fire
  explosionOptions = new ExplosionOptions();
  explosionOptions.causesFire = true;

  let findFire = () => {
    let foundFire = false;
    for (let x = 0; x <= 6; x++) {
      for (let z = 0; z <= 6; z++) {
        try {
          test.assertBlockPresent(MinecraftBlockTypes.fire, new BlockLocation(x, 3, z), true);
          foundFire = true;
          break;
        } catch (e) {}
      }
    }
    return foundFire;
  };

  test.assert(!findFire(), "Unexpected fire");
  dimension.createExplosion(explosionLoc, 15, explosionOptions);
  test.assertBlockPresent(MinecraftBlockTypes.cobblestone, center, false);
  test.assert(findFire(), "No fire found");

  // Finally, explode in water
  explosionOptions.allowUnderwater = true;
  const belowWaterLoc = new BlockLocation(3, 1, 3);
  test.assertBlockPresent(MinecraftBlockTypes.air, belowWaterLoc, false);
  dimension.createExplosion(explosionLoc, 10, explosionOptions);
  test.assertBlockPresent(MinecraftBlockTypes.air, belowWaterLoc, true);
  test.succeed();
})
  .padding(10) // The blast can destroy nearby items and mobs
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("APITests", "triggerEvent", (test) => {
  const creeper = test.spawn("creeper", new BlockLocation(1, 2, 1));
  creeper.triggerEvent("minecraft:start_exploding_forced");

  test.succeedWhen(() => {
    test.assertEntityPresentInArea("creeper", false);
  });
})
  .structureName("ComponentTests:glass_cage")
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("APITests", "chat", (test) => {
  test.print("subscribing");

  const chatCallback = world.events.beforeChat.subscribe((eventData) => {
    if (eventData.message === "!killme") {
      eventData.sender.kill();
      eventData.cancel = true;
    } else if (eventData.message === "!players") {
      test.print(`There are ${eventData.targets.length} players in the server.`);
      for (const target of eventData.targets) {
        test.print("Player: " + target.name);
      }
    } else {
      eventData.message = `Modified '${eventData.message}'`;
    }
  });

  test
    .startSequence()
    .thenIdle(200)
    .thenExecute(() => {
      world.events.beforeChat.unsubscribe(chatCallback);
      test.print("unsubscribed");
    })
    .thenSucceed();
})
  .structureName("ComponentTests:platform")
  .maxTicks(1000)
  .tag(GameTest.Tags.suiteDisabled);

GameTest.register("APITests", "add_effect_event", (test) => {
  const villagerId = "minecraft:villager_v2<minecraft:ageable_grow_up>";
  const villager = test.spawn(villagerId, new BlockLocation(1, 2, 1));

  const pigId = "minecraft:pig<minecraft:ageable_grow_up>";
  const pig = test.spawn(pigId, new BlockLocation(1, 2, 1));

  let basicEffectSucceed = false;
  let filteredEntityEffectSucceed = false;
  let filteredTypeEffectSucceed = false;

  const effectAddCallback = world.events.effectAdd.subscribe((eventData) => {
    if (eventData.entity.id === "minecraft:villager_v2") {
      test.assert(eventData.effect.displayName === "Poison II", "Unexpected display name");
      test.assert(eventData.effectState === 1, "Unexpected effect state");
      basicEffectSucceed = true;
      if (filteredEntityEffectSucceed && basicEffectSucceed && filteredTypeEffectSucceed) test.succeed();
    }
  });

  let specificEntityOptions = new EntityEventOptions();
  specificEntityOptions.entities.push(villager);

  const effectEntityFilterAddCallback = world.events.effectAdd.subscribe((eventData) => {
    test.assert(eventData.entity.id === "minecraft:villager_v2", "Unexpected id");
    test.assert(eventData.effect.displayName === "Poison II", "Unexpected display name");
    test.assert(eventData.effectState === 1, "Unexpected effect state");
    filteredEntityEffectSucceed = true;
    if (filteredEntityEffectSucceed && basicEffectSucceed && filteredTypeEffectSucceed) test.succeed();
  }, specificEntityOptions);

  let entityTypeOptions = new EntityEventOptions();
  entityTypeOptions.entityTypes.push("minecraft:villager_v2");

  const effectTypeFilterAddCallback = world.events.effectAdd.subscribe((eventData) => {
    test.assert(eventData.entity.id === "minecraft:villager_v2", "Unexpected id");
    test.assert(eventData.effect.displayName === "Poison II", "Unexpected display name");
    test.assert(eventData.effectState === 1, "Unexpected effect state");
    filteredTypeEffectSucceed = true;
    if (filteredEntityEffectSucceed && basicEffectSucceed && filteredTypeEffectSucceed) test.succeed();
  }, entityTypeOptions);

  villager.addEffect(MinecraftEffectTypes.poison, 5, 1);
  pig.addEffect(MinecraftEffectTypes.poison, 5, 1);
  world.events.effectAdd.unsubscribe(effectAddCallback);
  world.events.effectAdd.unsubscribe(effectEntityFilterAddCallback);
  world.events.effectAdd.unsubscribe(effectTypeFilterAddCallback);
})
  .structureName("ComponentTests:animal_pen")
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("APITests", "piston", (test) => {
  const dimension = test.getDimension();
  const pistonLoc = new BlockLocation(1, 2, 1);
  const redstoneLoc = new BlockLocation(1, 2, 0);
  const pistonComp = test.getDimension().getBlock(test.worldBlockLocation(pistonLoc)).getComponent("piston");

  test.assert(pistonComp != undefined, "Expected piston component");

  let assertPistonState = (isMoving, isExpanded, isExpanding, isRetracted, isRetracting) => {
    test.assert(pistonComp.isMoving === isMoving, `Unexpected isMoving, expected[${isMoving}] actual[${pistonComp.isMoving}]`);
    test.assert(pistonComp.isExpanded === isExpanded, `Unexpected isExpanded, expected[${isExpanded}] actual[${pistonComp.isExpanded}]`);
    test.assert(pistonComp.isExpanding === isExpanding, `Unexpected isExpanding, expected[${isExpanding}] actual[${pistonComp.isExpanding}]`);
    test.assert(pistonComp.isRetracted === isRetracted, `Unexpected isRetracted, expected[${isRetracted}] actual[${pistonComp.isRetracted}]`);
    test.assert(pistonComp.isRetracting === isRetracting, `Unexpected isRetracting, expected[${isRetracting}] actual[${pistonComp.isRetracting}]`);
  };

  test
    .startSequence()
    .thenExecute(() => {
      test.assert(pistonComp.attachedBlocks.length === 0, "Expected 0 attached blocks");
      assertPistonState(false, false, false, true, false); // isRetracted
      test.setBlockType(MinecraftBlockTypes.redstoneBlock, redstoneLoc);
    })
    .thenIdle(3)
    .thenExecute(() => {
      test.assert(pistonComp.attachedBlocks.length === 3, `Expected 3 attached blocks, actual [${pistonComp.attachedBlocks.length}]`);
      assertPistonState(true, false, true, false, false); // isMoving, isExpanding
    })
    .thenIdle(2)
    .thenExecute(() => {
      assertPistonState(false, true, false, false, false); // isExpanded
      test.setBlockType(MinecraftBlockTypes.air, redstoneLoc);
    })
    .thenIdle(3)
    .thenExecute(() => {
      assertPistonState(true, false, false, false, true); // isMoving, isRetracting
    })
    .thenIdle(2)
    .thenExecute(() => {
      assertPistonState(false, false, false, true, false); // isRetracted
    })
    .thenSucceed();
}).tag(GameTest.Tags.suiteDefault);

GameTest.register("APITests", "piston_event", (test) => {
  let expanded = false;
  let retracted = false;
  const redstoneLoc = new BlockLocation(1, 2, 0);
  const pistonLoc = new BlockLocation(1, 2, 1);
  const planksLoc = new BlockLocation(2, 2, 1);

  const pistonCallback = world.events.pistonActivate.subscribe((pistonEvent) => {
    test.assert(pistonEvent.piston !== undefined, "Expected piston");
    if (pistonEvent.piston.location.equals(test.worldBlockLocation(pistonLoc))) {
      if (pistonEvent.isExpanding) {
        expanded = true;
      } else {
        retracted = true;
      }
    }
  });

  test
    .startSequence()
    .thenExecute(() => {
      test.pulseRedstone(redstoneLoc, 2);
    })
    .thenExecuteAfter(8, () => {
      test.assertBlockPresent(MinecraftBlockTypes.air, planksLoc, true);
      test.assert(expanded, "Expected piston expanding event");
      test.assert(retracted, "Expected piston retracting event");
      world.events.beforePistonActivate.unsubscribe(pistonCallback);
    })
    .thenSucceed();
})
  .structureName("APITests:piston")
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("APITests", "piston_event_canceled", (test) => {
  let canceled = false;
  const redstoneLoc = new BlockLocation(1, 2, 0);
  const pistonLoc = new BlockLocation(1, 2, 1);
  const planksLoc = new BlockLocation(2, 2, 1);

  const pistonCallback = world.events.beforePistonActivate.subscribe((pistonEvent) => {
    test.assert(pistonEvent.piston !== undefined, "Expected piston");
    if (pistonEvent.piston.location.equals(test.worldBlockLocation(pistonLoc))) {
      pistonEvent.cancel = true;
      canceled = true;
    }
  });

  test
    .startSequence()
    .thenExecute(() => {
      test.pulseRedstone(redstoneLoc, 2);
    })
    .thenExecuteAfter(8, () => {
      test.assert(canceled, "Expected canceled beforePistonActivate event");
      test.assertBlockPresent(MinecraftBlockTypes.planks, planksLoc, true);
      world.events.beforePistonActivate.unsubscribe(pistonCallback);
    })
    .thenSucceed();
})
  .structureName("APITests:piston")
  .tag(GameTest.Tags.suiteDefault);

GameTest.registerAsync("APITests", "lever_event", async (test) => {
  const leverLoc = new BlockLocation(1, 2, 1);
  let leverPower = false;

  const leverCallback = world.events.leverActivate.subscribe((leverEvent) => {
    let blockLoc = test.relativeBlockLocation(leverEvent.block.location);
    test.assert(blockLoc.equals(leverLoc), "Expected lever present in leverLoc");
    test.assert(!leverEvent.player, "Expected player object to be empty");
    test.assert(leverEvent.dimension === test.getDimension(), "Unexpected dimension");
    leverPower = leverEvent.isPowered;
  });

  test.setBlockType(MinecraftBlockTypes.lever, leverLoc);
  await test.idle(5);
  test.pullLever(leverLoc);
  world.events.leverActivate.unsubscribe(leverCallback);
  test.assert(leverPower, "Expected lever power");
  test.succeed();
})
  .structureName("ComponentTests:platform")
  .tag(GameTest.Tags.suiteDefault);

GameTest.registerAsync("APITests", "lever_event_multiple_toggles", async (test) => {
  const leverLoc = new BlockLocation(1, 2, 1);
  let leverPower = false;

  const leverCallback = world.events.leverActivate.subscribe((leverEvent) => {
    let blockLoc = test.relativeBlockLocation(leverEvent.block.location);
    test.assert(blockLoc.equals(leverLoc), "Expected lever present in leverLoc");
    test.assert(!leverEvent.player, "Expected player object to be empty");
    test.assert(leverEvent.dimension === test.getDimension(), "Unexpected dimension");
    leverPower = leverEvent.isPowered;
  });

  test.setBlockType(MinecraftBlockTypes.lever, leverLoc);
  await test.idle(5);
  test.pullLever(leverLoc);
  test.assert(leverPower, "Expected lever power");
  test.pullLever(leverLoc);
  test.assert(!leverPower, "Expected no lever power");
  world.events.leverActivate.unsubscribe(leverCallback);
  test.succeed();
})
  .structureName("ComponentTests:platform")
  .tag(GameTest.Tags.suiteDefault);

GameTest.registerAsync("APITests", "lever_event_player", async (test) => {
  const leverLoc = new BlockLocation(1, 2, 1);
  let eventPlayer;
  let testSucceed = false;

  const leverCallback = world.events.leverActivate.subscribe((leverEvent) => {
    eventPlayer = leverEvent.player;
    test.assert(eventPlayer == simulatedPlayer, "incorrect player found");
    let blockLoc = test.relativeBlockLocation(leverEvent.block.location);
    test.assert(blockLoc.equals(leverLoc), "Expected lever present in leverLoc");
    test.assert(leverEvent.dimension === test.getDimension(), "Unexpected dimension");
    test.assert(eventPlayer.name === "Lever_Toggle_Player", "Lever event's player name does not match expected");
    testSucceed = true;
  });

  test.setBlockType(MinecraftBlockTypes.lever, leverLoc);
  const simulatedPlayer = test.spawnSimulatedPlayer(new BlockLocation(2, 2, 1), "Lever_Toggle_Player");
  await test.idle(5);
  simulatedPlayer.interactWithBlock(leverLoc);
  world.events.leverActivate.unsubscribe(leverCallback);
  test.assert(testSucceed, "An assert failure occured during callback");
  test.succeed();
})
  .structureName("ComponentTests:platform")
  .tag(GameTest.Tags.suiteDefault);

GameTest.registerAsync("APITests", "button_event", async (test) => {
  const buttonLoc = new BlockLocation(1, 2, 1);
  const buttonPermutation = MinecraftBlockTypes.acaciaButton.createDefaultBlockPermutation();
  let testSucceed = false;

  buttonPermutation.getProperty(BlockProperties.facingDirection).value = Direction.up;

  const buttonCallback = world.events.buttonPush.subscribe((buttonEvent) => {
    let blockLoc = test.relativeBlockLocation(buttonEvent.block.location);
    if (blockLoc.equals(buttonLoc)) {
      test.assert(buttonEvent.source === undefined, "Script source should be null");
      test.assert(buttonEvent.dimension === test.getDimension(), "Unexpected dimension");
      test.assert(!testSucceed, "Callback expected only once");
      testSucceed = true;
    }
  });

  test.setBlockPermutation(buttonPermutation, buttonLoc);
  test.pressButton(buttonLoc);
  world.events.buttonPush.unsubscribe(buttonCallback);
  test.assert(testSucceed, "An assert failure occured during callback");
  test.succeed();
})
  .structureName("ComponentTests:platform")
  .tag(GameTest.Tags.suiteDefault);

GameTest.registerAsync("APITests", "button_event_player", async (test) => {
  const buttonLoc = new BlockLocation(1, 2, 1);
  const buttonPermutation = MinecraftBlockTypes.acaciaButton.createDefaultBlockPermutation();
  let testSucceed = false;

  buttonPermutation.getProperty(BlockProperties.facingDirection).value = Direction.up;

  const buttonCallback = world.events.buttonPush.subscribe((buttonEvent) => {
    let eventPlayer = buttonEvent.source;
    let blockLoc = test.relativeBlockLocation(buttonEvent.block.location);
    if (blockLoc.equals(buttonLoc) && eventPlayer == simulatedPlayer) {
      test.assert(buttonEvent.dimension === test.getDimension(), "Unexpected dimension");
      test.assert(eventPlayer.name === "Button_Push_Player", "Button event's player name does not match expected");
      test.assert(buttonEvent.source === eventPlayer, "Button event's source does not match expected");
      test.assert(!testSucceed, "Callback expected only once");
      testSucceed = true;
    }
  });

  const simulatedPlayer = test.spawnSimulatedPlayer(new BlockLocation(2, 2, 1), "Button_Push_Player");
  await test.idle(5);
  test.setBlockPermutation(buttonPermutation, buttonLoc);
  simulatedPlayer.interactWithBlock(buttonLoc);
  world.events.buttonPush.unsubscribe(buttonCallback);
  test.assert(testSucceed, "An assert failure occured during callback");
  test.succeed();
})
  .structureName("ComponentTests:platform")
  .tag(GameTest.Tags.suiteDefault);

GameTest.registerAsync("APITests", "button_event_projectile", async (test) => {
  const buttonLoc = new BlockLocation(1, 2, 1);
  const buttonPermutation = MinecraftBlockTypes.acaciaButton.createDefaultBlockPermutation();
  let testSucceed = false;
  let spawnedArrow;

  buttonPermutation.getProperty(BlockProperties.facingDirection).value = Direction.up;

  const buttonCallback = world.events.buttonPush.subscribe((buttonEvent) => {
    let blockLoc = test.relativeBlockLocation(buttonEvent.block.location);
    if (blockLoc.equals(buttonLoc)) {
      test.assert(buttonEvent.dimension === test.getDimension(), "Unexpected dimension");
      test.assert(buttonEvent.source === spawnedArrow, "Expected arrow source type");
      test.assert(!testSucceed, "Callback expected only once");
      testSucceed = true;
    }
  });

  test.setBlockPermutation(buttonPermutation, buttonLoc);
  spawnedArrow = test.spawnAtLocation("minecraft:arrow", new Location(1.5, 2.5, 1.5));
  await test.idle(20); //give the arrow time to fall
  world.events.buttonPush.unsubscribe(buttonCallback);
  test.assert(testSucceed, "An assert failure occured during callback");
  test.succeed();
})
  .structureName("ComponentTests:platform")
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("APITests", "sneaking", (test) => {
  const pigId = "minecraft:pig<minecraft:ageable_grow_up>";
  const pigLoc = new BlockLocation(1, 2, 1);
  const pig = test.spawn(pigId, pigLoc);
  pig.isSneaking = true;
  test
    .startSequence()
    .thenExecuteAfter(120, () => {
      test.assertEntityPresent(pigId, pigLoc, true);
    })
    .thenSucceed();
})
  .maxTicks(130)
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("APITests", "assert_can_reach_location", (test) => {
  const villagerId = "minecraft:villager_v2<minecraft:ageable_grow_up>";
  const villager1 = test.spawn(villagerId, new BlockLocation(1, 2, 1));
  const villager2 = test.spawn(villagerId, new BlockLocation(1, 2, 3));
  const villager3 = test.spawn(villagerId, new BlockLocation(1, 2, 5));
  test.assertCanReachLocation(villager1, new BlockLocation(4, 2, 1), true);
  test.assertCanReachLocation(villager2, new BlockLocation(4, 2, 3), false);
  test.assertCanReachLocation(villager3, new BlockLocation(4, 2, 5), false);
  test.succeed();
}).tag(GameTest.Tags.suiteDefault);

const isLocationInTest = (test, worldLoc) => {
  const size = 4;
  let loc = test.relativeBlockLocation(worldLoc);
  return loc.x >= 0 && loc.y >= 0 && loc.z >= 0 && loc.x < size && loc.y < size && loc.z < size;
};

GameTest.register("APITests", "explosion_event", (test) => {
  let exploded = false;
  const cobblestoneLoc = new BlockLocation(1, 3, 1);
  const polishedAndesiteLoc = new BlockLocation(1, 1, 1);

  const beforeExplosionCallback = world.events.beforeExplosion.subscribe((explosionEvent) => {
    if (!isLocationInTest(test, explosionEvent.impactedBlocks[0])) return;
    test.assert(explosionEvent.dimension !== undefined, "Expected dimension");
    test.assert(explosionEvent.source !== undefined, "Expected source");
    test.assert(explosionEvent.impactedBlocks.length === 10, "Unexpected number of impacted blocks");
    test.assertBlockPresent(MinecraftBlockTypes.cobblestone, cobblestoneLoc, true);
    explosionEvent.impactedBlocks = [test.worldBlockLocation(cobblestoneLoc)];
  });

  const explosionCallback = world.events.explosion.subscribe((explosionEvent) => {
    test.assert(explosionEvent.dimension !== undefined, "Expected dimension");
    test.assert(explosionEvent.source !== undefined, "Expected source");
    test.assert(explosionEvent.impactedBlocks.length === 1, "Unexpected number of impacted blocks");
    exploded = true;
  });

  test
    .startSequence()
    .thenExecute(() => {
      test.setBlockType(MinecraftBlockTypes.cobblestone, cobblestoneLoc);
      test.spawn("tnt", new BlockLocation(1, 2, 1));
    })
    .thenExecuteAfter(85, () => {
      test.assert(exploded, "Expected explosion event");
      test.assertBlockPresent(MinecraftBlockTypes.stone, polishedAndesiteLoc, true);
      test.assertBlockPresent(MinecraftBlockTypes.cobblestone, cobblestoneLoc, false);
      world.events.beforeExplosion.unsubscribe(beforeExplosionCallback);
      world.events.explosion.unsubscribe(explosionCallback);
    })
    .thenSucceed();
})
  .padding(10) // The blast can destroy nearby items and mobs
  .structureName("ComponentTests:platform")
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("APITests", "explosion_event_canceled", (test) => {
  let canceled = false;
  const cobblestoneLoc = new BlockLocation(1, 3, 1);

  const explosionCallback = world.events.beforeExplosion.subscribe((explosionEvent) => {
    if (!isLocationInTest(test, explosionEvent.impactedBlocks[0])) return;
    test.assert(explosionEvent.dimension !== undefined, "Expected dimension");
    test.assert(explosionEvent.source !== undefined, "Expected source");
    test.assert(explosionEvent.impactedBlocks.length === 10, "Unexpected number of impacted blocks");
    explosionEvent.cancel = true;
    canceled = true;
  });

  test
    .startSequence()
    .thenExecute(() => {
      test.setBlockType(MinecraftBlockTypes.cobblestone, cobblestoneLoc);
      test.spawn("tnt", new BlockLocation(1, 2, 1));
    })
    .thenExecuteAfter(85, () => {
      test.assert(canceled, "Expected canceled beforeExplosionEvent event");
      test.assertBlockPresent(MinecraftBlockTypes.cobblestone, cobblestoneLoc, true);
      world.events.beforeExplosion.unsubscribe(explosionCallback);
    })
    .thenSucceed();
})
  .padding(10) // The blast can destroy nearby items and mobs
  .structureName("ComponentTests:platform")
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("APITests", "explode_block_event", (test) => {
  let explodedCount = 0;
  const cobblestoneLoc = new BlockLocation(1, 3, 1);

  const blockExplodeCallback = world.events.blockExplode.subscribe((blockExplodeEvent) => {
    if (!isLocationInTest(test, blockExplodeEvent.block.location)) return;
    test.assert(blockExplodeEvent.source !== undefined, "Expected source");
    explodedCount++;
  });

  test
    .startSequence()
    .thenExecute(() => {
      test.setBlockType(MinecraftBlockTypes.cobblestone, cobblestoneLoc);
      test.spawn("tnt", new BlockLocation(1, 2, 1));
    })
    .thenExecuteAfter(85, () => {
      test.assert(explodedCount === 10, "Unexpected number of exploded blocks");
      world.events.blockExplode.unsubscribe(blockExplodeCallback);
    })
    .thenSucceed();
})
  .padding(10) // The blast can destroy nearby items and mobs
  .structureName("ComponentTests:platform")
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("APITests", "connectivity", (test) => {
  const centerLoc = new BlockLocation(1, 2, 1);

  let connectivity = test.getFenceConnectivity(centerLoc);

  test.assert(!connectivity.north, "The stair is not oriented the right way to connect");
  test.assert(connectivity.east, "Should connect to another fence");
  test.assert(connectivity.south, "Should connect to another fence");
  test.assert(connectivity.west, "Should connect to the back of the stairs");

  test.succeed();
})
  .rotateTest(true)
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("APITests", "spawn_at_location", (test) => {
  const spawnLoc = new Location(1.3, 2, 1.3);
  const chicken = test.spawnAtLocation("chicken", spawnLoc);

  test
    .startSequence()
    .thenExecute(() => {
      const chickenLoc = chicken.location;
      const relativeChickenLoc = test.relativeLocation(chickenLoc);
      test.assert(relativeChickenLoc.isNear(spawnLoc, 0.01), "Unexpected spawn location");
    })
    .thenSucceed();
})
  .structureName("ComponentTests:animal_pen")
  .rotateTest(true)
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("APITests", "walk_to_location", (test) => {
  const spawnLoc = new BlockLocation(1, 2, 1);
  const chicken = test.spawnWithoutBehaviors("chicken", spawnLoc);

  const targetLoc = new Location(2.2, 2, 3.2);
  test.walkToLocation(chicken, targetLoc, 1);

  test.succeedWhen(() => {
    const chickenLoc = chicken.location;
    const relativeChickenLoc = test.relativeLocation(chickenLoc);
    // Mobs will stop navigating as soon as they intersect the target location
    test.assert(relativeChickenLoc.isNear(targetLoc, 0.65), "Chicken did not reach the target location");
  });
})
  .structureName("ComponentTests:large_animal_pen")
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("APITests", "walk_to_location_far", (test) => {
  const targetLoc = new BlockLocation(3, 2, 17);
  const zombie = test.spawnWithoutBehaviors("minecraft:zombie<minecraft:ageable_grow_up>", new BlockLocation(1, 2, 1));
  test.walkTo(zombie, targetLoc);
  test.succeedWhen(() => {
    test.assertRedstonePower(targetLoc, 15);
  });
})
  .maxTicks(400)
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("APITests", "spread_from_face_toward_direction", (test) => {
  const testEx = new GameTestExtensions(test);

  let multifaceLoc = new BlockLocation(1, 4, 0);
  let spreadLoc = new BlockLocation(1, 3, 0);

  const glowLichenPermutation = MinecraftBlockTypes.glowLichen.createDefaultBlockPermutation();
  glowLichenPermutation.getProperty(BlockProperties.multiFaceDirectionBits).value =
    1 << testEx.getMultiFaceDirection(test.getTestDirection());
  test.setBlockPermutation(glowLichenPermutation, multifaceLoc);

  test.assertBlockPresent(MinecraftBlockTypes.glowLichen, multifaceLoc, true);
  test.assertBlockPresent(MinecraftBlockTypes.glowLichen, spreadLoc, false);

  test.spreadFromFaceTowardDirection(multifaceLoc, test.getTestDirection(), Direction.down);
  test
    .startSequence()
    .thenExecuteAfter(1, () => {
      test.assertBlockPresent(MinecraftBlockTypes.glowLichen, spreadLoc, true);
    })
    .thenSucceed();
})
  .rotateTest(true)
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("APITests", "rotate_direction", (test) => {
  test.assert(
    test.rotateDirection(Direction.south) == test.getTestDirection(),
    "Expected rotated south direction to match test direction"
  );

  switch (test.getTestDirection()) {
    case Direction.north:
      test.assert(
        test.rotateDirection(Direction.north) === Direction.south,
        "Unexpected rotated direction for Direction.north with testDirection Direction.north"
      );
      test.assert(
        test.rotateDirection(Direction.east) === Direction.west,
        "Unexpected rotated direction for Direction.east with testDirection Direction.north"
      );
      test.assert(
        test.rotateDirection(Direction.south) === Direction.north,
        "Unexpected rotated direction for Direction.south with testDirection Direction.north"
      );
      test.assert(
        test.rotateDirection(Direction.west) === Direction.east,
        "Unexpected rotated direction for Direction.west with testDirection Direction.north"
      );
      break;
    case Direction.east:
      test.assert(
        test.rotateDirection(Direction.north) === Direction.west,
        "Unexpected rotated direction for Direction.north with testDirection Direction.east"
      );
      test.assert(
        test.rotateDirection(Direction.east) === Direction.north,
        "Unexpected rotated direction for Direction.east with testDirection Direction.east"
      );
      test.assert(
        test.rotateDirection(Direction.south) === Direction.east,
        "Unexpected rotated direction for Direction.south with testDirection Direction.east"
      );
      test.assert(
        test.rotateDirection(Direction.west) === Direction.south,
        "Unexpected rotated direction for Direction.west with testDirection Direction.east"
      );
      break;
    case Direction.south:
      test.assert(
        test.rotateDirection(Direction.north) === Direction.north,
        "Unexpected rotated direction for Direction.north with testDirection Direction.south"
      );
      test.assert(
        test.rotateDirection(Direction.east) === Direction.east,
        "Unexpected rotated direction for Direction.east with testDirection Direction.south"
      );
      test.assert(
        test.rotateDirection(Direction.south) === Direction.south,
        "Unexpected rotated direction for Direction.south with testDirection Direction.south"
      );
      test.assert(
        test.rotateDirection(Direction.west) === Direction.west,
        "Unexpected rotated direction for Direction.west with testDirection Direction.south"
      );
      break;
    case Direction.west:
      test.assert(
        test.rotateDirection(Direction.north) === Direction.east,
        "Unexpected rotated direction for Direction.north with testDirection Direction.west"
      );
      test.assert(
        test.rotateDirection(Direction.east) === Direction.south,
        "Unexpected rotated direction for Direction.east with testDirection Direction.west"
      );
      test.assert(
        test.rotateDirection(Direction.south) === Direction.west,
        "Unexpected rotated direction for Direction.south with testDirection Direction.west"
      );
      test.assert(
        test.rotateDirection(Direction.west) === Direction.north,
        "Unexpected rotated direction for Direction.west with testDirection Direction.west"
      );
      break;
    default:
      test.assert(false, "Invalid test direction");
  }

  const buttonLoc = new BlockLocation(1, 2, 1);
  const buttonPermutation = MinecraftBlockTypes.stoneButton.createDefaultBlockPermutation();
  buttonPermutation.getProperty(BlockProperties.facingDirection).value = test.rotateDirection(Direction.north);
  test.setBlockPermutation(buttonPermutation, buttonLoc);

  test
    .startSequence()
    .thenExecuteAfter(2, () => {
      test.assertBlockPresent(MinecraftBlockTypes.stoneButton, buttonLoc, true);
    })
    .thenSucceed();
})
  .rotateTest(true)
  .tag(GameTest.Tags.suiteDefault);

function isNear(a, b, epsilon = 0.001) {
  return Math.abs(a - b) < epsilon;
}

function isNearVec(a, b, epsilon = 0.001) {
  return Vector.distance(a, b) < epsilon;
}

GameTest.register("APITests", "cauldron", (test) => {
  const loc = new BlockLocation(0, 1, 0);
  var block = test.getBlock(loc);

  test.setFluidContainer(loc, FluidType.water);
  test.assert(block.getComponent("waterContainer") != null, "This is a water container");
  test.assert(
    block.getComponent("lavaContainer") == null,
    "A water container should not have a lavaContainer component"
  );
  test.assert(
    block.getComponent("snowContainer") == null,
    "A water container should not have a snowContainer component"
  );
  test.assert(
    block.getComponent("potionContainer") == null,
    "A water container should not have a potionContainer component"
  );

  block.getComponent("waterContainer").fillLevel = FluidContainer.maxFillLevel;
  test.assert(
    block.getComponent("waterContainer").fillLevel == FluidContainer.maxFillLevel,
    "The fill level should match with what it was set to"
  );

  block.getComponent("waterContainer").customColor = new Color(1, 0, 0, 1);
  test.assert(block.getComponent("waterContainer").customColor.red == 1, "red component should be set");
  test.assert(block.getComponent("waterContainer").customColor.green == 0, "green component should be set");
  test.assert(block.getComponent("waterContainer").customColor.blue == 0, "blue component should be set");

  block.getComponent("waterContainer").addDye(MinecraftItemTypes.blueDye);
  test.assert(isNear(block.getComponent("waterContainer").customColor.red, 0.616), "red component should be set");
  test.assert(isNear(block.getComponent("waterContainer").customColor.green, 0.133), "green component should be set");
  test.assert(isNear(block.getComponent("waterContainer").customColor.blue, 0.333), "blue component should be set");

  test.setFluidContainer(loc, FluidType.lava);
  test.assert(
    block.getComponent("waterContainer") == null,
    "A lava container should not have a waterContainer component"
  );
  test.assert(block.getComponent("lavaContainer") != null, "This is a lava component");
  test.assert(
    block.getComponent("snowContainer") == null,
    "A lava container should not have a snowContainer component"
  );
  test.assert(
    block.getComponent("potionContainer") == null,
    "A lava container should not have a potionContainer component"
  );

  test.setFluidContainer(loc, FluidType.powderSnow);
  test.assert(
    block.getComponent("waterContainer") == null,
    "A snow container should not have a waterContainer component"
  );
  test.assert(
    block.getComponent("lavaContainer") == null,
    "A snow container should not have a lavaContainer component"
  );
  test.assert(block.getComponent("snowContainer") != null, "This is a snow container");
  test.assert(
    block.getComponent("potionContainer") == null,
    "A snow container should not have a potionContainer component"
  );

  test.setFluidContainer(loc, FluidType.potion);
  test.assert(
    block.getComponent("snowContainer") == null,
    "A potion container should not have a waterContainer component"
  );
  test.assert(
    block.getComponent("lavaContainer") == null,
    "A potion container should not have a lavaContainer component"
  );
  test.assert(
    block.getComponent("snowContainer") == null,
    "A potion container should not have a snowContainer component"
  );
  test.assert(block.getComponent("potionContainer") != null, "This is a potion container");

  test.succeed();
}).tag(GameTest.Tags.suiteDefault);

// test for bug: 678331
GameTest.register("APITests", "cauldron_nocrash", (test) => {
  const loc = new BlockLocation(0, 1, 0);
  var block = test.getBlock(loc);

  test.setBlockType(MinecraftBlockTypes.air, loc);
  test.setBlockType(MinecraftBlockTypes.cauldron, loc);
  test.setFluidContainer(loc, FluidType.potion);

  let cauldron = block.getComponent("potionContainer");
  cauldron.fillLevel = 2;

  const poisonPotion = new ItemStack(MinecraftItemTypes.splashPotion, 1, 32);
  cauldron.setPotionType(poisonPotion); //this line crashes the title

  test.succeed();
})
  .structureName("APITests:cauldron")
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("APITests", "jukebox", (test) => {
  var jukeboxBlock = test.getBlock(new BlockLocation(0, 1, 0));
  var musicPlayerComp = jukeboxBlock.getComponent("recordPlayer");

  try {
    musicPlayerComp.setRecord(MinecraftItemTypes.apple);
    test.fail("An exception should be thrown when playing an item that is not a music disk");
  } catch (e) {}

  test.assert(musicPlayerComp.isPlaying() === false, "Should be stopped");
  musicPlayerComp.setRecord(MinecraftItemTypes.musicDiscMellohi);
  test.assert(musicPlayerComp.isPlaying() === true, "Should be playing");

  test
    .startSequence()
    .thenExecuteAfter(20, () => {
      test.assert(musicPlayerComp.isPlaying() === true, "Disk should not be finished yet");
      musicPlayerComp.clearRecord();
      test.assert(musicPlayerComp.isPlaying() === false, "Disk should be stopped now");
    })
    .thenSucceed();
})
  .maxTicks(25)
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("APITests", "maybe_fill_cauldron", (test) => {
  test
    .startSequence()
    .thenExecute(() => {
      test.triggerInternalBlockEvent(new BlockLocation(1, 3, 1), "minecraft:drip");
      test.triggerInternalBlockEvent(new BlockLocation(3, 3, 1), "minecraft:drip");
    })
    .thenIdle(61)
    .thenExecute(() => {
      var waterCauldron = test.getBlock(new BlockLocation(3, 2, 1));
      var lavaCauldron = test.getBlock(new BlockLocation(1, 2, 1));
      test.assert(
        waterCauldron.getComponent("waterContainer").fillLevel == 2,
        "Expected water to be at level 2, but got " + waterCauldron.getComponent("waterContainer").fillLevel
      );
      test.assert(
        lavaCauldron.getComponent("lavaContainer").fillLevel == FluidContainer.maxFillLevel,
        "Expected lava to be full, but got a fill level of " + lavaCauldron.getComponent("lavaContainer").fillLevel
      );
    })
    .thenSucceed();
})
  .setupTicks(30) // time it takes lava to flow.
  .maxTicks(100)
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("APITests", "grow_pointed_dripstone", (test) => {
  test.triggerInternalBlockEvent(new BlockLocation(1, 5, 1), "grow_stalagtite");
  test.assertBlockPresent(MinecraftBlockTypes.pointedDripstone, new BlockLocation(1, 4, 1), true);
  test.assertBlockPresent(MinecraftBlockTypes.pointedDripstone, new BlockLocation(1, 2, 1), false);

  test.triggerInternalBlockEvent(new BlockLocation(1, 5, 1), "grow_stalagmite");
  test.assertBlockPresent(MinecraftBlockTypes.pointedDripstone, new BlockLocation(1, 4, 1), true);
  test.assertBlockPresent(MinecraftBlockTypes.pointedDripstone, new BlockLocation(1, 2, 1), true);

  test.assertBlockPresent(MinecraftBlockTypes.pointedDripstone, new BlockLocation(1, 3, 1), false);

  test.succeed();
}).tag(GameTest.Tags.suiteDefault);

GameTest.register("APITests", "vines", (test) => {
  const testEx = new GameTestExtensions(test);

  const allBitmask = 15;
  const northBitmask = 1 << testEx.getVineDirection(test.rotateDirection(Direction.north));
  const eastBitmask = 1 << testEx.getVineDirection(test.rotateDirection(Direction.east));
  const southBitmask = 1 << testEx.getVineDirection(test.rotateDirection(Direction.south));
  const westBitmask = 1 << testEx.getVineDirection(test.rotateDirection(Direction.west));

  test.triggerInternalBlockEvent(new BlockLocation(1, 4, 2), "grow_down", [southBitmask | northBitmask]);
  testEx.assertBlockProperty(
    BlockProperties.vineDirectionBits,
    southBitmask | northBitmask,
    new BlockLocation(1, 3, 2)
  );

  test.triggerInternalBlockEvent(new BlockLocation(1, 4, 2), "grow_up", [allBitmask]);
  testEx.assertBlockProperty(BlockProperties.vineDirectionBits, southBitmask | eastBitmask, new BlockLocation(1, 5, 2));

  test.triggerInternalBlockEvent(new BlockLocation(7, 2, 1), "grow_sideways", [
    testEx.getVineDirection(test.rotateDirection(Direction.west)),
  ]);
  testEx.assertBlockProperty(BlockProperties.vineDirectionBits, southBitmask, new BlockLocation(6, 2, 1));

  test.triggerInternalBlockEvent(new BlockLocation(6, 2, 1), "grow_sideways", [
    testEx.getVineDirection(test.rotateDirection(Direction.west)),
  ]);
  testEx.assertBlockProperty(BlockProperties.vineDirectionBits, southBitmask | westBitmask, new BlockLocation(6, 2, 1));

  test.triggerInternalBlockEvent(new BlockLocation(7, 2, 1), "grow_sideways", [
    testEx.getVineDirection(test.rotateDirection(Direction.east)),
  ]);
  testEx.assertBlockProperty(BlockProperties.vineDirectionBits, westBitmask, new BlockLocation(8, 2, 2));

  test.succeed();
})
  .rotateTest(true)
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("APITests", "tags", (test) => {
  const player = test.spawnSimulatedPlayer(new BlockLocation(1, 2, 1), "tag_player");
  const dimension = test.getDimension();

  test
    .startSequence()
    .thenExecuteAfter(2, () => {
      dimension.runCommand("tag @p[name=tag_player] add test_tag_1");
      test.assert(player.hasTag("test_tag_1"), "Expected tag test_tag_1");
      test.assert(!player.hasTag("test_tag_2"), "Did not expect tag test_tag_2");
      test.assert(player.removeTag("test_tag_1"), "Expected successful tag removal");
      test.assert(!player.removeTag("test_tag_1"), "Expected failed tag removal");
      test.assert(!player.hasTag("test_tag_1"), "Did not expect tag test_tag_1");
      player.addTag("test_tag_2");
      test.assert(player.hasTag("test_tag_2"), "Expected tag test_tag_2");
      let tags = player.getTags();
      test.assert(tags.length === 1 && tags[0] === "test_tag_2", "Unexpected tags value");
    })
    .thenSucceed();
})
  .structureName("ComponentTests:platform")
  .tag(GameTest.Tags.suiteDefault);

//AI tests
GameTest.register("APITests", "can_set_target", (test) => {
  const player = test.spawnSimulatedPlayer(new BlockLocation(1, 2, 1));
  let wolf = test.spawn("minecraft:wolf<minecraft:ageable_grow_up>", new BlockLocation(2, 2, 1));

  test
    .startSequence()
    .thenExecuteAfter(10, () => {
      wolf.target = player;
      const targetActor = wolf.target;
      wolf.kill();
      test.assert(targetActor == player, "Failed to set/get target on wolf");
    })
    .thenSucceed();
})
  .structureName("ComponentTests:platform")
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("APITests", "set_target_attacks_player", (test) => {
  const player = test.spawnSimulatedPlayer(new BlockLocation(1, 2, 1));
  let wolf = test.spawn("minecraft:wolf<minecraft:ageable_grow_up>", new BlockLocation(2, 2, 1));

  test
    .startSequence()
    .thenExecuteAfter(10, () => {
      wolf.target = player;
    })
    .thenWait(() => {
      const healthComponent = player.getComponent("minecraft:health");
      test.assert(healthComponent.current != healthComponent.value, "Player should have been attacked");
    })
    .thenExecute(() => {
      wolf.kill();
    })
    .thenSucceed();
})
  .maxTicks(200)
  .structureName("ComponentTests:platform")
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("APITests", "can_get_null_target", (test) => {
  const player = test.spawnSimulatedPlayer(new BlockLocation(1, 2, 1));
  let wolf = test.spawn("minecraft:wolf<minecraft:ageable_grow_up>", new BlockLocation(2, 2, 1));

  const target = wolf.target;
  if (target) {
    test.fail("Expected wolf to not have a target");
  }

  test.succeed();
})
  .structureName("ComponentTests:platform")
  .tag(GameTest.Tags.suiteDefault);

//Entity Teleport Tests
GameTest.register("APITests", "teleport_mob", async (test) => {
  let sheepSpawn = new BlockLocation(0, 2, 0);
  let teleportBlockLoc = new BlockLocation(2, 2, 2);
  let sheep = test.spawn("minecraft:sheep", sheepSpawn);
  let teleportLoc = new Location(2, 2, 2);
  let teleportWorldLoc = test.worldLocation(teleportLoc);

  await test.idle(10);
  sheep.teleport(teleportWorldLoc, sheep.dimension, 0.0, 0.0);
  test.assertEntityPresent("minecraft:sheep", teleportBlockLoc, true);
  sheep.kill();
  test.succeed();
})
  .structureName("ComponentTests:platform")
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("APITests", "teleport_mob_facing", async (test) => {
  let playerSpawn = new BlockLocation(0, 2, 0);
  let player = test.spawnSimulatedPlayer(playerSpawn, "simulatedPlayer");
  let teleportLoc = new Location(2, 2, 2);
  let teleportBlockLoc = new BlockLocation(2, 2, 2);
  let teleportWorldLoc = test.worldLocation(teleportLoc);

  let facingLoc = new Location(2, 3, 0);
  let facingBlockLoc = new BlockLocation(2, 3, 0);
  let facingWorldLoc = test.worldLocation(facingLoc);

  test.setBlockType(MinecraftBlockTypes.diamondBlock, facingBlockLoc);
  const diamondBlock = test.getBlock(facingBlockLoc);
  let facingBlock;

  await test.idle(10);
  player.teleportFacing(teleportWorldLoc, player.dimension, facingWorldLoc);
  await test.idle(20);
  facingBlock = player.getBlockFromViewVector();
  test.assert(
    facingBlock.type === diamondBlock.type,
    "expected mob to face diamond block but instead got " + facingBlock.type.id
  );
  test.assertEntityPresent("minecraft:player", teleportBlockLoc, true);
  player.kill();
  test.succeed();
})
  .structureName("ComponentTests:platform")
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("APITests", "view_vector", (test) => {
  const spawnLoc = new BlockLocation(1, 2, 1);
  const playerName = "Test Player";
  const player = test.spawnSimulatedPlayer(spawnLoc, playerName);

  player.lookAtBlock(new BlockLocation(0, 3, 1));
  test
    .startSequence()
    .thenExecuteAfter(10, () => {
      test.assert(
        isNear(player.viewVector.x, -0.99, 0.01),
        "Expected x component to be -0.99, but got " + player.viewVector.x
      );
      test.assert(
        isNear(player.viewVector.y, -0.12, 0.01),
        "Expected y component to be -0.12, but got " + player.viewVector.y
      );
      test.assert(isNear(player.viewVector.z, 0, 0.01), "Expected z component to be 0, but got " + player.viewVector.z);
      test.assert(player.rotation.y == 90, "Expected body rotation to be 90, but got " + player.rotation.y);
      player.lookAtBlock(new BlockLocation(2, 3, 0));
    })
    .thenExecuteAfter(10, () => {
      test.assert(
        isNear(player.viewVector.x, 0.7, 0.01),
        "Expected x component to be .70, but got " + player.viewVector.x
      );
      test.assert(
        isNear(player.viewVector.y, -0.08, 0.01),
        "Expected y component to be -0.08, but got " + player.viewVector.y
      );
      test.assert(
        isNear(player.viewVector.z, -0.7, 0.01),
        "Expected z component to be -0.70, but got " + player.viewVector.z
      );
      test.assert(player.rotation.y == -135, "Expected body rotation to be -135, but got " + player.rotation.y);
      player.lookAtBlock(new BlockLocation(1, 5, 1));
    })
    .thenExecuteAfter(10, () => {
      test.assert(isNear(player.viewVector.x, 0, 0.01), "Expected x component to be 0, but got " + player.viewVector.x);
      test.assert(isNear(player.viewVector.y, 1, 0.01), "Expected y component to be 1, but got " + player.viewVector.y);
      test.assert(isNear(player.viewVector.z, 0, 0.01), "Expected z component to be 0, but got " + player.viewVector.z);
      test.assert(player.rotation.y == -135, "Expected body rotation to be -135, but got " + player.rotation.y);

      const head = test.relativeLocation(player.headLocation);
      test.assert(isNear(head.x, 1.5, 0.01), "Expected x component to be 1.5, but got " + head.x);
      test.assert(isNear(head.y, 3.52, 0.01), "Expected y component to be 3.52, but got " + head.y);
      test.assert(isNear(head.z, 1.5, 0.01), "Expected z component to be 1.5, but got " + head.z);
    })
    .thenSucceed();
})
  .structureName("ComponentTests:platform")
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("APITests", "set_velocity", (test) => {
  const zombie = test.spawnWithoutBehaviors("minecraft:zombie<minecraft:ageable_grow_up>", new BlockLocation(1, 2, 1));
  test
    .startSequence()
    .thenExecuteFor(30, () => {
      zombie.setVelocity(new Vector(0, 0.1, 0));
    })
    .thenExecute(() => {
      const zombieLoc = test.relativeLocation(zombie.location);
      const expectedLoc = new Location(1.5, 5.0, 1.5);

      test.assert(zombieLoc.isNear(expectedLoc, 0.01), "Expected zombie to levitate to specific place.");
    })
    .thenSucceed();
})
  .structureName("ComponentTests:platform")
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("APITests", "lore", (test) => {
  let itemStack = new ItemStack(MinecraftItemTypes.diamondSword);
  itemStack.setLore(["test lore 0", "test lore 1", "test lore 2"]);
  let lore = itemStack.getLore();
  test.assert(lore.length === 3, "Expected 3 lore lines, but got " + lore.length);
  test.assert(lore[0] === "test lore 0", "Expected lore line 0 to be 'test lore 0', but got " + lore[0]);
  test.assert(lore[1] === "test lore 1", "Expected lore line 1 to be 'test lore 1', but got " + lore[1]);
  test.assert(lore[2] === "test lore 2", "Expected lore line 2 to be 'test lore 2', but got " + lore[2]);

  const chestCart = test.spawn("chest_minecart", new BlockLocation(1, 3, 1));
  const inventoryComp = chestCart.getComponent("inventory");
  inventoryComp.container.addItem(itemStack);
  test.succeed();
})
  .structureName("ComponentTests:platform")
  .tag(GameTest.Tags.suiteDefault);

GameTest.registerAsync("APITests", "data_driven_actor_event", async (test) => {
  let globalBeforeTriggerSuccess = false;
  let entityEventFilteredBeforeTriggerSuccess = false;
  let globalTriggerSuccess = false;
  let entityEventFilteredTriggerSuccess = false;

  //Global Trigger
  let globalBeforeTrigger = world.events.beforeDataDrivenEntityTriggerEvent.subscribe((event) => {
    if (event.entity.id == "minecraft:llama" && event.id == "minecraft:entity_spawned") {
      globalBeforeTriggerSuccess = true;
    }

    //Force the llama to spawn as a baby
    if (
      event.modifiers.length > 0 &&
      event.modifiers[0].triggers.length > 0 &&
      event.modifiers[0].triggers[0].eventName == "minecraft:spawn_adult"
    ) {
      event.modifiers[0].triggers[0].eventName = "minecraft:spawn_baby";
    }
  });

  let globalTrigger = world.events.dataDrivenEntityTriggerEvent.subscribe((event) => {
    if (event.entity.id == "minecraft:llama" && event.id == "minecraft:entity_spawned") {
      if (!globalBeforeTriggerSuccess) test.fail("globalBeforeTrigger didn't fire for the entity_spawned event!");
      globalTriggerSuccess = true;
    }
  });

  //Trigger filtered by entity type and event type
  let entityEventFilterOptions = new EntityDataDrivenTriggerEventOptions();
  entityEventFilterOptions.entityTypes.push("minecraft:llama");
  entityEventFilterOptions.eventTypes.push("minecraft:entity_spawned");

  let entityEventBeforeFilterTrigger = world.events.beforeDataDrivenEntityTriggerEvent.subscribe((event) => {
    entityEventFilteredBeforeTriggerSuccess = true;
  }, entityEventFilterOptions);

  let entityEventFilterTrigger = world.events.dataDrivenEntityTriggerEvent.subscribe((event) => {
    if (!entityEventFilteredBeforeTriggerSuccess)
      test.fail("actorEventBeforeFilterTrigger didn't fire for the entity_spawned event!");
    entityEventFilteredTriggerSuccess = true;
  }, entityEventFilterOptions);

  const llama = test.spawn("minecraft:llama", new BlockLocation(1, 2, 1));
  const villager = test.spawn("minecraft:villager_v2", new BlockLocation(1, 2, 1));

  world.events.beforeDataDrivenEntityTriggerEvent.unsubscribe(globalBeforeTrigger);
  world.events.beforeDataDrivenEntityTriggerEvent.unsubscribe(entityEventBeforeFilterTrigger);
  world.events.dataDrivenEntityTriggerEvent.unsubscribe(globalTrigger);
  world.events.dataDrivenEntityTriggerEvent.unsubscribe(entityEventFilterTrigger);

  let specificEntityBeforeTriggerSuccess = false;

  //Event bound to a specific entity
  let specificEntityFilterOptions = new EntityDataDrivenTriggerEventOptions();
  specificEntityFilterOptions.entities.push(llama);
  specificEntityFilterOptions.eventTypes.push("minecraft:ageable_grow_up");

  let specificEntityEventBeforeTrigger = world.events.beforeDataDrivenEntityTriggerEvent.subscribe((event) => {
    event.cancel = true;
    specificEntityBeforeTriggerSuccess = true;
  }, specificEntityFilterOptions);

  //Event bound to both entities, but only fire on villager to show that multi-filters work
  let allEntityFilterOptions = new EntityDataDrivenTriggerEventOptions();
  allEntityFilterOptions.entities.push(llama);
  allEntityFilterOptions.entities.push(villager);
  allEntityFilterOptions.entityTypes.push("minecraft:villager_v2");
  allEntityFilterOptions.eventTypes.push("minecraft:ageable_grow_up");

  let allEntitiesTriggerCount = 0;

  let allEntitiesEventBeforeTrigger = world.events.beforeDataDrivenEntityTriggerEvent.subscribe((event) => {
    allEntitiesTriggerCount += 1;
  }, allEntityFilterOptions);
  llama.triggerEvent("minecraft:ageable_grow_up");
  villager.triggerEvent("minecraft:ageable_grow_up");

  world.events.beforeDataDrivenEntityTriggerEvent.unsubscribe(specificEntityEventBeforeTrigger);
  world.events.beforeDataDrivenEntityTriggerEvent.unsubscribe(allEntitiesEventBeforeTrigger);

  if (!globalBeforeTriggerSuccess) test.fail("Global beforeDataDrivenEntityTriggerEvent didn't fire!");
  if (!entityEventFilteredBeforeTriggerSuccess)
    test.fail("Filtered entity/event beforeDataDrivenEntityTriggerEvent didn't fire!");
  if (!globalTriggerSuccess) test.fail("Global dataDrivenEntityTriggerEvent didn't fire!");
  if (!entityEventFilteredTriggerSuccess) test.fail("Filtered entity/event dataDrivenEntityTriggerEvent didn't fire!");
  if (!specificEntityBeforeTriggerSuccess) test.fail("Specific entity beforeDataDrivenEntityTriggerEvent didn't fire!");
  if (allEntitiesTriggerCount != 1)
    test.fail("All filters beforeDataDrivenEntityTriggerEvent didn't fire exactly one time!");

  await test.idle(10);
  if (llama.getComponent("minecraft:is_baby") == null)
    test.fail("Llama was able to grow up! The beforeDataDrivenEntityTriggerEvent should prevent this!");

  test.succeed();
})
  .structureName("ComponentTests:animal_pen")
  .tag(GameTest.Tags.suiteDefault);

GameTest.registerAsync("APITests", "property_components", async (test) => {
  // The following components aren't present in this test since either there aren't mobs that use that component
  //  or it is difficult to get them into the correct state.
  // skin_id, push_through, ground_offset, friction_modifier, floats_in_liquid, wants_jockey, is_shaking

  let testComponent = (entity, compName, expectedValue, canSet) => {
    let comp = entity.getComponent("minecraft:" + compName);
    test.assert(comp != null, "Entity did not have expected component " + compName);
    if (expectedValue !== undefined) {
      let v = comp.value;
      let pass = false;
      if (typeof v === "number") {
        pass = Math.abs(expectedValue - v) <= 0.001;
      } else {
        pass = v == expectedValue;
      }
      test.assert(pass, `Component ${compName} didn't have expected value! Found ${v}, expected ${expectedValue}`);

      if (canSet === undefined || canSet === true) {
        comp.value = v;
      }
    }
  };

  const zombie = test.spawn("minecraft:zombie<minecraft:ageable_grow_up>", new BlockLocation(1, 2, 1));
  testComponent(zombie, "can_climb");

  const bee = test.spawn("bee", new BlockLocation(1, 2, 1));
  testComponent(bee, "can_fly");
  testComponent(bee, "flying_speed", 0.15);
  testComponent(bee, "is_hidden_when_invisible");

  bee.triggerEvent("collected_nectar");
  await test.idle(1);
  testComponent(bee, "is_charged");

  const magma_cube = test.spawn("magma_cube", new BlockLocation(1, 2, 1));
  testComponent(magma_cube, "fire_immune");

  const horse = test.spawn("horse", new BlockLocation(1, 2, 1));
  horse.triggerEvent("minecraft:horse_saddled");
  await test.idle(1);
  testComponent(horse, "is_saddled");
  testComponent(horse, "can_power_jump");

  let forceSpawnBaby = world.events.beforeDataDrivenEntityTriggerEvent.subscribe((event) => {
    //Force the llama to spawn as a baby
    if (
      event.modifiers.length > 0 &&
      event.modifiers[0].triggers.length > 0 &&
      event.modifiers[0].triggers[0].eventName == "minecraft:spawn_adult"
    ) {
      event.modifiers[0].triggers[0].eventName = "minecraft:spawn_baby";
    }
  });

  const llama = test.spawn("llama", new BlockLocation(1, 2, 1));
  testComponent(llama, "is_baby");
  testComponent(llama, "scale", 0.5);

  world.events.beforeDataDrivenEntityTriggerEvent.unsubscribe(forceSpawnBaby);

  llama.triggerEvent("minecraft:ageable_grow_up");
  llama.triggerEvent("minecraft:on_tame");
  llama.triggerEvent("minecraft:on_chest");
  await test.idle(1);
  testComponent(llama, "is_tamed");
  testComponent(llama, "is_chested");
  testComponent(llama, "mark_variant", 0);

  const pillager = test.spawn("pillager", new BlockLocation(1, 2, 1));
  pillager.triggerEvent("minecraft:spawn_as_illager_captain");
  await test.idle(1);
  testComponent(pillager, "is_illager_captain");

  const ravager = test.spawn("ravager", new BlockLocation(1, 2, 1));
  ravager.triggerEvent("minecraft:become_stunned");
  await test.idle(1);
  testComponent(ravager, "is_stunned");

  const sheep = test.spawn("sheep", new BlockLocation(1, 2, 1));
  sheep.triggerEvent("wololo");
  sheep.triggerEvent("minecraft:on_sheared");
  await test.idle(1);
  testComponent(sheep, "is_sheared");
  await test.idle(1);
  testComponent(sheep, "color", 14);

  const cat = test.spawn("cat", new BlockLocation(1, 2, 1));
  cat.triggerEvent("minecraft:spawn_midnight_cat");
  await test.idle(1);
  testComponent(cat, "variant", 9, false);

  const tnt = test.spawn("tnt_minecart", new BlockLocation(1, 2, 1));
  tnt.triggerEvent("minecraft:on_prime");
  await test.idle(1);
  testComponent(tnt, "is_ignited");
  testComponent(tnt, "is_stackable");
  tnt.kill();

  test.succeed();
})
  .structureName("ComponentTests:large_glass_cage")
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("APITests", "entity_hit_event_hits_entity", async (test) => {
  const player = test.spawnSimulatedPlayer(new BlockLocation(1, 2, 1));
  const cow = test.spawn("minecraft:cow<minecraft:ageable_grow_up>", new BlockLocation(3, 2, 3));

  let hitCallback = world.events.entityHit.subscribe((e) => {
    if (e.entity === player) {
      test.assert(e.hitEntity === cow, "Expected target to be cow, but got " + e.hitEntity);
      test.assert(e.hitBlock === undefined, "Expected no hit block, but got " + e.hitBlock?.id);
      world.events.entityHit.unsubscribe(hitCallback);
      test.succeed();
    }
  });
  await test.idle(5);
  player.attackEntity(cow);
})
  .structureName("ComponentTests:large_animal_pen")
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("APITests", "entity_hit_event_hits_block", async (test) => {
  const player = test.spawnSimulatedPlayer(new BlockLocation(1, 2, 1));
  const blockLoc = new BlockLocation(1, 2, 1);
  test.setBlockType(MinecraftBlockTypes.diamondBlock, blockLoc);

  let hitCallback = world.events.entityHit.subscribe((e) => {
    if (e.entity === player) {
      test.assert(e.hitEntity === undefined, "Expected no hit entity, but got " + e.target);
      test.assert(e.hitBlock?.id === "minecraft:diamond_block", "Expected no hit block, but got " + e.hitBlock?.id);
      world.events.entityHit.unsubscribe(hitCallback);
      test.succeed();
    }
  });
  await test.idle(5);
  player.breakBlock(blockLoc);
})
  .structureName("ComponentTests:platform")
  .tag(GameTest.Tags.suiteDefault);

GameTest.registerAsync("APITests", "entity_hurt_event_skeleton_hurts_player", async (test) => {
  const player = test.spawnSimulatedPlayer(new BlockLocation(1, 2, 1));
  const skeleton = test.spawn("skeleton", new BlockLocation(3, 2, 3));

  let hurtCallback = world.events.entityHurt.subscribe((e) => {
    if (e.hurtEntity === player) {
      test.assert(
        e.damagingEntity === skeleton,
        "Expected damagingEntity to be skeleton but got " + e.damagingEntity.id
      );
      test.assert(e.cause === EntityDamageCause.projectile, "Expected cause to be entity_attack but got " + e.cause);
      test.assert(e.projectile.id === "minecraft:arrow", "Expected projectile to be arrow but got " + e.cause);
      test.assert(e.damage > 0, "Expected damage to be greater than 0, but got " + e.damage);
      world.events.entityHurt.unsubscribe(hurtCallback);
      test.succeed();
    }
  });
})
  .structureName("ComponentTests:large_glass_cage")
  .tag(GameTest.Tags.suiteDefault);

GameTest.registerAsync("APITests", "entity_hurt_event_player_hurts_cow", async (test) => {
  const player = test.spawnSimulatedPlayer(new BlockLocation(1, 2, 1));
  const cow = test.spawn("minecraft:cow<minecraft:ageable_grow_up>", new BlockLocation(3, 2, 3));

  let hurtCallback = world.events.entityHurt.subscribe((e) => {
    if (e.hurtEntity === cow) {
      test.assert(e.cause === EntityDamageCause.entityAttack, "Expected cause to be entity_attack but got " + e.cause);
      test.assert(e.damage === 1, "Expected damage to be 1, but got " + e.damage);
      world.events.entityHurt.unsubscribe(hurtCallback);
      test.succeed();
    }
  });
  await test.idle(5);
  player.attackEntity(cow);
})
  .structureName("ComponentTests:large_animal_pen")
  .tag(GameTest.Tags.suiteDefault);

GameTest.registerAsync("APITests", "entity_hurt_event_player_kills_chicken", async (test) => {
  const player = test.spawnSimulatedPlayer(new BlockLocation(1, 2, 1));
  const chicken = test.spawn("minecraft:chicken<minecraft:ageable_grow_up>", new BlockLocation(3, 2, 3));

  let maxHealth = chicken.getComponent("minecraft:health").current;
  let expectedHealth = maxHealth;
  let hurtCallback = world.events.entityHurt.subscribe((e) => {
    if (e.hurtEntity === chicken) {
      test.assert(e.cause === EntityDamageCause.entityAttack, "Expected cause to be entity_attack but got " + e.cause);
      test.assert(e.damage === 1, "Expected damage to be 1, but got " + e.damage);
      let health = e.hurtEntity.getComponent("minecraft:health").current;
      --expectedHealth;
      test.assert(health === expectedHealth, "Expected health to be " + expectedHealth + " but got " + health);
      if (expectedHealth === 0) {
        world.events.entityHurt.unsubscribe(hurtCallback);
        test.succeed();
      }
    }
  });

  for (let i = 0; i < maxHealth; i++) {
    await test.idle(20);
    player.attackEntity(chicken);
  }
})
  .maxTicks(100)
  .structureName("ComponentTests:large_animal_pen")
  .tag(GameTest.Tags.suiteDefault);

GameTest.registerAsync("APITests", "projectile_hit_event_block", async (test) => {
  const player = test.spawnSimulatedPlayer(new BlockLocation(1, 2, 1));
  const targetLoc = new BlockLocation(1, 3, 7);

  let projectileHitCallback = world.events.projectileHit.subscribe((e) => {
    if (e.blockHit && test.relativeBlockLocation(e.blockHit.block.location).equals(targetLoc)) {
      world.events.projectileHit.unsubscribe(projectileHitCallback);
      try {
        test.assert(e.dimension === test.getDimension(), "Unexpected dimension");
        test.assert(e.entityHit === undefined, "Expected no entity hit");
        test.assert(
          e.projectile?.id === "minecraft:arrow",
          "Expected projectile to be arrow, but got " + e.projectile?.id
        );
        test.assert(e.source?.id === "minecraft:player", "Expected source to be player, but got " + e.source?.id);
        test.assert(
          isNearVec(e.hitVector, test.rotateVector(Vector.forward), 0.1),
          `Expected e.hitVector to be forward, but got [${e.hitVector.x}, ${e.hitVector.y}, ${e.hitVector.z}]`
        );
        test.assert(
          e.blockHit.block?.id === "minecraft:target",
          "Expected block to be target, but got " + e.blockHit.block?.id
        );
        test.assert(e.blockHit.face == test.rotateDirection(Direction.north), "Expected north block face");
        test.assert(
          isNear(e.blockHit.faceLocationX, 0, 5, 0.1),
          "Expected faceLocationX to be near center, but got " + e.blockHit.faceLocationX
        );
        test.assert(
          isNear(e.blockHit.faceLocationY, 0.5, 0.2),
          "Expected faceLocationY to be near center, but got " + e.blockHit.faceLocationY
        );
        test.succeed();
      } catch (ex) {
        test.fail(ex);
      }
    }
  });

  await test.idle(5);
  player.giveItem(new ItemStack(MinecraftItemTypes.bow, 1), false);
  player.giveItem(new ItemStack(MinecraftItemTypes.arrow, 64), false);
  await test.idle(5);
  player.useItemInSlot(0);
  await test.idle(50);
  player.stopUsingItem();
})
  .structureName("SimulatedPlayerTests:target_practice")
  .tag(GameTest.Tags.suiteDefault);

GameTest.registerAsync("APITests", "projectile_hit_event_entity", async (test) => {
  const player = test.spawnSimulatedPlayer(new BlockLocation(1, 2, 1));
  const blaze = test.spawn("blaze", new BlockLocation(1, 2, 3));

  let projectileHitCallback = world.events.projectileHit.subscribe((e) => {
    if (e.entityHit && e.entityHit.entity === blaze) {
      world.events.projectileHit.unsubscribe(projectileHitCallback);
      test.assert(e.blockHit === undefined, "Expected no block hit");
      test.assert(e.dimension === test.getDimension(), "Unexpected dimension");
      test.assert(
        e.projectile?.id === "minecraft:snowball",
        "Expected projectile to be snowball, but got " + e.projectile?.id
      );
      test.assert(e.source?.id === "minecraft:player", "Expected source to be player, but got " + e.source?.id);
      test.assert(
        isNearVec(e.hitVector, test.rotateVector(Vector.forward)),
        `Expected e.hitVector to be forward, but got [${e.hitVector.x}, ${e.hitVector.y}, ${e.hitVector.z}]`
      );
      test.assert(
        e.entityHit.entity?.id === "minecraft:blaze",
        "Expected entity to be blaze, but got " + e.entityHit.entity?.id
      );
      test.succeed();
    }
  });

  await test.idle(5);
  player.useItem(new ItemStack(MinecraftItemTypes.snowball));
})
  .structureName("SimulatedPlayerTests:use_item")
  .tag(GameTest.Tags.suiteDefault);

GameTest.registerAsync("APITests", "rotate_entity", async (test) => {
  const rotate360 = async (entity) => {
    for (let i = 0; i < 360; i += 10) {
      await test.idle(1);
      entity.setRotation(i, i);
      let rotX = entity.rotation.x;
      let rotY = entity.rotation.y;
      if (rotX < 0) {
        rotX += 360;
      }
      if (rotY < 0) {
        rotY += 360;
      }
      test.assert(rotX === i, `Expected rotX to be ${i} but got ${rotX}`);
      test.assert(rotY === i, `Expected rotY to be ${i} but got ${rotY}`);
    }
  };

  const spawnLoc = new BlockLocation(1, 2, 1);
  const cow = test.spawnWithoutBehaviors("minecraft:cow<minecraft:ageable_grow_up>", spawnLoc);
  await rotate360(cow);
  cow.kill();
  const armorStand = test.spawn("armor_stand", spawnLoc);
  await rotate360(armorStand);
  armorStand.kill();
  const player = test.spawnSimulatedPlayer(spawnLoc);
  await rotate360(player);
  test.succeed();
})
  .maxTicks(400)
  .structureName("ComponentTests:animal_pen")
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("APITests", "teleport_keep_velocity", (test) => {
  const arrow = test.spawn("arrow", new BlockLocation(2, 4, 1));
  // The arrow should fall 1 block before hitting the target
  arrow.setVelocity(test.rotateVector(new Vector(0, 0, 1.2)));
  let relativeLoc = test.relativeLocation(arrow.location);
  relativeLoc.x -= 1;
  let teleportLoc = test.worldLocation(relativeLoc);
  arrow.teleport(teleportLoc, arrow.dimension, 0, 0, true);
  let velocity = arrow.velocity.length();
  test.assert(velocity > 0.5, "Expected velocity to be greater than 0.5, but got " + velocity);
  test.succeed();
})
  .structureName("SimulatedPlayerTests:target_practice")
  .tag(GameTest.Tags.suiteDefault);

GameTest.registerAsync(`APITests`, `teleport_keep_velocity_mob`, async (test) => {
  let pig1 = test.spawn(`minecraft:pig<minecraft:ageable_grow_up>`, new BlockLocation(0, 10, 0));
  let pig2 = test.spawn(`minecraft:pig<minecraft:ageable_grow_up>`, new BlockLocation(0, 10, 2));
  let simPlayer1 = test.spawnSimulatedPlayer(new BlockLocation(2, 10, 0));
  let simPlayer2 = test.spawnSimulatedPlayer(new BlockLocation(2, 10, 2));

  await test.idle(2);
  const velocity = new Vector(0, 5, 0);
  pig1.setVelocity(velocity);
  pig2.setVelocity(velocity);
  simPlayer1.setVelocity(velocity);
  simPlayer2.setVelocity(velocity);

  await test.idle(20);
  pig1.teleport(test.worldLocation(new Location(0.5, 2, 0.5)), world.getDimension(`overworld`), 0, 0, false); // don't keep velocity
  pig2.teleport(test.worldLocation(new Location(0.5, 3, 2.5)), world.getDimension(`overworld`), 0, 0, true); // keep velocity

  simPlayer1.teleport(test.worldLocation(new Location(2.5, 3, 2.5)), world.getDimension(`overworld`), 0, 0, false); // don't keep velocity
  try {
    simPlayer2.teleport(test.worldLocation(new Location(2.5, 3, 2.5)), world.getDimension(`overworld`), 0, 0, true); // keep velocity, not supported for players
    test.fail("Expected exception when keepVelocity is true on player");
  } catch (ex) {
    test.assert(ex === "keepVelocity is not supported for player teleportation", ex);
  }

  test.assert(pig1.velocity.y === 0, `Expected pig1.velocity.y to be 0, but got ${pig1.velocity.y}`);
  test.assert(pig2.velocity.y > 1.5, `Expected pig2.velocity.y to be > 1.5, but got ${pig2.velocity.y}`);
  test.assert(simPlayer1.velocity.y === 0, `Expected simPlayer1.velocity.y to be 0, but got ${simPlayer1.velocity.y}`);

  pig1.kill();
  pig2.kill();

  test.succeed();
}).tag(GameTest.Tags.suiteDefault);

// SIG // Begin signature block
// SIG // MIInsAYJKoZIhvcNAQcCoIInoTCCJ50CAQExDzANBglg
// SIG // hkgBZQMEAgEFADB3BgorBgEEAYI3AgEEoGkwZzAyBgor
// SIG // BgEEAYI3AgEeMCQCAQEEEBDgyQbOONQRoqMAEEvTUJAC
// SIG // AQACAQACAQACAQACAQAwMTANBglghkgBZQMEAgEFAAQg
// SIG // 8+K6qfjLIy7Ano/n6g6Motb/67LJlFwd1d3klZj+LDmg
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
// SIG // SEXAQsmbdlsKgEhr/Xmfwb1tbWrJUnMTDXpQzTGCGYcw
// SIG // ghmDAgEBMIGVMH4xCzAJBgNVBAYTAlVTMRMwEQYDVQQI
// SIG // EwpXYXNoaW5ndG9uMRAwDgYDVQQHEwdSZWRtb25kMR4w
// SIG // HAYDVQQKExVNaWNyb3NvZnQgQ29ycG9yYXRpb24xKDAm
// SIG // BgNVBAMTH01pY3Jvc29mdCBDb2RlIFNpZ25pbmcgUENB
// SIG // IDIwMTECEzMAAALMjrWWpr3RyU4AAAAAAswwDQYJYIZI
// SIG // AWUDBAIBBQCggcAwGQYJKoZIhvcNAQkDMQwGCisGAQQB
// SIG // gjcCAQQwHAYKKwYBBAGCNwIBCzEOMAwGCisGAQQBgjcC
// SIG // ARUwLwYJKoZIhvcNAQkEMSIEIFHZ5RanX6n/fyrzB/qC
// SIG // h4DRQenjuG6BR7zkuoX86XMtMFQGCisGAQQBgjcCAQwx
// SIG // RjBEoCSAIgBNAGkAbgBlAGMAcgBhAGYAdAAgAEIAZQBk
// SIG // AHIAbwBjAGuhHIAaaHR0cHM6Ly93d3cubWluZWNyYWZ0
// SIG // Lm5ldC8wDQYJKoZIhvcNAQEBBQAEggEADpHo2ZgO6WcH
// SIG // SA+BTyBNuQtMPtIg6+XHaQQmVbi9nTPqGZHr8tWsPfsl
// SIG // ZcGwaLpzr4Dj2uFwL0QIvz9NgNretqMXN9b3sZ6DP/XQ
// SIG // tc6ZPAsB88RfT0LKOJFaWrdq6+ov8gM/t+fAGs/oZGp8
// SIG // uQ0ar7cRohu1vikQuoHnGy0WSyfFII3Bmd5tKXQPh31z
// SIG // okHUCpITsV+Ivg1r2IngqXth+jpuFsiqvRhv21WuO/Al
// SIG // j7WiEAZmImw6F1DQefQLw/za95jUUvzXBIJe9JsIyYqf
// SIG // A16ncGQoEM7dXp+IXBcC7W6I4DNWen5IefgTmKmTTRXd
// SIG // rkCP0uY9E3scLwHPinBpd6GCFv8wghb7BgorBgEEAYI3
// SIG // AwMBMYIW6zCCFucGCSqGSIb3DQEHAqCCFtgwghbUAgED
// SIG // MQ8wDQYJYIZIAWUDBAIBBQAwggFQBgsqhkiG9w0BCRAB
// SIG // BKCCAT8EggE7MIIBNwIBAQYKKwYBBAGEWQoDATAxMA0G
// SIG // CWCGSAFlAwQCAQUABCBqoNF1C3HYWZcvmFvRP8eW2/u/
// SIG // wqD9UXH9u5L8LsWZigIGYyNUvv5fGBIyMDIyMDkyODIz
// SIG // NTEyNC4zMVowBIACAfSggdCkgc0wgcoxCzAJBgNVBAYT
// SIG // AlVTMRMwEQYDVQQIEwpXYXNoaW5ndG9uMRAwDgYDVQQH
// SIG // EwdSZWRtb25kMR4wHAYDVQQKExVNaWNyb3NvZnQgQ29y
// SIG // cG9yYXRpb24xJTAjBgNVBAsTHE1pY3Jvc29mdCBBbWVy
// SIG // aWNhIE9wZXJhdGlvbnMxJjAkBgNVBAsTHVRoYWxlcyBU
// SIG // U1MgRVNOOkFFMkMtRTMyQi0xQUZDMSUwIwYDVQQDExxN
// SIG // aWNyb3NvZnQgVGltZS1TdGFtcCBTZXJ2aWNloIIRVzCC
// SIG // BwwwggT0oAMCAQICEzMAAAGWSVti4S/d908AAQAAAZYw
// SIG // DQYJKoZIhvcNAQELBQAwfDELMAkGA1UEBhMCVVMxEzAR
// SIG // BgNVBAgTCldhc2hpbmd0b24xEDAOBgNVBAcTB1JlZG1v
// SIG // bmQxHjAcBgNVBAoTFU1pY3Jvc29mdCBDb3Jwb3JhdGlv
// SIG // bjEmMCQGA1UEAxMdTWljcm9zb2Z0IFRpbWUtU3RhbXAg
// SIG // UENBIDIwMTAwHhcNMjExMjAyMTkwNTEzWhcNMjMwMjI4
// SIG // MTkwNTEzWjCByjELMAkGA1UEBhMCVVMxEzARBgNVBAgT
// SIG // Cldhc2hpbmd0b24xEDAOBgNVBAcTB1JlZG1vbmQxHjAc
// SIG // BgNVBAoTFU1pY3Jvc29mdCBDb3Jwb3JhdGlvbjElMCMG
// SIG // A1UECxMcTWljcm9zb2Z0IEFtZXJpY2EgT3BlcmF0aW9u
// SIG // czEmMCQGA1UECxMdVGhhbGVzIFRTUyBFU046QUUyQy1F
// SIG // MzJCLTFBRkMxJTAjBgNVBAMTHE1pY3Jvc29mdCBUaW1l
// SIG // LVN0YW1wIFNlcnZpY2UwggIiMA0GCSqGSIb3DQEBAQUA
// SIG // A4ICDwAwggIKAoICAQDSH2wQC2+t/jzA6jL6LZMhDNJG
// SIG // 0nv1cUqe+H4MGKyEgRZUwp1YsHl1ITGyi8K9rkPRKKKA
// SIG // i0lT8g0b1GIipkWc8qCtE3wibxoNR4mCyrvgEsXutnbx
// SIG // I1obx8cMfa2XgchG/XBGZcFtGd0UQvXkxUYvokfG1TyB
// SIG // MqnIZvQ2LtcmGj86laPRNuRodkEM7VVUO2oMSHJbaTNj
// SIG // 1b2kAC8sqlytH1zmfrQpTA3rZOyEmywT43DRfsNlXmkN
// SIG // KMiW7BafNnHZLGHGacpimE4doDMur3yiH/qCCx2PO4pI
// SIG // qkA6WLGSN8yhYavcQZRFVtsl/x/IiuL0fxPGpQmRc84m
// SIG // 41yauncveNh/5/14MqsZ7ugY1ix8fkOYgJBlLss8myPh
// SIG // aMA6qcEB/RWWqcCfhyARNjCcmBNGNXeMgKyZ/+e3bCOl
// SIG // XmWeDtVJDLmOtzEDBLmkg2/etp3T9hOX+LodYwdBkY2n
// SIG // oCDEzPWVa834AmkJvR6ynEeBGj6ouWifpXxaobBdasb0
// SIG // +r/9eYr+T00yrLFn16rrTULnVzkW7lLyXWEousvzYnul
// SIG // 3HPCQooQS4LY1HBKTyTSftGX56ZgOz7Rk+esvbcr+NjL
// SIG // vBBy7Xeomgkuw1F/Uru7lZ9AR+EQbpg2pvCHSarMQQHb
// SIG // f1GXPhlDTHwkeskRiz5jPjTr1Wz/f+9CZx5ovtTF0QID
// SIG // AQABo4IBNjCCATIwHQYDVR0OBBYEFNLfCNksLmWtIGEs
// SIG // iYuEKprRzXSyMB8GA1UdIwQYMBaAFJ+nFV0AXmJdg/Tl
// SIG // 0mWnG1M1GelyMF8GA1UdHwRYMFYwVKBSoFCGTmh0dHA6
// SIG // Ly93d3cubWljcm9zb2Z0LmNvbS9wa2lvcHMvY3JsL01p
// SIG // Y3Jvc29mdCUyMFRpbWUtU3RhbXAlMjBQQ0ElMjAyMDEw
// SIG // KDEpLmNybDBsBggrBgEFBQcBAQRgMF4wXAYIKwYBBQUH
// SIG // MAKGUGh0dHA6Ly93d3cubWljcm9zb2Z0LmNvbS9wa2lv
// SIG // cHMvY2VydHMvTWljcm9zb2Z0JTIwVGltZS1TdGFtcCUy
// SIG // MFBDQSUyMDIwMTAoMSkuY3J0MAwGA1UdEwEB/wQCMAAw
// SIG // EwYDVR0lBAwwCgYIKwYBBQUHAwgwDQYJKoZIhvcNAQEL
// SIG // BQADggIBAK9gCxC4IVbYKVQBHP5ztJc/kfgSubcL5hTR
// SIG // eVE1uwSVKp92Sfd/IIvFgGQcwVlAZc8DubOhTshlR2fS
// SIG // FfK6+sUzoMOuf9ItKF7m348+SpZ455iITDyTgEjqXhTm
// SIG // TTvBfyEHA6gxHGzVo578k2Qsc7qSuXmPr8ZkeuRNHNOx
// SIG // FRQmnUWmdTOLGJlbJq9zTH+KYbnJZ2tK5xwT2d2irtBu
// SIG // 7U/FruzCxSbnM00y6dpYZcMUCdLuzxHEnX8/epO1nQlr
// SIG // pUTpJ6gel2Pv+E+4oktdX8zz0Y0WfwdQOZVbn5gr/wPL
// SIG // vIoceKJJ366AA36lbc8Do5h6TSvJbVArNutbg/1JcCT5
// SIG // Tl9peMEmiK1b3z5kRFZffztUe9pNYnhijkGaQnRTbsBq
// SIG // XaCCLmPU9i4PEHcOyh8z7t5tzjOAnQYXi7oNBbRXitz8
// SIG // XbPK2XasNB9QaU+01TKZRlVtYlsWrDriN7xCwCcx4bUn
// SIG // yiHGNiV5reIsDMbCKZ7h1sxLIQeg5tW/Mg3R30EnzjFV
// SIG // 5cq8RPXvoaFj89LpFMlmJbk8+KFmHzwXcl5wS+GVy38V
// SIG // ulA+36aEM4FADKqMjW10FCUEVVfznFZ3UlGdSS7GqyFe
// SIG // oXBzEqvwaIWxv0BXvLtNPfR+YxOzeCaeiMVC3cx0PlDc
// SIG // z+AF/VN2WHKI81dOAmE/qLJkd/EpmLZzMIIHcTCCBVmg
// SIG // AwIBAgITMwAAABXF52ueAptJmQAAAAAAFTANBgkqhkiG
// SIG // 9w0BAQsFADCBiDELMAkGA1UEBhMCVVMxEzARBgNVBAgT
// SIG // Cldhc2hpbmd0b24xEDAOBgNVBAcTB1JlZG1vbmQxHjAc
// SIG // BgNVBAoTFU1pY3Jvc29mdCBDb3Jwb3JhdGlvbjEyMDAG
// SIG // A1UEAxMpTWljcm9zb2Z0IFJvb3QgQ2VydGlmaWNhdGUg
// SIG // QXV0aG9yaXR5IDIwMTAwHhcNMjEwOTMwMTgyMjI1WhcN
// SIG // MzAwOTMwMTgzMjI1WjB8MQswCQYDVQQGEwJVUzETMBEG
// SIG // A1UECBMKV2FzaGluZ3RvbjEQMA4GA1UEBxMHUmVkbW9u
// SIG // ZDEeMBwGA1UEChMVTWljcm9zb2Z0IENvcnBvcmF0aW9u
// SIG // MSYwJAYDVQQDEx1NaWNyb3NvZnQgVGltZS1TdGFtcCBQ
// SIG // Q0EgMjAxMDCCAiIwDQYJKoZIhvcNAQEBBQADggIPADCC
// SIG // AgoCggIBAOThpkzntHIhC3miy9ckeb0O1YLT/e6cBwfS
// SIG // qWxOdcjKNVf2AX9sSuDivbk+F2Az/1xPx2b3lVNxWuJ+
// SIG // Slr+uDZnhUYjDLWNE893MsAQGOhgfWpSg0S3po5GawcU
// SIG // 88V29YZQ3MFEyHFcUTE3oAo4bo3t1w/YJlN8OWECesSq
// SIG // /XJprx2rrPY2vjUmZNqYO7oaezOtgFt+jBAcnVL+tuhi
// SIG // JdxqD89d9P6OU8/W7IVWTe/dvI2k45GPsjksUZzpcGkN
// SIG // yjYtcI4xyDUoveO0hyTD4MmPfrVUj9z6BVWYbWg7mka9
// SIG // 7aSueik3rMvrg0XnRm7KMtXAhjBcTyziYrLNueKNiOSW
// SIG // rAFKu75xqRdbZ2De+JKRHh09/SDPc31BmkZ1zcRfNN0S
// SIG // idb9pSB9fvzZnkXftnIv231fgLrbqn427DZM9ituqBJR
// SIG // 6L8FA6PRc6ZNN3SUHDSCD/AQ8rdHGO2n6Jl8P0zbr17C
// SIG // 89XYcz1DTsEzOUyOArxCaC4Q6oRRRuLRvWoYWmEBc8pn
// SIG // ol7XKHYC4jMYctenIPDC+hIK12NvDMk2ZItboKaDIV1f
// SIG // MHSRlJTYuVD5C4lh8zYGNRiER9vcG9H9stQcxWv2XFJR
// SIG // XRLbJbqvUAV6bMURHXLvjflSxIUXk8A8FdsaN8cIFRg/
// SIG // eKtFtvUeh17aj54WcmnGrnu3tz5q4i6tAgMBAAGjggHd
// SIG // MIIB2TASBgkrBgEEAYI3FQEEBQIDAQABMCMGCSsGAQQB
// SIG // gjcVAgQWBBQqp1L+ZMSavoKRPEY1Kc8Q/y8E7jAdBgNV
// SIG // HQ4EFgQUn6cVXQBeYl2D9OXSZacbUzUZ6XIwXAYDVR0g
// SIG // BFUwUzBRBgwrBgEEAYI3TIN9AQEwQTA/BggrBgEFBQcC
// SIG // ARYzaHR0cDovL3d3dy5taWNyb3NvZnQuY29tL3BraW9w
// SIG // cy9Eb2NzL1JlcG9zaXRvcnkuaHRtMBMGA1UdJQQMMAoG
// SIG // CCsGAQUFBwMIMBkGCSsGAQQBgjcUAgQMHgoAUwB1AGIA
// SIG // QwBBMAsGA1UdDwQEAwIBhjAPBgNVHRMBAf8EBTADAQH/
// SIG // MB8GA1UdIwQYMBaAFNX2VsuP6KJcYmjRPZSQW9fOmhjE
// SIG // MFYGA1UdHwRPME0wS6BJoEeGRWh0dHA6Ly9jcmwubWlj
// SIG // cm9zb2Z0LmNvbS9wa2kvY3JsL3Byb2R1Y3RzL01pY1Jv
// SIG // b0NlckF1dF8yMDEwLTA2LTIzLmNybDBaBggrBgEFBQcB
// SIG // AQROMEwwSgYIKwYBBQUHMAKGPmh0dHA6Ly93d3cubWlj
// SIG // cm9zb2Z0LmNvbS9wa2kvY2VydHMvTWljUm9vQ2VyQXV0
// SIG // XzIwMTAtMDYtMjMuY3J0MA0GCSqGSIb3DQEBCwUAA4IC
// SIG // AQCdVX38Kq3hLB9nATEkW+Geckv8qW/qXBS2Pk5HZHix
// SIG // BpOXPTEztTnXwnE2P9pkbHzQdTltuw8x5MKP+2zRoZQY
// SIG // Iu7pZmc6U03dmLq2HnjYNi6cqYJWAAOwBb6J6Gngugnu
// SIG // e99qb74py27YP0h1AdkY3m2CDPVtI1TkeFN1JFe53Z/z
// SIG // jj3G82jfZfakVqr3lbYoVSfQJL1AoL8ZthISEV09J+BA
// SIG // ljis9/kpicO8F7BUhUKz/AyeixmJ5/ALaoHCgRlCGVJ1
// SIG // ijbCHcNhcy4sa3tuPywJeBTpkbKpW99Jo3QMvOyRgNI9
// SIG // 5ko+ZjtPu4b6MhrZlvSP9pEB9s7GdP32THJvEKt1MMU0
// SIG // sHrYUP4KWN1APMdUbZ1jdEgssU5HLcEUBHG/ZPkkvnNt
// SIG // yo4JvbMBV0lUZNlz138eW0QBjloZkWsNn6Qo3GcZKCS6
// SIG // OEuabvshVGtqRRFHqfG3rsjoiV5PndLQTHa1V1QJsWkB
// SIG // RH58oWFsc/4Ku+xBZj1p/cvBQUl+fpO+y/g75LcVv7TO
// SIG // PqUxUYS8vwLBgqJ7Fx0ViY1w/ue10CgaiQuPNtq6TPmb
// SIG // /wrpNPgkNWcr4A245oyZ1uEi6vAnQj0llOZ0dFtq0Z4+
// SIG // 7X6gMTN9vMvpe784cETRkPHIqzqKOghif9lwY1NNje6C
// SIG // baUFEMFxBmoQtB1VM1izoXBm8qGCAs4wggI3AgEBMIH4
// SIG // oYHQpIHNMIHKMQswCQYDVQQGEwJVUzETMBEGA1UECBMK
// SIG // V2FzaGluZ3RvbjEQMA4GA1UEBxMHUmVkbW9uZDEeMBwG
// SIG // A1UEChMVTWljcm9zb2Z0IENvcnBvcmF0aW9uMSUwIwYD
// SIG // VQQLExxNaWNyb3NvZnQgQW1lcmljYSBPcGVyYXRpb25z
// SIG // MSYwJAYDVQQLEx1UaGFsZXMgVFNTIEVTTjpBRTJDLUUz
// SIG // MkItMUFGQzElMCMGA1UEAxMcTWljcm9zb2Z0IFRpbWUt
// SIG // U3RhbXAgU2VydmljZaIjCgEBMAcGBSsOAwIaAxUA0Pom
// SIG // mlVZaduKtDHghztBZDfmVv6ggYMwgYCkfjB8MQswCQYD
// SIG // VQQGEwJVUzETMBEGA1UECBMKV2FzaGluZ3RvbjEQMA4G
// SIG // A1UEBxMHUmVkbW9uZDEeMBwGA1UEChMVTWljcm9zb2Z0
// SIG // IENvcnBvcmF0aW9uMSYwJAYDVQQDEx1NaWNyb3NvZnQg
// SIG // VGltZS1TdGFtcCBQQ0EgMjAxMDANBgkqhkiG9w0BAQUF
// SIG // AAIFAObe9eswIhgPMjAyMjA5MjkwMDMzNDdaGA8yMDIy
// SIG // MDkzMDAwMzM0N1owdzA9BgorBgEEAYRZCgQBMS8wLTAK
// SIG // AgUA5t716wIBADAKAgEAAgIp0QIB/zAHAgEAAgIRvTAK
// SIG // AgUA5uBHawIBADA2BgorBgEEAYRZCgQCMSgwJjAMBgor
// SIG // BgEEAYRZCgMCoAowCAIBAAIDB6EgoQowCAIBAAIDAYag
// SIG // MA0GCSqGSIb3DQEBBQUAA4GBAIVqyJ56xBXWfDs1Ini3
// SIG // sUYCJgP42oWxRdklN54+Yf2bx1B4wvytCc6qbH6nzlLl
// SIG // YTWG/0xjwXXiVRscZFh60pTG9XMfcMATDJ2N4L67P33i
// SIG // JAuE7RCQZ6O1Aw7+cOXzeQKOR1LBFpc26iaVeZMejJ4U
// SIG // tLkR8bY/HLv0RXPfMO0lMYIEDTCCBAkCAQEwgZMwfDEL
// SIG // MAkGA1UEBhMCVVMxEzARBgNVBAgTCldhc2hpbmd0b24x
// SIG // EDAOBgNVBAcTB1JlZG1vbmQxHjAcBgNVBAoTFU1pY3Jv
// SIG // c29mdCBDb3Jwb3JhdGlvbjEmMCQGA1UEAxMdTWljcm9z
// SIG // b2Z0IFRpbWUtU3RhbXAgUENBIDIwMTACEzMAAAGWSVti
// SIG // 4S/d908AAQAAAZYwDQYJYIZIAWUDBAIBBQCgggFKMBoG
// SIG // CSqGSIb3DQEJAzENBgsqhkiG9w0BCRABBDAvBgkqhkiG
// SIG // 9w0BCQQxIgQgJcOswVMGcIjuwh7nOjcku09EbTyJG8Pp
// SIG // VkwoVqNgtiMwgfoGCyqGSIb3DQEJEAIvMYHqMIHnMIHk
// SIG // MIG9BCB2BNYC+B0105J2Ry6CfnZ0JA8JflZQQ6sLpHI3
// SIG // LbK9kDCBmDCBgKR+MHwxCzAJBgNVBAYTAlVTMRMwEQYD
// SIG // VQQIEwpXYXNoaW5ndG9uMRAwDgYDVQQHEwdSZWRtb25k
// SIG // MR4wHAYDVQQKExVNaWNyb3NvZnQgQ29ycG9yYXRpb24x
// SIG // JjAkBgNVBAMTHU1pY3Jvc29mdCBUaW1lLVN0YW1wIFBD
// SIG // QSAyMDEwAhMzAAABlklbYuEv3fdPAAEAAAGWMCIEILzu
// SIG // hNIEqPeBqFiJuLYDWBIxKsX/L9oCD49BLWidg91eMA0G
// SIG // CSqGSIb3DQEBCwUABIICAKNnNDoWU3TxOLIt8zagk+jI
// SIG // bxHijxFOfXObRiFBg/z7bBWFSYoVOAsco2EQcm4muPAn
// SIG // XFdGQdPUclqsqArvjfFMYMHnOW7iQ51jpoMaagfJCT7H
// SIG // BBMcJHwX0cnYgjX+sFiwOAS6mC2a4a18i2kFNaBeTv3l
// SIG // eel8YS+JNUYa2iopvGVKqtWSM2w2kFtIXX2hdV5gKHFX
// SIG // 8YqY1cqx09QJ2pwauHQj9zm7PHIsxobC1r9i+HaK4Gab
// SIG // 4jvIEvqt/NEdxJdhDMPgwRUQQa1E7C5YyfyDEEMhZIW8
// SIG // 6S2uE/PaAhATSuEePiA0aU3xAn1pEOVKYAteXOnLESXU
// SIG // xLzjHqI8il77GkdxaZA0yDX8NKgBXQv/izz1X+PYQnyN
// SIG // apPfLEtfh6v8s08KldYi9HK7dCKdZ77o7e1y69lkZR73
// SIG // E4Z6iuNYGyeUD9KlTpYCVWr84fq8HQJiCRdcHye2jGqy
// SIG // t+0W9f/XOvLxMD1lJDO3AbltQtASPxf8cuIwv97+Q9c5
// SIG // 6U96NpXTfs5h5cUJUss80nlWPrj5zvTt+iTbD8GO83tp
// SIG // jC5dKCKdJ262SkwMNewAeS2YOy1h7WXzRijabQ/i6Gn4
// SIG // NdT6bjUgTs+f9fplyyF45zxA+KCTcDpBBo43r91rPvV3
// SIG // xN5Hu4PB0YPy93gszXQvSQNLzPB1vLPtTwijiMqhg3C2
// SIG // End signature block
