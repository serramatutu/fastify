

fmt:
	prettier --write **/*.ts

test:
	deno test

install-dev:
	ln -s ${PWD}/scripts/pre-commit.sh .git/hooks/pre-commit