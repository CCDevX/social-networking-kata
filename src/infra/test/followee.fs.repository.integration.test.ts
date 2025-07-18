import path from "path";
import fs from "fs";
import { FileSystemFolloweeRepository } from "../followee.fs.repository";

const testFolloweePath = path.join(__dirname, "followee-test.json");

describe("FileSystemFolloweeRepository", () => {
  beforeEach(async () => {
    await fs.promises.writeFile(testFolloweePath, JSON.stringify({}));
  });
  test("saveFollowee() should save a followee", async () => {
    const followeeRepository = new FileSystemFolloweeRepository(
      testFolloweePath,
    );

    await fs.promises.writeFile(
      testFolloweePath,
      JSON.stringify({
        Alice: ["Bob"],
        Bob: ["Charlie"],
      }),
    );

    await followeeRepository.saveFollowee({
      user: "Alice",
      followee: "Charlie",
    });

    const followeesData = await fs.promises.readFile(testFolloweePath);
    const followeesJSON: string[] = JSON.parse(followeesData.toString());
    expect(followeesJSON).toEqual({
      Alice: ["Bob", "Charlie"],
      Bob: ["Charlie"],
    });
  });

  test("saveFollowee() should save a followee when they was no followee before", async () => {
    const followeeRepository = new FileSystemFolloweeRepository(
      testFolloweePath,
    );

    await fs.promises.writeFile(
      testFolloweePath,
      JSON.stringify({
        Bob: ["Charlie"],
      }),
    );

    await followeeRepository.saveFollowee({
      user: "Alice",
      followee: "Charlie",
    });

    const followeesData = await fs.promises.readFile(testFolloweePath);
    const followeesJSON: string[] = JSON.parse(followeesData.toString());
    expect(followeesJSON).toEqual({
      Alice: ["Charlie"],
      Bob: ["Charlie"],
    });
  });

  test("getFolloweesOf() should return the followees of a user", async () => {
    const followeeRepository = new FileSystemFolloweeRepository(
      testFolloweePath,
    );

    await fs.promises.writeFile(
      testFolloweePath,
      JSON.stringify({
        Alice: ["Bob", "Charlie"],
        Bob: ["Charlie"],
      }),
    );

    const [aliceFollowees, bobFollowees] = await Promise.all([
      followeeRepository.getFolloweesOf("Alice"),
      followeeRepository.getFolloweesOf("Bob"),
    ]);

    expect(aliceFollowees).toEqual(["Bob", "Charlie"]);
    expect(bobFollowees).toEqual(["Charlie"]);
  });
});
