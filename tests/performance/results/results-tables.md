## Resultados por corrida

| Nivel | Corrida | Muestras | TPS | Lat. media (ms) | p95 (ms) | max (ms) | Errores |
|---:|---:|---:|---:|---:|---:|---:|---:|
| 50 | 1 | 100 | 10.4 | 15.1 | 26.0 | 66.0 | 0 (0.00%) |
| 50 | 2 | 100 | 10.4 | 13.6 | 29.0 | 62.0 | 0 (0.00%) |
| 50 | 3 | 100 | 10.3 | 14.1 | 25.0 | 49.0 | 0 (0.00%) |
| 50 | 4 | 100 | 10.3 | 14.9 | 33.0 | 57.0 | 0 (0.00%) |
| 50 | 5 | 100 | 10.3 | 13.7 | 30.0 | 56.0 | 0 (0.00%) |
| 500 | 1 | 1000 | 97.2 | 272.0 | 551.0 | 719.0 | 0 (0.00%) |
| 500 | 2 | 1000 | 97.6 | 182.8 | 560.0 | 709.0 | 0 (0.00%) |
| 500 | 3 | 1000 | 97.4 | 285.1 | 432.0 | 529.0 | 0 (0.00%) |
| 500 | 4 | 1000 | 98.1 | 353.7 | 575.0 | 798.0 | 0 (0.00%) |
| 500 | 5 | 1000 | 100.2 | 349.2 | 521.0 | 625.0 | 0 (0.00%) |
| 5000 | 1 | 10000 | 156.3 | 5315.7 | 30010.0 | 30044.0 | 9038 (90.38%) |
| 5000 | 2 | 10000 | 329.8 | 611.3 | 14.0 | 30261.0 | 10000 (100.00%) |
| 5000 | 3 | 10000 | 327.6 | 607.2 | 210.0 | 17804.0 | 9598 (95.98%) |
| 5000 | 4 | 10000 | 153.0 | 5340.1 | 30006.0 | 30020.0 | 8546 (85.46%) |
| 5000 | 5 | 10000 | 208.3 | 874.3 | 199.0 | 30272.0 | 9800 (98.00%) |

## Resultados por nivel (promedio de 5 replicas)

| Nivel | Replicas | Muestras | Errores | % error | TPS prom. | Lat. media (ms) | p95 prom. (ms) | p99 prom. (ms) | Variacion |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 50 | 5 | 500 | 0 | 0.00% | 10.3 | 14.3 | 28.6 | 58.0 | ±11.3% |
| 500 | 5 | 5000 | 0 | 0.00% | 98.1 | 288.5 | 527.8 | 608.2 | ±93.5% |
| 5000 | 5 | 50000 | 46982 | 93.96% | 235.0 | 2549.7 | 12087.8 | 27414.4 | ±779.4% |

## Latencia por sampler (por nivel, promedio de sus 5 réplicas)

| Nivel | Sampler | Muestras | Media (ms) | p95 (ms) | Max (ms) |
|---:|---|---:|---:|---:|---:|
| 50 | 2 - HTTP Request Pagina Principal | 250 | 14.4 | 26.0 | 66.0 |
| 50 | 3 - Segunda Peticion: Registro de usuario | 250 | 14.2 | 28.4 | 49.0 |
| 500 | 2 - HTTP Request Pagina Principal | 2500 | 244.8 | 453.0 | 676.0 |
| 500 | 3 - Segunda Peticion: Registro de usuario | 2500 | 332.3 | 553.6 | 798.0 |
| 5000 | 2 - HTTP Request Pagina Principal | 25000 | 2592.0 | 12107.0 | 30272.0 |
| 5000 | 3 - Segunda Peticion: Registro de usuario | 25000 | 2507.4 | 12036.6 | 30034.0 |

## Codigos de respuesta por nivel

| Nivel | 200 | 500 | Non HTTP response code: java.net.SocketException | Non HTTP response code: java.net.SocketTimeoutException | Non HTTP response code: org.apache.http.NoHttpResponseException | Non HTTP response code: org.apache.http.conn.HttpHostConnectException |
|---:---|:---|:---|:---|:---|:---|
| 50 | 500 | 0 | 0 | 0 | 0 | 0 |
| 500 | 5000 | 0 | 0 | 0 | 0 | 0 |
| 5000 | 3018 | 327 | 97 | 2467 | 104 | 43987 |

## Tipos de error (mensajes del servidor)


**Nivel 5000:**
- `Non HTTP response message: Connect to 127.0.0.1:8787 [/127.0.0.1] failed: Connection refused: getsockopt` → 43987
- `Non HTTP response message: Read timed out` → 2467
- `Internal Server Error` → 327
- `Non HTTP response message: 127.0.0.1:8787 failed to respond` → 104
- `Non HTTP response message: Connection reset` → 97