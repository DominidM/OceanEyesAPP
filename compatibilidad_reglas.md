# Compatibilidad de las reglas de `fix/cierre-100` con los clientes en uso

Fecha: 2026-11-11 · Rama analizada: `fix/cierre-100` (HEAD `d1d1b03`) · Cliente en uso: `main` (`9f533c6`)

**Alcance.** Todo se ejecutó en el Emulador de Firebase con el proyecto `demo-oceaneyes`. No se leyó, desplegó
ni consultó nada en `oceaneyes-5e7b4`. `main` no se modificó: su código se sacó con
`git worktree add --detach <scratchpad>/main-9f533c6 9f533c6`.

## 1. Método

- Un arnés Jest (`docs/compatibilidad-reglas/arnes/`) **importa y ejecuta las funciones reales de `main`**:
  - `src/mobile/shared/firebase/reports.ts`: `createReport`, `publishReportOnline`, `publishPendingReport`,
    `verifyReport`, `updateReportStatus`.
  - `rewards.ts`: `redeemReward`.
  - `auth.ts`: `updateUserProfile`.
- Esas funciones se ejecutan contra el emulador. Solo se sustituyen las dependencias que no tocan las reglas:
  - `app.ts`: Firestore/Storage autenticado del emulador.
  - Cloudinary/Storage: la subida devuelve una URL; el tamaño se prueba aparte contra `storage.rules`.
  - outbox, `device-id`, `ledger` (la transacción on-chain).
- Las escrituras que `main` hace directamente en pantallas (`report-detail-screen.tsx`, `profile-section.tsx`,
  `auth.ts:74`, `auth.ts:212`) se reproducen con el mismo payload, citado por archivo y línea de `main`.
- Cada flujo se ejecutó con cuatro conjuntos de reglas:

| Conjunto | Origen | `git hash-object` / sha1 |
|---|---|---|
| **viejas** | `main` (`git show 9f533c6:firestore.rules`, `storage.rules`) | `438cafd…` / `e8a3556…` |
| **nuevas** | `fix/cierre-100` (`firestore.rules`, `storage.rules`) | `218afcd…` / `7116238…` |
| **transición** | opción (a), `docs/compatibilidad-reglas/*.transicion.rules` | sha1 `48e5e22…` / `ba008da…` |
| **post-corte** | nuevas + canje ligado al débito, `firestore.post-corte.rules` | sha1 `d4007d5…` / (= nuevas) |

- Seed de cada prueba:
  - `alice`: usuaria con wallet y 300 puntos.
  - `dave`: usuario sin wallet.
  - `guest`: perfil de invitado.
  - `admin1`: rol `admin`.
  - `rewards/kit`: cuesta 150 y tiene stock 5.
  - Reportes de `alice`: `rPend` (pendiente) y `rRev` (en_revision).
- Comandos ejecutados (resultado: `Tests: 4 passed` en las 8 corridas):
  - Código de `main`: `bash run.sh <old|new|trans|post>`.
  - Código de la rama: `bash run-branch.sh <old|new|trans|post>`.
  - Suite de 32 pruebas de reglas de la rama: `bash run-suite.sh <new|trans|post>`.
  - En cada `it` se registra el resultado de cada flujo (OK/FALLA y mensaje del emulador). Los JSON están en
    `docs/compatibilidad-reglas/resultados/`.

## 2. Resultado: código de `main` con las reglas NUEVAS

Los números de línea son de `firestore.rules` y `storage.rules` de `fix/cierre-100`.

