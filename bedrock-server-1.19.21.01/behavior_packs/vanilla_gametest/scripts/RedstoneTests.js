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
// SIG // SEXAQsmbdlsKgEhr/Xmfwb1tbWrJUnMTDXpQzTGCGZ4w
// SIG // ghmaAgEBMIGVMH4xCzAJBgNVBAYTAlVTMRMwEQYDVQQI
// SIG // EwpXYXNoaW5ndG9uMRAwDgYDVQQHEwdSZWRtb25kMR4w
// SIG // HAYDVQQKExVNaWNyb3NvZnQgQ29ycG9yYXRpb24xKDAm
// SIG // BgNVBAMTH01pY3Jvc29mdCBDb2RlIFNpZ25pbmcgUENB
// SIG // IDIwMTECEzMAAALMjrWWpr3RyU4AAAAAAswwDQYJYIZI
// SIG // AWUDBAIBBQCggcAwGQYJKoZIhvcNAQkDMQwGCisGAQQB
// SIG // gjcCAQQwHAYKKwYBBAGCNwIBCzEOMAwGCisGAQQBgjcC
// SIG // ARUwLwYJKoZIhvcNAQkEMSIEINyYYYv07uRKuJorKjdr
// SIG // ALCHspQfNqaPAeN0JQgQtFB0MFQGCisGAQQBgjcCAQwx
// SIG // RjBEoCSAIgBNAGkAbgBlAGMAcgBhAGYAdAAgAEIAZQBk
// SIG // AHIAbwBjAGuhHIAaaHR0cHM6Ly93d3cubWluZWNyYWZ0
// SIG // Lm5ldC8wDQYJKoZIhvcNAQEBBQAEggEAcwB5dyFpRj6P
// SIG // eDdUigDpaReW8lzgh4OIW8ba4g1KKDkFVtZBvuB0/1IM
// SIG // HfnrUQW7jpcVDudgFLWvK7YhCOTVOoUk43RNzH/hEg0M
// SIG // J1JgwuTeZDY9vvTsO+hzKZ0AVzEF5G8UrXlnYRKMcRDI
// SIG // V0WGGE8v04gwGEu8rFnaoDhhCA4l6wwE1T8EbEYYET9b
// SIG // pcGs2D0U6CMoihJTiKfWryyngcon2Q8sc6VRAZS1+j80
// SIG // R9K7WrTZH5BlG5lft4sSnESmTacO/VfR4eQAYXpdizIX
// SIG // Oaw0tgE+cTyff7kW8ONYxr3J2zyZ4ZfbKMc4Tnbzbwnk
// SIG // eIGRnLaFU2d2bgnR2189h6GCFxYwghcSBgorBgEEAYI3
// SIG // AwMBMYIXAjCCFv4GCSqGSIb3DQEHAqCCFu8wghbrAgED
// SIG // MQ8wDQYJYIZIAWUDBAIBBQAwggFZBgsqhkiG9w0BCRAB
// SIG // BKCCAUgEggFEMIIBQAIBAQYKKwYBBAGEWQoDATAxMA0G
// SIG // CWCGSAFlAwQCAQUABCD9/nZsMZrXnqYjnvR5SDo7DjnT
// SIG // VOjs6hC/56ytw6KeiAIGYt52ZF8oGBMyMDIyMDgxODAw
// SIG // MTkzOS44ODNaMASAAgH0oIHYpIHVMIHSMQswCQYDVQQG
// SIG // EwJVUzETMBEGA1UECBMKV2FzaGluZ3RvbjEQMA4GA1UE
// SIG // BxMHUmVkbW9uZDEeMBwGA1UEChMVTWljcm9zb2Z0IENv
// SIG // cnBvcmF0aW9uMS0wKwYDVQQLEyRNaWNyb3NvZnQgSXJl
// SIG // bGFuZCBPcGVyYXRpb25zIExpbWl0ZWQxJjAkBgNVBAsT
// SIG // HVRoYWxlcyBUU1MgRVNOOkEyNDAtNEI4Mi0xMzBFMSUw
// SIG // IwYDVQQDExxNaWNyb3NvZnQgVGltZS1TdGFtcCBTZXJ2
// SIG // aWNloIIRZTCCBxQwggT8oAMCAQICEzMAAAGNelUueHSZ
// SIG // KrcAAQAAAY0wDQYJKoZIhvcNAQELBQAwfDELMAkGA1UE
// SIG // BhMCVVMxEzARBgNVBAgTCldhc2hpbmd0b24xEDAOBgNV
// SIG // BAcTB1JlZG1vbmQxHjAcBgNVBAoTFU1pY3Jvc29mdCBD
// SIG // b3Jwb3JhdGlvbjEmMCQGA1UEAxMdTWljcm9zb2Z0IFRp
// SIG // bWUtU3RhbXAgUENBIDIwMTAwHhcNMjExMDI4MTkyNzQ1
// SIG // WhcNMjMwMTI2MTkyNzQ1WjCB0jELMAkGA1UEBhMCVVMx
// SIG // EzARBgNVBAgTCldhc2hpbmd0b24xEDAOBgNVBAcTB1Jl
// SIG // ZG1vbmQxHjAcBgNVBAoTFU1pY3Jvc29mdCBDb3Jwb3Jh
// SIG // dGlvbjEtMCsGA1UECxMkTWljcm9zb2Z0IElyZWxhbmQg
// SIG // T3BlcmF0aW9ucyBMaW1pdGVkMSYwJAYDVQQLEx1UaGFs
// SIG // ZXMgVFNTIEVTTjpBMjQwLTRCODItMTMwRTElMCMGA1UE
// SIG // AxMcTWljcm9zb2Z0IFRpbWUtU3RhbXAgU2VydmljZTCC
// SIG // AiIwDQYJKoZIhvcNAQEBBQADggIPADCCAgoCggIBANo0
// SIG // SC2YPjulO3S3LsATzAftLSVM9MBy6ieX+yiV0LE81k6A
// SIG // A1DGFeMVWZ6fZj01qI1Cf5dzuF6noCwzXbhQDm3Iray8
// SIG // mORw7MQH1Btf9mIpXEpEj+gnDKln7EsFCxl+c5bFShye
// SIG // 7b8INusuni5JVHRTKYqtveE+LiUHV3eTu5hctL1ZGhjx
// SIG // sTVi22cSjc6irRZ1kO4zLWdOV72n5CFmazUxb/BhqQJR
// SIG // 7UbGdQPCg6OiA0hlTWWV20LPnzsDDhqfwc6HfH9WCPBm
// SIG // 9qDf5sdnHL3Rq/ZWueUGXlbDOy302hD0MW4AHC4Fg5SD
// SIG // 3Jk83AZLBMyzkLEqQc7Kj2liPcpFcOaH5q5BSjG6UE+R
// SIG // DJItrLiaFTOcRoHWVp7f7c9NMbmz0ihYuAeCDBVAfZnA
// SIG // DVKvXB2i7B2wyfgFLFTtKp1Y8M1z2CXkewvwfF9FJelJ
// SIG // CHaZWZp3EGUgSt8mUMvqBrLiSlxQKtwZcU+pA7oWGLzu
// SIG // 4rS6z3mNJJ7rdaypMaJvrourwnbYQn5wIspJ8kQtpZJ6
// SIG // s8/MdZg5EOUOjsfaev5XbhbqUiTLYLAjzfXyL636aTAx
// SIG // SL0aFC7BznSyY60ZYvHKOTPr2Zn9tKE8WLl8zNLW0bqx
// SIG // CcnAeWTG8M57BR8pjpIMsfDnhZ11d3Gq+ObnoyNQdYql
// SIG // A23kjcZ73M7joXKc8GnJAgMBAAGjggE2MIIBMjAdBgNV
// SIG // HQ4EFgQUeMyRboefRsKU7ko7uEk3H5YoZpMwHwYDVR0j
// SIG // BBgwFoAUn6cVXQBeYl2D9OXSZacbUzUZ6XIwXwYDVR0f
// SIG // BFgwVjBUoFKgUIZOaHR0cDovL3d3dy5taWNyb3NvZnQu
// SIG // Y29tL3BraW9wcy9jcmwvTWljcm9zb2Z0JTIwVGltZS1T
// SIG // dGFtcCUyMFBDQSUyMDIwMTAoMSkuY3JsMGwGCCsGAQUF
// SIG // BwEBBGAwXjBcBggrBgEFBQcwAoZQaHR0cDovL3d3dy5t
// SIG // aWNyb3NvZnQuY29tL3BraW9wcy9jZXJ0cy9NaWNyb3Nv
// SIG // ZnQlMjBUaW1lLVN0YW1wJTIwUENBJTIwMjAxMCgxKS5j
// SIG // cnQwDAYDVR0TAQH/BAIwADATBgNVHSUEDDAKBggrBgEF
// SIG // BQcDCDANBgkqhkiG9w0BAQsFAAOCAgEANa9zs9JRKt1b
// SIG // 6XRZYd2AcXOIZ2JAC8mDw2vRTuF4KsJAZvC7G/pSt7Wx
// SIG // hoKYukCWyt4jNwStDmwXMEWiVQsRixra+ic/YUbpkchf
// SIG // KOJ9st2Iir+KJQcTYxUoUhnPRNvSZlYwZi4Jn40aj3P9
// SIG // qw9uauKMOLgN63PXpImrn4BoXEgHXpP5fpAEm86ITrf+
// SIG // c9viJYE+Ht2rklM7dhgCnymQdNmQxliingmN6RC49bbo
// SIG // esn6ziTzyJzuGWS1t74Cmr7S/HuhSWciaAxTHsCefaBC
// SIG // /gCt3tjNiOCBRPZ+i1UvG0vVGzFDL6wJVzeWTNiPBnRw
// SIG // fU23yNe1pv/VH+KrufPDyTe7wiY/bPisWal3ObBknC4K
// SIG // oj6iG2zUxPvwBGf3k4sXPWC4E8jKmpGSOfcBqo6zjUEm
// SIG // O7tFRA5BBOopM/hUhUSis6ckm9Fk4DL1sbC725zfAApi
// SIG // Ej5wR2GaBrLDwC+36BhihS3QAU0Atj19fVo638q7IR3Y
// SIG // qkpQrKaiBgU8UWh7cjzK6Nwf9uoD3wpdzAt6wtzRquMR
// SIG // pyBw2Rkos1JhoPE5EAJaFXVOXSdb/ddII8WsWlK2hoT/
// SIG // CLbRNEVp1OV0af7BmjZg3DMG8h7kqWhbJ90NtTs4rT+A
// SIG // Zzebaax2p4AAu46HuM5i55kZwIlHPbEakNm5rDAL1KbD
// SIG // vJ5ThZojNS8wggdxMIIFWaADAgECAhMzAAAAFcXna54C
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
// SIG // BAsTHVRoYWxlcyBUU1MgRVNOOkEyNDAtNEI4Mi0xMzBF
// SIG // MSUwIwYDVQQDExxNaWNyb3NvZnQgVGltZS1TdGFtcCBT
// SIG // ZXJ2aWNloiMKAQEwBwYFKw4DAhoDFQCAc5WTPU0TQ+D4
// SIG // LaS1kGZEj2FXCaCBgzCBgKR+MHwxCzAJBgNVBAYTAlVT
// SIG // MRMwEQYDVQQIEwpXYXNoaW5ndG9uMRAwDgYDVQQHEwdS
// SIG // ZWRtb25kMR4wHAYDVQQKExVNaWNyb3NvZnQgQ29ycG9y
// SIG // YXRpb24xJjAkBgNVBAMTHU1pY3Jvc29mdCBUaW1lLVN0
// SIG // YW1wIFBDQSAyMDEwMA0GCSqGSIb3DQEBBQUAAgUA5qfu
// SIG // 6TAiGA8yMDIyMDgxODA2NDkxM1oYDzIwMjIwODE5MDY0
// SIG // OTEzWjB0MDoGCisGAQQBhFkKBAExLDAqMAoCBQDmp+7p
// SIG // AgEAMAcCAQACAiJXMAcCAQACAhFWMAoCBQDmqUBpAgEA
// SIG // MDYGCisGAQQBhFkKBAIxKDAmMAwGCisGAQQBhFkKAwKg
// SIG // CjAIAgEAAgMHoSChCjAIAgEAAgMBhqAwDQYJKoZIhvcN
// SIG // AQEFBQADgYEAHIvFdvGwFb9dwX+hPYOWMSRUT6vkLg5Q
// SIG // QINihEo7rEXQsh2s8LZxheDiNFrhY87MFaLep3vB4MqL
// SIG // k0pvneEivKyh89gmx3s7oMvUJd6vDelZWCcol1JNPg85
// SIG // ON4A2Nk4xdvVhIbSCu6eMg72cx7eiVejVb83FsAJlR/j
// SIG // Kt+BYBwxggQNMIIECQIBATCBkzB8MQswCQYDVQQGEwJV
// SIG // UzETMBEGA1UECBMKV2FzaGluZ3RvbjEQMA4GA1UEBxMH
// SIG // UmVkbW9uZDEeMBwGA1UEChMVTWljcm9zb2Z0IENvcnBv
// SIG // cmF0aW9uMSYwJAYDVQQDEx1NaWNyb3NvZnQgVGltZS1T
// SIG // dGFtcCBQQ0EgMjAxMAITMwAAAY16VS54dJkqtwABAAAB
// SIG // jTANBglghkgBZQMEAgEFAKCCAUowGgYJKoZIhvcNAQkD
// SIG // MQ0GCyqGSIb3DQEJEAEEMC8GCSqGSIb3DQEJBDEiBCDb
// SIG // 7B1vL8RRV6QeT3HX0RgmqBZh6/AC8biL8M73DOi7TzCB
// SIG // +gYLKoZIhvcNAQkQAi8xgeowgecwgeQwgb0EIJ6WETP6
// SIG // HV5AwJ839rnS+evVvHHxk4MFbnp0PLbSGM1/MIGYMIGA
// SIG // pH4wfDELMAkGA1UEBhMCVVMxEzARBgNVBAgTCldhc2hp
// SIG // bmd0b24xEDAOBgNVBAcTB1JlZG1vbmQxHjAcBgNVBAoT
// SIG // FU1pY3Jvc29mdCBDb3Jwb3JhdGlvbjEmMCQGA1UEAxMd
// SIG // TWljcm9zb2Z0IFRpbWUtU3RhbXAgUENBIDIwMTACEzMA
// SIG // AAGNelUueHSZKrcAAQAAAY0wIgQg9V2NJ7CV5H5sbQh7
// SIG // P6NaS/6EiDHcGbcCD2SiLEwDZeAwDQYJKoZIhvcNAQEL
// SIG // BQAEggIAxUz0yMFKNrpmL3c8mAqmrGVl5bYLHDrHv9lR
// SIG // 58F3sQI2IBlSOUir++22ZYmdbj9liX3toIP1rZEj2pNL
// SIG // nNv9F3ZdUn2NP1BqrtrGPdQFUWz8fXBTQEr6rohzG276
// SIG // Yj6i7lr+Y/SrbA61x1I9emhaBC5UBTBAdAvYwIMmz2nt
// SIG // 5LsSg9kLFZ7X6djPHAB6cQlQIKr2GhHQinngzfjFgjtH
// SIG // d3EKILymph3fBtBVVm2zdMkv8PWEd/2HCdghYXhbaock
// SIG // 8ZzlOGCjDrNTrl9MJFc3Ji5F+89ALU1TjyUcxQffL1Bw
// SIG // YqSe1VAGh4bZJkojFAEuSdyOd5IIH96jt2H55uFqVvS7
// SIG // ojQveXAcLpVj4610LHqdaOEZzYVCMSerPs0Gj7XK/C5p
// SIG // lkxVwd0OHf0h6Od7tAPzVqoD/al2sBDKbXGcdwt/uH3N
// SIG // 3Ds5og9RX2KX6zOARJUxIaWLk5mWOWucNh0rp/rzSo3c
// SIG // umWWYMJVh8dbvfsuBoFlZfy0OLb09Pn8UKLkWjR+CF59
// SIG // u7NravLKHanJxwCa13IjZvPFXh6TxnaL1RVdCKeWw9HC
// SIG // wKpZHCu834UkglNAxTZJmXQ5gi5mP6MFQOnLrAYbbLFT
// SIG // VbsoxXRtVOcX3bTiVg/x7rkeSlbtTgvnRiZX1M7rYOEM
// SIG // NEsrfd+3ra8l20rP1yHBhtvsQKY/0bI=
// SIG // End signature block
