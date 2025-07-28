<script lang="ts">
  import { 
    getPosts, 
    addLike, 
    addLikeCommand, 
    getStaticConfig,
    getFeaturedPosts
  } from '$lib/blog.remote';
  
  let config = getStaticConfig();
  let featuredPosts = getFeaturedPosts();
  
  let postsQuery = getPosts();

  let toastMessage = '';

  let siteName = 'SvelteKit Remote Functions POC';
  let siteDescription = 'Dimostrazione delle nuove Remote Functions di SvelteKit';

  config.then(configData => {
    siteName = configData.siteName;
    siteDescription = configData.description;
  });
  
  function showToast(message: string) {
    toastMessage = message;
    setTimeout(() => toastMessage = '', 3000);
  }

  async function handleLikeCommand(postId: string) {
    try {
      await addLikeCommand(postId).updates(getPosts().withOverride((posts) => {
        return posts.map(post => 
          post.id === postId ? { ...post, likes: post.likes + 1 } : post
        );
      }));
      showToast('Like aggiunto con aggiornamento ottimistico!');
    } catch (error) {
      showToast('Errore durante l\'aggiunta del like');
    }
  }
</script>

<svelte:head>
  <title>{siteName}</title>
  <meta name="description" content={siteDescription} />
</svelte:head>

