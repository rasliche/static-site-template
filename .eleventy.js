const gitlog = require('gitlog').default
const { DateTime } = require("luxon")

module.exports = function(eleventyConfig) {
  eleventyConfig.setDataDeepMerge(true);
  
  // addPassthroughCopy strips the `dir.input` directory and replaces with `_site`
  eleventyConfig.addPassthroughCopy("src/site/.well-known/brave-rewards-verification.txt");
  eleventyConfig.addPassthroughCopy("src/site/css/*.css");
  eleventyConfig.addPassthroughCopy("src/site/js/*.js");
  eleventyConfig.addPassthroughCopy("src/site/assets/*");
  eleventyConfig.addPassthroughCopy("src/site/service-worker.js");

  // filters
  // Add a friendly date filter to nunjucks.
  // Defaults to format of LLLL d, y unless an
  // alternate is passed as a parameter.
  // {{ date | friendlyDate('OPTIONAL FORMAT STRING') }}
  // List of supported tokens: https://moment.github.io/luxon/docs/manual/formatting.html#table-of-tokens  
  eleventyConfig.addFilter("dateDisplay", (dateObj, format = "LLL d, y") => {
    return DateTime.fromJSDate(dateObj, {
        zone: "utc"
      }).toFormat(format)
  })

  // shortcodes
  // changelog
  eleventyConfig.addNunjucksShortcode("changelog", ({filePath}) => {
    // First we remove "./" from filePath
    // This leaves us with the format "posts/2020/file.md"
    let relPath = filePath.slice(2);
    // Limit logs to 20, only fetch commit message and date
    const options = {
      repo: __dirname,
      number: 20,
      fields: ["subject", "authorDate"],
      file: relPath
    };
    // Here's where the magic happens!
    // We pass our params into gitlog, and it handles the rest
    let commits = gitlog(options);
    // Now we need to loop through the commits, and create our HTML.
    // I use a list and a <details> element here,
    // but you could use whatever markup you want!
    let html = "<details><summary>Changelog</summary><ul>";
    for (let i=0; i<commits.length;i++) {
      // Convert the git date to ISO
      let isoDate = commits[i].authorDate.slice(0,10);
      // Convert ISO to readable date e.g. "May 05 2020"
      let readableDate = DateTime.fromISO(isoDate).toFormat('LLLL dd yyyy');
      html += `<li><time datetime="${isoDate}">${readableDate}</time> ${commits[i].subject}</li>`;
    }
    html += "</ul></details>";
    return html;
  });

  return {
    dir: {
      input: "src/site",
      templateFormats : ["njk", "md", "11ty.js"],
      markdownTemplateEngine : "njk",
    }
  };
};