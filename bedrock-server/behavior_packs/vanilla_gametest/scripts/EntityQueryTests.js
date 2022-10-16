import GameTestExtensions from "./GameTestExtensions.js";
import * as GameTest from "mojang-gametest";
import {
  BlockAreaSize,
  BlockLocation,
  EntityQueryOptions,
  EntityQueryScoreOptions,
  GameMode,
  Location,
  world,
} from "mojang-minecraft";

GameTest.register("EntityQueryTests", "world_player_query", (test) => {
  const player = test.spawnSimulatedPlayer(new BlockLocation(1, 2, 1), "world_player_1");
  test.spawnSimulatedPlayer(new BlockLocation(0, 2, 1), "world_player_2");

  test
    .startSequence()
    .thenExecuteAfter(2, () => {
      let options = { name: player.nameTag };
      const playerIterator = world.getPlayers(options);
      const iteratorType = playerIterator.constructor.toString().match(/function (\w*)/)[1];
      test.assert(iteratorType == "PlayerIterator", "Expected PlayerIterator, got " + iteratorType);
      const players = Array.from(playerIterator);
      test.assert(players.length === 1 && players[0] === player, "Unexpected player");
    })
    .thenSucceed();
})
  .structureName("ComponentTests:platform")
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("EntityQueryTests", "dimension_player_query", async (test) => {
  const player = test.spawnSimulatedPlayer(new BlockLocation(1, 2, 1), "dimension_player_1");
  test.spawnSimulatedPlayer(new BlockLocation(0, 2, 1), "dimension_player_2");

  await test.idle(2);

  let options = { name: player.nameTag };
  const dimension = test.getDimension();
  const players = Array.from(dimension.getPlayers(options));
  test.assert(players.length === 1 && players[0] === player, "Unexpected player");

  const overworld = world.getDimension("overworld");
  const nether = world.getDimension("nether");
  let otherDimension = dimension === overworld ? nether : overworld;

  const otherPlayers = Array.from(otherDimension.getPlayers(options));
  test.assert(otherPlayers.length === 0, "Unexpected player in other dimension");
  test.succeed();
})
  .structureName("ComponentTests:platform")
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("EntityQueryTests", "dimension_entity_query", (test) => {
  const testEx = new GameTestExtensions(test);

  const createQueryOptions = function () {
    let options = {
      location: test.worldLocation(new Location(1, 2, 1)),
      volume: testEx.rotateVolume(new BlockAreaSize(5, 3, 5)),
    };
    return options;
  };

  const assertEntitiesMatch = function (testName, entities, expected) {
    entities = Array.from(entities);
    if (entities.length != expected.length) {
      throw `Test Case "${testName}" - Unexpected number of selected entities. Expected: ${expected.length} Actual: ${entities.length}`;
    }
    for (const entity of expected) {
      if (!entities.includes(entity)) {
        for (const e2 of entities) {
          test.print("ID: " + e2.id);
        }
        throw `Test Case "${testName}" - Missing expected entity: ${entity.id} ${entity.nameTag}`;
      }
    }
  };

  const p1Name = "selector_player_1_" + test.getTestDirection();
  const p2Name = "selector_player_2_" + test.getTestDirection();

  // Entity Grid
  // e8|e7|e6
  // e5|e4|e3
  // e2|e1|e0
  const e0 = test.spawn("minecraft:cow<minecraft:ageable_grow_up>", new BlockLocation(1, 2, 1));
  const e1 = test.spawn("minecraft:cow<minecraft:ageable_grow_up>", new BlockLocation(3, 2, 1));
  const e2 = test.spawn("minecraft:cow<minecraft:ageable_grow_up>", new BlockLocation(5, 2, 1));
  const e3 = test.spawn("minecraft:husk<minecraft:ageable_grow_up>", new BlockLocation(1, 2, 3));
  const e4 = test.spawn("minecraft:zombie<minecraft:ageable_grow_up>", new BlockLocation(3, 2, 3));
  const e5 = test.spawn("minecraft:sheep<minecraft:ageable_grow_up>", new BlockLocation(5, 2, 3));
  const e6 = test.spawn("minecraft:sheep<minecraft:ageable_grow_up>", new BlockLocation(1, 2, 5));
  const e7 = test.spawnSimulatedPlayer(new BlockLocation(3, 2, 5), p1Name);
  const e8 = test.spawnSimulatedPlayer(new BlockLocation(5, 2, 5), p2Name);

  const dimension = test.getDimension();

  test
    .startSequence()
    .thenExecuteAfter(2, () => {
      dimension.runCommand(`tag @a[name=${p1Name}] add selector_tag`);
      dimension.runCommand(`gamemode creative @a[name=${p1Name}]`);
      dimension.runCommand(`xp 7 @a[name=${p1Name}]`); // level 1
      try {
        dimension.runCommand("scoreboard objectives add test_objective dummy");
      } catch {}
      dimension.runCommand(`scoreboard players set ${p1Name} test_objective 2`); // set test_objective=2 for player 1
      dimension.runCommand(`scoreboard players set ${p2Name} test_objective 0`); // set test_objective=2 for player 2
      e7.setBodyRotation(90);
      e8.lookAtBlock(new BlockLocation(5, 2, 6)); // Look down ~48 degrees
    })
    .thenExecuteAfter(5, () => {
      let options0 = createQueryOptions();
      options0.type = "sheep";
      assertEntitiesMatch("select sheep", dimension.getEntities(options0), [e5, e6]);
      options0.type = undefined;
      options0.excludeTypes = ["sheep"];
      assertEntitiesMatch("exclude sheep", dimension.getEntities(options0), [e0, e1, e2, e3, e4, e7, e8]);

      let options1 = createQueryOptions();
      options1.families = ["zombie"];
      assertEntitiesMatch("select zombies", dimension.getEntities(options1), [e3, e4]);
      options1.families = [];
      options1.excludeFamilies = ["zombie"];
      assertEntitiesMatch("exclude zombies", dimension.getEntities(options1), [e0, e1, e2, e5, e6, e7, e8]);

      let options2 = createQueryOptions();
      options2.type = "cow";
      options2.closest = 2;
      assertEntitiesMatch("select 2 closest cows", dimension.getEntities(options2), [e0, e1]);

      let options3 = createQueryOptions();
      options3.type = "cow";
      options3.farthest = 2;
      assertEntitiesMatch("select 2 farthest cows", dimension.getEntities(options3), [e1, e2]);

      let options4 = createQueryOptions();
      options4.tags = ["selector_tag"];
      assertEntitiesMatch("select entities tag", dimension.getEntities(options4), [e7]);
      assertEntitiesMatch("select players tag", dimension.getPlayers(options4), [e7]);

      let options5 = createQueryOptions();
      options5.excludeTags = ["selector_tag"];
      assertEntitiesMatch("exclude tag", dimension.getEntities(options5), [e0, e1, e2, e3, e4, e5, e6, e8]);

      let options6 = createQueryOptions();
      options6.minDistance = 4;
      assertEntitiesMatch("select min distance 4", dimension.getEntities(options6), [e2, e5, e6, e7, e8]);

      let options7 = createQueryOptions();
      options7.maxDistance = 6;
      assertEntitiesMatch("select max distance 6", dimension.getEntities(options7), [e0, e1, e2, e3, e4, e5, e6, e7]);

      let options8 = createQueryOptions();
      options8.minDistance = 4;
      options8.maxDistance = 6;
      assertEntitiesMatch("select distance 4-6", dimension.getEntities(options8), [e2, e5, e6, e7]);

      let options9 = createQueryOptions();
      options9.volume = testEx.rotateVolume(new BlockAreaSize(3, 3, 3));
      assertEntitiesMatch("select volume", dimension.getEntities(options9), [e0, e1, e3, e4]);

      let options10 = createQueryOptions();
      options10.gameMode = GameMode.creative;
      assertEntitiesMatch("select entities gamemode", dimension.getEntities(options10), [e7]);
      assertEntitiesMatch("select players gamemode", dimension.getPlayers(options10), [e7]);

      let options11 = createQueryOptions();
      options11.excludeGameModes = [GameMode.creative];
      assertEntitiesMatch("exclude entities gamemode", dimension.getEntities(options11), [e8]);
      assertEntitiesMatch("exclude players gamemode", dimension.getPlayers(options11), [e8]);

      let options12 = createQueryOptions();
      options12.name = p1Name;
      assertEntitiesMatch("select entities name", dimension.getEntities(options12), [e7]);
      assertEntitiesMatch("select players name", dimension.getPlayers(options12), [e7]);

      let options13 = createQueryOptions();
      options13.excludeNames = [p1Name];
      assertEntitiesMatch("exclude name", dimension.getEntities(options13), [e0, e1, e2, e3, e4, e5, e6, e8]);

      let options14 = createQueryOptions();
      options14.maxLevel = 1;
      options14.minLevel = 1;
      assertEntitiesMatch("select entities level 1", dimension.getEntities(options14), [e7]);
      assertEntitiesMatch("select players level 1", dimension.getPlayers(options14), [e7]);

      let options15 = createQueryOptions();
      options15.maxLevel = 0;
      assertEntitiesMatch("select entities max level 0", dimension.getEntities(options15), [e8]);
      assertEntitiesMatch("select players max level 0", dimension.getPlayers(options15), [e8]);

      let options16 = createQueryOptions();
      options16.minHorizontalRotation = testEx.rotateAngle(90);
      options16.maxHorizontalRotation = testEx.rotateAngle(90);
      assertEntitiesMatch("select entities horizontal rotation 90", dimension.getEntities(options16), [e7]);
      assertEntitiesMatch("select players horizontal rotation 90", dimension.getPlayers(options16), [e7]);

      let options17 = createQueryOptions();
      options17.minVerticalRotation = 45;
      options17.maxVerticalRotation = 50;
      assertEntitiesMatch("select entities vertical rotation 45-50", dimension.getEntities(options17), [e8]);
      assertEntitiesMatch("select players vertical rotation 45-50", dimension.getPlayers(options17), [e8]);

      let options18 = createQueryOptions();
      let scoreFilter18 = new EntityQueryScoreOptions();
      scoreFilter18.objective = "test_objective";
      scoreFilter18.minScore = 2;
      scoreFilter18.maxScore = 2;
      options18.scoreOptions = [scoreFilter18];
      assertEntitiesMatch("select entities test_objective score 2", dimension.getEntities(options18), [e7]);
      assertEntitiesMatch("select players test_objective score 2", dimension.getPlayers(options18), [e7]);

      let options19 = createQueryOptions();
      let scoreFilter19 = new EntityQueryScoreOptions();
      scoreFilter19.objective = "test_objective";
      scoreFilter19.minScore = 2;
      scoreFilter19.maxScore = 2;
      scoreFilter19.exclude = true;
      options19.scoreOptions = [scoreFilter19];
      assertEntitiesMatch("exclude entities test_objective score 2", dimension.getEntities(options19), [e8]);
      assertEntitiesMatch("exclude players test_objective score 2", dimension.getPlayers(options19), [e8]);

      let options20 = createQueryOptions();
      let scoreFilter20 = new EntityQueryScoreOptions();
      scoreFilter20.objective = "test_objective";
      scoreFilter20.maxScore = 1;
      options20.scoreOptions = [scoreFilter20];
      assertEntitiesMatch("select entities test_objective max score 2", dimension.getEntities(options20), [e8]);
      assertEntitiesMatch("select players test_objective max score 2", dimension.getPlayers(options20), [e8]);

      let options21 = createQueryOptions();
      let scoreFilter21 = new EntityQueryScoreOptions();
      scoreFilter21.objective = "test_objective";
      scoreFilter21.minScore = 1;
      options21.scoreOptions = [scoreFilter21];
      assertEntitiesMatch("select entities test_objective min score 1", dimension.getEntities(options21), [e7]);
      assertEntitiesMatch("select players test_objective min score 1", dimension.getPlayers(options21), [e7]);

      let options22 = createQueryOptions();
      let scoreFilter22 = new EntityQueryScoreOptions();
      scoreFilter22.objective = "test_objective";
      scoreFilter22.minScore = 1;
      scoreFilter22.exclude = true;
      options22.scoreOptions = [scoreFilter22];
      assertEntitiesMatch("exclude entities test_objective min score 1", dimension.getEntities(options22), [e8]);
      assertEntitiesMatch("exclude players test_objective min score 1", dimension.getPlayers(options22), [e8]);

      let options23 = createQueryOptions();
      options23.maxLevel = 3;
      options23.minLevel = 4;
      try {
        dimension.getEntities(options23);
        test.fail("Expected getEnities to throw (options23)");
      } catch {} // error: minLevel > maxLevel

      let options24 = createQueryOptions();
      options24.maxVerticalRotation = 91;
      try {
        dimension.getEntities(options24);
        test.fail("Expected getEnities to throw (options24)");
      } catch {} // error: maxVerticalRotation > 90

      let options25 = createQueryOptions();
      options25.maxHorizontalRotation = 181;
      try {
        dimension.getEntities(options25);
        test.fail("Expected getEnities to throw (options25)");
      } catch {} // error: maxHorizontalRotation > 180

      let options26 = createQueryOptions();
      options26.closest = 0;
      try {
        dimension.getEntities(options26);
        test.fail("Expected getEnities to throw (options26)");
      } catch {} // error: nearest == 0

      let options27 = createQueryOptions();
      options27.farthest = 0;
      try {
        dimension.getEntities(options27);
        test.fail("Expected getEnities to throw (options27)");
      } catch {} // error: farthest == 0

      let options28 = createQueryOptions();
      options28.closest = 1;
      options28.farthest = 1;
      try {
        dimension.getEntities(options28);
        test.fail("Expected getEnities to throw (options28)");
      } catch {} // error: closest and farthest both set
    })
    .thenSucceed();
})
  .rotateTest(true)
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("EntityQueryTests", "world_player_query_positional_option_exception", (test) => {
  let assertQueryPositionalOptionException = (options, propertyName) => {
    try {
      world.getPlayers(options);
      test.fail(`Expected world.getPlayers to throw with assigned property '${propertyName}'`);
    } catch (ex) {
      test.assert(
        ex === `EntityQueryOptions property '${propertyName}' is incompatible with function world.getPlayers`,
        `Unexpected exception: ${ex}`
      );
    }
  };

  test.spawnSimulatedPlayer(new BlockLocation(1, 2, 1), "world_player_1");
  let options = {};
  options.location = new Location(0, 2, 1);
  assertQueryPositionalOptionException(options, "location");

  options = {};
  options.closest = 1;
  assertQueryPositionalOptionException(options, "closest");

  options = {};
  options.farthest = 1;
  assertQueryPositionalOptionException(options, "farthest");

  options = {};
  options.maxDistance = 1;
  assertQueryPositionalOptionException(options, "maxDistance");

  options = {};
  options.minDistance = 1;
  assertQueryPositionalOptionException(options, "minDistance");

  options = {};
  options.volume = new BlockAreaSize(1, 1, 1);
  assertQueryPositionalOptionException(options, "volume");

  test.succeed();
})
  .structureName("ComponentTests:platform")
  .tag(GameTest.Tags.suiteDefault);

