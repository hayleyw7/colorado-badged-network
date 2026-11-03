import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = readFileSync('index.html', 'utf8');
const css = readFileSync('styles.css', 'utf8');

assert.match(html, /<html lang="en">/);
assert.match(html, /<header class="site-header" id="top">/);
assert.equal((html.match(/class="resource-card"/g) || []).length, 6);
assert.match(html, /class="hero-logo" src="assets\/cbn-hero-logo\.png"/);
assert.ok(readFileSync('assets/cbn-hero-logo.png').length > 0);
assert.match(html, /<meta name="viewport"/);
assert.match(html, /<link rel="icon" href="favicon\.svg"/);
assert.match(html, /id="about"/);
assert.match(html, /id="resources"/);
assert.match(html, /id="media"/);
assert.match(html, /Episode 2 - Colorado Badged Network/);
assert.doesNotMatch(html, /CBN Facebook Group/);
assert.doesNotMatch(html, /copyright|©/i);
const visible = html.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>|<[^>]+>/g, ' ').replaceAll('&amp;', '&');
assert.doesNotMatch(visible, /—|;/);

const hrefs = [...html.matchAll(/href="(https?:\/\/[^"#]+)"/g)].map(([, href]) => href);
for (const href of hrefs) assert.match(href, /^https:\/\//, `Non-HTTPS link: ${href}`);

for (const required of [
  'https://med.colorado.gov/employee-license-application',
  'https://med.colorado.gov/rules',
  'https://med.colorado.gov/social-equity',
  'https://med.colorado.gov/approved-responsible-vendor-program-providers',
  'https://www.listennotes.com/podcasts/seed-to-sound/episode-2-colorado-badged-R6JEiGH-2SQ/'
]) assert.ok(html.includes(required), `Missing required link: ${required}`);

for (const color of ['#000000', '#FFFFFF', '#959699', '#585858', '#79C646', '#48A208']) {
  assert.ok(css.includes(color), `Missing approved palette color: ${color}`);
}
assert.doesNotMatch(css, /#(?:d46f3c|f5b28b|f8f1e8)/i);
console.log(`CBN checks passed: ${hrefs.length} external links, approved palette, required content, and accessibility structure.`);

const socialImage = 'https://hayleyw7.github.io/colorado-badged-network/assets/cbn-social-preview.png';
assert.ok(html.includes('<link rel="canonical" href="https://www.coloradobadgednetwork.com/"'));
assert.ok(html.includes('<meta property="og:url" content="https://www.coloradobadgednetwork.com/"'));
assert.ok(html.includes(`<meta property="og:image" content="${socialImage}"`));
assert.ok(html.includes(`<meta name="twitter:image" content="${socialImage}"`));
assert.match(html, /name="twitter:card" content="summary_large_image"/);
const socialPng = readFileSync('assets/cbn-social-preview.png');
assert.equal(socialPng.readUInt32BE(16), 1200);
assert.equal(socialPng.readUInt32BE(20), 630);
assert.match(html, /property="og:image:width" content="1200"/);
assert.match(html, /property="og:image:height" content="630"/);
console.log('Social preview image and canonical metadata checks passed.');

const description = 'The Colorado cannabis industry organization for networking, hiring, compliance, events, and more.';
for (const attribute of ['name="description"', 'property="og:description"', 'name="twitter:description"']) {
  assert.ok(html.includes(`<meta ${attribute} content="${description}"`));
}
for (const attribute of ['property="og:title"', 'name="twitter:title"']) {
  assert.ok(html.includes(`<meta ${attribute} content="Colorado Badged Network"`));
}
console.log('Approved social titles and descriptions match.');
