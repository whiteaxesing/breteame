## Perfil del Profesional (anuncio público)
- [ ] Subir fotos reales (foto de perfil + trabajos recientes) con Supabase Storage, no depender del seed

## Cuenta del Profesional (dashboard)
- [ ] Avisarle al profesional cuando lo contactan (WhatsApp o correo), para que no tenga que entrar al panel a revisar

## Admin
- [ ] Métricas globales de la plataforma (usuarios, contactos, ferreterías) para el pitch

## Infraestructura / Pulido
- [ ] Estados de carga y manejo de errores en todas las pantallas
- [ ] PWA: "Agregar a la pantalla de inicio" como si fuera una app

## Seguridad / Post-hackathon
- [ ] Agregar Cloudflare Turnstile en `/unirse` y en el registro de `/login` para reemplazar los honeypots — protección real contra bots y scripts automatizados

## Deuda técnica / Post-hackathon
- [ ] Cambiar el sender de correos de `onboarding@resend.dev` a un dominio propio (comprar dominio → verificar en Resend → actualizar SMTP en Supabase)
- [ ] Configurar SMTP propio (Resend con dominio verificado) para subir el límite de correos — el plan free de Supabase solo permite 4 por hora, inaceptable en producción
