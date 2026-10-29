/* ═══ Certificati X.509 con WebCrypto, senza librerie ═══
 * Quanto serve per la verifica delle richieste Alexa: leggere i certificati
 * PEM (DER), le date di validità, i nomi DNS (SAN), basicConstraints, e
 * verificare la firma di un certificato con la chiave dell'emittente (RSA
 * PKCS#1 v1.5 o ECDSA, SHA-256/384/512). Gira nei Worker e in Node 20.
 * Non è un validatore X.509 generale: niente revoca, niente vincoli di nome,
 * catene di al più 5 certificati. */

export interface Certificate {
  /** DER completo. */
  der: Uint8Array;
  /** TBSCertificate con intestazione: è ciò che l'emittente firma. */
  tbs: Uint8Array;
  signatureAlgorithm: string;
  signature: Uint8Array;
  issuer: Uint8Array;
  subject: Uint8Array;
  notBefore: Date;
  notAfter: Date;
  spki: Uint8Array;
  spkiAlgorithm: string;
  spkiCurve?: string;
  dnsNames: string[];
  isCA: boolean;
}

interface Tlv {
  tag: number;
  /** Inizio dell'intestazione. */
  start: number;
  /** Inizio del contenuto. */
  contentStart: number;
  end: number;
}

export class CertificateError extends Error {}

function readTlv(der: Uint8Array, offset: number, limit = der.length): Tlv {
  if (offset + 2 > limit) throw new CertificateError("DER troncato");
  const tag = der[offset];
  let length = der[offset + 1];
  let contentStart = offset + 2;
  if (length & 0x80) {
    const bytes = length & 0x7f;
    if (bytes === 0 || bytes > 4) throw new CertificateError("lunghezza DER non supportata");
    length = 0;
    for (let i = 0; i < bytes; i++) length = length * 256 + der[contentStart + i];
    contentStart += bytes;
  }
  const end = contentStart + length;
  if (end > limit) throw new CertificateError("DER troncato");
  return { tag, start: offset, contentStart, end };
}

function children(der: Uint8Array, parent: Tlv): Tlv[] {
  const out: Tlv[] = [];
  let offset = parent.contentStart;
  while (offset < parent.end) {
    const child = readTlv(der, offset, parent.end);
    out.push(child);
    offset = child.end;
  }
  return out;
}

function oid(der: Uint8Array, tlv: Tlv): string {
  if (tlv.tag !== 0x06) throw new CertificateError("OID atteso");
  const bytes = der.subarray(tlv.contentStart, tlv.end);
  const parts: number[] = [];
  let value = 0;
  for (let i = 0; i < bytes.length; i++) {
    value = value * 128 + (bytes[i] & 0x7f);
    if (!(bytes[i] & 0x80)) {
      if (!parts.length) parts.push(value < 80 ? Math.floor(value / 40) : 2, value < 80 ? value % 40 : value - 80);
      else parts.push(value);
      value = 0;
    }
  }
  return parts.join(".");
}

function time(der: Uint8Array, tlv: Tlv): Date {
  const text = String.fromCharCode(...der.subarray(tlv.contentStart, tlv.end));
  const m = tlv.tag === 0x17
    ? text.match(/^(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})Z$/)
    : tlv.tag === 0x18 ? text.match(/^(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})Z$/) : null;
  if (!m) throw new CertificateError("data del certificato non valida");
  let year = Number(m[1]);
  if (tlv.tag === 0x17) year += year < 50 ? 2000 : 1900;
  return new Date(Date.UTC(year, Number(m[2]) - 1, Number(m[3]), Number(m[4]), Number(m[5]), Number(m[6])));
}

const OID_SAN = "2.5.29.17";
const OID_BASIC_CONSTRAINTS = "2.5.29.19";

