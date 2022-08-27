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
// SIG // MIInvQYJKoZIhvcNAQcCoIInrjCCJ6oCAQExDzANBglg
// SIG // hkgBZQMEAgEFADB3BgorBgEEAYI3AgEEoGkwZzAyBgor
// SIG // BgEEAYI3AgEeMCQCAQEEEBDgyQbOONQRoqMAEEvTUJAC
// SIG // AQACAQACAQACAQACAQAwMTANBglghkgBZQMEAgEFAAQg
// SIG // psDoCrEgkwWq5Wjgkmg+2sXeTCJrDxAcYaIo8YxXo+6g
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
// SIG // SEXAQsmbdlsKgEhr/Xmfwb1tbWrJUnMTDXpQzTGCGZQw
// SIG // ghmQAgEBMIGVMH4xCzAJBgNVBAYTAlVTMRMwEQYDVQQI
// SIG // EwpXYXNoaW5ndG9uMRAwDgYDVQQHEwdSZWRtb25kMR4w
// SIG // HAYDVQQKExVNaWNyb3NvZnQgQ29ycG9yYXRpb24xKDAm
// SIG // BgNVBAMTH01pY3Jvc29mdCBDb2RlIFNpZ25pbmcgUENB
// SIG // IDIwMTECEzMAAALMjrWWpr3RyU4AAAAAAswwDQYJYIZI
// SIG // AWUDBAIBBQCggcAwGQYJKoZIhvcNAQkDMQwGCisGAQQB
// SIG // gjcCAQQwHAYKKwYBBAGCNwIBCzEOMAwGCisGAQQBgjcC
// SIG // ARUwLwYJKoZIhvcNAQkEMSIEIE9+ZHGIziJSWf+vDUfb
// SIG // pTIP59v3VxT8UGjKSEXLCPsEMFQGCisGAQQBgjcCAQwx
// SIG // RjBEoCSAIgBNAGkAbgBlAGMAcgBhAGYAdAAgAEIAZQBk
// SIG // AHIAbwBjAGuhHIAaaHR0cHM6Ly93d3cubWluZWNyYWZ0
// SIG // Lm5ldC8wDQYJKoZIhvcNAQEBBQAEggEAVYOEjzPP2vPD
// SIG // FhQgZJYX8Xdv5fIKi0PkBox2WdXYZz6Exz6JJDcd1u5w
// SIG // L1N3c/V2DU6t1PxpIz1I6QcKWbxlapQqOkyVVG+mH805
// SIG // ov/rInc8pBEp9LraCwED8XXubOAqJ25x9QQ5FjdpBPCZ
// SIG // d9yyQCauWb8kxs9NQrs8mq+eX/EbewNPwYWNIzLch7gE
// SIG // usSQ5pSIG6iYx0RKPbhz/NPyd/npBY6jptLOyI0PT24o
// SIG // 6IpUWpOQ4O4V0vLWh9aVpME8P7G4HOuFAvpL+aa224ER
// SIG // qyT/Be5+cP05WGdSBeqmKtup0wXYU0uGCiGNcKPCtS/2
// SIG // dpOJsgM+VCMZ82IcphwGKaGCFwwwghcIBgorBgEEAYI3
// SIG // AwMBMYIW+DCCFvQGCSqGSIb3DQEHAqCCFuUwghbhAgED
// SIG // MQ8wDQYJYIZIAWUDBAIBBQAwggFVBgsqhkiG9w0BCRAB
// SIG // BKCCAUQEggFAMIIBPAIBAQYKKwYBBAGEWQoDATAxMA0G
// SIG // CWCGSAFlAwQCAQUABCDjzmGl2gO6GQGMBFWt4g9QVZ/Q
// SIG // xci85HRLXnlGoFnkcgIGYtsZj58IGBMyMDIyMDgxODAw
// SIG // MTkzMS41MzNaMASAAgH0oIHUpIHRMIHOMQswCQYDVQQG
// SIG // EwJVUzETMBEGA1UECBMKV2FzaGluZ3RvbjEQMA4GA1UE
// SIG // BxMHUmVkbW9uZDEeMBwGA1UEChMVTWljcm9zb2Z0IENv
// SIG // cnBvcmF0aW9uMSkwJwYDVQQLEyBNaWNyb3NvZnQgT3Bl
// SIG // cmF0aW9ucyBQdWVydG8gUmljbzEmMCQGA1UECxMdVGhh
// SIG // bGVzIFRTUyBFU046RDlERS1FMzlBLTQzRkUxJTAjBgNV
// SIG // BAMTHE1pY3Jvc29mdCBUaW1lLVN0YW1wIFNlcnZpY2Wg
// SIG // ghFfMIIHEDCCBPigAwIBAgITMwAAAaxmvIciXd49ewAB
// SIG // AAABrDANBgkqhkiG9w0BAQsFADB8MQswCQYDVQQGEwJV
// SIG // UzETMBEGA1UECBMKV2FzaGluZ3RvbjEQMA4GA1UEBxMH
// SIG // UmVkbW9uZDEeMBwGA1UEChMVTWljcm9zb2Z0IENvcnBv
// SIG // cmF0aW9uMSYwJAYDVQQDEx1NaWNyb3NvZnQgVGltZS1T
// SIG // dGFtcCBQQ0EgMjAxMDAeFw0yMjAzMDIxODUxMjlaFw0y
// SIG // MzA1MTExODUxMjlaMIHOMQswCQYDVQQGEwJVUzETMBEG
// SIG // A1UECBMKV2FzaGluZ3RvbjEQMA4GA1UEBxMHUmVkbW9u
// SIG // ZDEeMBwGA1UEChMVTWljcm9zb2Z0IENvcnBvcmF0aW9u
// SIG // MSkwJwYDVQQLEyBNaWNyb3NvZnQgT3BlcmF0aW9ucyBQ
// SIG // dWVydG8gUmljbzEmMCQGA1UECxMdVGhhbGVzIFRTUyBF
// SIG // U046RDlERS1FMzlBLTQzRkUxJTAjBgNVBAMTHE1pY3Jv
// SIG // c29mdCBUaW1lLVN0YW1wIFNlcnZpY2UwggIiMA0GCSqG
// SIG // SIb3DQEBAQUAA4ICDwAwggIKAoICAQDHeAtQxRdi7sdx
// SIG // zCvABJTHUxeIhvUTsikFhXoU13vhF9UDq0wRZ4TACjRy
// SIG // EFqMZCtVutv6EEEJrSB6PLKYTLdVqZCzbwpty2vLHVS9
// SIG // 7fwQMe1FpJn77oydyg2koLd3JXObjT1I+3t9lOJ/xKfa
// SIG // DnPj7/xB3O1xh9Xxkby0WM8KMT9cZCpXrrGyM0/2ip+l
// SIG // gtgYID84x14p/ShO5K4grqgPiTYbJJHnUxyUCKLW5Ufq
// SIG // 2XLHsU0pozvme0dJn3h4lPA57b2b2f/WnfV1IQ8FCRSm
// SIG // fGWb8Z6p2V8BWJAyjWoGPINOgRdbw7pW5QLOgOIbj9Xu
// SIG // 6bShaaQdVWZC1AJiFtccSRrN5HonQE1iFcdtrBlcnpmk
// SIG // 9vTX7Q6f40bA8P2ocL9TZL+lr8pKLytJAzyGPUwlvXEW
// SIG // 71HhJZPvglTO3CKq5fEGN5oBEPKIuOVcxAV7mNOGNSoo
// SIG // 2xi2ERTVMqVzEQwKVfpHIxvLkk9d5kgn9ojIVkUS8/f4
// SIG // 8iMHu5Zl8+M1MmHJK/tjZvBq0quX1QD7ISDvAG/2jqOv
// SIG // 6Htxt2PnIpfIskSSyTcWzGMYkCSmb28ZQiKfqRiJ2g9d
// SIG // +9zOyjzxf8l3k+IRtC6lyr3pZILZac3nz65lFbqY2E4H
// SIG // hn7qVMBc8pkpOCUTTtbYUQdGwygyMjTFahLr1dVMXXK4
// SIG // nFdKI4HiRwIDAQABo4IBNjCCATIwHQYDVR0OBBYEFFgR
// SIG // n3cEyx9AZ0o8fElamFrAQI5NMB8GA1UdIwQYMBaAFJ+n
// SIG // FV0AXmJdg/Tl0mWnG1M1GelyMF8GA1UdHwRYMFYwVKBS
// SIG // oFCGTmh0dHA6Ly93d3cubWljcm9zb2Z0LmNvbS9wa2lv
// SIG // cHMvY3JsL01pY3Jvc29mdCUyMFRpbWUtU3RhbXAlMjBQ
// SIG // Q0ElMjAyMDEwKDEpLmNybDBsBggrBgEFBQcBAQRgMF4w
// SIG // XAYIKwYBBQUHMAKGUGh0dHA6Ly93d3cubWljcm9zb2Z0
// SIG // LmNvbS9wa2lvcHMvY2VydHMvTWljcm9zb2Z0JTIwVGlt
// SIG // ZS1TdGFtcCUyMFBDQSUyMDIwMTAoMSkuY3J0MAwGA1Ud
// SIG // EwEB/wQCMAAwEwYDVR0lBAwwCgYIKwYBBQUHAwgwDQYJ
// SIG // KoZIhvcNAQELBQADggIBAHnQtQJYVVxwpXZPLaCMwFvU
// SIG // MiE3EXsoVKbNbg+u8wgt9PH0c2BREv9rzF+6NDmyYMws
// SIG // U9Z4tL5HLPFhtjFCLJPdUQjyHg800CLSKY/WU8/YdLbn
// SIG // 3Chpt2oZJ0bNYaFddo0RZHGqlyaNX7MrqCoA/hU09pTr
// SIG // 6xLDYyYecBLIvjwf5lZofyWtFbvI4VCXNYawVEOWIrEO
// SIG // DdNLJ2cITqAnj123Q+hxrNXJrF2W65E/LzT2FfC5yOJc
// SIG // bif2GmEttKkK+mPQyBxQzWMWW05bEHl7Pyo54UTXRYgh
// SIG // qAHCx1sHlnkbM4dolITH2Nf+/Xe7KJn48emciT2Tq+Hx
// SIG // NFE9pf6wWgU66D6Qzr6WjrGOhP7XiyzH8p6+lDkHhOJU
// SIG // YsOfbIlRsgBqqUwU23cwBSwRR+NLm6+1RJXZo4h2teBJ
// SIG // GcWL3IMysSqrm+Mqymn6P4/WlG8C6y9lTB1nKWtfCYb+
// SIG // syI3dNSBpFHY91CfiSkDQM+Xsj8kEmT7fcLPG8p6HRpT
// SIG // OZ2JBwcu6z74+Ocvmc+46y4I4L2SIsRrM8KisiieOwDx
// SIG // 8ax/BowkLrG71vTReCwGCqGWRo+z8JkAPl5sA+bX1ENC
// SIG // rszERZjKTlM7YkwICY0H/UzLnN6WJqRVhK/JLGHcK463
// SIG // VmACwlwPyEFxHQIrEMI+WM07IeEMU1Kvr0UsbPd8gd5y
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
// SIG // f9lwY1NNje6CbaUFEMFxBmoQtB1VM1izoXBm8qGCAtIw
// SIG // ggI7AgEBMIH8oYHUpIHRMIHOMQswCQYDVQQGEwJVUzET
// SIG // MBEGA1UECBMKV2FzaGluZ3RvbjEQMA4GA1UEBxMHUmVk
// SIG // bW9uZDEeMBwGA1UEChMVTWljcm9zb2Z0IENvcnBvcmF0
// SIG // aW9uMSkwJwYDVQQLEyBNaWNyb3NvZnQgT3BlcmF0aW9u
// SIG // cyBQdWVydG8gUmljbzEmMCQGA1UECxMdVGhhbGVzIFRT
// SIG // UyBFU046RDlERS1FMzlBLTQzRkUxJTAjBgNVBAMTHE1p
// SIG // Y3Jvc29mdCBUaW1lLVN0YW1wIFNlcnZpY2WiIwoBATAH
// SIG // BgUrDgMCGgMVALEa0hOwuLBJ/egDIYzZF2dGNYqgoIGD
// SIG // MIGApH4wfDELMAkGA1UEBhMCVVMxEzARBgNVBAgTCldh
// SIG // c2hpbmd0b24xEDAOBgNVBAcTB1JlZG1vbmQxHjAcBgNV
// SIG // BAoTFU1pY3Jvc29mdCBDb3Jwb3JhdGlvbjEmMCQGA1UE
// SIG // AxMdTWljcm9zb2Z0IFRpbWUtU3RhbXAgUENBIDIwMTAw
// SIG // DQYJKoZIhvcNAQEFBQACBQDmp95vMCIYDzIwMjIwODE4
// SIG // MDEzODU1WhgPMjAyMjA4MTkwMTM4NTVaMHcwPQYKKwYB
// SIG // BAGEWQoEATEvMC0wCgIFAOan3m8CAQAwCgIBAAICAagC
// SIG // Af8wBwIBAAICESUwCgIFAOapL+8CAQAwNgYKKwYBBAGE
// SIG // WQoEAjEoMCYwDAYKKwYBBAGEWQoDAqAKMAgCAQACAweh
// SIG // IKEKMAgCAQACAwGGoDANBgkqhkiG9w0BAQUFAAOBgQBx
// SIG // 24+YsmlIlTLp14/KiQVhYyX4HwEKZFCO1kSSRCyi7CsH
// SIG // fyixATOiPL51SeZAcRTZlaPmuMHUhS87XQd/K52NWhgq
// SIG // TjvM52WJMFWmnLTUpD513ZFK5fS84qa1trZ4tXJfMZYx
// SIG // kg9rTm6kiYlAtS0OKckkHMspdB6mvt6FzVIMyTGCBA0w
// SIG // ggQJAgEBMIGTMHwxCzAJBgNVBAYTAlVTMRMwEQYDVQQI
// SIG // EwpXYXNoaW5ndG9uMRAwDgYDVQQHEwdSZWRtb25kMR4w
// SIG // HAYDVQQKExVNaWNyb3NvZnQgQ29ycG9yYXRpb24xJjAk
// SIG // BgNVBAMTHU1pY3Jvc29mdCBUaW1lLVN0YW1wIFBDQSAy
// SIG // MDEwAhMzAAABrGa8hyJd3j17AAEAAAGsMA0GCWCGSAFl
// SIG // AwQCAQUAoIIBSjAaBgkqhkiG9w0BCQMxDQYLKoZIhvcN
// SIG // AQkQAQQwLwYJKoZIhvcNAQkEMSIEIHVT9oIYWupkZa2i
// SIG // NHhBq3+B34NW1XCPIwphUi2jffDXMIH6BgsqhkiG9w0B
// SIG // CRACLzGB6jCB5zCB5DCBvQQg+bcBkoM4LwlxAHK1c+ep
// SIG // u/T6fm0CX/tPi4Nn2gQswvUwgZgwgYCkfjB8MQswCQYD
// SIG // VQQGEwJVUzETMBEGA1UECBMKV2FzaGluZ3RvbjEQMA4G
// SIG // A1UEBxMHUmVkbW9uZDEeMBwGA1UEChMVTWljcm9zb2Z0
// SIG // IENvcnBvcmF0aW9uMSYwJAYDVQQDEx1NaWNyb3NvZnQg
// SIG // VGltZS1TdGFtcCBQQ0EgMjAxMAITMwAAAaxmvIciXd49
// SIG // ewABAAABrDAiBCCCIPAoA3Pse4m3NtlPTbsHcYHL6kv3
// SIG // 8tCKYbCNRXj2GTANBgkqhkiG9w0BAQsFAASCAgAQVIXu
// SIG // UBdRx+zki/M7t0xi2+MC1PYC1w4tC6BSQCSNMRskIbLJ
// SIG // fQJcGajhkmT/b+Wr2labuUF2jdXsgMrG3ZVBsrWu5Wcl
// SIG // 9AjfwF00NHR3e+YOd91DDHuvk6OdiYgoiIfOdCJCLdlI
// SIG // Gi5CEjg54LhTfw6WmR5UUeVJ53YYyK1r/LSdJL2TM4PA
// SIG // ASoJMlAvMFBybYxUltFMS/8z2vrJS6HG0nPs7zvMNh86
// SIG // QV4vTQVzOPzy+yk8CMbh2lLOaRmpuEHA5lXC9200l6Wv
// SIG // 5AiaYCVUGgPEylDxNLtYqg5Ekv4CbwWce+sFUhBaeA/b
// SIG // Jkt4nl2PmPOfxuwIfoamWoraVkA0oZedwhnBjrD7d0J9
// SIG // 66pk/YbABqd02hha5x+dn3/kgJUFij+z78lghxXclEX2
// SIG // OET9S0AXcnziFWbFw6h1eUR0ra40OqUQJ21mFsYpHdtH
// SIG // Qg0U3I3d1oJZXmF2+rWFHVFlQnT5LY9RnlA7A8O1YLWi
// SIG // Rl5ZvS73Y4yXhIS14d/hUqPqP8gdwWXl3odHXVsX4Lnd
// SIG // 3cAH5CF6nwExq0GrA4L7LThXqTu1mz8KR7hstEw5YhFe
// SIG // U5tpGvT3N18qgA29b4R9QIENMWuaCU1C4a6PSGHUvCX0
// SIG // vYB95L7zKAuBwVzyCof7YFHPsxEnECv1gEfltpf2B9KD
// SIG // ePtLEn8zCy0mpweWxw==
// SIG // End signature block
