// Az API-k és a diszpécser rendszer magyar nyelvű szövegeket adnak vissza (hibaüzenetek,
// audit napló bejegyzések). Ez a modul ezeket fordítja angolra a megjelenítés előtt.
// Magyar nyelvnél a szöveg változatlanul kerül vissza, ismeretlen szövegnél is.

const EXACT: Record<string, string> = {
  // Általános / munkamenet
  "Nincs aktív munkamenet.": "There is no active session.",
  "Hiba a munkamenet ellenőrzésekor.": "Error while checking the session.",
  "Ismeretlen hiba történt.": "An unknown error occurred.",
  "Hiba": "Error",
  "Szerverhiba történt.": "A server error occurred.",
  "Hiányzó partner kulcs.": "Missing partner key.",
  "Nincs jogosultság.": "You do not have permission.",
  "Ehhez a művelethez admin NI jogosultság szükséges.": "This action requires NI admin permission.",
  "A link nem található, vagy már inaktív.": "The link was not found or is already inactive.",
  "A tárgy és a leírás megadása kötelező.": "The subject and description are required.",
  "Nem sikerült elküldeni a hibabejelentést.": "Failed to send the bug report.",
  "Hiba történt a küldés során.": "An error occurred while sending.",

  // Foglalás
  "A foglalás nem található.": "The booking was not found.",
  "Nincs jogosultság a foglalás megtekintéséhez.": "You do not have permission to view this booking.",
  "Nincs jogosultság a foglalás módosításához.": "You do not have permission to modify this booking.",
  "Státusz csak 'cancelled' értékre módosítható.": "The status can only be changed to 'cancelled'.",
  "A foglalás módosítása sikertelen.": "Failed to modify the booking.",
  "A foglalás létrehozása sikertelen": "Failed to create the booking.",
  "A követési link érvénytelen.": "The tracking link is invalid.",
  "Az utazás már lezárult, módosítás nem lehetséges.": "The trip has already been completed, so it can no longer be modified.",
  "A foglalás jelenlegi állapotában már nem módosítható. Kérjük, vegye fel a kapcsolatot diszpécserünkkel.":
    "The booking can no longer be modified in its current state. Please contact our dispatcher.",
  "Érvénytelen vagy inaktív foglalási link.": "Invalid or inactive booking link.",
  "A céges foglalási link létrehozása sikertelen.": "Failed to create the company booking link.",

  // Validáció
  "Az utas e-mail címe kötelező": "The passenger's email address is required",
  "Az utas neve kötelező": "The passenger's name is required",
  "Az utas telefonszáma kötelező": "The passenger's phone number is required",
  "A kiindulási cím kötelező": "The pick-up address is required",
  "A célállomás címe kötelező": "The destination address is required",
  "Reptéri transzfernél a járatszám megadása kötelező": "The flight number is required for airport transfers",
  "Az átvétel dátuma kötelező": "The pick-up date is required",
  "Az átvétel időpontja kötelező": "The pick-up time is required",
  "Legalább 1 utas szükséges": "At least 1 passenger is required",
  "A csomagok száma nem lehet negatív": "The number of luggage items cannot be negative",
  "Érvénytelen átvétel időpont": "Invalid pick-up time",

  // Bejelentkezés / jelszó / 2FA
  "Hibás hitelesítő adatok.": "Invalid credentials.",
  "Hibás email vagy jelszó.": "Incorrect email or password.",
  "Sikertelen bejelentkezés.": "Login failed.",
  "Hiányzó hitelesítő adatok.": "Missing credentials.",
  "Ez a fiók igényel kétfaktoros hitelesítést, amely még nincs aktiválva. Kérjük először állítsd be a 2FA-t a meghívó e-mailben kapott linken.":
    "This account requires two-factor authentication, which has not been activated yet. Please set up 2FA first using the link in your invitation email.",
  "Ehhez a fiókhoz előbb be kell állítani a jelszót a meghívó linken keresztül.":
    "You must first set a password for this account using the invitation link.",
  "Hiányzó token.": "Missing token.",
  "Ez az egyedi belépési link lejárt. Kérj új meghívót a Pannon Transfer Ügyvezetőtől.":
    "This unique login link has expired. Please request a new invitation from the Pannon Transfer Managing Director.",
  "Érvénytelen vagy nem létező belépési link.": "Invalid or non-existent login link.",
  "Ez a fiók még nincs aktiválva — használd a jelszóbeállítási linket.":
    "This account has not been activated yet — please use the password setup link.",
  "A fiókodhoz kétfaktoros hitelesítés be van kérve, de még nincs aktiválva. Kérj új meghívót és vedd fel újra a 2FA beállítását.":
    "Two-factor authentication is required for your account but has not been activated yet. Please request a new invitation and set up 2FA again.",
  "A link lejárt, de a fiókod már aktív. Lépj be a NI Portálon keresztül.":
    "The link has expired, but your account is already active. Please sign in through the NI Portal.",
  "Hiányzó token vagy jelszó.": "Missing token or password.",
  "Jelszó beállítás sikertelen.": "Failed to set the password.",
  "Hiányzó meghívó token.": "Missing invitation token.",
  "Érvénytelen vagy lejárt meghívó link.": "Invalid or expired invitation link.",
  "Érvénytelen vagy lejárt link.": "Invalid or expired link.",
  "A jelszó már be van állítva ehhez a fiókhoz.": "A password has already been set for this account.",
  "A jelszónak minimum 8 karakter hosszúnak kell lennie.": "The password must be at least 8 characters long.",
  "Jelszó módosítás sikertelen.": "Failed to change the password.",
  "Jelszó beállítva! Most állítsd be a kétfaktoros hitelesítést — az egyedi belépési linket emailben kapsz majd.":
    "Password set! Now set up two-factor authentication — you will receive your unique login link by email.",
  "Jelszó sikeresen beállítva. Hamarosan kapsz egy emailt az egyedi belépési linkkel.":
    "Password set successfully. You will shortly receive an email with your unique login link.",
  "Hiányzó token vagy kód.": "Missing token or code.",
  "Nincs ilyen aktivált felhasználó a megadott linkhez.": "There is no activated user for the given link.",
  "A kétfaktoros hitelesítés még nem lett inicializálva a fiókodhoz.":
    "Two-factor authentication has not been initialised for your account yet.",
  "Az Authenticator kód 6 számjegyből áll.": "The Authenticator code consists of 6 digits.",
  "A kód helytelen. Próbáld újra 30 mp múlva, vagy használd az egyik mentett backup kódot.":
    "The code is incorrect. Try again in 30 seconds, or use one of your saved backup codes.",
  "Backup kód elfogadva! A kétfaktoros hitelesítés aktiválva — emailben küldjük az egyedi belépési linket.":
    "Backup code accepted! Two-factor authentication is activated — we will send your unique login link by email.",
  "Kétfaktoros hitelesítés aktiválva! Hamarosan kapsz egy emailt az egyedi belépési linkkel.":
    "Two-factor authentication activated! You will shortly receive an email with your unique login link.",
  "Hiányzó hitelesítési kihívás token.": "Missing authentication challenge token.",
  "Érvénytelen vagy lejárt kihívás. Kezd újra a bejelentkezést.":
    "Invalid or expired challenge. Please start the login again.",
  "Kérjük, adj meg egy érvényes biztonsági mentett kódot.": "Please enter a valid backup code.",
  "Kérjük, adj meg az Authenticator által generált 6 számjegyű kódot.":
    "Please enter the 6-digit code generated by your Authenticator.",
  "A felhasználó nem található.": "User not found.",
  "Ehhez a fiókhoz nincs kétfaktoros hitelesítés bekapcsolva.":
    "Two-factor authentication is not enabled for this account.",
  "Hibás vagy már felhasznált biztonsági kód.": "Incorrect or already used backup code.",
  "Helytelen vagy lejárt 6 számjegyű kód.": "Incorrect or expired 6-digit code.",
  "A belépési link érvénytelen vagy lejárt.": "The login link is invalid or has expired.",
  "A fiók még nincs aktiválva.": "The account has not been activated yet.",
  "A kétfaktoros kód helytelen. Próbáld újra 30 mp múlva, vagy használd az egyik mentett biztonsági kódot.":
    "The two-factor code is incorrect. Try again in 30 seconds, or use one of your saved backup codes.",

  // Audit napló (partnercegek + diszpécser rendszer)
  "Foglalás adatai módosítva": "Booking details modified",
  "Foglalás adatai módosítva a partner által": "Booking details modified by the partner",
  "Foglalás adatai módosítva az utas által a követési linken keresztül":
    "Booking details modified by the passenger via the tracking link",
  "Felhasználó törölte a foglalást": "The user cancelled the booking",
  "Utas törölte a foglalást a követési linken keresztül":
    "The passenger cancelled the booking via the tracking link",
  "A diszpécser módosította a foglalást": "The dispatcher modified the booking",
  "A diszpécser módosította a foglalást.": "The dispatcher modified the booking.",
  "Az ár jóváhagyásra vár": "The price is awaiting approval",
  "Hozzárendelés visszavonva; erőforrások szabadok lettek.":
    "Assignment revoked; the resources have been freed up.",
  "Véglegesítve és kiküldve a sofőrnek.": "Finalised and sent to the driver.",
  "Véglegesítve (utas értesítve).": "Finalised (passenger notified).",
  "Nincs rögzített esemény.": "No recorded events.",
};

