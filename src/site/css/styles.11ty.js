const fs = require('fs');
const path = require('path');
const postcss = require('postcss');

// the file name as an entry point for postcss compilation
// also used to define the output filename in our output /css folder.
const fileName = "styles.css";

module.exports = class {
  data () {
    const rawFilepath = path.join(__dirname, `/${fileName}`);
    return {
      permalink: `css/${fileName}`,
      rawFilepath,
      rawCss: fs.readFileSync(rawFilepath)
    };
  };

  async render ({ rawCss, rawFilepath }) {
    return await postcss([
        require('autoprefixer'),
        require('tailwindcss'),
    ])
    .process(rawCss, { from: rawFilepath })
    .then(result => {
      result.css
      console.log("processed successfully")
    });
  };
}