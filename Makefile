.POSIX:

.PHONY: all check clean help

container_engine = docker # For podman first execute $(printf 'unqualified-search-registries=["docker.io"]\n' > /etc/containers/registries.conf.d/docker.conf)
debug_args = $$(test -t 0 && printf '%s' '--interactive --tty')
user_arg = $$(test $(container_engine) = 'docker' && printf '%s' "--user $$(id -u):$$(id -g)")
work_dir = /work

all: bin/all

check: bin/check

bin/all: .dockerignore .gitignore bin Dockerfile index.js package.json
	$(container_engine) container run \
		$(debug_args) \
		$(user_arg) \
		--init \
		--cap-add=SYS_ADMIN \
		--env NODE_PATH=/home/pptruser/node_modules/ \
		--rm \
		--volume $$(pwd):$(work_dir)/ \
		--workdir $(work_dir)/ \
		$$($(container_engine) image build --quiet .) node index.js
	touch bin/all

bin/check: .dockerignore .gitignore bin bin/eslintrc.js index.js
	$(container_engine) container run \
		$(debug_args) \
		$(user_arg) \
		--env HOME=$(work_dir)/bin \
		--env NODE_PATH=$(work_dir)/bin \
		--rm \
		--volume $$(pwd):$(work_dir)/ \
		--workdir $(work_dir)/ \
		node npx --yes eslint --fix --config bin/eslintrc.js index.js
	touch bin/check

bin/eslintrc.js: bin
	echo 'module.exports = { "env": { "browser": true, "node": true, "es2021": true }, "extends": "eslint:recommended", "overrides": [ ], "parserOptions": { "ecmaVersion": "latest" }, "rules": { "indent": [ "error", "tab" ], "linebreak-style": [ "error", "unix" ], "quotes": [ "error", "single" ], "semi": [ "error", "always" ], "no-undef": 0 } }' > bin/eslintrc.js

clean:
	rm -rf bin/

help:
	@printf 'make all 	# Build binaries.\n'
	@printf 'make check 	# Check code.\n'
	@printf 'make clean 	# Remove binaries.\n'
	@printf 'make help 	# Show help.\n'

bin:
	mkdir bin

index.js:
	printf '\n' > index.js

.dockerignore:
	printf '*\n!package.json\n' > .dockerignore

.gitignore:
	printf 'bin/\n' > .gitignore

Dockerfile:
	printf 'FROM ghcr.io/puppeteer/puppeteer\nCOPY package.json .\nRUN npm install\n' > Dockerfile

package.json:
	printf '{}\n' > package.json
