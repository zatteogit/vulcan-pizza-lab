import { FilterChip } from "@figma/my-make-file";

const noop = () => {};

export function Filters() {
  return (
    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
      <FilterChip active={true} onClick={noop}>
        Tutti
      </FilterChip>
      <FilterChip active={false} onClick={noop}>
        Napoletana
      </FilterChip>
      <FilterChip active={false} onClick={noop}>
        Romana
      </FilterChip>
      <FilterChip active={false} onClick={noop}>
        Americana
      </FilterChip>
    </div>
  );
}

export function WithCount() {
  return (
    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
      <FilterChip active={true} count={28} onClick={noop}>
        Tutti
      </FilterChip>
      <FilterChip active={false} count={5} onClick={noop}>
        Napoletana
      </FilterChip>
      <FilterChip active={false} count={6} onClick={noop}>
        Romana
      </FilterChip>
    </div>
  );
}
