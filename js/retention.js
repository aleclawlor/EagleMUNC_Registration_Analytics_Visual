const retentionChartColors = ['#024376', 'rgba(0, 0, 0, .06)']
const compareChartColors = ['#cc9a1e', '#024376']

// generate data for when we are filtering by schools by first visit 
const createFirstVisitData = (attendance) => {

    const conferenceNames = ['e3', 'e4', 'e5', 'e6', 'e7']

        let firstConferences = []
        attendance.forEach(schoolObj => {
            let firstVisit
            let secondVisit 
            for(let i = 0; i < 4; i++){
                if(schoolObj[conferenceNames[i]] == 'x'){
                    firstVisit = conferenceNames[i]
                    secondVisit = conferenceNames[i+1]
                    break
                } 
            }
            firstConferences.push({...schoolObj, School: schoolObj.School, firstConf: firstVisit, secondConf: secondVisit})
        })

        let firstVisitRetention = []

        // create data object containing retention for first visit schools by conference
        conferenceNames.forEach((conference, i) => {

            // we break out of the condition for e8 since we don't have the data but need e7 in the list 
            if(i == 4){return}

            const contextObj = firstConferences.filter(d => {
                return d.firstConf === conference
            })

            let returned = 0
            let total = contextObj.length
            contextObj.forEach(d => {
                const nextConf = conferenceNames[i+1]
                if(d[nextConf] === 'x'){
                    returned += 1
                }
            })
            
            const percentRet = Math.floor(returned/total*100) 

            firstVisitRetention.push({
                conference: conference,
                delegatesTotal: '1', 
                schoolRetention: percentRet.toString()
            })
        })

        return firstVisitRetention

}

