import assert from "node:assert/strict";
import { findCountry, findTeam } from "./driverProfile";

// Country codes come from sign-up (country-list), stored upper-case by the API.
assert.deepEqual(findCountry("SE"), { code: "SE", name: "Sweden" });
assert.deepEqual(findCountry("GB"), { code: "GB", name: "United Kingdom" });
assert.deepEqual(findCountry("nl"), { code: "NL", name: "Netherlands" });

// Drivers who signed up before flags existed, or unknown codes, show no flag.
assert.equal(findCountry(null), null);
assert.equal(findCountry(""), null);
assert.equal(findCountry("XX"), null);
assert.equal(findCountry("ZZ"), null);

assert.equal(findTeam("ferrari")?.name, "Scuderia Ferrari HP");
assert.equal(findTeam("mclaren")?.logo, "/f1teams/mcLarenLogo.png");
assert.equal(findTeam(null), null);
assert.equal(findTeam("brawn"), null);
