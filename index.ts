#!/usr/bin/env node
import { Command } from "commander";
import {
  PostMessageCommand,
  PostMessageUseCase,
} from "./src/application/usecases/post-message.usecase";
import { FileSystemMessageRepository } from "./src/infra/message.fs.repository";
import { ViewTimelineUseCase } from "./src/application/usecases/view-timeline.usecase";
import {
  EditMessageCommand,
  EditMessageUseCase,
} from "./src/application/usecases/edit-message.usecase";
import { RealDateProvider } from "./src/infra/real-date-provider";
import {
  FollowUserCommand,
  FollowUserUseCase,
} from "./src/application/usecases/follow-user.usecase";
import { FileSystemFolloweeRepository } from "./src/infra/followee.fs.repository";
import { ViewWallUseCase } from "./src/application/usecases/view-wall.usecase";

const program = new Command();
const messageRepository = new FileSystemMessageRepository();
const followeeRepository = new FileSystemFolloweeRepository();
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

const followUserUseCase = new FollowUserUseCase(followeeRepository);

const viewWallUseCase = new ViewWallUseCase(
  messageRepository,
  followeeRepository,
  dateProvider,
);

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
  )
  .addCommand(
    new Command("follow")
      .argument("<user>", "the current user")
      .argument("<user-to-follow>", "the user to follow")
      .action(async (user, userToFollow) => {
        const followUserCommand: FollowUserCommand = {
          user: user,
          userToFollow: userToFollow,
        };
        try {
          await followUserUseCase.handle(followUserCommand);
          console.log("User followed");
          // console.table([messageRepository.message]);
          process.exit(0);
        } catch (err) {
          console.error("Error : ", err);
          process.exit(1);
        }
      }),
  )
  .addCommand(
    new Command("wall")
      .argument("<user>", "the user to view the wall of")
      .action(async (user) => {
        try {
          const wall = await viewWallUseCase.handle({ user });
          console.table(wall);
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
