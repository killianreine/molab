#include "atom.h"
#include <stdio.h>
#include <stdlib.h>

Atom* create_stable_atom(char* name, char* symbol, char* color, float atomic_mass, int atomic_number){
    Atom* atom = (Atom*) malloc(sizeof(Atom));
    if (!atom) return NULL;

    atom->name_ = name;
    atom->symbol_ = symbol;
    atom->color_ = color;
    atom->atomic_mass_ = atomic_mass;
    atom->atomic_number_ = atomic_number;
    atom->electron_number_ = atomic_number;
    atom->neutron_number_ = (int)(atomic_mass-atomic_number);
    return atom;
}

Atom* create_atom_with_electrons(char* name, char* symbol, char* color, float atomic_mass, int atomic_number, int electron_number){
    Atom* atom = (Atom*) malloc(sizeof(Atom));
    if (!atom) return NULL;

    atom->name_ = name;
    atom->symbol_ = symbol;
    atom->color_ = color;
    atom->atomic_mass_ = atomic_mass;
    atom->atomic_number_ = atomic_number;
    atom->electron_number_ = electron_number;
    atom->neutron_number_ = (int)(atomic_mass-atomic_number);
    return atom;
}

void show_atom(Atom* atom){
    printf("---------- Atom of \033[31m%s\033[0m ----------\nSymbol : %s \nColor : %s \nMass : %f \nProtons - Neutrons - Electrons : %dp - %dn - %de\n\n",
        atom->name_,
        atom->symbol_,
        atom->color_,
        atom->atomic_mass_,
        atom->atomic_number_, atom->neutron_number_, atom->electron_number_
    );
}

/**
 * Checks whether an atom is stable.
 *
 * An atom is stable when the number of protons equals the number of electrons.
 *
 * @param atom Atom to check.
 * @return 1 if the atom is stable, 0 otherwise.
 */
int is_stable(Atom* atom){
    int protons = atom->atomic_number_;
    int electrons = atom->electron_number_;
    return (protons==electrons) ? 1 : 0;
}