/** Un certificato DER → i campi che servono. */
export function parseCertificate(der: Uint8Array): Certificate {
  const cert = readTlv(der, 0);
  if (cert.tag !== 0x30 || cert.end !== der.length) throw new CertificateError("certificato non valido");
  const [tbsTlv, algTlv, sigTlv] = children(der, cert);
  if (!tbsTlv || !algTlv || !sigTlv || sigTlv.tag !== 0x03) throw new CertificateError("certificato non valido");
  const tbs = children(der, tbsTlv);
  let i = tbs[0]?.tag === 0xa0 ? 1 : 0; // versione esplicita
  i += 1; // numero di serie
  i += 1; // algoritmo (ripetuto)
  const issuer = tbs[i++];
  const validity = children(der, tbs[i++]);
  const subject = tbs[i++];
  const spkiTlv = tbs[i++];
  if (!issuer || !subject || !spkiTlv || validity.length !== 2) throw new CertificateError("certificato incompleto");
  const [spkiAlg] = children(der, spkiTlv);
  const spkiAlgParts = children(der, spkiAlg);
  const spkiAlgorithm = oid(der, spkiAlgParts[0]);
  const spkiCurve = spkiAlgParts[1]?.tag === 0x06 ? oid(der, spkiAlgParts[1]) : undefined;

  const dnsNames: string[] = [];
  let isCA = false;
  const extWrapper = tbs.slice(i).find((t) => t.tag === 0xa3);
  if (extWrapper) {
    const [extList] = children(der, extWrapper);
    for (const ext of children(der, extList)) {
      const parts = children(der, ext);
      const id = oid(der, parts[0]);
      const value = parts[parts.length - 1];
      if (value.tag !== 0x04) continue;
      const inner = readTlv(der, value.contentStart, value.end);
      if (id === OID_SAN) {
        for (const name of children(der, inner)) {
          if (name.tag === 0x82) dnsNames.push(String.fromCharCode(...der.subarray(name.contentStart, name.end)).toLowerCase());
        }
      } else if (id === OID_BASIC_CONSTRAINTS) {
        const first = children(der, inner)[0];
        isCA = Boolean(first && first.tag === 0x01 && der[first.contentStart] !== 0);
      }
    }
  }

  const algParts = children(der, algTlv);
  return {
    der,
    tbs: der.subarray(tbsTlv.start, tbsTlv.end),
    signatureAlgorithm: oid(der, algParts[0]),
    signature: der.subarray(sigTlv.contentStart + 1, sigTlv.end), // primo byte: bit inutilizzati
    issuer: der.subarray(issuer.start, issuer.end),
    subject: der.subarray(subject.start, subject.end),
    notBefore: time(der, validity[0]),
    notAfter: time(der, validity[1]),
    spki: der.subarray(spkiTlv.start, spkiTlv.end),
    spkiAlgorithm,
    spkiCurve,
    dnsNames,
    isCA,
  };
}

function base64ToBytes(base64: string): Uint8Array {
  const binary = atob(base64.replace(/\s+/g, ""));
  const out = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) out[i] = binary.charCodeAt(i);
  return out;
}

export function decodeBase64(base64: string): Uint8Array {
  try {
    return base64ToBytes(base64);
  } catch {
    throw new CertificateError("base64 non valido");
  }
}

/** Tutti i certificati di un file PEM, nell'ordine. */
export function parsePemChain(pem: string): Certificate[] {
  const blocks = pem.match(/-----BEGIN CERTIFICATE-----[\s\S]+?-----END CERTIFICATE-----/g) ?? [];
  return blocks.map((block) => parseCertificate(decodeBase64(block.replace(/-----(BEGIN|END) CERTIFICATE-----/g, ""))));
}

export function bytesEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
  return true;
}

const SIGNATURE_ALGORITHMS: Record<string, { kind: "rsa" | "ecdsa"; hash: string }> = {
  "1.2.840.113549.1.1.11": { kind: "rsa", hash: "SHA-256" },
  "1.2.840.113549.1.1.12": { kind: "rsa", hash: "SHA-384" },
  "1.2.840.113549.1.1.13": { kind: "rsa", hash: "SHA-512" },
  "1.2.840.10045.4.3.2": { kind: "ecdsa", hash: "SHA-256" },
  "1.2.840.10045.4.3.3": { kind: "ecdsa", hash: "SHA-384" },
  "1.2.840.10045.4.3.4": { kind: "ecdsa", hash: "SHA-512" },
};
const CURVES: Record<string, { name: string; size: number }> = {
  "1.2.840.10045.3.1.7": { name: "P-256", size: 32 },
  "1.3.132.0.34": { name: "P-384", size: 48 },
  "1.3.132.0.35": { name: "P-521", size: 66 },
};
const OID_RSA = "1.2.840.113549.1.1.1";
const OID_EC = "1.2.840.10045.2.1";