const STATUS_HU_TO_EN: Record<string, string> = {
  pending: "Pending",
  modified: "Modified",
  confirmed: "Confirmed",
  "in-progress": "In progress",
  completed: "Completed",
  cancelled: "Cancelled",
};

// Diszpécser oldalon használt magyar mezőnevek (a módosítási napló "changes" listájában).
const FIELD_HU_TO_EN: Record<string, string> = {
  "Felvételi időpont": "Pick-up time",
  "Felvételi dátum": "Pick-up date",
  "Felvétel dátuma": "Pick-up date",
  "Felvételi cím": "Pick-up address",
  "Érkezési cím": "Destination address",
  "Járatszám": "Flight number",
  "Utasok száma": "Number of passengers",
  "Csomagok száma": "Number of luggage items",
  "Megjegyzés": "Comment",
  "Sofőr": "Driver",
  "Jármű": "Vehicle",
  "Foglalás állapota": "Booking status",
  "Ár": "Price",
  "Cégnév": "Company name",
  "Utas neve": "Passenger name",
  "Utas email címe": "Passenger email",
  "Utas telefonszáma": "Passenger phone",
  "Adat": "Data",
};

type Pattern = [RegExp, (...groups: string[]) => string];

const PATTERNS: Pattern[] = [
  [/^Az átvételnek legalább (\d+) órával a jövőben kell lennie$/, (h) => `The pick-up must be at least ${h} hours in the future`],
  [/^Az átvétel nem lehet több mint (\d+) nap a jövőben$/, (d) => `The pick-up cannot be more than ${d} days in the future`],
  [/^Városi transzferek csak (.+) és (.+) között engedélyezettek$/, (a, b) => `City transfers are only allowed between ${a} and ${b}`],
  [/^(Standard|Executive) transzferen maximálisan (\d+) utas utazhat$/, (t, n) => `A maximum of ${n} passengers may travel on ${t === "Executive" ? "an" : "a"} ${t} transfer`],
  [
    /^(Standard|Executive) transzferen maximálisan (\d+) csomag\/utas engedélyezett \(összesen (\d+)\)$/,
    (t, per, total) => `${t === "Executive" ? "An" : "A"} ${t} transfer allows a maximum of ${per} luggage items per passenger (${total} in total)`,
  ],
  [/^Executive transzfer: (.+) kategória lesz használva$/, (v) => `Executive transfer: the ${v} category will be used`],
  [/^Executive transzfer: VIP kategória lesz használva$/, () => "Executive transfer: the VIP category will be used"],
  [/^A foglalás érvénytelen: (.+)$/, (rest) => `The booking is invalid: ${rest}`],
  [/^Foglalás létrehozva\. Becsült ár: (.+) Ft$/, (p) => `Booking created. Estimated price: ${p} HUF`],
  [/^Státusz módosítva: (.+)$/, (s) => `Status changed: ${STATUS_HU_TO_EN[s] || s}`],
  [/^Hozzárendelve: (.+)$/, (s) => `Assigned: ${s}`],
  [/^Jóváhagyás kérve: (.+?) Ft(?: - Indok: (.+))?$/, (p, r) => `Approval requested: ${p} HUF${r ? ` - Reason: ${r}` : ""}`],
  [/^Ár (jóváhagyva|elutasítva): (.+?) Ft(?: - Megjegyzés: (.+))?$/, (d, p, c) =>
    `Price ${d === "jóváhagyva" ? "approved" : "rejected"}: ${p} HUF${c ? ` - Comment: ${c}` : ""}`],
  [/^(.+?) módosítási feltételek: (.+)$/, (name, rest) => `${name} modification terms: ${rest}`],
];

