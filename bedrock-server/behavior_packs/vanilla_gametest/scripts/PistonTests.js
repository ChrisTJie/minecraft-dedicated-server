import * as GameTest from "mojang-gametest";
import { BlockLocation, Location, MinecraftBlockTypes, ItemStack } from "mojang-minecraft";
import GameTestExtensions from "./GameTestExtensions.js";

GameTest.register("PistonTests", "honey_block_entity_drag_sideways", (test) => {
  const startPos = new BlockLocation(3, 4, 1);
  const endPos = new BlockLocation(2, 4, 1);
  const pullLeverPos = new BlockLocation(0, 3, 0);
  const chickenEntityType = "minecraft:chicken";

  test.assertEntityPresent(chickenEntityType, endPos, false);
  test.spawn(chickenEntityType, startPos);
  test
    .startSequence()
    .thenExecuteAfter(1, () => {
      test.pullLever(pullLeverPos);
    })
    .thenWait(() => {
      test.assertEntityPresent(chickenEntityType, endPos, true);
    })
    .thenSucceed();
}).tag(GameTest.Tags.suiteDefault);

GameTest.register("PistonTests", "quasiconnectivity", (test) => {
  const topStartPos = new BlockLocation(3, 3, 0);
  const bottomStartPos = new BlockLocation(3, 2, 0);
  const topEndPos = new BlockLocation(2, 3, 0);
  const bottomEndPos = new BlockLocation(2, 2, 0);
  const pullLeverPos = new BlockLocation(0, 4, 0);

  test.pullLever(pullLeverPos);
  test
    .startSequence()
    .thenWaitAfter(3, () => {
      test.assertBlockPresent(MinecraftBlockTypes.stone, topStartPos, true);
      test.assertBlockPresent(MinecraftBlockTypes.stone, bottomStartPos, true);
    })
    .thenExecute(() => {
      test.pullLever(pullLever);
    })
    .thenWaitAfter(3, () => {
      test.assertBlockPresent(MinecraftBlockTypes.stone, topEndPos, true);
      test.assertBlockPresent(MinecraftBlockTypes.stone, bottomEndPos, true);
    })
    .thenSucceed();
})
  .tag("suite:java_parity")
  .tag(GameTest.Tags.suiteDisabled); //There are version differences. Java version has a switch, which can control one piston at the same time, while bedrock version can only control one piston. All the structures have been modified, and the pull rod and its coordinates have been changed to (0, 3, 0) ,next to "quasiconnectivity_bedrock"

GameTest.register("PistonTests", "quasiconnectivity_bedrock", (test) => {
  const topStartPos = new BlockLocation(3, 3, 0);
  const bottomStartPos = new BlockLocation(3, 2, 0);
  const topEndPos = new BlockLocation(2, 3, 0);
  const bottomEndPos = new BlockLocation(2, 2, 0);
  const pullLeverPos = new BlockLocation(0, 3, 0);

  test.pullLever(pullLeverPos); //There are version differences. Java version has a switch, which can control one piston at the same time, while bedrock version can only control one piston. All the structures have been modified, and the pull rod and its coordinates have been changed to (0, 3, 0)

  test
    .startSequence()
    .thenIdle(6) //it's not possible to time it exactly due to redstone differences then you can just pull the lever, wait 6 ticks, assert, pull, wait 6, assert.
    .thenExecute(() => {
      test.assertBlockPresent(MinecraftBlockTypes.stone, topStartPos, true);
      test.assertBlockPresent(MinecraftBlockTypes.stone, bottomStartPos, true);
    })
    .thenExecute(() => {
      test.pullLever(pullLeverPos);
    })
    .thenIdle(6)
    .thenExecute(() => {
      test.assertBlockPresent(MinecraftBlockTypes.stone, topEndPos, true);
      test.assertBlockPresent(MinecraftBlockTypes.stone, bottomEndPos, true);
    })
    .thenSucceed();
}).tag(GameTest.Tags.suiteDefault);

GameTest.register("PistonTests", "redstone_simple_vertical_bud", (test) => {
  const blockPos = new BlockLocation(0, 5, 0);
  const setblockPos = new BlockLocation(0, 1, 0);
  test.setBlockType(MinecraftBlockTypes.stone, setblockPos);

  test
    .startSequence()
    .thenIdle(3)
    .thenWait(() => {
      test.assertBlockPresent(MinecraftBlockTypes.redstoneBlock, blockPos, true);
    })
    .thenIdle(1)
    .thenWait(() => {
      test.assertBlockPresent(MinecraftBlockTypes.air, blockPos, true);
    })
    .thenSucceed();
})
  .tag("suite:java_parity")
  .tag(GameTest.Tags.suiteDisabled); //The lack of quasi-connectivity in bedrock is parity difference that causes this test not to succeed.

GameTest.register("PistonTests", "redstone_simple_horizontal_bud", (test) => {
  const extendedPos = new BlockLocation(3, 2, 0);
  const retractedPos = new BlockLocation(2, 2, 0);
  test.setBlockType(MinecraftBlockTypes.stone, new BlockLocation(0, 1, 0));

  test
    .startSequence()
    .thenWaitAfter(3, () => {
      test.assertBlockPresent(MinecraftBlockTypes.redstoneBlock, extendedPos, true);
      test.assertBlockPresent(MinecraftBlockTypes.air, retractedPos, true);
    })
    .thenWaitAfter(3, () => {
      test.assertBlockPresent(MinecraftBlockTypes.air, extendedPos, true);
      test.assertBlockPresent(MinecraftBlockTypes.redstoneBlock, retractedPos, true);
    })
    .thenSucceed();
})
  .tag("suite:java_parity")
  .tag(GameTest.Tags.suiteDisabled); // The lack of quasi-connectivity in bedrock is parity difference that causes this test not to succeed.

GameTest.register("PistonTests", "redstone_bud", (test) => {
  const blockPos = new BlockLocation(0, 3, 5);
  const pullLeverPos = new BlockLocation(0, 4, 0);
  test.pullLever(pullLeverPos);
  test
    .startSequence()
    .thenWaitAfter(3, () => {
      test.assertBlockPresent(MinecraftBlockTypes.redstoneBlock, blockPos, true);
    })
    .thenWaitAfter(5, () => {
      test.assertBlockPresent(MinecraftBlockTypes.air, blockPos, true);
    })
    .thenWait(() => {
      test.pullLever(pullLeverPos);
    })
    .thenWaitAfter(3, () => {
      test.assertBlockPresent(MinecraftBlockTypes.redstoneBlock, blockPos, true);
    })
    .thenWaitAfter(5, () => {
      test.assertBlockPresent(MinecraftBlockTypes.air, blockPos, true);
    })
    .thenSucceed();
})
  .setupTicks(10)
  .tag("suite:java_parity")
  .tag(GameTest.Tags.suiteDisabled); // The lack of quasi-connectivity in bedrock is parity difference that causes this test not to succeed.

