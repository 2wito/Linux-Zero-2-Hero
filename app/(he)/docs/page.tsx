import { redirect } from "next/navigation";
import { docHref } from "@/lib/i18n";
import { chapters } from "@/lib/syllabus";

export default function DocsIndex() {
  redirect(docHref("he", chapters[0].slug));
}
