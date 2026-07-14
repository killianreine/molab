#ifndef ATOM_H
#define ATOM_H

/**
 * Structure used to describe an atom
 */
typedef struct {
    char* name_;
    char* symbol_;
    char* color_;
    float atomic_mass_;
    int atomic_number_;
    int electron_number_;
    int neutron_number_;
} Atom;

// ###########################################################################################
// ######################################## FUNCTIONS ########################################
// ###########################################################################################

Atom*           create_stable_atom(char*, char*, char*, float, int);                        // create an stable atom
Atom*           create_atom_with_electrons(char*, char*, char*, float, int, int);           // with number of electron

void            delete_atom(Atom*);

int             is_stable(Atom*);

void            show_atom(Atom*);

#endif