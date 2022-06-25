import * as GameTest from "mojang-gametest";
import GameTestExtensions from "./GameTestExtensions.js";
import {
  BlockLocation,
  Direction,
  ItemStack,
  Location,
  MinecraftBlockTypes,
  MinecraftItemTypes,
  world,
} from "mojang-minecraft";

function isNear(n1, n2) {
  return Math.abs(n1 - n2) < 0.01;
}

GameTest.register("SimulatedPlayerTests", "spawn_simulated_player", (test) => {
  const spawnLoc = new BlockLocation(1, 5, 1);
  const landLoc = new BlockLocation(1, 2, 1);
  const playerName = "Test Player";
  const player = test.spawnSimulatedPlayer(spawnLoc, playerName);
  test.assertEntityPresent("player", spawnLoc);
  test.assert(player.nameTag === playerName, "Unexpected name tag");
  test.succeedWhen(() => {
    test.assertEntityPresent("player", landLoc);
  });
})
  .structureName("ComponentTests:platform")
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("SimulatedPlayerTests", "remove_simulated_player", (test) => {
  const spawnLoc = new BlockLocation(1, 2, 1);
  const player = test.spawnSimulatedPlayer(spawnLoc);
  test.assertEntityPresent("player", spawnLoc);

  test
    .startSequence()
    .thenExecuteAfter(10, () => {
      test.removeSimulatedPlayer(player);
      test.assertEntityPresent("player", spawnLoc, false);
    })
    .thenSucceed();
})
  .structureName("ComponentTests:platform")
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("SimulatedPlayerTests", "jump", (test) => {
  const player = test.spawnSimulatedPlayer(new BlockLocation(1, 2, 0));
  const goalLoc = new BlockLocation(1, 2, 3);
  let jumpCount = 0;

  test
    .startSequence()
    .thenExecuteAfter(10, () => {
      player.move(0, 1);
    })
    .thenWait(() => {
      if (player.jump()) {
        jumpCount++;
      }
      test.assertEntityInstancePresent(player, goalLoc);
      test.assert(jumpCount === 10, "Expected 2 jumps up the stairs and 8 in the snow block");
    })
    .thenSucceed();
}).tag(GameTest.Tags.suiteDefault);

GameTest.register("SimulatedPlayerTests", "attack_entity", (test) => {
  const player = test.spawnSimulatedPlayer(new BlockLocation(1, 2, 1));
  const cow = test.spawn("minecraft:cow<minecraft:ageable_grow_up>", new BlockLocation(3, 2, 3));
  let hitCount = 0;
  test
    .startSequence()
    .thenWait(() => {
      player.lookAtEntity(cow);
      if (player.attackEntity(cow)) {
        hitCount++;
      }
      test.assertEntityPresentInArea("cow", false);
    })
    .thenExecute(() => {
      test.assert(hitCount === 10, "It should take 10 hits to kill a Cow.");
    })
    .thenSucceed();
})
  .maxTicks(200)
  .structureName("ComponentTests:large_animal_pen")
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("SimulatedPlayerTests", "jump_attack_entity", (test) => {
  const player = test.spawnSimulatedPlayer(new BlockLocation(1, 2, 1));
  const cow = test.spawn("minecraft:cow<minecraft:ageable_grow_up>", new BlockLocation(3, 2, 3));
  let hitCount = 0;
  test
    .startSequence()
    .thenWait(() => {
      player.lookAtEntity(cow);
      player.jump();
      if (player.velocity.y < -0.3 && player.attackEntity(cow)) {
        hitCount++;
      }
      test.assertEntityPresentInArea("cow", false);
    })
    .thenExecute(() => {
      test.assert(hitCount === 7, "It should take 7 critical hits to kill a Cow.");
    })
    .thenSucceed();
})
  .maxTicks(200)
  .structureName("ComponentTests:large_animal_pen")
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("SimulatedPlayerTests", "attack", (test) => {
  const player = test.spawnSimulatedPlayer(new BlockLocation(1, 2, 1));
  const cow = test.spawn("minecraft:cow<minecraft:ageable_grow_up>", new BlockLocation(3, 2, 3));
  let hitCount = 0;
  test
    .startSequence()
    .thenWait(() => {
      player.lookAtEntity(cow);
      if (player.attack()) {
        hitCount++;
      }
      test.assertEntityPresentInArea("cow", false);
    })
    .thenExecute(() => {
      test.assert(hitCount === 10, "It should take 10 hits to kill a Cow.");
    })
    .thenSucceed();
})
  .maxTicks(200)
  .structureName("ComponentTests:large_animal_pen")
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("SimulatedPlayerTests", "use_item", (test) => {
  const player = test.spawnSimulatedPlayer(new BlockLocation(1, 2, 1));
  const snowball = new ItemStack(MinecraftItemTypes.snowball, 1);
  test.spawn("blaze", new BlockLocation(1, 2, 3));
  let useCount = 0;
  test
    .startSequence()
    .thenIdle(5)
    .thenWait(() => {
      if (player.useItem(snowball)) {
        useCount++;
      }
      test.assertEntityPresentInArea("blaze", false);
    })
    .thenExecute(() => {
      test.assert(useCount === 7, "It should take 7 snowballs to kill a Blaze");
    })
    .thenSucceed();
})
  .maxTicks(200)
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("SimulatedPlayerTests", "use_item_in_slot", (test) => {
  const player = test.spawnSimulatedPlayer(new BlockLocation(1, 2, 1));
  test.spawn("blaze", new BlockLocation(1, 2, 3));
  let useCount = 0;
  const slot = 0;
  const snowballCount = 10;
  const inventoryContainer = player.getComponent("inventory").container;

  player.setItem(new ItemStack(MinecraftItemTypes.snowball, snowballCount), slot, true);

  test
    .startSequence()
    .thenIdle(5)
    .thenWait(() => {
      test.assert(
        inventoryContainer.getItem(slot).amount === snowballCount - useCount,
        `Player should have ${snowballCount} snowballs`
      );
      if (player.useItemInSlot(slot)) {
        useCount++;
      }
      test.assertEntityPresentInArea("blaze", false);
    })
    .thenExecute(() => {
      test.assert(
        inventoryContainer.getItem(slot).amount === snowballCount - useCount,
        `Player should have ${snowballCount - useCount} snowballs`
      );
      test.assert(useCount === 7, "It should take 7 snowballs to kill a Blaze");
    })
    .thenSucceed();
})
  .maxTicks(200)
  .structureName("SimulatedPlayerTests:use_item")
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("SimulatedPlayerTests", "use_item_on_block", (test) => {
  const player = test.spawnSimulatedPlayer(new BlockLocation(0, 2, 0));
  test
    .startSequence()
    .thenWait(() => {
      const armorStand = new ItemStack(MinecraftItemTypes.armorStand, 1);
      const armorStandLoc = new BlockLocation(1, 1, 1);
      const used = player.useItemOnBlock(armorStand, armorStandLoc, Direction.up);
      test.assert(used, "Expected armor stand to be used");
      test.assertEntityPresent("armor_stand", armorStandLoc.above());
    })
    .thenWaitAfter(10, () => {
      const dirt = new ItemStack(MinecraftItemTypes.dirt, 1);
      const dirtLoc = new BlockLocation(2, 1, 1);
      const used = player.useItemOnBlock(dirt, dirtLoc, Direction.up);
      test.assert(used, "Expected dirt to be used");
      test.assertBlockPresent(MinecraftBlockTypes.dirt, dirtLoc.above());
    })
    .thenWaitAfter(10, () => {
      const bucket = new ItemStack(MinecraftItemTypes.bucket, 1);
      const waterLoc = new BlockLocation(1, 2, 3);
      const used = player.useItemOnBlock(bucket, waterLoc);
      test.assert(used, "Expected bucket to be used");
      test.assertBlockPresent(MinecraftBlockTypes.air, waterLoc);
    })
    .thenSucceed();
}).tag(GameTest.Tags.suiteDefault);

