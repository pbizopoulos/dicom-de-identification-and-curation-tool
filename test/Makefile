.POSIX:

artifactsdir=artifacts

.PHONY: test clean update

test: package-lock.json $(artifactsdir)/DICOM/I0
	node test.js

update:
	npm update

package-lock.json:
	npm install

$(artifactsdir)/DICOM/I0:
	mkdir -p $(artifactsdir)/
	wget https://medimodel.com/wp-content/uploads/2021/03/2_skull_ct.zip
	mv 2_skull_ct.zip $(artifactsdir)/
	cd $(artifactsdir) && unzip 2_skull_ct.zip && cd ..

clean:
	rm -rf $(artifactsdir) node_modules/ package-lock.json
