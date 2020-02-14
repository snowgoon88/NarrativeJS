all: build

test_visreact.js: test_visreact.jsx
	npx babel --presets @babel/preset-react test_visreact.jsx --out-file test_visreact.js

physics_comp.js: physics_comp.jsx
	npx babel --presets @babel/preset-react physics_comp.jsx --out-file physics_comp.js  

relation_comp.js: relation_comp.jsx
	npx babel --presets @babel/preset-react relation_comp.jsx --out-file relation_comp.js

person_comp.js: person_comp.jsx
	npx babel --presets @babel/preset-react person_comp.jsx --out-file person_comp.js

build: test_visreact.js physics_comp.js relation_comp.js person_comp.js
