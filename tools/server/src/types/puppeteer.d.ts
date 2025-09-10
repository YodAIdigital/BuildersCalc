// Minimal stub so TS can resolve `import('puppeteer')` without the package installed.
// Runtime behavior is unchanged; dynamic import will fail at runtime and the
// route returns HTTP 501 as designed.
declare module 'puppeteer';
