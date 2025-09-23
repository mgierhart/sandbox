# Prompt: Create a Worldbuilding Document

You are building a **worldbuilding.md** file to support a roleplay bot.  
The file defines the narrative spine, political geography, metaphysics, economy, and cultural levers of a setting.  
Each section should explain:
- **Purpose**: why this category matters in RP.
- **Content Types**: what kinds of details belong here.
- **Keys Schema**: how to encode Lorebary keys so scripts can call them.

Do not write a story here. Instead, output **categories + guidance** that a future writer can follow to generate their own version.

---

# 1) Story spine & themes

- **Logline**: One-sentence premise (protagonist + conflict + transformation).  
  *Key:* `STORY_LOGLINE`

- **External & internal arcs**: Material conflicts vs. emotional growth arcs.  
  *Keys:* `ARC_EXTERNAL`, `ARC_INTERNAL`

- **Theme pillars**: Core tensions/contradictions that recur (3–5).  
  *Keys:* `THEME_*`

- **Antagonistic pressures**: Central forces or timers that drive conflict.  
  *Keys:* `PRESSURE_*`

- **Recurring motifs**: Symbolic images that keep returning.  
  *Keys:* `MOTIF_*`

- **Lorebary hooks**: List shorthand keys that scripts/middleware can inject.  
  *Example:* `LAW_*`, `EVENT_*`, `MAGIC_*`

- **Defaults (tone & pacing)**: State assumptions (tone, pacing, frequency of war/events, etc.).

---

# 2) Political map

## 2.1 Administrative map
Define regions, duchies, or states; note ruling houses/factions.  
*Keys:* `NATION_*`, `DUCHY_*`, `HOUSE_*`, `FREE_CITY_*`

## 2.2 Succession & marriage power
Describe rules of inheritance, regency, or contracts.  
*Keys:* `SUCCESSION_*`, `LAW_MARRIAGE_CONTRACTS`, `CONSORT_*`

## 2.3 Institutions, offices, and leverage
Councils, ministries, merchant blocs, guilds.  
*Keys:* `OFFICE_*`, `COUNCIL_*`, `GUILD_*`

## 2.4 Rival houses & agendas
List factions and what they want.  
*Keys:* `HOUSE_*`, `AGENDA_*`

## 2.5 Law & custom
Define rules people invoke in play.  
*Keys:* `LAW_*`, `RITE_*`

## 2.6 Economy, supply, and chokepoints
Exports/imports, strategic locations.  
*Keys:* `SUPPLY_*`, `PLACE_*`

## 2.7 Military doctrines & readiness
Doctrine, strengths, weaknesses.  
*Keys:* `DOCTRINE_*`

## 2.8 Political calendar
List recurring events (weddings, levies, councils).  
*Keys:* `EVENT_*`

## 2.9 Faction cheat-sheet
Group houses/institutions by likely alliances.  
*Keys:* `FACTION_*`

## 2.10 RP → Lore bridge
Map triggers (`npc_*`, `env_*`, `gossip_*`) to the keys above.

---

# 3) War & demonology (or equivalent threat system)

- **Terminology**: Define shared vocabulary.  
  *Keys:* `TERM_*`

- **Stance/toggles**: Default assumptions + options (e.g., bestial vs sentient).  
  *Keys:* `THREAT_STANCE_*`

- **Cosmology & cycles**: How/when threats surge.  
  *Keys:* `THREAT_CYCLE`, `EVENT_*`

- **Taxonomy & behaviors**: Creature types or enemy forces.  
  *Keys:* `THREAT_TYPE_*`

- **Breach mechanics**: Conditions to open/close rifts.  
  *Keys:* `BREACH_*`, `RITE_*`

- **Crossing law**: Rules for how/when enemies can enter safe zones.  
  *Keys:* `LAW_*`

- **Countermeasures & kit**: Tools, doctrines, rituals.  
  *Keys:* `WARDING_*`, `MATERIAL_*`, `ORDER_*`

- **Orders & roles**: Specialized groups or guardians.  
  *Keys:* `ORDER_*`

- **Curses/wounds**: Lasting consequences.  
  *Keys:* `CURSE_*`, `POISON_*`, `AFTERMATH_*`

- **Doctrine comparisons**: How different factions fight.  
  *Keys:* `DOCTRINE_*`

- **Economy of war**: Who controls supplies.  
  *Keys:* `SUPPLY_*`

- **Timers/events**: Cyclical or catastrophic triggers.  
  *Keys:* `EVENT_*`

- **Rumor track**: Optional ambiguous element.  
  *Keys:* `RUMOR_*`, `CANON_*`

- **Sentient polity (if any)**: Hierarchy, bargains, weaknesses.  
  *Keys:* `FACTION_*`, `RIME_*` (or equivalent)

- **RP → Lore bridge**: Map common triggers to threat keys.

---

# 4) Magic Shape

- **Taxonomy**: List schools/branches.  
  *Keys:* `MAGIC_*`

- **Risk models**: Costs, dangers, taboos.  
  *Keys:* `MAGIC_RISK_*`

- **Perception in society**: How each faction views them.  
  *Keys:* `MAGIC_VIEW_*`

- **Personal anchor**: Where protagonist’s magic fits.  
  *Keys:* `MAGIC_CHAR_*`

