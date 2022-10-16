import * as GameTest from "mojang-gametest";
import { BlockLocation, MinecraftBlockTypes, MinecraftItemTypes, BlockProperties, world } from "mojang-minecraft";
import GameTestExtensions from "./GameTestExtensions.js";

const TicksPerSecond = 20;

const LEVEL_TO_RECORDS = new Map([
  [0, MinecraftItemTypes.air],
  [1, MinecraftItemTypes.musicDisc13],
  [2, MinecraftItemTypes.musicDiscCat],
  [3, MinecraftItemTypes.musicDiscBlocks],
  [4, MinecraftItemTypes.musicDiscChirp],
  [5, MinecraftItemTypes.musicDiscFar],
  [6, MinecraftItemTypes.musicDiscMall],
  [7, MinecraftItemTypes.musicDiscMellohi],
  [8, MinecraftItemTypes.musicDiscStal],
  [9, MinecraftItemTypes.musicDiscStrad],
  [10, MinecraftItemTypes.musicDiscWard],
  [11, MinecraftItemTypes.musicDisc11],
  [12, MinecraftItemTypes.musicDiscWait],
  [13, MinecraftItemTypes.musicDiscPigstep],
]);

GameTest.register("RedstoneTests", "itemframe_override", (test) => {
  const itemFrameTest = new BlockLocation(3, 2, 5);
  const itemFrameOverrideNoTest = new BlockLocation(3, 2, 10);

  const lever = new BlockLocation(1, 2, 0);
  const leverOverrideTest = new BlockLocation(1, 2, 13);

  test.assertRedstonePower(itemFrameTest, 1);
  test.assertRedstonePower(itemFrameOverrideNoTest, 1);

  test.pullLever(lever);

  test.succeedWhen(() => {
    test.assertRedstonePower(leverOverrideTest, 1);
  });
})
  .tag("suite:java_parity")
  .tag(GameTest.Tags.suiteDisabled); // Torches can't be placed on item frames in Bedrock,When the bow and arrow are placed on the item frame, it cannot be linked with red stone. So I changed the location of the red stone link to bedrock

GameTest.register("RedstoneTests", "itemframe_override_bedrock", (test) => {
  const itemFrameTest = new BlockLocation(3, 2, 5);
  const itemFrameOverrideNoTest = new BlockLocation(2, 2, 10);

  const lever = new BlockLocation(1, 2, 0);
  const leverOverrideTest = new BlockLocation(0, 2, 13);

  test
    .startSequence()
    .thenIdle(3)
    .thenExecute(() => {
      test.assertRedstonePower(itemFrameTest, 1);
      test.assertRedstonePower(itemFrameOverrideNoTest, 1);
    })
    .thenExecute(() => {
      test.pullLever(lever);
    })
    .thenIdle(10)
    .thenExecute(() => {
      test.assertRedstonePower(leverOverrideTest, 3);
    })
    .thenSucceed();
}).tag(GameTest.Tags.suiteDefault);

GameTest.register("RedstoneTests", "comparator_container", (test) => {
  const aLeft = new BlockLocation(6, 2, 2);
  const aRight = new BlockLocation(1, 2, 2);

  test.assertRedstonePower(aLeft, 14);
  test.assertRedstonePower(aRight, 15);

  const bLeft = new BlockLocation(6, 2, 7);
  const bRight = new BlockLocation(1, 2, 7);

  test.assertRedstonePower(bLeft, 0);
  test.assertRedstonePower(bRight, 15);

  const cLeft = new BlockLocation(6, 2, 13);
  const cRight = new BlockLocation(1, 2, 13);
  test.assertRedstonePower(cLeft, 1);
  test.assertRedstonePower(cRight, 15);

  test.succeed();
})
  .tag("suite:java_parity")
  .tag(GameTest.Tags.suiteDisabled); // In the bedrock version, the chest is next to the square, causing the red stone signal to fail to transmit

GameTest.register("RedstoneTests", "comparator_container_bedrock", (test) => {
  const aLeft = new BlockLocation(6, 2, 2);
  const aRight = new BlockLocation(1, 2, 2);
  const bLeft = new BlockLocation(6, 2, 7);
  const bRight = new BlockLocation(1, 2, 7);
  const cLeft = new BlockLocation(6, 2, 13);
  const cRight = new BlockLocation(1, 2, 13);

  test.succeedWhen(() => {
    test.assertRedstonePower(aLeft, 14);
    test.assertRedstonePower(aRight, 15);
    test.assertRedstonePower(bLeft, 0);
    test.assertRedstonePower(bRight, 0);
    test.assertRedstonePower(cLeft, 0);
    test.assertRedstonePower(cRight, 0);
  });
})
  .structureName("RedstoneTests:comparator_container")
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("RedstoneTests", "wireredirect_nonconductor", (test) => {
  const testEx = new GameTestExtensions(test);
  const levers = [new BlockLocation(3, 2, 0), new BlockLocation(1, 2, 0)];
  const fenceGatesClosed = [
    new BlockLocation(2, 3, 0),
    new BlockLocation(2, 3, 2),
    new BlockLocation(1, 2, 2),
    new BlockLocation(2, 2, 2),
    new BlockLocation(3, 2, 2),
    new BlockLocation(0, 2, 1),
    new BlockLocation(4, 2, 1),
  ];
  const fenceGatesOpen = [new BlockLocation(3, 3, 1), new BlockLocation(1, 3, 1)];

  test
    .startSequence()
    .thenExecute(() => {
      for (const lever of levers) {
        test.pullLever(lever);
      }
      for (const fenceGateC of fenceGatesClosed) {
        testEx.assertBlockProperty("open_bit", 0, fenceGateC);
      }
      for (const fenceGateO of fenceGatesOpen) {
        testEx.assertBlockProperty("open_bit", 1, fenceGateO);
      }
    })
    .thenSucceed();
})
  .tag("suite:java_parity")
  .tag(GameTest.Tags.suiteDisabled); // There is no way to judge the opening and closing state of the fence door, so in is used in open_bit

GameTest.register("RedstoneTests", "wireredirect_nonconductor_bedrock", (test) => {
  const testEx = new GameTestExtensions(test);
  const levers = [new BlockLocation(3, 2, 0), new BlockLocation(1, 2, 0)];
  const fenceGatesClosed = [
    new BlockLocation(2, 3, 0),
    new BlockLocation(2, 3, 2),
    new BlockLocation(1, 2, 2),
    new BlockLocation(2, 2, 2),
    new BlockLocation(3, 2, 2),
    new BlockLocation(0, 2, 1),
    new BlockLocation(4, 2, 1),
  ];
  const fenceGatesOpen = [new BlockLocation(3, 3, 1), new BlockLocation(1, 3, 1)];

  test
    .startSequence()
    .thenIdle(2)
    .thenExecute(() => {
      for (const lever of levers) {
        test.pullLever(lever);
      }
    })
    .thenIdle(6)
    .thenExecute(() => {
      for (const fenceGateC of fenceGatesClosed) {
        testEx.assertBlockProperty("open_bit", 0, fenceGateC);
      }
    })
    .thenExecute(() => {
      for (const fenceGateO of fenceGatesOpen) {
        testEx.assertBlockProperty("open_bit", 1, fenceGateO);
      }
    })
    .thenSucceed();
}).tag(GameTest.Tags.suiteDefault);

