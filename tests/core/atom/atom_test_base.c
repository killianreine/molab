#include "../../../core/atom/atom.h"

int main(){
    Atom* carbon = create_stable_atom("Carbon", "C", "#000", 12.011f, 6);
    show_atom(carbon);

    Atom* iron = create_stable_atom("Iron", "Fe", "#A19D94", 55.845f, 26);
    show_atom(iron);
    return 0;
}