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
    .thenIdle(2)
    .thenWait(() => {
      test.assertBlockPresent(MinecraftBlockTypes.concrete, extended, true);
      test.assertBlockPresent(MinecraftBlockTypes.air, retracted, true);
    })
    .thenExecuteAfter(3, () => {
      test.pulseRedstone(trigger, 2);
    })
    .thenIdle(6)
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
// SIG // MIInxwYJKoZIhvcNAQcCoIInuDCCJ7QCAQExDzANBglg
// SIG // hkgBZQMEAgEFADB3BgorBgEEAYI3AgEEoGkwZzAyBgor
// SIG // BgEEAYI3AgEeMCQCAQEEEBDgyQbOONQRoqMAEEvTUJAC
// SIG // AQACAQACAQACAQACAQAwMTANBglghkgBZQMEAgEFAAQg
// SIG // 8zAIL4tfkKRO3dD5ktaaJRkQmoZTYpv5PatcVXNQ1oag
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
// SIG // ARUwLwYJKoZIhvcNAQkEMSIEIFTmAdK40jyUSR7AffTm
// SIG // RIIOoNjxdQai64RF5c2+zMQyMFQGCisGAQQBgjcCAQwx
// SIG // RjBEoCSAIgBNAGkAbgBlAGMAcgBhAGYAdAAgAEIAZQBk
// SIG // AHIAbwBjAGuhHIAaaHR0cHM6Ly93d3cubWluZWNyYWZ0
// SIG // Lm5ldC8wDQYJKoZIhvcNAQEBBQAEggEAdsQgO1SNGAHQ
// SIG // 2lAMyoXW2lRvl2FvGhqDhFpy81KaFo47Lu1hGm3tENNS
// SIG // Vk6Nq+edM5zs5z2AiJtoHcao+fN2LbrS72fB1lFsEdVZ
// SIG // XslSLq9bjGvEKULRDdWfWijnq4h4A+x/MasY0YtIftSH
// SIG // RitUGaPlPaUTM6PcaNz/jykQ4VFLmbJpQ2lfUERjENOo
// SIG // i3VmnVGqz8sxSkrzTLKwtCyA8EQh55yL+Ubdsmqov1YB
// SIG // uemZO/GJlUb5Y/78K2X9+00q75C8XejUgvDX6W7sgt1k
// SIG // mL0dxnPdNwPWQubX4Y50BHZNpEQn97oNwcYRhk7uNM2E
// SIG // JrdxZkceLgJk+pA5zRondqGCFxYwghcSBgorBgEEAYI3
// SIG // AwMBMYIXAjCCFv4GCSqGSIb3DQEHAqCCFu8wghbrAgED
// SIG // MQ8wDQYJYIZIAWUDBAIBBQAwggFZBgsqhkiG9w0BCRAB
// SIG // BKCCAUgEggFEMIIBQAIBAQYKKwYBBAGEWQoDATAxMA0G
// SIG // CWCGSAFlAwQCAQUABCDyUiuW6WBIGzFTSrimYsU3NdhH
// SIG // APXiGUtRjKtR42QswQIGYoZgzC3mGBMyMDIyMDYxNjIz
// SIG // MTU1OS4zNzZaMASAAgH0oIHYpIHVMIHSMQswCQYDVQQG
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
// SIG // YW1wIFBDQSAyMDEwMA0GCSqGSIb3DQEBBQUAAgUA5lUe
// SIG // 4zAiGA8yMDIyMDYxNjExMTU0N1oYDzIwMjIwNjE3MTEx
// SIG // NTQ3WjB0MDoGCisGAQQBhFkKBAExLDAqMAoCBQDmVR7j
// SIG // AgEAMAcCAQACAjBVMAcCAQACAhJVMAoCBQDmVnBjAgEA
// SIG // MDYGCisGAQQBhFkKBAIxKDAmMAwGCisGAQQBhFkKAwKg
// SIG // CjAIAgEAAgMHoSChCjAIAgEAAgMBhqAwDQYJKoZIhvcN
// SIG // AQEFBQADgYEAbFs6uF6/PFAVDrxvKpgYqMuwHblsYMje
// SIG // hHyWgP3BNAtCONslQFKU0KlH7Kif9vzcIOOvKQF/lmvL
// SIG // lT9IU+6z9qNI4Xig6cd44sMGoxikCs9t5qniMNTsriYp
// SIG // CF5SDnh0Hu500u3aNrzGtztpbjL7dwwqL5bRSh1hARmB
// SIG // c9h2AioxggQNMIIECQIBATCBkzB8MQswCQYDVQQGEwJV
// SIG // UzETMBEGA1UECBMKV2FzaGluZ3RvbjEQMA4GA1UEBxMH
// SIG // UmVkbW9uZDEeMBwGA1UEChMVTWljcm9zb2Z0IENvcnBv
// SIG // cmF0aW9uMSYwJAYDVQQDEx1NaWNyb3NvZnQgVGltZS1T
// SIG // dGFtcCBQQ0EgMjAxMAITMwAAAYo+OI3SDgL66AABAAAB
// SIG // ijANBglghkgBZQMEAgEFAKCCAUowGgYJKoZIhvcNAQkD
// SIG // MQ0GCyqGSIb3DQEJEAEEMC8GCSqGSIb3DQEJBDEiBCB0
// SIG // 8qkdjHa2QLrRocH9u3aHEzNXhfvtIIV0eoDTzWP5bjCB
// SIG // +gYLKoZIhvcNAQkQAi8xgeowgecwgeQwgb0EIPS94Kt1
// SIG // 30q+fvO/fzD4MbWQhQaE7RHkOH6AkjlNVCm9MIGYMIGA
// SIG // pH4wfDELMAkGA1UEBhMCVVMxEzARBgNVBAgTCldhc2hp
// SIG // bmd0b24xEDAOBgNVBAcTB1JlZG1vbmQxHjAcBgNVBAoT
// SIG // FU1pY3Jvc29mdCBDb3Jwb3JhdGlvbjEmMCQGA1UEAxMd
// SIG // TWljcm9zb2Z0IFRpbWUtU3RhbXAgUENBIDIwMTACEzMA
// SIG // AAGKPjiN0g4C+ugAAQAAAYowIgQgFWqDVlpVo1Gk5sJn
// SIG // LCDJlfODiMv2TK+9geCCyePmVRkwDQYJKoZIhvcNAQEL
// SIG // BQAEggIAspgxlzqdWYNA+BGaruSu2Adu7ce9sS0wxOWr
// SIG // Z/H6oSt312wYgCrFfmyVHLEUKHyJA8moFuKVgMiyOOqD
// SIG // /e6wxAIc51hwQRXl7A/zOKE0y6pAJCwno4EDPC1+lqdt
// SIG // L1X9ZcYkhMidez0Wx4+HAlOQW4rszlaIFrX+16xPuN2i
// SIG // AmveIJnEs4PTS/dhUIYs9kMJNy9SQLKsEQWDuticoWKo
// SIG // 9XwoT1ns0DU6zBZr3KYwuPD7W///BAucFP7mJAP8Jf2F
// SIG // eJ+TLSrsxby/3Ma8JLaJ9EIBgzg218Wja8T01ZpC1uLh
// SIG // swVDzUYzIRZNulzxQVtCdIFNj5okHzEabcytgEPbHFrI
// SIG // lbiSiWabmLLdcfFhL4DzXRQBg1V3cbxyJqdvXUJNIcPH
// SIG // u3ynUQAE+mNBDZqIiJXgz4dViKjsQifwnfoHelrPU5Lk
// SIG // 8wq2XxLZv3PNHlObzGAJWzhT+o1ZlKV7NwekPRg6Bc+R
// SIG // K0UJwO+WSVcVoTe85Atf48DyP2InQknkYRrNVBlVuxme
// SIG // XiV0wRY9AbW8wous740Y0yLSR3d5z+zVmfC6PbmwAkyI
// SIG // oAO6o6HtYLpEaDxzv1EPYfbyM9IbHuX7tr8OW4RMjJ7f
// SIG // JrVWke8lOjlPdrpQpelzrn99zbBFV0TcR02RPMUqnyV4
// SIG // fosN7pUoib8C5ICYNz5o8o3TJpyBG0o=
// SIG // End signature block
