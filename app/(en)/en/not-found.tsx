import { NotFoundRoute, notFoundMetadata } from "@/components/locale-routes";

export const metadata = notFoundMetadata("en");

export default function NotFound() {
  return <NotFoundRoute locale="en" />;
}