GameTest.register("SimulatedPlayerTests", "give_item", (test) => {
  const player = test.spawnSimulatedPlayer(new BlockLocation(1, 2, 1));
  let useCount = 0;

  test.assert(player.giveItem(new ItemStack(MinecraftItemTypes.snowball, 16), true), "giveItem() returned false");
  test.spawn("blaze", new BlockLocation(1, 2, 2));

  test
    .startSequence()
    .thenIdle(5)
    .thenWait(() => {
      if (player.useItemInSlot(0)) {
        useCount++;
      }
      test.assertEntityPresentInArea("blaze", false);
    })
    .thenExecute(() => {
      test.assert(useCount === 7, "It should take 7 snowballs to kill a Blaze");
    })
    .thenSucceed();
})
  .maxTicks(200)
  .structureName("SimulatedPlayerTests:blaze_trap")
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("SimulatedPlayerTests", "give_item_full_inventory", (test) => {
  const player = test.spawnSimulatedPlayer(new BlockLocation(1, 2, 1));
  const containerSize = player.getComponent("inventory").container.size;
  for (let i = 0; i < containerSize; i++) {
    test.assert(player.giveItem(new ItemStack(MinecraftItemTypes.dirt, 64), false), "");
  }

  test
    .startSequence()
    .thenExecuteAfter(20, () =>
      test.assert(!player.giveItem(new ItemStack(MinecraftItemTypes.oakStairs, 64), true), "")
    )
    .thenSucceed();
})
  .maxTicks(100)
  .structureName("ComponentTests:platform")
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("SimulatedPlayerTests", "set_item", (test) => {
  const player = test.spawnSimulatedPlayer(new BlockLocation(1, 2, 1));
  let useCount = 0;

  test.assert(player.setItem(new ItemStack(MinecraftItemTypes.snowball, 16), 0), "setItem() failed");
  test.spawn("blaze", new BlockLocation(1, 2, 2));

  test
    .startSequence()
    .thenIdle(5)
    .thenWait(() => {
      if (player.useItemInSlot(0)) {
        useCount++;
      }
      test.assertEntityPresentInArea("blaze", false);
    })
    .thenExecute(() => {
      test.assert(useCount === 7, "It should take 7 snowballs to kill a Blaze");
    })
    .thenSucceed();
})
  .maxTicks(200)
  .structureName("SimulatedPlayerTests:blaze_trap")
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("SimulatedPlayerTests", "set_item_full_inventory", (test) => {
  const player = test.spawnSimulatedPlayer(new BlockLocation(1, 2, 1));
  const containerSize = player.getComponent("inventory").container.size;
  for (let i = 0; i < containerSize; i++) {
    test.assert(player.giveItem(new ItemStack(MinecraftItemTypes.dirt, 64), false), "");
  }

  test
    .startSequence()
    .thenExecuteAfter(20, () =>
      test.assert(player.setItem(new ItemStack(MinecraftItemTypes.oakStairs, 64), 0, true), "setItem() failed")
    )
    .thenSucceed();
})
  .maxTicks(100)
  .structureName("ComponentTests:platform")
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("SimulatedPlayerTests", "interact_with_entity", (test) => {
  const player = test.spawnSimulatedPlayer(new BlockLocation(0, 2, 0));
  const minecart = test.spawn("minecart", new BlockLocation(1, 2, 1));
  player.interactWithEntity(minecart);
  test.succeedWhenEntityPresent("minecraft:player", new BlockLocation(1, 3, 1));
}).tag(GameTest.Tags.suiteDefault);

