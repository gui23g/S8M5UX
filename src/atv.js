d3.xml("assets/monstro.svg").then((data) => {
    d3.select("body").node().appendChild(data.documentElement);
});
