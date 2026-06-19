## Auth / Registro
- [x] Agregar Login con Google
- [x] Formulario de Registro para clientes
- [x] Mandar correo de confirmación de registro
- [x] Magic Links para darle acceso a los profesionales con cuentas que yo haya creado
- [x] Profesionista: Poder cambiar el correo electrónico

## Home / Búsqueda
- [x] Que se vea bien en el celular de verdad (la mayoría va a buscar desde el cel)
- [x] Filtro "Emergencia 24/7" / "Disponible ahora" (fontanero o cerrajero a medianoche = el caso estrella)
- [x] Geolocalizac2ión / "cerca de mí" y filtro por cantón más fino
- [x] Más datos de prueba para que el demo se vea poblado, no 5 tarjetas
- [x] Opcion de modo oscuro.

## Perfil del Profesional (anuncio público)
- [x] El perfil no sirve para absolutamente nada — darle funcionalidad real
- [x] Reseñas y estrellas reales: el cliente califica al profesional después de contactarlo (alimenta el rating que ya se muestra)
- [x] Explicar el sello "Verificado": una sección "qué revisamos" (cédula, referencias), aunque sea simulado
- [ ] Subir fotos reales (foto de perfil + trabajos recientes) con Supabase Storage, no depender del seed

## Cuenta del Profesional (dashboard)
- [ ] El lenguaje tiene que ser humano — nada de "Lead", los profesionistas deben entender todo de la manera más clara y sencilla posible, pensemos que son señores mayores
- [x] Profesionista: Editar mi anuncio, mi información personal
- [x] Poder cambiar el nombre de la empresa, el logo, la descripción, imágenes, trabajos recientes (texto/disponibilidad listo; **logo + imágenes quedan para la tarea de Supabase Storage**)
- [x] Métricas: "tu anuncio se vio X veces, te contactaron Y este mes" (esto justifica pagar Premium)
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
- [x] QRs de ferreterías — `/f/[slug]` registra el escaneo, pone cookie de atribución y redirige al home
- [x] Landing por ferretería al escanear el QR, que registre de dónde vino el cliente (atribución, no solo el contador) — `qr_events` tabla + `contacts.qr_source` + banner en home + "Copiar enlace" en admin

## Infraestructura / Pulido
- [ ] Estados de carga y manejo de errores en todas las pantallas
- [ ] PWA: "Agregar a la pantalla de inicio" como si fuera una app

## Seguridad / Post-hackathon
- [ ] Agregar Cloudflare Turnstile en `/unirse` y en el registro de `/login` para reemplazar los honeypots — protección real contra bots y scripts automatizados

## Deuda técnica / Post-hackathon
- [ ] Cambiar el sender de correos de `onboarding@resend.dev` a un dominio propio (comprar dominio → verificar en Resend → actualizar SMTP en Supabase)
- [ ] Configurar SMTP propio (Resend con dominio verificado) para subir el límite de correos — el plan free de Supabase solo permite 4 por hora, inaceptable en producción
