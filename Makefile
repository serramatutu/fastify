

fmt:
	prettier --write **/*.ts

test:
	deno test --allow-read

benchmark: 
	deno run --allow-read ./benchmark/benchmark.ts

install-dev:
	ln -s ${PWD}/scripts/pre-commit.sh .git/hooks/pre-commit