GameTest.register("RedstoneTests", "repeater_regeneration", (test) => {
  const testEx = new GameTestExtensions(test);
  const input = new BlockLocation(0, 2, 0);
  const inactiveOutput = new BlockLocation(6, 3, 4);
  const activeOutput = new BlockLocation(6, 3, 3);

  test.setBlockType(MinecraftBlockTypes.redstoneBlock, input);
  test.succeedWhen(() => {
    testEx.assertBlockProperty("open_bit", 0, inactiveOutput);
    testEx.assertBlockProperty("open_bit", 1, activeOutput);
  });
}).tag(GameTest.Tags.suiteDefault);

GameTest.register("RedstoneTests", "repeater_lock", (test) => {
  const testEx = new GameTestExtensions(test);
  const input = new BlockLocation(0, 2, 2);
  const lock = new BlockLocation(1, 2, 0);
  const output = new BlockLocation(2, 2, 1);

  test.setBlockType(MinecraftBlockTypes.redstoneBlock, input);

  test
    .startSequence()
    .thenIdle(6)
    .thenExecute(() => {
      testEx.assertBlockProperty("open_bit", 1, output);
    })
    .thenExecute(() => {
      test.setBlockType(MinecraftBlockTypes.redstoneBlock, lock);
      test.setBlockType(MinecraftBlockTypes.air, input);
      testEx.assertBlockProperty("open_bit", 1, output);
    })
    .thenExecuteAfter(2, () => {
      test.setBlockType(MinecraftBlockTypes.air, lock);
    })
    .thenIdle(4)
    .thenExecute(() => {
      testEx.assertBlockProperty("open_bit", 0, output);
    })
    .thenSucceed();
}).tag(GameTest.Tags.suiteDefault);

GameTest.register("RedstoneTests", "torch_monostable", (test) => {
  const testEx = new GameTestExtensions(test);
  const input = new BlockLocation(0, 2, 0);
  const output = new BlockLocation(2, 2, 1);

  test.pressButton(input);
  test
    .startSequence()
    .thenWaitAfter(2, () => {
      testEx.assertBlockProperty("open_bit", 0, output);
    })
    .thenWaitAfter(2, () => {
      testEx.assertBlockProperty("open_bit", 1, output);
    })
    .thenExecute(() => {
      test.failIf(() => {
        testEx.assertBlockProperty("open_bit", 0, output);
      });
    })
    .thenWait(() => {
      testEx.assertBlockProperty("button_pressed_bit", 0, input);
    })
    .thenSucceed();
})
  .tag("suite:java_parity")
  .tag(GameTest.Tags.suiteDisabled); // there are tick delay differences between Java and Bedrock.

GameTest.register("RedstoneTests", "torch_monostable_bedrock", (test) => {
  const testEx = new GameTestExtensions(test);
  const input = new BlockLocation(0, 2, 0);
  const output = new BlockLocation(2, 2, 1);

  test.pressButton(input);

  test
    .startSequence()
    .thenWait(() => {
      testEx.assertBlockProperty("open_bit", 0, output);
    })
    .thenWait(() => {
      testEx.assertBlockProperty("open_bit", 1, output);
    })
    .thenExecute(() => {
      test.failIf(() => {
        testEx.assertBlockProperty("open_bit", 0, output);
      });
    })
    .thenWait(() => {
      testEx.assertBlockProperty("button_pressed_bit", 0, input);
    })
    .thenSucceed();
})
  .setupTicks(2)
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("RedstoneTests", "wire_redirect", (test) => {
  const testEx = new GameTestExtensions(test);
  const levers = [new BlockLocation(6, 2, 1), new BlockLocation(3, 2, 0), new BlockLocation(0, 2, 1)];
  const wires = [new BlockLocation(5, 2, 4), new BlockLocation(3, 2, 4), new BlockLocation(1, 2, 4)];
  const fenceGates = [
    new BlockLocation(5, 3, 1),
    new BlockLocation(5, 3, 3),
    new BlockLocation(3, 3, 1),
    new BlockLocation(3, 3, 3),
    new BlockLocation(1, 3, 1),
    new BlockLocation(1, 3, 3),
  ];

  test
    .startSequence()
    .thenExecute(() => {
      for (const lever of levers) {
        test.pullLever(lever);
      }
    })
    .thenIdle(6)
    .thenExecute(() => {
      for (const wire of wires) {
        test.assertRedstonePower(wire, 0);
      }
    })
    .thenExecute(() => {
      for (const fenceGate of fenceGates) {
        testEx.assertBlockProperty("in_wall_bit", 0, fenceGate);
      }
    })
    .thenSucceed();
})
  .tag("suite:java_parity")
  .tag(GameTest.Tags.suiteDisabled); //Floating fence gates are powered differently

GameTest.register("RedstoneTests", "wire_redirect_bedrock", (test) => {
  const testEx = new GameTestExtensions(test);
  const levers = [new BlockLocation(6, 2, 1), new BlockLocation(3, 2, 0), new BlockLocation(0, 2, 1)];
  const wires = [new BlockLocation(5, 2, 4), new BlockLocation(3, 2, 4), new BlockLocation(1, 2, 4)];
  const fenceGates = [
    new BlockLocation(5, 3, 1),
    new BlockLocation(5, 3, 3),
    new BlockLocation(3, 3, 1),
    new BlockLocation(3, 3, 3),
    new BlockLocation(1, 3, 1),
    new BlockLocation(1, 3, 3),
  ];

  test
    .startSequence()
    .thenExecute(() => {
      for (const lever of levers) {
        test.pullLever(lever);
      }
    })
    .thenIdle(6)
    .thenExecute(() => {
      for (const wire of wires) {
        test.assertRedstonePower(wire, 0);
      }
    })
    .thenExecute(() => {
      for (const fenceGate of fenceGates) {
        testEx.assertBlockProperty("in_wall_bit", 0, fenceGate);
      }
    })
    .thenSucceed();
}).tag(GameTest.Tags.suiteDefault);

