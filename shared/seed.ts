/*
 * Seed content for SYLHET.
 * Used to populate MongoDB on first run, and served read-only by the API
 * while no database is configured. All photographs are real, freely
 * licensed images hosted on Wikimedia Commons (see /credits on the site).
 * Prices are estimates in Bangladeshi Taka (BDT) and change by season.
 */
import type { Category, Destination, Experience, Food, Gem, Photo, Place, Post, Slide, Theme } from './types.js';

const p = (path: string, w: number, alt: string): Photo => ({ path, w, alt });

export const THEMES: Record<string, Theme> = {
  jaflong: { deep: '#18232b', mist: '#e4eaee', accent: '#8fb6cf', stone: '#8b9298', glow: '#f3f6f8' },
  ratargul: { deep: '#0c241d', mist: '#dfe9e1', accent: '#7cc49a', stone: '#6f6a52', glow: '#eef5ef' },
  sreemangal: { deep: '#1d2a12', mist: '#ede8d2', accent: '#d2a640', stone: '#7d8a5a', glow: '#faf6e6' },
  bisanakandi: { deep: '#122638', mist: '#e9eef1', accent: '#86c8e8', stone: '#b4aea2', glow: '#f6f8fa' },
  lalakhal: { deep: '#06363e', mist: '#d9f2f0', accent: '#3ccfc4', stone: '#6fa6b0', glow: '#effbfa' },
  madhabkunda: { deep: '#18221f', mist: '#e2ebe7', accent: '#a5d4c4', stone: '#76857e', glow: '#f1f6f4' },
  tanguar: { deep: '#11233a', mist: '#e6e9ee', accent: '#e2b06a', stone: '#7e8899', glow: '#f7f4ee' },
  hakaluki: { deep: '#25231a', mist: '#ece8da', accent: '#c7b27c', stone: '#8a8468', glow: '#f8f5ea' },
  sust: { deep: '#1b1f27', mist: '#e7e9ec', accent: '#9cc46e', stone: '#7d8490', glow: '#f4f6f1' },
};

export const CATEGORIES: Category[] = [
  { slug: 'hills-and-stone', name: 'Hills & stone rivers', description: 'Border hills, clear rivers and stone beds along the Meghalaya foothills.' },
  { slug: 'forests', name: 'Forests', description: 'Swamp forest, rainforest and the trails that run through them.' },
  { slug: 'tea-country', name: 'Tea country', description: 'Estates, tea cabins and the slow hills of Moulvibazar.' },
  { slug: 'wetlands', name: 'Haors & wetlands', description: 'Seasonal inland seas, houseboats and winter birds.' },
  { slug: 'waterfalls', name: 'Waterfalls', description: 'Falls that run hardest in the monsoon.' },
  { slug: 'city-and-campus', name: 'City & campus', description: 'Sylhet town, its shrines, bridges and the SUST hills.' },
];

