import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ command }) => {
  const repositoryName = process.env.GITHUB_REPOSITORY?.split('/')[1];
  const base = command === 'build' && repositoryName ? `/${repositoryName}/` : '/';

  return {
    plugins: [react()],
    base
  };
});