GameTest.register("PistonTests", "slime_block_pull", (test) => {
  const targetPos = new BlockLocation(3, 3, 0);
  const pullLeverPos = new BlockLocation(0, 4, 0);

  test.assertBlockPresent(MinecraftBlockTypes.planks, targetPos, false);
  test.pullLever(pullLeverPos);
  test.succeedWhenBlockPresent(MinecraftBlockTypes.planks, targetPos, true);
}).tag(GameTest.Tags.suiteDefault);

GameTest.register("PistonTests", "normal_extend", (test) => {
  const targetPos = new BlockLocation(3, 2, 0);
  const pullLeverPos = new BlockLocation(0, 3, 0);

  test.assertBlockPresent(MinecraftBlockTypes.stone, targetPos, false);
  test.pullLever(pullLeverPos);
  test.succeedWhen(() => {
    test.assertBlockPresent(MinecraftBlockTypes.stone, targetPos, true);
  });
}).tag(GameTest.Tags.suiteDefault);

GameTest.register("PistonTests", "normal_extend_retract", (test) => {
  const extendedPos = new BlockLocation(3, 2, 0);
  const retractedPos = new BlockLocation(2, 2, 0);
  const pullLeverPos = new BlockLocation(0, 3, 0);

  test.assertBlockPresent(MinecraftBlockTypes.stone, extendedPos, false);
  test.pullLever(pullLeverPos);

  test
    .startSequence()
    .thenWaitAfter(3, () => {
      test.assertBlockPresent(MinecraftBlockTypes.stone, extendedPos, true);
      test.assertBlockPresent(MinecraftBlockTypes.pistonArmCollision, retractedPos, true);
    })
    .thenExecute(() => {
      test.pullLever(pullLeverPos);
    })
    .thenWaitAfter(1, () => {
      test.assertBlockPresent(MinecraftBlockTypes.air, retractedPos, true);
      test.assertBlockPresent(MinecraftBlockTypes.stone, extendedPos, true);
    })
    .thenSucceed();
})
  .structureName("PistonTests:normal_extend")
  .tag("suite:java_parity")
  .tag(GameTest.Tags.suiteDisabled); //Pistons react at different speeds in Bedrock, create a new test called normal_extend_retract_bedrock.

GameTest.register("PistonTests", "normal_extend_retract_bedrock", (test) => {
  const extendedPos = new BlockLocation(3, 2, 0);
  const retractedPos = new BlockLocation(2, 2, 0);
  const pullLeverPos = new BlockLocation(0, 3, 0);

  test.assertBlockPresent(MinecraftBlockTypes.stone, extendedPos, false);
  test.pullLever(pullLeverPos);

  //it's not possible to time it exactly due to redstone differences, so just validate assert can pass before given delay.
  test
    .startSequence()
    .thenIdle(6)
    .thenExecute(() => {
      test.assertBlockPresent(MinecraftBlockTypes.stone, extendedPos, true);
      test.assertBlockPresent(MinecraftBlockTypes.pistonArmCollision, retractedPos, true);
    })
    .thenExecute(() => {
      test.pullLever(pullLeverPos);
    })
    .thenIdle(4)
    .thenExecute(() => {
      test.assertBlockPresent(MinecraftBlockTypes.air, retractedPos, true);
      test.assertBlockPresent(MinecraftBlockTypes.stone, extendedPos, true);
    })
    .thenSucceed();
})
  .structureName("PistonTests:normal_extend")
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("PistonTests", "sticky_extend", (test) => {
  const targetPos = new BlockLocation(3, 2, 0);
  const pullLeverPos = new BlockLocation(0, 3, 0);

  test.assertBlockPresent(MinecraftBlockTypes.stone, targetPos, false);
  test.pullLever(pullLeverPos);
  test.succeedWhen(() => {
    test.assertBlockPresent(MinecraftBlockTypes.stone, targetPos, true);
  });
}).tag(GameTest.Tags.suiteDefault);

GameTest.register("PistonTests", "sticky_extend_retract", (test) => {
  const extendedPos = new BlockLocation(3, 2, 0);
  const retractedPos = new BlockLocation(2, 2, 0);
  const pullLeverPos = new BlockLocation(0, 3, 0);

  test.assertBlockPresent(MinecraftBlockTypes.stone, extendedPos, false);
  test.pullLever(pullLeverPos);

  test
    .startSequence()
    .thenWaitAfter(3, () => {
      test.assertBlockPresent(MinecraftBlockTypes.stone, extendedPos, true);
      test.assertBlockPresent(MinecraftBlockTypes.stickyPistonArmCollision, retractedPos, true);
    })
    .thenExecute(() => {
      test.pullLever(pullLeverPos);
    })
    .thenWaitAfter(3, () => {
      test.assertBlockPresent(MinecraftBlockTypes.stone, retractedPos, true);
      test.assertBlockPresent(MinecraftBlockTypes.air, extendedPos, true);
    })
    .thenSucceed();
})
  .structureName("PistonTests:sticky_extend")
  .tag("suite:java_parity")
  .tag(GameTest.Tags.suiteDisabled); //Pistons react at different speeds in Bedrock, create a new test called sticky_extend_retract_bedrock.

GameTest.register("PistonTests", "sticky_extend_retract_bedrock", (test) => {
  const extendedPos = new BlockLocation(3, 2, 0);
  const retractedPos = new BlockLocation(2, 2, 0);
  const pullLeverPos = new BlockLocation(0, 3, 0);

  test.assertBlockPresent(MinecraftBlockTypes.stone, extendedPos, false);
  test.pullLever(pullLeverPos);

  //it's not possible to time it exactly due to redstone differences, so just validate assert can pass before given delay.
  test
    .startSequence()
    .thenIdle(6)
    .thenExecute(() => {
      test.assertBlockPresent(MinecraftBlockTypes.stone, extendedPos, true);
      test.assertBlockPresent(MinecraftBlockTypes.stickyPistonArmCollision, retractedPos, true);
    })
    .thenExecute(() => {
      test.pullLever(pullLeverPos);
    })
    .thenIdle(6)
    .thenExecute(() => {
      test.assertBlockPresent(MinecraftBlockTypes.stone, retractedPos, true);
      test.assertBlockPresent(MinecraftBlockTypes.air, extendedPos, true);
    })
    .thenSucceed();
})
  .structureName("PistonTests:sticky_extend")
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("PistonTests", "push_limit", (test) => {
  const underLimitTip = new BlockLocation(0, 2, 6);
  const overLimitTip = new BlockLocation(2, 2, 6);
  const pullLeverPos = new BlockLocation(1, 2, 0);
  const underLimitExtendedTip = new BlockLocation(0, 2, 7);

  test.assertBlockPresent(MinecraftBlockTypes.goldBlock, underLimitTip, true);
  test.assertBlockPresent(MinecraftBlockTypes.emeraldBlock, overLimitTip, true);
  test.pullLever(pullLeverPos);

  test.succeedWhen(() => {
    test.assertBlockPresent(MinecraftBlockTypes.goldBlock, underLimitExtendedTip, true);
    test.assertBlockPresent(MinecraftBlockTypes.emeraldBlock, overLimitTip, true);
  });
}).tag(GameTest.Tags.suiteDefault);