GameTest.register("SimulatedPlayerTests", "destroy_block", (test) => {
  const player = test.spawnSimulatedPlayer(new BlockLocation(0, 2, 0));
  const fenceLoc = new BlockLocation(1, 2, 0);
  const chestLoc = new BlockLocation(2, 2, 0);
  const ironOreLoc = new BlockLocation(0, 2, 1);
  const planksLoc = new BlockLocation(1, 2, 1);
  const blockLocs = [fenceLoc, chestLoc, ironOreLoc, planksLoc];

  const blockTypes = [
    MinecraftBlockTypes.fence,
    MinecraftBlockTypes.chest,
    MinecraftBlockTypes.ironOre,
    MinecraftBlockTypes.planks,
  ];

  player.giveItem(new ItemStack(MinecraftItemTypes.ironPickaxe, 1), true);

  for (let i = 0; i < blockLocs.length; i++) {
    test.assertBlockPresent(blockTypes[i], blockLocs[i]);
  }

  const sequence = test.startSequence().thenIdle(5);

  for (let i = 0; i < blockLocs.length; i++) {
    sequence
      .thenExecute(() => {
        player.breakBlock(blockLocs[i]);
      })
      .thenWait(() => {
        test.assertBlockPresent(blockTypes[i], blockLocs[i], false);
      });
  }

  sequence.thenSucceed();
})
  .maxTicks(300)
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("SimulatedPlayerTests", "stop_destroying_block", (test) => {
  const ironOreLoc = new BlockLocation(1, 2, 1);
  const player = test.spawnSimulatedPlayer(new BlockLocation(1, 2, 0));

  test.setBlockType(MinecraftBlockTypes.ironOre, ironOreLoc);
  player.giveItem(new ItemStack(MinecraftItemTypes.ironPickaxe, 1), true);

  test
    .startSequence()
    .thenExecuteAfter(5, () => {
      player.breakBlock(ironOreLoc);
    })
    .thenExecuteAfter(10, () => {
      player.stopBreakingBlock();
    })
    .thenExecuteAfter(20, () => {
      test.assertBlockPresent(MinecraftBlockTypes.ironOre, ironOreLoc);
    })
    .thenSucceed();
})
  .structureName("ComponentTests:platform")
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("SimulatedPlayerTests", "use_item_while_destroying_block", (test) => {
  const ironOreLoc = new BlockLocation(1, 2, 1);
  const player = test.spawnSimulatedPlayer(new BlockLocation(1, 2, 0));

  test.setBlockType(MinecraftBlockTypes.ironOre, ironOreLoc);
  player.giveItem(new ItemStack(MinecraftItemTypes.ironPickaxe, 1), false);
  player.giveItem(new ItemStack(MinecraftItemTypes.potion, 1), false);

  test
    .startSequence()
    .thenExecuteAfter(5, () => {
      player.breakBlock(ironOreLoc);
    })
    .thenExecuteAfter(10, () => {
      player.useItemInSlot(1); // drink potion
    })
    .thenExecuteAfter(30, () => {
      test.assertBlockPresent(MinecraftBlockTypes.ironOre, ironOreLoc);
    })
    .thenSucceed();
})
  .structureName("ComponentTests:platform")
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("SimulatedPlayerTests", "move", (test) => {
  const player = test.spawnSimulatedPlayer(new BlockLocation(3, 2, 3));

  test
    .startSequence()
    .thenIdle(10)
    .thenExecute(() => {
      player.move(0, -1);
      player.setBodyRotation(180);
    })
    .thenIdle(16)
    .thenExecute(() => {
      player.move(1, 1);
      player.setBodyRotation(50);
    })
    .thenIdle(16)
    .thenExecute(() => {
      player.move(-1, 1);
      player.setBodyRotation(100);
    })
    .thenIdle(16)
    .thenExecute(() => {
      player.move(-1, -1);
      player.setBodyRotation(220);
    })
    .thenIdle(16)
    .thenExecute(() => {
      player.move(1, -1);
      player.setBodyRotation(0);
    })
    .thenWait(() => {
      test.assertBlockPresent(MinecraftBlockTypes.air, new BlockLocation(2, 2, 0));
      test.assertBlockPresent(MinecraftBlockTypes.air, new BlockLocation(0, 2, 4));
      test.assertBlockPresent(MinecraftBlockTypes.air, new BlockLocation(4, 2, 6));
      test.assertBlockPresent(MinecraftBlockTypes.air, new BlockLocation(6, 2, 2));
    })
    .thenSucceed();
})
  .maxTicks(110)
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("SimulatedPlayerTests", "move_relative", (test) => {
  const player = test.spawnSimulatedPlayer(new BlockLocation(3, 2, 3));

  test
    .startSequence()
    .thenIdle(10)
    .thenExecute(() => {
      player.moveRelative(0, 1);
      player.setBodyRotation(180);
    })
    .thenIdle(16)
    .thenExecute(() => {
      player.setBodyRotation(-45);
    })
    .thenIdle(16)
    .thenExecute(() => {
      player.setBodyRotation(45);
    })
    .thenIdle(16)
    .thenExecute(() => {
      player.setBodyRotation(135);
    })
    .thenIdle(16)
    .thenExecute(() => {
      player.setBodyRotation(225);
    })
    .thenWait(() => {
      test.assertBlockPresent(MinecraftBlockTypes.air, new BlockLocation(2, 2, 0));
      test.assertBlockPresent(MinecraftBlockTypes.air, new BlockLocation(0, 2, 4));
      test.assertBlockPresent(MinecraftBlockTypes.air, new BlockLocation(4, 2, 6));
      test.assertBlockPresent(MinecraftBlockTypes.air, new BlockLocation(6, 2, 2));
    })
    .thenSucceed();
})
  .maxTicks(110)
  .structureName("SimulatedPlayerTests:move")
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("SimulatedPlayerTests", "move_to_block", (test) => {
  const player = test.spawnSimulatedPlayer(new BlockLocation(3, 2, 3));
  test
    .startSequence()
    .thenIdle(5)
    .thenExecute(() => {
      player.moveToBlock(new BlockLocation(3, 2, 1));
    })
    .thenIdle(25)
    .thenExecute(() => {
      player.moveToBlock(new BlockLocation(5, 2, 3));
    })
    .thenIdle(25)
    .thenExecute(() => {
      player.moveToBlock(new BlockLocation(3, 2, 5));
    })
    .thenIdle(25)
    .thenExecute(() => {
      player.moveToBlock(new BlockLocation(1, 2, 3));
    })
    .thenIdle(25)
    .thenExecute(() => {
      player.moveToBlock(new BlockLocation(3, 2, 1));
    })
    .thenIdle(25)
    .thenExecute(() => {
      player.moveToBlock(new BlockLocation(3, 2, 3));
    })
    .thenWait(() => {
      test.assertBlockPresent(MinecraftBlockTypes.air, new BlockLocation(2, 2, 0));
      test.assertBlockPresent(MinecraftBlockTypes.air, new BlockLocation(0, 2, 4));
      test.assertBlockPresent(MinecraftBlockTypes.air, new BlockLocation(4, 2, 6));
      test.assertBlockPresent(MinecraftBlockTypes.air, new BlockLocation(6, 2, 2));
    })
    .thenSucceed();
})
  .maxTicks(200)
  .structureName("SimulatedPlayerTests:move")
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("SimulatedPlayerTests", "move_to_location", (test) => {
  const player = test.spawnSimulatedPlayer(new BlockLocation(3, 2, 3));
  test
    .startSequence()
    .thenIdle(5)
    .thenExecute(() => {
      player.moveToLocation(new Location(3.5, 2, 1.5));
    })
    .thenIdle(25)
    .thenExecute(() => {
      player.moveToLocation(new Location(5.5, 2, 3.5));
    })
    .thenIdle(25)
    .thenExecute(() => {
      player.moveToLocation(new Location(3.5, 2, 5.5));
    })
    .thenIdle(25)
    .thenExecute(() => {
      player.moveToLocation(new Location(1.5, 2, 3.5));
    })
    .thenIdle(25)
    .thenExecute(() => {
      player.moveToLocation(new Location(3.5, 2, 1.5));
    })
    .thenIdle(25)
    .thenExecute(() => {
      player.moveToLocation(new Location(3.5, 2, 3.5));
    })
    .thenWait(() => {
      test.assertBlockPresent(MinecraftBlockTypes.air, new BlockLocation(2, 2, 0));
      test.assertBlockPresent(MinecraftBlockTypes.air, new BlockLocation(0, 2, 4));
      test.assertBlockPresent(MinecraftBlockTypes.air, new BlockLocation(4, 2, 6));
      test.assertBlockPresent(MinecraftBlockTypes.air, new BlockLocation(6, 2, 2));
    })
    .thenSucceed();
})
  .maxTicks(200)
  .structureName("SimulatedPlayerTests:move")
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("SimulatedPlayerTests", "navigate_to_block", (test) => {
  const player = test.spawnSimulatedPlayer(new BlockLocation(2, 2, 0));
  const goalLoc = new BlockLocation(0, 3, 2);
  const behindDoorLoc = new BlockLocation(4, 3, 2);

  test
    .startSequence()
    .thenExecuteAfter(10, () => {
      const nav = player.navigateToBlock(behindDoorLoc);
      test.assert(nav.isFullPath, "Expected successful navigation result");
      const path = nav.path;
      test.assert(path[0].equals(new BlockLocation(2, 2, 0)), "Unexpected starting BlockLocation in navigation path.");
      test.assert(
        path[path.length - 1].equals(new BlockLocation(4, 3, 2)),
        "Unexpected ending BlockLocation in navigation path."
      );
    })
    .thenWait(() => {
      test.assertEntityInstancePresent(player, behindDoorLoc);
    })
    .thenExecuteAfter(10, () => {
      const nav = player.navigateToBlock(goalLoc);
      test.assert(nav.isFullPath, "Expected successful navigation result");
      const path = nav.path;
      test.assert(
        path[path.length - 1].equals(new BlockLocation(0, 3, 2)),
        "Unexpected ending BlockLocation in navigation path."
      );
    })
    .thenWait(() => {
      test.assertEntityInstancePresent(player, goalLoc);
    })
    .thenSucceed();
})
  .maxTicks(300)
  .structureName("SimulatedPlayerTests:navigate_to_location")
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("SimulatedPlayerTests", "navigate_to_entity", (test) => {
  const player = test.spawnSimulatedPlayer(new BlockLocation(2, 2, 0));
  const goalLoc = new BlockLocation(0, 3, 2);
  const behindDoorLoc = new BlockLocation(4, 3, 2);

  const armorStand1 = test.spawn("armor_stand", behindDoorLoc.above());
  const armorStand2 = test.spawn("armor_stand", goalLoc.above());

  test
    .startSequence()
    .thenExecuteAfter(10, () => {
      const nav = player.navigateToEntity(armorStand1);
      test.assert(nav.isFullPath, "Expected successful navigation result");
      const path = nav.path;
      test.assert(path[0].equals(new BlockLocation(2, 2, 0)), "Unexpected starting BlockLocation in navigation path.");
      test.assert(
        path[path.length - 1].equals(new BlockLocation(4, 3, 2)),
        "Unexpected ending BlockLocation in navigation path."
      );
    })
    .thenWait(() => {
      test.assertEntityInstancePresent(player, behindDoorLoc);
    })
    .thenExecuteAfter(10, () => {
      const nav = player.navigateToEntity(armorStand2);
      test.assert(nav.isFullPath, "Expected successful navigation result");
      const path = nav.path;
      test.assert(
        path[path.length - 1].equals(new BlockLocation(0, 3, 2)),
        "Unexpected ending BlockLocation in navigation path."
      );
    })
    .thenWait(() => {
      test.assertEntityInstancePresent(player, goalLoc);
    })
    .thenSucceed();
})
  .maxTicks(300)
  .structureName("SimulatedPlayerTests:navigate_to_location")
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("SimulatedPlayerTests", "navigate_to_location", (test) => {
  const player = test.spawnSimulatedPlayer(new BlockLocation(2, 2, 0));
  const goalLoc = new BlockLocation(0, 3, 2);
  const behindDoorLoc = new BlockLocation(4, 3, 2);

  test
    .startSequence()
    .thenExecuteAfter(10, () => {
      const nav = player.navigateToLocation(new Location(4.5, 3, 2.5));
      test.assert(nav.isFullPath, "Expected successful navigation result");
      const path = nav.path;
      test.assert(path[0].equals(new BlockLocation(2, 2, 0)), "Unexpected starting BlockLocation in navigation path.");
      test.assert(
        path[path.length - 1].equals(new BlockLocation(4, 3, 2)),
        "Unexpected ending BlockLocation in navigation path."
      );
    })
    .thenWait(() => {
      test.assertEntityInstancePresent(player, behindDoorLoc);
    })
    .thenExecuteAfter(10, () => {
      const nav = player.navigateToLocation(new Location(0.5, 3, 2.5));
      test.assert(nav.isFullPath, "Expected successful navigation result");
      const path = nav.path;
      test.assert(
        path[path.length - 1].equals(new BlockLocation(0, 3, 2)),
        "Unexpected ending BlockLocation in navigation path."
      );
    })
    .thenWait(() => {
      test.assertEntityInstancePresent(player, goalLoc);
    })
    .thenSucceed();
})
  .maxTicks(300)
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("SimulatedPlayerTests", "navigate_to_locations", (test) => {
  const player = test.spawnSimulatedPlayer(new BlockLocation(2, 2, 0));
  const goalLoc = new BlockLocation(0, 3, 2);
  const locations = [new Location(4.5, 3, 2.5), new Location(0.5, 3, 2.5)];

  test
    .startSequence()
    .thenExecuteAfter(10, () => {
      player.navigateToLocations(locations);
    })
    .thenWait(() => {
      test.assertEntityInstancePresent(player, goalLoc);
    })
    .thenSucceed();
})
  .maxTicks(300)
  .structureName("SimulatedPlayerTests:navigate_to_location")
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("SimulatedPlayerTests", "stop_moving", (test) => {
  const spawnLoc = new BlockLocation(1, 2, 0);
  const player = test.spawnSimulatedPlayer(spawnLoc);
  player.move(0, 1);

  test
    .startSequence()
    .thenExecuteAfter(10, () => {
      player.stopMoving();
    })
    .thenExecuteAfter(20, () => {
      test.assertEntityInstancePresent(player, spawnLoc, false);
      test.assertEntityInstancePresent(player, new BlockLocation(1, 3, 4), false);
    })
    .thenSucceed();
}).tag(GameTest.Tags.suiteDefault);

