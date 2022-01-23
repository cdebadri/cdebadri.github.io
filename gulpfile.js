const { src, dest, series } = require('gulp');
const fs = require('fs');

const deleteWorker = done => {
  if (fs.existsSync('./service-worker.js')) {
    fs.unlinkSync('./service-worker.js');
  }
  done();
}

const writeTemp = (done) => {
  const dataToWrite = `\nvar CACHE_NAME = 'red-wings:${Date.now()}';`;
  fs.writeFileSync('./tmp/service-worker-temp.js', dataToWrite, { flag: 'a' });
  done();
}

const updateServiceWorkerBuild = () =>
  src('./service-worker-temp.js')
  .pipe(dest('./tmp/', {
    overwrite: true,
  }));

const copyBack = done => {
  fs.copyFileSync('./tmp/service-worker-temp.js', './service-worker.js');
  done();
}

// const updateServiceWorker = () =>
//   src('./build/service-worker.js')
//   .pipe(dest('./', {
//     overwrite: true,
//   }));

exports.default = series(deleteWorker, updateServiceWorkerBuild, writeTemp, copyBack);