GameTest.register("PistonTests", "block_leave", (test) => {
  const trigger = new BlockLocation(3, 1, 1);
  const retracted = new BlockLocation(1, 1, 1);
  const extended = new BlockLocation(0, 1, 1);

  test.pulseRedstone(trigger, 2);
  test
    .startSequence()
    .thenWaitAfter(3, () => {
      test.assertBlockPresent(MinecraftBlockTypes.concrete, extended, true);
      test.assertBlockPresent(MinecraftBlockTypes.air, retracted, true);
    })
    .thenExecuteAfter(3, () => {
      test.pulseRedstone(trigger, 2);
    })
    .thenWaitAfter(5, () => {
      test.assertBlockPresent(MinecraftBlockTypes.concrete, retracted, true);
      test.assertBlockPresent(MinecraftBlockTypes.air, extended, true);
    })
    .thenSucceed();
})
  .tag("suite:java_parity")
  .tag(GameTest.Tags.suiteDisabled); //In Java Edition, pistons finish extending early and start retracting if given a pulse shorter than 3 game ticks (1.5 redstone ticks; 0.15 seconds). These shorter pulses cause sticky pistons to "drop" their block, leaving it behind when trying to push it with a short pulse. Also, this causes the block to end up in its final position earlier.Therefore, the bedrock version can't be modified, and can only be verified according to the piston tension,

GameTest.register("PistonTests", "block_leave_bedrock", (test) => {
  const trigger = new BlockLocation(3, 1, 1);
  const retracted = new BlockLocation(1, 1, 1);
  const extended = new BlockLocation(0, 1, 1);

  test.pulseRedstone(trigger, 2);
  test
    .startSequence()
    .thenIdle(1)
    .thenWait(() => {
      test.assertBlockPresent(MinecraftBlockTypes.concrete, extended, true);
      test.assertBlockPresent(MinecraftBlockTypes.air, retracted, true);
    })
    .thenExecuteAfter(3, () => {
      test.pulseRedstone(trigger, 2);
    })
    .thenIdle(5)
    .thenWait(() => {
      test.assertBlockPresent(MinecraftBlockTypes.concrete, retracted, true);
      test.assertBlockPresent(MinecraftBlockTypes.air, extended, true);
    })
    .thenSucceed();
}).tag(GameTest.Tags.suiteDefault);

GameTest.register("PistonTests", "update_order", (test) => {
  const posA = new BlockLocation(2, 1, 1);
  const posB = new BlockLocation(2, 1, 0);
  const posC = new BlockLocation(3, 1, 0);
  const posD = new BlockLocation(1, 1, 0);

  const trigger = new BlockLocation(6, 2, 2);
  test.setBlockType(trigger, MinecraftBlockTypes.greenWool);

  test
    .startSequence()
    .thenWaitAfter(4, () => {
      test.assertBlockPresent(MinecraftBlockTypes.yellowWool, posB, true);
    })
    .thenExecuteAfter(4, () => {
      test.setBlockType(trigger, MinecraftBlockTypes.blueWool);
    })
    .thenWaitAfter(6, () => {
      test.assertBlockPresent(MinecraftBlockTypes.yellowWool, posC, true);
    })
    .thenExecuteAfter(4, () => {
      test.setBlockType(trigger, MinecraftBlockTypes.purpleWool);
    })
    .thenWaitAfter(6, () => {
      test.assertBlockPresent(MinecraftBlockTypes.yellowWool, posD, true);
    })
    .thenExecuteAfter(4, () => {
      test.setBlockType(trigger, MinecraftBlockTypes.cyanWool);
    })
    .thenWaitAfter(6, () => {
      test.assertBlockPresent(MinecraftBlockTypes.yellowWool, posA, true);
    })
    .thenSucceed();
})
  .required(false)
  .tag("suite:java_parity")
  .tag(GameTest.Tags.suiteDisabled); //Due to redstone differences, create a new test called update_order_bedrock. Also, use colored glazed terracotta instead of missing colored wool blocks.

GameTest.register("PistonTests", "update_order_bedrock", (test) => {
  const posA = new BlockLocation(2, 1, 1);
  const posB = new BlockLocation(2, 1, 0);
  const posC = new BlockLocation(3, 1, 0);
  const posD = new BlockLocation(1, 1, 0);

  const trigger = new BlockLocation(6, 2, 2);
  test.setBlockType(MinecraftBlockTypes.greenGlazedTerracotta, trigger);
  test
    .startSequence()
    .thenIdle(5)
    .thenWait(() => {
      test.assertBlockPresent(MinecraftBlockTypes.wool, posB, true);
    })
    .thenIdle(4)
    .thenWait(() => {
      test.setBlockType(MinecraftBlockTypes.blueGlazedTerracotta, trigger);
    })
    .thenIdle(6)
    .thenWait(() => {
      test.assertBlockPresent(MinecraftBlockTypes.wool, posC, true);
    })
    .thenIdle(4)
    .thenWait(() => {
      test.setBlockType(MinecraftBlockTypes.purpleGlazedTerracotta, trigger);
    })
    .thenIdle(6)
    .thenWait(() => {
      test.assertBlockPresent(MinecraftBlockTypes.wool, posD, true);
    })
    .thenIdle(4)
    .thenWait(() => {
      test.setBlockType(MinecraftBlockTypes.cyanGlazedTerracotta, trigger);
    })
    .thenIdle(6)
    .thenWait(() => {
      test.assertBlockPresent(MinecraftBlockTypes.wool, posA, true);
    })
    .thenSucceed();
})

  .required(false)
  .tag(GameTest.Tags.suiteDisabled); //Both of Java and Bedrock are failed as block position doesn't update with the right order.

