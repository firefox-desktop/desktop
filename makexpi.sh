REVISION=`git describe --match='v*' | cut -dv -f2 | cut -d- -f1,2 | tr '-' '.'`
XPI=Desktop_$REVISION.xpi
echo "Revision: " $REVISION
echo "XPI: " $XPI
rm $XPI
mv install.rdf install.rdf.original
sed -e 's/\(<em:version>\)[0.]*\(<\/em:version>\)/\1'$REVISION'\2/' < install.rdf.original > install.rdf
zip -r -9 $XPI chrome* defaults install.rdf -x '*.svn/*' '*.txt'
mv install.rdf.original install.rdf
