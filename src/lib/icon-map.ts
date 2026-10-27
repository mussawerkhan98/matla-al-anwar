import {
  Paintbrush,
  PaintRoller,
  PaintBucket,
  Palette,
  Sofa,
  Sparkles,
  SprayCan,
  Droplets,
  Home,
  Building2,
  BedDouble,
  Clock,
  Shield,
  Truck,
  Target,
  Heart,
  Award,
  Star,
  CheckCircle2,
  MapPin,
  Phone,
  Users,
  Package,
  Wrench,
  Leaf,
  type LucideIcon,
} from "lucide-react";

/**
 * String-keyed lookup so admin-editable content (stored as plain text in
 * the database) can reference a Lucide icon by name. Falls back to
 * Sparkles for unknown/blank keys so a card never renders with no icon.
 */
export const ICON_MAP: Record<string, LucideIcon> = {
  paintbrush: Paintbrush,
  roller: PaintRoller,
  "paint-bucket": PaintBucket,
  palette: Palette,
  sofa: Sofa,
  sparkles: Sparkles,
  spray: SprayCan,
  droplets: Droplets,
  home: Home,
  building: Building2,
  bed: BedDouble,
  clock: Clock,
  shield: Shield,
  truck: Truck,
  target: Target,
  heart: Heart,
  award: Award,
  star: Star,
  check: CheckCircle2,
  "map-pin": MapPin,
  phone: Phone,
  users: Users,
  package: Package,
  wrench: Wrench,
  leaf: Leaf,
};

export function getIcon(key: string | null | undefined): LucideIcon {
  if (!key) return Sparkles;
  return ICON_MAP[key.trim().toLowerCase()] ?? Sparkles;
}

export const ICON_OPTIONS = Object.keys(ICON_MAP);
