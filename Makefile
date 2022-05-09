.POSIX:

.PHONY: all clean

artifactsdir=artifacts
codefile=test.js

all: $(codefile) .gitignore package-lock.json
	mkdir -p $(artifactsdir)
	node $(codefile)

clean:
	rm -rf $(artifactsdir) node_modules/ package-lock.json

package-lock.json: package.json
	npm install

package.json:
	printf '{}\n' > package.json

$(codefile):
	printf '\n' > $(codefile)

.gitignore:
	printf '$(artifactsdir)/\nnode_modules/\npackage-lock.json\n' > .gitignore