| # | Flujo (código de `main`) | Resultado | Regla que lo bloquea (línea exacta) |
|---|---|---|---|
| 1a | Crear reporte en línea, `createReport` (`reports.ts:73-81`) | **Funciona** | — |
| 1b | Crear reporte en línea con foto y audio, `publishReportOnline` (`reports.ts:89-166`) | **Funciona** | — |
| 2a | Outbox: `publishPendingReport` sin `remoteId` (`reports.ts:191-248`) | **Funciona** | — |
| 2b | Outbox: reintento con `remoteId` de un reporte aún pendiente (`reports.ts:247`) | **Funciona** | — |
| 2c | Outbox: reintento con `remoteId` de un reporte que el admin ya pasó a `en_revision` (`reports.ts:247`) | **Falla** | `firestore.rules:90` (`allow update` de `reports`). El emulador informa `false for 'update' @ L90`. La cláusula que falla es la **L92** `resource.data.status == 'pendiente'` (SEC-02): 2b y 2c solo difieren en el estado y 2b pasa. |
| 2d | Subida a Storage de una foto de 3 MB, `image/jpeg` (`media.ts:121`) | **Funciona** | — |
| 2e | Subida a Storage de un video de 30 MB, `video/mp4` (`media.ts:121`) | **Falla** (`storage/unauthorized`) | `storage.rules:13` `request.resource.size <= 25 * 1024 * 1024`. En `main` era `< 50 * 1024 * 1024`; 3 MB pasa y 30 MB no. |
| 3 | Canjear recompensa, `redeemReward` (`rewards.ts:59-109`) | **Falla** (toda la transacción) | **(1)** `firestore.rules:72` (`allow update` de `users`) → `isOwnerProfileUpdate` L64 → `isRedemptionDebit` **L50/L52**. El emulador dice: `Property lastRedemptionId is undefined on object. for 'update' @ L72`. Origen: `main` actualiza el saldo sin `lastRedemptionId` (`rewards.ts:82`). **(2)** `firestore.rules:205` (`allow create` de `pointTransactions`) → `isRedemptionTransaction` **L183/L186**. El emulador dice: `Property redemptionId is undefined on object. for 'create' @ L205`. Origen: `main` usa id aleatorio y no guarda `redemptionId` (`rewards.ts:94-103`). |
| 4 | Verificar desde el panel: `verifyReport` + `statusHistory` (`report-detail-screen.tsx:66,86`) | **Funciona** | — |
| 5a | Descartar desde el panel: `updateDoc` + `statusHistory` (`report-detail-screen.tsx:79,86`) | **Funciona** | — |
| 5b | Descartar con `updateReportStatus('descartado')` (`reports.ts:448-467`) | **Funciona** | — |
| 6 | Editar perfil, `updateUserProfile` (`auth.ts:301`, `edit-profile-screen.tsx:57`) | **Funciona** | — |
| 7a | Vincular wallet, `updateUserProfile({walletAddress})` (`profile-section.tsx:392`) | **Funciona** | — |
| 7b | Quitar wallet con `deleteField` (`profile-section.tsx:463`) | **Funciona** | — |
| 8a | Extra: alta de perfil, `ensureUserProfile` (`auth.ts:74`) | **Funciona** | — |
| 8b | Extra: vincular invitado, `setDoc merge` (`auth.ts:212`) | **Funciona** | — |

Atribución de líneas del canje, con cada escritura de `redeemReward` probada por separado
(`resultados/main-new.json`, filas 3.1–3.4):

| Escritura de `main` | Resultado | Motivo |
|---|---|---|
| `rewards` stock −1 (`rewards.ts:79`) | OK | — |
| `users` saldo −150 (`rewards.ts:82`) | **Falla** | `@ L72`, `lastRedemptionId is undefined` |
| `redemptions` set (`rewards.ts:85`) | OK | — |
| `pointTransactions` con id aleatorio (`rewards.ts:95`) | **Falla** | `@ L205`, `redemptionId is undefined` |

> En un batch fallido el emulador lista también líneas de otras escrituras del batch (p. ej. `L212`, `L227`).
> Las pruebas aisladas muestran que **solo L72 y L205 bloquean**.

**Impacto para el usuario de la APK vieja:**

- **Canje (3):** falla siempre. `rewards-section.tsx:43-44` muestra `e.message`. La transacción es atómica: no se
  descuenta saldo ni stock. Tras el intento fallido, el saldo de alice es 400 = 300 + 100 de la verificación
  posterior, sin débito.
- **Video mayor de 25 MB (2e):** el reporte **se publica sin ese video**.
  - Desde el outbox, el error se registra con `console.warn` (`reports.ts:221-224`) y el usuario no ve aviso.
  - En línea, el usuario ve un aviso `mediaWarning` (`reports.ts:122-126`).
  - `main` no valida el tamaño antes de subir.
- **Reintento del outbox (2c):** el elemento queda en `stuck` tras 5 intentos (`sync-engine.ts:17,156-160`) y el
  reporte se queda sin medios.
  - Afecta **igual al cliente nuevo**, como se ve en la tabla de la §4.
  - Es un efecto de SEC-02, no una incompatibilidad de la APK vieja.
  - Solo ocurre si el admin cambia el estado entre la creación del reporte y la subida de medios.

## 3. Hallazgos adicionales (medidos en el mismo arnés)

**H1. Con las reglas de `main`, la verificación desde el panel falla.**

