import { z } from 'zod';
import { query, form, command, prerender } from '$app/server';
import { db } from '$lib/server/db';

const PostIdSchema = z.string().min(1);
const CreatePostSchema = z.object({
  title: z.string().min(1).max(100),
  content: z.string().min(1).max(2000)
});

export const getPosts = query(async () => {
  return await db.getPosts();
});

export const getPost = query(PostIdSchema, async (id) => {
  return await db.getPost(id);
});

export const getLikes = query(PostIdSchema, async (id) => {
  return await db.getLikes(id);
});

export const createPost = form(async (data: FormData) => {
  console.log('Running Server Side - Received form data:', data);
  const title = data.get('title') as string;
  const content = data.get('content') as string;
  
  const validation = CreatePostSchema.safeParse({ title, content });
  if (!validation.success) {
    return { 
      success: false, 
      errors: validation.error.flatten().fieldErrors,
      values: { title, content }
    };
  }

  try {
    const post = await db.createPost(title, content);
    
    await getPosts().refresh();
    
    return { success: true, post };
  } catch (error) {
    return { 
      success: false, 
      error: 'Error',
      values: { title, content }
    };
  }
});

export const addLike = form(async (data: FormData) => {
  console.log('Running Server Side - Received form data:', data);
  const id = data.get('id') as string;
  
  if (!id) {
    return { success: false, error: 'ID post mancante' };
  }

  try {
    await db.addLike(id);
    await getLikes(id).refresh();
    
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Error' };
  }
});

export const addLikeCommand = command(PostIdSchema, async (id) => {
  console.log('Running Server Side - Received form id:', id);
  await db.addLike(id);
  
  getLikes(id).refresh();
  
  return { success: true, likes: await db.getLikes(id) };
});

export const deletePost = command(PostIdSchema, async (id) => {
  console.log('Running Server Side - Received form id:', id);
  const success = await db.deletePost(id);
  
  if (success) {
    getPosts().refresh();
    return { success: true };
  }
  
  throw new Error('Not Found');
});

export const updatePost = command(
  z.object({
    id: z.string(),
    title: z.string().min(1).max(100).optional(),
    content: z.string().min(1).max(2000).optional()
  }),
  async ({ id, ...updates }) => {
    console.log('Running Server Side - Received form id:', id);

    const post = await db.updatePost(id, updates);
    
    if (!post) {
      throw new Error('Not Found');
    }
    
    getPost(id).refresh();
    getPosts().refresh();
    
    return { success: true, post };
  }
);

export const getStaticConfig = prerender(async () => {
  return {
    siteName: 'SvelteKit Remote Functions POC',
    version: '1.0.0',
    author: 'Pasquale Carmine Carbone',
    description: 'Demo Remote Functions di SvelteKit'
  };
});

export const getFeaturedPosts = prerender(
  async () => {
    return [
      {
        id: 'featured-1',
        title: 'Introduzione alle Remote Functions',
        excerpt: 'Scopri come le Remote Functions cambiano il modo di sviluppare con SvelteKit',
        featured: true
      },
      {
        id: 'featured-2', 
        title: 'TypeScript e Validazione',
        excerpt: 'Come utilizzare Zod per validare i dati nelle Remote Functions',
        featured: true
      }
    ];
  }
);

export const getBlogMetadata = prerender(
  PostIdSchema,
  async (slug) => {
    const metadata = {
      'introduction': { title: 'Introduzione', readTime: 5 },
      'advanced': { title: 'Concetti Avanzati', readTime: 10 },
      'examples': { title: 'Esempi Pratici', readTime: 8 }
    };
    
    return metadata[slug as keyof typeof metadata] || null;
  },
  {
    dynamic: true,
    inputs: () => ['introduction', 'advanced', 'examples']
  }
);
