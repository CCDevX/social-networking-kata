#!/usr/bin/env node
import { Command } from "commander";
import {
  DateProvider,
  PostMessageCommand,
  PostMessageUseCase,
} from "./src/post-message.usecase";
import { InMemoryMessageRepository } from "./src/message.inmemory.repository";
import { FileSystemMessageRepository } from "./src/message.fs.repository";
import { ViewTimelineUseCase } from "./src/view-timeline.usecase";
import {
  EditMessageCommand,
  EditMessageUseCase,
} from "./src/edit-message.usecase";

class RealDateProvider implements DateProvider {
  getNow(): Date | undefined {
    return new Date();
  }
}

const program = new Command();
const messageRepository = new FileSystemMessageRepository();
const dateProvider = new RealDateProvider();
const postMessageUseCase = new PostMessageUseCase(
  messageRepository,
  dateProvider,
);

const viewTimelineUseCase = new ViewTimelineUseCase(
  messageRepository,
  dateProvider,
);

const editMessageUseCase = new EditMessageUseCase(messageRepository);

program
  .version("1.0.0")
  .description("Social Networking Kata")
  .addCommand(
    new Command("post")
      .argument("<user>", "the current user")
      .argument("<message>", "the message to post")
      .action(async (user, message) => {
        const postMessageCommand: PostMessageCommand = {
          id: `${Math.floor(Math.random() * 10000000)}`,
          text: message,
          author: user,
        };
        try {
          await postMessageUseCase.handle(postMessageCommand);
          console.log("Message posted");
          // console.table([messageRepository.message]);
          process.exit(0);
        } catch (err) {
          console.error("Error : ", err);
          process.exit(1);
        }
      }),
  )
  .addCommand(
    new Command("view")
      .argument("<user>", "the user to view")
      .action(async (user) => {
        try {
          const timeline = await viewTimelineUseCase.handle({ user });
          console.table(timeline);
          process.exit(0);
        } catch (err) {
          console.error("Error : ", err);
          process.exit(1);
        }
      }),
  )
  .addCommand(
    new Command("edit")
      .argument("<message-id>", "the message id of the message to edit")
      .argument("<message>", "the new message text")
      .action(async (messageId, message) => {
        const editMessageCommand: EditMessageCommand = {
          messageId: messageId,
          text: message,
        };
        try {
          await editMessageUseCase.handle(editMessageCommand);
          console.log("Message edited");
          // console.table([messageRepository.message]);
          process.exit(0);
        } catch (err) {
          console.error("Error : ", err);
          process.exit(1);
        }
      }),
  );

async function main() {
  await program.parseAsync();
}

main();
