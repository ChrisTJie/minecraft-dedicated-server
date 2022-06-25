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

GameTest.register("RedstoneTests", "torch_nor", (test) => {
  const testEx = new GameTestExtensions(test);
  const inputA = new BlockLocation(4, 2, 0);
  const inputB = new BlockLocation(0, 2, 0);
  const output = new BlockLocation(2, 3, 0);
  const FlatNorthSouth = 0;
  const FlatEastWest = 1;

  test
    .startSequence()
    .thenExecute(() => test.pullLever(inputA))
    .thenIdle(2)
    .thenWait(() => {
      testEx.assertBlockProperty("open_bit", FlatEastWest, output);
    })
    .thenExecute(() => test.pullLever(inputA))
    .thenIdle(2)
    .thenWait(() => {
      testEx.assertBlockProperty("open_bit", FlatEastWest, output);
    })

    .thenExecute(() => test.pullLever(inputB))
    .thenIdle(2)
    .thenWait(() => {
      testEx.assertBlockProperty("open_bit", FlatNorthSouth, output);
    })
    .thenExecute(() => test.pullLever(inputB))
    .thenIdle(2)
    .thenWait(() => {
      testEx.assertBlockProperty("open_bit", FlatEastWest, output);
    })

    .thenExecute(() => {
      test.pullLever(inputA);
      test.pullLever(inputB);
    })

    .thenIdle(2)
    .thenWait(() => {
      testEx.assertBlockProperty("open_bit", FlatNorthSouth, output);
    })
    .thenExecute(() => {
      test.pullLever(inputA);
      test.pullLever(inputB);
    })
    .thenIdle(2)
    .thenWait(() => {
      testEx.assertBlockProperty("open_bit", FlatEastWest, output);
    })
    .thenSucceed();
}).tag(GameTest.Tags.suiteDefault);

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
        .thenWaitAfter(4, () => {
          test.assertRedstonePower(output, value);
        });
    }
  }
  sequence.thenSucceed();
})
  .maxTicks(TicksPerSecond * 60)
  .tag(GameTest.Tags.suiteDefault);