const IMG = {
  jaflong: [
    p('4/4d/Jaflong_Sylhet.jpg', 4880, 'The Piyain river and stone beds at Jaflong with the Meghalaya hills behind'),
    p('6/69/Jaflong_View.jpeg', 2048, 'View across Jaflong towards the border hills'),
    p('1/1d/Tea_Garden_of_Jaflong.jpg', 4000, 'Tea garden on the slopes at Jaflong'),
    p('4/46/Jaflong,_sylhet_02.jpg', 2304, 'Boats moored on the river at Jaflong'),
    p('c/c3/When_the_sun_goes_down.jpg', 3696, 'Evening light over the river at Jaflong'),
    p('7/7d/Jaflong,_Bangladesh.jpg', 1800, 'Stone collectors in the river at Jaflong'),
  ],
  ratargul: [
    p('9/9b/Ratargul_0276.jpg', 3900, 'Aerial view of wooden boats in a channel of Ratargul Swamp Forest'),
    p('7/7d/Ratargul-02.jpg', 5330, 'Children paddling a boat through Ratargul Swamp Forest'),
    p('c/ce/Ratargul_785_retouched.jpg', 4000, 'A boatman between flooded trees at Ratargul'),
    p('6/63/Ratargul_Swamp_Forest,_Sylhet..jpg', 3000, 'Flooded trees reflected in still water at Ratargul'),
    p('5/5f/Ratargul_Boats.jpg', 3851, 'Boats waiting at the edge of Ratargul'),
    p('7/7a/Ratargul_04.jpg', 6016, 'Green canopy over dark water at Ratargul'),
  ],
  sreemangal: [
    p('6/62/Tea_gardens_in_Sreemangal_06.jpg', 5472, 'Rolling tea gardens with shade trees in Sreemangal'),
    p('0/0e/Tea_gardens_in_Sreemangal_04.jpg', 3888, 'Rows of tea bushes in Sreemangal'),
    p('6/6b/Tea_gardens_in_Sreemangal_05.jpg', 3888, 'A path between tea bushes in Sreemangal'),
    p('4/4e/Tea_gardens_in_Sreemangal_07.jpg', 3888, 'Tea garden hills under a soft sky in Sreemangal'),
    p('6/64/Lawachara_Forest.jpg', 4563, 'Misty morning in Lawachara National Park near Sreemangal'),
    p('5/52/A_tea_cabin_in_Sreemangal_03.jpg', 5472, 'A tea cabin in Sreemangal'),
  ],
  bisanakandi: [
    p('e/e2/Bisanakandi_Tourist_spot.jpg', 6000, 'Clear water running over stones at Bisanakandi with hills behind'),
    p('3/3c/Bisanakandi.jpg', 4272, 'The stone bed of Bisanakandi under the Khasi hills'),
    p('c/c0/Bisanakandi_02.jpg', 4272, 'Visitors wading in the stream at Bisanakandi'),
    p('3/38/Bisanakandi_sylhet.jpg', 3872, 'Boats near Bisanakandi'),
    p('8/8b/Bath_in_Bisanakandi.jpg', 4272, 'Bathing in the cold stream at Bisanakandi'),
    p('2/20/বিছানাকান্দির_সূযাস্ত.jpg', 2643, 'Sunset over Bisanakandi'),
  ],
  lalakhal: [
    p('5/54/Lalakhal_Sylhet.jpg', 4000, 'Turquoise water of the Sari river at Lalakhal'),
    p('b/ba/Lalakhal_2021.jpg', 4096, 'Wide view of Lalakhal and the green banks'),
    p('2/23/Lalakhal_2.jpg', 3968, 'Boats on the blue water at Lalakhal'),
    p('8/8b/Lalakhal_3.jpg', 3968, 'Hills and blue river at Lalakhal'),
    p('e/e3/Lalakhal_সিলেট.jpg', 4000, 'The Sari river bending through Lalakhal'),
  ],
  madhabkunda: [
    p('d/d6/Madhabkunda,_Bangladesh_(8996866684).jpg', 5319, 'Madhabkunda waterfall falling into its pool'),
    p('2/2e/Front_view_of_Madhabkunda_waterfall_on_13_August_2022.jpg', 4000, 'Front view of Madhabkunda waterfall in August'),
    p('6/69/Close_Side_view_of_Madhabkunda_waterfall_on_13_August_2022.jpg', 4000, 'Close side view of Madhabkunda waterfall'),
    p('f/f5/মাধবকুণ্ড_ঝর্ণাধারা.jpg', 3996, 'The stream below Madhabkunda'),
    p('c/c8/Madhabkunda_Waterfall_3.jpg', 3000, 'The tall drop of Madhabkunda waterfall'),
  ],
  tanguar: [
    p('a/a2/Tanguar_haor,_Bangladesh_01.jpg', 3700, 'Boats and swamp trees on Tanguar Haor'),
    p('2/2b/Tanguar_Haor_(টাঙ্গুয়ার_হাওর).JPG', 4288, 'Open water of Tanguar Haor'),
    p('d/d5/Tanguar_Haor_2.jpg', 3000, 'Trees standing in the water at Tanguar Haor'),
    p('1/12/Boat_station_at_Tanguar_haor_near_Niladri_Lake.jpg', 4000, 'Boat station near Niladri Lake at Tanguar Haor'),
    p('a/a4/A_small_village_at_Tanguar_haor.jpg', 4000, 'A small village on Tanguar Haor'),
    p('5/53/টাঙ্গুয়ার_হাওর,_সুনামগঞ্জ.jpg', 5472, 'Tanguar Haor in Sunamganj'),
  ],
  hakaluki: [
    p('b/b7/Hakaluki_Haor,_Sylhet.jpg', 4000, 'Hakaluki Haor under a wide sky'),
    p('d/d9/Hakaluki_Haor_by_Fardous_Kabir_01.jpg', 3968, 'Water and grassland at Hakaluki Haor'),
    p('0/06/Hakaluki_Haor_by_Fardous_Kabir_02.jpg', 3968, 'Boats on Hakaluki Haor'),
    p('9/97/Hakaluki_Haor_by_Fardous_Kabir_03.jpg', 3691, 'Hijol trees in Hakaluki Haor'),
    p('6/60/Hakaluki_Haor_by_Fardous_Kabir_05.jpg', 3842, 'Evening on Hakaluki Haor'),
  ],
  sust: [
    p('7/77/Shahjalal_SUST_Main_Road.JPG', 2048, 'The long entrance road of Shahjalal University of Science and Technology'),
    p('6/69/Shaheed_Minar,_SUST_in_2024.jpg', 3568, 'The Shaheed Minar on the hill at SUST'),
    p('b/bc/Shahjalal_SUST_Night1.jpg', 2048, 'SUST campus at night'),
    p('5/51/Road2C_Shahjalal_University_of_Science_and_Technology_bySohailmfk.jpg', 1280, 'Tree-lined road inside SUST'),
  ],
  misc: {
    shadaPathor: p('e/ec/Shada_Pathor,_Shylet,_Bangladesh.jpg', 4080, 'White stones and clear water at Shada Pathor, Bholaganj'),
    shadaPathor2: p('b/bc/Shada_Pathor_02.jpg', 4032, 'The stone field at Shada Pathor'),
    lawacharaTrail: p('d/dc/Way_back_home_Lawachara_National_Park_Srimongol_Sylhet_Bangladesh.jpg', 4800, 'A walking trail through Lawachara National Park'),
    dargahNight: p('3/31/Shah_Jalal_Dargah_Gate_at_Night.jpg', 3881, 'The gate of Hazrat Shah Jalal Dargah at night'),
    keaneNight: p('6/6f/Keane_Bridge_at_night.jpg', 4608, 'Keane Bridge over the Surma at night'),
    keaneDay: p('4/47/The_Keane_Bridge_over_the_Surma_River,_Sylhet,_Bangladesh.jpg', 4624, 'Keane Bridge over the Surma river'),
    sevenTea: p('a/a4/Seven_Layers_Tea_(01).jpg', 4600, 'A glass of seven-layer tea'),
    sevenTea2: p('f/f5/7_Color_Layer_Tea.jpg', 3397, 'Seven-color layer tea'),
    lawacharaFood: p('7/70/Bangladeshi_traditional_food_at_Lawachara.jpg', 5616, 'A traditional meal served near Lawachara'),
    satkora: p('6/66/Bari_Satkora-1,_Citrus_Research_Institute.jpg', 2592, 'Satkora, the Sylheti citrus'),
    paan: p('7/7d/পানচিনি_উপলক্ষে_পান-সুপারি.jpg', 2368, 'Paan and supari prepared for a celebration'),
    teaCabin: p('a/a7/A_tea_cabin_in_Sreemangal_07.jpg', 5472, 'Inside a Sreemangal tea cabin'),
    sripur: p('c/c8/Tea_garden_at_Sripur_(1).jpg', 4600, 'Tea garden at Sripur, Jaintiapur'),
    moulvibazarHills: p('4/4e/Hills_of_Moulvibazar_01.jpg', 6000, 'Green hills of Moulvibazar'),
    lawacharaPlants: p('8/82/Plants_in_Lawachara_National_Park_02.jpg', 5472, 'Dense plants inside Lawachara National Park'),
    akni: p('6/69/Akni_from_Sylhet.jpg', 3120, 'A plate of Sylheti akhni'),
    kheer: p('9/96/Syloti_style_kheer.jpg', 1938, 'Sylheti style kheer'),
  },
};
export { IMG };

