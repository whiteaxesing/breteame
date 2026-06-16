## Auth / Registro
- [ ] Agregar Login con Google
- [ ] Formulario de Registro para clientes
- [ ] Mandar correo de confirmación de registro
- [ ] Magic Links para darle acceso a los profesionales con cuentas que yo haya creado
- [ ] Profesionista: Poder cambiar el correo electrónico

## Home / Búsqueda
- [ ] Que se vea bien en el celular de verdad (la mayoría va a buscar desde el cel)
- [x] Filtro "Emergencia 24/7" / "Disponible ahora" (fontanero o cerrajero a medianoche = el caso estrella)
- [x] Geolocalizac2ión / "cerca de mí" y filtro por cantón más fino
- [x] Más datos de prueba para que el demo se vea poblado, no 5 tarjetas
- [x] Opcion de modo oscuro.

## Perfil del Profesional (anuncio público)
- [ ] El perfil no sirve para absolutamente nada — darle funcionalidad real
- [ ] Reseñas y estrellas reales: el cliente califica al profesional después de contactarlo (alimenta el rating que ya se muestra)
- [ ] Explicar el sello "Verificado": una sección "qué revisamos" (cédula, referencias), aunque sea simulado
- [ ] Subir fotos reales (foto de perfil + trabajos recientes) con Supabase Storage, no depender del seed

## Cuenta del Profesional (dashboard)
- [ ] El lenguaje tiene que ser humano — nada de "Lead", los profesionistas deben entender todo de la manera más clara y sencilla posible, pensemos que son señores mayores
- [ ] Profesionista: Editar mi anuncio, mi información personal
- [ ] Poder cambiar el nombre de la empresa, el logo, la descripción, imágenes, trabajos recientes
- [ ] Métricas: "tu anuncio se vio X veces, te contactaron Y este mes" (esto justifica pagar Premium)
- [ ] Checkout Premium simulado: un modal de pago "aquí iría Stripe", no solo el toggle
- [ ] Avisarle al profesional cuando lo contactan (WhatsApp o correo), para que no tenga que entrar al panel a revisar

## Cuenta del Cliente
- [ ] Cuenta Cliente no sirve para nada — darle funcionalidad real
- [ ] Historial de servicios / profesionales contactados
- [ ] Profesionales guardados
- [ ] Mis reseñas
- [ ] Información personal (editar nombre, foto)

## Admin
- [ ] Admin Panel no hace absolutamente nada — funcionalidad real
- [ ] Formulario público "Quiero aparecer como profesional" → cae en el admin para aprobar
- [ ] Métricas globales de la plataforma (usuarios, contactos, ferreterías) para el pitch

## Ferreterías / QR
- [ ] QRs de ferreterías
- [ ] Landing por ferretería al escanear el QR, que registre de dónde vino el cliente (atribución, no solo el contador)

## Infraestructura / Pulido
- [ ] Estados de carga y manejo de errores en todas las pantallas
- [ ] PWA: "Agregar a la pantalla de inicio" como si fuera una app
