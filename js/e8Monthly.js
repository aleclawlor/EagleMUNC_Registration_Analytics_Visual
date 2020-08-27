const drawBarChart = () => {

    Promise.all([
        d3.csv('./data/e8.csv')
    ]).then(data => {

        // shape the registration date data to be easily used by d3 
        const dateRegisteredData = data[0]
            .map(d => d.RegistrationDate)
            .filter(d => d != '')

        const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
        let monthFrequencies = {}

        dateRegisteredData.forEach(d => {
            // get the month of the registered date and map to frequencies object 
            const index = d.split('/')[0]
            const month = months[index - 1]

            if(monthFrequencies[month]){
                monthFrequencies[month][0] += 1
            }   else monthFrequencies[month] = [1, index] 
        })

        // remove current data for adding different conferences in the future
        d3.select('#e8MonthlyTimeline')
            .selectAll('svg')
            .remove()

        // d3 margin convention for multiline chart
        const margin = {
            top: 20,
            right: 80, 
            bottom: 30,
            left: 50
        }

        const width = 800 - margin.left - margin.right
        const height = 450 - margin.top - margin.bottom

        // create D3 grouping
        const svg = d3.select('#e8MonthlyTimeline')
            .append('svg')
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)
            .append('g')
            .attr('transform', 'translate(50, 0)')
     
        // create a scale and labels for the x-axis
        const xScale = d3.scaleBand()
            .domain([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
            .range([0, width])

        const xLabels = ['May', 'June', 'July', 'August', 'September', 'October', 'November', 'December', 'January', 'February', 'March']

        const xAxisGenerator = d3.axisBottom(xScale)
            .tickFormat((d, i) => xLabels[i])

        const xAxis = svg.append('g')
            .call(xAxisGenerator)
            .attr("transform",`translate(${10},${height - 20})`)

        xAxis.selectAll('.tick')
            .attr('width', '1px')

        // appnd x-axis label
        svg.append('text')
            .attr('transform', `translate(${width/2}, ${height + margin.top + 20})`)
            .style('text-anchor', 'middle')
            .text('Month Registered')

        // create scale and label for y-axis
        const yScale = d3.scaleLinear()
            .domain([15, 0])
            .range([0, height-margin.top]) 

        const yAxisGenerator = d3.axisLeft(yScale)
            .ticks(10)

        const yAxis = svg.append('g')
            .call(yAxisGenerator)
            .attr('transform', 'translate(10, 0)')

         // append y-axis label
        // text label for the y axis
        svg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - margin.left)
            .attr("x", 0 - (height / 2))
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .text("Schools Registered"); 

        // create a legend based on registration period 
        const keys = ['Early', 'Regular', 'Late']
        const colorScale = d3.scaleOrdinal()
            .domain(keys)
            .range(['#cc9a1e', '#024376', '#4a5b70'])

        const keySvg = d3.select('#timelineKey')
            .append('svg')
            .attr('width', width + margin.left + margin.right)
            .attr('height', 400)
            .append('g')

        // append legend title
        keySvg.append('text')
            .attr('y', 80)
            .attr('x', 20)
            .attr('font-weight', 'bold')
            .attr('font-size', '16px')
            .text('Registration Periods')

        // append legend dots 
        keySvg.selectAll('mydots')
            .data(keys)
            .enter()
            .append('circle')
                .attr('cx', (d, i) => 40)
                .attr('cy', (d, i) => 50*i + 140)
                .attr('r', 10)
                .style('fill', (d, i) => colorScale(i))

        // append legend markers to svg 
        keySvg.selectAll('myLabels')
            .data(keys)
            .enter()
            .append('text')
            .attr('x', (d, i) => 70)
            .attr('y', (d, i) => 50*i + 140)
            .text(d => d)
            .attr("text-anchor", "left")
            .style("alignment-baseline", "middle")
        
        // create a list out of the frequencies per month 
        let values = Object.values(monthFrequencies)

        values = values.sort((a, b) => {
            return ((parseInt(a[1], 10) + 7) % 12) - ((parseInt(b[1], 10) + 7) % 12)
        })

        // plot bars for each month 
        svg.selectAll('.bar')
            .data(values)
            .enter()
            .append('rect')
                .attr('class', 'bar')
                .attr('transform', 'translate(13, -20)')
                .attr('x', (d, i) => {return xScale(i)})
                .attr('y', (d, i) => {return yScale(d[0]) + margin.top})
                .attr('width', xScale.bandwidth() - 5)
                .attr('height', d => {return height - yScale(d[0]) - margin.top})
                .attr('fill', d => {
                    if(d[1] >= 5 && d[1] <= 7){
                        return '#cc9a1e'
                    }
                    else if(d[1] >= 8 && d[1] <= 12){
                        return '#024376'
                    }
                    else{
                        return '#4a5b70'
                    }
                })
    })
}

// draw a dot matrix showing how many schools registered per period
// TODO: fix rendering issue
const drawDotMatrix = () => {

    Promise.all([
        d3.csv('./data/e8.csv')
    ]).then(data => {

        // remove current data for adding different conferences in the future
        d3.select('#e8RegistrationMatrix')
            .selectAll('svg')
            .remove()

        // d3 margin convention for multiline chart
        const margin = {
            top: 20,
            right: 80, 
            bottom: 30,
            left: 50
        }

        const width = 200 - margin.left - margin.right
        const height = 200 - margin.top - margin.bottom

        // Filter data 
        const matrixData = data[0]
            .map(d => d.RegistrationDate)
            .filter(d => d != '')
            .map(d => parseInt(d, 10))
            .sort((a, b) => (a+7) % 12 - (b+7) % 12)

        const svg = d3.select('#e8RegistrationMatrix')
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        // draw dot matrix dots 
        svg.selectAll('circle')
            .data(matrixData)
            .enter().append('circle')
                .style('fill', '#000')
                .style('stroke', '#333')
                .attr('cx', (d, i) => {return 10*i + 5})
                .attr('cy', (d, i) => {return 10*d + 5})
                .attr('r', 20)
                .style('fill', d => {
                    if(d >= 5 && d <= 7){
                        return '#cc9a1e'
                    }
                    else if(d >= 8 && d <= 12){
                        return '#024376'
                    }
                    else{
                        return '#4a5b70'
                    }
                })

    })

}

drawBarChart()
drawDotMatrix()