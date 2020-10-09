let chapterCircle = null;
let emptyChapterCircle = null;
let familiarData = {};
let isEmptyDataToggled = false;
let toggledCircle = null;

getJsonData("../data.json");

function setup() {
  createCanvas(800, 800);
  emptyChapterCircle = new ChapterCircle(400, 400, 600, PI/2, true);
  chapterCircle = new ChapterCircle(400, 400, 600, PI/2, false);
  toggleEmptyDataButton = createButton('Toggle Empty Data');
  toggleEmptyDataButton.position(25,25);
  toggleEmptyDataButton.mousePressed(function(){isEmptyDataToggled = !isEmptyDataToggled});
  //TODO: Function to generate spacing based on % of circle to white space
  //Should work so no matter the number of chapters there will still be space between them
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
  if(isHoveringOnCircle(toggledCircle.startPos,toggledCircle.endPos,toggledCircle.diameter/2)){
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
  constructor(startPos, endPos, diameter, spacing, showUndefined){
    this.startPos = startPos;
    this.endPos = endPos;
    this.diameter = diameter;
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
          arcs.push(new ChapterArc(this.startPos, this.endPos, tempStartPos, tempStartPos+this.arcLength, this.diameter, chapter));
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
  constructor(startPos, endPos, start, end, diameter, chapter){
    this.startPos = startPos;
    this.endPos = endPos;
    this.start = start;
    this.end = end;
    this.diameter = diameter;
    this.chapter = chapter;
    this.color = this.getColor();
    this.width = 8;
    this.focusWidthChange = 8;
    this.isFocused = false;
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
    if(collidePointArc(mouseX, mouseY, this.startPos, this.endPos, this.diameter/2, this.start+((this.end-this.start)/2), (this.end-this.start))){
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

  show(){
    // console.log(this.chapter.narrator, this.color);
    stroke(this.color);
    strokeWeight(this.width);
    strokeCap(SQUARE);
    ellipseMode(CENTER);
    noFill();
    arc(this.startPos,this.endPos,this.diameter,this.diameter,this.start,this.end)
  }

}
