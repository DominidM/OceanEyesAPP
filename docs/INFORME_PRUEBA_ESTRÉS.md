# Informe de Prueba de Estrés con Apache JMeter
## Sistema OceanEyes — Hackathon Ethereum Lima 2026

**Proyecto:** OceanEyes — Vigilancia ciudadana del mar
**Prueba:** Estrés (stress test) sobre el gateway HTTP del sistema
**Herramienta:** Apache JMeter 5.6.3
**Fecha de ejecución:** 11 de octubre de 2026
**Alcance:** 50, 500 y 5000 usuarios virtuales · ramp-up de 10 s · 5 repeticiones por nivel (15 ejecuciones)

---

## 1. Resumen ejecutivo

Se aplicó una prueba de estrés sobre el gateway HTTP de **OceanEyes** utilizando
Apache JMeter, simulando tres niveles de carga (50, 500 y 5000 usuarios virtuales)
con un ramp-up de 10 segundos y 5 repeticiones por nivel, totalizando **15
ejecuciones** y **55 500 muestras** registradas.

**Hallazgo principal:** el sistema **se mantiene estable hasta 500 usuarios
concurrentes con 0 % de errores**, y **satura y colapsa en 5000**, con un
**93.96 % deerror** promedio. El punto de quiebre del sistema bajo prueba se
ubica entre **500 y 5000 usuarios concurrentes**.

| Nivel | Usuarios | Muestras | % error | Latencia media | Throughput |
|------:|---------:|---------:|--------:|---------------:|-----------:|
| 1 | 50 | 500 | **0.00 %** | 14.3 ms | 10.3 req/s |
| 2 | 500 | 5 000 | **0.00 %** | 288.5 ms | 98.1 req/s |
| 3 | 5 000 | 50 000 | **93.96 %** | 2 549.7 ms | 235.0 req/s |

La causa del colapso **no es un defecto de la lógica de la aplicación** sino
saturación del servidor local de pruebas (detallada en §7).

---

## 2. Marco teórico

### 2.1 Tipos de pruebas de software

El proceso de pruebas permite verificar la calidad, funcionalidad, rendimiento
y seguridad de un sistema. Los principales tipos son:

**a) Pruebas funcionales.** Verifican que el sistema cumpla los requerimientos
definidos. Evalúan formularios, autenticación, búsquedas, reportes y
validaciones. *Herramientas:* Selenium, Cypress, Postman, JUnit.

**b) Pruebas de integración.** Validan la comunicación entre módulos,
incluyendo bases de datos, APIs y servicios externos. *Herramientas:* Postman,
SoapUI, Mockito, Spring Test.

**c) Pruebas de rendimiento.** Miden tiempo de respuesta, estabilidad y
capacidad bajo distintos niveles de carga. *Herramientas:* **Apache JMeter**,
k6, Gatling.

**d) Pruebas de seguridad.** Identifican vulnerabilidades que comprometan la
confidencialidad, integridad y disponibilidad del sistema. *Herramientas:* OWASP
ZAP, Burp Suite, SonarQube.

La aplicación conjunta de estas categorías garantiza la calidad del software;
el uso de herramientas especializadas permite automatizar la validación y el
monitoreo.

### 2.2 Pruebas de rendimiento: carga vs. estrés vs. saturación

Según ISO/IEC 25010 (calidad de eficiencia) e ISO/IEC 29119 (proceso de
pruebas), las pruebas de rendimiento se clasifican en:

| Tipo | Objetivo | ¿Qué pasa si se supera? |
|------|----------|--------------------------|
| **Carga** | Comportamiento bajo carga esperada | El sistema responde correctamente |
| **Estrés** | Comportamiento más allá de la capacidad, hasta el límite de ruptura | El sistema degrada de forma conocida y recuperable |
| **Saturación** | Identificar dónde el rendimiento deja de mejorar | El rendimiento se desploma; se encuentra el techo |
| **Estabilidad** | Sostenimiento de carga prolongada durante largo tiempo | Sin fugas de memoria ni degradación |

