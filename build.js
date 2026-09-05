/* ============================================================================
   Goldwagen Alberton — page builder

   Stitches partials/ + pages/ into plain static .html files in the project root.
   The OUTPUT is ordinary HTML with no dependencies — deploy the root folder and
   ignore this script entirely. It exists only so the header, footer, contact
   details and SVG sprite live in ONE place instead of nine.

   Run:  node build.js
   ========================================================================== */
const fs   = require('fs');
const path = require('path');

/* Change this once you have a domain — it feeds canonical + Open Graph URLs. */
const SITE = 'https://www.goldwagenalberton.co.za';

const PAGES = [
  { slug: 'home', file: 'index.html',
    title: 'Goldwagen Alberton | Quality Vehicle Spares & Car Parts in Alberton, Gauteng',
    description: 'Goldwagen Alberton stocks quality aftermarket car parts for VW, Audi, BMW, Mercedes-Benz, Toyota, Ford and more. Shop 2, Gateway Centre, Ring Road East, Alberton. Call 011 869 4478.' },

  { slug: 'parts', file: 'parts.html',
    title: 'Car Parts We Stock | Brakes, Filters, Suspension & More | Goldwagen Alberton',
    description: 'Brakes, filters, engine parts, suspension, clutch, cooling, electrical, belts, oils, exhaust and service kits for all major makes — in stock in Alberton.' },

  { slug: 'vehicles', file: 'vehicles.html',
    title: 'Vehicle Coverage | Parts for VW, Audi, BMW, Toyota & More | Goldwagen Alberton',
    description: 'Aftermarket spares for Volkswagen, Audi, BMW, Mercedes-Benz, Toyota, Ford, Nissan, Hyundai, Kia and every other major make on South African roads.' },

  { slug: 'brands', file: 'brands.html',
    title: 'Parts Brands We Stock | Bosch, ATE, Bilstein, SKF | Goldwagen Alberton',
    description: 'Over 40 premium parts brands including Bosch, ATE, Bilstein, Sachs, SKF, Valeo, Mann-Filter, Mahle, Monroe, Liqui Moly and Wolf Lubricants.' },

  { slug: 'about', file: 'about.html',
    title: 'About Our Alberton Branch | Goldwagen Alberton',
    description: 'The Goldwagen franchise at Gateway Centre, Ring Road East. Trade and retail welcome, VIN part lookup and same-day collection on stocked lines.' },

  { slug: 'reviews', file: 'reviews.html',
    title: 'Customer Reviews | Goldwagen Alberton',
    description: 'What customers and workshops around Alberton, Meyersdal and Alrode say about Goldwagen Alberton.' },

  { slug: 'quote', file: 'quote.html',
    title: 'Get a Parts Quote | Goldwagen Alberton',
    description: 'Tell us your vehicle and the parts you need and we will come straight back with a price. Fastest way to a quote in Alberton.' },

  { slug: 'faq', file: 'faq.html',
    title: 'Common Questions | Goldwagen Alberton',
    description: 'Stock, VINs, aftermarket quality, trade accounts and where to find us — the questions we are asked most at the counter.' },

  { slug: 'visit', file: 'visit.html',
    title: 'Find Us in Alberton | Address, Hours & Contact | Goldwagen Alberton',
    description: 'Shop 2, Gateway Centre, Ring Road East, Alberton, 1449. Mon-Fri 08:00-17:00, Sat 08:00-13:00. Call 011 869 4478.' }
];

const read = f => fs.readFileSync(path.join(__dirname, f), 'utf8');

const head   = read('partials/head.html');
const sprite = read('partials/sprite.html');
const header = read('partials/header.html');
const footer = read('partials/footer.html');

let built = 0;

for (const page of PAGES) {
  const contentPath = path.join(__dirname, 'pages', page.file);
  if (!fs.existsSync(contentPath)) {
    console.warn('  skipped (no source): pages/' + page.file);
    continue;
  }
  const content = fs.readFileSync(contentPath, 'utf8');

  // Mark the current page in both the desktop nav and the mobile drawer.
  const nav = header.replace(
    new RegExp('data-nav="' + page.slug + '"', 'g'),
    'data-nav="' + page.slug + '" aria-current="page"'
  );

  const html = [
    head,
    sprite,
    nav,
    '\n<main id="main">\n',
    content.trimEnd(),
    '\n</main>\n',
    footer
  ].join('\n')
    .replace(/\{\{TITLE\}\}/g, page.title)
    .replace(/\{\{DESCRIPTION\}\}/g, page.description)
    .replace(/\{\{SITE\}\}/g, SITE)
    .replace(/\{\{FILE\}\}/g, page.file === 'index.html' ? '' : page.file);

  fs.writeFileSync(path.join(__dirname, page.file), html);
  console.log('  built  ' + page.file.padEnd(15) + (html.length / 1024).toFixed(1) + ' KB');
  built++;
}

console.log('\n' + built + ' page' + (built === 1 ? '' : 's') + ' built.');