const m = (...months: number[]) => months;

export const DESTINATIONS: Destination[] = [
  {
    slug: 'jaflong', name: 'Jaflong', nameBn: 'জাফলং', area: 'Gowainghat', district: 'Sylhet',
    tagline: 'Where the Piyain leaves the hills',
    summary: 'A border valley where the Dawki river comes down from Meghalaya as the Piyain, clear and cold, over a wide bed of stone.',
    story: [
      'Jaflong sits about 60 km north-east of Sylhet city, right where the Khasi and Jaintia hills of Meghalaya drop into the plains. The Dawki suspension bridge hangs over the river on the Indian side, and on clear winter days the water below is green enough to see the stones on the bottom.',
      'People come for the view from Zero Point, a boat across to the Khasia village of Sangramponji, the small Mayabi falls, and the tea garden on the slope behind the market. In the monsoon the hills are full of white streams, and the river runs fast and brown.',
      'The stone beds are also a workplace. Collectors and boats work the river most of the year, so go early, keep to the marked ghats, and give the workers room.',
    ],
    category: 'hills-and-stone', experiences: ['adventure', 'river', 'photography', 'culture'],
    bestSeason: 'Nov to Feb for clear water, Jun to Sep for hill streams', bestMonths: m(11, 12, 1, 2, 6, 7, 8, 9),
    lat: 25.1634, lng: 92.0175, distanceKm: 60,
    cover: IMG.jaflong[0], gallery: IMG.jaflong, theme: THEMES.jaflong,
    howToGet: [
      { mode: 'Bus', detail: 'Local buses leave Sylhet\'s Shibganj and Sobhanighat stands for Jaflong through the day. About 2 hours.' },
      { mode: 'CNG or car', detail: 'A reserved CNG auto-rickshaw or car along the Sylhet to Tamabil road takes 1.5 to 2 hours.' },
      { mode: 'Boat', detail: 'From the Jaflong ghat, hire a country boat to cross to Sangramponji and the Mayabi falls.' },
    ],
    costs: [
      { label: 'Transport from Sylhet (return)', min: 300, max: 3500, note: 'Bus at the low end, reserved car at the high end' },
      { label: 'Boat to Sangramponji', min: 500, max: 1000, note: 'Per boat, shared by the group' },
      { label: 'Meals', min: 300, max: 800 },
    ],
    nearby: ['lalakhal', 'bisanakandi', 'ratargul'],
    tips: ['Check the river level after heavy rain; boats may stop.', 'Carry sandals that grip wet stone.', 'Respect the border markers at Zero Point.'],
    foodNotes: ['Fresh river fish fry at the Jaflong market', 'Khasi paan and betel leaf from Sangramponji'],
    budgetLevel: 1, minDays: 1, featured: true, order: 1,
  },
  {
    slug: 'ratargul', name: 'Ratargul Swamp Forest', nameBn: 'রাতারগুল', area: 'Gowainghat', district: 'Sylhet',
    tagline: 'A forest that stands in the river',
    summary: 'A freshwater swamp forest of hijal and koroch trees that floods with the monsoon, explored only by small wooden boat.',
    story: [
      'Ratargul lies on the Gowain river about 26 km from Sylhet. For half the year the trees stand in several feet of dark water and the only way through is by dinghy, gliding between trunks while the boatman pushes off with a bamboo pole.',
      'The forest is quiet. You hear oars, birds and the drip from the canopy. Monkeys, kingfishers and water snakes live here, and the light under the trees turns green at midday.',
      'In winter the water drops away and the forest floor becomes dry ground. The watchtower near the entrance gives a view over the canopy in any season.',
    ],
    category: 'forests', experiences: ['river', 'photography', 'adventure'],
    bestSeason: 'Jul to Oct, when the forest is flooded', bestMonths: m(7, 8, 9, 10),
    lat: 25.0057, lng: 91.9614, distanceKm: 26,
    cover: IMG.ratargul[0], gallery: IMG.ratargul, theme: THEMES.ratargul,
    howToGet: [
      { mode: 'CNG or car', detail: 'Go from Sylhet towards Motorghat or Chowrangi ghat via the airport road. About 1 hour.' },
      { mode: 'Boat', detail: 'At the ghat, hire a small wooden boat with a boatman for the loop through the forest.' },
    ],
    costs: [
      { label: 'Transport from Sylhet (return)', min: 800, max: 2500 },
      { label: 'Forest boat', min: 750, max: 1200, note: 'Per boat of 4 to 5 people, around 1.5 hours' },
      { label: 'Entry fee', min: 20, max: 50 },
    ],
    nearby: ['jaflong', 'bisanakandi', 'sust'],
    tips: ['Wear a hat and keep your hands inside the boat.', 'Avoid loud music; the forest is a wildlife sanctuary.', 'Take all plastic back with you.'],
    foodNotes: ['Snacks only at the ghat; eat in Sylhet before or after'],
    budgetLevel: 1, minDays: 1, featured: true, order: 2,
  },
  {
    slug: 'sreemangal', name: 'Sreemangal', nameBn: 'শ্রীমঙ্গল', area: 'Sreemangal', district: 'Moulvibazar',
    tagline: 'The tea capital, in no hurry',
    summary: 'Low hills folded into tea estates, the rainforest of Lawachara, and tea cabins that pour the famous seven-layer tea.',
    story: [
      'Sreemangal is the heart of Bangladesh\'s tea country. Estates cover the hills in every direction, the bushes kept waist high and the shade trees standing in neat lines above them. Early in the morning the pickers walk out with baskets on their heads.',
      'Lawachara National Park is a short ride away, one of the last patches of mixed tropical forest in the country and home to the western hoolock gibbon. The railway line still cuts straight through it.',
      'Spend the afternoon at the Bangladesh Tea Research Institute, then try a layered tea in town. Sreemangal rewards slow days; two nights is the least it deserves.',
    ],
    category: 'tea-country', experiences: ['tea', 'adventure', 'food', 'photography', 'culture'],
    bestSeason: 'Jun to Sep for green hills, Nov to Feb for misty mornings', bestMonths: m(6, 7, 8, 9, 11, 12, 1, 2),
    lat: 24.3083, lng: 91.7333, distanceKm: 85,
    cover: IMG.sreemangal[0], gallery: IMG.sreemangal, theme: THEMES.sreemangal,
    howToGet: [
      { mode: 'Train', detail: 'Intercity trains from Sylhet or Dhaka stop at Sreemangal station. About 2.5 hours from Sylhet.' },
      { mode: 'Bus', detail: 'Buses run often from Sylhet\'s Kadamtali terminal. About 2.5 hours.' },
      { mode: 'Local', detail: 'Hire a CNG in town for a half day loop of Lawachara and the estates.' },
    ],
    costs: [
      { label: 'Transport from Sylhet (return)', min: 400, max: 5000 },
      { label: 'Stay per night', min: 1500, max: 20000, note: 'Guesthouse to tea resort' },
      { label: 'Lawachara entry and guide', min: 100, max: 1000 },
    ],
    nearby: ['hakaluki', 'madhabkunda'],
    tips: ['Hire a local guide in Lawachara to see gibbons.', 'Ask before photographing tea workers.', 'Book resorts early for winter weekends.'],
    foodNotes: ['Seven-layer tea at Nilkantha Tea Cabin', 'Khasi and Manipuri dishes near Lawachara'],
    budgetLevel: 2, minDays: 2, featured: true, order: 3,
  },
  {
    slug: 'bisanakandi', name: 'Bisanakandi', nameBn: 'বিছানাকান্দি', area: 'Gowainghat', district: 'Sylhet',
    tagline: 'A bed of stones under the clouds',
    summary: 'Where several hill streams meet on a wide spread of stones under the Khasi hills, cold, clear and fast.',
    story: [
      'Bisanakandi means something like a bed of stones, and that is what you find: a broad, shallow pool of round boulders where streams from Meghalaya spill over the border. The hills rise straight up behind it and clouds sit on their tops.',
      'The trip is half the experience. You reach Hadarpar by road and then take an engine boat up the Piyain, past villages, sand banks and stone boats.',
      'The water can rise quickly after rain in the hills. Stay in the shallow part, never cross the border line, and do not swim where the current pulls.',
    ],
    category: 'hills-and-stone', experiences: ['river', 'adventure', 'photography'],
    bestSeason: 'Jun to Sep, when the streams run full', bestMonths: m(6, 7, 8, 9),
    lat: 25.1708, lng: 91.8712, distanceKm: 45,
    cover: IMG.bisanakandi[0], gallery: IMG.bisanakandi, theme: THEMES.bisanakandi,
    howToGet: [
      { mode: 'CNG or car', detail: 'From Sylhet\'s Ambarkhana, take the Salutikar road to Hadarpar bazar. About 1.5 hours.' },
      { mode: 'Engine boat', detail: 'Hire a boat at Hadarpar ghat for the 40 minute run to Bisanakandi and back.' },
    ],
    costs: [
      { label: 'Transport to Hadarpar (return)', min: 600, max: 3000 },
      { label: 'Engine boat', min: 1500, max: 2500, note: 'Per boat, return with waiting time' },
      { label: 'Meals', min: 200, max: 600 },
    ],
    nearby: ['jaflong', 'ratargul'],
    tips: ['Go in the morning; afternoon storms are common in monsoon.', 'Agree the boat fare and waiting time before leaving.', 'Wear a life jacket on the boat.'],
    foodNotes: ['Simple rice and fish meals at Hadarpar bazar'],
    budgetLevel: 1, minDays: 1, featured: true, order: 4,
  },
  {
    slug: 'lalakhal', name: 'Lalakhal', nameBn: 'লালাখাল', area: 'Jaintiapur', district: 'Sylhet',
    tagline: 'The river that turned blue',
    summary: 'A bend of the Sari river where the water runs a startling turquoise between tea-covered hills.',
    story: [
      'The Myntdu river comes out of Meghalaya and enters Bangladesh as the Sari at Lalakhal. Minerals from the hills give the water its colour, from jade to deep turquoise depending on the light and the season.',
      'Boats leave from Sarighat on the Tamabil road. The ride upstream passes sand banks, bamboo groves and the Lalakhal tea estate, and ends near the border at Zero Point.',
      'The colour is strongest in the dry months, from November to March, when the water is low and slow.',
    ],
    category: 'hills-and-stone', experiences: ['river', 'photography', 'tea'],
    bestSeason: 'Nov to Mar for the deepest blue', bestMonths: m(11, 12, 1, 2, 3),
    lat: 25.1068, lng: 92.179, distanceKm: 38,
    cover: IMG.lalakhal[0], gallery: IMG.lalakhal, theme: THEMES.lalakhal,
    howToGet: [
      { mode: 'Bus or CNG', detail: 'Take the Sylhet to Tamabil road to Sarighat. About 1 hour.' },
      { mode: 'Boat', detail: 'Engine boats and speedboats run from Sarighat to Lalakhal and Zero Point.' },
    ],
    costs: [
      { label: 'Transport to Sarighat (return)', min: 200, max: 2500 },
      { label: 'Engine boat', min: 1200, max: 2500, note: 'Per boat, about 3 hours return' },
      { label: 'Meals', min: 250, max: 700 },
    ],
    nearby: ['jaflong', 'bisanakandi'],
    tips: ['Combine with Jaflong on the same road for a full day.', 'Sun hats help; there is little shade on the water.'],
    foodNotes: ['Riverside restaurants near the Lalakhal resorts'],
    budgetLevel: 1, minDays: 1, featured: true, order: 5,
  },
  {
    slug: 'madhabkunda', name: 'Madhabkunda Waterfall', nameBn: 'মাধবকুণ্ড', area: 'Barlekha', district: 'Moulvibazar',
    tagline: 'A falling wall of water in the Patharia hills',
    summary: 'One of the highest waterfalls in Bangladesh, dropping from a rock face into a deep, cold pool inside an eco-park.',
    story: [
      'Madhabkunda drops more than 50 metres from the Patharia hills into a pool surrounded by forest. In the monsoon it roars; in winter it thins to a white ribbon.',
      'The eco-park around it has stairs and shaded paths. A walk up the stream leads to the quieter Parikunda falls and Khasia villages growing betel leaf.',
    ],
    category: 'waterfalls', experiences: ['waterfalls', 'adventure', 'photography'],
    bestSeason: 'Jun to Sep, when the fall is strongest', bestMonths: m(6, 7, 8, 9),
    lat: 24.6385, lng: 92.2246, distanceKm: 70,
    cover: IMG.madhabkunda[0], gallery: IMG.madhabkunda, theme: THEMES.madhabkunda,
    howToGet: [
      { mode: 'Train and CNG', detail: 'Train to Kulaura, then a CNG to Madhabkunda. About 1 hour from Kulaura.' },
      { mode: 'Car', detail: 'From Sylhet via Fenchuganj and Barlekha. About 2.5 hours.' },
    ],
    costs: [
      { label: 'Transport from Sylhet (return)', min: 500, max: 5000 },
      { label: 'Eco-park entry', min: 30, max: 50 },
      { label: 'Meals', min: 200, max: 600 },
    ],
    nearby: ['hakaluki', 'sreemangal'],
    tips: ['Rocks near the pool are slippery; stay behind the railings.', 'Weekdays are much quieter.'],
    foodNotes: ['Tea stalls and simple meals at the eco-park gate'],
    budgetLevel: 1, minDays: 1, featured: false, order: 6,
  },
  {
    slug: 'tanguar-haor', name: 'Tanguar Haor', nameBn: 'টাঙ্গুয়ার হাওর', area: 'Tahirpur', district: 'Sunamganj',
    tagline: 'An inland sea that comes and goes',
    summary: 'A Ramsar wetland of about 100 km² that fills each monsoon into one sheet of water, best seen from a houseboat.',
    story: [
      'In the dry season Tanguar Haor is a patchwork of beels, rice fields and grassland. When the rains come, it all joins into one wide sheet of water reaching to the foot of the Meghalaya hills.',
      'Houseboat trips run from Tahirpur. You sleep on the water, swim from the deck, and watch the swamp trees stand in the lake at dawn. Niladri Lake and the Jadukata river are a short ride beyond.',
      'In winter the haor becomes one of the country\'s most important grounds for migratory birds, with ducks arriving from Siberia and Central Asia.',
    ],
    category: 'wetlands', experiences: ['river', 'photography', 'adventure'],
    bestSeason: 'Jun to Sep for houseboats, Dec to Feb for birds', bestMonths: m(6, 7, 8, 9, 12, 1, 2),
    lat: 25.15, lng: 91.067, distanceKm: 110,
    cover: IMG.tanguar[0], gallery: IMG.tanguar, theme: THEMES.tanguar,
    howToGet: [
      { mode: 'Bus', detail: 'Sylhet to Sunamganj by bus, about 2 hours.' },
      { mode: 'Road and boat', detail: 'Sunamganj to Tahirpur by motorbike or CNG, then the houseboat leaves from the ghat.' },
    ],
    costs: [
      { label: 'Transport from Sylhet (return)', min: 800, max: 4000 },
      { label: 'Houseboat per person, 1 night', min: 3500, max: 12000, note: 'Shared to premium boats, meals included' },
    ],
    nearby: ['hakaluki'],
    tips: ['Book houseboats a few weeks ahead in peak season.', 'Never throw waste in the water; it is a protected site.', 'Bring a power bank; boats have limited charging.'],
    foodNotes: ['Fresh haor fish cooked on board'],
    budgetLevel: 3, minDays: 2, featured: true, order: 7,
  },
  {
    slug: 'hakaluki-haor', name: 'Hakaluki Haor', nameBn: 'হাকালুকি হাওর', area: 'Barlekha and Kulaura', district: 'Moulvibazar',
    tagline: 'The largest haor, and the loudest winter',
    summary: 'The largest freshwater wetland in Bangladesh, a maze of more than 200 beels that hosts thousands of winter birds.',
    story: [
      'Hakaluki spreads across five upazilas of Moulvibazar and Sylhet. Its many beels join into one lake in the rains and break apart again in winter, leaving grassland grazed by buffalo.',
      'From December to February the haor fills with ducks, waders and raptors. Hire a small boat at dawn from Judhistipur or Hakaluki bazar and keep your distance from the flocks.',
    ],
    category: 'wetlands', experiences: ['photography', 'river'],
    bestSeason: 'Dec to Feb for birds, Jul to Sep for open water', bestMonths: m(12, 1, 2, 7, 8, 9),
    lat: 24.65, lng: 92.08, distanceKm: 55,
    cover: IMG.hakaluki[0], gallery: IMG.hakaluki, theme: THEMES.hakaluki,
    howToGet: [
      { mode: 'Car or CNG', detail: 'From Sylhet via Fenchuganj to the haor edge. About 1.5 hours.' },
      { mode: 'Boat', detail: 'Local boats can be hired at the haor villages.' },
    ],
    costs: [
      { label: 'Transport from Sylhet (return)', min: 800, max: 3500 },
      { label: 'Local boat', min: 800, max: 2000 },
    ],
    nearby: ['madhabkunda', 'sreemangal'],
    tips: ['Carry binoculars and a long lens.', 'Go with a local guide; tracks across the haor change every season.'],
    foodNotes: ['Haor fish curry in the village bazars'],
    budgetLevel: 1, minDays: 1, featured: false, order: 8,
  },
  {
    slug: 'sust', name: 'SUST and Kumargaon', nameBn: 'শাবিপ্রবি', area: 'Kumargaon', district: 'Sylhet',
    tagline: 'A campus of hills and long roads',
    summary: 'The green campus of Shahjalal University of Science and Technology, its kilometre-long entrance road and the tea hills around it.',
    story: [
      'Shahjalal University of Science and Technology was founded in 1986 at Kumargaon, about 6 km from the city centre. Its long, tree-lined entrance road is one of the best walks in Sylhet at golden hour.',
      'The campus climbs over small hills. The Shaheed Minar stands on top of one of them, and tea gardens such as Malnichhara are close by on the airport road.',
      'It is a working university, so visit respectfully, ideally late afternoon or on holidays, and enjoy the tea stalls at the gate.',
    ],
    category: 'city-and-campus', experiences: ['culture', 'photography', 'food'],
    bestSeason: 'All year, best late afternoon', bestMonths: m(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12),
    lat: 24.918, lng: 91.832, distanceKm: 6,
    cover: IMG.sust[0], gallery: IMG.sust, theme: THEMES.sust,
    howToGet: [
      { mode: 'CNG or rickshaw', detail: 'From Zindabazar or Amberkhana, a CNG to the SUST gate takes 15 to 20 minutes.' },
      { mode: 'Leguna', detail: 'Shared legunas run from Amberkhana towards Tilagor and the campus.' },
    ],
    costs: [
      { label: 'Transport from the city (return)', min: 60, max: 400 },
      { label: 'Tea and snacks at the gate', min: 50, max: 200 },
    ],
    nearby: ['ratargul', 'jaflong'],
    tips: ['Classes run on weekdays; keep noise down near academic buildings.', 'Combine with Malnichhara tea garden on the airport road.'],
    foodNotes: ['Tea stalls and fuchka at the main gate'],
    budgetLevel: 1, minDays: 1, featured: false, order: 9,
  },
];

