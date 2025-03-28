# Guía de Contribución y Desarrollo

Este documento proporciona información útil para desarrolladores que deseen trabajar con este proyecto, ya sea para corregir bugs, añadir funcionalidades o simplemente experimentar.

## Trabajar con el Repositorio (Forking y Sincronización)

Para contribuir al proyecto o trabajar en tu propia versión sin afectar directamente al repositorio original, sigue el flujo de trabajo estándar de GitHub basado en "forks".

### 1. Hacer un Fork del Repositorio

*   Ve a la página principal del repositorio original en GitHub.
*   Haz clic en el botón **"Fork"** en la esquina superior derecha. Esto creará una copia completa del repositorio bajo tu propia cuenta de GitHub.

### 2. Clonar tu Fork Localmente

*   Ve a la página de **tu fork** en GitHub (bajo tu cuenta).
*   Haz clic en el botón verde **"< > Code"**.
*   Copia la URL (HTTPS o SSH).
*   En tu terminal local, clona **tu fork**:
    ```bash
    git clone <URL_de_tu_fork>
    ```
*   Navega al directorio recién clonado:
    ```bash
    cd nombre-del-repositorio
    ```

### 3. Configurar el Repositorio Original como "Upstream"

Para poder obtener los cambios más recientes del repositorio original (al que llamaremos "upstream"), necesitas añadirlo como un repositorio remoto.

*   Añade el remoto "upstream":
    ```bash
    git remote add upstream <URL_del_repositorio_ORIGINAL>
    ```
    *(Reemplaza `<URL_del_repositorio_ORIGINAL>` con la URL del repositorio del equipo de desarrollo principal).*

*   Verifica que los remotos estén configurados correctamente:
    ```bash
    git remote -v
    ```
    Deberías ver algo como:
    ```
    origin  https://github.com/TU_USUARIO/nombre-del-repositorio.git (fetch)
    origin  https://github.com/TU_USUARIO/nombre-del-repositorio.git (push)
    upstream        https://github.com/EQUIPO_ORIGINAL/nombre-del-repositorio.git (fetch)
    upstream        https://github.com/EQUIPO_ORIGINAL/nombre-del-repositorio.git (push)
    ```

### 4. Mantener tu Código Base Actualizado (Incorporando Nuevos Bugs/Módulos del Upstream)

El repositorio original (`upstream`) puede actualizarse con nuevos módulos o bugs para probar. Para incorporar estos cambios a tu entorno local **sin perder las correcciones que ya has hecho**, sigue estos pasos:

**Principio Clave:** ¡**No** corrijas bugs directamente en tu rama `main`! Usa ramas separadas (`feature`, `bugfix`) para cada corrección o conjunto de correcciones. Tu rama `main` local debe usarse para reflejar el estado del repositorio original (`upstream`).

1.  **Actualiza tu rama `main` local:**
    *   Asegúrate de estar en tu rama `main` local:
        ```bash
        git checkout main
        ```
    *   Obtén los cambios más recientes del `upstream`:
        ```bash
        git fetch upstream
        ```
    *   **Restablece** tu `main` local para que coincida exactamente con el `main` del `upstream`. **¡Cuidado! Esto descartará cualquier commit que hayas hecho directamente en tu `main` local.**
        ```bash
        git reset --hard upstream/main
        ```
        *(Alternativa si prefieres merge y resolver conflictos en main: `git merge upstream/main`, pero mantener `main` limpio suele ser más fácil).*
    *   (Opcional) Actualiza la rama `main` de tu fork en GitHub:
        ```bash
        git push origin main --force
        ```
        *(Se necesita `--force` porque reescribiste el historial local con `reset --hard`)*.

2.  **Integra los cambios del `upstream` en tu rama de corrección:**
    *   Supongamos que estabas corrigiendo el Bug 1 en una rama llamada `fix/bug-1-mensaje-error`. Cambia a esa rama:
        ```bash
        git checkout fix/bug-1-mensaje-error
        ```
    *   Ahora, aplica tus cambios (commits) de esta rama *encima* de la versión actualizada de `main` usando `rebase`:
        ```bash
        git rebase main
        ```
    *   **Resolución de Conflictos:** Es *posible* que ocurran conflictos si los nuevos cambios del `upstream` modificaron las mismas líneas que tú corregiste. Git te indicará los archivos conflictivos. Deberás:
        *   Abrir los archivos con conflictos.
        *   Editar las secciones marcadas (`<<<<<<<`, `=======`, `>>>>>>>`) para dejar el código final deseado (probablemente querrás mantener tu corrección *y* incorporar la parte relevante del cambio del `upstream` si es un nuevo módulo).
        *   Guardar los archivos.
        *   Marcar los conflictos como resueltos: `git add <archivo_con_conflicto>`
        *   Continuar el rebase: `git rebase --continue`
        *   Repetir si hay más conflictos. Si te atascas, puedes abortar con `git rebase --abort`.
    *   Una vez que el `rebase` termine sin errores, tu rama `fix/bug-1-mensaje-error` contendrá tanto los últimos cambios del `upstream` (porque partió de `main` actualizado) como tus correcciones específicas para el Bug 1.

3.  **(Opcional) Actualiza tu rama de corrección en GitHub:**
    ```bash
    # Puede requerir --force si el rebase reescribió commits existentes en la rama
    git push origin fix/bug-1-mensaje-error --force
    ```

Repite el paso 2 (`checkout` a la rama y `rebase main`) para cada una de tus otras ramas de corrección donde quieras incorporar las actualizaciones del `upstream`.

### 5. Flujo de Trabajo Sugerido para Estudiantes

1.  **Configuración Inicial:**
    *   Haz **Fork** del repositorio original.
    *   **Clona** tu fork localmente.
    *   Configura el remoto **`upstream`**.

2.  **Para Corregir un Bug (ej. Bug X):**
    *   **Actualiza tu `main` local** desde `upstream` (ver paso 1 de la Sección 4).
    *   **Crea una nueva rama** desde `main`:
        ```bash
        git checkout -b fix/bug-X-descripcion-corta
        ```
    *   **Realiza los cambios** para corregir el Bug X.
    *   **Haz commit** de tus cambios en esta rama:
        ```bash
        git add .
        git commit -m "Fix: Corrige Bug X (descripción)"
        ```
    *   (Opcional) Sube tu rama de corrección a tu fork en GitHub:
        ```bash
        git push origin fix/bug-X-descripcion-corta
        ```

3.  **Cuando el Repositorio Original se Actualice (Nuevos Bugs/Módulos):**
    *   **Actualiza tu `main` local** desde `upstream` (Sección 4, paso 1).
    *   **Integra** esos cambios en tu(s) rama(s) de corrección usando `git rebase main` (Sección 4, paso 2), resolviendo conflictos si es necesario.

4.  **Para Entregar/Mostrar Correcciones (si es necesario):**
    *   Si necesitas que el equipo original revise tus correcciones, puedes crear un **Pull Request (PR)** desde tu rama de corrección (`fix/bug-X...`) de tu fork hacia la rama `main` del repositorio original.
    *   Si solo necesitas tener el código funcional en tu fork, puedes (opcionalmente) fusionar tus ramas de corrección (`fix/bug-X...`) en tu rama `main` local *después* de haberla actualizado desde `upstream` (aunque mantener las correcciones en ramas separadas puede ser más claro para este ejercicio).

Este flujo separa claramente el código original actualizado (`main`) de tus correcciones específicas (`fix/*` branches), permitiéndote incorporar novedades sin perder tu trabajo.