/** ECDSA in DER (SEQUENCE di r e s) → formato grezzo r‖s di WebCrypto. */
function ecdsaDerToRaw(sig: Uint8Array, size: number): Uint8Array {
  const seq = readTlv(sig, 0);
  const [r, s] = children(sig, seq);
  if (!r || !s) throw new CertificateError("firma ECDSA non valida");
  const out = new Uint8Array(size * 2);
  for (const [k, part] of [r, s].entries()) {
    let bytes = sig.subarray(part.contentStart, part.end);
    while (bytes.length > size && bytes[0] === 0) bytes = bytes.subarray(1);
    if (bytes.length > size) throw new CertificateError("firma ECDSA non valida");
    out.set(bytes, k * size + (size - bytes.length));
  }
  return out;
}

/** La chiave pubblica di un certificato per verificare firme con l'hash dato. */
export async function importPublicKey(cert: Pick<Certificate, "spki" | "spkiAlgorithm" | "spkiCurve">, hash: string): Promise<CryptoKey> {
  if (cert.spkiAlgorithm === OID_RSA) {
    return crypto.subtle.importKey("spki", cert.spki, { name: "RSASSA-PKCS1-v1_5", hash }, false, ["verify"]);
  }
  if (cert.spkiAlgorithm === OID_EC && cert.spkiCurve && CURVES[cert.spkiCurve]) {
    return crypto.subtle.importKey("spki", cert.spki, { name: "ECDSA", namedCurve: CURVES[cert.spkiCurve].name }, false, ["verify"]);
  }
  throw new CertificateError("algoritmo della chiave non supportato");
}

/** Vero se `cert` è firmato dalla chiave di `issuer`. */
export async function isSignedBy(cert: Certificate, issuer: Pick<Certificate, "spki" | "spkiAlgorithm" | "spkiCurve">): Promise<boolean> {
  const alg = SIGNATURE_ALGORITHMS[cert.signatureAlgorithm];
  if (!alg) return false;
  try {
    const key = await importPublicKey(issuer, alg.hash);
    if (alg.kind === "rsa") return await crypto.subtle.verify("RSASSA-PKCS1-v1_5", key, cert.signature, cert.tbs);
    const curve = CURVES[issuer.spkiCurve ?? ""];
    if (!curve) return false;
    return await crypto.subtle.verify({ name: "ECDSA", hash: alg.hash }, key, ecdsaDerToRaw(cert.signature, curve.size), cert.tbs);
  } catch {
    return false;
  }
}

function validAt(cert: Certificate, now: Date): boolean {
  return cert.notBefore.getTime() <= now.getTime() && now.getTime() <= cert.notAfter.getTime();
}

/**
 * La catena porta a una delle ancore fidate? chain[0] è il certificato
 * finale; gli altri sono intermedi in qualsiasi ordine. Ogni anello deve
 * essere valido adesso, gli emittenti intermedi devono essere CA.
 */
export async function chainsToTrustAnchor(chain: Certificate[], anchors: Certificate[], now: Date): Promise<boolean> {
  if (!chain.length || chain.length > 5) return false;
  let current = chain[0];
  const used = new Set<Certificate>([current]);
  for (let depth = 0; depth < chain.length + 1; depth++) {
    if (!validAt(current, now)) return false;
    if (anchors.some((a) => bytesEqual(a.der, current.der))) return true;
    for (const anchor of anchors) {
      if (bytesEqual(current.issuer, anchor.subject) && (await isSignedBy(current, anchor))) return true;
    }
    let next: Certificate | undefined;
    for (const candidate of chain) {
      if (used.has(candidate) || !candidate.isCA || !bytesEqual(candidate.subject, current.issuer)) continue;
      if (await isSignedBy(current, candidate)) { next = candidate; break; }
    }
    if (!next) return false;
    used.add(next);
    current = next;
  }
  return false;
}
