.POSIX:

artifactsdir=artifacts

.PHONY: test clean

test: package-lock.json
	node test.js

package-lock.json:
	npm install

clean:
	rm -rf $(artifactsdir) node_modules/ package-lock.json