GameTest.register("PistonTests", "double_extender", (test) => {
  const pullLeverPos = new BlockLocation(2, 3, 2);
  const blockPresentPosA = new BlockLocation(0, 2, 2);
  const blockPresentPosB = new BlockLocation(0, 2, 4);

  test.pullLever(pullLeverPos);
  test.assertBlockPresent(MinecraftBlockTypes.emeraldBlock, blockPresentPosA, true);

  test
    .startSequence()
    .thenWaitAfter(11, () => {
      test.assertBlockPresent(MinecraftBlockTypes.emeraldBlock, blockPresentPosB, true);
      test.pullLever(pullLeverPos);
    })
    .thenWaitAfter(12, () => {
      test.assertBlockPresent(MinecraftBlockTypes.emeraldBlock, blockPresentPosA, true);
    })
    .thenSucceed();
})
  .tag("suite:java_parity")
  .tag(GameTest.Tags.suiteDisabled); //Pistons react at different speeds in Bedrock, create a new test called double_extender_bedrock.

GameTest.register("PistonTests", "double_extender_bedrock", (test) => {
  const pullLeverPos = new BlockLocation(2, 3, 2);
  const blockPresentPosA = new BlockLocation(0, 2, 2);
  const blockPresentPosB = new BlockLocation(0, 2, 4);

  test.pullLever(pullLeverPos);
  test.assertBlockPresent(MinecraftBlockTypes.emeraldBlock, blockPresentPosA, true);

  //it's not possible to time it exactly due to redstone differences, so just validate assert can pass before given delay.
  test
    .startSequence()
    .thenWait(() => {
      test.assertBlockPresent(MinecraftBlockTypes.emeraldBlock, blockPresentPosB, true);
      test.pullLever(pullLeverPos);
    })
    .thenWait(() => {
      test.assertBlockPresent(MinecraftBlockTypes.emeraldBlock, blockPresentPosA, true);
    })
    .thenSucceed();
})
  .structureName("PistonTests:double_extender")
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("PistonTests", "triple_extender", (test) => {
  const retracted = new BlockLocation(0, 4, 4);
  const extended = new BlockLocation(0, 1, 4);
  const trigger = new BlockLocation(0, 8, 0);
  const assertBlockPresentA = new BlockLocation(0, 7, 4);
  const assertBlockPresentB = new BlockLocation(0, 6, 4);
  const assertBlockPresentC = new BlockLocation(0, 5, 4);

  test.pressButton(trigger);

  test
    .startSequence()
    .thenIdle(30)
    .thenWait(() => {
      test.assertBlockPresent(MinecraftBlockTypes.stickyPiston, assertBlockPresentA, true);
      test.assertBlockPresent(MinecraftBlockTypes.stickyPiston, assertBlockPresentB, true);
      test.assertBlockPresent(MinecraftBlockTypes.stickyPiston, assertBlockPresentC, true);
      test.assertBlockPresent(MinecraftBlockTypes.concrete, extended, true);
    })
    .thenIdle(20)
    .thenWait(() => {
      test.pressButton(trigger);
    })
    .thenIdle(42)
    .thenWait(() => {
      test.assertBlockPresent(MinecraftBlockTypes.stickyPiston, new assertBlockPresentA(), true);
      test.assertBlockPresent(MinecraftBlockTypes.stickyPiston, new assertBlockPresentB(), true);
      test.assertBlockPresent(MinecraftBlockTypes.stickyPiston, new assertBlockPresentC(), true);
      test.assertBlockPresent(MinecraftBlockTypes.concrete, retracted, true);
    })
    .thenSucceed();
})
  .tag("suite:java_parity")
  .tag(GameTest.Tags.suiteDisabled); // Game parity issue. Create a new test called triple_extender_bedrock using new structure, and updated piston react time.

GameTest.register("PistonTests", "triple_extender_bedrock", (test) => {
  const retracted = new BlockLocation(0, 4, 4);
  const extended = new BlockLocation(0, 1, 4);
  const trigger = new BlockLocation(0, 7, 0);
  const assertBlockPresentA = new BlockLocation(0, 7, 4);
  const assertBlockPresentB = new BlockLocation(0, 6, 4);
  const assertBlockPresentC = new BlockLocation(0, 5, 4);
  const assertBlockPresentD = new BlockLocation(0, 3, 4);
  test.pressButton(trigger);
  test
    .startSequence()
    .thenWait(() => {
      test.assertBlockPresent(MinecraftBlockTypes.stickyPiston, assertBlockPresentA, true);
      test.assertBlockPresent(MinecraftBlockTypes.stickyPiston, assertBlockPresentC, true);
      test.assertBlockPresent(MinecraftBlockTypes.stickyPiston, assertBlockPresentD, true);
      test.assertBlockPresent(MinecraftBlockTypes.concrete, extended, true);
    })
    .thenWait(() => {
      test.assertBlockPresent(MinecraftBlockTypes.stickyPiston, assertBlockPresentA, true);
      test.assertBlockPresent(MinecraftBlockTypes.stickyPiston, assertBlockPresentB, true);
      test.assertBlockPresent(MinecraftBlockTypes.stickyPiston, assertBlockPresentC, true);
      test.assertBlockPresent(MinecraftBlockTypes.concrete, retracted, true);
    })
    .thenSucceed();
})
  .setupTicks(20)
  .tag(GameTest.Tags.suiteDefault)
  .maxTicks(100);

GameTest.register("PistonTests", "monostable", (test) => {
  const testEx = new GameTestExtensions(test);
  const lampPos = new BlockLocation(0, 3, 5);
  const pullLeverPos = new BlockLocation(0, 2, 0);

  testEx.assertBlockProperty("redstone_signal", 0, lampPos);
  test.pullLever(pullLeverPos);

  test
    .startSequence()
    .thenWaitAfter(2, () => {
      testEx.assertBlockProperty("redstone_signal", 1, lampPos);
    })
    .thenWaitAfter(4, () => {
      testEx.assertBlockProperty("redstone_signal", 0, lampPos);
    })
    .thenSucceed();
})
  .tag("suite:java_parity")
  .tag(GameTest.Tags.suiteDisabled); //quasi connectivity problem: when the repeater is in the upper right corner of the piston, the bedrock piston will not stretch, but Java will stretch

GameTest.register("PistonTests", "monostable_bedrock", (test) => {
  const lampPos = new BlockLocation(0, 3, 5);
  const pullLeverPos = new BlockLocation(0, 2, 0);

  test.assertRedstonePower(lampPos, 0);

  test
    .startSequence()
    .thenIdle(10)
    .thenExecute(() => {
      test.pullLever(pullLeverPos);
    })
    .thenExecuteAfter(8, () => {
      test.assertRedstonePower(lampPos, 15);
    })
    .thenExecuteAfter(8, () => {
      test.assertRedstonePower(lampPos, 0);
    })
    .thenSucceed();
})
  .maxTicks(100)
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("PistonTests", "instant_retraction", (test) => {
  const airPos = new BlockLocation(2, 1, 1);
  const concretePos = new BlockLocation(0, 1, 3);

  test.setBlockType(MinecraftBlockTypes.air, airPos);
  test.succeedOnTickWhen(14, () => {
    test.assertBlockPresent(MinecraftBlockTypes.concrete, concretePos, true);
  });
}).tag(GameTest.Tags.suiteDefault);

