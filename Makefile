.POSIX:

.PHONY: clean help

artifacts_dir=artifacts
code_file_name=index.js

$(artifacts_dir)/code-run: $(code_file_name) .gitignore index.html package-lock.json script.js style.css ## Generate artifacts.
	mkdir -p $(artifacts_dir)
	ARTIFACTS_DIR=$(artifacts_dir) node $(code_file_name)
	touch $(artifacts_dir)/code-run

clean: ## Remove dependent directories.
	rm -rf $(artifacts_dir)/ node_modules/ package-lock.json

help: ## Show all commands.
	@sed -n '/sed/d; s/\$$(artifacts_dir)/$(artifacts_dir)/g; /##/p' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.* ## "}; {printf "%-30s# %s\n", $$1, $$2}'

$(code_file_name):
	printf '\n' > $(code_file_name)

.gitignore:
	printf '$(artifacts_dir)/\nnode_modules/\npackage-lock.json\n' > .gitignore

package-lock.json: package.json
	npm install

package.json:
	printf '{}\n' > package.json

$(artifacts_dir)/dir-hierarchy: $(artifacts_dir)/code-run ## Generate dir hierarchy of input and output for demonstration purposes.
	cd $(artifacts_dir)/generated-data/ && tree -H . > ../dir-hierarchy-input.html && cd ..
	mkdir -p $(artifacts_dir)/output/ && unzip $(artifacts_dir)/de-identified-files.zip -d $(artifacts_dir)/output/ && cd $(artifacts_dir)/output/ && tree -H . > ../dir-hierarchy-output.html && cd ..
	touch $(artifacts_dir)/dir-hierarchy
