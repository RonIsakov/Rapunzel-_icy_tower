// Score.js
export class Score {
    constructor(scoreElement) {
      this.scoreElement = scoreElement;
      this.base = 0;         // From scrolling
      this.bonus = 0;        // From fast climbs
    }
  
    update(scrollAmount) {
      this.base += scrollAmount;
    }
  
    addBonus(amount) {
      this.bonus += amount;
    }
  
    total() {
      return Math.floor(this.base + this.bonus);
    }
  
    render() {
      this.scoreElement.innerText = `Score: ${this.total()}`;
    }
  
    reset() {
      this.base = 0;
      this.bonus = 0;
    }
  }
  