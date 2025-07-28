import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();

export interface BlogPost {
  id: string;
  title: string;
  content: string;
  likes: number;
  createdAt: Date;
}

export interface User {
  id: string;
  name: string;
  avatar: string;
}

export const db = {
  async getPosts(): Promise<BlogPost[]> {
    return await prisma.blogPost.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });
  },

  async getPost(id: string): Promise<BlogPost | null> {
    return await prisma.blogPost.findUnique({
      where: { id }
    });
  },

  async getLikes(postId: string): Promise<number> {
    const post = await prisma.blogPost.findUnique({
      where: { id: postId },
      select: { likes: true }
    });
    return post?.likes || 0;
  },

  async addLike(postId: string): Promise<void> {
    await prisma.blogPost.update({
      where: { id: postId },
      data: {
        likes: {
          increment: 1
        }
      }
    });
  },

  async createPost(title: string, content: string): Promise<BlogPost> {
    return await prisma.blogPost.create({
      data: {
        title,
        content
      }
    });
  },

  async updatePost(id: string, updates: Partial<Pick<BlogPost, 'title' | 'content'>>): Promise<BlogPost | null> {
    try {
      return await prisma.blogPost.update({
        where: { id },
        data: updates
      });
    } catch (error) {
      return null;
    }
  },

  async deletePost(id: string): Promise<boolean> {
    try {
      await prisma.blogPost.delete({
        where: { id }
      });
      return true;
    } catch (error) {
      return false;
    }
  },

  async getUser(id: string): Promise<User | null> {
    return await prisma.user.findUnique({
      where: { id }
    });
  }
};