// SIG // Begin signature block
// SIG // MIInsAYJKoZIhvcNAQcCoIInoTCCJ50CAQExDzANBglg
// SIG // hkgBZQMEAgEFADB3BgorBgEEAYI3AgEEoGkwZzAyBgor
// SIG // BgEEAYI3AgEeMCQCAQEEEBDgyQbOONQRoqMAEEvTUJAC
// SIG // AQACAQACAQACAQACAQAwMTANBglghkgBZQMEAgEFAAQg
// SIG // sGhFkUmg2CI6dU2CBq9S679RZTYSNpMzekRzNfrHmLGg
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
// SIG // SEXAQsmbdlsKgEhr/Xmfwb1tbWrJUnMTDXpQzTGCGYcw
// SIG // ghmDAgEBMIGVMH4xCzAJBgNVBAYTAlVTMRMwEQYDVQQI
// SIG // EwpXYXNoaW5ndG9uMRAwDgYDVQQHEwdSZWRtb25kMR4w
// SIG // HAYDVQQKExVNaWNyb3NvZnQgQ29ycG9yYXRpb24xKDAm
// SIG // BgNVBAMTH01pY3Jvc29mdCBDb2RlIFNpZ25pbmcgUENB
// SIG // IDIwMTECEzMAAAJSizOq+JXzOdsAAAAAAlIwDQYJYIZI
// SIG // AWUDBAIBBQCggcAwGQYJKoZIhvcNAQkDMQwGCisGAQQB
// SIG // gjcCAQQwHAYKKwYBBAGCNwIBCzEOMAwGCisGAQQBgjcC
// SIG // ARUwLwYJKoZIhvcNAQkEMSIEINyYYYv07uRKuJorKjdr
// SIG // ALCHspQfNqaPAeN0JQgQtFB0MFQGCisGAQQBgjcCAQwx
// SIG // RjBEoCSAIgBNAGkAbgBlAGMAcgBhAGYAdAAgAEIAZQBk
// SIG // AHIAbwBjAGuhHIAaaHR0cHM6Ly93d3cubWluZWNyYWZ0
// SIG // Lm5ldC8wDQYJKoZIhvcNAQEBBQAEggEAJ6GOqeQb5nUq
// SIG // LOnC/4HOBzQMo7ztk5rk+wjQP3GfO1iLRJDVhGDwGqkZ
// SIG // 3ZizlvOwHdV2oMgv8wPRxJKY2q6EWDGfyqvG9YDY7mgk
// SIG // ciRVNMnyJYyrMZcbTgqr4H8VqtuLC8S/meuFFDv1wMFR
// SIG // OalYedMrtX3wfpMXk6AUYwJ7rZOmx1MJOzYsCrhTyZvv
// SIG // gWGF6O69iR+0yAQ82+c0y7P1mI19zWUQEkbh2eJw3dW1
// SIG // w0HmlPyvWe17PQpIkbwjlbX6v119R4UrMeIuFO1AzHRn
// SIG // iUrkCCR5m9I+RQ8nDliZbmrvfm6sItXDK+1PRiHRAM9G
// SIG // V8W5LMOJSxpzppkY7xqt2KGCFv8wghb7BgorBgEEAYI3
// SIG // AwMBMYIW6zCCFucGCSqGSIb3DQEHAqCCFtgwghbUAgED
// SIG // MQ8wDQYJYIZIAWUDBAIBBQAwggFQBgsqhkiG9w0BCRAB
// SIG // BKCCAT8EggE7MIIBNwIBAQYKKwYBBAGEWQoDATAxMA0G
// SIG // CWCGSAFlAwQCAQUABCB+XjPPvB8b2ZqiT40Q18/U/fUU
// SIG // Wv10LKbIKkbGJkeQOwIGYoIwqalsGBIyMDIyMDUyNzAw
// SIG // NTAzMC40MVowBIACAfSggdCkgc0wgcoxCzAJBgNVBAYT
// SIG // AlVTMRMwEQYDVQQIEwpXYXNoaW5ndG9uMRAwDgYDVQQH
// SIG // EwdSZWRtb25kMR4wHAYDVQQKExVNaWNyb3NvZnQgQ29y
// SIG // cG9yYXRpb24xJTAjBgNVBAsTHE1pY3Jvc29mdCBBbWVy
// SIG // aWNhIE9wZXJhdGlvbnMxJjAkBgNVBAsTHVRoYWxlcyBU
// SIG // U1MgRVNOOkREOEMtRTMzNy0yRkFFMSUwIwYDVQQDExxN
// SIG // aWNyb3NvZnQgVGltZS1TdGFtcCBTZXJ2aWNloIIRVzCC
// SIG // BwwwggT0oAMCAQICEzMAAAGcD6ZNYdKeSygAAQAAAZww
// SIG // DQYJKoZIhvcNAQELBQAwfDELMAkGA1UEBhMCVVMxEzAR
// SIG // BgNVBAgTCldhc2hpbmd0b24xEDAOBgNVBAcTB1JlZG1v
// SIG // bmQxHjAcBgNVBAoTFU1pY3Jvc29mdCBDb3Jwb3JhdGlv
// SIG // bjEmMCQGA1UEAxMdTWljcm9zb2Z0IFRpbWUtU3RhbXAg
// SIG // UENBIDIwMTAwHhcNMjExMjAyMTkwNTE5WhcNMjMwMjI4
// SIG // MTkwNTE5WjCByjELMAkGA1UEBhMCVVMxEzARBgNVBAgT
// SIG // Cldhc2hpbmd0b24xEDAOBgNVBAcTB1JlZG1vbmQxHjAc
// SIG // BgNVBAoTFU1pY3Jvc29mdCBDb3Jwb3JhdGlvbjElMCMG
// SIG // A1UECxMcTWljcm9zb2Z0IEFtZXJpY2EgT3BlcmF0aW9u
// SIG // czEmMCQGA1UECxMdVGhhbGVzIFRTUyBFU046REQ4Qy1F
// SIG // MzM3LTJGQUUxJTAjBgNVBAMTHE1pY3Jvc29mdCBUaW1l
// SIG // LVN0YW1wIFNlcnZpY2UwggIiMA0GCSqGSIb3DQEBAQUA
// SIG // A4ICDwAwggIKAoICAQDbUioMGV1JFj+s612s02mKu23K
// SIG // PUNs71OjDeJGtxkTF9rSWTiuA8XgYkAAi/5+2Ff7Ck7J
// SIG // cKQ9H/XD1OKwg1/bH3E1qO1z8XRy0PlpGhmyilgE7KsO
// SIG // vW8PIZCf243KdldgOrxrL8HKiQodOwStyT5lLWYpMsuT
// SIG // 2fH8k8oihje4TlpWiFPaCKLnFDaAB0Ccy6vIdtHjYB1I
// SIG // e3iOZPisquL+vNdCx7gOhB8iiTmTdsU8OSUpC8tBTeTI
// SIG // YPzmhaxQZd4moNk6qeCJyi7fiW4fyXdHrZ3otmgxxa5p
// SIG // Xz5pUUr+cEjV+cwIYBMkaY5kHM9c6dEGkgHn0ZDJvdt/
// SIG // 54FOdSG61WwHh4+evUhwvXaB4LCMZIdCt5acOfNvtDjV
// SIG // 3CHyFOp5AU/qgAwGftHU9brv4EUwcuteEAKH46NufE20
// SIG // l/WjlNUh7gAvt2zKMjO4zXRxCUTh/prBQwXJiUZeFSrE
// SIG // XiOfkuvSlBniyAYYZp5kOnaxfCKdGYjvr4QLA93vQJ6p
// SIG // 2Ox3IHvOdCPaCr8LsKVcFpyp8MEhhJTM+1LwqHJqFDF5
// SIG // O1Z9mjbYvm3R9vPhkG+RDLKoTpr7mTgkaTljd9xvm94O
// SIG // bp8BD9Hk4mPi51mtgLiuN8/6aZVESVZXtvSuNkD5DnIJ
// SIG // QerIy5jaRKW/W2rCe9ngNDJadS7R96GGRl7IIE37lwID
// SIG // AQABo4IBNjCCATIwHQYDVR0OBBYEFLtpCWdTXY5dtddk
// SIG // spy+oxjCA/qyMB8GA1UdIwQYMBaAFJ+nFV0AXmJdg/Tl
// SIG // 0mWnG1M1GelyMF8GA1UdHwRYMFYwVKBSoFCGTmh0dHA6
// SIG // Ly93d3cubWljcm9zb2Z0LmNvbS9wa2lvcHMvY3JsL01p
// SIG // Y3Jvc29mdCUyMFRpbWUtU3RhbXAlMjBQQ0ElMjAyMDEw
// SIG // KDEpLmNybDBsBggrBgEFBQcBAQRgMF4wXAYIKwYBBQUH
// SIG // MAKGUGh0dHA6Ly93d3cubWljcm9zb2Z0LmNvbS9wa2lv
// SIG // cHMvY2VydHMvTWljcm9zb2Z0JTIwVGltZS1TdGFtcCUy
// SIG // MFBDQSUyMDIwMTAoMSkuY3J0MAwGA1UdEwEB/wQCMAAw
// SIG // EwYDVR0lBAwwCgYIKwYBBQUHAwgwDQYJKoZIhvcNAQEL
// SIG // BQADggIBAKcAKqYjGEczTWMs9z0m7Yo23sgqVF3LyK6g
// SIG // OMz7TCHAJN+FvbvZkQ53VkvrZUd1sE6a9ToGldcJnOmB
// SIG // c6iuhBlpvdN1BLBRO8QSTD1433VTj4XCQd737wND1+eq
// SIG // KG3BdjrzbDksEwfG4v57PgrN/T7s7PkEjUGXfIgFQQkr
// SIG // 8TQi+/HZZ9kRlNccgeACqlfb4uGPxn5sdhQPoxdMvmC3
// SIG // qG9DONJ5UsS9KtO+bey+ohUTDa9LvEToc4Qzy5fuHj2H
// SIG // 1JsmCaKG78nXpfWpwBLBxZYSpfml29onN8jcG7KD8nGS
// SIG // S/76PDlb2GMQsvv+Ra0JgL6FtGRGgYmHCpM6zVrf4V/a
// SIG // +SoHcC+tcdGYk2aKU5KOlv+fFE3n024V+z54tDAKR9z7
// SIG // 8rejdCBWqfvy5cBUQ9c5+3unHD08BEp7qP2rgpoD856v
// SIG // NDgEwO77n7EWT76nl/IyrbK2kjbHLzUMphFpXKnV1fYW
// SIG // JI2+E/0LHvXFGGqF4OvMBRxbrJVn03T2Dy5db6s5TzJz
// SIG // SaQvCrXYqA4HKvstQWkqkpvBHTX8M09+/vyRbVXNxrPd
// SIG // eXw6oD2Q4DksykCFfn8N2j2LdixE9wG5iilv69dzsvHI
// SIG // N/g9A9+thkAQCVb9DUSOTaMIGgsOqDYFjhT6ze9lkhHH
// SIG // Gv/EEIkxj9l6S4hqUQyWerFkaUWDXcnZMIIHcTCCBVmg
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
// SIG // MSYwJAYDVQQLEx1UaGFsZXMgVFNTIEVTTjpERDhDLUUz
// SIG // MzctMkZBRTElMCMGA1UEAxMcTWljcm9zb2Z0IFRpbWUt
// SIG // U3RhbXAgU2VydmljZaIjCgEBMAcGBSsOAwIaAxUAzdlp
// SIG // 6t3ws/bnErbm9c0M+9dvU0CggYMwgYCkfjB8MQswCQYD
// SIG // VQQGEwJVUzETMBEGA1UECBMKV2FzaGluZ3RvbjEQMA4G
// SIG // A1UEBxMHUmVkbW9uZDEeMBwGA1UEChMVTWljcm9zb2Z0
// SIG // IENvcnBvcmF0aW9uMSYwJAYDVQQDEx1NaWNyb3NvZnQg
// SIG // VGltZS1TdGFtcCBQQ0EgMjAxMDANBgkqhkiG9w0BAQUF
// SIG // AAIFAOY6hoowIhgPMjAyMjA1MjcwNzA2NTBaGA8yMDIy
// SIG // MDUyODA3MDY1MFowdzA9BgorBgEEAYRZCgQBMS8wLTAK
// SIG // AgUA5jqGigIBADAKAgEAAgIZYAIB/zAHAgEAAgISOzAK
// SIG // AgUA5jvYCgIBADA2BgorBgEEAYRZCgQCMSgwJjAMBgor
// SIG // BgEEAYRZCgMCoAowCAIBAAIDB6EgoQowCAIBAAIDAYag
// SIG // MA0GCSqGSIb3DQEBBQUAA4GBAG+xs2oyovV6kVpDOSHA
// SIG // NRVPRR9C/cGJC3qX1dF9Eir2U0wenPk9TayYTPlfkMx0
// SIG // 8tyOtgeGIZZWn4YIru2Fc6tq8q5G6sl1rFCFH/uvyPvH
// SIG // pg3pJppZKbpBTd5V5SUswH2TJdI/Tzp5jX+H4fpfxdUN
// SIG // vYIRT8c1uHmAAgZJ3tfoMYIEDTCCBAkCAQEwgZMwfDEL
// SIG // MAkGA1UEBhMCVVMxEzARBgNVBAgTCldhc2hpbmd0b24x
// SIG // EDAOBgNVBAcTB1JlZG1vbmQxHjAcBgNVBAoTFU1pY3Jv
// SIG // c29mdCBDb3Jwb3JhdGlvbjEmMCQGA1UEAxMdTWljcm9z
// SIG // b2Z0IFRpbWUtU3RhbXAgUENBIDIwMTACEzMAAAGcD6ZN
// SIG // YdKeSygAAQAAAZwwDQYJYIZIAWUDBAIBBQCgggFKMBoG
// SIG // CSqGSIb3DQEJAzENBgsqhkiG9w0BCRABBDAvBgkqhkiG
// SIG // 9w0BCQQxIgQg/c3VUNTh5TndNOzMB1Qp8BLi92sMY8P5
// SIG // //9rLmBVsc0wgfoGCyqGSIb3DQEJEAIvMYHqMIHnMIHk
// SIG // MIG9BCA3D0WFII0syjoRd/XeEIG0WUIKzzuy6P6hORrb
// SIG // 0nqmvDCBmDCBgKR+MHwxCzAJBgNVBAYTAlVTMRMwEQYD
// SIG // VQQIEwpXYXNoaW5ndG9uMRAwDgYDVQQHEwdSZWRtb25k
// SIG // MR4wHAYDVQQKExVNaWNyb3NvZnQgQ29ycG9yYXRpb24x
// SIG // JjAkBgNVBAMTHU1pY3Jvc29mdCBUaW1lLVN0YW1wIFBD
// SIG // QSAyMDEwAhMzAAABnA+mTWHSnksoAAEAAAGcMCIEIB4n
// SIG // oE2bhHgfhQB3Im/L8cj47544+OHUORrEck5qwoBhMA0G
// SIG // CSqGSIb3DQEBCwUABIICAKq2tmzhfdMUFT9bJFMRZyH5
// SIG // gT77dk2ibhV5x5RNMigKBIOOR/KpA36YkjBp3i6ktk+W
// SIG // s0bVKOZmjiJZ5B8lcVMzxqyq3Vg1cL3DkSDcb7ID77lw
// SIG // PcK+KLTrr4JnlA1KikaNJ2rtpZUObqgG7rPiMQGgfFTx
// SIG // XfnfO7POc0UVsb9m5m8myuJARHVOFX4SXfwEssXH4tAc
// SIG // +7vNH3lWmBxdJAzmzgg/pSyyQGFFthZDyT4I6xq+BXhE
// SIG // vI6oq2oVQmG8ztooz65z8LTtKgCCPDQvba5tZ7fv/QjR
// SIG // aQwp3Bv+Ya92f8CZV3QCSBSDajMh5Y9NgVFSh7EtnlY6
// SIG // qFVRgqk0myHhHR0gHdujYyeCzPBl60mqhg+UU2Z/tU6w
// SIG // p3ryQX0LTjI6v/pqea32mSOjJx7KOTNYv6MJ+LRvrpCT
// SIG // 1fvEvlurGd0odTR3qXzJICF/n4Cov3HeYSKHn/b0t52p
// SIG // XrTlNlwwTYuDfsSSy3Up0zQI2urKOCbwzbOIN8GfgKRu
// SIG // HU1ZOZJK1R3gEXNyBQm4PWTc34zN1KjMqMkZr2fAT3c/
// SIG // knucMN//PI3RPqpeXXdSiU4LtqK+d24JlNBCQjcY+XuX
// SIG // s5gdnlR61V/Nps43kD9CyUWde812nAjHyZxYWtfUgAYC
// SIG // JhC8LcfVJb/R5TiGUANoa/r6GdzZMz0sQU5V+UuVooSF
// SIG // End signature block
