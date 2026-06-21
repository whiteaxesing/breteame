import { Resend } from "resend";

/**
 * Cliente de Resend para correos transaccionales que mandamos directo desde
 * la app (distinto del SMTP de Supabase, que solo cubre los correos de auth
 * como confirmación de registro).
 */
export const resend = new Resend(process.env.RESEND_API_KEY);

export const RESEND_FROM = "Breteame <noreply@breteame.com>";
