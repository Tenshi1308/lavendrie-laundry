# Todo App

Simple todo app built with Next.js, Prisma, and shadcn/ui.

## Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Generate Prisma Client**
   ```bash
   npx prisma generate
   ```

3. **Push database schema**
   ```bash
   npx prisma db push
   ```

4. **Run development server**
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000)


## Tech Stack

- Next.js 16 (App Router)
- Prisma ORM (SQLite)
- shadcn/ui components
- Tailwind CSS
- TypeScript

## Build for Production

```bash
npm run build
npm start
```