export const SLIDES: Slide[] = ['jaflong', 'ratargul', 'sreemangal', 'bisanakandi', 'lalakhal'].map((slug, i) => {
  const d = DESTINATIONS.find((x) => x.slug === slug)!;
  return {
    destinationSlug: slug,
    title: d.name.replace(' Swamp Forest', ''),
    kicker: `${d.area}, ${d.district}`,
    description: d.summary,
    image: d.cover,
    theme: d.theme,
    order: i + 1,
    active: true,
  };
});

export const EXPERIENCES: Experience[] = [
  { slug: 'adventure', name: 'Adventure and hiking', line: 'Forest trails, stone rivers and border hills.', destinations: ['jaflong', 'bisanakandi', 'sreemangal', 'madhabkunda'], image: IMG.misc.lawacharaTrail },
  { slug: 'tea', name: 'Tea garden walks', line: 'Estate paths, pluckers at dawn, layered tea in the evening.', destinations: ['sreemangal', 'lalakhal'], image: IMG.sreemangal[1] },
  { slug: 'river', name: 'River and boat trips', line: 'Dinghies through swamp forest, houseboats on the haor.', destinations: ['ratargul', 'lalakhal', 'tanguar-haor', 'bisanakandi'], image: IMG.ratargul[1] },
  { slug: 'waterfalls', name: 'Waterfalls', line: 'At their loudest from June to September.', destinations: ['madhabkunda', 'jaflong'], image: IMG.madhabkunda[1] },
  { slug: 'photography', name: 'Photography spots', line: 'Turquoise water, flooded trees and mist on the tea.', destinations: ['lalakhal', 'ratargul', 'tanguar-haor', 'hakaluki-haor'], image: IMG.lalakhal[1] },
  { slug: 'food', name: 'Local food', line: 'Akhni, satkora beef and seven layers of tea.', destinations: ['sreemangal', 'sust'], image: IMG.misc.lawacharaFood },
  { slug: 'culture', name: 'Culture and heritage', line: 'Shrines, Khasia villages, Manipuri weaving.', destinations: ['jaflong', 'sreemangal', 'sust'], image: IMG.misc.dargahNight },
];

