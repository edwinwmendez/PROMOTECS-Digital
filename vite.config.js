import { defineConfig } from 'vite';

// PRODUCCIÓN: NO correr vite build. GitHub Pages sirve el repo directo.
// Este config solo se usa para el servidor de desarrollo local.
export default defineConfig({
  server: {
    port: 5173,
    open: false,
  },
  build: {
    rollupOptions: {
      input: {
        main: 'index.html',
        catalogo: 'catalogo.html',
        inscripcion: 'inscripcion.html',
        validacion: 'validacion.html',
        contacto: 'contacto.html',
      },
    },
  },
});