GameTest.register("SimulatedPlayerTests", "shoot_bow", (test) => {
  const player = test.spawnSimulatedPlayer(new BlockLocation(1, 2, 1));
  const lampLoc = new BlockLocation(2, 3, 7);

  test
    .startSequence()
    .thenExecuteAfter(5, () => {
      player.giveItem(new ItemStack(MinecraftItemTypes.bow, 1), false);
      player.giveItem(new ItemStack(MinecraftItemTypes.arrow, 64), false);
    })
    .thenExecuteAfter(5, () => {
      player.useItemInSlot(0);
    })
    .thenExecuteAfter(50, () => {
      player.stopUsingItem();
    })
    .thenWait(() => {
      test.assertBlockPresent(MinecraftBlockTypes.litRedstoneLamp, lampLoc);
    })
    .thenSucceed();
})
  .structureName("SimulatedPlayerTests:target_practice")
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("SimulatedPlayerTests", "shoot_crossbow", (test) => {
  const player = test.spawnSimulatedPlayer(new BlockLocation(1, 2, 1));
  const lampLoc = new BlockLocation(2, 3, 7);

  test
    .startSequence()
    .thenExecuteAfter(5, () => {
      player.giveItem(new ItemStack(MinecraftItemTypes.crossbow, 1), false);
      player.giveItem(new ItemStack(MinecraftItemTypes.arrow, 64), false);
    })
    .thenExecuteAfter(5, () => {
      player.useItemInSlot(0);
    })
    .thenExecuteAfter(50, () => {
      player.stopUsingItem();
      player.useItemInSlot(0);
    })
    .thenWait(() => {
      test.assertBlockPresent(MinecraftBlockTypes.litRedstoneLamp, lampLoc);
    })
    .thenSucceed();
})
  .maxTicks(150)
  .structureName("SimulatedPlayerTests:target_practice")
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("SimulatedPlayerTests", "move_in_minecart", (test) => {
  const player = test.spawnSimulatedPlayer(new BlockLocation(0, 2, 0));
  const minecart = test.spawn("minecart", new BlockLocation(1, 2, 0));
  const lampLoc = new BlockLocation(0, 2, 3);

  test
    .startSequence()
    .thenExecuteAfter(20, () => {
      player.interactWithEntity(minecart);
      player.move(0, 1);
    })
    .thenWait(() => {
      test.assertBlockPresent(MinecraftBlockTypes.litRedstoneLamp, lampLoc);
    })
    .thenSucceed();
})
  .maxTicks(200)
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("SimulatedPlayerTests", "rotate_body", (test) => {
  const player = test.spawnSimulatedPlayer(new BlockLocation(1, 2, 1));

  test
    .startSequence()
    .thenExecuteAfter(5, () => {
      test.assert(player.rotation.y === 0, "Expected body rotation of 0 degrees (1)");
    })
    .thenExecuteAfter(5, () => {
      player.setBodyRotation(90);
      test.assert(player.rotation.y === 90, "Expected body rotation of 90 degrees (2)");
    })
    .thenExecuteAfter(5, () => {
      player.setBodyRotation(-90);
      test.assert(player.rotation.y === -90, "Expected body rotation of -90 degrees (3)");
    })
    .thenExecuteAfter(5, () => {
      player.setBodyRotation(180);
      test.assert(player.rotation.y === -180, "Expected body rotation of -180 degrees (4)");
    })
    .thenExecuteAfter(5, () => {
      player.rotateBody(180);
      test.assert(player.rotation.y === 0, "Expected body rotation of 0 degrees (5)");
    })
    .thenExecuteAfter(5, () => {
      player.rotateBody(90);
      test.assert(player.rotation.y === 90, "Expected body rotation of 90 degrees (6)");
    })
    .thenExecuteAfter(5, () => {
      player.rotateBody(-180);
      test.assert(player.rotation.y === -90, "Expected body rotation of -90 degrees (7)");
    })
    .thenSucceed();
})
  .structureName("ComponentTests:platform")
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("SimulatedPlayerTests", "look_at_entity", (test) => {
  const player = test.spawnSimulatedPlayer(new BlockLocation(1, 2, 1));
  const leftArmorStand = test.spawn("armor_stand", new BlockLocation(2, 2, 1));
  const rightArmorStand = test.spawn("armor_stand", new BlockLocation(0, 2, 1));

  test
    .startSequence()
    .thenExecuteAfter(5, () => {
      player.lookAtEntity(leftArmorStand);
      test.assert(player.rotation.y === -90, "Expected body rotation of -90 degrees");
    })
    .thenExecuteAfter(5, () => {
      player.lookAtEntity(rightArmorStand);
      test.assert(player.rotation.y === 90, "Expected body rotation of 90 degrees");
    })
    .thenSucceed();
})
  .structureName("ComponentTests:platform")
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("SimulatedPlayerTests", "look_at_block", (test) => {
  const player = test.spawnSimulatedPlayer(new BlockLocation(1, 2, 1));
  const leftBlockLoc = new BlockLocation(2, 2, 1);
  const rightBlockLoc = new BlockLocation(0, 2, 1);

  test
    .startSequence()
    .thenExecuteAfter(10, () => {
      test.assert(player.rotation.y === 0, "Expected body rotation of 0 degrees");
      test.assert(player.headRotation.x === 0, "Expected head pitch of 0 degrees");
      test.assert(player.headRotation.y === 0, "Expected head yaw of 0 degrees");
      player.lookAtBlock(leftBlockLoc);
    })
    .thenExecuteAfter(20, () => {
      test.assert(player.rotation.y === -90, "Expected body rotation of -90 degrees");
      test.assert(isNear(player.headRotation.x, 48.24), "Expected head pitch of ~48.24 degrees");
      test.assert(player.headRotation.y === -90, "Expected head yaw of -90 degrees");
    })
    .thenExecuteAfter(10, () => {
      player.lookAtBlock(rightBlockLoc);
    })
    .thenExecuteAfter(20, () => {
      test.assert(player.rotation.y === 90, "Expected body rotation of 90 degrees");
      test.assert(isNear(player.headRotation.x, 48.24), "Expected head pitch of ~48.24 degrees");
      test.assert(player.headRotation.y === 90, "Expected head yaw of 90 degrees");
    })
    .thenSucceed();
})
  .structureName("ComponentTests:platform")
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("SimulatedPlayerTests", "look_at_location", (test) => {
  const player = test.spawnSimulatedPlayer(new BlockLocation(1, 2, 1));
  const leftLoc = new Location(2.5, 2, 1.5);
  const rightLoc = new Location(0.5, 2, 1.5);

  test
    .startSequence()
    .thenExecuteAfter(10, () => {
      test.assert(player.rotation.y === 0, "Expected body rotation of 0 degrees");
      test.assert(player.headRotation.x === 0, "Expected head pitch of 0 degrees");
      test.assert(player.headRotation.y === 0, "Expected head yaw of 0 degrees");
      player.lookAtLocation(leftLoc);
    })
    .thenExecuteAfter(20, () => {
      test.assert(player.rotation.y === -90, "Expected body rotation of -90 degrees");
      test.assert(isNear(player.headRotation.x, 58.31), "Expected head pitch of ~58.31 degrees");
      test.assert(player.headRotation.y === -90, "Expected head yaw of -90 degrees");
    })
    .thenExecuteAfter(10, () => {
      player.lookAtLocation(rightLoc);
    })
    .thenExecuteAfter(20, () => {
      test.assert(player.rotation.y === 90, "Expected body rotation of 90 degrees");
      test.assert(isNear(player.headRotation.x, 58.31), "Expected head pitch of ~58.31 degrees");
      test.assert(player.headRotation.y === 90, "Expected head yaw of 90 degrees");
    })
    .thenSucceed();
})
  .structureName("ComponentTests:platform")
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("SimulatedPlayerTests", "use_item_in_slot_on_block", (test) => {
  const player = test.spawnSimulatedPlayer(new BlockLocation(1, 2, 0));
  const wallLoc = new BlockLocation(1, 3, 2);
  const slabLoc = new BlockLocation(1, 3, 1);
  const woodenSlabSlot = 1;
  const inventoryContainer = player.getComponent("inventory").container;

  test
    .startSequence()
    .thenExecuteAfter(5, () => {
      player.setItem(new ItemStack(MinecraftItemTypes.crimsonSlab, 2), 0);
      player.setItem(new ItemStack(MinecraftItemTypes.woodenSlab, 2), woodenSlabSlot);
      player.setItem(new ItemStack(MinecraftItemTypes.warpedSlab, 2), 2);
      test.assert(inventoryContainer.getItem(woodenSlabSlot).amount === 2, "Player should have 2 wooden slabs");
    })
    .thenExecuteAfter(10, () => {
      player.useItemInSlotOnBlock(woodenSlabSlot, wallLoc, Direction.north, 0.5, 0.75); // place upper slab
      test.assert(inventoryContainer.getItem(woodenSlabSlot).amount === 1, "Player should have 1 wooden slab");
    })
    .thenExecuteAfter(10, () => {
      player.useItemInSlotOnBlock(woodenSlabSlot, wallLoc, Direction.north, 0.5, 0.25); // place lower slab
      test.assert(inventoryContainer.getItem(woodenSlabSlot) === undefined, "Player should have 0 wooden slabs");
    })
    .thenWait(() => {
      test.assertBlockPresent(MinecraftBlockTypes.doubleWoodenSlab, slabLoc);
    })
    .thenSucceed();
}).tag(GameTest.Tags.suiteDefault);