export const FOODS: Food[] = [
  { slug: 'akhni', name: 'Akhni', nameBn: 'আখনি', description: 'Sylhet\'s own spiced rice, cooked with beef or chicken and fragrant with whole spices. Softer and less oily than biryani.', where: 'Panshi and Pach Bhai in Zindabazar', image: IMG.misc.akni },
  { slug: 'satkora-beef', name: 'Satkora beef', nameBn: 'সাতকরা গরুর মাংস', description: 'Beef slow-cooked with the rind of satkora, a bitter, aromatic citrus that grows only in this region.', where: 'Most Sylheti restaurants in winter', image: IMG.misc.satkora },
  { slug: 'seven-layer-tea', name: 'Seven-layer tea', nameBn: 'সাত রঙের চা', description: 'A glass of tea poured in distinct coloured layers, invented in Sreemangal. Drink it slowly, layer by layer.', where: 'Nilkantha Tea Cabin, Sreemangal', image: IMG.misc.sevenTea },
  { slug: 'shutki-shira', name: 'Hidol and shutki', nameBn: 'হিদল ও শুটকি', description: 'Fermented and dried fish, the sharpest taste of the haor country, mashed with chilli into bhorta.', where: 'Home kitchens and bazar eateries in Sunamganj', image: IMG.misc.lawacharaFood },
  { slug: 'sylheti-kheer', name: 'Sylheti kheer', nameBn: 'ক্ষীর', description: 'Thick, slow-boiled rice pudding served at weddings and Eid.', where: 'Sweet shops around Bandar Bazar', image: IMG.misc.kheer },
  { slug: 'paan', name: 'Khasi paan', nameBn: 'খাসিয়া পান', description: 'Betel leaf grown by the Khasia people in the hill villages, served with supari after meals.', where: 'Jaflong and Madhabkunda markets', image: IMG.misc.paan },
];

