/********************************* 
JS Audio Knobs by Colin Bone Dodds
*********************************/

let madeGlobalEventHandlers = false;

let knobInUse = {
  id: "",
  initY: 0,
  currentKnob: {}
};

class Knob {
  constructor({
    id = "knob1",
    lowVal = 0,
    highVal = 100,
    value = 0,
    size = "medium",
    sensitivity = 1,
    type = "LittlePhatty",
    label = true,
    lblTxtColor = "silver"
  }) {
    this.id = id;
    this.lowVal = lowVal;
    this.highVal = highVal;
    this.currentValue = Math.min(Math.max(value, lowVal), highVal);
    this.sensitivity = sensitivity;
    this.scaler = 100 / (this.highVal - this.lowVal);
    this.type = type;
    this.label = label;
    this.lblTxtColor = lblTxtColor;

    if (size == "xlarge") this.size = 128;
    else if (size == "large") this.size = 85;
    else if (size == "medium") this.size = 50;
    else if (size == "small") this.size = 40;
    else this.size = 30;

    this.imgFile = `${this.type}/${this.type}_${this.size}.png`;

    this.setUpKnob();
  }

  setUpKnob() {
    let div = document.getElementById(this.id);
    let imgDiv = document.createElement("div");
    let src = "./knob_Images/" + this.imgFile;
    imgDiv.innerHTML = `<img draggable='false' style='pointer-events: none; transform: translateY(0px); touch-action: none;' src=${src}>`;
    
    let lblDiv = document.createElement("div");
    div.appendChild(imgDiv);
    div.appendChild(lblDiv);

    imgDiv.style = `overflow: hidden; height: ${this.size}px; user-select: none;`;
    div.style = "position: absolute";

    // Mouse
    imgDiv.addEventListener("mousedown", function(e) {
      knobInUse = {
        id: this.id,
        initY: e.pageY,
        value: this.currentValue,
        currentKnob: this
      };
    }.bind(this));

    // Touch
    imgDiv.addEventListener("touchstart", function(e) {
      let touch = e.touches[0];
      knobInUse = {
        id: this.id,
        initY: touch.pageY,
        value: this.currentValue,
        currentKnob: this
      };
    }.bind(this));

    if (!madeGlobalEventHandlers) {
      createGlobalEventHandlers();
      madeGlobalEventHandlers = true;
    }

    lblDiv.style =
      "text-align: center;width: 100%;margin: 0 auto;font-size: 12px";
    lblDiv.style.color = this.lblTxtColor;

    this.setImage();
  }

  setValue(val) {
    if (val > this.highVal) {
      this.currentValue = this.highVal;
      console.log(`Value ${val} exceeds max ${this.highVal}`);
    } else if (val < this.lowVal) {
      this.currentValue = this.lowVal;
      console.log(`Value ${val} below min ${this.lowVal}`);
    } else {
      this.currentValue = val;
    }
    this.setImage();
    if (typeof knobChanged == "function") {
      knobChanged(this.id, this.currentValue);
    }
  }

  setImage() {
    let sum =
      (Math.floor(((this.currentValue - this.lowVal) * this.scaler) / 2) + 0) *
      this.size;
    let newY = `translateY(-${sum}px)`;
    document.getElementById(this.id).childNodes[0].childNodes[0].style.transform = newY;

    if (this.label != false) {
      document.getElementById(this.id).childNodes[1].innerHTML = this.currentValue;
    }
  }

  getValue() {
    return this.currentValue;
  }
}

function createGlobalEventHandlers() {
  document.querySelectorAll("html, body").forEach(node => {
    node.style.height = "100%";
  });

  document.body.addEventListener("mouseup", function() {
    resetKnobInUse();
  });

  document.body.addEventListener("touchend", function() {
    resetKnobInUse();
  });

  document.body.addEventListener("mousemove", function(e) {
    dragging(e);
  });

  document.body.addEventListener("touchmove", function(e) {
    if (e.touches.length > 0) {
      e.preventDefault(); // prevents page scroll
      let touch = e.touches[0];
      dragging(touch);
    }
  }, { passive: false });

  function resetKnobInUse() {
    knobInUse = {
      id: "",
      initY: 0,
      value: 0,
      currentKnob: null
    };
  }

  function dragging(pos) {
    if (knobInUse.id != "") {
      if (pos.pageY <= 10 || pos.pageY >= document.body.clientHeight - 10) {
        knobInUse = { id: "", initY: 0, currentKnob: null };
        return;
      }

      knobInUse.currentKnob.currentValue = Math.round(
        knobInUse.value +
          ((knobInUse.initY - pos.pageY) * knobInUse.currentKnob.sensitivity) /
            knobInUse.currentKnob.scaler
      );

      let max = knobInUse.currentKnob.highVal,
        min = knobInUse.currentKnob.lowVal;

      if (knobInUse.currentKnob.currentValue > max) {
        knobInUse.currentKnob.currentValue = max;
      } else if (knobInUse.currentKnob.currentValue < min) {
        knobInUse.currentKnob.currentValue = min;
      }

      if (knobInUse.currentKnob.label != false) {
        document.getElementById(knobInUse.id).childNodes[1].innerHTML =
          knobInUse.currentKnob.currentValue;
      }

      let sum =
        (Math.floor(
          ((knobInUse.currentKnob.currentValue - knobInUse.currentKnob.lowVal) *
            knobInUse.currentKnob.scaler) /
            2
        ) +
          0) *
        knobInUse.currentKnob.size;

      let newY = `translateY(-${sum}px)`;
      document.getElementById(
        knobInUse.id
      ).childNodes[0].childNodes[0].style.transform = newY;

      if (typeof knobChanged == "function") {
        knobChanged(knobInUse.id, knobInUse.currentKnob.currentValue);
      }
    }
  }
}