- Flujo 4 con reglas viejas: **Falla**. Probado por separado, solo falla el asiento del crédito:
  `pointTransactions` con `userId` del reportante (`reports.ts:417`).
- Lo bloquea `firestore.rules@9f533c6:159`: `allow create: if signedIn() && request.resource.data.userId == request.auth.uid;`.
  El admin no es el dueño de la transacción.
- Si las reglas desplegadas hoy en producción son iguales a las de `main`, **verificar reportes está roto en
  producción**. Las reglas nuevas lo corrigen: el flujo 4 pasa con nuevas, transición y post-corte.
- No se comprobó qué reglas tiene desplegadas producción, porque estaba fuera de alcance.

**H2. Las reglas nuevas dejan crear un canje sin descontar puntos.**

- Caso A5: un cliente modificado crea `redemptions/{id}` sin tocar el saldo.
- La regla de `redemptions` (`firestore.rules:227-231`) solo valida `status` y `pointsSpent == pointsCost`. No liga
  el canje al débito.
- Ya estaba abierto con las reglas viejas; SEC-01..04 no lo cubrían.
- Lo cierran tanto la transición como el post-corte.

**H3. La APK nueva NO debe salir antes que las reglas nuevas.**

Con el código de la rama y las reglas viejas, crear reportes falla (`resultados/rama-old.json`):

| Flujo de la rama | Resultado | Regla vieja |
|---|---|---|
| `createReport`, `publishReportOnline`, `publishPendingReport` | **Falla** | `firestore.rules@9f533c6:91` `allow write: if isAdmin();` en `statusHistory` (la rama escribe `statusHistory/initial` en el mismo batch) |
| Canje, perfil, wallet | OK | — |

## 4. Matriz completa (OK = la regla lo permite)

Código de `main` (`resultados/main-*.json`):

| Flujo | viejas | nuevas | transición | post-corte |
|---|---|---|---|---|
| 1a/1b crear reporte en línea | OK | OK | OK | OK |
| 2a/2b outbox | OK | OK | OK | OK |
| 2c outbox, reintento tras cambio de estado | OK | FALLA | FALLA | FALLA |
| 2e video de 30 MB | OK | FALLA | OK | FALLA |
| 3 canjear | OK | **FALLA** | OK | **FALLA** |
| 4 verificar (panel) | **FALLA** (H1) | OK | OK | OK |
| 5a/5b descartar (panel) | OK | OK | OK | OK |
| 6 editar perfil · 7a/7b wallet · 8a/8b | OK | OK | OK | OK |

Código de la rama (`resultados/rama-*.json`):

| Flujo | viejas | nuevas | transición | post-corte |
|---|---|---|---|---|
| Crear reporte (1a, 1b, 2a) | **FALLA** (H3) | OK | OK | OK |
| Canjear | OK | OK | OK | OK |
| Verificar | FALLA (H1) | OK | OK | OK |
| Perfil y wallet | OK | OK | OK | OK |

Suite de reglas de la rama (32 pruebas, `__tests__/rules/security-rules.test.ts`):

| Reglas | Resultado |
|---|---|
| nuevas | 32/32 |
| transición | 32/32 |
| post-corte | 32/32 |

Abusos con un cliente modificado, ejecutados en batch (OK = **el abuso pasa**):

| Abuso | viejas | nuevas | transición | post-corte |
|---|---|---|---|---|
| A1 crédito falso `report_verified` +500 (SEC-04) | OK | bloqueado | bloqueado | bloqueado |
| A2 subir `pointsBalance` (SEC-03) | bloqueado | bloqueado | bloqueado | bloqueado |
| A3 cambiar `role` a admin (SEC-03) | bloqueado | bloqueado | bloqueado | bloqueado |
| A4 subir `totalPointsEarned` (SEC-03) | bloqueado | bloqueado | bloqueado | bloqueado |
| A5 canje sin débito de saldo (H2) | **OK** | **OK** | bloqueado | bloqueado |
| A6 dos canjes con un solo débito (vía legacy) | OK | bloqueado | **OK** | bloqueado |
| A7 dos canjes con un solo débito (vía `lastRedemptionId`) | OK | **OK** | **OK** | bloqueado |
| A8 débito con asiento y sin canje (daño propio) | OK | bloqueado | **OK** | bloqueado |
| A9 asiento legacy con monto positivo | OK | bloqueado | bloqueado | bloqueado |
| A10 crear reporte ya verificado con puntos (SEC-01) | OK | bloqueado | bloqueado | bloqueado |
| A11 el dueño cambia el estado de su reporte (SEC-02) | bloqueado | bloqueado | bloqueado | bloqueado |

