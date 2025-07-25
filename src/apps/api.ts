#!/usr/bin/env node
import httpErrors from "http-errors";
import Fastify, { FastifyInstance, FastifyReply } from "fastify";
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

class ApiTimelinePresenter implements TimelinePresenter {
  constructor(private readonly reply: FastifyReply) {}
  show(timeline: Timeline): void {
    this.reply.status(200).send(timeline.data);
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

const fastify = Fastify({ logger: true });

const routes = async (fastifyInstance: FastifyInstance) => {
  fastifyInstance.post<{ Body: { user: string; message: string } }>(
    "/post",
    {},
    async (request, reply) => {
      const postMessageCommand: PostMessageCommand = {
        id: `${Math.floor(Math.random() * 10000000)}`,
        text: request.body.message,
        author: request.body.user,
      };
      try {
        const result = await postMessageUseCase.handle(postMessageCommand);
        if (result.isOk()) {
          reply.status(201);
        } else {
          reply.send(httpErrors[500](result.error.message));
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        reply.send(httpErrors[403](message));
      }
    },
  );

  fastifyInstance.post<{
    Body: { messageId: string; message: string };
  }>("/edit", {}, async (request, reply) => {
    const editMessageCommand: EditMessageCommand = {
      messageId: request.body.messageId,
      text: request.body.message,
    };
    try {
      const result = await editMessageUseCase.handle(editMessageCommand);
      if (result.isOk()) {
        reply.status(200);
      } else {
        reply.send(httpErrors[403](result.error.message));
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      reply.send(httpErrors[500](message));
    }
  });

  fastifyInstance.post<{
    Body: { user: string; userToFollow: string };
  }>("/follow", {}, async (request, reply) => {
    const followUserCommand: FollowUserCommand = {
      user: request.body.user,
      userToFollow: request.body.userToFollow,
    };
    try {
      await followUserUseCase.handle(followUserCommand);
      reply.status(201);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      reply.send(httpErrors[500](message));
    }
  });

  fastifyInstance.get<{
    Querystring: { user: string };
  }>("/view", {}, async (request, reply) => {
    const apiTimelinePresenter = new ApiTimelinePresenter(reply);
    try {
      await viewTimelineUseCase.handle(
        {
          user: request.query.user,
        },
        apiTimelinePresenter,
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      reply.send(httpErrors[500](message));
    }
  });

  fastifyInstance.get<{
    Querystring: { user: string };
  }>("/wall", {}, async (request, reply) => {
    const apiTimelinePresenter = new ApiTimelinePresenter(reply);
    try {
      await viewWallUseCase.handle(
        { user: request.query.user },
        apiTimelinePresenter,
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      reply.send(httpErrors[500](message));
    }
  });
};

fastify.register(routes);
fastify.addHook("onClose", async () => {
  await prismaClient.$disconnect();
});

async function main() {
  try {
    await prismaClient.$connect();
    await fastify.listen({ port: 3000 });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

main();
