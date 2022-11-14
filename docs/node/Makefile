.POSIX:

.PHONY: all check clean help

js_file_name = index.js
work_dir = /work

all: bin/all

check: bin/check

clean:
	rm -rf bin/

help:
	@printf 'make all 	# Build binaries.\n'
	@printf 'make check 	# Check code.\n'
	@printf 'make clean 	# Remove binaries.\n'
	@printf 'make help 	# Show help.\n'

$(js_file_name):
	touch $(js_file_name)

.dockerignore:
	printf '*\n!package.json\n' > .dockerignore

.gitignore:
	printf 'bin/\n' > .gitignore

bin:
	mkdir bin

bin/all: $(js_file_name) .dockerignore .gitignore bin Dockerfile package.json
	docker container run \
		--cap-add=SYS_ADMIN \
		--env NODE_PATH=/home/pptruser/node_modules/ \
		--env PUPPETEER_CACHE_DIR=/home/pptruser/.cache/puppeteer/ \
		--init \
		--rm \
		--user $$(id -u):$$(id -g) \
		--volume $$(pwd):$(work_dir)/ \
		--workdir $(work_dir)/ \
		$$(docker image build --quiet .) node $(js_file_name)
	touch bin/all

bin/check: $(js_file_name) .dockerignore .gitignore bin bin/eslintrc.js
	docker container run \
		--env HOME=$(work_dir)/bin \
		--rm \
		--user $$(id -u):$$(id -g) \
		--volume $$(pwd):$(work_dir)/ \
		--workdir $(work_dir)/ \
		node npx --yes eslint --config bin/eslintrc.js --fix $(js_file_name)
	docker container run \
		$(debug_args) \
		--env HOME=$(work_dir)/bin \
		--rm \
		--user $$(id -u):$$(id -g) \
		--volume $$(pwd):$(work_dir)/ \
		--workdir $(work_dir)/ \
		node npx --yes js-beautify --end-with-newline --indent-with-tabs --no-preserve-newlines --replace --type js $(js_file_name)
	touch bin/check

bin/eslintrc.js: bin
	echo 'module.exports = { "env": { "browser": true, "node": true, "es2021": true }, "extends": "eslint:recommended", "overrides": [ ], "parserOptions": { "ecmaVersion": "latest" }, "rules": { "indent": [ "error", "tab" ], "linebreak-style": [ "error", "unix" ], "quotes": [ "error", "single" ], "semi": [ "error", "always" ], "no-undef": 0 } }' > bin/eslintrc.js

Dockerfile:
	printf 'FROM ghcr.io/puppeteer/puppeteer\nCOPY package.json .\nRUN npm install\n' > Dockerfile

package.json:
	printf '{}\n' > package.json