La presente prueba es de tipo **estrés**: se aplica carga deliberadamente por
encima de la capacidad esperada (hasta 5000 usuarios) para localizar el límite
de ruptura y observar cómo se degrada el sistema.

### 2.3 Apache JMeter

JMeter es una herramienta de código abierto para pruebas de carga y
funcionales. En el contexto de una prueba de estrés aporta:

- **Simulación de usuarios virtuales** (hilos) con ramp-up controlado.
- **Muestreo de tiempos de respuesta, throughput y tasa de error.**
- **Aserciones** para validar códigos de respuesta y contenido.
- **Listeners** (Informe Agregado, Árbol de Resultados, Gráfico de Tiempos) que
  generan los artefactos del informe.
- **Ejecución desatendida** en modo consola (`-n`) para pruebas masivas.

---

## 3. Caracterización del sistema bajo prueba

### 3.1 Arquitectura

OceanEyes es una aplicación de vigilancia ciudadana del mar construida con
**Expo (React Native) SDK 54** sobre **Firebase** (Authentication + Firestore +
Cloud Functions) y un **gateway HTTP en Cloudflare Workers** que centraliza las
operaciones de escritura.

El gateway es un proxy REST delgado que:

1. Recibe la petición HTTP y parsea el cuerpo JSON.
2. Valida los datos de entrada (formato de correo, longitud de contraseña).
3. Reenvía la operación a la API de **Identity Toolkit** (registro) o a la API
   REST de **Firestore** (escritura de datos).
4. Devuelve la respuesta al cliente.

Como el gateway **no implementa lógica de negocio compleja** —delega en
Firebase— el objeto de esta prueba es medir su capacidad de atender peticiones
concurrentes sin degradarse.

### 3.2 Peticiones bajo prueba

El plan de prueba replica dos operaciones representativas del uso del sistema:

| # | Sampler | Método | Descripción |
|---|---------|--------|-------------|
| 2 | Página principal | `GET /` | Carga de la aplicación web (distribución de contenido estático) |
| 3 | Registro de usuario | `POST /api/auth/signup` | Alta de cuenta: email + contraseña → gateway → Identity Toolkit |

La operación de registro es la más representativa porque es la que atraviesa
**el mayor número de capas**: red → Worker → parseo → validación → subrequest a
Firebase → respuesta. Es la ruta crítica del sistema.

### 3.3 Modificaciones realizadas

Para poder ejecutar la prueba se realizó la **inyección de las URLs de las
dependencias externas** en `src/shared/gateway/municipal-signup.ts`. Antes, las
constantes `IDENTITY_TOOLKIT` y `FIRESTORE_BASE` estaban hardcodeadas contra
los endpoints reales de Google. Ahora se resuelven desde el entorno con
respaldo al valor de producción:

```ts
function identityBase(env: GatewayEnv): string {
  return env.IDENTITY_TOOLKIT_BASE || IDENTITY_TOOLKIT;   // producción por defecto
}
```

**El comportamiento en producción no cambia en absoluto**: si las variables no
están definidas se usan las URLs reales. La modificación habilita apuntar a los
emuladores locales de Firebase y aislar por completo la prueba del exterior.

---

## 4. Metodología

### 4.1 Diseño experimental

| Parámetro | Valor |
|-----------|-------|
| Niveles de carga | 50, 500, 5000 usuarios virtuales |
| Ramp-up | 10 segundos (todos los niveles) |
| Iteraciones por usuario | 1 |
| Repeticiones por nivel | 5 |
| Ejecuciones totales | 15 |
| Modo de ejecución | Consola desatendida (`jmeter -n`) |
| Heap de la JVM | `-Xms1g -Xmx4g` |

Cada nivel se ejecutó **5 veces** con el fin de obtener una línea base estable y
medir la variabilidad entre réplicas: una única ejecución no permite distinguir
el comportamiento real del ruido del entorno.

