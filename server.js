require("dotenv").config();
const PORT = process.env.PORT || 3001;
const DEFAULT_NUM_ROWS = process.env.DEFAULT_NUM_ROWS || 25;
const USE_KEMENDAGRI = process.env.USE_KEMENDAGRI || true;
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

const dataWilayah = require("./wilayah.json").VW_RG_WILAYAH;
const dataKpp = require("./KPP.json").RF_KPP;

server.get("/pajak/wilayah", function searchByKeyword(req, res, next) {
  const keyword = req.query.q || false;
  const page = req.query.page || 1;
  let result = dataWilayah;
  let startOffset = (page - 1) * DEFAULT_NUM_ROWS;
  let endOffset = startOffset + DEFAULT_NUM_ROWS;

  if (keyword)
    result = dataWilayah.filter((row) => {
      const _keyword = keyword ? keyword.toUpperCase() : "";

      return (
        row["NM_KELURAHAN"].includes(_keyword) ||
        row["NM_KECAMATAN"].includes(_keyword) ||
        row["NM_DATI2"].includes(_keyword) ||
        row["NM_DATI1"].includes(_keyword) ||
        (USE_KEMENDAGRI
          ? row["KD_WIL_KEMENDAGRI"] &&
            row["KD_WIL_KEMENDAGRI"].includes(_keyword)
          : row["KD_WIL"].includes(_keyword))
      );
    });

  if (result.length) {
    result = result.map((row) => {
      const kppFound = dataKpp.filter((kpp) => kpp.RF_KD_KPP == row.KD_KPP);
      console.log(row.KD_KPP, kppFound);
      return {
        ...row,
        NM_KPP: kppFound && kppFound[0].RF_NM_KPP,
      };
    });
  }

  res.jsend.success({
    result: result.slice(startOffset, endOffset),
    totalCount: result.length,
    page,
  });
});

server.listen(PORT, (err, address) => {
  if (err) {
    console.log(err);
    process.exit(1);
  }

  console.log(`Server running at port ${PORT}`);
});
