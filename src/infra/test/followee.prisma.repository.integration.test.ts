import { PrismaClient } from "../generated/prisma";
import { PrismaFolloweeRepository } from "../prisma/followee.prisma.repository";
import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from "testcontainers";
import { promisify } from "node:util";
import { exec } from "node:child_process";

const asyncExec = promisify(exec);

describe("PrismaFolloweeRepository", () => {
  let container: StartedPostgreSqlContainer;
  let prismaClient: PrismaClient;
  beforeAll(async () => {
    container = await new PostgreSqlContainer()
      .withDatabase("network-test")
      .withUsername("network-test")
      .withPassword("network-test")
      .withExposedPorts(5432)
      .start();
    const databaseUrl = `postgresql://network-test:network-test@${container.getHost()}:${container.getMappedPort(
      5432,
    )}/network-test?schema=public`;
    prismaClient = new PrismaClient({
      datasources: {
        db: {
          url: databaseUrl,
        },
      },
    });
    await asyncExec(
      `cross-env DATABASE_URL=${databaseUrl} npx prisma migrate deploy`,
    );

    return prismaClient.$connect();
  }, 30000);

  afterAll(async () => {
    await container.stop({ timeout: 1000 });
    return prismaClient.$disconnect();
  });

  beforeEach(() => {
    return prismaClient.user.deleteMany();
  });

  test("saveFollowee", async () => {
    const followeeRepository = new PrismaFolloweeRepository(prismaClient);
    await followeeRepository.saveFollowee({
      user: "Alice",
      followee: "Charlie",
    });
    await followeeRepository.saveFollowee({
      user: "Bob",
      followee: "Tom",
    });

    await followeeRepository.saveFollowee({
      user: "Alice",
      followee: "Bob",
    });

    const alice = await prismaClient.user.findFirstOrThrow({
      where: { name: "Alice" },
      include: { following: true },
    });
    expect(alice.following).toEqual([
      expect.objectContaining({
        name: "Charlie",
      }),
      expect.objectContaining({
        name: "Bob",
      }),
    ]);
  });

  test("getFolloweesOf", async () => {
    const followeeRepository = new PrismaFolloweeRepository(prismaClient);
    await followeeRepository.saveFollowee({
      user: "Alice",
      followee: "Charlie",
    });
    await followeeRepository.saveFollowee({ user: "Alice", followee: "Bob" });

    const followees = await followeeRepository.getFolloweesOf("Alice");

    expect(followees).toHaveLength(2);
    expect(followees).toEqual(expect.arrayContaining(["Bob", "Charlie"]));
  });
});
