# Canasta

Prototipo local para una persona o familia en México: gasto en comida, canasta básica, hábitos sencillos y retos de ahorro. No pide cuenta.

## Cómo ejecutarlo

```bash
npm install
npm run dev
```

Abre la dirección que muestra Vite, normalmente [http://localhost:5173](http://localhost:5173). En la misma red, el teléfono puede usar la dirección que Vite imprime junto al puerto.

## Qué queda simulado

- **Ofertas** de Walmart, Bodega Aurrera, Soriana y Chedraui: catálogo local de ejemplo. No son precios vigentes y no hay enlace de compra.
- **Recordatorios**: solo se muestran dentro de la app. La interfaz vive en `src/services/reminders.ts` para poder conectar Web Push después. No se piden permisos.
- **Persistencia**: `localStorage`, clave `canasta.v1`. No hay backend ni sincronización.
- **PWA**: manifiesto y un service worker mínimo que solo se registra en producción.

Restaurar los datos de demostración borra únicamente la clave de Canasta en este navegador.
