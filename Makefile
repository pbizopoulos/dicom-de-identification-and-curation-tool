.POSIX:

.PHONY: clean help

artifactsdir=artifacts
codefile=index.js

$(artifactsdir)/code-run: $(codefile) .gitignore package-lock.json ## Run test.
	mkdir -p $(artifactsdir)
	ARTIFACTS_DIR=$(artifactsdir) node $(codefile)
	touch $(artifactsdir)/code-run

$(codefile):
	printf '\n' > $(codefile)

.gitignore:
	printf '$(artifactsdir)/\nnode_modules/\npackage-lock.json\n' > .gitignore

clean: ## Remove dependent directories.
	rm -rf $(artifactsdir) node_modules/ package-lock.json

help: ## Show all commands.
	@sed 's/\$$(artifactsdir)/$(artifactsdir)/g; s/\$$(codefile)/$(codefile)/g' $(MAKEFILE_LIST) | grep '##' | grep -v grep | awk 'BEGIN {FS = ":.* ## "}; {printf "%-30s# %s\n", $$1, $$2}'

package-lock.json: package.json
	npm install

package.json:
	printf '{}\n' > package.json
