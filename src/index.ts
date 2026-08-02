import { run } from './main.js';

// The bundler rewrites every module-identity global it can see, so an
// `is this the entry point?` guard inside main.ts cannot survive bundling.
// Keeping the invocation in a module that exists only to be the entry point
// leaves main.ts safe to import.
run();
