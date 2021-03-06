// FOX II
// ANNI ALBERS

// Basic variables
var fox = {
  width: d3.select('#fox').node().getBoundingClientRect().width,
}

fox.triangleHeight = _.floor(fox.width / 30)
fox.padding = _.floor(fox.width * .12)
fox.gutter = _.floor(fox.width * .06)
fox.diptych = {
  width: _.floor(fox.width * .35),
  height: _.floor(fox.width * .76),
}

// Palette
fox.palette = getFoxPalette()

function getFoxPalette() {
  let type = d3.select('input[name="foxType"]:checked').node().value
  if (type === 'analogous') {
    return getAnalogousFoxPalette()
  } else if (type === 'complementary') {
    return getComplementaryFoxPalette()
  }
}

function getAnalogousFoxPalette() {
  let s = {
    min: .1,
    max: .4
  }

  let color1 = {
    h: _.random(0, 360),
    s: _.floor(_.random(s.min, s.max, true), 2),
    l: _.floor(_.random(.9, .98, true), 2),
  }

  let color2 = {
    h: getRandomHue(color1.h, .2),
    s: _.floor(_.random(s.min, s.max, true), 2),
    l: _.floor(_.random(.4, .6, true), 2),
  }

  let color3 = {
    h: getRandomHue(color1.h, .2),
    s: _.floor(_.random(s.min, s.max, true), 2),
    l: _.floor(_.random(.1, .2, true), 2),
  }

  return [color1, color2, color3]
}

function getComplementaryFoxPalette() {
  let s = {
    min: .3,
    max: .8
  }

  let color1 = {
    h: _.random(0, 360),
    s: _.floor(_.random(s.min, s.max, true), 2),
    l: _.floor(_.random(.7, .9, true), 2),
  }

  let color2 = {
    h: color1.h,
    s: _.floor(_.random(s.min, s.max, true), 2),
    l: _.floor(_.random(.4, .6, true), 2),
  }

  let complementaryHue = (color1.h + 180) % 360
  let color3 = {
    h: getRandomHue(complementaryHue, .1),
    s: _.floor(_.random(s.min, s.max, true), 2),
    l: _.floor(_.random(.1, .6, true), 2),
  }

  return [color1, color2, color3]
}

// d3 setup
fox.canvas =
  d3.select('#fox')
      .append('svg')
      .attr('width', fox.width)
      .attr('height', fox.width)

fox.canvas.style('background-color', getHsl(fox.palette[0]))

fox.trianglesSecondary =
  fox.canvas.append('g')
    .attr('class', 'secondary')

fox.trianglesPrimary =
  fox.canvas.append('g')
    .attr('class', 'primary')

fox.covers =
  fox.canvas.append('g')
    .attr('class', 'covers')

// Generate dataset
fox.coordinates = {}
fox.coordinates.primary = getPrimaryCoordinates()
fox.coordinates.secondary = getSecondaryCoordinates(fox.coordinates.primary)

function getPrimaryCoordinates() {
  let dataset = []
  for (let x = 0; x < (fox.width / fox.triangleHeight); x++) {
    for (let y = 0; y < (fox.width / fox.triangleHeight); y++) {
      let xCoordinate = _.floor(x * fox.triangleHeight - (fox.triangleHeight / 2))
      let yCoordinate = _.floor(y * fox.triangleHeight - (fox.triangleHeight / 2))
      dataset.push(getPoints(xCoordinate, yCoordinate))
    }
  }
  return dataset
}

function getSecondaryCoordinates(primary) {
  let dataset = primary.slice()
  _.forEach(dataset, (point, index) => {
    dataset[index] = getOffset(point)
  })
  return dataset
}

