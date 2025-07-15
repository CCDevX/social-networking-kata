import path from "path";
import { FileSystemMessageRepository } from "../infra/message.fs.repository";
import * as fs from "node:fs";
import { messageBuilder } from "./message.builder";

const testMessagePath = path.join(__dirname, "message-test.json");

describe("FileSystemMessageRepository", () => {
  beforeEach(async () => {
    await fs.promises.writeFile(testMessagePath, JSON.stringify([]));
  });

  test("save() can save a message in the filesystem", async () => {
    const messageRepository = new FileSystemMessageRepository(testMessagePath);
    await messageRepository.save(
      messageBuilder()
        .withId("m1")
        .authoredBy("Alice")
        .withText("Hello World")
        .publishedAt(new Date("2023-01-19T19:00:00.000Z"))
        .build(),
    );
    const messagesData = await fs.promises.readFile(testMessagePath);
    const messagesJson = JSON.parse(messagesData.toString());
    expect(messagesJson).toEqual([
      {
        id: "m1",
        author: "Alice",
        text: "Hello World",
        publishedAt: "2023-01-19T19:00:00.000Z",
      },
    ]);
  });

  test("save() can update a existing message in the filesystem", async () => {
    const messageRepository = new FileSystemMessageRepository(testMessagePath);
    await fs.promises.writeFile(
      testMessagePath,
      JSON.stringify([
        {
          id: "m1",
          author: "Alice",
          text: "Hello World",
          publishedAt: "2023-01-19T19:00:00.000Z",
        },
      ]),
    );

    await messageRepository.save(
      messageBuilder()
        .withId("m1")
        .authoredBy("Alice")
        .withText("Message Edited")
        .publishedAt(new Date("2023-01-19T19:00:00.000Z"))
        .build(),
    );
    const messagesData = await fs.promises.readFile(testMessagePath);
    const messagesJson = JSON.parse(messagesData.toString());
    expect(messagesJson).toEqual([
      {
        id: "m1",
        author: "Alice",
        text: "Message Edited",
        publishedAt: "2023-01-19T19:00:00.000Z",
      },
    ]);
  });

  test("getById() returns a message by its id", async () => {
    const messageRepository = new FileSystemMessageRepository(testMessagePath);
    await fs.promises.writeFile(
      testMessagePath,
      JSON.stringify([
        {
          id: "m1",
          author: "Alice",
          text: "Hello World",
          publishedAt: "2023-01-19T19:00:00.000Z",
        },
        {
          id: "m2",
          author: "Bob",
          text: "Hello from Bob",
          publishedAt: "2023-01-19T19:55:00.000Z",
        },
      ]),
    );

    const bobMessage = await messageRepository.getById("m2");

    expect(bobMessage).toEqual(
      messageBuilder()
        .withId("m2")
        .authoredBy("Bob")
        .withText("Hello from Bob")
        .publishedAt(new Date("2023-01-19T19:55:00.000Z"))
        .build(),
    );
  });

  test("getAllOfUser() returns all the messages of a specific user", async () => {
    const messageRepository = new FileSystemMessageRepository(testMessagePath);
    await fs.promises.writeFile(
      testMessagePath,
      JSON.stringify([
        {
          id: "m1",
          author: "Alice",
          text: "Hello World",
          publishedAt: "2023-01-19T19:00:00.000Z",
        },
        {
          id: "m2",
          author: "Bob",
          text: "Hello from Bob",
          publishedAt: "2023-01-19T19:55:00.000Z",
        },
        {
          id: "m3",
          author: "Alice",
          text: "How are you ?",
          publishedAt: "2023-01-19T19:56:00.000Z",
        },
      ]),
    );

    const aliceMessages = await messageRepository.getAllOfUser("Alice");

    expect(aliceMessages).toHaveLength(2);
    expect(aliceMessages).toEqual(
      expect.arrayContaining([
        messageBuilder()
          .withId("m1")
          .authoredBy("Alice")
          .withText("Hello World")
          .publishedAt(new Date("2023-01-19T19:00:00.000Z"))
          .build(),
        messageBuilder()
          .withId("m3")
          .authoredBy("Alice")
          .withText("How are you ?")
          .publishedAt(new Date("2023-01-19T19:56:00.000Z"))
          .build(),
      ]),
    );
  });
});
