// Below are helper functions used for shaping data to be used in the visual 

// create an object where each key is an eaglemunc conference and each value 
// is an object holding key-value pairs of schools and their delegate counts 
const createDelegateCountObj = (data) => {

    const delegationCounts = {e3: {}, e4: {}, e5: {}, e6: {}, e7: {}, e8: {}}

    for(let i = 1; i < 7; i++){
        data[i].forEach(d => {
            delegationCounts[`e${i+2}`][d.School] = parseInt(d['DelegateCount'], 10)
        })
    }
    return delegationCounts
}

const drawLineChart = (filterVal) => {

    Promise.all([
        d3.csv('./data/attendance.csv'),
        d3.csv('./data/e3.csv'),
        d3.csv('./data/e4.csv'),
        d3.csv('./data/e5.csv'),
        d3.csv('./data/e6.csv'),
        d3.csv('./data/e7.csv'),
        d3.csv('./data/e8.csv')
    ]).then(data => {

        let attendanceFilterVal = filterVal 

        d3.select('#eaglemuncRetention')
                    .selectAll('svg')
                    .remove()

        document.getElementById('retentionNumberSelection')
            .addEventListener('change', (e) => {
                drawLineChart(e.target.value)
            })
        

        // list with all schools that have attended EagleMUNC in the past and how many times they have attended 
        const allSchoolsAttendance = data[0].map(d => {
            d.Attendance = parseInt(d.Attendance, 10)
            return d
        })

        // filter the data to schools that have attended 4+ conferences
        const fourPlusConferences = allSchoolsAttendance.filter(d => {
            return d.Attendance >= 2
        })

        const delegationsObject = createDelegateCountObj(data)

        let filteredAttendance = allSchoolsAttendance.filter(d => {
            return d.Attendance == attendanceFilterVal
        })

        let schools = filteredAttendance.map(d => {
            return d.School
        })

        // initialize the data we actually want to plot 
        let plotData = []
        let delegateCounts = []
        let averages = []

        // iterate through the list of school names and get the delegation count for them 
        schools.forEach(schoolName => {

            let insertObj = {
                key: schoolName,
                values: []
            }
            
            totalCount = 0 
            // these are the only conferences we have data for; need index for translating to x axis domain 
            const conferenceNames = ['e3', 'e4', 'e5', 'e6', 'e7', 'e8']
            conferenceNames.forEach((conferenceName, i) => {

                const conferenceIdentifier = i 
                const delegateCount = parseInt(delegationsObject[conferenceName][schoolName], 10)

                if (!delegateCount){
                    return
                }

                totalCount += delegateCount

                // add delegate count to an a list so we can use the max value on our axis 
                delegateCounts.push(delegateCount)
                insertObj.values.push({conference: conferenceIdentifier, delegateCount: delegateCount})
            })
            totalCountAvg = totalCount / filterVal
            averages.push(totalCountAvg)

            plotData.push(insertObj)
        })

        const delegateSum = averages.reduce((a, b) => {
            return a + b
        }, 0)

        const avgDelegationTotal = 642
        const delegateTotalPercentage = Math.round((delegateSum / avgDelegationTotal) * 100)


        // update the paragraph on the right side of the page 
        document.getElementById('schoolCountSpan').innerHTML = filterVal
        document.getElementById('delegateCountSpan').innerHTML = Math.round(delegateSum / plotData.length)
        document.getElementById('percentageTotal').innerHTML = delegateTotalPercentage

        // d3 margin convention for multiline chart
        const margin = {
            top: 20,
            right: 80, 
            bottom: 30,
            left: 50
        }

        const width = 800 - margin.left - margin.right
        const height = 500 - margin.top - margin.bottom

        // create D3 grouping
        const svg = d3.select('#eaglemuncRetention')
            .append('svg')
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)
            .append('g')
            .attr('transform', 'translate(20, 0)')

        // create xAxis for line chart 
        const xScale = d3.scaleLinear()
            .domain([0, 5])
            .range([0, width])
        
        const xLabels = ['EIII', 'EIV', 'EV', 'EVI', 'EVII', 'EVIII']
        const xAxisGenerator = d3.axisBottom(xScale)
            .ticks(5)
            .tickSize(-height)
            .tickFormat((d, i) => xLabels[i])

        const xAxis = svg.append('g')
            .call(xAxisGenerator)
            .attr("transform",`translate(${10},${height - 20})`)

        xAxis.selectAll('.tick')
            .attr('width', '1px')
            .attr('stroke-width', '.5')
            .attr('stroke-dasharray', '5, 5')
            .attr('font-size', '16px')
        
        // appnd x-axis label
        svg.append('text')
            .attr('transform', `translate(${width/2}, ${height + margin.top + 20})`)
            .style('text-anchor', 'middle')
            .text('Conference')

        // create yAxis for line chart 
        // y domain caps at 320, about half of the average delegate count of an EagleMUNC conference 
        const yScale = d3.scaleLinear()
            .domain([d3.max(delegateCounts) + 10, 0])
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
            .text("Delegate Count");  

        // create a color pallette out of the list of school names
        const res = plotData.map(d => d.key)
        const color = d3.scaleOrdinal()
            .domain(res)
            .range(['#FF0000', '#FFC500', '#6600FF', '#516DBA', '#2BFFA8', '#A37EFF', '#90BFFF', '#FF00B1', '#FF0064', '#A37EFF'])

        svg.selectAll('.line')
            .data(plotData)
            .enter()
            .append('path')
                .attr('fill', 'none')
                .attr('stroke', d => {
                    return color(d.key)
                })
                .attr('transform', 'translate(10, 0)')
                .attr('stroke-width', 1.5)
                .attr('d', d => {
                    return d3.line()
                        .x(d => {
                            return xScale(d.conference)
                        })
                        .y(d => {
                            return yScale(d.delegateCount)
                        })
                        (d.values)
                })
                 

    })
}

drawLineChart(7)