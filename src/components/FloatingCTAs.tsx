import { Phone } from "lucide-react";
import { SITE } from "@/lib/site";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";

export function FloatingCTAs() {
  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-3">
      <a
        href={SITE.whatsappHref}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp"
        className="group inline-flex items-center justify-center h-14 w-14 rounded-full bg-[#25D366] text-white shadow-elegant hover:scale-110 transition-transform animate-float"
      >
        <WhatsAppIcon className="h-7 w-7" />
      </a>
      <a
        href={SITE.phoneHref}
        aria-label={`Call ${SITE.phone}`}
        className="inline-flex items-center justify-center h-14 w-14 rounded-full gradient-brand text-white shadow-elegant hover:scale-110 transition-transform"
      >
        <Phone className="h-5 w-5" />
      </a>
    </div>
  );
}