function getPoints(x, y) {
  let random = _.random(3)
  let point1, point2, point3
  let xAdjusted = x - _.floor(fox.triangleHeight / 2)
  let yAdjusted = y - _.floor(fox.triangleHeight / 2)

  if (random === 0) {
    point1 = [xAdjusted, yAdjusted]
    point2 = [fox.triangleHeight + xAdjusted, fox.triangleHeight + yAdjusted]
    point3 = [xAdjusted, fox.triangleHeight + yAdjusted]
  } else if (random === 1) {
    point1 = [xAdjusted, yAdjusted]
    point2 = [fox.triangleHeight + xAdjusted, yAdjusted]
    point3 = [xAdjusted, fox.triangleHeight + yAdjusted]
  } else if (random === 2) {
    point1 = [xAdjusted, yAdjusted]
    point2 = [fox.triangleHeight + xAdjusted, fox.triangleHeight + yAdjusted]
    point3 = [fox.triangleHeight + xAdjusted, yAdjusted]
  } else if (random === 3) {
    point1 = [fox.triangleHeight + xAdjusted, yAdjusted]
    point2 = [fox.triangleHeight + xAdjusted, fox.triangleHeight + yAdjusted]
    point3 = [xAdjusted, fox.triangleHeight + yAdjusted]
  }

  return [point1, point2, point3]
}

function getOffset(points) {
  let offset = _.floor(fox.triangleHeight / 3.5)
  let point1 = [points[0][0] - offset, points[0][1] + offset]
  let point2 = [points[1][0] - offset, points[1][1] + offset]
  let point3 = [points[2][0] - offset, points[2][1] + offset]

  return [point1, point2, point3]
}

// Draw content
drawTriangles()
drawCovers()

function drawTriangles() {
  setFoxSwatches(fox.palette)

  // Reset
  fox.canvas.selectAll('g.secondary > path').remove()
  fox.canvas.selectAll('g.primary > path').remove()

  // Draw background
  fox.canvas.style('background-color', getHsl(fox.palette[0]))

  // Draw triangles
  fox.trianglesSecondary.selectAll('path')
    .data(['1'])
    .enter()
    .append('path')
      .attr('d', createPath(fox.coordinates.secondary))
      .attr('fill', getHsl(fox.palette[1]))

  fox.trianglesPrimary.selectAll('path')
    .data(['1'])
    .enter()
    .append('path')
      .attr('d', createPath(fox.coordinates.primary))
      .attr('fill', getHsl(fox.palette[2]))
      .attr('opacity', .9)
}

// Takes in series of coordinates and creates a single path out of them.
// This is more performant than creating many polygons.
function createPath(coordinates) {
  let path = ''
  _.forEach(coordinates, (triangle, i) => {
    let point1 = `M ${triangle[0][0]}, ${triangle[0][1]}`
    let point2 = `L ${triangle[1][0]}, ${triangle[1][1]}`
    let point3 = `L ${triangle[2][0]}, ${triangle[2][1]} Z`
    path += `${point1} ${point2} ${point3}`
  })
  return path
}

function drawCovers() {
  let wiggleRoom = fox.width * .1

  fox.covers.append('rect')
    .attr('width', fox.width + (2 * wiggleRoom))
    .attr('height', fox.padding + wiggleRoom)
    .attr('x', -wiggleRoom)
    .attr('y', -wiggleRoom)
    .attr('fill', (d) => getHsl(fox.palette[0]))

  fox.covers.append('rect')
    .attr('width', fox.width + (2 * wiggleRoom))
    .attr('height', fox.padding + wiggleRoom)
    .attr('x', -wiggleRoom)
    .attr('y', fox.width - fox.padding)
    .attr('fill', (d) => getHsl(fox.palette[0]))

  fox.covers.append('rect')
    .attr('width', fox.padding + wiggleRoom)
    .attr('height', fox.width + (2 * wiggleRoom))
    .attr('x', -wiggleRoom)
    .attr('y', -wiggleRoom)
    .attr('fill', (d) => getHsl(fox.palette[0]))

  fox.covers.append('rect')
    .attr('width', fox.padding + wiggleRoom)
    .attr('height', fox.width + (2 * wiggleRoom))
    .attr('x', fox.width - fox.padding)
    .attr('y', -wiggleRoom)
    .attr('fill', (d) => getHsl(fox.palette[0]))

  fox.covers.append('rect')
    .attr('width', fox.gutter)
    .attr('height', fox.width + (2 * wiggleRoom))
    .attr('x', fox.padding + fox.diptych.width)
    .attr('y', -wiggleRoom)
    .attr('fill', (d) => getHsl(fox.palette[0]))
}

