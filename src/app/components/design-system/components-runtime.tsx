import { useState } from "react";
import { Bell, CheckCircle2, Settings2 } from "lucide-react";
import {
  BottomSheet,
  Carousel,
  ConfirmDialog,
  CtaButton,
  FilterChip,
  Heading,
  IconButton,
  ModalSheet,
  SegmentedControl,
  Select,
  Snackbar,
  Spinner,
  Stepper,
  Surface,
} from "../ds/index";
import { AnatomyRow, SectionHeader, SubSectionLabel } from "./shared";
import type { SectionEntry } from "./shared";
import { showcaseMessage } from "../../i18n/showcase-messages";

/**
 * Production-component contract gallery.
 *
 * Historical showcase sections contain visual anatomy demos. This section
 * deliberately renders the actual T4 exports that those demos used to mimic,
 * proving their public API, keyboard behaviour and token consumption in one
 * compact integration surface.
 */
function RuntimeComponentContractSpec() {
  const [filter, setFilter] = useState("all");
  const [quantity, setQuantity] = useState(2);
  const [bottomOpen, setBottomOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [flour, setFlour] = useState("00");
  const [oven, setOven] = useState("home");

  return (
    <div className="flex flex-col gap-8">
      <SectionHeader
        title={showcaseMessage("components.design-system.components-runtime.componenti-runtime-t4-25636825")}
        description={showcaseMessage("components.design-system.components-runtime.contratto-verificabile-dei-componenti-di-p-3ea25de5")}
      />

      <section className="surface-card p-5 flex flex-col gap-5" aria-label={showcaseMessage("components.design-system.components-runtime.tipografia-azioni-e-stato-7ee0a1f7")}>
        <Heading level="sm">{showcaseMessage("components.design-system.components-runtime.tipografia-azioni-e-stato-7ee0a1f7")}</Heading>
        <div className="flex flex-wrap items-center gap-3">
          <FilterChip active={filter === "all"} onClick={() => setFilter("all")} count={12}>
            {showcaseMessage("components.design-system.components-runtime.tutte-f1ef1748")}</FilterChip>
          <FilterChip active={filter === "saved"} onClick={() => setFilter("saved")} count={4}>
            {showcaseMessage("components.design-system.components-runtime.salvate-d3d7f785")}</FilterChip>
          <IconButton aria-label={showcaseMessage("components.design-system.components-runtime.impostazioni-anteprima-99fb6be8")}>
            <Settings2 size={16} />
          </IconButton>
          <Stepper
            value={quantity}
            min={1}
            max={8}
            onChange={setQuantity}
            decrementLabel={showcaseMessage("components.design-system.components-runtime.riduci-quantita-156d82db")}
            incrementLabel={showcaseMessage("components.design-system.components-runtime.aumenta-quantita-7e3b5c49")}
          />
          <Spinner size={28} />
        </div>
        <Snackbar
          message={showcaseMessage("components.design-system.components-runtime.preferenze-sincronizzate-1aecfcf0")}
          action={showcaseMessage("components.design-system.components-runtime.annulla-6c3de538")}
          onAction={() => setFilter("all")}
          variant="success"
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label={showcaseMessage("components.design-system.components-g.tipo-farina-e8f693c9")}
            value={flour}
            onValueChange={setFlour}
            options={[
              { id: "00", label: showcaseMessage("components.design-system.components-g.farina-00-06dc5ab2") },
              { id: "tipo1", label: showcaseMessage("components.design-system.components-g.farina-tipo-1-6d1cd41f") },
              { id: "manitoba", label: showcaseMessage("components.design-system.components-g.manitoba-c1a38647") },
            ]}
          />
          <SegmentedControl
            value={oven}
            onValueChange={setOven}
            ariaLabel={showcaseMessage("components.design-system.components-f.tipo-forno-4f5ee654")}
            fullWidth
            options={[
              { value: "home", label: showcaseMessage("components.design-system.components-f.casalingo-dbde4388") },
              { value: "electric", label: showcaseMessage("components.design-system.components-f.elettrico-pro-0d2b1723") },
              { value: "wood", label: showcaseMessage("components.design-system.components-f.legna-643804b4") },
            ]}
          />
        </div>
      </section>

      <section className="surface-card p-5 flex flex-col gap-4" aria-label={showcaseMessage("components.design-system.components-runtime.composizione-e-carousel-3bf9f777")}>
        <Heading level="sm">{showcaseMessage("components.design-system.components-runtime.composizione-e-carousel-3bf9f777")}</Heading>
        <Carousel
          itemWidth="min(78vw, 18rem)"
          ariaLabel={showcaseMessage("components.design-system.components-runtime.composizione-e-carousel-3bf9f777")}
        >
          {["Selezione", "Configurazione", "Risultato"].map((label, index) => (
            <Surface key={label} variant="container" className="p-5 min-h-28 flex flex-col justify-between">
              <span className="type-step-num">0{index + 1}</span>
              <Heading level="xs">{label}</Heading>
            </Surface>
          ))}
        </Carousel>
      </section>

      <section className="surface-card p-5 flex flex-col gap-4" aria-label={showcaseMessage("components.design-system.components-runtime.overlay-e-focus-management-f2265657")}>
        <Heading level="sm">{showcaseMessage("components.design-system.components-runtime.overlay-e-focus-management-f2265657")}</Heading>
        <div className="flex flex-wrap gap-2">
          <CtaButton onClick={() => setBottomOpen(true)}>{showcaseMessage("components.design-system.components-runtime.bottom-sheet-46cf406b")}</CtaButton>
          <CtaButton variant="secondary" onClick={() => setModalOpen(true)}>{showcaseMessage("components.design-system.components-runtime.modal-sheet-7f973197")}</CtaButton>
          <CtaButton variant="secondary" onClick={() => setConfirmOpen(true)}>{showcaseMessage("components.design-system.components-runtime.conferma-8d25542a")}</CtaButton>
        </div>

        <div className="relative min-h-48 overflow-hidden rounded-2xl dsx-s-ff6be3e5a5">
          <BottomSheet
            inline
            open={bottomOpen}
            onClose={() => setBottomOpen(false)}
            title={showcaseMessage("components.design-system.components-runtime.dettagli-impasto-7b4ebc4e")}
          >
            <p className="type-body">{showcaseMessage("components.design-system.components-runtime.lo-sheet-usa-il-componente-t4-reale-e-si-c-04caa933")}</p>
          </BottomSheet>
          <ConfirmDialog
            position="absolute"
            open={confirmOpen}
            onDismiss={() => setConfirmOpen(false)}
            ariaLabel={showcaseMessage("components.design-system.components-runtime.conferma-salvataggio-eba86e72")}
            icon={<CheckCircle2 size={24} />}
            title={showcaseMessage("components.design-system.components-runtime.salvare-la-configurazione-29be0f91")}
            body={showcaseMessage("components.design-system.components-runtime.la-ricetta-restera-disponibile-nel-profilo-c17e5cb1")}
            actions={[
              { label: showcaseMessage("components.design-system.components-runtime.salva-c5965db5"), onClick: () => setConfirmOpen(false) },
              { label: showcaseMessage("components.design-system.components-runtime.annulla-6c3de538"), variant: "secondary", onClick: () => setConfirmOpen(false) },
            ]}
          />
          {!bottomOpen && !confirmOpen && (
            <div className="absolute inset-0 flex items-center justify-center gap-2 type-body">
              <Bell size={18} aria-hidden="true" />
              {showcaseMessage("components.design-system.components-runtime.apri-un-overlay-per-provarne-il-comportame-79b89e66")}</div>
          )}
        </div>

        <ModalSheet
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          ariaLabel={showcaseMessage("components.design-system.components-runtime.anteprima-modal-sheet-4ae7bba3")}
          size="sm"
          panelClassName="p-6"
        >
          <div className="flex flex-col gap-4">
            <Heading level="sm">{showcaseMessage("components.design-system.components-runtime.modal-sheet-responsive-0822ec86")}</Heading>
            <p className="type-body">{showcaseMessage("components.design-system.components-runtime.sheet-su-mobile-dialog-centrato-dai-breakp-3142dd86")}</p>
            <CtaButton onClick={() => setModalOpen(false)}>{showcaseMessage("components.design-system.components-runtime.chiudi-a3be8a9a")}</CtaButton>
          </div>
        </ModalSheet>
      </section>

      <SubSectionLabel label={showcaseMessage("components.design-system.components-runtime.copertura-verificabile-1dc44e51")} />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <AnatomyRow prop={showcaseMessage("components.design-system.components-runtime.t4-reali-8920ea33")} val={showcaseMessage("components.design-system.components-runtime.heading-filterchip-iconbutton-stepper-spin-e91f8f44")} />
        <AnatomyRow prop={showcaseMessage("components.design-system.components-runtime.overlay-reali-398a7315")} val={showcaseMessage("components.design-system.components-runtime.bottomsheet-modalsheet-confirmdialog-eaaf098c")} />
        <AnatomyRow prop={showcaseMessage("components.design-system.components-runtime.tastiera-d99ab9ca")} val={showcaseMessage("components.design-system.components-runtime.escape-focus-visibile-controlli-con-naming-e46cd828")} />
        <AnatomyRow prop={showcaseMessage("components.design-system.components-runtime.motion-e040db2b")} val={showcaseMessage("components.design-system.components-runtime.motionconfig-reducedmotion-user-preset-t4-f4e94943")} />
      </div>
    </div>
  );
}

export const ENTRIES: SectionEntry[] = [
  {
    id: "runtime-contract",
    label: showcaseMessage("components.design-system.components-runtime.componenti-runtime-t4-25636825"),
    group: "c",
    Component: RuntimeComponentContractSpec,
  },
];