GameTest.register("PistonTests", "instant_repeater", (test) => {
  const testEx = new GameTestExtensions(test);
  const triggerPos = new BlockLocation(0, 3, 0);
  const outputPos = new BlockLocation(0, 3, 25);
  test.pullLever(triggerPos);

  test
    .startSequence()
    .thenWaitAfter(1, () => {
      testEx.assertBlockProperty("redstone_signal", 1, outputPos);
    })
    .thenIdle(10) // relaxation time
    .thenExecute(() => {
      test.pullLever(triggerPos);
    })
    .thenWaitAfter(5, () => {
      testEx.assertBlockProperty("redstone_signal", 0, outputPos);
    })
    .thenSucceed();
})
  .tag("suite:java_parity")
  .tag(GameTest.Tags.suiteDisabled); //Instant repeaters rely on block update detection due to quasi-connectivity and cannot be built in Bedrock.

GameTest.register("PistonTests", "entity_backside", (test) => {
  const buttonPos = new BlockLocation(2, 2, 0);
  const lampFailPos = new BlockLocation(4, 3, 2);

  test.pressButton(buttonPos);
  test
    .startSequence()
    .thenIdle(30)
    .thenWait(() => {
      test.assertBlockPresent(MinecraftBlockTypes.redstoneLamp, lampFailPos, false);
    })
    .thenSucceed();
}).tag(GameTest.Tags.suiteDefault);

GameTest.register("PistonTests", "redstone_matrix", (test) => {
  const buttonPos = new BlockLocation(1, 3, 1);
  const wirePos = new BlockLocation(1, 4, 2);

  test.pressButton(buttonPos);
  test
    .startSequence()
    .thenIdle(30)
    .thenWait(() => {
      test.assertBlockPresent(MinecraftBlockTypes.redstoneWire, wirePos, true);
    })
    .thenSucceed();
}).tag(GameTest.Tags.suiteDefault);

GameTest.register("PistonTests", "one_tick_pulse", (test) => {
  const retractedPos = new BlockLocation(1, 2, 3);
  const extendedPos = new BlockLocation(0, 2, 3);
  const pressButtonPos = new BlockLocation(2, 2, 0);

  test.pressButton(pressButtonPos);

  test
    .startSequence()

    .thenWaitAfter(2, () => {
      test.assertBlockPresent(MinecraftBlockTypes.stainedGlass, extendedPos, true);
    })
    .thenIdle(30)
    .thenWait(() => {
      test.pressButton(pressButtonPos);
    })
    .thenWaitAfter(4, () => {
      test.assertBlockPresent(MinecraftBlockTypes.stainedGlass, retractedPos, true);
      test.assertBlockPresent(MinecraftBlockTypes.air, extendedPos, true);
    })
    .thenSucceed();
})
  .tag("suite:java_parity")
  .tag(GameTest.Tags.suiteDisabled); //It's Gameplay differences. In Java Edition, pistons finish extending early and start retracting if given a pulse shorter than 3 game ticks, this causes the block to end up in its final position earlier.

GameTest.register("PistonTests", "one_tick_pulse_bedrock", (test) => {
  const retractedPos = new BlockLocation(1, 2, 3);
  const extendedPos = new BlockLocation(0, 2, 3);
  const pressButtonPos = new BlockLocation(2, 2, 0);

  test.pressButton(pressButtonPos);

  test
    .startSequence()
    .thenIdle(2)
    .thenWait(() => {
      test.assertBlockPresent(MinecraftBlockTypes.stainedGlass, extendedPos, true);
    })
    .thenIdle(30)
    .thenWait(() => {
      test.pressButton(pressButtonPos);
    })
    .thenIdle(4)
    .thenWait(() => {
      test.assertBlockPresent(MinecraftBlockTypes.stainedGlass, retractedPos, true);
      test.assertBlockPresent(MinecraftBlockTypes.air, extendedPos, true);
    })
    .thenSucceed();
}).tag(GameTest.Tags.suiteDefault);

GameTest.register("PistonTests", "backside", (test) => {
  var buttonsBlockPos = [
    new BlockLocation(3, 3, 0),
    new BlockLocation(1, 2, 1),
    new BlockLocation(4, 3, 3),
    new BlockLocation(1, 4, 3),
    new BlockLocation(3, 3, 6),
    new BlockLocation(0, 3, 5),
  ];

  for (const buttonPos of buttonsBlockPos) {
    test.pressButton(buttonPos);
  }
  test
    .startSequence()
    .thenIdle(30)
    .thenWait(() => {
      for (const buttonPos of buttonsBlockPos) {
        test.assertBlockPresent(MinecraftBlockTypes.stoneButton, buttonPos, true);
      }
    })
    .thenSucceed();
}).tag(GameTest.Tags.suiteDefault);

GameTest.register("PistonTests", "observer_retraction_timing", (test) => {
  const testEx = new GameTestExtensions(test);
  const levelPos = new BlockLocation(3, 2, 2);
  const observerPos = new BlockLocation(2, 2, 1);
  test.pullLever(levelPos);
  test
    .startSequence()
    .thenExecute(() => {
      testEx.assertBlockProperty("powered_bit", 0, observerPos);
    })
    .thenIdle(2)
    .thenExecute(() => {
      testEx.assertBlockProperty("powered_bit", 1, observerPos);
    })
    .thenSucceed();
}).tag(GameTest.Tags.suiteDefault);

GameTest.register("PistonTests", "random_tick_forcer", (test) => {
  const buttonPos = new BlockLocation(1, 3, 0);
  const flower = new BlockLocation(1, 3, 6);
  const aboveFlower = new BlockLocation(1, 4, 6);

  test.pressButton(buttonPos);
  test
    .startSequence()
    .thenIdle(20)
    .thenExecute(() => {
      test.assertBlockPresent(MinecraftBlockTypes.chorusFlower, flower, true);
      test.assertBlockPresent(MinecraftBlockTypes.air, aboveFlower, true);
    })
    .thenSucceed();
})
  .batch("no_random_ticks")
  .tag("suite:java_parity")
  .tag(GameTest.Tags.suiteDisabled); //The parity problem is still being solved

