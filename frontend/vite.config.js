// import { defineConfig } from "vite";
// import react from "@vitejs/plugin-react";

// export default defineConfig({
//   plugins: [react()],
//   proxy: {
//       '/auth': 'http://localhost:3000',
//     },
//   server: {
//     port: 3000,   // change to a safe port
//     strictPort: true
//   }
// });
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/auth': 'http://localhost:3000',
    },
  },
});
