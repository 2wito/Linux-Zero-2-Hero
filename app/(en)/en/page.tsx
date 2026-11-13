import { HomeRoute, homeRouteMetadata } from "@/components/locale-routes";

export const metadata = homeRouteMetadata("en");

export default function Page() {
  return <HomeRoute locale="en" />;
}
