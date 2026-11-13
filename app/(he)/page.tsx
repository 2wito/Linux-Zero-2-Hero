import { HomeRoute, homeRouteMetadata } from "@/components/locale-routes";

export const metadata = homeRouteMetadata("he");

export default function Page() {
  return <HomeRoute locale="he" />;
}
