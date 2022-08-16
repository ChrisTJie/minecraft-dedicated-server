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
// SIG // MIInxwYJKoZIhvcNAQcCoIInuDCCJ7QCAQExDzANBglg
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
// SIG // SEXAQsmbdlsKgEhr/Xmfwb1tbWrJUnMTDXpQzTGCGZ4w
// SIG // ghmaAgEBMIGVMH4xCzAJBgNVBAYTAlVTMRMwEQYDVQQI
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
// SIG // V8W5LMOJSxpzppkY7xqt2KGCFxYwghcSBgorBgEEAYI3
// SIG // AwMBMYIXAjCCFv4GCSqGSIb3DQEHAqCCFu8wghbrAgED
// SIG // MQ8wDQYJYIZIAWUDBAIBBQAwggFZBgsqhkiG9w0BCRAB
// SIG // BKCCAUgEggFEMIIBQAIBAQYKKwYBBAGEWQoDATAxMA0G
// SIG // CWCGSAFlAwQCAQUABCB+XjPPvB8b2ZqiT40Q18/U/fUU
// SIG // Wv10LKbIKkbGJkeQOwIGYrMqJeW5GBMyMDIyMDcwMjAw
// SIG // Mjg1MS45NzFaMASAAgH0oIHYpIHVMIHSMQswCQYDVQQG
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
// SIG // YW1wIFBDQSAyMDEwMA0GCSqGSIb3DQEBBQUAAgUA5mmF
// SIG // zDAiGA8yMDIyMDcwMTIyNDAxMloYDzIwMjIwNzAyMjI0
// SIG // MDEyWjB0MDoGCisGAQQBhFkKBAExLDAqMAoCBQDmaYXM
// SIG // AgEAMAcCAQACAjTHMAcCAQACAhFlMAoCBQDmatdMAgEA
// SIG // MDYGCisGAQQBhFkKBAIxKDAmMAwGCisGAQQBhFkKAwKg
// SIG // CjAIAgEAAgMHoSChCjAIAgEAAgMBhqAwDQYJKoZIhvcN
// SIG // AQEFBQADgYEAV0H48Jpy+CgjSGUB7pPnvhrIfYGmsB3r
// SIG // 8zzPfH1IQIGBjxofhACB0oNjCl3SlciW/+ZgcdclcEcc
// SIG // eu7Hv1SiHBcDDmCsL235qiWH1s/THzCms+HtXAox7GZo
// SIG // 446hZSUkwUxgq6tGs6iEHsf3ViEj9Xf67aLphxPrkWCU
// SIG // 1SMdBowxggQNMIIECQIBATCBkzB8MQswCQYDVQQGEwJV
// SIG // UzETMBEGA1UECBMKV2FzaGluZ3RvbjEQMA4GA1UEBxMH
// SIG // UmVkbW9uZDEeMBwGA1UEChMVTWljcm9zb2Z0IENvcnBv
// SIG // cmF0aW9uMSYwJAYDVQQDEx1NaWNyb3NvZnQgVGltZS1T
// SIG // dGFtcCBQQ0EgMjAxMAITMwAAAYo+OI3SDgL66AABAAAB
// SIG // ijANBglghkgBZQMEAgEFAKCCAUowGgYJKoZIhvcNAQkD
// SIG // MQ0GCyqGSIb3DQEJEAEEMC8GCSqGSIb3DQEJBDEiBCAL
// SIG // HHW20AHqZUo3Gb3zJOEm9qOPS1sZNJZOrWWwFj9qZTCB
// SIG // +gYLKoZIhvcNAQkQAi8xgeowgecwgeQwgb0EIPS94Kt1
// SIG // 30q+fvO/fzD4MbWQhQaE7RHkOH6AkjlNVCm9MIGYMIGA
// SIG // pH4wfDELMAkGA1UEBhMCVVMxEzARBgNVBAgTCldhc2hp
// SIG // bmd0b24xEDAOBgNVBAcTB1JlZG1vbmQxHjAcBgNVBAoT
// SIG // FU1pY3Jvc29mdCBDb3Jwb3JhdGlvbjEmMCQGA1UEAxMd
// SIG // TWljcm9zb2Z0IFRpbWUtU3RhbXAgUENBIDIwMTACEzMA
// SIG // AAGKPjiN0g4C+ugAAQAAAYowIgQgti7SzfE9sOI06Cbh
// SIG // YZ3eo/3n6oLo5xCpNLWNO3O+NRowDQYJKoZIhvcNAQEL
// SIG // BQAEggIACbegokTMbl/yuiK9+UaFLFXluiIxngSYl7Pn
// SIG // 0zmEgcdrUOPccHXmwyC68UmMV9g4hFti+VGFG2hsySVR
// SIG // qv28r2ca8BoHaT6cCeuyBNXC5wRVgdTQURqGGqUgD7b5
// SIG // uWpfBGrDtjPM2YmKxntPWz4Px2pR079zWok3glojKnNw
// SIG // mumDCOMTd0xz79Ul3azo1jFaVwSEAFKAsGo5ORKYuVfF
// SIG // f8FueWW/+pSWrpZk00n4A7edx6E67jYsQo/yJW8HiujQ
// SIG // lDEYWhUOidLCe90iv+Tj58qG0j3YtU9jiI2z3zaGlQSX
// SIG // NxVDzX7DKpsqw1TrzABguKTxoT0IRld12J7l4tKZ6sna
// SIG // MSTTMP2ekCxYT+RJ569JMYuLvg1TKOwvYWbMB9QGn58s
// SIG // IJRyDgjKLsVcrk0KXyKjPMo4BNkRjwdl5PxX6TED01u+
// SIG // WUHu6A9/JlmDLlcOSRZMrFDIgDShzC+R0wXTiEE6/Cop
// SIG // nEMc6gdW59uOUTTe+h05ruLw8rAiKYf+gHFhJMKXOZu7
// SIG // lSvhLNeq/I+QAYvqxDP8CisCuqf65zHRFiKVQA/sbsb7
// SIG // OPJU8ltHRRKsYM0WSSNPyljrisscMDkIS0kdsb3GUyyJ
// SIG // O+jXvRKNSZeXUDOKNhrNsVNY48AgoZQ6sUTqCJLTGd+7
// SIG // 0H4D+neMBiCvH9QX9RxddcBQIu29NIM=
// SIG // End signature block
