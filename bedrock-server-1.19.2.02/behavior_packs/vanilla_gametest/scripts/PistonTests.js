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
// SIG // MIInywYJKoZIhvcNAQcCoIInvDCCJ7gCAQExDzANBglg
// SIG // hkgBZQMEAgEFADB3BgorBgEEAYI3AgEEoGkwZzAyBgor
// SIG // BgEEAYI3AgEeMCQCAQEEEBDgyQbOONQRoqMAEEvTUJAC
// SIG // AQACAQACAQACAQACAQAwMTANBglghkgBZQMEAgEFAAQg
// SIG // 8zAIL4tfkKRO3dD5ktaaJRkQmoZTYpv5PatcVXNQ1oag
// SIG // gg2FMIIGAzCCA+ugAwIBAgITMwAAAlPjg96W3sVuzAAA
// SIG // AAACUzANBgkqhkiG9w0BAQsFADB+MQswCQYDVQQGEwJV
// SIG // UzETMBEGA1UECBMKV2FzaGluZ3RvbjEQMA4GA1UEBxMH
// SIG // UmVkbW9uZDEeMBwGA1UEChMVTWljcm9zb2Z0IENvcnBv
// SIG // cmF0aW9uMSgwJgYDVQQDEx9NaWNyb3NvZnQgQ29kZSBT
// SIG // aWduaW5nIFBDQSAyMDExMB4XDTIxMDkwMjE4MzMwMFoX
// SIG // DTIyMDkwMTE4MzMwMFowdDELMAkGA1UEBhMCVVMxEzAR
// SIG // BgNVBAgTCldhc2hpbmd0b24xEDAOBgNVBAcTB1JlZG1v
// SIG // bmQxHjAcBgNVBAoTFU1pY3Jvc29mdCBDb3Jwb3JhdGlv
// SIG // bjEeMBwGA1UEAxMVTWljcm9zb2Z0IENvcnBvcmF0aW9u
// SIG // MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA
// SIG // y4cR8KtzoR/uCfkl+Kkv1UBvB8m3HB+7ZxvgVKq17m3x
// SIG // rgxWD2dvbgrh30JTtZcoC4DKSeBnoev+qaEOVZAyn1bL
// SIG // J+mgNTwsyIfIjjzEPTI7t7CxfUp/j87monuATa6dDLmS
// SIG // wxF4FWMdljY5s6nMQu3WPUgt85zoealMtr55lsoAu2/Z
// SIG // I9HdyaxrY3OaudFn1d1i1wEB5HkUTrCRQWX1xRqEr0ZY
// SIG // xRVAI1P83YT/dj/tSYkUUYpFcv7KiITA2Pu7VXc5RNn8
// SIG // Jyjr/S0oYCnshHr4DJdAdRauxNmHgWSheipYZmIvQhNd
// SIG // +dHJ01KFOGKUEp2aNGAJ2np0RAy3xRik3QIDAQABo4IB
// SIG // gjCCAX4wHwYDVR0lBBgwFgYKKwYBBAGCN0wIAQYIKwYB
// SIG // BQUHAwMwHQYDVR0OBBYEFJWaS1iHHF6MXrLAPw0W3tuo
// SIG // JYRDMFQGA1UdEQRNMEukSTBHMS0wKwYDVQQLEyRNaWNy
// SIG // b3NvZnQgSXJlbGFuZCBPcGVyYXRpb25zIExpbWl0ZWQx
// SIG // FjAUBgNVBAUTDTIzMDAxMis0Njc1OTgwHwYDVR0jBBgw
// SIG // FoAUSG5k5VAF04KqFzc3IrVtqMp1ApUwVAYDVR0fBE0w
// SIG // SzBJoEegRYZDaHR0cDovL3d3dy5taWNyb3NvZnQuY29t
// SIG // L3BraW9wcy9jcmwvTWljQ29kU2lnUENBMjAxMV8yMDEx
// SIG // LTA3LTA4LmNybDBhBggrBgEFBQcBAQRVMFMwUQYIKwYB
// SIG // BQUHMAKGRWh0dHA6Ly93d3cubWljcm9zb2Z0LmNvbS9w
// SIG // a2lvcHMvY2VydHMvTWljQ29kU2lnUENBMjAxMV8yMDEx
// SIG // LTA3LTA4LmNydDAMBgNVHRMBAf8EAjAAMA0GCSqGSIb3
// SIG // DQEBCwUAA4ICAQClWPsinCVVcX/VtrzZC+bn4zqanL1T
// SIG // jjnVco8tXZrDuDvJIVoaq3nHVWadPWnTmfJHDLUNFPqC
// SIG // sePOCYNdXHOApNBcjgZ6fmCBWzsWAqs2qjHGkQIMuPJ9
// SIG // bW8/xBWIhcyZjIhp5YFhQkrTjT70DgQ9svxI96gUZxsv
// SIG // RGUtRA5UTf/JeUbNx19pWYXfVrrpEW1JPN1PfUzycqNd
// SIG // nFNDG959Ryb/yWacEsqm9ztKOBxMVSUpMDdZuNn0lSFb
// SIG // V1VUmmGYlab99hqA/3cgEv4MqZX0ehSN0ZwjqJs5cnEq
// SIG // qM9MwQjxYgjIVYUOqp/idBoYEQSbxios8PuZU35wRaKi
// SIG // mSQ0Ts/rhg5fbcOib51agGShq1r/wrGGnoGj3jxawFUs
// SIG // QMlMDhU5AKrTQvLgHnvq79lecS8PBX6SieciojCpwiqy
// SIG // GhUA6+QGe39noxhg3/vE8zoitQIAbzlt4kxBGv2rfGeP
// SIG // rNQppxAJAItHC4we9giXnVNSwLMHTgljNjAyGVaPY9E+
// SIG // +DpCS04z3d1jRMsNKwV08oZW2ELGLexJU9pdk05ReRJq
// SIG // VYsRrY+AoTY1qCq/ckwKrWnXdmJuRTQe/dhs8DcGut9Q
// SIG // TwoASZnEaRSl7dFREKu1F1TWAYgUXfseMr46quWhe1wu
// SIG // Z1woI2wpOyF8JjqYTbjQzYkavNxI453O5sayRjCCB3ow
// SIG // ggVioAMCAQICCmEOkNIAAAAAAAMwDQYJKoZIhvcNAQEL
// SIG // BQAwgYgxCzAJBgNVBAYTAlVTMRMwEQYDVQQIEwpXYXNo
// SIG // aW5ndG9uMRAwDgYDVQQHEwdSZWRtb25kMR4wHAYDVQQK
// SIG // ExVNaWNyb3NvZnQgQ29ycG9yYXRpb24xMjAwBgNVBAMT
// SIG // KU1pY3Jvc29mdCBSb290IENlcnRpZmljYXRlIEF1dGhv
// SIG // cml0eSAyMDExMB4XDTExMDcwODIwNTkwOVoXDTI2MDcw
// SIG // ODIxMDkwOVowfjELMAkGA1UEBhMCVVMxEzARBgNVBAgT
// SIG // Cldhc2hpbmd0b24xEDAOBgNVBAcTB1JlZG1vbmQxHjAc
// SIG // BgNVBAoTFU1pY3Jvc29mdCBDb3Jwb3JhdGlvbjEoMCYG
// SIG // A1UEAxMfTWljcm9zb2Z0IENvZGUgU2lnbmluZyBQQ0Eg
// SIG // MjAxMTCCAiIwDQYJKoZIhvcNAQEBBQADggIPADCCAgoC
// SIG // ggIBAKvw+nIQHC6t2G6qghBNNLrytlghn0IbKmvpWlCq
// SIG // uAY4GgRJun/DDB7dN2vGEtgL8DjCmQawyDnVARQxQtOJ
// SIG // DXlkh36UYCRsr55JnOloXtLfm1OyCizDr9mpK656Ca/X
// SIG // llnKYBoF6WZ26DJSJhIv56sIUM+zRLdd2MQuA3WraPPL
// SIG // bfM6XKEW9Ea64DhkrG5kNXimoGMPLdNAk/jj3gcN1Vx5
// SIG // pUkp5w2+oBN3vpQ97/vjK1oQH01WKKJ6cuASOrdJXtjt
// SIG // 7UORg9l7snuGG9k+sYxd6IlPhBryoS9Z5JA7La4zWMW3
// SIG // Pv4y07MDPbGyr5I4ftKdgCz1TlaRITUlwzluZH9TupwP
// SIG // rRkjhMv0ugOGjfdf8NBSv4yUh7zAIXQlXxgotswnKDgl
// SIG // mDlKNs98sZKuHCOnqWbsYR9q4ShJnV+I4iVd0yFLPlLE
// SIG // tVc/JAPw0XpbL9Uj43BdD1FGd7P4AOG8rAKCX9vAFbO9
// SIG // G9RVS+c5oQ/pI0m8GLhEfEXkwcNyeuBy5yTfv0aZxe/C
// SIG // HFfbg43sTUkwp6uO3+xbn6/83bBm4sGXgXvt1u1L50kp
// SIG // pxMopqd9Z4DmimJ4X7IvhNdXnFy/dygo8e1twyiPLI9A
// SIG // N0/B4YVEicQJTMXUpUMvdJX3bvh4IFgsE11glZo+TzOE
// SIG // 2rCIF96eTvSWsLxGoGyY0uDWiIwLAgMBAAGjggHtMIIB
// SIG // 6TAQBgkrBgEEAYI3FQEEAwIBADAdBgNVHQ4EFgQUSG5k
// SIG // 5VAF04KqFzc3IrVtqMp1ApUwGQYJKwYBBAGCNxQCBAwe
// SIG // CgBTAHUAYgBDAEEwCwYDVR0PBAQDAgGGMA8GA1UdEwEB
// SIG // /wQFMAMBAf8wHwYDVR0jBBgwFoAUci06AjGQQ7kUBU7h
// SIG // 6qfHMdEjiTQwWgYDVR0fBFMwUTBPoE2gS4ZJaHR0cDov
// SIG // L2NybC5taWNyb3NvZnQuY29tL3BraS9jcmwvcHJvZHVj
// SIG // dHMvTWljUm9vQ2VyQXV0MjAxMV8yMDExXzAzXzIyLmNy
// SIG // bDBeBggrBgEFBQcBAQRSMFAwTgYIKwYBBQUHMAKGQmh0
// SIG // dHA6Ly93d3cubWljcm9zb2Z0LmNvbS9wa2kvY2VydHMv
// SIG // TWljUm9vQ2VyQXV0MjAxMV8yMDExXzAzXzIyLmNydDCB
// SIG // nwYDVR0gBIGXMIGUMIGRBgkrBgEEAYI3LgMwgYMwPwYI
// SIG // KwYBBQUHAgEWM2h0dHA6Ly93d3cubWljcm9zb2Z0LmNv
// SIG // bS9wa2lvcHMvZG9jcy9wcmltYXJ5Y3BzLmh0bTBABggr
// SIG // BgEFBQcCAjA0HjIgHQBMAGUAZwBhAGwAXwBwAG8AbABp
// SIG // AGMAeQBfAHMAdABhAHQAZQBtAGUAbgB0AC4gHTANBgkq
// SIG // hkiG9w0BAQsFAAOCAgEAZ/KGpZjgVHkaLtPYdGcimwuW
// SIG // EeFjkplCln3SeQyQwWVfLiw++MNy0W2D/r4/6ArKO79H
// SIG // qaPzadtjvyI1pZddZYSQfYtGUFXYDJJ80hpLHPM8QotS
// SIG // 0LD9a+M+By4pm+Y9G6XUtR13lDni6WTJRD14eiPzE32m
// SIG // kHSDjfTLJgJGKsKKELukqQUMm+1o+mgulaAqPyprWElj
// SIG // HwlpblqYluSD9MCP80Yr3vw70L01724lruWvJ+3Q3fMO
// SIG // r5kol5hNDj0L8giJ1h/DMhji8MUtzluetEk5CsYKwsat
// SIG // ruWy2dsViFFFWDgycScaf7H0J/jeLDogaZiyWYlobm+n
// SIG // t3TDQAUGpgEqKD6CPxNNZgvAs0314Y9/HG8VfUWnduVA
// SIG // KmWjw11SYobDHWM2l4bf2vP48hahmifhzaWX0O5dY0Hj
// SIG // Wwechz4GdwbRBrF1HxS+YWG18NzGGwS+30HHDiju3mUv
// SIG // 7Jf2oVyW2ADWoUa9WfOXpQlLSBCZgB/QACnFsZulP0V3
// SIG // HjXG0qKin3p6IvpIlR+r+0cjgPWe+L9rt0uX4ut1eBrs
// SIG // 6jeZeRhL/9azI2h15q/6/IvrC4DqaTuv/DDtBEyO3991
// SIG // bWORPdGdVk5Pv4BXIqF4ETIheu9BCrE/+6jMpF3BoYib
// SIG // V3FWTkhFwELJm3ZbCoBIa/15n8G9bW1qyVJzEw16UM0x
// SIG // ghmeMIIZmgIBATCBlTB+MQswCQYDVQQGEwJVUzETMBEG
// SIG // A1UECBMKV2FzaGluZ3RvbjEQMA4GA1UEBxMHUmVkbW9u
// SIG // ZDEeMBwGA1UEChMVTWljcm9zb2Z0IENvcnBvcmF0aW9u
// SIG // MSgwJgYDVQQDEx9NaWNyb3NvZnQgQ29kZSBTaWduaW5n
// SIG // IFBDQSAyMDExAhMzAAACU+OD3pbexW7MAAAAAAJTMA0G
// SIG // CWCGSAFlAwQCAQUAoIHAMBkGCSqGSIb3DQEJAzEMBgor
// SIG // BgEEAYI3AgEEMBwGCisGAQQBgjcCAQsxDjAMBgorBgEE
// SIG // AYI3AgEVMC8GCSqGSIb3DQEJBDEiBCBU5gHSuNI8lEke
// SIG // wH305kSCDqDY8XUGouuEReXNvszEMjBUBgorBgEEAYI3
// SIG // AgEMMUYwRKAkgCIATQBpAG4AZQBjAHIAYQBmAHQAIABC
// SIG // AGUAZAByAG8AYwBroRyAGmh0dHBzOi8vd3d3Lm1pbmVj
// SIG // cmFmdC5uZXQvMA0GCSqGSIb3DQEBAQUABIIBAMVHK3Oj
// SIG // KkrTX8XU1A4+0QXWP83L9j13FNJCl7vkKMcUeE+o/N5o
// SIG // hG7xnyQiH7Jkg7/QTgwqGHqAHLl92KIhesEFnzi2AOi3
// SIG // ioRwHdqmsAKXQkxM8O9+NCPRiMbD8gDiS09Yt7PSct8i
// SIG // ko04zbb/l4eaEARH2f9x4Mp3JegNVbLOkZZUNj75Y4ey
// SIG // AUEqmKkp+a3lJM3+bFasyz57LAp8PFhylM34faCWouH7
// SIG // eFSKAQbwx7tO/s8meKI7/IdLoFpU/zrPnbRHFpBQAjNo
// SIG // +mR4aBM3qG4HAdeAz8Wjr8OtRC+VqkBNSimCq9yMCSQg
// SIG // rf5h3SFF1P/ck4wZWPJD8cPrl4WhghcWMIIXEgYKKwYB
// SIG // BAGCNwMDATGCFwIwghb+BgkqhkiG9w0BBwKgghbvMIIW
// SIG // 6wIBAzEPMA0GCWCGSAFlAwQCAQUAMIIBWQYLKoZIhvcN
// SIG // AQkQAQSgggFIBIIBRDCCAUACAQEGCisGAQQBhFkKAwEw
// SIG // MTANBglghkgBZQMEAgEFAAQgn2NQea7YgvA9Tkzcn23E
// SIG // 7oioEJv96E9nkABxJ1vm0MMCBmKzBoKHeRgTMjAyMjA3
// SIG // MDIwMDI4NTEuNTgyWjAEgAIB9KCB2KSB1TCB0jELMAkG
// SIG // A1UEBhMCVVMxEzARBgNVBAgTCldhc2hpbmd0b24xEDAO
// SIG // BgNVBAcTB1JlZG1vbmQxHjAcBgNVBAoTFU1pY3Jvc29m
// SIG // dCBDb3Jwb3JhdGlvbjEtMCsGA1UECxMkTWljcm9zb2Z0
// SIG // IElyZWxhbmQgT3BlcmF0aW9ucyBMaW1pdGVkMSYwJAYD
// SIG // VQQLEx1UaGFsZXMgVFNTIEVTTjowODQyLTRCRTYtQzI5
// SIG // QTElMCMGA1UEAxMcTWljcm9zb2Z0IFRpbWUtU3RhbXAg
// SIG // U2VydmljZaCCEWUwggcUMIIE/KADAgECAhMzAAABh0IW
// SIG // ZgRc8/SNAAEAAAGHMA0GCSqGSIb3DQEBCwUAMHwxCzAJ
// SIG // BgNVBAYTAlVTMRMwEQYDVQQIEwpXYXNoaW5ndG9uMRAw
// SIG // DgYDVQQHEwdSZWRtb25kMR4wHAYDVQQKExVNaWNyb3Nv
// SIG // ZnQgQ29ycG9yYXRpb24xJjAkBgNVBAMTHU1pY3Jvc29m
// SIG // dCBUaW1lLVN0YW1wIFBDQSAyMDEwMB4XDTIxMTAyODE5
// SIG // MjczOVoXDTIzMDEyNjE5MjczOVowgdIxCzAJBgNVBAYT
// SIG // AlVTMRMwEQYDVQQIEwpXYXNoaW5ndG9uMRAwDgYDVQQH
// SIG // EwdSZWRtb25kMR4wHAYDVQQKExVNaWNyb3NvZnQgQ29y
// SIG // cG9yYXRpb24xLTArBgNVBAsTJE1pY3Jvc29mdCBJcmVs
// SIG // YW5kIE9wZXJhdGlvbnMgTGltaXRlZDEmMCQGA1UECxMd
// SIG // VGhhbGVzIFRTUyBFU046MDg0Mi00QkU2LUMyOUExJTAj
// SIG // BgNVBAMTHE1pY3Jvc29mdCBUaW1lLVN0YW1wIFNlcnZp
// SIG // Y2UwggIiMA0GCSqGSIb3DQEBAQUAA4ICDwAwggIKAoIC
// SIG // AQC+aXgZYz0Do9ERCIeBkAA8rqf5OHqb4tjApgtpAWVl
// SIG // dtOquh2GyeLsdUhGSoEW4byiDUpmvLTbESaZt2nz07jT
// SIG // EIhB9bwUpbug7+Vhi1QBBbaSnS4y5gQnVeRnp4eNwy6o
// SIG // QnALjtRqRnHcB6RqQ/4Z8a4MM72RkZBF7wimKInhCSfq
// SIG // ZsOFtGmBxQ52wPOY3PqRcbuB8h+ByzmTO4og/qc3i2yM
// SIG // +HIXnxVTRl8jQ9IL6fk5fSGxTyF5Z7elSIOvmCo/Xprq
// SIG // QiMUkeSA09iAyK8ZNApyM3E1xeefKZP8lW42ztm+TU/k
// SIG // pZ/wbVcb8y1lnn+O6qyDRChSZBmNWHRdGS7tikymS1bt
// SIG // d8UDfL5gk4bWlXOLMHc/MldQLwxrwBTLC1S5QtaNhPnL
// SIG // v8TDAdaafVFPQ+Fin2Sal9Lochh8QFuhhS9QtbYecY1/
// SIG // Hrl/hSRzuSA1JBt4AfrKM7l2DoxTA9/Oj+sF01pl8nFn
// SIG // tGxxMHJO2XFuV9RPjrI8cJcAKJf8GFocRjh50WCn9whv
// SIG // tccUlu7iY0MA/NGUCQiPVIa470bixuSMz1ek0xaCWPZ0
// SIG // L1As3/SB4EVeg0jwX4d8fDgmj6nqJI/yGfjeaSRYpIY6
// SIG // JPiEsnOhwSsWe0rmL095tdKrYG8yDNVz4EG8I3fkN8PS
// SIG // aiRErFqba1AzTrRI5HLdLu5x6wIDAQABo4IBNjCCATIw
// SIG // HQYDVR0OBBYEFCJRwBa6QS1hgX7dYXOZkD8NpY0gMB8G
// SIG // A1UdIwQYMBaAFJ+nFV0AXmJdg/Tl0mWnG1M1GelyMF8G
// SIG // A1UdHwRYMFYwVKBSoFCGTmh0dHA6Ly93d3cubWljcm9z
// SIG // b2Z0LmNvbS9wa2lvcHMvY3JsL01pY3Jvc29mdCUyMFRp
// SIG // bWUtU3RhbXAlMjBQQ0ElMjAyMDEwKDEpLmNybDBsBggr
// SIG // BgEFBQcBAQRgMF4wXAYIKwYBBQUHMAKGUGh0dHA6Ly93
// SIG // d3cubWljcm9zb2Z0LmNvbS9wa2lvcHMvY2VydHMvTWlj
// SIG // cm9zb2Z0JTIwVGltZS1TdGFtcCUyMFBDQSUyMDIwMTAo
// SIG // MSkuY3J0MAwGA1UdEwEB/wQCMAAwEwYDVR0lBAwwCgYI
// SIG // KwYBBQUHAwgwDQYJKoZIhvcNAQELBQADggIBALmrflPZ
// SIG // EqMAVE3/dxiOc8XO09rsp6okomcqC+JSP0gx8Lz8VDaj
// SIG // HpTDJ3jRNLvMq+24yXXUUWV9aQSdw3eWqKGJICogM851
// SIG // W+vWgljg0VAE4fMul616kecyDRQvZRcfO+MqDbhU4jNv
// SIG // R210/r35AjLtIOlxWH0ojQRcobZuiWkHKmpG20ZMN3Ql
// SIG // CQ60x2JKloOk4fCAIw1cTzEi7jyGK5PTvmgiqccmFrfv
// SIG // z8Om6AjQNmNhxkfVwbzgnTq5yrnKCuh32zOvX05sJkl0
// SIG // kunK8lYLLw9EMCRGM8mCVKZ+fZRHQq+ejII7OOzMDA0K
// SIG // n8kmeRGnbTB4i3Ob3uI2D4VkXUn0TXp5YgHWwKvtWP1A
// SIG // Poq37PzWs5wtF/GGU7b+wrT1TD4OJCQ9u7o5ndOwO8uy
// SIG // vzIb1bYDzJdyCA2p3heku10SR/nY4g3QaBEtJjUs0MHg
// SIG // gpj5mPfgjAxsNuzawKKDkuLYgtYQxX/qDIvfsnvU1tbt
// SIG // XOjt9was2d706rGAULZZfl16DHIndLHZsrDqVt/Tgppe
// SIG // dME5LPRAL5F8m7Pyc6kh/bz5aYw+JxfaXuCz8ysLlqeb
// SIG // Ir+dt4qRo7H4BeHBgvMRM2D7UhzKCN3CdupYpp8t0I0p
// SIG // +Gxv+AzlIVuAPkBMRfVsDHBQVXEq9C/R0hECbloOMXcN
// SIG // mmC/LeZKiNKsE3/zMIIHcTCCBVmgAwIBAgITMwAAABXF
// SIG // 52ueAptJmQAAAAAAFTANBgkqhkiG9w0BAQsFADCBiDEL
// SIG // MAkGA1UEBhMCVVMxEzARBgNVBAgTCldhc2hpbmd0b24x
// SIG // EDAOBgNVBAcTB1JlZG1vbmQxHjAcBgNVBAoTFU1pY3Jv
// SIG // c29mdCBDb3Jwb3JhdGlvbjEyMDAGA1UEAxMpTWljcm9z
// SIG // b2Z0IFJvb3QgQ2VydGlmaWNhdGUgQXV0aG9yaXR5IDIw
// SIG // MTAwHhcNMjEwOTMwMTgyMjI1WhcNMzAwOTMwMTgzMjI1
// SIG // WjB8MQswCQYDVQQGEwJVUzETMBEGA1UECBMKV2FzaGlu
// SIG // Z3RvbjEQMA4GA1UEBxMHUmVkbW9uZDEeMBwGA1UEChMV
// SIG // TWljcm9zb2Z0IENvcnBvcmF0aW9uMSYwJAYDVQQDEx1N
// SIG // aWNyb3NvZnQgVGltZS1TdGFtcCBQQ0EgMjAxMDCCAiIw
// SIG // DQYJKoZIhvcNAQEBBQADggIPADCCAgoCggIBAOThpkzn
// SIG // tHIhC3miy9ckeb0O1YLT/e6cBwfSqWxOdcjKNVf2AX9s
// SIG // SuDivbk+F2Az/1xPx2b3lVNxWuJ+Slr+uDZnhUYjDLWN
// SIG // E893MsAQGOhgfWpSg0S3po5GawcU88V29YZQ3MFEyHFc
// SIG // UTE3oAo4bo3t1w/YJlN8OWECesSq/XJprx2rrPY2vjUm
// SIG // ZNqYO7oaezOtgFt+jBAcnVL+tuhiJdxqD89d9P6OU8/W
// SIG // 7IVWTe/dvI2k45GPsjksUZzpcGkNyjYtcI4xyDUoveO0
// SIG // hyTD4MmPfrVUj9z6BVWYbWg7mka97aSueik3rMvrg0Xn
// SIG // Rm7KMtXAhjBcTyziYrLNueKNiOSWrAFKu75xqRdbZ2De
// SIG // +JKRHh09/SDPc31BmkZ1zcRfNN0Sidb9pSB9fvzZnkXf
// SIG // tnIv231fgLrbqn427DZM9ituqBJR6L8FA6PRc6ZNN3SU
// SIG // HDSCD/AQ8rdHGO2n6Jl8P0zbr17C89XYcz1DTsEzOUyO
// SIG // ArxCaC4Q6oRRRuLRvWoYWmEBc8pnol7XKHYC4jMYcten
// SIG // IPDC+hIK12NvDMk2ZItboKaDIV1fMHSRlJTYuVD5C4lh
// SIG // 8zYGNRiER9vcG9H9stQcxWv2XFJRXRLbJbqvUAV6bMUR
// SIG // HXLvjflSxIUXk8A8FdsaN8cIFRg/eKtFtvUeh17aj54W
// SIG // cmnGrnu3tz5q4i6tAgMBAAGjggHdMIIB2TASBgkrBgEE
// SIG // AYI3FQEEBQIDAQABMCMGCSsGAQQBgjcVAgQWBBQqp1L+
// SIG // ZMSavoKRPEY1Kc8Q/y8E7jAdBgNVHQ4EFgQUn6cVXQBe
// SIG // Yl2D9OXSZacbUzUZ6XIwXAYDVR0gBFUwUzBRBgwrBgEE
// SIG // AYI3TIN9AQEwQTA/BggrBgEFBQcCARYzaHR0cDovL3d3
// SIG // dy5taWNyb3NvZnQuY29tL3BraW9wcy9Eb2NzL1JlcG9z
// SIG // aXRvcnkuaHRtMBMGA1UdJQQMMAoGCCsGAQUFBwMIMBkG
// SIG // CSsGAQQBgjcUAgQMHgoAUwB1AGIAQwBBMAsGA1UdDwQE
// SIG // AwIBhjAPBgNVHRMBAf8EBTADAQH/MB8GA1UdIwQYMBaA
// SIG // FNX2VsuP6KJcYmjRPZSQW9fOmhjEMFYGA1UdHwRPME0w
// SIG // S6BJoEeGRWh0dHA6Ly9jcmwubWljcm9zb2Z0LmNvbS9w
// SIG // a2kvY3JsL3Byb2R1Y3RzL01pY1Jvb0NlckF1dF8yMDEw
// SIG // LTA2LTIzLmNybDBaBggrBgEFBQcBAQROMEwwSgYIKwYB
// SIG // BQUHMAKGPmh0dHA6Ly93d3cubWljcm9zb2Z0LmNvbS9w
// SIG // a2kvY2VydHMvTWljUm9vQ2VyQXV0XzIwMTAtMDYtMjMu
// SIG // Y3J0MA0GCSqGSIb3DQEBCwUAA4ICAQCdVX38Kq3hLB9n
// SIG // ATEkW+Geckv8qW/qXBS2Pk5HZHixBpOXPTEztTnXwnE2
// SIG // P9pkbHzQdTltuw8x5MKP+2zRoZQYIu7pZmc6U03dmLq2
// SIG // HnjYNi6cqYJWAAOwBb6J6Gngugnue99qb74py27YP0h1
// SIG // AdkY3m2CDPVtI1TkeFN1JFe53Z/zjj3G82jfZfakVqr3
// SIG // lbYoVSfQJL1AoL8ZthISEV09J+BAljis9/kpicO8F7BU
// SIG // hUKz/AyeixmJ5/ALaoHCgRlCGVJ1ijbCHcNhcy4sa3tu
// SIG // PywJeBTpkbKpW99Jo3QMvOyRgNI95ko+ZjtPu4b6MhrZ
// SIG // lvSP9pEB9s7GdP32THJvEKt1MMU0sHrYUP4KWN1APMdU
// SIG // bZ1jdEgssU5HLcEUBHG/ZPkkvnNtyo4JvbMBV0lUZNlz
// SIG // 138eW0QBjloZkWsNn6Qo3GcZKCS6OEuabvshVGtqRRFH
// SIG // qfG3rsjoiV5PndLQTHa1V1QJsWkBRH58oWFsc/4Ku+xB
// SIG // Zj1p/cvBQUl+fpO+y/g75LcVv7TOPqUxUYS8vwLBgqJ7
// SIG // Fx0ViY1w/ue10CgaiQuPNtq6TPmb/wrpNPgkNWcr4A24
// SIG // 5oyZ1uEi6vAnQj0llOZ0dFtq0Z4+7X6gMTN9vMvpe784
// SIG // cETRkPHIqzqKOghif9lwY1NNje6CbaUFEMFxBmoQtB1V
// SIG // M1izoXBm8qGCAtQwggI9AgEBMIIBAKGB2KSB1TCB0jEL
// SIG // MAkGA1UEBhMCVVMxEzARBgNVBAgTCldhc2hpbmd0b24x
// SIG // EDAOBgNVBAcTB1JlZG1vbmQxHjAcBgNVBAoTFU1pY3Jv
// SIG // c29mdCBDb3Jwb3JhdGlvbjEtMCsGA1UECxMkTWljcm9z
// SIG // b2Z0IElyZWxhbmQgT3BlcmF0aW9ucyBMaW1pdGVkMSYw
// SIG // JAYDVQQLEx1UaGFsZXMgVFNTIEVTTjowODQyLTRCRTYt
// SIG // QzI5QTElMCMGA1UEAxMcTWljcm9zb2Z0IFRpbWUtU3Rh
// SIG // bXAgU2VydmljZaIjCgEBMAcGBSsOAwIaAxUAeHeTVAQo
// SIG // BkSGwsZgYe1//oMbg/OggYMwgYCkfjB8MQswCQYDVQQG
// SIG // EwJVUzETMBEGA1UECBMKV2FzaGluZ3RvbjEQMA4GA1UE
// SIG // BxMHUmVkbW9uZDEeMBwGA1UEChMVTWljcm9zb2Z0IENv
// SIG // cnBvcmF0aW9uMSYwJAYDVQQDEx1NaWNyb3NvZnQgVGlt
// SIG // ZS1TdGFtcCBQQ0EgMjAxMDANBgkqhkiG9w0BAQUFAAIF
// SIG // AOZqCu8wIhgPMjAyMjA3MDIwODA4MTVaGA8yMDIyMDcw
// SIG // MzA4MDgxNVowdDA6BgorBgEEAYRZCgQBMSwwKjAKAgUA
// SIG // 5moK7wIBADAHAgEAAgIJPzAHAgEAAgIRMjAKAgUA5mtc
// SIG // bwIBADA2BgorBgEEAYRZCgQCMSgwJjAMBgorBgEEAYRZ
// SIG // CgMCoAowCAIBAAIDB6EgoQowCAIBAAIDAYagMA0GCSqG
// SIG // SIb3DQEBBQUAA4GBADdpU3PHtsGhoi/4+GK1TepzhwaS
// SIG // l0vpNx2tkdEeEXAIOYmsHOkxq+9/2j42ea0x/76A5L9+
// SIG // wc9HjIxJipm3TlQsa0CM+JrMyf3WpPlNKUckAM+DrMiS
// SIG // rMMGFS7FcwHRUZt8MZ9mAIn/NfAsT9+BPmd0fugpUvgn
// SIG // /tjajgbfjzQfMYIEDTCCBAkCAQEwgZMwfDELMAkGA1UE
// SIG // BhMCVVMxEzARBgNVBAgTCldhc2hpbmd0b24xEDAOBgNV
// SIG // BAcTB1JlZG1vbmQxHjAcBgNVBAoTFU1pY3Jvc29mdCBD
// SIG // b3Jwb3JhdGlvbjEmMCQGA1UEAxMdTWljcm9zb2Z0IFRp
// SIG // bWUtU3RhbXAgUENBIDIwMTACEzMAAAGHQhZmBFzz9I0A
// SIG // AQAAAYcwDQYJYIZIAWUDBAIBBQCgggFKMBoGCSqGSIb3
// SIG // DQEJAzENBgsqhkiG9w0BCRABBDAvBgkqhkiG9w0BCQQx
// SIG // IgQgmjCOeoM2tEl2nYndgXae6ELwpSae8nNTaaF/kjbg
// SIG // kHwwgfoGCyqGSIb3DQEJEAIvMYHqMIHnMIHkMIG9BCDE
// SIG // LPCgE26gH3bCwLZLFmHPgdUbK8JmfBg25zOkbJqbWDCB
// SIG // mDCBgKR+MHwxCzAJBgNVBAYTAlVTMRMwEQYDVQQIEwpX
// SIG // YXNoaW5ndG9uMRAwDgYDVQQHEwdSZWRtb25kMR4wHAYD
// SIG // VQQKExVNaWNyb3NvZnQgQ29ycG9yYXRpb24xJjAkBgNV
// SIG // BAMTHU1pY3Jvc29mdCBUaW1lLVN0YW1wIFBDQSAyMDEw
// SIG // AhMzAAABh0IWZgRc8/SNAAEAAAGHMCIEIBvY29qTRzpb
// SIG // 6N5S2jyrY51tWBTH1pYhjpIckJp5F+O2MA0GCSqGSIb3
// SIG // DQEBCwUABIICAF4+rwmpEoWxbb8mG5D6mM7Y5+8xpI6U
// SIG // 4WvN8cEmEWoL1sCeG6VzkKW2nphQ7m4NaKvYpiCBtUKb
// SIG // 528aD4gTNZoROzk8GmAVTR3K33OEQhMxzv2rTZKK9OM0
// SIG // xbc/SSW/g7B81MaBRF9F8YYsdp6lwJnrngq2fXfuM2aM
// SIG // CozWBfU6UnfzS377jfSI6VzE7SGbzclCKWhxC6tAWU37
// SIG // C7//qN9ytdwFTWyBJyceDAju6bgG//RF3c2kU7PYjmQn
// SIG // GNnRqgtnLPSLvkUnVyuyrSHL+TU+uEr8XIi6UPIWJy67
// SIG // dA7GskXpL4sZNKscH3HxuhoR/k9LLTUETtGKeaR6JhzD
// SIG // lVgh1GFYuTzxx8fApogwdrwtdalJJ68Is5mNdNOUGTyU
// SIG // a/b0LWCvc5r7MVAN+qb0YhPmZjMwO0C3ItwEdeZvANb3
// SIG // JP3/v6zD+ytWi5dUX/azgruu/rL9AMXM8Spu41y/yboh
// SIG // Jf3A1nxes+aF+XGb14BhQP9GVsezL5yB09eT+xEI38SU
// SIG // 6M1xxeESBJr9L+XqRXRPxumucjKaroULDTJXjn8hmXOv
// SIG // 3YEh4k5I4UQoNPJpcwPWiO6qfAY5kpkYrgH6IqJzCrJx
// SIG // yHlTvQV5+ObhbFJ5r5ryg4BL65iSl0lcrTjMeKuAES0/
// SIG // 6xa8YQXjVYhYUMDSk0G0Y6JDizL5SZb9G6eU
// SIG // End signature block
