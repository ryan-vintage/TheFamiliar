let chapterCircle = null;
let emptyChapterCircle = null;
let familiarData = {};
let isEmptyDataToggled = false;
let toggledCircle = null;

getJsonData("../data.json");

function setup() {
  createCanvas(windowWidth, windowHeight);
  emptyChapterCircle = new ChapterCircle(400, 400, 500, PI/2, true);
  chapterCircle = new ChapterCircle(400, 400, 500, PI/2, false);
  toggleEmptyDataButton = createButton('Toggle Empty Data');
  toggleEmptyDataButton.position(25,25);
  toggleEmptyDataButton.mousePressed(function(){isEmptyDataToggled = !isEmptyDataToggled});
  //TODO: Function to generate spacing based on % of circle to white space
  //Should work so no matter the number of chapters there will still be space between them
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function getJsonData(location){
  fetch(location)
  .then(function(resp){
    return resp.json();
  })
  .then(function(data){
    familiarData = data;
  });
}

function draw() {
  background(0);
  if(isEmptyDataToggled){
    toggledCircle = chapterCircle;
  }
  else{
    toggledCircle = emptyChapterCircle;
  }
  toggledCircle.show();
  if(isHoveringOnCircle(toggledCircle.circleXPos,toggledCircle.circleYPos,toggledCircle.radius)){
    toggledCircle.onHover();
  }
}

function isHoveringOnCircle(x,y,radius){
  var result;

  var d = dist(mouseX,mouseY,x,y);
  if(d<radius){
    result = true;
  }
  else{
    result = false;
  }

  return result;
}

class ChapterCircle{
  constructor(circleXPos, circleYPos, diameter, spacing, showUndefined){
    this.circleXPos = circleXPos;
    this.circleYPos = circleYPos;
    this.radius = diameter/2;
    this.showUndefined = showUndefined;
    this.numOfChapters = this.getNumOfChapters();
    this.spacing = spacing;
    this.arcLength = ((2*PI)-this.spacing)/this.numOfChapters;
    this.spacingLength = this.spacing/this.numOfChapters;
    this.arcs = this.getArcs();
  }

  getNumOfChapters(){
    let count = 0;
    familiarData.books.map(book => {
      book.chapters.map(chapter => {
        if(chapter.narrator || this.showUndefined){
          count++;
        }
      })
    })
    return count;
  }

  getArcs(){
    let arcs = [];
    let tempStartPos = 0;
    familiarData.books.map(book => {
      book.chapters.map(chapter => {
        if(chapter.narrator || this.showUndefined){
          arcs.push(new ChapterArc(this.circleXPos, this.circleYPos, tempStartPos, tempStartPos+this.arcLength, this.radius, chapter));
          tempStartPos = tempStartPos+this.arcLength+this.spacingLength;
        }
      })
    })
    return arcs;
  }

  show(){
    for(let i = 0; i<this.arcs.length; i++){
      this.arcs[i].show();
    }
  }

  onHover(){
    for(let i = 0; i<this.arcs.length; i++){
      this.arcs[i].onHover();
    }
  }
}

class ChapterArc {
  constructor(circleXPos, circleYPos, startRadian, endRadian, radius, chapter){
    this.circleXPos = circleXPos;
    this.circleYPos = circleYPos;
    this.startRadian = startRadian;
    this.endRadian = endRadian;
    this.midRadian = this.startRadian+((this.endRadian-this.startRadian)/2);
    this.radius = radius;
    this.chapter = chapter;
    this.color = this.getColor();
    this.isFocused = false;

    //CONSTANT Variables
    this.width = 8;
    this.focusWidthChange = 8;
    this.focusedRadius = this.radius+(this.radius/3);
    this.middleCurveOffset = 8;

    this.arcStartX = this.circleXPos + this.radius*cos(this.startRadian);
    this.arcStartY = this.circleYPos+this.radius*sin(this.startRadian);
    this.arcMidX = this.circleXPos + this.radius*cos(this.midRadian);
    this.arcMidY = this.circleYPos+this.radius*sin(this.midRadian);
    this.arcEndX = this.circleXPos + this.radius*cos(this.endRadian);
    this.arcEndY = this.circleYPos+this.radius*sin(this.endRadian);

    this.extendedArcStartX = this.circleXPos + this.focusedRadius*cos(this.startRadian);
    this.extendedArcStartY = this.circleYPos+this.focusedRadius*sin(this.startRadian);
    this.extendedArcMidX = this.circleXPos + (this.focusedRadius+this.middleCurveOffset)*cos(this.midRadian);
    this.extendedArcMidY = this.circleYPos+(this.focusedRadius+this.middleCurveOffset)*sin(this.midRadian);
    this.extendedArcEndX = this.circleXPos + this.focusedRadius*cos(this.endRadian);
    this.extendedArcEndY = this.circleYPos+this.focusedRadius*sin(this.endRadian);
  }

  getColor(){
    let colors = familiarData.colors[this.chapter.narrator];
    if(colors){
      return familiarData.colors[this.chapter.narrator].primary;
    }
    else{
      return 'white';
    }
  }

  onHover(){
    if(collidePointArc(mouseX, mouseY, this.circleXPos, this.circleYPos, this.radius, this.midRadian, (this.endRadian-this.startRadian))){
      this.focus();
    }
    else{
      this.unfocus();
    }
  }

  focus(){
    if(!this.isFocused){
      this.isFocused = !this.isFocused;
      this.width += this.focusWidthChange;
    }
  }

  unfocus(){
    if(this.isFocused){
      this.isFocused = !this.isFocused;
      this.width -= this.focusWidthChange;
    }
  }

  drawFocusedShape(){
    fill(this.color);
    strokeWeight(0);
    beginShape();
    vertex(this.arcStartX,this.arcStartY);
    vertex(this.extendedArcStartX, this.extendedArcStartY);
    vertex(this.extendedArcMidX, this.extendedArcMidY);
    vertex(this.extendedArcEndX, this.extendedArcEndY);
    vertex(this.arcEndX, this.arcEndY);
    endShape(CLOSE);
    strokeWeight(this.width);
    arc(this.circleXPos,this.circleYPos,this.radius*2,this.radius*2,this.startRadian,this.endRadian)
  }

  drawUnfocusedShape(){
    noFill();
    strokeWeight(this.width);
    arc(this.circleXPos,this.circleYPos,this.radius*2,this.radius*2,this.startRadian,this.endRadian)
  }

  show(){
    stroke(this.color);
    strokeCap(SQUARE);
    ellipseMode(CENTER);
    if(this.isFocused){
      this.drawFocusedShape();
    }
    else{
      this.drawUnfocusedShape();
    }
  }

}
