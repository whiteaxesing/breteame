// Tipos de dominio de Breteame. Reflejan el esquema de la base (0001_init.sql).

export type Role = "cliente" | "profesional" | "admin";
export type CategorySlug =
  | "fontaneria"
  | "electricidad"
  | "cerrajeria"
  | "jardineria"
  | "escombreros"
  | "pintura"
  | "aires"
  | "carpinteria"
  | "ebanisteria"
  | "limpieza"
  | "piscinas"
  | "hojalateria"
  | "maestro_obra"
  | "tanques_septicos"
  | "transporte_material"
  | "mudanzas"
  | "hidrolavado";
export type ContactChannel = "whatsapp" | "llamada" | "copiar";
export type ContactStatus = "nuevo" | "contactado" | "cerrado";

export type Profile = {
  id: string;
  role: Role;
  full_name: string | null;
  created_at: string;
};

// Forma pública (vista professionals_public): SIN phone.
export type ProfessionalPublic = {
  id: string;
  user_id: string | null;
  name: string;
  category: CategorySlug;
  location: string;
  description: string | null;
  is_verified: boolean;
  is_premium: boolean;
  rating: number;
  image_url: string | null;
  portfolio_urls: string[];
  created_at: string;
  is_test: boolean;
  is_emergency: boolean;
  is_available_now: boolean;
  emite_factura: boolean;
  extra_categories: CategorySlug[];
  lat: number | null;
  lng: number | null;
};

export type FotoEstado = "pendiente" | "aprobada" | "rechazada";
export type FotoTipo = "perfil" | "portafolio";
export type ProfessionalPhoto = {
  id: string;
  professional_id: string;
  url: string;
  storage_path: string;
  tipo: FotoTipo;
  estado: FotoEstado;
  motivo: string | null;
  created_at: string;
};

// Resultado de profesionales_cerca(): incluye distancia calculada por PostGIS.
export type ProfessionalResult = ProfessionalPublic & { distancia_km?: number };

// Vista professionals_with_contact: incluye phone (solo autenticados).
export type ProfessionalWithContact = ProfessionalPublic & {
  phone: string | null;
};

export type Contact = {
  id: string;
  professional_id: string;
  client_id: string;
  client_name: string | null;
  channel: ContactChannel;
  status: ContactStatus;
  created_at: string;
};

export type Review = {
  id: string;
  professional_id: string;
  client_id: string | null;
  reviewer_name: string;
  rating: number;
  comment: string | null;
  created_at: string;
};

export type SavedProfessional = {
  client_id: string;
  professional_id: string;
  created_at: string;
};

export type ProfileView = {
  id: string;
  professional_id: string;
  viewer_id: string | null;
  created_at: string;
};

export type Store = {
  id: string;
  name: string;
  address: string | null;
  is_partner: boolean;
  qr_scans: number;
  slug: string | null;
  created_at: string;
};
