let chapterArcs = [];

function setup() {
  createCanvas(800, 800);
  //TODO: Function to generate spacing based on % of circle to white space
  //Should work so no matter the number of chapters there will still be space between them
  var test = new ChapterCircle(400, 400, 600, 8, PI/2);
  chapterArcs.push(test);
}

function draw() {
  background(0);
  for (let i = 0; i < chapterArcs.length; i++){
    chapterArcs[i].show();
  }
}

class ChapterCircle{
  constructor(startPos, endPos, diameter, numOfChapters, spacing){
    this.startPos = startPos;
    this.endPos = endPos;
    this.diameter = diameter;
    this.numOfChapters = numOfChapters;
    this.spacing = spacing;
  }

  show(){
    let arcLength = ((2*PI)-this.spacing)/this.numOfChapters;
    let spacingLength = this.spacing/this.numOfChapters;
    let currentStartPos = 0;
    for(let i = 0; i<this.numOfChapters; i++){
      let thisArc = new ChapterArc(this.startPos, this.endPos, currentStartPos, currentStartPos+arcLength, this.diameter, 'pink');
      thisArc.show();
      currentStartPos = currentStartPos+arcLength+spacingLength;
    }
  }
}

class ChapterArc {
  constructor(startPos, endPos, start, end, size, color){
    this.startPos = startPos;
    this.endPos = endPos;
    this.start = start;
    this.end = end;
    this.size = size;
    this.color = color;
    this.width = 8;
  }

  clicked(){

  }

  focus(){
    this.width += 2;
  }

  unfocus(){
    this.width -= 2;
  }

  show(){
    stroke('pink')
    strokeWeight(this.width)
    strokeCap(SQUARE)
    noFill();
    arc(this.startPos,this.endPos,this.size,this.size,this.start,this.end)
  }

}
