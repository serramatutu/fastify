

fmt:
	prettier --write **/*.ts

test:
	deno test --allow-read

install-dev:
	ln -s ${PWD}/scripts/pre-commit.sh .git/hooks/pre-commit