let observerClock = (test, initialOpenBit) => {
  const testEx = new GameTestExtensions(test);
  const outputPos = new BlockLocation(2, 2, 0);

  const blockPermutation = MinecraftBlockTypes.trapdoor.createDefaultBlockPermutation();
  blockPermutation.getProperty(BlockProperties.openBit).value = initialOpenBit;

  test.setBlockPermutation(blockPermutation, outputPos);

  let sequence = test.startSequence();

  sequence.thenWait(() => {
    testEx.assertBlockProperty("open_bit", 1, outputPos);
  });

  for (let i = 0; i < 8; i++) {
    sequence
      .thenWait(() => {
        testEx.assertBlockProperty("open_bit", 0, outputPos);
      })
      .thenWait(() => {
        testEx.assertBlockProperty("open_bit", 1, outputPos);
      });
  }
  sequence.thenSucceed();
};

GameTest.register("RedstoneTests", "observer_clock", (test) => observerClock(test, false))
  .tag("suite:java_parity") // Trapdoors do not always flip open from observer redstone signal when starting closed
  .tag(GameTest.Tags.suiteDisabled);

GameTest.register("RedstoneTests", "observer_clock_bedrock", (test) => observerClock(test, true))
  .structureName("RedstoneTests:observer_clock")
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("RedstoneTests", "repeater_delay_lines", (test) => {
  const inputPos = new BlockLocation(0, 2, 0);

  const linesPos = [
    [new BlockLocation(4, 2, 1), new BlockLocation(4, 2, 2), new BlockLocation(4, 2, 3), new BlockLocation(4, 2, 4)], //4-tick delay
    [new BlockLocation(3, 2, 1), new BlockLocation(3, 2, 2), new BlockLocation(3, 2, 3), new BlockLocation(3, 2, 4)], //3-tick delay
    [new BlockLocation(2, 2, 1), new BlockLocation(2, 2, 2), new BlockLocation(2, 2, 3), new BlockLocation(2, 2, 4)], //2-tick delay
    [new BlockLocation(1, 2, 1), new BlockLocation(1, 2, 2), new BlockLocation(1, 2, 3), new BlockLocation(1, 2, 4)], //1-tick delay
  ];

  const states = [
    "XXX0",
    "XX01",
    "X002",
    "0013",
    "001X",
    "012X",
    null,
    "113X",
    "123X",
    "12XX",
    null,
    "23XX",
    null,
    null,
    "2XXX",
    "3XXX",
    null,
    null,
    null,
    "XXXX",
  ];

  test.pulseRedstone(inputPos, 3);
  const dimension = test.getDimension();

  let sequence = test.startSequence();
  for (const state of states) {
    if (state == null) {
      sequence = sequence.thenIdle(2);
    } else {
      sequence = sequence.thenWaitAfter(2, () => {
        for (let line = 0; line < 4; line++) {
          const expected = state.charAt(line);
          const expectedPos = expected == "X" ? -1 : expected - "0";
          for (let linePos = 0; linePos < 4; linePos++) {
            const blockWorldPos = test.worldBlockLocation(linesPos[line][linePos]);
            const block = dimension.getBlock(blockWorldPos);
            const blockId = block.id;

            if (linePos == expectedPos) {
              test.assert(
                blockId == "minecraft:powered_repeater",
                "Unexpected Block State. Expected: powered. Actual: unpowered"
              );
            } else {
              test.assert(
                blockId == "minecraft:unpowered_repeater",
                "Unexpected Block State. Expected: unpowered. Actual: powered"
              );
            }
          }
        }
      });
    }
  }
  sequence.thenSucceed();
})
  .tag("suite:java_parity")
  .tag(GameTest.Tags.suiteDisabled); //The speed of the redstone pulse is different between Java and Bedrock.

GameTest.register("RedstoneTests", "repeater_delay_lines_bedrock", (test) => {
  const inputPos = new BlockLocation(0, 2, 0);

  const linesPos = [
    [new BlockLocation(4, 2, 1), new BlockLocation(4, 2, 2), new BlockLocation(4, 2, 3), new BlockLocation(4, 2, 4)], //4-tick delay
    [new BlockLocation(3, 2, 1), new BlockLocation(3, 2, 2), new BlockLocation(3, 2, 3), new BlockLocation(3, 2, 4)], //3-tick delay
    [new BlockLocation(2, 2, 1), new BlockLocation(2, 2, 2), new BlockLocation(2, 2, 3), new BlockLocation(2, 2, 4)], //2-tick delay
    [new BlockLocation(1, 2, 1), new BlockLocation(1, 2, 2), new BlockLocation(1, 2, 3), new BlockLocation(1, 2, 4)], //1-tick delay
  ];

  const states = [
    "XXX0",
    "XX01",
    "X002",
    "0013",
    "001X",
    "012X",
    null,
    "113X",
    "123X",
    "12XX",
    null,
    "23XX",
    null,
    null,
    "2XXX",
    "3XXX",
    null,
    null,
    null,
    "XXXX",
  ];

  test.pulseRedstone(inputPos, 3); //Change redstone pulse form 2 ticks to 3.
  const dimension = test.getDimension();

  let sequence = test.startSequence();
  for (const state of states) {
    if (state == null) {
      sequence = sequence.thenIdle(2);
    } else {
      sequence = sequence.thenWait(() => {
        for (let line = 0; line < 4; line++) {
          const expected = state.charAt(line);
          const expectedPos = expected == "X" ? -1 : expected - "0";
          for (let linePos = 0; linePos < 4; linePos++) {
            const blockWorldPos = test.worldBlockLocation(linesPos[line][linePos]);
            const block = dimension.getBlock(blockWorldPos);
            const blockPerm = block.permutation;
            const blockType = blockPerm.type;

            if (linePos == expectedPos) {
              test.assert(
                blockType.id == "minecraft:powered_repeater",
                "Unexpected Block State. Expected: powered. Actual: unpowered"
              );
            } else {
              test.assert(
                blockType.id == "minecraft:unpowered_repeater",
                "Unexpected Block State. Expected: unpowered. Actual: powered"
              );
            }
          }
        }
      });
    }
  }
  sequence.thenSucceed();
})
  .structureName("RedstoneTests:repeater_delay_lines")
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("RedstoneTests", "repeater_clock", (test) => {
  const testEx = new GameTestExtensions(test);
  const startPos = new BlockLocation(0, 4, 0);
  const stagesPos = [
    new BlockLocation(0, 1, 0),
    new BlockLocation(2, 1, 0),
    new BlockLocation(2, 1, 2),
    new BlockLocation(0, 1, 2),
  ];

  test.pulseRedstone(startPos, 3);

  let sequence = test.startSequence();
  for (let i = 0; i < 32; i++) {
    const active = i % 4;
    sequence = sequence.thenWaitAfter(i == 0 ? 0 : 2, () => {
      for (let b = 0; b < 4; b++) {
        testEx.assertBlockProperty("open_bit", b == active ? 1 : 0, stagesPos[b]);
      }
    });
  }
  sequence.thenSucceed();
})
  .tag("suite:java_parity")
  .tag(GameTest.Tags.suiteDisabled); //The speed of the redstone pulse is different between Java and Bedrock.