GameTest.register("PistonTests", "random_tick_forcer_bedrock", (test) => {
  const buttonPos = new BlockLocation(1, 3, 0);
  const flower = new BlockLocation(1, 3, 6);
  const aboveFlower = new BlockLocation(1, 4, 6);

  test.pressButton(buttonPos);
  test
    .startSequence()
    .thenIdle(10)
    .thenExecute(() => {
      test.assertBlockPresent(MinecraftBlockTypes.chorusFlower, flower, true);
      test.assertBlockPresent(MinecraftBlockTypes.air, aboveFlower, true);
    })
    .thenSucceed();
}).tag(GameTest.Tags.suiteDisabled);

GameTest.register("PistonTests", "honey_block_entity_drag_down", (test) => {
  const leverPos = new BlockLocation(1, 1, 0);
  const entityTypePos = new BlockLocation(1, 4, 1);
  const cowId = "minecraft:cow<minecraft:ageable_grow_up>";
  const entityTouchingPos = new Location(1.5, 4.5, 1.5);
  const entityNotTouchingTypePos = new Location(1.5, 3.5, 1.5);

  test.spawn(cowId, entityTypePos);
  test.assertEntityTouching(cowId, entityTouchingPos, true);
  test.assertEntityTouching(cowId, entityNotTouchingTypePos, false);

  const timeBetweenEachLeverPull = 4;

  var startSequence = test
    .startSequence()
    .thenIdle(4)
    .thenExecuteAfter(timeBetweenEachLeverPull, () => {
      test.pullLever(leverPos);
    });
  startSequence;

  for (var i = 0; i < 10; i++) {
    startSequence.thenExecuteAfter(timeBetweenEachLeverPull, () => {
      test.pullLever(leverPos);
    });
  }

  startSequence
    .thenExecuteAfter(timeBetweenEachLeverPull, () => {
      test.pullLever(leverPos);
    })
    .thenWait(() => {
      test.assertEntityTouching(cowId, entityTouchingPos, true);
      test.assertEntityTouching(cowId, entityNotTouchingTypePos, false);
    })
    .thenSucceed();
}).tag(GameTest.Tags.suiteDefault);

GameTest.register("PistonTests", "backside_fence", (test) => {
  const centerPos = new BlockLocation(2, 2, 2);
  test.setBlockType(MinecraftBlockTypes.fence, centerPos);

  test.startSequence().thenIdle(30).thenSucceed();
  let connectivity = undefined;

  test
    .startSequence()
    .thenIdle(1)
    .thenExecute(() => {
      connectivity = test.getFenceConnectivity(centerPos);
      test.assert(
        connectivity.east && connectivity.west && connectivity.north && connectivity.south,
        "Fence should connect to pistons"
      );
    })
    .thenWait(() => {
      connectivity = test.getFenceConnectivity(centerPos);
      test.assert(
        !(connectivity.east && connectivity.west && connectivity.north && connectivity.south),
        "Fence should stay connected to pistons"
      );
    })
    .thenFail("Fence didn't stay connected to pistons");
}).tag(GameTest.Tags.suiteDefault);