export const PLACES: Place[] = [
  { slug: 'panshi', kind: 'restaurant', name: 'Panshi Restaurant', area: 'Zindabazar, Sylhet', description: 'Busy, no-frills Bengali dining with dozens of bhortas and curries. Famous for its akhni.', priceFrom: 250, priceNote: 'per person', specialty: 'Akhni, bhorta platter', lat: 24.8967, lng: 91.8697 },
  { slug: 'pach-bhai', kind: 'restaurant', name: 'Pach Bhai Restaurant', area: 'Zindabazar, Sylhet', description: 'A Sylhet institution for home-style fish curries and satkora beef.', priceFrom: 250, priceNote: 'per person', specialty: 'Satkora beef, fish curry', lat: 24.8962, lng: 91.8701 },
  { slug: 'palki', kind: 'restaurant', name: 'Palki Restaurant', area: 'Zindabazar, Sylhet', description: 'Family restaurant serving Sylheti and Bengali classics.', priceFrom: 300, priceNote: 'per person', specialty: 'Kacchi, rezala', lat: 24.8971, lng: 91.8689 },
  { slug: 'nilkantha', kind: 'restaurant', name: 'Nilkantha Tea Cabin', area: 'Sreemangal', destinationSlug: 'sreemangal', description: 'The tea cabin that made seven-layer tea famous.', priceFrom: 70, priceNote: 'per glass', specialty: 'Layered tea', lat: 24.3076, lng: 91.7612 },
  { slug: 'grand-sylhet', kind: 'hotel', name: 'Grand Sylhet Hotel and Resort', area: 'Airport road, Sylhet', destinationSlug: 'sust', description: 'Large hotel on the hills near the airport, with pool and tea-garden views.', priceFrom: 12000, priceNote: 'per night', lat: 24.9473, lng: 91.8737 },
  { slug: 'nazimgarh-lalakhal', kind: 'hotel', name: 'Nazimgarh Wilderness', area: 'Lalakhal, Jaintiapur', destinationSlug: 'lalakhal', description: 'River-side cottages on the Sari at Lalakhal, with boats to the turquoise water.', priceFrom: 15000, priceNote: 'per night', lat: 25.1, lng: 92.17 },
  { slug: 'grand-sultan', kind: 'hotel', name: 'Grand Sultan Tea Resort and Golf', area: 'Sreemangal', destinationSlug: 'sreemangal', description: 'Resort among the tea estates with pools, golf and spa.', priceFrom: 18000, priceNote: 'per night', lat: 24.3297, lng: 91.7464 },
  { slug: 'dusai', kind: 'hotel', name: 'Dusai Resort and Spa', area: 'Moulvibazar', destinationSlug: 'sreemangal', description: 'Hillside resort between Moulvibazar and Sreemangal.', priceFrom: 14000, priceNote: 'per night', lat: 24.43, lng: 91.79 },
  { slug: 'tanguar-houseboats', kind: 'hotel', name: 'Tahirpur houseboats', area: 'Tanguar Haor, Sunamganj', destinationSlug: 'tanguar-haor', description: 'Shared and private houseboats with cabins, meals on board.', priceFrom: 3500, priceNote: 'per person per night', lat: 25.08, lng: 91.18 },
  { slug: 'jaflong-guesthouses', kind: 'hotel', name: 'Jaflong guesthouses', area: 'Jaflong bazar', destinationSlug: 'jaflong', description: 'Simple rooms near the market for an early start on the river.', priceFrom: 1200, priceNote: 'per night', lat: 25.16, lng: 92.01 },
];