function updateCovers() {
  fox.canvas.selectAll('g.covers > rect').attr('fill', getHsl(fox.palette[0]))
  fox.canvas.selectAll('g.covers > rect').attr('fill', getHsl(fox.palette[0]))
  fox.canvas.style('background-color', getHsl(fox.palette[0]))
}

function setFoxSwatches(colors) {
  _.forEach(colors, (color, i) => {
    d3.select(`#fox${i + 1}-h`).property('value', `${color.h}`)
    d3.select(`#fox${i + 1}-s`).property('value', `${color.s * 100}`)
    d3.select(`#fox${i + 1}-l`).property('value', `${color.l * 100}`)
    d3.select(`#fox${i + 1}-swatch`).style('background-color', getHsl(color))
  })
}

// Interaction
fox.canvas.on('mouseup', () => {
  redrawFox()
})

fox.initialAnimationDidFinish = false

fox.cursorScale = d3.scaleLinear()
  .domain([0, fox.width])
  .range([-1, 1])
  .clamp(true)

fox.canvas.on('mousemove', function () {
  let xCoordinate = d3.mouse(this)[0]
  let yCoordinate = d3.mouse(this)[1]
  animateFox(xCoordinate, yCoordinate)
})

fox.canvas.on('mouseleave', function () {
  fox.trianglesSecondary.transition(d3.easeElasticInOut)
    .duration(250)
    .attr('transform', (d) => `translate(0, 0)`)
  fox.covers.transition(d3.easeElasticInOut)
    .duration(250)
    .attr('transform', (d) => `translate(0, 0)`)
    .on('end', () => { fox.initialAnimationDidFinish = false})
})

function animateFox(x, y) {
  // Use a transition for the initial animation
  if (!fox.initialAnimationDidFinish) {
    fox.trianglesSecondary
      .interrupt()
      .transition(d3.easeBounce)
        .duration(75)
        .attr('transform', (d, i) => {
          let xIncrement = _.floor(-fox.cursorScale(x) * (fox.triangleHeight / 4))
          let yIncrement = _.floor(-fox.cursorScale(y) * (fox.triangleHeight / 4))
          return `translate(${xIncrement}, ${yIncrement})`
        })
    fox.covers
      .interrupt()
      .transition(d3.easeBounce)
        .duration(75)
        .attr('transform', (d, i) => {
          let xIncrement = fox.cursorScale(x) * (fox.width * 0.05)
          let yIncrement = fox.cursorScale(y) * (fox.width * 0.05)
          return `translate(${xIncrement}, ${yIncrement})`
        })
        .on('end', () => { fox.initialAnimationDidFinish = true})
  // Once the initial animation is finished, track the cursor linearly
  } else {
    fox.trianglesSecondary.attr('transform', (d, i) => {
      let xIncrement = _.floor(-fox.cursorScale(x) * (fox.triangleHeight / 4))
      let yIncrement = _.floor(-fox.cursorScale(y) * (fox.triangleHeight / 4))
      return `translate(${xIncrement}, ${yIncrement})`
    })
    fox.covers.attr('transform', (d, i) => {
      let xIncrement = fox.cursorScale(x) * (fox.width * 0.05)
      let yIncrement = fox.cursorScale(y) * (fox.width * 0.05)
      return `translate(${xIncrement}, ${yIncrement})`
    })
  }
}

function redrawFox() {
  fox.palette = getFoxPalette()
  fox.coordinates.primary = getPrimaryCoordinates()
  fox.coordinates.secondary = getSecondaryCoordinates(fox.coordinates.primary)
  drawTriangles()
  updateCovers()
  setFoxSwatches(fox.palette)
}

// Listeners
d3.selectAll('.fox-input').on('input', () => {
  // Get values from input fields
  let colors = []
  _.forEach(_.range(1, 4), (index) => {
    let color = {
      h: parseFloat(d3.select(`#fox${index}-h`).property('value')),
      s: parseFloat(d3.select(`#fox${index}-s`).property('value')) / 100,
      l: parseFloat(d3.select(`#fox${index}-l`).property('value')) / 100,
    }
    colors.push(color)
  })

  fox.palette = colors
  drawTriangles()
  updateCovers()
})
