import { FastifyInstance } from "fastify";
import { z } from "zod";

export async function postsModule(app: FastifyInstance) {
  // Get feed (posts from friends only)
  app.get("/posts/feed", async (request, reply) => {
    const user = (request as any).user;
    const { cursor } = request.query as { cursor?: string };

    const userData = await app.prisma.user.findUnique({
      where: { id: user.userId },
      select: {
        friendsInitiated: {
          where: { status: "ACCEPTED" },
          select: { receiverId: true },
        },
        friendsReceived: {
          where: { status: "ACCEPTED" },
          select: { initiatorId: true },
        },
      },
    });

    const friendIds = [
      ...(userData?.friendsInitiated.map((f) => f.receiverId) || []),
      ...(userData?.friendsReceived.map((f) => f.initiatorId) || []),
      user.userId,
    ];

    const posts = await app.prisma.post.findMany({
      where: {
        authorId: { in: friendIds },
        isDeleted: false,
      },
      include: {
        author: {
          select: {
            id: true,
            nickname: true,
            tag: true,
            avatar: true,
            isVerified: true,
          },
        },
        reactions: {
          where: { userId: user.userId },
          select: { type: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 20,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    });

    return reply.send({
      success: true,
      data: posts.map((post) => ({
        ...post,
        userReaction: post.reactions[0]?.type || null,
        reactions: undefined,
      })),
    });
  });

  // Create post
  app.post("/posts", async (request, reply) => {
    const user = (request as any).user;
    const { content, mediaUrls } = request.body as {
      content: string;
      mediaUrls?: string[];
    };

    if (!content?.trim()) {
      return reply.status(400).send({
        success: false,
        error: "Content is required",
      });
    }

    if (content.length > 5000) {
      return reply.status(400).send({
        success: false,
        error: "Content too long (max 5000 characters)",
      });
    }

    const post = await app.prisma.post.create({
      data: {
        authorId: user.userId,
        content: content.trim(),
        mediaUrls: mediaUrls || [],
      },
      include: {
        author: {
          select: {
            id: true,
            nickname: true,
            tag: true,
            avatar: true,
            isVerified: true,
          },
        },
      },
    });

    await app.prisma.auditLog.create({
      data: {
        userId: user.userId,
        action: "POST_CREATE",
        entityType: "Post",
        entityId: post.id,
      },
    });

    return reply.send({
      success: true,
      data: post,
    });
  });

  // Get single post
  app.get("/posts/:id", async (request, reply) => {
    const user = (request as any).user;
    const { id } = request.params as { id: string };

    const post = await app.prisma.post.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            nickname: true,
            tag: true,
            avatar: true,
            isVerified: true,
          },
        },
        reactions: {
          where: { userId: user.userId },
          select: { type: true },
        },
        comments: {
          where: { isDeleted: false },
          include: {
            author: {
              select: {
                id: true,
                nickname: true,
                tag: true,
                avatar: true,
              },
            },
            reactions: {
              where: { userId: user.userId },
              select: { type: true },
            },
          },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!post || post.isDeleted) {
      return reply.status(404).send({
        success: false,
        error: "Post not found",
      });
    }

    return reply.send({
      success: true,
      data: {
        ...post,
        userReaction: post.reactions[0]?.type || null,
        reactions: undefined,
        comments: post.comments.map((c) => ({
          ...c,
          userReaction: c.reactions[0]?.type || null,
          reactions: undefined,
        })),
      },
    });
  });

  // Delete post
  app.delete("/posts/:id", async (request, reply) => {
    const user = (request as any).user;
    const { id } = request.params as { id: string };

    const post = await app.prisma.post.findUnique({
      where: { id },
    });

    if (!post) {
      return reply.status(404).send({
        success: false,
        error: "Post not found",
      });
    }

    if (post.authorId !== user.userId) {
      return reply.status(403).send({
        success: false,
        error: "You can only delete your own posts",
      });
    }

    await app.prisma.post.update({
      where: { id },
      data: { isDeleted: true },
    });

    return reply.send({
      success: true,
      message: "Post deleted",
    });
  });

  // React to post
  app.post("/posts/:id/react", async (request, reply) => {
    const user = (request as any).user;
    const { id } = request.params as { id: string };
    const { type } = request.body as { type: "LIKE" | "DISLIKE" };

    const post = await app.prisma.post.findUnique({
      where: { id },
    });

    if (!post || post.isDeleted) {
      return reply.status(404).send({
        success: false,
        error: "Post not found",
      });
    }

    const existingReaction = await app.prisma.reaction.findUnique({
      where: { userId_postId: { userId: user.userId, postId: id } },
    });

    if (existingReaction) {
      if (existingReaction.type === type) {
        await app.prisma.reaction.delete({
          where: { id: existingReaction.id },
        });

        if (type === "LIKE") {
          await app.prisma.post.update({
            where: { id },
            data: { likesCount: { decrement: 1 } },
          });
        } else {
          await app.prisma.post.update({
            where: { id },
            data: { dislikesCount: { decrement: 1 } },
          });
        }
      } else {
        await app.prisma.reaction.update({
          where: { id: existingReaction.id },
          data: { type },
        });

        if (type === "LIKE") {
          await app.prisma.post.update({
            where: { id },
            data: {
              likesCount: { increment: 1 },
              dislikesCount: { decrement: 1 },
            },
          });
        } else {
          await app.prisma.post.update({
            where: { id },
            data: {
              likesCount: { decrement: 1 },
              dislikesCount: { increment: 1 },
            },
          });
        }
      }
    } else {
      await app.prisma.reaction.create({
        data: {
          userId: user.userId,
          postId: id,
          type,
        },
      });

      if (type === "LIKE") {
        await app.prisma.post.update({
          where: { id },
          data: { likesCount: { increment: 1 } },
        });
      } else {
        await app.prisma.post.update({
          where: { id },
          data: { dislikesCount: { increment: 1 } },
        });
      }
    }

    return reply.send({
      success: true,
      data: { type },
    });
  });

  // Add comment to post
  app.post("/posts/:id/comments", async (request, reply) => {
    const user = (request as any).user;
    const { id } = request.params as { id: string };
    const { content } = request.body as { content: string };

    if (!content?.trim()) {
      return reply.status(400).send({
        success: false,
        error: "Content is required",
      });
    }

    const post = await app.prisma.post.findUnique({
      where: { id },
    });

    if (!post || post.isDeleted) {
      return reply.status(404).send({
        success: false,
        error: "Post not found",
      });
    }

    const comment = await app.prisma.comment.create({
      data: {
        postId: id,
        authorId: user.userId,
        content: content.trim(),
      },
      include: {
        author: {
          select: {
            id: true,
            nickname: true,
            tag: true,
            avatar: true,
          },
        },
      },
    });

    await app.prisma.post.update({
      where: { id },
      data: { commentsCount: { increment: 1 } },
    });

    return reply.send({
      success: true,
      data: comment,
    });
  });

  // React to comment
  app.post("/comments/:id/react", async (request, reply) => {
    const user = (request as any).user;
    const { id } = request.params as { id: string };
    const { type } = request.body as { type: "LIKE" | "DISLIKE" };

    const comment = await app.prisma.comment.findUnique({
      where: { id },
    });

    if (!comment || comment.isDeleted) {
      return reply.status(404).send({
        success: false,
        error: "Comment not found",
      });
    }

    const existingReaction = await app.prisma.reaction.findUnique({
      where: { userId_commentId: { userId: user.userId, commentId: id } },
    });

    if (existingReaction) {
      if (existingReaction.type === type) {
        await app.prisma.reaction.delete({
          where: { id: existingReaction.id },
        });

        if (type === "LIKE") {
          await app.prisma.comment.update({
            where: { id },
            data: { likesCount: { decrement: 1 } },
          });
        } else {
          await app.prisma.comment.update({
            where: { id },
            data: { dislikesCount: { decrement: 1 } },
          });
        }
      } else {
        await app.prisma.reaction.update({
          where: { id: existingReaction.id },
          data: { type },
        });

        if (type === "LIKE") {
          await app.prisma.comment.update({
            where: { id },
            data: {
              likesCount: { increment: 1 },
              dislikesCount: { decrement: 1 },
            },
          });
        } else {
          await app.prisma.comment.update({
            where: { id },
            data: {
              likesCount: { decrement: 1 },
              dislikesCount: { increment: 1 },
            },
          });
        }
      }
    } else {
      await app.prisma.reaction.create({
        data: {
          userId: user.userId,
          commentId: id,
          type,
        },
      });

      if (type === "LIKE") {
        await app.prisma.comment.update({
          where: { id },
          data: { likesCount: { increment: 1 } },
        });
      } else {
        await app.prisma.comment.update({
          where: { id },
          data: { dislikesCount: { increment: 1 } },
        });
      }
    }

    return reply.send({
      success: true,
      data: { type },
    });
  });

  // Delete comment
  app.delete("/comments/:id", async (request, reply) => {
    const user = (request as any).user;
    const { id } = request.params as { id: string };

    const comment = await app.prisma.comment.findUnique({
      where: { id },
    });

    if (!comment) {
      return reply.status(404).send({
        success: false,
        error: "Comment not found",
      });
    }

    if (comment.authorId !== user.userId) {
      return reply.status(403).send({
        success: false,
        error: "You can only delete your own comments",
      });
    }

    await app.prisma.comment.update({
      where: { id },
      data: { isDeleted: true },
    });

    await app.prisma.post.update({
      where: { id: comment.postId },
      data: { commentsCount: { decrement: 1 } },
    });

    return reply.send({
      success: true,
      message: "Comment deleted",
    });
  });

  // Get user's posts (profile page)
  app.get("/users/:id/posts", async (request, reply) => {
    const user = (request as any).user;
    const { id } = request.params as { id: string };
    const { cursor } = request.query as { cursor?: string };

    const userData = await app.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        friendsInitiated: {
          where: { status: "ACCEPTED", receiverId: user.userId },
        },
        friendsReceived: {
          where: { status: "ACCEPTED", initiatorId: user.userId },
        },
      },
    });

    const isFriend =
      userData?.friendsInitiated.length > 0 ||
      userData?.friendsReceived.length > 0;
    const isOwnProfile = id === user.userId;

    if (!isFriend && !isOwnProfile) {
      return reply.status(403).send({
        success: false,
        error: "Posts are only visible to friends",
      });
    }

    const posts = await app.prisma.post.findMany({
      where: {
        authorId: id,
        isDeleted: false,
      },
      include: {
        author: {
          select: {
            id: true,
            nickname: true,
            tag: true,
            avatar: true,
            isVerified: true,
          },
        },
        reactions: {
          where: { userId: user.userId },
          select: { type: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 20,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    });

    return reply.send({
      success: true,
      data: posts.map((post) => ({
        ...post,
        userReaction: post.reactions[0]?.type || null,
        reactions: undefined,
      })),
    });
  });
}
