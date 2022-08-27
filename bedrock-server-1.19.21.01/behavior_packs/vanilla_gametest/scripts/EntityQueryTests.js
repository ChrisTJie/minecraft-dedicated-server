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
      let options = new EntityQueryOptions();
      options.name = player.nameTag;
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

  let options = new EntityQueryOptions();
  options.name = player.nameTag;
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
    let options = new EntityQueryOptions();
    options.location = test.worldLocation(new Location(1, 2, 1));
    options.volume = testEx.rotateVolume(new BlockAreaSize(5, 3, 5));
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
  let options = new EntityQueryOptions();
  options.location = new Location(0, 2, 1);
  assertQueryPositionalOptionException(options, "location");

  options = new EntityQueryOptions();
  options.closest = 1;
  assertQueryPositionalOptionException(options, "closest");

  options = new EntityQueryOptions();
  options.farthest = 1;
  assertQueryPositionalOptionException(options, "farthest");

  options = new EntityQueryOptions();
  options.maxDistance = 1;
  assertQueryPositionalOptionException(options, "maxDistance");

  options = new EntityQueryOptions();
  options.minDistance = 1;
  assertQueryPositionalOptionException(options, "minDistance");

  options = new EntityQueryOptions();
  options.volume = new BlockAreaSize(1, 1, 1);
  assertQueryPositionalOptionException(options, "volume");

  test.succeed();
})
  .structureName("ComponentTests:platform")
  .tag(GameTest.Tags.suiteDefault);

