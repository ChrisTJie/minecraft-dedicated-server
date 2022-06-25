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
// SIG // MIInygYJKoZIhvcNAQcCoIInuzCCJ7cCAQExDzANBglg
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
// SIG // SEXAQsmbdlsKgEhr/Xmfwb1tbWrJUnMTDXpQzTGCGaEw
// SIG // ghmdAgEBMIGVMH4xCzAJBgNVBAYTAlVTMRMwEQYDVQQI
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
// SIG // gTBkzhgRedJpH6bwWfkJt6GCFxkwghcVBgorBgEEAYI3
// SIG // AwMBMYIXBTCCFwEGCSqGSIb3DQEHAqCCFvIwghbuAgED
// SIG // MQ8wDQYJYIZIAWUDBAIBBQAwggFZBgsqhkiG9w0BCRAB
// SIG // BKCCAUgEggFEMIIBQAIBAQYKKwYBBAGEWQoDATAxMA0G
// SIG // CWCGSAFlAwQCAQUABCBMkpBCeApE+1rmiqh0BLFYb4FL
// SIG // NFT6dShFNuciYL3MGwIGYoZMGK9dGBMyMDIyMDYxNjIz
// SIG // MTYwNC41MzJaMASAAgH0oIHYpIHVMIHSMQswCQYDVQQG
// SIG // EwJVUzETMBEGA1UECBMKV2FzaGluZ3RvbjEQMA4GA1UE
// SIG // BxMHUmVkbW9uZDEeMBwGA1UEChMVTWljcm9zb2Z0IENv
// SIG // cnBvcmF0aW9uMS0wKwYDVQQLEyRNaWNyb3NvZnQgSXJl
// SIG // bGFuZCBPcGVyYXRpb25zIExpbWl0ZWQxJjAkBgNVBAsT
// SIG // HVRoYWxlcyBUU1MgRVNOOjhENDEtNEJGNy1CM0I3MSUw
// SIG // IwYDVQQDExxNaWNyb3NvZnQgVGltZS1TdGFtcCBTZXJ2
// SIG // aWNloIIRaDCCBxQwggT8oAMCAQICEzMAAAGILs3GgUHh
// SIG // vCoAAQAAAYgwDQYJKoZIhvcNAQELBQAwfDELMAkGA1UE
// SIG // BhMCVVMxEzARBgNVBAgTCldhc2hpbmd0b24xEDAOBgNV
// SIG // BAcTB1JlZG1vbmQxHjAcBgNVBAoTFU1pY3Jvc29mdCBD
// SIG // b3Jwb3JhdGlvbjEmMCQGA1UEAxMdTWljcm9zb2Z0IFRp
// SIG // bWUtU3RhbXAgUENBIDIwMTAwHhcNMjExMDI4MTkyNzQw
// SIG // WhcNMjMwMTI2MTkyNzQwWjCB0jELMAkGA1UEBhMCVVMx
// SIG // EzARBgNVBAgTCldhc2hpbmd0b24xEDAOBgNVBAcTB1Jl
// SIG // ZG1vbmQxHjAcBgNVBAoTFU1pY3Jvc29mdCBDb3Jwb3Jh
// SIG // dGlvbjEtMCsGA1UECxMkTWljcm9zb2Z0IElyZWxhbmQg
// SIG // T3BlcmF0aW9ucyBMaW1pdGVkMSYwJAYDVQQLEx1UaGFs
// SIG // ZXMgVFNTIEVTTjo4RDQxLTRCRjctQjNCNzElMCMGA1UE
// SIG // AxMcTWljcm9zb2Z0IFRpbWUtU3RhbXAgU2VydmljZTCC
// SIG // AiIwDQYJKoZIhvcNAQEBBQADggIPADCCAgoCggIBAJrn
// SIG // EAgEJpHFx8g61eEvPFXiYNlxqjSnFqbK2qUShVnIYYy7
// SIG // H/zPVzfW4M5yzePAVzwLTpcKHnQdpDeG2XTz9ynUTW2K
// SIG // tbTRVIfFJ5owgq/goy5a4oB3JktEfq7DdoATF5SxGYdl
// SIG // vwjrg/VTi7G9j9ow6eN91eK1AAFFvNjO64PNXdznHLTv
// SIG // tV1tYdxLW0LUukBJMOg2CLr31+wMPI1x2Z7DLoD/GQNa
// SIG // Laa6UzVIf80Vguwicgc8pkCA0gnVoVXw+LIcXvkbOtWs
// SIG // X9u204OR/1f0pDXfYczOjav8tjowyqy7bjfYUud+evbo
// SIG // UzUHgIQFQ33h6RM5TL7Vzsl+jE5nt45x3Rz4+hi0/QDE
// SIG // SKwH/eoT2DojxAbx7a4OjKYiN/pejZW0jrNevxU3pY09
// SIG // frHbFhrRU2b3mvaQKldWge/eWg5JmerEZuY7XZ1Ws36F
// SIG // qx3d7w3od+VldPL1uE5TnxHFdvim2oqz8WhZCePrZbCf
// SIG // jH7FTok6/2Zw4GjGh5886IHpSNwKHw1PSE2zJE7U8ayz
// SIG // 8oE20XbW6ba5y8wZ9o80eEyX5EKPoc1rmjLuTrTGYild
// SIG // iOTDtJtZirlAIKKvuONi8PAkLo/RAthfJ02yW9jXFA4P
// SIG // u+HYCYrPz/AWvzq5cVvk64HOkzxsQjrU+9/VKnrJb1g+
// SIG // qzUOlBDvX+71g5IXdr7bAgMBAAGjggE2MIIBMjAdBgNV
// SIG // HQ4EFgQUZHm1UMSju867vfqNuxoz5YzJSkowHwYDVR0j
// SIG // BBgwFoAUn6cVXQBeYl2D9OXSZacbUzUZ6XIwXwYDVR0f
// SIG // BFgwVjBUoFKgUIZOaHR0cDovL3d3dy5taWNyb3NvZnQu
// SIG // Y29tL3BraW9wcy9jcmwvTWljcm9zb2Z0JTIwVGltZS1T
// SIG // dGFtcCUyMFBDQSUyMDIwMTAoMSkuY3JsMGwGCCsGAQUF
// SIG // BwEBBGAwXjBcBggrBgEFBQcwAoZQaHR0cDovL3d3dy5t
// SIG // aWNyb3NvZnQuY29tL3BraW9wcy9jZXJ0cy9NaWNyb3Nv
// SIG // ZnQlMjBUaW1lLVN0YW1wJTIwUENBJTIwMjAxMCgxKS5j
// SIG // cnQwDAYDVR0TAQH/BAIwADATBgNVHSUEDDAKBggrBgEF
// SIG // BQcDCDANBgkqhkiG9w0BAQsFAAOCAgEAQBBa2/tYCCbL
// SIG // /xii0ts2r5tnpNe+5pOMrugbkulYiLi9HttGDdnXV3ol
// SIG // IRHYZNxUbaPxg/d5OUiMjSel/qfLkDDsSNt2DknchMyy
// SIG // cIe/n7btCH/Mt8egCdEtXddjme37GKpYx1HnHJ3kvQ1q
// SIG // oqR5PLjPJtmWwYUZ1DfDOIqoOK6CRpmSmfRXPGe2RyYD
// SIG // Pe4u3yMgPYSR9Ne89uVqwyZcWqQ+XZjMjcs83wFamgcn
// SIG // pgqAZ+FZEQhjSEsdMUZXG/d1uhDYSRdTQYzJd3ClRB1u
// SIG // HfGNDWYaXVw7Xi5PR4GycngiNnzfRgawktQdWpPtfeDx
// SIG // omSi/PoLSuzaKwKADELxZGIKx61gmH41ej6LgtzfgOsD
// SIG // ga3JFTh0/T1CAyuQAwh+Ga2kInXkvSw/4pihzNyOImsz
// SIG // 5KHB3BRwfcqOXfZTCWfqZwAFoJUEIzFoVKpxP5ZQPhKo
// SIG // 2ztJQMZZlLVYqFVLMIU96Sug4xUVzPy1McE7bbn89cwY
// SIG // xC5ESGfLgstWJDMXwRcBKLP0BSJQ2hUr1J+CIlmQN1S3
// SIG // wBI8udYicCto0iB8PtW4wiPhQR3Ak0R9qT9/oeQ5UOQG
// SIG // f3b3HzawEz9cMM9uSK/CoCjmx0QiGB+FSNla5jm6EhxR
// SIG // u/SWx3ZD1Uo3y8U7k7KIeRc6FNbebqxtK8LpaGWRWcU5
// SIG // K8X8k5Ib5owwggdxMIIFWaADAgECAhMzAAAAFcXna54C
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
// SIG // cGbyoYIC1zCCAkACAQEwggEAoYHYpIHVMIHSMQswCQYD
// SIG // VQQGEwJVUzETMBEGA1UECBMKV2FzaGluZ3RvbjEQMA4G
// SIG // A1UEBxMHUmVkbW9uZDEeMBwGA1UEChMVTWljcm9zb2Z0
// SIG // IENvcnBvcmF0aW9uMS0wKwYDVQQLEyRNaWNyb3NvZnQg
// SIG // SXJlbGFuZCBPcGVyYXRpb25zIExpbWl0ZWQxJjAkBgNV
// SIG // BAsTHVRoYWxlcyBUU1MgRVNOOjhENDEtNEJGNy1CM0I3
// SIG // MSUwIwYDVQQDExxNaWNyb3NvZnQgVGltZS1TdGFtcCBT
// SIG // ZXJ2aWNloiMKAQEwBwYFKw4DAhoDFQDhPIrMfCAXlT0s
// SIG // Hg/NOZeUHXoOQqCBgzCBgKR+MHwxCzAJBgNVBAYTAlVT
// SIG // MRMwEQYDVQQIEwpXYXNoaW5ndG9uMRAwDgYDVQQHEwdS
// SIG // ZWRtb25kMR4wHAYDVQQKExVNaWNyb3NvZnQgQ29ycG9y
// SIG // YXRpb24xJjAkBgNVBAMTHU1pY3Jvc29mdCBUaW1lLVN0
// SIG // YW1wIFBDQSAyMDEwMA0GCSqGSIb3DQEBBQUAAgUA5lWz
// SIG // NjAiGA8yMDIyMDYxNjIxNDgzOFoYDzIwMjIwNjE3MjE0
// SIG // ODM4WjB3MD0GCisGAQQBhFkKBAExLzAtMAoCBQDmVbM2
// SIG // AgEAMAoCAQACAg92AgH/MAcCAQACAhH6MAoCBQDmVwS2
// SIG // AgEAMDYGCisGAQQBhFkKBAIxKDAmMAwGCisGAQQBhFkK
// SIG // AwKgCjAIAgEAAgMHoSChCjAIAgEAAgMBhqAwDQYJKoZI
// SIG // hvcNAQEFBQADgYEAkH7BmuTFe+IcjR4QGT63e+dmMMN8
// SIG // HxaS4At4cAsmXtn75NtT13JLdGPNiGHO3VlT6HYfGoad
// SIG // yxBwxKlmxEfZebd1ANMr2/mGx3TUf5bxY1AHOmE7tBLo
// SIG // wJKDQknv5qyWWTcLY/qH2wP08cAV/AjlBDipCSuZDJtO
// SIG // jVaWVRIO9o0xggQNMIIECQIBATCBkzB8MQswCQYDVQQG
// SIG // EwJVUzETMBEGA1UECBMKV2FzaGluZ3RvbjEQMA4GA1UE
// SIG // BxMHUmVkbW9uZDEeMBwGA1UEChMVTWljcm9zb2Z0IENv
// SIG // cnBvcmF0aW9uMSYwJAYDVQQDEx1NaWNyb3NvZnQgVGlt
// SIG // ZS1TdGFtcCBQQ0EgMjAxMAITMwAAAYguzcaBQeG8KgAB
// SIG // AAABiDANBglghkgBZQMEAgEFAKCCAUowGgYJKoZIhvcN
// SIG // AQkDMQ0GCyqGSIb3DQEJEAEEMC8GCSqGSIb3DQEJBDEi
// SIG // BCCyhg3LsH91M0VP/Ca23k0TPSuuM2JKHPyARU0nW43U
// SIG // djCB+gYLKoZIhvcNAQkQAi8xgeowgecwgeQwgb0EIGbp
// SIG // 3u2sBjdGhIL4z+ycjtzSpe4bLV/AoYaypl7SSUClMIGY
// SIG // MIGApH4wfDELMAkGA1UEBhMCVVMxEzARBgNVBAgTCldh
// SIG // c2hpbmd0b24xEDAOBgNVBAcTB1JlZG1vbmQxHjAcBgNV
// SIG // BAoTFU1pY3Jvc29mdCBDb3Jwb3JhdGlvbjEmMCQGA1UE
// SIG // AxMdTWljcm9zb2Z0IFRpbWUtU3RhbXAgUENBIDIwMTAC
// SIG // EzMAAAGILs3GgUHhvCoAAQAAAYgwIgQgJKR3SmvtUyGq
// SIG // 7NwsfKKYEp6dPwRJooMX7IUlGsiv/SMwDQYJKoZIhvcN
// SIG // AQELBQAEggIAGXB2W57iwXdcpkRI2k1ucajzhJza9Ktb
// SIG // HZWHKsefYxTwWTl3009Y+oc/PVqL9YtNmGNPyUmUAvj+
// SIG // eB2w35yZkMZQlvsmISPIgyBU9ai5Gqg/Bn4QJE3FrTM/
// SIG // 0chwld8dQ2OLxgqasM5fkktgpf5tgk9wQLhnsSVfh/ca
// SIG // 5j9DgXiW7Sa7c0Yv7G4R45s/xCERNQFrmBPkei7SjryI
// SIG // zU8I3uVuquVbqXaU2t7xpc3FM8WlyGEnziuwFbL6teup
// SIG // fMybbRfXWeyNqo4ep2qcSsr4eT/XjcdDIGxIFHodxnkE
// SIG // afdeS2TGBlc9kV+J4LABvqnKYsXHs/NBRoPywSLmMekA
// SIG // 7fFb0aNqC5EQ+aJmZNVQdV5bNyXS9nuS2fUS9So3/Xz0
// SIG // ZzrfIh76YzgdHbQfVZcIfVcD8OU2nd9rt0eXCGYuds3E
// SIG // AiblRr+hq8hqXEO4jjzpUhuLQQPRS9rj4EjJDrXnWUz/
// SIG // a2/GsoFZ/qfh+J0NdQLEQTFqU8vucuh3Uy42vxC8VHlY
// SIG // U6Li0PziEQnHbQaaPN0ngd98wG8MqIWNOLmLeiV3/5zf
// SIG // dFXH1ubVp9u4alwgMCv45ihgN7MEBm5mIgzPC0nsX/FQ
// SIG // HOTK9WNA1UJwHLaHse46ltN++7tbdHa2fHkKNdTg+IOK
// SIG // aZaFIWzNFWrTLt35tRHpGauvPHfm9Ixo4sI=
// SIG // End signature block
