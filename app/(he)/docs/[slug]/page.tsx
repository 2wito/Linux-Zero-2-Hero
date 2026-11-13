import { ChapterRoute, chapterRouteMetadata, chapterStaticParams, type ChapterRouteProps } from "@/components/locale-routes";

export const generateStaticParams = chapterStaticParams;

export const generateMetadata = (props: ChapterRouteProps) => chapterRouteMetadata(props, "he");

export default function Page({ params }: ChapterRouteProps) {
  return <ChapterRoute params={params} locale="he" />;
}
