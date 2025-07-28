# SvelteKit Remote Functions - Proof of Concept

This project demonstrates SvelteKit's new **Remote Functions**, a revolutionary feature that changes how data is handled in web applications.

## 🚀 What are Remote Functions?

Remote Functions are a new concept in SvelteKit that allow you to:

- **Declare functions** in `.remote.ts` files
- **Import them in Svelte components** like normal functions
- **Call them client-side** where they become wrappers around fetch
- **Execute them server-side** with access to database and environment variables

## 📋 Requirements

- Node.js 20+
- SvelteKit 2.0+ (with experimental support for remote functions)
- TypeScript
- Zod for validation

## 🛠️ Installation

```bash
npm install
npm run dev
```