// SIG // Begin signature block
// SIG // MIInvQYJKoZIhvcNAQcCoIInrjCCJ6oCAQExDzANBglg
// SIG // hkgBZQMEAgEFADB3BgorBgEEAYI3AgEEoGkwZzAyBgor
// SIG // BgEEAYI3AgEeMCQCAQEEEBDgyQbOONQRoqMAEEvTUJAC
// SIG // AQACAQACAQACAQACAQAwMTANBglghkgBZQMEAgEFAAQg
// SIG // LDP2rotPh55uRuVE78lmzbe51/1OUIQr+ptrw1KZPvKg
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
// SIG // ARUwLwYJKoZIhvcNAQkEMSIEIDQDQet01ZRT9PBkZKgn
// SIG // Y4uV6MOf9qtAkHSK9FAQbTE2MFQGCisGAQQBgjcCAQwx
// SIG // RjBEoCSAIgBNAGkAbgBlAGMAcgBhAGYAdAAgAEIAZQBk
// SIG // AHIAbwBjAGuhHIAaaHR0cHM6Ly93d3cubWluZWNyYWZ0
// SIG // Lm5ldC8wDQYJKoZIhvcNAQEBBQAEggEAM9XWHR6MspGq
// SIG // 4kS8mbmH65LhMa9TQ1G27YP1hOV3Jpso8KnOsXZaRVmH
// SIG // mpQ2E8+SGLWTAa26pEIPf+T/8gRapSZPbgKsvgOFZDXf
// SIG // 7P1CJzrOkCRpKFtBwu5e98ac/HBYbzKMRncjN147IUGd
// SIG // 5De981VZAWAkW84qM+0+A4pKnaz+lXIl/Rnb/I1vOp52
// SIG // o5eIHGShFEKV+sVthX4hw8hGjTyWlBU9EC4Ahio92H+R
// SIG // Vv9kB301vlPv/1Td0GfJbLBC4fto6VmEo/JxdPGETqH9
// SIG // 8/fGX5ABK1b39a6x4tU0erlFPUPjFfZeJiPZaaQrJUJo
// SIG // 1GJA9hHiN3oeBkC6gZB8p6GCFwwwghcIBgorBgEEAYI3
// SIG // AwMBMYIW+DCCFvQGCSqGSIb3DQEHAqCCFuUwghbhAgED
// SIG // MQ8wDQYJYIZIAWUDBAIBBQAwggFVBgsqhkiG9w0BCRAB
// SIG // BKCCAUQEggFAMIIBPAIBAQYKKwYBBAGEWQoDATAxMA0G
// SIG // CWCGSAFlAwQCAQUABCAA70egAyRE/1/WOyzDPq0+nQRL
// SIG // WacLnVHYFlUju2XafgIGYtsjmUEoGBMyMDIyMDgxODAw
// SIG // MTk1Ny41MDJaMASAAgH0oIHUpIHRMIHOMQswCQYDVQQG
// SIG // EwJVUzETMBEGA1UECBMKV2FzaGluZ3RvbjEQMA4GA1UE
// SIG // BxMHUmVkbW9uZDEeMBwGA1UEChMVTWljcm9zb2Z0IENv
// SIG // cnBvcmF0aW9uMSkwJwYDVQQLEyBNaWNyb3NvZnQgT3Bl
// SIG // cmF0aW9ucyBQdWVydG8gUmljbzEmMCQGA1UECxMdVGhh
// SIG // bGVzIFRTUyBFU046MzJCRC1FM0Q1LTNCMUQxJTAjBgNV
// SIG // BAMTHE1pY3Jvc29mdCBUaW1lLVN0YW1wIFNlcnZpY2Wg
// SIG // ghFfMIIHEDCCBPigAwIBAgITMwAAAa38301Y410y6QAB
// SIG // AAABrTANBgkqhkiG9w0BAQsFADB8MQswCQYDVQQGEwJV
// SIG // UzETMBEGA1UECBMKV2FzaGluZ3RvbjEQMA4GA1UEBxMH
// SIG // UmVkbW9uZDEeMBwGA1UEChMVTWljcm9zb2Z0IENvcnBv
// SIG // cmF0aW9uMSYwJAYDVQQDEx1NaWNyb3NvZnQgVGltZS1T
// SIG // dGFtcCBQQ0EgMjAxMDAeFw0yMjAzMDIxODUxMzZaFw0y
// SIG // MzA1MTExODUxMzZaMIHOMQswCQYDVQQGEwJVUzETMBEG
// SIG // A1UECBMKV2FzaGluZ3RvbjEQMA4GA1UEBxMHUmVkbW9u
// SIG // ZDEeMBwGA1UEChMVTWljcm9zb2Z0IENvcnBvcmF0aW9u
// SIG // MSkwJwYDVQQLEyBNaWNyb3NvZnQgT3BlcmF0aW9ucyBQ
// SIG // dWVydG8gUmljbzEmMCQGA1UECxMdVGhhbGVzIFRTUyBF
// SIG // U046MzJCRC1FM0Q1LTNCMUQxJTAjBgNVBAMTHE1pY3Jv
// SIG // c29mdCBUaW1lLVN0YW1wIFNlcnZpY2UwggIiMA0GCSqG
// SIG // SIb3DQEBAQUAA4ICDwAwggIKAoICAQDonlMqpU0q1S4b
// SIG // 2O0zvL4Avk+Tf8vzF3kd6DcBNKyyNRIP4DOYPTYT/iqq
// SIG // iXP+7jy+E7KAC2/kVX+q6GDZZckK2JqrlI8LKtutjA+S
// SIG // /Zfa1NaZc9rTD3oT/GnXVZTSI2CAYdDQuAsjBOrcVaaU
// SIG // K+3hXf21tF/bZ2ctWg1vs6GiQdhWPIWqJKuXETjRFuLq
// SIG // FbE017CApG2DgGH3yCBmpDBV1bwd9DXLLog5+rg5PN11
// SIG // 07NLZ0q/Bccz6A/EoDzyHFmljxIwkC6+SNAcX3VJYsDT
// SIG // xyDxIJaqLKwpUY1xu63GVm1njg4AE4tIug1LL9Vp9Czl
// SIG // uLLyuP1rnP7/XZZriK2pr/cIW4AspFLmGcvDMU87EKlN
// SIG // kcXJvIfPQlwOY39ZO5N2Ymi1CdNNzI7U7TV85YG/pNQO
// SIG // Xi9extwuBI8OQKFYjPlARkL8bk8aRXmhqEBanjhhrRCt
// SIG // KpNMHVF/af+ALvV7JXuQ+X78qQXbHFwbJVAXE+vgmKtJ
// SIG // EPbJrE8oVeAyvcG/WZ+zmxDn09AEMqaSOo8MwYx4QBhc
// SIG // qymIyG4JTGhIsY0b+13TYnNlbmCsku9QNIbOnW2w8f1e
// SIG // 4Q23b9rK7WdlUztMthPuEKjESrQAb+AIII2Cs+U2BrkO
// SIG // FW2z2PHwTvV6r2txp8dWQzkN5xlRSh8Gqxg3DXQd6nrL
// SIG // 7SWyBiYCYwIDAQABo4IBNjCCATIwHQYDVR0OBBYEFH1Q
// SIG // dB0EvKohWm5qhKjlfS6yxsFZMB8GA1UdIwQYMBaAFJ+n
// SIG // FV0AXmJdg/Tl0mWnG1M1GelyMF8GA1UdHwRYMFYwVKBS
// SIG // oFCGTmh0dHA6Ly93d3cubWljcm9zb2Z0LmNvbS9wa2lv
// SIG // cHMvY3JsL01pY3Jvc29mdCUyMFRpbWUtU3RhbXAlMjBQ
// SIG // Q0ElMjAyMDEwKDEpLmNybDBsBggrBgEFBQcBAQRgMF4w
// SIG // XAYIKwYBBQUHMAKGUGh0dHA6Ly93d3cubWljcm9zb2Z0
// SIG // LmNvbS9wa2lvcHMvY2VydHMvTWljcm9zb2Z0JTIwVGlt
// SIG // ZS1TdGFtcCUyMFBDQSUyMDIwMTAoMSkuY3J0MAwGA1Ud
// SIG // EwEB/wQCMAAwEwYDVR0lBAwwCgYIKwYBBQUHAwgwDQYJ
// SIG // KoZIhvcNAQELBQADggIBAIvQHUW7Mf4DknQV53cEXo0L
// SIG // rrUKnHt5N24LNbJT42UsehQ16dSGc4zsk9SaP93lFgwR
// SIG // SXYvh3rtTaMg3Rp/by+q8ZctS+vCuDJ3ywZvsm8ozfsW
// SIG // tXjWuPuHDqDrsRNirfI7ZmWyIcdo72OxfamP5Wp0eT0m
// SIG // 1CsgpYTUIcbJzVKfyUkPqO5wLkCfsLAsDwq12BOwvk7y
// SIG // g42unullNCuEYgVxRlNc+jLdyvcJTA/0BlOPvyBmQ5hP
// SIG // v2f5NCXyY2csQgJXJoXt64HYQ8wLBsSWKuD25RmUwXa/
// SIG // MJEMKT9o4IMjDGsDDOQ4IML12g266gkPIJLDYQmc06n0
// SIG // tnW4CxdJux38JVDK3J84v23U0kVsyF4OULB9beV2miB/
// SIG // k2dbmQbcFyfBDl6+kvtgOqvEUFWNdCpwR+mKRhPToVz3
// SIG // 7iLvPNprhRHYeBF2z3QEVEdSDEiMYPPJIUgQv2AcEIQq
// SIG // Y05LKuSd2fo8h1meDJ11+UeNpgEefOIkWHO2oGL7qLQx
// SIG // KnA9FPZSI4Ft9T6n6mUNbbmGU4hnChPUHGBr2RSp1XZK
// SIG // ivFdDPXvpBeQqgzqzDGEVdviPxYckLCR8Svxudw9DuW7
// SIG // 3SIdoA5xB0QBYoXWY9vWe1tKWhj6LRl9KAea/cKjYzN6
// SIG // 277hHuhSd9tzD2NcffzdYNduk/0qJKgAyQUyqsgWDeMz
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
// SIG // UyBFU046MzJCRC1FM0Q1LTNCMUQxJTAjBgNVBAMTHE1p
// SIG // Y3Jvc29mdCBUaW1lLVN0YW1wIFNlcnZpY2WiIwoBATAH
// SIG // BgUrDgMCGgMVAECS0a1FUeGWwQ4Fj47jalXLVM6QoIGD
// SIG // MIGApH4wfDELMAkGA1UEBhMCVVMxEzARBgNVBAgTCldh
// SIG // c2hpbmd0b24xEDAOBgNVBAcTB1JlZG1vbmQxHjAcBgNV
// SIG // BAoTFU1pY3Jvc29mdCBDb3Jwb3JhdGlvbjEmMCQGA1UE
// SIG // AxMdTWljcm9zb2Z0IFRpbWUtU3RhbXAgUENBIDIwMTAw
// SIG // DQYJKoZIhvcNAQEFBQACBQDmp+fDMCIYDzIwMjIwODE4
// SIG // MDIxODQzWhgPMjAyMjA4MTkwMjE4NDNaMHcwPQYKKwYB
// SIG // BAGEWQoEATEvMC0wCgIFAOan58MCAQAwCgIBAAICI5sC
// SIG // Af8wBwIBAAICEkYwCgIFAOapOUMCAQAwNgYKKwYBBAGE
// SIG // WQoEAjEoMCYwDAYKKwYBBAGEWQoDAqAKMAgCAQACAweh
// SIG // IKEKMAgCAQACAwGGoDANBgkqhkiG9w0BAQUFAAOBgQAi
// SIG // PmmPkIOsTV7ckIYFZrzdr2ASrHz4E+S9uPybZENZ1uZe
// SIG // VtNHVMe5DgDuGDGeyb94A8mPE95Hg2mZ+pCItxdf1g/Z
// SIG // bHzaNCZ6dKzk6t+aaQt10q6V3kDaVO5c/a6SIjjegsOC
// SIG // CrNCJajVFn+8b3FmDpssf7uWPVr98xTt/hF/NTGCBA0w
// SIG // ggQJAgEBMIGTMHwxCzAJBgNVBAYTAlVTMRMwEQYDVQQI
// SIG // EwpXYXNoaW5ndG9uMRAwDgYDVQQHEwdSZWRtb25kMR4w
// SIG // HAYDVQQKExVNaWNyb3NvZnQgQ29ycG9yYXRpb24xJjAk
// SIG // BgNVBAMTHU1pY3Jvc29mdCBUaW1lLVN0YW1wIFBDQSAy
// SIG // MDEwAhMzAAABrfzfTVjjXTLpAAEAAAGtMA0GCWCGSAFl
// SIG // AwQCAQUAoIIBSjAaBgkqhkiG9w0BCQMxDQYLKoZIhvcN
// SIG // AQkQAQQwLwYJKoZIhvcNAQkEMSIEIJu+Be9ZV7JEzdF6
// SIG // tkjUrrfcyWJYkyZpMzpVaGV84/gvMIH6BgsqhkiG9w0B
// SIG // CRACLzGB6jCB5zCB5DCBvQQgn+p8PQkeXtfjrbXJ9cPf
// SIG // dipp/GDE2Pw1jyB3jGzLUIIwgZgwgYCkfjB8MQswCQYD
// SIG // VQQGEwJVUzETMBEGA1UECBMKV2FzaGluZ3RvbjEQMA4G
// SIG // A1UEBxMHUmVkbW9uZDEeMBwGA1UEChMVTWljcm9zb2Z0
// SIG // IENvcnBvcmF0aW9uMSYwJAYDVQQDEx1NaWNyb3NvZnQg
// SIG // VGltZS1TdGFtcCBQQ0EgMjAxMAITMwAAAa38301Y410y
// SIG // 6QABAAABrTAiBCCwfWXJYhJ1sF6nOLf9SPgtQWuJCHXO
// SIG // LVeEt9KyQnElODANBgkqhkiG9w0BAQsFAASCAgCCn9SS
// SIG // g9vJhbrs2+sxF8JoTGtjIYt0H1NwPtoNEc+A7rtI+kHn
// SIG // mMJWk0Xmezw9/xweaTntBq1Qnq2WvlTpuPCTFyESLQAM
// SIG // rHen9xHuLQnCuyavtL9/bv22AIhBjaPWMW9sJlb+ygLL
// SIG // K8z0Q78XqoPRZHe6omD8xqIhtsJX8AAC9ntAuIonHfXQ
// SIG // coGj1wOQk/Epk+tMeTv5pMJiPTOR7PAggljQWlFe4zN/
// SIG // fW3UD1kIM9IOzQxqoADvyvzVxEtR+neoBSb/qRW6kA96
// SIG // wgwSSLI6kyWSbyIF6Cirsejlxwo6cWR/IxnUW1GWplbz
// SIG // jjAUh6Qg8mN0HaqTiwgVifCYFn3obVbsyZzUZfJs4w9p
// SIG // 7Mg2pUWL1zUIuKBHDC9+yTCV12icco/UPA2/j9yilko4
// SIG // FnGJZ8QsuTyifedzge8Ad+wX4fCeARCUApqbMwrF23GP
// SIG // 2wN1RVYP7Icyu6KboXn9L59WtcIpjgnDWJJsH3wItkuM
// SIG // e0ssr61c6U2AJ/k7fPYoIDMNbOtOU8pQivseNgrIQ/58
// SIG // nLbu86YAj2NHFWGtKbpnw0Xz+a3+TzGoT533Ua5bfvmV
// SIG // 5G8NX7nkYgMHCmGqd0rN+XMMxaZU3CZPQPAJ9oi0YQKJ
// SIG // L8j7ORsqL4Tc1xjscaTJiya+wTmbc5KbM++JHsfWVLgv
// SIG // y1Eep3YkZB9KXCCCQg==
// SIG // End signature block
