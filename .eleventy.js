module.exports = function(eleventyConfig) {
  // eleventyConfig.addPassthroughCopy("src/css");
  eleventyConfig.addPassthroughCopy("src/site/js");
  eleventyConfig.addFilter("dateDisplay", require("./src/utils/filters/date.js"));

  return {
    dir: {
      input: "src/site",
      templateFormats : ["njk", "md", "11ty.js"],
      markdownTemplateEngine : "njk",
    }
  };
};