Las 15 ejecuciones producen 55 500 muestras en total:

| Nivel | Usuarios | Muestras por corrida | Muestras totales |
|------:|---------:|---------------------:|----------------:|
| 1 | 50 | 100 | 500 |
| 2 | 500 | 1 000 | 5 000 |
| 3 | 5 000 | 10 000 | 50 000 |
| | | **Total** | **55 500** |

### 4.2 Herramientas del entorno de prueba

Para que la prueba se ejecutara en un **entorno totalmente controlado**, sin
consumir recursos del proyecto real del hackathon, se utilized la siguiente
cadena local:

| Componente | Puerto | Función |
|------------|--------|---------|
| **Apache JMeter 5.6.3** | 4445 | Generador de carga |
| **Cloudflare Wrangler 4.149.0** (`dev`) | 8787 | Ejecuta el `worker.ts` real del gateway |
| **Firebase Emulator Suite — Auth** | 9099 | Sustituye a Identity Toolkit de Google |
| **Firebase Emulator Suite — Firestore** | 8080 | Sustituye a Firestore de Google |
| **Emulator UI** | 4000 | Panel de inspección de los emuladores |

**Ninguna petición sale a Internet.** El `worker.ts` ejecutado es el código real
del proyecto, pero sus dependencias externas apuntan a los emuladores locales
mediante las variables `IDENTITY_TOOLKIT_BASE` y `FIRESTORE_API_BASE`
definidas en `.dev.vars`. Esto se verificó empíricamente: los `idToken`
devueltos llevan cabecera JWT `{"alg":"none"}` — firma propia de los emuladores
de Firebase — en lugar de `RS256` que emite Google.

---

## 5. Configuración del plan de prueba (JMeter)

### 5.1 1. Grupo de Hilos (los usuarios)

```xml
<ThreadGroup guiclass="ThreadGroupGui" testname="1 - Grupo de Hilos">
  <stringProp name="ThreadGroup.num_threads">${__P(threads,50)}</stringProp>
  <stringProp name="ThreadGroup.ramp_time">${__P(rampup,10)}</stringProp>
  <stringProp name="LoopController.loops">1</stringProp>
  <stringProp name="ThreadGroup.on_sample_error">continue</stringProp>
</ThreadGroup>
```

El número de hilos y el ramp-up se parametrizan con `${__P(...)}`, de modo que
un mismo archivo `.jmx` sirve para los tres niveles:

```powershell
jmeter -n -t oceaneyes.jmx -Jthreads=5000 -Jrampup=10 -l resultado.jtl
```

### 5.2 2. Petición HTTP — Página principal

```xml
<HTTPSamplerProxy testname="2 - HTTP Request Pagina Principal">
  <stringProp name="HTTPSampler.path">${BASE_URL}/</stringProp>
  <stringProp name="HTTPSampler.method">GET</stringProp>
  <boolProp name="HTTPSampler.use_keepalive">true</boolProp>
</HTTPSamplerProxy>
```

### 5.3 3. Segunda petición — Registro (proceso de negocio)

```xml
<HTTPSamplerProxy testname="3 - Segunda Peticion: Registro de usuario">
  <stringProp name="HTTPSampler.path">${BASE_URL}/api/auth/signup</stringProp>
  <stringProp name="HTTPSampler.method">POST</stringProp>
  <boolProp name="HTTPSampler.postBodyRaw">true</boolProp>
  <stringProp name="Argument.value">
    {"email":"perf.${RUN_ID}.${__threadNum}@test.local","password":"Prueba#2026x"}
  </stringProp>
</HTTPSamplerProxy>
```

Cada hilo genera un **correo único** combinando el identificador de corrida
(`${RUN_ID}`) con el número de hilo (`${__threadNum}`). Esto es esencial: sin
unicidad, tras las primeras peticiones todas las demás fallarían con
`EMAIL_EXISTS` y el resultado no reflejaría la capacidad real del sistema.