GameTest.register("RedstoneTests", "repeater_clock_bedrock", (test) => {
  const testEx = new GameTestExtensions(test);
  const startPos = new BlockLocation(0, 4, 0);
  const stagesPos = [
    new BlockLocation(0, 1, 0),
    new BlockLocation(2, 1, 0),
    new BlockLocation(2, 1, 2),
    new BlockLocation(0, 1, 2),
  ];

  test.pulseRedstone(startPos, 3); //Change redstone pulse form 2 ticks to 3.

  let sequence = test.startSequence();
  for (let i = 0; i < 32; i++) {
    const active = i % 4;
    sequence = sequence.thenWait(() => {
      for (let b = 0; b < 4; b++) {
        testEx.assertBlockProperty("open_bit", b == active ? 1 : 0, stagesPos[b]);
      }
    });
  }
  sequence.thenSucceed();
})
  .structureName("RedstoneTests:repeater_clock")
  .maxTicks(80)
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("RedstoneTests", "torch_nor", async (test) => {
  const testEx = new GameTestExtensions(test);
  const inputA = new BlockLocation(4, 2, 0);
  const inputB = new BlockLocation(0, 2, 0);
  const output = new BlockLocation(2, 3, 0);
  const FlatNorthSouth = 0;
  const FlatEastWest = 1;

  test.pullLever(inputA);
  await test.idle(1);
  await test.until(() => {
      testEx.assertBlockProperty("open_bit", FlatEastWest, output);
  });
  
  test.pullLever(inputA);
  await test.idle(1);
  await test.until(() => {
      testEx.assertBlockProperty("open_bit", FlatEastWest, output);
  });
      
  test.pullLever(inputB);
  await test.idle(1);
  await test.until(() => {
      testEx.assertBlockProperty("open_bit", FlatNorthSouth, output);
  });
        
  test.pullLever(inputB);
  await test.idle(1);
  await test.until(() => {
      testEx.assertBlockProperty("open_bit", FlatEastWest, output);
  });
  
  test.pullLever(inputA);
  await test.idle(1);
  test.pullLever(inputB);
  await test.idle(1);
  await test.until(() => {
      testEx.assertBlockProperty("open_bit", FlatNorthSouth, output);
  });
  
  test.pullLever(inputA);
  await test.idle(1);
  test.pullLever(inputB);    
  await test.idle(1)
  await test.until(() => {
      testEx.assertBlockProperty("open_bit", FlatEastWest, output);
  })
  
  test.succeed();
}).tag(GameTest.Tags.suiteDisabled); // test has 50% pass rate due to "timing" issues.

GameTest.register("RedstoneTests", "rs_latch", (test) => {
  const testEx = new GameTestExtensions(test);
  const r = new BlockLocation(1, 2, 0);
  const s = new BlockLocation(2, 2, 5);

  const q = new BlockLocation(0, 4, 2);
  const notQ = new BlockLocation(3, 4, 3);

  test
    .startSequence()
    .thenExecute(() => test.pulseRedstone(r, 2))
    .thenIdle(4)
    .thenWait(() => {
      testEx.assertBlockProperty("open_bit", 1, q);
      testEx.assertBlockProperty("open_bit", 0, notQ);
    })
    .thenExecute(() => test.pulseRedstone(r, 2))
    .thenExecuteAfter(4, () => {
      testEx.assertBlockProperty("open_bit", 1, q);
      testEx.assertBlockProperty("open_bit", 0, notQ);
    })

    .thenExecute(() => test.pulseRedstone(s, 2))
    .thenIdle(4)
    .thenWait(() => {
      testEx.assertBlockProperty("open_bit", 0, q);
      testEx.assertBlockProperty("open_bit", 1, notQ);
    })

    .thenExecute(() => test.pulseRedstone(s, 2))
    .thenExecuteAfter(4, () => {
      testEx.assertBlockProperty("open_bit", 0, q);
      testEx.assertBlockProperty("open_bit", 1, notQ);
    })
    .thenSucceed();
})
  .tag("suite:java_parity")
  .tag(GameTest.Tags.suiteDisabled); // Redstone timing inconsistencies between java and bedrock.

GameTest.register("RedstoneTests", "rs_latch_bedrock", (test) => {
  const testEx = new GameTestExtensions(test);
  const r = new BlockLocation(1, 2, 0);
  const s = new BlockLocation(2, 2, 5);

  const q = new BlockLocation(0, 4, 2);
  const notQ = new BlockLocation(3, 4, 3);

  test
    .startSequence()
    .thenIdle(2)
    .thenExecute(() => test.pulseRedstone(r, 4))
    .thenIdle(6)
    .thenWait(() => {
      testEx.assertBlockProperty("open_bit", 0, q);
      testEx.assertBlockProperty("open_bit", 1, notQ);
    })
    .thenExecute(() => test.pulseRedstone(r, 4))
    .thenExecuteAfter(6, () => {
      testEx.assertBlockProperty("open_bit", 0, q);
      testEx.assertBlockProperty("open_bit", 1, notQ);
    })

    .thenExecute(() => test.pulseRedstone(s, 4))
    .thenIdle(6)
    .thenWait(() => {
      testEx.assertBlockProperty("open_bit", 1, q);
      testEx.assertBlockProperty("open_bit", 0, notQ);
    })

    .thenExecute(() => test.pulseRedstone(s, 4))
    .thenExecuteAfter(6, () => {
      testEx.assertBlockProperty("open_bit", 1, q);
      testEx.assertBlockProperty("open_bit", 0, notQ);
    })
    .thenSucceed();
}).tag(GameTest.Tags.suiteDefault);

GameTest.register("RedstoneTests", "repeater_delay", (test) => {
  test.setBlockType(MinecraftBlockTypes.stone, new BlockLocation(0, 2, 5));

  const lamp1 = new BlockLocation(1, 2, 0);
  const lamp2 = new BlockLocation(3, 2, 0);

  test
    .startSequence()
    .thenWait(() => {
      test.assertRedstonePower(lamp1, 15);
    })
    .thenExecute(() => {
      test.assertRedstonePower(lamp2, 15);
    })
    .thenWait(() => {
      test.assertRedstonePower(lamp1, 0);
    })
    .thenExecute(() => {
      test.assertRedstonePower(lamp2, 0);
    })
    .thenSucceed();
})
  .maxTicks(TicksPerSecond * 10)
  .tag("suite:java_parity")
  .tag(GameTest.Tags.suiteDisabled); //The ticks of Redstone repeater is too short in structure, causing the Redstone lamp will not go out.

