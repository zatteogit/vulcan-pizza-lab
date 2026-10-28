/* Elenco delle edizioni dedicate da pubblicare in test, per la matrice della CI.
 * Stampa un array JSON di id (la generalista esclusa: ha il suo job). */
import { listEditions } from "./edition-path.mjs";

const { public: pub, private: priv } = listEditions();
const both = pub.filter((id) => priv.includes(id));
if (both.length) {
  console.error(`Edizioni presenti sia pubbliche sia private: ${both.join(", ")}`);
  process.exit(1);
}
console.log(JSON.stringify([...pub, ...priv].filter((id) => id !== "vulcan")));