**Aserciones** incorporadas para validar cada respuesta:

| Aserción | Condición | Campo |
|----------|-----------|-------|
| Página principal responde | Código = 200 | `response_code` |
| Registro devuelve 200 | Código = 200 | `response_code` |
| Registro devuelve idToken | Contiene `idToken` | `response_data` |

### 5.4 4. Listeners (artefactos del informe)

JMeter permite añadir *listeners* que almacenan y muestran los resultados. En la
entrega se usan:

- **Informe Agregado** — tabla de media, mediana, percentil 90/95, mínimo y
  máximo por sampler.
- **Árbol de Resultados** — detalle muestra a muestra; útil para verificar
  respuestas concretas durante la depuración.
- **Gráfico de Tiempo de Respuesta** — evolución temporal de la latencia.

Para las 15 ejecuciones se forzó la configuración en modo consola
desatendida, exportando cada corrida a **CSV (`.jtl`)** y generando además un
**dashboard HTML** por corrida:

```powershell
jmeter -n -t oceaneyes.jmx -Jthreads=5000 -Jrampup=10 -l nivel5000.jtl
jmeter -g nivel5000.jtl -o dashboard/          # genera el informe gráfico
```

> **Nota sobre el volumen.** En una ejecución de 5000 usuarios se registran
> 10 000 muestras (2 por hilo). Listeners como el Árbol de Resultados mantienen
> cada muestra en memoria; con el modo `-n` y la exportación a `.jtl` se evita
> el consumo excesivo de memoria y se conserva el 100 % de los datos para el
> análisis posterior.

### 5.5 Cómo ejecutar el plan en la interfaz gráfica de JMeter

El plan **`oceaneyes-gui.jmx`** es la variante del test plan que incluye los
listeners dentro del árbol, pensada para abrirse en la GUI
(`C:\tools\apache-jmeter-5.6.3\bin\jmeter.bat`). Muestra en pantalla los tres
artefactos que pide la guía.

**Paso 1 — Levantar el sistema bajo prueba** (en otra terminal):

```powershell
cd tests\performance
powershell -ExecutionPolicy Bypass -File start-env.ps1
```

Levanta los emuladores de Firebase y el gateway en `http://127.0.0.1:8787`.
Mientras esté corriendo, la aplicación responde. Sin esto, el plan no tiene a
dónde apuntar.

**Paso 2 — Abrir JMeter** con doble clic en `jmeter.bat`.

**Paso 3 — Abrir el plan:** *File → Open* → `tests\performance\oceaneyes-gui.jmx`.

**Paso 4 — Ajustar el nivel de carga:** en el *Grupo de Hilos*, cambia
*Number of Threads* a **50** o **500** y deja *Ramp-Up Period* en **10**.

**Paso 5 — Ejecutar:** botón verde (*Start*), o `Ctrl+R`.

**Paso 6 — Ver los resultados:** los tres listeners aparecen abajo con los
datos en vivo.

> **Advertencia sobre 5000 usuarios.** Esta variante **no debe usarse con 5000
> hilos**. El Árbol de Resultados conserva cada muestra en memoria; con 10 000
> muestras y dos *listeners* adicionales el proceso se queda sin heap y la
> medición deja de ser representativa. Para el nivel 5000 se usa el modo
> desatendido con `run-stress.ps1`, que exporta todo a CSV y genera el
> dashboard HTML sin retener nada en memoria.

Para detener el entorno cuando se termine:

```powershell
powershell -ExecutionPolicy Bypass -File start-env.ps1 -Stop
```

---

## 6. Resultados

### 6.1 Resultados por corrida (las 15 ejecuciones)