GameTest.register("RedstoneTests", "repeater_delay_bedrock", (test) => {
  test.setBlockType(MinecraftBlockTypes.stone, new BlockLocation(0, 2, 5));

  const lamp1 = new BlockLocation(1, 2, 0);
  const lamp2 = new BlockLocation(3, 2, 0);

  test
    .startSequence()
    .thenWait(() => {
      test.assertRedstonePower(lamp1, 15);
    })
    .thenExecute(() => {
      test.assertRedstonePower(lamp2, 15);
    })
    .thenWait(() => {
      test.assertRedstonePower(lamp1, 0);
    })
    .thenExecute(() => {
      test.assertRedstonePower(lamp2, 0);
    })
    .thenSucceed();
})
  .maxTicks(TicksPerSecond * 10)
  .tag(GameTest.Tags.suiteDefault); //Change the ticks of Redstone repeater to the longest in structure.

function distManhattan(pos, loc) {
  const xd = Math.abs(pos.x - loc.x);
  const yd = Math.abs(pos.y - loc.y);
  const zd = Math.abs(pos.z - loc.z);

  return xd + yd + zd;
}

GameTest.register("RedstoneTests", "dust_loop_depowering", (test) => {
  const source = new BlockLocation(2, 2, 0);
  const input = new BlockLocation(2, 2, 1);
  const pointA = new BlockLocation(4, 2, 1);
  const pointB = new BlockLocation(0, 2, 16);
  const pointC = new BlockLocation(4, 2, 1);
  const pointD = new BlockLocation(0, 2, 16);

  test.setBlockType(MinecraftBlockTypes.redstoneBlock, source);

  pointA.blocksBetween(pointB).forEach((p) => {
    test.assertRedstonePower(p, Math.max(0, 15 - distManhattan(p, input)));
  });

  test.setBlockType(MinecraftBlockTypes.air, source);

  test.succeedWhen(() => {
    pointC.blocksBetween(pointD).forEach((p) => {
      test.assertRedstonePower(p, 0);
    });
  });
})
  .tag("suite:java_parity")
  .tag(GameTest.Tags.suiteDisabled); //In Java the redstone signal is sent as soon as the redstone block is placed but in Bedrock it need to take a tick or two

GameTest.register("RedstoneTests", "dust_loop_depowering_bedrock", (test) => {
  const source = new BlockLocation(2, 2, 0);
  const input = new BlockLocation(2, 2, 1);
  const pointA = new BlockLocation(4, 2, 1);
  const pointB = new BlockLocation(0, 2, 16);
  const pointC = new BlockLocation(4, 2, 1);
  const pointD = new BlockLocation(0, 2, 16);

  test.setBlockType(MinecraftBlockTypes.redstoneBlock, source);

  test.runAfterDelay(2, () => {
    pointA.blocksBetween(pointB).forEach((p) => {
      test.assertRedstonePower(p, Math.max(0, 15 - distManhattan(p, input)));
    });
  });

  test.setBlockType(MinecraftBlockTypes.air, source);

  test.succeedWhen(() => {
    pointC.blocksBetween(pointD).forEach((p) => {
      test.assertRedstonePower(p, 0);
    });
  });
}).tag(GameTest.Tags.suiteDefault);

GameTest.register("RedstoneTests", "lever_power", (test) => {
  const powered = [
    new BlockLocation(1, 2, 0),
    new BlockLocation(1, 2, 3),

    new BlockLocation(2, 2, 1),
    new BlockLocation(2, 2, 2),

    new BlockLocation(0, 2, 1),
    new BlockLocation(0, 2, 2),

    new BlockLocation(1, 3, 1),
    new BlockLocation(1, 3, 2),

    new BlockLocation(1, 1, 1),
    new BlockLocation(1, 1, 2),

    new BlockLocation(1, 2, 2),
  ];

  const leverPos = new BlockLocation(1, 2, 1);
  test.pullLever(leverPos);

  const pointA = new BlockLocation(0, 1, 0);
  const pointB = new BlockLocation(2, 3, 3);

  test.succeedIf(() => {
    pointA
      .blocksBetween(pointB)
      .filter((p) => !p.equals(leverPos))
      .forEach((p) => test.assertRedstonePower(p, powered.includes(p) ? 15 : 0));
  });
}).tag(GameTest.Tags.suiteDefault);

GameTest.register("RedstoneTests", "dust_propagation", (test) => {
  let levels = new Map();
  const origin = new BlockLocation(2, 2, 1);

  {
    origin
      .blocksBetween(new BlockLocation(2, 2, 17))
      .forEach((p) => levels.set(p, Math.max(15 - distManhattan(origin, p), 0)));
  }

  {
    levels.set(new BlockLocation(3, 2, 2), 13);
    levels.set(new BlockLocation(3, 2, 9), 6);
    const leftRoot = new BlockLocation(4, 2, 2);
    leftRoot
      .blocksBetween(new BlockLocation(4, 2, 14))
      .forEach((p) => levels.set(p, Math.max(12 - distManhattan(leftRoot, p), 0)));
  }

  {
    levels.set(new BlockLocation(1, 2, 3), 12);
    const rightRoot = new BlockLocation(0, 2, 3);
    rightRoot
      .blocksBetween(new BlockLocation(0, 2, 14))
      .forEach((p) => levels.set(p, Math.max(11 - distManhattan(rightRoot, p), 0)));
  }

  const source = new BlockLocation(2, 2, 0);
  test.setBlockType(MinecraftBlockTypes.redstoneBlock, source);

  for (let [pos, level] of levels) {
    test.assertRedstonePower(pos, level);
  }

  test.setBlockType(MinecraftBlockTypes.air, source);

  test.succeedIf(() => {
    for (let pos of levels.keys()) {
      test.assertRedstonePower(pos, 0);
    }
  });
})
  .tag("suite:java_parity")
  .tag(GameTest.Tags.suiteDisabled); //In Java the redstone signal is sent as soon as the redstone block is placed but in Bedrock it need to take a tick or two

GameTest.register("RedstoneTests", "dust_propagation_bedrock", (test) => {
  let levels = new Map();
  const origin = new BlockLocation(2, 2, 1);

  {
    origin
      .blocksBetween(new BlockLocation(2, 2, 17))
      .forEach((p) => levels.set(p, Math.max(15 - distManhattan(origin, p), 0)));
  }

  {
    levels.set(new BlockLocation(3, 2, 2), 13);
    levels.set(new BlockLocation(3, 2, 9), 6);
    const leftRoot = new BlockLocation(4, 2, 2);
    leftRoot
      .blocksBetween(new BlockLocation(4, 2, 14))
      .forEach((p) => levels.set(p, Math.max(12 - distManhattan(leftRoot, p), 0)));
  }

  {
    levels.set(new BlockLocation(1, 2, 3), 12);
    const rightRoot = new BlockLocation(0, 2, 3);
    rightRoot
      .blocksBetween(new BlockLocation(0, 2, 14))
      .forEach((p) => levels.set(p, Math.max(11 - distManhattan(rightRoot, p), 0)));
  }

  const source = new BlockLocation(2, 2, 0);
  test.setBlockType(MinecraftBlockTypes.redstoneBlock, source);

  test.runAfterDelay(2, () => {
    for (let [pos, level] of levels) {
      test.assertRedstonePower(pos, level);
    }
  });

  test.setBlockType(MinecraftBlockTypes.air, source);

  test.succeedIf(() => {
    for (let pos of levels.keys()) {
      test.assertRedstonePower(pos, 0);
    }
  });
}).tag(GameTest.Tags.suiteDefault);