export const GEMS: Gem[] = [
  { slug: 'shada-pathor', name: 'Shada Pathor', area: 'Bholaganj, Companiganj', story: 'A field of white stones under the hills where the Dhalai river comes down. Few people go beyond the first bank; walk on and you have the water to yourself.', image: IMG.misc.shadaPathor, lat: 25.18, lng: 91.75 },
  { slug: 'lawachara-trails', name: 'The Lawachara trails', area: 'Kamalganj, Moulvibazar', story: 'Three marked walks, 30 minutes to 3 hours, through tall forest. Go at 7 am with a guide and listen for the hoolock gibbons calling.', image: IMG.misc.lawacharaTrail, lat: 24.3215, lng: 91.7836 },
  { slug: 'sripur', name: 'Sripur tea gardens', area: 'Jaintiapur', story: 'The tea estate on the road to Jaflong that most cars pass without stopping. Stop at the hilltop for a long view to the Meghalaya waterfalls.', image: IMG.misc.sripur, lat: 25.13, lng: 92.11 },
  { slug: 'keane-bridge-night', name: 'Keane Bridge after dark', area: 'Surma riverfront, Sylhet', story: 'The 1936 steel bridge lights up over the Surma. Take a boat from the ghat below Ali Amjad\'s clock tower for the best view.', image: IMG.misc.keaneNight, lat: 24.8889, lng: 91.8686 },
];