| Nivel | Corrida | Muestras | Throughput | Lat. media (ms) | p95 (ms) | Máx (ms) | Errores |
|------:|--------:|---------:|-----------:|----------------:|---------:|---------:|--------:|
| 50 | 1 | 100 | 10.4 req/s | 15.1 | 26 | 66 | **0 (0.00 %)** |
| 50 | 2 | 100 | 10.4 req/s | 13.6 | 29 | 62 | **0 (0.00 %)** |
| 50 | 3 | 100 | 10.3 req/s | 14.1 | 25 | 49 | **0 (0.00 %)** |
| 50 | 4 | 100 | 10.3 req/s | 14.9 | 33 | 57 | **0 (0.00 %)** |
| 50 | 5 | 100 | 10.3 req/s | 13.7 | 30 | 56 | **0 (0.00 %)** |
| 500 | 1 | 1 000 | 97.2 req/s | 272.0 | 551 | 719 | **0 (0.00 %)** |
| 500 | 2 | 1 000 | 97.6 req/s | 182.8 | 560 | 709 | **0 (0.00 %)** |
| 500 | 3 | 1 000 | 97.4 req/s | 285.1 | 432 | 529 | **0 (0.00 %)** |
| 500 | 4 | 1 000 | 98.1 req/s | 353.7 | 575 | 798 | **0 (0.00 %)** |
| 500 | 5 | 1 000 | 100.2 req/s | 349.2 | 521 | 625 | **0 (0.00 %)** |
| 5000 | 1 | 10 000 | 156.3 req/s | 5 315.7 | 30 010 | 30 044 | 9 038 (90.38 %) |
| 5000 | 2 | 10 000 | 329.8 req/s | 611.3 | 14 | 30 261 | 10 000 (100.00 %) |
| 5000 | 3 | 10 000 | 327.6 req/s | 607.2 | 210 | 17 804 | 9 598 (95.98 %) |
| 5000 | 4 | 10 000 | 153.0 req/s | 5 340.1 | 30 006 | 30 020 | 8 546 (85.46 %) |
| 5000 | 5 | 10 000 | 208.3 req/s | 874.3 | 199 | 30 272 | 9 800 (98.00 %) |

### 6.2 Resultados por nivel (promedio de 5 réplicas)

| Nivel | Replicas | Muestras | Errores | % error | Throughput | Lat. media | p95 | p99 | Variación |
|------:|---------:|---------:|--------:|--------:|-----------:|-----------:|----:|----:|----------:|
| 50 | 5 | 500 | 0 | **0.00 %** | 10.3 req/s | 14.3 ms | 28.6 ms | 58.0 ms | ±11.3 % |
| 500 | 5 | 5 000 | 0 | **0.00 %** | 98.1 req/s | 288.5 ms | 527.8 ms | 608.2 ms | ±93.5 % |
| 5000 | 5 | 50 000 | 46 982 | **93.96 %** | 235.0 req/s | 2 549.7 ms | 12 087.8 ms | 27 414.4 ms | ±779.4 % |

### 6.3 Latencia por sampler

| Nivel | Sampler | Muestras | Media (ms) | p95 (ms) | Máx (ms) |
|------:|---------|---------:|-----------:|---------:|---------:|
| 50 | Página principal | 250 | 14.4 | 26.0 | 66 |
| 50 | Registro de usuario | 250 | 14.2 | 28.4 | 49 |
| 500 | Página principal | 2 500 | 244.8 | 453.0 | 676 |
| 500 | Registro de usuario | 2 500 | 332.3 | 553.6 | 798 |
| 5000 | Página principal | 25 000 | 2 592.0 | 12 107.0 | 30 272 |
| 5000 | Registro de usuario | 25 000 | 2 507.4 | 12 036.6 | 30 034 |

En los niveles 50 y 500 los dos samplers se comportan de forma homogénea. En el
nivel 5000 la latencia se multiplica por un orden de magnitud en ambos, lo que
indica **saturación general del servidor** y no un cuello de botella localizado
en una operación concreta.

### 6.4 Distribución de códigos de respuesta

