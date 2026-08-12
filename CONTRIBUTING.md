# Contributing

Guía de colaboración para el proyecto **Intranet Escolar**. El objetivo es mantener un repositorio ordenado, con historia clara y revisiones simples, en línea con el RNF-03 (control de versiones desde el inicio de la implementación).

## Flujo de trabajo

- Todo trabajo se realiza en ramas derivadas de `main`.
- Cada rama aborda **un solo cambio** y se integra mediante *Pull Request*.
- Las ramas se nombran de forma descriptiva y corta, con un prefijo según el tipo de cambio:

```text
feature/autenticacion-por-roles
fix/hash-de-contrasenas
docs/guia-de-colaboracion
refactor/capa-de-datos
```

## Política de ramas

- `main` es la rama protegida y siempre debe estar en estado funcional.
- No se hacen *pushes* directos a `main`.
- Toda integración pasa por revisión y por la verificación de los tests.

## Convención de commits

Los mensajes de commit siguen **Conventional Commits**:

```text
<type>(<scope>): <descripción>
```

Tipos permitidos:

- `feat` — nueva funcionalidad.
- `fix` — corrección de errores.
- `docs` — cambios en documentación.
- `refactor` — cambios que no agregan funcionalidad ni corrigen errores.
- `test` — incorporación o modificación de pruebas.
- `chore` — tareas de mantenimiento.

Ejemplos:

```text
feat(auth): agrega inicio de sesión diferenciado por rol
fix(sha256): corrige el padding de la longitud del mensaje
docs(readme): agrega cuentas de demostración
```

## Pasos para contribuir

1. Crear una rama desde `main`:

```bash
git checkout main
git pull
git checkout -b feature/mi-cambio
```

2. Realizar los cambios y verificarlos:

```bash
node --check js/app.js
```

3. Agregar y confirmar los cambios:

```bash
git add .
git commit -m "feat(x): descripción del cambio"
```

4. Subir la rama y abrir una *Pull Request*:

```bash
git push origin feature/mi-cambio
```

## Reglas para las Pull Requests

- La descripción debe explicar **qué** se cambia y **por qué**.
- Debe incluir una referencia al requerimiento asociado (por ejemplo, `RF-03`).
- Si el cambio modifica el comportamiento, debe acompañarse de una prueba.
- El autor revisa sus propios cambios antes de solicitar revisión.

## Pautas de código

- Nombres de archivos y variables en inglés usando `camelCase`.
- Componentes funcionales y modulares (ver `js/views.js`).
- No se agregan comentarios salvo que aporten contexto real (como referencias a requerimientos).
- Cada commit se asocia a un cambio específico y probado.
