import { queryOptions } from "@tanstack/react-query";
import { listLocationsPublic } from "./locations.functions";

export const locationsQuery = () =>
  queryOptions({ queryKey: ["locations", "list"], queryFn: () => listLocationsPublic() });