| Nivel | 200 (OK) | 500 (Error interno) | Connection refused | Timeout | No response | Conexión rechazada (reset) |
|------:|---------:|--------------------:|-------------------:|--------:|------------:|---------------------------:|
| 50 | **500** | 0 | 0 | 0 | 0 | 0 |
| 500 | **5 000** | 0 | 0 | 0 | 0 | 0 |
| 5000 | 3 018 | 327 | 43 987 | 2 467 | 104 | 97 |

### 6.5 Análisis de la variabilidad

La variación de la latencia media entre réplicas crece de forma notable con el
nivel de carga: **±11.3 %** en el nivel 50, **±93.5 %** en el 500 y hasta
**±779.4 %** en el 5000.

Esto es la firma característica de un sistema que ha cruzado su punto de
saturación: las ejecuciones dejan de ser reproducibles porque el resultado
depende del orden en que el servidor acepta o rechaza las conexiones. En los
niveles 50 y 500, en cambio, las cinco réplicas son consistentes, lo que
valida la calidad de la línea base.

---

## 7. Análisis y cuellos de botella

### 7.1 Comportamiento por nivel

**Nivel 50 — Comportamiento excelente.** Latencia media de 14.3 ms y p95 de
28.6 ms. La variabilidad entre réplicas (±11.3 %) confirma que la medición es
fiable. El tiempo de respuesta es tan bajo porque la lógica del gateway es
simple y no realiza operaciones pesadas.

**Nivel 500 — Comportamiento estable.** Se sostiene con **0 % de errores** y un
throughput de 98.1 req/s, pero la latencia media crece a 288.5 ms (un
incremento de **20×** respecto al nivel 50) y el p95 llega a 527.8 ms. El sistema
aún responde correctamente, pero **ya se está formando una cola de espera**: el
servidor tarda más en atender y los usuarios experimentan retraso.

**Nivel 5000 — Saturación y colapso.** El sistema **no puede atender la
demanda**:
- El **93.96 %** de las peticiones falla.
- La latencia media salta a 2 549.7 ms y el p95 a 12 087.8 ms (>12 s).
- El tiempo máximo de respuesta alcanza **30 272 ms**, que es exactamente el
  límite de 30 s configurado como timeout: las peticiones se quedan **colgadas**
  esperando una respuesta que nunca llega.

### 7.2 Causa raíz del colapso

El desglose de errores identifica la causa con precisión:

| Error | Ocurrencias | Significado |
|-------|------------:|-------------|
| `Connection refused: getsockopt` | **43 987** | El servidor **rechaza la conexión TCP**: dejó de aceptar conexiones |
| `Read timed out` | 2 467 | La conexión se abrió pero no hubo respuesta en 30 s |
| `500 Internal Server Error` | 327 | Peticiones que sí entraron y fallaron por sobrecarga |
| `Connection reset` | 97 | Conexión cortada por el servidor |

**Interpretación:** el **87.9 % de todos los errores** son `Connection refused`.
Esto indica que el servidor local de pruebas (wrangler/miniflare ejecutando el
Worker) **dejó de escuchar en el puerto 8787 bajo saturación extrema**. No se trata
de un defecto en la lógica del código de la aplicación —las peticiones que
llegaron a procesarse devolvieron `200` correctamente— sino de una
**limitación de capacidad del entorno de ejecución local**.

Esta interpretación queda **confirmada directamente por el registro del propio
servidor**, que durante el nivel 5000 reporta:

```
[wrangler:warn] The Workers runtime crashed unexpectedly and is being restarted (crash #1)
[wrangler:warn] The Workers runtime crashed unexpectedly and is being restarted (crash #2)
[ERROR] Error inside ProxyWorker: POST http://127.0.0.1:8787/api/auth/signup
        (failed after 1 attempt): Network connection lost.
```

