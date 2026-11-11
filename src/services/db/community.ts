import prisma from '@/lib/prisma';
import type { PostType } from '@prisma/client';

export interface CreatePostInput {
  title: string;
  content: string;
  type: PostType;
  category?: string;
  authorId: string;
  linkedReportId?: string;
}

export interface CreateCommentInput {
  postId: string;
  authorId: string;
  content: string;
  parentId?: string;
}

/**
 * Get community posts with vote scores and user vote status.
 */
export async function getCommunityFeed(params?: {
  type?: PostType;
  userId?: string;
  limit?: number;
  offset?: number;
}) {
  const where: Record<string, unknown> = {};
  if (params?.type) where.type = params.type;

  const posts = await prisma.communityPost.findMany({
    where,
    include: {
      author: {
        select: {
          id: true,
          name: true,
          avatarUrl: true,
          role: true,
          reputationLevel: true,
        },
      },
      votes: true,
      _count: {
        select: { comments: true },
      },
    },
    orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
    take: params?.limit ?? 20,
    skip: params?.offset ?? 0,
  });

  return posts.map((post) => {
    const upvotes = post.votes.filter((v) => v.value > 0).length;
    const downvotes = post.votes.filter((v) => v.value < 0).length;
    const userVote = params?.userId
      ? post.votes.find((v) => v.userId === params.userId)?.value ?? 0
      : 0;

    return {
      id: post.id,
      title: post.title,
      content: post.content,
      type: post.type,
      category: post.category,
      isPinned: post.isPinned,
      authorId: post.authorId,
      authorName: post.author.name,
      authorAvatar: post.author.avatarUrl,
      authorBadge: post.author.reputationLevel,
      linkedReportId: post.linkedReportId,
      upvotes,
      downvotes,
      userVote,
      commentCount: post._count.comments,
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString(),
    };
  });
}

/**
 * Create a new community post.
 */
export async function createCommunityPost(input: CreatePostInput) {
  return await prisma.communityPost.create({
    data: {
      title: input.title,
      content: input.content,
      type: input.type,
      category: input.category,
      authorId: input.authorId,
      linkedReportId: input.linkedReportId,
    },
  });
}

/**
 * Get a single community post by ID.
 */
export async function getCommunityPostById(id: string, userId?: string) {
  const post = await prisma.communityPost.findUnique({
    where: { id },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          avatarUrl: true,
          role: true,
          reputationLevel: true,
        },
      },
      votes: true,
      _count: {
        select: { comments: true },
      },
    },
  });

  if (!post) return null;

  const upvotes = post.votes.filter((v) => v.value > 0).length;
  const downvotes = post.votes.filter((v) => v.value < 0).length;
  const userVote = userId
    ? post.votes.find((v) => v.userId === userId)?.value ?? 0
    : 0;

  return {
    id: post.id,
    title: post.title,
    content: post.content,
    type: post.type,
    category: post.category,
    isPinned: post.isPinned,
    authorId: post.authorId,
    authorName: post.author.name,
    authorAvatar: post.author.avatarUrl,
    authorBadge: post.author.reputationLevel,
    linkedReportId: post.linkedReportId,
    upvotes,
    downvotes,
    userVote,
    commentCount: post._count.comments,
    createdAt: post.createdAt.toISOString(),
    updatedAt: post.updatedAt.toISOString(),
  };
}

/**
 * Get all comments for a community post.
 */
export async function getPostComments(postId: string) {
  const comments = await prisma.communityComment.findMany({
    where: { postId },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          avatarUrl: true,
          role: true,
          reputationLevel: true,
        },
      },
    },
    orderBy: { createdAt: 'asc' },
  });

  return comments.map((c) => ({
    id: c.id,
    postId: c.postId,
    parentId: c.parentId,
    authorId: c.authorId,
    authorName: c.author.name,
    authorAvatar: c.author.avatarUrl,
    authorBadge: c.author.reputationLevel,
    content: c.content,
    createdAt: c.createdAt.toISOString(),
  }));
}

/**
 * Add a comment or reply to a post.
 */
export async function addCommunityComment(input: CreateCommentInput) {
  return await prisma.communityComment.create({
    data: {
      postId: input.postId,
      authorId: input.authorId,
      content: input.content,
      parentId: input.parentId,
    },
    include: {
      author: {
        select: { id: true, name: true, avatarUrl: true },
      },
    },
  });
}

/**
 * Cast or toggle upvote / downvote on a post.
 */
export async function votePost(params: {
  postId: string;
  userId: string;
  value: number; // 1 for upvote, -1 for downvote
}) {
  return await prisma.$transaction(async (tx) => {
    const existing = await tx.postVote.findUnique({
      where: {
        postId_userId: {
          postId: params.postId,
          userId: params.userId,
        },
      },
    });

    if (existing) {
      if (existing.value === params.value) {
        // Toggle off
        await tx.postVote.delete({
          where: { id: existing.id },
        });
        return { action: 'removed' };
      } else {
        // Update vote value
        await tx.postVote.update({
          where: { id: existing.id },
          data: { value: params.value },
        });
        return { action: 'updated' };
      }
    } else {
      // Create new vote
      await tx.postVote.create({
        data: {
          postId: params.postId,
          userId: params.userId,
          value: params.value,
        },
      });
      return { action: 'created' };
    }
  });
}

