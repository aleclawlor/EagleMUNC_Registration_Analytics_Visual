// update information on right side of grid
const plotPercentages = (regObject, totalCount) => {

    document.querySelector('#delegationCountTotal').innerHTML = totalCount    

    document.querySelector('#early').innerHTML = Math.round(regObject.early.delegateCount / totalCount * 100)
    document.querySelector('#regular').innerHTML = Math.round(regObject.regular.delegateCount / totalCount * 100)
    document.querySelector('#late').innerHTML = Math.round(regObject.late.delegateCount /totalCount * 100)

}

// plot a key for the grid visual 
const plotGridKey = () => {

    const width = 200
    const height = 400

    // create a legend based on registration period 
    const keys = ['Early', 'Regular', 'Late']
    const colorScale = d3.scaleOrdinal()
        .domain(keys)
        .range(['#cc9a1e', '#024376', '#4a5b70'])

    const keySvg = d3.select('#gridKey')
        .append('svg')
        .attr('width', width)
        .attr('height', height)
        .append('g')

    // append legend title
    keySvg.append('text')
        .attr('y', 40)
        .attr('x', 0)
        .attr('font-weight', 'bold')
        .attr('font-size', '16px')
        .text('Registration Periods')

    // append legend dots 
    keySvg.selectAll('mydots')
        .data(keys)
        .enter()
        .append('circle')
            .attr('cx', (d, i) => 10)
            .attr('cy', (d, i) => 40*i + 80)
            .attr('r', 7)
            .style('fill', (d, i) => colorScale(i))

    // append legend markers to svg 
    keySvg.selectAll('myLabels')
        .data(keys)
        .enter()
        .append('text')
        .attr('x', (d, i) => 30)
        .attr('y', (d, i) => 40*i + 80)
        .text(d => d)
        .attr("text-anchor", "left")
        .style("alignment-baseline", "middle")

}

// plots a grid containing data of students registered by registration type 
const plotRegistrationGrid = () => {

    Promise.all(
        [d3.csv('./data/e8.csv')]
    ).then(data => {

        // clear svg area 
        d3.select('#registrationGrid')
            .selectAll('svg')
            .remove()

        // d3 margin convention
        const margin = {
            top: 50,
            right: 50, 
            bottom: 50,
            left: 50
        }

        const width = 700 - margin.left - margin.right
        const height = 700 - margin.top - margin.bottom

        const svg = d3.select('#registrationGrid')
            .append('svg')
            .attr('width', width)
            .attr('height', height)

        // create grid scales
        const xScale = d3.scaleLinear()
            .domain([0, 20])
            .range([0, width])

        const xAxis = d3.axisBottom(xScale)
            .ticks(30)
            .tickSize(height)
            .tickPadding(8-height)
            .tickFormat('')
            .tickValues([])

        const yScale = d3.scaleLinear()
            .domain([0, 40])
            .range([height, 0])

        const yAxis = d3.axisRight(yScale)
            .ticks(30)
            .tickSize(width)
            .tickPadding(8 - height)
            .tickFormat('')
            .tickValues([])

        const xGroup = svg.append('g')
            .call(xAxis)

        const yGroup = svg.append('g')
            .call(yAxis)

        svg.selectAll('.domain')
        .attr('opacity', 0)

        // work with data to get an object containing data by registration period 
        regData = {
            'early': {
                delegateCount: 0
            },
            'regular': {
                delegateCount: 0
            },
            'late': {
                delegateCount: 0
            }
        }

        let totalDelegateCount = 0
        const regDataTotal = data[0]
        regDataTotal.forEach(d => {

            const month = d.RegistrationDate.split('/')[0]
            if (month >= 5 && month <= 7){
                regData.early.delegateCount += Number(d.DelegateCount)
            }
            else if (month >= 8 && month <= 12){
                regData.regular.delegateCount += Number(d.DelegateCount)
            } else {
                regData.late.delegateCount += Number(d.DelegateCount)
            }

            totalDelegateCount += Number(d.DelegateCount)
        })

        plotPercentages(regData, totalDelegateCount)

        let xCounter = 0
        let yCounter = 0
        let gridCoords = []
        // create grid points for each object 
        Object.keys(regData).forEach(key => {
            const count = regData[key].delegateCount
            for(let i=0; i < count; i++){
                gridCoords.push({
                    'regPeriod': key,
                    'x': xCounter % 20,
                    'y':  Math.floor(yCounter/20)
                })
                xCounter += 1
                yCounter += 1
            }
        })
        
        svg.selectAll('.rectangle')
            .data(gridCoords)
            .enter()
            .append('rect')
                .attr('class', 'rectangle')
                .attr('x', (d, i) => xScale(d.x) + 2)
                .attr('y', (d, i) => yScale(d.y) + 2)
                .attr('width', 12)
                .attr('height', 12)
                .attr('fill', 'red')
                .attr('fill', d => {
                    if(d.regPeriod === 'early'){
                        return '#cc9a1e' 
                    } else if (d.regPeriod === 'regular'){
                        return '#024376'
                    } else{
                        return '#4a5b70'
                    }
                })
                .attr('transform', 'translate(0, -15)')
                .attr('border-radius', '20px')
    })

    plotGridKey()

}

plotRegistrationGrid()