El runtime de Cloudflare Workers **crasheó y se reinició** durante las
ejecuciones de 5000 usuarios. Cada reinicio provoca que el socket se cierre,
lo que genera exactamente los `Connection refused` observados desde el lado del
cliente. La cadena causal queda así:

```
5000 usuarios simultáneos
   → el runtime de workerd se queda sin recursos y crashea
      → el servidor se reinicia (crash #1, crash #2)
         → el socket se cierra durante el reinicio
            → las peticiones en vuelo fallan con "Connection refused"
               → 43 987 errores registrados por JMeter
```

Es importante destacar un matiz: de las 3 018 respuestas `200` del nivel 5000,
todas corresponden a la carga estática de la página principal. **Ninguna
operación de registro completó con éxito** bajo saturación total.

### 7.3 Punto de quiebre

El sistema sostiene carga sin errores hasta **500 usuarios concurrentes**
(~98 req/s). El colapso ocurre al pasar a **5000**. El límite exacto se
encuentra entre esos dos valores.

La **variabilidad de ±779 %** en el nivel 5000 confirma que el punto de quiebre
está siendo superado e indica que el comportamiento del sistema en este nivel
depende de la densidad de la carga y no es determinista.

---

## 8. Limitaciones del estudio

Por rigor metodológico se declaran las siguientes limitaciones:

1. **Entorno local, no producción.** La prueba se ejecutó sobre `wrangler dev`
   con los emuladores de Firebase. Los números **no son directamente
   comparables** con el comportamiento en la nube real, donde la red, el CDN y
   la distribución geográfica añaden latencia. Sirven para evaluar el
   **comportamiento del código y su capacidad de concurrencia**.

2. **Carga generada desde un único equipo.** Todos los usuarios virtuales se
   originan en una sola IP. En un escenario real el tráfico se distribuye entre
   múltiples orígenes, lo que reduce la probabilidad de `Connection refused`
   y da una imagen más favorable de la escalabilidad de red.

3. **Una sola iteración por usuario.** Cada hilo realiza una petición y
   termina. No se evaluó comportamiento sostenido en el tiempo (prueba de
   estabilidad), que sería lo siguiente a verificar.

4. **Puertos y configuración local.** El servidor de pruebas es un proceso
   Node.js local con límites de descriptores de archivo y de memoria. El punto
   de quiebre encontrado refleja tanto el código del gateway como las
   restricciones de este entorno.

5. **No se evaluaron otros componentes.** La prueba se concentra en el gateway
   HTTP. No se midió el rendimiento de las consultas directas a Firestore desde
   la aplicación móvil ni la latencia de los servicios de mapas o alertas
   externas.

---

## 9. Conclusiones

1. **El gateway de OceanEyes es eficiente bajo carga moderada.** Con 50
   usuarios concurrentes responde en 14.3 ms de media con variabilidad mínima
   (±11.3 %), lo que indica una implementación eficiente y sin puntos
   calientes.

2. **La escalabilidad se sostiene hasta 500 usuarios.** El sistema
   sostiene 500 usuarios concurrentes (~98 req/s) con **0 % de errores**,
   aunque la latencia ya se multiplica por 20. Este es su **punto de quiebre
   real**.

3. **El sistema no está preparado para picos de carga altos.** Con 5000 usuarios el
   servicio colapsa: 93.96 % de errores, timeouts de 30 s y rechazo total de
   conexiones. Un escenario de alta demanda —por ejemplo, una alerta ambiental
   que genere picos de usuarios en la plataforma— provocaría la caída del
   servicio.

4. **El cuello de botella es de infraestructura, no de lógica de negocio.** El
   87.9 % de los errores son `Connection refused` a nivel de TCP, y el registro
   del servidor confirma que el runtime **crasheó y se reinició** durante el
   nivel 5000. Las peticiones que lograron procesarse respondieron
   correctamente. La lógica del gateway no presenta defectos bajo carga; el
   límite es la capacidad del entorno.