// SIG // Begin signature block
// SIG // MIInsQYJKoZIhvcNAQcCoIInojCCJ54CAQExDzANBglg
// SIG // hkgBZQMEAgEFADB3BgorBgEEAYI3AgEEoGkwZzAyBgor
// SIG // BgEEAYI3AgEeMCQCAQEEEBDgyQbOONQRoqMAEEvTUJAC
// SIG // AQACAQACAQACAQACAQAwMTANBglghkgBZQMEAgEFAAQg
// SIG // /r+FxCZrueKrw7YJ/ekPDFKVGWzz8mm7ZPjiwjDM9Fmg
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
// SIG // SEXAQsmbdlsKgEhr/Xmfwb1tbWrJUnMTDXpQzTGCGYgw
// SIG // ghmEAgEBMIGVMH4xCzAJBgNVBAYTAlVTMRMwEQYDVQQI
// SIG // EwpXYXNoaW5ndG9uMRAwDgYDVQQHEwdSZWRtb25kMR4w
// SIG // HAYDVQQKExVNaWNyb3NvZnQgQ29ycG9yYXRpb24xKDAm
// SIG // BgNVBAMTH01pY3Jvc29mdCBDb2RlIFNpZ25pbmcgUENB
// SIG // IDIwMTECEzMAAALMjrWWpr3RyU4AAAAAAswwDQYJYIZI
// SIG // AWUDBAIBBQCggcAwGQYJKoZIhvcNAQkDMQwGCisGAQQB
// SIG // gjcCAQQwHAYKKwYBBAGCNwIBCzEOMAwGCisGAQQBgjcC
// SIG // ARUwLwYJKoZIhvcNAQkEMSIEINEc2tXZdCza2745B/Pr
// SIG // Wu17JygZ4UwZljqWwB7TAxasMFQGCisGAQQBgjcCAQwx
// SIG // RjBEoCSAIgBNAGkAbgBlAGMAcgBhAGYAdAAgAEIAZQBk
// SIG // AHIAbwBjAGuhHIAaaHR0cHM6Ly93d3cubWluZWNyYWZ0
// SIG // Lm5ldC8wDQYJKoZIhvcNAQEBBQAEggEAAxZ06cnriPu/
// SIG // g5QoLk16w56sedmCgQEj2wXM6Pxy8hG84xxP10QtDD1T
// SIG // 5mpUqqBcOlLwPW0JPzlrjt7RUe43quzlJQcNLl4I9r4R
// SIG // uZdvswTTsPj7URuygAX8Qfc4+3sDpQ1XzmAOka5O4loA
// SIG // cGi7t3v8M6epEzj07Xm7yJfmY1DUs7X3afag+cNrnzTy
// SIG // 9y2dTPLHvgth/RYVkwzYA4E0hDDt26s7Tn3aKewnIu4k
// SIG // oSdu6UCpGDcgpCHVI878puTgN+WgYXAvZU4iz+u3iMlm
// SIG // eEtie8iHF1WcB41CKDf6acV/l7hFMr+D1IDZF0hjv+sC
// SIG // ptahwfR56UdQqrnd9a6b0aGCFwAwghb8BgorBgEEAYI3
// SIG // AwMBMYIW7DCCFugGCSqGSIb3DQEHAqCCFtkwghbVAgED
// SIG // MQ8wDQYJYIZIAWUDBAIBBQAwggFRBgsqhkiG9w0BCRAB
// SIG // BKCCAUAEggE8MIIBOAIBAQYKKwYBBAGEWQoDATAxMA0G
// SIG // CWCGSAFlAwQCAQUABCCXjdTNuWGP6iD8iII2fYcqpHFb
// SIG // ljcgOhS1EIsFM4527gIGYyNLC6hNGBMyMDIyMDkyODIz
// SIG // NTEyNC43MDlaMASAAgH0oIHQpIHNMIHKMQswCQYDVQQG
// SIG // EwJVUzETMBEGA1UECBMKV2FzaGluZ3RvbjEQMA4GA1UE
// SIG // BxMHUmVkbW9uZDEeMBwGA1UEChMVTWljcm9zb2Z0IENv
// SIG // cnBvcmF0aW9uMSUwIwYDVQQLExxNaWNyb3NvZnQgQW1l
// SIG // cmljYSBPcGVyYXRpb25zMSYwJAYDVQQLEx1UaGFsZXMg
// SIG // VFNTIEVTTjpFNUE2LUUyN0MtNTkyRTElMCMGA1UEAxMc
// SIG // TWljcm9zb2Z0IFRpbWUtU3RhbXAgU2VydmljZaCCEVcw
// SIG // ggcMMIIE9KADAgECAhMzAAABlbf8DdbjNzElAAEAAAGV
// SIG // MA0GCSqGSIb3DQEBCwUAMHwxCzAJBgNVBAYTAlVTMRMw
// SIG // EQYDVQQIEwpXYXNoaW5ndG9uMRAwDgYDVQQHEwdSZWRt
// SIG // b25kMR4wHAYDVQQKExVNaWNyb3NvZnQgQ29ycG9yYXRp
// SIG // b24xJjAkBgNVBAMTHU1pY3Jvc29mdCBUaW1lLVN0YW1w
// SIG // IFBDQSAyMDEwMB4XDTIxMTIwMjE5MDUxMloXDTIzMDIy
// SIG // ODE5MDUxMlowgcoxCzAJBgNVBAYTAlVTMRMwEQYDVQQI
// SIG // EwpXYXNoaW5ndG9uMRAwDgYDVQQHEwdSZWRtb25kMR4w
// SIG // HAYDVQQKExVNaWNyb3NvZnQgQ29ycG9yYXRpb24xJTAj
// SIG // BgNVBAsTHE1pY3Jvc29mdCBBbWVyaWNhIE9wZXJhdGlv
// SIG // bnMxJjAkBgNVBAsTHVRoYWxlcyBUU1MgRVNOOkU1QTYt
// SIG // RTI3Qy01OTJFMSUwIwYDVQQDExxNaWNyb3NvZnQgVGlt
// SIG // ZS1TdGFtcCBTZXJ2aWNlMIICIjANBgkqhkiG9w0BAQEF
// SIG // AAOCAg8AMIICCgKCAgEAn21BDGe2Szs/WqEQniS+IYU/
// SIG // UPCWQdsWlZTDQrd28IXEyORiz67dnvdwwLJpajs8NXBY
// SIG // jz4OkubCwl8+y221EKS4WvEuL9qnHDLU6JBGg0EvkCRK
// SIG // 5wLJelUpkbwMtJ5Y/gvz2mbi29zs2NAEcO1HgmS6cljz
// SIG // x/pOTHWI+jVA0zaF6m80Bwrj7Pn4CKK6Octwx6DtO+4O
// SIG // iK9kxyMdcn1RRLecw3BTzmDIOMgYuAOl3N4ZvbWesPOP
// SIG // Zwb1SsJuWAC3x98v395+C5zetW9cMwMd2QmY39d1Cm6R
// SIG // O6eg2Cax0Qf/qcBYxvfU8Bx+rl8w3mU+v6+qh+wAAcJ/
// SIG // H6WHNU5pXhWPGEblc846fVZDx1fFc78yy+0CtpLXnlyy
// SIG // /2OJb4y+oc8jphPtS1Q95RG2IaNcwrfhe21PhaY8gX0w
// SIG // uIv8B7KbW9tfGJW5ELdYtQepZZicFRcAi1+4MUOPECBl
// SIG // GnDMvJKdfs3M2PksZaWhIDZkJH3Na2j4fcubDGul+PPs
// SIG // dCuwfDqg6F3E4hAiIyXrccLbgZULHidOR0X4rH4BZtPZ
// SIG // Bu73RxKNzW1LjDARYpHOG6DfVH5tIlIavybaldCsK7/Q
// SIG // r92sg4HTcBFoi9muuSJxFkqUU2H7AkNN3qhIeQN68Ffy
// SIG // n1BXIrfg6z/vVXA6Y1kbAqJGb+LYJ+agFzTLR2vDYqkC
// SIG // AwEAAaOCATYwggEyMB0GA1UdDgQWBBSrl9NiAhRXV4K3
// SIG // AgZgyXx+b/ypFzAfBgNVHSMEGDAWgBSfpxVdAF5iXYP0
// SIG // 5dJlpxtTNRnpcjBfBgNVHR8EWDBWMFSgUqBQhk5odHRw
// SIG // Oi8vd3d3Lm1pY3Jvc29mdC5jb20vcGtpb3BzL2NybC9N
// SIG // aWNyb3NvZnQlMjBUaW1lLVN0YW1wJTIwUENBJTIwMjAx
// SIG // MCgxKS5jcmwwbAYIKwYBBQUHAQEEYDBeMFwGCCsGAQUF
// SIG // BzAChlBodHRwOi8vd3d3Lm1pY3Jvc29mdC5jb20vcGtp
// SIG // b3BzL2NlcnRzL01pY3Jvc29mdCUyMFRpbWUtU3RhbXAl
// SIG // MjBQQ0ElMjAyMDEwKDEpLmNydDAMBgNVHRMBAf8EAjAA
// SIG // MBMGA1UdJQQMMAoGCCsGAQUFBwMIMA0GCSqGSIb3DQEB
// SIG // CwUAA4ICAQDgszbeHyfozr0LqtCLZ9+yGa2DQRrMAIvi
// SIG // ABTN2Biv8BkJRJ3II5jQbmnPeVtnwC+sbRVXzH5Hqkiz
// SIG // C6qInVbFPQZuAxAY2ljTk/bl/7XGIiUnxUDNKw265fFe
// SIG // JzPPEWReehv6iVvYOXSKjkqIpsylLf0O1h+lQcltLGq+
// SIG // cBr4KLyt6hWncCkoc0WHBKk5Bx9s4qeXu943szx8dvrW
// SIG // mKiRucSc3QxK2dZzIsUY2h7NyqXLJmWLsbCEXwWDibwB
// SIG // Rspkxkb+T7sLDabPRHIdQGrKvOB/2P/MTdxkI+D9zIg5
// SIG // /Is1AQwrlyHx2JN/W6p2gJhW1Igm8vllqbs3ZOKAys/7
// SIG // FsK57KEO9rhBlRDe/pMsPfh0qOYvJfGYNWJo/bVIA6VV
// SIG // BowHbqC8h0O16pJypkvZCUgSpOKJBA4NCHei3ii0MB9X
// SIG // uGlXk8lGMHAV98IO6SyUFr0e52tkhq7Zf9t2BkE7nZlj
// SIG // q8ocfZZ1OygRlf2jb89LU6XLLnLCvnGRSgxJFgf6FBVa
// SIG // 7crp+jQ+aWGTY9AoEbqeYK1QAqvwIG/hDhiwg/sxLRja
// SIG // KeLXyr7GG+uNuezSfV6zB4KQom++lk9+ET5ggQcsS1JB
// SIG // 8R6ucwsmDbtCBVwLdQFYnMNeDPnMy2CFTOzTslaRXXAd
// SIG // QfTIiYpO6XkootF00XZef1fyrHE2ggRc9zCCB3EwggVZ
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
// SIG // czEmMCQGA1UECxMdVGhhbGVzIFRTUyBFU046RTVBNi1F
// SIG // MjdDLTU5MkUxJTAjBgNVBAMTHE1pY3Jvc29mdCBUaW1l
// SIG // LVN0YW1wIFNlcnZpY2WiIwoBATAHBgUrDgMCGgMVANGP
// SIG // gsi3sxoFR1hTZiiNS7hP4WOroIGDMIGApH4wfDELMAkG
// SIG // A1UEBhMCVVMxEzARBgNVBAgTCldhc2hpbmd0b24xEDAO
// SIG // BgNVBAcTB1JlZG1vbmQxHjAcBgNVBAoTFU1pY3Jvc29m
// SIG // dCBDb3Jwb3JhdGlvbjEmMCQGA1UEAxMdTWljcm9zb2Z0
// SIG // IFRpbWUtU3RhbXAgUENBIDIwMTAwDQYJKoZIhvcNAQEF
// SIG // BQACBQDm3uyFMCIYDzIwMjIwOTI4MjM1MzQxWhgPMjAy
// SIG // MjA5MjkyMzUzNDFaMHcwPQYKKwYBBAGEWQoEATEvMC0w
// SIG // CgIFAObe7IUCAQAwCgIBAAICErYCAf8wBwIBAAICEcsw
// SIG // CgIFAObgPgUCAQAwNgYKKwYBBAGEWQoEAjEoMCYwDAYK
// SIG // KwYBBAGEWQoDAqAKMAgCAQACAwehIKEKMAgCAQACAwGG
// SIG // oDANBgkqhkiG9w0BAQUFAAOBgQARcYCCilviy+V4is/x
// SIG // nTYkWUN7231pv9DAkuBtgdaY+4pXRjgyQvNHAfHaMyWi
// SIG // 73FHXCkIURT8I58DuwJgFbKgdjg1MIPpvS7nJjslbC32
// SIG // EZM9iF7EcpGPwxYmrL+kxwcKmaCqwS1eotCKrHpTkxma
// SIG // JZJDZMd1CBsH7WV9GgarXDGCBA0wggQJAgEBMIGTMHwx
// SIG // CzAJBgNVBAYTAlVTMRMwEQYDVQQIEwpXYXNoaW5ndG9u
// SIG // MRAwDgYDVQQHEwdSZWRtb25kMR4wHAYDVQQKExVNaWNy
// SIG // b3NvZnQgQ29ycG9yYXRpb24xJjAkBgNVBAMTHU1pY3Jv
// SIG // c29mdCBUaW1lLVN0YW1wIFBDQSAyMDEwAhMzAAABlbf8
// SIG // DdbjNzElAAEAAAGVMA0GCWCGSAFlAwQCAQUAoIIBSjAa
// SIG // BgkqhkiG9w0BCQMxDQYLKoZIhvcNAQkQAQQwLwYJKoZI
// SIG // hvcNAQkEMSIEIEgHdQZ36DWQSuUJugBInY81Utxqm0RL
// SIG // /t6cI/jUPCSPMIH6BgsqhkiG9w0BCRACLzGB6jCB5zCB
// SIG // 5DCBvQQgXOZL4Y2QC3tpoSM/0He5HlTpgP3AtXcymU+M
// SIG // myxJAscwgZgwgYCkfjB8MQswCQYDVQQGEwJVUzETMBEG
// SIG // A1UECBMKV2FzaGluZ3RvbjEQMA4GA1UEBxMHUmVkbW9u
// SIG // ZDEeMBwGA1UEChMVTWljcm9zb2Z0IENvcnBvcmF0aW9u
// SIG // MSYwJAYDVQQDEx1NaWNyb3NvZnQgVGltZS1TdGFtcCBQ
// SIG // Q0EgMjAxMAITMwAAAZW3/A3W4zcxJQABAAABlTAiBCD4
// SIG // CAxE4JuXTIzeqq5P6nhiQRpE8M5rCqPqtKIWDXaH0zAN
// SIG // BgkqhkiG9w0BAQsFAASCAgBhsEvzqvmT8zq8eA89kmJ9
// SIG // s5uBlop6RvQl+bBmdjpMSlumTUDzIC8NI2Nyz9SHrOK/
// SIG // g0DPvn/+jsgXeaJtPmbU67x2sX2Vvb1X8agUUN9Nd4sE
// SIG // ec899PcpRJijTK3t0/m0EbKBAuzb4yG8f0Df/TJlW6ML
// SIG // ngl2q3m3q46+ccoSwgLtEep6fY5M0njvpmBB486YZo88
// SIG // ssCyy3dp5LbKrL0w7to2sLFfhCEoFbA17luxtUEJLtHT
// SIG // ZF1P4MY5TxBf/QAjKKeUIqTq/rGRv2y+ZVh1gVHjxuX6
// SIG // iC79fu8uTDCoJ6kfOvtDN5vWjFqKhHZji39zdSjKn0FJ
// SIG // VrtcCN5EOGPAhZhjBwwhk1lfa7Qr8yQTc6se+9rA33DP
// SIG // L94uSHqOu2v6SaSIhHzHJwHKVDl+A4bkT2muliG5vass
// SIG // 1ruwp8URzxRcQIkoxy9AVNIGZmqtGhf2Lyvyuj/Ni0ap
// SIG // 8MtWCZP0h2XpK6IA1o7JcMHDUzaQjnHa8sLjuY1lzhYy
// SIG // yyTUV1PyrCJcC5/x4AE/XhfoY5gwyPCNuYAvqdzyR5VM
// SIG // EG7X/wdwZv6F5H8JGU4NlF4tYWInl9QBspym5l0tM4tX
// SIG // jvokgog7JJ1Y489jm3tLEBzS06yAJyCgFsJVjGzzVl81
// SIG // mFSHHwdaDzswcxS92AsBxMRmyQ3yHmr92IGgdE4N66+G2Q==
// SIG // End signature block