GameTest.register("SimulatedPlayerTests", "use_item_on_block_2", (test) => {
  const player = test.spawnSimulatedPlayer(new BlockLocation(1, 2, 0));
  const wallLoc = new BlockLocation(1, 3, 2);
  const slabLoc = new BlockLocation(1, 3, 1);
  const woodenSlab = new ItemStack(MinecraftItemTypes.woodenSlab, 1);

  test
    .startSequence()
    .thenExecuteAfter(10, () => {
      player.useItemOnBlock(woodenSlab, wallLoc, Direction.north, 0.5, 0.75); // place upper slab
    })
    .thenExecuteAfter(10, () => {
      player.useItemOnBlock(woodenSlab, wallLoc, Direction.north, 0.5, 0.25); // place lower slab
    })
    .thenWait(() => {
      test.assertBlockPresent(MinecraftBlockTypes.doubleWoodenSlab, slabLoc);
    })
    .thenSucceed();
})
  .structureName("SimulatedPlayerTests:use_item_in_slot_on_block")
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("SimulatedPlayerTests", "interact", (test) => {
  const player = test.spawnSimulatedPlayer(new BlockLocation(1, 2, 0));
  const leverLoc = new BlockLocation(1, 3, 2);
  const lampLoc = new BlockLocation(2, 2, 2);

  test
    .startSequence()
    .thenExecuteAfter(5, () => {
      player.lookAtBlock(leverLoc);
      player.interact();
    })
    .thenWait(() => {
      test.assertBlockPresent(MinecraftBlockTypes.litRedstoneLamp, lampLoc);
    })
    .thenSucceed();
}).tag(GameTest.Tags.suiteDefault);