export const POSTS: Post[] = [
  {
    slug: 'three-days-water-and-stone', title: 'Three days of water and stone', excerpt: 'Jaflong, Lalakhal and Bisanakandi in one long weekend on the Tamabil road.',
    author: 'SYLHET editors', date: '2026-08-14', readMinutes: 6, cover: IMG.lalakhal[2], destinationSlug: 'lalakhal', published: true,
    body: [
      'The Sylhet to Tamabil road is the spine of this trip. Everything on it faces the same hills, and every river on it comes out of them.',
      'Day one is Lalakhal. Leave the city by 8 am, reach Sarighat by 9, and be on the water before the light turns flat. The colour of the Sari is at its best in the first hour.',
      'Day two is Jaflong. Go to Zero Point early, then cross to Sangramponji, the Khasia village, and walk up to the small falls. Eat fish fry at the bazar on the way back.',
      'Day three is Bisanakandi, by road to Hadarpar and then by boat. If it rained in the hills overnight, wait; the water rises quickly and the boatmen know when it is safe.',
    ],
  },
  {
    slug: 'a-morning-in-ratargul', title: 'A morning in the flooded forest', excerpt: 'What it feels like to glide between trees in Ratargul during the monsoon.',
    author: 'SYLHET editors', date: '2026-07-02', readMinutes: 4, cover: IMG.ratargul[2], destinationSlug: 'ratargul', published: true,
    body: [
      'The boatman stands at the back and pushes off with a long pole. There is no engine, and after a few minutes the voices from the ghat are gone.',
      'The trees are close enough to touch. Their trunks are dark to the waterline and green above it, and the water holds a second forest upside down.',
      'We saw a kingfisher, two monkeys, and nothing else for long stretches. That is the point. Ratargul is best when nobody talks.',
    ],
  },
  {
    slug: 'how-to-drink-seven-layer-tea', title: 'How to drink seven-layer tea', excerpt: 'Spoon, straw or patience: a short guide from the tea capital.',
    author: 'SYLHET editors', date: '2026-05-20', readMinutes: 3, cover: IMG.misc.sevenTea2, destinationSlug: 'sreemangal', published: true,
    body: [
      'The layers are made from different teas, milks and spices with different densities, poured carefully one on top of another.',
      'Look first. Then take a straw and taste each layer from the bottom, or simply drink it from the top down and notice how the flavour changes.',
      'Stirring is allowed, but only at the end.',
    ],
  },
];
