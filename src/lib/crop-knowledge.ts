/**
 * Comprehensive Crop Knowledge Base for Hooghly District, West Bengal.
 * Agronomic parameters, soil preferences, and rotation guidelines validated by:
 * - ICAR: Central Potato Research Institute, Directorate of Rapeseed-Mustard Research, Indian Institute of Pulses Research, etc.
 * - BCKV: Bidhan Chandra Krishi Viswavidyalaya, Kalyani/Mohanpur, West Bengal.
 * - Department of Agriculture, Government of West Bengal: Package of Practices.
 */

export interface CropProfile {
  slug: string;
  name: string;
  nameBn: string;
  botanical_name: string;
  family: string;
  popular_varieties: string[];
  suitable_seasons: string[];
  optimal_soils: string[];
  water_requirement_category: "Low" | "Medium" | "High" | "Very High";
  total_water_requirement_mm: string;
  recommended_irrigations: number;
  duration_days: string;
  optimal_temperature: string;
  soil_impact: string;
  pest_and_disease_notes: string[];
  package_of_practices: string[];
  limitations: string[];
  sources: string[];
  summary: string;
}

export const CROP_PROFILES: Record<string, CropProfile> = {
  mustard: {
    slug: "mustard",
    name: "Mustard / Rapeseed",
    nameBn: "সর্ষে",
    botanical_name: "Brassica juncea",
    family: "Brassicaceae",
    popular_varieties: ["B-9 (Binoy)", "Sarama", "Pusa Bold", "Sita"],
    suitable_seasons: ["Rabi"],
    optimal_soils: ["Alluvial", "Sandy Loam", "Loamy"],
    water_requirement_category: "Low",
    total_water_requirement_mm: "200 to 300 mm",
    recommended_irrigations: 2,
    duration_days: "90 to 105 days",
    optimal_temperature: "15.0 to 25.0 C",
    soil_impact:
      "Low nutrient depletion. Effectively utilizes residual soil phosphate and potassium applied to previous potato crops.",
    pest_and_disease_notes: [
      "Mustard aphid (Lipaphis erysimi) can spread rapidly during foggy periods in January.",
      "Alternaria blight risk occurs if relative humidity exceeds 80 percent during flowering.",
      "Install yellow sticky traps (10 traps per acre) for early aphid detection.",
    ],
    package_of_practices: [
      "Sow in lines at 30 cm row-to-row spacing and 10 cm plant-to-plant spacing.",
      "Apply light pre-sowing irrigation to ensure uniform germination in alluvial soils.",
      "First scheduled irrigation at rosette stage (25 to 30 days after sowing).",
      "Second scheduled irrigation at siliqua formation (55 to 60 days after sowing).",
    ],
    limitations: [
      "Sensitive to cloudy weather and fog during flowering, which slows bee pollination.",
      "Temperatures exceeding 32 C during grain filling reduce oil synthesis.",
      "Cannot tolerate waterlogging exceeding 24 hours.",
    ],
    sources: [
      "ICAR: Directorate of Rapeseed-Mustard Research (DRMR), Bharatpur",
      "BCKV Directorate of Research: Oilseeds Package of Practices, Kalyani",
      "Department of Agriculture, Government of West Bengal: Oilseeds Mission Guidelines",
    ],
    summary:
      "Exceptional winter crop for Hooghly alluvial tracts. Low water footprint makes it highly resilient during dry Rabi spells.",
  },

  lentil: {
    slug: "lentil",
    name: "Lentil / Masoor",
    nameBn: "মসুর ডাল",
    botanical_name: "Lens culinaris",
    family: "Fabaceae",
    popular_varieties: ["Asha (B-77)", "Moitree (WBL-77)", "Subrata (WBL-58)", "HUL-57"],
    suitable_seasons: ["Rabi"],
    optimal_soils: ["Alluvial", "Loamy", "Clay Loam"],
    water_requirement_category: "Low",
    total_water_requirement_mm: "150 to 250 mm",
    recommended_irrigations: 1,
    duration_days: "110 to 125 days",
    optimal_temperature: "14.0 to 24.0 C",
    soil_impact:
      "Biological nitrogen fixation restores 35 to 40 kg of atmospheric nitrogen per hectare, cutting chemical fertilizer needs for the subsequent crop.",
    pest_and_disease_notes: [
      "Vascular wilt (Fusarium oxysporum) in poorly drained patches.",
      "Collar rot in saturated topsoil during emergence.",
      "Pod borer (Helicoverpa armigera) during pod development.",
    ],
    package_of_practices: [
      "Treat seeds with Rhizobium leguminosarum and Trichoderma viride before sowing.",
      "Broadcast into standing Aman paddy as paira / utera crop, or drill into tilled soil.",
      "One light protective irrigation at flower bud initiation (35 to 40 days after sowing).",
      "Avoid standing water; prepare drainage furrows every 4 to 5 metres in clay fields.",
    ],
    limitations: [
      "Extremely sensitive to standing water and waterlogged soils.",
      "Cold fog during flowering can induce flower drop.",
      "Requires seed inoculation if pulses have not been grown in the plot for over 2 years.",
    ],
    sources: [
      "ICAR: Indian Institute of Pulses Research (IIPR), Kanpur",
      "BCKV Directorate of Research: Pulses Advisory Bulletin",
      "National Food Security Mission (NFSM): Pulses Development Guidelines",
    ],
    summary:
      "Premier soil-restoring pulse. Adds nitrogen naturally and requires minimal supplementary irrigation during winter.",
  },

  potato: {
    slug: "potato",
    name: "Potato",
    nameBn: "আলু",
    botanical_name: "Solanum tuberosum",
    family: "Solanaceae",
    popular_varieties: ["Kufri Jyoti", "Kufri Chandramukhi", "Kufri Pukhraj", "Kufri Pokhraj"],
    suitable_seasons: ["Rabi"],
    optimal_soils: ["Alluvial", "Sandy Loam", "Loamy"],
    water_requirement_category: "Medium",
    total_water_requirement_mm: "350 to 500 mm",
    recommended_irrigations: 4,
    duration_days: "80 to 110 days",
    optimal_temperature: "14.0 to 22.0 C",
    soil_impact:
      "Heavy nutrient feeder. Continuous cultivation depletes soil nitrogen and potassium while concentrating solanaceous pathogens.",
    pest_and_disease_notes: [
      "Late Blight (Phytophthora infestans) triggers when relative humidity exceeds 85 percent and temperatures stay between 10 and 20 C.",
      "Bacterial wilt (Ralstonia solanacearum) in waterlogged soil.",
      "Potato tuber moth (Phthorimaea operculella) during storage.",
    ],
    package_of_practices: [
      "Plant sprouted certified seed tubers at 60 cm row spacing and 20 cm tuber spacing.",
      "Apply split nitrogen doses at planting and earthing-up (25 to 30 days after planting).",
      "Four to five light irrigations: stolon formation, tuber initiation, and tuber bulking.",
      "Stop irrigation 10 days before harvest to harden tuber skin.",
    ],
    limitations: [
      "High seed tuber investment representing 40 to 50 percent of total production cost.",
      "Tuber bulking stops when night temperatures exceed 22 C.",
      "Zero tolerance to waterlogging; excess rain causes tuber rotting.",
    ],
    sources: [
      "ICAR: Central Potato Research Institute (CPRI), Shimla",
      "BCKV Directorate of Research: Hooghly Potato Production Manual",
      "Department of Agriculture, Government of West Bengal: Rabi Crop Guidelines",
    ],
    summary:
      "The dominant cash crop of Hooghly district. Produces high economic yields under assured irrigation and cool winter nights.",
  },

  maize: {
    slug: "maize",
    name: "Maize (Corn)",
    nameBn: "ভুট্টা",
    botanical_name: "Zea mays",
    family: "Poaceae",
    popular_varieties: ["HQPM-1", "Shaktiman-1", "Bio-9681", "Pioneer 30V92"],
    suitable_seasons: ["Rabi", "Kharif", "Zaid"],
    optimal_soils: ["Alluvial", "Sandy Loam", "Loamy"],
    water_requirement_category: "Medium",
    total_water_requirement_mm: "400 to 550 mm",
    recommended_irrigations: 4,
    duration_days: "115 to 130 days",
    optimal_temperature: "18.0 to 30.0 C",
    soil_impact:
      "Generates substantial organic biomass. High nutrient uptake requires balanced replenishment with organic compost.",
    pest_and_disease_notes: [
      "Fall armyworm (Spodoptera frugiperda) surveillance required at seedling and knee-high stages.",
      "Turcicum leaf blight in damp cloudy conditions.",
      "Stem borer (Chilo partellus) targeting central whorls.",
    ],
    package_of_practices: [
      "Sow in ridges and furrows at 60 cm by 20 cm spacing.",
      "Apply nitrogen in three equal splits: basal, knee-high, and tasseling stages.",
      "Four to five irrigations at critical checkpoints: knee-high, tasseling, silking, and grain filling.",
      "Ensure furrow drainage to prevent collar saturation.",
    ],
    limitations: [
      "Moisture stress during silking causes barren cobs and severe yield drops.",
      "Requires higher initial seed investment for quality hybrid varieties.",
      "Requires bird scaring during milky dough stage.",
    ],
    sources: [
      "ICAR: Indian Institute of Maize Research (IIMR), Ludhiana",
      "BCKV Department of Agronomy: Maize Promotion Scheme",
      "Department of Agriculture, Government of West Bengal",
    ],
    summary:
      "Versatile cereal providing high grain yield and cattle fodder. Serves as an effective break crop after solanaceous vegetables.",
  },

  paddy_aman: {
    slug: "paddy_aman",
    name: "Paddy (Aman / Kharif)",
    nameBn: "ধান (আমন)",
    botanical_name: "Oryza sativa",
    family: "Poaceae",
    popular_varieties: ["Swarna (MTU 7029)", "Satabdi (IET 4786)", "Pratikhya", "Pankaj"],
    suitable_seasons: ["Kharif"],
    optimal_soils: ["Clayey", "Clay Loam", "Alluvial"],
    water_requirement_category: "Very High",
    total_water_requirement_mm: "1100 to 1400 mm",
    recommended_irrigations: 3,
    duration_days: "135 to 155 days",
    optimal_temperature: "22.0 to 32.0 C",
    soil_impact:
      "Puddling creates an impervious plough pan that retains water but temporarily restricts aeration for following upland crops.",
    pest_and_disease_notes: [
      "Brown planthopper (Nilaparvata lugens) in dense tillering stands.",
      "Yellow stem borer (Scirpophaga incertulas) causing dead hearts and white heads.",
      "Bacterial leaf blight during heavy monsoon winds.",
    ],
    package_of_practices: [
      "Transplant 21 to 25 day old seedlings at 20 cm by 15 cm spacing.",
      "Maintain 3 to 5 cm shallow standing water during vegetative and panicle initiation.",
      "Drain fields completely 10 to 12 days before anticipated harvest.",
      "Incorporate green manure (dhaincha) prior to final puddling.",
    ],
    limitations: [
      "Requires monsoon rainfall accumulation or canal water for field puddling.",
      "Methane emissions from prolonged anaerobic submergence.",
      "Delayed harvest pushes subsequent Rabi potato sowing into high heat periods.",
    ],
    sources: [
      "ICAR: National Rice Research Institute (NRRI), Cuttack",
      "BCKV Directorate of Research: Rice Production Guide",
      "Department of Agriculture, Government of West Bengal: Kharif Strategy",
    ],
    summary:
      "The staple wet-season cereal across Hooghly. Relies on monsoon precipitation and clay retention capacity.",
  },

  boro_rice: {
    slug: "boro_rice",
    name: "Boro Rice (Summer Paddy)",
    nameBn: "ধান (বোরো)",
    botanical_name: "Oryza sativa",
    family: "Poaceae",
    popular_varieties: ["IET 4786 (Satabdi)", "Gotra Bidhan-1", "Lalat", "IR-36"],
    suitable_seasons: ["Boro", "Rabi"],
    optimal_soils: ["Clayey", "Alluvial", "Clay Loam"],
    water_requirement_category: "Very High",
    total_water_requirement_mm: "1200 to 1600 mm",
    recommended_irrigations: 12,
    duration_days: "120 to 140 days",
    optimal_temperature: "20.0 to 35.0 C",
    soil_impact:
      "Demands intensive groundwater extraction during dry winter and spring months, lowering local water tables.",
    pest_and_disease_notes: [
      "Stem borer incidence increases under warm spring conditions in March.",
      "Blast (Pyricularia oryzae) during cool nursery nights in January.",
      "Sheath blight in high-nitrogen plots.",
    ],
    package_of_practices: [
      "Raise seedlings under polythene covers to protect against winter cold injury.",
      "Transplant in early February with 15 cm by 15 cm spacing.",
      "Practice Alternate Wetting and Drying (AWD) to cut water consumption by 25 percent.",
      "Apply balanced NPK with zinc sulphate.",
    ],
    limitations: [
      "Very high groundwater footprint. Unsuitable for areas with declining aquifer levels.",
      "Elevated electricity and diesel pumping costs.",
      "Cold injury during seedling nursery stage in late December and early January.",
    ],
    sources: [
      "ICAR: National Rice Research Institute (NRRI), Cuttack",
      "BCKV Department of Agronomy: Boro Rice AWD Guidelines",
      "West Bengal State Water Investigation Directorate (SWID)",
    ],
    summary:
      "High yielding summer paddy grown under assured tube-well irrigation. Requires water-saving AWD practices to protect aquifers.",
  },

  jute: {
    slug: "jute",
    name: "Jute (Tossa)",
    nameBn: "পাট",
    botanical_name: "Corchorus olitorius",
    family: "Malvaceae",
    popular_varieties: ["JRO-524 (Navin)", "JRO-204 (Suren)", "JRO-8432", "IRA"],
    suitable_seasons: ["Zaid", "Kharif"],
    optimal_soils: ["Alluvial", "Loamy", "Clay Loam"],
    water_requirement_category: "High",
    total_water_requirement_mm: "500 to 700 mm",
    recommended_irrigations: 3,
    duration_days: "110 to 130 days",
    optimal_temperature: "24.0 to 35.0 C",
    soil_impact:
      "Sheds 3 to 4 tonnes of organic leaves per hectare before harvest, enriching topsoil organic matter and improving tilth.",
    pest_and_disease_notes: [
      "Yellow mite (Polyphagotarsonemus latus) causes leaf curling in dry pre-monsoon spells.",
      "Jute semilooper (Anomis sabulifera) defoliates young tops.",
      "Stem rot (Macrophomina phaseolina) during waterlogged conditions.",
    ],
    package_of_practices: [
      "Sow in March or April following light pre-monsoon showers.",
      "Maintain 25 to 30 cm row spacing with line sowing.",
      "Two hand weedings at 15 and 30 days after sowing.",
      "Harvest at 50 percent flowering stage for premium fibre tensile strength.",
    ],
    limitations: [
      "Requires abundant slow-moving clean freshwater for microbiological retting in July.",
      "Fibre extraction is labour intensive.",
      "Water deficit during initial vegetative growth causes premature flowering.",
    ],
    sources: [
      "ICAR: Central Research Institute for Jute and Allied Fibres (CRIJAF), Barrackpore",
      "BCKV Directorate of Research: Fibre Crops Advisory",
      "National Jute Board: Quality Fibre Production Protocol",
    ],
    summary:
      "Golden fibre crop of the Bengal delta. Adds abundant organic leaf biomass to soil and prepares plots for monsoon Aman paddy.",
  },

  wheat: {
    slug: "wheat",
    name: "Wheat",
    nameBn: "গম",
    botanical_name: "Triticum aestivum",
    family: "Poaceae",
    popular_varieties: ["DBW-187", "HD-2967", "PBW-343", "K-1006"],
    suitable_seasons: ["Rabi"],
    optimal_soils: ["Alluvial", "Loamy", "Clay Loam"],
    water_requirement_category: "Medium",
    total_water_requirement_mm: "300 to 450 mm",
    recommended_irrigations: 4,
    duration_days: "105 to 120 days",
    optimal_temperature: "12.0 to 22.0 C",
    soil_impact:
      "Root residue improves soil pore structure. Favorable rotation sequence with legumes or pulses.",
    pest_and_disease_notes: [
      "Spot blotch (Bipolaris sorokiniana) is the main fungal challenge in warm eastern plains.",
      "Termites in dry sandy loam patches.",
      "Aphids during late heading stage.",
    ],
    package_of_practices: [
      "Sow by November 25 to avoid terminal heat stress during grain filling in February.",
      "First critical irrigation at Crown Root Initiation (CRI) stage (20 to 25 days after sowing).",
      "Second irrigation at tillering; third at flowering; fourth at milk stage.",
      "Apply balanced NPK at 100:50:50 kg per hectare.",
    ],
    limitations: [
      "Eastern Gangetic winter is brief. Sowing delayed past December 1 reduces yield by 35 kg per hectare per day.",
      "Terminal heat spikes in late February shorten grain filling duration.",
      "Sensitive to blast disease under humid conditions.",
    ],
    sources: [
      "ICAR: Indian Institute of Wheat and Barley Research (IIWBR), Karnal",
      "BCKV Department of Agronomy: Eastern Plains Wheat Research",
      "Department of Agriculture, Government of West Bengal",
    ],
    summary:
      "Winter cereal suited to timely November sowing. Requires cold night temperatures and scheduled irrigation at crown root initiation.",
  },
};

export function getCropProfileBySlug(slug: string): CropProfile | undefined {
  const normalized = slug.toLowerCase().replace(/[-_]/g, "");
  return Object.values(CROP_PROFILES).find(
    (c) => c.slug.replace(/[-_]/g, "").toLowerCase() === normalized
  );
}

export function getAllCropSlugs(): string[] {
  return Object.keys(CROP_PROFILES);
}
