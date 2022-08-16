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
// SIG // MIInywYJKoZIhvcNAQcCoIInvDCCJ7gCAQExDzANBglg
// SIG // hkgBZQMEAgEFADB3BgorBgEEAYI3AgEEoGkwZzAyBgor
// SIG // BgEEAYI3AgEeMCQCAQEEEBDgyQbOONQRoqMAEEvTUJAC
// SIG // AQACAQACAQACAQACAQAwMTANBglghkgBZQMEAgEFAAQg
// SIG // LDP2rotPh55uRuVE78lmzbe51/1OUIQr+ptrw1KZPvKg
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
// SIG // AYI3AgEVMC8GCSqGSIb3DQEJBDEiBCA0A0HrdNWUU/Tw
// SIG // ZGSoJ2OLlejDn/arQJB0ivRQEG0xNjBUBgorBgEEAYI3
// SIG // AgEMMUYwRKAkgCIATQBpAG4AZQBjAHIAYQBmAHQAIABC
// SIG // AGUAZAByAG8AYwBroRyAGmh0dHBzOi8vd3d3Lm1pbmVj
// SIG // cmFmdC5uZXQvMA0GCSqGSIb3DQEBAQUABIIBABDJSaV9
// SIG // ZAQ5dEsMgZjmgb/vcDmeMWvMiPdlgn21CJZPkb5+w09d
// SIG // nu58dfQn/BOJgSwiawRll+jOtvtNED80Qt8GzKpdM/lO
// SIG // Ii9+lfY+Az/7+eG8hkbTvnAwU9wHu9AzmZ/wc0cIBy6S
// SIG // By3p8wF/QjHAeZ0joA+mVxvY1NhBCpOq2w616wBcxtEf
// SIG // Zw/y7SoWAN6Ls642ANozH28/mH1C/EDT0R01U1fr2UXt
// SIG // cC9stG8DCItlQpx8C3OpC7SAf6MxiuQQQkVRX/hawIKM
// SIG // qdaJxTWL4lkYgPyHFOZVkeqd9wLkvIk2b9EIZ2eYhJWC
// SIG // xDzxRC3jmhaYT+3I7VH+9j/Tyn6hghcWMIIXEgYKKwYB
// SIG // BAGCNwMDATGCFwIwghb+BgkqhkiG9w0BBwKgghbvMIIW
// SIG // 6wIBAzEPMA0GCWCGSAFlAwQCAQUAMIIBWQYLKoZIhvcN
// SIG // AQkQAQSgggFIBIIBRDCCAUACAQEGCisGAQQBhFkKAwEw
// SIG // MTANBglghkgBZQMEAgEFAAQgrTVNBPTtqTTc5UtY/MI9
// SIG // fl6/C6CtOECGRl7pOBWo+lECBmK7UPTQUBgTMjAyMjA3
// SIG // MDIwMDI4NTAuNDA3WjAEgAIB9KCB2KSB1TCB0jELMAkG
// SIG // A1UEBhMCVVMxEzARBgNVBAgTCldhc2hpbmd0b24xEDAO
// SIG // BgNVBAcTB1JlZG1vbmQxHjAcBgNVBAoTFU1pY3Jvc29m
// SIG // dCBDb3Jwb3JhdGlvbjEtMCsGA1UECxMkTWljcm9zb2Z0
// SIG // IElyZWxhbmQgT3BlcmF0aW9ucyBMaW1pdGVkMSYwJAYD
// SIG // VQQLEx1UaGFsZXMgVFNTIEVTTjpGQzQxLTRCRDQtRDIy
// SIG // MDElMCMGA1UEAxMcTWljcm9zb2Z0IFRpbWUtU3RhbXAg
// SIG // U2VydmljZaCCEWUwggcUMIIE/KADAgECAhMzAAABjlnb
// SIG // RgCoEJTMAAEAAAGOMA0GCSqGSIb3DQEBCwUAMHwxCzAJ
// SIG // BgNVBAYTAlVTMRMwEQYDVQQIEwpXYXNoaW5ndG9uMRAw
// SIG // DgYDVQQHEwdSZWRtb25kMR4wHAYDVQQKExVNaWNyb3Nv
// SIG // ZnQgQ29ycG9yYXRpb24xJjAkBgNVBAMTHU1pY3Jvc29m
// SIG // dCBUaW1lLVN0YW1wIFBDQSAyMDEwMB4XDTIxMTAyODE5
// SIG // Mjc0NVoXDTIzMDEyNjE5Mjc0NVowgdIxCzAJBgNVBAYT
// SIG // AlVTMRMwEQYDVQQIEwpXYXNoaW5ndG9uMRAwDgYDVQQH
// SIG // EwdSZWRtb25kMR4wHAYDVQQKExVNaWNyb3NvZnQgQ29y
// SIG // cG9yYXRpb24xLTArBgNVBAsTJE1pY3Jvc29mdCBJcmVs
// SIG // YW5kIE9wZXJhdGlvbnMgTGltaXRlZDEmMCQGA1UECxMd
// SIG // VGhhbGVzIFRTUyBFU046RkM0MS00QkQ0LUQyMjAxJTAj
// SIG // BgNVBAMTHE1pY3Jvc29mdCBUaW1lLVN0YW1wIFNlcnZp
// SIG // Y2UwggIiMA0GCSqGSIb3DQEBAQUAA4ICDwAwggIKAoIC
// SIG // AQCqIwKro4zMtrnCu1x/sF/1/VZdb2Smps4HOA8m9oYu
// SIG // tkbu3CDCpNFZ/UWSOkkoE4blA8hHLtrogVUDLRb60FoV
// SIG // fgifgNsF/a0a5vJj36FFT6FF7A8kfkJg6+k+HvsV8Yzr
// SIG // f46XBFenlgRHq0LRZEqfeavJam3gLAAO4a/QsPZCOeGG
// SIG // C1FWJ2yIOef35ouMy41qlSGy0aoKvslxBm3Rms9Qdb9O
// SIG // pMnKZ5TV6qA2isRtN53pRDItpNUCaFc1BcMKF9rnbqdb
// SIG // tFDsvi1df0tzSiC6IJKQ+W7l2s0Do0zzP5RdA4AfFV8h
// SIG // BeaL5jdJXaGvZ1zFvL2eVPNi9/hkOvlalzC3u1N1EgmJ
// SIG // tcexdYwquY7OKWIYNOgvHfhr9y1kTg04ueWspBY31kb4
// SIG // 7HnNFqsrUSFKFqEzS5A2FvoEmOnf5zR43MwUnaotmoOn
// SIG // b/diXlD7iT4wMctOKk/pUF3Fx1V93iaCtVPHdp87ko1+
// SIG // AyeAYZ+FJrAatpFbbwSGss6ymYjGKL3YTu+Odwna1yOE
// SIG // sKMECtWk+HdxkbmDdlXLmKIBqgNqzCk2CcwUArlSfWt4
// SIG // r4wWE+L2Iye9Q/C1MMMm3lgQPkMBPeYFTGnlAfe3tGFn
// SIG // AAk0tYu2lN4YXu5vzWxIpi/Zqt1rMB71ctLXS1Xag4+t
// SIG // yeIYnOVdbtU+/GpA3F7yUIMDbQIDAQABo4IBNjCCATIw
// SIG // HQYDVR0OBBYEFOxB+TP2BPjg3/kby80drJ6n5pXkMB8G
// SIG // A1UdIwQYMBaAFJ+nFV0AXmJdg/Tl0mWnG1M1GelyMF8G
// SIG // A1UdHwRYMFYwVKBSoFCGTmh0dHA6Ly93d3cubWljcm9z
// SIG // b2Z0LmNvbS9wa2lvcHMvY3JsL01pY3Jvc29mdCUyMFRp
// SIG // bWUtU3RhbXAlMjBQQ0ElMjAyMDEwKDEpLmNybDBsBggr
// SIG // BgEFBQcBAQRgMF4wXAYIKwYBBQUHMAKGUGh0dHA6Ly93
// SIG // d3cubWljcm9zb2Z0LmNvbS9wa2lvcHMvY2VydHMvTWlj
// SIG // cm9zb2Z0JTIwVGltZS1TdGFtcCUyMFBDQSUyMDIwMTAo
// SIG // MSkuY3J0MAwGA1UdEwEB/wQCMAAwEwYDVR0lBAwwCgYI
// SIG // KwYBBQUHAwgwDQYJKoZIhvcNAQELBQADggIBADVQr3HM
// SIG // h5OUqFJsufRt6RHmBiHpsHVdCmW4KoIDXmyRnftSKVoU
// SIG // nDz4aSUMvOU2FI/aY6I7NXIKrySSmqd9RzTVloF7NDGD
// SIG // vup6+PaIzKDf1gl96IIiHFg4W6DB6lis87wyUH+i579W
// SIG // EiINvV41hOU9Ka/elqWyC2StvSijQXS5aZfgRBUYpGjR
// SIG // QQ21l61UjFrQn0OlR2NBY94SH1wQz5GATbrnDlYBVv5Y
// SIG // 3HSJaIXiJNsKatZpUQ5f3Z02oGb1tPVTucbA3kLKCk0C
// SIG // ARpietMzHU3gCPE5sAIM3kN28aW787QN8xZVzqqTqIoM
// SIG // ULpaldBKQyWuVcgj82Gn7T6ehTq18Skcou3t9ib2h/mL
// SIG // 9CiZwLCj96SI4KNiS2nf3ei+gLU7a4u1sucxWUTmtoEs
// SIG // E1Jsg1npAvGIDjWVedVUsjMOKFQvwxT0Iy8bix1uGTYV
// SIG // fzO+uw/k94EjDV9p6cxm7PRXdRcK1Tk6THl+aKhaKItl
// SIG // IKLWWNrFf4ETBCKKcKL68Tn1tNgjkVu5Hy0O4YuJW78l
// SIG // KlUVevNYw/YqfXWwIsAYSOolhSY7W1Fjb0p3sdwiPaeJ
// SIG // IHQ9A4KNiWcKfLCcOKepLUJe9GyKyNWVLVGnhOa6Sz6k
// SIG // bGIwbMXnzNxv6GgUrI424vdv62DFMDPewXcFVf26T0zk
// SIG // X44Sh7IvIZ8t6Q0CMIIHcTCCBVmgAwIBAgITMwAAABXF
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
// SIG // JAYDVQQLEx1UaGFsZXMgVFNTIEVTTjpGQzQxLTRCRDQt
// SIG // RDIyMDElMCMGA1UEAxMcTWljcm9zb2Z0IFRpbWUtU3Rh
// SIG // bXAgU2VydmljZaIjCgEBMAcGBSsOAwIaAxUAPWIr6k9O
// SIG // EeqClrnGw+aJiu5ZW4yggYMwgYCkfjB8MQswCQYDVQQG
// SIG // EwJVUzETMBEGA1UECBMKV2FzaGluZ3RvbjEQMA4GA1UE
// SIG // BxMHUmVkbW9uZDEeMBwGA1UEChMVTWljcm9zb2Z0IENv
// SIG // cnBvcmF0aW9uMSYwJAYDVQQDEx1NaWNyb3NvZnQgVGlt
// SIG // ZS1TdGFtcCBQQ0EgMjAxMDANBgkqhkiG9w0BAQUFAAIF
// SIG // AOZpw98wIhgPMjAyMjA3MDIwMzA1MDNaGA8yMDIyMDcw
// SIG // MzAzMDUwM1owdDA6BgorBgEEAYRZCgQBMSwwKjAKAgUA
// SIG // 5mnD3wIBADAHAgEAAgIfQzAHAgEAAgIRYDAKAgUA5msV
// SIG // XwIBADA2BgorBgEEAYRZCgQCMSgwJjAMBgorBgEEAYRZ
// SIG // CgMCoAowCAIBAAIDB6EgoQowCAIBAAIDAYagMA0GCSqG
// SIG // SIb3DQEBBQUAA4GBADfHN769yGw/gZj1DBtgu3lCTnxM
// SIG // dLlRPeXi95tZaYeWC92ZnE72u2nycc/WKttH7TzsE9kO
// SIG // q3RabjQBJyZmu1y/4FmGLgP7HHEya1vVKOhYEA0MRTwU
// SIG // Mu1Sz6kqbyBE6BU14NH2L8T/03oPBAO/l1wf3gcQXlO5
// SIG // /xci7fropXH+MYIEDTCCBAkCAQEwgZMwfDELMAkGA1UE
// SIG // BhMCVVMxEzARBgNVBAgTCldhc2hpbmd0b24xEDAOBgNV
// SIG // BAcTB1JlZG1vbmQxHjAcBgNVBAoTFU1pY3Jvc29mdCBD
// SIG // b3Jwb3JhdGlvbjEmMCQGA1UEAxMdTWljcm9zb2Z0IFRp
// SIG // bWUtU3RhbXAgUENBIDIwMTACEzMAAAGOWdtGAKgQlMwA
// SIG // AQAAAY4wDQYJYIZIAWUDBAIBBQCgggFKMBoGCSqGSIb3
// SIG // DQEJAzENBgsqhkiG9w0BCRABBDAvBgkqhkiG9w0BCQQx
// SIG // IgQgHQIr5itH1wwXa4vX6SEN6eiHzsSa3PgRpOiGzudD
// SIG // VGowgfoGCyqGSIb3DQEJEAIvMYHqMIHnMIHkMIG9BCC9
// SIG // BY8hO+KBpS5Xn5/+VazcFdnAn+XWZ/7J6W7mdebEJTCB
// SIG // mDCBgKR+MHwxCzAJBgNVBAYTAlVTMRMwEQYDVQQIEwpX
// SIG // YXNoaW5ndG9uMRAwDgYDVQQHEwdSZWRtb25kMR4wHAYD
// SIG // VQQKExVNaWNyb3NvZnQgQ29ycG9yYXRpb24xJjAkBgNV
// SIG // BAMTHU1pY3Jvc29mdCBUaW1lLVN0YW1wIFBDQSAyMDEw
// SIG // AhMzAAABjlnbRgCoEJTMAAEAAAGOMCIEIAA8dfT2plni
// SIG // Lylvz6BVfiQ2p+L4OXFV05Dfe18k7ZZWMA0GCSqGSIb3
// SIG // DQEBCwUABIICAAu0lknNW/0pSCuL7jKpk1To3iJtv/Qv
// SIG // 90Yfbs+aAbD3wHfAluqCx6QXJ3uFLZB9QXdPGebOvUWT
// SIG // ijpfvyTkMJnD6jIZc8JSSf4pgUq6o4B6qp5yhyWqn4Ww
// SIG // FQizsHLh6RymcbIVFnHmMtm4yTeZ/u5cqrm85lSvxi38
// SIG // HSvMvGQP35XfwHRu6UdXNnWedFZoMPZR4vZT1zPbZNCE
// SIG // 7yk4KtR6WnlIxIwZi22LOeIhbea9la0ABfpj+m8hO+Gp
// SIG // 6wR0v59/TCvrAT5yaBEWXWWe+nBfYXlI+QB9wTX9ydrp
// SIG // +cYh7Z7GtSy3senKXLyz68095Cm6SjJ4fWZyXg2VJk/e
// SIG // I2PAASSuHCjwyn+P3kNU7U5NE6XuVHnPCMcu2n1YPz5S
// SIG // LvE4Ss93/nf0N2Su4Gk096fAFN/J+6gULc5ygMdDRdY4
// SIG // o12a2ZRRv+QTTdBcc6kYmpKBDsVBYo0ir8FGkR/eJxcP
// SIG // gyacaaWaRAAhjljvDdjstqqmCBaTsEIhuy0dLddsegrY
// SIG // YeTgRKR++hZs3ZItFiCCsZvBDQth+azXWH7NYx3+QHj5
// SIG // 5MspzEG0lupFVesG3e0pLU8Pp3O0NEJG04CIL5fmED2G
// SIG // FyGzdDWy8MQLszngDW4jP4+JWSB21ord1cBoffOzY8eI
// SIG // wzHYwrpQVW17DaRL7HrztwKdNPn05NYZfmqi
// SIG // End signature block
