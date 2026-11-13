/**
 * Numbered steps. Every ### heading inside becomes a numbered step on a vertical rail (styles in globals.css):
 *
 *   <Steps>
 *   ### פותחים טרמינל
 *   ...
 *   ### מריצים את הפקודה
 *   ...
 *   </Steps>
 */
export function Steps({ children }: { children: React.ReactNode }) {
  return <div className="steps">{children}</div>;
}
