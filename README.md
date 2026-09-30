# Lectura Cinemática de Tarot — Despliegue en GitHub Pages

Esta aplicación está 100% preparada para alojarse de forma estática en **GitHub Pages**.

---

## Opción 1: Despliegue Automático con GitHub Actions (Recomendada)

El proyecto ya incluye el flujo automatizado en `.github/workflows/deploy.yml`.

1. **Sube tu repositorio a GitHub**:
   ```bash
   git add .
   git commit -m "Configurar despliegue para GitHub Pages"
   git push origin main
   ```

2. **Habilita GitHub Pages en tu repositorio**:
   * En GitHub, ve a la pestaña **Settings** (Configuración) de tu repositorio.
   * En el menú lateral izquierdo, selecciona **Pages**.
   * En **Build and deployment** > **Source**, selecciona:
     👉 **GitHub Actions**
   * ¡Listo! Cada vez que hagas `push` a la rama `main` o `master`, GitHub Actions compilará y publicará la web automáticamente. La URL pública aparecerá en la sección **Pages** (ejemplo: `https://<tu-usuario>.github.io/<tu-repo>/`).

---

## Opción 2: Despliegue Manual con el comando `npm run deploy`

Si prefieres desplegar mediante una rama `gh-pages` desde tu terminal:

1. Asegúrate de tener configurado tu repositorio remoto en git.
2. Ejecuta:
   ```bash
   npm run deploy
   ```
3. En GitHub > **Settings** > **Pages**:
   * En **Source**, selecciona **Deploy from a branch**.
   * Selecciona la rama `gh-pages` y la carpeta `/ (root)`.
   * Guarda los cambios.

---

## Ajustes realizados para compatibilidad total con GitHub Pages:
- **`vite.config.ts`**: Configurado con `base: './'` para que todos los scripts, estilos y fuentes carguen con rutas relativas sin importar el nombre de tu repositorio.
- **Workflow CI/CD**: `.github/workflows/deploy.yml` listo para compilar con Node 20 y subir a GitHub Pages.
- **Script `deploy`**: `gh-pages` instalado y añadido a los scripts de `package.json`.
