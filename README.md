# Molab

**Simulateur de réactions chimiques avec visualisation interactive des atomes**

Molab combine un moteur de modélisation atomique écrit en C avec une interface web moderne. Le noyau scientifique est compilé en WebAssembly pour tourner directement dans le navigateur, tandis que Three.js affiche chaque atome en trois dimensions ou sous forme de diagramme de Lewis.

---

## Aperçu

Molab permet d'explorer la structure d'un atome à partir de données calculées côté natif : symbole, masse, protons, neutrons, électrons et stabilité. L'interface propose deux modes de visualisation complémentaires pour passer de la représentation spatiale à la notation de Lewis.

**Mode 3D**  
Noyau coloré, couches électroniques animées et orbites interactives avec contrôles de caméra.

**Mode Lewis**  
Diagramme des électrons de valence, avec zoom et déplacement à la souris.

---

## Fonctionnalités

1. Modélisation atomique en C avec création d'atomes stables ou ionisés
2. Vérification de la stabilité électrique (protons = électrons)
3. Export WebAssembly via Emscripten pour une exécution côté client
4. Rendu 3D animé des couches électroniques avec Three.js
5. Bascule instantanée entre vue 3D et diagramme de Lewis
6. Suite de tests native pour valider le module `atom`

---

## Architecture

```
molab/
├── core/atom/          Moteur C (structure Atom, stabilité, affichage)
├── web/                Interface web et pont WASM
│   ├── atom_bridge.c   Exposition des fonctions C à JavaScript
│   ├── main.js         Scène 3D, logique Lewis, interaction
│   └── index.html      Page principale
├── tests/core/atom/    Tests natifs
└── Makefile            Compilation native, WASM et serveur local
```

Le flux de données suit une séparation nette entre le calcul scientifique et la présentation :

```
C (core)  →  Emscripten  →  WebAssembly  →  JavaScript  →  Three.js / DOM
```

## Développement

### Cibles Make disponibles

| Commande | Description |
| --- | --- |
| `make atom` | Compile le binaire natif avec le test de base |
| `make wasm` | Génère `web/atom.js` et `web/atom.wasm` |
| `make serve` | Lance un serveur HTTP Python |
| `make clean` | Supprime les artefacts de compilation |

### API du module Atom (C)

```c
Atom* create_stable_atom(char* name, char* symbol, char* color,
                         float atomic_mass, int atomic_number);

Atom* create_atom_with_electrons(char* name, char* symbol, char* color,
                                 float atomic_mass, int atomic_number,
                                 int electron_number);

int is_stable(Atom* atom);
```

Un atome est considéré comme stable lorsque le nombre de protons correspond au nombre d'électrons.

### Pont WebAssembly

Les fonctions exportées vers JavaScript incluent la création d'un atome de carbone et l'accès à ses propriétés : symbole, couleur, masse, protons, électrons, neutrons et stabilité.

---

## Stack technique

| Couche | Technologie |
| --- | --- |
| Moteur | C11 |
| Web | HTML, CSS, JavaScript (modules ES) |
| Compilation WASM | Emscripten |
| Visualisation 3D | Three.js |
| Build | Make |