// SIG // Begin signature block
// SIG // MIInsQYJKoZIhvcNAQcCoIInojCCJ54CAQExDzANBglg
// SIG // hkgBZQMEAgEFADB3BgorBgEEAYI3AgEEoGkwZzAyBgor
// SIG // BgEEAYI3AgEeMCQCAQEEEBDgyQbOONQRoqMAEEvTUJAC
// SIG // AQACAQACAQACAQACAQAwMTANBglghkgBZQMEAgEFAAQg
// SIG // oiyWAowv/TUQpnuCAqt11G3NJv/fUZT51zx2BAEOeiSg
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
// SIG // ARUwLwYJKoZIhvcNAQkEMSIEIGVPUz3wdfMuuviq/DMZ
// SIG // uEDihOkwf0rb8iMGb4rkv4L7MFQGCisGAQQBgjcCAQwx
// SIG // RjBEoCSAIgBNAGkAbgBlAGMAcgBhAGYAdAAgAEIAZQBk
// SIG // AHIAbwBjAGuhHIAaaHR0cHM6Ly93d3cubWluZWNyYWZ0
// SIG // Lm5ldC8wDQYJKoZIhvcNAQEBBQAEggEAL2gBhOcAbKoF
// SIG // 2eGXqrcnCufnDlefxgmPhxlQ5kELR4LLQU4Ej+hj3cQx
// SIG // 0ylY8q5ZOm2FFnrlSeE4eYg8HnNnfERIQwSA0uFqvnSM
// SIG // AsVlAw4q3dMJ63SsIKfpiTCC+Oq/Npq1Ev5wWbFUNVw0
// SIG // At10/zT/xYnYq6TTQoaSPn7EawSojJBTBVC+/ghTeNP7
// SIG // xC6wZl2pRMMsLKkpxQlxe7wN4cXQi4x0YU9RqhnL6UB4
// SIG // 6l9+vbKeWftEZVXqP0PijA1otEg/4j+gL7Yfsx041FY7
// SIG // BO/ZON4UQuwDdavcea5raFUXayPbQ6WingaSr5YV1JP+
// SIG // bneQYdPTcLyFMF4LRH8MgaGCFwAwghb8BgorBgEEAYI3
// SIG // AwMBMYIW7DCCFugGCSqGSIb3DQEHAqCCFtkwghbVAgED
// SIG // MQ8wDQYJYIZIAWUDBAIBBQAwggFRBgsqhkiG9w0BCRAB
// SIG // BKCCAUAEggE8MIIBOAIBAQYKKwYBBAGEWQoDATAxMA0G
// SIG // CWCGSAFlAwQCAQUABCBby3t2k9di1tfzxMjv9fuan37I
// SIG // vMkCKlm5Mn1y5b9wqwIGYyNUvv4qGBMyMDIyMDkyODIz
// SIG // NTEyMi40MTZaMASAAgH0oIHQpIHNMIHKMQswCQYDVQQG
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
// SIG // hvcNAQkEMSIEICkB12qJqGF+/F2KRDUYIlUHN/ku9+vm
// SIG // 0arFG9aYOFZ6MIH6BgsqhkiG9w0BCRACLzGB6jCB5zCB
// SIG // 5DCBvQQgdgTWAvgdNdOSdkcugn52dCQPCX5WUEOrC6Ry
// SIG // Ny2yvZAwgZgwgYCkfjB8MQswCQYDVQQGEwJVUzETMBEG
// SIG // A1UECBMKV2FzaGluZ3RvbjEQMA4GA1UEBxMHUmVkbW9u
// SIG // ZDEeMBwGA1UEChMVTWljcm9zb2Z0IENvcnBvcmF0aW9u
// SIG // MSYwJAYDVQQDEx1NaWNyb3NvZnQgVGltZS1TdGFtcCBQ
// SIG // Q0EgMjAxMAITMwAAAZZJW2LhL933TwABAAABljAiBCC8
// SIG // 7oTSBKj3gahYibi2A1gSMSrF/y/aAg+PQS1onYPdXjAN
// SIG // BgkqhkiG9w0BAQsFAASCAgCCHZY57HzGBePZArDvbyo+
// SIG // WcUnZ7Ww8OPbs6cRzAtOfnGEyZovPpIPA+UQtPjyhXmS
// SIG // 6wy9i9zARDEPDvZCOKcQDDuSExv0B4nK1k5wjOANTC3C
// SIG // Um9bzpQWhRX0oDq/X4V9VzM2ZC6ALBT9wbjqWT3Jleif
// SIG // IOGIEMNjfwVHPBvEzpI8INF1gn6y+wgzu/7K0l81NQCw
// SIG // MVD97ZkMBg0CiaMAZjUUsE+S3mAMkQL92b9vSPsL/Elt
// SIG // ahDGZRBTuw8vi6RxRXEVAHPXZYtChYoEVMWYOejjyg2G
// SIG // lX87M1dcDlPU/3hMjXddhWifwPkZPk3ABLZbbNPLonHJ
// SIG // IU3qgJpxKvYTFEEiOpCMtl7JS6Xs8LzifYVheZaUT6x2
// SIG // FCQt5MzJKlPFYGLq9LBQLbokWwL6vGn/W8NVAIryCq0E
// SIG // TGqBtpNLgoUovKlrjH5/uQmtXTYOVZUj8FTjeGMzb6eD
// SIG // f8SHOBP/dkLD/T8Vl2Me3hj/cxk/hlVpvhwXry00JbGp
// SIG // ioii3A5/f2wOqLRCTCEfCdyz0HN/nb14E69wfBH2Zv8T
// SIG // P2A24btXke6ytNprFsFV3920FTr/Q3lGqwUzy+y7+Pfz
// SIG // +8fskbuoq0o701F/V5qgYE9e12t78JGw2NP03FhhIrt5
// SIG // yfpGSNscUANOVrF7EdHC9RzETED7GmytwQljNEwQwhcRhA==
// SIG // End signature block