GameTest.register("SimulatedPlayerTests", "interact_with_block", (test) => {
  const player = test.spawnSimulatedPlayer(new BlockLocation(1, 2, 0));
  const leverLoc = new BlockLocation(1, 3, 2);
  const lampLoc = new BlockLocation(2, 2, 2);

  test
    .startSequence()
    .thenExecuteAfter(5, () => {
      player.interactWithBlock(leverLoc);
    })
    .thenWait(() => {
      test.assertBlockPresent(MinecraftBlockTypes.litRedstoneLamp, lampLoc);
    })
    .thenSucceed();
})
  .structureName("SimulatedPlayerTests:interact")
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("SimulatedPlayerTests", "one_tick", (test) => {
  for (let i = 0; i < 3; i++) {
    test.spawnSimulatedPlayer(new BlockLocation(1, 2, 0));
  }
  test.succeedOnTick(1);
})
  .structureName("ComponentTests:platform")
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("SimulatedPlayerTests", "destroy_block_creative", (test) => {
  const blockLoc = new BlockLocation(2, 2, 1);
  const spawnLoc = new BlockLocation(2, 2, 3);
  const playerName = "Simulated Player (Creative)";

  let player = test.spawnSimulatedPlayer(spawnLoc, playerName);
  test
    .startSequence()
    .thenExecuteAfter(5, () => {
      player.runCommand("gamemode creative");
    })
    .thenExecute(() => {
      player.breakBlock(blockLoc);
    })
    .thenExecuteAfter(1, () => {
      test.assertBlockPresent(MinecraftBlockTypes.air, blockLoc);
      test.setBlockType(MinecraftBlockTypes.goldBlock, blockLoc);
    })
    .thenExecuteAfter(2, () => {
      test.assertBlockPresent(MinecraftBlockTypes.goldBlock, blockLoc);
    })
    .thenSucceed();
}).tag(GameTest.Tags.suiteDefault);

GameTest.registerAsync("SimulatedPlayerTests", "run_command_after_spawn", async (test) => {
  const spawnLoc = new BlockLocation(1, 2, 2);

  let player = test.spawnSimulatedPlayer(spawnLoc);
  test.assertEntityPresent("player", spawnLoc);
  player.runCommand("kill @s");
  test.assertEntityPresent("player", spawnLoc, false);
  test.succeed();
})
  .structureName("ComponentTests:platform")
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("SimulatedPlayerTests", "sneaking", (test) => {
  const player = test.spawnSimulatedPlayer(new BlockLocation(1, 2, 0));
  const goalLoc = new BlockLocation(1, 2, 3);
  const healthComponent = player.getComponent("minecraft:health");

  player.isSneaking = true;
  player.moveToBlock(goalLoc);

  test
    .startSequence()
    .thenExecuteAfter(20, () => {
      test.assertEntityInstancePresent(player, goalLoc, false);
    })
    .thenExecuteAfter(60, () => {
      test.assertEntityInstancePresent(player, goalLoc);
      test.assert(healthComponent.current === healthComponent.value, "Player should not be hurt");
    })
    .thenSucceed();

  test.startSequence();
}).tag(GameTest.Tags.suiteDefault);

GameTest.register("SimulatedPlayerTests", "move_to_block_slowly", (test) => {
  const player = test.spawnSimulatedPlayer(new BlockLocation(1, 2, 0));
  const goalLoc = new BlockLocation(1, 2, 3);
  const healthComponent = player.getComponent("minecraft:health");

  player.moveToBlock(goalLoc, 0.3);

  test
    .startSequence()
    .thenExecuteAfter(20, () => {
      test.assertEntityInstancePresent(player, goalLoc, false);
    })
    .thenExecuteAfter(60, () => {
      test.assertEntityInstancePresent(player, goalLoc);
      test.assert(healthComponent.current !== healthComponent.value, "Player should be hurt");
    })
    .thenSucceed();

  test.startSequence();
})
  .structureName("SimulatedPlayerTests:sneaking")
  .tag(GameTest.Tags.suiteDefault);

GameTest.registerAsync("SimulatedPlayerTests", "player_join_leave_events", async (test) => {
  const thePlayerName = "Gary_The_Duck_411";

  let expectedPlayerJoined = false;
  const playerJoinCallback = world.events.playerJoin.subscribe((e) => {
    if (e.player.name == thePlayerName) {
      expectedPlayerJoined = true;
    }
  });

  let expectedPlayerLeft = false;
  const playerLeaveCallback = world.events.playerLeave.subscribe((e) => {
    if (e.playerName == thePlayerName) {
      expectedPlayerLeft = true;
    }
  });

  let simPlayer = test.spawnSimulatedPlayer(new BlockLocation(0, 2, 0), thePlayerName);
  await test.idle(1);

  if (!expectedPlayerJoined) {
    test.fail("Expected playerJoin event");
  }

  test.removeSimulatedPlayer(simPlayer);
  await test.idle(1);

  if (!expectedPlayerLeft) {
    test.fail("Expected playerLeave event");
  }

  world.events.playerJoin.unsubscribe(playerJoinCallback);
  world.events.playerLeave.unsubscribe(playerLeaveCallback);

  test.succeed();
})
  .structureName("ComponentTests:platform")
  .tag(GameTest.Tags.suiteDefault);

GameTest.registerAsync("SimulatedPlayerTests", "player_update_selected_slot", async (test) => {
  const player = test.spawnSimulatedPlayer(new BlockLocation(0, 2, 0));

  await test.idle(1);

  test.assert(player.selectedSlot === 0, "Expected default selected slot of the player to be 0");

  player.selectedSlot = 1;

  test.assert(player.selectedSlot === 1, "Expected player selected slot to be updated after change");

  test.succeed();
})
  .structureName("ComponentTests:platform")
  .tag(GameTest.Tags.suiteDefault);

GameTest.registerAsync("SimulatedPlayerTests", "player_uses_correct_item_from_updated_slot", async (test) => {
  const player = test.spawnSimulatedPlayer(new BlockLocation(0, 2, 0));
  const blockLoc = new BlockLocation(2, 1, 1);
  const dirt = new ItemStack(MinecraftItemTypes.dirt, 1);
  const stone = new ItemStack(MinecraftItemTypes.stone, 1);

  await test.idle(1);

  player.giveItem(dirt, false);
  player.giveItem(stone, false);

  await test.idle(1);

  test.assert(player.selectedSlot === 0, "Player selected slot should not have been updated");

  player.selectedSlot = 1;

  player.useItemInSlotOnBlock(player.selectedSlot, blockLoc, Direction.up);

  await test.idle(1);

  test.assertBlockPresent(MinecraftBlockTypes.stone, blockLoc.above(), true);

  test.succeed();
})
  .structureName("ComponentTests:platform")
  .tag(GameTest.Tags.suiteDefault);

