import { useCms } from "../features/cms/cms-context";
import { NotFoundState } from "../components/shared/not-found-state";

/* FW-09 (S01-A-07, S01-B-06): stesso stato dello stile inesistente, con la ricerca. */
export function NotFoundPage() {
  const { cms } = useCms();
  return (
    <NotFoundState
      eyebrow="404"
      title={cms.pages.notFoundTitle}
      subtitle={cms.pages.notFoundSubtitle}
      backTo="/explore"
      backLabel={cms.pages.notFoundBack}
      searchLabel={cms.pages.notFoundSearch}
    />
  );
}
