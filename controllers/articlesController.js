const mongoose = require('mongoose');


exports.showAllArticles = async (req, res) => {
  res.render("articles", {title: "Все статьи"});
}

exports.balancerAssembly = async (req, res) => {
  res.render("./articles/balancer-assembly", {title: "Монтаж балансира"});
}