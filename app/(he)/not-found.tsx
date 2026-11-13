import { NotFoundRoute, notFoundMetadata } from "@/components/locale-routes";

export const metadata = notFoundMetadata("he");

export default function NotFound() {
  return <NotFoundRoute locale="he" />;
}