- **Rumors/speculation**: Ambiguities or heresies.  
  *Keys:* `RUMOR_*`

- **Rites & rituals**: Named ceremonies.  
  *Keys:* `RITE_*`

- **RP → Lore bridge**: Map actions/triggers to the above.  

- **Historical context**: How magic shaped history.  
  *Keys:* `EVENT_*`, `LAW_*`

---

# 5) Faith & Religion

- **Institutions**: Clergy, temples, monastic orders.  
  *Keys:* `FAITH_*`, `OFFICE_*`, `ORDER_*`

- **Core beliefs**: Doctrine, cosmology, afterlife.  
  *Keys:* `DOCTRINE_*`, `HERESY_*`

- **Ritual life**: Festivals, funerals, rites.  
  *Keys:* `RITE_*`

- **Tensions**: Between faith vs practice.  
  *Keys:* `HERESY_*`, `CONFLICT_*`

- **Factional uses**: How groups exploit faith.  
  *Keys:* `FAITH_POLITICS_*`

- **Rumors & corruption**: Scandals, heresies.  
  *Keys:* `FAITH_SCANDAL_*`

- **Saints/pantheon**: Approved, folk, suppressed.  
  *Keys:* `SAINT_*`, `OLDGOD_*`

- **Social function**: What saints/divinities symbolize.  
  *Keys:* `SAINT_FUNC_*`

- **RP → Lore bridge**: Map faith scenes to keys.

---

# 6) Economy & Trade

- **Exports & imports**: By region.  
  *Keys:* `EXPORTS_*`, `IMPORTS_*`

- **Currency & credit**: Types of coinage, scrip, tokens.  
  *Keys:* `CURRENCY_*`, `MINT_*`

- **Trade routes & chokepoints**: Roads, passes, ports.  
  *Keys:* `TRADE_*`, `PLACE_*`

- **Guilds & monopolies**: Who controls what.  
  *Keys:* `GUILD_*`, `BLOC_*`

- **Taxes & tithes**: Levies, faith tithes.  
  *Keys:* `TAX_*`, `TITHE_*`

- **Black markets**: Contraband, smuggling.  
  *Keys:* `BLACKMARKET_*`, `ROUTE_*`

- **RP → Lore bridge**: Map trade scenes to keys.

---

# 7) Culture, Law, & Etiquette

- **Guest-right / hospitality**: Survival rules, honor codes.  
  *Keys:* `LAW_GUESTRIGHT`, `LAW_HOSPITALITY`

- **Oathfire & binding**: How oaths are sworn/punished.  
  *Keys:* `LAW_OATHFIRE`, `PACT_*`

- **Bastardy**: Cultural differences.  
  *Keys:* `LAW_BASTARDRY`

- **Marriage & contracts**: Law vs faith vs custom.  
  *Keys:* `LAW_MARRIAGE_CONTRACTS`, `RITE_MARRIAGE_*`

- **Court etiquette**: Rituals, dress codes, dances.  
  *Keys:* `ETIQUETTE_*`

- **Scandal & reputation**: Gossip mechanics.  
  *Keys:* `SCANDAL_*`, `MARKET_REPUTATION`

- **RP → Lore bridge**: Map social scenes to keys.

---

# 8) Geography & Logistics

- **Chokepoints & routes**: Passes, rivers, hubs.  
  *Keys:* `PLACE_*`, `TRADE_*`

- **Anchor locations**: Capitals, temples, keeps.  
  *Keys:* `PLACE_*`

- **Supply & siege dynamics**: Who controls food/resin/etc.  
  *Keys:* `SUPPLY_*`

- **Travel hazards & environment**: Storms, wolves, floods.  
  *Keys:* `HAZARD_*`

- **RP → Lore bridge**: Map location/hazard triggers to keys.

---

# 9) People of Consequence

- **Core factions/offices**: Regents, faith, mint, wardens.  
  *Keys:* `FACTION_*`, `OFFICE_*`, `PERSON_*`

- **Named figures**: Biographies with leverage/conflict.  
  *Keys:* `PERSON_*`

- **Wild cards**: Unpredictable NPCs.  
  *Keys:* `PERSON_*`, `CLAIM_*`, `CULT_*`

- **RP → Lore bridge**: Map NPC mentions/presence to keys.

---

# 10) Timeline Beats

- **Acts**: Sequential phases of the RP.  
- **Beats**: What events happen.  
- **Choice axes**: Where {{user}} choices shift outcomes.  
- **Lorebary tie-ins**: Which keys get hot in each act.  
- **JS sync**: How scripts align with acts (branch points, continuation beacons).

---

# 11) Master Lorebary Mapping

- **Priority & placement**: Orders 100–70 define injection tiers.  
- **Constant anchors**: Always-on concise reminders.  
- **Script → Lore bridge**: Comprehensive trigger-to-key map.  
- **Key registry**: Canonical namespaces (NATION_*, HOUSE_*, LAW_*, EVENT_*, MAGIC_*, etc.).  
- **Emission rules**: Cap per turn, cooldown, scene-first injection.  
- **Synonym hygiene**: Secondary triggers.  
- **Minimal JSON stubs**: Show example entries.  
- **JS handoff**: Explain how scripts signal triggers, Lorebary emits entries.