// SIG // Begin signature block
// SIG // MIInsQYJKoZIhvcNAQcCoIInojCCJ54CAQExDzANBglg
// SIG // hkgBZQMEAgEFADB3BgorBgEEAYI3AgEEoGkwZzAyBgor
// SIG // BgEEAYI3AgEeMCQCAQEEEBDgyQbOONQRoqMAEEvTUJAC
// SIG // AQACAQACAQACAQACAQAwMTANBglghkgBZQMEAgEFAAQg
// SIG // psDoCrEgkwWq5Wjgkmg+2sXeTCJrDxAcYaIo8YxXo+6g
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
// SIG // ARUwLwYJKoZIhvcNAQkEMSIEIE9+ZHGIziJSWf+vDUfb
// SIG // pTIP59v3VxT8UGjKSEXLCPsEMFQGCisGAQQBgjcCAQwx
// SIG // RjBEoCSAIgBNAGkAbgBlAGMAcgBhAGYAdAAgAEIAZQBk
// SIG // AHIAbwBjAGuhHIAaaHR0cHM6Ly93d3cubWluZWNyYWZ0
// SIG // Lm5ldC8wDQYJKoZIhvcNAQEBBQAEggEAq7GTMAylZFqf
// SIG // rRyFBjjxjJCXvxJpU3HVRZPNL6tdwugmWW9ovMfWiYag
// SIG // AoUc0VXauZDjxoOWKh+kOFDo+omV1YU699DkAoEGWobz
// SIG // 7H+VwRxLxqokti6Uq6HK2kY8hTXW5ralZ+rzRmYfFKGc
// SIG // GrmpHrTV+DgVDdpNLrq7GHg+Yk6Qk/tl/NhucotG9PK4
// SIG // mSCddrJ6jCGGcZuwW+Jg7g5FUNVFejffa8rusJigv9i7
// SIG // wCrCcz0qlrG90xE39EAl2HPLzWV3rBOtKBtUIkl824Qp
// SIG // SG2kIePwy4xgVFDIwci7UPVpdFo9yBsCRBfOSCK9Gih1
// SIG // gTBkzhgRedJpH6bwWfkJt6GCFwAwghb8BgorBgEEAYI3
// SIG // AwMBMYIW7DCCFugGCSqGSIb3DQEHAqCCFtkwghbVAgED
// SIG // MQ8wDQYJYIZIAWUDBAIBBQAwggFRBgsqhkiG9w0BCRAB
// SIG // BKCCAUAEggE8MIIBOAIBAQYKKwYBBAGEWQoDATAxMA0G
// SIG // CWCGSAFlAwQCAQUABCBMkpBCeApE+1rmiqh0BLFYb4FL
// SIG // NFT6dShFNuciYL3MGwIGYoIwqalEGBMyMDIyMDUyNzAw
// SIG // NTAyOC43NjVaMASAAgH0oIHQpIHNMIHKMQswCQYDVQQG
// SIG // EwJVUzETMBEGA1UECBMKV2FzaGluZ3RvbjEQMA4GA1UE
// SIG // BxMHUmVkbW9uZDEeMBwGA1UEChMVTWljcm9zb2Z0IENv
// SIG // cnBvcmF0aW9uMSUwIwYDVQQLExxNaWNyb3NvZnQgQW1l
// SIG // cmljYSBPcGVyYXRpb25zMSYwJAYDVQQLEx1UaGFsZXMg
// SIG // VFNTIEVTTjpERDhDLUUzMzctMkZBRTElMCMGA1UEAxMc
// SIG // TWljcm9zb2Z0IFRpbWUtU3RhbXAgU2VydmljZaCCEVcw
// SIG // ggcMMIIE9KADAgECAhMzAAABnA+mTWHSnksoAAEAAAGc
// SIG // MA0GCSqGSIb3DQEBCwUAMHwxCzAJBgNVBAYTAlVTMRMw
// SIG // EQYDVQQIEwpXYXNoaW5ndG9uMRAwDgYDVQQHEwdSZWRt
// SIG // b25kMR4wHAYDVQQKExVNaWNyb3NvZnQgQ29ycG9yYXRp
// SIG // b24xJjAkBgNVBAMTHU1pY3Jvc29mdCBUaW1lLVN0YW1w
// SIG // IFBDQSAyMDEwMB4XDTIxMTIwMjE5MDUxOVoXDTIzMDIy
// SIG // ODE5MDUxOVowgcoxCzAJBgNVBAYTAlVTMRMwEQYDVQQI
// SIG // EwpXYXNoaW5ndG9uMRAwDgYDVQQHEwdSZWRtb25kMR4w
// SIG // HAYDVQQKExVNaWNyb3NvZnQgQ29ycG9yYXRpb24xJTAj
// SIG // BgNVBAsTHE1pY3Jvc29mdCBBbWVyaWNhIE9wZXJhdGlv
// SIG // bnMxJjAkBgNVBAsTHVRoYWxlcyBUU1MgRVNOOkREOEMt
// SIG // RTMzNy0yRkFFMSUwIwYDVQQDExxNaWNyb3NvZnQgVGlt
// SIG // ZS1TdGFtcCBTZXJ2aWNlMIICIjANBgkqhkiG9w0BAQEF
// SIG // AAOCAg8AMIICCgKCAgEA21IqDBldSRY/rOtdrNNpirtt
// SIG // yj1DbO9Tow3iRrcZExfa0lk4rgPF4GJAAIv+fthX+wpO
// SIG // yXCkPR/1w9TisINf2x9xNajtc/F0ctD5aRoZsopYBOyr
// SIG // Dr1vDyGQn9uNynZXYDq8ay/ByokKHTsErck+ZS1mKTLL
// SIG // k9nx/JPKIoY3uE5aVohT2gii5xQ2gAdAnMuryHbR42Ad
// SIG // SHt4jmT4rKri/rzXQse4DoQfIok5k3bFPDklKQvLQU3k
// SIG // yGD85oWsUGXeJqDZOqngicou34luH8l3R62d6LZoMcWu
// SIG // aV8+aVFK/nBI1fnMCGATJGmOZBzPXOnRBpIB59GQyb3b
// SIG // f+eBTnUhutVsB4ePnr1IcL12geCwjGSHQreWnDnzb7Q4
// SIG // 1dwh8hTqeQFP6oAMBn7R1PW67+BFMHLrXhACh+OjbnxN
// SIG // tJf1o5TVIe4AL7dsyjIzuM10cQlE4f6awUMFyYlGXhUq
// SIG // xF4jn5Lr0pQZ4sgGGGaeZDp2sXwinRmI76+ECwPd70Ce
// SIG // qdjsdyB7znQj2gq/C7ClXBacqfDBIYSUzPtS8KhyahQx
// SIG // eTtWfZo22L5t0fbz4ZBvkQyyqE6a+5k4JGk5Y3fcb5ve
// SIG // Dm6fAQ/R5OJj4udZrYC4rjfP+mmVRElWV7b0rjZA+Q5y
// SIG // CUHqyMuY2kSlv1tqwnvZ4DQyWnUu0fehhkZeyCBN+5cC
// SIG // AwEAAaOCATYwggEyMB0GA1UdDgQWBBS7aQlnU12OXbXX
// SIG // ZLKcvqMYwgP6sjAfBgNVHSMEGDAWgBSfpxVdAF5iXYP0
// SIG // 5dJlpxtTNRnpcjBfBgNVHR8EWDBWMFSgUqBQhk5odHRw
// SIG // Oi8vd3d3Lm1pY3Jvc29mdC5jb20vcGtpb3BzL2NybC9N
// SIG // aWNyb3NvZnQlMjBUaW1lLVN0YW1wJTIwUENBJTIwMjAx
// SIG // MCgxKS5jcmwwbAYIKwYBBQUHAQEEYDBeMFwGCCsGAQUF
// SIG // BzAChlBodHRwOi8vd3d3Lm1pY3Jvc29mdC5jb20vcGtp
// SIG // b3BzL2NlcnRzL01pY3Jvc29mdCUyMFRpbWUtU3RhbXAl
// SIG // MjBQQ0ElMjAyMDEwKDEpLmNydDAMBgNVHRMBAf8EAjAA
// SIG // MBMGA1UdJQQMMAoGCCsGAQUFBwMIMA0GCSqGSIb3DQEB
// SIG // CwUAA4ICAQCnACqmIxhHM01jLPc9Ju2KNt7IKlRdy8iu
// SIG // oDjM+0whwCTfhb272ZEOd1ZL62VHdbBOmvU6BpXXCZzp
// SIG // gXOoroQZab3TdQSwUTvEEkw9eN91U4+FwkHe9+8DQ9fn
// SIG // qihtwXY682w5LBMHxuL+ez4Kzf0+7Oz5BI1Bl3yIBUEJ
// SIG // K/E0Ivvx2WfZEZTXHIHgAqpX2+Lhj8Z+bHYUD6MXTL5g
// SIG // t6hvQzjSeVLEvSrTvm3svqIVEw2vS7xE6HOEM8uX7h49
// SIG // h9SbJgmihu/J16X1qcASwcWWEqX5pdvaJzfI3Buyg/Jx
// SIG // kkv++jw5W9hjELL7/kWtCYC+hbRkRoGJhwqTOs1a3+Ff
// SIG // 2vkqB3AvrXHRmJNmilOSjpb/nxRN59NuFfs+eLQwCkfc
// SIG // +/K3o3QgVqn78uXAVEPXOft7pxw9PARKe6j9q4KaA/Oe
// SIG // rzQ4BMDu+5+xFk++p5fyMq2ytpI2xy81DKYRaVyp1dX2
// SIG // FiSNvhP9Cx71xRhqheDrzAUcW6yVZ9N09g8uXW+rOU8y
// SIG // c0mkLwq12KgOByr7LUFpKpKbwR01/DNPfv78kW1Vzcaz
// SIG // 3Xl8OqA9kOA5LMpAhX5/Ddo9i3YsRPcBuYopb+vXc7Lx
// SIG // yDf4PQPfrYZAEAlW/Q1Ejk2jCBoLDqg2BY4U+s3vZZIR
// SIG // xxr/xBCJMY/ZekuIalEMlnqxZGlFg13J2TCCB3EwggVZ
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
// SIG // czEmMCQGA1UECxMdVGhhbGVzIFRTUyBFU046REQ4Qy1F
// SIG // MzM3LTJGQUUxJTAjBgNVBAMTHE1pY3Jvc29mdCBUaW1l
// SIG // LVN0YW1wIFNlcnZpY2WiIwoBATAHBgUrDgMCGgMVAM3Z
// SIG // aerd8LP25xK25vXNDPvXb1NAoIGDMIGApH4wfDELMAkG
// SIG // A1UEBhMCVVMxEzARBgNVBAgTCldhc2hpbmd0b24xEDAO
// SIG // BgNVBAcTB1JlZG1vbmQxHjAcBgNVBAoTFU1pY3Jvc29m
// SIG // dCBDb3Jwb3JhdGlvbjEmMCQGA1UEAxMdTWljcm9zb2Z0
// SIG // IFRpbWUtU3RhbXAgUENBIDIwMTAwDQYJKoZIhvcNAQEF
// SIG // BQACBQDmOoaKMCIYDzIwMjIwNTI3MDcwNjUwWhgPMjAy
// SIG // MjA1MjgwNzA2NTBaMHcwPQYKKwYBBAGEWQoEATEvMC0w
// SIG // CgIFAOY6hooCAQAwCgIBAAICGWACAf8wBwIBAAICEjsw
// SIG // CgIFAOY72AoCAQAwNgYKKwYBBAGEWQoEAjEoMCYwDAYK
// SIG // KwYBBAGEWQoDAqAKMAgCAQACAwehIKEKMAgCAQACAwGG
// SIG // oDANBgkqhkiG9w0BAQUFAAOBgQBvsbNqMqL1epFaQzkh
// SIG // wDUVT0UfQv3BiQt6l9XRfRIq9lNMHpz5PU2smEz5X5DM
// SIG // dPLcjrYHhiGWVp+GCK7thXOravKuRurJdaxQhR/7r8j7
// SIG // x6YN6SaaWSm6QU3eVeUlLMB9kyXSP086eY1/h+H6X8XV
// SIG // Db2CEU/HNbh5gAIGSd7X6DGCBA0wggQJAgEBMIGTMHwx
// SIG // CzAJBgNVBAYTAlVTMRMwEQYDVQQIEwpXYXNoaW5ndG9u
// SIG // MRAwDgYDVQQHEwdSZWRtb25kMR4wHAYDVQQKExVNaWNy
// SIG // b3NvZnQgQ29ycG9yYXRpb24xJjAkBgNVBAMTHU1pY3Jv
// SIG // c29mdCBUaW1lLVN0YW1wIFBDQSAyMDEwAhMzAAABnA+m
// SIG // TWHSnksoAAEAAAGcMA0GCWCGSAFlAwQCAQUAoIIBSjAa
// SIG // BgkqhkiG9w0BCQMxDQYLKoZIhvcNAQkQAQQwLwYJKoZI
// SIG // hvcNAQkEMSIEID4JrG7b6eEnmlmUOV4K58F/VP0/1M8Z
// SIG // 3owx08bVWxLyMIH6BgsqhkiG9w0BCRACLzGB6jCB5zCB
// SIG // 5DCBvQQgNw9FhSCNLMo6EXf13hCBtFlCCs87suj+oTka
// SIG // 29J6prwwgZgwgYCkfjB8MQswCQYDVQQGEwJVUzETMBEG
// SIG // A1UECBMKV2FzaGluZ3RvbjEQMA4GA1UEBxMHUmVkbW9u
// SIG // ZDEeMBwGA1UEChMVTWljcm9zb2Z0IENvcnBvcmF0aW9u
// SIG // MSYwJAYDVQQDEx1NaWNyb3NvZnQgVGltZS1TdGFtcCBQ
// SIG // Q0EgMjAxMAITMwAAAZwPpk1h0p5LKAABAAABnDAiBCAe
// SIG // J6BNm4R4H4UAdyJvy/HI+O+eOPjh1DkaxHJOasKAYTAN
// SIG // BgkqhkiG9w0BAQsFAASCAgALVcjjgBvPO8Qp6Enzcpmd
// SIG // zPWbU3qaSvEyNpxNhsgkXdZKjet+BRjk5z77jCamj6dp
// SIG // dtUb0raJaMJIDfMTXZEgOrHEgl0NomZTru9JavAdCTwc
// SIG // jUOMIq3oPLWgZPS7Am2zDd/pZRFku0M1+Oza7uweA/Gs
// SIG // tFgxhjTvjA1Ixyw1sBhUv2j9DiDQLHI4eL47cjpd0pd7
// SIG // I6MkD7vOGHcbxJlWtCw4e5Xm1TFbWjI9mp1hV4SLcseO
// SIG // byxjdiXQ+GuznZkZIRoUSC90NjfDr/lfey9zTub64EYQ
// SIG // 0fJYzxvo+EaAgM4Oe2IlfJ9NsTj1XizsoxfSV+dFylBG
// SIG // EqJuOvAHSVBcpmlal9Ch3WZ+a+mmy4xFJGl47zXForTC
// SIG // 5cbW79o0tVwNfgANnpFKAPcQBfFenYjssbnhaoQf572X
// SIG // EAyFTxBp46/js66XSjtASCss6QpsN5T0Iytx7ZJcSPwy
// SIG // /BXzZTNhGwallbM+MqvLhAGw/I1hsEfnwFr1Jpaogavv
// SIG // UnEnvq6rbZMl/CteDRuLJMESSn0OveOFqZ0Y/o0V5P3x
// SIG // zVVR7+Hdtg7vx3sRHe1oKTqsFZWYgI0WMvJ7TyrA61W6
// SIG // +aYFXclbwSw21wuunMUfTdvuekq8ddiw714pORdDDVao
// SIG // hF+dCsIwfGRa4e9rjrVxX9uizOnHvTlBR54kkLBIv/6A9w==
// SIG // End signature block
