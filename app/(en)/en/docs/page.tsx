import { redirect } from "next/navigation";
import { docHref } from "@/lib/i18n";
import { chapters } from "@/lib/syllabus";

export default function DocsIndex() {
  redirect(docHref("en", chapters[0].slug));
}