GameTest.register("RedstoneTests", "torch_nand", (test) => {
  const testEx = new GameTestExtensions(test);
  const inputA = new BlockLocation(4, 2, 0);
  const inputB = new BlockLocation(0, 2, 0);
  const output = new BlockLocation(2, 2, 4);

  test
    .startSequence()
    .thenExecute(() => test.pullLever(inputA))
    .thenIdle(2)
    .thenExecute(() => testEx.assertBlockProperty("open_bit", 1, output))
    .thenExecuteAfter(2, () => test.pullLever(inputA))

    .thenExecuteAfter(2, () => test.pullLever(inputB))
    .thenIdle(2)
    .thenExecute(() => testEx.assertBlockProperty("open_bit", 1, output))
    .thenExecuteAfter(2, () => test.pullLever(inputB))

    .thenExecuteAfter(2, () => {
      test.pullLever(inputA);
      test.pullLever(inputB);
    })
    .thenIdle(4)
    .thenExecute(() => testEx.assertBlockProperty("open_bit", 0, output))
    .thenSucceed();
}).tag(GameTest.Tags.suiteDefault);

GameTest.register("RedstoneTests", "comparator_logic", (test) => {
  const mainInput = new BlockLocation(3, 2, 2);
  const sideInput = new BlockLocation(1, 2, 0);
  const output = new BlockLocation(0, 2, 2);

  const mainMusicPlayerComp = test.getBlock(mainInput).getComponent("recordPlayer");
  const sideMusicPlayerComp = test.getBlock(sideInput).getComponent("recordPlayer");

  let sequence = test.startSequence();
  for (const [mainLevel, mainRecord] of LEVEL_TO_RECORDS) {
    for (const [sideLevel, sideRecord] of LEVEL_TO_RECORDS) {
      let value = mainLevel >= sideLevel ? mainLevel : 0;
      sequence = sequence
        .thenExecute(() => {
          if (mainLevel == 0) {
            mainMusicPlayerComp.clearRecord();
          } else {
            mainMusicPlayerComp.setRecord(mainRecord);
          }
          if (sideLevel == 0) {
            sideMusicPlayerComp.clearRecord();
          } else {
            sideMusicPlayerComp.setRecord(sideRecord);
          }
        })
        .thenWaitAfter(4, () => {
          test.assertRedstonePower(output, value);
        });
    }
  }
  sequence.thenSucceed();
})
  .maxTicks(TicksPerSecond * 60)
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("RedstoneTests", "subtractor_logic", (test) => {
  const mainInput = new BlockLocation(3, 2, 2);
  const sideInput = new BlockLocation(1, 2, 0);
  const output = new BlockLocation(0, 2, 2);

  const mainMusicPlayerComp = test.getBlock(mainInput).getComponent("recordPlayer");
  const sideMusicPlayerComp = test.getBlock(sideInput).getComponent("recordPlayer");

  let sequence = test.startSequence();
  for (const [mainLevel, mainRecord] of LEVEL_TO_RECORDS) {
    for (const [sideLevel, sideRecord] of LEVEL_TO_RECORDS) {
      let value = Math.max(mainLevel - sideLevel, 0);
      sequence = sequence
        .thenExecute(() => {
          if (mainLevel == 0) {
            mainMusicPlayerComp.clearRecord();
          } else {
            mainMusicPlayerComp.setRecord(mainRecord);
          }
          if (sideLevel == 0) {
            sideMusicPlayerComp.clearRecord();
          } else {
            sideMusicPlayerComp.setRecord(sideRecord);
          }
        })
        .thenWaitAfter(3, () => {
          test.assertRedstonePower(output, value);
        });
    }
  }
  sequence.thenSucceed();
})
  .maxTicks(TicksPerSecond * 60)
  .tag(GameTest.Tags.suiteDefault);

