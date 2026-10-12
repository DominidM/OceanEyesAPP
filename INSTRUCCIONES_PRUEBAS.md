# 📊 PRUEBAS DE CARGA CON FIREBASE EMULATOR

## ¿POR QUÉ NO JMETER?
- JMeter es para **backends tradicionales** (servidor dedicado)
- Firebase es **Backend-as-a-Service** (sin servidor)
- La solución correcta es usar **Node.js + API REST** del emulator

---

## PASO 1: INSTALAR DEPENDENCIAS

```bash
npm install firebase-tools
npm install -g firebase-tools
```

Verificar instalación:
```bash
firebase --version
```

---

## PASO 2: LEVANTAR FIREBASE EMULATOR

En tu proyecto (raíz):

```bash
firebase emulators:start --project oceaneyes-5e7b4 --only auth,firestore
```

**Verás algo así:**
```
✔ auth emulator started at http://127.0.0.1:9099
✔ firestore emulator started at http://127.0.0.1:8080
```

**NO cierres esta terminal** — déjala corriendo.

---

## PASO 3: EJECUTAR PRUEBAS DE CARGA

En OTRA terminal:

```bash
node test-emulator.js 50 10
```

**Parámetros:**
- `50` = número de usuarios a registrar
- `10` = concurrencia (usuarios simultáneos)

---

## EJEMPLOS DE EJECUCIÓN

**Prueba pequeña (5 usuarios):**
```bash
node test-emulator.js 5 2
```

**Prueba media (50 usuarios):**
```bash
node test-emulator.js 50 10
```

**Prueba grande (500 usuarios):**
```bash
node test-emulator.js 500 50
```

**Prueba de estrés (5000 usuarios):**
```bash
node test-emulator.js 5000 100
```

---

## SALIDA ESPERADA

```
═══════════════════════════════════════════════════════════
📊 PRUEBA DE CARGA - FIREBASE EMULATOR
═══════════════════════════════════════════════════════════
Usuarios: 50
Concurrencia: 10
Auth Emulator: http://localhost:9099

Iniciando 50 registros con concurrencia 10...
..................................................

═══════════════════════════════════════════════════════════
📈 RESULTADOS
═══════════════════════════════════════════════════════════
Total: 50 usuarios
✓ Exitosos: 50 (100%)
✗ Fallidos: 0 (0%)

Latencia (Exitosos):
  Promedio: 45.23 ms
  Mínimo: 32 ms
  Máximo: 156 ms

Tiempo total: 5.23 segundos
Throughput: 9.56 usuarios/seg

═══════════════════════════════════════════════════════════
```

---

## ¿QUÉ MIDE EL SCRIPT?

✓ **Usuarios creados exitosamente** - número y porcentaje  
✓ **Latencia media** - tiempo promedio por registro  
✓ **Latencia mín/máx** - rangos de rendimiento  
✓ **Throughput** - usuarios registrados por segundo  
✓ **Errores** - qué falló y por qué  

---

## SOLUCIONAR PROBLEMAS

### Error: "Connection refused"
**Solución:** Verifica que Firebase emulator esté corriendo en la OTRA terminal

### Error: "Email already exists"
**Solución:** Normal si ejecutas varias veces. Los usuarios persisten en el emulator. Reinicia con:
```bash
firebase emulators:start --project oceaneyes-5e7b4 --only auth,firestore --export-on-exit=./emulator-data
```

### Error: "Invalid API key"
**Solución:** Normal en emulador. El script usa clave fake. Es correcto.

---

## PARA CAPTURAR LOS RESULTADOS

Ejecuta y copia la salida en consola:
```bash
node test-emulator.js 50 10 > resultados.txt
```

Luego copia `resultados.txt` a tu informe.

---

## PRÓXIMOS PASOS

1. ✅ Levanta emulator (`firebase emulators:start`)
2. ✅ Ejecuta pruebas (`node test-emulator.js 50 10`)
3. ✅ Copia resultados a tu informe

¡Mucho más simple que JMeter! 🚀
