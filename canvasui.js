"use strict";
class CanvasUI{
    G = new Array();
    #body = document.getElementsByTagName('body')[0];
    canvas = document.createElement('canvas');
    ctx = this.canvas.getContext('2d');
    container;
    #started = false;

    // settings
    #fullscreenApp = false;
    #autoResize = false;
    #mouseEvents = true;
    #canvasColor = '';


    #mouse = { 
        x: 0, y: 0,
        clicked: false, click: {x: 0, y:0}
    }
    #click = () => { };


    constructor(containerID = '', fullscreenApp = false,
        {
            autoStart = true,
            autoResize = false,
            mouseEvents = true,
            width = 0,
            height = 0,
            canvasColor = '',
        } = {}
    ) {
        // container and canvas initialization
        this.container = document.getElementById(containerID);
        if (this.container === null) { throw new Error(`HTML element with id: "${containerID}" not found!`); }
        this.container.appendChild(this.canvas);


        // settings initialization
        this.#fullscreenApp = fullscreenApp;
        this.#setAutoResize(autoResize);
        this.#setCanvasColor(canvasColor); // sets #canvasColor and canvas.style.backgroundColor
        this.#setMouseEvents(mouseEvents);

        if (this.#fullscreenApp) {
            this.#autoResize = true;

            this.#body.style.overflow = "hidden";
            this.#body.style.height = "100vh";
            this.#body.style.margin = '0';
        }
        this.#setCanvasSize(width, height);

        window.addEventListener('resize', () => {   //using arrow function to bind THIS to function
            console.log('resized!');
            if (this.#autoResize) this.#setCanvasSize();
        });


        this.canvas.addEventListener('mousemove', this.#mouseHandler.bind(this));
        this.canvas.addEventListener('click', this.#mouseHandler.bind(this));
        this.canvas.addEventListener('mousedown', this.#mouseHandler.bind(this));
        this.canvas.addEventListener('mouseup', this.#mouseHandler.bind(this));

        if (autoStart) this.#start();
    }
    // util functions
    static normalizeScale(scale = 0, min = false, max = false) {
        // normalizeing percentage 
        if (typeof scale === "string") scale = Number(scale) / 100;
        // clamping / normalizeing  the  value
        if (typeof min == "number" && scale < min) scale = min;
        if (typeof max == "number" && scale > max) scale = max;
        return scale;
    }

    // getters / setters
    get width() { return this.canvas.width;  }
    get height() { return this.canvas.height; }

    get autoResize() { return this.#autoResize; }
    set autoResize(bool = false) { this.#setAutoResize(bool); }

    get canvasColor() { return this.#canvasColor; }
    set canvasColor(color = '') { this.#setCanvasColor(color); }
    
    //private methoods
    #mouseHandler(e) {
        this.#mouse.x = e.offsetX;
        this.#mouse.y = e.offsetY;

        if (e.type === 'click') {
            this.#mouse.click.x = e.offsetX;
            this.#mouse.click.y = e.offsetY;
            this.#mouse.clicked = true;
            this.#click();
        }
        //console.log(this.#mouse.x, this.#mouse.y, this.#mouse.clicked, this.#mouse.click)
    }
    #anim(timestamp) {
        //console.log(timestamp/1000)
        
        // Clearing Canvas
        this.ctx.clearRect( -this.width, -this.height, this.width*3, this.height*3 );
        
        // Drawing Elements
        let length = this.G.length;
        for (let i = 0; i < length;  i++) {
            this.#drawElement( this.G[i]);
        }
        // recalling function
        this.#mouse.clicked = false;
        window.requestAnimationFrame(this.#anim.bind(this));
    }
    #drawElement(ele = new BasicUI(), ) {
        let x = 0, y = 0, w = 0, h = 0;
        // coords
        if (ele.P instanceof BasicUI) {
            x += ele.P._lastCalculatedValues.x;
            y += ele.P._lastCalculatedValues.y;
        }
        x += ele.coord.x;
        y += ele.coord.y;
        if (ele.coord.scaleOn) {
            if (ele.P instanceof CanvasUI) {
                x += ele.P.width * ele.coord.scaleX;
                y += ele.P.height * ele.coord.scaleY;
            } else {
                x += ele.P._lastCalculatedValues.w * ele.coord.scaleX;
                y += ele.P._lastCalculatedValues.h * ele.coord.scaleY;
            }
        }

        // size
        w += ele.size.x;
        h += ele.size.y;
        if (ele.size.scaleOn) {
            if (ele.P instanceof CanvasUI) {
                w += ele.P.width * ele.size.scaleX;
                h += ele.P.height * ele.size.scaleY;
            } else {
                w += ele.P.size.x * ele.size.scaleX;
                h += ele.P.size.y * ele.size.scaleY;
            }
        }
        
        // pivot
        x -= w * ele.pivot.scaleX;
        y -= h * ele.pivot.scaleY;

        //saving values
        ele._lastCalculatedValues.x = x;
        ele._lastCalculatedValues.y = y;
        ele._lastCalculatedValues.w = w;
        ele._lastCalculatedValues.h = h;

        // RENDERING
        this.ctx.fillStyle = ele.border.color;
        if (ele.border.width > 0) {
            if (ele.border.borderRadius > 0) {
            this.ctx.beginPath();
            this.ctx.arc( x+ele.border.borderRadius-ele.border.width, y+ele.border.borderRadius-ele.border.width, ele.border.borderRadius, 0, Math.PI*2);
            this.ctx.closePath();
            this.ctx.arc( x+w-ele.border.borderRadius+ele.border.width, y+ele.border.borderRadius-ele.border.width, ele.border.borderRadius, 0, Math.PI*2);
            this.ctx.closePath();
            this.ctx.arc( x+ele.border.borderRadius-ele.border.width, y+h-ele.border.borderRadius+ele.border.width, ele.border.borderRadius, 0, Math.PI*2);
            this.ctx.closePath();
            this.ctx.arc( x+w-ele.border.borderRadius+ele.border.width, y+h-ele.border.borderRadius+ele.border.width, ele.border.borderRadius, 0, Math.PI*2);
            this.ctx.closePath();
            this.ctx.fill();
            this.ctx.beginPath();
            this.ctx.rect(x + ele.border.borderRadius-ele.border.width, y-ele.border.width, w - ele.border.borderRadius*2+ele.border.width*2, h+ele.border.width*2);
            this.ctx.rect(x-ele.border.width, y + ele.border.borderRadius-ele.border.width, w+ele.border.width*2, h - ele.border.borderRadius*2+ele.border.width*2);
            this.ctx.closePath();
            this.ctx.fill();
        } else {
            this.ctx.beginPath();
            this.ctx.rect(x-ele.border.width, y-ele.border.width, w+ele.border.width*2, h+ele.border.width*2);
            this.ctx.closePath();
            this.ctx.fill();
        }
        }
        // border radius
        this.ctx.fillStyle = ele.color;
        if (ele.border.borderRadius > 0) {
            this.ctx.beginPath();
            this.ctx.arc( x+ele.border.borderRadius, y+ele.border.borderRadius, ele.border.borderRadius, 0, Math.PI*2);
            this.ctx.closePath();
            this.ctx.arc( x+w-ele.border.borderRadius, y+ele.border.borderRadius, ele.border.borderRadius, 0, Math.PI*2);
            this.ctx.closePath();
            this.ctx.arc( x+ele.border.borderRadius, y+h-ele.border.borderRadius, ele.border.borderRadius, 0, Math.PI*2);
            this.ctx.closePath();
            this.ctx.arc( x+w-ele.border.borderRadius, y+h-ele.border.borderRadius, ele.border.borderRadius, 0, Math.PI*2);
            this.ctx.closePath();
            this.ctx.fill();
            this.ctx.beginPath();
            this.ctx.rect(x + ele.border.borderRadius, y, w - ele.border.borderRadius*2, h);
            this.ctx.rect(x, y + ele.border.borderRadius, w, h - ele.border.borderRadius*2);
            this.ctx.closePath();
            this.ctx.fill();
        } else {
            this.ctx.beginPath();
            this.ctx.rect(x, y, w, h);
            this.ctx.closePath();
            this.ctx.fill();
        }

        // text rendering
        if (ele instanceof TextUI) {
            this.ctx.font = `${ele.text.size}px ${ele.text.font}`;
            this.ctx.fillStyle = ele.text.color;
            this.ctx.strokeStyle = ele.text.color;
            this.ctx.textAlign = ele.text.align;
            this.ctx.textBaseline = ele.text.justify;

            let tx = ele.text.x, ty = ele.text.y, maxText = this.ctx.measureText(ele.text.content);
            if (ele.text.scaleOn) {
                tx += w * ele.text.scaleX;
                ty += h * ele.text.scaleY;
            }

            this.ctx.beginPath();
            if (ele.text.style === 'fill') this.ctx.fillText(ele.text.content, x + tx, y + ty);
            else this.ctx.strokeText(ele.text.content, x + tx, y + ty);
            this.ctx.closePath();
        }    

        // Drawing Elements
        let length = ele.G.length;
        for (let i = 0; i < length;  i++) {
            this.#drawElement( ele.G[i]);
        }

        // Mouse Events
        if (this.#mouse.clicked)
            if (x <= this.#mouse.click.x && x + w >= this.#mouse.click.x && y <= this.#mouse.click.y && y + h >= this.#mouse.click.y) {
                ele.Click();
                this.#mouse.clicked = false;
            }
    }

    #start() { if (this.#started) return; this.#started = true; requestAnimationFrame(this.#anim.bind(this)); }
    #setAutoResize(bool = false) { if (this.#fullscreenApp) return null; this.#autoResize = bool; }
    #setMouseEvents(bool = true) { this.#mouseEvents = bool; }
    #setCanvasColor(color = '') { this.#canvasColor = color; this.canvas.style.backgroundColor = this.#canvasColor; }
    #setCanvasSize(width = 0, height = 0) {
        if (this.#fullscreenApp || this.#autoResize) {
            this.container.style.width = '100%';
            this.container.style.height = '100%';
            width = this.container.clientWidth;
            height = this.container.clientHeight;
        } else {
            this.container.style.width = `${width}px`;
            this.container.style.height = `${height}px`;
        }
        this.canvas.width = width;
        this.canvas.height = height;
    }
    #addElement(ele = {}) {
        if (ele instanceof BasicUI) {
            if (ele.P) ele.P.removeElement(ele);
            ele.P = this;
            this.G.push(ele);
        }
    }
    #removeElement(ele = {}) {
        let i = this.G.indexOf(ele);
        this.G.splice(i, 1);
        ele.P = null;
    }

    // chaining methods
    start() { this.#start(); return this; }
    setAutoResize(bool = false) { this.#setAutoResize(bool); return this; }
    setCanvasColor(color = '') { this.#setCanvasColor(color); return this; }
    setCanvasSize(width = 0, height = 0) { this.#setCanvasSize(width, height); return this; }
    setMouseEvents(bool = true) { this.#setMouseEvents(bool); return this; }
    addElement(ele = {}) { this.#addElement(ele); return this; }
    removeElement(ele = {}) { this.#removeElement(ele); return this; }
    onClick(func = () => { }) { this.#click = func; return this; }
}


class BasicUI{
    G = new Array();
    P;
    // object Properties and defaults
    coord = { x: 0, y: 0, scaleOn: true, scaleX: 0, scaleY: 0 };
    size = { x: 0, y: 0, scaleOn: true, scaleX: 0, scaleY: 0 };
    pivot = { scaleX: 0, scaleY: 0 }; // anchor point
    border = { width: 0, borderRadius: 0, color: '' };
    name = '';
    color = '';
    display = true;

    _lastCalculatedValues = { x: 0, y: 0, w: 0, h: 0 };
    #click = () => { };

    constructor(parent = undefined, {
        coord = {},
        size = {},
        pivot = {},
        border = {},
        name = '',
        color = 'black',
        display = true,
    } = {}) {
        this.#setCoord(coord);
        this.#setSize(size);
        this.#setPivot(pivot);
        this.#setBorder(border);
        this.#setName(name);
        this.#setColor(color);
        this.#setDisplay(display);
        this.#setParent(parent); // most important (but put as last so that element is ready before being it drawn!)
    }
    
    //private mthods
    #setParent(parent = {}) {
        if (this.P) this.P.removeElement(this);
        if (parent instanceof BasicUI || parent instanceof CanvasUI) { 
            parent.addElement(this);
        }
    }
    #setCoord(aux = {}) {
        if (aux.scaleX) aux.scaleX = CanvasUI.normalizeScale(aux.scaleX, 0, false);
        if (aux.scaleY) aux.scaleY = CanvasUI.normalizeScale(aux.scaleY, 0, false);
        this.coord = { ...this.coord, ...aux };
    }
    #setSize(aux = {}) {
        if(aux?.x < 0 ) aux.x = 0;
        if(aux?.y < 0 ) aux.y = 0;
        if (aux.scaleX) aux.scaleX = CanvasUI.normalizeScale(aux.scaleX, 0, false);
        if (aux.scaleY) aux.scaleY = CanvasUI.normalizeScale(aux.scaleY, 0, false);
        this.size = { ...this.size, ...aux };
    }
    #setPivot(aux = {}) {
        if (aux.scaleX) aux.scaleX = CanvasUI.normalizeScale(aux.scaleX, 0, 1);
        if (aux.scaleY) aux.scaleY = CanvasUI.normalizeScale(aux.scaleY, 0, 1);
        this.pivot = { ...this.pivot, ...aux };
    }
    #setBorder(aux = {}) { this.border = { ...this.border, ...aux }; }
    #setName(name = '') { this.name = name; }
    #setColor(color = '') { this.color = color; }
    #setDisplay(display = true) { this.display = display; }
    #set({parent = this.P,coord = this.coord,size = this.size,pivot = this.pivot,type = this.type,border = this.border,name = this.name,color = this.color,display = this.display} = {}) {
        this.#setParent(parent);
        this.#setCoord(coord);
        this.#setSize(size);
        this.#setPivot(pivot);
        this.#setBorder(border);
        this.#setName(name);
        this.#setColor(color);
        this.#setDisplay(display);
    }
    #addElement(ele = new BasicUI()) {
        if (ele instanceof BasicUI) {
            if (ele.P) ele.P.removeElement(ele);
            ele.P = this;
            this.G.push(ele);
        }
    }
    #removeElement(ele) {
        let i = this.G.indexOf(ele);
        this.G.splice(i, 1);
        ele.P = null;
    }

    // chaining methods
    setParent(parent = {}) { this.#setParent(parent); return this; }
    setCoord(aux = {}) { this.#setCoord(aux); return this; }
    setSize(aux = {}) { this.#setSize(aux); return this; }
    setPivot(aux = {}) { this.#setPivot(aux); return this; }
    setBorder(aux = {}) { this.#setBorder(aux); return this; }
    setName(name) { this.#setName(name); return this; }
    setColor(color) { this.#setColor(color);  return this; }
    setDisplay(display) { this.#setDisplay(display); return this; }
    set({parent = this.P,coord = this.coord,size = this.size,pivot = this.pivot,type = this.type,border = this.border,name = this.name,color = this.color,display = this.display} = {})
    {
        this.#set({ parent: parent, coord: coord, size: size, pivot: pivot, border: border, name: name, color: color, display: display });
        return this;
    }
    addElement(ele) { this.#addElement(ele); return this; }
    removeElement(ele) { this.#removeElement(ele); return this; }

    /* mouse events */
    Click() { this.#click(); return this; }
    onClick(func = () => { }) { this.#click = func; return this; }
}


class TextUI extends BasicUI{
    static TextAlign = { start: 'start', center: 'center', end: 'end' };
    static TextJustify = { alphabetic: 'alphabetic', top: 'top', middle: 'middle', bottom: 'bottom', hanging: 'hanging' }
    static TextStyle = { fill: 'fill', stroke: 'stroke' };

    text = {
        content: '', size: 10, color: 'black',
        font: 'sans-serif', align: 'start', justify: 'alphabetic',
        style: 'fill', x: 0, y: 0, scaleX: 0, scaleY: 0, scaleOn: true
    }

    constructor(parent = undefined, { coord = {}, size = {}, pivot = {}, border = {}, name = '', color = 'black', display = true, text = {}, } = {}) {
        super(parent, { parent: parent, coord: coord, size: size, pivot: pivot, border: border, name: name, color: color, display: display });
    }
    // private methods
    #setText(aux = {}) { this.text = { ...this.text, ...aux }; }
    #setTextCoord(aux = {}) {
        if (aux.scaleX) aux.scaleX = CanvasUI.normalizeScale(aux.scaleX, 0, false);
        if (aux.scaleY) aux.scaleY = CanvasUI.normalizeScale(aux.scaleY, 0, false);
        this.text = { ...this.text, ...aux };
    }

    // chaining methods
    setText(aux = {}) { this.#setText(aux); return this; }

    setTextContent(string = '') { this.text.content = string; return this; }
    setTextSize(size = 1) { this.text.size = size; return this; }
    setTextColor(string = 'black') { this.text.string = string; return this; }
    setTextFont(string = 'sans-serif') { this.text.font = string; return this; }
    setTextAlign(string = 'start') { this.text.align = string; return this; }
    setTextJustify(string = 'alphabetic') { this.text.justify = string; return this; }
    setTextStyle(string = 'fill') { this.text.style = string; return this; }
    setTextCoord(aux = {}) { this.#setTextCoord(aux); return this; }
    
}

