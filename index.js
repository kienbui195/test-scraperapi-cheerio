const { default: axios } = require("axios");
const cheerio = require("cheerio");
const dotenv = require("dotenv");
dotenv.config();

const URL =
  "https://www.homedepot.com/p/Home-Decorators-Collection-Foxridge-5-Piece-Aluminum-42-Round-Outdoor-Patio-Dining-Set-63993/319868153";

const crawlData = async (url) => {
  return await axios
    .get(`${process.env.SCRAPE_API_END_POINT}?api_key=${process.env.API_KEY}&url=${url}&autoparse=true`)
    .then((res) => res)
    .catch((err) => console.log(err));
};

const data = crawlData(URL);

data
  .then((res) => {
    const html = res.data.replace(/<style([\s\S]*?)<\/style>/g, " ");

    const $ = cheerio.load(html);

    const REGEX_ID = /\/(\d+)\/?$/;
    const REGEX_PRICE = /\$(\d+(\.\d{1,2})?)/;
    const REGEX_PERCENT = /\((\d+)%\)/;

    const urls = [];

    $("div.mediagallery__thumbnails img").each((idx, _i) => {
      const src = $(_i).attr("src");
      urls.push(src);
    });

    const data = {
      product_id: URL.match(REGEX_ID)[1] ?? "",
      product_title: $("div.product-details__badge-title--wrapper > span > h1")?.text() ?? "",
      // rating:
      //   +($("section#ratings-and-reviews-accordion-title > div > div > div > p")?.text()?.split(" ")[0] ?? 0) * 2 ?? 0,
      // price:
      //   +(
      //     $("div.price-detailed__was-price > span:nth-child(2) > span")?.text()?.match(REGEX_PRICE)[1] ??
      //     $("div.price-format__large price-format__main-price > span:nth-child(2)")?.text() +
      //       "." +
      //       $("div.price-format__large price-format__main-price > span.price-format__large-currency-symbols")?.text()
      //   ) ?? 0,
      // saving_price_info: $("div.price-detailed__was-price > div")?.text()?.match(REGEX_PERCENT)[1] ?? "",
      desc: $("div#product-overview-desktop-content > div > div > div")?.html() ?? "",
      media: urls,
    };

    console.log(data);
  })
  .catch((err) => {
    console.log(err);
  });
