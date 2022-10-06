.POSIX:

.PHONY: all check clean help

all: bin/all ## Build binaries.

check: bin/check ## Check code.

clean: ## Remove binaries.
	rm -rf bin/

help: ## Show help.
	@sed -n '/sed/d; /##/p' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.* ## "}; {printf "make %-10s# %s\n", $$1, $$2}'

.gitignore:
	printf 'bin/\n' > .gitignore

bin:
	mkdir bin

bin/all: .gitignore bin/package-lock.json index.js
	NODE_PATH=bin/node_modules/ node index.js
	touch bin/all

bin/check: .gitignore bin/eslintrc.js bin/package-lock.json index.js
	NODE_PATH=bin/node_modules/ npx --yes eslint --fix --config bin/eslintrc.js index.js
	touch bin/check

bin/eslintrc.js: bin
	echo 'module.exports = { "env": { "browser": true, "node": true, "es2021": true }, "extends": "eslint:recommended", "overrides": [ ], "parserOptions": { "ecmaVersion": "latest" }, "rules": { "indent": [ "error", "tab" ], "linebreak-style": [ "error", "unix" ], "quotes": [ "error", "single" ], "semi": [ "error", "always" ] } }' > bin/eslintrc.js

bin/package-lock.json: bin package.json
	cp package.json bin/
	npm install --prefix bin/

index.js:
	printf '\n' > index.js

package.json:
	printf '{}\n' > package.json
