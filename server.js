const PORT = 3001;
const DEFAULT_NUM_ROWS = 25;
const USE_KEMENDAGRI = true;
const restify = require("restify");

const server = restify.createServer();

const cors = require("restify-cors-middleware")({
  origins: ["*"],
});

server.pre(cors.preflight);
server.use(cors.actual);

const jsend = require("jsend");
server.use(jsend.middleware);
server.use(restify.plugins.bodyParser());
server.use(restify.plugins.queryParser());

server.get("/search", function searchByKeyword(req, res, next) {
  const dataWilayah = require("./wilayah.json").VW_RG_WILAYAH;
  const keyword = req.query.q || false;
  let result = dataWilayah;
  if (keyword)
    result = dataWilayah.filter((row) => {
      return (
        row["NM_KELURAHAN"].includes(keyword) ||
        row["NM_KECAMATAN"].includes(keyword) ||
        row["NM_DATI2"].includes(keyword) ||
        row["NM_DATI1"].includes(keyword) ||
        (USE_KEMENDAGRI
          ? row["KD_WIL_KEMENDAGRI"] &&
            row["KD_WIL_KEMENDAGRI"].includes(keyword)
          : row["KD_WIL"].includes(keyword))
      );
    });

  res.jsend.success(result.slice(0, DEFAULT_NUM_ROWS));
});

server.listen(PORT, (err, address) => {
  if (err) {
    console.log(err);
    process.exit(1);
  }

  console.log(`Server running at port ${PORT}`);
});