## 5. Opciones

### (a) Reglas de transición que aceptan la APK de `main`

Archivos: `docs/compatibilidad-reglas/firestore.transicion.rules` y `storage.transicion.rules`.
Son las reglas nuevas con cuatro cambios:

1. **`users`**: se añade `isLegacyRedemptionDebit()` (L69-73, usada en L80-81). El dueño puede **solo bajar** su
   `pointsBalance`, sin tocar ningún otro campo y sin quedar en negativo.
2. **`pointTransactions`**: se añade `isLegacyRedemptionTransaction()` (L206-216, usada en L228). Acepta el asiento
   con id aleatorio de `main` solo si:
   - las claves son exactamente las de `rewards.ts:95-103`;
   - `type == 'redemption'`;
   - `amount == -rewards.pointsCost`;
   - el saldo del usuario baja exactamente ese monto en el mismo batch.
3. **`redemptions`** (L255-258, para ambos clientes): el canje solo se crea si el saldo baja `pointsSpent` en el
   mismo batch. Cierra H2.
4. **Storage** (L14-15): admite videos de hasta 50 MB; el resto sigue en 25 MB. La rama ya valida 25 MB en el
   cliente.

Ventajas:

- Con la APK de `main` todos los flujos pedidos funcionan, incluido el canje (§4). La única excepción es 2c, que
  también afecta al cliente nuevo.
- La APK nueva funciona: suite 32/32 y flujos de la rama en OK.
- **No reabre SEC-01..04**: A1, A2, A3, A4, A9, A10 y A11 siguen bloqueados.
- Cierra H2 (A5), que hoy está abierto incluso con las reglas nuevas.

**Riesgos de (a):**

- **Doble canje con un solo débito (A6/A7).** Un cliente **modificado** puede crear dos canjes en el mismo batch
  pagando uno.
  - A7 también pasa con las reglas nuevas tal como están en la rama, así que (a) no es peor que desplegar las nuevas.
  - Se detecta en el panel de canjes: dos canjes del mismo usuario con el mismo `createdAt`.
  - Lo cierra el post-corte.
- **Débito sin canje (A8).** Un cliente modificado puede restarse puntos y crear un asiento de canje sin canje.
  - Es daño propio y no da ventaja, pero deja asientos huérfanos.
- **Videos de 25 a 50 MB.** Durante la transición se aceptan, así que RNF-09 no se cumple para videos hasta el corte.
  - Si se prefiere cumplir RNF-09 desde el día 1, despliega `storage.rules` de la rama en lugar del de transición.
  - El efecto es el de 2e: la APK vieja publica el reporte sin el video.
- **Deuda operativa.** Hay que acordarse de retirar la transición; el criterio está en la §6, paso 5.
  - Las reglas hacen 2–3 lecturas `get/getAfter` más por canje. En el emulador no se superó ningún límite.

### (b) Corte con APK obligatorio (desplegar las reglas nuevas tal cual)

Ventajas:

- Reglas finales desde el día 1; no hay que mantener ni retirar una transición.
- La verificación del panel funciona (H1 corregido).

**Riesgos de (b):**

- **Los usuarios con la APK de `main` no pueden canjear** (flujo 3) hasta instalar la nueva.
  - Ven el error de Firestore en `rewards-section.tsx:44`; no pierden puntos.
  - Videos de más de 25 MB: el reporte se publica sin el video (2e).
- **No hay mecanismo para hacer obligatoria la APK.**
  - `eas.json` distribuye la APK como `internal` (`buildType: apk`), sin tienda.
  - En `src/` no hay control de versión mínima: `grep minVersion|forceUpdate|appVersion` no encontró nada.
  - `package.json` no incluye `expo-updates`.
  - El "corte obligatorio" depende de avisar a los usuarios y de que reinstalen.
- **H2 (A5) sigue abierto** con las reglas nuevas de la rama. Si se elige (b), conviene desplegar directamente
  `firestore.post-corte.rules`: cierra A5, A6 y A7, y la APK nueva pasa 32/32.

### Recomendación

**(a) y después el post-corte.** El canje es el único flujo pedido que se rompe, y (a) lo mantiene sin reabrir
SEC-01..04. Además corrige H1 y H2 desde el primer despliegue. El riesgo residual (A6/A7) requiere un cliente
modificado y ya existe con las reglas nuevas (A7).

