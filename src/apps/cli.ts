#!/usr/bin/env node

import { Command } from "commander";
import { RealDateProvider } from "../infra/real-date-provider";
import {
  PostMessageCommand,
  PostMessageUseCase,
} from "../application/usecases/post-message.usecase";
import { ViewTimelineUseCase } from "../application/usecases/view-timeline.usecase";
import {
  EditMessageCommand,
  EditMessageUseCase,
} from "../application/usecases/edit-message.usecase";
import {
  FollowUserCommand,
  FollowUserUseCase,
} from "../application/usecases/follow-user.usecase";
import { ViewWallUseCase } from "../application/usecases/view-wall.usecase";
import { PrismaClient } from "../infra/generated/prisma";
import { PrismaMessageRepository } from "../infra/prisma/message.prisma.repository";
import { PrismaFolloweeRepository } from "../infra/prisma/followee.prisma.repository";
import { TimelinePresenter } from "../application/timeline.presenter";
import { Timeline } from "../domain/timeline";
import { DefaultTimelinePresenter } from "./timeline.default.presenter";

class CliTimePresenter implements TimelinePresenter {
  constructor(
    private readonly defaultTimelinePresent: DefaultTimelinePresenter,
  ) {}
  show(timeline: Timeline): void {
    console.table(this.defaultTimelinePresent.show(timeline));
  }
}

const prismaClient = new PrismaClient();

const messageRepository = new PrismaMessageRepository(prismaClient);
const followeeRepository = new PrismaFolloweeRepository(prismaClient);
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
);

const defautTimelinePresenter = new DefaultTimelinePresenter(dateProvider);
const cliTimelinePresenter = new CliTimePresenter(defautTimelinePresenter);

const program = new Command();

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
          const timeline = await viewTimelineUseCase.handle(
            { user },
            cliTimelinePresenter,
          );
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
          const wall = await viewWallUseCase.handle(
            { user },
            cliTimelinePresenter,
          );
          console.table(wall);
          process.exit(0);
        } catch (err) {
          console.error("Error : ", err);
          process.exit(1);
        }
      }),
  );

async function main() {
  await prismaClient.$connect();
  await program.parseAsync();
  await prismaClient.$disconnect();
}

main();
