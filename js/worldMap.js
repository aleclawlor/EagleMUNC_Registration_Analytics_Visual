// load data necessary for draWing map 
Promise.all([
    d3.json('./data/countries.json'),
    d3.json('./data/unitedStates.json'),
    d3.json('./data/counties.json'),
    d3.csv('./data/registration.csv')
]).then( data => {
    
    // specify our data
    const countries = data[0].features 
    const unitedStates = data[1].features 
    const northeastCounties = data[2].features
    
    const registrationData = data[3]
    const countriesRegistered = registrationData.map(d => d.Country).filter(d => d != '')
    
    let currentScope = 'world'

    document.getElementById('worldButton').addEventListener('mousedown', e => {
        currentScope = 'world'
        drawMap(currentScope)
    })

    document.getElementById('unitedStatesButton').addEventListener('mousedown', e => {
        currentScope = 'unitedStates'
        drawMap(currentScope)
    })

    document.getElementById('northeastButton').addEventListener('mousedown', e => {
        currentScope = 'northeast'
        drawMap(currentScope)
    })


    drawMap = (scope) => {
        
        d3.select('#map')
            .selectAll('svg')
            .remove()

        let projection = (scope === 'world') ? d3.geoMercator().scale(90) : (scope === 'unitedStates') ? d3.geoMercator().scale(600) : d3.geoMercator().scale(600)
        let path = d3.geoPath().projection(projection) 

        let svg = d3.select('#map').append('svg')
            .attr('height', 400)
            .attr('width', 600)

        svg.selectAll('path')
            .append('g')
            .data((scope === 'world') ? countries : (scope === 'unitedStates') ? unitedStates : (scope === 'northeast') ? northeastCounties : null)
            .enter()
            .append('path')
            .attr('d', path)
            .attr('stroke', '#333')
            .attr('stroke-width', .5)
            .attr('fill', (d) => {
                name = d.properties.ADMIN
                if(scope === 'world' && (countriesRegistered.includes(name))){
                    return '#cc9a1e'
                }
                else{
                    // color if the country was not registered at Eaglemunc 8
                    return '#4a5b70'
                }
            })
            .attr('transform', () => (scope === 'unitedStates') ? 'translate(820, 400)' : (scope === 'world') ? 'translate(-200, 30)' : (scope === 'northeast') ? 'translate(820, 400)' : null )
    }


    drawDonutChart = (scope) => {
        
        const [width, height] = [400, 400]

        const dummy = [1, 2, 3, 4, 5]

        const colorScale = d3.scaleSequential()
            .domain([
                d3.min(dummy, d => d), 
                d3.max(dummy, d => d)
            ])
            .interpolator(d3.interpolateBlues)

        const arcs = d3.pie()
            .padAngle(.002)
            .sort(null)
            .value(d => {
                return d 
            })
            (dummy)
        
        let svg = d3.select('#donutChart').append('svg')
            .attr('height', 400)
            .attr('width', 400)
        
        const radius = Math.min(width, height) / 2.5
        const arc = d3.arc().innerRadius(radius * .78).outerRadius(radius - 1)
        
        svg.selectAll('path')
            .data(arcs)
            .join('path')
            .attr('fill', d => {
                return colorScale(d.value)
            })
            .attr('transform', 'translate(200, 200)')
            .attr('d', arc)
            .append('title')
            .text(d => d.toLocaleString())
    }

    // call the functions intially
    drawMap(currentScope)
    drawDonutChart(currentScope)

})

