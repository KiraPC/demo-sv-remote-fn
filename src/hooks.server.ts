import { z } from 'zod';
import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
  try {
    const response = await resolve(event);
    return response;
  } catch (error) {
    console.error('Error during request handling:', error);
    return new Response('Internal Server Error', {
      status: 500,
      statusText: 'Internal Server Error'
    });
  }
};

export function handleValidationError({ result }: { result: { error: z.ZodError } }) {
  return { 
    validationErrors: result.error.flatten().fieldErrors,
    message: 'Errori di validazione'
  };
}