// create a legend for the retention visual 
const drawRetentionKey = () => {

    const width = 300
    const height = 400 

    // remove what's currently in the key area (for if we switched)
    d3.select('#retentionKey')
        .selectAll('svg')
        .remove()

    const keys = ['Returned the next year', 'Did not return the next year']
    const colorScale = d3.scaleOrdinal()
        .domain(keys)
        .range(retentionChartColors)

    const keySvg = d3.select('#retentionKey')
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
        .text('Retention Categories')

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

// draw the key for when we compare first time versus 
const drawCompareKey = () => {

    const width = 300
    const height = 400 

    // remove what's currently in the key area (for if we switched)
    d3.select('#retentionKey')
        .selectAll('svg')
        .remove()

    const keys = ['First-Time Attendees', 'All Attendees']
    const colorScale = d3.scaleOrdinal()
        .domain(keys)
        .range(compareChartColors)

    const keySvg = d3.select('#retentionKey')
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
        .text('Retention Categories')

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

// create a stacked bar chart showing retention
const drawRetentionChart = (context) => {

    Promise.all([
        d3.csv('./data/retention.csv'),
        d3.csv('./data/attendance.csv')
    ]).then(data => {
        
        let retentionDataTotal = data[0]
        let attendance = data[1]

        // remove svg elements from retention chart area for updating
        d3.select('#retentionChart')
            .selectAll('svg')
            .remove()

        const margin = {
            top: 80,
            left: 20,
            right: 20,
            bottom: 20
        }

        const height = 600 - margin.top - margin.bottom
        const width = 720 - margin.left - margin.right

        const svg = d3.select('#retentionChart')
            .append('svg')
            .attr('height', height + margin.left + margin.right)
            .attr('width', width + margin.top + margin.bottom)

        // create x-axis
        const xScale = d3.scaleBand()
            .domain([0, 1, 2, 3, 4])
            .range([0, width])

        const xLabels = ['EIII', 'EIV', 'EV', 'EVI', 'EVII']

        const xGroup = d3.axisBottom(xScale)
            .tickFormat((d, i) => xLabels[i])
            .ticks(4)

        const xAxis = svg.append('g')
            .call(xGroup)
            .attr("transform",`translate(${margin.left + 40},${height})`)

        // add x-axis label 
        svg.append('text')
            .attr('transform', `translate(${width/2}, ${height + margin.top - 40})`)
            .style('text-anchor', 'middle')
            .text('Conference')

        // create a y-axis label 
        const yScale = d3.scaleLinear()
            .domain([100, 0])
            .range([0, height-margin.top])

        const yGroup  = d3.axisLeft(yScale)
            .ticks(10)

        const yAxis = svg.append('g')
            .call(yGroup)
            .attr('transform', `translate(60, ${margin.top})`)

        // append a label to y-axis
        svg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - margin.left + 20)
            .attr("x", 0 - (height / 2))
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .text("Percentage Retention (%)"); 

        // determine which data to plot 
        const retentionToPlot = (context === 'allSchools') ? retentionDataTotal : (context === 'firstVisit') ? createFirstVisitData(attendance) : null

        const stackData = []
        retentionToPlot.forEach(d => {
            if (d.schoolRetention != "" && d.delegateRetention != ""){
                stackData.push({
                    'conference': d.conference,
                    'percentReturned': Number(d.schoolRetention),
                    'percentNotReturned': 100 - Number(d.schoolRetention)
                })
            }
        })
        
        // layer data so we can visualize it stacked
        const stackGenerator = d3.stack()
            .keys(['percentReturned', 'percentNotReturned'])

        const stackedSeries = stackGenerator(stackData)

        const colorScale = d3.scaleOrdinal()
            .domain(['percentReturned', 'percentNotReturned'])
            .range(retentionChartColors)
        
        // create groups for each series 
        const sel = svg.select('g')
            .selectAll('g.series')
            .data(stackedSeries)
            .join('g')
            .classed('series', true)
            .style('fill', d => colorScale(d))

        // for each series create a rectangle for each conference
        sel.selectAll('rect')
            .data(d => d)
            .join('rect')
            .attr('width', 70)
            .attr('x', (d, i) => xScale(i) - 20)
            .attr('y', d => yScale(d[1]) - height - margin.top)
            .attr('height', d => yScale(d[0]) - yScale(d[1]))
            .attr('transform', `translate(55, 160)`)
        
        sel.selectAll('circle')
            .data(stackedSeries[0])
            .join('circle')
            .attr('r', 8)
            .attr('cx', (d, i) => xScale(i) + 69)
            .attr('cy',  d => yScale(d[1]) - height + margin.top + 1)
            .attr('fill', '#cc9a1e')

        drawRetentionKey()

    })
}


const drawCompareChart = () => {

    Promise.all([
        d3.csv('./data/retention.csv'),
        d3.csv('./data/attendance.csv')
    ]).then(data => {
        
        let retentionDataTotal = data[0]
        let firstTimeAttendance = data[1]
        firstTimeAttendance = createFirstVisitData(firstTimeAttendance)

        // remove svg elements from retention chart area for updating
        d3.select('#retentionChart')
            .selectAll('svg')
            .remove()

        const margin = {
            top: 80,
            left: 20,
            right: 20,
            bottom: 20
        }

        const height = 600 - margin.top - margin.bottom
        const width = 720 - margin.left - margin.right

        const svg = d3.select('#retentionChart')
            .append('svg')
            .attr('height', height + margin.left + margin.right)
            .attr('width', width + margin.top + margin.bottom)

        // create x-axis
        const xScale = d3.scaleBand()
            .domain([0, 1, 2, 3, 4])
            .range([0, width])

        const xLabels = ['EIII', 'EIV', 'EV', 'EVI', 'EVII']

        const xGroup = d3.axisBottom(xScale)
            .tickFormat((d, i) => xLabels[i])
            .ticks(4)

        const xAxis = svg.append('g')
            .call(xGroup)
            .attr("transform",`translate(${margin.left + 40},${height})`)

        // add x-axis label 
        svg.append('text')
            .attr('transform', `translate(${width/2}, ${height + margin.top - 40})`)
            .style('text-anchor', 'middle')
            .text('Conference')

        // create a y-axis label 
        const yScale = d3.scaleLinear()
            .domain([100, 0])
            .range([0, height-margin.top])

        const yGroup  = d3.axisLeft(yScale)
            .ticks(10)

        const yAxis = svg.append('g')
            .call(yGroup)
            .attr('transform', `translate(60, ${margin.top})`)

        // append a label to y-axis
        svg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - margin.left + 20)
            .attr("x", 0 - (height / 2))
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .text("Percentage Retention (%)"); 

        console.log(retentionDataTotal)
        console.log(firstTimeAttendance)

        // draw rectangles for first Time attendance
        svg.selectAll('.bar')
            .data(firstTimeAttendance)
            .enter()
            .append('rect')
                .attr('class', 'bar')
                .attr('x', (d, i) => xScale(i) + 90)
                .attr('y', (d, i) => yScale(Number(d.schoolRetention)))
                .attr('width', 35)
                .attr('height', d => height - yScale(Number(d.schoolRetention)))
                .attr('fill', compareChartColors[0])


        retentionDataTotal = retentionDataTotal.filter(d => {
            return ['E3', 'E4', 'E5', 'E6', 'E7'].includes(d.conference)
        })
        // draw rectangles for total attendance
        svg.selectAll('.barTotal')
            .data(retentionDataTotal)
            .enter()
            .append('rect')
                .attr('class', 'baTotalr')
                .attr('x', (d, i) => xScale(i) + 130)
                .attr('y', (d, i) => yScale(Number(d.schoolRetention)))
                .attr('width', 35)
                .attr('height', d => height - yScale(Number(d.schoolRetention)))
                .attr('fill', compareChartColors[1])
        
        // // create groups for each series 
        // const sel = svg.select('g')
        //     .selectAll('g.series')
        //     .data(stackedSeries)
        //     .join('g')
        //     .classed('series', true)
        //     .style('fill', d => colorScale(d))

        // // for each series create a rectangle for each conference
        // sel.selectAll('rect')
        //     .data(d => d)
        //     .join('rect')
        //     .attr('width', 70)
        //     .attr('x', (d, i) => xScale(i) - 20)
        //     .attr('y', d => yScale(d[1]) - height - margin.top)
        //     .attr('height', d => yScale(d[0]) - yScale(d[1]))
        //     .attr('transform', `translate(55, 160)`)
    })
}



drawRetentionChart('allSchools')

// handle button changes
document.querySelector('#allSchoolsSort').addEventListener('mousedown', e => {
    document.querySelector('#retentionInfo').innerHTML = 'Currently showing retention data for all schools involved (per conference)'
    drawRetentionChart('allSchools')
})

document.querySelector('#firstVisitSort').addEventListener('mousedown', e => {
    document.querySelector('#retentionInfo').innerHTML = 'Currently showing retention data for first-time attendees (per conference)'
    drawRetentionChart('firstVisit')
})

document.querySelector('#compareRetention').addEventListener('mousedown', e => {
    document.querySelector('#retentionInfo').innerHTML = 'Currently comparing first-time attendees versus all schools (per conference)'
    drawCompareKey()
    drawCompareChart()
})