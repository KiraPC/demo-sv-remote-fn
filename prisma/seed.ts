import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Clear existing data
  await prisma.blogPost.deleteMany({});
  await prisma.user.deleteMany({});

  // Create users
  const user = await prisma.user.create({
    data: {
      name: 'Pasquale Carmine Carbone',
      avatar: 'https://github.com/pasqualeccarbone.png'
    }
  });

  // Create blog posts
  const posts = [
    {
      title: 'SvelteKit Remote Functions - Una Rivoluzione',
      content: 'Le remote functions rappresentano un nuovo paradigma per SvelteKit che semplifica significativamente la gestione dello stato del server e del client. Con questa nuova API, possiamo creare applicazioni più reattive e performanti senza la complessità tradizionale della sincronizzazione dei dati.',
      likes: 42,
      createdAt: new Date('2024-01-15')
    },
    {
      title: 'Async Svelte: Il Futuro è Qui',
      content: 'Con Svelte 5 e le sue capacità asincrone, possiamo gestire lo stato in modo più elegante e performante. Le nuove primitive reattive offrono un controllo granulare sui dati e permettono ottimizzazioni avanzate.',
      likes: 33,
      createdAt: new Date('2024-01-20')
    },
    {
      title: 'TypeScript e SvelteKit: Best Practices',
      content: 'Come strutturare al meglio un progetto SvelteKit con TypeScript per massimizzare la produttività e la manutenibilità del codice. Esploriamo patterns avanzati e strategie di organizzazione.',
      likes: 28,
      createdAt: new Date('2024-01-25')
    }
  ];

  for (const postData of posts) {
    await prisma.blogPost.create({
      data: postData
    });
  }

  console.log('✅ Database seeded successfully!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Error seeding database:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
