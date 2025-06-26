/**
 * Formate une date en format français lisible
 * @param date Date à formater
 * @returns Date formatée en chaîne de caractères (ex: "12 juin 2025")
 */
export function formatDate(date: Date | string | null): string {
  if (!date) return "Non spécifié";
  
  const dateObj = typeof date === "string" ? new Date(date) : date;
  
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(dateObj);
}

/**
 * Formate un numéro de téléphone pour l'affichage
 * @param phone Numéro de téléphone à formater
 * @returns Numéro formaté (ex: "06 12 34 56 78")
 */
export function formatPhoneNumber(phone: string | null): string {
  if (!phone) return "Non spécifié";
  
  // Supprime tous les caractères non numériques
  const cleaned = phone.replace(/\D/g, "");
  
  // Format français: XX XX XX XX XX
  if (cleaned.length === 10) {
    return cleaned.replace(/(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/, "$1 $2 $3 $4 $5");
  }
  
  // Si le format ne correspond pas, retourne tel quel
  return phone;
}
