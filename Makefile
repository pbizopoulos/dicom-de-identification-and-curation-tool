.POSIX:

.PHONY: all check clean help

container_engine = docker
debug_args = $$(test -t 0 && printf '%s' '--interactive --tty')
js_file_name = index.js
user_arg = $$(test $(container_engine) = 'docker' && printf '%s' "--user $$(id -u):$$(id -g)")
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
	$(container_engine) container run \
		$(debug_args) \
		$(user_arg) \
		--init \
		--cap-add=SYS_ADMIN \
		--env NODE_PATH=/home/pptruser/node_modules/ \
		--env PUPPETEER_CACHE_DIR=/home/pptruser/.cache/puppeteer/ \
		--rm \
		--volume $$(pwd):$(work_dir)/ \
		--workdir $(work_dir)/ \
		$$($(container_engine) image build --quiet .) node $(js_file_name)
	touch bin/all

bin/check: $(js_file_name) .dockerignore .gitignore bin bin/eslintrc.js
	$(container_engine) container run \
		$(debug_args) \
		$(user_arg) \
		--env HOME=$(work_dir)/bin \
		--env NODE_PATH=$(work_dir)/bin \
		--rm \
		--volume $$(pwd):$(work_dir)/ \
		--workdir $(work_dir)/ \
		node npx --yes eslint --fix --config bin/eslintrc.js $(js_file_name)
	touch bin/check

bin/eslintrc.js: bin
	echo 'module.exports = { "env": { "browser": true, "node": true, "es2021": true }, "extends": "eslint:recommended", "overrides": [ ], "parserOptions": { "ecmaVersion": "latest" }, "rules": { "indent": [ "error", "tab" ], "linebreak-style": [ "error", "unix" ], "quotes": [ "error", "single" ], "semi": [ "error", "always" ], "no-undef": 0 } }' > bin/eslintrc.js

Dockerfile:
	printf 'FROM ghcr.io/puppeteer/puppeteer\nCOPY package.json .\nRUN npm install\n' > Dockerfile

package.json:
	printf '{}\n' > package.json
