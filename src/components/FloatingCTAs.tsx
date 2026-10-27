import { Phone } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { SITE, whatsappLink } from "@/lib/site";
import { settingsQuery, getSetting } from "@/lib/settings.query";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";

export function FloatingCTAs() {
  // Use the numbers saved in Admin → Settings (falls back to the defaults in site.ts).
  const { data: settings = {} } = useQuery(settingsQuery());
  const phone = getSetting(settings, "site_phone", SITE.phone);
  const whatsapp = getSetting(settings, "site_whatsapp", SITE.whatsapp);
  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-3">
      <a
        href={whatsappLink(whatsapp)}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp"
        className="group inline-flex items-center justify-center h-14 w-14 rounded-full bg-[#25D366] text-white shadow-elegant hover:scale-110 transition-transform animate-float"
      >
        <WhatsAppIcon className="h-7 w-7" />
      </a>
      <a
        href={`tel:${phone.replace(/[^\d+]/g, "")}`}
        aria-label={`Call ${phone}`}
        className="inline-flex items-center justify-center h-14 w-14 rounded-full gradient-brand text-white shadow-elegant hover:scale-110 transition-transform"
      >
        <Phone className="h-5 w-5" />
      </a>
    </div>
  );
}
