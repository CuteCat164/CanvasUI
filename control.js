function CreateControlPanel(div, ele = new TextUI(), complex = false) {
    
    function createSliderControl(obj, parent) {
        function createSlider(name, prop, span) {
            const div = document.createElement('div');
            div.className = 'control';

            const label = document.createElement('label');
            label.innerHTML = `${name}: <span>${obj[prop]}</span>`;
            span._s = label.querySelector('span');

            const input = document.createElement('input');
            input.type = 'range';
            input.min = 0;
            input.max = 1;
            input.step = 0.01;
            input.value = obj[prop];

            div.appendChild(label);
            div.appendChild(input);
            parent.appendChild(div)
            return input;
        }

        let spanX = {_s:0}, spanY = {_s:0}, spanB = {_s:0};
        let x = createSlider('scaleX', 'scaleX', spanX);
        let y =createSlider('scaleY', 'scaleY', spanY);
        let both = createSlider('Mindkettő', 'both', spanB);

        x.addEventListener('input', () => {
            obj['scaleX'] = parseFloat(x.value);
            spanX._s.textContent = obj['scaleX'];
        })
        y.addEventListener('input', () => {
            obj['scaleY'] = parseFloat(y.value);
            spanY._s.textContent = obj['scaleY'];
        })
        both.addEventListener('input', () => {
            let val = parseFloat(both.value);
            obj['scaleX'] = val;
            obj['scaleY'] = val;
            x.value = val;
            y.value = val;
            spanX._s.textContent = val;
            spanY._s.textContent = val;
            spanB._s.textContent = val;
        })

    }

    function createNumberControl(key, obj, prop) {
        const div = document.createElement('div');
        div.className = 'control';

        const input = document.createElement('input');
        input.type = 'number';
        input.min = 0;
        input.value = obj[prop];

        const label = document.createElement('label');
        label.innerHTML = `${prop}:`;
        label.appendChild(input);

        input.addEventListener('input', () => {
            obj[prop] = parseInt(input.value) || 0;
        });

        div.appendChild(label);
        return div;
    }

    function createColorControl(obj, prop) {
        const div = document.createElement('div');
        div.className = 'control';

        const input = document.createElement('input');
        input.type = 'color';
        input.value = obj[prop];

        const label = document.createElement('label');
        label.innerHTML = `${prop}:`;
        label.appendChild(input);

        input.addEventListener('input', () => {
            obj[prop] = input.value;
        });

        div.appendChild(label);
        return div;
    }

    function createDropdownControl(obj, prop, extra) {
    	const div = document.createElement('div');
    	div.className = 'control';

    	const label = document.createElement('label');
    	label.innerHTML = `${prop}:`;

    	const select = document.createElement('select');
    	select.style.width = '100%';

    	(extra.options || []).forEach(option => {
    		const opt = document.createElement('option');
    		opt.value = option;
    		opt.textContent = option;
    		if (option === obj[prop]) {
    			opt.selected = true;
    		}
    		select.appendChild(opt);
    	});

    	select.addEventListener('change', () => {
    		obj[prop] = select.value;
    	});

    	div.appendChild(label);
    	label.appendChild(select);
    	return div;
    }

    function createTextControl(obj, prop) {
    	const div = document.createElement('div');
    	div.className = 'control';

    	const label = document.createElement('label');
    	label.innerHTML = `${prop}: <span>${obj[prop]}</span>`;
    	const span = label.querySelector('span');

    	const input = document.createElement('input');
    	input.type = 'text';
    	input.value = obj[prop];

    	input.addEventListener('input', () => {
    		obj[prop] = input.value;
    		span.textContent = obj[prop];
    	});

    	div.appendChild(label);
    	div.appendChild(input);
    	return div;
    }


    function createGroup(div, name, obj, properties) {
        const group = document.createElement('div');
        group.className = 'control-group';

        const title = document.createElement('h3');
        title.textContent = name;
        group.appendChild(title);
    	for (const item of properties) {
    		let prop, type, extra;
    		if (Array.isArray(item)) {
    			[prop, type, extra] = item;
    		} else {
    			prop = item;
    			type = 'number'; // default
    		}
            if (type === 'color') {
                group.appendChild(createColorControl(obj, prop));
            } else if (type === 'slider') {
                createSliderControl(obj, group);
            } else if (type === 'number') {
                group.appendChild(createNumberControl(name, obj, prop));
            }  else if (type === 'dropdown') {
    			group.appendChild(createDropdownControl(obj, prop, extra));
    		} else if (type === 'text') {
    			group.appendChild(createTextControl(obj, prop));
            }
        }
        div.appendChild(group);
    }



    createGroup(div, 'color', ele, [['color', 'color']]);

    createGroup(div, 'Size', ele.size, [
        ['x', 'number'],
        ['y', 'number'],
        ['scale', 'slider'],
    ]);

    createGroup(div, 'Coord', ele.coord, [
        ['x', 'number'],
        ['y', 'number'],
        ['scale', 'slider'],
    ]);

    createGroup(div, 'Pivot', ele.pivot, [
        ['scale', 'slider'],
    ]);

    createGroup(div, 'Border', ele.border, [
        ['color', 'color'],
        ['borderRadius', 'number'],
        ['width', 'number']
    ]);

    const renderSettings = {
        mode: 'stretch'
    };

    if (ele instanceof TextUI) {
        createGroup(div, 'Text', ele.text, [
            ['size', 'number'],
            ['y', 'number'],
            ['x', 'number'],
            ['scale', 'slider'],
            ['color', 'color'],
            ['content', 'text'],
            ['align', 'dropdown', { options: ['start', 'center', 'end'] }],
            ['justify', 'dropdown', { options: ['alphabetic', 'top', 'middle', 'bottom', 'hanging'] }],
            ['style', 'dropdown', { options: ['fill', 'stroke'] }],
        ]);
    }

    function addElement(parent = ele){
            let panel = document.createElement('div');
            panel.className = 'panel';
            let ele = new TextUI(parent);
            CreateControlPanel(panel, ele, true);
            mainPanel.appendChild(panel);
            ele.panel = panel;
        }

    if (complex) {
        let group = document.createElement('div');
        group.classList.toggle('control-group');
        let btngrup = document.createElement('div');
        btngrup.classList.toggle('control-buttons');

        const title = document.createElement('h3');
        title.textContent = 'Buttons:';
        group.appendChild(title);

        let add = document.createElement('label');
        add.innerHTML = 'Adj hezza';
        add.style.backgroundColor = 'var(--blue)';
        add.addEventListener('click', () => { 
            addElement();
        });

        function multDel(ele) {
            ele.G.forEach((elem) => {
                multDel(elem);
                elem.panel.style.display = 'none';
            })
            ele.panel.style.display = 'none';
        }

        let remove = document.createElement('label');
        remove.innerHTML = 'Törlés';
        remove.style.backgroundColor = 'crimson';
        remove.addEventListener('click', () => { 
            ele.P.removeElement(ele);
            multDel(ele);
        });

        btngrup.appendChild(add);
        btngrup.appendChild(remove);
        group.appendChild(btngrup);
        div.appendChild(group);

    }
}
