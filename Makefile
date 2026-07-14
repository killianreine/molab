atom:
	gcc core/atom/*.c tests/core/atom/atom_test_base.c -o atom

clean:
	rm -f atom

.PHONY: atom clean