// Az "A diszpécser módosította a foglalást <mezők>" típusú összefűzött értesítési szöveg.
function translateFieldPrefixes(text: string): string {
  let out = text;
  for (const [hu, en] of Object.entries(FIELD_HU_TO_EN)) {
    out = out.split(`${hu}:`).join(`${en}:`);
  }
  return out;
}

export function translateNiFieldLabel(label: string | undefined | null, english: boolean): string {
  const value = label || "";
  if (!english) return value;
  return FIELD_HU_TO_EN[value] || value;
}

export function translateNiServerMessage(message: string | undefined | null, english: boolean): string {
  const value = message || "";
  if (!english || !value) return value;

  const exact = EXACT[value.trim()];
  if (exact) return exact;

  for (const [regex, build] of PATTERNS) {
    const match = regex.exec(value.trim());
    if (match) return build(...match.slice(1));
  }

  // Több mondatból / részből álló szöveg: mondatonként próbáljuk fordítani.
  let translated = value;
  for (const [hu, en] of Object.entries(EXACT)) {
    if (translated.includes(hu)) translated = translated.split(hu).join(en);
  }
  return translateFieldPrefixes(translated);
}

export function translateNiErrorList(errors: string[] | undefined | null, english: boolean): string[] {
  return (errors || []).map((error) => translateNiServerMessage(error, english));
}
