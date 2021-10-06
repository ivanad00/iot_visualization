const express = require("express");
const cors = require("cors");
const axios = require("axios");
const { InfluxDB, flux } = require("@influxdata/influxdb-client");
const { BucketsAPI } = require("@influxdata/influxdb-client-apis");

const baseURL = process.env.INFLUX_URL 
const influxToken = process.env.INFLUX_TOKEN; 
const orgID = process.env.ORG_ID 
const bucket = process.env.BUCKET_NAME 

const influxDB = new InfluxDB({ url: baseURL, token: influxToken });
const queryApi = influxDB.getQueryApi(orgID);
const bucketsAPI = new BucketsAPI(influxDB);
const influxProxy = axios.create({
  baseURL,
  headers: {
    Authorization: `Token ${influxToken}`,
    "Content-Type": "application/json",
  },
});

const dataQuery = `
from(bucket: "${bucket}")
  |>  range(start: -5d)
  |> filter(fn: (r) => r["_measurement"] == "mqtt_consumer")
  |> filter(fn: (r) => r["_field"] == "decoded_payload_air_temperature_value")
  |> filter(fn: (r) => r["host"] == "IVANA")
  |> filter(fn: (r) => r["topic"] == "v3/sensor-indoor-ambiance@ttn/devices/sensor-indoor-ambiance4/up" )
  |> aggregateWindow(every: 60s, fn: min, createEmpty: false)
  |> yield(name: "mean")
`;

const airQuality = `
from(bucket: "${bucket}")
  |> range(start:-5d)
 |> filter(fn: (r) => r["_measurement"] == "mqtt_consumer")
  |> filter(fn: (r) => r["_field"] == "decoded_payload_air_humidity_value")
  |> filter(fn: (r) => r["host"] == "IVANA")
  |> filter(fn: (r) => r["topic"] == "v3/sensor-indoor-ambiance@ttn/devices/sensor-indoor-ambiance1/up")
  |> aggregateWindow(every: 60s, fn: min, createEmpty: false)
  |> yield(name: "mean")`;

const co2 = `
from(bucket: "${bucket}")
  |> range(start:-5d)
  |> filter(fn: (r) => r["_measurement"] == "mqtt_consumer")
  |> filter(fn: (r) => r["_field"] == "decoded_payload_co2_concentration_value")
  |> filter(fn: (r) => r["host"] == "IVANA")
  |> filter(fn: (r) => r["topic"] == "v3/sensor-indoor-ambiance@ttn/devices/sensor-indoor-ambiance1/up")
  |> aggregateWindow(every: 60s, fn: min, createEmpty: false)
  |> yield(name: "mean")
`;

const barometricPressure = `
from(bucket: "${bucket}")
  |> range(start:-3d)
  |> filter(fn: (r) => r["_field"] == "decoded_payload_barometric_pressure_value")
  |> filter(fn: (r) => r["host"] == "IVANA")
  |> filter(fn: (r) => r["topic"] == "v3/sensor-indoor-ambiance@ttn/devices/sensor-indoor-ambiance1/up")
  |> aggregateWindow(every: 60s, fn: min, createEmpty: false)
  |> yield(name: "mean")
  `;

const app = express();
app.use(cors());
const port = 3001;

app.get("/buckets", (req, res) => {
  getBuckets().then((b) => res.end(JSON.stringify(b)));
});

app.get("/client/temp/1", (req, res) => {
  let csv = "";
  let clientQuery = flux`` + dataQuery;
  queryApi.queryLines(clientQuery, {
    next(line) {
      csv = `${csv}${line}\n`;
    },
    error(error) {
      console.error(error);
      console.log("\nFinished /client/temp/1 ERROR");
      console.log(csv, clientQuery);
      res.end();
    },
    complete() {
      console.log("\nFinished /client/temp/1 SUCCESS");
      res.end(JSON.stringify({ csv }));
    },
  });
});

app.get("/client/air/1", (req, res) => {
  let csv = "";
  let clientQuery = flux`` + airQuality;
  queryApi.queryLines(clientQuery, {
    next(line) {
      csv = `${csv}${line}\n`;
    },
    error(error) {
      console.error(error);
      console.log("\nFinished /client/air/1 ERROR");
      console.log(csv, clientQuery);
      res.end();
    },
    complete() {
      console.log("\nFinished /client/air/1 SUCCESS");
      res.end(JSON.stringify({ csv }));
    },
  });
});

app.get("/client/co2/1", (req, res) => {
  let csv = "";
  let clientQuery = flux`` + co2;
  queryApi.queryLines(clientQuery, {
    next(line) {
      csv = `${csv}${line}\n`;
    },
    error(error) {
      console.error(error);
      console.log("\nFinished /client/co2/1 ERROR");
      console.log(csv, clientQuery);
      res.end();
    },
    complete() {
      console.log("\nFinished /client/co2/1 SUCCESS");
      res.end(JSON.stringify({ csv }));
    },
  });
});

app.get("/client/bar/1", (req, res) => {
  let csv = "";
  let clientQuery = flux`` + barometricPressure;
  queryApi.queryLines(clientQuery, {
    next(line) {
      csv = `${csv}${line}\n`;
    },
    error(error) {
      console.error(error);
      console.log("\nFinished /client/bar/1 ERROR");
      console.log(csv, clientQuery);
      res.end();
    },
    complete() {
      console.log("\nFinished /client/bar/1 SUCCESS");
      res.end(JSON.stringify({ csv }));
    },
  });
});

app.get("/api", (req, res) => {
  let apiQuery = dataQuery.trim();
  console.log(apiQuery);
  influxProxy
    .request({
      method: "post",
      url: "api/v2/query",
      params: {
        orgID,
      },
      data: {
        query: apiQuery,
        extern: {
          type: "File",
          package: null,
          imports: null,
          body: [
            {
              type: "OptionStatement",
              assignment: {
                type: "VariableAssignment",
                id: { type: "Identifier", name: "v" },
                init: {
                  type: "ObjectExpression",
                  properties: [
                    {
                      type: "Property",
                      key: { type: "Identifier", name: "bucket" },
                      value: { type: "StringLiteral", value: "telegraf" },
                    },
                    {
                      type: "Property",
                      key: { type: "Identifier", name: "timeRangeStart" },
                      value: {
                        type: "UnaryExpression",
                        operator: "-",
                        argument: {
                          type: "DurationLiteral",
                          values: [{ magnitude: 1, unit: "h" }],
                        },
                      },
                    },
                    {
                      type: "Property",
                      key: { type: "Identifier", name: "timeRangeStop" },
                      value: {
                        type: "CallExpression",
                        callee: { type: "Identifier", name: "now" },
                      },
                    },
                    {
                      type: "Property",
                      key: { type: "Identifier", name: "windowPeriod" },
                      value: {
                        type: "DurationLiteral",
                        values: [{ magnitude: 10000, unit: "ms" }],
                      },
                    },
                  ],
                },
              },
            },
          ],
        },
        dialect: { annotations: ["group", "datatype", "default"] },
      },
    })
    .then((response) => {
      console.log("\nFinished /api SUCCESS");
      res.send(JSON.stringify({ csv: response.data }));
    })
    .catch((error) => {
      console.log(error);
      console.log("\nFinished /api ERROR");
      res.send(error.message);
    });
});

app.listen(port, () => {
  console.log(`listening on port :${port}`);
});

async function getBuckets() {
  return await bucketsAPI.getBuckets({ orgID });
}
