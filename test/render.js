'use strict';

const path = require('path');
const expect = require('chai').expect;
const panini = require('../gulp');

describe('render()', () => {
  let file;

  before(done => {
    panini.create()('test/fixtures/basic', {quiet: true})
      .once('data', data => {
        file = data;
        done();
      })
      .on('error', done);
  });

  it.only('changes the extension of the file to .html', () => {
    expect(path.extname(file.path)).to.equal('.html');
  });

  it('applies pre-render transforms', done => {
    panini.create()('test/fixtures/transforms-pre', {
      quiet: true,
      transform: {
        '.md': ['gulp-markdown']
      }
    })
      .once('data', data => {
        expect(data.contents.toString()).to.contain('<h1');
        done();
      })
      .on('error', done);
  });

  it('applies post-render transforms', done => {
    panini.create()('test/fixtures/transforms-post', {
      quiet: true,
      transform: {
        '.hbs': {
          after: ['gulp-striphtml']
        }
      }
    })
      .once('data', data => {
        expect(data.contents.toString()).to.not.contain('<h1>');
        done();
      })
      .on('error', done);
  });

  it('catches Yaml errors', done => {
    panini.create()('test/fixtures/yaml-error', {
      quiet: true
    })
      .once('data', data => {
        expect(data.contents.toString()).to.contain('<!-- __PANINI_ERROR__ -->');
        done();
      })
      .on('error', done);
  });
});
