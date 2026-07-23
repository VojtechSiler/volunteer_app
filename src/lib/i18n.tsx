import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

export type Lang = 'en' | 'cs' | 'sk'

export const LANGUAGES: { code: Lang; label: string; short: string }[] = [
  { code: 'en', label: 'English', short: 'EN' },
  { code: 'cs', label: 'Čeština', short: 'CS' },
  { code: 'sk', label: 'Slovenčina', short: 'SK' },
]

const LOCALES: Record<Lang, string> = { en: 'en-GB', cs: 'cs-CZ', sk: 'sk-SK' }
const KEY = 'aiesec.lang'

type Tr = { en: string; cs: string; sk: string }

/**
 * Translations are co-located per key so every string is guaranteed to exist in
 * all three languages. Data-derived content (opportunity titles, descriptions,
 * SDG names, organisations) stays in its source language — it would come from
 * the AIESEC API. Programme brand names are kept in English across languages.
 */
const DICT: Record<string, Tr> = {
  // ---- nav / shell ----
  'nav.opportunities': { en: 'Opportunities', cs: 'Příležitosti', sk: 'Príležitosti' },
  'nav.match': { en: 'Match a person', cs: 'Spárovat osobu', sk: 'Spárovať osobu' },
  'nav.settings': { en: 'Settings', cs: 'Nastavení', sk: 'Nastavenia' },
  'brand.subtitle': { en: 'AIESEC Exchange', cs: 'AIESEC výměna', sk: 'AIESEC výmena' },
  'common.signOut': { en: 'Sign out', cs: 'Odhlásit se', sk: 'Odhlásiť sa' },
  'common.light': { en: 'Light', cs: 'Světlý', sk: 'Svetlý' },
  'common.dark': { en: 'Dark', cs: 'Tmavý', sk: 'Tmavý' },
  'common.language': { en: 'Language', cs: 'Jazyk', sk: 'Jazyk' },
  'common.close': { en: 'Close', cs: 'Zavřít', sk: 'Zavrieť' },

  // ---- auth ----
  'auth.loginTitle': { en: 'Welcome back', cs: 'Vítejte zpět', sk: 'Vitajte späť' },
  'auth.registerTitle': { en: 'Create your account', cs: 'Vytvořte si účet', sk: 'Vytvorte si účet' },
  'auth.loginSubtitle': {
    en: 'Sign in to browse and match opportunities.',
    cs: 'Přihlaste se a procházejte a párujte příležitosti.',
    sk: 'Prihláste sa a prehliadajte a párujte príležitosti.',
  },
  'auth.registerSubtitle': {
    en: 'Start matching candidates to opportunities.',
    cs: 'Začněte párovat kandidáty s příležitostmi.',
    sk: 'Začnite párovať kandidátov s príležitosťami.',
  },
  'auth.fullName': { en: 'Full name', cs: 'Celé jméno', sk: 'Celé meno' },
  'auth.email': { en: 'Email', cs: 'E-mail', sk: 'E-mail' },
  'auth.password': { en: 'Password', cs: 'Heslo', sk: 'Heslo' },
  'auth.passwordHintRegister': {
    en: 'At least 6 characters',
    cs: 'Alespoň 6 znaků',
    sk: 'Aspoň 6 znakov',
  },
  'auth.signIn': { en: 'Sign in', cs: 'Přihlásit se', sk: 'Prihlásiť sa' },
  'auth.createAccount': { en: 'Create account', cs: 'Vytvořit účet', sk: 'Vytvoriť účet' },
  'auth.haveAccount': {
    en: 'Already have an account? ',
    cs: 'Už máte účet? ',
    sk: 'Už máte účet? ',
  },
  'auth.newHere': { en: 'New to the platform? ', cs: 'Jste tu poprvé? ', sk: 'Ste tu prvýkrát? ' },
  'auth.toSignIn': { en: 'Sign in', cs: 'Přihlásit se', sk: 'Prihlásiť sa' },
  'auth.toCreate': { en: 'Create one', cs: 'Vytvořit účet', sk: 'Vytvoriť účet' },
  'auth.heroTitle': {
    en: 'Find the exchange that fits the person.',
    cs: 'Najděte výměnu, která sedí konkrétnímu člověku.',
    sk: 'Nájdite výmenu, ktorá sadne konkrétnemu človeku.',
  },
  'auth.heroSubtitle': {
    en: 'Search and filter global volunteer, talent and teaching opportunities — then match them to a candidate’s profile in seconds.',
    cs: 'Prohledávejte a filtrujte dobrovolnické, pracovní a učitelské příležitosti — a během pár vteřin je spárujte s profilem kandidáta.',
    sk: 'Prehľadávajte a filtrujte dobrovoľnícke, pracovné a učiteľské príležitosti — a za pár sekúnd ich spárujte s profilom kandidáta.',
  },
  'auth.statCountries': { en: 'countries', cs: 'zemí', sk: 'krajín' },
  'auth.statRoles': { en: 'live roles', cs: 'aktivních pozic', sk: 'aktívnych pozícií' },
  'auth.statMatchValue': { en: 'Smart', cs: 'Chytré', sk: 'Chytré' },
  'auth.statMatch': { en: 'person match', cs: 'párování osob', sk: 'párovanie osôb' },
  'auth.footer': {
    en: 'Prototype · data is mock/crawled and stored locally in your browser.',
    cs: 'Prototyp · data jsou ukázková a uložená lokálně ve vašem prohlížeči.',
    sk: 'Prototyp · dáta sú ukážkové a uložené lokálne vo vašom prehliadači.',
  },
  'auth.showPassword': { en: 'Show password', cs: 'Zobrazit heslo', sk: 'Zobraziť heslo' },
  'auth.hidePassword': { en: 'Hide password', cs: 'Skrýt heslo', sk: 'Skryť heslo' },

  // ---- auth errors ----
  'err.nameRequired': { en: 'Please enter your name.', cs: 'Zadejte prosím jméno.', sk: 'Zadajte prosím meno.' },
  'err.invalidEmail': {
    en: 'Enter a valid email address.',
    cs: 'Zadejte platnou e-mailovou adresu.',
    sk: 'Zadajte platnú e-mailovú adresu.',
  },
  'err.passwordShort': {
    en: 'Password must be at least 6 characters.',
    cs: 'Heslo musí mít alespoň 6 znaků.',
    sk: 'Heslo musí mať aspoň 6 znakov.',
  },
  'err.emailExists': {
    en: 'An account with this email already exists.',
    cs: 'Účet s tímto e-mailem již existuje.',
    sk: 'Účet s týmto e-mailom už existuje.',
  },
  'err.badCredentials': {
    en: 'Incorrect email or password.',
    cs: 'Nesprávný e-mail nebo heslo.',
    sk: 'Nesprávny e-mail alebo heslo.',
  },
  'err.notSignedIn': { en: 'Not signed in.', cs: 'Nejste přihlášeni.', sk: 'Nie ste prihlásení.' },
  'err.newPasswordShort': {
    en: 'New password must be at least 6 characters.',
    cs: 'Nové heslo musí mít alespoň 6 znaků.',
    sk: 'Nové heslo musí mať aspoň 6 znakov.',
  },
  'err.accountNotFound': { en: 'Account not found.', cs: 'Účet nenalezen.', sk: 'Účet sa nenašiel.' },
  'err.currentWrong': {
    en: 'Current password is incorrect.',
    cs: 'Současné heslo je nesprávné.',
    sk: 'Súčasné heslo je nesprávne.',
  },
  'err.generic': { en: 'Something went wrong.', cs: 'Něco se pokazilo.', sk: 'Niečo sa pokazilo.' },

  // ---- settings ----
  'settings.title': { en: 'Settings', cs: 'Nastavení', sk: 'Nastavenia' },
  'settings.subtitle': {
    en: 'Manage your account and security.',
    cs: 'Spravujte svůj účet a zabezpečení.',
    sk: 'Spravujte svoj účet a zabezpečenie.',
  },
  'settings.changePassword': { en: 'Change password', cs: 'Změnit heslo', sk: 'Zmeniť heslo' },
  'settings.changePasswordHint': {
    en: 'Use at least 6 characters.',
    cs: 'Použijte alespoň 6 znaků.',
    sk: 'Použite aspoň 6 znakov.',
  },
  'settings.currentPassword': { en: 'Current password', cs: 'Současné heslo', sk: 'Súčasné heslo' },
  'settings.newPassword': { en: 'New password', cs: 'Nové heslo', sk: 'Nové heslo' },
  'settings.confirmNewPassword': {
    en: 'Confirm new password',
    cs: 'Potvrďte nové heslo',
    sk: 'Potvrďte nové heslo',
  },
  'settings.updatePassword': { en: 'Update password', cs: 'Aktualizovat heslo', sk: 'Aktualizovať heslo' },
  'settings.passwordUpdated': {
    en: 'Password updated successfully.',
    cs: 'Heslo bylo úspěšně změněno.',
    sk: 'Heslo bolo úspešne zmenené.',
  },
  'settings.passwordsNoMatch': {
    en: 'New passwords do not match.',
    cs: 'Nová hesla se neshodují.',
    sk: 'Nové heslá sa nezhodujú.',
  },
  'settings.couldNotChange': {
    en: 'Could not change password.',
    cs: 'Heslo se nepodařilo změnit.',
    sk: 'Heslo sa nepodarilo zmeniť.',
  },
  'settings.language': { en: 'Language', cs: 'Jazyk', sk: 'Jazyk' },
  'settings.languageHint': {
    en: 'Choose the interface language.',
    cs: 'Vyberte jazyk rozhraní.',
    sk: 'Vyberte jazyk rozhrania.',
  },

  // ---- opportunities list ----
  'opps.eyebrow': { en: 'Browse exchange', cs: 'Procházet výměny', sk: 'Prehliadať výmeny' },
  'opps.title': { en: 'Opportunities', cs: 'Příležitosti', sk: 'Príležitosti' },
  'opps.countLine': {
    en: '{n} of {total} roles across the network',
    cs: '{n} z {total} pozic v celé síti',
    sk: '{n} z {total} pozícií v celej sieti',
  },
  'opps.searchPlaceholder': {
    en: 'Search titles, orgs, cities, skills…',
    cs: 'Hledat názvy, organizace, města, dovednosti…',
    sk: 'Hľadať názvy, organizácie, mestá, zručnosti…',
  },
  'opps.clearSearch': { en: 'Clear search', cs: 'Vymazat hledání', sk: 'Vymazať hľadanie' },
  'opps.filters': { en: 'Filters', cs: 'Filtry', sk: 'Filtre' },
  'opps.showResults': { en: 'Show {n} results', cs: 'Zobrazit {n} výsledků', sk: 'Zobraziť {n} výsledkov' },
  'opps.noMatchTitle': {
    en: 'No opportunities match',
    cs: 'Žádné odpovídající příležitosti',
    sk: 'Žiadne zodpovedajúce príležitosti',
  },
  'opps.noMatchHint': {
    en: 'Try removing a filter or broadening your search terms.',
    cs: 'Zkuste odebrat filtr nebo rozšířit hledaný výraz.',
    sk: 'Skúste odstrániť filter alebo rozšíriť hľadaný výraz.',
  },

  'sort.relevance': { en: 'Recommended', cs: 'Doporučené', sk: 'Odporúčané' },
  'sort.deadline': { en: 'Deadline (soonest)', cs: 'Uzávěrka (nejbližší)', sk: 'Uzávierka (najbližšia)' },
  'sort.applicantsAsc': { en: 'Least competitive', cs: 'Nejméně uchazečů', sk: 'Najmenej uchádzačov' },
  'sort.applicantsDesc': { en: 'Most popular', cs: 'Nejoblíbenější', sk: 'Najobľúbenejšie' },
  'sort.duration': { en: 'Shortest duration', cs: 'Nejkratší délka', sk: 'Najkratšia dĺžka' },

  'view.grid': { en: 'Grid view', cs: 'Dlaždice', sk: 'Dlaždice' },
  'view.list': { en: 'List view', cs: 'Seznam', sk: 'Zoznam' },
  'view.map': { en: 'Map view', cs: 'Mapa', sk: 'Mapa' },

  // ---- filters ----
  'filters.title': { en: 'Filters', cs: 'Filtry', sk: 'Filtre' },
  'filters.reset': { en: 'Reset', cs: 'Resetovat', sk: 'Resetovať' },
  'filters.programme': { en: 'Programme', cs: 'Program', sk: 'Program' },
  'filters.duration': { en: 'Duration', cs: 'Délka', sk: 'Dĺžka' },
  'filters.region': { en: 'Region', cs: 'Region', sk: 'Región' },
  'filters.benefits': { en: 'Benefits', cs: 'Výhody', sk: 'Výhody' },
  'filters.fieldOfStudy': { en: 'Field of study', cs: 'Obor studia', sk: 'Odbor štúdia' },
  'filters.languageRequired': { en: 'Language required', cs: 'Požadovaný jazyk', sk: 'Požadovaný jazyk' },
  'filters.focusSdg': { en: 'Focus (SDG)', cs: 'Zaměření (SDG)', sk: 'Zameranie (SDG)' },

  'duration.6': { en: 'Up to 6 weeks', cs: 'Do 6 týdnů', sk: 'Do 6 týždňov' },
  'duration.12': { en: 'Up to 3 months', cs: 'Do 3 měsíců', sk: 'Do 3 mesiacov' },
  'duration.24': { en: 'Up to 6 months', cs: 'Do 6 měsíců', sk: 'Do 6 mesiacov' },
  'duration.any': { en: 'Any', cs: 'Libovolná', sk: 'Ľubovoľná' },

  'benefit.paidStipend': { en: 'Paid / stipend', cs: 'Placené / stipendium', sk: 'Platené / štipendium' },
  'benefit.accommodationIncluded': {
    en: 'Accommodation included',
    cs: 'Ubytování v ceně',
    sk: 'Ubytovanie v cene',
  },
  'benefit.premiumOnly': { en: 'Premium only', cs: 'Pouze prémiové', sk: 'Iba prémiové' },

  // ---- card / detail ----
  'card.applied': { en: 'applied', cs: 'přihlášených', sk: 'prihlásených' },
  'card.applyBy': { en: 'Apply by {date}', cs: 'Přihlaste se do {date}', sk: 'Prihláste sa do {date}' },
  'card.viewDetails': { en: 'View details →', cs: 'Zobrazit detail →', sk: 'Zobraziť detail →' },

  'detail.back': { en: 'All opportunities', cs: 'Všechny příležitosti', sk: 'Všetky príležitosti' },
  'detail.globalProject': { en: 'Global project', cs: 'Globální projekt', sk: 'Globálny projekt' },
  'detail.premium': { en: 'Premium', cs: 'Prémiové', sk: 'Prémiové' },
  'detail.applicants': { en: 'applicants', cs: 'přihlášených', sk: 'prihlásených' },
  'detail.openings': { en: 'openings', cs: 'volných míst', sk: 'voľných miest' },
  'detail.about': { en: 'About this opportunity', cs: 'O této příležitosti', sk: 'O tejto príležitosti' },
  'detail.whatYoullDo': { en: 'What you’ll do', cs: 'Co budete dělat', sk: 'Čo budete robiť' },
  'detail.languages': { en: 'Languages', cs: 'Jazyky', sk: 'Jazyky' },
  'detail.preferredBackground': { en: 'Preferred background', cs: 'Preferované zázemí', sk: 'Preferované zázemie' },
  'detail.ages': { en: 'Ages {min}–{max}', cs: 'Věk {min}–{max}', sk: 'Vek {min}–{max}' },
  'detail.bgRequired': {
    en: ' · relevant background required',
    cs: ' · vyžadováno odpovídající zázemí',
    sk: ' · vyžaduje sa zodpovedajúce zázemie',
  },
  'detail.bgWelcome': {
    en: ' · all backgrounds welcome',
    cs: ' · vítáni jsou všichni',
    sk: ' · vítaní sú všetci',
  },
  'detail.whatsIncluded': { en: 'What’s included', cs: 'Co je zahrnuto', sk: 'Čo je zahrnuté' },
  'detail.whatYoullGain': { en: 'What you’ll gain', cs: 'Co získáte', sk: 'Čo získate' },
  'detail.location': { en: 'Location', cs: 'Místo', sk: 'Miesto' },
  'detail.compensation': { en: 'Compensation', cs: 'Odměna', sk: 'Odmena' },
  'detail.workSchedule': { en: 'Work schedule', cs: 'Pracovní doba', sk: 'Pracovný čas' },
  'detail.weeklyHours': { en: 'Weekly hours', cs: 'Hodin týdně', sk: 'Hodín týždenne' },
  'detail.weeklyHoursValue': { en: '{h} hrs / week', cs: '{h} h / týden', sk: '{h} h / týždeň' },
  'detail.duration': { en: 'Duration', cs: 'Délka', sk: 'Dĺžka' },
  'detail.weekly': { en: 'Weekly', cs: 'Týdně', sk: 'Týždenne' },
  'detail.closeIn': {
    en: 'Applications close in {n} days',
    cs: 'Přihlášky se uzavírají za {n} dní',
    sk: 'Prihlášky sa uzatvárajú o {n} dní',
  },
  'detail.closed': { en: 'Applications closed', cs: 'Přihlášky uzavřeny', sk: 'Prihlášky uzatvorené' },
  'detail.deadlineStarts': {
    en: 'Deadline {d} · Starts {s}',
    cs: 'Uzávěrka {d} · Začátek {s}',
    sk: 'Uzávierka {d} · Začiatok {s}',
  },
  'detail.applyOn': { en: 'Apply on aiesec.org', cs: 'Přihlásit se na aiesec.org', sk: 'Prihlásiť sa na aiesec.org' },
  'detail.matchCandidate': { en: 'Match a candidate', cs: 'Spárovat kandidáta', sk: 'Spárovať kandidáta' },
  'detail.notFound': { en: 'Opportunity not found', cs: 'Příležitost nenalezena', sk: 'Príležitosť sa nenašla' },
  'detail.notFoundHint': {
    en: 'It may have been removed.',
    cs: 'Možná byla odstraněna.',
    sk: 'Možno bola odstránená.',
  },
  'detail.backLink': {
    en: '← Back to all opportunities',
    cs: '← Zpět na všechny příležitosti',
    sk: '← Späť na všetky príležitosti',
  },

  'benefit.accommodation': { en: 'Accommodation', cs: 'Ubytování', sk: 'Ubytovanie' },
  'benefit.meals': { en: 'Meals', cs: 'Strava', sk: 'Strava' },
  'benefit.transport': { en: 'Local transport', cs: 'Místní doprava', sk: 'Miestna doprava' },
  'benefit.visa': { en: 'Visa support', cs: 'Podpora s vízy', sk: 'Podpora s vízami' },
  'benefit.pickup': { en: 'Airport pickup', cs: 'Vyzvednutí na letišti', sk: 'Vyzdvihnutie na letisku' },

  'salary.unpaid': { en: 'Unpaid / volunteer', cs: 'Neplacené / dobrovolnické', sk: 'Neplatené / dobrovoľnícke' },
  'unit.month': { en: 'month', cs: 'měsíc', sk: 'mesiac' },

  // ---- match ----
  'match.eyebrow': { en: 'Person-based search', cs: 'Hledání podle osoby', sk: 'Hľadanie podľa osoby' },
  'match.title': { en: 'Match a candidate', cs: 'Spárovat kandidáta', sk: 'Spárovať kandidáta' },
  'match.subtitlePre': {
    en: 'Enter a person’s profile and we’ll rank every opportunity by how well it fits — with a transparent breakdown of ',
    cs: 'Zadejte profil osoby a my seřadíme všechny příležitosti podle toho, jak dobře sedí — s přehledným rozborem toho, ',
    sk: 'Zadajte profil osoby a my zoradíme všetky príležitosti podľa toho, ako dobre sadnú — s prehľadným rozborom toho, ',
  },
  'match.subtitleWhy': { en: 'why', cs: 'proč', sk: 'prečo' },
  'match.subtitlePost': {
    en: ' each one matches.',
    cs: ' každá z nich odpovídá.',
    sk: ' každá z nich zodpovedá.',
  },
  'match.candidateProfile': { en: 'Candidate profile', cs: 'Profil kandidáta', sk: 'Profil kandidáta' },
  'match.sample': { en: 'Sample', cs: 'Ukázka', sk: 'Ukážka' },
  'match.sampleTitle': {
    en: 'Fill with a sample candidate',
    cs: 'Vyplnit ukázkovým kandidátem',
    sk: 'Vyplniť ukážkovým kandidátom',
  },
  'form.fullName': { en: 'Full name', cs: 'Celé jméno', sk: 'Celé meno' },
  'form.nationality': { en: 'Nationality', cs: 'Národnost', sk: 'Národnosť' },
  'form.age': { en: 'Age', cs: 'Věk', sk: 'Vek' },
  'form.languages': { en: 'Languages', cs: 'Jazyky', sk: 'Jazyky' },
  'form.add': { en: 'Add', cs: 'Přidat', sk: 'Pridať' },
  'form.removeLanguage': { en: 'Remove language', cs: 'Odebrat jazyk', sk: 'Odstrániť jazyk' },
  'form.fieldOfStudy': { en: 'Field of study', cs: 'Obor studia', sk: 'Odbor štúdia' },
  'form.degreeLevel': { en: 'Degree level', cs: 'Úroveň vzdělání', sk: 'Úroveň vzdelania' },
  'form.availableFrom': { en: 'Available from', cs: 'Dostupný od', sk: 'Dostupný od' },
  'form.preferredLength': { en: 'Preferred length', cs: 'Preferovaná délka', sk: 'Preferovaná dĺžka' },
  'form.programmePreference': { en: 'Programme preference', cs: 'Preferovaný program', sk: 'Preferovaný program' },
  'form.preferredRegions': { en: 'Preferred regions', cs: 'Preferované regiony', sk: 'Preferované regióny' },
  'form.interests': { en: 'Interests (SDG focus)', cs: 'Zájmy (zaměření SDG)', sk: 'Záujmy (zameranie SDG)' },
  'form.prefersPaid': {
    en: 'Prefers a paid opportunity',
    cs: 'Preferuje placenou příležitost',
    sk: 'Preferuje platenú príležitosť',
  },
  'form.findMatches': { en: 'Find best matches', cs: 'Najít nejlepší shody', sk: 'Nájsť najlepšie zhody' },
  'form.any': { en: 'Any', cs: 'Libovolný', sk: 'Ľubovoľný' },

  'length.6': { en: '~6 weeks', cs: '~6 týdnů', sk: '~6 týždňov' },
  'length.12': { en: '~3 months', cs: '~3 měsíce', sk: '~3 mesiace' },
  'length.24': { en: '~6 months', cs: '~6 měsíců', sk: '~6 mesiacov' },
  'length.48': { en: '~12 months', cs: '~12 měsíců', sk: '~12 mesiacov' },

  'match.topMatches': { en: 'Top matches', cs: 'Nejlepší shody', sk: 'Najlepšie zhody' },
  'match.topMatchesFor': {
    en: 'Top matches for {name}',
    cs: 'Nejlepší shody pro {name}',
    sk: 'Najlepšie zhody pre {name}',
  },
  'match.viableLine': {
    en: '{viable} viable · {ruled} ruled out by hard limits (e.g. age)',
    cs: '{viable} vhodných · {ruled} vyřazeno kvůli pevným limitům (např. věk)',
    sk: '{viable} vhodných · {ruled} vyradených kvôli pevným limitom (napr. vek)',
  },
  'match.why': { en: 'Why', cs: 'Proč', sk: 'Prečo' },
  'match.openOpportunity': { en: 'Open opportunity →', cs: 'Otevřít příležitost →', sk: 'Otvoriť príležitosť →' },
  'match.introTitle': { en: 'Describe the person', cs: 'Popište osobu', sk: 'Opíšte osobu' },
  'match.introSubtitle': {
    en: 'Fill in the profile on the left (or load a sample) and we’ll rank all {n} opportunities by fit.',
    cs: 'Vyplňte profil vlevo (nebo načtěte ukázku) a my seřadíme všech {n} příležitostí podle vhodnosti.',
    sk: 'Vyplňte profil vľavo (alebo načítajte ukážku) a my zoradíme všetkých {n} príležitostí podľa vhodnosti.',
  },
  'match.howWeighted': {
    en: 'How matching is weighted',
    cs: 'Jak je párování váženo',
    sk: 'Ako je párovanie vážené',
  },

  // saved candidates
  'match.save': { en: 'Save', cs: 'Uložit', sk: 'Uložiť' },
  'match.update': { en: 'Update', cs: 'Aktualizovat', sk: 'Aktualizovať' },
  'match.newCandidate': { en: 'New', cs: 'Nový', sk: 'Nový' },
  'match.loadSaved': { en: 'Load saved candidate…', cs: 'Načíst uloženého kandidáta…', sk: 'Načítať uloženého kandidáta…' },
  'match.savedToast': { en: 'Candidate saved', cs: 'Kandidát uložen', sk: 'Kandidát uložený' },
  'match.deleteCandidate': { en: 'Delete saved candidate', cs: 'Smazat uloženého kandidáta', sk: 'Zmazať uloženého kandidáta' },

  // CV extraction
  'cv.button': { en: 'Paste a CV to auto-fill', cs: 'Vložit CV pro vyplnění', sk: 'Vložiť CV na vyplnenie' },
  'cv.title': { en: 'Paste a CV or description', cs: 'Vložte CV nebo popis', sk: 'Vložte CV alebo popis' },
  'cv.hint': {
    en: 'We’ll pull out age, languages, field of study, availability and more.',
    cs: 'Vytáhneme věk, jazyky, obor studia, dostupnost a další.',
    sk: 'Vytiahneme vek, jazyky, odbor štúdia, dostupnosť a ďalšie.',
  },
  'cv.placeholder': {
    en: 'Paste the candidate’s CV or a short description…',
    cs: 'Vložte CV kandidáta nebo krátký popis…',
    sk: 'Vložte CV kandidáta alebo krátky popis…',
  },
  'cv.extract': { en: 'Extract details', cs: 'Vyplnit z textu', sk: 'Vyplniť z textu' },
  'cv.extracting': { en: 'Reading…', cs: 'Zpracovávám…', sk: 'Spracúvam…' },
  'cv.cancel': { en: 'Cancel', cs: 'Zrušit', sk: 'Zrušiť' },
  'cv.filled': {
    en: 'Filled {n} field(s) from the text.',
    cs: 'Vyplněno {n} polí z textu.',
    sk: 'Vyplnené {n} polí z textu.',
  },
  'cv.nothing': {
    en: 'Couldn’t detect details — please fill the form manually.',
    cs: 'Nepodařilo se nic rozpoznat — vyplňte formulář ručně.',
    sk: 'Nepodarilo sa nič rozpoznať — vyplňte formulár ručne.',
  },
  'cv.viaAi': { en: 'via OpenAI', cs: 'přes OpenAI', sk: 'cez OpenAI' },
  'cv.viaOffline': { en: 'offline parser', cs: 'offline parser', sk: 'offline parser' },

  // adjustable weights
  'weights.title': { en: 'Adjust importance', cs: 'Upravit důležitost', sk: 'Upraviť dôležitosť' },
  'weights.hint': {
    en: 'Tune what matters for this person — the ranking updates live.',
    cs: 'Nastavte, co je pro tuto osobu důležité — pořadí se aktualizuje živě.',
    sk: 'Nastavte, čo je pre túto osobu dôležité — poradie sa aktualizuje naživo.',
  },
  'weights.reset': { en: 'Reset', cs: 'Obnovit', sk: 'Obnoviť' },

  // reason labels (chips + breakdown)
  'reason.language': { en: 'Languages', cs: 'Jazyky', sk: 'Jazyky' },
  'reason.field': { en: 'Field of study', cs: 'Obor studia', sk: 'Odbor štúdia' },
  'reason.availability': { en: 'Availability', cs: 'Dostupnost', sk: 'Dostupnosť' },
  'reason.age': { en: 'Age', cs: 'Věk', sk: 'Vek' },
  'reason.duration': { en: 'Duration', cs: 'Délka', sk: 'Dĺžka' },
  'reason.interests': { en: 'Interests', cs: 'Zájmy', sk: 'Záujmy' },
  'reason.programme': { en: 'Programme', cs: 'Program', sk: 'Program' },
  'reason.region': { en: 'Region', cs: 'Region', sk: 'Región' },

  // weighting labels (intro panel)
  'weight.language': { en: 'Languages', cs: 'Jazyky', sk: 'Jazyky' },
  'weight.field': { en: 'Field of study', cs: 'Obor studia', sk: 'Odbor štúdia' },
  'weight.availability': { en: 'Availability', cs: 'Dostupnost', sk: 'Dostupnosť' },
  'weight.age': { en: 'Age eligibility', cs: 'Věková způsobilost', sk: 'Veková spôsobilosť' },
  'weight.duration': { en: 'Duration fit', cs: 'Vhodnost délky', sk: 'Vhodnosť dĺžky' },
  'weight.interests': { en: 'Interests / SDGs', cs: 'Zájmy / SDG', sk: 'Záujmy / SDG' },
  'weight.programme': { en: 'Programme', cs: 'Program', sk: 'Program' },
  'weight.region': { en: 'Region', cs: 'Region', sk: 'Región' },

  // reason details (generated by matching engine)
  'rd.lang.none': { en: 'No language requirement', cs: 'Bez jazykových požadavků', sk: 'Bez jazykových požiadaviek' },
  'rd.lang.all': {
    en: 'Speaks all required ({langs})',
    cs: 'Ovládá vše požadované ({langs})',
    sk: 'Ovláda všetko požadované ({langs})',
  },
  'rd.lang.missing': { en: 'Missing {missing}', cs: 'Chybí {missing}', sk: 'Chýba {missing}' },
  'rd.field.none': { en: 'No field provided', cs: 'Obor nezadán', sk: 'Odbor nezadaný' },
  'rd.field.preferred': {
    en: '{field} is a preferred background',
    cs: '{field} je preferované zázemí',
    sk: '{field} je preferované zázemie',
  },
  'rd.field.related': { en: 'Related field of study', cs: 'Příbuzný obor studia', sk: 'Príbuzný odbor štúdia' },
  'rd.field.different': {
    en: 'Different field — often still welcome',
    cs: 'Jiný obor — často stále vítán',
    sk: 'Iný odbor — často stále vítaný',
  },
  'rd.avail.none': { en: 'No availability set', cs: 'Dostupnost nezadána', sk: 'Dostupnosť nezadaná' },
  'rd.avail.within': {
    en: 'Available within the start window',
    cs: 'Dostupný v termínu nástupu',
    sk: 'Dostupný v termíne nástupu',
  },
  'rd.avail.close': {
    en: 'Close to the start window',
    cs: 'Blízko termínu nástupu',
    sk: 'Blízko termínu nástupu',
  },
  'rd.avail.outside': {
    en: 'Outside the usual start window',
    cs: 'Mimo obvyklý termín nástupu',
    sk: 'Mimo obvyklý termín nástupu',
  },
  'rd.age.none': { en: 'No age provided', cs: 'Věk nezadán', sk: 'Vek nezadaný' },
  'rd.age.requires': { en: 'Requires {min}–{max} yrs', cs: 'Vyžaduje {min}–{max} let', sk: 'Vyžaduje {min}–{max} r.' },
  'rd.age.within': { en: 'Within {min}–{max} yrs', cs: 'V rozmezí {min}–{max} let', sk: 'V rozmedzí {min}–{max} r.' },
  'rd.dur.any': { en: 'Any duration', cs: 'Libovolná délka', sk: 'Ľubovoľná dĺžka' },
  'rd.dur.fits': { en: 'Duration fits well', cs: 'Délka dobře sedí', sk: 'Dĺžka dobre sadne' },
  'rd.dur.mismatch': {
    en: '{duration} vs. wanted ~{want} wks',
    cs: '{duration} vs. požadováno ~{want} týd.',
    sk: '{duration} vs. požadované ~{want} týž.',
  },
  'rd.interest.none': { en: 'No interests set', cs: 'Zájmy nezadány', sk: 'Záujmy nezadané' },
  'rd.interest.shared': { en: 'Shared focus: {overlap}', cs: 'Společné zaměření: {overlap}', sk: 'Spoločné zameranie: {overlap}' },
  'rd.interest.no': { en: 'No shared SDG focus', cs: 'Žádné společné SDG', sk: 'Žiadne spoločné SDG' },
  'rd.prog.match': { en: 'Matches preference', cs: 'Odpovídá preferenci', sk: 'Zodpovedá preferencii' },
  'rd.prog.diff': { en: 'Different programme', cs: 'Jiný program', sk: 'Iný program' },
  'rd.region.pref': { en: 'Preferred region', cs: 'Preferovaný region', sk: 'Preferovaný región' },
  'rd.region.outside': {
    en: 'Outside preferred regions',
    cs: 'Mimo preferované regiony',
    sk: 'Mimo preferovaných regiónov',
  },

  // ---- enumerations ----
  'region.Asia': { en: 'Asia', cs: 'Asie', sk: 'Ázia' },
  'region.Africa': { en: 'Africa', cs: 'Afrika', sk: 'Afrika' },
  'region.Europe': { en: 'Europe', cs: 'Evropa', sk: 'Európa' },
  'region.Americas': { en: 'Americas', cs: 'Amerika', sk: 'Amerika' },

  'level.Basic': { en: 'Basic', cs: 'Základní', sk: 'Základná' },
  'level.Intermediate': { en: 'Intermediate', cs: 'Středně pokročilá', sk: 'Stredne pokročilá' },
  'level.Fluent': { en: 'Fluent', cs: 'Plynulá', sk: 'Plynulá' },
  'level.Native': { en: 'Native', cs: 'Rodilý mluvčí', sk: 'Rodený hovorca' },

  'degree.High school': { en: 'High school', cs: 'Střední škola', sk: 'Stredná škola' },
  "degree.Bachelor's": { en: "Bachelor's", cs: 'Bakalář', sk: 'Bakalár' },
  "degree.Master's": { en: "Master's", cs: 'Magistr', sk: 'Magister' },
  'degree.PhD': { en: 'PhD', cs: 'Doktorát', sk: 'Doktorát' },
  'degree.Other': { en: 'Other', cs: 'Jiné', sk: 'Iné' },
}

interface I18nValue {
  lang: Lang
  locale: string
  setLang: (l: Lang) => void
  t: (key: string, vars?: Record<string, string | number>) => string
}

const I18nContext = createContext<I18nValue | null>(null)

function detectInitial(): Lang {
  const saved = localStorage.getItem(KEY)
  if (saved === 'en' || saved === 'cs' || saved === 'sk') return saved
  const nav = navigator.language.slice(0, 2).toLowerCase()
  if (nav === 'cs') return 'cs'
  if (nav === 'sk') return 'sk'
  return 'en'
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(detectInitial)

  useEffect(() => {
    localStorage.setItem(KEY, lang)
    document.documentElement.setAttribute('lang', lang)
  }, [lang])

  const t = useCallback(
    (key: string, vars?: Record<string, string | number>) => {
      const entry = DICT[key]
      let str = entry ? entry[lang] : key
      if (vars) {
        for (const [k, v] of Object.entries(vars)) {
          str = str.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v))
        }
      }
      return str
    },
    [lang],
  )

  const value = useMemo<I18nValue>(
    () => ({ lang, locale: LOCALES[lang], setLang: setLangState, t }),
    [lang, t],
  )

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n(): I18nValue {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useI18n must be used within I18nProvider')
  return ctx
}