// SIG // Begin signature block
// SIG // MIInsQYJKoZIhvcNAQcCoIInojCCJ54CAQExDzANBglg
// SIG // hkgBZQMEAgEFADB3BgorBgEEAYI3AgEEoGkwZzAyBgor
// SIG // BgEEAYI3AgEeMCQCAQEEEBDgyQbOONQRoqMAEEvTUJAC
// SIG // AQACAQACAQACAQACAQAwMTANBglghkgBZQMEAgEFAAQg
// SIG // THZL5PBJJIZAre4X6Gsew80U5cuA+ylmrGxUSke/DFqg
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
// SIG // ARUwLwYJKoZIhvcNAQkEMSIEILKwx10RlTobDJconi37
// SIG // FDrrF0fR/Mnb6jBIilJ77cXOMFQGCisGAQQBgjcCAQwx
// SIG // RjBEoCSAIgBNAGkAbgBlAGMAcgBhAGYAdAAgAEIAZQBk
// SIG // AHIAbwBjAGuhHIAaaHR0cHM6Ly93d3cubWluZWNyYWZ0
// SIG // Lm5ldC8wDQYJKoZIhvcNAQEBBQAEggEAaEEda5DogIzu
// SIG // 6ACb2ilhdi0PXRzgFYQqkNCqoKyVZ0b9lTXTED4IPjWv
// SIG // WdufhFzvH/paRMMpteC05Hyl7nCcs+ZKH6O+Jh1C1vk7
// SIG // juEfaq80p/zjiTokxn1iQwRXhCUjTlcnT5+LrMC3ppJb
// SIG // l664dCSfHaehO6e0d+hwuXmTbk+CMRkLhP9H2DY/v0IB
// SIG // tH27kZshjarNiC2UkXTGRxGBPM5H/b6kBntiof30YClO
// SIG // vE8Ghq5q6Cj8vu2/vS9fNOw59779WTTWA+5VXpbW1/zX
// SIG // N75pNrJFmSA4JMbw7OhS+gNCCyiENFsg11/u+Twom6q+
// SIG // cRpVIl91rzDTEoAb4VndnKGCFwAwghb8BgorBgEEAYI3
// SIG // AwMBMYIW7DCCFugGCSqGSIb3DQEHAqCCFtkwghbVAgED
// SIG // MQ8wDQYJYIZIAWUDBAIBBQAwggFRBgsqhkiG9w0BCRAB
// SIG // BKCCAUAEggE8MIIBOAIBAQYKKwYBBAGEWQoDATAxMA0G
// SIG // CWCGSAFlAwQCAQUABCCyprvfD09iJ1SU17j/qU7AMwgn
// SIG // 4Rqg9iBkyQDPJHv0OwIGYyNUvv6EGBMyMDIyMDkyODIz
// SIG // NTEyNC44MjJaMASAAgH0oIHQpIHNMIHKMQswCQYDVQQG
// SIG // EwJVUzETMBEGA1UECBMKV2FzaGluZ3RvbjEQMA4GA1UE
// SIG // BxMHUmVkbW9uZDEeMBwGA1UEChMVTWljcm9zb2Z0IENv
// SIG // cnBvcmF0aW9uMSUwIwYDVQQLExxNaWNyb3NvZnQgQW1l
// SIG // cmljYSBPcGVyYXRpb25zMSYwJAYDVQQLEx1UaGFsZXMg
// SIG // VFNTIEVTTjpBRTJDLUUzMkItMUFGQzElMCMGA1UEAxMc
// SIG // TWljcm9zb2Z0IFRpbWUtU3RhbXAgU2VydmljZaCCEVcw
// SIG // ggcMMIIE9KADAgECAhMzAAABlklbYuEv3fdPAAEAAAGW
// SIG // MA0GCSqGSIb3DQEBCwUAMHwxCzAJBgNVBAYTAlVTMRMw
// SIG // EQYDVQQIEwpXYXNoaW5ndG9uMRAwDgYDVQQHEwdSZWRt
// SIG // b25kMR4wHAYDVQQKExVNaWNyb3NvZnQgQ29ycG9yYXRp
// SIG // b24xJjAkBgNVBAMTHU1pY3Jvc29mdCBUaW1lLVN0YW1w
// SIG // IFBDQSAyMDEwMB4XDTIxMTIwMjE5MDUxM1oXDTIzMDIy
// SIG // ODE5MDUxM1owgcoxCzAJBgNVBAYTAlVTMRMwEQYDVQQI
// SIG // EwpXYXNoaW5ndG9uMRAwDgYDVQQHEwdSZWRtb25kMR4w
// SIG // HAYDVQQKExVNaWNyb3NvZnQgQ29ycG9yYXRpb24xJTAj
// SIG // BgNVBAsTHE1pY3Jvc29mdCBBbWVyaWNhIE9wZXJhdGlv
// SIG // bnMxJjAkBgNVBAsTHVRoYWxlcyBUU1MgRVNOOkFFMkMt
// SIG // RTMyQi0xQUZDMSUwIwYDVQQDExxNaWNyb3NvZnQgVGlt
// SIG // ZS1TdGFtcCBTZXJ2aWNlMIICIjANBgkqhkiG9w0BAQEF
// SIG // AAOCAg8AMIICCgKCAgEA0h9sEAtvrf48wOoy+i2TIQzS
// SIG // RtJ79XFKnvh+DBishIEWVMKdWLB5dSExsovCva5D0Sii
// SIG // gItJU/ING9RiIqZFnPKgrRN8Im8aDUeJgsq74BLF7rZ2
// SIG // 8SNaG8fHDH2tl4HIRv1wRmXBbRndFEL15MVGL6JHxtU8
// SIG // gTKpyGb0Ni7XJho/OpWj0TbkaHZBDO1VVDtqDEhyW2kz
// SIG // Y9W9pAAvLKpcrR9c5n60KUwN62TshJssE+Nw0X7DZV5p
// SIG // DSjIluwWnzZx2SxhxmnKYphOHaAzLq98oh/6ggsdjzuK
// SIG // SKpAOlixkjfMoWGr3EGURVbbJf8fyIri9H8TxqUJkXPO
// SIG // JuNcmrp3L3jYf+f9eDKrGe7oGNYsfH5DmICQZS7LPJsj
// SIG // 4WjAOqnBAf0VlqnAn4cgETYwnJgTRjV3jICsmf/nt2wj
// SIG // pV5lng7VSQy5jrcxAwS5pINv3rad0/YTl/i6HWMHQZGN
// SIG // p6AgxMz1lWvN+AJpCb0espxHgRo+qLlon6V8WqGwXWrG
// SIG // 9Pq//XmK/k9NMqyxZ9eq601C51c5Fu5S8l1hKLrL82J7
// SIG // pdxzwkKKEEuC2NRwSk8k0n7Rl+emYDs+0ZPnrL23K/jY
// SIG // y7wQcu13qJoJLsNRf1K7u5WfQEfhEG6YNqbwh0mqzEEB
// SIG // 239Rlz4ZQ0x8JHrJEYs+Yz4069Vs/3/vQmceaL7UxdEC
// SIG // AwEAAaOCATYwggEyMB0GA1UdDgQWBBTS3wjZLC5lrSBh
// SIG // LImLhCqa0c10sjAfBgNVHSMEGDAWgBSfpxVdAF5iXYP0
// SIG // 5dJlpxtTNRnpcjBfBgNVHR8EWDBWMFSgUqBQhk5odHRw
// SIG // Oi8vd3d3Lm1pY3Jvc29mdC5jb20vcGtpb3BzL2NybC9N
// SIG // aWNyb3NvZnQlMjBUaW1lLVN0YW1wJTIwUENBJTIwMjAx
// SIG // MCgxKS5jcmwwbAYIKwYBBQUHAQEEYDBeMFwGCCsGAQUF
// SIG // BzAChlBodHRwOi8vd3d3Lm1pY3Jvc29mdC5jb20vcGtp
// SIG // b3BzL2NlcnRzL01pY3Jvc29mdCUyMFRpbWUtU3RhbXAl
// SIG // MjBQQ0ElMjAyMDEwKDEpLmNydDAMBgNVHRMBAf8EAjAA
// SIG // MBMGA1UdJQQMMAoGCCsGAQUFBwMIMA0GCSqGSIb3DQEB
// SIG // CwUAA4ICAQCvYAsQuCFW2ClUARz+c7SXP5H4Erm3C+YU
// SIG // 0XlRNbsElSqfdkn3fyCLxYBkHMFZQGXPA7mzoU7IZUdn
// SIG // 0hXyuvrFM6DDrn/SLShe5t+PPkqWeOeYiEw8k4BI6l4U
// SIG // 5k07wX8hBwOoMRxs1aOe/JNkLHO6krl5j6/GZHrkTRzT
// SIG // sRUUJp1FpnUzixiZWyavc0x/imG5yWdrSuccE9ndoq7Q
// SIG // bu1Pxa7swsUm5zNNMunaWGXDFAnS7s8RxJ1/P3qTtZ0J
// SIG // a6VE6SeoHpdj7/hPuKJLXV/M89GNFn8HUDmVW5+YK/8D
// SIG // y7yKHHiiSd+ugAN+pW3PA6OYek0ryW1QKzbrW4P9SXAk
// SIG // +U5faXjBJoitW98+ZERWX387VHvaTWJ4Yo5BmkJ0U27A
// SIG // al2ggi5j1PYuDxB3DsofM+7ebc4zgJ0GF4u6DQW0V4rc
// SIG // /F2zytl2rDQfUGlPtNUymUZVbWJbFqw64je8QsAnMeG1
// SIG // J8ohxjYlea3iLAzGwime4dbMSyEHoObVvzIN0d9BJ84x
// SIG // VeXKvET176GhY/PS6RTJZiW5PPihZh88F3JecEvhlct/
// SIG // FbpQPt+mhDOBQAyqjI1tdBQlBFVX85xWd1JRnUkuxqsh
// SIG // XqFwcxKr8GiFsb9AV7y7TT30fmMTs3gmnojFQt3MdD5Q
// SIG // 3M/gBf1TdlhyiPNXTgJhP6iyZHfxKZi2czCCB3EwggVZ
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
// SIG // czEmMCQGA1UECxMdVGhhbGVzIFRTUyBFU046QUUyQy1F
// SIG // MzJCLTFBRkMxJTAjBgNVBAMTHE1pY3Jvc29mdCBUaW1l
// SIG // LVN0YW1wIFNlcnZpY2WiIwoBATAHBgUrDgMCGgMVAND6
// SIG // JppVWWnbirQx4Ic7QWQ35lb+oIGDMIGApH4wfDELMAkG
// SIG // A1UEBhMCVVMxEzARBgNVBAgTCldhc2hpbmd0b24xEDAO
// SIG // BgNVBAcTB1JlZG1vbmQxHjAcBgNVBAoTFU1pY3Jvc29m
// SIG // dCBDb3Jwb3JhdGlvbjEmMCQGA1UEAxMdTWljcm9zb2Z0
// SIG // IFRpbWUtU3RhbXAgUENBIDIwMTAwDQYJKoZIhvcNAQEF
// SIG // BQACBQDm3vXrMCIYDzIwMjIwOTI5MDAzMzQ3WhgPMjAy
// SIG // MjA5MzAwMDMzNDdaMHcwPQYKKwYBBAGEWQoEATEvMC0w
// SIG // CgIFAObe9esCAQAwCgIBAAICKdECAf8wBwIBAAICEb0w
// SIG // CgIFAObgR2sCAQAwNgYKKwYBBAGEWQoEAjEoMCYwDAYK
// SIG // KwYBBAGEWQoDAqAKMAgCAQACAwehIKEKMAgCAQACAwGG
// SIG // oDANBgkqhkiG9w0BAQUFAAOBgQCFasieesQV1nw7NSJ4
// SIG // t7FGAiYD+NqFsUXZJTeePmH9m8dQeML8rQnOqmx+p85S
// SIG // 5WE1hv9MY8F14lUbHGRYetKUxvVzH3DAEwydjeC+uz99
// SIG // 4iQLhO0QkGejtQMO/nDl83kCjkdSwRaXNuomlXmTHoye
// SIG // FLS5EfG2Pxy79EVz3zDtJTGCBA0wggQJAgEBMIGTMHwx
// SIG // CzAJBgNVBAYTAlVTMRMwEQYDVQQIEwpXYXNoaW5ndG9u
// SIG // MRAwDgYDVQQHEwdSZWRtb25kMR4wHAYDVQQKExVNaWNy
// SIG // b3NvZnQgQ29ycG9yYXRpb24xJjAkBgNVBAMTHU1pY3Jv
// SIG // c29mdCBUaW1lLVN0YW1wIFBDQSAyMDEwAhMzAAABlklb
// SIG // YuEv3fdPAAEAAAGWMA0GCWCGSAFlAwQCAQUAoIIBSjAa
// SIG // BgkqhkiG9w0BCQMxDQYLKoZIhvcNAQkQAQQwLwYJKoZI
// SIG // hvcNAQkEMSIEIHSV18GPnDJceg89A78Apz+DBln5tE71
// SIG // 1qkHYyqSqKjxMIH6BgsqhkiG9w0BCRACLzGB6jCB5zCB
// SIG // 5DCBvQQgdgTWAvgdNdOSdkcugn52dCQPCX5WUEOrC6Ry
// SIG // Ny2yvZAwgZgwgYCkfjB8MQswCQYDVQQGEwJVUzETMBEG
// SIG // A1UECBMKV2FzaGluZ3RvbjEQMA4GA1UEBxMHUmVkbW9u
// SIG // ZDEeMBwGA1UEChMVTWljcm9zb2Z0IENvcnBvcmF0aW9u
// SIG // MSYwJAYDVQQDEx1NaWNyb3NvZnQgVGltZS1TdGFtcCBQ
// SIG // Q0EgMjAxMAITMwAAAZZJW2LhL933TwABAAABljAiBCC8
// SIG // 7oTSBKj3gahYibi2A1gSMSrF/y/aAg+PQS1onYPdXjAN
// SIG // BgkqhkiG9w0BAQsFAASCAgAxuwDS9Auv8Yo1kqLtj0Yu
// SIG // Vin8FcuwMp8nAVE3VXE6gL402dj7BYNW6PmFL7VQa2uf
// SIG // ngRHDFOUiBobrt0/nFO8IWeVu9XjVo/nAMQzrgFQiZlt
// SIG // nL1r5eFXPqxUuqhKvZdOJ1Hc7e6InI7O+D44i0L/bTlQ
// SIG // IOLswNjLoLs2pkFDKU8YIG4gPtHK5XcFP87wkks1HcEO
// SIG // 6+Xup9mJIvXMkEhXg2eKrOEHM7CK6oJZO7kzODCqoT8N
// SIG // O3hvkKLgnevmB357w/FT2EsLfLIbDD5hJZNVAdJBSVpt
// SIG // /MUC2Tr7nbvHRumQuR1Fe1HL26zqfcWVqGL10z9DY5Ys
// SIG // J7icY13vYqvIZmTxUQBL/7K+/rtXsQ8dyNI99Zp18c0x
// SIG // nC6/d6C03g8/FiCTCti9c60t9ibvTJFdgtp54CKg7DCx
// SIG // 5ouPxVtsjoI6qZN0S6gErh9qeGXj2d30JI6Dpzv4wXIT
// SIG // 7M29hrVa6G2aJHeVdoIYEg8cMuBNA4LnNaMsqJKsERDB
// SIG // r+r4uuhEQt6y/F0g7Dy5jx5piEMCmnlHJH7DU0e/HgXq
// SIG // BoT9WTMUG412Lz1e8bYwuszoFscM0p4B9LNQSRXsAVxq
// SIG // vRmD5cny54f0txY7kHjRdR2P7fC3ABQM39magFsxLrns
// SIG // tRO0I7u+Q1lOrfRT7TpsYStpG3e33Q8cJCcyqNAApvWOWA==
// SIG // End signature block
