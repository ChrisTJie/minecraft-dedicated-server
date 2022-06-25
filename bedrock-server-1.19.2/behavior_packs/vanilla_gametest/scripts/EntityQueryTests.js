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
  const e0 = test.spawn("minecraft:cow", new BlockLocation(1, 2, 1));
  const e1 = test.spawn("minecraft:cow", new BlockLocation(3, 2, 1));
  const e2 = test.spawn("minecraft:cow", new BlockLocation(5, 2, 1));
  const e3 = test.spawn("husk", new BlockLocation(1, 2, 3));
  const e4 = test.spawn("minecraft:zombie", new BlockLocation(3, 2, 3));
  const e5 = test.spawn("minecraft:sheep", new BlockLocation(5, 2, 3));
  const e6 = test.spawn("sheep", new BlockLocation(1, 2, 5));
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
// SIG // MIInxwYJKoZIhvcNAQcCoIInuDCCJ7QCAQExDzANBglg
// SIG // hkgBZQMEAgEFADB3BgorBgEEAYI3AgEEoGkwZzAyBgor
// SIG // BgEEAYI3AgEeMCQCAQEEEBDgyQbOONQRoqMAEEvTUJAC
// SIG // AQACAQACAQACAQACAQAwMTANBglghkgBZQMEAgEFAAQg
// SIG // emTU8bXwlJTH8IRwcrJ9P1EyBNbjtke2qoWLhP3N4P6g
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
// SIG // ARUwLwYJKoZIhvcNAQkEMSIEIFKz26MN+LACufBgXzj4
// SIG // zFKHrKr0QkCgI5KkuDjrI+6iMFQGCisGAQQBgjcCAQwx
// SIG // RjBEoCSAIgBNAGkAbgBlAGMAcgBhAGYAdAAgAEIAZQBk
// SIG // AHIAbwBjAGuhHIAaaHR0cHM6Ly93d3cubWluZWNyYWZ0
// SIG // Lm5ldC8wDQYJKoZIhvcNAQEBBQAEggEAB+RGI61dW0pX
// SIG // UcYxq/N8h4bFVtnu+bvt4CSzgA/3tcRaOoQH6avaLkfJ
// SIG // TtrkayXovazXB5rTh/I+Rp+iwx39wc3fddCeOkHh9b9W
// SIG // XxQqhZ2bvLDhE/9IPXN/DEFiMxTYmqzSz+MpBUws45bL
// SIG // JA+2P6drR/cdamLAhC5FSa2zPY5obEebsPVRJSvS2CRA
// SIG // luuUqeG3tptYdQhaHrD94xC1fwLNOFhIZPz59ShTP/D8
// SIG // mClkO4bKVyZ6oF7rUoF1qr21/rRu0QFA7suCiFJuVji2
// SIG // ftPDDouF+5EyUP22VJmBrMfQrddCkZS/3S+DYMHZfws0
// SIG // jnsGGi4XA0S/rW+8IZCmTaGCFxYwghcSBgorBgEEAYI3
// SIG // AwMBMYIXAjCCFv4GCSqGSIb3DQEHAqCCFu8wghbrAgED
// SIG // MQ8wDQYJYIZIAWUDBAIBBQAwggFZBgsqhkiG9w0BCRAB
// SIG // BKCCAUgEggFEMIIBQAIBAQYKKwYBBAGEWQoDATAxMA0G
// SIG // CWCGSAFlAwQCAQUABCDI96w5ujeC5HEG0u4kIHO5ZHSA
// SIG // kVS2Q8Czje2uwtrcdAIGYoZgzC6hGBMyMDIyMDYxNjIz
// SIG // MTYwMS44NDdaMASAAgH0oIHYpIHVMIHSMQswCQYDVQQG
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
// SIG // MQ0GCyqGSIb3DQEJEAEEMC8GCSqGSIb3DQEJBDEiBCD+
// SIG // pgLH3JuBOVzDP22wZVb3caL4I5vDGfX7pGBZzDi0DzCB
// SIG // +gYLKoZIhvcNAQkQAi8xgeowgecwgeQwgb0EIPS94Kt1
// SIG // 30q+fvO/fzD4MbWQhQaE7RHkOH6AkjlNVCm9MIGYMIGA
// SIG // pH4wfDELMAkGA1UEBhMCVVMxEzARBgNVBAgTCldhc2hp
// SIG // bmd0b24xEDAOBgNVBAcTB1JlZG1vbmQxHjAcBgNVBAoT
// SIG // FU1pY3Jvc29mdCBDb3Jwb3JhdGlvbjEmMCQGA1UEAxMd
// SIG // TWljcm9zb2Z0IFRpbWUtU3RhbXAgUENBIDIwMTACEzMA
// SIG // AAGKPjiN0g4C+ugAAQAAAYowIgQgFWqDVlpVo1Gk5sJn
// SIG // LCDJlfODiMv2TK+9geCCyePmVRkwDQYJKoZIhvcNAQEL
// SIG // BQAEggIAJ+oMPZTrIkIzpTRQpvDeN6d0qI1xnhmMLCGO
// SIG // 1f/PwIn7l6BCPTgU2mne71qP8vhOPE6KsS7q0y3hfNQy
// SIG // lmh6Fvmr+7f6M6vpRSBbCdqJR1Qh9uE/WQO46IPe3PYP
// SIG // T1MCwRVQN42l2kEXH1Ymbmze0zbyciXgJ/bZBMR0cu/d
// SIG // 8pP1V76IMrajNfVqcKay5DUfOeaWWpnPJwZU18T112mJ
// SIG // Q7A+F6hO3sGpjlhXEVhAXTGOpcchmZI5ffZptY8cRR8u
// SIG // G9SiP8uCnHk5TPlZE5vrDUqOqokErYRaxNB2oBCdHf9P
// SIG // B8MgFZz5zB7BCXQmpkuVeWkobX13xnA23B9GL6zY0eTX
// SIG // rZCdyxEztkfyOE5wepASUif/fMuzQyoMYiT1G7J2/ZB4
// SIG // zMLLkXfTUEjFXHl4MG227EARdXlDhbX37nH5nfLPFNwg
// SIG // SICP0bWk6fY3+OJ1FcUyS+TaNLXoUHwZ8LQ1Obr5tjJr
// SIG // 7WKQkAi5fBH0hEpCoyVON+y3cuHUtG+XW1pTI4DE1Rlg
// SIG // 7iWL+nN5R3CIGxPg1z8wycVqV6cv1sx7HWuy2m5/HCaw
// SIG // WCedkq5kDDw0ShspuSEEXrP1vMVeIcydtGBWosM0YnjF
// SIG // Ce0bQFaGObAMmNqUeYz7kDWxs1Eu8M4iZDr5lskTHax8
// SIG // yTINsMf+weOaB2pq5NLgb8q/gn/F/Es=
// SIG // End signature block