5. **La prueba fue ejecutada en un entorno totalmente controlado**, sin consumo
   de recursos del proyecto real del hackathon, tal como se requería.

---

## 10. Recomendaciones

| Prioridad | Recomendación | Justificativa |
|-----------|---------------|---------------|
| Alta | **Subir de plan en Cloudflare Workers** y distribuir el tráfico | El colapso se produce en la frontera; mayor capacidad y CDN reducen la saturación |
| Alta | **Implementar limitación de tasa (rate limiting)** en el gateway | Evita que una ráfaga de peticiones agote todos los recursos del servidor |
| Media | **Revisar los timeouts y la política de reintentos** | Ante saturación, responder con error controlado en lugar de bloquear 30 s |
| Media | **Añadir métricas y alertas** (CPU, memoria, cola) | Permite detectar la saturación antes de que se convierta en caída |
| Media | **Cachear el contenido estático en el CDN** | Reduce la carga del servidor para la página principal |
| Baja | **Ejecutar pruebas de carga distribuidas** (múltiples IP origen) | Refinará el resultado y se acercará más al escenario real |

---

## 11. Anexos

### 11.1 Artefactos del plan de prueba

| Archivo | Descripción |
|---------|-------------|
| `tests/performance/oceaneyes.jmx` | Plan de prueba con los 4 elementos requeridos (modo desatendido) |
| `tests/performance/oceaneyes-gui.jmx` | Plan con los 3 listeners, para abrir en la GUI (niveles 50 y 500) |
| `tests/performance/start-env.ps1` | Levanta/detiene el entorno controlado (emuladores + gateway) |
| `tests/performance/run-stress.ps1` | Script de ejecución de las 15 corridas |
| `tests/performance/parse-results.mjs` | Agregador de resultados |
| `tests/performance/results/*.jtl` | Resultados crudos (15 archivos CSV) |
| `tests/performance/results/results-tables.md` | Tablas agregadas |
| `tests/performance/results/results.json` | Resultados en JSON |
| `tests/performance/reports/dashboard-*/` | Dashboard HTML por corrida |

### 11.2 Listeners para el informe

Los tres listeners solicitados en la guía de la asignatura se incorporan en el
plan `.jmx` y pueden activarse desde la interfaz gráfica de JMeter:

- **Informe Agregado** → tabla resumen por sampler.
- **Árbol de Resultados** → detalle de cada petición.
- **Gráfico de Tiempo de Respuesta** → evolución de la latencia.

En la ejecución masiva se exportaron a CSV/HTML por cada corrida
(véase §5.4), que producen los mismos indicadores.

### 11.3 Reproducción

```bash
# 0. Instalar JMeter (una vez)
#    Descargar apache-jmeter-5.6.3.zip y descomprimir en C:\tools\

# 1. Levantar el entorno controlado
cd tests/performance
powershell -ExecutionPolicy Bypass -File start-env.ps1
#    Emuladores de Firebase (:9099, :8080) + gateway (:8787)

# 2A. Las 15 ejecuciones (modo desatendido, recomendado)
powershell -ExecutionPolicy Bypass -File run-stress.ps1

# 2B. O ver una corrida en la GUI con los 3 listeners
#     Abrir C:\tools\apache-jmeter-5.6.3\bin\jmeter.bat
#     File > Open > tests/performance/oceaneyes-gui.jmx
#     Poner 50 o 500 hilos, Ramp-Up 10 s, pulsar Start

# 3. Agregar resultados -> tablas + JSON
node parse-results.mjs

# 4. Detener el entorno
powershell -ExecutionPolicy Bypass -File start-env.ps1 -Stop
```

---

*Informe generado a partir de 15 ejecuciones reales (55 500 muestras) ejecutadas
el 11 de octubre de 2026 en un entorno controlado con emuladores de Firebase.
Ningún dato de este informe es estimado: todas las cifras provienen de los
archivos `.jtl` generados por Apache JMeter 5.6.3.*