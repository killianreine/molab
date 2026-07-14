EMCC = $(HOME)/emsdk/upstream/emscripten/emcc

atom:
	gcc core/atom/*.c tests/core/atom/atom_test_base.c -o atom

wasm:
	$(EMCC) -Oz web/atom_bridge.c core/atom/atom.c -o web/atom.js \
		-s EXPORTED_RUNTIME_METHODS=['UTF8ToString'] \
		-s EXPORTED_FUNCTIONS=['_create_carbon_atom','_atom_symbol','_atom_color','_atom_mass','_atom_protons','_atom_electrons','_atom_neutrons','_atom_is_stable']

PORT ?= 8080

serve:
	@echo "→ http://localhost:$(PORT)/web/index.html"
	python3 -m http.server $(PORT)

clean:
	rm -f atom web/atom.js web/atom.wasm

.PHONY: atom wasm serve clean
