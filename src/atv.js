// Configuração inicial da visualização com zoom
function setupViewport() {
    const container = d3.select("body")
        .append("div")
        .attr("id", "viewport-container")
        .style("width", "100vw")
        .style("height", "100vh")
        .style("overflow", "hidden")
        .style("position", "relative")
        .style("background-color", "#f0f0f0");
    
    const viewport = container.append("div")
        .attr("id", "zoom-viewport")
        .style("width", "100%")
        .style("height", "100%")
        .style("position", "absolute")
        .style("top", "0")
        .style("left", "0")
        .style("transform-origin", "0 0");
    
    const zoom = d3.zoom()
        .scaleExtent([0.5, 3])
        .on("zoom", (event) => {
            viewport.style("transform", `translate(${event.transform.x}px, ${event.transform.y}px) scale(${event.transform.k})`);
        });
    
    container.call(zoom)
        .call(zoom.transform, d3.zoomIdentity);
    
    return viewport;
}

document.addEventListener("DOMContentLoaded", function() {
    const viewport = setupViewport();
    
    // Carrega o SVG e as posições em paralelo
    Promise.all([
        d3.xml("assets/monstro.svg"),
        d3.json("src/posicoes.json")
    ]).then(([svgData, positions]) => {
        const importedNode = document.importNode(svgData.documentElement, true);
        const svg = viewport.node().appendChild(importedNode);
        
        const svgElement = d3.select(svg)
            .attr("width", 400)
            .attr("height", 400)
            .attr("id", "monstro-svg")
            .style("cursor", "grab")
            .style("position", "absolute");
        
        let posX = window.innerWidth / 2;
        let posY = window.innerHeight / 2;
        let currentPositionIndex = 0;
        
        svgElement.style("transform", `translate(${posX}px, ${posY}px)`);
        
        function moverMonstro() {
            const position = positions[currentPositionIndex];
            currentPositionIndex = (currentPositionIndex + 1) % positions.length;
            
            const novoPosX = position.x;
            const novoPosY = position.y;
            
            svgElement.transition()
                .duration(1000)
                .ease(d3.easeBounce)
                .style("transform", `translate(${novoPosX}px, ${novoPosY}px)`)
                .on("end", function() {
                    posX = novoPosX;
                    posY = novoPosY;
                });
        }
        
        const drag = d3.drag()
            .on("start", function(event) {
                svgElement.interrupt();
                svgElement.style("cursor", "grabbing");
                event.sourceEvent.stopPropagation();
            })
            .on("drag", function(event) {
                posX += event.dx;
                posY += event.dy;
                svgElement.style("transform", `translate(${posX}px, ${posY}px)`);
            })
            .on("end", function() {
                svgElement.style("cursor", "grab");
            });
        
        svgElement.call(drag);
        
        svgElement.on("dblclick", function(event) {
            event.preventDefault();
            event.stopPropagation();
            moverMonstro();
        });
    });
});