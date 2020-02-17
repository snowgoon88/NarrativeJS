all: vireact console

##target_visreact = test_visreact.js physics_comp.js relation_comp.js person_comp.js
##target_console = console_comp.js

## Generic Rule for JSX -> JS using REACT
%.js: %.jsx
	npx babel --presets @babel/preset-react $< --out-file $@

test_visreact.js: test_visreact.jsx
	npx babel --presets @babel/preset-react test_visreact.jsx --out-file test_visreact.js

physics_comp.js: physics_comp.jsx
	npx babel --presets @babel/preset-react physics_comp.jsx --out-file physics_comp.js  

relation_comp.js: relation_comp.jsx
	npx babel --presets @babel/preset-react relation_comp.jsx --out-file relation_comp.js

person_comp.js: person_comp.jsx
	npx babel --presets @babel/preset-react person_comp.jsx --out-file person_comp.js


visreact: test_visreact.js physics_comp.js relation_comp.js person_comp.js

console: console_comp.js
