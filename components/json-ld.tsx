/** Structured data for search engines. Every "<" is escaped as a unicode escape so the JSON can't close the script tag. */
export function JsonLd({ data }: { data: object }) {
  const json = JSON.stringify(data).replace(/</g, "\\" + "u003c");
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}
