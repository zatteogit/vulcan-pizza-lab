/* Solo per i test: una piccola PKI con WebCrypto. Una CA radice, un
 * intermedio e un certificato finale «echo-api.amazon.com» costruiti in DER a
 * mano, per provare la verifica Alexa senza la rete né i certificati veri. */

const enc = new TextEncoder();

function length(n: number): number[] {
  if (n < 0x80) return [n];
  const bytes: number[] = [];
  while (n > 0) { bytes.unshift(n & 0xff); n >>= 8; }
  return [0x80 | bytes.length, ...bytes];
}
function tlv(tag: number, content: Uint8Array | number[]): Uint8Array {
  const body = content instanceof Uint8Array ? content : Uint8Array.from(content);
  return Uint8Array.from([tag, ...length(body.length), ...body]);
}
function concat(...parts: Uint8Array[]): Uint8Array {
  const out = new Uint8Array(parts.reduce((n, p) => n + p.length, 0));
  let offset = 0;
  for (const p of parts) { out.set(p, offset); offset += p.length; }
  return out;
}
const seq = (...parts: Uint8Array[]) => tlv(0x30, concat(...parts));
const set = (...parts: Uint8Array[]) => tlv(0x31, concat(...parts));
const int = (n: number) => tlv(0x02, n < 0x80 ? [n] : [0, n & 0xff]);
const nul = () => Uint8Array.from([0x05, 0x00]);
const bool = (v: boolean) => tlv(0x01, [v ? 0xff : 0x00]);
const octet = (b: Uint8Array) => tlv(0x04, b);
const bits = (b: Uint8Array) => tlv(0x03, concat(Uint8Array.from([0]), b));
const explicit = (n: number, b: Uint8Array) => tlv(0xa0 + n, b);
function oid(dotted: string): Uint8Array {
  const [a, b, ...rest] = dotted.split(".").map(Number);
  const out = [a * 40 + b];
  for (const n of rest) {
    const chunk: number[] = [n & 0x7f];
    let v = n >> 7;
    while (v > 0) { chunk.unshift((v & 0x7f) | 0x80); v >>= 7; }
    out.push(...chunk);
  }
  return tlv(0x06, out);
}
function utcTime(d: Date): Uint8Array {
  const p = (n: number) => String(n).padStart(2, "0");
  const text = `${p(d.getUTCFullYear() % 100)}${p(d.getUTCMonth() + 1)}${p(d.getUTCDate())}${p(d.getUTCHours())}${p(d.getUTCMinutes())}${p(d.getUTCSeconds())}Z`;
  return tlv(0x17, enc.encode(text));
}
const name = (cn: string) => seq(set(seq(oid("2.5.4.3"), tlv(0x0c, enc.encode(cn)))));
const SHA256_RSA = () => seq(oid("1.2.840.113549.1.1.11"), nul());

export interface TestCert {
  pem: string;
  der: Uint8Array;
  keys: CryptoKeyPair;
}

const RSA = { name: "RSASSA-PKCS1-v1_5", modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: "SHA-256" } as const;

export async function newKeys(): Promise<CryptoKeyPair> {
  return crypto.subtle.generateKey(RSA, true, ["sign", "verify"]) as Promise<CryptoKeyPair>;
}

export function toPem(der: Uint8Array): string {
  let binary = "";
  for (const b of der) binary += String.fromCharCode(b);
  const b64 = btoa(binary).replace(/(.{64})/g, "$1\n");
  return `-----BEGIN CERTIFICATE-----\n${b64}\n-----END CERTIFICATE-----\n`;
}

export async function makeCert(options: {
  subject: string;
  issuer: string;
  keys: CryptoKeyPair;
  signer: CryptoKey;
  serial: number;
  notBefore: Date;
  notAfter: Date;
  ca?: boolean;
  dns?: string[];
}): Promise<TestCert> {
  const spki = new Uint8Array(await crypto.subtle.exportKey("spki", options.keys.publicKey));
  const extensions: Uint8Array[] = [];
  if (options.ca !== undefined) extensions.push(seq(oid("2.5.29.19"), bool(true), octet(seq(...(options.ca ? [bool(true)] : [])))));
  if (options.dns?.length) extensions.push(seq(oid("2.5.29.17"), octet(seq(...options.dns.map((d) => tlv(0x82, enc.encode(d)))))));
  const tbs = seq(
    explicit(0, int(2)),
    int(options.serial),
    SHA256_RSA(),
    name(options.issuer),
    seq(utcTime(options.notBefore), utcTime(options.notAfter)),
    name(options.subject),
    spki,
    ...(extensions.length ? [explicit(3, seq(...extensions))] : []),
  );
  const signature = new Uint8Array(await crypto.subtle.sign("RSASSA-PKCS1-v1_5", options.signer, tbs));
  const der = seq(tbs, SHA256_RSA(), bits(signature));
  return { pem: toPem(der), der, keys: options.keys };
}

/** Radice → intermedio → certificato finale per echo-api.amazon.com (o altro SAN). */
export async function makeChain(now: Date, leafOptions: { dns?: string[]; notAfter?: Date } = {}) {
  const day = 86_400_000;
  const from = new Date(now.getTime() - 30 * day);
  const to = new Date(now.getTime() + 365 * day);
  const rootKeys = await newKeys();
  const root = await makeCert({ subject: "Test Root CA", issuer: "Test Root CA", keys: rootKeys, signer: rootKeys.privateKey, serial: 1, notBefore: from, notAfter: to, ca: true });
  const midKeys = await newKeys();
  const mid = await makeCert({ subject: "Test Intermediate", issuer: "Test Root CA", keys: midKeys, signer: rootKeys.privateKey, serial: 2, notBefore: from, notAfter: to, ca: true });
  const leafKeys = await newKeys();
  const leaf = await makeCert({
    subject: "echo-api.amazon.com", issuer: "Test Intermediate", keys: leafKeys, signer: midKeys.privateKey, serial: 3,
    notBefore: from, notAfter: leafOptions.notAfter ?? to, ca: false, dns: leafOptions.dns ?? ["echo-api.amazon.com"],
  });
  return { root, mid, leaf, chainPem: leaf.pem + mid.pem };
}

export async function signBody(body: string, key: CryptoKey): Promise<string> {
  const sig = new Uint8Array(await crypto.subtle.sign("RSASSA-PKCS1-v1_5", key, enc.encode(body)));
  let binary = "";
  for (const b of sig) binary += String.fromCharCode(b);
  return btoa(binary);
}
