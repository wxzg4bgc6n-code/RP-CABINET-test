import { build } from 'esbuild';

await build({
  entryPoints:['client/proof-uploader.js'],
  bundle:true,
  minify:true,
  format:'iife',
  platform:'browser',
  target:['es2020'],
  outfile:'../js/vendor/vercel-blob-client.js',
  legalComments:'none'
});
