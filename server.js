const express = require("express");
const request = require("request-promise-native");

const format = require("./format.json");
const meteorMetricsUrl = process.env.METRICS_URL || false;

if (meteorMetricsUrl) {
  // return
  const app = express()
  console.info("Metrics scrapper started");
  app.get('/metrics', function (req, res) {
    return request(meteorMetricsUrl)
    .then(function (response){
      res.send(meteorJSON2Metrics(JSON.parse(response)));
      return true;
    }, function(err) {
      console.error("ERROR", Date());
      console.error(err);
      console.error("ERROR");
      res.send('');
      return "";
    })
    .catch(function(err){
      console.error("ERROR", Date());
      console.error(err);
      console.error("ERROR");
      res.send('');
    });
  })
  app.listen(9003)

} else {
  throw new Error("The env var METRICS_URLis required")
}

function meteorJSON2Metrics(jsonMetrics) {

  return Object.keys(jsonMetrics)
  .reduce((str, domainKey) => {
    console.log("Domain", domainKey);
    const currentFormat = format[domainKey];
    const currentDomain = jsonMetrics[domainKey];
    return Object.keys(currentDomain)
    .reduce(
      (acc, valueKey) => {
        console.log("-->", valueKey, currentDomain[valueKey]);
        return createMetric(`${domainKey}_${valueKey}`, currentFormat[valueKey], currentDomain[valueKey]).concat("\n", acc);
      }
      , ""
    )
    .concat("\n", str);

  }, "");
}

function createMetric(title, format, value) {
  switch(format.type) {
    case "number": return `# HELP ${title} ${format.label}\n# TYPE ${title} gauge\n${title} ${value}`;
    case "array":
      if (Object.keys(value).length > 0) {
        return Object.keys(value).reduce((str, itemKey) => {
          return `# HELP ${title}_${itemKey} gauge\n# TYPE ${title}_${itemKey} gauge\n${title}_${itemKey} ${value}\n${str}`;
        }, "")
      }
      return "";
    case "map": return ""; //@TODO: add handler for this metrics
    //case "Histogram" (Array)
  }
  console.log("////createMetric -> ", title);
  console.log(format);
  console.log(value);
  console.log("createMetric////");
  return "";
}