<main class="container">
  <!-- Static Configuration (prerendered) -->
  <header class="header">
    {#await config}
      <h1>Caricamento...</h1>
    {:then configData}
      <h1>{configData.siteName}</h1>
      <p class="subtitle">{configData.description}</p>
      <small>Versione: {configData.version} - Autore: {configData.author}</small>
    {:catch error}
      <h1>Errore nel caricamento della configurazione</h1>
    {/await}
  </header>

  {#if toastMessage}
    <div class="toast">
      {toastMessage}
    </div>
  {/if}

  <!-- Featured Posts (prerendered) -->
  <section class="featured">
    <h2>📌 Post in Evidenza (Prerendered)</h2>
    {#await featuredPosts}
      <div class="loading">Caricamento post in evidenza...</div>
    {:then posts}
      <div class="featured-grid">
        {#each posts as post}
          <article class="featured-post">
            <h3>{post.title}</h3>
            <p>{post.excerpt}</p>
          </article>
        {/each}
      </div>
    {:catch error}
      <div class="error">Errore nel caricamento dei post in evidenza</div>
    {/await}
  </section>

  <section class="posts">
    <h2>📚 Posts del Blog (Query Remote Functions)</h2>
    
    {#await postsQuery}
      <div class="loading">Caricamento posts...</div>
    {:then posts}
      {#if posts.length === 0}
        <p class="empty-state">Nessun post disponibile.</p>
      {:else}
        <div class="posts-grid">
          {#each posts as post}
            <article class="post-card">
              <header class="post-header">
                <h3>{post.title}</h3>
                <time>{new Date(post.createdAt).toLocaleDateString('it-IT')}</time>
              </header>
              
              <div class="post-content">
                <p>{post.content}</p>
              </div>
              
              <footer class="post-footer">
                <div class="likes-section">
                  <div class="likes-display">
                    👍 <span class="likes-count">{post.likes}</span> likes
                  </div>
                  
                  <div class="likes-actions">
                    <form {...addLike.enhance(async ({ submit }) => {
                      try {
                          await submit().updates(getPosts());
                        } catch (error) {
                          showToast("Errore durante l'aggiunta del like");
                        }
                    })}
                    >
                      <input type="hidden" name="id" value={post.id} />
                      <button type="submit">❤️ Like (Form)</button>
                    </form>
                    
                    <button 
                      class="btn btn--small btn--accent"
                      on:click={() => handleLikeCommand(post.id)}
                    >
                      ⚡ Like Ottimistico
                    </button>
                  </div>
                </div>
                
              </footer>
            </article>
          {/each}
        </div>
      {/if}
    {:catch error}
      <div class="error">Errore nel caricamento dei posts: {error.message}</div>
    {/await}
  </section>

  <section class="info">
    <div class="info-card">
      <h3>🚀 Cosa Dimostra Questo POC</h3>
      <ul>
        <li><strong>Query Functions:</strong> Caricamento dinamico dei posts</li>
        <li><strong>Form Functions:</strong> Creazione post con progressive enhancement</li>
        <li><strong>Command Functions:</strong> Like con optimistic updates</li>
        <li><strong>Prerender Functions:</strong> Config e post in evidenza statici</li>
        <li><strong>Type Safety:</strong> Validazione con Zod (simulata)</li>
        <li><strong>Caching:</strong> Deduplicazione e cache intelligente</li>
      </ul>
    </div>
  </section>
</main>

<style>
  :global(body) {
    margin: 0;
    padding: 0;
    background: #f8fafc;
    font-family: system-ui, -apple-system, sans-serif;
    line-height: 1.6;
    color: #374151;
  }

  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
  }

  .header {
    text-align: center;
    margin-bottom: 3rem;
    padding: 2rem;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 1rem;
    color: white;
  }

  .header h1 {
    margin: 0 0 0.5rem 0;
    font-size: 2.5rem;
  }

  .subtitle {
    margin: 0 0 1rem 0;
    font-size: 1.2rem;
    opacity: 0.9;
  }

  .toast {
    position: fixed;
    top: 2rem;
    right: 2rem;
    padding: 1rem 1.5rem;
    background: #10b981;
    color: white;
    border-radius: 0.5rem;
    font-weight: 500;
    z-index: 1000;
    animation: slideIn 0.3s ease-out;
  }

  .featured {
    margin-bottom: 3rem;
  }

  .featured h2 {
    margin-bottom: 1rem;
    color: #374151;
  }

  .featured-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 1rem;
  }

  .featured-post {
    padding: 1.5rem;
    background: #f8fafc;
    border-radius: 0.5rem;
    border-left: 4px solid #3b82f6;
  }

  .featured-post h3 {
    margin: 0 0 0.5rem 0;
    color: #1f2937;
  }

  .create-section {
    margin-bottom: 3rem;
  }

  .form-container {
    margin-top: 1rem;
    padding: 2rem;
    background: #f9fafb;
    border-radius: 0.5rem;
    border: 1px solid #e5e7eb;
  }

  .form {
    max-width: 600px;
  }

  .form-group {
    margin-bottom: 1rem;
  }

  .form-group input,
  .form-group input:focus,

  .posts h2 {
    margin-bottom: 1.5rem;
    color: #374151;
  }

  .posts-grid {
    display: grid;
    gap: 1.5rem;
  }

  .post-card {
    padding: 1.5rem;
    background: white;
    border-radius: 0.5rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    border: 1px solid #e5e7eb;
  }

  .post-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 1rem;
  }

  .post-header h3 {
    margin: 0;
    color: #1f2937;
  }

  .post-header time {
    color: #6b7280;
    font-size: 0.875rem;
  }

  .post-content {
    margin-bottom: 1rem;
    color: #374151;
    line-height: 1.6;
  }

  .post-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 1rem;
  }

  .likes-section {
    display: flex;
    align-items: center;
    gap: 1rem;
    flex-wrap: wrap;
  }

  .likes-display {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-weight: 500;
  }

  .likes-count {
    color: #3b82f6;
  }

  .likes-actions {
    display: flex;
    gap: 0.5rem;
  }

  .post-actions {
    display: flex;
    gap: 0.5rem;
  }

  .info {
    margin-top: 3rem;
  }

  .info-card {
    padding: 2rem;
    background: white;
    border-radius: 0.5rem;
    border: 1px solid #e5e7eb;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }

  .info-card h3 {
    margin: 0 0 1rem 0;
    color: #1f2937;
  }

  .info-card ul {
    margin: 0;
    padding-left: 1.5rem;
  }

  .info-card li {
    margin-bottom: 0.5rem;
  }

  /* Button Styles */
  .btn {
    display: inline-flex;
    align-items: center;
    padding: 0.5rem 1rem;
    font-size: 0.875rem;
    font-weight: 500;
    border: none;
    border-radius: 0.375rem;
    cursor: pointer;
    transition: all 0.2s;
    text-decoration: none;
    background: #f3f4f6;
    color: #374151;
  }

  .btn:hover {
    transform: translateY(-1px);
    background: #e5e7eb;
  }

  .btn--small {
    padding: 0.375rem 0.75rem;
    font-size: 0.75rem;
  }

  .btn--primary {
    background: #3b82f6;
    color: white;
  }

  .btn--primary:hover {
    background: #2563eb;
  }

  .btn--secondary {
    background: #6b7280;
    color: white;
  }

  .btn--secondary:hover {
    background: #4b5563;
  }

  .btn--accent {
    background: #10b981;
    color: white;
  }

  .btn--accent:hover {
    background: #059669;
  }

  .btn--danger {
    background: #ef4444;
    color: white;
  }

  .btn--danger:hover {
    background: #dc2626;
  }

  .empty-state {
    text-align: center;
    padding: 2rem;
    color: #6b7280;
    font-style: italic;
  }

  .loading {
    text-align: center;
    padding: 2rem;
    color: #6b7280;
    font-style: italic;
  }

  .loading::after {
    content: '...';
    animation: dots 1.5s steps(4, end) infinite;
  }

  .error {
    text-align: center;
    padding: 2rem;
    color: #ef4444;
    background: #fef2f2;
    border: 1px solid #fecaca;
    border-radius: 0.5rem;
    margin: 1rem 0;
  }

  @keyframes dots {
    0%, 20% { content: ''; }
    40% { content: '.'; }
    60% { content: '..'; }
    80%, 100% { content: '...'; }
  }

  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  @media (max-width: 768px) {
    .container {
      padding: 1rem;
    }

    .header h1 {
      font-size: 2rem;
    }

    .post-footer {
      flex-direction: column;
      align-items: stretch;
    }

    .likes-section {
      justify-content: space-between;
    }

    .featured-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