## 6. Orden de despliegue recomendado

> Nada de esto se ejecutó. Son comandos para el responsable del despliegue, con credenciales de
> `oceaneyes-5e7b4`. `firebase.json` despliega `firestore.rules` y `storage.rules` de la raíz.

**0. Antes de desplegar**

1. Fusionar el PR de `fix/cierre-100` en `main`, con el CI en verde.
2. En la consola de Firebase (Firestore → Reglas y Storage → Reglas), comparar lo publicado con
   `git show 9f533c6:firestore.rules` y `git show 9f533c6:storage.rules`. Así se confirma si H1 afecta a producción
   y si este análisis aplica.
3. Para (a), un commit que copie las reglas de transición a la raíz:

```bash
cp docs/compatibilidad-reglas/firestore.transicion.rules firestore.rules
cp docs/compatibilidad-reglas/storage.transicion.rules storage.rules
npm run test:rules        # debe dar 32/32 (verificado en emulador con estas reglas)
git commit -am "fix(rules): reglas de transición para la APK 9f533c6"
```

**1. Reglas, siempre primero** (por H3: la APK nueva no puede crear reportes con las reglas viejas)

```bash
firebase deploy --only firestore:rules,storage --project oceaneyes-5e7b4
```

- Prueba de humo con la APK vieja: crear reporte, canjear (con (a)), editar perfil y vincular wallet.
- Prueba de humo en el panel: verificar y descartar.
- Rollback: `git checkout 9f533c6 -- firestore.rules storage.rules` y repetir el `firebase deploy`. Vuelve H1.

**2. Worker + panel web** (se despliegan juntos: el panel `/admin` es parte de `dist/`)

```bash
npm ci
npm run deploy:web        # expo export --platform web && node scripts/fix-assets.cjs && npx wrangler deploy
```

- Requiere las variables `EXPO_PUBLIC_*` del `.env` de producción en la máquina que construye.
- `/api/send-push` exige ahora `Authorization: Bearer <idToken>`. Las pestañas del panel abiertas con el JS
  anterior recibirán 401 al enviar alertas hasta recargar.
- La APK no llama al Worker. `grep "/api/"` en `main` solo encuentra el panel y la landing.
- Rollback: `npx wrangler rollback`, o desplegar desde `9f533c6`.

**3. APK nueva**

1. Subir `expo.version` en `app.json` (hoy `1.0.0`) para distinguirla.
2. Construir:

```bash
npm run build:apk         # eas build -p android --profile preview
```

3. Distribuir el enlace de EAS a los usuarios y pedir que actualicen.

**4. Periodo de convivencia (solo opción (a))**

Hay dos señales de que todavía se usa la APK vieja:

- documentos `pointTransactions` con `type == 'redemption'` **sin** campo `redemptionId`;
- reportes nuevos **sin** `statusHistory/initial`.

**5. Corte: reglas post-corte** (cuando esas señales lleguen a cero durante el periodo que se decida)

```bash
cp docs/compatibilidad-reglas/firestore.post-corte.rules firestore.rules
git checkout fix/cierre-100 -- storage.rules     # 25 MB para todo
npm run test:rules                                # 32/32 verificado con estas reglas
firebase deploy --only firestore:rules,storage --project oceaneyes-5e7b4
```

Para la opción (b): saltar los pasos 0.3 y 4, y desplegar en el paso 1 las reglas post-corte (o las nuevas tal cual,
aceptando H2).

## 7. Limitaciones

- **Flujos fuera del arnés:**
  - Las pantallas de React Native no se ejecutaron; se citan sus payloads por archivo y línea.
  - Las subidas a Cloudinary y la transacción on-chain se sustituyeron por stubs; no dependen de `firestore.rules`.
- **Versiones y entorno:**
  - El arnés usa `firebase` 11.10.0 (la de `__tests__/`). `main` declara `^12.17.0`. Las reglas evalúan lo que llega
    al servidor, que es igual en ambas versiones para estas operaciones. No se ejecutó con la 12.
  - El emulador no reproduce los límites de cuota ni la latencia de producción.
- **Atribución de líneas:**
  - Para 2c el emulador informa la línea del `allow` (L90). La cláusula L92 se deduce del contraste 2b/2c.
  - Para 2e Storage no informa la línea. L13 se deduce de que la única cláusula que depende del tamaño es esa.
- **Producción:** no se consultaron las reglas publicadas en producción (H1 queda condicionado al paso 0.2).
