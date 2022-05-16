.POSIX:

.PHONY: all clean help

artifactsdir=artifacts
codefile=test.js

all: $(codefile) .gitignore package-lock.json ##	Generate artifacts.
	mkdir -p $(artifactsdir)
	ARTIFACTS_DIR=$(artifactsdir) node $(codefile)

clean: ## Remove dependent directories.
	rm -rf $(artifactsdir) node_modules/ package-lock.json

help: ## 	Show all commands.
	@grep '##' $(MAKEFILE_LIST) | sed 's/\(\:.*\#\#\)/\:\ /' | sed 's/\$$(artifactsdir)/$(artifactsdir)/' | sed 's/\$$(codefile)/$(codefile)/' | grep -v grep

package-lock.json: package.json
	npm install

package.json:
	printf '{}\n' > package.json

$(codefile):
	printf '\n' > $(codefile)

.gitignore:
	printf '$(artifactsdir)/\nnode_modules/\npackage-lock.json\n' > .gitignore
