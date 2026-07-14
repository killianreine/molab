#include <emscripten.h>
#include "../core/atom/atom.h"

EMSCRIPTEN_KEEPALIVE
Atom* create_carbon_atom(void) {
    return create_stable_atom("Carbon", "C", "#000", 12.011f, 6);
}

EMSCRIPTEN_KEEPALIVE
char* atom_symbol(Atom* atom) {
    return atom->symbol_;
}

EMSCRIPTEN_KEEPALIVE
char* atom_color(Atom* atom) {
    return atom->color_;
}

EMSCRIPTEN_KEEPALIVE
float atom_mass(Atom* atom) {
    return atom->atomic_mass_;
}

EMSCRIPTEN_KEEPALIVE
int atom_protons(Atom* atom) {
    return atom->atomic_number_;
}

EMSCRIPTEN_KEEPALIVE
int atom_electrons(Atom* atom) {
    return atom->electron_number_;
}

EMSCRIPTEN_KEEPALIVE
int atom_neutrons(Atom* atom) {
    return atom->neutron_number_;
}

EMSCRIPTEN_KEEPALIVE
int atom_is_stable(Atom* atom) {
    return is_stable(atom);
}
