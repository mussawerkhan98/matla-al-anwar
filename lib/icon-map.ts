import {
  ThermometerSnowflake,
  Clock,
  Shield,
  Truck,
  Snowflake,
  Target,
  Heart,
  Award,
  Star,
  CheckCircle2,
  MapPin,
  Phone,
  Users,
  Package,
  type LucideIcon,
} from "lucide-react";

/**
 * String-keyed lookup so admin-editable content (stored as plain text in
 * the database) can reference a Lucide icon by name. Falls back to
 * Snowflake for unknown/blank keys so a card never renders with no icon.
 */
export const ICON_MAP: Record<string, LucideIcon> = {
  thermometer: ThermometerSnowflake,
  clock: Clock,
  shield: Shield,
  truck: Truck,
  snowflake: Snowflake,
  target: Target,
  heart: Heart,
  award: Award,
  star: Star,
  check: CheckCircle2,
  "map-pin": MapPin,
  phone: Phone,
  users: Users,
  package: Package,
};

export function getIcon(key: string | null | undefined): LucideIcon {
  if (!key) return Snowflake;
  return ICON_MAP[key.trim().toLowerCase()] ?? Snowflake;
}

export const ICON_OPTIONS = Object.keys(ICON_MAP);
