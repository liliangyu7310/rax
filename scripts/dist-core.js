const rollup = require('rollup');
const resolve = require('rollup-plugin-node-resolve');
const babel = require('rollup-plugin-babel');
const uglify = require('rollup-plugin-uglify').uglify;
const replace = require('rollup-plugin-replace');
const filesize = require('rollup-plugin-filesize');
const commonjs = require('rollup-plugin-commonjs');
const string = require('./rollup-plugin-string');

async function build(packageName, { name, shouldMinify = false, format = 'umd' }) {
  const output = {
    name,
    exports: 'named',
    sourcemap: true
  };

  // For development
  const bundle = await rollup.rollup({
    input: './packages/' + packageName + '/src/index.js',
    plugins: [
      resolve(),
      string(),
      babel({
        exclude: [/vendors/], // only transpile our source code
        presets: [
          ['@babel/preset-env', {
            modules: false,
            loose: true,
            targets: {
              browsers: ['last 2 versions', 'IE >= 9']
            }
          }]
        ],
      }),
      commonjs({
        include: [/node_modules/, /vendors/],
      }),
      replace({
        'process.env.NODE_ENV': JSON.stringify('production'),
      }),
      shouldMinify ? uglify({
        compress: {
          loops: false,
          keep_fargs: false,
          unsafe: true,
          pure_getters: true
        }
      }) : null,
      filesize({
        render(options, bundle, { gzipSize, bundleSize }) {
          return `Built: ${bundle.file}, BundleSize: ${bundleSize}, Gzipped: ${gzipSize}.`;
        }
      }),
    ]
  });

  if (shouldMinify) {
    const file = `./packages/${packageName}/dist/${packageName}.min.js`;
    await bundle.write({
      ...output,
      format,
      file,
    });
  } else {
    const ext = format === 'esm' ? '.mjs' : '.js';
    await bundle.write({
      ...output,
      format,
      file: `./packages/${packageName}/dist/${packageName}${ext}`,
    });
  }
}

build('rax', { name: 'Rax' });
build('rax', { name: 'Rax', format: 'esm' });
build('rax', { name: 'Rax', shouldMinify: true });

build('driver-dom', { name: 'DriverDOM' });
build('driver-dom', { name: 'DriverDOM', format: 'esm' });
build('driver-dom', { name: 'DriverDOM', shouldMinify: true });

build('driver-worker', { name: 'DriverWorker' });
build('driver-worker', { name: 'DriverWorker', format: 'esm' });
build('driver-worker', { name: 'DriverWorker', shouldMinify: true });


build('miniapp-framework-native', { format: 'iife' });
build('miniapp-framework-native', { format: 'iife', shouldMinify: true });

build('miniapp-framework-native-renderer', { format: 'iife' });
build('miniapp-framework-native-renderer', { format: 'iife', shouldMinify: true });

build('rax-miniapp-renderer', { format: 'cjs' });
build('rax-miniapp-renderer', { format: 'cjs', shouldMinify: true });
